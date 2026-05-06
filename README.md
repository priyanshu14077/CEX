# CEX - Centralized Exchange

A simulated stock trading platform where users can sign up, view stock performance, deposit/withdraw virtual INR, and place buy/sell orders.

## ⚠️ Disclaimer

This is an **educational MVP** - a learning project. It does NOT involve:
- Real money transactions
- Real KYC verification
- Real brokerage connections
- Regulatory compliance

All trading is simulated with virtual INR (₹10,000 default balance).

---

## Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend (Next.js 16)"]
        UI[User Interface]
        Auth[Auth Context]
        API[API Client]
    end

    subgraph Server["Backend (FastAPI)"]
        Routes[API Routes]
        AuthSvc[Auth Service]
        WalletSvc[Wallet Service]
        MarketSvc[Market Service]
        OrderSvc[Order Service]
        PortfolioSvc[Portfolio Service]
    end

    subgraph Data["Data Layer"]
        DB[(Supabase PostgreSQL)]
        Cache[(In-Memory Cache)]
        AlphaV[Alpha Vantage API]
    end

    UI --> Auth
    Auth --> API
    API --> Routes
    Routes --> AuthSvc
    Routes --> WalletSvc
    Routes --> MarketSvc
    Routes --> OrderSvc
    Routes --> PortfolioSvc

    AuthSvc --> DB
    WalletSvc --> DB
    OrderSvc --> DB
    PortfolioSvc --> DB

    MarketSvc --> AlphaV
    MarketSvc --> Cache
    MarketSvc --> DB
```

---

## How It Works

### 1. User Registration & Authentication

- Users sign up with email/password
- Supabase Auth handles user management
- JWT tokens are issued for session management
- Each new user gets ₹10,000 virtual INR in their wallet

### 2. Wallet System

- **Deposit**: Add fake INR to wallet (for testing)
- **Withdraw**: Deduct INR from wallet
- All transactions are recorded in the `transactions` table

### 3. Market Data

- Stock prices fetched from Alpha Vantage API
- Mock data fallback when API is unavailable (demo mode)
- 5-minute cache to reduce API calls
- Supports 10 US stocks: AAPL, GOOGL, MSFT, TSLA, AMZN, NVDA, META, NFLX, AMD, INTC

### 4. Trading

- **Market Orders**: Execute immediately at current price
- **Limit Orders**: Set a target price (stored for later execution)
- **Buy**: Deduct INR from wallet, add to holdings
- **Sell**: Add INR to wallet, reduce holdings
- FIFO cost basis for profit/loss calculation

### 5. Portfolio

- View all holdings with current market values
- Calculate profit/loss: `(current_price - avg_buy_price) * quantity`
- Total portfolio value = wallet balance + holdings value

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase account (free tier)

### 1. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip3 install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run backend
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Database Setup

In Supabase SQL Editor, run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    balance_inr DECIMAL(15, 2) DEFAULT 10000.00
);

CREATE TABLE IF NOT EXISTS holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    avg_buy_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL,
    order_type TEXT NOT NULL,
    price DECIMAL(10, 2),
    quantity INTEGER NOT NULL,
    filled_quantity INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth, JWT |
| Market Data | Alpha Vantage API |

---

## Project Structure

```
cex/
├── README.md                 # This file
├── AGENTS.md                 # Agent instructions
│
├── backend/                  # FastAPI backend
│   ├── README.md            # Backend-specific docs
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example         # Environment template
│   └── app/
│       ├── main.py          # App entry point
│       ├── db/              # Database config
│       ├── models/          # Pydantic schemas
│       └── routers/         # API endpoints
│
└── frontend/                 # Next.js frontend
    ├── README.md            # Frontend-specific docs
    ├── .env.local           # Environment config
    └── src/
        ├── app/             # Pages (App Router)
        ├── components/      # Reusable components
        └── lib/             # Utilities & API client
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Wallet
- `GET /api/wallet` - Get balance
- `POST /api/wallet/deposit` - Add funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Transaction history

### Market
- `GET /api/market/stocks` - All stocks with prices
- `GET /api/market/stocks/{symbol}` - Single stock
- `GET /api/market/search` - Search stocks

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders` - Order history
- `DELETE /api/orders/{id}` - Cancel order

### Portfolio
- `GET /api/portfolio` - Holdings with P/L
- `GET /api/portfolio/summary` - Quick summary

---

## License

MIT License - Educational purposes only.