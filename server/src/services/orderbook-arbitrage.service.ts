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
  GateAdapter,
  KuCoinAdapter,
  BitgetAdapter,
  BybitAdapter,
  MEXCAdapter,
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
  private readonly MIN_PROFIT_THRESHOLD = 0.01; // 0.01% - catch even tiny opportunities

  // Curated list of coins known for wider cross-exchange spreads
  static readonly HIGH_OPPORTUNITY_SYMBOLS = [
    // Memecoins - high volatility, often listed at different times
    "PEPE/USDT",
    "BONK/USDT",
    "WIF/USDT",
    "FLOKI/USDT",
    "SHIB/USDT",
    "DOGE/USDT",
    // Mid-cap alts - decent volume but less arb bot competition
    "SEI/USDT",
    "SUI/USDT",
    "TIA/USDT",
    "INJ/USDT",
    "JUP/USDT",
    "STRK/USDT",
    "PYTH/USDT",
    "JTO/USDT",
    "ONDO/USDT",
    "RENDER/USDT",
    // Large caps - tight spreads but huge volume
    "BTC/USDT",
    "ETH/USDT",
    "SOL/USDT",
    "XRP/USDT",
    "ADA/USDT",
    "AVAX/USDT",
    "LINK/USDT",
    "DOT/USDT",
  ];

  constructor() {
    this.exchanges = [
      new BinanceAdapter(),
      new KrakenAdapter(),
      new CoinbaseAdapter(),
      new OKXAdapter(),
      new GateAdapter(),
      new KuCoinAdapter(),
      new BitgetAdapter(),
      new BybitAdapter(),
      new MEXCAdapter(), // 0% maker fee!
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

  /**
   * FAST ticker-based spread scanner - no amount dependency, no slippage
   * Compares best bid/ask across exchanges using tickers (much faster than order books)
   * Shows gross spread + multiple fee scenarios (maker vs taker)
   */
  async tickerSpreadScan(symbols: string[]): Promise<TickerSpreadScanResult> {
    const startTime = Date.now();
    const results: TickerSpreadResult[] = [];

    // Load markets once
    await Promise.all(
      this.exchanges.map(async (adapter) => {
        try {
          await adapter.isAvailable();
        } catch {
          // ignore
        }
      }),
    );

    // Scan in batches of 5 (tickers are lightweight)
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map((symbol) => this.scanTickerSpread(symbol)),
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value) {
          results.push(result.value);
        }
      }

      if (i + batchSize < symbols.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    // Sort by best gross spread
    results.sort((a, b) => {
      const aSpread = a.bestSpread?.grossSpreadPercent ?? -Infinity;
      const bSpread = b.bestSpread?.grossSpreadPercent ?? -Infinity;
      return bSpread - aSpread;
    });

    const profitableWithMaker = results.filter(
      (r) => r.bestSpread && r.bestSpread.netProfitWithMakerFees.percent > 0,
    ).length;
    const profitableWithTaker = results.filter(
      (r) => r.bestSpread && r.bestSpread.netProfitWithTakerFees.percent > 0,
    ).length;

    return {
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      scanDurationMs: Date.now() - startTime,
      symbolsScanned: symbols.length,
      symbolsWithData: results.filter((r) => r.exchangeCount >= 2).length,
      profitableWithMakerFees: profitableWithMaker,
      profitableWithTakerFees: profitableWithTaker,
      results,
      topOpportunities: results
        .filter((r) => r.bestSpread && r.bestSpread.grossSpreadPercent > 0)
        .slice(0, 10),
    };
  }

  private async scanTickerSpread(
    symbol: string,
  ): Promise<TickerSpreadResult | null> {
    interface ExchangeTicker {
      exchangeName: string;
      exchangeId: string;
      bid: number;
      ask: number;
      last: number;
      volume: number;
      makerFee: number;
      takerFee: number;
    }

    const tickers: ExchangeTicker[] = [];

    const promises = this.exchanges.map(async (adapter) => {
      try {
        const ticker = await adapter.fetchTicker(symbol);
        if (ticker.bid > 0 && ticker.ask > 0) {
          const fees = adapter.getTradingFees();
          tickers.push({
            exchangeName: ticker.exchangeName,
            exchangeId: ticker.exchangeId,
            bid: ticker.bid,
            ask: ticker.ask,
            last: ticker.last,
            volume: ticker.volume,
            makerFee: fees.maker,
            takerFee: fees.taker,
          });
        }
      } catch {
        // skip
      }
    });

    await Promise.all(promises);

    if (tickers.length < 2) return null;

    // Find all cross-exchange spreads
    const spreads: SpreadOpportunity[] = [];

    for (const buyFrom of tickers) {
      for (const sellTo of tickers) {
        if (buyFrom.exchangeId === sellTo.exchangeId) continue;

        // Buy at the ask on buyFrom exchange, sell at the bid on sellTo exchange
        const buyPrice = buyFrom.ask;
        const sellPrice = sellTo.bid;
        const grossSpreadPercent = ((sellPrice - buyPrice) / buyPrice) * 100;

        // Scenario 1: Both maker fees (limit orders on both sides)
        const makerBuyFee = buyPrice * buyFrom.makerFee;
        const makerSellFee = sellPrice * sellTo.makerFee;
        const makerTotalFeePercent = (buyFrom.makerFee + sellTo.makerFee) * 100;
        const makerNetPercent = grossSpreadPercent - makerTotalFeePercent;

        // Scenario 2: Both taker fees (market orders)
        const takerBuyFee = buyPrice * buyFrom.takerFee;
        const takerSellFee = sellPrice * sellTo.takerFee;
        const takerTotalFeePercent = (buyFrom.takerFee + sellTo.takerFee) * 100;
        const takerNetPercent = grossSpreadPercent - takerTotalFeePercent;

        // Scenario 3: Maker buy (limit) + Taker sell (market) - most realistic
        const hybridFeePercent = (buyFrom.makerFee + sellTo.takerFee) * 100;
        const hybridNetPercent = grossSpreadPercent - hybridFeePercent;

        spreads.push({
          buyExchange: buyFrom.exchangeName,
          buyExchangeId: buyFrom.exchangeId,
          sellExchange: sellTo.exchangeName,
          sellExchangeId: sellTo.exchangeId,
          buyPrice,
          sellPrice,
          grossSpreadPercent,
          netProfitWithMakerFees: {
            percent: makerNetPercent,
            feePercent: makerTotalFeePercent,
            label: "Both limit orders (maker+maker)",
          },
          netProfitWithTakerFees: {
            percent: takerNetPercent,
            feePercent: takerTotalFeePercent,
            label: "Both market orders (taker+taker)",
          },
          netProfitHybrid: {
            percent: hybridNetPercent,
            feePercent: hybridFeePercent,
            label: "Limit buy + Market sell (maker+taker)",
          },
          isProfitableWithMaker: makerNetPercent > 0,
          isProfitableWithTaker: takerNetPercent > 0,
          estimatedProfitPer1000USD: {
            withMakerFees: makerNetPercent * 10, // $1000 * percent/100
            withTakerFees: takerNetPercent * 10,
            withHybridFees: hybridNetPercent * 10,
          },
        });
      }
    }

    // Sort by gross spread
    spreads.sort((a, b) => b.grossSpreadPercent - a.grossSpreadPercent);

    return {
      symbol,
      exchangeCount: tickers.length,
      tickers: tickers.map((t) => ({
        exchange: t.exchangeName,
        exchangeId: t.exchangeId,
        bid: t.bid,
        ask: t.ask,
        spread: ((t.ask - t.bid) / t.bid) * 100,
        volume: t.volume,
        makerFee: `${(t.makerFee * 100).toFixed(2)}%`,
        takerFee: `${(t.takerFee * 100).toFixed(2)}%`,
      })),
      bestSpread: spreads[0] ?? null,
      allSpreads: spreads,
      positiveSpreads: spreads.filter((s) => s.grossSpreadPercent > 0).length,
    };
  }

  /**
   * Scan multiple symbols at once to find the best arbitrage opportunities
   * This is the money-maker - scans many pairs to find the widest spreads
   */
  async scanMultipleSymbols(
    symbols: string[],
    tradeAmountUSD: number = 1000,
  ): Promise<MultiSymbolScanResult> {
    const startTime = Date.now();
    const allOpportunities: SymbolScanResult[] = [];

    // Load markets once for all exchanges
    await Promise.all(
      this.exchanges.map(async (adapter) => {
        try {
          await adapter.isAvailable();
        } catch {
          // ignore
        }
      }),
    );

    // Scan symbols in batches of 3 to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map(async (symbol) => {
          try {
            // Estimate trade amount in base currency using first available ticker
            let tradeAmount = 1;
            for (const adapter of this.exchanges) {
              try {
                const ticker = await adapter.fetchTicker(symbol);
                if (ticker.last > 0) {
                  tradeAmount = tradeAmountUSD / ticker.last;
                  break;
                }
              } catch {
                continue;
              }
            }

            const result = await this.calculateArbitrage(symbol, tradeAmount);

            // Find the best opportunity (even if not profitable by our threshold)
            const bestOpp =
              result.opportunities.length > 0
                ? result.opportunities[0] // Already sorted by netProfitPercentage desc
                : null;

            return {
              symbol,
              tradeAmountUSD,
              tradeAmountBase: tradeAmount,
              exchangesResponded: result.orderBooks.length,
              totalOpportunities: result.opportunities.length,
              profitableOpportunities: result.summary.profitableOpportunities,
              bestOpportunity: bestOpp
                ? {
                    buyExchange: bestOpp.buyExchange,
                    buyExchangeId: bestOpp.buyExchangeId,
                    sellExchange: bestOpp.sellExchange,
                    sellExchangeId: bestOpp.sellExchangeId,
                    buyPrice: bestOpp.buyPrice,
                    sellPrice: bestOpp.sellPrice,
                    spreadPercentage:
                      ((bestOpp.sellPrice - bestOpp.buyPrice) /
                        bestOpp.buyPrice) *
                      100,
                    netProfitPercentage: bestOpp.netProfitPercentage,
                    netProfitUSD: bestOpp.netProfit,
                    isProfitable: bestOpp.isProfitable,
                    fees: bestOpp.tradingFees,
                  }
                : null,
            } as SymbolScanResult;
          } catch (error) {
            return {
              symbol,
              tradeAmountUSD,
              tradeAmountBase: 0,
              exchangesResponded: 0,
              totalOpportunities: 0,
              profitableOpportunities: 0,
              bestOpportunity: null,
              error: error instanceof Error ? error.message : "Unknown error",
            } as SymbolScanResult;
          }
        }),
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          allOpportunities.push(result.value);
        }
      }

      // Small delay between batches to respect rate limits
      if (i + batchSize < symbols.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Sort by best spread (highest netProfitPercentage first)
    allOpportunities.sort((a, b) => {
      const aProfit = a.bestOpportunity?.netProfitPercentage ?? -Infinity;
      const bProfit = b.bestOpportunity?.netProfitPercentage ?? -Infinity;
      return bProfit - aProfit;
    });

    const profitableCount = allOpportunities.filter(
      (o) => o.bestOpportunity?.isProfitable,
    ).length;

    return {
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      scanDurationMs: Date.now() - startTime,
      symbolsScanned: symbols.length,
      symbolsWithData: allOpportunities.filter((o) => o.exchangesResponded >= 2)
        .length,
      profitableSymbols: profitableCount,
      results: allOpportunities,
      topOpportunities: allOpportunities
        .filter((o) => o.bestOpportunity !== null)
        .slice(0, 10),
    };
  }
}

