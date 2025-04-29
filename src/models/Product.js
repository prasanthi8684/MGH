import mongoose, { Schema, Document } from 'mongoose';


const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  image: { type: String }
}, {
  timestamps: true
});

export default mongoose.model('Product', ProductSchema);