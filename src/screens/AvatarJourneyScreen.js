import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Image, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Path,
  Rect,
  Polygon,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  Circle,
  G,
} from "react-native-svg";
import { colors, radius } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { useApp } from "../context/AppContext";
import { fmt } from "../data/appData";
import { TIER_NAMES, tierForLevel, themeForFaculty, getAvatarSource } from "../data/facultyTheme";
import FacultyAvatar from "../components/FacultyAvatar";
import FacultyBadge from "../components/FacultyBadge";
import { ChevronLeft } from "../components/icons";

const { width: SCREEN_W } = Dimensions.get("window");

// Five tiers = five castle floors. Each floor unlocks at startLevel and spans a
// band of sub-levels (its "ranks"). The avatar art only changes at a tier
// boundary, so within a floor we show the same avatar and mark cleared ranks.
const FLOORS = [
  { tier: 5, name: "Lancer", startLevel: 20, endLevel: 25, height: 150 },
  { tier: 4, name: "Legend", startLevel: 14, endLevel: 19, height: 138 },
  { tier: 3, name: "Hero", startLevel: 8, endLevel: 13, height: 132 },
  { tier: 2, name: "Knight", startLevel: 3, endLevel: 7, height: 126 },
  { tier: 1, name: "Squire", startLevel: 1, endLevel: 2, height: 120 },
];

const XP_PER_LEVEL = 2000;
const xpForLevel = (lvl) => (lvl - 1) * XP_PER_LEVEL;

// ── Castle SVG pieces ──────────────────────────────────────────────────────

// Crenellated battlement strip (the toothed top of a castle wall).
function Battlement({ width, color, stroke }) {
  const toothW = 18;
  const gapW = 12;
  const unit = toothW + gapW;
  const count = Math.ceil(width / unit);
  const teeth = [];
  for (let i = 0; i < count; i += 1) {
    teeth.push(
      <Rect key={i} x={i * unit} y={0} width={toothW} height={14} rx={2} fill={color} stroke={stroke} strokeWidth={1} />,
    );
  }
  return (
    <Svg width={width} height={14} style={{ marginBottom: -1 }}>
      {teeth}
    </Svg>
  );
}

// A single tower (side turret) with a conical roof.
function Tower({ h = 74, color, roof, stroke }) {
  return (
    <Svg width={34} height={h + 22} viewBox={`0 0 34 ${h + 22}`}>
      <Polygon points={`17,0 33,20 1,20`} fill={roof} stroke={stroke} strokeWidth={1} />
      <Circle cx={17} cy={7} r={2} fill={roof} />
      <Rect x={3} y={20} width={28} height={h} fill={color} stroke={stroke} strokeWidth={1} />
      {/* arrow-slit windows */}
      <Rect x={13} y={32} width={4} height={12} rx={2} fill={stroke} opacity={0.5} />
      <Rect x={13} y={52} width={4} height={12} rx={2} fill={stroke} opacity={0.5} />
    </Svg>
  );
}

// ── Floor card ─────────────────────────────────────────────────────────────

