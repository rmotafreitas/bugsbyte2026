import { StyleSheet } from "react-native";
import { THEME } from "../../constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: 18,
    color: THEME.COLORS.TEXT,
    letterSpacing: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: THEME.COLORS.TEXT,
    fontFamily: THEME.FONT_FAMILY.REGULAR,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 8,
  },

  // Content
  content: {
    flex: 1,
  },
  title: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: 32,
    color: THEME.COLORS.TEXT,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.MD,
    color: THEME.COLORS.GRAY_TEXT,
    marginBottom: 40,
    lineHeight: 22,
  },

  // Form
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.SM,
    color: THEME.COLORS.TEXT,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.MD,
    color: THEME.COLORS.TEXT,
    backgroundColor: THEME.COLORS.BACKGROUND_900,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.SM,
    color: THEME.COLORS.TEXT,
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 16,
  },
  loginButton: {
    backgroundColor: THEME.COLORS.TEXT,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: THEME.COLORS.WHITE_TEXT,
    fontSize: THEME.FONT_SIZE.MD,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    letterSpacing: 2,
  },
  signupPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupPromptText: {
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.MD,
    color: THEME.COLORS.GRAY_TEXT,
  },
  signupLink: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.MD,
    color: THEME.COLORS.TEXT,
    textDecorationLine: "underline",
  },
});
