// StatTiles — the Total / Avg / Sessions summary row beneath the chart.
// Restyled to sit with the redesigned per-activity page: slightly larger
// numbers with tabular figures, a gold accent on the leading "Total" tile so
// the eye lands on the headline stat, and consistent radii with the hero card.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../../theme/tokens";
import { disp, body } from "../../theme/typography";

function Tile({ label, value, sub, accent }) {
  return (
    <View style={[styles.tile, accent && styles.tileAccent]}>
      <View style={styles.valueRow}>
        <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
        {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export default function StatTiles({ totals, unitLabel = "min", metric = "duration" }) {
  if (!totals) return null;
  const total = metric === "quantity" ? totals.totalQuantity : totals.totalDuration;
  const avg = metric === "quantity" ? totals.avgQuantityPerSession : totals.avgDurationPerSession;
  return (
    <View style={styles.row}>
      <Tile label="Total" value={round(total)} sub={unitLabel} accent />
      <Tile label="Avg / session" value={round(avg)} sub={unitLabel} />
      <Tile label="Sessions" value={totals.sessionCount} />
    </View>
  );
}

const round = (n) => (Number.isInteger(n) ? n : Math.round((n + Number.EPSILON) * 10) / 10);

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardLine,
    paddingVertical: 15,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  tileAccent: { backgroundColor: colors.goldSoft, borderColor: colors.goldLine },
  valueRow: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  value: { fontFamily: disp.bold, fontSize: 24, color: colors.text, fontVariant: ["tabular-nums"], letterSpacing: -0.5 },
  valueAccent: { color: colors.gold },
  sub: { fontFamily: body.regular, fontSize: 10, color: colors.text3, paddingBottom: 3 },
  label: { fontFamily: body.medium, fontSize: 11, color: colors.text2, marginTop: 5, textAlign: "center" },
});