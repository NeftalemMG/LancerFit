// Live step count for TODAY, working on both iOS and Android via expo-sensors'
// Pedometer (CoreMotion on iOS, the step-counter sensor on Android).
//
// Behavior:
//   • Asks permission on mount.
//   • Reads today's cumulative steps (getStepCountAsync from midnight -> now)
//     where supported (iOS), and live-subscribes to increments via watchStepCount.
//   • Exposes { steps, available, permission } so the UI can show a real number
//     or gracefully fall back if the device/emulator has no pedometer.

import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";

export function usePedometer() {
  const [steps, setSteps] = useState(0);
  const [available, setAvailable] = useState(false);
  const [permission, setPermission] = useState("undetermined");
  const baseRef = useRef(0);      // steps already counted today before watch started
  const subRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let Pedometer;
    try {
      // Lazy require so the app doesn't crash if the package isn't installed yet.
      Pedometer = require("expo-sensors").Pedometer;
    } catch {
      return; // package missing -> stay unavailable, UI falls back
    }

    (async () => {
      try {
        const isAvail = await Pedometer.isAvailableAsync();
        if (!mounted) return;
        setAvailable(isAvail);
        if (!isAvail) return;

        // Permission (Android needs an explicit request; iOS prompts on first use).
        try {
          const perm = await Pedometer.requestPermissionsAsync?.();
          if (perm && mounted) setPermission(perm.status || "granted");
        } catch {
          // some SDKs don't expose requestPermissionsAsync; ignore
        }

        // iOS can return today's cumulative count directly.
        try {
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const result = await Pedometer.getStepCountAsync(start, new Date());
          if (result && typeof result.steps === "number" && mounted) {
            baseRef.current = result.steps;
            setSteps(result.steps);
          }
        } catch {
          // Android often doesn't support historical query -> start from live watch.
        }

        // Live increments from now on.
        subRef.current = Pedometer.watchStepCount((r) => {
          if (!mounted) return;
          // watchStepCount reports steps since the subscription began.
          setSteps(baseRef.current + (r?.steps || 0));
        });
      } catch {
        if (mounted) setAvailable(false);
      }
    })();

    return () => {
      mounted = false;
      try { subRef.current?.remove?.(); } catch { /* noop */ }
    };
  }, []);

  return { steps, available, permission, isIOS: Platform.OS === "ios" };
}