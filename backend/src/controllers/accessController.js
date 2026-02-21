const AccessRequest = require('../models/AccessRequest');
const StudentProfile = require('../models/StudentProfile');
const UniversityProfile = require('../models/UniversityProfile');
const { ALLOWED_REQUEST_FIELDS } = require('../services/privacyService');
const { createNotification } = require('../services/notificationService');
const { trackActivity } = require('../services/activityService');
const { logAudit } = require('../services/auditService');

const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ''));

const normalizeRequestedFields = (fields) => {
  if (!Array.isArray(fields)) return [];
  return [...new Set(fields.map((field) => String(field).trim()))].filter(Boolean);
};

const createAccessRequest = async (req, res, next) => {
  try {
    const { studentId, requestedFields } = req.body;

    if (!studentId || !isValidObjectId(studentId)) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const normalizedFields = normalizeRequestedFields(requestedFields);

    if (!normalizedFields.length) {
      return res.status(400).json({ message: 'requestedFields must be a non-empty array' });
    }

    const hasInvalid = normalizedFields.some((field) => !ALLOWED_REQUEST_FIELDS.includes(field));
    if (hasInvalid) {
      return res.status(400).json({ message: 'requestedFields contains unsupported field(s)' });
    }

    const [universityProfile, studentProfile] = await Promise.all([
      UniversityProfile.findOne({ userId: req.user.userId }),
      StudentProfile.findById(studentId),
    ]);

    if (!universityProfile) {
      return res.status(400).json({ message: 'University profile is required' });
    }

    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const created = await AccessRequest.create({
      student: studentProfile._id,
      university: universityProfile._id,
      requestedFields: normalizedFields,
      status: 'pending',
    });

    await createNotification({
      userId: studentProfile.userId,
      type: 'access_request',
      relatedId: created._id,
    });

    await trackActivity({
      userId: universityProfile.userId,
      action: 'access_request.created',
      relatedId: created._id,
      metadata: { requestedFields: normalizedFields },
    });

    await logAudit({
      userId: req.user.userId,
      action: 'access_request.created',
      targetType: 'AccessRequest',
      targetId: created._id,
      metadata: { requestedFields: normalizedFields },
    });

    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
};

const respondAccessRequest = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be approved or rejected' });
    }

    const accessRequest = await AccessRequest.findById(req.params.id).populate('student').populate('university');

    if (!accessRequest) {
      return res.status(404).json({ message: 'Access request not found' });
    }

    if (accessRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending access requests can be updated' });
    }

    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });
      if (!studentProfile || studentProfile._id.toString() !== accessRequest.student._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    accessRequest.status = status;
    await accessRequest.save();

    await createNotification({
      userId: accessRequest.university.userId,
      type: 'access_request',
      relatedId: accessRequest._id,
    });

    await trackActivity({
      userId: req.user.userId,
      action: 'access_request.responded',
      relatedId: accessRequest._id,
      metadata: { status },
    });

    await logAudit({
      userId: req.user.userId,
      action: 'access_request.responded',
      targetType: 'AccessRequest',
      targetId: accessRequest._id,
      metadata: { status },
    });

    return res.status(200).json(accessRequest);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createAccessRequest,
  respondAccessRequest,
};
