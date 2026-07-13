// AppContext — single source of truth for player progress, quests, and
// challenge membership. The XP / check-in / quest / toast / sheet logic is
// unchanged. What's new: challenges now load LIVE from the backend (with the
// mock CHALLENGES kept as an offline fallback), joining calls the API, and a
// realtime listener injects newly-published challenges instantly.


import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { initialState, initialQuests, CHALLENGES } from '../data/appData';
import { fetchActiveChallenges, joinChallenge as apiJoinChallenge } from '../services/challengeApi';
import { fetchMe } from '../services/userApi';
import { useRealtime } from '../services/realtime';
import { useAuth } from './AuthContext';
import { FACULTY_KEY_BY_VALUE } from '../data/authOptions';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Map a backend-serialized challenge to the shape the app's UI expects.
// The app screens read: id, type, title, sub, xp, joined, img, desc, days, unit.
function toAppChallenge(c) {
  return {
    id: c.id,
    type: c.type || c.category || 'Challenge',
    title: c.title,
    sub: c.description ? c.description.slice(0, 60) : `${c.goal ?? ''} ${c.unit ?? ''}`.trim(),
    xp: c.xpReward ?? c.podium?.first ?? 0,
    joined: c.participants ?? 0,
    img: c.imageUrl || undefined,
    desc: c.description || '',
    days: c.endDate ? Math.max(1, Math.ceil((new Date(c.endDate) - new Date(c.startDate)) / 86400000)) : 7,
    unit: c.unit,
    goal: c.goal,
    _live: true,
  };
}

