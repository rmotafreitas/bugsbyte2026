/**
 * Coinbase Exchange Adapter
 */

import ccxt from "ccxt";
import { CCXTBaseAdapter } from "./ccxt-base.adapter";

export class CoinbaseAdapter extends CCXTBaseAdapter {
  constructor() {
    super(
      new ccxt.coinbase({
        enableRateLimit: true,
        timeout: 30000,
      }),
    );
  }

  getName(): string {
    return "Coinbase";
  }

  getId(): string {
    return "coinbase";
  }
}
