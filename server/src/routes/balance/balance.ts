/**
 * Balance / Wallet Routes
 * Deposit, withdraw, trade with balance, and view financial summary
 */

import { FastifyInstance } from "fastify";
import { balanceService } from "../../services/balance.service";

export const balanceRoute = async (app: FastifyInstance) => {
  /**
   * GET /api/balance
   * Get current balance and full financial summary
   */
  app.get(
    "/api/balance",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Returns the user's current balance along with a full financial summary including total deposited, withdrawn, traded, profit, and loss.",
        tags: ["Balance"],
        summary: "Get balance summary",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  currentBalance: {
                    type: "number",
                    description: "Current available balance in USD",
                  },
                  totalDeposited: {
                    type: "number",
                    description:
                      "Total amount deposited since account creation",
                  },
                  totalWithdrawn: {
                    type: "number",
                    description:
                      "Total amount withdrawn since account creation",
                  },
                  totalTraded: {
                    type: "number",
                    description: "Total cost of all trades executed",
                  },
                  totalProfit: {
                    type: "number",
                    description: "Sum of all profitable trades",
                  },
                  totalLoss: {
                    type: "number",
                    description: "Sum of all losing trades (absolute value)",
                  },
                  netPnL: {
                    type: "number",
                    description: "Net profit/loss (profit - loss)",
                  },
                  tradeCount: {
                    type: "number",
                    description: "Total number of trades executed",
                  },
                  winRate: {
                    type: "number",
                    description: "Percentage of profitable trades",
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
        const summary = await balanceService.getBalanceSummary(request.user.id);

        return reply.status(200).send({
          success: true,
          data: summary,
        });
      } catch (error) {
        console.error("Error fetching balance:", error);
        return reply.status(500).send({
          success: false,
          error: "Failed to fetch balance",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  /**
   * POST /api/balance/deposit
   * Deposit funds into balance
   */
  app.post(
    "/api/balance/deposit",
    {
      preHandler: [app.authenticate],
      schema: {
        description: "Deposit funds into the user's balance. Amount is in USD.",
        tags: ["Balance"],
        summary: "Deposit funds",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["amount"],
          properties: {
            amount: {
              type: "number",
              minimum: 0.01,
              description: "Amount to deposit in USD",
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
                  balance: {
                    type: "number",
                    description: "New balance after deposit",
                  },
                  transaction: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      type: { type: "string" },
                      amount: { type: "number" },
                      balanceAfter: { type: "number" },
                      createdAt: { type: "string" },
                    },
                  },
                  message: { type: "string" },
                },
              },
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
        const { amount } = request.body as { amount: number };

        if (!amount || amount <= 0) {
          return reply.status(400).send({
            success: false,
            error: "Amount must be a positive number",
          });
        }

        const result = await balanceService.deposit(request.user.id, amount);

        return reply.status(200).send({
          success: true,
          data: {
            ...result,
            message: `Successfully deposited $${amount.toFixed(2)}`,
          },
        });
      } catch (error) {
        console.error("Error depositing funds:", error);
        return reply.status(500).send({
          success: false,
          error: "Failed to deposit funds",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
  );

  /**
   * POST /api/balance/withdraw
   * Withdraw funds from balance
   */
  app.post(
    "/api/balance/withdraw",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Withdraw funds from the user's balance. Cannot withdraw more than the current balance.",
        tags: ["Balance"],
        summary: "Withdraw funds",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["amount"],
          properties: {
            amount: {
              type: "number",
              minimum: 0.01,
              description: "Amount to withdraw in USD",
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
                  balance: {
                    type: "number",
                    description: "New balance after withdrawal",
                  },
                  transaction: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      type: { type: "string" },
                      amount: { type: "number" },
                      balanceAfter: { type: "number" },
                      createdAt: { type: "string" },
                    },
                  },
                  message: { type: "string" },
                },
              },
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
        const { amount } = request.body as { amount: number };

        if (!amount || amount <= 0) {
          return reply.status(400).send({
            success: false,
            error: "Amount must be a positive number",
          });
        }

        const result = await balanceService.withdraw(request.user.id, amount);

        return reply.status(200).send({
          success: true,
          data: {
            ...result,
            message: `Successfully withdrew $${amount.toFixed(2)}`,
          },
        });
      } catch (error) {
        console.error("Error withdrawing funds:", error);

        const message =
          error instanceof Error ? error.message : "Unknown error";
        const statusCode = message.includes("Insufficient balance") ? 400 : 500;

        return reply.status(statusCode).send({
          success: false,
          error:
            statusCode === 400
              ? "Insufficient balance"
              : "Failed to withdraw funds",
          message,
        });
      }
    },
  );

  /**
   * GET /api/balance/transactions
   * Get deposit/withdrawal history
   */
  app.get(
    "/api/balance/transactions",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Returns the user's deposit and withdrawal transaction history.",
        tags: ["Balance"],
        summary: "Get transaction history",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["deposit", "withdrawal"],
              description: "Filter by transaction type",
            },
            limit: {
              type: "string",
              default: "50",
              description: "Max number of records",
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
                  transactions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: { type: "string" },
                        amount: { type: "number" },
                        balanceAfter: { type: "number" },
                        createdAt: { type: "string" },
                      },
                    },
                  },
                  total: { type: "number" },
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
        const { type, limit } = request.query as {
          type?: "deposit" | "withdrawal";
          limit?: string;
        };

        const transactions = await balanceService.getTransactions(
          request.user.id,
          {
            type,
            limit: limit ? parseInt(limit) : 50,
          },
        );

        return reply.status(200).send({
          success: true,
          data: {
            transactions,
            total: transactions.length,
          },
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return reply.status(500).send({
          success: false,
          error: "Failed to fetch transactions",
        });
      }
    },
  );

  /**
   * GET /api/balance/trades
   * Get executed trade history (from balance)
   */
  app.get(
    "/api/balance/trades",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Returns the user's trade history with profit/loss for each trade. These are trades executed using the user's balance.",
        tags: ["Balance"],
        summary: "Get trade history",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            symbol: {
              type: "string",
              description: "Filter by trading pair (e.g. BTC/USDT)",
            },
            limit: {
              type: "string",
              default: "50",
              description: "Max number of records",
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
                  trades: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        symbol: { type: "string" },
                        amount: { type: "number" },
                        costUSD: { type: "number" },
                        revenueUSD: { type: "number" },
                        feesUSD: { type: "number" },
                        profitUSD: { type: "number" },
                        profitPercent: { type: "number" },
                        buyExchange: { type: "string" },
                        sellExchange: { type: "string" },
                        buyPrice: { type: "number" },
                        sellPrice: { type: "number" },
                        status: { type: "string" },
                        createdAt: { type: "string" },
                      },
                    },
                  },
                  total: { type: "number" },
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
        const { symbol, limit } = request.query as {
          symbol?: string;
          limit?: string;
        };

        const trades = await balanceService.getTradeHistory(request.user.id, {
          symbol,
          limit: limit ? parseInt(limit) : 50,
        });

        return reply.status(200).send({
          success: true,
          data: {
            trades,
            total: trades.length,
          },
        });
      } catch (error) {
        console.error("Error fetching trades:", error);
        return reply.status(500).send({
          success: false,
          error: "Failed to fetch trade history",
        });
      }
    },
  );

  /**
   * POST /api/balance/trade
   * Execute an arbitrage trade using user's balance
   * Fetches live order book data, validates balance, and records the trade
   */
  app.post(
    "/api/balance/trade",
    {
      preHandler: [app.authenticate],
      schema: {
        description:
          "Execute an arbitrage trade using the user's balance. This fetches live order book data, checks if a profitable opportunity exists, " +
          "validates the user has enough balance, then executes the trade and updates the balance with the profit/loss.",
        tags: ["Balance"],
        summary: "Execute arbitrage trade with balance",
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
              default: 0.001,
              description:
                "Amount in base currency (e.g. BTC). Defaults to 0.001 BTC.",
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
                  balanceBefore: { type: "number" },
                  balanceAfter: { type: "number" },
                  opportunity: { type: "object" },
                  message: { type: "string" },
                },
              },
            },
          },
          400: { $ref: "ErrorResponse#" },
          401: { $ref: "ErrorResponse#" },
          404: { $ref: "ErrorResponse#" },
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

        const tradeSymbol = symbol || "BTC/USDT";
        const tradeAmount = amount || 0.001;

        // Get current balance first
        const balanceBefore = await balanceService.getBalance(request.user.id);

        // Lazy-import to avoid circular deps
        const { OrderBookArbitrageService } =
          await import("../../services/orderbook-arbitrage.service");
        const arbitrageService = new OrderBookArbitrageService();

        // Fetch live arbitrage data
        const data = await arbitrageService.calculateArbitrage(
          tradeSymbol,
          tradeAmount,
        );

        if (!data.bestOpportunity || !data.bestOpportunity.isProfitable) {
          return reply.status(404).send({
            success: false,
            error: "No profitable arbitrage opportunity available right now",
            data: {
              currentBalance: balanceBefore,
              opportunities: data.summary.totalOpportunitiesFound,
              bestSpread: data.bestOpportunity?.netProfitPercentage ?? 0,
            },
          });
        }

        const opp = data.bestOpportunity;
        const costUSD = opp.buyPrice * tradeAmount;
        const revenueUSD = opp.sellPrice * tradeAmount;

        // Check if user can afford this trade
        const totalCost = costUSD + opp.tradingFees.total;
        if (balanceBefore < totalCost) {
          return reply.status(400).send({
            success: false,
            error: "Insufficient balance",
            message: `Trade requires $${totalCost.toFixed(2)} but you only have $${balanceBefore.toFixed(2)}`,
            data: {
              currentBalance: balanceBefore,
              requiredAmount: totalCost,
              shortfall: totalCost - balanceBefore,
            },
          });
        }

        // Execute the trade
        const result = await balanceService.executeTrade(request.user.id, {
          symbol: tradeSymbol,
          amount: tradeAmount,
          costUSD,
          revenueUSD,
          feesUSD: opp.tradingFees.total,
          buyExchange: opp.buyExchange,
          sellExchange: opp.sellExchange,
          buyPrice: opp.buyPrice,
          sellPrice: opp.sellPrice,
        });

        return reply.status(201).send({
          success: true,
          data: {
            trade: result.trade,
            balanceBefore,
            balanceAfter: result.balance,
            opportunity: {
              buyExchange: opp.buyExchange,
              sellExchange: opp.sellExchange,
              buyPrice: opp.buyPrice,
              sellPrice: opp.sellPrice,
              grossProfit: opp.grossProfit,
              fees: opp.tradingFees.total,
              netProfit: opp.netProfit,
              netProfitPercentage: opp.netProfitPercentage,
            },
            message: `Trade executed! ${opp.netProfit >= 0 ? "Profit" : "Loss"}: $${opp.netProfit.toFixed(4)}`,
          },
        });
      } catch (error) {
        console.error("Error executing trade:", error);

        const message =
          error instanceof Error ? error.message : "Unknown error";
        const statusCode = message.includes("Insufficient balance") ? 400 : 500;

        return reply.status(statusCode).send({
          success: false,
          error:
            statusCode === 400
              ? "Insufficient balance"
              : "Failed to execute trade",
          message,
        });
      }
    },
  );
};
