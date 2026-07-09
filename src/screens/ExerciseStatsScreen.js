import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { colors, radius } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { Card, PressScale, ScreenHeader } from "../components/ui";
import RangeSelector from "../components/stats/RangeSelector";
import StatBarChart from "../components/stats/StatBarChart";
import StatTiles from "../components/stats/StatTiles";
import { fetchExerciseStats } from "../services/statsApi";
import { loadPinned, togglePinned } from "../services/pinStore";
import { useRealtime } from "../services/realtime";

export default function ExerciseStatsScreen({ route }) {
  const { exerciseKey, exerciseName } = route.params || {};
  const [range, setRange] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinned, setPinned] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await fetchExerciseStats(exerciseKey, range); setData(res); }
    catch { setData(null); }
    finally { setLoading(false); }
  }, [exerciseKey, range]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadPinned().then((keys) => setPinned(keys.includes(exerciseKey))); }, [exerciseKey]);
  useRealtime("exercise:logged", useCallback((payload) => { if (payload?.exerciseKey === exerciseKey) load(); }, [exerciseKey, load]));

  const onTogglePin = async () => {
    const next = await togglePinned(exerciseKey);
    setPinned(next.includes(exerciseKey));
  };

  const unit = data?.unit || "min";
  const metric = unit === "min" ? "duration" : "quantity";
  const chartMetric = metric === "quantity" ? "totalQuantity" : "totalDuration";

  return (
    <View style={styles.root}>
      <ScreenHeader title={data?.exerciseName || exerciseName || "Exercise"} subtitle="Your history" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <RangeSelector value={range} onChange={setRange} />
        <Card style={styles.chartCard}>
          {loading ? (
            <ActivityIndicator color={colors.blue2} style={{ height: 180 }} />
          ) : data && data.totals.sessionCount > 0 ? (
            <>
              <StatBarChart buckets={data.buckets} metric={chartMetric} unitLabel={unit} />
              <View style={{ height: 14 }} />
              <StatTiles totals={data.totals} unitLabel={unit} metric={metric} />
            </>
          ) : (
            <View style={styles.empty}><Text style={styles.emptyText}>No sessions logged in this range yet.</Text></View>
          )}
        </Card>
        <PressScale onPress={onTogglePin} style={styles.pinWrap}>
          <View style={[styles.pinBtn, pinned && styles.pinBtnActive]}>
            <Text style={[styles.pinText, pinned && styles.pinTextActive]}>{pinned ? "Pinned to home ✓" : "Pin to home"}</Text>
          </View>
        </PressScale>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  body: { paddingHorizontal: 18, paddingBottom: 40, gap: 14 },
  chartCard: { padding: 16 },
  empty: { height: 180, alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: body.regular, color: colors.text3, fontSize: 13 },
  pinWrap: { marginTop: 4 },
  pinBtn: { paddingVertical: 14, borderRadius: radius.md, alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLine },
  pinBtnActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldLine },
  pinText: { fontFamily: body.semibold, color: colors.text2, fontSize: 14 },
  pinTextActive: { color: colors.gold },
});