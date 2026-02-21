const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/tokenService');

const isValidPassword = (password) => {
  const value = String(password || '');
  return value.length >= 8;
};

const register = async (req, res, next) => {
  try {
    const { role, email, password } = req.body;

    if (!role || !email || !password) {
      return res.status(400).json({ message: 'role, email, and password are required' });
    }

    if (!['student', 'university', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const user = await User.create({ role, email, password });
    const token = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id, role: user.role });

    return res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked' });
    }

    const token = generateAccessToken({ userId: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id, role: user.role });

    return res.status(200).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || user.isBlocked) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken({ userId: user._id, role: user.role });

    return res.status(200).json({ token: accessToken });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

module.exports = {
  register,
  login,
  me,
  refresh,
};
