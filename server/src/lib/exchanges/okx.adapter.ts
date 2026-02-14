/**
 * OKX Exchange Adapter
 */

import ccxt from "ccxt";
import { CCXTBaseAdapter } from "./ccxt-base.adapter";

export class OKXAdapter extends CCXTBaseAdapter {
  constructor() {
    super(
      new ccxt.okx({
        enableRateLimit: true,
        timeout: 30000,
      }),
    );
  }

  getName(): string {
    return "OKX";
  }

  getId(): string {
    return "okx";
  }
}
