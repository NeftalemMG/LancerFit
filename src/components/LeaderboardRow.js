import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { fmt } from "../data/appData";
import KnightAvatar from "./KnightAvatar";
import { Flag } from "./Glyphs";
import { Card } from "./ui";

// Single job: render one leaderboard row. Reused by LeaderboardScreen and
// ChallengeLeaderboardPreview
export default function LeaderboardRow({
  entry,
  rank,
  faction,
  showFlag = true,
  isYou = false,
}) {
  return (
    <Card style={[styles.row, isYou && styles.rowYou]}>
      <Text style={styles.rk}>{rank}</Text>
      <View style={styles.lav}>
        <KnightAvatar variant={entry.av} plume={faction.color} size={32} />
        {showFlag && (
          <View style={styles.flBadge}>
            <Flag code={entry.fl} width={15} />
          </View>
        )}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.nmRow}>
          <Text style={styles.nmName}>{entry.n}</Text>
          {isYou && <Text style={styles.youTag}>· You</Text>}
        </View>
        <View style={styles.nmMetaRow}>
          <View style={[styles.fdot, { backgroundColor: faction.color }]} />
          <Text style={styles.nmMeta}>{faction.label}</Text>
        </View>
      </View>
      <Text style={styles.pts}>{fmt(entry.xp)}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 9,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  rowYou: { backgroundColor: colors.goldSoft, borderColor: colors.goldLine },
  rk: {
    width: 24,
    textAlign: "center",
    fontFamily: disp.bold,
    fontSize: 15,
    color: colors.text3,
  },
  lav: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.cardLine,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  flBadge: { position: "absolute", bottom: -3, right: -3, zIndex: 3 },
  nmRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  nmName: {
    fontFamily: disp.semibold,
    fontSize: 14,
    letterSpacing: -0.1,
    color: colors.text,
  },
  youTag: { fontFamily: disp.bold, fontSize: 12, color: colors.gold },
  nmMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  fdot: { width: 7, height: 7, borderRadius: 99 },
  nmMeta: {
    fontFamily: body.medium,
    fontSize: 10.5,
    letterSpacing: 0.4,
    color: colors.text3,
    textTransform: "uppercase",
  },
  pts: { fontFamily: disp.bold, fontSize: 14, color: colors.text },
});
