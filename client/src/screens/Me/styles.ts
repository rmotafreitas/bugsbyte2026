import { Dimensions, StyleSheet } from "react-native";
import { THEME } from "../../constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PHOTO_SLOT_SIZE = (SCREEN_WIDTH - 64 - 24) / 4; // 4 columns with gaps

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.COLORS.BACKGROUND_900,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: THEME.COLORS.TEXT,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: THEME.COLORS.WHITE_TEXT,
    fontSize: 36,
    fontFamily: THEME.FONT_FAMILY.BOLD,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.COLORS.TEXT,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: THEME.COLORS.BACKGROUND_900,
  },
  avatarEditBadgeText: {
    color: THEME.COLORS.WHITE_TEXT,
    fontSize: 14,
  },
  userName: {
    fontSize: THEME.FONT_SIZE.LG,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    color: THEME.COLORS.TEXT,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: THEME.FONT_SIZE.SM,
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    color: THEME.COLORS.GRAY_TEXT,
    marginTop: 4,
  },

  // Actions
  actions: {
    marginBottom: 28,
  },
  editButton: {
    backgroundColor: THEME.COLORS.TEXT,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  editButtonText: {
    color: THEME.COLORS.WHITE_TEXT,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.MD,
    letterSpacing: 2,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.COLORS.BORDER,
  },
  cancelButtonText: {
    color: THEME.COLORS.TEXT,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.MD,
    letterSpacing: 2,
  },
  saveButton: {
    flex: 1,
    backgroundColor: THEME.COLORS.TEXT,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: THEME.COLORS.BORDER,
  },
  saveButtonText: {
    color: THEME.COLORS.WHITE_TEXT,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.MD,
    letterSpacing: 2,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.MD,
    color: THEME.COLORS.TEXT,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sectionValue: {
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.MD,
    color: THEME.COLORS.GRAY_TEXT,
  },

  // Text Input
  textInput: {
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.MD,
    color: THEME.COLORS.TEXT,
    borderWidth: 1,
    borderColor: THEME.COLORS.BORDER,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Options (gender)
  optionsList: {
    gap: 8,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    fontSize: THEME.FONT_SIZE.SM,
    color: THEME.COLORS.TEXT,
    letterSpacing: 1,
  },
  optionTextActive: {
    color: THEME.COLORS.WHITE_TEXT,
  },

  // Preferences
  preferencesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  preferenceChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
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

  // Photos Grid (edit mode)
  photosGrid: {
    flexDirection: "row",
    gap: 8,
  },
  photoSlot: {
    width: PHOTO_SLOT_SIZE,
    height: PHOTO_SLOT_SIZE * (16 / 9),
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: THEME.COLORS.BACKGROUND_800,
    borderWidth: 1,
    borderColor: THEME.COLORS.BORDER,
    borderStyle: "dashed",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoRemoveBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.COLORS.TEXT,
    justifyContent: "center",
    alignItems: "center",
  },
  photoRemoveBadgeText: {
    color: THEME.COLORS.WHITE_TEXT,
    fontSize: 10,
    fontFamily: THEME.FONT_FAMILY.BOLD,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    fontSize: 24,
    color: THEME.COLORS.CAPTION_400,
    fontFamily: THEME.FONT_FAMILY.REGULAR,
  },

  // Photos horizontal scroll (view mode)
  photosHorizontal: {
    gap: 10,
  },
  photoPreview: {
    width: 100,
    height: 100 * (16 / 9),
    borderRadius: 4,
  },

  // Account info
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.COLORS.BORDER,
  },
  accountLabel: {
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.SM,
    color: THEME.COLORS.GRAY_TEXT,
  },
  accountValue: {
    fontFamily: THEME.FONT_FAMILY.REGULAR,
    fontSize: THEME.FONT_SIZE.SM,
    color: THEME.COLORS.TEXT,
  },

  // Logout
  logoutButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.COLORS.ALERT,
  },
  logoutButtonText: {
    color: THEME.COLORS.ALERT,
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.MD,
    letterSpacing: 2,
  },
});
