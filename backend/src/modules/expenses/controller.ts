import { Response, NextFunction } from 'express';
import { AuthRequest, ApiError } from '../../types';
import * as service from './service';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { from, to, categoryId, page = 1, limit = 20 } = req.query as any;
    const result = await service.getAll(req.userId!, {
      from, to,
      categoryId: categoryId ? Number(categoryId) : undefined,
      page: Number(page),
      limit: Number(limit),
    });
    res.json(result);
  } catch (err) { next(err); }
};

export const getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id ?? '', 10);
    if (isNaN(id)) throw new ApiError(400, 'BAD_REQUEST', 'Некорректный id');
    const expense = await service.getById(req.userId!, id);
    res.json(expense);
  } catch (err) { next(err); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const expense = await service.create(req.userId!, req.body);
    res.status(201).json(expense);
  } catch (err) { next(err); }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id ?? '', 10);
    if (isNaN(id)) throw new ApiError(400, 'BAD_REQUEST', 'Некорректный id');
    const expense = await service.update(req.userId!, id, req.body);
    res.json(expense);
  } catch (err) { next(err); }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id ?? '', 10);
    if (isNaN(id)) throw new ApiError(400, 'BAD_REQUEST', 'Некорректный id');
    await service.remove(req.userId!, id);
    res.status(204).send();
  } catch (err) { next(err); }
};