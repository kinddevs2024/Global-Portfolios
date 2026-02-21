const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');

const generateAccessToken = (payload) => {
  const { jwtSecret, jwtExpiresIn } = getEnv();
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
};

const generateRefreshToken = (payload) => {
  const { jwtRefreshSecret, jwtRefreshExpiresIn } = getEnv();
  return jwt.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
};

const verifyRefreshToken = (token) => {
  const { jwtRefreshSecret } = getEnv();
  return jwt.verify(token, jwtRefreshSecret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
