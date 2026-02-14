# 🎯 Spread Hunters: Order Book Arbitrage System

## Advanced Cryptocurrency Arbitrage Bot for Hackathon

---

## 🏆 Hackathon Challenge Implementation

This system fulfills all **Spread Hunters Hackathon** requirements:

### ✅ Required Features (MVP)

#### 1. Multi-Exchange Monitoring ✓

- **Supported Exchanges**: Binance, Kraken, Coinbase, OKX
- Real-time order book data ingestion
- Parallel data fetching for optimal performance
- Automatic failover if an exchange is unavailable

#### 2. Net Spread Calculator ✓

- **Order Book Depth Analysis**: Uses actual order book data, not just top-of-book
- **Weighted Average Pricing**: Calculates execution prices based on order book depth
- **Fee Deduction**: Accounts for maker/taker fees (0.1% per trade by default)
- **Slippage Calculation**: Measures price impact of trades
- **Profitability Threshold**: Only flags opportunities with >0.5% net profit

#### 3. Performance Dashboard ✓

- **P&L Tracking**: Cumulative profit/loss tracking
- **Trade History**: Complete log of opportunities and simulated trades
- **Statistics**: Win rate, average profit, best/worst trades
- **Time-Based Analytics**: Last 24h, Last 7d performance metrics

---

## 📊 API Endpoints

### Base URL: `http://localhost:3000`

All endpoints require authentication. Include JWT token in Authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 1. 🔍 Analyze Arbitrage Opportunities

```http
GET /api/orderbook-arbitrage/analyze
```

**Query Parameters:**

- `symbol` (optional): Trading pair, default: `BTC/USDT`
- `amount` (optional): Trade amount in BTC, default: `1.0`

**Example:**

```bash
curl -X GET "http://localhost:3000/api/orderbook-arbitrage/analyze?amount=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "timestamp": 1771030944119,
    "datetime": "2026-02-14T01:02:24.119Z",
    "symbol": "BTC/USDT",
    "orderBooks": [...],
    "opportunities": [
      {
        "buyExchange": "OKX",
        "buyExchangeId": "okx",
        "sellExchange": "Binance",
        "sellExchangeId": "binance",
        "buyPrice": 68990.14,
        "sellPrice": 68992.53,
        "amount": 1,
        "grossProfit": 2.39,
        "tradingFees": {
          "buyFee": 103.49,
          "sellFee": 68.99,
          "total": 172.48
        },
        "slippage": {
          "buySlippage": 0.04,
          "sellSlippage": 0,
          "total": 0.04
        },
        "netProfit": -170.09,
        "netProfitPercentage": -0.25,
        "isProfitable": false,
        "orderBookDepth": {
          "buyExchangeBidDepth": 6.89,
          "sellExchangeAskDepth": 2.40
        }
      }
    ],
    "bestOpportunity": { ... },
    "summary": {
      "totalOpportunitiesFound": 12,
      "profitableOpportunities": 0,
      "bestNetProfitPercentage": -0.25,
      "averageSpread": -0.35
    }
  },
  "meta": {
    "requestedBy": "trader",
    "requestTimestamp": "2026-02-14T01:02:24.120Z",
    "tradeAmount": 1,
    "analysis": {
      "exchangesAnalyzed": 4,
      "totalOpportunities": 12,
      "profitableOpportunities": 0,
      "bestNetProfit": -170.09,
      "bestNetProfitPercentage": -0.25
    }
  }
}
```

---

### 2. 💼 Simulate Trade

```http
POST /api/orderbook-arbitrage/simulate
```

**Body:**

```json
{
  "symbol": "BTC/USDT",
  "amount": 1.0
}
```

**Example:**

```bash
curl -X POST "http://localhost:3000/api/orderbook-arbitrage/simulate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BTC/USDT","amount":1.0}'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "trade": {
      "id": "trade_1771030944_abc123",
      "timestamp": 1771030944119,
      "datetime": "2026-02-14T01:02:24.119Z",
      "symbol": "BTC/USDT",
      "opportunity": { ... },
      "status": "simulated",
      "userId": "user-id-here"
    },
    "message": "Trade simulated successfully"
  }
}
```

---

