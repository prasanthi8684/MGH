import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  
  try {
   
    const { firstname, lastname,bussinessemail,phonenumber,company,jobRole, password } = req.body;
    const userExists = await User.findOne({ bussinessemail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      firstname,
      lastname,
      bussinessemail,
      phonenumber,
      company,
      jobRole,
      password,
    });
   
    if (user) {
      res.status(201).json({
        status:true,
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.bussinessemail,
        phonenumber: user.phonenumber,
        company: user.company,
        jobRole: user.jobRole,
        token: generateToken(user.id),
      });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ status:false,message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { bussinessemail, password } = req.body;

    const user = await User.findOne({ bussinessemail }).select('+password');
    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user.id,
        name: user.firstname,
        email: user.bussinessemail,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { bussinessemail } = req.body;

    // Find user by email
    const user = await User.findOne({ bussinessemail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate reset token
    const resetToken = generateToken(user.id, '1h');
    
    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log(resetUrl)
    // Email content
    const message = `
      You requested a password reset. Please click the link below to reset your password:
      \n\n${resetUrl}\n\n
      This link will expire in 1 hour.
      If you didn't request this, please ignore this email.
    `;

    // Send email
    await sendEmail({
      to: user.bussinessemail,
      subject: 'Password Reset Request',
      text: message,
    });

    res.status(200).json({ message: 'Reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    // Find user by reset token and check if token is expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });
console.log(user)
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};