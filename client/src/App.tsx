import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./contexts/auth";
import { AppNavigator } from "./navigation";
import { MyStatusBar } from "./components/my-status-bar";
import { THEME } from "./constants/theme";

export function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <MyStatusBar backgroundColor={THEME.COLORS.PRIMARY} />
        <AppNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
