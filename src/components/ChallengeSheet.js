import React, { useEffect, useState } from "react";
import { View, Text, ImageBackground, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { useApp } from "../context/AppContext";
import { FALLBACK } from "../data/appData";
import { PressScale } from "./ui";
import DynamicLeaderboardBoard from "./DynamicLeaderboardBoard";
import ChallengeResultSheet from "./ChallengeResultSheet";
import { fetchChallengeLeaderboard } from "../services/challengeApi";
import { useRealtime } from "../services/realtime";
import { flagFor } from "../data/countries";
import { themeForFaculty } from "../data/facultyTheme";

// Presents one challenge. Flow:
//   1. Not joined  -> "Join challenge"
//   2. Joined, no result submitted -> "Log your result" (opens ChallengeResultSheet)
//   3. Result submitted, awaiting admin -> "Awaiting validation"
//   4. Approved -> "Approved · on the leaderboard"
// The leaderboard under the button is LIVE for backend challenges.
export default function ChallengeSheet({ challenge: c, onViewLeaderboard }) {
  const { joinedChals, joinChallenge, challengeStatus, openSheet } = useApp();
  const joined = !!joinedChals[c.id];
  const status = challengeStatus?.[c.id]; // 'pending' | 'submitted' | 'approved' | 'rejected'

  const [board, setBoard] = useState(null);

  // Live leaderboard for real (backend) challenges. Maps the backend
  // {rank,user,points} rows into the normalized shape DynamicLeaderboardBoard
  // expects, preserving each participant's REAL faculty avatar, faculty color,
  // level, and nationality flag (the old code flattened all of these to a single
  // default, which is why the board showed one generic person with no avatar or
  // flag). The faculty name renders as the small secondary line under the name.
  const loadBoard = React.useCallback(async () => {
    if (!c._live) {
      setBoard(c.leaderboard || null);
      return;
    }
    try {
      const rows = await fetchChallengeLeaderboard(c.id);
      setBoard(
        (rows || []).map((r, i) => {
          const u = r.user || {};
          const facultyKey = u.facultyKey || "faculty9";
          return {
            key: u.id ?? `${i}`,
            rank: r.rank ?? i + 1,
            name: u.name || u.firstName || "Lancer",
            xp: r.points ?? 0,
            facultyKey,
            level: u.level || 1,
            flagCode: u.nationality || "ca",
            sub: themeForFaculty(facultyKey).name, // faculty name as the sub-line
          };
        }),
      );
    } catch {
      setBoard([]);
    }
  }, [c]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Refresh standings the moment an admin approves/rejects anyone here.
  useRealtime(
    "validation:decided",
    React.useCallback(() => loadBoard(), [loadBoard]),
  );

  const openLogResult = () => {
    openSheet(<ChallengeResultSheet challenge={c} onDone={loadBoard} />, true);
  };

  const renderCta = () => {
    if (!joined) {
      return (
        <LinearGradient
          colors={[colors.gold, colors.goldDim]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.act}
        >
          <Text style={styles.actText}>Join challenge</Text>
        </LinearGradient>
      );
    }
    if (status === "approved") {
      return (
        <View style={{ gap: 10 }}>
          <View style={[styles.act, styles.actApproved]}>
            <Text style={styles.approvedText}>Approved · on the leaderboard</Text>
          </View>
          <LinearGradient
            colors={[colors.gold, colors.goldDim]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.act}
          >
            <Text style={styles.actText}>Log another result</Text>
          </LinearGradient>
        </View>
      );
    }
    if (status === "submitted" || status === "pending_review") {
      return (
        <View style={[styles.act, styles.actSec]}>
          <Text style={styles.joinedText}>Awaiting validation…</Text>
        </View>
      );
    }
    if (status === "rejected") {
      return (
        <LinearGradient
          colors={[colors.gold, colors.goldDim]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.act}
        >
          <Text style={styles.actText}>Result declined · log again</Text>
        </LinearGradient>
      );
    }
    // joined, not yet submitted
    return (
      <LinearGradient
        colors={[colors.gold, colors.goldDim]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.act}
      >
        <Text style={styles.actText}>Log your result</Text>
      </LinearGradient>
    );
  };

  const onCtaPress = () => {
    if (!joined) {
      joinChallenge(c);
      return;
    }
    if (status === "submitted" || status === "pending_review") {
      // Awaiting validation — nothing to log right now.
      return;
    }
    // approved -> log another result; rejected/joined -> log first result.
    openLogResult();
  };

  return (
    <View>
      <ImageBackground
        source={{ uri: c.img }}
        style={styles.photo}
        imageStyle={{ resizeMode: "cover", backgroundColor: FALLBACK[c.type]?.[1] }}
      >
        <LinearGradient
          colors={["rgba(8,42,71,0.05)", "rgba(8,42,71,0.7)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.type}>
          <Text style={styles.typeText}>{c.type}</Text>
        </View>
      </ImageBackground>

      <View style={styles.bodyWrap}>
        <View style={styles.titleRow}>
          <View style={styles.titleEdge} />
          <Text style={styles.h3}>{c.title}</Text>
        </View>
        <Text style={styles.desc}>{c.desc}</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>+{c.xp}</Text>
            <Text style={styles.statLbl}>XP reward</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{c.days}d</Text>
            <Text style={styles.statLbl}>Window</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{c.joined}</Text>
            <Text style={styles.statLbl}>Joined</Text>
          </View>
        </View>

        <PressScale onPress={onCtaPress} wrapStyle={styles.buttonWrap}>
          {renderCta()}
        </PressScale>

        {joined && (status == null || status === "rejected") && (
          <Text style={styles.helper}>
            Did the activity in front of TLC staff? Log it to send for approval.
          </Text>
        )}

        {board && board.length > 0 ? (
          <View style={styles.boardWrap}>
            <Text style={styles.boardTitle}>Challenge leaderboard</Text>
            <DynamicLeaderboardBoard data={board} />
          </View>
        ) : (
          <Text style={styles.boardEmpty}>
            No approved results yet. Be the first on the board.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { height: 188, justifyContent: "flex-end" },
  type: {
    position: "absolute",
    left: 18,
    bottom: 14,
    backgroundColor: "rgba(8,42,71,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 99,
  },
  typeText: {
    fontFamily: body.semibold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: "#fff",
    textTransform: "uppercase",
  },
  bodyWrap: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 32, alignItems: "stretch" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 11, alignSelf: "flex-start", maxWidth: "100%" },
  titleEdge: { width: 4, height: 28, borderRadius: 2, backgroundColor: colors.gold },
  h3: {
    fontFamily: disp.bold,
    fontSize: 21,
    letterSpacing: -0.5,
    color: colors.text,
    marginTop: 6,
  },
  desc: {
    marginTop: 10,
    color: colors.text2,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 280,
    fontFamily: body.regular,
  },
  stats: { flexDirection: "row", gap: 10, marginTop: 18, alignSelf: "stretch" },
  stat: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardLine,
    alignItems: "center",
  },
  statNum: { fontFamily: disp.bold, fontSize: 19, color: colors.text },
  statLbl: {
    marginTop: 5,
    fontFamily: body.semibold,
    fontSize: 9.5,
    letterSpacing: 0.7,
    color: colors.text3,
    textTransform: "uppercase",
  },
  act: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  actSec: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardLine,
  },
  actApproved: {
    backgroundColor: "rgba(46,160,94,0.16)",
    borderWidth: 1,
    borderColor: "rgba(46,160,94,0.5)",
  },
  actText: { fontFamily: disp.bold, fontSize: 14, color: colors.goldInk },
  joinedText: { fontFamily: disp.bold, fontSize: 14, color: colors.text2 },
  approvedText: { fontFamily: disp.bold, fontSize: 14, color: colors.green },
  buttonWrap: { marginTop: 18, alignSelf: "stretch" },
  helper: {
    marginTop: 12,
    fontFamily: body.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.text3,
    textAlign: "center",
    maxWidth: 280,
  },
  boardWrap: { alignSelf: "stretch", marginTop: 24 },
  boardTitle: {
    fontFamily: disp.semibold,
    fontSize: 15,
    letterSpacing: -0.2,
    color: colors.text,
    marginBottom: 2,
  },
  boardEmpty: {
    alignSelf: "stretch",
    marginTop: 24,
    fontFamily: body.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text3,
    textAlign: "center",
  },
});