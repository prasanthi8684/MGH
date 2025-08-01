import express from 'express';
import { register,test, login, getProfile, forgotPassword, resetPassword} from '../controllers/authController.js';
//import { protect } from '../middleware/auth.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/test', test);
router.get('/profile',  getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;