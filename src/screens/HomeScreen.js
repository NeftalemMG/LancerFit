// The home page.
//   • Greeting + first name + faculty avatar + nationality flag come from the
//     signed-in user (via AppContext.player, hydrated from /user/me).
//   • Lancer level, XP progress, and streak are live from the backend.
//   • Pinned exercise stats appear under "Your stats".

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, shadow } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { useApp } from "../context/AppContext";
import { fmt } from "../data/appData";
import { QuestGlyph, questIconColor } from "../components/Glyphs";
import FacultyAvatar from "../components/FacultyAvatar";
import DailyStepsCard from "../components/DailyStepsCard";
import HomeStatsWidget from "../components/stats/HomeStatsWidget";
import { flagFor } from "../data/countries";
import { tierName } from "../data/facultyTheme";
import { usePedometer } from "../hooks/usePedometer";
import { useGymProximity } from "../hooks/useGymProximity";
import { doCheckIn } from "../services/checkinApi";
import { Card, PressScale, ProgressBar, SectionRow, Eyebrow } from "../components/ui";
import { FlameIcon, PinIcon, ScanIcon, CheckIcon } from "../components/icons";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function QuestRow({ q, onPress, onClaim }) {
  const done = q.cur >= q.max;
  return (
    <PressScale onPress={onPress} style={{ marginBottom: 10 }}>
      <Card style={[styles.quest, styles.questGold, q.claimed && { opacity: 0.6 }]}>
        <View style={[styles.qicon, q.gold ? styles.qiconGold : null]}>
          <QuestGlyph name={q.icon} color={questIconColor[q.icon] || colors.blue2} size={22} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.qTitle}>{q.title}</Text>
          <Text style={styles.qSub}>{q.sub}</Text>
          <View style={{ marginTop: 9 }}>
            <ProgressBar pct={(q.cur / q.max) * 100} height={5} fillColor={done ? colors.green : colors.gold} />
          </View>
        </View>
        {done && !q.claimed ? (
          <PressScale onPress={onClaim}>
            <LinearGradient colors={[colors.gold, colors.goldDim]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.claim}>
              <Text style={styles.claimText}>Claim +{q.xp}</Text>
            </LinearGradient>
          </PressScale>
        ) : (
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.xpTag}>+{q.xp} XP</Text>
            <Text style={styles.xpTagSub}>{q.claimed ? "Claimed" : `${q.cur}/${q.max}`}</Text>
          </View>
        )}
      </Card>
    </PressScale>
  );
}

