import express from 'express';
import { login } from '../controllers/adminController.js';
import { verifyToken } from '../controllers/adminController.js';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProduct
} from '../controllers/productController.js';
import {
  createCategory,
  getCategories,
  createSubCategory,
  getSubCategories
} from '../controllers/categoryController.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Auth routes
router.post('/login', login);

// Protected routes
//router.use(verifyToken);

// Product routes
router.post('/products', upload.array('images', 5), createProduct);
router.get('/products', getProducts);
router.get('/products/:id',  getProduct);
router.put('/products/:id', upload.array('images', 5), updateProduct);
router.delete('/products/:id', deleteProduct);

// Category routes
router.post('/categories', createCategory);
router.get('/categories', getCategories);
router.post('/subcategories', createSubCategory);
router.get('/subcategories', getSubCategories);

export default router;