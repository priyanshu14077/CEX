'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { walletAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Wallet, ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  created_at: string;
}

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');

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

    try {
      if (action === 'deposit') {
        await walletAPI.deposit(numAmount);
        toast.success(`Deposited ₹${numAmount.toLocaleString()}`);
      } else {
        await walletAPI.withdraw(numAmount);
        toast.success(`Withdrawn ₹${numAmount.toLocaleString()}`);
      }
      const walletRes = await walletAPI.getWallet();
      setBalance(walletRes.data.balance_inr);
      const txRes = await walletAPI.getTransactions();
      setTransactions(txRes.data);
      setAmount('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      toast.error(errorMessage);
    }
  };

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
        <h1 className="text-2xl font-bold text-white mb-8">Wallet</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <Wallet className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Available Balance</p>
                <p className="text-3xl font-bold text-white">₹{balance.toLocaleString()}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAction('deposit')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    action === 'deposit'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setAction('withdraw')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    action === 'withdraw'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  action === 'deposit'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {action === 'deposit' ? 'Deposit' : 'Withdraw'} INR
              </button>
            </form>

            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-400">
                This is a simulated wallet. Use any amount for testing. Real money is not involved.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-semibold text-white">Transaction History</h2>
            </div>

            {transactions.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
                        {tx.type === 'deposit' ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{tx.type}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}