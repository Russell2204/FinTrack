import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';
import env from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details || undefined,
      },
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.nodeEnv === 'production' ? 'Внутренняя ошибка сервера' : err.message,
    },
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Маршрут не найден',
    },
  });
};