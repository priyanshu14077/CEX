from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class WalletResponse(BaseModel):
    user_id: str
    balance_inr: float


class DepositRequest(BaseModel):
    amount: float


class WithdrawRequest(BaseModel):
    amount: float


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    type: str
    amount: float
    created_at: datetime


class StockResponse(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    high: float
    low: float
    volume: int


class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"


class OrderStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"
    CANCELLED = "cancelled"


class OrderCreate(BaseModel):
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: int
    price: Optional[float] = None


class OrderResponse(BaseModel):
    id: str
    user_id: str
    symbol: str
    side: str
    order_type: str
    price: Optional[float]
    quantity: int
    filled_quantity: int
    status: str
    created_at: datetime


class HoldingResponse(BaseModel):
    symbol: str
    quantity: int
    avg_buy_price: float
    current_price: float
    total_value: float
    profit_loss: float
    profit_loss_percent: float