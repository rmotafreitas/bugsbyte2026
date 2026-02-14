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
