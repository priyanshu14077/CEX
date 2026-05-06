from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

supabase: Client = None

if SUPABASE_URL and SUPABASE_KEY and "your-project" not in SUPABASE_URL:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_supabase():
    """Get Supabase client for database operations"""
    return supabase


async def init_db():
    """Initialize database connection and tables"""
    if supabase:
        print("Database initialized with Supabase client")
    else:
        print("Warning: Supabase not configured - running in demo mode")
    return supabase is not None