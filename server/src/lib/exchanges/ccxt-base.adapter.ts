/**
 * CCXT Base Adapter
 * Abstract class that implements common CCXT exchange logic
 */

import ccxt, { Exchange } from "ccxt";
import type {
  ExchangeAdapter,
  ExchangeTickerData,
  ExchangeInfo,
  OrderBookData,
  OrderBookLevel,
  TradingFees,
} from "./exchange.adapter";

export abstract class CCXTBaseAdapter implements ExchangeAdapter {
  protected exchange: Exchange;

  constructor(exchange: Exchange) {
    this.exchange = exchange;
  }

  abstract getName(): string;
  abstract getId(): string;

  async fetchTicker(symbol: string): Promise<ExchangeTickerData> {
    try {
      const ticker = await this.exchange.fetchTicker(symbol);

      return {
        symbol,
        exchangeName: this.getName(),
        exchangeId: this.getId(),
        bid: ticker.bid ?? 0,
        ask: ticker.ask ?? 0,
        last: ticker.last ?? 0,
        volume: ticker.baseVolume ?? 0,
        timestamp: ticker.timestamp ?? Date.now(),
        datetime: ticker.datetime ?? new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch ticker from ${this.getName()}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async fetchOrderBook(
    symbol: string,
    limit: number = 20,
  ): Promise<OrderBookData> {
    try {
      const orderBook = await this.exchange.fetchOrderBook(symbol, limit);

      // Process bids (buy orders) - sorted highest to lowest
      const bids: OrderBookLevel[] = orderBook.bids.map(([price, amount]) => ({
        price: Number(price),
        amount: Number(amount),
      }));

      // Process asks (sell orders) - sorted lowest to highest
      const asks: OrderBookLevel[] = orderBook.asks.map(([price, amount]) => ({
        price: Number(price),
        amount: Number(amount),
      }));

      // Calculate cumulative totals
      let cumulativeBid = 0;
      bids.forEach((bid) => {
        cumulativeBid += bid.amount;
        bid.total = cumulativeBid;
      });

      let cumulativeAsk = 0;
      asks.forEach((ask) => {
        cumulativeAsk += ask.amount;
        ask.total = cumulativeAsk;
      });

      return {
        symbol,
        exchangeName: this.getName(),
        exchangeId: this.getId(),
        bids,
        asks,
        timestamp: orderBook.timestamp ?? Date.now(),
        datetime: orderBook.datetime ?? new Date().toISOString(),
        nonce: orderBook.nonce,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch order book from ${this.getName()}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  getTradingFees(): TradingFees {
    // Default fees - can be overridden by specific exchange adapters
    const fees = this.exchange.fees?.trading;

    return {
      maker: fees?.maker ?? 0.001, // 0.1% default
      taker: fees?.taker ?? 0.001, // 0.1% default
      percentage: true,
    };
  }

  async getExchangeInfo(): Promise<ExchangeInfo> {
    await this.exchange.loadMarkets();

    const has = this.exchange.has;
    const fees = this.getTradingFees();
    const timeframes = this.exchange.timeframes
      ? Object.keys(this.exchange.timeframes)
      : [];

    const supportedOrderTypes: string[] = [];
    if (has.createOrder) supportedOrderTypes.push("market", "limit");
    if (has.createStopOrder) supportedOrderTypes.push("stop");
    if (has.createStopLimitOrder) supportedOrderTypes.push("stop-limit");

    return {
      id: this.getId(),
      name: this.getName(),
      countries: (this.exchange as any).countries ?? [],
      url: (this.exchange as any).urls?.www ?? "",
      version: (this.exchange as any).version,
      rateLimit: Number(this.exchange.rateLimit),
      has: {
        fetchTicker: !!has.fetchTicker,
        fetchOrderBook: !!has.fetchOrderBook,
        fetchTrades: !!has.fetchTrades,
        fetchOHLCV: !!has.fetchOHLCV,
        createOrder: !!has.createOrder,
        cancelOrder: !!has.cancelOrder,
        fetchBalance: !!has.fetchBalance,
        fetchMarkets: !!has.fetchMarkets,
      },
      fees,
      supportedOrderTypes,
      timeframes,
      precisionMode: (this.exchange as any).precisionMode,
      requiredCredentials: {
        apiKey: !!this.exchange.requiredCredentials?.apiKey,
        secret: !!this.exchange.requiredCredentials?.secret,
        password: !!this.exchange.requiredCredentials?.password,
      },
    };
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.exchange.loadMarkets();
      return true;
    } catch (error) {
      console.error(`${this.getName()} is not available:`, error);
      return false;
    }
  }
}
