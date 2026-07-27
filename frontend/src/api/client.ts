import axios from 'axios';
import type { AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;

// --- Auth API ---
import type { User } from '../types';

export const authApi = {
  register: (data: { email: string; password: string; displayName?: string }) =>
    client.post<{ user: User; token: string }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    client.post<{ user: User; token: string }>('/auth/login', data),
  me: () => client.get<{ user: User }>('/auth/me'),
};

// --- Income Sources API ---
import type { IncomeSource } from '../types';

export const incomeSourcesApi = {
  getAll: () => client.get<IncomeSource[]>('/income-sources'),
  create: (data: { name: string; type: string }) =>
    client.post<IncomeSource>('/income-sources', data),
  update: (id: number, data: Partial<IncomeSource>) =>
    client.patch<IncomeSource>(`/income-sources/${id}`, data),
  delete: (id: number) => client.delete(`/income-sources/${id}`),
};

// --- Incomes API ---
import type { Income, PaginatedResponse } from '../types';

export const incomesApi = {
  getAll: (params?: Record<string, string | number>) =>
    client.get<PaginatedResponse<Income>>('/incomes', { params }),
  getById: (id: number) => client.get<Income>(`/incomes/${id}`),
  create: (data: any) => client.post<Income>('/incomes', data),
  update: (id: number, data: any) => client.patch<Income>(`/incomes/${id}`, data),
  delete: (id: number) => client.delete(`/incomes/${id}`),
};

// --- Categories API ---
import type { Category } from '../types';

export const categoriesApi = {
  getAll: () => client.get<Category[]>('/categories'),
  create: (data: { name: string; kind?: string; color?: string; icon?: string }) =>
    client.post<Category>('/categories', data),
  update: (id: number, data: Partial<Category>) =>
    client.patch<Category>(`/categories/${id}`, data),
  delete: (id: number) => client.delete(`/categories/${id}`),
};

// --- Expenses API ---
import type { Expense } from '../types';

export const expensesApi = {
  getAll: (params?: Record<string, string | number>) =>
    client.get<PaginatedResponse<Expense>>('/expenses', { params }),
  getById: (id: number) => client.get<Expense>(`/expenses/${id}`),
  create: (data: any) => client.post<Expense>('/expenses', data),
  update: (id: number, data: any) => client.patch<Expense>(`/expenses/${id}`, data),
  delete: (id: number) => client.delete(`/expenses/${id}`),
};

// --- Summary API ---
import type {
  SummaryResponse,
  SummaryByCategoryItem,
  SummaryBySourceItem,
  RecurringResponse,
} from '../types';

export const summaryApi = {
  getSummary: (month: string) =>
    client.get<SummaryResponse>('/summary', { params: { month } }),
  getByCategory: (month: string) =>
    client.get<{ month: string; items: SummaryByCategoryItem[] }>('/summary/by-category', { params: { month } }),
  getBySource: (month: string) =>
    client.get<{ month: string; items: SummaryBySourceItem[] }>('/summary/by-source', { params: { month } }),
  getRecurring: () =>
    client.get<RecurringResponse>('/summary/recurring'),
};