export function AppProvider({ children }) {
  const { isAuthenticated, user: authUser } = useAuth();
  const [player, setPlayer] = useState({ ...initialState });
  const [quests, setQuests] = useState(() => initialQuests.map((q) => ({ ...q })));
  // Seed from mocks so the UI is never empty; live data replaces it on load.
  const [challenges, setChallenges] = useState(() => CHALLENGES.map((c) => ({ ...c })));
  const [joinedChals, setJoinedChals] = useState({});
  const [levelUp, setLevelUp] = useState(null); // {level, facultyKey} when a level-up should celebrate

  // ---- Live user profile from /user/me (name, faculty, flag, xp, level, streak) ----
  // Overlays real backend data onto `player` so every screen that reads player.*
  // shows the signed-in user. Falls back to auth payload, then mock.
  const refreshMe = useCallback(async () => {
    // Seed immediately from the auth payload so the UI isn't stale on first paint.
    if (authUser) {
      setPlayer((p) => ({
        ...p,
        name: authUser.firstName || authUser.name || p.name,
        fullName: authUser.name || p.fullName,
        facultyKey: FACULTY_KEY_BY_VALUE[authUser.faculty] || p.facultyKey,
        facultyLabel: authUser.faculty || p.facultyLabel,
        flagCode: authUser.nationality || p.flagCode,
      }));
    }
    try {
      const me = await fetchMe();
      setPlayer((p) => {
        // Detect a level-up: only fire the celebration when we had a real
        // previous level and the new one is higher (not first hydration).
        if (p.level != null && me.level != null && me.level > p.level && p._hydrated) {
          setLevelUp({ level: me.level, facultyKey: FACULTY_KEY_BY_VALUE[me.faculty] || p.facultyKey });
        }
        return {
          ...p,
          _hydrated: true,
          name: me.firstName || me.name || p.name,
          fullName: me.name || p.fullName,
          facultyKey: FACULTY_KEY_BY_VALUE[me.faculty] || p.facultyKey,
          facultyLabel: me.faculty || p.facultyLabel,
          flagCode: me.nationality || p.flagCode,
          level: me.level ?? p.level,
          xp: me.xpIntoLevel ?? p.xp,
          xpMax: me.xpMax ?? p.xpMax,
          totalXp: me.totalXp ?? p.totalXp,
          streak: me.streak ?? p.streak,
          loggedToday: me.loggedToday ?? false,
          workouts: me.totalWorkouts ?? p.workouts,
        };
      });
    } catch {
      // offline / not signed in yet: keep whatever we have
    }
  }, [authUser]);

  useEffect(() => { if (isAuthenticated) refreshMe(); }, [isAuthenticated, refreshMe]);

  // ---- Load live challenges (fallback: keep mocks) ----
  const loadChallenges = useCallback(async () => {
    try {
      const live = await fetchActiveChallenges();
      if (Array.isArray(live) && live.length) {
        setChallenges(live.map(toAppChallenge));
      }
    } catch {
      // offline / backend down: keep the mock challenges already in state
    }
  }, []);

  useEffect(() => { loadChallenges(); }, [loadChallenges, isAuthenticated]);

  // ---- Realtime: admin publishes/deletes a challenge -> reflect instantly ----
  useRealtime('challenge:created', useCallback((payload) => {
    setChallenges((cs) => {
      if (cs.some((c) => String(c.id) === String(payload.id))) return cs;
      return [toAppChallenge(payload), ...cs];
    });
    toast(`New challenge: ${payload.title}`);
  }, []));

  // When the user logs any activity, their streak / XP / level may change — pull
  // the fresh profile so the Home header updates live.
  useRealtime('exercise:logged', useCallback(() => { refreshMe(); }, [refreshMe]));

  useRealtime('challenge:deleted', useCallback((payload) => {
    setChallenges((cs) => cs.filter((c) => String(c.id) !== String(payload.challengeId)));
  }, []));

  // ---- Toast ----
  const [toastMsg, setToastMsg] = useState('');
  const toastY = useRef(new Animated.Value(16)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  const toast = useCallback((msg) => {
    setToastMsg(msg);
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(toastY, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(toastY, { toValue: 16, duration: 280, useNativeDriver: true }),
      ]).start();
    }, 1900);
  }, [toastOpacity, toastY]);

  // ---- Bottom sheet ----
  const [sheet, setSheet] = useState({ open: false, content: null, flush: false });
  const openSheet = useCallback((content, flush = false) => {
    setSheet({ open: true, content, flush });
  }, []);
  const closeSheet = useCallback(() => setSheet((s) => ({ ...s, open: false })), []);

  // ---- XP / level logic (unchanged) ----
  const addXP = useCallback((n) => {
    setPlayer((p) => {
      let xp = p.xp + n;
      let lifetime = p.lifetime + n;
      let level = p.level;
      let xpMax = p.xpMax;
      let leveledUp = false;
      if (xp >= xpMax) {
        xp -= xpMax;
        level += 1;
        xpMax = 2200;
        leveledUp = true;
      }
      if (leveledUp) {
        setTimeout(() => toast('Level up — you reached Lancer Level ' + level), 520);
      }
      return { ...p, xp, lifetime, level, xpMax };
    });
  }, [toast]);

  // ---- Check-in (unchanged) ----
  const checkIn = useCallback(() => {
    if (player.checkedIn) {
      toast('Already checked in today');
      return;
    }
    setPlayer((p) => ({ ...p, checkedIn: true, streak: p.streak + 1, workouts: p.workouts + 1 }));
    addXP(75);
    setTimeout(() => {
      setPlayer((p) => {
        toast('Gym visit confirmed · +75 XP · ' + p.streak + '-day streak');
        return p;
      });
    }, 50);
  }, [player.checkedIn, addXP, toast]);

  // ---- Quest interactions (unchanged) ----
  const bumpQuest = useCallback((id) => {
    setQuests((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q;
        if (q.claimed) { toast('Already claimed'); return q; }
        if (q.cur < q.max) {
          const cur = q.cur + 1;
          if (cur >= q.max) toast(`${q.title} ready to claim`);
          return { ...q, cur };
        }
        return q;
      })
    );
  }, [toast]);

  const claimQuest = useCallback((id) => {
    setQuests((qs) =>
      qs.map((q) => {
        if (q.id !== id || q.claimed) return q;
        addXP(q.xp);
        toast(`Quest cleared · +${q.xp} XP`);
        return { ...q, claimed: true };
      })
    );
  }, [addXP, toast]);

  // ---- Featured Tower Challenge join (unchanged) ----
  const joinTower = useCallback(() => {
    if (player.joinedTower) { toast("You're already in the climb"); return; }
    setPlayer((p) => ({ ...p, joinedTower: true }));
    setQuests((qs) => [
      { id: 'tower-q', icon: 'flag', title: 'Tower Challenge', sub: 'Climb 50 floors at Toldo', cur: 0, max: 50, xp: 500, gold: true },
      ...qs,
    ]);
    toast('Tower Challenge joined');
  }, [player.joinedTower, toast]);

  // ---- Challenge join — now calls the backend for live challenges ----
  const joinChallenge = useCallback(async (c) => {
    if (joinedChals[c.id]) { closeSheet(); return; }
    // Optimistic UI update.
    setJoinedChals((j) => ({ ...j, [c.id]: true }));
    setChallenges((cs) => cs.map((x) => (x.id === c.id ? { ...x, joined: (x.joined || 0) + 1 } : x)));
    closeSheet();
    toast(`Joined ${c.title} · ${c.type}`);

    // Persist to the backend when this is a live challenge.
    if (c._live) {
      try {
        await apiJoinChallenge(c.id);
      } catch (err) {
        // Roll back the optimistic join on failure.
        setJoinedChals((j) => { const n = { ...j }; delete n[c.id]; return n; });
        toast(err?.message || 'Could not join challenge');
      }
    }
  }, [joinedChals, closeSheet, toast]);

  const updatePlayer = useCallback((patch) => setPlayer((p) => ({ ...p, ...patch })), []);

  const value = {
    player, updatePlayer,
    quests, bumpQuest, claimQuest,
    challenges, joinedChals, joinChallenge, joinTower, reloadChallenges: loadChallenges,
    refreshMe,
    levelUp, clearLevelUp: () => setLevelUp(null),
    addXP, checkIn,
    toast, toastMsg, toastY, toastOpacity,
    sheet, openSheet, closeSheet,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}