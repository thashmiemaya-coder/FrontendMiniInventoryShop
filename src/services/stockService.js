import api from './api';

export const stockService = {
  // Stock In
  addStockIn: (data) => api.post('/stock/in', data),
  getStockInsByItem: (itemId) => api.get(`/stock/in/item/${itemId}`),
  getAllStockIns: () => api.get('/stock/records'),

  // Stock Out
  addStockOut: (data) => api.post('/stock/out', data),
  getStockOutsByItem: (itemId) => api.get(`/stock/out/item/${itemId}`),
  getAllStockOuts: () => api.get('/stock/out/records'), // ← NEW

  // Stock Balance
  getStockBalance: () => api.get('/stock/balance'),
  getLowStockReport: () => api.get('/stock/low-stock'),
};