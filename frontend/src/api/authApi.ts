import axios from 'axios';
import { User } from './userApi';

const AUTH_BASE = 'http://localhost:5000/api/auth';

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: User;
  };
  error?: string;
}

export const authApi = {
  async register(data: { name: string; email: string; password: string; role?: 'ADMIN' | 'EMPLOYEE' }): Promise<AuthResponse> {
    const res = await axios.post(`${AUTH_BASE}/register`, data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await axios.post(`${AUTH_BASE}/login`, data);
    return res.data;
  },

  async getMe(token: string): Promise<{ success: boolean; data: User }> {
    const res = await axios.get(`${AUTH_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};
