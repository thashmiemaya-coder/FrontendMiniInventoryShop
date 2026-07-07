import api from './api';

export const userService = {
  login: (data) => api.post('/user/login', data),
  register: (data) => api.post('/user/register', data),
  getUserById: (id) => api.get(`/user/${id}`),
  getUserByEmail: (email) => api.get(`/user/email/${email}`),
};