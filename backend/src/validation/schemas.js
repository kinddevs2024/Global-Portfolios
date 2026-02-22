const { z } = require('zod');

const registerSchema = z.object({
  role: z.enum(['student', 'university', 'admin']),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const applicationApplySchema = z.object({
  toUniversity: z.string().length(24),
  message: z.string().max(1000).optional(),
});

const applicationInviteSchema = z.object({
  studentId: z.string().length(24),
  message: z.string().max(1000).optional(),
});

const applicationInviteByUserSchema = z.object({
  targetUserId: z.string().length(24),
  message: z.string().max(5000).optional(),
});

const applicationStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'withdrawn']),
});

const accessRequestSchema = z.object({
  studentId: z.string().length(24),
  requestedFields: z.array(z.string()).min(1),
});

const accessRespondSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

const chatStartSchema = z.object({
  participantUserId: z.string().length(24),
  relatedApplication: z.string().length(24).optional(),
});

const chatMessageSchema = z.object({
  text: z.string().min(1).max(5000),
});

const adminVerifyUserSchema = z.object({
  userId: z.string().length(24),
  isVerified: z.boolean().optional(),
});

const adminBlockUserSchema = z.object({
  userId: z.string().length(24),
  isBlocked: z.boolean(),
  reason: z.string().max(500).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  applicationApplySchema,
  applicationInviteSchema,
  applicationInviteByUserSchema,
  applicationStatusSchema,
  chatMessageSchema,
  accessRequestSchema,
  accessRespondSchema,
  chatStartSchema,
  adminVerifyUserSchema,
  adminBlockUserSchema,
};
