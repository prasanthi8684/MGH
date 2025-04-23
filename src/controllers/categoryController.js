import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';

export const createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createSubCategory = async (req, res) => {
  try {
    const subCategory = new SubCategory(req.body);
    await subCategory.save();
    res.status(201).json(subCategory);
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const subCategories = await SubCategory.find(query).sort({ name: 1 });
    res.json(subCategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: error.message });
  }
};