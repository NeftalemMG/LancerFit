// Ranks tab. Two tabs
// Faculty + Campus. EVERYTHING is dynamic from the backend —
// names, XP, faculty colors, per-person avatars and flags all come from live
// data. Faculties rank by AVERAGE XP per member; campus by individual XP.

import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, Pressable, Animated, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/tokens";
import { disp } from "../theme/typography";
import GlassTitle from "../components/GlassTitle";
import DynamicLeaderboardBoard from "../components/DynamicLeaderboardBoard";
import { themeForFaculty } from "../data/facultyTheme";
import { useRealtime } from "../services/realtime";
import { fetchFacultyLeaderboard, fetchCampusLeaderboard } from "../services/leaderboardApi";

const TABS = ["faculty", "campus"];
const TAB_LABELS = { faculty: "Faculty", campus: "Campus" };

function TabSwitcher({ tab, setTab }) {
  const [segWidth, setSegWidth] = useState(0);
  const pillX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const idx = TABS.indexOf(tab);
    const unit = segWidth ? (segWidth - 8) / TABS.length : 0;
    Animated.spring(pillX, { toValue: idx * unit, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  }, [tab, segWidth, pillX]);

  return (
    <View style={styles.seg} onLayout={(e) => setSegWidth(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.segPill, { width: segWidth ? (segWidth - 8) / TABS.length : 0, transform: [{ translateX: pillX }] }]}>
        <LinearGradient colors={[colors.gold, colors.goldDim]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {TABS.map((t) => (
        <Pressable key={t} style={styles.segBtn} onPress={() => setTab(t)}>
          <Text style={[styles.segText, tab === t && { color: "#2A1E04" }]}>{TAB_LABELS[t]}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function LeaderboardScreen() {
  const [tab, setTab] = useState("faculty");
  const [faculty, setFaculty] = useState([]);
  const [campus, setCampus] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, c] = await Promise.all([fetchFacultyLeaderboard(), fetchCampusLeaderboard(50)]);
      // Faculty rows -> normalized board shape (grouped).
      setFaculty(
        (Array.isArray(f) ? f : []).map((r) => ({
          key: r.facultyKey || r.faculty,
          name: themeForFaculty(r.facultyKey).name || r.faculty,
          xp: r.avgXp,
          facultyKey: r.facultyKey,
          sub: `${r.members} member${r.members === 1 ? "" : "s"}`,
          rank: r.rank,
        })),
      );
      // Campus rows -> normalized board shape (individuals).
      setCampus(
        (Array.isArray(c) ? c : []).map((r) => ({
          key: String(r.userId),
          name: r.name || "Lancer",
          xp: r.xp,
          facultyKey: r.facultyKey,
          flagCode: r.nationality,
          level: 1,
          sub: themeForFaculty(r.facultyKey).name || r.faculty || "—",
          rank: r.rank,
        })),
      );
    } catch {
      setFaculty([]); setCampus([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRealtime("exercise:logged", useCallback(() => load(), [load]));
  useRealtime("validation:decided", useCallback(() => load(), [load]));
  useRealtime("checkin:done", useCallback(() => load(), [load]));

  const data = tab === "faculty" ? faculty : campus;

  return (
    <View style={styles.root}>
      <View style={styles.glassHeader}>
        <GlassTitle title="Leaderboard" subtitle="Where you and your faculty stand" />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.gold} />}
      >
        <TabSwitcher tab={tab} setTab={setTab} />
        {tab === "faculty" && <Text style={styles.hint}>Ranked by average XP per member</Text>}

        {loading && data.length === 0 ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
        ) : (
          <DynamicLeaderboardBoard data={data} grouped={tab === "faculty"} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  glassHeader: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  body: { paddingHorizontal: 20, paddingBottom: 120 },
  hint: { fontFamily: disp.semibold, fontSize: 12, color: colors.text3, marginTop: 12, marginLeft: 2, textAlign: "center" },
  seg: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: colors.cardLine, marginTop: 6 },
  segPill: { position: "absolute", top: 4, bottom: 4, left: 4, borderRadius: 11, overflow: "hidden" },
  segBtn: { flex: 1, paddingVertical: 11, alignItems: "center", justifyContent: "center", zIndex: 1 },
  segText: { fontFamily: disp.semibold, fontSize: 14, color: colors.text2 },
});