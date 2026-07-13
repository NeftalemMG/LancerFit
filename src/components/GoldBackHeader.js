// src/components/GoldBackHeader.js
//
// Full-page header for stack/tab pages. The gold pill back button sits right at
// the safe-area top (lifted up), with an optional `right` slot on the same row
// (used on the Log screen for the Today/Yesterday toggle, so the right side is
// no longer empty). Below the row is the compact golden-edge GlassTitle.

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
    <View style={[styles.wrap, { paddingTop: insets.top - 2 < 0 ? 0 : insets.top - 2 }]}>
      <View style={styles.row}>
        <Pressable onPress={onBack} hitSlop={10} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.75 }]}>
          <ChevronLeft size={15} color={colors.goldInk} strokeWidth={2.8} />
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
  wrap: { paddingHorizontal: 18, paddingBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 36 },
  right: { flexShrink: 0 },
  titleWrap: { marginTop: 12 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 7,
    paddingLeft: 9,
    paddingRight: 14,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  backText: { fontFamily: disp.bold, fontSize: 13.5, color: colors.goldInk },
});