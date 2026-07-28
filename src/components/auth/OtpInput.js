import React, { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { colors, radius } from "../../theme/tokens";
import { disp } from "../../theme/typography";

export default function OtpInput({ value = "", onChangeText, length = 6 }) {
  const inputs = useRef([]);

  const values = Array(length)
    .fill("")
    .map((_, i) => value[i] || "");

  const updateCode = (text, index) => {
    const digits = text.replace(/[^0-9]/g, "");

    if (!digits) {
      const newValue = [...values];
      newValue[index] = "";
      onChangeText(newValue.join(""));
      return;
    }

    const newValue = [...values];
    let nextIndex = index;

    for (let i = 0; i < digits.length && index + i < length; i++) {
      newValue[index + i] = digits[i];
      nextIndex = index + i;
    }

    onChangeText(newValue.join(""));

    const focusIndex = Math.min(nextIndex + 1, length - 1);
    inputs.current[focusIndex]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!values[index] && index > 0) {
        const newValue = [...values];
        newValue[index - 1] = "";
        onChangeText(newValue.join(""));
        inputs.current[index - 1]?.focus();
      } else if (values[index]) {
        const newValue = [...values];
        newValue[index] = "";
        onChangeText(newValue.join(""));
      }
    }
  };

  return (
    <View style={styles.container}>
      {values.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          value={digit}
          onChangeText={(text) => updateCode(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={length}
          textAlign="center"
          selectTextOnFocus
          style={[
            styles.box,
            digit ? styles.activeBox : null,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    gap: 6, 
  },

  box: {
    flex: 1,
    maxWidth: 44,
    height: 52,
    padding: 0,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardLine2,
    backgroundColor: colors.card,
    fontFamily: disp.bold,
    fontSize: 20,
    color: colors.text,
    textAlign: "center",
  },

  activeBox: {
    borderColor: colors.blue,
  },
});