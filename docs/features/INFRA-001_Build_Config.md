# INFRA-001: Build Configuration & Environment

## Overview
Documentation of the build process, environment variables, and specific configurations for local development vs production deployment.

## Database Configuration
We use **PostgreSQL** for both local development and production.

### Local Development
- **Provider:** PostgreSQL (Native Windows Install)
- **Port:** 54321
- **Connection String:** `postgresql://postgres:PASSWORD@localhost:54321/fyb_service`
- **SSL:** Disabled

### Production (Neon DB)
- **Provider:** PostgreSQL (Neon Serverless)
- **Connection String:** `postgresql://neondb_owner:...@neon.tech/neondb?sslmode=require`
- **SSL:** Required (`sslmode=require`)

> [!IMPORTANT]
> The application blocks `localhost` database URLs in production builds (when deployed to Vercel/Railway) for security. Local builds with `NODE_ENV=production` are permitted if `VERCEL` env var is missing.

## Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BETTER_AUTH_SECRET` | Auth encryption key | Yes |
| `BETTER_AUTH_URL` | Base URL (e.g. http://localhost:3000) | Yes |
| `GOOGLE_CLIENT_ID` | OAuth Client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | Yes |
| `PAYSTACK_SECRET_KEY` | Payment verification key | Yes |
| `GROQ_API_KEY` | AI Model API key | Yes |

## Build Process
The project uses `pnpm` and `next build`.
1. **Prisma Generate**: Runs automatically to create the client.
2. **Type Check**: TypeScript validation.
3. **Linting**: ESLint check.
4. **Build**: Next.js optimization.

### Troubleshooting
- **"Local database URLs are not allowed"**: Ensure you aren't deploying with a localhost DB string.
- **"PrismaClientInitializationError"**: Check if your local Postgres server is running on port 54321.

## Changelog
### 2025-12-31: PostgreSQL Migration
- Migrated from SQLite back to local PostgreSQL to ensure feature parity (JSON types, case-insensitive search).
- effective build configuration to allow local production builds while securing logical deployments.
