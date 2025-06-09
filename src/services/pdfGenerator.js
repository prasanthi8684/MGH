import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import fs from 'fs';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadImageToLocal = async (url, filename)=> {
  const localPath = path.join(__dirname, 'temp', filename);
  const response = await axios.get(url, { responseType: 'stream' });

  fs.mkdirSync(path.dirname(localPath), { recursive: true });

  const writer = fs.createWriteStream(localPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(localPath));
    writer.on('error', reject);
  });
};

export async function generateProposalPDF(proposal) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
        info: {
          Title: proposal.name,
          Author: 'MH GLOBAL',
          Subject: 'Business Proposal'
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Cover Page
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill('#1a1a2e');

      // Add background graphics
      doc.save()
         .opacity(0.1);

      // Draw some background shapes
      for (let i = 0; i < 5; i++) {
        doc.circle(Math.random() * doc.page.width, 
                  Math.random() * doc.page.height, 
                  Math.random() * 50 + 20)
           .fill('#ffffff');
      }

      doc.restore();

      // Title
      doc.font('Helvetica-Bold')
         .fontSize(72)
         .fillColor('#ffffff')
         .text('PROPOSAL', 50, doc.page.height / 3, {
           width: doc.page.width - 100,
           align: 'left'
         });

      // Prepared for text
      doc.fontSize(24)
         .fillColor('#ffffff')
         .text('PREPARED FOR', 50, doc.page.height / 2, {
           width: doc.page.width - 100,
           align: 'left'
         });

      // Client name
      doc.fontSize(36)
         .fillColor('#ffffff')
         .text(proposal.clientName.toUpperCase(), 50, doc.page.height / 2 + 40, {
           width: doc.page.width - 100,
           align: 'left'
         });

      // Footer
      doc.fontSize(12)
         .text('Making Ideas Work. Endless Possibilities.', 50, doc.page.height - 100)
         .text('APPARELS • PREMIUM GIFTS • CREATIVE • EVENTS', 50, doc.page.height - 80);

      // Products Pages
      for (const product of proposal.products) {

    
        doc.addPage({ margin: 50 });

        // Product name
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fillColor('#ff0000')
           .text(product.name.toUpperCase(), { continued: true });

        // Specification box
        doc.rect(50, 150, 200, 200)
           .fill('#f5f5f5');

        doc.fontSize(12)
           .fillColor('#000000');

        // Material
        doc.text('MATERIAL: STAINLESS STEEL', 60, 170);

        // Description
        doc.text(product.description, 60, 200, {
          width: 180,
          align: 'left'
        });

        // Specifications
        doc.text(`${product.quantity} PCS`, 60, 280);
        doc.text(`RM ${product.unitPrice.toFixed(2)}`, 60, 300);

        // // Product image
        if (product.image) {
        // const imageResponse = await axios.get(product.image, { responseType: 'arraybuffer' });
// const imageBuffer = Buffer.from(imageResponse.data, 'binary');

// doc.image(imageBuffer, 300, 150, { fit: [250, 250] });


          const imageUrl = product.image;
      //    const ext = path.extname(imageUrl);
      //    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;
      //    const localImagePath = await downloadImageToLocal(imageUrl, filename);
      //    console.log(localImagePath) 
      //    const normalizedPath = localImagePath.replace(/\\/g, "/");
      //   console.log(normalizedPath)
         // doc.image(imageUrl, 300, 150, {
         //    fit: [250, 250],
          
         //  });
            https.get(imageUrl, (res) => {
            doc.pipe(fs.createWriteStream('image-pdf.pdf'));

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
               const buffer = Buffer.concat(chunks);
               doc.image(buffer, 50, 50, { width: 500 });
               doc.end();
            });
            });

        }

        // Price box
        doc.rect(50, 400, 200, 100)
           .fill('#000000');

        doc.fillColor('#ffffff')
           .text('PRICE', 60, 420)
           .fontSize(24)
           .text(`RM ${product.totalPrice.toFixed(2)}`, 60, 450);

        // Production info
        doc.fillColor('#000000')
           .fontSize(12)
           .text('PRODUCTION & DELIVERY', 50, 520)
           .text('LEAD TIME: 10-14 WORKING DAYS', 50, 540);
      }
   
      // Summary Page
      doc.addPage();

      doc.fontSize(24)
         .fillColor('#000000')
         .text('PROPOSAL SUMMARY', 50, 50);

      doc.fontSize(12)
         .text(`Date: ${new Date().toLocaleDateString()}`, 50, 100)
         .text(`Proposal Number: ${proposal._id}`, 50, 120)
         .text(`Total Amount: RM ${proposal.totalAmount.toFixed(2)}`, 50, 140);

      // Terms and conditions
      doc.fontSize(14)
         .text('Terms and Conditions', 50, 200)
         .fontSize(10)
         .text([
           '1. Prices are valid for 30 days from the proposal date.',
           '2. Payment terms: 50% deposit upon confirmation, balance before delivery.',
           '3. Production lead time: 10-14 working days after confirmation.',
           '4. Prices are inclusive of standard packaging and delivery within Peninsular Malaysia.'
         ].join('\n\n'), 50, 230);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}