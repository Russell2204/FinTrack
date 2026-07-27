import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate, validateQuery } from '../../middleware/validate';
import { createIncomeSchema, updateIncomeSchema, incomeQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();
router.use(auth);

router.get('/', validateQuery(incomeQuerySchema), controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createIncomeSchema), controller.create);
router.patch('/:id', validate(updateIncomeSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;