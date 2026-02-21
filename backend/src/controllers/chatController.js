const {
  startConversation,
  getUserConversations,
  getConversationMessages,
} = require('../services/chatService');

const startChatConversation = async (req, res, next) => {
  try {
    const { participantUserId, relatedApplication } = req.body;

    if (!participantUserId) {
      return res.status(400).json({ message: 'participantUserId is required' });
    }

    const conversation = await startConversation({
      starterUserId: req.user.userId,
      targetUserId: participantUserId,
      relatedApplication,
    });

    return res.status(201).json(conversation);
  } catch (error) {
    return next(error);
  }
};

const listConversations = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const conversations = await getUserConversations(req.user.userId, { page, limit });
    return res.status(200).json(conversations);
  } catch (error) {
    return next(error);
  }
};

const listConversationMessages = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await getConversationMessages({
      userId: req.user.userId,
      conversationId: req.params.conversationId,
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  startChatConversation,
  listConversations,
  listConversationMessages,
};
