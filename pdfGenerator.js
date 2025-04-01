import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateProposalPDF(proposal) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: proposal.name,
          Author: 'MH GLOBAL',
          Subject: 'Business Proposal'
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cover Page
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill('#f5f5f5');

      // Logo
    //  const logoPath = path.join(__dirname, '../public/logo.png');
    //  doc.image(logoPath, doc.page.width - 200, 50, { width: 150 });

      // Title
      doc.fontSize(48)
         .fillColor('white')
         .text('PROPOSAL', 50, doc.page.height / 2 - 100, {
           width: doc.page.width - 100,
           align: 'center'
         });

      // Client name
      doc.fontSize(24)
         .fillColor('#1a237e')
         .text(`PREPARED FOR ${proposal.clientName.toUpperCase()}`, 50, doc.page.height / 2, {
           width: doc.page.width - 100,
           align: 'center'
         });

      // Footer
      doc.fontSize(12)
         .fillColor('#757575')
         .text('Making Ideas Work. Endless Possibilities.', 50, doc.page.height - 100)
         .text('APPARELS • PREMIUM GIFTS • CREATIVE • EVENTS', 50, doc.page.height - 80);

      // Product Pages
      proposal.products.forEach((product, index) => {
        doc.addPage();

        // Product Name
        doc.fontSize(24)
           .fillColor('#ff0000')
           .text(product.name.toUpperCase(), 50, 50);

        // Specifications Section
        doc.fontSize(14)
           .fillColor('#000')
           .text('SPECIFICATION', 50, 120);

        // Black rectangle for specification header
        doc.rect(50, 140, 30, 160)
           .fill('#000');

        // Specification text rotated
        doc.save()
           .translate(65, 280)
           .rotate(-90)
           .fontSize(12)
           .fillColor('#fff')
           .text('SPECIFICATION', 0, 0)
           .restore();

        // Specification content
        doc.fontSize(12)
           .fillColor('#000')
           .text(product.description, 90, 140, {
             width: 300,
             lineGap: 5
           });

        // Product Images
        if (product.images && product.images.length > 0) {
          // Main product image
          doc.image(product.images[0], 90, 320, {
            fit: [200, 200],
            align: 'center'
          });

          // Additional images if available
          if (product.images.length > 1) {
            doc.image(product.images[1], 300, 320, {
              fit: [200, 200],
              align: 'center'
            });
          }
        }

        // Product Details Icons and Text
        let yPos = 550;
        
        // Size/Volume
        doc.circle(70, yPos, 10)
           .lineWidth(1)
           .stroke()
           .fontSize(10)
           .text('500ML', 90, yPos - 5);

        // Packaging
        doc.circle(70, yPos + 30, 10)
           .stroke()
           .text('INDIVIDUAL BOX', 90, yPos + 25);

        // Printing Method
        doc.circle(70, yPos + 60, 10)
           .stroke()
           .text('PRINTING METHOD: FULL WRAP\nPRINTING COLOR: FULL COLOR', 90, yPos + 55);

        // Price Section
        doc.rect(50, yPos + 100, 100, 30)
           .fill('#000')
           .fillColor('#fff')
           .fontSize(14)
           .text('PRICE', 70, yPos + 108);

        // Quantity and Price
        doc.fillColor('#000')
           .fontSize(12)
           .text(`QTY ${product.quantity} PCS`, 50, yPos + 140)
           .text(`PRICE RM ${product.unitPrice.toFixed(2)}`, 50, yPos + 160);

        // Production & Delivery
        doc.fontSize(10)
           .text('PRODUCTION & DELIVERY', 50, yPos + 190)
           .text('LEAD TIME: 10-14 WORKING DAYS', 50, yPos + 205);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}