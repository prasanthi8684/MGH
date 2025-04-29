import express from 'express';
import { createProposal,getAllProposals,getProposalPDF,deleteProposal } from '../controllers/proposalController.js';
const router = express.Router();
import fs from 'fs';
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';

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
        cb(null, `proposals/${Date.now()}-${file.originalname}`);
      },
    }),
  });
router.post('/', upload.array('images', 5), createProposal);
router.get('/', getAllProposals);
router.get('/:id/pdf', getProposalPDF);
router.delete('/:id', deleteProposal);

export default router;