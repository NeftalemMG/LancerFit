// Header for full-screen STACK pages (not tab pages). Unlike ScreenHeader, it
// renders a back button and respects the device safe-area (notch/status bar) so
// content never sits under the clock. Use on any screen pushed over the tabs
// (Stats, ExerciseStats, etc).

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/tokens";
import { disp, body } from "../theme/typography";

export default function StackHeader({ title, subtitle, onBack, right = null }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 6 }]}>
      <View style={styles.row}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          {/* Simple chevron drawn with two rotated bars — no icon lib needed */}
          <Text style={styles.backGlyph}>‹</Text>
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        {right ? <View style={styles.right}>{right}</View> : <View style={styles.right} />}
      </View>
      <Text style={styles.h1} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: colors.appBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardLine,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 32,
    marginBottom: 8,
  },
  backBtn: { flexDirection: "row", alignItems: "center", marginLeft: -4 },
  backGlyph: { fontFamily: disp.regular, fontSize: 30, lineHeight: 30, color: colors.blue2, marginRight: 2 },
  backLabel: { fontFamily: body.medium, fontSize: 16, color: colors.blue2 },
  right: { minWidth: 40, alignItems: "flex-end" },
  h1: { fontFamily: disp.bold, fontSize: 26, letterSpacing: -0.5, color: colors.text },
  sub: { marginTop: 5, color: colors.text2, fontSize: 14, lineHeight: 20, fontFamily: body.regular },
});