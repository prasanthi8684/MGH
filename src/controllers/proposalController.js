import Proposal from '../models/Proposal.js';
import { generateProposalPDF } from '../services/pdfGenerator.js';
import { sendEmail } from '../services/emailService.js';

// export const createProposal = async (req, res) => {
//   try {
//     const proposal = new Proposal({
//       ...req.body,
//       date: new Date(),
//       totalAmount: req.body.products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0)
//     });

//     await proposal.save();
//     res.status(201).json(proposal);
//   } catch (error) {
//     console.error('Error creating proposal:', error);
//     res.status(500).json({ error: 'Error creating proposal' });
//   }
// };


export const createProposal = async (req, res) => {
  try {
    // Get image URLs from multer-s3 upload
    //const imageUrls = req.files ? req.files.map(file => file.location) : [];
    
    // Map image URLs to products
    const products = req.body.products.map((product, index) => ({
    
      ...product,
      //image: imageUrls.slice(index * 3, (index + 1) * 3) // Assuming max 3 images per product
    }));
    const proposal = new Proposal({
      ...req.body,
      products,
      date: new Date(),
      totalAmount: products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0)
    });
    const pdfBuffer = await generateProposalPDF(proposal);
  
    await sendEmail({
      to: proposal.clientEmail,
      subject: `Proposal: ${proposal.name}`,
      proposal,
      pdfBuffer
    });

    // Update proposal status to sent
    proposal.status = 'sent';
    await proposal.save();
    res.status(201).json(proposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Error creating proposal' });
  }
};

export const getAllProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Error fetching proposals' });
  }
};

export const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Error fetching proposal' });
  }
};

export const updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        totalAmount: req.body.products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0)
      },
      { new: true }
    );

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json(proposal);
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ error: 'Error updating proposal' });
  }
};

export const deleteProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ error: 'Error deleting proposal' });
  }
};

export const getProposalPDF = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const pdfBuffer = await generateProposalPDF(proposal);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=proposal-${proposal._id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Error generating PDF' });
  }
};

export const sendProposalEmail = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const pdfBuffer = await generateProposalPDF(proposal);
    
    // await sendEmail({
    //   to: proposal.clientEmail,
    //   subject: `Proposal: ${proposal.name}`,
    //   proposal,
    //   pdfBuffer
    // });

    // Update proposal status to sent
    proposal.status = 'sent';
    await proposal.save();

    res.json({ message: 'Proposal sent successfully' });
  } catch (error) {
    console.error('Error sending proposal:', error);
    res.status(500).json({ error: 'Error sending proposal' });
  }
};