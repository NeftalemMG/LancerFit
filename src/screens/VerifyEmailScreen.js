import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import AuthHeader from "../components/auth/AuthHeader";
import AuthField from "../components/auth/AuthField";

import { Card, KeyboardScreen, PressScale } from "../components/ui";
import { ArrowRight } from "../components/icons";

import { colors, radius, shadow } from "../theme/tokens";
import { disp, body } from "../theme/typography";

import {
  verifyEmail,
  resendVerificationCode,
} from "../services/authApi";

export default function VerifyEmailScreen({
  route,
  navigation,
}) {
  const email = route?.params?.email ?? "";

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const submit = async () => {
    if (submitting) return;

    setSubmitError("");
    setSuccessMessage("");

    if (!code.trim()) {
      setSubmitError("Verification code is required.");
      return;
    }

    try {
      setSubmitting(true);

      await verifyEmail({
        email,
        code: code.trim(),
      });

      navigation.navigate("signin");
    } catch (error) {
      setSubmitError(
        error?.message ||
          "Unable to verify email. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (resending) return;

    try {
      setResending(true);
      setSubmitError("");
      setSuccessMessage("");

      await resendVerificationCode({
        email,
      });

      setSuccessMessage(
        "A new verification code has been sent."
      );
    } catch (error) {
      setSubmitError(
        error?.message ||
          "Unable to resend verification code."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.root}>
      <AuthHeader
        title="Verify Email"
        subtitle={`We've sent a 6-digit verification code to ${email}.`}
        note="Built for the Toldo Lancer Centre experience."
      />

      <KeyboardScreen
        contentContainerStyle={styles.body}
        keyboardVerticalOffset={12}
      >
        <Card style={styles.formCard}>
          {/* <Text style={styles.emailText}>
            {email}
          </Text> */}

          <AuthField
            label="Verification Code"
            value={code}
            onChangeText={setCode}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          {submitError ? (
            <Text style={styles.submitError}>
              {submitError}
            </Text>
          ) : null}

          {successMessage ? (
            <Text style={styles.successText}>
              {successMessage}
            </Text>
          ) : null}

          <PressScale
            onPress={submit}
            scaleTo={0.98}
            disabled={submitting}
            style={styles.submitWrap}
          >
            <LinearGradient
              colors={[colors.blue2, colors.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[
                styles.submitBtn,
                submitting &&
                  styles.submitBtnDisabled,
              ]}
            >
              <Text style={styles.submitText}>
                {submitting
                  ? "Verifying…"
                  : "Verify Email"}
              </Text>

              <ArrowRight
                size={17}
                color="#fff"
                strokeWidth={2.4}
              />
            </LinearGradient>
          </PressScale>
        </Card>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            Didn't receive a code?
          </Text>

          <PressScale
            onPress={resendCode}
            disabled={resending}
          >
            <Text style={styles.footerLink}>
              {resending
                ? "Sending..."
                : "Resend Code"}
            </Text>
          </PressScale>
        </View>
      </KeyboardScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },

  body: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 24,
  },

  formCard: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardLine2,
    ...shadow.card,
  },

  emailText: {
    fontFamily: body.medium,
    fontSize: 13,
    color: colors.text2,
    textAlign: "center",
    marginBottom: 14,
  },

  submitWrap: {
    marginTop: 4,
  },

  submitBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    ...shadow.accent(
      "rgba(47,123,196,0.8)"
    ),
  },

  submitBtnDisabled: {
    opacity: 0.86,
  },

  submitText: {
    fontFamily: disp.bold,
    fontSize: 15.5,
    color: "#fff",
  },

  submitError: {
    marginTop: 4,
    marginBottom: 8,
    fontFamily: body.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.gold,
  },

  successText: {
    marginTop: 4,
    marginBottom: 8,
    fontFamily: body.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.blue,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    flexWrap: "wrap",
  },

  footerText: {
    fontFamily: body.regular,
    fontSize: 13,
    color: colors.text2,
  },

  footerLink: {
    fontFamily: disp.bold,
    fontSize: 13,
    color: colors.gold,
  },
});