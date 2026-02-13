import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Role } from "../@types/role";
import { LoadingSpinner } from "./loading-spinner";
import { useAuth } from "../contexts/auth";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";

type RootStackParamList = {
  Login: undefined;
  Unauthorized: undefined;
};

interface ProtectedScreenProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedScreen: React.FC<ProtectedScreenProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!user) {
    navigation.navigate("Login");
    return null;
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    navigation.navigate("Unauthorized");
    return null;
  }

  return <>{children}</>;
};
