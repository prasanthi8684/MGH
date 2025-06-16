import Cart from '../../src/models/Cart.js';
import Product from '../../src/models/Product.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Error fetching cart' });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    console.log(req.user)
    const userId = req.user.id;
    const { productId, quantity, unitPrice } = req.body;
    
    // Validate product exists
    const product = await Product.findById(productId);
    console.log(product)
   
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Check if enough quantity is available
    if (product.get('quantity') < quantity) {
      return res.status(400).json({ error: 'Insufficient product quantity' });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      // Check total quantity doesn't exceed available stock
      if (newQuantity > product.get('quantity')) {
        return res.status(400).json({ error: 'Total quantity exceeds available stock' });
      }
      
      existingItem.quantity = newQuantity;
      existingItem.unitPrice = unitPrice;
      existingItem.totalPrice = newQuantity * unitPrice;
    } else {
      // Add new item
      const newItem = {
        productId,
        name: product.name,
        description: product.description,
        unitPrice,
        quantity,
        totalPrice: quantity * unitPrice,
        images: product.images,
        category: product.category,
        subcategory: product.subcategory
      };
      console.log('----------------------')
      console.log(newItem)
      console.log('----------------------')
      cart.items.push(newItem);
    }
    
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Error adding item to cart' });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity, unitPrice } = req.body;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    // Validate product quantity
    const product = await Product.findById(item.productId);
    const availableQuantity = product ? product.get('quantity') : 0;
    if (product && quantity > availableQuantity) {
      return res.status(400).json({ error: 'Quantity exceeds available stock' });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
      item.unitPrice = unitPrice;
      item.totalPrice = quantity * unitPrice;
    }
    
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Error updating cart item' });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items.pull(itemId);
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Error removing item from cart' });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items.splice(0, cart.items.length);
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Error clearing cart' });
  }
};