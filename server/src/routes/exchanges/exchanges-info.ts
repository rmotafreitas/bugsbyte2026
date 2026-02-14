/**
 * Exchanges Info Route
 * Public/static endpoint showing detailed exchange metadata
 */

import { FastifyInstance } from "fastify";
import {
  BinanceAdapter,
  KrakenAdapter,
  CoinbaseAdapter,
  OKXAdapter,
} from "../../lib/exchanges";
import type { ExchangeAdapter, ExchangeInfo } from "../../lib/exchanges";

const exchangeAdapters: ExchangeAdapter[] = [
  new BinanceAdapter(),
  new KrakenAdapter(),
  new CoinbaseAdapter(),
  new OKXAdapter(),
];

export const exchangesInfoRoute = async (app: FastifyInstance) => {
  /**
   * GET /api/exchanges
   * Returns detailed metadata for all supported exchanges (fees, order types, features)
   * No auth required - this is static reference data
   */
  app.get(
    "/api/exchanges",
    {
      schema: {
        description:
          "Returns detailed metadata for all supported exchanges including fees, order types, supported features, rate limits, and precision info.",
        tags: ["Exchanges"],
        summary: "List all supported exchanges with metadata",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  exchanges: {
                    type: "array",
                    items: { $ref: "ExchangeInfo#" },
                  },
                  count: { type: "number" },
                  feeComparison: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        exchange: { type: "string" },
                        makerFee: { type: "string" },
                        takerFee: { type: "string" },
                        makerFeeRaw: { type: "number" },
                        takerFeeRaw: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      try {
        const exchangeInfos: ExchangeInfo[] = [];

        const promises = exchangeAdapters.map(async (adapter) => {
          try {
            const info = await adapter.getExchangeInfo();
            return info;
          } catch (error) {
            console.error(
              `Failed to get info for ${adapter.getName()}:`,
              error instanceof Error ? error.message : "Unknown error",
            );
            return null;
          }
        });

        const results = await Promise.all(promises);
        results.forEach((info) => {
          if (info) exchangeInfos.push(info);
        });

        // Build fee comparison table
        const feeComparison = exchangeInfos.map((info) => ({
          exchange: info.name,
          makerFee: `${(info.fees.maker * 100).toFixed(2)}%`,
          takerFee: `${(info.fees.taker * 100).toFixed(2)}%`,
          makerFeeRaw: info.fees.maker,
          takerFeeRaw: info.fees.taker,
        }));

        return reply.status(200).send({
          success: true,
          data: {
            exchanges: exchangeInfos,
            count: exchangeInfos.length,
            feeComparison,
          },
        });
      } catch (error) {
        console.error("Error fetching exchange info:", error);
        return reply.status(500).send({
          success: false,
          error: "Failed to fetch exchange information",
        });
      }
    },
  );

  /**
   * GET /api/exchanges/:exchangeId
   * Returns detailed metadata for a specific exchange
   * No auth required
   */
  app.get(
    "/api/exchanges/:exchangeId",
    {
      schema: {
        description:
          "Returns detailed metadata for a specific exchange by its ID.",
        tags: ["Exchanges"],
        summary: "Get exchange metadata by ID",
        params: {
          type: "object",
          properties: {
            exchangeId: {
              type: "string",
              description:
                "Exchange identifier (binance, kraken, coinbase, okx)",
            },
          },
          required: ["exchangeId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { $ref: "ExchangeInfo#" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
              supportedExchanges: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { exchangeId } = request.params as { exchangeId: string };

        const adapter = exchangeAdapters.find(
          (a) => a.getId() === exchangeId.toLowerCase(),
        );

        if (!adapter) {
          return reply.status(404).send({
            success: false,
            error: `Exchange "${exchangeId}" not supported`,
            supportedExchanges: exchangeAdapters.map((a) => a.getId()),
          });
        }

        const info = await adapter.getExchangeInfo();

        return reply.status(200).send({
          success: true,
          data: info,
        });
      } catch (error) {
        console.error("Error fetching exchange info:", error);
        return reply.status(500).send({
          success: false,
          error: "Failed to fetch exchange information",
        });
      }
    },
  );

  /**
   * GET /api/exchanges/:exchangeId/fees
   * Returns only the fee structure for a specific exchange
   * No auth required
   */
  app.get(
    "/api/exchanges/:exchangeId/fees",
    {
      schema: {
        description:
          "Returns the fee structure for a specific exchange. Useful for calculating net arbitrage profit.",
        tags: ["Exchanges"],
        summary: "Get exchange fees",
        params: {
          type: "object",
          properties: {
            exchangeId: {
              type: "string",
              description:
                "Exchange identifier (binance, kraken, coinbase, okx)",
            },
          },
          required: ["exchangeId"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  exchange: { type: "string" },
                  exchangeId: { type: "string" },
                  fees: {
                    type: "object",
                    properties: {
                      maker: { type: "number" },
                      taker: { type: "number" },
                      percentage: { type: "boolean" },
                    },
                  },
                  feeFormatted: {
                    type: "object",
                    properties: {
                      maker: { type: "string" },
                      taker: { type: "string" },
                    },
                  },
                  examples: {
                    type: "object",
                    properties: {
                      tradeAmountUSD: { type: "number" },
                      makerFeeUSD: { type: "number" },
                      takerFeeUSD: { type: "number" },
                      roundTripCost: { type: "number" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { exchangeId } = request.params as { exchangeId: string };

        const adapter = exchangeAdapters.find(
          (a) => a.getId() === exchangeId.toLowerCase(),
        );

        if (!adapter) {
          return reply.status(404).send({
            success: false,
            error: `Exchange "${exchangeId}" not supported`,
            supportedExchanges: exchangeAdapters.map((a) => a.getId()),
          });
        }

        const fees = adapter.getTradingFees();
        const exampleAmount = 10000; // $10,000 trade example

        return reply.status(200).send({
          success: true,
          data: {
            exchange: adapter.getName(),
            exchangeId: adapter.getId(),
            fees,
            feeFormatted: {
              maker: `${(fees.maker * 100).toFixed(2)}%`,
              taker: `${(fees.taker * 100).toFixed(2)}%`,
            },
            examples: {
              tradeAmountUSD: exampleAmount,
              makerFeeUSD: exampleAmount * fees.maker,
              takerFeeUSD: exampleAmount * fees.taker,
              roundTripCost:
                exampleAmount * fees.taker + exampleAmount * fees.taker,
            },
          },
        });
      } catch (error) {
        console.error("Error fetching fees:", error);
        return reply.status(500).send({
          success: false,
          error: "Failed to fetch exchange fees",
        });
      }
    },
  );
};
