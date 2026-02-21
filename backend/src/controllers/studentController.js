const StudentProfile = require('../models/StudentProfile');
const { recalculateStudentRating } = require('../services/ratingService');
const { searchStudents } = require('../services/studentSearchService');
const {
  sanitizeStudentProfilesForRequester,
  sanitizeStudentProfileForRequester,
} = require('../services/privacyService');
const { logAudit } = require('../services/auditService');

const canManageStudent = (req, profileUserId) => {
  return req.user.role === 'admin' || req.user.userId === profileUserId.toString();
};

const createStudentProfile = async (req, res, next) => {
  try {
    const existing = await StudentProfile.findOne({ userId: req.user.userId });
    if (existing) {
      return res.status(409).json({ message: 'Student profile already exists for this user' });
    }

    const profile = await StudentProfile.create({ ...req.body, userId: req.user.userId });
    const updatedScore = await recalculateStudentRating(profile._id);
    profile.ratingScore = updatedScore;
    return res.status(201).json(profile);
  } catch (error) {
    return next(error);
  }
};

const searchStudentProfiles = async (req, res, next) => {
  try {
    const result = await searchStudents(req.query);
    const items = await sanitizeStudentProfilesForRequester(result.items, req.user);
    return res.status(200).json({ ...result, items });
  } catch (error) {
    return next(error);
  }
};

const getStudentProfiles = async (_req, res, next) => {
  try {
    const profiles = await StudentProfile.find().select('+passport');
    const sanitized = await sanitizeStudentProfilesForRequester(profiles, _req.user);
    return res.status(200).json(sanitized);
  } catch (error) {
    return next(error);
  }
};

const getStudentProfileById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findById(req.params.id).select('+passport');
    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    const sanitized = await sanitizeStudentProfileForRequester(profile, req.user);
    return res.status(200).json(sanitized);
  } catch (error) {
    return next(error);
  }
};

const updateStudentProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (!canManageStudent(req, profile.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    Object.assign(profile, req.body);
    await profile.save();
    const updatedScore = await recalculateStudentRating(profile._id);
    profile.ratingScore = updatedScore;

    await logAudit({
      userId: req.user.userId,
      action: 'student_profile.updated',
      targetType: 'StudentProfile',
      targetId: profile._id,
      metadata: { fields: Object.keys(req.body || {}) },
    });

    return res.status(200).json(profile);
  } catch (error) {
    return next(error);
  }
};

const deleteStudentProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (!canManageStudent(req, profile.userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await profile.deleteOne();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createStudentProfile,
  searchStudentProfiles,
  getStudentProfiles,
  getStudentProfileById,
  updateStudentProfile,
  deleteStudentProfile,
};
