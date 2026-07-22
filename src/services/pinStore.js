import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lancerfit_pinned_exercises";
// Bumping this key runs the one-time reset below again on every install.
const RESET_FLAG = "lancerfit_pins_reset_v1";

// A brand-new user must start with NOTHING pinned — the Home widget should show
// its "Pin an exercise to see its weekly stats here." prompt until they pin
// something themselves. No code seeds defaults, but installs that were used
// before this change can still carry pins in AsyncStorage, which made the app
// look like it ships with pre-pinned stats. This clears that legacy state once.
export async function ensurePinsInitialized() {
  try {
    const done = await AsyncStorage.getItem(RESET_FLAG);
    if (done) return;
    await AsyncStorage.removeItem(KEY);
    await AsyncStorage.setItem(RESET_FLAG, "1");
  } catch {
    // Non-fatal: worst case the user keeps their existing pins.
  }
}

export async function loadPinned() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function savePinned(keys) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(keys)); } catch {}
}

export async function togglePinned(exerciseKey) {
  const current = await loadPinned();
  const next = current.includes(exerciseKey)
    ? current.filter((k) => k !== exerciseKey)
    : [...current, exerciseKey];
  await savePinned(next);
  return next;
}

// Clear every pin (used by the reset above; also handy on logout).
export async function clearPinned() {
  try { await AsyncStorage.removeItem(KEY); } catch {}
}