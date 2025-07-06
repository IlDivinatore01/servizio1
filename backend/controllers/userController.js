const User = require('../models/User');

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