const express = require('express');

const {
  createUniversityProfile,
  saveUniversityFilter,
  getUniversitySavedFilters,
  getAnalytics,
  getUniversityProfiles,
  getUniversityProfileById,
  updateUniversityProfile,
  deleteUniversityProfile,
} = require('../controllers/universityController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/save-filter', roleMiddleware('university', 'admin'), saveUniversityFilter);
router.get('/saved-filters', roleMiddleware('university', 'admin'), getUniversitySavedFilters);
router.get('/analytics', roleMiddleware('university', 'admin'), getAnalytics);
router.post('/', roleMiddleware('university', 'admin'), createUniversityProfile);
router.get('/', roleMiddleware('student', 'university', 'admin'), getUniversityProfiles);
router.get('/:id', roleMiddleware('student', 'university', 'admin'), getUniversityProfileById);
router.put('/:id', roleMiddleware('university', 'admin'), updateUniversityProfile);
router.delete('/:id', roleMiddleware('university', 'admin'), deleteUniversityProfile);

module.exports = router;
