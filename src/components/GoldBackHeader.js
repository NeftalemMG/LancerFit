// Full-page header for stack/tab pages. The back control is now a GOLD
// TEXT-ONLY button (gold chevron + gold "Back", no pill, no border) to match
// the redesigned stats pages and the golden header accents used across the app.

import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/tokens";
import { disp } from "../theme/typography";
import { ChevronLeft } from "./icons";
import GlassTitle from "./GlassTitle";

export default function GoldBackHeader({ title, subtitle, onBack, right = null, titleSize = "md" }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top - 12, 4) }]}>
      <View style={styles.row}>
        <Pressable onPress={onBack} hitSlop={12} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
          <ChevronLeft size={16} color={colors.gold} strokeWidth={2.8} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      <View style={styles.titleWrap}>
        <GlassTitle title={title} subtitle={subtitle} size={titleSize} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 34 },
  right: { flexShrink: 0 },
  titleWrap: { marginTop: 10 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  backText: { fontFamily: disp.bold, fontSize: 15, color: colors.gold, letterSpacing: -0.2 },
});