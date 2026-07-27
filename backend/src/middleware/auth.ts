import { Response, NextFunction } from 'express';
import { AuthRequest, ApiError } from '../types';
import { verifyToken } from '../utils/helpers';

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Требуется авторизация');
  }

  const token = authHeader.split(' ')[1]!;

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (err) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Недействительный или истекший токен');
  }
};