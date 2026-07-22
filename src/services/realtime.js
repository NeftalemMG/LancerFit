import { io } from "socket.io-client";
import { useEffect } from "react";
import { API_BASE_URL } from "./apiClient";
import { getAccessToken } from "./tokenStore";

let socket = null;
function socketOrigin() { return API_BASE_URL.replace(/\/api\/?$/, ""); }

// Lazy notifications bridge: when a relevant socket event arrives while the app
// is OPEN, we also raise a local banner so the user sees it immediately (the
// server's push covers the backgrounded/closed case). Guarded so a missing
// package never breaks realtime.
function presentLocal(title, body, data) {
  try {
    const Notifications = require("expo-notifications");
    Notifications.scheduleNotificationAsync({
      content: { title, body, data: data || {}, sound: "default" },
      trigger: null, // deliver now
    });
  } catch {
    /* notifications unavailable — socket-driven UI updates still happen */
  }
}

// Read the user's live "quest reminders" preference. Lazy-required so this file
// has no hard dependency on the store at import time.
function questRemindersOn() {
  try {
    return require("./settingsStore").getSetting("questReminders") !== false;
  } catch {
    return true; // default on if the store isn't available
  }
}

// Wire the standard app-level notification bridges onto a freshly connected
// socket. Role-scoped rooms on the backend mean students only receive
// challenge:created and admins only receive validation:submitted, so we can
// bridge both here without leaking cross-role banners.
function attachNotificationBridge(sock) {
  sock.on("challenge:created", (c) => {
    if (!questRemindersOn()) return; // gated by the user's Quest reminders setting
    presentLocal(
      "New challenge dropped",
      `"${c?.title || "A new challenge"}" is live. Join and start banking XP.`,
      { type: "challenge:created", challengeId: c?.id },
    );
  });
  sock.on("validation:submitted", (v) => {
    presentLocal(
      "New result to validate",
      "A Lancer submitted a challenge result for review.",
      { type: "validation:submitted", challengeId: v?.challengeId, participantId: v?.participantId },
    );
  });
  sock.on("validation:decided", (v) => {
    if (v?.status === "approved") {
      presentLocal(
        "Result approved",
        `Your challenge result was approved${v?.pointsAwarded ? ` — ${v.pointsAwarded} XP added.` : "."}`,
        { type: "validation:decided", status: "approved", challengeId: v?.challengeId },
      );
    } else if (v?.status === "rejected") {
      presentLocal(
        "Result needs another look",
        "Your challenge result was declined. Tap to log it again.",
        { type: "validation:decided", status: "rejected", challengeId: v?.challengeId },
      );
    }
  });
}

export async function connectRealtime() {
  const token = await getAccessToken();
  if (!token) return null;
  if (socket) socket.disconnect();
  socket = io(socketOrigin(), { auth: { token }, transports: ["websocket"] });
  attachNotificationBridge(socket);
  return socket;
}

export function disconnectRealtime() {
  if (socket) { socket.disconnect(); socket = null; }
}

export function getSocket() { return socket; }

// Subscribe to a realtime event. Unlike a naive one-shot binding, this re-binds
// whenever the socket instance changes — critical because AppContext mounts
// BEFORE auth completes, so at first render `socket` is null. We register the
// listener against the current socket and also re-check on an interval + on the
// socket's own connect event, so a challenge:created that arrives after connect
// still updates the UI live (previously it only showed after an app restart).
export function useRealtime(event, handler) {
  useEffect(() => {
    let bound = null;

    const bind = () => {
      const s = getSocket();
      if (s && s !== bound) {
        if (bound) bound.off(event, handler);
        s.on(event, handler);
        bound = s;
      }
    };

    bind(); // bind now if the socket already exists

    // Re-bind when a (new) socket connects after this hook mounted.
    const interval = setInterval(bind, 800);

    return () => {
      clearInterval(interval);
      if (bound) bound.off(event, handler);
    };
  }, [event, handler]);
}