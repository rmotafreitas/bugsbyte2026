// screens/wallet/styles.ts
import { StyleSheet, Platform } from "react-native";
import { THEME } from "../../constants/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.colors.foreground,
  },
  historyButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  balanceCardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: THEME.colors.primary,
    opacity: 0.05,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.colors.mutedForeground,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balanceActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginTop: 32,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.colors.foreground,
  },
  transactionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.colors.foreground,
    marginBottom: 16,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.colors.foreground,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: THEME.colors.mutedForeground,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.colors.foreground,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: THEME.colors.mutedForeground,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: THEME.colors.foreground,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: "700",
    color: THEME.colors.mutedForeground,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: "700",
    color: THEME.colors.foreground,
    minWidth: 120,
    textAlign: "left",
  },
  quickAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: "center",
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.colors.foreground,
  },
  balanceInfo: {
    backgroundColor: THEME.colors.background,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  balanceInfoText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.colors.mutedForeground,
  },
  confirmButton: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
