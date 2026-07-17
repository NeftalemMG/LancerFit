import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  View,
  StyleSheet,
  Keyboard,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, shadow } from "../theme/tokens";

export default function BottomSheetModal({
  visible,
  onClose,
  children,
  maxHeightRatio = 0.75,
  dismissKeyboardOnBackdrop = true,
}) {
  const insets = useSafeAreaInsets();

  const finalBgColor = colors.bg1 || colors.card;

  useEffect(() => {
    if (!visible) return undefined;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose]);

  const handleBackdropPress = () => {
    if (dismissKeyboardOnBackdrop) Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
          <View
            style={[
              styles.modalWrapper,
              { maxHeight: `${maxHeightRatio * 100}%` },
            ]}
          >
            <Pressable
              style={[
                styles.panel,
                {
                  backgroundColor: finalBgColor,
                  paddingBottom: 20 + insets.bottom,
                },
              ]}
              onPress={() => dismissKeyboardOnBackdrop && Keyboard.dismiss()}
            >
              <View style={styles.grab} />
              {children}

              <View
                style={[
                  styles.underSheetSkirt,
                  { backgroundColor: finalBgColor },
                ]}
              />
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(2,10,20,0.78)",
  },
  modalWrapper: {
    width: "100%",
    flexShrink: 1,
  },
  panel: {
    width: "100%",
    maxHeight: "100%",
    flexShrink: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: colors.cardLine2,
    position: "relative",
    ...shadow.pop,
  },
  grab: {
    width: 42,
    height: 5,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignSelf: "center",
    marginBottom: 12,
  },
  // This extends way below the screen to block any background leaks
  underSheetSkirt: {
    position: "absolute",
    bottom: -200,
    left: 0,
    right: 0,
    height: 200,
  },
});
