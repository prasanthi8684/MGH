import express from 'express';
import multer from 'multer';
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  downloadQuotationPDF,
  deleteQuotation
} from '../controllers/quotationController.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Apply authentication middleware

//router.post('/', upload.array('images', 15), createQuotation);
router.post('/',  createQuotation);
router.get('/', getQuotations);
router.get('/:id', getQuotationById);
router.get('/:id/pdf', downloadQuotationPDF);
router.delete('/:id', deleteQuotation);

export default router;