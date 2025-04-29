const { v4: uuidv4 } = require('uuid');

import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
const uploadToSpaces = async (req, res, next) => {
    try {
        if (!req.file) {
          return res.status(400).send('No file uploaded.');
        }
    
        const fileKey = `uploads/${uuidv4()}-${req.file.originalname}`;
    
     
        const s3 = new S3Client({
            region: "blr1",
            endpoint: "https://blr1.digitaloceanspaces.com", // for DigitalOcean
            credentials: {
              accessKeyId: 'DO009UBNGPNULMBAUMGP',
              secretAccessKey: '/BopSX8PXVAYh0Wvky9qyCtmL4WSa6Bk5g0soD3OXCg',
            },
          });
          const uploadResult = multer({
            storage: multerS3({
              s3: s3, // ✅ Correct S3 instance
              bucket: 'mgh',
              acl: 'public-read',
              key: (req, file, cb) => {
                cb(null, `uploads/${Date.now()}-${file.originalname}`);
              },
            }),
          });
    
        // Save the uploaded URL into req.uploadedImageUrl
        req.uploadedImageUrl = uploadResult;
    
        next(); // Move to createProduct controller
      } catch (err) {
        console.error('Upload error:', err);
        res.status(500).send('Upload to Spaces failed.');
      }

}
module.exports = uploadToSpaces;