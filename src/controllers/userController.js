import { User } from '../models/User.js';
// @ts-ignore
import jwt from 'jsonwebtoken';
import { uploadImages } from './imageController.js';

// Update profile
export const updateProfile = async (req, res) => {
  try {
    console.log( req.body)
    const { name, company, phone,id } = req.body;
    const userId = id;

    let updateData = { name, company, phone };

    // Handle avatar upload if present
    if (req.files?.length > 0) {
      const imageUrls = await uploadImages(req.files);
      updateData.avatar = imageUrls[0];
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, select: '-password' }
    );

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
    const { primaryColor, secondaryColor } = req.body;
    const userId = req.user.id;

    let updateData = {
      'branding.primaryColor': primaryColor,
      'branding.secondaryColor': secondaryColor
    };

    // Handle logo upload if present
    if (req.files?.length > 0) {
      const imageUrls = await uploadImages(req.files);
      updateData['branding.logo'] = imageUrls[0];
    }

    const user = await User.findByIdAndUpdate(
      userId,
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
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // @ts-ignore
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
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

    // @ts-ignore
    res.json(user.addresses);
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