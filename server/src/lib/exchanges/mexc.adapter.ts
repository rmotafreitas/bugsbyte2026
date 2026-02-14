/**
 * MEXC Exchange Adapter
 */

import ccxt from "ccxt";
import { CCXTBaseAdapter } from "./ccxt-base.adapter";

export class MEXCAdapter extends CCXTBaseAdapter {
  constructor() {
    super(
      new ccxt.mexc({
        enableRateLimit: true,
        timeout: 30000,
      }),
    );
  }

  getName(): string {
    return "MEXC";
  }

  getId(): string {
    return "mexc";
  }
}
