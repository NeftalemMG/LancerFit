import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = "lancerfit_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // -----------------------------
  // Load session on app start
  // -----------------------------
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user || null);
        }
      } catch (err) {
        console.log("Auth load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // -----------------------------
  // LOGIN
  // -----------------------------
  const login = useCallback(async (response) => {
    const payload = {
      user: response?.user,
      accessToken: response?.accessToken,
      refreshToken: response?.refreshToken,
    };

    setUser(payload.user);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.log("Auth save error:", err);
    }
  }, []);

  // -----------------------------
  // LOGOUT
  // -----------------------------
  const logout = useCallback(async () => {
    setUser(null);

    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.log("Auth clear error:", err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}