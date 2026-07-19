import AsyncStorage from "@react-native-async-storage/async-storage";
const STORAGE_KEY = "lancerfit_auth";

export async function loadAuth() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export async function saveAuth(auth) {
  try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(auth)); } catch {}
}
export async function clearAuth() {
  try { await AsyncStorage.removeItem(STORAGE_KEY); } catch {}
}
export async function getAccessToken() { return (await loadAuth())?.accessToken ?? null; }
export async function getRefreshToken() { return (await loadAuth())?.refreshToken ?? null; }
export async function updateAccessToken(accessToken) {
  const current = (await loadAuth()) || {};
  await saveAuth({ ...current, accessToken });
}