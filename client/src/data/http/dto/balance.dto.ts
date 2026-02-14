// data/http/dto/balance.dto.ts
export interface BalanceDTO {
  userId: string;
  balance: number;
  currency: string;
  updatedAt: string;
}

export interface TransactionDTO {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  timestamp: string;
  description?: string;
}

export interface DepositRequestDTO {
  amount: number;
  currency?: string;
}

export interface WithdrawalRequestDTO {
  amount: number;
  currency?: string;
}
