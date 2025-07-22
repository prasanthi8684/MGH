import { getGiftRecommendations } from '../services/aiService.js';
import Product from '../models/Product.js';

export const getSmartRecommendations = async (req, res) => {
  try {
    const { budget, quantity, prompt } = req.query;

    if (!budget || !quantity) {
      return res.status(400).json({ error: 'Budget and quantity are required' });
    }

    const budgetNum = parseFloat(budget);
    const quantityNum = parseInt(quantity);

    console.log(`Smart Gifting Request - Budget: RM${budgetNum}, Quantity: ${quantityNum}, Prompt: "${prompt}"`);

    // Get all products from database
    const allProducts = await Product.find({}).sort({ createdAt: -1 });

    console.log(`Found ${allProducts.length} total products in database`);

    // Function to get price for specific quantity using price tiers
    const getPriceForQuantity = (product, qty) => {
      // If no price tiers defined, use base price
      if (!product.priceTiers || product.priceTiers.length === 0) {
        return product.basePrice;
      }

      // Sort price tiers by minQuantity to ensure correct order
      const sortedTiers = [...product.priceTiers].sort((a, b) => a.minQuantity - b.minQuantity);
      
      // Find the appropriate tier for the given quantity
      for (const tier of sortedTiers) {
        if (qty >= tier.minQuantity && qty <= tier.maxQuantity) {
          console.log(`Product ${product.name}: Using tier price RM${tier.price} for quantity ${qty} (tier: ${tier.minQuantity}-${tier.maxQuantity})`);
          return tier.price;
        }
      }
      
      // If no tier matches, check if quantity is higher than highest tier
      const highestTier = sortedTiers[sortedTiers.length - 1];
      if (qty > highestTier.maxQuantity) {
        console.log(`Product ${product.name}: Using highest tier price RM${highestTier.price} for quantity ${qty} (above max tier)`);
        return highestTier.price;
      }
      
      // Fallback to base price
      console.log(`Product ${product.name}: Using base price RM${product.basePrice} for quantity ${qty} (no tier match)`);
      return product.basePrice;
    };

    // Generate AI-like suggestions based on prompt
    const generateSuggestions = (prompt, budget) => {
      const suggestions = [];
      const lowerPrompt = prompt ? prompt.toLowerCase() : '';

      // Corporate/Business related
      if (lowerPrompt.includes('corporate') || lowerPrompt.includes('business') || lowerPrompt.includes('office') || lowerPrompt.includes('executive')) {
        suggestions.push({
          category: "Corporate Gifts",
          subcategory: "Executive Items",
          keywords: ["corporate", "business", "executive", "professional", "office"],
          minPrice: budget * 0.7,
          maxPrice: budget
        });
      }

      // Tech related
      if (lowerPrompt.includes('tech') || lowerPrompt.includes('gadget') || lowerPrompt.includes('electronic') || lowerPrompt.includes('digital')) {
        suggestions.push({
          category: "Electronics",
          subcategory: "Tech Gadgets",
          keywords: ["tech", "gadget", "electronic", "digital", "smart"],
          minPrice: budget * 0.8,
          maxPrice: budget
        });
      }

      // Drinkware related
      if (lowerPrompt.includes('drink') || lowerPrompt.includes('bottle') || lowerPrompt.includes('tumbler') || lowerPrompt.includes('mug') || lowerPrompt.includes('cup')) {
        suggestions.push({
          category: "Drinkware",
          subcategory: "Travel Tumbler",
          keywords: ["drink", "travel", "office", "hydration", "bottle", "tumbler"],
          minPrice: budget * 0.6,
          maxPrice: budget
        });
      }

      // Apparel related
      if (lowerPrompt.includes('apparel') || lowerPrompt.includes('clothing') || lowerPrompt.includes('shirt') || lowerPrompt.includes('uniform') || lowerPrompt.includes('wear')) {
        suggestions.push({
          category: "Apparel",
          subcategory: "Corporate Wear",
          keywords: ["apparel", "clothing", "uniform", "branded", "shirt", "wear"],
          minPrice: budget * 0.5,
          maxPrice: budget
        });
      }

      // Event related
      if (lowerPrompt.includes('event') || lowerPrompt.includes('conference') || lowerPrompt.includes('seminar') || lowerPrompt.includes('meeting')) {
        suggestions.push({
          category: "Event Merchandise",
          subcategory: "Conference Items",
          keywords: ["event", "conference", "networking", "promotional", "seminar"],
          minPrice: budget * 0.4,
          maxPrice: budget
        });
      }

      // Premium/Luxury related
      if (lowerPrompt.includes('premium') || lowerPrompt.includes('luxury') || lowerPrompt.includes('high-end') || lowerPrompt.includes('exclusive')) {
        suggestions.push({
          category: "Premium Gifts",
          subcategory: "Luxury Items",
          keywords: ["premium", "luxury", "exclusive", "high-end", "quality"],
          minPrice: budget * 0.8,
          maxPrice: budget
        });
      }

      // Default suggestions if no specific matches
      if (suggestions.length === 0) {
        suggestions.push(
          {
            category: "Premium Gifts",
            subcategory: "Executive Items",
            keywords: ["premium", "quality", "professional"],
            minPrice: budget * 0.7,
            maxPrice: budget
          },
          {
            category: "Promotional Items",
            subcategory: "Marketing Materials",
            keywords: ["promotional", "marketing", "branded"],
            minPrice: budget * 0.3,
            maxPrice: budget * 0.8
          }
        );
      }

      return suggestions;
    };

    // Generate suggestions
    const suggestions = generateSuggestions(prompt, budgetNum);

    // Filter products based on criteria
    const filteredProducts = allProducts.filter(product => {
      const productPrice = getPriceForQuantity(product, quantityNum);
      
      // Check if product meets budget and quantity requirements
      const withinBudget = productPrice <= budgetNum;
      const hasStock = product.quantity >= quantityNum;
      
      // Check if product matches any suggestion categories (if suggestions exist)
      let matchesCategory = suggestions.length === 0; // If no suggestions, include all
      
      if (suggestions.length > 0) {
        matchesCategory = suggestions.some(suggestion => 
          product.category.toLowerCase().includes(suggestion.category.toLowerCase()) ||
          product.subcategory.toLowerCase().includes(suggestion.subcategory.toLowerCase()) ||
          suggestion.keywords.some(keyword => 
            product.name.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword) ||
            product.category.toLowerCase().includes(keyword) ||
            product.subcategory.toLowerCase().includes(keyword)
          )
        );
      }

      // Text search in product details
      let matchesPrompt = true;
      if (prompt && prompt.trim() !== '') {
        const searchTerm = prompt.toLowerCase();
        matchesPrompt = 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.subcategory.toLowerCase().includes(searchTerm);
      }

      const isMatch = withinBudget && hasStock && (matchesCategory || matchesPrompt);
      
      if (isMatch) {
        console.log(`✓ Product ${product.name}: Price RM${productPrice}, Stock ${product.quantity}, Category: ${product.category}`);
      }

      return isMatch;
    });

    console.log(`Filtered to ${filteredProducts.length} products matching criteria`);

    // Sort by relevance (price closest to budget, then by stock quantity)
    filteredProducts.sort((a, b) => {
      const priceA = getPriceForQuantity(a, quantityNum);
      const priceB = getPriceForQuantity(b, quantityNum);
      
      // Prefer products closer to budget
      const budgetDiffA = Math.abs(budgetNum - priceA);
      const budgetDiffB = Math.abs(budgetNum - priceB);
      
      if (budgetDiffA !== budgetDiffB) {
        return budgetDiffA - budgetDiffB;
      }
      
      // Then by stock quantity (higher stock first)
      return b.quantity - a.quantity;
    });

    // Add calculated prices to products for frontend
    const productsWithPrices = filteredProducts.map(product => ({
      ...product.toObject(),
      calculatedPrice: getPriceForQuantity(product, quantityNum),
      totalCost: getPriceForQuantity(product, quantityNum) * quantityNum,
      savings: budgetNum - getPriceForQuantity(product, quantityNum),
      savingsPercentage: ((budgetNum - getPriceForQuantity(product, quantityNum)) / budgetNum * 100).toFixed(0)
    }));

    console.log(`Returning ${productsWithPrices.length} products with calculated prices`);

    res.json({
      suggestions,
      products: productsWithPrices,
      totalFound: productsWithPrices.length,
      searchCriteria: {
        budget: budgetNum,
        quantity: quantityNum,
        prompt: prompt || ''
      },
      summary: {
        totalProducts: allProducts.length,
        filteredProducts: productsWithPrices.length,
        averagePrice: productsWithPrices.length > 0 
          ? (productsWithPrices.reduce((sum, p) => sum + p.calculatedPrice, 0) / productsWithPrices.length).toFixed(2)
          : 0,
        totalSavings: productsWithPrices.reduce((sum, p) => sum + p.savings, 0).toFixed(2)
      }
    });

  } catch (error) {
    console.error('Smart gifting error:', error);
    res.status(500).json({ 
      error: 'Error getting smart recommendations',
      details: error.message 
    });
  }
};
export const getAIRecommendations = async (req, res) => {
  try {
    const { prompt, budget, quantity } = req.query;

    // Get AI recommendations
    const aiSuggestions = await getGiftRecommendations(prompt, budget, quantity);
   // console.log(aiSuggestions)
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
      _id: `${gift._id}`,
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