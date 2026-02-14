import { Dimensions, StyleSheet } from "react-native";
import { THEME } from "../../constants/theme";

const BLUR_HEIGHT = 83;

export const styles = StyleSheet.create({
  profile: {
    width: "100%",
    height: "100%",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 8,
  },
  blurmask: {
    height: BLUR_HEIGHT,
    overflow: "hidden",
    width: "100%",
    position: "absolute",
    bottom: 0,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  info: {
    zIndex: 1,
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 16,
    gap: 3,
  },
  name: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.LG,
    color: THEME.COLORS.WHITE_TEXT,
  },
  course: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.SM,
    color: THEME.COLORS.WHITE_TEXT,
  },
  profileBlur: {
    height: 450,
    width: "100%",
    position: "absolute",
    bottom: 0,
    justifyContent: "center",
  },
  distance: {
    position: "absolute",
    top: 16,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  distanceText: {
    fontFamily: THEME.FONT_FAMILY.BOLD,
    fontSize: THEME.FONT_SIZE.SM,
    color: THEME.COLORS.WHITE_TEXT,
  },
  distanceIcon: {
    width: 14,
    height: 14,
  },
  dots: {
    position: "absolute",
    top: 140,
    right: 0,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    width: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 12,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 100,
    backgroundColor: THEME.COLORS.WHITE_TEXT,
  },
  touchesphotos: {
    flexDirection: "row",
    flex: 1,
    zIndex: 10,
  },
  touchNot: {
    height: BLUR_HEIGHT,
    zIndex: 10,
  },
  touchesphotosBtn: {
    flex: 1,
  },
  decisionIndicator: {
    height: 78,
    width: 78,
    backgroundColor: THEME.COLORS.WHITE_TEXT,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
