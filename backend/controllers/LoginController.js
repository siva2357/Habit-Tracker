const AccountSettings = require('../models/AccountSettings');
const generateToken = require('../utils/generateToken');

exports.handleLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await AccountSettings.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await AccountSettings.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }
    // Since this is a local setup and we don't have an email server config,
    // we just mock a success response. In production, you'd send an email with a reset token.
    res.json({ message: 'Password reset link sent to your email (Mocked)' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPasswordDirect = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await AccountSettings.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};