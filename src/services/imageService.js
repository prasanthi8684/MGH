import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImage = async (file) => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Ensure uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true });

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    const filepath = path.join(uploadsDir, filename);

    // Write file to disk
    await fs.writeFile(filepath, file.buffer);

    // Return the URL that can be used to access the file
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};