function FloorCard({ floor, level, facultyKey, theme, isTop }) {
  const unlocked = level >= floor.startLevel;
  const isCurrent = tierForLevel(level) === floor.tier;
  const src = getAvatarSource(facultyKey, floor.startLevel);
  const reqXp = xpForLevel(floor.startLevel);
  const wallW = SCREEN_W - 40;

  const wallColor = unlocked ? theme.accent : "#243244";
  const wallDark = unlocked ? shade(theme.accent, -0.28) : "#1b2836";
  const stone = unlocked ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)";
  const roof = unlocked ? colors.gold : "#2f3e52";

  return (
    <View style={[styles.floor, { opacity: unlocked ? 1 : 0.9 }]}>
      {/* the current-floor "you are here" flag banner */}
      {isCurrent && (
        <View style={[styles.hereFlag, { backgroundColor: colors.gold }]}>
          <Text style={styles.hereFlagTxt}>★ You are here</Text>
        </View>
      )}

      <View style={styles.floorInner}>
        {/* left tower */}
        <Tower h={floor.height - 46} color={wallDark} roof={roof} stroke={wallColor} />

        {/* central keep */}
        <View style={styles.keepWrap}>
          <Battlement width={wallW - 68} color={wallColor} stroke={wallDark} />
          <LinearGradient
            colors={[wallColor, wallDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.keep, { height: floor.height, borderColor: isCurrent ? colors.gold : wallDark, borderWidth: isCurrent ? 2 : 1 }]}
          >
            {/* stone courses */}
            <View style={[styles.course, { top: 26, backgroundColor: stone }]} />
            <View style={[styles.course, { top: 52, backgroundColor: stone }]} />

            {/* avatar sits in the keep's gateway */}
            <View style={styles.gateway}>
              <View style={[styles.avatarRing, { borderColor: isCurrent ? colors.gold : "rgba(255,255,255,0.25)" }]}>
                {src ? (
                  <Image source={src} style={[styles.avatarImg, !unlocked && { opacity: 0.25 }]} resizeMode="cover" />
                ) : (
                  <View style={[styles.avatarImg, styles.avatarFallback, { opacity: unlocked ? 1 : 0.25 }]}>
                    <FacultyAvatar facultyKey={facultyKey} level={floor.startLevel} size={54} goldBg />
                  </View>
                )}
                {!unlocked && (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockGlyph}>🔒</Text>
                  </View>
                )}
                {unlocked && !isCurrent && (
                  <View style={[styles.clearBadge, { backgroundColor: theme.accent }]}>
                    <Text style={styles.clearGlyph}>✓</Text>
                  </View>
                )}
              </View>
            </View>

            {/* floor label plate */}
            <View style={styles.plate}>
              <Text style={[styles.floorName, !unlocked && { color: "rgba(255,255,255,0.5)" }]}>{floor.name}</Text>
              <Text style={styles.floorLevels}>
                {floor.startLevel === floor.endLevel ? `Lv ${floor.startLevel}` : `Lv ${floor.startLevel}–${floor.endLevel}`}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* right tower */}
        <Tower h={floor.height - 46} color={wallDark} roof={roof} stroke={wallColor} />
      </View>

      {/* rank pips + xp requirement below the floor */}
      <View style={styles.floorFoot}>
        <View style={styles.pipRow}>
          {Array.from({ length: floor.endLevel - floor.startLevel + 1 }, (_, k) => {
            const lvl = floor.startLevel + k;
            const done = level >= lvl;
            const atNow = level === lvl;
            return (
              <View
                key={lvl}
                style={[
                  styles.pip,
                  done && { backgroundColor: atNow ? colors.gold : theme.accent, borderColor: "transparent" },
                ]}
              >
                <Text style={[styles.pipTxt, done && { color: atNow ? "#1a1205" : "#fff" }]}>{lvl}</Text>
              </View>
            );
          })}
        </View>
        <Text style={[styles.floorXp, !unlocked && { color: colors.text3 }]}>
          {unlocked ? `Unlocked · ${fmt(reqXp)} XP` : `${fmt(reqXp)} XP to unlock`}
        </Text>
      </View>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────

export default function AvatarJourneyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { player } = useApp();
  const level = player.level ?? 1;
  const totalXp = player.totalXp ?? player.lifetime ?? 0;
  const facultyKey = player.facultyKey;
  const theme = themeForFaculty(facultyKey);
  const currentTier = tierForLevel(level);
  const facultyName = player.facultyLabel || theme.name || "Faculty";

  const goBack = () =>
    navigation?.canGoBack?.() ? navigation.goBack() : navigation?.navigate?.("profile");

  return (
    <View style={styles.root}>
      {/* faculty-tinted sky backdrop */}
      <LinearGradient
        colors={[shade(theme.accent, -0.55), colors.appBg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: Math.max(insets.top - 6, 6) }]}>
        <Pressable onPress={goBack} hitSlop={12} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}>
          <ChevronLeft size={16} color={colors.gold} strokeWidth={2.8} />
          <Text style={styles.backText}>Profile</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <View style={styles.titleEdge} />
          <View>
            <Text style={styles.eyebrow}>Climb the ranks</Text>
            <Text style={styles.h1}>Avatar journey</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Standing summary — faculty badge + colors + current tier */}
        <View style={[styles.summary, { borderColor: theme.accentLine }]}>
          <LinearGradient
            colors={[theme.accentSoft, "rgba(255,255,255,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <FacultyAvatar facultyKey={facultyKey} level={level} size={62} goldBg />
          <View style={{ flex: 1 }}>
            <Text style={styles.sumTier}>{TIER_NAMES[currentTier - 1]}</Text>
            <Text style={styles.sumSub}>Level {level} · {fmt(totalXp)} XP</Text>
            <View style={styles.facultyRow}>
              <FacultyBadge facultyKey={facultyKey} size={18} />
              <Text style={[styles.facultyName, { color: theme.accent }]} numberOfLines={1}>{facultyName}</Text>
            </View>
          </View>
          <View style={styles.sumBadge}>
            <Text style={styles.sumBadgeNum}>{currentTier}</Text>
            <Text style={styles.sumBadgeLbl}>of 5</Text>
          </View>
        </View>

        {/* The castle — five floors, top (Lancer) to bottom (Squire) */}
        <View style={styles.castle}>
          {FLOORS.map((f, i) => (
            <FloorCard
              key={f.tier}
              floor={f}
              level={level}
              facultyKey={facultyKey}
              theme={theme}
              isTop={i === 0}
            />
          ))}
          {/* ground / castle base */}
          <View style={styles.ground}>
            <View style={styles.gate} />
            <Text style={styles.groundTxt}>THE KEEP</Text>
          </View>
        </View>

        <Text style={styles.footNote}>
          Every tier you reach unlocks a new avatar and a higher floor of your keep. Log workouts and clear challenges to climb from Squire all the way to Lancer.
        </Text>
      </ScrollView>
    </View>
  );
}

