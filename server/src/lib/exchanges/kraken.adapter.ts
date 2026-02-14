/**
 * Kraken Exchange Adapter
 */

import ccxt from "ccxt";
import { CCXTBaseAdapter } from "./ccxt-base.adapter";

export class KrakenAdapter extends CCXTBaseAdapter {
  constructor() {
    super(
      new ccxt.kraken({
        enableRateLimit: true,
        timeout: 30000,
      }),
    );
  }

  getName(): string {
    return "Kraken";
  }

  getId(): string {
    return "kraken";
  }
}
