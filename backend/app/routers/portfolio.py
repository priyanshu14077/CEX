from fastapi import APIRouter, Depends
from app.routers.auth import get_current_user
from app.routers.market import fetch_stock_data
from app.db.database import supabase
import asyncio

router = APIRouter()


@router.get("")
async def get_portfolio(current_user: dict = Depends(get_current_user)):
    """Get user's portfolio with current values"""
    user_id = current_user["id"]

    # Get holdings
    holdings_response = supabase.table("holdings").select("*").eq("user_id", user_id).execute()
    holdings = holdings_response.data

    if not holdings:
        return {
            "holdings": [],
            "total_value": 0,
            "total_profit_loss": 0,
            "total_profit_loss_percent": 0
        }

    # Fetch current prices for all held symbols
    symbols = [h["symbol"] for h in holdings]
    price_tasks = [fetch_stock_data(symbol) for symbol in symbols]
    prices = await asyncio.gather(*price_tasks)

    price_map = {p["symbol"]: p for p in prices}

    # Calculate portfolio values
    total_value = 0
    total_cost = 0

    portfolio_items = []
    for holding in holdings:
        symbol = holding["symbol"]
        quantity = holding["quantity"]
        avg_price = float(holding["avg_buy_price"])

        current_price_data = price_map.get(symbol, {})
        current_price = current_price_data.get("price", avg_price)

        value = current_price * quantity
        cost = avg_price * quantity
        profit_loss = value - cost
        profit_loss_percent = (profit_loss / cost * 100) if cost > 0 else 0

        total_value += value
        total_cost += cost

        portfolio_items.append({
            "symbol": symbol,
            "name": current_price_data.get("name", symbol),
            "quantity": quantity,
            "avg_buy_price": avg_price,
            "current_price": current_price,
            "total_value": value,
            "profit_loss": profit_loss,
            "profit_loss_percent": round(profit_loss_percent, 2)
        })

    total_profit_loss = total_value - total_cost
    total_profit_loss_percent = (total_profit_loss / total_cost * 100) if total_cost > 0 else 0

    return {
        "holdings": portfolio_items,
        "total_value": round(total_value, 2),
        "total_profit_loss": round(total_profit_loss, 2),
        "total_profit_loss_percent": round(total_profit_loss_percent, 2)
    }


@router.get("/summary")
async def get_portfolio_summary(current_user: dict = Depends(get_current_user)):
    """Get quick portfolio summary"""
    user_id = current_user["id"]

    # Get wallet balance
    wallet_response = supabase.table("wallets").select("balance_inr").eq("user_id", user_id).execute()
    wallet_balance = float(wallet_response.data[0]["balance_inr"]) if wallet_response.data else 0

    # Get total holdings value
    holdings_response = supabase.table("holdings").select("*").eq("user_id", user_id).execute()
    holdings = holdings_response.data

    if not holdings:
        return {
            "wallet_balance": wallet_balance,
            "holdings_value": 0,
            "total_portfolio_value": wallet_balance,
            "holdings_count": 0
        }

    symbols = [h["symbol"] for h in holdings]
    price_tasks = [fetch_stock_data(symbol) for symbol in symbols]
    prices = await asyncio.gather(*price_tasks)

    holdings_value = sum(
        float(h["quantity"]) * prices[i].get("price", float(h["avg_buy_price"]))
        for i, h in enumerate(holdings)
    )

    return {
        "wallet_balance": round(wallet_balance, 2),
        "holdings_value": round(holdings_value, 2),
        "total_portfolio_value": round(wallet_balance + holdings_value, 2),
        "holdings_count": len(holdings)
    }