"""
Wallet API endpoints for deposit, withdraw and transaction history - Demo Mode
"""
from fastapi import APIRouter, Request
from datetime import datetime

router = APIRouter()

# In-memory wallet for demo
demo_wallet = {
    "balance_inr": 10000.00,
    "transactions": []
}


@router.get("")
async def get_wallet(request: Request):
    return {
        "user_id": request.state.user_id,
        "balance_inr": demo_wallet["balance_inr"]
    }


@router.post("/deposit")
async def deposit(request: Request, amount: float):
    if amount <= 0:
        return {"error": "Amount must be positive"}

    demo_wallet["balance_inr"] += amount
    demo_wallet["transactions"].append({
        "id": str(datetime.now().timestamp()),
        "user_id": request.state.user_id,
        "type": "deposit",
        "amount": amount,
        "created_at": datetime.utcnow().isoformat()
    })

    return {
        "message": "Deposit successful",
        "new_balance": demo_wallet["balance_inr"]
    }


@router.post("/withdraw")
async def withdraw(request: Request, amount: float):
    if amount <= 0:
        return {"error": "Amount must be positive"}

    if demo_wallet["balance_inr"] < amount:
        return {"error": "Insufficient balance"}

    demo_wallet["balance_inr"] -= amount
    demo_wallet["transactions"].append({
        "id": str(datetime.now().timestamp()),
        "user_id": request.state.user_id,
        "type": "withdraw",
        "amount": amount,
        "created_at": datetime.utcnow().isoformat()
    })

    return {
        "message": "Withdrawal successful",
        "new_balance": demo_wallet["balance_inr"]
    }


@router.get("/transactions")
async def get_transactions(request: Request):
    return demo_wallet["transactions"]