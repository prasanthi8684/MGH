import express from 'express';
import { searchProducts } from '../controllers/searchController.js';
//import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

//router.use(verifyToken);
router.get('/', searchProducts);

export default router;