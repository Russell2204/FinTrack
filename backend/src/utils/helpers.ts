import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import env from '../config/env';

// JWT
export const generateToken = (userId: number): string => {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): { sub: number } => {
  const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
  return { sub: Number(decoded.sub) };
};

// Пароли
export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, env.bcryptRounds);
};

export const comparePassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash);
};

// Даты: получить границы месяца
export const getMonthRange = (month: string) => {
  const parts = month.split('-').map(Number);
  const year = parts[0]!;
  const monthNum = parts[1]!;
  const from = `${year}-${String(monthNum).padStart(2, '0')}-01`;
  const nextMonth = new Date(year, monthNum, 1);
  const to = nextMonth.toISOString().split('T')[0];
  return { from, to: to! };
};