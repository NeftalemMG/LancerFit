import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { colors, radius } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { Card, PressScale, ScreenHeader } from "../components/ui";
import { fetchLoggedExercises } from "../services/statsApi";
import { useRealtime } from "../services/realtime";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export default function StatsScreen({ navigation }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { const list = await fetchLoggedExercises(); setExercises(list); }
    catch { setExercises([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRealtime("exercise:logged", useCallback(() => load(), [load]));

  return (
    <View style={styles.root}>
      <ScreenHeader title="Your stats" subtitle="Every exercise you've logged" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.blue2} />}>
        {loading && exercises.length === 0 ? (
          <ActivityIndicator color={colors.blue2} style={{ marginTop: 40 }} />
        ) : exercises.length === 0 ? (
          <Card style={styles.empty}><Text style={styles.emptyText}>Log an activity to start building your stats.</Text></Card>
        ) : (
          exercises.map((ex) => (
            <PressScale key={ex.exerciseKey}
              onPress={() => navigation.navigate("ExerciseStats", { exerciseKey: ex.exerciseKey, exerciseName: ex.exerciseName })}>
              <Card style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{ex.exerciseName}</Text>
                  <Text style={styles.meta}>{ex.sessionCount} session{ex.sessionCount === 1 ? "" : "s"} · last {formatDate(ex.lastPerformedAt)}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Card>
            </PressScale>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  body: { paddingHorizontal: 18, paddingBottom: 40, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", padding: 16 },
  name: { fontFamily: disp.semibold, fontSize: 16, color: colors.text },
  meta: { fontFamily: body.regular, fontSize: 12, color: colors.text3, marginTop: 3 },
  chevron: { fontFamily: disp.regular, fontSize: 24, color: colors.text3, marginLeft: 8 },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { fontFamily: body.regular, color: colors.text3, fontSize: 13, textAlign: "center" },
});