/**
 * Bitget Exchange Adapter
 */

import ccxt from "ccxt";
import { CCXTBaseAdapter } from "./ccxt-base.adapter";

export class BitgetAdapter extends CCXTBaseAdapter {
  constructor() {
    super(
      new ccxt.bitget({
        enableRateLimit: true,
        timeout: 30000,
      }),
    );
  }

  getName(): string {
    return "Bitget";
  }

  getId(): string {
    return "bitget";
  }
}
