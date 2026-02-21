const express = require('express');

const { register, login, me, refresh } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema, refreshSchema } = require('../validation/schemas');

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshSchema), refresh);
router.get('/me', authMiddleware, me);

module.exports = router;
