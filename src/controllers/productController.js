import Product from '../../src/models/Product.js';
import { uploadImage } from '../services/imageService.js';

import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
const spacesEndpoint = new AWS.Endpoint('https://mgh.blr1.digitaloceanspaces.com'); // use your region



export const createProduct = async (req, res) => {
  try {
    console.log( req.file.location)
    const { name, description, price, quantity, category, subcategory } = req.body;
    const imageUrls = req.file.location;

    // const imageUrls = await Promise.all(
    //   imageFiles.map(file => uploadImage(file))
    // );
    // const imageUrls =uploadImage(imageFiles);
    // console.log(imageUrls)
    const product = new Product({
      name,
      description,
      price,
      quantity,
      category,
      subcategory,
      images: imageUrls
    });
    console.log(product)
    console.log('--------------')
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
 
    const products = await Product.findById(req.params.id);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
};
export const getProducts = async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    const query = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (req.files?.length) {
      const imageUrls = await Promise.all(
        req.files.map(file => uploadImage(file))
      );
      updateData.images = imageUrls;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};