import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../theme/tokens";
import { disp, body } from "../theme/typography";
import { PressScale } from "./ui";
import { submitChallengePoints } from "../services/challengeApi";
import { useApp } from "../context/AppContext";

// The follow-up to joining a challenge. The student did the activity in front
// of TLC staff (say, 50 push-ups); here they log the number. It's sent to the
// admin's Validations queue and only reaches the leaderboard once approved.
//
// Matches the visual language of ChallengeSheet: dark card, gold primary CTA,
// stat-style framing, centred body.
export default function ChallengeResultSheet({ challenge: c, onDone }) {
  const { closeSheet, toast, markChallengeSubmitted } = useApp();
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const unit = c.unit || "reps";
  const parsed = Number(value);
  const valid = value !== "" && Number.isFinite(parsed) && parsed > 0;

  const submit = async () => {
    if (submitting) return;
    if (!valid) {
      setError(`Enter how many ${unit} you completed.`);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitChallengePoints(c.id, parsed);
      markChallengeSubmitted?.(c.id, parsed);
      closeSheet();
      toast(`Sent for review · ${parsed} ${unit}`);
      onDone?.();
    } catch (err) {
      setError(err?.message || "Could not submit your result. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={styles.titleEdge} />
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.eyebrow}>Log your result</Text>
          <Text style={styles.title}>{c.title}</Text>
        </View>
      </View>
      <Text style={styles.desc}>
        Enter what you completed in front of TLC staff. An admin reviews it before
        it counts on the leaderboard.
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(t) => setValue(t.replace(/[^0-9.]/g, ""))}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.text3}
          returnKeyType="done"
          onSubmitEditing={submit}
          autoFocus
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>

      {c.pointsPerUnit ? (
        <Text style={styles.hint}>
          {c.pointsPerUnit} XP per {unit} · up to{" "}
          {valid ? c.pointsPerUnit * parsed : 0} XP pending approval
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PressScale onPress={submit} disabled={submitting} wrapStyle={styles.ctaWrap}>
        <LinearGradient
          colors={[colors.gold, colors.goldDim]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.cta, submitting && { opacity: 0.85 }]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.goldInk} />
          ) : (
            <Text style={styles.ctaText}>Submit for review</Text>
          )}
        </LinearGradient>
      </PressScale>

      <PressScale onPress={closeSheet} wrapStyle={{ marginTop: 10 }}>
        <View style={styles.secondary}>
          <Text style={styles.secondaryText}>Not yet</Text>
        </View>
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 30, alignItems: "stretch" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 11, alignSelf: "flex-start", maxWidth: "100%" },
  titleEdge: { width: 4, height: 34, borderRadius: 2, backgroundColor: colors.gold },
  eyebrow: {
    fontFamily: body.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.gold,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: disp.bold,
    fontSize: 21,
    letterSpacing: -0.5,
    color: colors.text,
    marginTop: 3,
    textAlign: "left",
  },
  desc: {
    marginTop: 12,
    color: colors.text2,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "left",
    fontFamily: body.regular,
  },
  inputRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    alignSelf: "stretch",
    justifyContent: "center",
  },
  input: {
    minWidth: 120,
    textAlign: "center",
    fontFamily: disp.bold,
    fontSize: 40,
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.cardLine2,
    paddingBottom: 4,
  },
  unit: {
    fontFamily: disp.semibold,
    fontSize: 16,
    color: colors.text2,
    marginBottom: 10,
  },
  hint: {
    marginTop: 14,
    fontFamily: body.medium,
    fontSize: 12.5,
    color: colors.text3,
    textAlign: "center",
  },
  error: {
    marginTop: 12,
    fontFamily: body.medium,
    fontSize: 12.5,
    color: colors.gold,
    textAlign: "center",
  },
  ctaWrap: { marginTop: 22, alignSelf: "stretch" },
  cta: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
  },
  ctaText: { fontFamily: disp.bold, fontSize: 14.5, color: colors.goldInk },
  secondary: {
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardLine,
  },
  secondaryText: { fontFamily: disp.bold, fontSize: 13.5, color: colors.text2 },
});