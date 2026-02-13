import React from "react";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../contexts/auth";
import { THEME } from "../constants/theme";

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
];

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user } = useAuth();

  // Helper to display the user's first letter (of completeName)
  const getAvatarLetter = () => {
    if (user && user.completeName) {
      return user.completeName.charAt(0).toUpperCase();
    }
    return "";
  };

  // Helper to get the flag based on the user's nationality code
  const getNationalityFlag = () => {
    if (user && user.nationality) {
      const country = countries.find((c) => c.code === user.nationality);
      return country ? country.flag : "🌍";
    }
    return "🌍";
  };

  if (!user) return null;

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getAvatarLetter()}</Text>
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.completeName}>{user.completeName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.additionalInfo}>
              <Text style={styles.occupation}>{user.occupation}</Text>
              <Text style={styles.nationality}>{getNationalityFlag()}</Text>
            </View>
          </View>
        </View>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.primaryForeground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    marginRight: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.colors.primary,
  },
  profileDetails: {
    flex: 1,
  },
  completeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.colors.primary,
  },
  email: {
    fontSize: 14,
    color: THEME.colors.primary,
    opacity: 0.9,
    marginTop: 4,
  },
  additionalInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  occupation: {
    fontSize: 12,
    color: THEME.colors.primary,
    marginRight: 6,
  },
  nationality: {
    fontSize: 18,
  },
});
