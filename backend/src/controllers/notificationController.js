const {
  getUserNotifications,
  markNotificationRead,
} = require('../services/notificationService');

const listNotifications = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const skip = (page - 1) * limit;

    const notifications = await getUserNotifications(req.user.userId, { skip, limit });
    return res.status(200).json({
      items: notifications.items,
      pagination: {
        page,
        limit,
        total: notifications.total,
        totalPages: Math.max(Math.ceil(notifications.total / limit), 1),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const readNotification = async (req, res, next) => {
  try {
    const notification = await markNotificationRead(req.user.userId, req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json(notification);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listNotifications,
  readNotification,
};
