import { JwtTokenValue } from "../../@types/jwt-token";
import { CONFIG } from "../../constants/config";
import { authApi } from "../../data/http/auth.api";
import { JwtTokenValueMapper } from "../../data/mappers/token.mapper";
import {
  UserAuthRequestMapper,
  UserMapper,
  UserProfileMapper,
  UserRegisterRequestMapper,
  UserUpdateRequestMapper,
} from "../../data/mappers/user.mapper";
import {
  User,
  UserAuthRequest,
  UserProfile,
  UserRegisterRequest,
  UserUpdateRequest,
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

  async register(
    data: UserRegisterRequest,
  ): Promise<{ token: JwtTokenValue; user: User }> {
    const dto = UserRegisterRequestMapper.toDTO(data);
    console.log("[AuthService] Registering user:", dto.email);
    const response = await authApi.register(dto);
    console.log("[AuthService] Registration successful, got token");
    this.currentUser = UserMapper.toDomain(response.user);
    return { token: response.token, user: this.currentUser };
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

  async updateUser(data: UserUpdateRequest): Promise<User> {
    const dto = UserUpdateRequestMapper.toDTO(data);
    console.log("[AuthService] Updating user profile");
    const response = await authApi.updateUser(dto);
    this.currentUser = UserMapper.toDomain(response);
    return this.currentUser;
  }
}

export const authService = new AuthService();
