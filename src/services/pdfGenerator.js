import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

export async function generateProposalPDF(proposal) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Cover page and other content implementation remains the same
      // For each product's images, use the downloadImage function:
      for (const product of proposal.products) {
        if (product.images && product.images.length > 0) {
          for (const imageUrl of product.images) {
            try {
              const imageBuffer = await downloadImage(imageUrl);
              doc.image(imageBuffer, {
                fit: [200, 200],
                align: 'center'
              });
            } catch (error) {
              console.error(`Error downloading image: ${imageUrl}`, error);
              // Continue with the next image if one fails
              continue;
            }
          }
        }
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}