/**
 * Arbitrage Service
 * Fetches pricing data from multiple exchanges and calculates arbitrage opportunities
 */

import type {
  ExchangeAdapter,
  ExchangeTickerData,
} from "../lib/exchanges/exchange.adapter";
import {
  BinanceAdapter,
  KrakenAdapter,
  CoinbaseAdapter,
  OKXAdapter,
} from "../lib/exchanges";

export interface ArbitrageOpportunity {
  pair: string;
  buyExchange: string;
  buyExchangeId: string;
  buyPrice: number;
  sellExchange: string;
  sellExchangeId: string;
  sellPrice: number;
  profitPercentage: number;
  profitUSD: number; // Profit per 1 BTC
  volume: {
    buyExchange: number;
    sellExchange: number;
  };
}

export interface ArbitrageResponse {
  timestamp: number;
  datetime: string;
  symbol: string;
  exchanges: ExchangeTickerData[];
  opportunities: ArbitrageOpportunity[];
  bestOpportunity: ArbitrageOpportunity | null;
  summary: {
    lowestAsk: {
      exchange: string;
      price: number;
    };
    highestBid: {
      exchange: string;
      price: number;
    };
    avgPrice: number;
    priceSpread: number;
    priceSpreadPercentage: number;
  };
}

export class ArbitrageService {
  private exchanges: ExchangeAdapter[];

  constructor() {
    // Initialize all exchange adapters
    this.exchanges = [
      new BinanceAdapter(),
      new KrakenAdapter(),
      new CoinbaseAdapter(),
      new OKXAdapter(),
    ];
  }

  /**
   * Fetch BTC/USDT prices from all exchanges
   */
  async fetchBTCPrices(): Promise<ArbitrageResponse> {
    const symbol = "BTC/USDT";
    const results: ExchangeTickerData[] = [];

    // Fetch data from all exchanges in parallel
    const promises = this.exchanges.map(async (exchange) => {
      try {
        // Check if exchange is available first
        const isAvailable = await exchange.isAvailable();
        if (!isAvailable) {
          console.warn(`${exchange.getName()} is not available`);
          return null;
        }

        const ticker = await exchange.fetchTicker(symbol);
        return ticker;
      } catch (error) {
        console.error(
          `Error fetching from ${exchange.getName()}:`,
          error instanceof Error ? error.message : "Unknown error",
        );
        return null;
      }
    });

    const tickerResults = await Promise.all(promises);

    // Filter out failed requests
    tickerResults.forEach((ticker) => {
      if (ticker) {
        results.push(ticker);
      }
    });

    if (results.length < 2) {
      throw new Error(
        "Not enough exchange data available for arbitrage analysis",
      );
    }

    // Calculate arbitrage opportunities
    const opportunities = this.calculateArbitrageOpportunities(results);

    // Find best opportunity
    const bestOpportunity =
      opportunities.length > 0
        ? opportunities.reduce((best, current) =>
            current.profitPercentage > best.profitPercentage ? current : best,
          )
        : null;

    // Calculate summary statistics
    const asks = results.map((r) => r.ask).filter((a) => a > 0);
    const bids = results.map((r) => r.bid).filter((b) => b > 0);

    const lowestAsk = Math.min(...asks);
    const highestBid = Math.max(...bids);
    const avgPrice =
      results.reduce((sum, r) => sum + r.last, 0) / results.length;
    const priceSpread = highestBid - lowestAsk;
    const priceSpreadPercentage = (priceSpread / lowestAsk) * 100;

    const lowestAskExchange = results.find((r) => r.ask === lowestAsk);
    const highestBidExchange = results.find((r) => r.bid === highestBid);

    return {
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      symbol,
      exchanges: results,
      opportunities,
      bestOpportunity,
      summary: {
        lowestAsk: {
          exchange: lowestAskExchange?.exchangeName ?? "Unknown",
          price: lowestAsk,
        },
        highestBid: {
          exchange: highestBidExchange?.exchangeName ?? "Unknown",
          price: highestBid,
        },
        avgPrice,
        priceSpread,
        priceSpreadPercentage,
      },
    };
  }

  /**
   * Calculate all possible arbitrage opportunities between exchanges
   */
  private calculateArbitrageOpportunities(
    tickers: ExchangeTickerData[],
  ): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];

    // Compare each exchange with every other exchange
    for (let i = 0; i < tickers.length; i++) {
      for (let j = 0; j < tickers.length; j++) {
        if (i === j) continue;

        const buyExchange = tickers[i];
        const sellExchange = tickers[j];

        // Buy at ask price (lowest sell price on buy exchange)
        // Sell at bid price (highest buy price on sell exchange)
        const buyPrice = buyExchange.ask;
        const sellPrice = sellExchange.bid;

        if (buyPrice > 0 && sellPrice > 0 && sellPrice > buyPrice) {
          const profitPerBTC = sellPrice - buyPrice;
          const profitPercentage = (profitPerBTC / buyPrice) * 100;

          opportunities.push({
            pair: buyExchange.symbol,
            buyExchange: buyExchange.exchangeName,
            buyExchangeId: buyExchange.exchangeId,
            buyPrice,
            sellExchange: sellExchange.exchangeName,
            sellExchangeId: sellExchange.exchangeId,
            sellPrice,
            profitPercentage,
            profitUSD: profitPerBTC,
            volume: {
              buyExchange: buyExchange.volume,
              sellExchange: sellExchange.volume,
            },
          });
        }
      }
    }

    // Sort by profit percentage descending
    return opportunities.sort(
      (a, b) => b.profitPercentage - a.profitPercentage,
    );
  }

  /**
   * Get list of supported exchanges
   */
  getSupportedExchanges(): string[] {
    return this.exchanges.map((e) => e.getName());
  }
}
