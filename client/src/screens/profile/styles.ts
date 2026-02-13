import { StyleSheet, Platform } from "react-native";
import { THEME } from "../../constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: THEME.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: THEME.colors.primaryForeground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: THEME.colors.background,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: THEME.colors.primary,
  },
  nationalityBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: THEME.colors.background,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  nationalityText: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.colors.primaryForeground,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: THEME.colors.primaryForeground,
    opacity: 0.9,
  },
  infoCard: {
    margin: 20,
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.foreground,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoSection: {
    gap: 16,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.colors.foreground,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: THEME.colors.mutedForeground,
  },
  infoValue: {
    fontSize: 16,
    color: THEME.colors.foreground,
    fontWeight: "500",
  },
  enneagramCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.foreground,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  enneagramContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  enneagramEmoji: {
    fontSize: 36,
  },
  enneagramTextContainer: {
    flex: 1,
  },
  enneagramTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.colors.foreground,
  },
  enneagramSub: {
    fontSize: 12,
    color: THEME.colors.mutedForeground,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 16,
  },
  statCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: 15,
    padding: 16,
    flex: 1,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.foreground,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.colors.foreground,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: THEME.colors.mutedForeground,
  },
  personalityCard: {
    margin: 20,
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.foreground,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  chartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  chartHelper: {
    textAlign: "center",
    color: THEME.colors.mutedForeground,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  traitsLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  traitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  traitScore: {
    backgroundColor: THEME.colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  traitScoreText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  traitLabel: {
    color: THEME.colors.mutedForeground,
    fontSize: 14,
  },
  actionButtons: {
    padding: 20,
    gap: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primary,
    padding: 16,
    borderRadius: THEME.radius.default,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.colors.primaryForeground,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.destructive,
    padding: 16,
    borderRadius: THEME.radius.default,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.colors.destructiveForeground,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME.colors.primary,
    padding: 16,
    borderRadius: THEME.radius.default,
    gap: 8,
  },
  downloadText: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.colors.primaryForeground,
  },
  // Modal styles
  modal: {
    margin: 20,
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.foreground,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    padding: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.colors.foreground,
  },
  modalClose: {
    padding: 4,
  },
  modalScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: THEME.colors.primary + "10",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalScoreLabel: {
    fontSize: 16,
    color: THEME.colors.mutedForeground,
  },
  modalScoreValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.colors.primary,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: THEME.colors.foreground,
  },
  evaluationCard: {
    margin: 20,
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.foreground,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  evaluationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  evaluationTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.colors.foreground,
  },
  evaluationText: {
    fontSize: 16,
    lineHeight: 24,
    color: THEME.colors.mutedForeground,
  },

  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: THEME.colors.destructive + "20",
    borderRadius: 20,
    alignItems: "center",
  },
  errorText: {
    color: THEME.colors.destructive,
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: THEME.colors.destructive,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: THEME.radius.default,
  },
  retryText: {
    color: THEME.colors.destructiveForeground,
    fontSize: 14,
    fontWeight: "600",
  },
});
