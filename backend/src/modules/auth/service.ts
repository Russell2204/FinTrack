import client from '../../db/client';
import { hashPassword, comparePassword, generateToken } from '../../utils/helpers';
import { ApiError } from '../../types';
import type { UserRow } from '../../types';

interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const toUserDTO = (row: UserRow) => ({
  id: row.id,
  email: row.email,
  displayName: row.display_name,
  defaultCurrency: row.default_currency,
  createdAt: row.created_at,
});

export const register = async (input: RegisterInput) => {
  const existing = await client.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [input.email],
  });

  if (existing.rows.length > 0) {
    throw new ApiError(409, 'CONFLICT', 'Пользователь с таким email уже существует');
  }

  const passwordHash = hashPassword(input.password);
  await client.execute({
    sql: 'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
    args: [input.email, passwordHash, input.displayName || null],
  });

  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [input.email],
  });
  const user = result.rows[0] as unknown as UserRow;
  const token = generateToken(user.id);

  return { user: toUserDTO(user), token };
};

export const login = async (input: LoginInput) => {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [input.email],
  });

  if (result.rows.length === 0) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Неверный email или пароль');
  }

  const user = result.rows[0] as unknown as UserRow;

  if (!comparePassword(input.password, user.password_hash)) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Неверный email или пароль');
  }

  const token = generateToken(user.id);
  return { user: toUserDTO(user), token };
};

export const getMe = async (userId: number) => {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [userId],
  });

  if (result.rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'Пользователь не найден');
  }

  const user = result.rows[0] as unknown as UserRow;
  return { user: toUserDTO(user) };
};
