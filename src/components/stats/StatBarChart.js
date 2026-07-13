// Apple-Health-style bar chart. Rebuilt to fix the overlap/misalignment issues:
//   • Bars are evenly distributed with guaranteed gaps (flex layout, not manual x).
//   • X-axis labels are thinned so they never overlap (every Nth label), and are
//     clipped to their column width.
//   • The tallest bar shows its value on top; empty buckets show a faint stub.
//   • Works cleanly for 7 (week), 24 (day), 30 (month), 12 (year) buckets.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/tokens";
import { disp, body } from "../../theme/typography";

const CHART_HEIGHT = 150;

export default function StatBarChart({ buckets = [], metric = "totalDuration", unit = "min" }) {
  const n = buckets.length || 1;
  const values = buckets.map((b) => Number(b?.[metric] ?? 0));
  const max = Math.max(1, ...values);
  const maxIdx = values.indexOf(Math.max(...values));

  // Thin labels so they never collide: aim for ~6-7 visible labels max.
  const labelEvery = n <= 7 ? 1 : n <= 12 ? 2 : Math.ceil(n / 6);

  return (
    <View>
      <View style={[styles.plot, { height: CHART_HEIGHT }]}>
        {buckets.map((b, i) => {
          const v = values[i];
          const h = Math.round((v / max) * (CHART_HEIGHT - 26));
          const isTop = i === maxIdx && v > 0;
          return (
            <View key={i} style={styles.col}>
              {isTop && (
                <Text style={styles.topVal} numberOfLines={1}>
                  {round(v)}
                </Text>
              )}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(v > 0 ? 4 : 2, h),
                      backgroundColor: v > 0 ? colors.blue2 : "rgba(255,255,255,0.06)",
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* baseline */}
      <View style={styles.baseline} />

      {/* x-axis labels, thinned */}
      <View style={styles.axis}>
        {buckets.map((b, i) => (
          <View key={i} style={styles.axisCol}>
            <Text style={styles.axisLabel} numberOfLines={1}>
              {i % labelEvery === 0 ? b.label : ""}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const round = (x) => (Number.isInteger(x) ? x : Math.round(x * 10) / 10);

const styles = StyleSheet.create({
  plot: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 3,
  },
  col: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" },
  barTrack: { width: "100%", alignItems: "center", justifyContent: "flex-end", flex: 1 },
  bar: { width: "72%", maxWidth: 22, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderRadius: 3 },
  topVal: { fontFamily: disp.bold, fontSize: 11, color: colors.text, marginBottom: 4 },
  baseline: { height: 1, backgroundColor: colors.cardLine, marginTop: 0 },
  axis: { flexDirection: "row", marginTop: 6 },
  axisCol: { flex: 1, alignItems: "center" },
  axisLabel: { fontFamily: body.medium, fontSize: 10, color: colors.text3, textAlign: "center" },
});