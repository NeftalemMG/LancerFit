import { api } from "./apiClient";
import { getRefreshToken } from "./tokenStore";

export async function registerUser(payload) {
  return api("/auth/register", { method: "POST", body: payload, auth: false });
}
export async function verifyEmail(payload) {
  return api("/auth/verify-email", { method: "POST", body: payload, auth: false });
}
export async function verifyResetCode(payload) {
  return api("/auth/verify-reset-code", { method: "POST", body: payload, auth: false });
}
export async function resendVerificationCode(payload) {
  return api("/auth/resend-verification", { method: "POST", body: payload, auth: false });
}
export async function loginUser(payload) {
  return api("/auth/login", { method: "POST", body: payload, auth: false });
}
export async function requestPasswordReset(payload) {
  return api("/auth/forgot-password", { method: "POST", body: payload, auth: false });
}
export async function resetPassword(payload) {
  return api("/auth/reset-password", { method: "POST", body: payload, auth: false });
}
export async function logoutUser() {
  const refreshToken = await getRefreshToken();
  return api("/auth/logout", { method: "POST", body: { refreshToken }, auth: false });
}