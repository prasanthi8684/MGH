// @ts-nocheck
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import praposalRoutes from './src/routes/praposalRoutes.js';
import imageRoutes from './src/routes/imageRoutes.js';
import quotationRoutes from './src/routes/quotationRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
import smartGiftingRoutes from './src/routes/smartGiftingRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/proposals', praposalRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', imageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/smart-gifting', smartGiftingRoutes);
app.use('/api/cart', cartRoutes);
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});