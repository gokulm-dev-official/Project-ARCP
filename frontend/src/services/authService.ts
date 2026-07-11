import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '@/types/auth';

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    const auth = res.data.data;
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth));
    return auth;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const auth = res.data.data;
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth));
    return auth;
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const res = await api.get<ApiResponse<AuthResponse>>('/auth/me');
    return res.data.data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getStoredUser(): AuthResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
};