### 3. 📜 Get Trade History

```http
GET /api/orderbook-arbitrage/history
```

**Query Parameters:**

- `limit` (optional): Number of records, default: `50`
- `status` (optional): Filter by status: `detected`, `simulated`, `executed`

**Example:**

```bash
curl -X GET "http://localhost:3000/api/orderbook-arbitrage/history?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "trades": [...],
    "recentOpportunities": [...],
    "totalTrades": 10
  }
}
```

---

### 4. 📊 Get P&L Summary (Dashboard Data)

```http
GET /api/orderbook-arbitrage/pl-summary
```

**Example:**

```bash
curl -X GET "http://localhost:3000/api/orderbook-arbitrage/pl-summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "overall": {
      "totalOpportunitiesDetected": 150,
      "totalSimulatedTrades": 25,
      "cumulativeProfitUSD": 1250.50,
      "cumulativeProfitPercentage": 3.75,
      "averageProfitPerTrade": 50.02,
      "bestTrade": { ... },
      "worstTrade": { ... },
      "profitableTradesCount": 20,
      "totalTradesCount": 25,
      "winRate": 80
    },
    "periods": {
      "last24h": {
        "opportunitiesInPeriod": 45,
        "tradesInPeriod": 8,
        "avgProfitPercentage": 0.45,
        "totalProfitUSD": 320.50,
        "label": "Last 24 Hours"
      },
      "last7d": {
        "opportunitiesInPeriod": 150,
        "tradesInPeriod": 25,
        "avgProfitPercentage": 0.42,
        "totalProfitUSD": 1250.50,
        "label": "Last 7 Days"
      }
    }
  }
}
```

---

### 5. 📖 Get Order Book for Specific Exchange

```http
GET /api/orderbook-arbitrage/orderbook/:exchange
```

**Path Parameters:**

- `exchange`: Exchange ID (`binance`, `kraken`, `coinbase`, `okx`)

**Query Parameters:**

- `symbol` (optional): Trading pair, default: `BTC/USDT`
- `limit` (optional): Order book depth, default: `20`

**Example:**

```bash
curl -X GET "http://localhost:3000/api/orderbook-arbitrage/orderbook/binance?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "orderBook": {
      "symbol": "BTC/USDT",
      "exchangeName": "Binance",
      "exchangeId": "binance",
      "bids": [
        { "price": 69036.8, "amount": 0.1234, "total": 0.1234 },
        { "price": 69036.5, "amount": 0.2345, "total": 0.3579 }
      ],
      "asks": [
        { "price": 69036.81, "amount": 0.1567, "total": 0.1567 },
        { "price": 69037.0, "amount": 0.289, "total": 0.4457 }
      ],
      "timestamp": 1771030944119,
      "datetime": "2026-02-14T01:02:24.119Z"
    },
    "fees": {
      "maker": 0.001,
      "taker": 0.001,
      "percentage": true
    }
  }
}
```

---

## 🏗️ Architecture

### Design Pattern: Adapter Pattern

This system uses the **Adapter Pattern** to abstract exchange-specific implementations:

```
┌─────────────────────────────────────────┐
│       Exchange Adapter Interface        │
│  - fetchTicker()                        │
│  - fetchOrderBook()                     │
│  - getTradingFees()                     │
│  - isAvailable()                        │
└─────────────────────────────────────────┘
                    ▲
                    │
      ┌─────────────┴─────────────┐
      │                           │
┌─────────────┐          ┌─────────────┐
│   Binance   │          │   Kraken    │
│   Adapter   │   ...    │   Adapter   │
└─────────────┘          └─────────────┘
```

**Benefits:**

- ✅ Easy to add new exchanges
- ✅ Swap exchange SDKs without breaking code
- ✅ Testable and maintainable
- ✅ Clean separation of concerns

---

## 🧮 Calculation Logic

### Net Profit Calculation

