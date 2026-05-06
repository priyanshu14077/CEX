'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { portfolioAPI, marketAPI } from '@/lib/api';
import { TrendingUp, TrendingDown, Wallet, PieChart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PortfolioSummary {
  wallet_balance: number;
  holdings_value: number;
  total_portfolio_value: number;
  holdings_count: number;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [topMovers, setTopMovers] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      Promise.all([
        portfolioAPI.getSummary(),
        marketAPI.getStocks()
      ]).then(([summaryRes, marketRes]) => {
        setSummary(summaryRes.data);
        const stocks = marketRes.data.stocks || [];
        const sorted = [...stocks].sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent)).slice(0, 5);
        setTopMovers(sorted);
      }).catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Total Portfolio</span>
              <Wallet className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-white">₹{summary?.total_portfolio_value?.toLocaleString()}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Cash Balance</span>
              <Wallet className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white">₹{summary?.wallet_balance?.toLocaleString()}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Holdings Value</span>
              <PieChart className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-white">₹{summary?.holdings_value?.toLocaleString()}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm">Positions</span>
              <PieChart className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-white">{summary?.holdings_count || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Top Movers</h2>
            <div className="space-y-4">
              {topMovers.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/trade/${stock.symbol}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{stock.symbol}</p>
                    <p className="text-sm text-slate-400">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">₹{stock.price.toLocaleString()}</p>
                    <p className={`text-sm flex items-center gap-1 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stock.change_percent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/markets"
                className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
                <span className="text-white font-medium">Browse Markets</span>
              </Link>
              <Link
                href="/wallet"
                className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <Wallet className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-white font-medium">Add Funds</span>
              </Link>
              <Link
                href="/orders"
                className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <ArrowRight className="w-8 h-8 text-purple-500 mb-2" />
                <span className="text-white font-medium">View Orders</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
              >
                <PieChart className="w-8 h-8 text-orange-500 mb-2" />
                <span className="text-white font-medium">My Portfolio</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}