import { api } from "./axios.client";
import { JwtTokenValueDto } from "./dto/token.dto";
import {
  UserAuthRequestDTO,
  UserDTO,
  UserProfileDTO,
  UserRegisterRequestDTO,
} from "./dto/user.dto";

class AuthApi {
  getPdfCompleteUrl = async () => {
    const response = await api.get<string>("auth/pdf");
    return response.data;
  };
  register = async (dto: UserRegisterRequestDTO): Promise<void> => {
    console.log("Registering user", dto);
    await api.post<JwtTokenValueDto>("auth/register", dto);
  };

  login = async (dto: UserAuthRequestDTO): Promise<JwtTokenValueDto> => {
    try {
      const response = await api.post<JwtTokenValueDto>("auth/login", dto);
      return response.data;
    } catch (error: unknown) {
      console.error("[AuthApi] Failed to login", {
        error,
        email: dto.login,
        timestamp: new Date().toISOString(),
      });
      throw new Error("Authentication failed. Please try again.");
    }
  };

  getUserInfo = async (): Promise<UserDTO> => {
    const response = await api.get<UserDTO>("auth/me");
    return response.data;
  };

  getProfile = async (): Promise<UserProfileDTO> => {
    const response = await api.get<UserProfileDTO>("auth/profile");
    return response.data;
  };
}

const authApi = new AuthApi();
export { authApi };
