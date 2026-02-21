const UniversityProfile = require('../models/UniversityProfile');
const { getUniversityAnalytics } = require('../services/universityAnalyticsService');
const { logAudit } = require('../services/auditService');

const canManageUniversity = (req, profileUserId) => {
  return req.user.role === 'admin' || req.user.userId === profileUserId.toString();
};

const createUniversityProfile = async (req, res, next) => {
  try {
    const existing = await UniversityProfile.findOne({ userId: req.user.userId });
    if (existing) {
      return res.status(409).json({ message: 'University profile already exists for this user' });
    }

    const profile = await UniversityProfile.create({ ...req.body, userId: req.user.userId });
    return res.status(201).json(profile);
  } catch (error) {
    return next(error);
  }
};

const getUniversityProfiles = async (_req, res, next) => {
  try {
    const profiles = await UniversityProfile.find();
    return res.status(200).json(profiles);
  } catch (error) {
    return next(error);
  }
};

const saveUniversityFilter = async (req, res, next) => {
  try {
    const profile = await UniversityProfile.findOne({ userId: req.user.userId });

    if (!profile) {
      return res.status(404).json({ message: 'University profile not found' });
    }

    const { name, filters } = req.body;

    if (!filters || typeof filters !== 'object') {
      return res.status(400).json({ message: 'filters object is required' });
    }

    profile.savedFilters.push({
      name: name ? String(name).trim() : 'Untitled filter',
      filters,
      createdAt: new Date(),
    });

    await profile.save();

    return res.status(201).json({ savedFilters: profile.savedFilters });
  } catch (error) {
    return next(error);
  }
};

const getUniversitySavedFilters = async (req, res, next) => {
  try {
    const profile = await UniversityProfile.findOne({ userId: req.user.userId }).select('savedFilters');

    if (!profile) {
      return res.status(404).json({ message: 'University profile not found' });
    }

    return res.status(200).json({ savedFilters: profile.savedFilters || [] });
  } catch (error) {
    return next(error);
  }
};

const getAnalytics = async (_req, res, next) => {
  try {
    const analytics = await getUniversityAnalytics();
    return res.status(200).json(analytics);
  } catch (error) {
    return next(error);
  }
};

const getUniversityProfileById = async (req, res, next) => {
  try {
    const profile = await UniversityProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'University profile not found' });
    }
    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

const updateUniversityProfile = async (req, res, next) => {
  try {
    const profile = await UniversityProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'University profile not found' });
    }

    if (!canManageUniversity(req, profile.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    Object.assign(profile, req.body);
    await profile.save();

    await logAudit({
      userId: req.user.userId,
      action: 'university_profile.updated',
      targetType: 'UniversityProfile',
      targetId: profile._id,
      metadata: { fields: Object.keys(req.body || {}) },
    });

    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

const deleteUniversityProfile = async (req, res, next) => {
  try {
    const profile = await UniversityProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'University profile not found' });
    }

    if (!canManageUniversity(req, profile.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await profile.deleteOne();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createUniversityProfile,
  saveUniversityFilter,
  getUniversitySavedFilters,
  getAnalytics,
  getUniversityProfiles,
  getUniversityProfileById,
  updateUniversityProfile,
  deleteUniversityProfile,
};
