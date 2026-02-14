/**
 * Arbitrage Route
 * Secure endpoint that returns BTC/USD arbitrage data from multiple exchanges
 */

import { FastifyInstance } from "fastify";
import { ArbitrageService } from "../../services/arbitrage.service";

const arbitrageService = new ArbitrageService();

export const arbitrageRoute = async (app: FastifyInstance) => {
  /**
   * GET /api/arbitrage/btc
   * Returns BTC/USDT arbitrage opportunities across multiple exchanges
   * Requires authentication
   */
  app.get(
    "/api/arbitrage/btc",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Returns BTC/USDT ticker-based arbitrage opportunities across multiple exchanges. Uses top-of-book prices for quick comparison.",
        tags: ["Arbitrage"],
        summary: "Get BTC arbitrage data (ticker-based)",
        security: [{ bearerAuth: [] }],
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
                  exchanges: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        symbol: { type: "string" },
                        exchangeName: { type: "string" },
                        exchangeId: { type: "string" },
                        bid: { type: "number" },
                        ask: { type: "number" },
                        last: { type: "number" },
                        volume: { type: "number" },
                        timestamp: { type: "number" },
                        datetime: { type: "string" },
                      },
                    },
                  },
                  opportunities: { type: "array" },
                  bestOpportunity: { type: "object", nullable: true },
                  summary: { type: "object" },
                },
              },
              meta: { type: "object" },
            },
          },
          401: { $ref: "ErrorResponse#" },
          500: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
      try {
        const data = await arbitrageService.fetchBTCPrices();

        return reply.status(200).send({
          success: true,
          data,
          meta: {
            requestedBy: request.user.username || request.user.email,
            requestTimestamp: new Date().toISOString(),
            exchangesQueried: data.exchanges.length,
            opportunitiesFound: data.opportunities.length,
          },
        });
      } catch (error) {
        console.error("Error in arbitrage route:", error);

        return reply.status(500).send({
          success: false,
          error: "Failed to fetch arbitrage data",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    },
  );

  /**
   * GET /api/arbitrage/exchanges
   * Returns list of supported exchanges
   */
  app.get(
    "/api/arbitrage/exchanges",
    {
      preHandler: [app.authenticate],
      schema: {
        description: "Returns the list of supported exchanges.",
        tags: ["Arbitrage"],
        summary: "List supported exchanges",
        security: [{ bearerAuth: [] }],
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
                    items: { type: "string" },
                  },
                  count: { type: "number" },
                },
              },
            },
          },
          401: { $ref: "ErrorResponse#" },
        },
      },
    },
    async (request, reply) => {
      try {
        const exchanges = arbitrageService.getSupportedExchanges();

        return reply.status(200).send({
          success: true,
          data: {
            exchanges,
            count: exchanges.length,
          },
        });
      } catch (error) {
        console.error("Error fetching exchanges:", error);

        return reply.status(500).send({
          success: false,
          error: "Failed to fetch exchanges",
        });
      }
    },
  );
};
