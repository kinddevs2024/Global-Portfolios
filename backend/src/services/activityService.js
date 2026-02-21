const Activity = require('../models/Activity');

const trackActivity = async ({ userId, action, relatedId = null, metadata = {} }) => {
  if (!userId || !action) return null;

  return Activity.create({
    userId,
    action,
    relatedId,
    metadata,
  });
};

module.exports = {
  trackActivity,
};
