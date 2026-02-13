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
      email: dto.login,
      role: dto.role as Role,
      completeName: dto.completeName,
      birthDate: new Date(dto.birthDate),
      dateOfCreation: new Date(dto.dateOfCreation),
    };
  }

  static toDTO(domain: User): UserDTO {
    return {
      login: domain.email,
      role: domain.role,
      completeName: domain.completeName,
      birthDate: domain.birthDate.toISOString().split("T")[0], // Convert to YYYY-MM-DD
      dateOfCreation: domain.dateOfCreation.toISOString().split("T")[0],
    };
  }
}

export class UserAuthRequestMapper {
  static toDTO(domain: UserAuthRequest): UserAuthRequestDTO {
    return {
      login: domain.email,
      password: domain.password,
    };
  }
}

export class UserRegisterRequestMapper {
  static toDTO(domain: UserRegisterRequest): UserRegisterRequestDTO {
    return {
      login: domain.email,
      password: domain.password,
      role: domain.role.toLowerCase(),
      completeName: domain.completeName,
      birthDate: domain.birthDate.toISOString().split("T")[0], // Convert to YYYY-MM-DD
    };
  }
}

export class UserProfileMapper {
  static toDomain(dto: UserProfileDTO): UserProfile {
    return {};
  }
}
