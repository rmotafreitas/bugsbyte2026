/**
 * KuCoin Exchange Adapter
 */

import ccxt from "ccxt";
import { CCXTBaseAdapter } from "./ccxt-base.adapter";

export class KuCoinAdapter extends CCXTBaseAdapter {
  constructor() {
    super(
      new ccxt.kucoin({
        enableRateLimit: true,
        timeout: 30000,
      }),
    );
  }

  getName(): string {
    return "KuCoin";
  }

  getId(): string {
    return "kucoin";
  }
}
