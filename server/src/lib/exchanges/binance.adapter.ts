/**
 * Binance Exchange Adapter
 */

import ccxt from "ccxt";
import { CCXTBaseAdapter } from "./ccxt-base.adapter";

export class BinanceAdapter extends CCXTBaseAdapter {
  constructor() {
    super(
      new ccxt.binance({
        enableRateLimit: true,
        timeout: 30000,
      }),
    );
  }

  getName(): string {
    return "Binance";
  }

  getId(): string {
    return "binance";
  }
}
