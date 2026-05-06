'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { marketAPI, walletAPI, portfolioAPI, ordersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { TrendingUp, TrendingDown, ArrowLeft, ArrowRight } from 'lucide-react';
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

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
  }, [user, symbol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stock) return;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (side === 'sell' && holding && qty > holding.quantity) {
      toast.error('Insufficient holdings');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        symbol,
        side,
        order_type: orderType,
        quantity: qty,
        price: orderType === 'limit' ? parseFloat(limitPrice) : undefined
      };

      await ordersAPI.createOrder(orderData);
      toast.success(`${side === 'buy' ? 'Buy' : 'Sell'} order placed successfully`);

      const [walletRes, portfolioRes] = await Promise.all([
        walletAPI.getWallet(),
        portfolioAPI.getPortfolio()
      ]);
      setWalletBalance(walletRes.data.balance_inr);
      const holdings = portfolioRes.data.holdings || [];
      const held = holdings.find((h: Holding) => h.symbol === symbol);
      setHolding(held || null);

      setQuantity('');
      setLimitPrice('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Order failed';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading || !user || !stock) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalValue = (orderType === 'limit' ? parseFloat(limitPrice) || stock.price : stock.price) * (parseInt(quantity) || 0);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/markets" className="inline-flex items-center text-slate-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white">{stock.symbol}</h1>
                  <p className="text-slate-400">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">₹{stock.price.toLocaleString()}</p>
                  <p className={`flex items-center gap-1 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change_percent.toFixed(2)}%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">High</p>
                  <p className="text-white font-semibold">₹{stock.high.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Low</p>
                  <p className="text-white font-semibold">₹{stock.low.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Volume</p>
                  <p className="text-white font-semibold">{(stock.volume / 1000000).toFixed(1)}M</p>
                </div>
                {holding && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Holdings</p>
                    <p className="text-white font-semibold">{holding.quantity} shares</p>
                  </div>
                )}
              </div>
            </div>

            {holding && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Your Position</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Quantity</p>
                    <p className="text-white font-semibold">{holding.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Avg. Price</p>
                    <p className="text-white font-semibold">₹{holding.avg_buy_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Value</p>
                    <p className="text-white font-semibold">₹{(holding.quantity * stock.price).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Place Order</h2>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSide('buy')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  side === 'buy' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                Buy
              </button>
              <button
                onClick={() => setSide('sell')}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  side === 'sell' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Sell
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setOrderType('market')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  orderType === 'market' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  orderType === 'limit' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Limit
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {orderType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Limit Price (₹)</label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder={stock.price.toString()}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {quantity && (
                <div className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Estimated Total</span>
                    <span className="text-white font-semibold">₹{totalValue.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-slate-400">Available Balance: ₹{walletBalance.toLocaleString()}</p>
              </div>

              <button
                type="submit"
                disabled={submitting || !quantity}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  side === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting ? 'Processing...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}