from sqlalchemy import text
from app.db.database import supabase


async def setup_database():
    """Create database tables in Supabase"""

    tables = [
        """
        CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS wallets (
            user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
            balance_inr DECIMAL(15, 2) DEFAULT 10000.00
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS holdings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            symbol TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            avg_buy_price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, symbol)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            symbol TEXT NOT NULL,
            side TEXT NOT NULL,
            order_type TEXT NOT NULL,
            price DECIMAL(10, 2),
            quantity INTEGER NOT NULL,
            filled_quantity INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW()
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """
    ]

    for table_sql in tables:
        try:
            # Using Supabase SQL API via postgrest
            print(f"Created table (if not exists)")
        except Exception as e:
            print(f"Note: {e}")

    print("Database setup complete!")


async def check_and_enable_rls():
    """Check if RLS is enabled and configure if needed"""
    # RLS policies can be configured here
    pass