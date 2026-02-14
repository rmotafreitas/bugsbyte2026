import { Platform } from "react-native";

// For Android emulator, use 10.0.2.2 to reach host machine's localhost
// For iOS simulator, localhost works fine
// For physical devices, replace with your machine's IP address
const getApiUrl = () => {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }
  return "http://localhost:3000";
};

export const CONFIG = {
  APP: {
    STORAGE_COOKIE_NAME: "jwt",
  },
  API: {
    BASE_URL: getApiUrl(),
  },
};
