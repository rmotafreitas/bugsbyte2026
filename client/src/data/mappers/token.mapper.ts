import { JwtTokenValue } from "../../@types/jwt-token";
import { JwtTokenValueDto } from "../http/dto/token.dto";

export class JwtTokenValueMapper {
  static getJwtTokenValue(dto: JwtTokenValueDto): JwtTokenValue {
    return dto.token;
  }
}
