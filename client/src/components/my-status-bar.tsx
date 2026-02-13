import {
  View,
  StatusBar,
  SafeAreaView,
  StatusBarProps,
  StyleSheet,
  Platform,
} from "react-native";

interface MyStatusBarProps extends StatusBarProps {
  backgroundColor: string;
}

export const MyStatusBar = ({
  backgroundColor,
  ...props
}: MyStatusBarProps) => (
  <View style={[styles.statusBar, { backgroundColor }]}>
    <SafeAreaView>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </SafeAreaView>
  </View>
);

const STATUSBAR_HEIGHT = StatusBar.currentHeight;
const APPBAR_HEIGHT = Platform.OS === "ios" ? 44 : 56;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
  appBar: {
    backgroundColor: "#79B45D",
    height: APPBAR_HEIGHT,
  },
  content: {
    flex: 1,
    backgroundColor: "#33373B",
  },
});
