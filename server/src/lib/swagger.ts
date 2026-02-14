/**
 * Swagger / OpenAPI configuration for Spread Hunters API
 */

import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { FastifyInstance } from "fastify";

export async function registerSwagger(app: FastifyInstance) {
  // Shared schema definitions
  app.addSchema({
    $id: "ExchangeInfo",
    type: "object",
    properties: {
      id: { type: "string", description: "Exchange identifier" },
      name: { type: "string", description: "Exchange display name" },
      countries: {
        type: "array",
        items: { type: "string" },
        description: "Countries where the exchange operates",
      },
      url: { type: "string", description: "Exchange website URL" },
      version: { type: "string", description: "API version" },
      rateLimit: {
        type: "number",
        description: "Milliseconds between requests",
      },
      has: {
        type: "object",
        properties: {
          fetchTicker: { type: "boolean" },
          fetchOrderBook: { type: "boolean" },
          fetchTrades: { type: "boolean" },
          fetchOHLCV: { type: "boolean" },
          createOrder: { type: "boolean" },
          cancelOrder: { type: "boolean" },
          fetchBalance: { type: "boolean" },
          fetchMarkets: { type: "boolean" },
        },
        description: "Supported exchange capabilities",
      },
      fees: { $ref: "TradingFees#" },
      supportedOrderTypes: {
        type: "array",
        items: { type: "string" },
        description: "Supported order types (market, limit, stop, etc.)",
      },
      timeframes: {
        type: "array",
        items: { type: "string" },
        description: "Supported OHLCV timeframes",
      },
      precisionMode: { type: "string" },
      requiredCredentials: {
        type: "object",
        properties: {
          apiKey: { type: "boolean" },
          secret: { type: "boolean" },
          password: { type: "boolean" },
        },
      },
    },
  });

  app.addSchema({
    $id: "TradingFees",
    type: "object",
    properties: {
      maker: {
        type: "number",
        description: "Maker fee rate (e.g. 0.001 = 0.1%)",
      },
      taker: {
        type: "number",
        description: "Taker fee rate (e.g. 0.001 = 0.1%)",
      },
      percentage: { type: "boolean", description: "Whether fees are in %" },
    },
  });

  app.addSchema({
    $id: "OrderBookLevel",
    type: "object",
    properties: {
      price: { type: "number", description: "Price level" },
      amount: { type: "number", description: "Amount available at this price" },
      total: { type: "number", description: "Cumulative amount" },
    },
  });

  app.addSchema({
    $id: "OrderBookData",
    type: "object",
    properties: {
      symbol: { type: "string" },
      exchangeName: { type: "string" },
      exchangeId: { type: "string" },
      bids: {
        type: "array",
        items: { $ref: "OrderBookLevel#" },
        description: "Buy orders (highest to lowest)",
      },
      asks: {
        type: "array",
        items: { $ref: "OrderBookLevel#" },
        description: "Sell orders (lowest to highest)",
      },
      timestamp: { type: "number" },
      datetime: { type: "string" },
      nonce: { type: "number" },
    },
  });

  app.addSchema({
    $id: "ArbitrageCalculation",
    type: "object",
    properties: {
      buyExchange: { type: "string" },
      buyExchangeId: { type: "string" },
      sellExchange: { type: "string" },
      sellExchangeId: { type: "string" },
      buyPrice: { type: "number", description: "Weighted average buy price" },
      sellPrice: { type: "number", description: "Weighted average sell price" },
      amount: { type: "number", description: "BTC trade amount" },
      grossProfit: { type: "number", description: "Profit before fees" },
      tradingFees: {
        type: "object",
        properties: {
          buyFee: { type: "number" },
          sellFee: { type: "number" },
          total: { type: "number" },
        },
      },
      slippage: {
        type: "object",
        properties: {
          buySlippage: { type: "number" },
          sellSlippage: { type: "number" },
          total: { type: "number" },
        },
      },
      netProfit: { type: "number", description: "Profit after all costs" },
      netProfitPercentage: { type: "number", description: "ROI %" },
      isProfitable: { type: "boolean" },
      orderBookDepth: {
        type: "object",
        properties: {
          buyExchangeBidDepth: { type: "number" },
          sellExchangeAskDepth: { type: "number" },
        },
      },
    },
  });

  app.addSchema({
    $id: "ErrorResponse",
    type: "object",
    properties: {
      success: { type: "boolean", const: false },
      error: { type: "string" },
      message: { type: "string" },
    },
  });

  app.addSchema({
    $id: "AuthHeaders",
    type: "object",
    properties: {
      Authorization: {
        type: "string",
        description: "Bearer JWT token",
      },
    },
    required: ["Authorization"],
  });

  // Register Swagger
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Spread Hunters API",
        description:
          "Cryptocurrency Arbitrage Detection API for the Spread Hunters Hackathon. " +
          "Provides real-time order book analysis, arbitrage opportunity detection, " +
          "fee calculations, slippage estimation, and P&L tracking across multiple exchanges.",
        version: "1.0.0",
        contact: {
          name: "Spread Hunters Team",
        },
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
      ],
      tags: [
        {
          name: "Health",
          description: "Health check endpoints",
        },
        {
          name: "Auth",
          description: "Authentication endpoints (register, login, logout)",
        },
        {
          name: "Exchanges",
          description:
            "Static exchange metadata: fees, order types, features, rate limits",
        },
        {
          name: "Arbitrage",
          description:
            "Basic arbitrage detection using ticker prices from multiple exchanges",
        },
        {
          name: "Order Book Arbitrage",
          description:
            "Advanced arbitrage analysis using order book depth, fee deduction, and slippage calculation",
        },
        {
          name: "P&L Dashboard",
          description:
            "Profit & Loss tracking, trade history, and performance statistics",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              "JWT token obtained from /auth/register or /auth/login",
          },
        },
      },
    },
  });

  // Register Swagger UI
  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      tryItOutEnabled: true,
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
  });
}
