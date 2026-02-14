import { Dimensions, StyleSheet } from "react-native";
import { THEME } from "../../constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRID_PADDING = 64; // 32px each side
const GRID_GAP = 10;
const PHOTO_SIZE = (SCREEN_WIDTH - GRID_PADDING - GRID_GAP * 2) / 3;

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

  // Progress
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingBottom: 24,
    paddingHorizontal: 32,
  },
  progressDot: {
    flex: 1,
    height: 2,
    backgroundColor: THEME.COLORS.BORDER,
  },
  progressDotActive: {
    backgroundColor: THEME.COLORS.TEXT,
    height: 2,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },

  // Step content
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: 28,
    color: THEME.COLORS.TEXT,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  stepSubtitle: {
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.MD,
    color: THEME.COLORS.GRAY_TEXT,
    marginBottom: 32,
    lineHeight: 22,
  },

  // Photos grid
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: GRID_GAP,
  },
  photoSlot: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE * 1.3,
    backgroundColor: "#F5F5F5",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.COLORS.BORDER,
    borderStyle: "dashed",
  },
  photoSlotFilled: {
    borderStyle: "solid",
    borderColor: "transparent",
  },
  photoContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoRemove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.COLORS.TEXT,
    justifyContent: "center",
    alignItems: "center",
  },
  photoRemoveText: {
    color: THEME.COLORS.WHITE_TEXT,
    fontSize: 14,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    lineHeight: 16,
  },
  photoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderIcon: {
    fontSize: 32,
    color: THEME.COLORS.CAPTION_400,
    fontFamily: THEME.FONT_FAMILY.REGULAR,
  },

  // Text input
  textInput: {
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.LG,
    color: THEME.COLORS.TEXT,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLORS.BORDER,
    paddingVertical: 12,
    paddingHorizontal: 0,
  },

  // Options list (gender)
  optionsList: {
    gap: 12,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: THEME.COLORS.BORDER,
    borderRadius: 4,
  },
  optionButtonActive: {
    borderColor: THEME.COLORS.TEXT,
    backgroundColor: THEME.COLORS.TEXT,
  },
  optionText: {
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.MD,
    color: THEME.COLORS.TEXT,
    letterSpacing: 1,
  },
  optionTextActive: {
    color: THEME.COLORS.WHITE_TEXT,
  },

  // Birthday
  birthdayRow: {
    flexDirection: "row",
    gap: 12,
  },
  birthdayInput: {
    flex: 1,
    textAlign: "center",
    fontSize: THEME.FONT_SIZE.LG,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLORS.BORDER,
  },
  birthdayInputYear: {
    flex: 1.5,
    textAlign: "center",
    fontSize: THEME.FONT_SIZE.LG,
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    color: THEME.COLORS.TEXT,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLORS.BORDER,
    paddingVertical: 12,
  },

  // Preferences chips
  preferencesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  preferenceChip: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: THEME.COLORS.BORDER,
    borderRadius: 100,
  },
  preferenceChipActive: {
    borderColor: THEME.COLORS.TEXT,
    backgroundColor: THEME.COLORS.TEXT,
  },
  preferenceChipText: {
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.SM,
    color: THEME.COLORS.TEXT,
    letterSpacing: 0.5,
  },
  preferenceChipTextActive: {
    color: THEME.COLORS.WHITE_TEXT,
  },

  // Footer
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 12,
    paddingTop: 8,
  },
  continueButton: {
    backgroundColor: THEME.COLORS.TEXT,
    paddingVertical: 16,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: THEME.COLORS.BORDER,
  },
  continueButtonText: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.MD,
    color: THEME.COLORS.WHITE_TEXT,
    letterSpacing: 2,
  },
  continueButtonTextDisabled: {
    color: THEME.COLORS.CAPTION_400,
  },
});