```
1. Get Order Book Data
   ├─ Fetch bids (buy orders) from all exchanges
   └─ Fetch asks (sell orders) from all exchanges

2. Calculate Execution Prices
   ├─ Buy Price = Weighted average of asks (considering depth)
   └─ Sell Price = Weighted average of bids (considering depth)

3. Calculate Gross Profit
   Gross Profit = (Sell Price × Amount) - (Buy Price × Amount)

4. Deduct Trading Fees
   ├─ Buy Fee = Buy Price × Amount × Taker Fee Rate (0.1%)
   ├─ Sell Fee = Sell Price × Amount × Taker Fee Rate (0.1%)
   └─ Total Fees = Buy Fee + Sell Fee

5. Calculate Slippage
   ├─ Buy Slippage = |Weighted Avg Price - Best Ask Price|
   └─ Sell Slippage = |Weighted Avg Price - Best Bid Price|

6. Net Profit
   Net Profit = Gross Profit - Total Fees
   Net Profit % = (Net Profit / Total Cost) × 100

7. Profitability Check
   Is Profitable = Net Profit > 0 AND Net Profit % ≥ 0.5%
```

---

## 🚀 Quick Start

### 1. Authentication

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"trader@example.com","username":"trader","password":"secure123"}'

# Response includes token
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### 2. Analyze Opportunities

```bash
curl -X GET "http://localhost:3000/api/orderbook-arbitrage/analyze?amount=1" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.'
```

### 3. View Dashboard

```bash
curl -X GET "http://localhost:3000/api/orderbook-arbitrage/pl-summary" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.'
```

---

## 📈 Key Features for Judges

### 1. **Realistic Cost Modeling**

- Actual order book depth analysis
- Trading fee calculation (maker/taker)
- Slippage estimation
- Transfer cost awareness

### 2. **Enterprise-Ready Architecture**

- Adapter pattern for scalability
- Type-safe TypeScript implementation
- Error handling and graceful degradation
- Rate limiting to protect exchange APIs

### 3. **Developer-Friendly API**

- RESTful design
- Comprehensive documentation
- Clear response structures
- Meaningful error messages

### 4. **Performance Dashboard Ready**

- Complete P&L tracking
- Historical data logging
- Statistical analysis
- Time-period breakdowns

### 5. **Extensibility**

- Easy to add new exchanges
- Configurable profit thresholds
- Support for different trading pairs
- Pluggable fee models

---

## 🧪 Testing Examples

### Find Best Opportunity

```bash
curl -s "http://localhost:3000/api/orderbook-arbitrage/analyze" \
  -H "Authorization: Bearer TOKEN" | \
  jq '.data.bestOpportunity'
```

### Check if Profitable

```bash
curl -s "http://localhost:3000/api/orderbook-arbitrage/analyze" \
  -H "Authorization: Bearer TOKEN" | \
  jq '.data.opportunities[] | select(.isProfitable == true)'
```

### View Win Rate

```bash
curl -s "http://localhost:3000/api/orderbook-arbitrage/pl-summary" \
  -H "Authorization: Bearer TOKEN" | \
  jq '.data.overall.winRate'
```

---

## 📚 Technical Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify (high-performance)
- **Exchange SDK**: CCXT (100+ exchanges supported)
- **Authentication**: JWT
- **Architecture**: Adapter Pattern
- **Data Storage**: In-memory (production-ready with database swap)

---

## 🎯 Hackathon Compliance Checklist

- [x] Multi-exchange monitoring (4 exchanges)
- [x] Order book depth analysis
- [x] Trading fee calculation
- [x] Slippage calculation
- [x] Net profit calculator
- [x] Profitability threshold (0.5%)
- [x] P&L tracking
- [x] Trade history
- [x] Dashboard endpoints
- [x] Secure authentication
- [x] Developer-friendly API
- [x] Clean code architecture
- [x] Comprehensive documentation

---

## 💡 Future Enhancements

1. **WebSocket Streaming**: Real-time order book updates
2. **Advanced Routing**: Multi-hop arbitrage (A→B→C→A)
3. **Machine Learning**: Predict optimal execution timing
4. **Risk Management**: Position sizing, stop-loss
5. **Database Integration**: Persistent storage for analytics
6. **Live Execution**: Actual trade execution (with caution!)

---

## 📞 Support

For questions or issues:

- Check API documentation above
- Review error messages in responses
- Ensure authentication token is valid
- Verify exchange availability

---

**Built for Spread Hunters Hackathon** 🏆
