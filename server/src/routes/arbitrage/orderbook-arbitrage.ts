/**
 * Order Book Arbitrage Routes
 * Advanced arbitrage API with order book depth analysis, fee calculations, and P&L tracking
 * For Spread Hunters Hackathon
 */

import { FastifyInstance } from "fastify";
import { OrderBookArbitrageService } from "../../services/orderbook-arbitrage.service";
import { plTrackingService } from "../../services/pl-tracking.service";

const orderBookArbitrageService = new OrderBookArbitrageService();

export const orderBookArbitrageRoute = async (app: FastifyInstance) => {
  /**
   * GET /api/orderbook-arbitrage/analyze
   * Analyze order books and return arbitrage opportunities with fee calculations
   */
  app.get(
    "/api/orderbook-arbitrage/analyze",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Analyzes order books from all supported exchanges and calculates arbitrage opportunities with fees, slippage, and order book depth. This is the core engine of the Spread Hunters bot.",
        tags: ["Order Book Arbitrage"],
        summary: "Analyze order book arbitrage opportunities",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              default: "BTC/USDT",
              description: "Trading pair to analyze",
            },
            amount: {
              type: "string",
              default: "1",
              description: "Trade amount in base currency (e.g. BTC)",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  timestamp: { type: "number" },
                  datetime: { type: "string" },
                  symbol: { type: "string" },
                  orderBooks: {
                    type: "array",
                    items: { $ref: "OrderBookData#" },
                  },
                  opportunities: {
                    type: "array",
                    items: { $ref: "ArbitrageCalculation#" },
                  },
                  bestOpportunity: {
                    oneOf: [
                      { $ref: "ArbitrageCalculation#" },
                      { type: "null" },
                    ],
                  },
                  summary: {
                    type: "object",
                    properties: {
                      totalOpportunitiesFound: { type: "number" },
                      profitableOpportunities: { type: "number" },
                      bestNetProfitPercentage: { type: "number" },
                      averageSpread: { type: "number" },
                    },
                  },
                },
              },
              meta: { type: "object" },
            },
          },
          400: { $ref: "ErrorResponse#" },
          401: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
      try {
        const { symbol, amount } = request.query as {
          symbol?: string;
          amount?: string;
        };

        const tradeAmount = amount ? parseFloat(amount) : 1.0;

        if (isNaN(tradeAmount) || tradeAmount <= 0) {
          return reply.status(400).send({
            success: false,
            error: "Invalid amount parameter",
          });
        }

        const data = await orderBookArbitrageService.calculateArbitrage(
          symbol || "BTC/USDT",
          tradeAmount,
        );

        // Log all profitable opportunities
        data.opportunities
          .filter((opp) => opp.isProfitable)
          .forEach((opp) => plTrackingService.logOpportunity(opp));

        return reply.status(200).send({
          success: true,
          data,
          meta: {
            requestedBy: request.user.username || request.user.email,
            requestTimestamp: new Date().toISOString(),
            tradeAmount,
            analysis: {
              exchangesAnalyzed: data.orderBooks.length,
              totalOpportunities: data.opportunities.length,
              profitableOpportunities: data.summary.profitableOpportunities,
              bestNetProfit: data.bestOpportunity?.netProfit ?? 0,
              bestNetProfitPercentage:
                data.bestOpportunity?.netProfitPercentage ?? 0,
            },
          },
        });
      } catch (error) {
        console.error("Error in order book arbitrage analysis:", error);

        return reply.status(500).send({
          success: false,
          error: "Failed to analyze arbitrage opportunities",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    },
  );

  /**
   * POST /api/orderbook-arbitrage/simulate
   * Simulate a trade and track it in P&L
   */
  app.post(
    "/api/orderbook-arbitrage/simulate",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Simulates executing the best available arbitrage trade and records it in the P&L tracker.",
        tags: ["Order Book Arbitrage"],
        summary: "Simulate an arbitrage trade",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              default: "BTC/USDT",
              description: "Trading pair",
            },
            amount: {
              type: "number",
              default: 1,
              description: "Trade amount in BTC",
            },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  trade: { type: "object" },
                  message: { type: "string" },
                },
              },
            },
          },
          404: { $ref: "ErrorResponse#" },
          401: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
      try {
        const { symbol, amount } = request.body as {
          symbol?: string;
          amount?: number;
        };

        const tradeAmount = amount || 1.0;

        // Get current arbitrage data
        const data = await orderBookArbitrageService.calculateArbitrage(
          symbol || "BTC/USDT",
          tradeAmount,
        );

        if (!data.bestOpportunity || !data.bestOpportunity.isProfitable) {
          return reply.status(404).send({
            success: false,
            error: "No profitable arbitrage opportunity found",
          });
        }

        // Record the simulated trade
        const trade = plTrackingService.recordSimulatedTrade(
          symbol || "BTC/USDT",
          data.bestOpportunity,
          request.user.id,
        );

        return reply.status(201).send({
          success: true,
          data: {
            trade,
            message: "Trade simulated successfully",
          },
        });
      } catch (error) {
        console.error("Error simulating trade:", error);

        return reply.status(500).send({
          success: false,
          error: "Failed to simulate trade",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    },
  );

  /**
   * GET /api/orderbook-arbitrage/history
   * Get trade history and opportunities log
   */
  app.get(
    "/api/orderbook-arbitrage/history",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Returns trade history and recently detected opportunities for the authenticated user.",
        tags: ["P&L Dashboard"],
        summary: "Get trade history and opportunities log",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: {
              type: "string",
              default: "50",
              description: "Max number of records",
            },
            status: {
              type: "string",
              enum: ["detected", "simulated", "executed"],
              description: "Filter by trade status",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  trades: { type: "array" },
                  recentOpportunities: { type: "array" },
                  totalTrades: { type: "number" },
                },
              },
            },
          },
          401: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
      try {
        const { limit, status } = request.query as {
          limit?: string;
          status?: "detected" | "simulated" | "executed";
        };

        const limitNumber = limit ? parseInt(limit) : 50;

        const trades = plTrackingService.getTrades({
          userId: request.user.id,
          status,
          limit: limitNumber,
        });

        const recentOpportunities =
          plTrackingService.getRecentOpportunities(limitNumber);

        return reply.status(200).send({
          success: true,
          data: {
            trades,
            recentOpportunities,
            totalTrades: trades.length,
          },
        });
      } catch (error) {
        console.error("Error fetching history:", error);

        return reply.status(500).send({
          success: false,
          error: "Failed to fetch history",
        });
      }
    },
  );

  /**
   * GET /api/orderbook-arbitrage/pl-summary
   * Get Profit & Loss summary for dashboard
   */
  app.get(
    "/api/orderbook-arbitrage/pl-summary",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Returns the overall P&L summary and time-based statistics (24h, 7d) for the dashboard.",
        tags: ["P&L Dashboard"],
        summary: "Get Profit & Loss summary",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  overall: {
                    type: "object",
                    properties: {
                      totalOpportunitiesDetected: { type: "number" },
                      totalSimulatedTrades: { type: "number" },
                      cumulativeProfitUSD: { type: "number" },
                      cumulativeProfitPercentage: { type: "number" },
                      averageProfitPerTrade: { type: "number" },
                      bestTrade: { type: "object", nullable: true },
                      worstTrade: { type: "object", nullable: true },
                      profitableTradesCount: { type: "number" },
                      totalTradesCount: { type: "number" },
                      winRate: { type: "number" },
                    },
                  },
                  periods: {
                    type: "object",
                    properties: {
                      last24h: { type: "object" },
                      last7d: { type: "object" },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
      try {
        const summary = plTrackingService.getPLSummary(request.user.id);

        // Get statistics for different time periods
        const last24h = plTrackingService.getStatistics(24 * 60 * 60 * 1000);
        const last7d = plTrackingService.getStatistics(7 * 24 * 60 * 60 * 1000);

        return reply.status(200).send({
          success: true,
          data: {
            overall: summary,
            periods: {
              last24h: {
                ...last24h,
                label: "Last 24 Hours",
              },
              last7d: {
                ...last7d,
                label: "Last 7 Days",
              },
            },
          },
        });
      } catch (error) {
        console.error("Error fetching P&L summary:", error);

        return reply.status(500).send({
          success: false,
          error: "Failed to fetch P&L summary",
        });
      }
    },
  );

  /**
   * GET /api/orderbook-arbitrage/orderbook/:exchange
   * Get raw order book data for a specific exchange
   */
  app.get(
    "/api/orderbook-arbitrage/orderbook/:exchange",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Returns raw order book data and trading fees for a specific exchange.",
        tags: ["Order Book Arbitrage"],
        summary: "Get order book for a specific exchange",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            exchange: {
              type: "string",
              description: "Exchange ID (binance, kraken, coinbase, okx)",
            },
          },
          required: ["exchange"],
        },
        querystring: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              default: "BTC/USDT",
              description: "Trading pair",
            },
            limit: {
              type: "string",
              default: "20",
              description: "Order book depth",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  orderBook: { $ref: "OrderBookData#" },
                  fees: { $ref: "TradingFees#" },
                },
              },
            },
          },
          404: { $ref: "ErrorResponse#" },
          401: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
      try {
        const { exchange } = request.params as { exchange: string };
        const { symbol, limit } = request.query as {
          symbol?: string;
          limit?: string;
        };

        const exchangeMap: { [key: string]: any } = {
          binance: await import("../../lib/exchanges/binance.adapter").then(
            (m) => new m.BinanceAdapter(),
          ),
          kraken: await import("../../lib/exchanges/kraken.adapter").then(
            (m) => new m.KrakenAdapter(),
          ),
          coinbase: await import("../../lib/exchanges/coinbase.adapter").then(
            (m) => new m.CoinbaseAdapter(),
          ),
          okx: await import("../../lib/exchanges/okx.adapter").then(
            (m) => new m.OKXAdapter(),
          ),

          mexc: await import("../../lib/exchanges/mexc.adapter").then(
            (m) => new m.MEXCAdapter(),
          ),
          gate: await import("../../lib/exchanges/gate.adapter").then(
            (m) => new m.GateAdapter(),
          ),
          kucoin: await import("../../lib/exchanges/kucoin.adapter").then(
            (m) => new m.KuCoinAdapter(),
          ),
          bitget: await import("../../lib/exchanges/bitget.adapter").then(
            (m) => new m.BitgetAdapter(),
          ),
          bybit: await import("../../lib/exchanges/bybit.adapter").then(
            (m) => new m.BybitAdapter(),
          ),
        };

        const adapter = exchangeMap[exchange.toLowerCase()];

        if (!adapter) {
          return reply.status(404).send({
            success: false,
            error: `Exchange ${exchange} not supported`,
            supportedExchanges: Object.keys(exchangeMap),
          });
        }

        const orderBook = await adapter.fetchOrderBook(
          symbol || "BTC/USDT",
          limit ? parseInt(limit) : 20,
        );

        const fees = adapter.getTradingFees();

        return reply.status(200).send({
          success: true,
          data: {
            orderBook,
            fees,
          },
        });
      } catch (error) {
        console.error("Error fetching order book:", error);

        return reply.status(500).send({
          success: false,
          error: "Failed to fetch order book",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    },
  );

  /**
   * GET /api/orderbook-arbitrage/spreads
   * FAST ticker-based spread scanner - no amount dependency, no slippage
   * Shows raw spreads + profit under different fee scenarios (maker vs taker)
   * This is the best endpoint for finding real opportunities
   */
  app.get(
    "/api/orderbook-arbitrage/spreads",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "FAST spread scanner using tickers (not order books). No amount dependency - shows pure price spreads across exchanges. " +
          "Calculates profit under 3 fee scenarios: maker+maker (limit orders), taker+taker (market orders), and hybrid. " +
          "Much faster than /scan and shows opportunities that would be profitable with limit orders.",
        tags: ["Order Book Arbitrage"],
        summary: "Fast ticker spread scanner (no amount needed)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            symbols: {
              type: "string",
              description:
                "Comma-separated pairs (e.g. 'PEPE/USDT,WIF/USDT'). Leave empty for default list.",
            },
            preset: {
              type: "string",
              enum: ["memecoins", "midcap", "largecap", "all"],
              default: "all",
              description: "Preset symbol list to scan",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object", additionalProperties: true },
              meta: { type: "object", additionalProperties: true },
            },
          },
          401: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
      try {
        const { symbols, preset } = request.query as {
          symbols?: string;
          preset?: string;
        };

        let symbolList: string[];

        if (symbols) {
          symbolList = symbols
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .filter((s) => s.length > 0);
        } else {
          const presets: Record<string, string[]> = {
            memecoins: [
              "PEPE/USDT",
              "BONK/USDT",
              "WIF/USDT",
              "FLOKI/USDT",
              "SHIB/USDT",
              "DOGE/USDT",
            ],
            midcap: [
              "SEI/USDT",
              "SUI/USDT",
              "TIA/USDT",
              "INJ/USDT",
              "JUP/USDT",
              "STRK/USDT",
              "PYTH/USDT",
              "JTO/USDT",
              "ONDO/USDT",
              "RENDER/USDT",
            ],
            largecap: [
              "BTC/USDT",
              "ETH/USDT",
              "SOL/USDT",
              "XRP/USDT",
              "ADA/USDT",
              "AVAX/USDT",
              "LINK/USDT",
              "DOT/USDT",
            ],
            all: OrderBookArbitrageService.HIGH_OPPORTUNITY_SYMBOLS,
          };

          symbolList = presets[preset || "all"] || presets.all;
        }

        const scanResult =
          await orderBookArbitrageService.tickerSpreadScan(symbolList);

        // Log profitable findings
        scanResult.results
          .filter((r) => r.bestSpread?.isProfitableWithMaker)
          .forEach((r) => {
            const s = r.bestSpread!;
            console.log(
              `💰 SPREAD: ${r.symbol} | ${s.buyExchange} → ${s.sellExchange} | gross: ${s.grossSpreadPercent.toFixed(4)}% | maker net: ${s.netProfitWithMakerFees.percent.toFixed(4)}% | ~$${s.estimatedProfitPer1000USD.withMakerFees.toFixed(2)}/1k`,
            );
          });

        return reply.status(200).send({
          success: true,
          data: scanResult,
          meta: {
            requestedBy: request.user.username || request.user.email,
            requestTimestamp: new Date().toISOString(),
            preset: symbols ? "custom" : preset || "all",
            explanation: {
              grossSpreadPercent:
                "Raw price difference between exchanges (buy at ask, sell at bid). Positive = sell price > buy price.",
              netProfitWithMakerFees:
                "Profit after paying maker fees on both sides (both limit orders). This is the best case scenario.",
              netProfitWithTakerFees:
                "Profit after paying taker fees on both sides (both market orders). This is what /scan calculates.",
              netProfitHybrid:
                "Profit with limit buy (maker fee) + market sell (taker fee). Most realistic for manual trading.",
              estimatedProfitPer1000USD:
                "Estimated USD profit per $1000 traded under each fee scenario.",
              tip: "If grossSpreadPercent is positive but netProfitWithTakerFees is negative, use LIMIT ORDERS to capture the spread with lower fees.",
            },
          },
        });
      } catch (error) {
        console.error("Error in ticker spread scan:", error);

        return reply.status(500).send({
          success: false,
          error: "Failed to scan spreads",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    },
  );

  /**
   * GET /api/orderbook-arbitrage/scan
   * Scan multiple symbols at once to find the best arbitrage opportunities across all exchanges
   * This is the main endpoint for finding profitable trades
   */
  app.get(
    "/api/orderbook-arbitrage/scan",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Scans multiple trading pairs across all 9 exchanges to find the best arbitrage opportunities. " +
          "Use without parameters to scan the curated high-opportunity list, or provide custom symbols. " +
          "This is the primary endpoint for finding profitable spreads.",
        tags: ["Order Book Arbitrage"],
        summary: "Multi-symbol arbitrage scanner",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            symbols: {
              type: "string",
              description:
                "Comma-separated trading pairs (e.g. 'PEPE/USDT,WIF/USDT,SUI/USDT'). Leave empty to scan default high-opportunity list.",
            },
            amountUSD: {
              type: "string",
              default: "1000",
              description:
                "Trade amount in USD. The scanner will auto-convert to the correct base currency amount per symbol.",
            },
            preset: {
              type: "string",
              enum: ["memecoins", "midcap", "largecap", "all"],
              default: "all",
              description:
                "Use a preset symbol list: 'memecoins' (PEPE, BONK, WIF, FLOKI, SHIB, DOGE), 'midcap' (SEI, SUI, TIA, INJ, JUP, etc), 'largecap' (BTC, ETH, SOL, XRP, etc), 'all' (everything)",
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object", additionalProperties: true },
              meta: { type: "object", additionalProperties: true },
            },
          },
          401: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
      try {
        const { symbols, amountUSD, preset } = request.query as {
          symbols?: string;
          amountUSD?: string;
          preset?: string;
        };

        const tradeAmountUSD = amountUSD ? parseFloat(amountUSD) : 1000;

        let symbolList: string[];

        if (symbols) {
          // Custom symbol list
          symbolList = symbols
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .filter((s) => s.length > 0);
        } else {
          // Use preset lists
          const presets: Record<string, string[]> = {
            memecoins: [
              "PEPE/USDT",
              "BONK/USDT",
              "WIF/USDT",
              "FLOKI/USDT",
              "SHIB/USDT",
              "DOGE/USDT",
            ],
            midcap: [
              "SEI/USDT",
              "SUI/USDT",
              "TIA/USDT",
              "INJ/USDT",
              "JUP/USDT",
              "STRK/USDT",
              "PYTH/USDT",
              "JTO/USDT",
              "ONDO/USDT",
              "RENDER/USDT",
            ],
            largecap: [
              "BTC/USDT",
              "ETH/USDT",
              "SOL/USDT",
              "XRP/USDT",
              "ADA/USDT",
              "AVAX/USDT",
              "LINK/USDT",
              "DOT/USDT",
            ],
            all: OrderBookArbitrageService.HIGH_OPPORTUNITY_SYMBOLS,
          };

          symbolList = presets[preset || "all"] || presets.all;
        }

        const scanResult = await orderBookArbitrageService.scanMultipleSymbols(
          symbolList,
          tradeAmountUSD,
        );

        // Log profitable opportunities
        scanResult.results
          .filter((r) => r.bestOpportunity?.isProfitable)
          .forEach((r) => {
            console.log(
              `💰 PROFITABLE: ${r.symbol} | ${r.bestOpportunity!.buyExchange} → ${r.bestOpportunity!.sellExchange} | ${r.bestOpportunity!.netProfitPercentage.toFixed(3)}% | $${r.bestOpportunity!.netProfitUSD.toFixed(2)}`,
            );
          });

        return reply.status(200).send({
          success: true,
          data: scanResult,
          meta: {
            requestedBy: request.user.username || request.user.email,
            requestTimestamp: new Date().toISOString(),
            tradeAmountUSD,
            preset: symbols ? "custom" : preset || "all",
            tips: {
              message:
                "Arbitrage opportunities are fleeting. The best spreads appear during high volatility events, new listings, and off-peak hours.",
              bestPractices: [
                "Memecoins (PEPE, WIF, BONK) have widest spreads but more risk",
                "Use smaller amounts ($100-$500) to avoid slippage",
                "MEXC has 0% maker fee - great for the buy side",
                "Scan frequently - opportunities last seconds",
                "Check during Asian trading hours (UTC 0-8) for more volatility",
                "New coin listings often have 1-5% spreads for the first hours",
              ],
            },
          },
        });
      } catch (error) {
        console.error("Error in multi-symbol scan:", error);

        return reply.status(500).send({
          success: false,
          error: "Failed to scan symbols",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    },
  );

  /**
   * GET /api/orderbook-arbitrage/coins
   * Returns the curated list of high-opportunity coins with tips
   */
  app.get(
    "/api/orderbook-arbitrage/coins",
    {
      schema: {
        description:
          "Returns curated lists of trading pairs categorized by volatility and spread potential. No auth required.",
        tags: ["Order Book Arbitrage"],
        summary: "Get recommended coins for arbitrage",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object", additionalProperties: true },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      return reply.status(200).send({
        success: true,
        data: {
          presets: {
            memecoins: {
              description:
                "High volatility memecoins - widest spreads, higher risk",
              spreadPotential: "high",
              symbols: [
                "PEPE/USDT",
                "BONK/USDT",
                "WIF/USDT",
                "FLOKI/USDT",
                "SHIB/USDT",
                "DOGE/USDT",
              ],
            },
            midcap: {
              description:
                "Mid-cap altcoins - good balance of spread and liquidity",
              spreadPotential: "medium",
              symbols: [
                "SEI/USDT",
                "SUI/USDT",
                "TIA/USDT",
                "INJ/USDT",
                "JUP/USDT",
                "STRK/USDT",
                "PYTH/USDT",
                "JTO/USDT",
                "ONDO/USDT",
                "RENDER/USDT",
              ],
            },
            largecap: {
              description:
                "Large cap coins - tight spreads but massive volume for safety",
              spreadPotential: "low",
              symbols: [
                "BTC/USDT",
                "ETH/USDT",
                "SOL/USDT",
                "XRP/USDT",
                "ADA/USDT",
                "AVAX/USDT",
                "LINK/USDT",
                "DOT/USDT",
              ],
            },
          },
          exchanges: {
            lowestFees: [
              {
                id: "mexc",
                name: "MEXC",
                makerFee: "0.00%",
                takerFee: "0.10%",
                tip: "Best for buy side - zero maker fee",
              },
              {
                id: "binance",
                name: "Binance",
                makerFee: "0.10%",
                takerFee: "0.10%",
                tip: "Most liquid - tightest spreads",
              },
              {
                id: "bybit",
                name: "Bybit",
                makerFee: "0.10%",
                takerFee: "0.10%",
                tip: "Good altcoin selection",
              },
              {
                id: "okx",
                name: "OKX",
                makerFee: "0.08%",
                takerFee: "0.10%",
                tip: "Lowest maker fee on major exchange",
              },
            ],
            highestFees: [
              {
                id: "coinbase",
                name: "Coinbase",
                makerFee: "0.40%",
                takerFee: "0.60%",
                tip: "Avoid for arbitrage - fees too high",
              },
              {
                id: "kraken",
                name: "Kraken",
                makerFee: "0.16%",
                takerFee: "0.26%",
                tip: "High fees but sometimes has wider spreads",
              },
            ],
          },
          tips: [
            "🔥 Scan memecoins during high volatility for 0.1-0.5% spreads",
            "💎 MEXC (0% maker) + Binance combo is the lowest fee pair",
            "⏰ Best times: market opens, news events, new listings",
            "📉 Use $100-$500 amounts to minimize slippage",
            "🔄 Run /scan every 30-60 seconds to catch fleeting opportunities",
            "🆕 New listings often have 1-5% spreads across exchanges",
          ],
        },
      });
    },
  );
};
