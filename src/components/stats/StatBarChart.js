import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Line } from "react-native-svg";
import { colors } from "../../theme/tokens";
import { body } from "../../theme/typography";

const CHART_HEIGHT = 160;
const AXIS_LABEL_EVERY = (count) => (count > 12 ? Math.ceil(count / 6) : count > 7 ? 2 : 1);

export default function StatBarChart({ buckets = [], metric = "totalDuration", unitLabel = "" }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e) => setWidth(e.nativeEvent.layout.width);
  const values = buckets.map((b) => Number(b?.[metric] ?? 0));
  const max = Math.max(1, ...values);
  const n = buckets.length || 1;
  const gap = n > 20 ? 2 : 4;
  const barW = width > 0 ? Math.max(2, (width - gap * (n - 1)) / n) : 0;
  const labelEvery = AXIS_LABEL_EVERY(n);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={CHART_HEIGHT}>
          <Line x1={0} y1={CHART_HEIGHT - 22} x2={width} y2={CHART_HEIGHT - 22} stroke={colors.cardLine} strokeWidth={1} />
          {buckets.map((b, i) => {
            const v = Number(b?.[metric] ?? 0);
            const h = Math.round((v / max) * (CHART_HEIGHT - 34));
            const x = i * (barW + gap);
            const y = CHART_HEIGHT - 22 - h;
            const active = v > 0;
            return (
              <Rect key={i} x={x} y={y} width={barW} height={Math.max(active ? 3 : 0, h)}
                rx={barW > 6 ? 3 : 1} fill={active ? colors.blue2 : colors.cardLine} />
            );
          })}
        </Svg>
      )}
      <View style={styles.axis}>
        {buckets.map((b, i) => (
          <Text key={i} style={[styles.axisLabel, { width: barW + gap }]} numberOfLines={1}>
            {i % labelEvery === 0 ? b.label : ""}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  axis: { flexDirection: "row", marginTop: 4 },
  axisLabel: { fontFamily: body.regular, color: colors.text3, textAlign: "center", fontSize: 9 },
});