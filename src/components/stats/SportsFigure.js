// The looping stick-figure sports animation used on the Stats hub. Shown big as
// the empty-state hero when the user has no logged exercises, and repeated
// smaller down the page as a playful divider once they do (one per few
// exercises), so an active user sees a little run of athletes as they scroll.

import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

export default function SportsFigure({ size = 160, style }) {
  return (
    <View style={[styles.wrap, style]}>
      <LottieView
        source={require("../../../assets/animations/sports-figure.json")}
        autoPlay
        loop
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});