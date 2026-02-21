const express = require('express');

const {
  createStudentProfile,
  searchStudentProfiles,
  getStudentProfiles,
  getStudentProfileById,
  updateStudentProfile,
  deleteStudentProfile,
} = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/search', roleMiddleware('university', 'admin'), searchStudentProfiles);
router.post('/', roleMiddleware('student', 'admin'), createStudentProfile);
router.get('/', roleMiddleware('student', 'university', 'admin'), getStudentProfiles);
router.get('/:id', roleMiddleware('student', 'university', 'admin'), getStudentProfileById);
router.put('/:id', roleMiddleware('student', 'admin'), updateStudentProfile);
router.delete('/:id', roleMiddleware('student', 'admin'), deleteStudentProfile);

module.exports = router;
