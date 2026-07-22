// Live step count for TODAY plus a real 7-day daily history.
//   iOS      -> expo-sensors Pedometer (reads Apple Health / CoreMotion directly)
//   Android  -> react-native-health-connect (reads Google Health Connect, which
//               itself aggregates Google Fit / Samsung Health / OEM sensors)
//
// This requires a custom dev client on Android — Health Connect needs native
// modules and will NOT work inside Expo Go.
//
// Exposes:
//   { steps, weekVals, weekSteps, todayIndex, available, permission, isIOS }

import { useState, useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";

function mondayFirstIndex(date) {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

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

  const baseTodayRef = useRef(0);
  const subRef = useRef(null);
  const mountedRef = useRef(true);
  const todayIndex = mondayFirstIndex(new Date());

  // ---------- iOS: expo-sensors / CoreMotion (unchanged from before) ----------
  const loadWeekHistoryIOS = useCallback(async (Pedometer) => {
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
        // leave as 0
      }
    }
    if (mountedRef.current) {
      setWeekSteps(next);
      setSteps(next[todayIndex] || 0);
    }
  }, [todayIndex]);

  const setupIOS = useCallback(async () => {
    let Pedometer;
    try {
      Pedometer = require("expo-sensors").Pedometer;
    } catch {
      setAvailable(false);
      return;
    }

    const isAvail = await Pedometer.isAvailableAsync();
    if (!mountedRef.current) return;
    if (!isAvail) { setAvailable(false); return; }

    setPermission("granted"); // iOS prompts implicitly on first read
    setAvailable(true);

    await loadWeekHistoryIOS(Pedometer);

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
  }, [loadWeekHistoryIOS, todayIndex]);

  // ---------- Android: Health Connect ----------
  const setupAndroid = useCallback(async () => {
    let HC;
    try {
      HC = require("react-native-health-connect");
    } catch {
      // Not present, e.g. still running inside Expo Go.
      setAvailable(false);
      setPermission("unavailable");
      return;
    }
    const { initialize, requestPermission, readRecords, getSdkStatus, SdkAvailabilityStatus } = HC;

    try {
      const status = await getSdkStatus?.();
      if (status !== undefined && SdkAvailabilityStatus &&
          status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        // Health Connect app not installed / not supported on this device.
        setAvailable(false);
        setPermission("unavailable");
        return;
      }

      const ok = await initialize();
      if (!ok) { setAvailable(false); return; }

      const granted = await requestPermission([
        { accessType: "read", recordType: "Steps" },
      ]);
      const hasStepsRead = Array.isArray(granted) &&
        granted.some((p) => p.recordType === "Steps" && p.accessType === "read");

      if (!hasStepsRead) {
        setPermission("denied");
        setAvailable(false);
        return;
      }
      setPermission("granted");
      setAvailable(true);

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
          const result = await readRecords("Steps", {
            timeRangeFilter: {
              operator: "between",
              startTime: dayStart.toISOString(),
              endTime: rangeEnd.toISOString(),
            },
          });
          const total = (result?.records || []).reduce(
            (sum, rec) => sum + (rec.count || 0), 0
          );
          next[i] = total;
          if (i === todayIndex) baseTodayRef.current = total;
        } catch {
          // leave as 0 for that day
        }
      }

      if (mountedRef.current) {
        setWeekSteps(next);
        setSteps(next[todayIndex] || 0);
      }

      // Health Connect has no live "watch" API — poll periodically instead
      // so today's ring/bar stays close to real-time while the app is open.
      const poll = setInterval(async () => {
        if (!mountedRef.current) return;
        try {
          const dayStart = new Date();
          dayStart.setHours(0, 0, 0, 0);
          const result = await readRecords("Steps", {
            timeRangeFilter: {
              operator: "between",
              startTime: dayStart.toISOString(),
              endTime: new Date().toISOString(),
            },
          });
          const total = (result?.records || []).reduce(
            (sum, rec) => sum + (rec.count || 0), 0
          );
          setSteps(total);
          setWeekSteps((prev) => {
            if (prev[todayIndex] === total) return prev;
            const copy = prev.slice();
            copy[todayIndex] = total;
            return copy;
          });
        } catch {
          // ignore transient poll failures
        }
      }, 30000); // every 30s — Health Connect writes aren't instant anyway

      subRef.current = { remove: () => clearInterval(poll) };
    } catch {
      if (mountedRef.current) setAvailable(false);
    }
  }, [todayIndex]);

  useEffect(() => {
    mountedRef.current = true;

    if (Platform.OS === "ios") {
      setupIOS();
    } else if (Platform.OS === "android") {
      setupAndroid();
    }

    return () => {
      mountedRef.current = false;
      try { subRef.current?.remove?.(); } catch { /* noop */ }
    };
  }, [setupIOS, setupAndroid]);

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