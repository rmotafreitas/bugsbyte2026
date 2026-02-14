/**
 * Bybit Exchange Adapter
 */

import ccxt from "ccxt";
import { CCXTBaseAdapter } from "./ccxt-base.adapter";

export class BybitAdapter extends CCXTBaseAdapter {
  constructor() {
    super(
      new ccxt.bybit({
        enableRateLimit: true,
        timeout: 30000,
        options: { defaultType: "spot" }, // força spot
      }),
    );
  }

  getName(): string {
    return "Bybit";
  }

  getId(): string {
    return "bybit";
  }
}
