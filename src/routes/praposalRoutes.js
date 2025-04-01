import express from 'express';
import { addProposal,getAllProposals,getProposalPDF } from '../controllers/proposalController.js';
import { protect } from '../middleware/auth.js';
const router = express.Router();

router.post('/', addProposal);
router.get('/', getAllProposals);
router.get('/:id/pdf', getProposalPDF);
export default router;