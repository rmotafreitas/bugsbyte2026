# Arbitrage API Documentation

## Overview

The Arbitrage API provides real-time cryptocurrency price data from multiple exchanges to identify arbitrage opportunities. It uses the CCXT library with an adapter pattern for easy maintenance and scalability.

## Features

- ✅ Real-time BTC/USDT prices from 4+ exchanges
- ✅ Automatic arbitrage opportunity detection
- ✅ Secure authentication required
- ✅ Developer-friendly JSON response
- ✅ Adapter pattern for easy exchange management
- ✅ Rate limiting and error handling

## Supported Exchanges

- **Binance** - World's largest crypto exchange
- **Kraken** - Established US-based exchange
- **Coinbase** - Major US exchange
- **OKX** - Global crypto exchange

## Endpoints

### 1. Get Supported Exchanges

```
GET /api/arbitrage/exchanges
```

**Authentication:** Required (Bearer token)

**Response:**

```json
{
  "success": true,
  "data": {
    "exchanges": ["Binance", "Kraken", "Coinbase", "OKX"],
    "count": 4
  }
}
```

### 2. Get BTC Arbitrage Data

```
GET /api/arbitrage/btc
```

**Authentication:** Required (Bearer token)

**Response Structure:**

```json
{
  "success": true,
  "data": {
    "timestamp": 1771030944119,
    "datetime": "2026-02-14T01:02:24.119Z",
    "symbol": "BTC/USDT",
    "exchanges": [
      {
        "symbol": "BTC/USDT",
        "exchangeName": "Binance",
        "exchangeId": "binance",
        "bid": 69036.8,
        "ask": 69036.81,
        "last": 69036.8,
        "volume": 19930.89136,
        "timestamp": 1771030943013,
        "datetime": "2026-02-14T01:02:23.013Z"
      }
      // ... more exchanges
    ],
    "opportunities": [
      {
        "pair": "BTC/USDT",
        "buyExchange": "OKX",
        "buyExchangeId": "okx",
        "buyPrice": 69035.1,
        "sellExchange": "Coinbase",
        "sellExchangeId": "coinbase",
        "sellPrice": 69041.17,
        "profitPercentage": 0.0088,
        "profitUSD": 6.07,
        "volume": {
          "buyExchange": 8390.54,
          "sellExchange": 0
        }
      }
      // ... more opportunities
    ],
    "bestOpportunity": {
      // Best opportunity object (highest profit %)
    },
    "summary": {
      "lowestAsk": {
        "exchange": "OKX",
        "price": 69035.1
      },
      "highestBid": {
        "exchange": "Coinbase",
        "price": 69041.17
      },
      "avgPrice": 69047.79,
      "priceSpread": 6.07,
      "priceSpreadPercentage": 0.0088
    }
  },
  "meta": {
    "requestedBy": "arbitragetest",
    "requestTimestamp": "2026-02-14T01:02:24.120Z",
    "exchangesQueried": 4,
    "opportunitiesFound": 4
  }
}
```

## Usage Example

### 1. Authenticate

```bash
# Register or login to get token
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "username": "trader",
    "password": "secure123"
  }'

# Response includes token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 2. Get Arbitrage Data

```bash
curl -X GET http://localhost:3000/api/arbitrage/btc \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Architecture

### Adapter Pattern

The implementation uses the Adapter Pattern to make it easy to add or swap exchanges:

```
/server/src/
├── lib/
│   └── exchanges/
│       ├── exchange.adapter.ts      # Interface
│       ├── ccxt-base.adapter.ts     # Base CCXT implementation
│       ├── binance.adapter.ts       # Binance adapter
│       ├── kraken.adapter.ts        # Kraken adapter
│       ├── coinbase.adapter.ts      # Coinbase adapter
│       └── okx.adapter.ts           # OKX adapter
├── services/
│   └── arbitrage.service.ts         # Business logic
└── routes/
    └── arbitrage/
        └── arbitrage.ts             # API endpoints
```

### Adding New Exchanges

To add a new exchange, simply create a new adapter:

```typescript
// exchanges/bybit.adapter.ts
import ccxt from "ccxt";
import { CCXTBaseAdapter } from "./ccxt-base.adapter";

export class BybitAdapter extends CCXTBaseAdapter {
  constructor() {
    super(
      new ccxt.bybit({
        enableRateLimit: true,
        timeout: 30000,
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
```

Then add it to the service:

```typescript
// services/arbitrage.service.ts
import { BybitAdapter } from '../lib/exchanges/bybit.adapter';

constructor() {
  this.exchanges = [
    new BinanceAdapter(),
    new KrakenAdapter(),
    new CoinbaseAdapter(),
    new OKXAdapter(),
    new BybitAdapter(), // New exchange
  ];
}
```

## Response Field Descriptions

### Exchange Data

- `bid`: Highest buy price (what buyers are willing to pay)
- `ask`: Lowest sell price (what sellers are asking)
- `last`: Last traded price
- `volume`: 24-hour trading volume

### Arbitrage Opportunity

- `buyExchange`: Where to buy BTC
- `buyPrice`: Price to buy at (ask price)
- `sellExchange`: Where to sell BTC
- `sellPrice`: Price to sell at (bid price)
- `profitPercentage`: Profit as percentage of buy price
- `profitUSD`: Profit in USD per 1 BTC traded

### Summary

- `lowestAsk`: Best price to buy across all exchanges
- `highestBid`: Best price to sell across all exchanges
- `priceSpread`: Difference between highest bid and lowest ask
- `priceSpreadPercentage`: Price spread as percentage

## Notes

- All prices are in USDT (Tether)
- Real-time data fetched from exchanges
- Rate limiting is enabled to protect against API limits
- Failed exchanges are handled gracefully
- Minimum 2 exchanges required for arbitrage analysis
- Profit calculations don't include trading fees or transfer costs

## Error Handling

If an exchange fails or is unavailable, it's excluded from the results. All errors are logged server-side. The API returns meaningful error messages:

```json
{
  "success": false,
  "error": "Failed to fetch arbitrage data",
  "message": "Not enough exchange data available for arbitrage analysis"
}
```

## Security

- All endpoints require authentication
- JWT Bearer token required in Authorization header
- Rate limiting enabled per exchange
- No API keys exposed in responses
