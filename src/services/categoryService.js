import api from './api';

export const categoryService = {
  getAllCategories: () => api.get('/category'),
  getCategoryById: (id) => api.get(`/category/${id}`),
  createCategory: (data) => api.post('/category', data),
  updateCategory: (id, data) => api.put(`/category/${id}`, data),
  deleteCategory: (id) => api.delete(`/category/${id}`),
  getActiveCategories: () => api.get('/category/active'),
};