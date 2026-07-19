// Day / Week / Month / Year range switch. Polished for the redesigned stats
// page: the active segment now uses the LancerFit gold pill (with gold ink)
// rather than a flat blue block, so it matches the hero card and the chart's
// current-bucket highlight. Controlled by the parent.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PressScale } from "../ui";
import { colors, radius } from "../../theme/tokens";
import { disp } from "../../theme/typography";

const RANGES = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

export default function RangeSelector({ value, onChange }) {
  return (
    <View style={styles.wrap}>
      {RANGES.map((r) => {
        const active = value === r.key;
        return (
          <PressScale key={r.key} onPress={() => onChange(r.key)} wrapStyle={styles.segWrap} style={styles.segInner}>
            {active ? (
              <LinearGradient
                colors={[colors.gold, colors.goldDim]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.seg, styles.segActive]}
              >
                <Text style={[styles.segText, styles.segTextActive]}>{r.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.seg}>
                <Text style={styles.segText}>{r.label}</Text>
              </View>
            )}
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.cardLine,
    gap: 4,
  },
  segWrap: { flex: 1 },
  segInner: { flex: 1 },
  seg: { flex: 1, paddingVertical: 11, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  segActive: { ...(colors.goldLine ? {} : {}) },
  segText: { fontFamily: disp.semibold, fontSize: 14, color: colors.text2 },
  segTextActive: { color: colors.goldInk },
});