export interface SymbolScanResult {
  symbol: string;
  tradeAmountUSD: number;
  tradeAmountBase: number;
  exchangesResponded: number;
  totalOpportunities: number;
  profitableOpportunities: number;
  bestOpportunity: {
    buyExchange: string;
    buyExchangeId: string;
    sellExchange: string;
    sellExchangeId: string;
    buyPrice: number;
    sellPrice: number;
    spreadPercentage: number;
    netProfitPercentage: number;
    netProfitUSD: number;
    isProfitable: boolean;
    fees: {
      buyFee: number;
      sellFee: number;
      total: number;
    };
  } | null;
  error?: string;
}

export interface MultiSymbolScanResult {
  timestamp: number;
  datetime: string;
  scanDurationMs: number;
  symbolsScanned: number;
  symbolsWithData: number;
  profitableSymbols: number;
  results: SymbolScanResult[];
  topOpportunities: SymbolScanResult[];
}

export interface SpreadOpportunity {
  buyExchange: string;
  buyExchangeId: string;
  sellExchange: string;
  sellExchangeId: string;
  buyPrice: number;
  sellPrice: number;
  grossSpreadPercent: number;
  netProfitWithMakerFees: {
    percent: number;
    feePercent: number;
    label: string;
  };
  netProfitWithTakerFees: {
    percent: number;
    feePercent: number;
    label: string;
  };
  netProfitHybrid: {
    percent: number;
    feePercent: number;
    label: string;
  };
  isProfitableWithMaker: boolean;
  isProfitableWithTaker: boolean;
  estimatedProfitPer1000USD: {
    withMakerFees: number;
    withTakerFees: number;
    withHybridFees: number;
  };
}

export interface TickerSpreadResult {
  symbol: string;
  exchangeCount: number;
  tickers: Array<{
    exchange: string;
    exchangeId: string;
    bid: number;
    ask: number;
    spread: number;
    volume: number;
    makerFee: string;
    takerFee: string;
  }>;
  bestSpread: SpreadOpportunity | null;
  allSpreads: SpreadOpportunity[];
  positiveSpreads: number;
}

export interface TickerSpreadScanResult {
  timestamp: number;
  datetime: string;
  scanDurationMs: number;
  symbolsScanned: number;
  symbolsWithData: number;
  profitableWithMakerFees: number;
  profitableWithTakerFees: number;
  results: TickerSpreadResult[];
  topOpportunities: TickerSpreadResult[];
}
