const StudentProfile = require('../models/StudentProfile');
const { getRatingWeights } = require('../config/ratingWeights');

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const normalizeByCap = (count, cap) => {
  const safeCount = Number(count || 0);
  return clamp(safeCount / cap, 0, 1);
};

const calculateRatingScore = (studentProfile, customWeights) => {
  const weights = customWeights || getRatingWeights();

  const gpaNormalized = clamp(Number(studentProfile.GPA || 0) / 4, 0, 1);
  const certificationsNormalized = normalizeByCap(studentProfile.certifications?.length, 8);
  const internshipsNormalized = normalizeByCap(studentProfile.internships?.length, 6);
  const projectsNormalized = normalizeByCap(studentProfile.projects?.length, 10);
  const awardsNormalized = normalizeByCap(studentProfile.awards?.length, 8);
  const languagesNormalized = normalizeByCap(studentProfile.languages?.length, 6);

  const weighted =
    gpaNormalized * weights.GPA +
    certificationsNormalized * weights.certifications +
    internshipsNormalized * weights.internships +
    projectsNormalized * weights.projects +
    awardsNormalized * weights.awards +
    languagesNormalized * weights.languages;

  return Number((weighted * 100).toFixed(2));
};

const recalculateStudentRating = async (studentId) => {
  const profile = await StudentProfile.findById(studentId);

  if (!profile) {
    return null;
  }

  profile.ratingScore = calculateRatingScore(profile);
  await profile.save();

  return profile.ratingScore;
};

module.exports = {
  calculateRatingScore,
  recalculateStudentRating,
};
