"""
Orders API endpoints for placing and managing orders - Demo Mode
"""
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.routers.market import get_stock_price

router = APIRouter()

# In-memory orders storage
demo_orders = []


class OrderCreate(BaseModel):
    symbol: str
    side: str
    order_type: str
    quantity: int
    price: float | None = None


@router.post("")
async def create_order(request: Request, order: OrderCreate):
    """Place a new order"""
    # Get current price
    if order.order_type == "market":
        current_price = get_stock_price(order.symbol)
        if not current_price:
            raise HTTPException(status_code=400, detail="Invalid symbol")
        execution_price = current_price
    else:
        execution_price = order.price

    total_cost = execution_price * order.quantity

    # Check balance for buy orders
    from app.routers.wallet import demo_wallet
    if order.side == "buy":
        if demo_wallet["balance_inr"] < total_cost:
            raise HTTPException(status_code=400, detail="Insufficient balance")

    # Create order
    order_id = str(uuid.uuid4())
    new_order = {
        "id": order_id,
        "user_id": request.state.user_id,
        "symbol": order.symbol,
        "side": order.side,
        "order_type": order.order_type,
        "price": execution_price,
        "quantity": order.quantity,
        "filled_quantity": order.quantity if order.order_type == "market" else 0,
        "status": "filled" if order.order_type == "market" else "pending",
        "created_at": datetime.utcnow().isoformat()
    }

    demo_orders.append(new_order)

    # Execute market order immediately
    if order.order_type == "market":
        if order.side == "buy":
            demo_wallet["balance_inr"] -= total_cost
        else:
            demo_wallet["balance_inr"] += total_cost

    return {"message": "Order placed", "order_id": order_id, "order": new_order}


@router.get("")
async def get_orders(request: Request, status: str = None, symbol: str = None):
    """Get user's orders"""
    filtered = demo_orders
    if status:
        filtered = [o for o in filtered if o["status"] == status]
    if symbol:
        filtered = [o for o in filtered if o["symbol"] == symbol]

    return filtered


@router.get("/{order_id}")
async def get_order(request: Request, order_id: str):
    """Get single order"""
    for order in demo_orders:
        if order["id"] == order_id:
            return order
    raise HTTPException(status_code=404, detail="Order not found")


@router.delete("/{order_id}")
async def cancel_order(request: Request, order_id: str):
    """Cancel a pending order"""
    for order in demo_orders:
        if order["id"] == order_id:
            if order["status"] != "pending":
                raise HTTPException(status_code=400, detail="Can only cancel pending orders")
            order["status"] = "cancelled"
            return {"message": "Order cancelled"}
    raise HTTPException(status_code=404, detail="Order not found")