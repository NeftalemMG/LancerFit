import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { initialState, initialQuests, CHALLENGES } from '../data/appData';
import { fetchActiveChallenges, joinChallenge as apiJoinChallenge } from '../services/challengeApi';
import { useRealtime } from '../services/realtime';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

function toAppChallenge(c) {
  return {
    id: c.id, type: c.type || c.category || 'Challenge', title: c.title,
    sub: c.description ? c.description.slice(0, 60) : `${c.goal ?? ''} ${c.unit ?? ''}`.trim(),
    xp: c.xpReward ?? c.podium?.first ?? 0, joined: c.participants ?? 0,
    img: c.imageUrl || undefined, desc: c.description || '',
    days: c.endDate ? Math.max(1, Math.ceil((new Date(c.endDate) - new Date(c.startDate)) / 86400000)) : 7,
    unit: c.unit, goal: c.goal, _live: true,
  };
}

export function AppProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [player, setPlayer] = useState({ ...initialState });
  const [quests, setQuests] = useState(() => initialQuests.map((q) => ({ ...q })));
  const [challenges, setChallenges] = useState(() => CHALLENGES.map((c) => ({ ...c })));
  const [joinedChals, setJoinedChals] = useState({});

  const loadChallenges = useCallback(async () => {
    try {
      const live = await fetchActiveChallenges();
      if (Array.isArray(live) && live.length) setChallenges(live.map(toAppChallenge));
    } catch {}
  }, []);
  useEffect(() => { loadChallenges(); }, [loadChallenges, isAuthenticated]);

  useRealtime('challenge:created', useCallback((payload) => {
    setChallenges((cs) => {
      if (cs.some((c) => String(c.id) === String(payload.id))) return cs;
      return [toAppChallenge(payload), ...cs];
    });
    toast(`New challenge: ${payload.title}`);
  }, []));
  useRealtime('challenge:deleted', useCallback((payload) => {
    setChallenges((cs) => cs.filter((c) => String(c.id) !== String(payload.challengeId)));
  }, []));

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

  const [sheet, setSheet] = useState({ open: false, content: null, flush: false });
  const openSheet = useCallback((content, flush = false) => setSheet({ open: true, content, flush }), []);
  const closeSheet = useCallback(() => setSheet((s) => ({ ...s, open: false })), []);

  const addXP = useCallback((n) => {
    setPlayer((p) => {
      let xp = p.xp + n, lifetime = p.lifetime + n, level = p.level, xpMax = p.xpMax, leveledUp = false;
      if (xp >= xpMax) { xp -= xpMax; level += 1; xpMax = 2200; leveledUp = true; }
      if (leveledUp) setTimeout(() => toast('Level up — you reached Lancer Level ' + level), 520);
      return { ...p, xp, lifetime, level, xpMax };
    });
  }, [toast]);

  const checkIn = useCallback(() => {
    if (player.checkedIn) { toast('Already checked in today'); return; }
    setPlayer((p) => ({ ...p, checkedIn: true, streak: p.streak + 1, workouts: p.workouts + 1 }));
    addXP(75);
    setTimeout(() => { setPlayer((p) => { toast('Gym visit confirmed · +75 XP · ' + p.streak + '-day streak'); return p; }); }, 50);
  }, [player.checkedIn, addXP, toast]);

  const bumpQuest = useCallback((id) => {
    setQuests((qs) => qs.map((q) => {
      if (q.id !== id) return q;
      if (q.claimed) { toast('Already claimed'); return q; }
      if (q.cur < q.max) { const cur = q.cur + 1; if (cur >= q.max) toast(`${q.title} ready to claim`); return { ...q, cur }; }
      return q;
    }));
  }, [toast]);

  const claimQuest = useCallback((id) => {
    setQuests((qs) => qs.map((q) => {
      if (q.id !== id || q.claimed) return q;
      addXP(q.xp); toast(`Quest cleared · +${q.xp} XP`);
      return { ...q, claimed: true };
    }));
  }, [addXP, toast]);

  const joinTower = useCallback(() => {
    if (player.joinedTower) { toast("You're already in the climb"); return; }
    setPlayer((p) => ({ ...p, joinedTower: true }));
    setQuests((qs) => [
      { id: 'tower-q', icon: 'flag', title: 'Tower Challenge', sub: 'Climb 50 floors at Toldo', cur: 0, max: 50, xp: 500, gold: true },
      ...qs,
    ]);
    toast('Tower Challenge joined');
  }, [player.joinedTower, toast]);

  const joinChallenge = useCallback(async (c) => {
    if (joinedChals[c.id]) { closeSheet(); return; }
    setJoinedChals((j) => ({ ...j, [c.id]: true }));
    setChallenges((cs) => cs.map((x) => (x.id === c.id ? { ...x, joined: (x.joined || 0) + 1 } : x)));
    closeSheet();
    toast(`Joined ${c.title} · ${c.type}`);
    if (c._live) {
      try { await apiJoinChallenge(c.id); }
      catch (err) {
        setJoinedChals((j) => { const n = { ...j }; delete n[c.id]; return n; });
        toast(err?.message || 'Could not join challenge');
      }
    }
  }, [joinedChals, closeSheet, toast]);

  const updatePlayer = useCallback((patch) => setPlayer((p) => ({ ...p, ...patch })), []);

  const value = {
    player, updatePlayer, quests, bumpQuest, claimQuest,
    challenges, joinedChals, joinChallenge, joinTower, reloadChallenges: loadChallenges,
    addXP, checkIn, toast, toastMsg, toastY, toastOpacity, sheet, openSheet, closeSheet,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}