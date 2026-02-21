const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const UniversityProfile = require('../models/UniversityProfile');
const Application = require('../models/Application');
const { emitToConversation, getConversationRoom } = require('./realtimeService');
const { createNotification } = require('./notificationService');
const { trackActivity } = require('./activityService');

const toObjectIdString = (value) => String(value);

const resolveRelationshipProfiles = async (userA, userB) => {
  const users = [userA, userB];
  const studentUser = users.find((user) => user.role === 'student');
  const universityUser = users.find((user) => user.role === 'university');

  if (!studentUser || !universityUser) {
    return null;
  }

  const [studentProfile, universityProfile] = await Promise.all([
    StudentProfile.findOne({ userId: studentUser._id }).select('_id'),
    UniversityProfile.findOne({ userId: universityUser._id }).select('_id'),
  ]);

  if (!studentProfile || !universityProfile) {
    return null;
  }

  return {
    studentProfileId: studentProfile._id,
    universityProfileId: universityProfile._id,
  };
};

const canUsersStartConversation = async (starterUserId, targetUserId) => {
  const users = await User.find({ _id: { $in: [starterUserId, targetUserId] } }).select('_id role');
  if (users.length !== 2) {
    return false;
  }

  const userA = users.find((user) => toObjectIdString(user._id) === toObjectIdString(starterUserId));
  const userB = users.find((user) => toObjectIdString(user._id) === toObjectIdString(targetUserId));

  if (!userA || !userB) {
    return false;
  }

  const relation = await resolveRelationshipProfiles(userA, userB);
  if (!relation) {
    return false;
  }

  const existingApplication = await Application.exists({
    fromStudent: relation.studentProfileId,
    toUniversity: relation.universityProfileId,
  });

  return Boolean(existingApplication);
};

const startConversation = async ({ starterUserId, targetUserId, relatedApplication }) => {
  if (toObjectIdString(starterUserId) === toObjectIdString(targetUserId)) {
    const error = new Error('Cannot start conversation with yourself');
    error.statusCode = 400;
    throw error;
  }

  const permitted = await canUsersStartConversation(starterUserId, targetUserId);
  if (!permitted) {
    const error = new Error('Conversation not allowed without student-university relationship');
    error.statusCode = 403;
    throw error;
  }

  const participants = [starterUserId, targetUserId].map(toObjectIdString).sort();

  const existing = await Conversation.findOne({
    participants: { $all: participants, $size: 2 },
  });

  if (existing) {
    return existing;
  }

  const conversation = await Conversation.create({
    participants,
    relatedApplication: relatedApplication || null,
  });

  await Promise.all(
    participants.map((participantId) =>
      trackActivity({
        userId: participantId,
        action: 'conversation.started',
        relatedId: conversation._id,
      })
    )
  );

  return conversation;
};

const assertConversationParticipant = (conversation, userId) => {
  const isParticipant = conversation.participants.some(
    (participantId) => toObjectIdString(participantId) === toObjectIdString(userId)
  );

  if (!isParticipant) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }
};

const getUserConversations = async (userId, { page = 1, limit = 25 } = {}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Conversation.countDocuments({ participants: userId }),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(Math.ceil(total / safeLimit), 1),
    },
  };
};

const getConversationMessages = async ({ userId, conversationId, page = 1, limit = 50 }) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }

  assertConversationParticipant(conversation, userId);

  const skip = (safePage - 1) * safeLimit;

  const [messages, total] = await Promise.all([
    Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Message.countDocuments({ conversationId }),
  ]);

  return {
    items: messages,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(Math.ceil(total / safeLimit), 1),
    },
  };
};

const sendMessage = async ({ conversationId, senderUserId, text, attachments = [] }) => {
  const trimmedText = String(text || '').trim();
  if (!trimmedText) {
    const error = new Error('Message text is required');
    error.statusCode = 400;
    throw error;
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }

  assertConversationParticipant(conversation, senderUserId);

  const message = await Message.create({
    conversationId,
    sender: senderUserId,
    text: trimmedText,
    attachments,
    isRead: false,
  });

  conversation.updatedAt = new Date();
  await conversation.save();

  emitToConversation(conversationId, 'message:new', message);

  const recipients = conversation.participants
    .map(toObjectIdString)
    .filter((participantId) => participantId !== toObjectIdString(senderUserId));

  await Promise.all(
    recipients.map((recipientId) =>
      createNotification({
        userId: recipientId,
        type: 'message',
        relatedId: message._id,
      })
    )
  );

  await trackActivity({
    userId: senderUserId,
    action: 'message.sent',
    relatedId: message._id,
    metadata: { conversationId },
  });

  return message;
};

const markMessageRead = async ({ conversationId, messageId, userId }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    const error = new Error('Conversation not found');
    error.statusCode = 404;
    throw error;
  }

  assertConversationParticipant(conversation, userId);

  const message = await Message.findOne({ _id: messageId, conversationId });
  if (!message) {
    const error = new Error('Message not found');
    error.statusCode = 404;
    throw error;
  }

  if (toObjectIdString(message.sender) !== toObjectIdString(userId)) {
    message.isRead = true;
    await message.save();
  }

  emitToConversation(conversationId, 'message:read', {
    conversationId,
    messageId,
    readBy: userId,
  });

  await trackActivity({
    userId,
    action: 'message.read',
    relatedId: message._id,
    metadata: { conversationId },
  });

  return message;
};

const joinUserConversationRooms = async (socket, userId) => {
  const conversations = await Conversation.find({ participants: userId }).select('_id').lean();
  conversations.forEach((conversation) => {
    socket.join(getConversationRoom(conversation._id));
  });
};

module.exports = {
  startConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessageRead,
  joinUserConversationRooms,
};
