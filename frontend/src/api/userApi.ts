import axios from 'axios';
import { USERS_BASE } from './config';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  avatar?: string;
}

const API_BASE = USERS_BASE;

export const userApi = {
  async getUsers(): Promise<{ success: boolean; count: number; data: User[] }> {
    const res = await axios.get(API_BASE);
    return res.data;
  },

  async createUser(userData: { name: string; email: string; role: 'ADMIN' | 'EMPLOYEE'; avatar?: string }): Promise<{ success: boolean; data: User }> {
    const res = await axios.post(API_BASE, userData);
    return res.data;
  }
};
