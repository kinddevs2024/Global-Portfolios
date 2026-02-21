const log = (level, message, metadata = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata,
  };

  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : 'log'](JSON.stringify(payload));
};

module.exports = {
  info: (message, metadata) => log('info', message, metadata),
  warn: (message, metadata) => log('warn', message, metadata),
  error: (message, metadata) => log('error', message, metadata),
};
