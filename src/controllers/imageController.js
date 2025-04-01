import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImages = (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Generate URLs for uploaded files
    const imageUrls = req.files.map(file => {
      // Create URL path for the uploaded file
      const relativePath = `/uploads/${file.filename}`;
      const fullUrl = `http://localhost:5000${relativePath}`;
      return fullUrl;
    });
    
    res.json({ imageUrls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: error.message });
  }
};