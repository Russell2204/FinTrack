import client from '../../db/client';
import { ApiError } from '../../types';
import type { CategoryRow } from '../../types';

interface CreateInput {
  name: string; kind?: string; icon?: string | null; color?: string | null;
}

const toDTO = (row: CategoryRow) => ({
  id: row.id, userId: row.user_id, name: row.name, kind: row.kind, icon: row.icon, color: row.color,
});

export const getAll = async (userId: number) => {
  const result = await client.execute({
    sql: 'SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY user_id NULLS FIRST, name',
    args: [userId],
  });
  return result.rows.map((row) => toDTO(row as unknown as CategoryRow));
};

export const create = async (userId: number, data: CreateInput) => {
  await client.execute({
    sql: 'INSERT INTO categories (user_id, name, kind, icon, color) VALUES (?, ?, ?, ?, ?)',
    args: [userId, data.name, data.kind || 'other', data.icon || null, data.color || null],
  });
  const result = await client.execute('SELECT * FROM categories WHERE id = last_insert_rowid()');
  return toDTO(result.rows[0] as unknown as CategoryRow);
};

export const update = async (userId: number, id: number, data: Partial<CreateInput>) => {
  const check = await client.execute({
    sql: 'SELECT * FROM categories WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });

  if (check.rows.length === 0) {
    const sys = await client.execute({
      sql: 'SELECT id FROM categories WHERE id = ? AND user_id IS NULL',
      args: [id],
    });
    if (sys.rows.length > 0) throw new ApiError(403, 'FORBIDDEN', 'Нельзя изменить системную категорию');
    throw new ApiError(404, 'NOT_FOUND', 'Категория не найдена');
  }

  const fields: string[] = [];
  const values: (string | null)[] = [];
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.kind !== undefined) { fields.push('kind = ?'); values.push(data.kind); }
  if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
  if (fields.length > 0) {
    values.push(String(id));
    await client.execute({ sql: `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, args: values });
  }

  const result = await client.execute({ sql: 'SELECT * FROM categories WHERE id = ?', args: [id] });
  return toDTO(result.rows[0] as unknown as CategoryRow);
};

export const remove = async (userId: number, id: number) => {
  const check = await client.execute({
    sql: 'SELECT * FROM categories WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });

  if (check.rows.length === 0) {
    const sys = await client.execute({
      sql: 'SELECT id FROM categories WHERE id = ? AND user_id IS NULL',
      args: [id],
    });
    if (sys.rows.length > 0) throw new ApiError(403, 'FORBIDDEN', 'Нельзя удалить системную категорию');
    throw new ApiError(404, 'NOT_FOUND', 'Категория не найдена');
  }

  const linked = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM expenses WHERE category_id = ?',
    args: [id],
  });
  if (Number(linked.rows[0]!['count']) > 0) {
    throw new ApiError(409, 'CONFLICT', 'Нельзя удалить категорию с расходами');
  }

  await client.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id] });
};
