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

export interface OrderBookLevel {
  price: number;
  amount: number;
  total?: number; // Cumulative amount
}

export interface OrderBookData {
  symbol: string;
  exchangeName: string;
  exchangeId: string;
  bids: OrderBookLevel[]; // Buy orders (sorted highest to lowest)
  asks: OrderBookLevel[]; // Sell orders (sorted lowest to highest)
  timestamp: number;
  datetime: string;
  nonce?: number;
}

export interface TradingFees {
  maker: number; // Fee for providing liquidity (limit orders)
  taker: number; // Fee for taking liquidity (market orders)
  percentage: boolean; // true if fees are percentages
}

export interface ExchangeInfo {
  id: string;
  name: string;
  countries: string[];
  url: string;
  version: string | undefined;
  rateLimit: number; // ms between requests
  has: {
    fetchTicker: boolean;
    fetchOrderBook: boolean;
    fetchTrades: boolean;
    fetchOHLCV: boolean;
    createOrder: boolean;
    cancelOrder: boolean;
    fetchBalance: boolean;
    fetchMarkets: boolean;
  };
  fees: TradingFees;
  supportedOrderTypes: string[];
  timeframes: string[];
  precisionMode: string | undefined;
  requiredCredentials: {
    apiKey: boolean;
    secret: boolean;
    password: boolean;
  };
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
   * Fetch order book for a specific trading pair
   * @param symbol Trading pair (e.g., 'BTC/USDT')
   * @param limit Number of order book levels to fetch
   */
  fetchOrderBook(symbol: string, limit?: number): Promise<OrderBookData>;

  /**
   * Get trading fees for the exchange
   */
  getTradingFees(): TradingFees;

  /**
   * Get detailed exchange info (fees, order types, supported features, etc.)
   */
  getExchangeInfo(): Promise<ExchangeInfo>;

  /**
   * Check if the exchange is available
   */
  isAvailable(): Promise<boolean>;
}
