// core/domain/balance.ts
export class Balance {
  constructor(
    public readonly userId: string,
    public readonly balance: number,
    public readonly currency: string,
    public readonly updatedAt: Date,
  ) {}
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: "deposit" | "withdrawal",
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: "pending" | "completed" | "failed",
    public readonly timestamp: Date,
    public readonly description?: string,
  ) {}
}
