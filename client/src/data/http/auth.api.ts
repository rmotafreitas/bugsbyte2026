import { AxiosHttpClient } from "./axios.client";
import { JwtTokenValueDto } from "./dto/token.dto";
import {
  UserAuthRequestDTO,
  UserDTO,
  UserProfileDTO,
  UserRegisterRequestDTO,
} from "./dto/user.dto";

class AuthApi {
  private httpClient: AxiosHttpClient;

  constructor() {
    this.httpClient = new AxiosHttpClient();
  }

  register = async (
    dto: UserRegisterRequestDTO,
  ): Promise<{ token: string; user: UserDTO }> => {
    try {
      console.log("[AuthApi] Registering user:", dto.email);

      const response = await this.httpClient.client.post<{
        token: string;
        user: {
          id: string;
          email: string;
          username: string;
          role: string;
          dateOfCreation: string;
        };
      }>("/auth/register", dto);

      console.log(
        "[AuthApi] Registration successful:",
        response.data.user.email,
      );

      // Convert ISO dateOfCreation to yyyy-MM-dd format
      const user: UserDTO = {
        ...response.data.user,
        dateOfCreation: response.data.user.dateOfCreation.split("T")[0],
      };

      return {
        token: response.data.token,
        user,
      };
    } catch (error: any) {
      console.error("[AuthApi] Registration failed:", {
        error: error.response?.data || error.message,
        email: dto.email,
      });
      throw new Error(
        error.response?.data?.error || "Registration failed. Please try again.",
      );
    }
  };

  login = async (
    dto: UserAuthRequestDTO,
  ): Promise<{ token: string; user: UserDTO }> => {
    try {
      console.log("[AuthApi] Login attempt:", dto.email);

      const response = await this.httpClient.client.post<{
        token: string;
        user: {
          id: string;
          email: string;
          username: string;
          role: string;
          dateOfCreation: string;
        };
      }>("/auth/login", dto);

      console.log("[AuthApi] Login successful:", response.data.user.email);

      // Convert ISO dateOfCreation to yyyy-MM-dd format
      const user: UserDTO = {
        ...response.data.user,
        dateOfCreation: response.data.user.dateOfCreation.split("T")[0],
      };

      return {
        token: response.data.token,
        user,
      };
    } catch (error: any) {
      console.error("[AuthApi] Login failed:", {
        error: error.response?.data || error.message,
        email: dto.email,
      });
      throw new Error(
        error.response?.data?.error ||
          "Authentication failed. Please check your credentials.",
      );
    }
  };

  getUserInfo = async (): Promise<UserDTO> => {
    try {
      console.log("[AuthApi] Getting user info");

      const response = await this.httpClient.client.get<{
        id: string;
        email: string;
        username: string;
        role: string;
        dateOfCreation: string;
      }>("/auth/me");

      console.log("[AuthApi] User info retrieved:", response.data.email);

      // Convert ISO dateOfCreation to yyyy-MM-dd format
      return {
        ...response.data,
        dateOfCreation: response.data.dateOfCreation.split("T")[0],
      };
    } catch (error: any) {
      console.error("[AuthApi] Failed to get user info:", {
        error: error.response?.data || error.message,
      });
      throw new Error("Failed to get user info. Please login again.");
    }
  };

  getProfile = async (): Promise<UserProfileDTO> => {
    // Mock profile data for now (backend doesn't have this endpoint yet)
    return {
      totalEquity: 10245.8,
      dailyProfit: 145.2,
      totalTrades: 47,
    };
  };
}

const authApi = new AuthApi();
export { authApi };
