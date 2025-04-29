import express from 'express';
import { getAIRecommendations } from '../controllers/smartGiftingController.js';
//import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

//router.use(verifyToken);
router.get('/recommendations', getAIRecommendations);

export default router;