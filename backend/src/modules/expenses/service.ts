import client from '../../db/client';
import { ApiError } from '../../types';
import type { ExpenseRow } from '../../types';

interface CreateInput {
  categoryId: number; amountMinor: number; currency?: string; spentAt: string;
  description?: string | null; isRecurring?: boolean; recurrence?: 'monthly' | 'yearly' | null;
}

interface UpdateInput extends Partial<CreateInput> {}

interface QueryParams { from?: string; to?: string; categoryId?: number; page: number; limit: number; }

const toDTO = (row: ExpenseRow) => ({
  id: row.id, categoryId: row.category_id, amountMinor: row.amount_minor,
  currency: row.currency, spentAt: row.spent_at, description: row.description,
  isRecurring: row.is_recurring === 1, recurrence: row.recurrence, createdAt: row.created_at,
});

export const getAll = async (userId: number, params: QueryParams) => {
  let sql = 'SELECT * FROM expenses WHERE user_id = ?';
  const args: (string | number)[] = [userId];
  if (params.from) { sql += ' AND spent_at >= ?'; args.push(params.from); }
  if (params.to) { sql += ' AND spent_at < ?'; args.push(params.to); }
  if (params.categoryId) { sql += ' AND category_id = ?'; args.push(params.categoryId); }

  const countResult = await client.execute({
    sql: sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
    args,
  });
  const total = Number(countResult.rows[0]!['total']);

  const offset = (params.page - 1) * params.limit;
  sql += ' ORDER BY spent_at DESC LIMIT ? OFFSET ?';
  args.push(params.limit, offset);

  const result = await client.execute({ sql, args });
  return {
    items: result.rows.map((r) => toDTO(r as unknown as ExpenseRow)),
    page: params.page,
    limit: params.limit,
    total,
  };
};

export const getById = async (userId: number, id: number) => {
  const result = await client.execute({
    sql: 'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
  if (result.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Расход не найден');
  return toDTO(result.rows[0] as unknown as ExpenseRow);
};

export const create = async (userId: number, data: CreateInput) => {
  const check = await client.execute({
    sql: 'SELECT id FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)',
    args: [data.categoryId, userId],
  });
  if (check.rows.length === 0) throw new ApiError(400, 'BAD_REQUEST', 'Категория не найдена');

  await client.execute({
    sql: 'INSERT INTO expenses (user_id, category_id, amount_minor, currency, spent_at, description, is_recurring, recurrence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      userId, data.categoryId, data.amountMinor, data.currency || 'UZS',
      data.spentAt, data.description || null,
      data.isRecurring ? 1 : 0,
      data.isRecurring ? data.recurrence || 'monthly' : null,
    ],
  });

  const result = await client.execute('SELECT * FROM expenses WHERE id = last_insert_rowid()');
  return toDTO(result.rows[0] as unknown as ExpenseRow);
};

export const update = async (userId: number, id: number, data: UpdateInput) => {
  const check = await client.execute({
    sql: 'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
  if (check.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Расход не найден');
  const existing = check.rows[0] as unknown as ExpenseRow;

  if (data.categoryId !== undefined) {
    const s = await client.execute({
      sql: 'SELECT id FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)',
      args: [data.categoryId, userId],
    });
    if (s.rows.length === 0) throw new ApiError(400, 'BAD_REQUEST', 'Категория не найдена');
  }

  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  if (data.categoryId !== undefined) { fields.push('category_id = ?'); values.push(data.categoryId); }
  if (data.amountMinor !== undefined) { fields.push('amount_minor = ?'); values.push(data.amountMinor); }
  if (data.currency !== undefined) { fields.push('currency = ?'); values.push(data.currency); }
  if (data.spentAt !== undefined) { fields.push('spent_at = ?'); values.push(data.spentAt); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.isRecurring !== undefined) {
    fields.push('is_recurring = ?'); values.push(data.isRecurring ? 1 : 0);
    fields.push('recurrence = ?');
    values.push(data.isRecurring ? (data.recurrence || existing.recurrence || 'monthly') : null);
  } else if (data.recurrence !== undefined) { fields.push('recurrence = ?'); values.push(data.recurrence); }

  if (fields.length > 0) {
    values.push(id);
    await client.execute({ sql: `UPDATE expenses SET ${fields.join(', ')} WHERE id = ?`, args: values });
  }

  const result = await client.execute({ sql: 'SELECT * FROM expenses WHERE id = ?', args: [id] });
  return toDTO(result.rows[0] as unknown as ExpenseRow);
};

export const remove = async (userId: number, id: number) => {
  const check = await client.execute({
    sql: 'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
  if (check.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Расход не найден');
  await client.execute({ sql: 'DELETE FROM expenses WHERE id = ?', args: [id] });
};
