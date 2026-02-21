let ioInstance = null;

const USER_ROOM_PREFIX = 'user:';
const CONVERSATION_ROOM_PREFIX = 'conversation:';

const setSocketServer = (io) => {
  ioInstance = io;
};

const getSocketServer = () => ioInstance;

const getUserRoom = (userId) => `${USER_ROOM_PREFIX}${userId}`;
const getConversationRoom = (conversationId) => `${CONVERSATION_ROOM_PREFIX}${conversationId}`;

const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;
  ioInstance.to(getUserRoom(userId)).emit(event, payload);
};

const emitToUsers = (userIds, event, payload) => {
  if (!ioInstance) return;
  [...new Set(userIds.map(String))].forEach((userId) => emitToUser(userId, event, payload));
};

const emitToConversation = (conversationId, event, payload) => {
  if (!ioInstance) return;
  ioInstance.to(getConversationRoom(conversationId)).emit(event, payload);
};

module.exports = {
  setSocketServer,
  getSocketServer,
  getUserRoom,
  getConversationRoom,
  emitToUser,
  emitToUsers,
  emitToConversation,
};
