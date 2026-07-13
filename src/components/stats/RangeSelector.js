// Day / Week / Month / Year range switch. Roomier than before: taller segments,
// full word labels, clear selected pill. Controlled by the parent.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
          <PressScale key={r.key} onPress={() => onChange(r.key)} style={styles.segWrap}>
            <View style={[styles.seg, active && styles.segActive]}>
              <Text style={[styles.segText, active && styles.segTextActive]}>{r.label}</Text>
            </View>
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
  seg: { paddingVertical: 11, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  segActive: { backgroundColor: colors.blue, ...(colors.blueLine ? {} : {}) },
  segText: { fontFamily: disp.semibold, fontSize: 14, color: colors.text2 },
  segTextActive: { color: "#fff" },
});