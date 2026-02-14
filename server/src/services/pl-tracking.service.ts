/**
 * P&L (Profit & Loss) Tracking Service
 * Tracks arbitrage opportunities and simulated trades for dashboard
 * For Spread Hunters Hackathon
 */

import type { ArbitrageCalculation } from "./orderbook-arbitrage.service";

export interface SimulatedTrade {
  id: string;
  timestamp: number;
  datetime: string;
  symbol: string;
  opportunity: ArbitrageCalculation;
  status: "detected" | "simulated" | "executed";
  userId?: string;
}

export interface PLSummary {
  totalOpportunitiesDetected: number;
  totalSimulatedTrades: number;
  cumulativeProfitUSD: number;
  cumulativeProfitPercentage: number;
  averageProfitPerTrade: number;
  bestTrade: SimulatedTrade | null;
  worstTrade: SimulatedTrade | null;
  profitableTradesCount: number;
  totalTradesCount: number;
  winRate: number; // Percentage of profitable trades
}

export class PLTrackingService {
  private trades: Map<string, SimulatedTrade> = new Map();
  private opportunitiesLog: Array<{
    timestamp: number;
    opportunity: ArbitrageCalculation;
  }> = [];

  private readonly MAX_HISTORY = 1000; // Keep last 1000 opportunities

  /**
   * Log a detected arbitrage opportunity
   */
  logOpportunity(opportunity: ArbitrageCalculation): void {
    this.opportunitiesLog.push({
      timestamp: Date.now(),
      opportunity,
    });

    // Keep only recent history
    if (this.opportunitiesLog.length > this.MAX_HISTORY) {
      this.opportunitiesLog.shift();
    }
  }

  /**
   * Record a simulated trade
   */
  recordSimulatedTrade(
    symbol: string,
    opportunity: ArbitrageCalculation,
    userId?: string,
  ): SimulatedTrade {
    const trade: SimulatedTrade = {
      id: this.generateTradeId(),
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      symbol,
      opportunity,
      status: "simulated",
      userId,
    };

    this.trades.set(trade.id, trade);
    return trade;
  }

  /**
   * Get all trades (with optional filtering)
   */
  getTrades(filter?: {
    userId?: string;
    status?: SimulatedTrade["status"];
    limit?: number;
  }): SimulatedTrade[] {
    let trades = Array.from(this.trades.values());

    if (filter?.userId) {
      trades = trades.filter((t) => t.userId === filter.userId);
    }

    if (filter?.status) {
      trades = trades.filter((t) => t.status === filter.status);
    }

    // Sort by timestamp descending (most recent first)
    trades.sort((a, b) => b.timestamp - a.timestamp);

    if (filter?.limit) {
      trades = trades.slice(0, filter.limit);
    }

    return trades;
  }

  /**
   * Get P&L summary
   */
  getPLSummary(userId?: string): PLSummary {
    const relevantTrades = userId
      ? Array.from(this.trades.values()).filter((t) => t.userId === userId)
      : Array.from(this.trades.values());

    const relevantOpportunities = userId
      ? this.opportunitiesLog // In a real system, would filter by user
      : this.opportunitiesLog;

    if (relevantTrades.length === 0) {
      return {
        totalOpportunitiesDetected: relevantOpportunities.length,
        totalSimulatedTrades: 0,
        cumulativeProfitUSD: 0,
        cumulativeProfitPercentage: 0,
        averageProfitPerTrade: 0,
        bestTrade: null,
        worstTrade: null,
        profitableTradesCount: 0,
        totalTradesCount: 0,
        winRate: 0,
      };
    }

    const cumulativeProfitUSD = relevantTrades.reduce(
      (sum, trade) => sum + trade.opportunity.netProfit,
      0,
    );

    const cumulativeProfitPercentage = relevantTrades.reduce(
      (sum, trade) => sum + trade.opportunity.netProfitPercentage,
      0,
    );

    const profitableTrades = relevantTrades.filter(
      (t) => t.opportunity.isProfitable,
    );

    const bestTrade = relevantTrades.reduce((best, current) =>
      current.opportunity.netProfit > (best?.opportunity.netProfit ?? -Infinity)
        ? current
        : best,
    );

    const worstTrade = relevantTrades.reduce((worst, current) =>
      current.opportunity.netProfit < (worst?.opportunity.netProfit ?? Infinity)
        ? current
        : worst,
    );

    return {
      totalOpportunitiesDetected: relevantOpportunities.length,
      totalSimulatedTrades: relevantTrades.length,
      cumulativeProfitUSD,
      cumulativeProfitPercentage,
      averageProfitPerTrade: cumulativeProfitUSD / relevantTrades.length,
      bestTrade,
      worstTrade,
      profitableTradesCount: profitableTrades.length,
      totalTradesCount: relevantTrades.length,
      winRate:
        relevantTrades.length > 0
          ? (profitableTrades.length / relevantTrades.length) * 100
          : 0,
    };
  }

  /**
   * Get recent opportunities
   */
  getRecentOpportunities(limit: number = 50): Array<{
    timestamp: number;
    datetime: string;
    opportunity: ArbitrageCalculation;
  }> {
    return this.opportunitiesLog
      .slice(-limit)
      .reverse()
      .map((log) => ({
        timestamp: log.timestamp,
        datetime: new Date(log.timestamp).toISOString(),
        opportunity: log.opportunity,
      }));
  }

  /**
   * Clear all history (for testing or reset)
   */
  clearHistory(): void {
    this.trades.clear();
    this.opportunitiesLog = [];
  }

  /**
   * Generate unique trade ID
   */
  private generateTradeId(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get statistics for a specific time period
   */
  getStatistics(timeRangeMs?: number): {
    opportunitiesInPeriod: number;
    tradesInPeriod: number;
    avgProfitPercentage: number;
    totalProfitUSD: number;
  } {
    const cutoffTime = timeRangeMs ? Date.now() - timeRangeMs : 0;

    const recentOpportunities = this.opportunitiesLog.filter(
      (log) => log.timestamp > cutoffTime,
    );

    const recentTrades = Array.from(this.trades.values()).filter(
      (trade) => trade.timestamp > cutoffTime,
    );

    const avgProfitPercentage =
      recentTrades.length > 0
        ? recentTrades.reduce(
            (sum, t) => sum + t.opportunity.netProfitPercentage,
            0,
          ) / recentTrades.length
        : 0;

    const totalProfitUSD = recentTrades.reduce(
      (sum, t) => sum + t.opportunity.netProfit,
      0,
    );

    return {
      opportunitiesInPeriod: recentOpportunities.length,
      tradesInPeriod: recentTrades.length,
      avgProfitPercentage,
      totalProfitUSD,
    };
  }
}

// Singleton instance
export const plTrackingService = new PLTrackingService();
