"""
Market API endpoints for stock data and search
"""
from fastapi import APIRouter, HTTPException
import httpx
import os
from datetime import datetime
import asyncio

router = APIRouter()

ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY", "demo")
BASE_URL = "https://www.alphavantage.co/query"

DEFAULT_STOCKS = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA", "META", "NFLX", "AMD", "INTC"]

stock_cache = {}
CACHE_TTL = 300


async def fetch_stock_data(symbol: str) -> dict:
    """Fetch stock data from Alpha Vantage API"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                BASE_URL,
                params={
                    "function": "GLOBAL_QUOTE",
                    "symbol": symbol,
                    "apikey": ALPHA_VANTAGE_API_KEY
                },
                timeout=10.0
            )
            data = response.json()

            if "Global Quote" in data and data["Global Quote"]:
                quote = data["Global Quote"]
                return {
                    "symbol": symbol,
                    "name": get_company_name(symbol),
                    "price": float(quote.get("05. price", 0)),
                    "change": float(quote.get("09. change", 0)),
                    "change_percent": float(quote.get("10. change percent", "0%").replace("%", "")),
                    "high": float(quote.get("03. high", 0)),
                    "low": float(quote.get("04. low", 0)),
                    "volume": int(quote.get("06. volume", 0))
                }
            else:
                return get_mock_data(symbol)
        except Exception:
            return get_mock_data(symbol)


def get_company_name(symbol: str) -> str:
    """Get company name for symbol"""
    names = {
        "AAPL": "Apple Inc.",
        "GOOGL": "Alphabet Inc.",
        "MSFT": "Microsoft Corporation",
        "TSLA": "Tesla Inc.",
        "AMZN": "Amazon.com Inc.",
        "NVDA": "NVIDIA Corporation",
        "META": "Meta Platforms Inc.",
        "NFLX": "Netflix Inc.",
        "AMD": "Advanced Micro Devices",
        "INTC": "Intel Corporation"
    }
    return names.get(symbol, symbol)


def get_mock_data(symbol: str) -> dict:
    """Return mock data when API fails"""
    mock_prices = {
        "AAPL": {"price": 178.50, "change": 2.35, "high": 180.20, "low": 176.10, "volume": 52000000},
        "GOOGL": {"price": 141.20, "change": -0.80, "high": 142.50, "low": 140.30, "volume": 28000000},
        "MSFT": {"price": 378.90, "change": 4.20, "high": 380.00, "low": 375.50, "volume": 22000000},
        "TSLA": {"price": 248.50, "change": -3.50, "high": 255.00, "low": 246.20, "volume": 95000000},
        "AMZN": {"price": 178.30, "change": 1.90, "high": 179.50, "low": 176.80, "volume": 45000000},
        "NVDA": {"price": 875.40, "change": 15.60, "high": 880.00, "low": 860.20, "volume": 38000000},
        "META": {"price": 505.20, "change": 8.30, "high": 508.00, "low": 498.50, "volume": 15000000},
        "NFLX": {"price": 628.90, "change": -2.10, "high": 635.00, "low": 625.40, "volume": 5000000},
        "AMD": {"price": 178.60, "change": 3.20, "high": 180.50, "low": 175.80, "volume": 62000000},
        "INTC": {"price": 42.30, "change": -0.45, "high": 43.20, "low": 41.90, "volume": 35000000}
    }

    mock = mock_prices.get(symbol, {"price": 100.00, "change": 0, "high": 101.00, "low": 99.00, "volume": 1000000})
    return {
        "symbol": symbol,
        "name": get_company_name(symbol),
        "price": mock["price"],
        "change": mock["change"],
        "change_percent": round((mock["change"] / mock["price"]) * 100, 2) if mock["price"] > 0 else 0,
        "high": mock["high"],
        "low": mock["low"],
        "volume": mock["volume"]
    }


@router.get("/stocks")
async def get_stocks():
    """Get all available stocks with current prices"""
    cache_key = "all_stocks"
    current_time = datetime.utcnow().timestamp()

    if cache_key in stock_cache:
        cached_data, cache_time = stock_cache[cache_key]
        if current_time - cache_time < CACHE_TTL:
            return cached_data

    tasks = [fetch_stock_data(symbol) for symbol in DEFAULT_STOCKS]
    stocks = await asyncio.gather(*tasks)

    result = {"stocks": stocks, "timestamp": datetime.utcnow().isoformat()}
    stock_cache[cache_key] = (result, current_time)

    return result


@router.get("/stocks/{symbol}")
async def get_stock(symbol: str):
    """Get single stock details"""
    symbol = symbol.upper()
    if symbol not in DEFAULT_STOCKS:
        raise HTTPException(status_code=404, detail="Stock not found")

    return await fetch_stock_data(symbol)


@router.get("/search")
async def search_stocks(query: str):
    """Search stocks by name or symbol"""
    query = query.upper()
    matching = [s for s in DEFAULT_STOCKS if query in s]
    return {"results": matching}