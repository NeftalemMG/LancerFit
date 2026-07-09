import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../../theme/tokens";
import { disp, body } from "../../theme/typography";

function Tile({ label, value, sub }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.value}>{value}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
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
      <Tile label="Total" value={round(total)} sub={unitLabel} />
      <Tile label="Avg / session" value={round(avg)} sub={unitLabel} />
      <Tile label="Sessions" value={totals.sessionCount} />
    </View>
  );
}

const round = (n) => (Number.isInteger(n) ? n : Math.round((n + Number.EPSILON) * 10) / 10);

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.cardLine, paddingVertical: 14, paddingHorizontal: 10, alignItems: "center" },
  value: { fontFamily: disp.bold, fontSize: 22, color: colors.text, fontVariant: ["tabular-nums"] },
  sub: { fontFamily: body.regular, fontSize: 10, color: colors.text3, marginTop: 1 },
  label: { fontFamily: body.medium, fontSize: 11, color: colors.text2, marginTop: 4, textAlign: "center" },
});