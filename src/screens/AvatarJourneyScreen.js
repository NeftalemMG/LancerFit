import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Path,
  Circle,
  Ellipse,
  Polygon,
  Defs,
  LinearGradient as SvgGrad,
  RadialGradient,
  Stop,
  G,
  Rect,
} from "react-native-svg";
import { colors, radius } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { useApp } from "../context/AppContext";
import { fmt } from "../data/appData";
import {
  TIER_NAMES,
  tierForLevel,
  themeForFaculty,
  getAvatarSource,
} from "../data/facultyTheme";
import FacultyAvatar from "../components/FacultyAvatar";
import FacultyBadge from "../components/FacultyBadge";
import { ChevronLeft } from "../components/icons";

const { width: SCREEN_W } = Dimensions.get("window");

// The map is drawn on a fixed virtual canvas and scaled to the screen, so every
// landmark, path curve and avatar stop keeps its exact relative position on any
// device. Height is tall — the map scrolls vertically like a real world map.
const MAP_W = 360;
const MAP_H = 1180;
const SCALE = (SCREEN_W - 32) / MAP_W;

// Five regions along the trail, walked from the bottom (start) to the top
// (summit). Coordinates are in MAP_W x MAP_H space. The trail threads between
// them, so a stop's x alternates to make the path wind naturally.
const REGIONS = [
  {
    tier: 1,
    name: "Squire",
    place: "Founders' Meadow",
    startLevel: 1,
    endLevel: 2,
    x: 92,
    y: 1040,
    biome: "meadow",
  },
  {
    tier: 2,
    name: "Knight",
    place: "Ironwood Forest",
    startLevel: 3,
    endLevel: 7,
    x: 258,
    y: 848,
    biome: "forest",
  },
  {
    tier: 3,
    name: "Hero",
    place: "Lancer Lake",
    startLevel: 8,
    endLevel: 13,
    x: 96,
    y: 640,
    biome: "lake",
  },
  {
    tier: 4,
    name: "Legend",
    place: "Stormpeak Pass",
    startLevel: 14,
    endLevel: 19,
    x: 262,
    y: 424,
    biome: "mountain",
  },
  {
    tier: 5,
    name: "Lancer",
    place: "The Crown Citadel",
    startLevel: 20,
    endLevel: 25,
    x: 178,
    y: 196,
    biome: "citadel",
  },
];

const XP_PER_LEVEL = 2000;
const xpForLevel = (lvl) => (lvl - 1) * XP_PER_LEVEL;

// Trail as a single smooth path threading every stop, bottom to top.
const TRAIL_D = `
  M 92 1108
  C 92 1080, 78 1058, 92 1040
  C 120 1010, 210 990, 244 946
  C 268 916, 250 878, 258 848
  C 268 810, 210 786, 168 760
  C 120 730, 78 692, 96 640
  C 112 594, 190 578, 226 540
  C 258 506, 246 462, 262 424
  C 278 382, 226 350, 196 314
  C 168 280, 168 232, 178 196
  C 184 172, 178 150, 178 128
`;

// ── World painting ─────────────────────────────────────────────────────────
//
// A modern floating-island quest map on the app's own navy/gold palette.
// Each tier is a floating island with a minimal biome, hovering in a starlit
// void; the golden trail threads them bottom to top. Clean geometry, one light
// source (upper-left), soft drop shadows for the floating feel.

// Generic floating island: soft shadow far below, faceted rock underside,
// biome-gradient top plate with a rim. Children render ON the top plate.
function Island({ cx, cy, rx = 66, topFill, rimFill, children }) {
  const ry = rx * 0.32;
  return (
    <G>
      {/* drop shadow floating far beneath */}
      <Ellipse cx={cx} cy={cy + 74} rx={rx * 0.78} ry={9} fill="#000" opacity="0.30" />
      {/* rock underside — two facets, lit from the left */}
      <Path
        d={`M ${cx - rx} ${cy} C ${cx - rx * 0.6} ${cy + 30}, ${cx - rx * 0.25} ${cy + 46}, ${cx} ${cy + 52}
            C ${cx + rx * 0.3} ${cy + 46}, ${cx + rx * 0.65} ${cy + 28}, ${cx + rx} ${cy} Z`}
        fill="#1b2b42"
      />
      <Path
        d={`M ${cx - rx} ${cy} C ${cx - rx * 0.6} ${cy + 30}, ${cx - rx * 0.25} ${cy + 46}, ${cx} ${cy + 52}
            C ${cx - rx * 0.1} ${cy + 34}, ${cx - rx * 0.28} ${cy + 16}, ${cx - rx * 0.44} ${cy + 4} Z`}
        fill="#2a3d58"
      />
      {/* hanging root-rocks */}
      <Path d={`M ${cx - rx * 0.32} ${cy + 40} l 5 12 l 6 -8 Z`} fill="#22344e" />
      <Path d={`M ${cx + rx * 0.28} ${cy + 36} l 4 10 l 6 -7 Z`} fill="#22344e" />
      {/* top plate */}
      <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={rimFill} />
      <Ellipse cx={cx} cy={cy - 3} rx={rx - 3} ry={ry - 2.4} fill={topFill} />
      {children}
    </G>
  );
}

