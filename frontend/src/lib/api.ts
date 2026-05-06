import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const getAuthToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const walletAPI = {
  getWallet: () => api.get('/wallet'),
  deposit: (amount: number) => api.post('/wallet/deposit', { amount }),
  withdraw: (amount: number) => api.post('/wallet/withdraw', { amount }),
  getTransactions: () => api.get('/wallet/transactions'),
};

export const marketAPI = {
  getStocks: () => api.get('/market/stocks'),
  getStock: (symbol: string) => api.get(`/market/stocks/${symbol}`),
  searchStocks: (query: string) => api.get(`/market/search?query=${query}`),
};

export const ordersAPI = {
  createOrder: (order: {
    symbol: string;
    side: string;
    order_type: string;
    quantity: number;
    price?: number;
  }) => api.post('/orders', order),
  getOrders: (status?: string, symbol?: string) =>
    api.get('/orders', { params: { status, symbol } }),
  getOrder: (orderId: string) => api.get(`/orders/${orderId}`),
  cancelOrder: (orderId: string) => api.delete(`/orders/${orderId}`),
};

export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  getSummary: () => api.get('/portfolio/summary'),
};

export default api;