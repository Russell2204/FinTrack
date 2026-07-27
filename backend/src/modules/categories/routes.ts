import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createCategorySchema, updateCategorySchema } from './schema';
import * as controller from './controller';

const router = Router();

router.use(auth);

router.get('/', controller.getAll);
router.post('/', validate(createCategorySchema), controller.create);
router.patch('/:id', validate(updateCategorySchema), controller.update);
router.delete('/:id', controller.remove);

export default router;