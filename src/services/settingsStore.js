// src/services/settingsStore.js
//
// Persisted user preferences that actually gate app behavior:
//   • questReminders  — whether the user receives a notification when a new
//                       challenge/quest is created.
//   • autoCheckin     — whether the app auto-checks-in (and notifies) when the
//                       user arrives at the Toldo Lancer Centre.
//
// Stored in AsyncStorage so the choice survives restarts, and read
// synchronously-ish via an in-memory cache so the notification/proximity code
// paths can check the current value without awaiting on every event.

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lancerfit_settings_v1";

const DEFAULTS = { questReminders: true, autoCheckin: true };

// In-memory cache so event handlers (push, proximity) can read the latest value
// synchronously. Seeded from storage on first load.
let cache = { ...DEFAULTS };
let loaded = false;
const listeners = new Set();

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cache = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    cache = { ...DEFAULTS };
  }
  loaded = true;
  emit();
  return cache;
}

export function getSettings() {
  return cache;
}

export function getSetting(key) {
  return cache[key];
}

export function isLoaded() {
  return loaded;
}

export async function setSetting(key, value) {
  cache = { ...cache, [key]: value };
  emit();
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Non-fatal: the in-memory value is already updated for this session.
  }
  return cache;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) {
    try { fn(cache); } catch { /* ignore listener errors */ }
  }
}