const { getEnv } = require('./env');

const buildCorsOptions = () => {
  const { corsOrigin } = getEnv();

  if (corsOrigin === '*') {
    return { origin: '*' };
  }

  const allowedOrigins = corsOrigin.split(',').map((item) => item.trim());
  return { origin: allowedOrigins };
};

module.exports = {
  buildCorsOptions,
};
