// StatHeroMetric — the big headline metric at the top of a per-activity stats
// page. Apple-Health-style scale (an oversized primary number with a unit and a
// caption) dressed in LancerFit's gold/navy: a faint gold gradient wash behind
// the number, a gold hairline accent, and tabular figures so it never jitters
// as live data updates. The trailing "delta" chip shows session count for the
// selected range so the hero carries context, not just a lone number.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../../theme/tokens";
import { disp, body } from "../../theme/typography";

const round = (n) => (Number.isInteger(n) ? n : Math.round((n + Number.EPSILON) * 10) / 10);

export default function StatHeroMetric({ value = 0, unit = "min", caption, sessions = 0 }) {
  return (
    <View style={s.wrap}>
      <LinearGradient
        colors={["rgba(255,209,87,0.10)", "rgba(255,209,87,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[colors.gold, colors.goldDim]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={s.edge}
      />
      <View style={s.body}>
        <Text style={s.caption}>{caption || "This range"}</Text>
        <View style={s.numRow}>
          <Text style={s.value} numberOfLines={1} adjustsFontSizeToFit>
            {round(value).toLocaleString("en-US")}
          </Text>
          <Text style={s.unit}>{unit}</Text>
        </View>
        <View style={s.chip}>
          <Text style={s.chipText}>
            {sessions} session{sessions === 1 ? "" : "s"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldLine,
    overflow: "hidden",
    flexDirection: "row",
  },
  edge: { width: 4 },
  body: { flex: 1, paddingVertical: 20, paddingHorizontal: 20 },
  caption: {
    fontFamily: body.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.text3,
    textTransform: "uppercase",
  },
  numRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 8 },
  value: {
    fontFamily: disp.bold,
    fontSize: 52,
    lineHeight: 54,
    letterSpacing: -1.5,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  unit: { fontFamily: disp.semibold, fontSize: 18, color: colors.gold, paddingBottom: 8 },
  chip: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldLine,
  },
  chipText: { fontFamily: body.semibold, fontSize: 11.5, color: colors.gold },
});