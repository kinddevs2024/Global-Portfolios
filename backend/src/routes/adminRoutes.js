const express = require('express');

const {
  listUsers,
  verifyUser,
  blockUser,
  getAdminAnalytics,
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { adminVerifyUserSchema, adminBlockUserSchema } = require('../validation/schemas');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/users', listUsers);
router.patch('/verify-user', validateBody(adminVerifyUserSchema), verifyUser);
router.patch('/block-user', validateBody(adminBlockUserSchema), blockUser);
router.get('/analytics', getAdminAnalytics);

module.exports = router;
