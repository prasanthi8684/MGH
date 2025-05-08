import { getGiftRecommendations } from '../services/aiService.js';
import Product from '../models/Product.js';

export const getAIRecommendations = async (req, res) => {
  try {
    const { prompt, budget, quantity } = req.query;

    // Get AI recommendations
    const aiSuggestions = await getGiftRecommendations(prompt, budget, quantity);
    console.log(aiSuggestions)
    // Find matching products based on AI suggestions
    // const recommendations = await Product.find({
    //   $and: [
    //     {
    //       $or: aiSuggestions.categories.map(category => ({
    //         category: { $regex: category, $options: 'i' }
    //       }))
    //     },
    //     {
    //       price: {
    //         $gte: aiSuggestions.minPrice,
    //         $lte: aiSuggestions.maxPrice
    //       }
    //     },
    //     {
    //       quantity: { $gte: quantity }
    //     }
    //   ]
    // })
    // .select('name description category subcategory price images')
    // .sort({ score: { $meta: "textScore" } })
    // .limit(10);
    const giftOptions = aiSuggestions.gifts.map((gift, index) => ({
      _id: String(index + 1),
      name: `${gift.category} - ${gift.subcategory}`,
      price: (gift.minPrice + gift.maxPrice) / 2, // or use minPrice
      image: [gift.image],
      subcategory: gift.subcategory,
      category: gift.category,
      description:  gift.description,
      quantity: 3,
    }));
    res.json({
      products: giftOptions
    });
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ error: 'Error getting recommendations' });
  }
};