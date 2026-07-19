// Celebrates a level-up. Sequence:
//   1. The jumping mascot Lottie plays.
//   2. The user's NEW avatar (their faculty art at the new tier) fades in on a
//      gold background, with a tier-specific congratulations message.
//
// Trigger it by passing a `level` (the new level) and `facultyKey`; call onClose
// when the user dismisses. The message maps to the tier the new level unlocks.

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Modal, Pressable, Animated, Easing } from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import FacultyAvatar from "./FacultyAvatar";
import { tierName, tierForLevel } from "../data/facultyTheme";

// A line for each tier the user can reach.
const TIER_MESSAGE = {
  Squire: { title: "You're a Squire!", line: "Every legend starts here. Keep logging activities to rise." },
  Knight: { title: "Knighted!", line: "Your discipline is showing. The climb gets serious from here." },
  Hero: { title: "You're a Hero now!", line: "Few make it this far. Your streak is a force." },
  Legend: { title: "Legendary status.", line: "You're in rare company. The campus knows your name." },
  Lancer: { title: "True Lancer.", line: "The peak. You embody what it means to train like a Lancer." },
};

export default function LevelUpModal({ visible, level = 1, facultyKey, onClose }) {
  const reveal = useRef(new Animated.Value(0)).current;
  const tier = tierName(level);
  const msg = TIER_MESSAGE[tier] || TIER_MESSAGE.Squire;

  useEffect(() => {
    if (visible) {
      reveal.setValue(0);
      // Let the mascot jump for a beat, then reveal the avatar + message.
      Animated.timing(reveal, {
        toValue: 1, duration: 700, delay: 1400, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true,
      }).start();
    }
  }, [visible, reveal]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.root} onPress={onClose}>
        <LinearGradient colors={["rgba(11,26,45,0.96)", "rgba(11,26,45,0.99)"]} style={StyleSheet.absoluteFill} />

        <View style={styles.center}>
          <LottieView
            source={require("../../assets/animations/level-up-mascot.json")}
            autoPlay
            loop={false}
            style={styles.mascot}
            resizeMode="contain"
          />

          <Animated.View
            style={[
              styles.revealBox,
              { opacity: reveal, transform: [{ scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] },
            ]}
          >
            <Text style={styles.levelKicker}>LEVEL {level}</Text>
            <View style={styles.avatarHalo}>
              <FacultyAvatar facultyKey={facultyKey} level={level} size={132} goldBg />
            </View>
            <Text style={styles.title}>{msg.title}</Text>
            <Text style={styles.rank}>{tier} · Tier {tierForLevel(level)}</Text>
            <Text style={styles.line}>{msg.line}</Text>

            <Pressable onPress={onClose}>
              <LinearGradient colors={[colors.gold, colors.goldDim]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.btn}>
                <Text style={styles.btnText}>Let's go</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 34 },
  mascot: { width: 220, height: 220 },
  revealBox: { alignItems: "center", marginTop: -20 },
  levelKicker: { fontFamily: disp.bold, fontSize: 14, letterSpacing: 3, color: colors.gold, marginBottom: 14 },
  avatarHalo: { padding: 6, borderRadius: 40, marginBottom: 18 },
  title: { fontFamily: disp.bold, fontSize: 26, letterSpacing: -0.5, color: colors.text, textAlign: "center" },
  rank: { fontFamily: disp.semibold, fontSize: 14, color: colors.gold, marginTop: 6 },
  line: { fontFamily: body.regular, fontSize: 14.5, lineHeight: 21, color: colors.text2, textAlign: "center", marginTop: 12, maxWidth: 300 },
  btn: { marginTop: 26, paddingVertical: 15, paddingHorizontal: 54, borderRadius: 16 },
  btnText: { fontFamily: disp.bold, fontSize: 16, color: colors.goldInk },
});