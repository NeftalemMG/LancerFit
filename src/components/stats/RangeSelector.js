// src/components/stats/RangeSelector.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PressScale } from "../ui";
import { colors, radius } from "../../theme/tokens";
import { body } from "../../theme/typography";

const RANGES = [
  { key: "day", label: "D" }, { key: "week", label: "W" },
  { key: "month", label: "M" }, { key: "year", label: "Y" },
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
  wrap: { flexDirection: "row", backgroundColor: colors.card, borderRadius: radius.sm, padding: 3, borderWidth: 1, borderColor: colors.cardLine },
  segWrap: { flex: 1 },
  seg: { paddingVertical: 7, borderRadius: radius.sm - 3, alignItems: "center" },
  segActive: { backgroundColor: colors.blue },
  segText: { fontFamily: body.semibold, fontSize: 13, color: colors.text2 },
  segTextActive: { color: colors.white },
});