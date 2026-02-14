import { Text, TouchableOpacity, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MyStatusBar } from "../../components/my-status-bar";
import { THEME } from "../../constants/theme";
import { styles } from "./styles";

export function Login() {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate("register" as never);
  };

  const handleLoginPress = () => {
    navigation.navigate("loginForm" as never);
  };

  return (
    <View style={styles.container}>
      <MyStatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <View style={styles.topSection}>
        <Text style={styles.brand}>ZARA</Text>
        <Text style={styles.brandSub}>STYLE</Text>
      </View>
      <View style={styles.bottomSection}>
        <SafeAreaView style={styles.bottomContent}>
          <View style={styles.textBlock}>
            <Text style={styles.headline}>Discover your{"\n"}style match</Text>
            <Text style={styles.subtext}>
              Swipe through outfits. Find people{"\n"}who dress like you think.
            </Text>
          </View>
          <View style={styles.buttonsBlock}>
            <TouchableOpacity
              onPress={handleGetStarted}
              style={styles.primaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>GET STARTED</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLoginPress}
              style={styles.secondaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>
                I ALREADY HAVE AN ACCOUNT
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
