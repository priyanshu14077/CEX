'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ordersAPI, walletAPI } from '@/lib/api';
import { toast } from 'sonner';

interface OrderFormProps {
  symbol: string;
  price: number;
  onOrderPlaced?: () => void;
}

export default function OrderForm({ symbol, price, onOrderPlaced }: OrderFormProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const qty = parseInt(quantity) || 0;
  const effectivePrice = orderType === 'limit' ? (parseFloat(limitPrice) || price) : price;
  const total = qty * effectivePrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || qty <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      await ordersAPI.createOrder({
        symbol,
        side,
        order_type: orderType,
        quantity: qty,
        price: orderType === 'limit' ? parseFloat(limitPrice) : undefined
      });
      
      toast.success(`${side === 'buy' ? 'Bought' : 'Sold'} ${qty} ${symbol}`);
      setQuantity('');
      setLimitPrice('');
      onOrderPlaced?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  const setPercentage = (pct: number) => {
    const maxQty = Math.floor(10000 / price);
    setQuantity(Math.floor(maxQty * pct).toString());
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/50">
      <h3 className="text-lg font-semibold text-white mb-4">Place Order</h3>

      <Tabs defaultValue="buy" onValueChange={(v) => setSide(v as 'buy' | 'sell')} className="mb-4">
        <TabsList className="w-full grid grid-cols-2 bg-slate-800/50">
          <TabsTrigger 
            value="buy" 
            className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
          >
            Buy
          </TabsTrigger>
          <TabsTrigger 
            value="sell" 
            className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
          >
            Sell
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setOrderType('market')}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
            orderType === 'market'
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          )}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
            orderType === 'limit'
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          )}
        >
          Limit
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {orderType === 'limit' && (
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Limit Price (₹)</label>
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={price.toString()}
              className="bg-slate-800/50 border-slate-700"
            />
          </div>
        )}

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Quantity</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
            className="bg-slate-800/50 border-slate-700"
          />
        </div>

        <div className="flex gap-2">
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setPercentage(pct)}
              className="flex-1 py-2 rounded-lg text-xs font-medium bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
            >
              {pct * 100}%
            </button>
          ))}
        </div>

        {quantity && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50"
          >
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Estimated Total</span>
              <span className="font-semibold text-white">₹{total.toLocaleString()}</span>
            </div>
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={loading || !quantity}
          className={cn(
            "w-full h-12 text-base font-semibold",
            side === 'buy' 
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700" 
              : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          )}
        >
          {loading ? 'Processing...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
        </Button>
      </form>
    </div>
  );
}