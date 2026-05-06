'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for testing without backend
const DEMO_USER: User = {
  id: "demo-user-123",
  email: "demo@cex.app",
  created_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-login for demo mode
  useEffect(() => {
    setUser(DEMO_USER);
    setLoading(false);
  }, []);

  const login = async (_email: string, _password: string) => {
    setLoading(true);
    // Skip actual auth in demo mode
    setUser(DEMO_USER);
    setLoading(false);
  };

  const register = async (_email: string, _password: string) => {
    setLoading(true);
    // Skip actual auth in demo mode
    setUser(DEMO_USER);
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}