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
};
