import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/tokens";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import BadgesScreen from "../screens/BadgesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LogScreen from "../screens/LogScreen";

import TabBar from "./TabBar";
import { Toast, Sheet } from "./Overlays";

export default function AppShell() {
  const { toast, updatePlayer } = useApp();
  const { login, logout, isAuthenticated, isLoading } = useAuth();

  const [screen, setScreen] = useState(isAuthenticated ? "home" : "signin");

  useEffect(() => {
    if (!isLoading) {
      setScreen(isAuthenticated ? "home" : "signin");
    }
  }, [isAuthenticated, isLoading]);
  
  // ============================================================
  // NAVIGATION HELPERS (UI STATE ONLY)
  // ============================================================

  const navigate = useCallback((key) => {
    setScreen(key);
  }, []);

  const goToScreen = useCallback((key) => {
    setScreen(key);
  }, []);

  const openLog = useCallback(() => {
    setScreen("log");
  }, []);

  // ============================================================
  // AUTH FLOW HANDLERS
  // ============================================================

  // Wrapped in useCallback to prevent recreation on every render
  const handleSignInSuccess = useCallback((response) => {
    login(response);

    const signedInName =
      response?.user?.name ||
      [response?.user?.firstName, response?.user?.lastName]
        .filter(Boolean)
        .join(" ") ||
      "Lancer";

    updatePlayer({ name: signedInName });
    
    setScreen("home"); 

    setTimeout(() => toast(`Welcome back, ${signedInName}`), 520);
  }, [login, updatePlayer, toast]);

  const handleLogout = useCallback(() => {
    logout();
    setScreen("signin");
  }, [logout]);


  // ============================================================
  // SCREEN RENDERING
  // ============================================================

  const renderAuth = () => {
    switch (screen) {
      case "signin":
        return (
          <SignInScreen
            onSignInSuccess={handleSignInSuccess}
            goToSignUp={() => goToScreen("signup")}
            goToForgotPassword={() => goToScreen("forgot")}
          />
        );

      case "signup":
        return (
          <SignUpScreen
            onSignUpSuccess={(res) => {
             login(res);
              const name = res?.user?.name || "Lancer";
              updatePlayer({ name });
              setScreen("home");
              setTimeout(() => toast(`Welcome to LancerFit, ${name}`), 520)
            }}
            goToSignIn={() => goToScreen("signin")}
          />
        );
      case "forgot":
        return <ForgotPasswordScreen goToSignIn={() => goToScreen("signin")} />;
      default:
        return (
          <SignInScreen
            onSignInSuccess={handleSignInSuccess}
            goToSignUp={() => goToScreen("signup")} 
            goToForgotPassword={() => goToScreen("forgot")} 
          />
        );
    }
  };

  const renderApp = () => {
    switch (screen) {
      case "home":
        return <HomeScreen goToQuests={() => navigate("quests")} />;
      case "quests":
        return <ChallengesScreen />;
      case "log":
        return <LogScreen />;
      case "board":
        return <LeaderboardScreen />;
      case "badges":
        return <BadgesScreen goToProfile={() => navigate("profile")} />;
      case "profile":
        return (
          <ProfileScreen
            goToBadges={() => navigate("badges")}
            onLogout={handleLogout}
          />
        );
      default:
        return <HomeScreen goToQuests={() => navigate("quests")} />;
    }
  };

  // ============================================================
  // DERIVED STATE
  // ============================================================

  const activeTab = screen === "badges" ? "profile" : screen;

  const isTabBarVisible =
    isAuthenticated && !["signin", "signup", "forgot"].includes(screen);

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoading) return null;

  return (
    <View style={styles.phone}>
      <LinearGradient
        colors={[colors.bg1, colors.bg0, colors.bg0]}
        locations={[0, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={{ flex: 1 }}>
          {isAuthenticated ? renderApp() : renderAuth()}
        </View>
      </SafeAreaView>

      {isTabBarVisible && (
        <TabBar active={activeTab} onNavigate={navigate} onLog={openLog} />
      )}

      <Toast />
      <Sheet />
    </View>
  );
}

const styles = StyleSheet.create({
  phone: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
});