const express = require('express');

const { createAccessRequest, respondAccessRequest } = require('../controllers/accessController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { accessRequestSchema, accessRespondSchema } = require('../validation/schemas');

const router = express.Router();

router.use(authMiddleware);

router.post('/request', roleMiddleware('university'), validateBody(accessRequestSchema), createAccessRequest);
router.patch('/:id/respond', roleMiddleware('student'), validateBody(accessRespondSchema), respondAccessRequest);

module.exports = router;
