// The podium + rows leaderboard, driven ENTIRELY by live backend data. This uses:
//   • real faculty colors from facultyTheme (each faculty its own unique color),
//   • the faculty avatar art (FacultyAvatar) for campus people,
//   • emoji flags (flagFor) from the person's real nationality.
//
// Accepts rows already in a normalized shape:
//   { key, name, xp, facultyKey, flagCode, level, sub }  (sub = secondary line)
// `grouped` = faculty mode (no per-person flag/avatar; show a faculty color dot).

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { fmt } from "../data/appData";
import { Crown } from "./icons";
import { Card } from "./ui";
import FacultyAvatar from "./FacultyAvatar";
import FacultyBadge from "./FacultyBadge";
import { themeForFaculty } from "../data/facultyTheme";
import { flagFor } from "../data/countries";

const PODIUM_ORDER = [1, 0, 2]; // visual slots: 2nd, 1st, 3rd
const PODIUM_HEIGHTS = [58, 80, 46];

function Avatar({ row, size, grouped }) {
  const theme = themeForFaculty(row.facultyKey);
  if (grouped) {
    // Faculty mode: the faculty's crest badge in a glass box tinted to the
    // faculty accent (replaces the plain colored disc).
    return <FacultyBadge facultyKey={row.facultyKey} size={size} />;
  }
  return <FacultyAvatar facultyKey={row.facultyKey} level={row.level || 1} size={size} goldBg />;
}

export default function DynamicLeaderboardBoard({ data, grouped = false }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No rankings yet — log activities to get on the board.</Text>
      </View>
    );
  }

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <View>
      {/* Podium */}
      <View style={styles.podium}>
        {PODIUM_ORDER.map((di, slot) => {
          const e = top3[di];
          if (!e) return <View key={slot} style={styles.pcol} />;
          const first = di === 0;
          const metal = di === 0 ? colors.medalGold : di === 1 ? colors.medalSilver : colors.medalBronze;
          return (
            <View key={slot} style={styles.pcol}>
              {first && <Crown size={24} color={colors.gold} />}
              <View style={[styles.pav, { borderColor: metal + "99", backgroundColor: metal + "1F" }, first && { width: 66, height: 66 }]}>
                <Avatar row={e} size={first ? 54 : 44} grouped={grouped} />
                {!grouped && <View style={styles.flBadge}><Text style={styles.flEmoji}>{flagFor(e.flagCode)}</Text></View>}
              </View>
              <Text style={styles.pname} numberOfLines={1}>{e.name}</Text>
              <Text style={styles.pxp}>{fmt(e.xp)} XP</Text>
              <LinearGradient
                colors={[metal + "3A", metal + "12"]}
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={[styles.plinth, { height: PODIUM_HEIGHTS[slot], borderColor: metal + "66" }]}
              >
                <Text style={[styles.plinthNum, { color: metal }]}>{di + 1}</Text>
              </LinearGradient>
            </View>
          );
        })}
      </View>

      {/* Rows */}
      <View style={{ marginTop: 20, gap: 9 }}>
        {rest.map((e, i) => {
          const theme = themeForFaculty(e.facultyKey);
          return (
            <Card key={e.key ?? i} style={styles.row}>
              <Text style={styles.rk}>{e.rank || i + 4}</Text>
              <View style={styles.lav}>
                <Avatar row={e} size={38} grouped={grouped} />
                {!grouped && <View style={styles.rowFlag}><Text style={styles.flEmojiSm}>{flagFor(e.flagCode)}</Text></View>}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.nmName} numberOfLines={1}>{e.name}</Text>
                <View style={styles.nmMetaRow}>
                  <View style={[styles.fdot, { backgroundColor: theme.accent }]} />
                  <Text style={styles.nmMeta} numberOfLines={1}>{e.sub || theme.name}</Text>
                </View>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.pts, { color: theme.accent }]}>{fmt(e.xp)}</Text>
                {grouped && <Text style={styles.ptsSub}>avg</Text>}
              </View>
            </Card>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  podium: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 10, marginTop: 24 },
  pcol: { flex: 1, maxWidth: 108, alignItems: "center", gap: 7 },
  pav: { width: 54, height: 54, borderRadius: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLine, alignItems: "center", justifyContent: "center", overflow: "visible" },
  flBadge: { position: "absolute", bottom: -4, right: -4, zIndex: 3 },
  flEmoji: { fontSize: 16 },
  flEmojiSm: { fontSize: 13 },
  pname: { fontFamily: disp.semibold, fontSize: 12, letterSpacing: -0.1, color: colors.text, maxWidth: 100, textAlign: "center" },
  pxp: { fontFamily: disp.semibold, fontSize: 11, color: colors.text2 },
  plinth: { marginTop: 3, width: "100%", borderTopLeftRadius: 12, borderTopRightRadius: 12, borderWidth: 1, borderBottomWidth: 0, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  plinthNum: { fontFamily: disp.bold, fontSize: 22 },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  rk: { fontFamily: disp.bold, fontSize: 15, color: colors.text3, width: 24, textAlign: "center" },
  lav: { width: 40, height: 40, alignItems: "center", justifyContent: "center", overflow: "visible" },
  rowFlag: { position: "absolute", bottom: -3, right: -3, zIndex: 3 },
  nmName: { fontFamily: disp.semibold, fontSize: 14, letterSpacing: -0.1, color: colors.text },
  nmMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 },
  fdot: { width: 7, height: 7, borderRadius: 99 },
  nmMeta: { fontFamily: body.medium, fontSize: 10.5, letterSpacing: 0.3, color: colors.text3, textTransform: "uppercase", maxWidth: 190 },
  pts: { fontFamily: disp.bold, fontSize: 15 },
  ptsSub: { fontFamily: body.regular, fontSize: 9, color: colors.text3, marginTop: -1 },

  facultyDisc: { alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  facultyDot: { width: "42%", height: "42%", borderRadius: 99 },

  empty: { marginTop: 40, alignItems: "center" },
  emptyText: { fontFamily: body.regular, fontSize: 13, color: colors.text3, textAlign: "center", paddingHorizontal: 30, lineHeight: 19 },
});