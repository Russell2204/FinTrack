import client from '../../db/client';
import { ApiError } from '../../types';
import type { IncomeRow } from '../../types';

interface CreateInput {
  sourceId?: number | null;
  amountMinor: number;
  currency?: string;
  receivedAt: string;
  note?: string | null;
  isRecurring?: boolean;
  recurrence?: 'monthly' | 'yearly' | null;
}

interface UpdateInput extends Partial<CreateInput> {}

interface QueryParams {
  from?: string;
  to?: string;
  sourceId?: number;
  page: number;
  limit: number;
}

const toDTO = (row: IncomeRow) => ({
  id: row.id,
  sourceId: row.source_id,
  amountMinor: row.amount_minor,
  currency: row.currency,
  receivedAt: row.received_at,
  note: row.note,
  isRecurring: row.is_recurring === 1,
  recurrence: row.recurrence,
  createdAt: row.created_at,
});

export const getAll = async (userId: number, params: QueryParams) => {
  let sql = 'SELECT * FROM incomes WHERE user_id = ?';
  const args: (string | number)[] = [userId];

  if (params.from) { sql += ' AND received_at >= ?'; args.push(params.from); }
  if (params.to) { sql += ' AND received_at < ?'; args.push(params.to); }
  if (params.sourceId) { sql += ' AND source_id = ?'; args.push(params.sourceId); }

  const countResult = await client.execute({
    sql: sql.replace('SELECT *', 'SELECT COUNT(*) as total'),
    args,
  });
  const total = Number(countResult.rows[0]!['total']);

  const offset = (params.page - 1) * params.limit;
  sql += ' ORDER BY received_at DESC LIMIT ? OFFSET ?';
  args.push(params.limit, offset);

  const result = await client.execute({ sql, args });
  return {
    items: result.rows.map((r) => toDTO(r as unknown as IncomeRow)),
    page: params.page,
    limit: params.limit,
    total,
  };
};

export const getById = async (userId: number, id: number) => {
  const result = await client.execute({
    sql: 'SELECT * FROM incomes WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
  if (result.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Доход не найден');
  return toDTO(result.rows[0] as unknown as IncomeRow);
};

export const create = async (userId: number, data: CreateInput) => {
  if (data.sourceId) {
    const check = await client.execute({
      sql: 'SELECT id FROM income_sources WHERE id = ? AND user_id = ?',
      args: [data.sourceId, userId],
    });
    if (check.rows.length === 0) throw new ApiError(400, 'BAD_REQUEST', 'Источник не найден');
  }

  await client.execute({
    sql: 'INSERT INTO incomes (user_id, source_id, amount_minor, currency, received_at, note, is_recurring, recurrence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      userId, data.sourceId || null, data.amountMinor, data.currency || 'UZS',
      data.receivedAt, data.note || null,
      data.isRecurring ? 1 : 0,
      data.isRecurring ? data.recurrence || 'monthly' : null,
    ],
  });

  const result = await client.execute('SELECT * FROM incomes WHERE id = last_insert_rowid()');
  return toDTO(result.rows[0] as unknown as IncomeRow);
};

export const update = async (userId: number, id: number, data: UpdateInput) => {
  const check = await client.execute({
    sql: 'SELECT * FROM incomes WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
  if (check.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Доход не найден');
  const existing = check.rows[0] as unknown as IncomeRow;

  if (data.sourceId !== undefined && data.sourceId !== null) {
    const s = await client.execute({
      sql: 'SELECT id FROM income_sources WHERE id = ? AND user_id = ?',
      args: [data.sourceId, userId],
    });
    if (s.rows.length === 0) throw new ApiError(400, 'BAD_REQUEST', 'Источник не найден');
  }

  const fields: string[] = [];
  const values: (string | number | null)[] = [];
  if (data.sourceId !== undefined) { fields.push('source_id = ?'); values.push(data.sourceId); }
  if (data.amountMinor !== undefined) { fields.push('amount_minor = ?'); values.push(data.amountMinor); }
  if (data.currency !== undefined) { fields.push('currency = ?'); values.push(data.currency); }
  if (data.receivedAt !== undefined) { fields.push('received_at = ?'); values.push(data.receivedAt); }
  if (data.note !== undefined) { fields.push('note = ?'); values.push(data.note); }
  if (data.isRecurring !== undefined) {
    fields.push('is_recurring = ?'); values.push(data.isRecurring ? 1 : 0);
    fields.push('recurrence = ?');
    values.push(data.isRecurring ? (data.recurrence || existing.recurrence || 'monthly') : null);
  } else if (data.recurrence !== undefined) { fields.push('recurrence = ?'); values.push(data.recurrence); }

  if (fields.length > 0) {
    values.push(id);
    await client.execute({ sql: `UPDATE incomes SET ${fields.join(', ')} WHERE id = ?`, args: values });
  }

  const result = await client.execute({ sql: 'SELECT * FROM incomes WHERE id = ?', args: [id] });
  return toDTO(result.rows[0] as unknown as IncomeRow);
};

export const remove = async (userId: number, id: number) => {
  const check = await client.execute({
    sql: 'SELECT id FROM incomes WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
  if (check.rows.length === 0) throw new ApiError(404, 'NOT_FOUND', 'Доход не найден');
  await client.execute({ sql: 'DELETE FROM incomes WHERE id = ?', args: [id] });
};
