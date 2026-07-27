import { Router } from 'express';
import { auth } from '../../middleware/auth';
import { validateQuery } from '../../middleware/validate';
import { monthQuerySchema } from './schema';
import * as controller from './controller';

const router = Router();

router.use(auth);

router.get('/', validateQuery(monthQuerySchema), controller.getSummary);
router.get('/by-category', validateQuery(monthQuerySchema), controller.getByCategory);
router.get('/by-source', validateQuery(monthQuerySchema), controller.getBySource);
router.get('/recurring', controller.getRecurring);

export default router;