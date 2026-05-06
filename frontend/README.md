# CEX Frontend

Next.js 16+ frontend for the Centralized Exchange MVP.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Query** - Data fetching
- **React Hot Toast** - Notifications

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

The app runs at http://localhost:3000

## Environment

Create `.env.local` in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Login/Register page |
| `/dashboard` | Portfolio summary, top movers |
| `/markets` | All available stocks with prices |
| `/trade/[symbol]` | Buy/sell specific stock |
| `/wallet` | Deposit/withdraw, transaction history |
| `/orders` | Order history, cancel pending |

## Features

- **Authentication**: Email/password signup & login
- **Portfolio**: View holdings with profit/loss
- **Trading**: Market and limit orders
- **Wallet**: Simulated INR deposit/withdraw
- **Markets**: Real-time stock prices (with fallback to mock data)

## Project Structure

```
src/
├── app/              # Next.js pages (App Router)
│   ├── dashboard/
│   ├── markets/
│   ├── trade/[symbol]/
│   ├── wallet/
│   └── orders/
├── components/       # Reusable UI components
│   └── Navbar.tsx
└── lib/              # Utilities
    ├── api.ts        # API client with interceptors
    └── auth-context.tsx  # Auth state management
```

## API Integration

The frontend communicates with the FastAPI backend via REST:
- JWT token stored in localStorage
- Bearer token sent in Authorization header
- 401 responses trigger automatic logout