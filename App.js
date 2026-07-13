// LancerFit — app entry point
//
// Responsibilities:
//   1. Load the custom fonts (Space Grotesk for display, Inter
//      for body). React Native needs every weight as its own
//      named family, so we register each variant explicitly. The
//      names here MUST match the strings used in
//      src/theme/typography.js.
//   2. Hold the UI back until the fonts are ready so we never get
//      a flash of the system font.
//   3. Provide the safe-area context and the app state context,
//      then hand off to AppShell which does the actual routing.
// 

import React, { useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

import { AppProvider } from "./src/context/AppContext";
import { AuthProvider } from "./src/context/AuthContext";
import AppShell from "./src/components/AppShell";
import { colors } from "./src/theme/tokens";

// Keep the native splash visible while we load fonts.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Hide the splash once fonts are in. onLayout fires on first
  // paint of the root view, which is the right moment to reveal.
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View
        style={{ flex: 1, backgroundColor: colors.appBg }}
        onLayout={onLayoutRootView}
      >
        <AuthProvider>
          <AppProvider>
            <AppShell />
          </AppProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
}
