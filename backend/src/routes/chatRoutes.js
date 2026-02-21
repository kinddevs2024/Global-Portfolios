const express = require('express');

const {
  startChatConversation,
  listConversations,
  listConversationMessages,
} = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { chatStartSchema } = require('../validation/schemas');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('student', 'university'));

router.get('/conversations', listConversations);
router.get('/:conversationId/messages', listConversationMessages);
router.post('/start', validateBody(chatStartSchema), startChatConversation);

module.exports = router;
