import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Animated, Easing } from "react-native";
import { initialState, initialQuests, CHALLENGES } from "../data/appData";
import {
  fetchActiveChallenges,
  fetchMyChallenges,
  joinChallenge as apiJoinChallenge,
} from "../services/challengeApi";
import { fetchDailyQuests } from "../services/questApi";
import { fetchMe } from "../services/userApi";
import { useRealtime } from "../services/realtime";
import { useAuth } from "./AuthContext";
import { FACULTY_KEY_BY_VALUE } from "../data/authOptions";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Map a backend-serialized challenge to the shape the app's UI expects.
function toAppChallenge(c) {
  return {
    id: c.id,
    type: c.type || c.category || "Challenge",
    title: c.title,
    sub: c.description
      ? c.description.slice(0, 60)
      : `${c.goal ?? ""} ${c.unit ?? ""}`.trim(),
    xp: c.xpReward ?? c.podium?.first ?? 0,
    joined: c.participants ?? 0,
    img: c.imageUrl || undefined,
    desc: c.description || "",
    days: c.endDate
      ? Math.max(
          1,
          Math.ceil((new Date(c.endDate) - new Date(c.startDate)) / 86400000),
        )
      : 7,
    unit: c.unit,
    goal: c.goal,
    pointsPerUnit: c.pointsPerUnit ?? 0,
    // Latest joiners (real avatars) for the browse card; empty when none.
    recentParticipants: Array.isArray(c.recentParticipants) ? c.recentParticipants : [],
    _live: true,
  };
}

function toAppQuest(q) {
  return {
    id: q.questId ?? q.id,
    icon: q.icon || 'star',
    title: q.title,
    sub: q.category || '',
    cur: 0,
    max: 1,
    xp: q.xp,
    claimed: false,
    gold: false,
    _live: true,
  };
}

function toAppQuest(q) {
  return {
    id: q.questId ?? q.id,
    icon: q.icon || 'star',
    title: q.title,
    sub: q.category || '',
    cur: 0,
    max: 1,
    xp: q.xp,
    claimed: false,
    gold: false,
    _live: true,
  };
}

// Map a participant "myStatus" from /challenge/me into the sheet's status vocab.
// backend statuses: pending (registered, no result) / approved / rejected.
// We add a client-only "submitted" once the user has sent a result but it's
// still pending review (myStatus stays "pending" but myPointsSubmitted > 0).
function statusFromParticipation(p) {
  if (p.myStatus === "approved") return "approved";
  if (p.myStatus === "rejected") return "rejected";
  if (p.myStatus === "pending" && (p.myPointsSubmitted ?? 0) > 0)
    return "submitted";
  return "pending"; // joined, no result yet
}

