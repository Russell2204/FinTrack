import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100),
  kind: z.enum(['subscription', 'utility', 'groceries', 'rent', 'other']).default('other'),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Цвет должен быть в формате HEX (#RRGGBB)').nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();