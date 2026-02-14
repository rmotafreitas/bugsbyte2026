/**
 * Balance Service
 * Manages user wallet balance, deposits, withdrawals, and trade settlements
 * All values in USD
 */

import { prisma } from "../lib/prisma";

export interface BalanceSummary {
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalTraded: number;
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
  tradeCount: number;
  winRate: number;
}

export interface TransactionRecord {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  balanceAfter: number;
  createdAt: Date;
}

export interface TradeRecord {
  id: string;
  symbol: string;
  amount: number;
  costUSD: number;
  revenueUSD: number;
  feesUSD: number;
  profitUSD: number;
  profitPercent: number;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  status: string;
  createdAt: Date;
}

export class BalanceService {
  /**
   * Get user's current balance
   */
  async getBalance(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user) throw new Error("User not found");
    return user.balance;
  }

  /**
   * Deposit funds into user's balance
   */
  async deposit(
    userId: string,
    amount: number,
  ): Promise<{ balance: number; transaction: TransactionRecord }> {
    if (amount <= 0) throw new Error("Deposit amount must be positive");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const newBalance = user.balance + amount;

    // Update balance and create transaction atomically
    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: "deposit",
          amount,
          balanceAfter: newBalance,
        },
      }),
    ]);

    return {
      balance: updatedUser.balance,
      transaction: transaction as TransactionRecord,
    };
  }

  /**
   * Withdraw funds from user's balance
   */
  async withdraw(
    userId: string,
    amount: number,
  ): Promise<{ balance: number; transaction: TransactionRecord }> {
    if (amount <= 0) throw new Error("Withdrawal amount must be positive");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (user.balance < amount) {
      throw new Error(
        `Insufficient balance. Current: $${user.balance.toFixed(2)}, Requested: $${amount.toFixed(2)}`,
      );
    }

    const newBalance = user.balance - amount;

    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      }),
      prisma.transaction.create({
        data: {
          userId,
          type: "withdrawal",
          amount,
          balanceAfter: newBalance,
        },
      }),
    ]);

    return {
      balance: updatedUser.balance,
      transaction: transaction as TransactionRecord,
    };
  }

  /**
   * Execute a trade using user's balance
   * Deducts the cost from balance, then adds revenue (profit/loss reflected)
   */
  async executeTrade(
    userId: string,
    tradeData: {
      symbol: string;
      amount: number;
      costUSD: number;
      revenueUSD: number;
      feesUSD: number;
      buyExchange: string;
      sellExchange: string;
      buyPrice: number;
      sellPrice: number;
    },
  ): Promise<{ trade: TradeRecord; balance: number }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const totalCost = tradeData.costUSD + tradeData.feesUSD;

    if (user.balance < totalCost) {
      throw new Error(
        `Insufficient balance for trade. Need: $${totalCost.toFixed(2)}, Have: $${user.balance.toFixed(2)}`,
      );
    }

    const profitUSD =
      tradeData.revenueUSD - tradeData.costUSD - tradeData.feesUSD;
    const profitPercent = (profitUSD / tradeData.costUSD) * 100;

    // New balance = old balance - cost + revenue  (net effect: balance += profit - fees)
    const newBalance = user.balance + profitUSD;

    const [updatedUser, trade] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { balance: newBalance },
      }),
      prisma.trade.create({
        data: {
          userId,
          symbol: tradeData.symbol,
          amount: tradeData.amount,
          costUSD: tradeData.costUSD,
          revenueUSD: tradeData.revenueUSD,
          feesUSD: tradeData.feesUSD,
          profitUSD,
          profitPercent,
          buyExchange: tradeData.buyExchange,
          sellExchange: tradeData.sellExchange,
          buyPrice: tradeData.buyPrice,
          sellPrice: tradeData.sellPrice,
          status: "executed",
        },
      }),
    ]);

    return {
      trade: trade as TradeRecord,
      balance: updatedUser.balance,
    };
  }

  /**
   * Get full balance summary with all aggregated stats
   */
  async getBalanceSummary(userId: string): Promise<BalanceSummary> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    });

    if (!user) throw new Error("User not found");

    // Get total deposited
    const deposits = await prisma.transaction.aggregate({
      where: { userId, type: "deposit" },
      _sum: { amount: true },
    });

    // Get total withdrawn
    const withdrawals = await prisma.transaction.aggregate({
      where: { userId, type: "withdrawal" },
      _sum: { amount: true },
    });

    // Get trade stats
    const trades = await prisma.trade.findMany({
      where: { userId, status: "executed" },
      select: { costUSD: true, profitUSD: true },
    });

    const totalTraded = trades.reduce((sum, t) => sum + t.costUSD, 0);
    const totalProfit = trades
      .filter((t) => t.profitUSD > 0)
      .reduce((sum, t) => sum + t.profitUSD, 0);
    const totalLoss = Math.abs(
      trades
        .filter((t) => t.profitUSD < 0)
        .reduce((sum, t) => sum + t.profitUSD, 0),
    );
    const winCount = trades.filter((t) => t.profitUSD > 0).length;

    return {
      currentBalance: user.balance,
      totalDeposited: deposits._sum.amount ?? 0,
      totalWithdrawn: withdrawals._sum.amount ?? 0,
      totalTraded,
      totalProfit,
      totalLoss,
      netPnL: totalProfit - totalLoss,
      tradeCount: trades.length,
      winRate: trades.length > 0 ? (winCount / trades.length) * 100 : 0,
    };
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    userId: string,
    options?: { type?: "deposit" | "withdrawal"; limit?: number },
  ): Promise<TransactionRecord[]> {
    const where: any = { userId };
    if (options?.type) where.type = options.type;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
    });

    return transactions as TransactionRecord[];
  }

  /**
   * Get trade history
   */
  async getTradeHistory(
    userId: string,
    options?: { limit?: number; symbol?: string },
  ): Promise<TradeRecord[]> {
    const where: any = { userId };
    if (options?.symbol) where.symbol = options.symbol;

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
    });

    return trades as TradeRecord[];
  }
}

export const balanceService = new BalanceService();
