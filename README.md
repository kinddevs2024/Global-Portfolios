# Global-Portfolios

## Deployment (required env)

For auth/profile/applications API routes to work in production, set:

- `BACKEND_API_URL=http://127.0.0.1:4000/api`

If backend is on another host, use its internal reachable URL (from the Next.js server), for example:

- `BACKEND_API_URL=http://10.0.0.15:4000/api`

Then restart frontend after env changes.