export default function HomeScreen({ navigation }) {
  const { player, quests, bumpQuest, claimQuest, checkIn, refreshMe } = useApp();
  const { steps, weekVals, weekSteps, todayIndex, available: stepsAvailable } = usePedometer();
  const { nearGym, distanceLabel } = useGymProximity();
  const [checking, setChecking] = React.useState(false);

  const doGymCheckIn = async () => {
    if (checking) return;
    setChecking(true);
    try {
      await doCheckIn();
      checkIn();
      refreshMe && refreshMe();
    } catch {
      checkIn();
    } finally {
      setChecking(false);
    }
  };

  const level = player.level ?? 1;
  const xp = player.xp ?? 0;
  const xpMax = player.xpMax ?? 2000;
  const pct = Math.min(1, xp / xpMax) * 100;
  const firstName = player.name || "Lancer";
  const facultyKey = player.facultyKey; // e.g. "faculty3"
  const flagCode = player.flagCode || player.flag;
  const rankLabel = tierName(level); // Squire / Knight / Hero / Legend / Lancer

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* greeting row */}
      <View style={styles.homeTop}>
        <View style={styles.avBox}>
          <FacultyAvatar facultyKey={facultyKey} level={level} size={46} goldBg />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow>{greeting()}</Eyebrow>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>{firstName}</Text>
            <Text style={styles.flagEmoji}>{flagFor(flagCode)}</Text>
          </View>
        </View>
        <PressScale style={styles.streakChip}>
          <FlameIcon size={15} color={colors.gold} />
          <Text style={styles.streakNum}>{player.streak ?? 0}</Text>
          <Text style={styles.streakLbl}>day{"\n"}streak</Text>
        </PressScale>
      </View>

      {/* XP hero */}
      <View style={styles.hero}>
        <LinearGradient
          colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.03)"]}
          start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.lvK}>Lancer level</Text>
            <View style={styles.lvBig}>
              <Text style={styles.lvNum}>{level}</Text>
              <Text style={styles.rank}>{rankLabel}</Text>
            </View>
          </View>
          <FacultyAvatar facultyKey={facultyKey} level={level} size={56} goldBg />
        </View>
        <View style={styles.xpTrack}>
          <LinearGradient colors={[colors.goldDim, colors.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.xpFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.xpMeta}>
          <Text style={styles.xpMetaText}><Text style={styles.xpMetaBold}>{fmt(xp)}</Text> / {fmt(xpMax)} XP</Text>
          <Text style={styles.xpMetaText}><Text style={styles.xpMetaBold}>{fmt(Math.max(0, xpMax - xp))}</Text> to next</Text>
        </View>
      </View>

      {/* check-in */}
      <Card style={[styles.checkin, player.checkedIn && styles.checkinDone]}>
        <View style={[styles.ciIco, player.checkedIn && styles.ciIcoDone]}>
          {player.checkedIn
            ? <CheckIcon size={22} color={colors.green} strokeWidth={2.4} />
            : <PinIcon size={22} color={colors.gold} strokeWidth={2} />}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.ciTitle}>{player.checkedIn ? "Checked in — nice work." : "Toldo Lancer Centre"}</Text>
          <View style={styles.openRow}>
            <View style={[styles.dot, { backgroundColor: nearGym ? colors.green : colors.text3 }]} />
            <Text style={styles.openText}>
              {player.checkedIn
                ? "Toldo Lancer Centre · +75 XP"
                : nearGym
                  ? "You're here! Tap to check in · +75 XP"
                  : distanceLabel
                    ? `Open until 11:00 PM · ${distanceLabel}`
                    : "Open until 11:00 PM"}
            </Text>
          </View>
        </View>
        <PressScale onPress={doGymCheckIn} disabled={checking || player.checkedIn}>
          <LinearGradient
            colors={player.checkedIn ? ["#5cc796", colors.green] : nearGym ? [colors.gold, colors.goldDim] : ["#3a4d6b", "#2c3d59"]}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            style={styles.scanBtn}
          >
            {player.checkedIn ? <CheckIcon size={24} color="#fff" strokeWidth={2.6} /> : <ScanIcon size={22} color={nearGym ? "#000000" : "#fff"} strokeWidth={2.2} />}
            <Text style={[styles.scanLbl, { color: nearGym && !player.checkedIn ? "#000" : "#fff" }]}>{player.checkedIn ? "Done" : "Check\nin"}</Text>
          </LinearGradient>
        </PressScale>
      </Card>

      {/* Pinned exercise stats */}
      <HomeStatsWidget navigation={navigation} />

      <SectionRow title="Today's quests" />
      {quests.slice(0, 3).map((q) => (
        <QuestRow key={q.id} q={q} onPress={() => bumpQuest(q.id)} onClaim={() => claimQuest(q.id)} />
      ))}

      {/* Daily steps — moved here from the Log screen */}
      <SectionRow title="Activity" />
      <DailyStepsCard
        streak={player.streak ?? 0}
        steps={stepsAvailable ? steps : 0}
        weekVals={weekVals}
        weekSteps={weekSteps}
        todayIndex={todayIndex}
        available={stepsAvailable}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 124 },

  homeTop: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingBottom: 18 },
  avBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardLine, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  nameText: { fontFamily: disp.bold, fontSize: 19, letterSpacing: -0.4, color: colors.text, maxWidth: 190 },
  flagEmoji: { fontSize: 18 },
  streakChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 9, paddingHorizontal: 13, borderRadius: 13, backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.goldLine },
  streakNum: { fontFamily: disp.bold, fontSize: 16, color: colors.gold },
  streakLbl: { fontFamily: body.semibold, fontSize: 9, lineHeight: 11, letterSpacing: 0.7, color: colors.gold, textTransform: "uppercase" },

  hero: { padding: 22, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.cardLine2, ...shadow.card },
  heroRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 },
  lvK: { fontFamily: body.semibold, fontSize: 11, letterSpacing: 1.4, color: colors.text3, textTransform: "uppercase" },
  lvBig: { flexDirection: "row", alignItems: "flex-end", gap: 9, marginTop: 6 },
  lvNum: { fontFamily: disp.bold, fontSize: 40, lineHeight: 40, letterSpacing: -1.2, color: colors.text },
  rank: { fontFamily: disp.semibold, fontSize: 13, color: colors.gold, paddingBottom: 4 },
  xpTrack: { height: 9, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.10)", overflow: "hidden" },
  xpFill: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 99 },
  xpMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  xpMetaText: { fontFamily: disp.semibold, fontSize: 12, color: colors.text2 },
  xpMetaBold: { color: colors.text },

  checkin: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 14, padding: 16, borderRadius: radius.md },
  checkinDone: { backgroundColor: colors.greenSoft, borderColor: colors.greenLine },
  ciIco: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.blueSoft, borderWidth: 1, borderColor: colors.blueLine, alignItems: "center", justifyContent: "center" },
  ciIcoDone: { backgroundColor: "rgba(79,181,135,0.2)", borderColor: colors.greenLine },
  ciTitle: { fontFamily: disp.bold, fontSize: 15, letterSpacing: -0.1, color: colors.text },
  openRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 4 },
  dot: { width: 7, height: 7, borderRadius: 99, backgroundColor: colors.green },
  openText: { fontFamily: body.medium, fontSize: 12, color: colors.text2 },
  scanBtn: { width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 3, ...shadow.accent("rgba(47,123,196,0.9)") },
  scanLbl: { fontFamily: disp.bold, fontSize: 9, lineHeight: 10, letterSpacing: 0.3, color: "#000000", textAlign: "center" },

  quest: { flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 14, paddingHorizontal: 15, borderRadius: radius.md },
  qicon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.blueSoft, borderWidth: 1, borderColor: colors.blueLine },
  qiconGold: { backgroundColor: colors.goldSoft, borderColor: colors.goldLine },
  questGold: { borderColor: colors.goldLine },
  qTitle: { fontFamily: disp.semibold, fontSize: 14.5, letterSpacing: -0.1, color: colors.text },
  qSub: { marginTop: 3, fontFamily: body.regular, fontSize: 12, lineHeight: 16, color: colors.text2 },
  xpTag: { fontFamily: disp.bold, fontSize: 12, color: colors.gold },
  xpTagSub: { fontFamily: body.medium, fontSize: 9.5, color: colors.text3, marginTop: 2 },
  claim: { paddingVertical: 11, paddingHorizontal: 14, borderRadius: 12, ...shadow.accent("rgba(216,169,74,0.7)") },
  claimText: { fontFamily: disp.bold, fontSize: 12, color: colors.goldInk, textAlign: "center" },
});