import { Response, NextFunction } from 'express';
import { AuthRequest, ApiError } from '../../types';
import * as service from './service';

export const getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sources = await service.getAll(req.userId!);
    res.json(sources);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const source = await service.create(req.userId!, req.body);
    res.status(201).json(source);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id ?? '', 10);
    if (isNaN(id)) throw new ApiError(400, 'BAD_REQUEST', 'Некорректный id');
    const source = await service.update(req.userId!, id, req.body);
    res.json(source);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id ?? '', 10);
    if (isNaN(id)) throw new ApiError(400, 'BAD_REQUEST', 'Некорректный id');
    await service.remove(req.userId!, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};