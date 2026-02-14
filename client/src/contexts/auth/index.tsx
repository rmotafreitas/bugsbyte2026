import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { CONFIG } from "../../constants/config";
import {
  User,
  UserAuthRequest,
  UserRegisterRequest,
} from "../../core/domain/user";
import { HttpRequestError } from "../../core/errors/http.error";
import { authService } from "../../core/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (data: UserRegisterRequest) => Promise<boolean>;
  login: (data: UserAuthRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await authService.getUserInfo();
      if (response) {
        setUser(response);
      }
    } catch (error) {
      if (error instanceof HttpRequestError) {
        console.error("Custom Http Request Error refreshing user:", error);
      } else {
        console.error("Default Error refreshing user:", error);
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authService.initialize();
        if (user) {
          setUser(user);
          console.log("[AuthProvider] User initialized:", user);
        }
      } catch (error) {
        console.error("[AuthProvider] Initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (data: UserRegisterRequest) => {
    try {
      await logout();
      const { token, user } = await authService.register(data);
      const cookieName = CONFIG.APP.STORAGE_COOKIE_NAME;
      await AsyncStorage.setItem(cookieName, token);
      setUser(user);
      return true;
    } catch (error) {
      if (error instanceof HttpRequestError) {
        console.error("Custom Http Request Error registering:", error);
      } else {
        console.error("Default Error registering:", error);
      }
      return false;
    }
  };

  const login = async (data: UserAuthRequest) => {
    try {
      await logout();
      const jwtTokenValue = await authService.login(data);
      if (!jwtTokenValue) {
        throw new HttpRequestError("Invalid token", 401);
      }
      const cookieName = CONFIG.APP.STORAGE_COOKIE_NAME;
      const cookieValue = jwtTokenValue;
      await AsyncStorage.setItem(cookieName, cookieValue);
      const user = await authService.getUserInfo();
      setUser(user);
    } catch (error) {
      if (error instanceof HttpRequestError) {
        console.error("Custom Http Request Error logging in:", error);
      } else {
        console.error("Default Error logging in:", error);
      }
    }
  };

  const logout = async () => {
    authService.logout();
    await AsyncStorage.removeItem(CONFIG.APP.STORAGE_COOKIE_NAME);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshUser, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
