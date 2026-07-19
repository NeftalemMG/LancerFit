// Live proximity to the Toldo Lancer Centre. Uses expo-location to watch the
// device position and computes distance to the gym, exposing whether the user is
// currently within check-in range. Powers the "you're at the gym — check in"
// live prompt.
//
//
// The gym coordinates are the University of Windsor Toldo Lancer Centre. Adjust
// GYM if needed. CHECKIN_RADIUS_M is how close (meters) counts as "at the gym".

import { useState, useEffect, useRef } from "react";

// Raise a single "you're at the gym" banner when the user first enters range.
// Guarded so a missing notifications package never breaks proximity tracking.
function presentCheckinPrompt() {
  try {
    const Notifications = require("expo-notifications");
    Notifications.scheduleNotificationAsync({
      content: {
        title: "You're at the Toldo Lancer Centre",
        body: "Tap to check in and bank +75 XP.",
        data: { type: "gym:checkin" },
        sound: "default",
      },
      trigger: null,
    });
  } catch {
    /* notifications unavailable — the in-app check-in card still works */
  }
}

// Toldo Lancer Centre, University of Windsor.
export const GYM = { latitude: 42.30389, longitude: -83.06722, name: "Toldo Lancer Centre" };
const CHECKIN_RADIUS_M = 150;

// Haversine distance in meters.
function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function useGymProximity() {
  const [distance, setDistance] = useState(null); // meters, null = unknown
  const [nearGym, setNearGym] = useState(false);
  const [permission, setPermission] = useState("undetermined");
  const subRef = useRef(null);
  const wasNearRef = useRef(false); // previous nearGym, to detect the rising edge

  useEffect(() => {
    let mounted = true;
    let Location;
    try {
      Location = require("expo-location");
    } catch {
      return; // package missing -> feature disabled gracefully
    }

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;
        setPermission(status);
        if (status !== "granted") return;

        subRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 20, timeInterval: 15000 },
          (pos) => {
            if (!mounted) return;
            const d = distanceMeters(
              { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
              GYM,
            );
            setDistance(d);
            const near = d <= CHECKIN_RADIUS_M;
            setNearGym(near);
            // Rising edge only: fire the check-in banner the moment the user
            // arrives, not repeatedly while they stay in range.
            if (near && !wasNearRef.current) presentCheckinPrompt();
            wasNearRef.current = near;
          },
        );
      } catch {
        // location unavailable -> stay unknown
      }
    })();

    return () => {
      mounted = false;
      try { subRef.current?.remove?.(); } catch { /* noop */ }
    };
  }, []);

  // Human-friendly distance label.
  const distanceLabel =
    distance == null ? null : distance < 1000 ? `${Math.round(distance)} m away` : `${(distance / 1000).toFixed(1)} km away`;

  return { distance, distanceLabel, nearGym, permission };
}