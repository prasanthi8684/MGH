import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import praposalRoutes from './src/routes/praposalRoutes.js';
import imageRoutes from './src/routes/imageRoutes.js';

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/proposals', praposalRoutes);
app.use('/api/upload', imageRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});