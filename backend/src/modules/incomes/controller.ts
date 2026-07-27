import { Response, NextFunction } from 'express';
import { AuthRequest, ApiError } from '../../types';
import * as service from './service';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { from, to, sourceId, page = 1, limit = 20 } = req.query as any;
    const result = await service.getAll(req.userId!, {
      from, to,
      sourceId: sourceId ? Number(sourceId) : undefined,
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
    const income = await service.getById(req.userId!, id);
    res.json(income);
  } catch (err) { next(err); }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const income = await service.create(req.userId!, req.body);
    res.status(201).json(income);
  } catch (err) { next(err); }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id ?? '', 10);
    if (isNaN(id)) throw new ApiError(400, 'BAD_REQUEST', 'Некорректный id');
    const income = await service.update(req.userId!, id, req.body);
    res.json(income);
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