// Celebrates a newly awarded badge. Sequence:
//   1. The Shield-of-knight Lottie plays.
//   2. The badge icon, title, XP and the reason it was unlocked fade in on a
//      gold-tinted background.
//
// Trigger it by passing an `award` badge object (name, xp, description, type,
// meta, image, isEarned) and call onClose when the user dismisses.

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Modal, Pressable, Animated, Easing } from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import Badge, { badgeAccent } from "./Badge";

export default function BadgeAwardModal({ visible, award, onClose }) {
  const reveal = useRef(new Animated.Value(0)).current;

  // Replay per award so a queued second badge animates too (badgeId changes
  // while the modal stays mounted).
  useEffect(() => {
    if (visible && award) {
      reveal.setValue(0);
      // Let the shield play for a beat, then reveal the badge + copy.
      Animated.timing(reveal, {
        toValue: 1, duration: 700, delay: 1300, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true,
      }).start();
    }
  }, [visible, award?.badgeId, reveal]);

  if (!award) return null;

  const accent = badgeAccent(award);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.root} onPress={onClose}>
        <LinearGradient colors={["rgba(11,26,45,0.96)", "rgba(11,26,45,0.99)"]} style={StyleSheet.absoluteFill} />

        <View style={styles.center}>
          <LottieView
            key={award.badgeId}
            source={require("../../assets/animations/Shield-of-knight.json")}
            autoPlay
            loop={false}
            style={styles.shield}
            resizeMode="contain"
          />

          <Animated.View
            style={[
              styles.revealBox,
              { opacity: reveal, transform: [{ scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] },
            ]}
          >
            <Text style={styles.kicker}>BADGE UNLOCKED</Text>
            <View style={[styles.iconHalo, { borderColor: accent + "66", backgroundColor: accent + "14" }]}>
              <Badge badge={{ ...award, isEarned: true }} size={116} />
            </View>
            <Text style={styles.title}>{award.name}</Text>
            {award.description ? <Text style={styles.reason}>{award.description}</Text> : null}

            {award.xp ? (
              <View style={styles.xpTag}>
                <Text style={styles.xpText}>+{award.xp} XP</Text>
              </View>
            ) : null}

            <Pressable onPress={onClose}>
              <LinearGradient colors={[colors.gold, colors.goldDim]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.btn}>
                <Text style={styles.btnText}>Claim it</Text>
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
  shield: { width: 220, height: 220 },
  revealBox: { alignItems: "center", marginTop: -18 },
  kicker: { fontFamily: disp.bold, fontSize: 14, letterSpacing: 3, color: colors.gold, marginBottom: 16 },
  iconHalo: { padding: 12, borderRadius: 34, borderWidth: 1, marginBottom: 18 },
  title: { fontFamily: disp.bold, fontSize: 25, letterSpacing: -0.5, color: colors.text, textAlign: "center", maxWidth: 300 },
  reason: { fontFamily: body.regular, fontSize: 14.5, lineHeight: 21, color: colors.text2, textAlign: "center", marginTop: 12, maxWidth: 300 },
  xpTag: { marginTop: 18, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 99, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.goldLine },
  xpText: { fontFamily: disp.bold, fontSize: 13, letterSpacing: 0.4, color: colors.gold },
  btn: { marginTop: 26, paddingVertical: 15, paddingHorizontal: 54, borderRadius: 16 },
  btnText: { fontFamily: disp.bold, fontSize: 16, color: colors.goldInk },
});
