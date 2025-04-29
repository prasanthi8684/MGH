import express from 'express';
import multer from 'multer';

import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';

import {
  updateProfile,
  updateBranding,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  getProfile
} from '../controllers/userController.js';

const router = express.Router();

const s3 = new S3Client({
  region: "blr1",
  endpoint: "https://blr1.digitaloceanspaces.com", // for DigitalOcean
  credentials: {
    accessKeyId: 'DO009UBNGPNULMBAUMGP',
    secretAccessKey: '/BopSX8PXVAYh0Wvky9qyCtmL4WSa6Bk5g0soD3OXCg',
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3, // ✅ Correct S3 instance
    bucket: 'mgh',
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, `profile/${Date.now()}-${file.originalname}`);
    },
  }),
});
router.put('/profile', upload.single('avatar'), updateProfile);
router.post('/profile', getProfile);
router.put('/branding', upload.single('logo'), updateBranding);
router.put('/password', updatePassword);

// Address routes
router.post('/addresses', addAddress);
router.put('/addresses/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

export default router;