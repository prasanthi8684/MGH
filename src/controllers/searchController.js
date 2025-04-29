import Product from '../models/Product.js';

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const searchRegex = new RegExp(q, 'i');

    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { subcategory: searchRegex }
      ]
    })
    .select('name description category images price')
    .limit(10)
    .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Error performing search' });
  }
};