// Tiny bare shard for background depth.
function Shard({ cx, cy, rx = 16 }) {
  return (
    <G opacity="0.85">
      <Path d={`M ${cx - rx} ${cy} Q ${cx} ${cy + rx * 1.15} ${cx + rx} ${cy} Z`} fill="#1b2b42" />
      <Ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.34} fill="#2f4767" />
      <Ellipse cx={cx} cy={cy - 1.4} rx={rx - 2} ry={rx * 0.34 - 1.6} fill="#3b587d" />
    </G>
  );
}

// Clean two-tone pine.
function Pine({ x, y, s = 1 }) {
  return (
    <G>
      <Polygon points={`${x},${y - 24 * s} ${x - 9 * s},${y} ${x + 9 * s},${y}`} fill="#1f5c46" />
      <Polygon points={`${x},${y - 24 * s} ${x - 9 * s},${y} ${x} ${y}`} fill="#2d7d5c" />
      <Rect x={x - 1.8 * s} y={y - 1} width={3.6 * s} height={5.5 * s} rx={1} fill="#3a2f22" />
    </G>
  );
}

// Round leafy tree.
function LeafTree({ x, y, s = 1 }) {
  return (
    <G>
      <Rect x={x - 1.8 * s} y={y - 4 * s} width={3.6 * s} height={8 * s} rx={1.4} fill="#3a2f22" />
      <Circle cx={x} cy={y - 11 * s} r={8.5 * s} fill="#2d7d5c" />
      <Circle cx={x - 3 * s} cy={y - 13 * s} r={4.5 * s} fill="#49a06f" />
    </G>
  );
}

