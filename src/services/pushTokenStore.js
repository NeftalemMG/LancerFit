// Holds the current device's Expo push token in memory for the session so
// sign-out can unregister exactly this token from the backend. It's set by the
// push hook after successful registration. In-memory is sufficient: on next
// launch the hook re-registers and sets it again.

let currentPushToken = null;

export function setStoredPushToken(token) {
  currentPushToken = token || null;
}

export function getStoredPushToken() {
  return currentPushToken;
}

export function clearStoredPushToken() {
  currentPushToken = null;
}