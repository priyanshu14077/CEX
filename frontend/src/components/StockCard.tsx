'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

interface StockCardProps {
  stock: Stock;
  index?: number;
}

export default function StockCard({ stock, index = 0 }: StockCardProps) {
  const isPositive = stock.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/trade/${stock.symbol}`}>
        <div className="group p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 hover:border-blue-500/30 hover:bg-slate-800/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-400">{stock.symbol.slice(0, 2)}</span>
              </div>
              <div>
                <p className="font-semibold text-white">{stock.symbol}</p>
                <p className="text-xs text-slate-400">{stock.name}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-bold text-white">₹{stock.price.toLocaleString()}</p>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
              isPositive 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}{stock.change_percent.toFixed(2)}%
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}