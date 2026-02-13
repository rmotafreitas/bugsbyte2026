// navigation/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  Platform,
  StyleSheet,
} from "react-native";
import { THEME } from "../constants/theme";
import { useAuth } from "../contexts/auth";
import { LoginScreen } from "../screens/auth";
import { HomeScreen } from "../screens/home";
import { ProfileScreen } from "../screens/profile";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type RootStackParamList = {
  Back: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const ProfileButton = ({
  onPress,
  user,
}: {
  onPress: () => void;
  user: any;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.profileButton}
    activeOpacity={0.7}
  >
    <View style={styles.profileAvatar}>
      <Text style={styles.profileAvatarText}>
        {user?.completeName?.[0]?.toUpperCase()}
      </Text>
    </View>
  </TouchableOpacity>
);

function MainTabNavigator({ navigation }: any) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "rgba(26, 26, 26, 0.95)",
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          height: Platform.select({ ios: 80, android: 60 }),
          paddingBottom: Platform.select({ ios: insets.bottom, android: 8 }),
          paddingTop: 12,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderTopWidth: 1,
          ...Platform.select({
            ios: {
              shadowColor: THEME.colors.primary,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.5,
          paddingBottom: Platform.OS === "ios" ? 0 : 4,
        },
        headerStyle: {
          backgroundColor: THEME.colors.background,
        },
        headerTintColor: THEME.colors.foreground,
        headerShadowVisible: false,
        headerTransparent: false,
        headerRight: () => (
          <ProfileButton
            onPress={() => navigation.navigate("Profile")}
            user={user}
          />
        ),
        headerStatusBarHeight: insets.top,
        headerShown: false, // Hide default header for custom implementation
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                focused && styles.tabIconContainerActive,
              ]}
            >
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: THEME.colors.background,
        },
        headerTintColor: THEME.colors.foreground,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
          letterSpacing: 0.3,
        },
        headerShadowVisible: false,
        animation: Platform.OS === "ios" ? "slide_from_bottom" : "fade",
      }}
    >
      <Stack.Screen
        name="Back"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ navigation }) => ({
          presentation: "modal",
          headerTitle: "Your Profile",
          headerTitleStyle: styles.modalHeaderTitle,
          headerStyle: {
            backgroundColor: THEME.colors.background,
          },
          headerLeft:
            Platform.OS === "ios"
              ? () => (
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => navigation.goBack()}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={THEME.colors.foreground}
                    />
                  </TouchableOpacity>
                )
              : undefined,
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  profileButton: {
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  profileAvatarText: {
    color: THEME.colors.foreground,
    fontWeight: "700",
    fontSize: 16,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: Platform.OS === "ios" ? 0 : -4,
    padding: 8,
    borderRadius: 12,
  },
  tabIconContainerActive: {
    backgroundColor: `${THEME.colors.primary}15`,
  },
  tabBadge: {
    backgroundColor: THEME.colors.destructive,
    fontSize: 12,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  modalHeaderTitle: {
    color: THEME.colors.foreground,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  modalCloseButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  modalCloseText: {
    color: THEME.colors.foreground,
    fontSize: 17,
    fontWeight: "600",
  },
});
