import axios from 'axios';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  avatar?: string;
}

const API_BASE = 'http://localhost:5000/api/users';

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
