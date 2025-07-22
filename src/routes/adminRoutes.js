import express from 'express';
import { login } from '../controllers/adminController.js';
import { verifyToken } from '../controllers/adminController.js';
import Product from '../../src/models/Product.js';
import {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  getProductPrice
} from '../controllers/productController.js';
import {
  createCategory,
  getCategories,
  createSubCategory,
  getSubCategories
} from '../controllers/categoryController.js';

import path from 'path';


import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
const s3 = new S3Client({
  region: "sgp1",
  endpoint: "https://sgp1.digitaloceanspaces.com", // for DigitalOcean
  credentials: {
    accessKeyId: 'DO00PVQPVQD6MPQTHFTE',
    secretAccessKey: 'kIUPJJ8hVSY/WHofw69vloVmEpriGX9d9v6RL2XlMck',
  },
});

const router = express.Router();
// const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = /jpeg|jpg|png|gif/;
//     const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedTypes.test(file.mimetype);

//     if (extname && mimetype) {
//       return cb(null, true);
//     }
//     cb(new Error('Only image files are allowed!'));
//   }
// });

 
  const upload = multer({
    storage: multerS3({
      s3: s3, // ✅ Correct S3 instance
      bucket: 'mhg',
      acl: 'public-read',
      key: (req, file, cb) => {
        cb(null, `praposals/${Date.now()}-${file.originalname}`);
      },
    }),
  });
// Auth routes
router.post('/login', login);

// Protected routes
//router.use(verifyToken);

// Product routes
router.post('/products', upload.array('images',10), createProduct);
//router.post('/products', upload.single('images'), createProduct);
// router.get('/products', getProducts);
router.get('/products/:id',  getProduct);
router.delete('/products/:id', deleteProduct);

// Category routes
router.post('/categories', createCategory);
router.get('/products', getProducts);
router.put('/products/:id', upload.single('images'), updateProduct);
router.get('/products/:id', getProductById);
router.get('/products/:id/price', getProductPrice);

router.get('/categories', getCategories);
router.post('/subcategories', createSubCategory);
router.get('/subcategories', getSubCategories);

export default router;