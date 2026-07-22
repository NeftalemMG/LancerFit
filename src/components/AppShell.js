import React, { useState } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

import { colors } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import LevelUpModal from "./LevelUpModal";
import BadgeAwardModal from "./BadgeAwardModal";

import AuthNavigator from "../navigation/AuthNavigator";
import AppNavigator from "../navigation/AppNavigator";
import SplashScreen from "../screens/SplashScreen";

import { Toast, Sheet } from "./Overlays";

const NavigationNavTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: "transparent" },
};

export default function AppShell() {
  const { isAuthenticated, isLoading } = useAuth();
  // Branded splash shows on every app open, before anything else.
  const [showSplash, setShowSplash] = useState(true);

  if (isLoading) return null;

  // Gate the whole app behind the splash until its animation finishes.
  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.bg1, colors.bg0, colors.bg0]}
        locations={[0, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <NavigationContainer theme={NavigationNavTheme}>
          {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </SafeAreaView>

      <Toast />
      <Sheet />
      <GlobalLevelUp />
      <GlobalBadgeAward />
    </View>
  );
}

// Bridges AppContext's levelUp state to the modal, rendered above everything.
function GlobalLevelUp() {
  const { levelUp, clearLevelUp } = useApp();
  return (
    <LevelUpModal
      visible={!!levelUp}
      level={levelUp?.level}
      facultyKey={levelUp?.facultyKey}
      onClose={clearLevelUp}
    />
  );
}

// Bridges AppContext's badge-award queue to the celebration modal. Shows one
// badge at a time; clearing advances to the next queued award.
function GlobalBadgeAward() {
  const { badgeAward, clearBadgeAward } = useApp();
  return (
    <BadgeAwardModal
      visible={!!badgeAward}
      award={badgeAward}
      onClose={clearBadgeAward}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
});