// Lighten/darken a hex color by a ratio (-1..1).
function shade(hex, ratio) {
  const h = String(hex || "#4A93D8").replace("#", "");
  let r = parseInt(h.slice(0, 2), 16);
  let g = parseInt(h.slice(2, 4), 16);
  let b = parseInt(h.slice(4, 6), 16);
  const t = ratio < 0 ? 0 : 255;
  const p = Math.abs(ratio);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `rgb(${r}, ${g}, ${b})`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },
  header: { paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 3, alignSelf: "flex-start", paddingVertical: 6 },
  backText: { fontFamily: disp.bold, fontSize: 15, color: colors.gold, letterSpacing: -0.2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 10 },
  titleEdge: { width: 4, height: 38, borderRadius: 2, backgroundColor: colors.gold },
  eyebrow: { fontFamily: body.semibold, fontSize: 11, letterSpacing: 1.2, color: "rgba(255,255,255,0.65)", textTransform: "uppercase" },
  h1: { fontFamily: disp.bold, fontSize: 26, letterSpacing: -0.5, color: colors.text, marginTop: 2 },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  summary: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: radius.lg, overflow: "hidden",
    borderWidth: 1, marginBottom: 24,
  },
  sumTier: { fontFamily: disp.bold, fontSize: 20, color: colors.text, letterSpacing: -0.3 },
  sumSub: { fontFamily: body.medium, fontSize: 12.5, color: colors.text2, marginTop: 2 },
  facultyRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 7 },
  facultyName: { fontFamily: body.semibold, fontSize: 12, flexShrink: 1 },
  sumBadge: { alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" },
  sumBadgeNum: { fontFamily: disp.bold, fontSize: 22, color: colors.gold },
  sumBadgeLbl: { fontFamily: body.regular, fontSize: 10, color: colors.text3, marginTop: -2 },

  castle: { alignItems: "center" },
  floor: { width: "100%", alignItems: "center", marginBottom: 6 },
  floorInner: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center" },
  keepWrap: { alignItems: "center", marginHorizontal: -2 },
  keep: {
    width: SCREEN_W - 104, borderRadius: 6,
    alignItems: "center", justifyContent: "flex-end",
    overflow: "hidden",
  },
  course: { position: "absolute", left: 0, right: 0, height: 1 },
  gateway: { position: "absolute", top: 16, alignItems: "center", alignSelf: "center" },
  avatarRing: {
    width: 74, height: 74, borderRadius: 20, borderWidth: 2,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
    backgroundColor: "rgba(6,20,38,0.35)",
  },
  avatarImg: { width: 70, height: 70, borderRadius: 18, backgroundColor: "#F0CF6E" },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  lockOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center", backgroundColor: "rgba(6,20,38,0.5)",
  },
  lockGlyph: { fontSize: 22 },
  clearBadge: {
    position: "absolute", bottom: 2, right: 2, width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(6,20,38,0.6)",
  },
  clearGlyph: { fontSize: 11, color: "#fff", fontWeight: "800" },
  plate: {
    position: "absolute", bottom: 8, alignItems: "center",
    backgroundColor: "rgba(6,20,38,0.4)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4,
  },
  floorName: { fontFamily: disp.bold, fontSize: 15, color: "#fff", letterSpacing: -0.2 },
  floorLevels: { fontFamily: body.medium, fontSize: 10.5, color: "rgba(255,255,255,0.8)" },

  hereFlag: {
    alignSelf: "center", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: 6, zIndex: 2,
  },
  hereFlagTxt: { fontFamily: body.semibold, fontSize: 11, color: "#1a1205" },

  floorFoot: { alignItems: "center", marginTop: 8, marginBottom: 6 },
  pipRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, justifyContent: "center" },
  pip: {
    minWidth: 24, height: 24, borderRadius: 7, paddingHorizontal: 5,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.cardLine, backgroundColor: "rgba(255,255,255,0.04)",
  },
  pipTxt: { fontFamily: disp.semibold, fontSize: 11, color: colors.text3 },
  floorXp: { fontFamily: body.medium, fontSize: 11.5, color: colors.text2, marginTop: 8 },

  ground: {
    width: SCREEN_W - 40, height: 54, borderRadius: 8, marginTop: 4,
    backgroundColor: "#141d2b", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  gate: {
    position: "absolute", bottom: 0, width: 40, height: 34,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  groundTxt: { fontFamily: disp.semibold, fontSize: 11, letterSpacing: 2, color: colors.text3, marginBottom: 14 },

  footNote: { fontFamily: body.regular, fontSize: 12.5, lineHeight: 19, color: colors.text3, textAlign: "center", marginTop: 24, paddingHorizontal: 10 },
});