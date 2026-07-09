import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { logoutUser } from "../services/authApi";
import { loadAuth, saveAuth, clearAuth } from "../services/tokenStore";
import { connectRealtime, disconnectRealtime } from "../services/realtime";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    (async () => {
      try {
        const stored = await loadAuth();
        if (stored?.user) { setUser(stored.user); await connectRealtime(); }
      } catch (err) { console.log("Auth load error:", err); }
      finally { setIsLoading(false); }
    })();
  }, []);

  const login = useCallback(async (response) => {
    const payload = {
      user: response?.user, accessToken: response?.accessToken, refreshToken: response?.refreshToken,
    };
    setUser(payload.user);
    await saveAuth(payload);
    await connectRealtime();
  }, []);

  const logout = useCallback(async () => {
    try { await logoutUser(); } catch (err) { console.log("Logout API error:", err); }
    disconnectRealtime();
    setUser(null);
    await clearAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}