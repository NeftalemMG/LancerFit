import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  ScrollView,
  StyleSheet,
  Dimensions,
  BackHandler,
  Keyboard,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, shadow } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { useApp } from "../context/AppContext";
import { PressScale } from "./ui";
import { PlusIcon, SyncIcon } from "./icons";

// ---- Toast ----
export function Toast() {
  const { toastMsg, toastY, toastOpacity } = useApp();
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          opacity: toastOpacity,
          transform: [{ translateX: -0.5 * TOAST_W }, { translateY: toastY }],
        },
      ]}
    >
      <Text style={styles.toastText}>{toastMsg}</Text>
    </Animated.View>
  );
}

// ---- Bottom sheet ----
const SHEET_MAX_HEIGHT_RATIO = 0.85;

export function Sheet() {
  const { sheet, closeSheet } = useApp();
  const { height } = Dimensions.get("window");
  const translateY = useRef(new Animated.Value(height)).current;
  const veil = useRef(new Animated.Value(0)).current;
  const maxHeight = height * SHEET_MAX_HEIGHT_RATIO;

  // Track the keyboard so we can lift the whole sheet above it. A bottom-pinned
  // sheet isn't reliably raised by KeyboardAvoidingView's "padding" behavior, so
  // we translate the sheet up by the keyboard height (minus the safe-area the
  // sheet already clears) whenever the keyboard is shown.
  const kbOffset = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = (e) => {
      const h = e?.endCoordinates?.height ?? 0;
      Animated.timing(kbOffset, {
        toValue: -Math.max(0, h - 24),
        duration: Platform.OS === "ios" ? (e?.duration ?? 250) : 180,
        useNativeDriver: true,
      }).start();
    };
    const onHide = (e) => {
      Animated.timing(kbOffset, {
        toValue: 0,
        duration: Platform.OS === "ios" ? (e?.duration ?? 250) : 180,
        useNativeDriver: true,
      }).start();
    };
    const s1 = Keyboard.addListener(showEvt, onShow);
    const s2 = Keyboard.addListener(hideEvt, onHide);
    return () => { s1.remove(); s2.remove(); };
  }, [kbOffset]);

  useEffect(() => {
    if (sheet.open) {
      Animated.parallel([
        Animated.timing(veil, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 14,
          bounciness: 2,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(veil, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sheet.open, height, translateY, veil]);

  // Android hardware back (and some gesture-nav back) presses would
  // otherwise fall through to the navigator underneath and pop the
  // screen back to Home. While the sheet is open, intercept back and
  // close the sheet instead
  useEffect(() => {
    if (!sheet.open) return undefined;
    const onBackPress = () => {
      closeSheet();
      return true; 
    };
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );
    return () => subscription.remove();
  }, [sheet.open, closeSheet]);

  return (
    <>
      <Animated.View
        pointerEvents={sheet.open ? "auto" : "none"}
        style={[styles.veil, { opacity: veil }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { maxHeight, transform: [{ translateY: Animated.add(translateY, kbOffset) }] }]}
      >
        <LinearGradient
          colors={["#0E3457", "#082A47"]}
          style={StyleSheet.absoluteFill}
        />
        {!sheet.flush && <View style={styles.grab} />}
        {sheet.flush && <View style={[styles.grab, styles.grabFlush]} />}
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            sheet.flush ? styles.scrollContentFlush : styles.scrollContent
          }
        >
          {sheet.content}
        </ScrollView>
      </Animated.View>
    </>
  );
}

// ---- Log workout sheet content ----
export function LogWorkoutSheet({ onDone }) {
  return (
    <View
      style={{
        alignItems: "center",
        paddingHorizontal: 26,
        paddingTop: 4,
        paddingBottom: 10,
      }}
    >
      <Text style={styles.h3}>Log a workout</Text>
      <Text style={styles.desc}>
        Pick how you'd like to add today's activity.
      </Text>
      <View style={{ alignSelf: "stretch", marginTop: 20, gap: 10 }}>
        <PressScale onPress={() => onDone("manual")}>
          <LinearGradient
            colors={[colors.gold, colors.goldDim]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.act}
          >
            <PlusIcon size={18} color={colors.goldInk} strokeWidth={2.2} />
            <Text style={[styles.actText, { color: colors.goldInk }]}>
              Log manually
            </Text>
          </LinearGradient>
        </PressScale>
        <PressScale onPress={() => onDone("sync")}>
          <View style={[styles.act, styles.actSec]}>
            <SyncIcon size={18} color={colors.text} strokeWidth={2.2} />
            <Text style={[styles.actText, { color: colors.text }]}>
              Sync from Apple Health / Garmin
            </Text>
          </View>
        </PressScale>
      </View>
    </View>
  );
}

const TOAST_W = 300;

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: "50%",
    bottom: 100,
    zIndex: 80,
    width: TOAST_W,
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#08243F",
    borderWidth: 1,
    borderColor: colors.cardLine2,
    ...shadow.pop,
  },
  toastText: {
    color: "#fff",
    fontFamily: disp.semibold,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  veil: {
    position: "absolute",
    inset: 0,
    zIndex: 85,
    backgroundColor: "rgba(3,18,33,0.55)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 90,
    borderTopWidth: 1,
    borderColor: colors.cardLine2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    ...shadow.pop,
  },
  scrollContent: { paddingTop: 14, paddingBottom: 34 },
  scrollContentFlush: { paddingBottom: 34 },
  grab: {
    width: 42,
    height: 5,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignSelf: "center",
    marginTop: 14,
    marginBottom: 4,
  },
  grabFlush: {
    position: "absolute",
    top: 12,
    zIndex: 5,
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  h3: {
    fontFamily: disp.bold,
    fontSize: 21,
    letterSpacing: -0.5,
    color: colors.text,
    marginTop: 6,
  },
  desc: {
    marginTop: 10,
    color: colors.text2,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 280,
    fontFamily: body.regular,
  },
  act: {
    height: 50,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  actSec: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardLine,
  },
  actText: { fontFamily: disp.bold, fontSize: 14 },
});