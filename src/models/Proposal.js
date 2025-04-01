import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  images: [{ type: String,imagesPath : String }]
});

const ProposalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['draft', 'sent', 'viewed', 'accepted'],
    default: 'draft'
  },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  products: [ProductSchema],
  totalAmount: { type: Number, required: false },
}, {
  timestamps: true
});

export default mongoose.model('Proposal', ProposalSchema);