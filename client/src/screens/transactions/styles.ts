// screens/transactions/styles.ts
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
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.colors.foreground,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: THEME.colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 8,
  },
  statCardWide: {
    minWidth: "100%",
  },
  statLabel: {
    fontSize: 13,
    color: THEME.colors.mutedForeground,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
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
});
