import { Router } from 'express';
import { getProfile } from '../controllers/usercontroller.js';
import { authenticate } from '../middlewares/authmiddleware.js';

const router = Router();

router.get('/profile', authenticate, getProfile);

export default router;
