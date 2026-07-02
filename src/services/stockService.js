import api from './api';

export const stockService = {
  addStockIn: (data) => api.post('/stock/in', data),
  addStockOut: (data) => api.post('/stock/out', data),
  getStockBalance: () => api.get('/stock/balance'),
  getLowStockReport: () => api.get('/stock/low-stock'),
  getStockInsByItem: (itemId) => api.get(`/stock/in/item/${itemId}`),
  getStockOutsByItem: (itemId) => api.get(`/stock/out/item/${itemId}`),
};