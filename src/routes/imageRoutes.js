import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadImages, applyLogoToImage } from '../controllers/imageController.js';
import fs from 'fs';
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
const spacesEndpoint = new AWS.Endpoint('https://mgh.blr1.digitaloceanspaces.com'); // use your region

const s3 = new S3Client({
  region: "blr1",
  endpoint: "https://blr1.digitaloceanspaces.com", // for DigitalOcean
  credentials: {
    accessKeyId: 'DO009UBNGPNULMBAUMGP',
    secretAccessKey: '/BopSX8PXVAYh0Wvky9qyCtmL4WSa6Bk5g0soD3OXCg',
  },
});

// const s3 = new AWS.S3({
//   accessKeyId: 'DO009UBNGPNULMBAUMGP',
//   secretAccessKey: '/BopSX8PXVAYh0Wvky9qyCtmL4WSa6Bk5g0soD3OXCg',
//   endpoint: new AWS.Endpoint("https://mgh.blr1.digitaloceanspaces.com", // for DigitalOcean
//   ),
//   region: 'blr1',
// });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


  const upload = multer({
    storage: multerS3({
      s3: s3, // ✅ Correct S3 instance
      bucket: 'mgh',
      acl: 'public-read',
      key: (req, file, cb) => {
        cb(null, `praposals/${Date.now()}-${file.originalname}`);
      },
    }),
  });




router.post('/', upload.array('images', 5), uploadImages);
router.post('/apply-logo', applyLogoToImage);
export default router;


