import express from 'express';
import { upload } from '../config/s3.js';
import { S3Client } from '@aws-sdk/client-s3';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductPrice
} from '../controllers/productController.js';
//import { verifyToken } from '../middleware/auth.js';
const s3 = new S3Client({
  region: "sgp1",
  endpoint: "https://sgp1.digitaloceanspaces.com", // for DigitalOcean
  credentials: {
    accessKeyId: 'DO00PVQPVQD6MPQTHFTE',
    secretAccessKey: 'kIUPJJ8hVSY/WHofw69vloVmEpriGX9d9v6RL2XlMck',
  },
});
const router = express.Router();

// Apply authentication middleware
//router.use(verifyToken);

// Routes with file upload
router.post('/', upload.array('images', 5), createProduct);
router.put('/:id', upload.array('images', 5), updateProduct);

// Other routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/price', getProductPrice);
router.delete('/:id', deleteProduct);

export default router;