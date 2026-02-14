import { Role } from "../../@types/role";
import {
  User,
  UserAuthRequest,
  UserProfile,
  UserRegisterRequest,
} from "../../core/domain/user";
import {
  UserAuthRequestDTO,
  UserDTO,
  UserProfileDTO,
  UserRegisterRequestDTO,
} from "../http/dto/user.dto";

export class UserMapper {
  static toDomain(dto: UserDTO): User {
    return {
      id: dto.id,
      email: dto.email,
      username: dto.username,
      name: dto.name || "",
      gender: dto.gender || "",
      dateOfBirth: dto.dateOfBirth || "",
      preferences: dto.preferences || [],
      images: dto.images || [],
      role: dto.role as Role,
      dateOfCreation: new Date(dto.dateOfCreation),
    };
  }

  static toDTO(domain: User): UserDTO {
    return {
      id: domain.id,
      email: domain.email,
      username: domain.username,
      name: domain.name,
      gender: domain.gender,
      dateOfBirth: domain.dateOfBirth,
      preferences: domain.preferences,
      images: domain.images,
      role: domain.role,
      dateOfCreation: domain.dateOfCreation.toISOString().split("T")[0],
    };
  }
}

export class UserAuthRequestMapper {
  static toDTO(domain: UserAuthRequest): UserAuthRequestDTO {
    return {
      email: domain.email,
      password: domain.password,
    };
  }
}

export class UserRegisterRequestMapper {
  static toDTO(domain: UserRegisterRequest): UserRegisterRequestDTO {
    return {
      email: domain.email,
      password: domain.password,
      username: domain.username,
      name: domain.name,
      gender: domain.gender,
      dateOfBirth: domain.dateOfBirth,
      preferences: domain.preferences,
      photos: domain.photos.map((p) => ({
        uri: p.uri,
        width: p.width,
        height: p.height,
      })),
    };
  }
}

export class UserProfileMapper {
  static toDomain(dto: UserProfileDTO): UserProfile {
    return {
      totalEquity: dto.totalEquity,
      dailyProfit: dto.dailyProfit,
      totalTrades: dto.totalTrades,
    };
  }
}
