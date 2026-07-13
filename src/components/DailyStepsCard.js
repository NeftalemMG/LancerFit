// The daily-steps panel (ring + weekly bars + stat strip), extracted from the
// Log screen so it can live on the HOME page. Accepts real values; falls back to
// sensible defaults if step data isn't wired to a pedometer yet.
//
// NOTE: real device step counts require expo-sensors Pedometer + permissions.
// Until that's wired, pass steps in as a prop (or leave the default). The layout
// and stat math are unchanged from the original Log-screen version.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from "react-native-svg";
import { colors } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { FlameIcon } from "./icons";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function DailyStepsCard({
  steps = 6320,
  goal = 10000,
  weekVals = [0.7, 0.45, 0.95, 0, 0.8, 0.55, 0],
  todayIndex = 4,
  streak = 0,
}) {
  const pct = Math.min(1, steps / goal);
  const R = 40;
  const C = 2 * Math.PI * R;
  const km = (steps * 0.000762).toFixed(1);
  const kcal = Math.round(steps * 0.045);
  const activeMin = Math.round(steps / 110);

  return (
    <View style={ds.card}>
      <View style={ds.topRow}>
        <View style={ds.ringWrap}>
          <Svg width={104} height={104} viewBox="0 0 104 104">
            <Defs>
              <SvgGrad id="stepGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.goldDim} />
                <Stop offset="1" stopColor={colors.gold} />
              </SvgGrad>
            </Defs>
            <Circle cx={52} cy={52} r={R} stroke="rgba(255,255,255,0.10)" strokeWidth={9} fill="none" />
            <Circle
              cx={52} cy={52} r={R}
              stroke="url(#stepGrad)" strokeWidth={9} fill="none" strokeLinecap="round"
              strokeDasharray={`${C}`} strokeDashoffset={C * (1 - pct)}
              transform="rotate(-90 52 52)"
            />
          </Svg>
          <View style={ds.ringCenter}>
            <Text style={ds.ringPct}>{Math.round(pct * 100)}%</Text>
            <Text style={ds.ringLbl}>of goal</Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={ds.ey}>Daily steps</Text>
          <View style={ds.stepRow}>
            <Text style={ds.stepBig}>{steps.toLocaleString("en-US")}</Text>
            <Text style={ds.stepGoal}>/ {goal.toLocaleString("en-US")}</Text>
          </View>
          <View style={ds.bars}>
            {WEEK_DAYS.map((d, i) => {
              const today = i === todayIndex;
              return (
                <View key={i} style={ds.barCol}>
                  <View style={ds.barTrack}>
                    <View style={{ height: `${Math.max(10, (weekVals[i] || 0) * 100)}%`, width: "100%", borderRadius: 6, backgroundColor: today ? colors.gold : colors.blueLine }} />
                  </View>
                  <Text style={[ds.barDay, today && { color: colors.gold }]}>{d}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={ds.strip}>
        <View style={ds.stat}>
          <Text style={ds.statNum}>{km}</Text>
          <Text style={ds.statLbl}>km</Text>
        </View>
        <View style={ds.divider} />
        <View style={ds.stat}>
          <Text style={ds.statNum}>{kcal}</Text>
          <Text style={ds.statLbl}>kcal</Text>
        </View>
        <View style={ds.divider} />
        <View style={ds.stat}>
          <Text style={ds.statNum}>{activeMin}</Text>
          <Text style={ds.statLbl}>active min</Text>
        </View>
        <View style={ds.divider} />
        <View style={ds.stat}>
          <View style={ds.flameRow}>
            <FlameIcon size={13} color={colors.gold} />
            <Text style={[ds.statNum, { color: colors.gold }]}>{streak}</Text>
          </View>
          <Text style={ds.statLbl}>day streak</Text>
        </View>
      </View>
    </View>
  );
}

const ds = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.cardLine, padding: 18, marginTop: 4 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  ringWrap: { width: 104, height: 104, alignItems: "center", justifyContent: "center" },
  ringCenter: { position: "absolute", alignItems: "center" },
  ringPct: { fontFamily: disp.bold, fontSize: 20, color: colors.text },
  ringLbl: { fontFamily: body.regular, fontSize: 10, color: colors.text3, marginTop: 1 },
  ey: { fontFamily: body.semibold, fontSize: 11, letterSpacing: 1.2, color: colors.text3, textTransform: "uppercase" },
  stepRow: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginTop: 4 },
  stepBig: { fontFamily: disp.bold, fontSize: 26, color: colors.text, letterSpacing: -0.5 },
  stepGoal: { fontFamily: body.medium, fontSize: 12, color: colors.text3, paddingBottom: 3 },
  bars: { flexDirection: "row", justifyContent: "space-between", gap: 5, marginTop: 12, height: 46 },
  barCol: { flex: 1, alignItems: "center", gap: 5 },
  barTrack: { width: "100%", maxWidth: 12, flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 6, justifyContent: "flex-end", overflow: "hidden" },
  barDay: { fontFamily: body.semibold, fontSize: 9, color: colors.text3 },
  strip: { flexDirection: "row", alignItems: "center", marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.cardLine },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontFamily: disp.bold, fontSize: 16, color: colors.text },
  statLbl: { fontFamily: body.regular, fontSize: 10, color: colors.text3, marginTop: 2 },
  divider: { width: 1, height: 26, backgroundColor: colors.cardLine },
  flameRow: { flexDirection: "row", alignItems: "center", gap: 3 },
});