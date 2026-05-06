'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/Sidebar';
import { walletAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  created_at: string;
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      Promise.all([
        walletAPI.getWallet(),
        walletAPI.getTransactions()
      ]).then(([walletRes, txRes]) => {
        setBalance(walletRes.data.balance_inr);
        setTransactions(txRes.data);
      }).catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      if (action === 'deposit') {
        await walletAPI.deposit(numAmount);
        toast.success(`Deposited ₹${numAmount.toLocaleString()}`);
      } else {
        if (numAmount > balance) {
          toast.error('Insufficient balance');
          setSubmitting(false);
          return;
        }
        await walletAPI.withdraw(numAmount);
        toast.success(`Withdrawn ₹${numAmount.toLocaleString()}`);
      }
      const walletRes = await walletAPI.getWallet();
      setBalance(walletRes.data.balance_inr);
      const txRes = await walletAPI.getTransactions();
      setTransactions(txRes.data);
      setAmount('');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <Sidebar />
        <div className="ml-64 p-8">
          <Skeleton className="h-48 w-full rounded-2xl mb-8 bg-slate-900/50" />
          <Skeleton className="h-64 w-full rounded-2xl bg-slate-900/50" />
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
            <h1 className="text-3xl font-bold text-white">Wallet</h1>
            <p className="text-slate-400">Manage your virtual INR balance</p>
          </motion.div>

          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-blue-600 via-blue-500 to-violet-600 border-0 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-white/20">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Available Balance</p>
                      <p className="text-xs text-blue-200">Virtual INR for testing</p>
                    </div>
                  </div>
                  <Badge className="bg-white/20 text-white border-0">Demo</Badge>
                </div>
                <p className="text-5xl font-bold text-white mb-2">₹{balance.toLocaleString()}</p>
                <p className="text-blue-200 text-sm">Use this for testing trades</p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Deposit/Withdraw Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Add or Withdraw Funds</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="deposit" onValueChange={(v) => setAction(v as 'deposit' | 'withdraw')} className="mb-6">
                    <TabsList className="w-full bg-slate-800/50">
                      <TabsTrigger 
                        value="deposit" 
                        className="flex-1 gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                      >
                        <Plus className="w-4 h-4" />
                        Deposit
                      </TabsTrigger>
                      <TabsTrigger 
                        value="withdraw" 
                        className="flex-1 gap-2 data-[state=active]:bg-red-500 data-[state=active]:text-white"
                      >
                        <Minus className="w-4 h-4" />
                        Withdraw
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Amount (INR)</label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="bg-slate-800/50 border-slate-700"
                      />
                    </div>

                    <div className="flex gap-2">
                      {[1000, 5000, 10000, 50000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAmount(val.toString())}
                          className="flex-1 py-2 rounded-lg text-sm font-medium bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                        >
                          ₹{val.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting || !amount}
                      className={`w-full h-12 text-base font-semibold ${
                        action === 'deposit'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                      }`}
                    >
                      {submitting ? 'Processing...' : action === 'deposit' ? 'Deposit INR' : 'Withdraw INR'}
                    </Button>

                    <p className="text-xs text-slate-500 text-center">
                      This is a simulated wallet. No real money is involved.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Transaction History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-slate-900/50 border-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No transactions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {transactions.map((tx, i) => (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              tx.type === 'deposit' 
                                ? 'bg-emerald-500/10' 
                                : 'bg-red-500/10'
                            }`}>
                              {tx.type === 'deposit' ? (
                                <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <ArrowUpRight className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white capitalize">{tx.type}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(tx.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className={`font-semibold ${
                            tx.type === 'deposit' 
                              ? 'text-emerald-400' 
                              : 'text-red-400'
                          }`}>
                            {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}