function MapTerrain({ accent, width, height }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
      <Defs>
        <SvgGrad id="void" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0e2138" />
          <Stop offset="0.55" stopColor="#0b1a2e" />
          <Stop offset="1" stopColor="#091524" />
        </SvgGrad>
        <SvgGrad id="meadowTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#57b46c" />
          <Stop offset="1" stopColor="#3c8f55" />
        </SvgGrad>
        <SvgGrad id="forestTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3f9a62" />
          <Stop offset="1" stopColor="#2a7550" />
        </SvgGrad>
        <SvgGrad id="lakeTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4f9a54" />
          <Stop offset="1" stopColor="#39804a" />
        </SvgGrad>
        <SvgGrad id="peakTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#93a2b8" />
          <Stop offset="1" stopColor="#67788f" />
        </SvgGrad>
        <SvgGrad id="citadelTop" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e8d59a" />
          <Stop offset="1" stopColor="#c2a866" />
        </SvgGrad>
        <SvgGrad id="water" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7fd8f2" />
          <Stop offset="1" stopColor="#2f9ec4" />
        </SvgGrad>
        <SvgGrad id="keep" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#e6d193" />
          <Stop offset="1" stopColor="#b3945a" />
        </SvgGrad>
        <RadialGradient id="glowTop" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#F0CF6E" stopOpacity="0.16" />
          <Stop offset="1" stopColor="#F0CF6E" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glowAccent" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={accent} stopOpacity="0.14" />
          <Stop offset="1" stopColor={accent} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* ═══ THE VOID ═══ */}
      <Rect x="0" y="0" width={MAP_W} height={MAP_H} fill="url(#void)" />
      {/* nebula glows */}
      <Ellipse cx="180" cy="170" rx="190" ry="150" fill="url(#glowTop)" />
      <Ellipse cx="90" cy="650" rx="170" ry="140" fill="url(#glowAccent)" />
      <Ellipse cx="270" cy="1010" rx="160" ry="130" fill="url(#glowAccent)" />
      {/* starfield */}
      {[
        [30, 90, 1.4], [312, 140, 1.1], [60, 260, 1], [330, 320, 1.5], [22, 420, 1.1],
        [300, 560, 1.3], [40, 720, 1], [326, 760, 1.2], [26, 900, 1.4], [308, 930, 1],
        [150, 60, 1], [230, 350, 1], [120, 500, 1.2], [210, 700, 1], [70, 1120, 1.3],
        [250, 1130, 1], [180, 950, 1.1], [140, 300, 0.9], [280, 220, 0.9], [90, 380, 0.9],
      ].map(([sx, sy, sr], i) => (
        <Circle key={`st${i}`} cx={sx} cy={sy} r={sr} fill="#cfe0f2" opacity={i % 3 === 0 ? 0.7 : 0.35} />
      ))}

      {/* background shards for depth */}
      <Shard cx={40} cy={330} rx={15} />
      <Shard cx={318} cy={520} rx={13} />
      <Shard cx={36} cy={880} rx={17} />
      <Shard cx={318} cy={250} rx={11} />
      <Shard cx={300} cy={1105} rx={14} />

      {/* ═══ THE TRAIL (kept — casing, dusty fill, dashed centre) ═══ */}
      <Path d={TRAIL_D} stroke="#3b2f1e" strokeWidth="15" fill="none" strokeLinecap="round" opacity="0.35" />
      <Path d={TRAIL_D} stroke="#d8c08a" strokeWidth="10" fill="none" strokeLinecap="round" />
      <Path d={TRAIL_D} stroke="#a58d5c" strokeWidth="2" strokeDasharray="7 9" fill="none" strokeLinecap="round" opacity="0.85" />

      {/* ═══ THE FIVE ISLANDS (bottom → top) ═══ */}

      {/* 1 · Founders' Meadow — Squire */}
      <Island cx={92} cy={1052} rx={72} topFill="url(#meadowTop)" rimFill="#2f7245">
        <LeafTree x={48} y={1046} s={0.9} />
        <LeafTree x={136} y={1050} s={0.75} />
        {[[74, 1058], [96, 1064], [116, 1056], [104, 1044]].map(([fx, fy], i) => (
          <Circle key={`mf${i}`} cx={fx} cy={fy} r="2.2" fill="#F0CF6E" />
        ))}
      </Island>

      {/* 2 · Ironwood Forest — Knight */}
      <Island cx={258} cy={860} rx={70} topFill="url(#forestTop)" rimFill="#1f5c46">
        <Pine x={220} y={856} s={1.05} />
        <Pine x={244} y={846} s={0.85} />
        <Pine x={292} y={854} s={1.15} />
        <Pine x={272} y={866} s={0.8} />
      </Island>

      {/* 3 · Lancer Lake — Hero */}
      <Island cx={96} cy={652} rx={72} topFill="url(#lakeTop)" rimFill="#2c6b40">
        <Ellipse cx={96} cy={652} rx={40} ry={13} fill="#256b8c" />
        <Ellipse cx={96} cy={651} rx={36} ry={11} fill="url(#water)" />
        <Path d="M74 648 q 11 -3.5 22 0 t 22 0" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.6" strokeLinecap="round" />
        <Pine x={46} y={648} s={0.75} />
        <LeafTree x={148} y={650} s={0.7} />
      </Island>

      {/* 4 · Stormpeak Pass — Legend */}
      <Island cx={262} cy={438} rx={70} topFill="url(#peakTop)" rimFill="#4d5d75">
        <Polygon points="238,432 262,384 286,432" fill="#4d5d75" />
        <Polygon points="238,432 262,384 262,432" fill="#7488a3" />
        <Polygon points="255,398 262,384 269,398 264,395 262,399 258,394" fill="#eef5fc" />
        <Polygon points="286,436 302,406 318,436" fill="#5a6b84" />
        <Polygon points="212,436 224,414 236,436" fill="#5a6b84" />
      </Island>

      {/* 5 · The Crown Citadel — Lancer */}
      <Island cx={178} cy={214} rx={76} topFill="url(#citadelTop)" rimFill="#9a7f47">
        {/* keep */}
        <Rect x={158} y={162} width={40} height={50} rx={3} fill="url(#keep)" />
        <Rect x={158} y={162} width={12} height={50} rx={3} fill="#f2e2ab" opacity="0.5" />
        {/* crenellations */}
        {[0, 1, 2, 3].map((c) => (
          <Rect key={`cr${c}`} x={159 + c * 10.4} y={156} width={7} height={8} rx={1.4} fill="url(#keep)" />
        ))}
        {/* flanking turrets */}
        <Rect x={144} y={178} width={13} height={34} rx={2.5} fill="#c2a866" />
        <Rect x={199} y={178} width={13} height={34} rx={2.5} fill="#c2a866" />
        <Polygon points="150.5,166 158,179 143,179" fill={accent} />
        <Polygon points="205.5,166 213,179 198,179" fill={accent} />
        {/* glowing windows */}
        <Rect x={170} y={176} width={5} height={8} rx={2} fill="#F0CF6E" />
        <Rect x={181} y={176} width={5} height={8} rx={2} fill="#F0CF6E" />
        <Rect x={175.5} y={192} width={5} height={9} rx={2} fill="#F0CF6E" />
        {/* banner */}
        <Rect x={177} y={136} width={2} height={22} fill="#8a6f3f" />
        <Path d={`M 179 138 L 196 143 L 179 149 Z`} fill={accent} />
      </Island>
    </Svg>
  );
}

