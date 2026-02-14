import { StyleSheet, Platform, Dimensions } from "react-native";
import { THEME } from "../../constants/theme";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    minHeight: height - (Platform.OS === "ios" ? 40 : 20),
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${THEME.colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  appName: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.colors.primary,
    letterSpacing: 3,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.colors.foreground,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.mutedForeground,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.default,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    height: 56,
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    color: THEME.colors.foreground,
    fontSize: 16,
    paddingRight: 16,
  },
  passwordToggle: {
    padding: 16,
  },
  button: {
    backgroundColor: THEME.colors.primary,
    height: 56,
    borderRadius: THEME.radius.default,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: THEME.colors.primaryForeground,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  demoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: `${THEME.colors.secondary}10`,
    borderRadius: 8,
    gap: 8,
  },
  demoText: {
    color: THEME.colors.secondary,
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  switchAuth: {
    alignItems: "center",
    marginBottom: 24,
  },
  switchAuthText: {
    fontSize: 14,
    color: THEME.colors.mutedForeground,
  },
  switchAuthTextHighlight: {
    color: THEME.colors.primary,
    fontWeight: "700",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${THEME.colors.destructive}15`,
    padding: 16,
    borderRadius: THEME.radius.default,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${THEME.colors.destructive}30`,
  },
  errorText: {
    color: THEME.colors.destructive,
    marginLeft: 12,
    flex: 1,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  featureItem: {
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 10,
    color: THEME.colors.mutedForeground,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
