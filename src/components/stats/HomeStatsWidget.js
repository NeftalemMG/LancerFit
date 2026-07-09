// src/components/stats/HomeStatsWidget.js
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../../theme/tokens";
import { disp, body } from "../../theme/typography";
import { Card, PressScale, SectionRow } from "../ui";
import { loadPinned } from "../../services/pinStore";
import { fetchExerciseStats } from "../../services/statsApi";
import { useRealtime } from "../../services/realtime";

function PinnedTile({ item, onPress }) {
  return (
    <PressScale onPress={onPress} style={styles.tileWrap}>
      <Card style={styles.tile}>
        <Text style={styles.tileValue}>{round(item.total)}<Text style={styles.tileUnit}> {item.unit}</Text></Text>
        <Text style={styles.tileName} numberOfLines={1}>{item.exerciseName}</Text>
        <Text style={styles.tileMeta}>this week</Text>
      </Card>
    </PressScale>
  );
}
const round = (n) => (Number.isInteger(n) ? n : Math.round((n + Number.EPSILON) * 10) / 10);

export default function HomeStatsWidget({ navigation }) {
  const [tiles, setTiles] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const keys = await loadPinned();
    if (keys.length === 0) { setTiles([]); setLoaded(true); return; }
    try {
      const results = await Promise.all(keys.map(async (key) => {
        const s = await fetchExerciseStats(key, "week");
        const metricTotal = s.unit === "min" ? s.totals.totalDuration : s.totals.totalQuantity;
        return { exerciseKey: key, exerciseName: s.exerciseName, unit: s.unit, total: metricTotal };
      }));
      setTiles(results);
    } catch { setTiles([]); }
    finally { setLoaded(true); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRealtime("exercise:logged", useCallback(() => load(), [load]));

  const goAll = () => navigation.navigate("Stats");

  return (
    <View style={styles.wrap}>
      <SectionRow title="Your stats" action="See all" onAction={goAll} />
      {!loaded ? null : tiles.length === 0 ? (
        <PressScale onPress={goAll}>
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Pin an exercise to see its weekly stats here.</Text>
          </Card>
        </PressScale>
      ) : (
        <View style={styles.grid}>
          {tiles.map((t) => (
            <PinnedTile key={t.exerciseKey} item={t}
              onPress={() => navigation.navigate("ExerciseStats", { exerciseKey: t.exerciseKey, exerciseName: t.exerciseName })} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tileWrap: { width: "48%" },
  tile: { padding: 14 },
  tileValue: { fontFamily: disp.bold, fontSize: 24, color: colors.text, fontVariant: ["tabular-nums"] },
  tileUnit: { fontFamily: body.regular, fontSize: 12, color: colors.text3 },
  tileName: { fontFamily: disp.semibold, fontSize: 14, color: colors.text2, marginTop: 4 },
  tileMeta: { fontFamily: body.regular, fontSize: 11, color: colors.text3, marginTop: 1 },
  emptyCard: { padding: 18 },
  emptyText: { fontFamily: body.regular, fontSize: 13, color: colors.text3 },
});