export function AppProvider({ children }) {
  const { isAuthenticated, user: authUser } = useAuth();
  const [player, setPlayer] = useState({ ...initialState });
  const [quests, setQuests] = useState(() =>
    initialQuests.map((q) => ({ ...q })),
  );
  const [challenges, setChallenges] = useState(() =>
    CHALLENGES.map((c) => ({ ...c })),
  );
  const [joinedChals, setJoinedChals] = useState({});
  const [challengeStatus, setChallengeStatus] = useState({}); // { [id]: 'pending'|'submitted'|'approved'|'rejected' }
  const [levelUp, setLevelUp] = useState(null);

  // ---- Live user profile from /user/me ----
  const refreshMe = useCallback(async () => {
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
        if (
          p.level != null &&
          me.level != null &&
          me.level > p.level &&
          p._hydrated
        ) {
          setLevelUp({
            level: me.level,
            facultyKey: FACULTY_KEY_BY_VALUE[me.faculty] || p.facultyKey,
          });
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
      // offline / not signed in yet
    }
  }, [authUser]);

  useEffect(() => {
    if (isAuthenticated) refreshMe();
  }, [isAuthenticated, refreshMe]);

  // ---- Load live challenges (fallback: keep mocks) ----
  const loadChallenges = useCallback(async () => {
    try {
      const live = await fetchActiveChallenges();
      if (Array.isArray(live) && live.length) {
        setChallenges(live.map(toAppChallenge));
      }
    } catch {
      // offline: keep mocks
    }
  }, []);

  const loadQuests = useCallback(async () => {
    try {
      const live = await fetchDailyQuests();
      if (Array.isArray(live) && live.length) {
        setQuests(live.map(toAppQuest));
      }
    } catch (err) {
      // offline: keep mocks
    }
  }, []);

  // ---- Load which challenges the user has joined + their status ----
  const loadMyChallenges = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const mine = await fetchMyChallenges();
      const joinedMap = {};
      const statusMap = {};
      (mine || []).forEach((p) => {
        joinedMap[p.id] = true;
        statusMap[p.id] = statusFromParticipation(p);
      });
      setJoinedChals(joinedMap);
      setChallengeStatus(statusMap);
    } catch {
      // offline: leave as-is
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges, isAuthenticated]);
  useEffect(() => {
    loadMyChallenges();
  }, [loadMyChallenges]);

  useEffect(() => { loadQuests(); }, [loadQuests]);

  // ---- Realtime ----
  useRealtime(
    "challenge:created",
    useCallback((payload) => {
      setChallenges((cs) => {
        if (cs.some((c) => String(c.id) === String(payload.id))) return cs;
        return [toAppChallenge(payload), ...cs];
      });
<<<<<<< Updated upstream
      toast(`New challenge: ${payload.title}`);
    }, []),
=======
      // Belt-and-suspenders: refetch the authoritative list so the new
      // challenge always shows live even if the payload isn't a full challenge.
      loadChallenges();
      toast(`New challenge: ${payload.title || "New challenge"}`);
    }, [loadChallenges]),
