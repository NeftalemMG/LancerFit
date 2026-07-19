// The user's avatar, themed to their faculty and evolving with their level.
// Renders the faculty's level-up artwork when present; when the art is missing, 
// it draws a fallback crest with the faculty's accent color and the tier initial.
// so the app never breaks and still looks intentional.
//
// Because the source images vary in width/height, we render them inside a fixed
// square with resizeMode="contain" on a subtle themed disc, so every faculty and
// tier lines up identically regardless of the raw image dimensions.

import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { getAvatarSource, themeForFaculty, tierName } from "../data/facultyTheme";
import { disp } from "../theme/typography";
import { colors } from "../theme/tokens";

export default function FacultyAvatar({ facultyKey, level = 1, size = 56, showRing = true, goldBg = false }) {
  const theme = themeForFaculty(facultyKey);
  const source = getAvatarSource(facultyKey, level);

  // goldBg: the avatar sits on the site's gold so background-removed knight art
  // (whose native colors are mostly blue) pops against the theme.
  const bgStyle = goldBg
    ? { backgroundColor: colors.gold, borderWidth: 1.5, borderColor: colors.goldDim }
    : showRing
      ? { borderWidth: 1.5, borderColor: theme.accentLine, backgroundColor: theme.accentSoft }
      : null;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.28 }, bgStyle]}>
      {source ? (
        <Image source={source} style={{ width: size * 0.86, height: size * 0.86 }} resizeMode="contain" />
      ) : (
        <CrestFallback size={size} accent={goldBg ? colors.goldInk : theme.accent} level={level} />
      )}
    </View>
  );
}

// Themed shield used until the real art is dropped in. Colored to the faculty.
function CrestFallback({ size, accent, level }) {
  const s = size * 0.62;
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={s} height={s} viewBox="0 0 100 110">
        <Path
          d="M50 4 L92 20 V52 C92 82 72 100 50 106 C28 100 8 82 8 52 V20 Z"
          fill="none"
          stroke={accent}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        <Path d="M50 26 L50 84 M34 40 L50 30 L66 40" stroke={accent} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
      <Text style={[styles.tierInitial, { color: accent, fontSize: size * 0.16 }]}>
        {tierName(level)[0]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  tierInitial: { position: "absolute", bottom: 2, fontFamily: disp.bold },
});