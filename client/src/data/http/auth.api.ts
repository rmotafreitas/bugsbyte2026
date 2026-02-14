import { Platform } from "react-native";
import { AxiosHttpClient } from "./axios.client";
import { JwtTokenValueDto } from "./dto/token.dto";
import {
  UserAuthRequestDTO,
  UserDTO,
  UserImageDTO,
  UserProfileDTO,
  UserRegisterRequestDTO,
  UserUpdateRequestDTO,
} from "./dto/user.dto";

type UserResponsePayload = {
  id: string;
  email: string;
  username: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  preferences: string[];
  images: UserImageDTO[];
  role: string;
  dateOfCreation: string;
};

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

      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append("email", dto.email);
      formData.append("password", dto.password);
      formData.append("username", dto.username);
      formData.append("name", dto.name);
      formData.append("gender", dto.gender);
      formData.append("dateOfBirth", dto.dateOfBirth);
      formData.append("preferences", JSON.stringify(dto.preferences));

      // Append photo files
      for (const photo of dto.photos) {
        const uri =
          Platform.OS === "ios" ? photo.uri.replace("file://", "") : photo.uri;
        const filename = uri.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append(`photos_${photo.width}x${photo.height}`, {
          uri: photo.uri,
          name: filename,
          type,
        } as any);
      }

      const response = await this.httpClient.client.post<{
        token: string;
        user: UserResponsePayload;
      }>("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(
        "[AuthApi] Registration successful:",
        response.data.user.email,
      );

      const user: UserDTO = {
        ...response.data.user,
        images: response.data.user.images || [],
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
        user: UserResponsePayload;
      }>("/auth/login", dto);

      console.log("[AuthApi] Login successful:", response.data.user.email);

      const user: UserDTO = {
        ...response.data.user,
        images: response.data.user.images || [],
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

      const response =
        await this.httpClient.client.get<UserResponsePayload>("/auth/me");

      console.log("[AuthApi] User info retrieved:", response.data.email);

      return {
        ...response.data,
        images: response.data.images || [],
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

  updateUser = async (dto: UserUpdateRequestDTO): Promise<UserDTO> => {
    try {
      console.log("[AuthApi] Updating user profile");

      const formData = new FormData();
      if (dto.name) formData.append("name", dto.name);
      if (dto.gender) formData.append("gender", dto.gender);
      if (dto.dateOfBirth) formData.append("dateOfBirth", dto.dateOfBirth);
      if (dto.preferences)
        formData.append("preferences", JSON.stringify(dto.preferences));

      // Append photo files if provided
      if (dto.photos && dto.photos.length > 0) {
        for (const photo of dto.photos) {
          const uri =
            Platform.OS === "ios"
              ? photo.uri.replace("file://", "")
              : photo.uri;
          const filename = uri.split("/").pop() || "photo.jpg";
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";

          formData.append(`photos_${photo.width}x${photo.height}`, {
            uri: photo.uri,
            name: filename,
            type,
          } as any);
        }
      }

      const response = await this.httpClient.client.put<UserResponsePayload>(
        "/auth/me",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("[AuthApi] Update successful");

      return {
        ...response.data,
        images: response.data.images || [],
        dateOfCreation: response.data.dateOfCreation.split("T")[0],
      };
    } catch (error: any) {
      console.error("[AuthApi] Update failed:", {
        error: error.response?.data || error.message,
      });
      throw new Error(
        error.response?.data?.error || "Update failed. Please try again.",
      );
    }
  };
}

const authApi = new AuthApi();
export { authApi };
