'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { marketAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Search, Grid3X3, List, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

export default function MarketsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      marketAPI.getStocks()
        .then((res) => setStocks(res.data.stocks || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const filteredStocks = stocks.filter(s => 
    s.symbol.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Sidebar />
        <div className="ml-64 p-8">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-40 rounded-2xl bg-slate-900/50" />
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
              <h1 className="text-3xl font-bold text-white">Markets</h1>
              <p className="text-slate-400">Browse and trade US stocks</p>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search stocks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-800"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-500' : 'bg-slate-900/50 border-slate-800'}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-blue-500' : 'bg-slate-900/50 border-slate-800'}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Stocks Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStocks.map((stock, i) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link href={`/trade/${stock.symbol}`}>
                    <Card className="bg-slate-900/50 border-slate-800/50 hover:border-blue-500/30 hover:bg-slate-800/30 transition-all duration-300 group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-400">{stock.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-white">{stock.symbol}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[120px]">{stock.name}</p>
                            </div>
                          </div>
                          <Badge className={`${stock.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border-0`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                          </Badge>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xl font-bold text-white">₹{stock.price.toLocaleString()}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="flex justify-between mt-3 pt-3 border-t border-slate-800/50">
                          <span className="text-xs text-slate-500">H: ₹{stock.high.toLocaleString()}</span>
                          <span className="text-xs text-slate-500">L: ₹{stock.low.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View */
            <Card className="bg-slate-900/50 border-slate-800/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Symbol</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Name</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Change</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">High</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Low</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-400">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredStocks.map((stock, i) => (
                      <motion.tr 
                        key={stock.symbol}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 + i * 0.03 }}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link href={`/trade/${stock.symbol}`} className="font-medium text-blue-400 hover:text-blue-300">
                            {stock.symbol}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{stock.name}</td>
                        <td className="px-4 py-3 text-right font-medium text-white">₹{stock.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge className={`${stock.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'} border-0`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400">₹{stock.high.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-400">₹{stock.low.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-400">{(stock.volume / 1000000).toFixed(1)}M</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}