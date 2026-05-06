"""
Orders API endpoints for placing and managing orders
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
import uuid

from app.db.database import supabase
from app.routers.auth import get_current_user
from app.routers.market import fetch_stock_data
from app.models.schemas import OrderCreate, OrderResponse

router = APIRouter()


@router.post("")
async def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]

    # Get current stock price for market orders
    execution_price = order.price
    if order.order_type == "market":
        stock_data = await fetch_stock_data(order.symbol)
        execution_price = stock_data["price"]

    if execution_price is None:
        raise HTTPException(status_code=400, detail="Could not determine execution price")

    # Calculate total cost
    total_cost = execution_price * order.quantity

    # For buy orders, check wallet balance
    if order.side == "buy":
        wallet_response = supabase.table("wallets").select("balance_inr").eq("user_id", user_id).execute()
        if not wallet_response.data:
            raise HTTPException(status_code=404, detail="Wallet not found")

        current_balance = float(wallet_response.data[0]["balance_inr"])
        if current_balance < total_cost:
            raise HTTPException(status_code=400, detail="Insufficient balance")

    # For sell orders, check holdings
    if order.side == "sell":
        holding_response = supabase.table("holdings").select("quantity").eq("user_id", user_id).eq("symbol", order.symbol).execute()
        if not holding_response.data:
            raise HTTPException(status_code=400, detail="No holdings to sell")

        current_qty = holding_response.data[0]["quantity"]
        if current_qty < order.quantity:
            raise HTTPException(status_code=400, detail="Insufficient holdings")

    # Create order
    order_id = str(uuid.uuid4())
    supabase.table("orders").insert({
        "id": order_id,
        "user_id": user_id,
        "symbol": order.symbol,
        "side": order.side,
        "order_type": order.order_type,
        "price": execution_price,
        "quantity": order.quantity,
        "filled_quantity": 0,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    # For market orders, execute immediately
    if order.order_type == "market":
        await execute_order(order_id, user_id, order, execution_price)

    return {"message": "Order placed successfully", "order_id": order_id}


async def execute_order(order_id: str, user_id: str, order: OrderCreate, execution_price: float):
    """Execute a market order"""
    total_cost = execution_price * order.quantity

    if order.side == "buy":
        # Deduct from wallet
        wallet_response = supabase.table("wallets").select("balance_inr").eq("user_id", user_id).execute()
        current_balance = float(wallet_response.data[0]["balance_inr"])
        new_balance = current_balance - total_cost
        supabase.table("wallets").update({"balance_inr": new_balance}).eq("user_id", user_id).execute()

        # Update or create holding
        holding_response = supabase.table("holdings").select("*").eq("user_id", user_id).eq("symbol", order.symbol).execute()
        if holding_response.data:
            existing = holding_response.data[0]
            new_qty = existing["quantity"] + order.quantity
            new_avg = ((existing["avg_buy_price"] * existing["quantity"]) + total_cost) / new_qty
            supabase.table("holdings").update({
                "quantity": new_qty,
                "avg_buy_price": new_avg
            }).eq("user_id", user_id).eq("symbol", order.symbol).execute()
        else:
            supabase.table("holdings").insert({
                "user_id": user_id,
                "symbol": order.symbol,
                "quantity": order.quantity,
                "avg_buy_price": execution_price
            }).execute()

    elif order.side == "sell":
        # Add to wallet
        wallet_response = supabase.table("wallets").select("balance_inr").eq("user_id", user_id).execute()
        current_balance = float(wallet_response.data[0]["balance_inr"])
        new_balance = current_balance + total_cost
        supabase.table("wallets").update({"balance_inr": new_balance}).eq("user_id", user_id).execute()

        # Update holdings
        holding_response = supabase.table("holdings").select("quantity").eq("user_id", user_id).eq("symbol", order.symbol).execute()
        new_qty = holding_response.data[0]["quantity"] - order.quantity

        if new_qty <= 0:
            supabase.table("holdings").delete().eq("user_id", user_id).eq("symbol", order.symbol).execute()
        else:
            supabase.table("holdings").update({"quantity": new_qty}).eq("user_id", user_id).eq("symbol", order.symbol).execute()

    # Update order status
    supabase.table("orders").update({
        "filled_quantity": order.quantity,
        "status": "filled"
    }).eq("id", order_id).execute()


@router.get("")
async def get_orders(
    status: str = None,
    symbol: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get user's orders"""
    query = supabase.table("orders").select("*").eq("user_id", current_user["id"])

    if status:
        query = query.eq("status", status)
    if symbol:
        query = query.eq("symbol", symbol)

    response = query.order("created_at", desc=True).execute()
    return response.data


@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get single order details"""
    response = supabase.table("orders").select("*").eq("id", order_id).eq("user_id", current_user["id"]).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")
    return response.data[0]


@router.delete("/{order_id}")
async def cancel_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Cancel a pending order"""
    response = supabase.table("orders").select("*").eq("id", order_id).eq("user_id", current_user["id"]).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Order not found")

    order = response.data[0]
    if order["status"] != "pending":
        raise HTTPException(status_code=400, detail="Can only cancel pending orders")

    supabase.table("orders").update({"status": "cancelled"}).eq("id", order_id).execute()
    return {"message": "Order cancelled successfully"}