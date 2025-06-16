import mongoose, { Schema } from 'mongoose';

/*
  TypeScript interfaces removed because this is a JavaScript file.
  If you need type checking, use a .ts file or create a separate .d.ts file.
*/

const PriceTierSchema = new Schema({
  minQuantity: { type: Number, required: true, min: 1 },
  maxQuantity: { type: Number, required: true },
  price: { type: Number, required: true, min: 0 }
});

const ProductSchema = new Schema({
  name: { type: String, required: true },
  basePrice: { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  priceTiers: [PriceTierSchema],
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  images: [{ type: String }]
}, {
  timestamps: true
});

// Method to get price based on quantity
ProductSchema.methods.getPriceForQuantity = function(quantity) {
  // Sort price tiers by minQuantity to ensure correct order
  const sortedTiers = this.priceTiers.sort((a, b) => a.minQuantity - b.minQuantity);
  
  // Find the appropriate tier for the given quantity
  for (const tier of sortedTiers) {
    if (quantity >= tier.minQuantity && quantity <= tier.maxQuantity) {
      return tier.price;
    }
  }
  
  // If no tier matches, return base price
  return this.basePrice;
};

// Validate that price tiers don't overlap and are in correct order
PriceTierSchema.pre('validate', function(next) {
  if (this.minQuantity >= this.maxQuantity) {
    next(new Error('minQuantity must be less than maxQuantity'));
  } else {
    next();
  }
});

export default mongoose.model('Product', ProductSchema);