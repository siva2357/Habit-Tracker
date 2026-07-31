const AccountSettings = require('../models/AccountSettings');
const generateToken = require('../utils/generateToken');

exports.handleSignUp = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const userExists = await AccountSettings.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await AccountSettings.create({
      fullName,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};