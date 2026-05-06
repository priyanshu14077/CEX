from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uuid

from app.routers import wallet, market, orders, portfolio

app = FastAPI(
    title="CEX Backend API",
    description="Centralized Exchange Backend - Demo Mode",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo user ID for testing (no auth required)
DEMO_USER_ID = str(uuid.uuid4())

app.include_router(wallet.router, prefix="/api/wallet", tags=["Wallet"])
app.include_router(market.router, prefix="/api/market", tags=["Market"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])


@app.get("/")
async def root():
    return {"message": "CEX Backend API is running (Demo Mode)"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "mode": "demo", "demo_user": DEMO_USER_ID}


@app.middleware("http")
async def add_demo_user(request, call_next):
    """Add demo user ID to requests for demo mode"""
    request.state.user_id = DEMO_USER_ID
    return await call_next(request)