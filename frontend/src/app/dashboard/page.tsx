'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import StockCard from '@/components/StockCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { portfolioAPI, marketAPI } from '@/lib/api';
import { Wallet, PieChart, TrendingUp, ArrowRight, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  total_value: number;
  profit_loss: number;
  profit_loss_percent: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [topMovers, setTopMovers] = useState<Stock[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
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
        portfolioAPI.getPortfolio(),
        marketAPI.getStocks()
      ]).then(([summaryRes, portfolioRes, marketRes]) => {
        setSummary(summaryRes.data);
        setHoldings(portfolioRes.data.holdings || []);
        const stocks = marketRes.data.stocks || [];
        const sorted = [...stocks].sort((a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent)).slice(0, 4);
        setTopMovers(sorted);
      }).catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Sidebar />
        <div className="ml-64 p-8">
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl bg-slate-900/50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      <Sidebar />
      <div className="ml-64">
        <main className="p-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-400">Welcome back! Here&apos;s your portfolio overview.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/wallet">
                <Button variant="outline" className="gap-2 bg-slate-900/50 border-slate-800 hover:bg-slate-800">
                  <Plus className="w-4 h-4" />
                  Deposit
                </Button>
              </Link>
              <Link href="/markets">
                <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
                  <TrendingUp className="w-4 h-4" />
                  Trade
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Portfolio"
              value={`₹${(summary?.total_portfolio_value || 0).toLocaleString()}`}
              subtitle="Cash + Holdings"
              icon={PieChart}
              trend="up"
              trendValue="+2.5%"
              delay={0}
            />
            <StatCard
              title="Cash Balance"
              value={`₹${(summary?.wallet_balance || 0).toLocaleString()}`}
              subtitle="Available to trade"
              icon={Wallet}
              delay={0.1}
              gradient="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20"
            />
            <StatCard
              title="Holdings Value"
              value={`₹${(summary?.holdings_value || 0).toLocaleString()}`}
              subtitle={`${summary?.holdings_count || 0} positions`}
              icon={PieChart}
              delay={0.2}
            />
            <StatCard
              title="Today's P/L"
              value="₹0.00"
              subtitle="Coming soon"
              icon={TrendingUp}
              trend="neutral"
              delay={0.3}
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Your Holdings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Your Holdings</CardTitle>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {holdings.length === 0 ? (
                    <div className="text-center py-12">
                      <PieChart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400 mb-4">No holdings yet</p>
                      <Link href="/markets">
                        <Button className="bg-blue-500 hover:bg-blue-600">Start Trading</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {holdings.slice(0, 4).map((holding, i) => (
                        <motion.div
                          key={holding.symbol}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-400">{holding.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-white">{holding.symbol}</p>
                              <p className="text-sm text-slate-400">{holding.quantity} shares</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">₹{holding.total_value.toLocaleString()}</p>
                            <p className={`text-sm ${holding.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {holding.profit_loss >= 0 ? '+' : ''}₹{holding.profit_loss.toLocaleString()} ({holding.profit_loss_percent}%)
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Movers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Top Movers</CardTitle>
                  <Link href="/markets">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topMovers.map((stock, i) => (
                    <StockCard key={stock.symbol} stock={stock} index={i} />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { href: '/markets', label: 'Browse Markets', icon: TrendingUp },
                { href: '/wallet', label: 'Add Funds', icon: Plus },
                { href: '/orders', label: 'View Orders', icon: ArrowRight },
                { href: '/dashboard', label: 'My Portfolio', icon: PieChart },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-blue-500/30 hover:bg-slate-800/30 transition-all duration-300 text-center group">
                    <action.icon className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-300">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}