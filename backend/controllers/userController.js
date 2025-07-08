const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('ownedStickers.sticker');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user details
// @route   PUT /api/users/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  const { username, email, favoriteSuperhero } = req.body;
  const fieldsToUpdate = {};
  if (username) fieldsToUpdate.username = username;
  if (email) fieldsToUpdate.email = email;
  if (favoriteSuperhero) fieldsToUpdate.favoriteSuperhero = favoriteSuperhero;

  try {
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/me
// @access  Private
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user password
// @route   PUT /api/users/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide current and new password' });
  }
  
  try {
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Simulate purchasing credits
// @route   POST /api/users/credits/purchase
// @access  Private
exports.purchaseCredits = async (req, res, next) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid amount' });
  }

  try {
    const user = await User.findById(req.user.id);
    user.credits += amount;
    await user.save();
    res.status(200).json({ success: true, data: { credits: user.credits } });
  } catch (err) {
    next(err);
  }
};

// @desc    Upgrade user to admin (requires admin password)
// @route   POST /api/users/upgrade-admin
// @access  Private
exports.upgradeToAdmin = async (req, res, next) => {
  const { adminPassword } = req.body;
  if (!adminPassword) {
    return res.status(400).json({ success: false, message: 'Admin password required' });
  }
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: 'Incorrect admin password' });
  }
  try {
    const user = await User.findById(req.user.id);
    user.role = 'admin';
    await user.save();
    res.status(200).json({ success: true, message: 'User upgraded to admin', data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Downgrade admin to user
// @route   POST /api/users/downgrade-admin
// @access  Private
exports.downgradeToUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.role = 'user';
    await user.save();
    res.status(200).json({ success: true, message: 'Admin downgraded to user', data: user });
  } catch (err) {
    next(err);
  }
};