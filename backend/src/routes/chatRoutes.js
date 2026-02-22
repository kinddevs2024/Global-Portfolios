const express = require('express');

const {
  startChatConversation,
  listConversations,
  listConversationMessages,
  sendChatMessage,
} = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { chatStartSchema, chatMessageSchema } = require('../validation/schemas');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('student', 'university'));

router.get('/conversations', listConversations);
router.post('/start', validateBody(chatStartSchema), startChatConversation);
router.get('/:conversationId/messages', listConversationMessages);
router.post('/:conversationId/messages', validateBody(chatMessageSchema), sendChatMessage);

module.exports = router;
