import client from '../../db/client';
import { ApiError } from '../../types';
import type { IncomeSourceRow } from '../../types';

const toDTO = (row: IncomeSourceRow) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  isActive: row.is_active === 1,
  createdAt: row.created_at,
});

export const getAll = async (userId: number) => {
  const result = await client.execute({
    sql: 'SELECT * FROM income_sources WHERE user_id = ? ORDER BY created_at DESC',
    args: [userId],
  });
  return result.rows.map((row) => toDTO(row as unknown as IncomeSourceRow));
};

export const create = async (userId: number, data: { name: string; type: string }) => {
  await client.execute({
    sql: 'INSERT INTO income_sources (user_id, name, type) VALUES (?, ?, ?)',
    args: [userId, data.name, data.type],
  });

  const result = await client.execute('SELECT * FROM income_sources WHERE id = last_insert_rowid()');
  return toDTO(result.rows[0] as unknown as IncomeSourceRow);
};

export const update = async (userId: number, id: number, data: { name?: string; type?: string; isActive?: boolean }) => {
  const check = await client.execute({
    sql: 'SELECT * FROM income_sources WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });

  if (check.rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'Источник не найден');
  }

  const existing = check.rows[0] as unknown as IncomeSourceRow;
  const name = data.name ?? existing.name;
  const type = data.type ?? existing.type;
  const isActive = data.isActive !== undefined ? (data.isActive ? 1 : 0) : existing.is_active;

  await client.execute({
    sql: 'UPDATE income_sources SET name = ?, type = ?, is_active = ? WHERE id = ?',
    args: [name, type, isActive, id],
  });

  const result = await client.execute({ sql: 'SELECT * FROM income_sources WHERE id = ?', args: [id] });
  return toDTO(result.rows[0] as unknown as IncomeSourceRow);
};

export const remove = async (userId: number, id: number) => {
  const check = await client.execute({
    sql: 'SELECT id FROM income_sources WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });

  if (check.rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'Источник не найден');
  }

  await client.execute({ sql: 'DELETE FROM income_sources WHERE id = ?', args: [id] });
};
