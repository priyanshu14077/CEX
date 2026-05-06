'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, Wallet, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleDemoEnter = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            CEX
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-slate-400 hover:text-white" onClick={handleDemoEnter}>
            Skip to Demo
          </Button>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Simulated Stock Trading Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Trade Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400">Pro</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Experience real-time markets, place orders, and track your portfolio with virtual INR. 
            No money, no risk, pure learning.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full mb-12"
        >
          {[
            { icon: BarChart3, title: 'Live Markets', desc: 'Real-time stock prices from US markets', color: 'blue' },
            { icon: Wallet, title: 'Virtual Wallet', desc: '₹10,000 demo balance to trade with', color: 'emerald' },
            { icon: TrendingUp, title: 'Track Portfolio', desc: 'Monitor holdings and profit/loss', color: 'violet' }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm hover:border-slate-700/50 transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-slate-400">{feature.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <Button 
            onClick={handleDemoEnter}
            size="lg"
            className="h-14 px-8 text-lg bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 border-0 gap-2"
          >
            Enter Demo Platform
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-center text-sm text-slate-500 mt-4">
            No signup required • Instant access • Trade with ₹10,000 virtual INR
          </p>
        </motion.div>

        {/* Quick stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex gap-8 mt-16 text-center"
        >
          {[
            { label: 'Stocks', value: '10+' },
            { label: 'Order Types', value: '2' },
            { label: 'Features', value: '5+' }
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent" />
    </div>
  );
}