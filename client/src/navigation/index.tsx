import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import {
  Platform,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { THEME } from "../constants/theme";
import { useAuth } from "../contexts/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Login } from "../screens/Login";
import { LoginForm } from "../screens/LoginForm";
import { Register } from "../screens/Register";
import { Main } from "../screens/Main";
import { Profile } from "../screens/Profile";

export type AuthStackParamList = {
  login: undefined;
  loginForm: undefined;
  register: undefined;
};

export type AppTabParamList = {
  mainTab: undefined;
  profileTab: undefined;
};

export type AppStackParamList = {
  appTabs: undefined;
  profileDetail: { [key: string]: any };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppTab = createBottomTabNavigator<AppTabParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
      }}
    >
      <AuthStack.Screen name="login" component={Login} />
      <AuthStack.Screen name="loginForm" component={LoginForm} />
      <AuthStack.Screen name="register" component={Register} />
    </AuthStack.Navigator>
  );
}

function AppTabNavigator() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <AppTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: THEME.COLORS.BACKGROUND_900,
          borderTopColor: THEME.COLORS.BORDER,
          borderTopWidth: 1,
          height: Platform.select({ ios: 85, android: 65 }),
          paddingBottom: Platform.select({ ios: insets.bottom, android: 10 }),
          paddingTop: 10,
        },
        tabBarActiveTintColor: THEME.COLORS.PRIMARY,
        tabBarInactiveTintColor: THEME.COLORS.GRAY_TEXT,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <AppTab.Screen
        name="mainTab"
        component={Main}
        options={{
          tabBarLabel: "Discover",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />
      <AppTab.Screen
        name="profileTab"
        component={Profile}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size, focused }) => {
            if (focused) {
              return (
                <View style={styles.profileTabIcon}>
                  <Text style={styles.profileTabIconText}>
                    {user?.username?.[0]?.toUpperCase() || "U"}
                  </Text>
                </View>
              );
            }
            return <Ionicons name="person-outline" size={size} color={color} />;
          },
        }}
      />
    </AppTab.Navigator>
  );
}

function AppNavigatorStack() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "ios" ? "slide_from_right" : "fade",
      }}
    >
      <AppStack.Screen name="appTabs" component={AppTabNavigator} />
      <AppStack.Screen
        name="profileDetail"
        component={Profile}
        options={{
          animation: "slide_from_right",
          gestureEnabled: true,
        }}
      />
    </AppStack.Navigator>
  );
}

export function AppNavigator() {
  const { user } = useAuth();

  return user ? <AppNavigatorStack /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  profileTabIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  profileTabIconText: {
    color: THEME.COLORS.WHITE_TEXT,
    fontWeight: "700",
    fontSize: 14,
  },
});
