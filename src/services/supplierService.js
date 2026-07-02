import api from './api';

export const supplierService = {
  getAllSuppliers: () => api.get('/supplier'),
  getSupplierById: (id) => api.get(`/supplier/${id}`),
  createSupplier: (data) => api.post('/supplier', data),
  updateSupplier: (id, data) => api.put(`/supplier/${id}`, data),
  deleteSupplier: (id) => api.delete(`/supplier/${id}`),
  getActiveSuppliers: () => api.get('/supplier/active'),
};