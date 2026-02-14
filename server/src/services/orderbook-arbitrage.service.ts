/**
 * Order Book Arbitrage Service
 * Advanced arbitrage detection using order books with fee and slippage calculations
 * For Spread Hunters Hackathon
 */

import type {
  ExchangeAdapter,
  OrderBookData,
  TradingFees,
} from "../lib/exchanges";
import {
  BinanceAdapter,
  KrakenAdapter,
  CoinbaseAdapter,
  OKXAdapter,
} from "../lib/exchanges";

export interface ArbitrageCalculation {
  buyExchange: string;
  buyExchangeId: string;
  sellExchange: string;
  sellExchangeId: string;
  buyPrice: number; // Weighted average buy price
  sellPrice: number; // Weighted average sell price
  amount: number; // BTC amount that can be traded
  grossProfit: number; // Profit before fees
  tradingFees: {
    buyFee: number;
    sellFee: number;
    total: number;
  };
  slippage: {
    buySlippage: number;
    sellSlippage: number;
    total: number;
  };
  netProfit: number; // Profit after all costs
  netProfitPercentage: number; // ROI percentage
  isProfitable: boolean;
  orderBookDepth: {
    buyExchangeBidDepth: number; // Total BTC available in buy exchange
    sellExchangeAskDepth: number; // Total BTC available in sell exchange
  };
}

export interface OrderBookArbitrageResponse {
  timestamp: number;
  datetime: string;
  symbol: string;
  orderBooks: OrderBookData[];
  opportunities: ArbitrageCalculation[];
  bestOpportunity: ArbitrageCalculation | null;
  summary: {
    totalOpportunitiesFound: number;
    profitableOpportunities: number;
    bestNetProfitPercentage: number;
    averageSpread: number;
  };
}

interface ExchangeWithOrderBook {
  adapter: ExchangeAdapter;
  orderBook: OrderBookData;
  fees: TradingFees;
}

export class OrderBookArbitrageService {
  private exchanges: ExchangeAdapter[];
  private readonly DEFAULT_TRADE_AMOUNT = 1; // BTC
  private readonly MIN_PROFIT_THRESHOLD = 0.5; // 0.5% minimum profit threshold

  constructor() {
    this.exchanges = [
      new BinanceAdapter(),
      new KrakenAdapter(),
      new CoinbaseAdapter(),
      new OKXAdapter(),
    ];
  }

  /**
   * Fetch order books and calculate arbitrage opportunities
   */
  async calculateArbitrage(
    symbol: string = "BTC/USDT",
    tradeAmount: number = this.DEFAULT_TRADE_AMOUNT,
  ): Promise<OrderBookArbitrageResponse> {
    const exchangesWithOrderBooks: ExchangeWithOrderBook[] = [];

    // Fetch order books from all exchanges in parallel
    const promises = this.exchanges.map(async (adapter) => {
      try {
        const isAvailable = await adapter.isAvailable();
        if (!isAvailable) {
          console.warn(`${adapter.getName()} is not available`);
          return null;
        }

        const orderBook = await adapter.fetchOrderBook(symbol, 50); // Fetch deeper order book
        const fees = adapter.getTradingFees();

        return { adapter, orderBook, fees };
      } catch (error) {
        console.error(
          `Error fetching order book from ${adapter.getName()}:`,
          error instanceof Error ? error.message : "Unknown error",
        );
        return null;
      }
    });

    const results = await Promise.all(promises);

    // Filter out failed requests
    results.forEach((result) => {
      if (result) {
        exchangesWithOrderBooks.push(result);
      }
    });

    if (exchangesWithOrderBooks.length < 2) {
      throw new Error(
        "Not enough exchanges available for order book arbitrage analysis",
      );
    }

    // Calculate all arbitrage opportunities
    const opportunities = this.findArbitrageOpportunities(
      exchangesWithOrderBooks,
      tradeAmount,
    );

    // Find best opportunity
    const profitableOpportunities = opportunities.filter((o) => o.isProfitable);
    const bestOpportunity =
      profitableOpportunities.length > 0
        ? profitableOpportunities.reduce((best, current) =>
            current.netProfitPercentage > best.netProfitPercentage
              ? current
              : best,
          )
        : null;

    // Calculate summary
    const avgSpread =
      opportunities.length > 0
        ? opportunities.reduce((sum, o) => sum + o.netProfitPercentage, 0) /
          opportunities.length
        : 0;

    return {
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      symbol,
      orderBooks: exchangesWithOrderBooks.map((e) => e.orderBook),
      opportunities: opportunities.sort(
        (a, b) => b.netProfitPercentage - a.netProfitPercentage,
      ),
      bestOpportunity,
      summary: {
        totalOpportunitiesFound: opportunities.length,
        profitableOpportunities: profitableOpportunities.length,
        bestNetProfitPercentage: bestOpportunity?.netProfitPercentage ?? 0,
        averageSpread: avgSpread,
      },
    };
  }

