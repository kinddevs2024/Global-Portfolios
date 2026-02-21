const express = require('express');

const { listNotifications, readNotification } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', listNotifications);
router.patch('/:id/read', readNotification);

module.exports = router;
