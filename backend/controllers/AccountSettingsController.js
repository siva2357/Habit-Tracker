const AccountSettings = require('../models/AccountSettings');
const bcrypt = require('bcryptjs');

// Update user profile
exports.updateProfile = async (req, res) => {
  const { fullName, email } = req.body;
  try {
    const user = await AccountSettings.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    
    // Allow email update if it's different and not already taken
    if (email && email !== user.email) {
      const emailExists = await AccountSettings.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await AccountSettings.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await AccountSettings.findByIdAndDelete(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Ideally, here you would also delete related data (Habits, Projects, etc)
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};