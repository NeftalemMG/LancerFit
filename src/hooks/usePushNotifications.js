// Native push for LancerFit. Three jobs:
//   1. Register this device's Expo push token with the backend
//      (POST /api/push/register) so the server can deliver OS-level banners for
//      challenge:created (students) and validation:submitted (admins) even when
//      the app is backgrounded or closed.
//   2. Configure how notifications present while the app is foregrounded (show
//      a banner + play the default sound).
//   3. Handle taps on a notification (routing hook point via onNotificationTap).
//
// Everything is lazy-required and wrapped so a missing package or a simulator
// without push support degrades gracefully instead of crashing the app.

import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { api } from "../services/apiClient";
import { setStoredPushToken } from "../services/pushTokenStore";

let handlerConfigured = false;

function getModules() {
  try {
    const Notifications = require("expo-notifications");
    let Device = null;
    try { Device = require("expo-device"); } catch { /* optional */ }
    return { Notifications, Device };
  } catch {
    return null;
  }
}

// Present foreground notifications as banners (call once).
function configureHandler(Notifications) {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function registerForPush(Notifications, Device) {
  // Real push needs a physical device; simulators/emulators can't get a token.
  if (Device && Device.isDevice === false) return null;

  const settings = await Notifications.getPermissionsAsync();
  let status = settings.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return null;

  // Android needs a channel for notifications to appear.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "LancerFit",
      importance: Notifications.AndroidImportance?.HIGH ?? 4,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FFD157",
    });
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    return tokenResponse?.data ?? null;
  } catch {
    return null;
  }
}

// enabled: only run once the user is authenticated (so the token attaches to
// the signed-in account). onNotificationTap: optional (payload) => void.
export function usePushNotifications({ enabled = true, onNotificationTap } = {}) {
  const tokenRef = useRef(null);
  const tapRef = useRef(onNotificationTap);
  tapRef.current = onNotificationTap;

  useEffect(() => {
    if (!enabled) return undefined;
    const mods = getModules();
    if (!mods) return undefined;
    const { Notifications, Device } = mods;
    let mounted = true;
    let responseSub = null;

    configureHandler(Notifications);

    (async () => {
      const token = await registerForPush(Notifications, Device);
      if (!mounted || !token) return;
      tokenRef.current = token;
      setStoredPushToken(token);
      try {
        await api("/push/register", { method: "POST", body: { token, platform: Platform.OS } });
      } catch {
        // Registration failure is non-fatal — socket events still update the UI.
      }
    })();

    // Route taps on a delivered notification.
    responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response?.notification?.request?.content?.data;
      if (data && tapRef.current) tapRef.current(data);
    });

    return () => {
      mounted = false;
      try { responseSub?.remove?.(); } catch { /* noop */ }
    };
  }, [enabled]);

  return { pushToken: tokenRef.current };
}

// Called on sign-out to stop this device receiving another account's pushes.
export async function unregisterPushToken(token) {
  if (!token) return;
  try {
    await api("/push/register", { method: "DELETE", body: { token } });
  } catch {
    /* best-effort */
  }
}