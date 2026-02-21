const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const universityRoutes = require('./routes/universityRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const accessRoutes = require('./routes/accessRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { buildCorsOptions } = require('./config/cors');
const { apiRateLimiter } = require('./middleware/rateLimitMiddleware');
const { notFoundMiddleware, errorMiddleware } = require('./middleware/errorMiddleware');

const app = express();

app.use(helmet());
app.use(cors(buildCorsOptions()));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', apiRateLimiter);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

module.exports = app;
