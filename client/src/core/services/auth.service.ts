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
      console.log("Logging DTO in register method");
      console.log({ dto });
      await authApi.register(dto);
    } catch {
      return false;
    }
    return true;
  }

  async login(data: UserAuthRequest): Promise<JwtTokenValue> {
    const dto = UserAuthRequestMapper.toDTO(data);
    console.log("Logging DTO in login method");
    console.log({ dto });
    const res = await authApi.login(dto);
    console.log("Logging response in login method");
    console.log({ res });
    const jwtTokenValue = JwtTokenValueMapper.getJwtTokenValue(res);
    return jwtTokenValue;
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

  async getPdfCompleteUrl(): Promise<string> {
    const res = await authApi.getPdfCompleteUrl();
    return CONFIG.API.BASE_URL + "/static" + res;
  }
}

export const authService = new AuthService();
