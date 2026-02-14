import { JwtTokenValue } from "../../@types/jwt-token";
import { CONFIG } from "../../constants/config";
import { authApi } from "../../data/http/auth.api";
import { JwtTokenValueMapper } from "../../data/mappers/token.mapper";
import {
  UserAuthRequestMapper,
  UserMapper,
  UserProfileMapper,
  UserRegisterRequestMapper,
} from "../../data/mappers/user.mapper";
import {
  User,
  UserAuthRequest,
  UserProfile,
  UserRegisterRequest,
} from "../domain/user";

class AuthService {
  private currentUser: User | null = null;

  async initialize(): Promise<User | null> {
    try {
      const user = await this.getUserInfo();
      if (!user) return null;
      this.currentUser = user;
      return this.currentUser;
    } catch (error) {
      console.error("[AuthService] Failed to initialize:", error);
      return null;
    }
  }

  async register(data: UserRegisterRequest): Promise<boolean> {
    try {
      const dto = UserRegisterRequestMapper.toDTO(data);
      console.log("[AuthService] Registering user:", dto.email);
      const response = await authApi.register(dto);
      console.log("[AuthService] Registration successful, got token");
      // Store user info for immediate use after registration
      this.currentUser = UserMapper.toDomain(response.user);
      return true;
    } catch (error) {
      console.error("[AuthService] Registration failed:", error);
      return false;
    }
  }

  async login(data: UserAuthRequest): Promise<JwtTokenValue> {
    const dto = UserAuthRequestMapper.toDTO(data);
    console.log("[AuthService] Logging in:", dto.email);
    const response = await authApi.login(dto);
    console.log("[AuthService] Login successful, got token");
    // Store user info
    this.currentUser = UserMapper.toDomain(response.user);
    // Return just the token string
    return response.token;
  }

  logout() {
    this.currentUser = null;
  }

  async getUserInfo(): Promise<User> {
    const res = await authApi.getUserInfo();
    const user = UserMapper.toDomain(res);
    return user;
  }

  async getProfile(): Promise<UserProfile | null> {
    try {
      const response = await authApi.getProfile();
      return UserProfileMapper.toDomain(response);
    } catch (error) {
      console.error("[AuthService] Failed to get profile:", error);
      return null;
    }
  }
}

export const authService = new AuthService();
