const Application = require('../models/Application');
const AccessRequest = require('../models/AccessRequest');
const UniversityProfile = require('../models/UniversityProfile');

const ALLOWED_REQUEST_FIELDS = [
  'passport',
  'GPA',
  'certifications',
  'internships',
  'projects',
  'awards',
  'contact',
];

const CONTACT_FIELDS = ['videoPresentationLink'];

const setMaskedValue = (target, key) => {
  target[key] = null;
};

const buildEffectiveVisibility = ({ visibilitySettings = {}, approvedFields = new Set(), forceFull }) => {
  if (forceFull) {
    return {
      passport: true,
      GPA: true,
      certifications: true,
      internships: true,
      projects: true,
      awards: true,
      contact: true,
    };
  }

  return {
    passport: Boolean(visibilitySettings.passportVisible) || approvedFields.has('passport'),
    GPA: Boolean(visibilitySettings.GPAVisible) || approvedFields.has('GPA'),
    certifications:
      Boolean(visibilitySettings.certificationsVisible) || approvedFields.has('certifications'),
    internships: Boolean(visibilitySettings.internshipsVisible) || approvedFields.has('internships'),
    projects: Boolean(visibilitySettings.projectsVisible) || approvedFields.has('projects'),
    awards: Boolean(visibilitySettings.awardsVisible) || approvedFields.has('awards'),
    contact: Boolean(visibilitySettings.contactVisible) || approvedFields.has('contact'),
  };
};

const sanitizeSingleProfile = (profile, context) => {
  const profileObject = typeof profile.toObject === 'function' ? profile.toObject() : { ...profile };

  if (!context) {
    return profileObject;
  }

  const effectiveVisibility = buildEffectiveVisibility(context);

  if (!effectiveVisibility.passport) setMaskedValue(profileObject, 'passport');
  if (!effectiveVisibility.GPA) setMaskedValue(profileObject, 'GPA');
  if (!effectiveVisibility.certifications) setMaskedValue(profileObject, 'certifications');
  if (!effectiveVisibility.internships) setMaskedValue(profileObject, 'internships');
  if (!effectiveVisibility.projects) setMaskedValue(profileObject, 'projects');
  if (!effectiveVisibility.awards) setMaskedValue(profileObject, 'awards');

  if (!effectiveVisibility.contact) {
    CONTACT_FIELDS.forEach((field) => setMaskedValue(profileObject, field));
  }

  return profileObject;
};

const getUniversityProfileIdByUserId = async (userId) => {
  const universityProfile = await UniversityProfile.findOne({ userId }).select('_id').lean();
  return universityProfile?._id?.toString() || null;
};

const getAcceptedStudentSet = async (studentIds, universityId) => {
  const accepted = await Application.find({
    fromStudent: { $in: studentIds },
    toUniversity: universityId,
    status: 'accepted',
  })
    .select('fromStudent')
    .lean();

  return new Set(accepted.map((item) => item.fromStudent.toString()));
};

const getApprovedFieldMap = async (studentIds, universityId) => {
  const requests = await AccessRequest.find({
    student: { $in: studentIds },
    university: universityId,
    status: 'approved',
  })
    .select('student requestedFields')
    .lean();

  const map = new Map();

  requests.forEach((request) => {
    const key = request.student.toString();
    const existing = map.get(key) || new Set();
    request.requestedFields.forEach((field) => existing.add(field));
    map.set(key, existing);
  });

  return map;
};

const sanitizeStudentProfilesForRequester = async (profiles, requester) => {
  if (!profiles?.length) return [];

  if (!requester || requester.role !== 'university') {
    return profiles.map((profile) =>
      typeof profile.toObject === 'function' ? profile.toObject() : { ...profile }
    );
  }

  const universityId = await getUniversityProfileIdByUserId(requester.userId);
  if (!universityId) {
    return profiles.map((profile) => sanitizeSingleProfile(profile, { visibilitySettings: {} }));
  }

  const studentIds = profiles.map((profile) => profile._id.toString());

  const [acceptedStudentSet, approvedFieldMap] = await Promise.all([
    getAcceptedStudentSet(studentIds, universityId),
    getApprovedFieldMap(studentIds, universityId),
  ]);

  return profiles.map((profile) => {
    const studentId = profile._id.toString();
    const forceFull = acceptedStudentSet.has(studentId);
    const approvedFields = approvedFieldMap.get(studentId) || new Set();

    return sanitizeSingleProfile(profile, {
      visibilitySettings: profile.visibilitySettings,
      approvedFields,
      forceFull,
    });
  });
};

const sanitizeStudentProfileForRequester = async (profile, requester) => {
  if (!profile) return null;
  const sanitized = await sanitizeStudentProfilesForRequester([profile], requester);
  return sanitized[0] || null;
};

module.exports = {
  ALLOWED_REQUEST_FIELDS,
  sanitizeStudentProfilesForRequester,
  sanitizeStudentProfileForRequester,
};
