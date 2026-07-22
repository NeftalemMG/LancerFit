// Pinned exercise stats on the Home page. Rebuilt so it can never crush its text:
// tiles are a FIXED width in a horizontal scroller (not a wrapping grid that
// squeezes them to a sliver). Each tile shows the week total for a pinned
// exercise. Tap a tile to open its full breakdown; tap "See all" for the hub.

import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius } from "../../theme/tokens";
import { disp, body } from "../../theme/typography";
import { Card, PressScale, SectionRow } from "../ui";
import { loadPinned } from "../../services/pinStore";
import { fetchExerciseStats } from "../../services/statsApi";
import { useRealtime } from "../../services/realtime";

const round = (n) => (Number.isInteger(n) ? n : Math.round((n + Number.EPSILON) * 10) / 10);

function PinnedTile({ item, onPress }) {
  return (
    <PressScale onPress={onPress} style={styles.tileWrap}>
      <View style={styles.tile}>
        <View style={styles.tileValueRow}>
          <Text style={styles.tileValue}>{round(item.total)}</Text>
          <Text style={styles.tileUnit}>{item.unit}</Text>
        </View>
        <Text style={styles.tileName} numberOfLines={1}>{item.exerciseName}</Text>
        <Text style={styles.tileMeta}>this week</Text>
      </View>
    </PressScale>
  );
}

export default function HomeStatsWidget({ navigation }) {
  const [tiles, setTiles] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const keys = await loadPinned();
    if (!keys || keys.length === 0) { setTiles([]); setLoaded(true); return; }
    try {
      // Each pinned exercise is fetched INDEPENDENTLY. Previously this used
      // Promise.all inside a try/catch that did setTiles([]) — so a single
      // failing request (offline blip, one exercise with no data yet, a 500)
      // rejected the whole batch and blanked every pinned tile, even though the
      // pins were still saved in AsyncStorage. That's why pins "disappeared"
      // from Home but reappeared after re-pinning. allSettled keeps the tiles
      // that succeeded and simply drops the ones that failed.
      const settled = await Promise.allSettled(
        keys.map(async (key) => {
          const s = await fetchExerciseStats(key, "week");
          const total = s.unit === "min" ? s.totals.totalDuration : s.totals.totalQuantity;
          return { exerciseKey: key, exerciseName: s.exerciseName, unit: s.unit, total };
        }),
      );
      const results = settled
        .filter((r) => r.status === "fulfilled" && r.value)
        .map((r) => r.value);

      // Only replace the visible tiles when we actually resolved something.
      // If every request failed (e.g. the phone is briefly offline), keep what
      // is already on screen rather than flashing an empty state.
      setTiles((prev) => (results.length > 0 ? results : prev));
    } catch {
      // Never wipe the row on an unexpected error — keep the last good tiles.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRealtime("exercise:logged", useCallback(() => load(), [load]));
  // Reload every time Home regains focus — this catches BOTH newly logged
  // activities and newly pinned exercises (pinning happens on another screen and
  // emits no socket event), so the widget updates without needing an app restart.
  useFocusEffect(useCallback(() => { load(); }, [load]));

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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroller}
        >
          {tiles.map((t) => (
            <PinnedTile
              key={t.exerciseKey}
              item={t}
              onPress={() =>
                navigation.navigate("ExerciseStats", { exerciseKey: t.exerciseKey, exerciseName: t.exerciseName })
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  scroller: { gap: 12, paddingRight: 4, paddingVertical: 2 },
  tileWrap: { width: 148 },
  tile: {
    width: 148,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardLine,
    padding: 16,
  },
  tileValueRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  tileValue: { fontFamily: disp.bold, fontSize: 30, color: colors.text, letterSpacing: -1 },
  tileUnit: { fontFamily: body.regular, fontSize: 13, color: colors.text3, paddingBottom: 5 },
  tileName: { fontFamily: disp.semibold, fontSize: 15, color: colors.text2, marginTop: 8 },
  tileMeta: { fontFamily: body.regular, fontSize: 12, color: colors.text3, marginTop: 2 },
  emptyCard: { padding: 18 },
  emptyText: { fontFamily: body.regular, fontSize: 13, color: colors.text3 },
});