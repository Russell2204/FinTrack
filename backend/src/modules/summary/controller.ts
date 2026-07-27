import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import * as service from './service';

export const getSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { month } = req.query as { month: string };
    const result = await service.getSummary(req.userId!, month);
    res.json(result);
  } catch (err) { next(err); }
};

export const getByCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { month } = req.query as { month: string };
    const result = await service.getByCategory(req.userId!, month);
    res.json(result);
  } catch (err) { next(err); }
};

export const getBySource = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { month } = req.query as { month: string };
    const result = await service.getBySource(req.userId!, month);
    res.json(result);
  } catch (err) { next(err); }
};

export const getRecurring = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await service.getRecurring(req.userId!);
    res.json(result);
  } catch (err) { next(err); }
};