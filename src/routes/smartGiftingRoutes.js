import express from 'express';
import { getAIRecommendations,getSmartRecommendations } from '../controllers/smartGiftingController.js';
//import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

//router.use(verifyToken);
router.get('/recommendations', getSmartRecommendations);

export default router;