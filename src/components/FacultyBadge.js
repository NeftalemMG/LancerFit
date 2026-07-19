// A faculty's crest, shown inside the same rounded "carrel" box the avatars use
// so badges and avatars line up identically on the leaderboard. Instead of the
// solid caramel/gold fill, the box is a translucent GLASS panel tinted with the
// faculty's own accent color (so the board reads as color-coded by faculty),
// with a soft top-light sheen for the glass feel.
//
// The badge art (assets/facultyBadges/1..9.png) sits inside via contain, so the
// varying source dimensions all align. If an image ever fails to resolve, a
// single SVG crest fallback — tinted to the faculty — renders instead, so the
// board never shows an empty slot.

import React, { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import Svg, { Path, Defs, LinearGradient as SvgGrad, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { themeForFaculty } from "../data/facultyTheme";
import { badgeSourceFor } from "../data/facultyBadgeSources";

export default function FacultyBadge({ facultyKey, size = 44, glass = true }) {
  const theme = themeForFaculty(facultyKey);
  const source = badgeSourceFor(facultyKey);
  const [failed, setFailed] = useState(false);
  const radius = size * 0.28;

  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: radius, borderColor: theme.accentLine }]}>
      {/* Glass tint: faint faculty-colored gradient + a top sheen. */}
      {glass && (
        <>
          <LinearGradient
            colors={[withAlpha(theme.accent, 0.22), withAlpha(theme.accent, 0.06)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.16)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.6 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          />
        </>
      )}

      {source && !failed ? (
        <Image
          source={source}
          onError={() => setFailed(true)}
          style={{ width: size * 0.72, height: size * 0.72 }}
          resizeMode="contain"
        />
      ) : (
        <CrestFallback size={size} accent={theme.accent} />
      )}
    </View>
  );
}

// One SVG crest, tinted per faculty, covers every faculty as a placeholder.
function CrestFallback({ size, accent }) {
  const s = size * 0.6;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 110">
      <Defs>
        <SvgGrad id="crestFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={accent} stopOpacity="0.35" />
          <Stop offset="1" stopColor={accent} stopOpacity="0.10" />
        </SvgGrad>
      </Defs>
      <Path
        d="M50 4 L92 20 V52 C92 82 72 100 50 106 C28 100 8 82 8 52 V20 Z"
        fill="url(#crestFill)"
        stroke={accent}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <Path
        d="M50 26 L50 84 M34 40 L50 30 L66 40"
        stroke={accent}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// #RRGGBB -> rgba() with the given alpha.
function withAlpha(hex, alpha) {
  const h = String(hex || "#4A93D8").replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
});