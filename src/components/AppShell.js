import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";

import { colors } from "../theme/tokens";
import { useAuth } from "../context/AuthContext";

import AuthNavigator from "../navigation/AuthNavigator";
import AppNavigator from "../navigation/AppNavigator";

import { Toast, Sheet } from "./Overlays";

const NavigationNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

export default function AppShell() {
  const { isAuthenticated, isLoading } = useAuth();

  // Handle loading state up top to prevent interface flashing
  if (isLoading) return null;

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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
});
