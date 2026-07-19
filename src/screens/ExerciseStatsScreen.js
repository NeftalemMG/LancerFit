// Per-activity stats — full redesign (hybrid Apple-Health layout, LancerFit
// gold/navy accents). Layout top to bottom:
//   • Gold text-only back button + GlassTitle header (consistent with the app).
//   • D/W/M/Y range selector with a gold active pill.
//   • A big hero metric card (total for the selected range + session count).
//   • A clean chart card: bars with a max-value gridline, current bucket in
//     gold, peak value labelled; then the Total / Avg / Sessions tiles.
//   • Pin-to-home toggle.
//
// All numbers are REAL — buckets and totals come from the backend
// /stats/exercise/:key endpoint and refresh live when a new session for this
// exercise is logged. Empty ranges render an honest empty state, never mock.

import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { PressScale } from "../components/ui";
import GlassTitle from "../components/GlassTitle";
import { ChevronLeft } from "../components/icons";
import RangeSelector from "../components/stats/RangeSelector";
import StatBarChart from "../components/stats/StatBarChart";
import StatTiles from "../components/stats/StatTiles";
import StatHeroMetric from "../components/stats/StatHeroMetric";
import { fetchExerciseStats } from "../services/statsApi";
import { loadPinned, togglePinned } from "../services/pinStore";
import { useRealtime } from "../services/realtime";

const RANGE_LABEL = { day: "Today, by hour", week: "Last 7 days", month: "Last 30 days", year: "Last 12 months" };
const RANGE_CAPTION = { day: "Today", week: "This week", month: "This month", year: "This year" };

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
  const heroValue = hasData ? (metric === "quantity" ? data.totals.totalQuantity : data.totals.totalDuration) : 0;

  return (
    <View style={styles.root}>
      {/* Gold text-only back button (no pill), consistent with the app's
          golden header accents. */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top - 12, 4) }]}>
        <Pressable onPress={goBack} hitSlop={12} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
          <ChevronLeft size={16} color={colors.gold} strokeWidth={2.8} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.titleWrap}>
          <GlassTitle title={data?.exerciseName || exerciseName || "Exercise"} subtitle="Your history" />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <RangeSelector value={range} onChange={setRange} />

        {loading ? (
          <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
        ) : hasData ? (
          <>
            <StatHeroMetric
              value={heroValue}
              unit={unit}
              caption={RANGE_CAPTION[range]}
              sessions={data.totals.sessionCount}
            />

            <View style={styles.chartCard}>
              <Text style={styles.chartCaption}>{RANGE_LABEL[range]}</Text>
              <StatBarChart buckets={data.buckets} metric={chartMetric} unit={unit} />
            </View>

            <StatTiles totals={data.totals} unitLabel={unit} metric={metric} />
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing logged {range === "day" ? "today" : `in the ${range}`}</Text>
            <Text style={styles.emptyText}>
              Log a {(data?.exerciseName || exerciseName || "session").toLowerCase()} session and it shows up here across day, week, month, and year.
            </Text>
          </View>
        )}

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
  header: { paddingHorizontal: 18, paddingBottom: 10 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 3, alignSelf: "flex-start", paddingVertical: 6, minHeight: 34 },
  backText: { fontFamily: disp.bold, fontSize: 15, color: colors.gold, letterSpacing: -0.2 },
  titleWrap: { marginTop: 10 },

  body: { paddingHorizontal: 18, paddingTop: 14, gap: 14 },
  center: { height: 220, alignItems: "center", justifyContent: "center" },

  chartCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardLine,
    padding: 18,
  },
  chartCaption: { fontFamily: body.semibold, fontSize: 12.5, color: colors.text2, marginBottom: 14 },

  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardLine,
    paddingVertical: 34,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  emptyTitle: { fontFamily: disp.bold, fontSize: 17, color: colors.text, textAlign: "center" },
  emptyText: { fontFamily: body.regular, fontSize: 13.5, lineHeight: 20, color: colors.text3, textAlign: "center", marginTop: 8 },

  pinBtn: { marginTop: 4, paddingVertical: 15, borderRadius: radius.md, alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLine },
  pinBtnActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldLine },
  pinText: { fontFamily: body.semibold, color: colors.text2, fontSize: 14.5 },
  pinTextActive: { color: colors.gold },
});