>>>>>>> Stashed changes
  );

  useRealtime(
    "challenge:deleted",
    useCallback((payload) => {
      setChallenges((cs) =>
        cs.filter((c) => String(c.id) !== String(payload.challengeId)),
      );
    }, []),
  );

  // Live "N Lancers joined" counter across all devices.
  useRealtime(
    "challenge:participants",
    useCallback((payload) => {
      setChallenges((cs) =>
        cs.map((c) =>
          String(c.id) === String(payload.challengeId)
            ? { ...c, joined: payload.participants }
            : c,
        ),
      );
    }, []),
  );

  // Admin approved/rejected this user's submission.
  useRealtime(
    "validation:decided",
    useCallback(
      (payload) => {
        setChallengeStatus((s) => ({
          ...s,
          [payload.challengeId]: payload.status,
        }));
        if (payload.status === "approved") {
          toast(`Result approved · +${payload.pointsAwarded ?? 0} XP`);
          refreshMe();
        } else if (payload.status === "rejected") {
          toast("A challenge result was declined");
        }
      },
      [refreshMe],
    ),
  );

  useRealtime(
    "exercise:logged",
    useCallback(() => {
      refreshMe();
    }, [refreshMe]),
  );

  // ---- Toast ----
  const [toastMsg, setToastMsg] = useState("");
  const toastY = useRef(new Animated.Value(16)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  const toast = useCallback(
    (msg) => {
      setToastMsg(msg);
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(toastY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(toastY, {
            toValue: 16,
            duration: 280,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1900);
    },
    [toastOpacity, toastY],
  );

  // ---- Bottom sheet ----
  const [sheet, setSheet] = useState({
    open: false,
    content: null,
    flush: false,
  });
  const openSheet = useCallback((content, flush = false) => {
    setSheet({ open: true, content, flush });
  }, []);
  const closeSheet = useCallback(
    () => setSheet((s) => ({ ...s, open: false })),
    [],
  );

  // ---- XP / level logic ----
  const addXP = useCallback(
    (n) => {
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
        if (leveledUp)
          setTimeout(
            () => toast("Level up — you reached Lancer Level " + level),
            520,
          );
        return { ...p, xp, lifetime, level, xpMax };
      });
    },
    [toast],
  );

  // ---- Check-in ----
  const checkIn = useCallback(() => {
    if (player.checkedIn) {
      toast("Already checked in today");
      return;
    }
    setPlayer((p) => ({
      ...p,
      checkedIn: true,
      streak: p.streak + 1,
      workouts: p.workouts + 1,
    }));
    addXP(75);
    setTimeout(() => {
      setPlayer((p) => {
        toast("Gym visit confirmed · +75 XP · " + p.streak + "-day streak");
        return p;
      });
    }, 50);
  }, [player.checkedIn, addXP, toast]);

  // ---- Quest interactions ----
  const bumpQuest = useCallback(
    (id) => {
      setQuests((qs) =>
        qs.map((q) => {
          if (q.id !== id) return q;
          if (q.claimed) {
            toast("Already claimed");
            return q;
          }
          if (q.cur < q.max) {
            const cur = q.cur + 1;
            if (cur >= q.max) toast(`${q.title} ready to claim`);
            return { ...q, cur };
          }
          return q;
        }),
      );
    },
    [toast],
  );

  const claimQuest = useCallback(
    (id) => {
      setQuests((qs) =>
        qs.map((q) => {
          if (q.id !== id || q.claimed) return q;
          addXP(q.xp);
          toast(`Quest cleared · +${q.xp} XP`);
          return { ...q, claimed: true };
        }),
      );
    },
    [addXP, toast],
  );

  // ---- Featured Tower Challenge join (mock, unchanged) ----
  const joinTower = useCallback(() => {
    if (player.joinedTower) {
      toast("You're already in the climb");
      return;
    }
    setPlayer((p) => ({ ...p, joinedTower: true }));
    setQuests((qs) => [
      {
        id: "tower-q",
        icon: "flag",
        title: "Tower Challenge",
        sub: "Climb 50 floors at Toldo",
        cur: 0,
        max: 50,
        xp: 500,
        gold: true,
      },
      ...qs,
    ]);
    toast("Tower Challenge joined");
  }, [player.joinedTower, toast]);

  // ---- Challenge join — calls the backend for live challenges ----
  const joinChallenge = useCallback(
    async (c) => {
      if (joinedChals[c.id]) {
        closeSheet();
        return;
      }
      // Optimistic.
      setJoinedChals((j) => ({ ...j, [c.id]: true }));
      setChallengeStatus((s) => ({ ...s, [c.id]: "pending" }));
      setChallenges((cs) =>
        cs.map((x) =>
          x.id === c.id ? { ...x, joined: (x.joined || 0) + 1 } : x,
        ),
      );
      toast(`Joined ${c.title} · log your result when ready`);

      if (c._live) {
        try {
          await apiJoinChallenge(c.id);
        } catch (err) {
          // Roll back on failure.
          setJoinedChals((j) => {
            const n = { ...j };
            delete n[c.id];
            return n;
          });
          setChallengeStatus((s) => {
            const n = { ...s };
            delete n[c.id];
            return n;
          });
          toast(err?.message || "Could not join challenge");
        }
      }
      // NOTE: we intentionally keep the sheet open so the user immediately sees
      // the "Log your result" CTA. The sheet re-renders from the new status.
    },
    [joinedChals, closeSheet, toast],
  );

  // Called by ChallengeResultSheet after a successful submit-points.
  const markChallengeSubmitted = useCallback((challengeId) => {
    setChallengeStatus((s) => ({ ...s, [challengeId]: "submitted" }));
  }, []);

  const updatePlayer = useCallback(
    (patch) => setPlayer((p) => ({ ...p, ...patch })),
    [],
  );

  const value = {
    player,
    updatePlayer,
    quests,
    bumpQuest,
    claimQuest,
    challenges,
    joinedChals,
    challengeStatus,
    joinChallenge,
    joinTower,
    markChallengeSubmitted,
    reloadChallenges: loadChallenges,
    reloadQuests:loadQuests,
    reloadMyChallenges: loadMyChallenges,
    refreshMe,
    levelUp,
    clearLevelUp: () => setLevelUp(null),
    addXP,
    checkIn,
    toast,
    toastMsg,
    toastY,
    toastOpacity,
    sheet,
    openSheet,
    closeSheet,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
