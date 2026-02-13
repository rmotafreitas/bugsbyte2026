import { StyleSheet, Platform, Dimensions } from "react-native";
import { THEME } from "../../constants/theme";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    minHeight: height - (Platform.OS === "ios" ? 90 : 60),
    padding: 20,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginVertical: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.colors.foreground,
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.mutedForeground,
    textAlign: "center",
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.muted,
    borderRadius: THEME.radius.default,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: THEME.colors.foreground,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: THEME.colors.primary,
    fontSize: 14,
  },
  button: {
    backgroundColor: THEME.colors.primary,
    height: 50,
    borderRadius: THEME.radius.default,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: THEME.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    color: THEME.colors.mutedForeground,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.muted,
    height: 50,
    borderRadius: THEME.radius.default,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  socialButtonText: {
    color: THEME.colors.foreground,
    fontSize: 16,
    marginLeft: 10,
  },
  switchAuth: {
    marginTop: 20,
    alignItems: "center",
  },
  switchAuthText: {
    fontSize: 14,
    color: THEME.colors.mutedForeground,
  },
  switchAuthTextHighlight: {
    color: THEME.colors.primary,
    fontWeight: "bold",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.destructive + "15",
    padding: 12,
    borderRadius: THEME.radius.default,
    marginBottom: 16,
  },
  errorText: {
    color: THEME.colors.destructive,
    marginLeft: 8,
    flex: 1,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.muted,
    borderRadius: THEME.radius.default,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    height: 50,
    paddingHorizontal: 10,
  },
  datePickerText: {
    flex: 1,
    color: THEME.colors.foreground,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: THEME.colors.muted,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.default,
  },
  dropdownText: {
    color: THEME.colors.foreground,
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 16,
    zIndex: Platform.OS === "ios" ? 1000 : undefined, // Only apply zIndex on iOS
  },
});
