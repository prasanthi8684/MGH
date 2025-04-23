import mongoose, { Schema, Document } from 'mongoose';



const SubCategorySchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
}, {
  timestamps: true
});

SubCategorySchema.index({ category: 1, name: 1 }, { unique: true });

export default mongoose.model('SubCategory', SubCategorySchema,'subcategories');