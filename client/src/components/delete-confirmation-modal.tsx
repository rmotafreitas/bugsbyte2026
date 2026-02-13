import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "../constants/theme";

interface DeleteConfirmationModalProps {
  isVisible: boolean;
  chatTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  isVisible,
  chatTitle,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const [animation] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.spring(animation, {
      toValue: isVisible ? 1 : 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [isVisible]);

  const modalScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const modalOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ scale: modalScale }],
              opacity: modalOpacity,
            },
          ]}
        >
          <View style={styles.warningIcon}>
            <Ionicons
              name="warning-outline"
              size={32}
              color={THEME.colors.destructive}
            />
          </View>

          <Text style={styles.title}>Delete Chat</Text>
          <Text style={styles.message}>
            Are you sure you want to delete "{chatTitle}"? This action cannot be
            undone.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={THEME.colors.destructiveForeground}
                style={styles.deleteIcon}
              />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.radius.default,
    padding: THEME.spacing.large,
    width: Dimensions.get("window").width - THEME.spacing.large * 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  warningIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.destructive + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: THEME.spacing.medium,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: THEME.colors.foreground,
    marginBottom: THEME.spacing.small,
  },
  message: {
    fontSize: 16,
    color: THEME.colors.mutedForeground,
    textAlign: "center",
    marginBottom: THEME.spacing.large,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: THEME.spacing.small,
  },
  button: {
    flex: 1,
    paddingVertical: THEME.spacing.medium,
    borderRadius: THEME.radius.default,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  cancelButton: {
    backgroundColor: THEME.colors.muted,
  },
  deleteButton: {
    backgroundColor: THEME.colors.destructive,
  },
  cancelButtonText: {
    color: THEME.colors.foreground,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButtonText: {
    color: THEME.colors.destructiveForeground,
    fontSize: 16,
    fontWeight: "600",
  },
  deleteIcon: {
    marginRight: 8,
  },
});
