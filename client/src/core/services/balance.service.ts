// core/services/balance.service.ts
import { Balance, Transaction } from "../domain/balance";
import { BalanceAPI } from "../../data/http/balance.api";
import {
  BalanceMapper,
  TransactionMapper,
} from "../../data/mappers/balance.mapper";

export class BalanceService {
  static async getBalance(): Promise<Balance> {
    const dto = await BalanceAPI.getBalance();
    return BalanceMapper.toDomain(dto);
  }

  static async deposit(amount: number): Promise<Transaction> {
    const dto = await BalanceAPI.deposit({ amount, currency: "EUR" });
    return TransactionMapper.toDomain(dto);
  }

  static async withdraw(amount: number): Promise<Transaction> {
    const dto = await BalanceAPI.withdraw({ amount, currency: "EUR" });
    return TransactionMapper.toDomain(dto);
  }

  static async getTransactions(): Promise<Transaction[]> {
    const dtos = await BalanceAPI.getTransactions();
    return TransactionMapper.toDomainList(dtos);
  }
}
