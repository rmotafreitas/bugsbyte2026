// data/http/balance.api.ts
import {
  BalanceDTO,
  TransactionDTO,
  DepositRequestDTO,
  WithdrawalRequestDTO,
} from "./dto/balance.dto";

// Temporary in-memory storage (hashmap)
const balanceStore = new Map<string, BalanceDTO>();
const transactionsStore = new Map<string, TransactionDTO[]>();

// Initialize default balance
const DEFAULT_USER_ID = "default-user";
balanceStore.set(DEFAULT_USER_ID, {
  userId: DEFAULT_USER_ID,
  balance: 0,
  currency: "EUR",
  updatedAt: new Date().toISOString(),
});
transactionsStore.set(DEFAULT_USER_ID, []);

export class BalanceAPI {
  static async getBalance(): Promise<BalanceDTO> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const balance = balanceStore.get(DEFAULT_USER_ID);
    if (!balance) {
      throw new Error("Balance not found");
    }
    return balance;
  }

  static async deposit(request: DepositRequestDTO): Promise<TransactionDTO> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const balance = balanceStore.get(DEFAULT_USER_ID);
    if (!balance) {
      throw new Error("Balance not found");
    }

    // Create transaction
    const transaction: TransactionDTO = {
      id: `txn_${Date.now()}`,
      userId: DEFAULT_USER_ID,
      type: "deposit",
      amount: request.amount,
      currency: request.currency || "EUR",
      status: "completed",
      timestamp: new Date().toISOString(),
      description: `Deposit of €${request.amount.toFixed(2)}`,
    };

    // Update balance
    balance.balance += request.amount;
    balance.updatedAt = new Date().toISOString();
    balanceStore.set(DEFAULT_USER_ID, balance);

    // Store transaction
    const transactions = transactionsStore.get(DEFAULT_USER_ID) || [];
    transactions.unshift(transaction);
    transactionsStore.set(DEFAULT_USER_ID, transactions);

    return transaction;
  }

  static async withdraw(
    request: WithdrawalRequestDTO,
  ): Promise<TransactionDTO> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const balance = balanceStore.get(DEFAULT_USER_ID);
    if (!balance) {
      throw new Error("Balance not found");
    }

    // Check sufficient funds
    if (balance.balance < request.amount) {
      throw new Error("Insufficient funds");
    }

    // Create transaction
    const transaction: TransactionDTO = {
      id: `txn_${Date.now()}`,
      userId: DEFAULT_USER_ID,
      type: "withdrawal",
      amount: request.amount,
      currency: request.currency || "EUR",
      status: "completed",
      timestamp: new Date().toISOString(),
      description: `Withdrawal of €${request.amount.toFixed(2)}`,
    };

    // Update balance
    balance.balance -= request.amount;
    balance.updatedAt = new Date().toISOString();
    balanceStore.set(DEFAULT_USER_ID, balance);

    // Store transaction
    const transactions = transactionsStore.get(DEFAULT_USER_ID) || [];
    transactions.unshift(transaction);
    transactionsStore.set(DEFAULT_USER_ID, transactions);

    return transaction;
  }

  static async getTransactions(): Promise<TransactionDTO[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return transactionsStore.get(DEFAULT_USER_ID) || [];
  }
}
