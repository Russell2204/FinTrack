export type IncomeSourceType = 'salary' | 'freelance' | 'other';
export type CategoryKind = 'subscription' | 'utility' | 'groceries' | 'rent' | 'other';
export type Recurrence = 'monthly' | 'yearly';

export interface User {
  id: number;
  email: string;
  displayName: string | null;
  defaultCurrency: string;
  createdAt: string;
}

export interface IncomeSource {
  id: number;
  name: string;
  type: IncomeSourceType;
  isActive: boolean;
  createdAt: string;
}

export interface Income {
  id: number;
  sourceId: number | null;
  amountMinor: number;
  currency: string;
  receivedAt: string; // 'YYYY-MM-DD'
  note: string | null;
  isRecurring: boolean;
  recurrence: Recurrence | null;
  createdAt: string;
}

export interface Category {
  id: number;
  userId: number | null; // null → системная
  name: string;
  kind: CategoryKind;
  icon: string | null;
  color: string | null;
}

export interface Expense {
  id: number;
  categoryId: number;
  amountMinor: number;
  currency: string;
  spentAt: string; // 'YYYY-MM-DD'
  description: string | null;
  isRecurring: boolean;
  recurrence: Recurrence | null;
  createdAt: string;
}

// Типы для ответов с пагинацией
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

// Типы для сводки (дашборд)
export interface SummaryResponse {
  month: string;
  currency: string;
  totalIncomeMinor: number;
  totalExpenseMinor: number;
  balanceMinor: number;
}

export interface SummaryByCategoryItem {
  categoryId: number;
  name: string;
  kind: CategoryKind;
  totalMinor: number;
}

export interface SummaryBySourceItem {
  sourceId: number | null;
  name: string;
  totalMinor: number;
}

export interface RecurringItem {
  type: 'expense' | 'income';
  categoryId?: number;
  sourceId?: number;
  name: string;
  amountMinor: number;
  recurrence: Recurrence;
}

export interface RecurringResponse {
  monthlyExpenseMinor: number;
  items: RecurringItem[];
}

// Ошибка API
export interface ApiError {
  code: string;
  message: string;
  details?: { field: string; message: string }[];
}