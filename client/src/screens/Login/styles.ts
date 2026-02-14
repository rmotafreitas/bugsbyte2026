import { StyleSheet } from "react-native";
import { THEME } from "../../constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.TEXT,
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  brand: {
    fontSize: 56,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    color: THEME.COLORS.WHITE_TEXT,
    letterSpacing: 16,
  },
  brandSub: {
    fontSize: 18,
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    color: THEME.COLORS.WHITE_TEXT,
    letterSpacing: 12,
    marginTop: -4,
    opacity: 0.6,
  },
  bottomSection: {
    backgroundColor: THEME.COLORS.WHITE_TEXT,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 40,
  },
  bottomContent: {
    paddingHorizontal: 32,
  },
  textBlock: {
    marginBottom: 40,
  },
  headline: {
    fontSize: 28,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    color: THEME.COLORS.TEXT,
    letterSpacing: 0.5,
    lineHeight: 36,
  },
  subtext: {
    fontSize: THEME.FONT_SIZE.MD,
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    color: THEME.COLORS.GRAY_TEXT,
    marginTop: 12,
    lineHeight: 22,
  },
  buttonsBlock: {
    gap: 12,
    paddingBottom: 16,
  },
  primaryButton: {
    backgroundColor: THEME.COLORS.TEXT,
    paddingVertical: 16,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: THEME.COLORS.WHITE_TEXT,
    fontSize: THEME.FONT_SIZE.MD,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    letterSpacing: 2,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.COLORS.BORDER,
  },
  secondaryButtonText: {
    color: THEME.COLORS.TEXT,
    fontSize: THEME.FONT_SIZE.SM,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    letterSpacing: 1.5,
  },
});
