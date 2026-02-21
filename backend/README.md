# Student Portfolio Backend (Step 1)

Fresh backend foundation for the Student Portfolio Platform.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- MVC architecture

## Structure

```
backend/src/
  app.js
  server.js
  config/
    db.js
  models/
    User.js
    StudentProfile.js
    UniversityProfile.js
    Application.js
  controllers/
    authController.js
    studentController.js
    universityController.js
    applicationController.js
  middleware/
    authMiddleware.js
    roleMiddleware.js
  routes/
    authRoutes.js
    studentRoutes.js
    universityRoutes.js
    applicationRoutes.js
  utils/
    constants.js
    generateToken.js
```

## Environment

Use values from `.env.example`:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT` (optional, default `4000`)

## Run

```bash
npm run backend:dev
```

or

```bash
npm run backend:start
```

## Base API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

- `POST /api/students`
- `GET /api/students`
- `GET /api/students/search`
- `GET /api/students/:id`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`

- `POST /api/universities`
- `GET /api/universities`
- `POST /api/universities/save-filter`
- `GET /api/universities/saved-filters`
- `GET /api/universities/analytics`
- `GET /api/universities/:id`
- `PUT /api/universities/:id`
- `DELETE /api/universities/:id`

- `POST /api/applications`
- `GET /api/applications`
- `GET /api/applications/:id`
- `PUT /api/applications/:id`
- `DELETE /api/applications/:id`

## Step 3 API

- `POST /api/applications/apply`
- `GET /api/applications/my-applications`
- `POST /api/applications/invite`
- `GET /api/applications/received`
- `PATCH /api/applications/:id/status`

- `POST /api/access/request`
- `PATCH /api/access/:id/respond`

## Step 4 API

- `GET /api/chat/conversations`
- `GET /api/chat/:conversationId/messages`
- `POST /api/chat/start`

- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

Socket events:

- `message:new`
- `message:read`
- `notification:new`
- `application:update`

## Step 5 API

- `GET /api/admin/users`
- `PATCH /api/admin/verify-user`
- `PATCH /api/admin/block-user`
- `GET /api/admin/analytics`

- `POST /api/auth/refresh`

## Notes

- Auth is token-based (`Authorization: Bearer <token>`).
- Role guard supports `student`, `university`, `admin`.
- Rating is dynamic and recalculated when student profile changes.
- Optional rating weights override: `RATING_WEIGHTS_JSON`.
- Search supports `page`, `limit`, `sortBy`, `sortOrder`, `q`, `minGPA`, `maxGPA`, `minRatingScore`, `country`, `skills`, `languages`, `certificationName`, `hasInternship`, `minProjectCount`, `minAwardsCount`.
- University-facing student payloads are privacy-sanitized via visibility settings and access grants.
- Socket uses JWT auth and private user rooms (`user:<userId>`) plus conversation rooms (`conversation:<conversationId>`).
- Security middleware includes Helmet + API rate limiting + Zod input validation.
- Audit logs are recorded for application status changes, access responses, admin actions, and profile updates.
- Production config supports CORS controls and token refresh strategy.
