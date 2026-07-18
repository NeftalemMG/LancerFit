// Live step count for TODAY plus a real 7-day daily history, working on both
// iOS and Android via expo-sensors' Pedometer (CoreMotion on iOS, the
// step-counter sensor on Android).
//
// Exposes:
//   { steps, weekVals, weekSteps, todayIndex, available, permission, isIOS }
//   - steps      : today's cumulative step count (live)
//   - weekSteps  : number[7] real per-day step totals, Mon-first
//   - weekVals   : number[7] normalized 0..1 for bar heights (weekSteps / max)
//   - todayIndex : 0..6 index of today within the Mon-first week
//   - available  : pedometer present AND (where required) permission granted

import { useState, useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";

// Monday-first index for a JS Date (getDay(): 0=Sun..6=Sat -> 0=Mon..6=Sun).
function mondayFirstIndex(date) {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

// Start-of-day for the Monday that begins `date`'s week.
function startOfWeek(date) {
  const s = new Date(date);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - mondayFirstIndex(s));
  return s;
}

export function usePedometer() {
  const [steps, setSteps] = useState(0);
  const [weekSteps, setWeekSteps] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [available, setAvailable] = useState(false);
  const [permission, setPermission] = useState("undetermined");

  const baseTodayRef = useRef(0); // today's steps counted before the watch began
  const subRef = useRef(null);
  const mountedRef = useRef(true);
  const todayIndex = mondayFirstIndex(new Date());

  // Read a real per-day history for the current week (Mon..Sun). Historical
  // queries are supported on iOS; on Android getStepCountAsync typically throws,
  // so those days stay 0 and only "today" is populated (live via the watch).
  const loadWeekHistory = useCallback(async (Pedometer) => {
    const weekStart = startOfWeek(new Date());
    const now = new Date();
    const next = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i <= todayIndex; i += 1) {
      const dayStart = new Date(weekStart);
      dayStart.setDate(weekStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
      const rangeEnd = dayEnd > now ? now : dayEnd;
      try {
        const res = await Pedometer.getStepCountAsync(dayStart, rangeEnd);
        if (res && typeof res.steps === "number") {
          next[i] = res.steps;
          if (i === todayIndex) baseTodayRef.current = res.steps;
        }
      } catch {
        // No historical query on this platform for this day; leave as 0.
      }
    }
    if (mountedRef.current) {
      setWeekSteps(next);
      setSteps(next[todayIndex] || 0);
    }
  }, [todayIndex]);

  useEffect(() => {
    mountedRef.current = true;
    let Pedometer;
    try {
      // Lazy require so the app doesn't crash if the package isn't installed.
      Pedometer = require("expo-sensors").Pedometer;
    } catch {
      return () => { mountedRef.current = false; };
    }

    (async () => {
      try {
        const isAvail = await Pedometer.isAvailableAsync();
        if (!mountedRef.current) return;
        if (!isAvail) { setAvailable(false); return; }

        // Permission gate. On Android this triggers the ACTIVITY_RECOGNITION
        // prompt; iOS prompts on first data read. We must not start the watch
        // unless we're actually allowed to read, or Android emits nothing.
        let granted = true;
        try {
          const perm = await Pedometer.requestPermissionsAsync?.();
          if (perm) {
            setPermission(perm.status || "granted");
            // On Android an explicit denial means no data will ever arrive.
            if (Platform.OS === "android" && perm.status && perm.status !== "granted") {
              granted = perm.granted === true || perm.status === "granted";
            }
          } else {
            setPermission("granted"); // SDK without the API -> assume iOS-style
          }
        } catch {
          // Some SDK builds don't expose requestPermissionsAsync; iOS is fine
          // without it. On Android, proceed and let the read attempt decide.
          setPermission("granted");
        }

        if (!mountedRef.current) return;
        setAvailable(granted);
        if (!granted) return;

        // Real per-day history for the week (populates today's base too).
        await loadWeekHistory(Pedometer);

        // Live increments from now on. watchStepCount reports steps since the
        // subscription began, so add them onto today's already-counted base and
        // keep today's bar in sync.
        subRef.current = Pedometer.watchStepCount((r) => {
          if (!mountedRef.current) return;
          const liveToday = baseTodayRef.current + (r?.steps || 0);
          setSteps(liveToday);
          setWeekSteps((prev) => {
            if (prev[todayIndex] === liveToday) return prev;
            const copy = prev.slice();
            copy[todayIndex] = liveToday;
            return copy;
          });
        });
      } catch {
        if (mountedRef.current) setAvailable(false);
      }
    })();

    return () => {
      mountedRef.current = false;
      try { subRef.current?.remove?.(); } catch { /* noop */ }
    };
  }, [loadWeekHistory, todayIndex]);

  const maxWeek = Math.max(1, ...weekSteps);
  const weekVals = weekSteps.map((v) => (v > 0 ? v / maxWeek : 0));

  return {
    steps,
    weekSteps,
    weekVals,
    todayIndex,
    available,
    permission,
    isIOS: Platform.OS === "ios",
  };
}