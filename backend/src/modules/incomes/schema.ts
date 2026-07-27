import { z } from 'zod';

export const createIncomeSchema = z.object({
  sourceId: z.number().int().positive().nullable().optional(),
  amountMinor: z.number().int().positive('Сумма должна быть положительным числом'),
  currency: z.string().length(3).default('UZS'),
  receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат даты: YYYY-MM-DD'),
  note: z.string().max(500).nullable().optional(),
  isRecurring: z.boolean().default(false),
  recurrence: z.enum(['monthly', 'yearly']).nullable().optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export const incomeQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sourceId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});