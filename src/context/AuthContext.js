import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { logoutUser } from "../services/authApi";
import { loadAuth, saveAuth, clearAuth } from "../services/tokenStore";
import { connectRealtime, disconnectRealtime } from "../services/realtime";
import { unregisterPushToken } from "../hooks/usePushNotifications";
import { getStoredPushToken } from "../services/pushTokenStore";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Restore session on app start and (re)open the realtime socket.
  useEffect(() => {
    (async () => {
      try {
        const stored = await loadAuth();
        if (stored?.user) {
          setUser(stored.user);
          await connectRealtime();
        }
      } catch (err) {
        console.log("Auth load error:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // login(response): response is the backend auth payload
  // { user, accessToken, refreshToken }. We persist all three so the API client
  // can attach + refresh tokens, then connect realtime.
  const login = useCallback(async (response) => {
    const payload = {
      user: response?.user,
      accessToken: response?.accessToken,
      refreshToken: response?.refreshToken,
    };
    setUser(payload.user);
    await saveAuth(payload);
    await connectRealtime();
  }, []);

  const logout = useCallback(async () => {
    try {
      // Detach this device's push token first so a shared phone stops getting
      // this account's notifications.
      await unregisterPushToken(getStoredPushToken());
    } catch (err) {
      console.log("Push unregister error:", err);
    }
    try {
      await logoutUser();
    } catch (err) {
      console.log("Logout API error:", err);
    }
    setUser(null);
    await clearAuth();
    disconnectRealtime();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}