import React, { useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import AuthHeader from "../components/auth/AuthHeader";
import AuthField from "../components/auth/AuthField";

import { Card, KeyboardScreen, PressScale } from "../components/ui";
import { ArrowRight } from "../components/icons";

import { colors, radius, shadow } from "../theme/tokens";
import { disp, body } from "../theme/typography";

import { resetPassword } from "../services/authApi";
import { validateResetPassword } from "../utils/authValidation";

export default function ResetPasswordScreen({ route, navigation }) {
  const { resetTokenId } = route.params;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const confirmPasswordRef = useRef(null);

  const submit = async () => {
    if (submitting) return;

    const result = validateResetPassword({
      password,
      confirmPassword,
    });

    setErrors(result.errors);
    setSubmitError("");

    if (!result.valid) {
      return;
    }

    try {
      setSubmitting(true);

      await resetPassword({
        resetTokenId,
        password: result.values.password,
        confirmPassword: result.values.confirmPassword,
      });

      navigation.replace("signin", {
        passwordResetSuccess: true,
      });
    } catch (error) {
      setSubmitError(
        error?.message || "Unable to reset password. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <AuthHeader
        title="Create New Password"
        subtitle="Choose a new password for your account."
        note="Password Recovery"
      />

      <KeyboardScreen
        contentContainerStyle={styles.body}
        keyboardVerticalOffset={12}
      >
        <Card style={styles.formCard}>
          <AuthField
            label="New Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a new password"
            textContentType="newPassword"
            autoComplete="new-password"
            secureTextEntry={!showPassword}
            preventCopyPaste
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            error={errors.password}
            rightSlot={
              <PressScale onPress={() => setShowPassword((value) => !value)}>
                <Text style={styles.toggleText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </PressScale>
            }
          />

          <AuthField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            inputRef={confirmPasswordRef}
            textContentType="newPassword"
            autoComplete="new-password"
            secureTextEntry={!showConfirmPassword}
            preventCopyPaste
            returnKeyType="done"
            onSubmitEditing={submit}
            error={errors.confirmPassword}
            rightSlot={
              <PressScale
                onPress={() => setShowConfirmPassword((value) => !value)}
              >
                <Text style={styles.toggleText}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </Text>
              </PressScale>
            }
          />

          {submitError ? (
            <Text style={styles.submitError}>{submitError}</Text>
          ) : null}

          <PressScale
            onPress={submit}
            disabled={submitting}
            scaleTo={0.98}
            style={styles.submitWrap}
          >
            <LinearGradient
              colors={[colors.blue2, colors.blue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            >
              <Text style={styles.submitText}>
                {submitting ? "Updating Password..." : "Reset Password"}
              </Text>

              <ArrowRight size={17} color="#fff" strokeWidth={2.4} />
            </LinearGradient>
          </PressScale>
        </Card>
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
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
  },

  formCard: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardLine2,
    ...shadow.card,
  },

  toggleText: {
    fontFamily: disp.semibold,
    fontSize: 12,
    color: colors.blue,
  },

  submitWrap: {
    marginTop: 2,
  },

  submitBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    ...shadow.accent("rgba(47,123,196,0.8)"),
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
    marginTop: 2,
    marginBottom: 10,
    fontFamily: body.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.gold,
  },
});
