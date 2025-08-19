import { Router }from 'express';
const router = Router();

import auth_route from './auth-route.js';
import highscore_route from './highscore-route.js';

router.use('/auth', auth_route);
router.use('/highscore', highscore_route);

export default router;