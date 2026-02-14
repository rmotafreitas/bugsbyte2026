/**
 * CCXT Base Adapter
 * Abstract class that implements common CCXT exchange logic
 */

import ccxt, { Exchange } from "ccxt";
import type { ExchangeAdapter, ExchangeTickerData } from "./exchange.adapter";

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
