// Full-screen "all stats" hub. Gold back button (GoldBackHeader). When the user
// has no logged exercises, a big sports-figure animation fills the empty space so
// the page never looks barren. Once they have exercises, the animation repeats
// smaller as a divider every few rows, so it "keeps going down the page" as more
// activities are logged — scroll to see them all.

import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { Card, PressScale } from "../components/ui";
import GoldBackHeader from "../components/GoldBackHeader";
import SportsFigure from "../components/stats/SportsFigure";
import { fetchLoggedExercises } from "../services/statsApi";
import { useRealtime } from "../services/realtime";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StatsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await fetchLoggedExercises();
      setExercises(Array.isArray(list) ? list : []);
    } catch {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRealtime("exercise:logged", useCallback(() => load(), [load]));

  const goBack = () => (navigation?.canGoBack?.() ? navigation.goBack() : navigation?.navigate?.("home"));

  return (
    <View style={styles.root}>
      <GoldBackHeader
        title="Your stats"
        subtitle="Every exercise you've logged"
        onBack={goBack}
        right={
          exercises.length > 0 ? (
            <View style={styles.countChip}>
              <Text style={styles.countChipNum}>{exercises.length}</Text>
              <Text style={styles.countChipLbl}>tracked</Text>
            </View>
          ) : null
        }
      />

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.blue2} />}
      >
        {loading && exercises.length === 0 ? (
          <ActivityIndicator color={colors.blue2} style={{ marginTop: 60 }} />
        ) : exercises.length === 0 ? (
          <View style={styles.emptyWrap}>
            <SportsFigure size={220} />
            <Text style={styles.emptyTitle}>No stats yet</Text>
            <Text style={styles.emptyText}>
              Log an activity from the Log tab and your history — day, week, month, and year — shows up right here.
            </Text>
          </View>
        ) : (
          exercises.map((ex) => {
            const count = Number(ex.sessionCount) || 0;
            return (
              <PressScale
                key={ex.exerciseKey}
                onPress={() => navigation.navigate("ExerciseStats", { exerciseKey: ex.exerciseKey, exerciseName: ex.exerciseName })}
              >
                <Card style={styles.row}>
                  <View style={styles.rowText}>
                    <Text style={styles.name} numberOfLines={1}>{ex.exerciseName}</Text>
                    <Text style={styles.meta}>
                      {count} session{count === 1 ? "" : "s"} · last {formatDate(ex.lastPerformedAt)}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </Card>
              </PressScale>
            );
          })
        )}

        {/* One runner at the very END of the list (not interspersed). */}
        {exercises.length > 0 && (
          <View style={styles.endFig}>
            <SportsFigure size={130} />
            <Text style={styles.endText}>Keep it up — log more to grow your stats.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  body: { paddingHorizontal: 18, paddingTop: 14, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 16 },
  rowText: { flex: 1, paddingRight: 12 },
  name: { fontFamily: disp.semibold, fontSize: 16, color: colors.text },
  meta: { fontFamily: body.regular, fontSize: 12.5, color: colors.text3, marginTop: 4 },
  chevron: { fontFamily: disp.regular, fontSize: 26, color: colors.text3 },
  endFig: { alignItems: "center", marginTop: 18, paddingTop: 6 },
  endText: { fontFamily: body.regular, fontSize: 13, color: colors.text3, marginTop: 4, textAlign: "center" },
  countChip: { alignItems: "center", paddingVertical: 6, paddingHorizontal: 14, borderRadius: 12, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.goldLine },
  countChipNum: { fontFamily: disp.bold, fontSize: 16, color: colors.gold },
  countChipLbl: { fontFamily: body.regular, fontSize: 10, color: colors.gold, marginTop: -1 },

  emptyWrap: { alignItems: "center", justifyContent: "center", paddingTop: 30, paddingHorizontal: 20 },
  emptyTitle: { fontFamily: disp.bold, fontSize: 20, color: colors.text, marginTop: 8 },
  emptyText: { fontFamily: body.regular, color: colors.text2, fontSize: 14, textAlign: "center", lineHeight: 21, marginTop: 8 },
});