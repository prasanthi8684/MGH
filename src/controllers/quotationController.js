import Quotation from '../models/Quotation.js';
import { uploadImages } from './imageController.js';

export const createQuotation = async (req, res) => {
  try {
    console.log('Test')
    const quotationData = req.body;
console.log(quotationData)
    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      const imageUrls = await uploadImages(req.files);
      // Assign images to the respective products
      quotationData.products = quotationData.products.map((product, index) => ({
        ...product,
        images: imageUrls.slice(index * 3, (index + 1) * 3) // Assuming max 3 images per product
      }));
    }

    const quotation = new Quotation(quotationData);
    await quotation.save();

    res.status(201).json(quotation);
  } catch (error) {
    console.error('Error creating quotation:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    res.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateQuotation = async (req, res) => {
  try {
    const quotationData = req.body;

    // Handle image uploads if present
    if (req.files && req.files.length > 0) {
      const imageUrls = await uploadImages(req.files);
      // Assign images to the respective products
      quotationData.products = quotationData.products.map((product, index) => ({
        ...product,
        images: [...(product.images || []), ...imageUrls.slice(index * 3, (index + 1) * 3)]
      }));
    }

    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      quotationData,
      { new: true }
    );

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    res.json(quotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting quotation:', error);
    res.status(500).json({ error: error.message });
  }
};