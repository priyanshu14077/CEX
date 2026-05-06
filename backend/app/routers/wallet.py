"""
Wallet API endpoints for deposit, withdraw and transaction history
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime

from app.db.database import supabase
from app.routers.auth import get_current_user
from app.models.schemas import WalletResponse, DepositRequest, WithdrawRequest, TransactionResponse

router = APIRouter()


@router.get("", response_model=WalletResponse)
async def get_wallet(current_user: dict = Depends(get_current_user)):
    response = supabase.table("wallets").select("*").eq("user_id", current_user["id"]).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return response.data[0]


@router.post("/deposit")
async def deposit(request: DepositRequest, current_user: dict = Depends(get_current_user)):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    # Get current balance
    wallet_response = supabase.table("wallets").select("balance_inr").eq("user_id", current_user["id"]).execute()
    if not wallet_response.data:
        raise HTTPException(status_code=404, detail="Wallet not found")

    current_balance = float(wallet_response.data[0]["balance_inr"])
    new_balance = current_balance + request.amount

    # Update wallet
    supabase.table("wallets").update({"balance_inr": new_balance}).eq("user_id", current_user["id"]).execute()

    # Record transaction
    supabase.table("transactions").insert({
        "user_id": current_user["id"],
        "type": "deposit",
        "amount": request.amount,
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    return {"message": "Deposit successful", "new_balance": new_balance}


@router.post("/withdraw")
async def withdraw(request: WithdrawRequest, current_user: dict = Depends(get_current_user)):
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    # Get current balance
    wallet_response = supabase.table("wallets").select("balance_inr").eq("user_id", current_user["id"]).execute()
    if not wallet_response.data:
        raise HTTPException(status_code=404, detail="Wallet not found")

    current_balance = float(wallet_response.data[0]["balance_inr"])

    if current_balance < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    new_balance = current_balance - request.amount

    # Update wallet
    supabase.table("wallets").update({"balance_inr": new_balance}).eq("user_id", current_user["id"]).execute()

    # Record transaction
    supabase.table("transactions").insert({
        "user_id": current_user["id"],
        "type": "withdraw",
        "amount": request.amount,
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    return {"message": "Withdrawal successful", "new_balance": new_balance}


@router.get("/transactions")
async def get_transactions(current_user: dict = Depends(get_current_user)):
    response = supabase.table("transactions").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
    return response.data