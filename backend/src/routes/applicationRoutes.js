const express = require('express');

const {
  applyToUniversity,
  inviteStudent,
  inviteStudentByUserId,
  getMyApplications,
  getReceivedApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const {
  applicationApplySchema,
  applicationInviteSchema,
  applicationInviteByUserSchema,
  applicationStatusSchema,
} = require('../validation/schemas');

const router = express.Router();

router.use(authMiddleware);

router.post('/apply', roleMiddleware('student'), validateBody(applicationApplySchema), applyToUniversity);
router.get('/my-applications', roleMiddleware('student'), getMyApplications);

router.post('/invite', roleMiddleware('university'), validateBody(applicationInviteSchema), inviteStudent);
router.post('/invite-by-user', roleMiddleware('university'), validateBody(applicationInviteByUserSchema), inviteStudentByUserId);
router.get('/received', roleMiddleware('university'), getReceivedApplications);

router.patch(
  '/:id/status',
  roleMiddleware('student', 'university'),
  validateBody(applicationStatusSchema),
  updateApplicationStatus
);

module.exports = router;
