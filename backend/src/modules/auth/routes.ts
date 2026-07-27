import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { auth } from '../../middleware/auth';
import { registerSchema, loginSchema } from './schema';
import * as controller from './controller';

const router = Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.get('/me', auth, controller.me);

export default router;