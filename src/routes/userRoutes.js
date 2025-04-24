import express from 'express';
import multer from 'multer';

import {
  updateProfile,
  updateBranding,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress
} from '../controllers/userController.js';

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

// Protected routes - require authentication
//router.use(verifyToken);

// Profile routes
router.put('/profile', upload.single('avatar'), updateProfile);
router.put('/branding', upload.single('logo'), updateBranding);
router.put('/password', updatePassword);

// Address routes
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

export default router;