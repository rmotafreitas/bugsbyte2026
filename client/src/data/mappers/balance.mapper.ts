// data/mappers/balance.mapper.ts
import { Balance, Transaction } from "../../core/domain/balance";
import { BalanceDTO, TransactionDTO } from "../http/dto/balance.dto";

export class BalanceMapper {
  static toDomain(dto: BalanceDTO): Balance {
    return new Balance(
      dto.userId,
      dto.balance,
      dto.currency,
      new Date(dto.updatedAt),
    );
  }
}

export class TransactionMapper {
  static toDomain(dto: TransactionDTO): Transaction {
    return new Transaction(
      dto.id,
      dto.userId,
      dto.type,
      dto.amount,
      dto.currency,
      dto.status,
      new Date(dto.timestamp),
      dto.description,
    );
  }

  static toDomainList(dtos: TransactionDTO[]): Transaction[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
