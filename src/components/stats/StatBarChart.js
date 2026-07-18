// StatBarChart — Apple-Health-style bars with LancerFit accents.
//
// Buckets come straight from the backend (real data): 7 (week), 24 (day),
// 30 (month), 12 (year).

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/tokens";
import { disp, body } from "../../theme/typography";

const CHART_HEIGHT = 168;

// Compact, non-colliding label for a bucket given the range size.
// The backend already sends good labels: year -> "Jul" (3-letter month),
// month -> "Jul 4", week -> "Mon", day -> "9:00". We only trim where needed and
// never clip mid-token (which produced the old "J", "3.", "1.." artifacts).
function compactLabel(raw, n) {
  if (raw == null) return "";
  const str = String(raw).trim();
  if (n === 24) return str;            // hourly "9:00" — already short
  if (n === 12) return str;            // yearly — keep full 3-letter "Jan".."Dec"
  if (n === 30) {
    // "Jul 4" -> "4" (day-of-month only); if no space, use as-is.
    const parts = str.split(/\s+/);
    return parts.length > 1 ? parts[parts.length - 1] : str;
  }
  return str;                          // week — "Mon" etc.
}

export default function StatBarChart({ buckets = [], metric = "totalDuration", unit = "min" }) {
  const n = buckets.length || 1;
  const values = buckets.map((b) => Number(b?.[metric] ?? 0));
  const max = Math.max(1, ...values);
  const maxIdx = values.indexOf(Math.max(...values));
  const currentIdx = n - 1; // most recent bucket

  // How many labels to actually show so they never overlap.
  const labelEvery = n <= 7 ? 1 : n <= 12 ? 1 : n <= 24 ? 4 : 5;

  return (
    <View>
      {/* scale caption + gridline at the top of the plot */}
      <View style={styles.scaleRow}>
        <Text style={styles.scaleText}>{round(max)} {unit}</Text>
      </View>
      <View style={styles.gridline} />

      <View style={[styles.plot, { height: CHART_HEIGHT }]}>
        {buckets.map((b, i) => {
          const v = values[i];
          const h = Math.round((v / max) * (CHART_HEIGHT - 30));
          const isPeak = i === maxIdx && v > 0;
          const isCurrent = i === currentIdx;
          const fill = v <= 0
            ? "rgba(255,255,255,0.06)"
            : isCurrent
              ? colors.gold
              : colors.blue2;
          return (
            <View key={i} style={styles.col}>
              {isPeak && (
                <Text style={styles.topVal} numberOfLines={1} allowFontScaling={false}>{round(v)}</Text>
              )}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(v > 0 ? 5 : 3, h), backgroundColor: fill },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* baseline */}
      <View style={styles.baseline} />

      {/* x-axis labels, thinned + compacted so nothing is clipped */}
      <View style={styles.axis}>
        {buckets.map((b, i) => {
          const show = i % labelEvery === 0 || i === currentIdx;
          return (
            <View key={i} style={styles.axisCol}>
              <Text
                style={[styles.axisLabel, i === currentIdx && styles.axisLabelCurrent]}
                numberOfLines={1}
              >
                {show ? compactLabel(b.label, n) : ""}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const round = (x) => (Number.isInteger(x) ? x : Math.round(x * 10) / 10);

const styles = StyleSheet.create({
  scaleRow: { flexDirection: "row", justifyContent: "flex-end" },
  scaleText: { fontFamily: body.medium, fontSize: 10.5, color: colors.text3 },
  gridline: {
    height: 1,
    backgroundColor: "rgba(225,235,250,0.08)",
    marginTop: 4,
    marginBottom: -1,
  },
  plot: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 3,
  },
  col: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" },
  barTrack: { width: "100%", alignItems: "center", justifyContent: "flex-end", flex: 1 },
  bar: { width: "70%", maxWidth: 24, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderRadius: 4 },
  topVal: { fontFamily: disp.bold, fontSize: 11, color: colors.text, marginBottom: 5, minWidth: 30, textAlign: "center" },
  baseline: { height: 1, backgroundColor: colors.cardLine, marginTop: 0 },
  axis: { flexDirection: "row", marginTop: 8 },
  axisCol: { flex: 1, alignItems: "center" },
  axisLabel: { fontFamily: body.medium, fontSize: 10.5, color: colors.text3, textAlign: "center" },
  axisLabelCurrent: { color: colors.gold, fontFamily: body.semibold },
});