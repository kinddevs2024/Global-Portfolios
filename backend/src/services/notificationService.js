const Notification = require('../models/Notification');
const { emitToUser } = require('./realtimeService');
const { trackActivity } = require('./activityService');

const createNotification = async ({ userId, type, relatedId }) => {
  const notification = await Notification.create({
    userId,
    type,
    relatedId,
    isRead: false,
  });

  emitToUser(String(userId), 'notification:new', notification);

  await trackActivity({
    userId,
    action: 'notification.created',
    relatedId,
    metadata: { type },
  });

  return notification;
};

const getUserNotifications = async (userId, { skip = 0, limit = 25 } = {}) => {
  const [items, total] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments({ userId }),
  ]);

  return { items, total };
};

const markNotificationRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });

  if (!notification) {
    return null;
  }

  notification.isRead = true;
  await notification.save();

  await trackActivity({
    userId,
    action: 'notification.read',
    relatedId: notification._id,
  });

  return notification;
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationRead,
};
