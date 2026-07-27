import type { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
}

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  display_name: string | null;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeSourceRow {
  id: number;
  user_id: number;
  name: string;
  type: 'salary' | 'freelance' | 'other';
  is_active: number;
  created_at: string;
}

export interface IncomeRow {
  id: number;
  user_id: number;
  source_id: number | null;
  amount_minor: number;
  currency: string;
  received_at: string;
  note: string | null;
  is_recurring: number;
  recurrence: 'monthly' | 'yearly' | null;
  created_at: string;
}

export interface CategoryRow {
  id: number;
  user_id: number | null;
  name: string;
  kind: 'subscription' | 'utility' | 'groceries' | 'rent' | 'other';
  icon: string | null;
  color: string | null;
}

export interface ExpenseRow {
  id: number;
  user_id: number;
  category_id: number;
  amount_minor: number;
  currency: string;
  spent_at: string;
  description: string | null;
  is_recurring: number;
  recurrence: 'monthly' | 'yearly' | null;
  created_at: string;
}

// API Error класс
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: { field: string; message: string }[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}