  /**
   * Find all arbitrage opportunities between exchanges
   */
  private findArbitrageOpportunities(
    exchangesData: ExchangeWithOrderBook[],
    tradeAmount: number,
  ): ArbitrageCalculation[] {
    const opportunities: ArbitrageCalculation[] = [];

    // Compare each exchange with every other exchange
    for (let i = 0; i < exchangesData.length; i++) {
      for (let j = 0; j < exchangesData.length; j++) {
        if (i === j) continue;

        const buyExchange = exchangesData[i];
        const sellExchange = exchangesData[j];

        const calculation = this.calculateNetProfit(
          buyExchange,
          sellExchange,
          tradeAmount,
        );

        if (calculation) {
          opportunities.push(calculation);
        }
      }
    }

    return opportunities;
  }

  /**
   * Calculate net profit for a specific arbitrage opportunity
   * Considers order book depth, fees, and slippage
   */
  private calculateNetProfit(
    buyExchange: ExchangeWithOrderBook,
    sellExchange: ExchangeWithOrderBook,
    targetAmount: number,
  ): ArbitrageCalculation | null {
    // Calculate weighted average buy price from sell orders (asks)
    const buyResult = this.calculateExecutionPrice(
      buyExchange.orderBook.asks,
      targetAmount,
    );

    if (!buyResult) return null;

    // Calculate weighted average sell price from buy orders (bids)
    const sellResult = this.calculateExecutionPrice(
      sellExchange.orderBook.bids,
      targetAmount,
    );

    if (!sellResult) return null;

    const buyPrice = buyResult.weightedAvgPrice;
    const sellPrice = sellResult.weightedAvgPrice;

    // Calculate gross profit
    const grossRevenue = sellPrice * targetAmount;
    const totalCost = buyPrice * targetAmount;
    const grossProfit = grossRevenue - totalCost;

    // Calculate trading fees
    const buyFee = totalCost * buyExchange.fees.taker; // Using taker fee (market order)
    const sellFee = grossRevenue * sellExchange.fees.taker;
    const totalFees = buyFee + sellFee;

    // Calculate slippage (difference from mid-market price)
    const buyMidPrice = buyExchange.orderBook.asks[0]?.price ?? buyPrice;
    const sellMidPrice = sellExchange.orderBook.bids[0]?.price ?? sellPrice;

    const buySlippage = Math.abs(buyPrice - buyMidPrice) * targetAmount;
    const sellSlippage = Math.abs(sellPrice - sellMidPrice) * targetAmount;
    const totalSlippage = buySlippage + sellSlippage;

    // Calculate net profit
    const netProfit = grossProfit - totalFees;
    const netProfitPercentage = (netProfit / totalCost) * 100;

    // Calculate order book depth
    const buyExchangeBidDepth =
      buyExchange.orderBook.asks[buyExchange.orderBook.asks.length - 1]
        ?.total ?? 0;
    const sellExchangeAskDepth =
      sellExchange.orderBook.bids[sellExchange.orderBook.bids.length - 1]
        ?.total ?? 0;

    return {
      buyExchange: buyExchange.adapter.getName(),
      buyExchangeId: buyExchange.adapter.getId(),
      sellExchange: sellExchange.adapter.getName(),
      sellExchangeId: sellExchange.adapter.getId(),
      buyPrice,
      sellPrice,
      amount: targetAmount,
      grossProfit,
      tradingFees: {
        buyFee,
        sellFee,
        total: totalFees,
      },
      slippage: {
        buySlippage,
        sellSlippage,
        total: totalSlippage,
      },
      netProfit,
      netProfitPercentage,
      isProfitable:
        netProfit > 0 && netProfitPercentage >= this.MIN_PROFIT_THRESHOLD,
      orderBookDepth: {
        buyExchangeBidDepth,
        sellExchangeAskDepth,
      },
    };
  }

  /**
   * Calculate weighted average execution price based on order book
   */
  private calculateExecutionPrice(
    orders: Array<{ price: number; amount: number }>,
    targetAmount: number,
  ): { weightedAvgPrice: number; actualAmount: number } | null {
    if (orders.length === 0) return null;

    let remainingAmount = targetAmount;
    let totalCost = 0;
    let filledAmount = 0;

    for (const order of orders) {
      if (remainingAmount <= 0) break;

      const amountFromThisLevel = Math.min(order.amount, remainingAmount);
      totalCost += amountFromThisLevel * order.price;
      filledAmount += amountFromThisLevel;
      remainingAmount -= amountFromThisLevel;
    }

    // If we couldn't fill the entire order, return null
    if (filledAmount < targetAmount * 0.9) {
      // Allow 90% fill
      return null;
    }

    return {
      weightedAvgPrice: totalCost / filledAmount,
      actualAmount: filledAmount,
    };
  }

  /**
   * Get supported exchanges
   */
  getSupportedExchanges(): string[] {
    return this.exchanges.map((e) => e.getName());
  }
}
