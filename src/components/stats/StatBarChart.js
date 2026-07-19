// StatBarChart — Apple-Health-style bars with LancerFit accents.
//
// Rebuilt to fix the problems visible in the old per-activity page:
//   • Truncated axis labels ("J..", "1..") — labels are now shortened to a
//     stable compact form (single letter for months, day-of-month for month
//     range) BEFORE render, and thinned so they never collide, instead of being
//     clipped mid-word by numberOfLines.
//   • Flat, cramped look — added a faint max-value gridline with a right-aligned
//     scale caption, rounded gold-tinted bars, and generous spacing.
//   • The most-recent (current) bucket is highlighted in gold so "now" reads at
//     a glance; the peak bucket shows its value on top.
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
// Compact, non-colliding axis label for a bucket, given the range size.
// The backend sends: day -> "9:00" hourly, week -> "Mon", month -> "Jul 4",
// year -> "Jul". We shorten so labels never truncate mid-token (which produced
// the old "0…", "4…", "2…" artifacts):
//   • day   -> just the hour number ("9", "13") — no ":00" suffix
//   • month -> day-of-month only ("4", "14")
//   • year  -> 3-letter month, kept whole ("Jan")
//   • week  -> weekday, kept whole ("Mon")
function compactLabel(raw, n) {
  if (raw == null) return "";
  const str = String(raw).trim();
  if (n === 24) {
    // "9:00" -> "9"; keep just the hour so it fits one narrow column.
    const h = str.split(":")[0];
    return h;
  }
  if (n === 30) {
    // "Jul 4" -> "4" (day-of-month only); if no space, use as-is.
    const parts = str.split(/\s+/);
    return parts.length > 1 ? parts[parts.length - 1] : str;
  }
  return str; // year (3-letter month) and week (weekday) already fit.
}

export default function StatBarChart({ buckets = [], metric = "totalDuration", unit = "min" }) {
  const n = buckets.length || 1;
  const values = buckets.map((b) => Number(b?.[metric] ?? 0));
  const max = Math.max(1, ...values);
  const maxIdx = values.indexOf(Math.max(...values));
  const currentIdx = n - 1; // most recent bucket

  // How many labels to actually show so they never overlap. We aim for at most
  // ~10 labels for dense ranges and space them evenly, so a 28/29/30/31-day
  // month (or 24-hour day) shows a clean, uncluttered axis while every bar is
  // still drawn. First and last buckets always get a label.
  const targetLabels = 10;
  const labelEvery = n <= 7 ? 1 : n <= 12 ? 1 : Math.max(1, Math.ceil(n / targetLabels));

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
          // Show evenly-spaced labels plus the first and the current (last)
          // bucket. Suppress a regular label if it lands right next to the
          // forced last one, so they don't collide.
          const isEdge = i === 0 || i === currentIdx;
          const onGrid = i % labelEvery === 0;
          const tooCloseToEnd = currentIdx - i > 0 && currentIdx - i < labelEvery;
          const show = isEdge || (onGrid && !tooCloseToEnd);
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