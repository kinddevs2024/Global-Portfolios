const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { buildCorsOptions } = require('../config/cors');
const {
  setSocketServer,
  getUserRoom,
  getConversationRoom,
} = require('../services/realtimeService');
const {
  sendMessage,
  markMessageRead,
  joinUserConversationRooms,
} = require('../services/chatService');

const extractToken = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) {
    return String(authToken).replace(/^Bearer\s+/i, '').trim();
  }

  const header = socket.handshake.headers?.authorization;
  if (!header) return null;
  return String(header).replace(/^Bearer\s+/i, '').trim();
};

const createSocketServer = (httpServer) => {
  const corsOptions = buildCorsOptions();

  const io = new Server(httpServer, {
    cors: {
      origin: corsOptions.origin,
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) {
        return next(new Error('Unauthorized'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('_id role email isBlocked');

      if (!user) {
        return next(new Error('Unauthorized'));
      }

      if (user.isBlocked) {
        return next(new Error('Blocked'));
      }

      socket.user = {
        userId: String(user._id),
        role: user.role,
        email: user.email,
      };

      return next();
    } catch (_error) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket) => {
    const { userId } = socket.user;

    socket.join(getUserRoom(userId));
    await joinUserConversationRooms(socket, userId);

    socket.on('conversation:join', async ({ conversationId }) => {
      if (!conversationId) return;
      socket.join(getConversationRoom(conversationId));
    });

    socket.on('message:new', async (payload, ack) => {
      try {
        const message = await sendMessage({
          conversationId: payload?.conversationId,
          senderUserId: userId,
          text: payload?.text,
          attachments: payload?.attachments || [],
        });

        if (typeof ack === 'function') {
          ack({ ok: true, message });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ ok: false, message: error.message });
        }
      }
    });

    socket.on('message:read', async (payload, ack) => {
      try {
        const message = await markMessageRead({
          conversationId: payload?.conversationId,
          messageId: payload?.messageId,
          userId,
        });

        if (typeof ack === 'function') {
          ack({ ok: true, message });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ ok: false, message: error.message });
        }
      }
    });
  });

  setSocketServer(io);
  return io;
};

module.exports = {
  createSocketServer,
};
