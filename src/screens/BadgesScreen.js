import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { useApp } from "../context/AppContext";
import Badge from "../components/Badge";
import { Card, PressScale } from "../components/ui";
import { ChevronLeft } from "../components/icons";
import BadgeSheet from "../components/BadgeSheet";

const SECTIONS = [
  { key: "challenge", label: "Challenge Badges",   filter: (b) => b.type === "challenge_position" },
  { key: "activity",  label: "Activity Badges",    filter: (b) => b.type?.startsWith("exercise_") || b.type?.startsWith("activity_") },
  { key: "quest",     label: "Daily Quest Badges", filter: (b) => b.type?.startsWith("quest_") },
  { key: "specialty", label: "Specialty",          filter: (b) => b.type === "specialty" },
];

function BadgeSection({ label, badges, openSheet }) {
  if (!badges.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.grid}>
        {badges.map((b) => (
          <PressScale
            key={b.badgeId}
            onPress={() => openSheet(<BadgeSheet badge={b} />)}
            wrapStyle={styles.cellWrap}
          >
            <Card style={[styles.cell, !b.isEarned && { opacity: 0.5 }]}>
              <Badge badge={b} size={58} />
              <Text
                style={[styles.bn, !b.isEarned && { color: colors.text3 }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {b.name}
              </Text>
            </Card>
          </PressScale>
        ))}
      </View>
    </View>
  );
}

export default function BadgesScreen({ navigation }) {
  const { displayBadges, loadMyBadges, openSheet } = useApp();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const earned = displayBadges.filter((b) => b.isEarned).length;
  const total  = displayBadges.length;
  const loading = total === 0;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadMyBadges();
    setRefreshing(false);
  }, [loadMyBadges]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        {
          paddingTop: Math.max(insets.top - 6, 6),
          paddingBottom: insets.bottom + 124,
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.gold}
        />
      }
    >
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={12}
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
      >
        <ChevronLeft size={16} color={colors.gold} strokeWidth={2.8} />
        <Text style={styles.backText}>Profile</Text>
      </Pressable>

      <View style={{ paddingBottom: 16 }}>
        <Text style={styles.h1}>Badges</Text>
        <Text style={styles.sub}>
          Unlock milestones as you train. Tap any badge to see how it's earned.
        </Text>
      </View>

      <View style={styles.bstats}>
        <Card style={styles.bstat}>
          <Text style={[styles.bstatV, { color: colors.gold }]}>{earned}</Text>
          <Text style={styles.bstatK}>Earned</Text>
        </Card>
        <Card style={styles.bstat}>
          <Text style={[styles.bstatV, { color: colors.blue2 }]}>{total}</Text>
          <Text style={styles.bstatK}>Total</Text>
        </Card>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        SECTIONS.map((s) => (
          <BadgeSection
            key={s.key}
            label={s.label}
            badges={displayBadges.filter(s.filter)}
            openSheet={openSheet}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-start",
    paddingVertical: 6,
    marginBottom: 8,
  },
  backText: { fontFamily: disp.bold, fontSize: 15, color: colors.gold, letterSpacing: -0.2 },
  h1: { fontFamily: disp.bold, fontSize: 27, letterSpacing: -0.5, color: colors.text },
  sub: { marginTop: 7, color: colors.text2, fontSize: 14, lineHeight: 20, fontFamily: body.regular },

  bstats: { flexDirection: "row", gap: 10, marginBottom: 6 },
  bstat: { flex: 1, paddingVertical: 16, paddingHorizontal: 12, borderRadius: radius.md, alignItems: "center" },
  bstatV: { fontFamily: disp.bold, fontSize: 24, color: colors.text },
  bstatK: { marginTop: 6, fontFamily: body.medium, fontSize: 11, color: colors.text2 },

  loader: { flex: 1, paddingTop: 60, alignItems: "center" },

  section: { marginTop: 22 },
  sectionLabel: {
    fontFamily: disp.bold,
    fontSize: 11,
    letterSpacing: 0.1,
    color: colors.text2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 11,
  },
  cellWrap: { width: "31.5%" },
  cell: {
    alignItems: "center",
    gap: 9,
    paddingTop: 16,
    paddingBottom: 13,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    minHeight: 118,
    justifyContent: "center",
  },
  bn: {
    fontFamily: disp.semibold,
    fontSize: 11.5,
    textAlign: "center",
    letterSpacing: -0.1,
    color: colors.text,
    width: "100%",
  },
});
