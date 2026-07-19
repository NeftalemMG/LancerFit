// Branded intro shown every time the app opens, BEFORE the sign-in / sign-up
// flow. Structure (top -> bottom): the fighting-swords Lottie animation, the
// University of Windsor crest, the "LANCERFIT" wordmark, and a motto.
//
// It calls onDone() when finished so AppShell can move on to the auth flow.
// Timing: we let the Lottie play once (or a max duration), then fade out.

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated, Easing } from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/tokens";
import { disp, body } from "../theme/typography";

const HOLD_MS = 4000; // how long to stay before fading out

export default function SplashScreen({ onDone }) {
  const fade = useRef(new Animated.Value(0)).current;   // whole-screen fade in
  const logoRise = useRef(new Animated.Value(14)).current;
  const outFade = useRef(new Animated.Value(1)).current; // fade the splash away

  useEffect(() => {
    // Fade the content in, then rise the logo/text.
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(logoRise, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // After the hold, fade everything out and hand off.
    const t = setTimeout(() => {
      Animated.timing(outFade, {
        toValue: 0, duration: 480, easing: Easing.in(Easing.quad), useNativeDriver: true,
      }).start(() => onDone && onDone());
    }, HOLD_MS);

    return () => clearTimeout(t);
  }, [fade, logoRise, outFade, onDone]);

  return (
    <Animated.View style={[styles.root, { opacity: outFade }]}>
      <LinearGradient
        colors={[colors.bg1, colors.bg0, colors.bg0]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.center, { opacity: fade }]}>
        {/* Fighting swords animation */}
        <LottieView
          source={require("../../assets/animations/fighting-swords.json")}
          autoPlay
          loop
          style={styles.lottie}
          resizeMode="contain"
        />

        {/* University crest + wordmark rise up together */}
        <Animated.View style={{ alignItems: "center", transform: [{ translateY: logoRise }] }}>
          <Image
            source={require("../../assets/brand/uwindsor-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.wordmark}>LANCERFIT</Text>
          <Text style={styles.motto}>Train like a Lancer. Rise through the ranks.</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: colors.appBg },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  lottie: { width: 500, height: 500},
  logo: { width: 84, height: 96, marginTop: 4 },
  wordmark: {
    fontFamily: disp.bold, fontSize: 34, letterSpacing: 2, color: colors.text,
    marginTop: 18,
  },
  motto: {
    fontFamily: body.regular, fontSize: 13.5, color: colors.text2,
    marginTop: 10, textAlign: "center", letterSpacing: 0.3,
  },
});