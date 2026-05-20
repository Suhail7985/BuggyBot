import api from './api';
import { User } from '@/types';

export const authService = {
  async register(data: { name: string; email: string; password: string }): Promise<User> {
    const res = await api.post('/auth/register', data);
    return res.data.user;
  },

  async login(data: { email: string; password: string }): Promise<User> {
    const res = await api.post('/auth/login', data);
    return res.data.user;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  async refresh(): Promise<User> {
    const res = await api.post('/auth/refresh');
    return res.data.user;
  },
};