// ── A single stop marker on the map ────────────────────────────────────────

function MapStop({ region, level, facultyKey, theme }) {
  const unlocked = level >= region.startLevel;
  const isCurrent = tierForLevel(level) === region.tier;
  const src = getAvatarSource(facultyKey, region.startLevel);

  // Marker is centred on the region's map coordinate, scaled to screen.
  const left = region.x * SCALE - 44;
  const top = region.y * SCALE - 44;

  return (
    <View style={[styles.stop, { left, top }]} pointerEvents="none">
      {/* soft glow under the current stop */}
      {isCurrent && (
        <View style={[styles.stopGlow, { backgroundColor: theme.accent }]} />
      )}

      <View
        style={[
          styles.stopMedallion,
          {
            borderColor: isCurrent
              ? colors.gold
              : unlocked
                ? theme.accent
                : "rgba(255,255,255,0.30)",
            backgroundColor: unlocked ? "#F0CF6E" : "#243244",
          },
          isCurrent && styles.stopMedallionCurrent,
        ]}
      >
        {src ? (
          <Image
            source={src}
            style={styles.stopAvatar}
            resizeMode="contain"
          />
        ) : (
          <FacultyAvatar facultyKey={facultyKey} level={region.startLevel} size={58} goldBg />
        )}

        {/* Locked avatars stay VISIBLE (user asked to still see them) but are
            desaturated behind a frosted scrim with a lock. */}
        {!unlocked && (
          <View style={styles.stopLockScrim}>
            <Text style={styles.stopLockGlyph}>🔒</Text>
          </View>
        )}

        {unlocked && !isCurrent && (
          <View style={[styles.stopTick, { backgroundColor: theme.accent }]}>
            <Text style={styles.stopTickTxt}>✓</Text>
          </View>
        )}
      </View>

      {/* name plate under the medallion */}
      <View
        style={[
          styles.stopPlate,
          isCurrent && { backgroundColor: colors.gold },
          !unlocked && { backgroundColor: "rgba(10,26,44,0.85)" },
        ]}
      >
        <Text
          style={[
            styles.stopPlateName,
            isCurrent && { color: "#1a1205" },
            !unlocked && { color: "rgba(255,255,255,0.65)" },
          ]}
          numberOfLines={1}
        >
          {region.name}
        </Text>
        <Text
          style={[
            styles.stopPlateLvl,
            isCurrent && { color: "rgba(26,18,5,0.75)" },
          ]}
          numberOfLines={1}
        >
          Lv {region.startLevel}–{region.endLevel}
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
    navigation?.canGoBack?.()
      ? navigation.goBack()
      : navigation?.navigate?.("profile");

  const mapH = MAP_H * SCALE;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top - 6, 6) }]}>
        <Pressable
          onPress={goBack}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <ChevronLeft size={16} color={colors.gold} strokeWidth={2.8} />
          <Text style={styles.backText}>Profile</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <View style={styles.titleEdge} />
          <View>
            <Text style={styles.eyebrow}>The realm of Lancers</Text>
            <Text style={styles.h1}>Avatar journey</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 44 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Standing summary */}
        <View style={[styles.summary, { borderColor: theme.accentLine }]}>
          <LinearGradient
            colors={[theme.accentSoft, "rgba(255,255,255,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.sumAvatarBox}>
            <FacultyAvatar facultyKey={facultyKey} level={level} size={54} goldBg />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.sumTier} numberOfLines={1}>
              {TIER_NAMES[currentTier - 1]}
            </Text>
            <Text style={styles.sumSub} numberOfLines={1}>
              Level {level} · {fmt(totalXp)} XP
            </Text>
            <View style={styles.facultyRow}>
              <FacultyBadge facultyKey={facultyKey} size={16} />
              <Text
                style={[styles.facultyName, { color: theme.accent }]}
                numberOfLines={1}
              >
                {facultyName}
              </Text>
            </View>
          </View>
          <View style={styles.sumBadge}>
            <Text style={styles.sumBadgeNum}>{currentTier}</Text>
            <Text style={styles.sumBadgeLbl}>of 5</Text>
          </View>
        </View>

        <Text style={styles.mapHint}>
          Follow the trail north — each landmark unlocks a new avatar.
        </Text>

        {/* ── The world map ── */}
        <View style={[styles.mapFrame, { height: mapH }]}>
          <View style={styles.mapClip}>
            <MapTerrain accent={theme.accent} width={SCREEN_W - 32} height={mapH} />

            {/* stops layered above the terrain */}
            {REGIONS.map((r) => (
              <MapStop
                key={r.tier}
                region={r}
                level={level}
                facultyKey={facultyKey}
                theme={theme}
              />
            ))}
          </View>
        </View>

        {/* ── Region legend: levels + XP for each stop ── */}
        <View style={styles.legend}>
          {[...REGIONS].reverse().map((r) => {
            const unlocked = level >= r.startLevel;
            const isCurrent = tierForLevel(level) === r.tier;
            return (
              <View
                key={r.tier}
                style={[
                  styles.legendRow,
                  isCurrent && { borderColor: colors.gold, backgroundColor: "rgba(240,207,110,0.07)" },
                ]}
              >
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: unlocked ? theme.accent : "transparent",
                      borderColor: unlocked ? theme.accent : "rgba(255,255,255,0.25)",
                    },
                  ]}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.legendHead}>
                    <Text
                      style={[styles.legendName, !unlocked && { color: colors.text3 }]}
                      numberOfLines={1}
                    >
                      {r.name}
                    </Text>
                    {isCurrent ? (
                      <View style={styles.legendPillNow}>
                        <Text style={styles.legendPillNowTxt}>You are here</Text>
                      </View>
                    ) : unlocked ? (
                      <Text style={[styles.legendState, { color: theme.accent }]}>Cleared</Text>
                    ) : (
                      <Text style={styles.legendStateLocked}>Locked</Text>
                    )}
                  </View>
                  <Text style={styles.legendPlace} numberOfLines={1}>
                    {r.place} · Lv {r.startLevel}–{r.endLevel}
                  </Text>

                  {/* per-level rank pips */}
                  <View style={styles.pipRow}>
                    {Array.from({ length: r.endLevel - r.startLevel + 1 }, (_, k) => {
                      const lvl = r.startLevel + k;
                      const done = level >= lvl;
                      const atNow = level === lvl;
                      return (
                        <View
                          key={lvl}
                          style={[
                            styles.pip,
                            done && {
                              backgroundColor: atNow ? colors.gold : theme.accent,
                              borderColor: "transparent",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.pipTxt,
                              done && { color: atNow ? "#1a1205" : "#fff" },
                            ]}
                          >
                            {lvl}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <Text style={[styles.legendXp, !unlocked && { color: colors.text3 }]}>
                    {unlocked
                      ? `Unlocked · ${fmt(xpForLevel(r.startLevel))} XP`
                      : `${fmt(xpForLevel(r.startLevel))} XP to unlock`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.footNote}>
          Every landmark you reach evolves your avatar. Log workouts and clear
          challenges to journey from the meadow all the way to the Crown Citadel.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.appBg },

  header: { paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  backText: {
    fontFamily: disp.bold,
    fontSize: 15,
    color: colors.gold,
    letterSpacing: -0.2,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 10 },
  titleEdge: { width: 4, height: 38, borderRadius: 2, backgroundColor: colors.gold },
  eyebrow: {
    fontFamily: body.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.text3,
    textTransform: "uppercase",
  },
  h1: {
    fontFamily: disp.bold,
    fontSize: 26,
    letterSpacing: -0.5,
    color: colors.text,
    marginTop: 2,
  },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 16,
  },
  // Fixed box keeps the avatar from overflowing its frame.
  sumAvatarBox: {
    width: 54,
    height: 54,
    borderRadius: 15,
    overflow: "hidden",
    flexShrink: 0,
  },
  sumTier: {
    fontFamily: disp.bold,
    fontSize: 19,
    color: colors.text,
    letterSpacing: -0.3,
  },
  sumSub: { fontFamily: body.medium, fontSize: 12.5, color: colors.text2, marginTop: 2 },
  facultyRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  facultyName: { fontFamily: body.semibold, fontSize: 12, flexShrink: 1 },
  sumBadge: {
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexShrink: 0,
  },
  sumBadgeNum: { fontFamily: disp.bold, fontSize: 21, color: colors.gold },
  sumBadgeLbl: { fontFamily: body.regular, fontSize: 10, color: colors.text3, marginTop: -2 },

  mapHint: {
    fontFamily: body.medium,
    fontSize: 12,
    color: colors.text3,
    textAlign: "center",
    marginBottom: 10,
  },

  mapFrame: {
    width: SCREEN_W - 32,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "#091524",
  },
  mapClip: { flex: 1, position: "relative" },

  // ── stop markers ──
  stop: { position: "absolute", width: 88, alignItems: "center" },
  stopGlow: {
    position: "absolute",
    top: 2,
    width: 76,
    height: 76,
    borderRadius: 38,
    opacity: 0.4,
  },
  stopMedallion: {
    width: 64,
    height: 64,
    borderRadius: 18,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    // shadow lifts the marker off the terrain
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  stopMedallionCurrent: { width: 72, height: 72, borderRadius: 20, borderWidth: 3 },
  // contain + full size prevents the art from spilling out of the frame
  stopAvatar: { width: "100%", height: "100%" },
  stopLockScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(9,24,42,0.62)",
  },
  stopLockGlyph: { fontSize: 20 },
  stopTick: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(9,24,42,0.7)",
  },
  stopTickTxt: { fontSize: 10, color: "#fff", fontWeight: "800" },

  stopPlate: {
    marginTop: 5,
    maxWidth: 88,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(9,24,42,0.85)",
    alignItems: "center",
  },
  stopPlateName: {
    fontFamily: disp.bold,
    fontSize: 12,
    color: "#fff",
    letterSpacing: -0.2,
  },
  stopPlateLvl: {
    fontFamily: body.medium,
    fontSize: 9.5,
    color: "rgba(255,255,255,0.75)",
  },

  // ── legend ──
  legend: { marginTop: 20, gap: 10 },
  legendRow: {
    flexDirection: "row",
    gap: 12,
    padding: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardLine,
    backgroundColor: colors.card,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    marginTop: 4,
    flexShrink: 0,
  },
  legendHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  legendName: {
    fontFamily: disp.bold,
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  legendState: { fontFamily: body.semibold, fontSize: 11 },
  legendStateLocked: { fontFamily: body.semibold, fontSize: 11, color: colors.text3 },
  legendPillNow: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  legendPillNowTxt: { fontFamily: body.semibold, fontSize: 10, color: "#1a1205" },
  legendPlace: {
    fontFamily: body.medium,
    fontSize: 11.5,
    color: colors.text2,
    marginTop: 2,
  },

  pipRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 9 },
  pip: {
    minWidth: 23,
    height: 23,
    borderRadius: 7,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.cardLine,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  pipTxt: { fontFamily: disp.semibold, fontSize: 10.5, color: colors.text3 },

  legendXp: { fontFamily: body.medium, fontSize: 11, color: colors.text2, marginTop: 9 },

  footNote: {
    fontFamily: body.regular,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.text3,
    textAlign: "center",
    marginTop: 22,
    paddingHorizontal: 10,
  },
});