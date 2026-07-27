import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createIncomeSourceSchema, updateIncomeSourceSchema } from './schema';
import * as controller from './controller';

const router = Router();

router.use(auth);

router.get('/', controller.getAll);
router.post('/', validate(createIncomeSourceSchema), controller.create);
router.patch('/:id', validate(updateIncomeSourceSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;