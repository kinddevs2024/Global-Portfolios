const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const UniversityProfile = require('../models/UniversityProfile');
const { getSystemAnalytics } = require('../services/systemAnalyticsService');
const { logAudit } = require('../services/auditService');

const listUsers = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.isBlocked === 'true' || req.query.isBlocked === 'false') {
      query.isBlocked = req.query.isBlocked === 'true';
    }

    if (req.query.isVerified === 'true' || req.query.isVerified === 'false') {
      query.isVerified = req.query.isVerified === 'true';
    }

    if (req.query.q) {
      query.email = { $regex: String(req.query.q).trim(), $options: 'i' };
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password')
        .lean(),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      items: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const { userId, isVerified = true } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isVerified = Boolean(isVerified);
    await user.save();

    if (user.role === 'student') {
      await StudentProfile.updateOne({ userId: user._id }, { isVerified: Boolean(isVerified) });
    }

    if (user.role === 'university') {
      await UniversityProfile.updateOne({ userId: user._id }, { isVerified: Boolean(isVerified) });
    }

    await logAudit({
      userId: req.user.userId,
      action: 'admin.verify_user',
      targetType: 'User',
      targetId: user._id,
      metadata: { isVerified: Boolean(isVerified) },
    });

    return res.status(200).json({
      userId: user._id,
      isVerified: user.isVerified,
    });
  } catch (error) {
    return next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const { userId, isBlocked, reason = '' } = req.body;

    if (typeof isBlocked !== 'boolean') {
      return res.status(400).json({ message: 'isBlocked must be boolean' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = isBlocked;
    user.blockedReason = isBlocked ? String(reason || '').trim() : '';
    user.blockedAt = isBlocked ? new Date() : null;
    await user.save();

    await logAudit({
      userId: req.user.userId,
      action: 'admin.block_user',
      targetType: 'User',
      targetId: user._id,
      metadata: { isBlocked, reason: user.blockedReason },
    });

    return res.status(200).json({
      userId: user._id,
      isBlocked: user.isBlocked,
      blockedReason: user.blockedReason,
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminAnalytics = async (_req, res, next) => {
  try {
    const analytics = await getSystemAnalytics();
    return res.status(200).json(analytics);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listUsers,
  verifyUser,
  blockUser,
  getAdminAnalytics,
};
