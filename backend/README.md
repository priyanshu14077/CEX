# CEX Backend

FastAPI-based backend for the Centralized Exchange MVP.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **Supabase** - PostgreSQL database & auth
- **Alpha Vantage** - Stock market data API
- **Python-JWT** - JWT authentication

## Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip3 install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

## Environment Variables

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SECRET_KEY=your_jwt_secret_min_32_chars
ALPHA_VANTAGE_API_KEY=your_api_key
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health status |
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/me` | GET | Get current user |
| `/api/wallet` | GET | Get wallet balance |
| `/api/wallet/deposit` | POST | Deposit INR |
| `/api/wallet/withdraw` | POST | Withdraw INR |
| `/api/wallet/transactions` | GET | Transaction history |
| `/api/market/stocks` | GET | List all stocks |
| `/api/market/stocks/{symbol}` | GET | Single stock details |
| `/api/market/search` | GET | Search stocks |
| `/api/orders` | POST | Place order |
| `/api/orders` | GET | Get orders |
| `/api/orders/{id}` | GET | Get order details |
| `/api/orders/{id}` | DELETE | Cancel order |
| `/api/portfolio` | GET | Get portfolio |
| `/api/portfolio/summary` | GET | Portfolio summary |

## Supabase SQL Setup

Run this in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    balance_inr DECIMAL(15, 2) DEFAULT 10000.00
);

-- Holdings
CREATE TABLE IF NOT EXISTS holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    avg_buy_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Orders
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

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```