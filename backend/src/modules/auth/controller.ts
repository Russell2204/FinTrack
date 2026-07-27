import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import * as authService from './service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, displayName } = req.body;
    const result = await authService.register({ email, password, displayName });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.getMe(req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
};