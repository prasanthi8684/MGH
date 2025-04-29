import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { uploadImages } from './imageController.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.body._id;
    console.log(userId)
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
};
// Update profile
export const updateProfile = async (req, res) => {
  try {
   
    const { name, company, phone,id } = req.body;
    const userId = id;

    let updateData = { name, company, phone };
    updateData.avatar = req.file.location;
    updateData.id= id

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' }
    );
    console.log(user)
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update branding
export const updateBranding = async (req, res) => {
  try {
    const { primaryColor, secondaryColor,id } = req.body;

    let updateData = {
      'branding.primaryColor': primaryColor,
      'branding.secondaryColor': secondaryColor
    };
    if (req.file?.location) {
      const imageUrls = req.file.location;
      updateData['branding.logo'] = imageUrls;
    }
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.branding);
  } catch (error) {
    console.error('Error updating branding:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.body.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // const isMatch = await user.matchPassword(currentPassword);
    // if (!isMatch) {
    //   return res.status(401).json({ error: 'Current password is incorrect' });
    // }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAddress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const address = req.body;

    // If this is the first address or marked as default, update other addresses
    if (address.isDefault) {
      await User.updateMany(
        { _id: userId, 'addresses.isDefault': true },
        { $set: { 'addresses.$.isDefault': false } }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true, select: 'addresses' }
    );

    
    res.json(user?.addresses);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: error.message });
  }
};
// Address management
export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const address = req.body;

    // If this is the first address or marked as default, update other addresses
    if (address.isDefault) {
      await User.updateMany(
        { _id: userId, 'addresses.isDefault': true },
        { $set: { 'addresses.$.isDefault': false } }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: address } },
      { new: true, select: 'addresses' }
    );

    
    res.json(user?.addresses);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const updatedAddress = req.body;

    // If being set as default, update other addresses first
    if (updatedAddress.isDefault) {
      await User.updateMany(
        { _id: userId, 'addresses.isDefault': true },
        { $set: { 'addresses.$.isDefault': false } }
      );
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, 'addresses._id': addressId },
      { $set: { 'addresses.$': updatedAddress } },
      { new: true, select: 'addresses' }
    );

    // @ts-ignore
    res.json(user.addresses);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true, select: 'addresses' }
    );

    // @ts-ignore
    res.json(user.addresses);
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: error.message });
  }
};