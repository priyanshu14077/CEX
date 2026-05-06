'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { ordersAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  symbol: string;
  side: string;
  order_type: string;
  price: number;
  quantity: number;
  filled_quantity: number;
  status: string;
  created_at: string;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'filled' | 'cancelled'>('all');
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      ordersAPI.getOrders(filter === 'all' ? undefined : filter)
        .then((res) => setOrders(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, filter]);

  const handleCancel = async (orderId: string) => {
    try {
      await ordersAPI.cancelOrder(orderId);
      toast.success('Order cancelled');
      const res = await ordersAPI.getOrders(filter === 'all' ? undefined : filter);
      setOrders(res.data);
      setCancelOrderId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to cancel');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'filled':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      filled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return variants[status] || 'bg-slate-500/10 text-slate-400';
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Sidebar />
        <div className="ml-64 p-8">
          <Skeleton className="h-12 w-48 mb-8 bg-slate-900/50" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl bg-slate-900/50" />
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
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white">Orders</h1>
            <p className="text-slate-400">Track and manage your orders</p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="bg-slate-900/50 border border-slate-800/50">
                {(['all', 'pending', 'filled', 'cancelled'] as const).map((f) => (
                  <TabsTrigger 
                    key={f}
                    value={f}
                    className="capitalize data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Orders List */}
          <AnimatePresence mode="wait">
            {orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-slate-900/50 border-slate-800/50">
                  <CardContent className="py-16 text-center">
                    <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-xl text-slate-400 mb-2">No orders found</p>
                    <p className="text-sm text-slate-500">Place an order from the Markets page</p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="bg-slate-900/50 border-slate-800/50 hover:border-slate-700/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              order.side === 'buy' 
                                ? 'bg-emerald-500/10' 
                                : 'bg-red-500/10'
                            }`}>
                              {order.side === 'buy' ? (
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                              ) : (
                                <TrendingDown className="w-6 h-6 text-red-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-xl font-bold text-white">{order.symbol}</span>
                                <Badge className={`${getStatusBadge(order.status)} border`}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1 capitalize">{order.status}</span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className={`font-medium ${order.side === 'buy' ? 'text-emerald-400' : 'text-red-400'} capitalize`}>
                                  {order.side}
                                </span>
                                <span>•</span>
                                <span className="capitalize">{order.order_type} Order</span>
                                <span>•</span>
                                <span>{order.quantity} shares</span>
                                <span>•</span>
                                <span>₹{order.price?.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-lg font-bold text-white">
                                ₹{(order.price * order.quantity).toLocaleString()}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(order.created_at).toLocaleString()}
                              </p>
                            </div>
                            {order.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCancelOrderId(order.id)}
                                className="text-slate-400 hover:text-red-400 hover:border-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Cancel Confirmation Dialog */}
          <Dialog open={!!cancelOrderId} onOpenChange={() => setCancelOrderId(null)}>
            <DialogContent className="bg-slate-900 border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-white">Cancel Order</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCancelOrderId(null)}
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                >
                  Keep Order
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => cancelOrderId && handleCancel(cancelOrderId)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Cancel Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}