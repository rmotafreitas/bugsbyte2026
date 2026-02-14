/**
 * Gate.io Exchange Adapter
 */

import ccxt from "ccxt";
import { CCXTBaseAdapter } from "./ccxt-base.adapter";

export class GateAdapter extends CCXTBaseAdapter {
  constructor() {
    super(
      new ccxt.gate({
        enableRateLimit: true,
        timeout: 30000,
      }),
    );
  }

  getName(): string {
    return "Gate.io";
  }

  getId(): string {
    return "gate";
  }
}
