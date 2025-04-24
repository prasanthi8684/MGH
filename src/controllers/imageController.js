import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const imageUrls = await Promise.all(req.files.map(async (file) => {
      // Process image with sharp to optimize it
      const optimizedBuffer = await sharp(file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      const filename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      
      await fs.writeFile(filePath, optimizedBuffer);
      
      // Return the URL that can be used to access the image
      const relativePath = `/uploads/${filename}`;
      const fullUrl = `http://localhost:5000${relativePath}`;
      return fullUrl;
    }));
    
    res.json({ imageUrls });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: error.message });
  }
};

export const applyLogoToImage = async (req, res) => {
  try {
    const { productImageUrl, logoUrl } = req.body;
 
    if (!productImageUrl || !logoUrl) {
      return res.status(400).json({ error: 'Product image and logo URLs are required' });
    }

    // Get the file paths from URLs
    const productImagePath = path.join(__dirname, '..', 'uploads', path.basename(productImageUrl));
    const logoPath = path.join(__dirname, '..', 'uploads', path.basename(logoUrl));

    // Read the images
    const productBuffer = await fs.readFile(productImagePath);
    const logoBuffer = await fs.readFile(logoPath);

    // Get product image dimensions
    const productImage = sharp(productBuffer);
    const { width: productWidth, height: productHeight } = await productImage.metadata();

    // Resize logo to be proportional to product image
    const logoWidth = productWidth? Math.round(productWidth * 0.2) : 0; // Logo will be 20% of product width
    const resizedLogo = await sharp(logoBuffer)
      .resize(logoWidth, null, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    // Calculate logo position (bottom right corner with padding)
    const padding = productWidth ? Math.round(productWidth * 0.05) : 0 ; // 5% padding
    const { height: logoHeight } = await sharp(resizedLogo).metadata();
  
    // Composite the images
    const outputBuffer = await sharp(productBuffer)
      .composite([
        {
          input: resizedLogo,
          top: (productHeight && logoHeight) ? productHeight - logoHeight - padding : 0,
          left: productWidth ?  productWidth - logoWidth - padding : 0,
        },
      ])
      .toBuffer();

    // Save the new image
    const newFilename = `logo_${Date.now()}_${path.basename(productImageUrl)}`;
    const newPath = path.join(__dirname, '..', 'uploads', newFilename);
    await fs.writeFile(newPath, outputBuffer);

    const newImageUrl = `http://localhost:5000/uploads/${newFilename}`;
    res.json({ imageUrl: newImageUrl });
  } catch (error) {
    console.error('Error applying logo:', error);
    res.status(500).json({ error: error.message });
  }
};