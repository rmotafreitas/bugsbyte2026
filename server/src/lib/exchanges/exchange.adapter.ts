/**
 * Exchange Adapter Interface
 * This adapter pattern allows easy integration of multiple exchanges
 * and makes it simple to swap or add new exchange SDKs
 */

export interface ExchangeTickerData {
  symbol: string;
  exchangeName: string;
  exchangeId: string;
  bid: number; // Highest buy price
  ask: number; // Lowest sell price
  last: number; // Last trade price
  volume: number; // 24h volume
  timestamp: number;
  datetime: string;
}

export interface ExchangeAdapter {
  /**
   * Get the exchange name
   */
  getName(): string;

  /**
   * Get the exchange ID
   */
  getId(): string;

  /**
   * Fetch ticker data for a specific trading pair
   * @param symbol Trading pair (e.g., 'BTC/USDT')
   */
  fetchTicker(symbol: string): Promise<ExchangeTickerData>;

  /**
   * Check if the exchange is available
   */
  isAvailable(): Promise<boolean>;
}
