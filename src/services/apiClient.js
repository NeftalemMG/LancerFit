import { getAccessToken, getRefreshToken, updateAccessToken, clearAuth } from "./tokenStore";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

function apiError(message, extra = {}) {
  const err = new Error(message || "Request failed");
  Object.assign(err, extra);
  return err;
}
async function parse(res) {
  const raw = await res.text();
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return { message: raw }; }
}
async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;
  const data = await parse(res);
  if (!data?.accessToken) return false;
  await updateAccessToken(data.accessToken);
  return true;
}
export async function api(path, { method = "GET", body, auth = true, _retried = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method, headers, body: body != null ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && auth && !_retried) {
    const ok = await refreshAccessToken();
    if (ok) return api(path, { method, body, auth, _retried: true });
    await clearAuth();
  }
  const data = await parse(res);
  if (!res.ok) {
    throw apiError(data?.message, { status: res.status, errors: Array.isArray(data?.errors) ? data.errors : [], data });
  }
  return data;
}