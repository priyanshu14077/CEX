'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import OrderForm from '@/components/OrderForm';
import { marketAPI, walletAPI, portfolioAPI, ordersAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowLeft, Wallet, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  volume: number;
}

interface Holding {
  symbol: string;
  quantity: number;
  avg_buy_price: number;
}

export default function TradePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const symbol = params.symbol as string;

  const [stock, setStock] = useState<Stock | null>(null);
  const [holding, setHolding] = useState<Holding | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && symbol) {
      Promise.all([
        marketAPI.getStock(symbol),
        walletAPI.getWallet(),
        portfolioAPI.getPortfolio()
      ]).then(([stockRes, walletRes, portfolioRes]) => {
        setStock(stockRes.data);
        setWalletBalance(walletRes.data.balance_inr);
        
        const holdings = portfolioRes.data.holdings || [];
        const held = holdings.find((h: Holding) => h.symbol === symbol);
        setHolding(held || null);
      }).catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [user, symbol, orderPlaced]);

  const handleOrderPlaced = () => {
    setOrderPlaced(prev => prev + 1);
    // Refresh data
    Promise.all([
      walletAPI.getWallet(),
      portfolioAPI.getPortfolio()
    ]).then(([walletRes, portfolioRes]) => {
      setWalletBalance(walletRes.data.balance_inr);
      const holdings = portfolioRes.data.holdings || [];
      const held = holdings.find((h: Holding) => h.symbol === symbol);
      setHolding(held || null);
    });
  };

  if (authLoading || loading || !user || !stock) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Sidebar />
        <div className="ml-64 p-8">
          <Skeleton className="h-8 w-32 mb-8 bg-slate-900/50" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-2xl bg-slate-900/50" />
            <Skeleton className="h-96 rounded-2xl bg-slate-900/50" />
            <Skeleton className="h-96 rounded-2xl bg-slate-900/50" />
          </div>
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;

  return (
    <div className="min-h-screen bg-[#020617]">
      <Sidebar />
      <div className="ml-64">
        <main className="p-8">
          {/* Back button */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/markets">
              <Button variant="ghost" className="gap-2 text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
                Back to Markets
              </Button>
            </Link>
          </motion.div>

          {/* Stock Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between mb-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-400">{symbol.slice(0, 2)}</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{symbol}</h1>
                <p className="text-lg text-slate-400">{stock.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-white">₹{stock.price.toLocaleString()}</p>
              <div className={`flex items-center gap-2 justify-end mt-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="text-lg font-medium">
                  {isPositive ? '+' : ''}₹{stock.change.toFixed(2)} ({stock.change_percent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'High', value: `₹${stock.high.toLocaleString()}`, icon: TrendingUp },
              { label: 'Low', value: `₹${stock.low.toLocaleString()}`, icon: TrendingDown },
              { label: 'Volume', value: `${(stock.volume / 1000000).toFixed(1)}M`, icon: BarChart3 },
              { label: 'Wallet', value: `₹${walletBalance.toLocaleString()}`, icon: Wallet },
            ].map((stat, i) => (
              <Card key={stat.label} className="bg-slate-900/50 border-slate-800/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                      <p className="text-lg font-semibold text-white">{stat.value}</p>
                    </div>
                    <stat.icon className="w-5 h-5 text-slate-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Your Position */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Your Position</CardTitle>
                </CardHeader>
                <CardContent>
                  {holding ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Quantity</span>
                        <span className="font-medium text-white">{holding.quantity} shares</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg. Price</span>
                        <span className="font-medium text-white">₹{holding.avg_buy_price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Value</span>
                        <span className="font-medium text-white">₹{(holding.quantity * stock.price).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-4 border-t border-slate-800/50">
                        <span className="text-slate-400">Unrealized P/L</span>
                        <span className={`font-medium ${
                          (stock.price - holding.avg_buy_price) * holding.quantity >= 0 
                            ? 'text-emerald-400' 
                            : 'text-red-400'
                        }`}>
                          {((stock.price - holding.avg_buy_price) * holding.quantity) >= 0 ? '+' : ''}
                          ₹{((stock.price - holding.avg_buy_price) * holding.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400 mb-4">You don&apos;t own any {symbol}</p>
                      <Link href="/markets">
                        <Button className="bg-blue-500 hover:bg-blue-600">Buy Now</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <OrderForm 
                symbol={symbol} 
                price={stock.price} 
                onOrderPlaced={handleOrderPlaced}
              />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}