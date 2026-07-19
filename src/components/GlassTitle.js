// A compact, modern page title. Instead of a big bubble, the title sits with a
// short GOLDEN edge accent bar on its left and a subtle gradient underline, so
// it reads as a designed element without dominating the screen. Used across
// Log / Stats / Exercise detail for a consistent, restrained, Apple-ish look.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/tokens";
import { disp, body } from "../theme/typography";

export default function GlassTitle({ title, subtitle, size = "md" }) {
  const titleSize = size === "lg" ? 26 : 21;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {/* golden edge accent */}
        <LinearGradient
          colors={[colors.gold, colors.goldDim]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.edge}
        />
        <View style={{ flexShrink: 1 }}>
          <Text style={[styles.title, { fontSize: titleSize }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {/* subtle gradient underline */}
      <LinearGradient
        colors={["rgba(216,169,74,0.55)", "rgba(216,169,74,0.0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.underline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: "flex-start", maxWidth: "100%" },
  row: { flexDirection: "row", alignItems: "center", gap: 11 },
  edge: { width: 4, height: 30, borderRadius: 2 },
  title: { fontFamily: disp.bold, letterSpacing: -0.5, color: colors.text },
  subtitle: { fontFamily: body.regular, fontSize: 13, color: colors.text2, marginTop: 2 },
  underline: { height: 2, borderRadius: 2, marginTop: 8, width: 128 },
});