import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY = "lancerfit_pinned_exercises";

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