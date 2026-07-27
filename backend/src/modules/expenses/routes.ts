import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate, validateQuery } from '../../middleware/validate';
import { createExpenseSchema, updateExpenseSchema, expenseQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();

router.use(auth);

router.get('/', validateQuery(expenseQuerySchema), controller.getAll);
router.get('/:id', controller.getById);
router.post('/', validate(createExpenseSchema), controller.create);
router.patch('/:id', validate(updateExpenseSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;