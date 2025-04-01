import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateProposalPDF } from '../../pdfGenerator.js';
import { sendProposalEmail } from '../../emailService.js';
import Proposal from '../models/Proposal.js';


export const addProposal = async (req, res) => {
  try {
    const proposal = new Proposal(req.body);
    await proposal.save();

    if (proposal.status === 'sent') {
      await sendProposalEmail(proposal);
    }

    res.status(201).json(proposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Error creating proposal' });
  }
};

export const getAllProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find().sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching proposals' });
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
    res.status(500).json({ error: 'Error generating PDF' });
  }
};