// Full-screen Apple-Health-style breakdown for ONE exercise. Gold back button,
// roomy D/W/M/Y control, aligned bar chart, total/avg/session tiles, pin toggle.
// Refreshes live when a new session for this exercise is logged.

import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { Card, PressScale } from "../components/ui";
import GoldBackHeader from "../components/GoldBackHeader";
import RangeSelector from "../components/stats/RangeSelector";
import StatBarChart from "../components/stats/StatBarChart";
import StatTiles from "../components/stats/StatTiles";
import { fetchExerciseStats } from "../services/statsApi";
import { loadPinned, togglePinned } from "../services/pinStore";
import { useRealtime } from "../services/realtime";

const RANGE_LABEL = { day: "Today, by hour", week: "Last 7 days", month: "Last 30 days", year: "Last 12 months" };

export default function ExerciseStatsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { exerciseKey, exerciseName } = route.params || {};
  const [range, setRange] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinned, setPinned] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await fetchExerciseStats(exerciseKey, range)); }
    catch { setData(null); }
    finally { setLoading(false); }
  }, [exerciseKey, range]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadPinned().then((keys) => setPinned(keys.includes(exerciseKey))); }, [exerciseKey]);
  useRealtime("exercise:logged", useCallback((p) => { if (p?.exerciseKey === exerciseKey) load(); }, [exerciseKey, load]));

  const onTogglePin = async () => {
    const next = await togglePinned(exerciseKey);
    setPinned(next.includes(exerciseKey));
  };

  const goBack = () => (navigation?.canGoBack?.() ? navigation.goBack() : navigation?.navigate?.("home"));

  const unit = data?.unit || "min";
  const metric = unit === "min" ? "duration" : "quantity";
  const chartMetric = metric === "quantity" ? "totalQuantity" : "totalDuration";
  const hasData = data && data.totals && data.totals.sessionCount > 0;

  return (
    <View style={styles.root}>
      <GoldBackHeader title={data?.exerciseName || exerciseName || "Exercise"} subtitle="Your history" onBack={goBack} />

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <RangeSelector value={range} onChange={setRange} />
        <Text style={styles.rangeCaption}>{RANGE_LABEL[range]}</Text>

        <Card style={styles.chartCard}>
          {loading ? (
            <View style={styles.center}><ActivityIndicator color={colors.blue2} /></View>
          ) : hasData ? (
            <>
              <StatBarChart buckets={data.buckets} metric={chartMetric} unit={unit} />
              <View style={styles.divider} />
              <StatTiles totals={data.totals} unitLabel={unit} metric={metric} />
            </>
          ) : (
            <View style={styles.center}><Text style={styles.emptyText}>No sessions logged in this range.</Text></View>
          )}
        </Card>

        <PressScale onPress={onTogglePin}>
          <View style={[styles.pinBtn, pinned && styles.pinBtnActive]}>
            <Text style={[styles.pinText, pinned && styles.pinTextActive]}>{pinned ? "✓  Pinned to home" : "Pin to home"}</Text>
          </View>
        </PressScale>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  body: { paddingHorizontal: 18, paddingTop: 14, gap: 14 },
  rangeCaption: { fontFamily: body.medium, fontSize: 13, color: colors.text3, marginTop: 2, marginLeft: 2 },
  chartCard: { padding: 18 },
  center: { height: 200, alignItems: "center", justifyContent: "center" },
  divider: { height: 18 },
  emptyText: { fontFamily: body.regular, color: colors.text3, fontSize: 14 },
  pinBtn: { marginTop: 4, paddingVertical: 15, borderRadius: radius.md, alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLine },
  pinBtnActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldLine },
  pinText: { fontFamily: body.semibold, color: colors.text2, fontSize: 14.5 },
  pinTextActive: { color: colors.gold },
});