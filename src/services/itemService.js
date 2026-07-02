import api from './api';

export const itemService = {
  getAllItems: () => api.get('/item'),
  getItemById: (id) => api.get(`/item/${id}`),
  createItem: (data) => api.post('/item', data),
  updateItem: (id, data) => api.put(`/item/${id}`, data),
  deleteItem: (id) => api.delete(`/item/${id}`),
  searchItems: (keyword) => api.get(`/item/search?keyword=${keyword}`),
  getLowStockItems: () => api.get('/item/low-stock'),
};