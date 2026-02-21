const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const UniversityProfile = require('../models/UniversityProfile');
const { createNotification } = require('../services/notificationService');
const { emitToUsers } = require('../services/realtimeService');
const { trackActivity } = require('../services/activityService');
const { logAudit } = require('../services/auditService');

const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ''));

const canActorRespondToPending = (application, actorRole, nextStatus) => {
  if (application.status !== 'pending') {
    return false;
  }

  if (nextStatus === 'accepted' || nextStatus === 'rejected') {
    if (application.initiatedBy === 'student') {
      return actorRole === 'university';
    }

    if (application.initiatedBy === 'university') {
      return actorRole === 'student';
    }
  }

  if (nextStatus === 'withdrawn') {
    return actorRole === application.initiatedBy;
  }

  return false;
};

const applyToUniversity = async (req, res, next) => {
  try {
    const { toUniversity, message } = req.body;

    if (!toUniversity || !isValidObjectId(toUniversity)) {
      return res.status(400).json({ message: 'toUniversity is required' });
    }

    const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });
    if (!studentProfile) {
      return res.status(400).json({ message: 'Student profile is required before applying' });
    }

    const universityProfile = await UniversityProfile.findById(toUniversity);
    if (!universityProfile) {
      return res.status(404).json({ message: 'University profile not found' });
    }

    const application = await Application.create({
      fromStudent: studentProfile._id,
      toUniversity: universityProfile._id,
      initiatedBy: 'student',
      message: message || '',
      status: 'pending',
    });

    await createNotification({
      userId: universityProfile.userId,
      type: 'application',
      relatedId: application._id,
    });

    emitToUsers([studentProfile.userId, universityProfile.userId], 'application:update', {
      applicationId: application._id,
      status: application.status,
      initiatedBy: application.initiatedBy,
    });

    await trackActivity({
      userId: studentProfile.userId,
      action: 'application.created',
      relatedId: application._id,
      metadata: { initiatedBy: 'student' },
    });

    await logAudit({
      userId: req.user.userId,
      action: 'application.created',
      targetType: 'Application',
      targetId: application._id,
      metadata: { initiatedBy: 'student' },
    });

    return res.status(201).json(application);
  } catch (error) {
    return next(error);
  }
};

const inviteStudent = async (req, res, next) => {
  try {
    const { studentId, message } = req.body;

    if (!studentId || !isValidObjectId(studentId)) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const universityProfile = await UniversityProfile.findOne({ userId: req.user.userId });
    if (!universityProfile) {
      return res.status(400).json({ message: 'University profile is required before inviting' });
    }

    const studentProfile = await StudentProfile.findById(studentId);
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const application = await Application.create({
      fromStudent: studentProfile._id,
      toUniversity: universityProfile._id,
      initiatedBy: 'university',
      message: message || '',
      status: 'pending',
    });

    await createNotification({
      userId: studentProfile.userId,
      type: 'application',
      relatedId: application._id,
    });

    emitToUsers([studentProfile.userId, universityProfile.userId], 'application:update', {
      applicationId: application._id,
      status: application.status,
      initiatedBy: application.initiatedBy,
    });

    await trackActivity({
      userId: universityProfile.userId,
      action: 'application.created',
      relatedId: application._id,
      metadata: { initiatedBy: 'university' },
    });

    await logAudit({
      userId: req.user.userId,
      action: 'application.created',
      targetType: 'Application',
      targetId: application._id,
      metadata: { initiatedBy: 'university' },
    });

    return res.status(201).json(application);
  } catch (error) {
    return next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });

    if (!studentProfile) {
      return res.status(200).json({ items: [], pagination: { page, limit, total: 0, totalPages: 1 } });
    }

    const [applications, total] = await Promise.all([
      Application.find({ fromStudent: studentProfile._id })
        .populate('fromStudent')
        .populate('toUniversity')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments({ fromStudent: studentProfile._id }),
    ]);

    return res.status(200).json({
      items: applications,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    return next(error);
  }
};

const getReceivedApplications = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const universityProfile = await UniversityProfile.findOne({ userId: req.user.userId });

    if (!universityProfile) {
      return res.status(200).json({ items: [], pagination: { page, limit, total: 0, totalPages: 1 } });
    }

    const [applications, total] = await Promise.all([
      Application.find({ toUniversity: universityProfile._id })
        .populate('fromStudent')
        .populate('toUniversity')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments({ toUniversity: universityProfile._id }),
    ]);

    return res.status(200).json({
      items: applications,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (error) {
    return next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected', 'withdrawn'].includes(status)) {
      return res.status(400).json({ message: 'Invalid target status' });
    }

    const application = await Application.findById(req.params.id)
      .populate('fromStudent')
      .populate('toUniversity');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    let actorRole = req.user.role;

    if (req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ userId: req.user.userId });
      if (!studentProfile || studentProfile._id.toString() !== application.fromStudent._id.toString()) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      actorRole = 'student';
    }

    if (req.user.role === 'university') {
      const universityProfile = await UniversityProfile.findOne({ userId: req.user.userId });
      if (
        !universityProfile ||
        universityProfile._id.toString() !== application.toUniversity._id.toString()
      ) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      actorRole = 'university';
    }

    if (req.user.role !== 'admin' && !canActorRespondToPending(application, actorRole, status)) {
      return res.status(400).json({ message: 'Invalid status transition for this actor' });
    }

    if (req.user.role === 'admin' && application.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending applications can be transitioned' });
    }

    application.status = status;
    await application.save();

    await Promise.all([
      createNotification({
        userId: application.fromStudent.userId,
        type: 'status_update',
        relatedId: application._id,
      }),
      createNotification({
        userId: application.toUniversity.userId,
        type: 'status_update',
        relatedId: application._id,
      }),
    ]);

    emitToUsers([application.fromStudent.userId, application.toUniversity.userId], 'application:update', {
      applicationId: application._id,
      status: application.status,
      initiatedBy: application.initiatedBy,
    });

    await trackActivity({
      userId: req.user.userId,
      action: 'application.status_updated',
      relatedId: application._id,
      metadata: { status },
    });

    await logAudit({
      userId: req.user.userId,
      action: 'application.status_updated',
      targetType: 'Application',
      targetId: application._id,
      metadata: { status },
    });

    return res.status(200).json(application);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  applyToUniversity,
  inviteStudent,
  getMyApplications,
  getReceivedApplications,
  updateApplicationStatus,
};
