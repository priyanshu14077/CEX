"""
Portfolio API endpoints for user holdings and summary - Demo Mode
"""
from fastapi import APIRouter, Request
from app.routers.market import get_stock_price, DEFAULT_STOCKS
from app.routers.orders import demo_orders

router = APIRouter()


@router.get("")
async def get_portfolio(request: Request):
    """Get user's portfolio with current values"""
    # Aggregate holdings from filled buy orders
    holdings_map = {}

    for order in demo_orders:
        if order["status"] == "filled" and order["side"] == "buy":
            symbol = order["symbol"]
            if symbol not in holdings_map:
                holdings_map[symbol] = {"quantity": 0, "total_cost": 0}

            holdings_map[symbol]["quantity"] += order["quantity"]
            holdings_map[symbol]["total_cost"] += order["price"] * order["quantity"]

        elif order["status"] == "filled" and order["side"] == "sell":
            symbol = order["symbol"]
            if symbol in holdings_map:
                holdings_map[symbol]["quantity"] -= order["quantity"]

    # Calculate portfolio items
    portfolio_items = []
    total_value = 0
    total_cost = 0

    for symbol, data in holdings_map.items():
        if data["quantity"] <= 0:
            continue

        current_price = get_stock_price(symbol) or 0
        avg_price = data["total_cost"] / data["quantity"] if data["quantity"] > 0 else 0
        value = current_price * data["quantity"]
        cost = avg_price * data["quantity"]

        portfolio_items.append({
            "symbol": symbol,
            "name": next((s["name"] for s in DEFAULT_STOCKS if s["symbol"] == symbol), symbol),
            "quantity": data["quantity"],
            "avg_buy_price": round(avg_price, 2),
            "current_price": current_price,
            "total_value": round(value, 2),
            "profit_loss": round(value - cost, 2),
            "profit_loss_percent": round(((value - cost) / cost * 100) if cost > 0 else 0, 2)
        })

        total_value += value
        total_cost += cost

    total_profit_loss = total_value - total_cost

    return {
        "holdings": portfolio_items,
        "total_value": round(total_value, 2),
        "total_profit_loss": round(total_profit_loss, 2),
        "total_profit_loss_percent": round((total_profit_loss / total_cost * 100) if total_cost > 0 else 0, 2)
    }


@router.get("/summary")
async def get_portfolio_summary(request: Request):
    """Get quick portfolio summary"""
    from app.routers.wallet import demo_wallet

    holdings_value = 0
    for order in demo_orders:
        if order["status"] == "filled" and order["side"] == "buy":
            price = get_stock_price(order["symbol"]) or 0
            holdings_value += price * order["quantity"]

    return {
        "wallet_balance": round(demo_wallet["balance_inr"], 2),
        "holdings_value": round(holdings_value, 2),
        "total_portfolio_value": round(demo_wallet["balance_inr"] + holdings_value, 2),
        "holdings_count": len(set(o["symbol"] for o in demo_orders if o["status"] == "filled" and o["side"] == "buy"))
    }