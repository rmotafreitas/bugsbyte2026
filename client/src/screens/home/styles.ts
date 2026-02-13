import { StyleSheet, Platform, Dimensions } from "react-native";
import { THEME } from "../../constants/theme";

const { width } = Dimensions.get("window");

const BOTTOM_TAB_HEIGHT = 90;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Space for safety footer
  },

  // Header Styles (Total Equity Section)
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: THEME.colors.background,
    position: "relative",
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${THEME.colors.primary}08`,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  equityContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  equityLabel: {
    fontSize: 14,
    color: THEME.colors.mutedForeground,
    marginBottom: 8,
    fontWeight: "500",
    letterSpacing: 1,
  },
  equityAmount: {
    fontSize: 48,
    fontWeight: "bold",
    color: THEME.colors.foreground,
    marginBottom: 12,
    letterSpacing: -1,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${THEME.colors.primary}20`,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  changeText: {
    fontSize: 16,
    color: THEME.colors.primary,
    fontWeight: "600",
  },

  // Engine Status Card
  engineCard: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  engineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.colors.foreground,
    letterSpacing: 0.3,
  },
  exchangeConnection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  exchangeIcon: {
    alignItems: "center",
    flex: 1,
  },
  exchangeBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
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
  exchangeName: {
    fontSize: 12,
    color: THEME.colors.foreground,
    fontWeight: "500",
  },
  connectionLineContainer: {
    position: "relative",
    flex: 2,
    height: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  connectionLineBg: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: THEME.colors.border,
  },
  connectionLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: THEME.colors.primary,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  connectionArrow: {
    position: "absolute",
    zIndex: 1,
  },
  statusMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: `${THEME.colors.muted}60`,
    borderRadius: 12,
    padding: 16,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.warning,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: THEME.colors.mutedForeground,
    marginBottom: 4,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 14,
    color: THEME.colors.foreground,
    fontWeight: "600",
  },

  // Live Snipes Section
  snipesSection: {
    margin: 20,
    marginTop: 0,
  },
  snipesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${THEME.colors.destructive}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.destructive,
  },
  liveText: {
    fontSize: 12,
    color: THEME.colors.destructive,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Snipe Cards
  snipeCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 16,
    marginBottom: 12,
  },
  snipeCardActive: {
    borderColor: THEME.colors.primary,
    borderWidth: 2,
    backgroundColor: `${THEME.colors.primary}08`,
    ...Platform.select({
      ios: {
        shadowColor: THEME.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  snipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  snipeLeft: {
    flex: 1,
  },
  snipePair: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.colors.foreground,
    marginBottom: 6,
  },
  snipePath: {
    flexDirection: "row",
    alignItems: "center",
  },
  snipeExchange: {
    fontSize: 12,
    color: THEME.colors.mutedForeground,
    fontWeight: "500",
  },
  snipeRight: {
    alignItems: "flex-end",
  },
  snipeTime: {
    fontSize: 12,
    color: THEME.colors.mutedForeground,
    marginBottom: 6,
  },
  snipeTypeBadge: {
    backgroundColor: `${THEME.colors.secondary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  snipeTypeText: {
    fontSize: 10,
    color: THEME.colors.secondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  snipeProfit: {
    alignItems: "flex-end",
  },
  snipeProfitAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.colors.primary,
    letterSpacing: -0.5,
  },

  // Safety Footer
  safetyFooter: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? BOTTOM_TAB_HEIGHT : BOTTOM_TAB_HEIGHT - 10,
    left: 0,
    right: 0,
    backgroundColor: `${THEME.colors.card}95`,
    backdropFilter: "blur(10px)",
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  safetyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  safetyText: {
    fontSize: 11,
    color: THEME.colors.foreground,
    fontWeight: "500",
  },
});
