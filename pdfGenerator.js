import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateProposalPDF(proposal) {
  return new Promise(async (resolve, reject) => {
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

      // --- COVER PAGE 1: Full Image ---
      try {
        const cover1Response = await axios.get('https://mhg.sgp1.cdn.digitaloceanspaces.com/pdf/pdf1.png', {
          responseType: 'arraybuffer'
        });
        const cover1Buffer = Buffer.from(cover1Response.data, 'binary');
        doc.image(cover1Buffer, 0, 0, {
          width: doc.page.width,
          height: doc.page.height
        });
        doc.addPage(); // Move to next page
      } catch (err) {
        console.error("Failed to load cover page 1:", err.message);
      }

      // --- COVER PAGE 2: Full Image ---
      try {
        const cover2Response = await axios.get('https://mhg.sgp1.cdn.digitaloceanspaces.com/pdf/pdf2.png', {
          responseType: 'arraybuffer'
        });
        const cover2Buffer = Buffer.from(cover2Response.data, 'binary');
        doc.image(cover2Buffer, 0, 0, {
          width: doc.page.width,
          height: doc.page.height
        });
        doc.addPage(); // Move to next page
      } catch (err) {
        console.error("Failed to load cover page 2:", err.message);
      }



      // Client name
      // doc.fontSize(24)
      //   .fillColor('#1a237e')
      //   .text(`PREPARED FOR ${proposal.clientName.toUpperCase()}`, 50, doc.page.height / 2, {
      //     width: doc.page.width - 100,
      //     align: 'center'
      //   });

      // Footer
      // doc.fontSize(12)
      //   .fillColor('#757575')
      //   .text('Making Ideas Work. Endless Possibilities.', 50, doc.page.height - 100)
      //   .text('APPARELS • PREMIUM GIFTS • CREATIVE • EVENTS', 50, doc.page.height - 80);

      // Product Pages
      for (const product of proposal.products) {
        //
        // proposal.products.forEach(async (product, index) => {
        doc.addPage();

        // Product Name
        // doc.fontSize(24)
        //   .fillColor('#ff0000')
        //   .text(product.name.toUpperCase(), 50, 50);

        // Specifications Section
        doc.fontSize(14)
          .fillColor('#000')
          .text('SPECIFICATION', 50, 120);

        // Specification text rotated
        doc.save()
          .translate(65, 280)
          .rotate(-90)
          .fontSize(12)
          .fillColor('#fff')
          .text('SPECIFICATION', 0, 0)
          .restore();
        const htmlDescription = product.description; // stored as HTML string

        // Specification content
        // doc.fontSize(12)
        //   .fillColor('#000')
        //   .text('product.description', 90, 140, {
        //     width: 300,
        //     lineGap: 5
        //   });
        const startY = 140;

        // Column positions
        const textX = 50;
        const imageX = 350;
        const columnWidth = 250;
        // Product Images
        if (product.images && product.images.length > 0) {
          const plainDescription = product.description
            .replace(/<[^>]+>/g, '') // Remove HTML tags if present
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&');
          doc.fontSize(12)
            .fillColor('#000')
            .text(plainDescription, textX, startY, {
              width: columnWidth,
              lineGap: 5
            });
          // Additional images if available
          // if (product.images.length > 1) {
          const imageUrl = product.images[0]
          try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data);

            doc.image(response.data, imageX, startY, {
              fit: [180, 180],
              align: 'center',
              valign: 'center'
            });
          } catch (error) {
            console.error('Error loading image:', imageUrl, error.message);
          }

          // doc.image(product.images[1], 300, 320, {
          //   fit: [200, 200],
          //   align: 'center'
          // });
          //  }
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
        //});
      }
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}