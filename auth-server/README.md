# Better-Auth Server

Authentication server for Smart Textbook Platform using [better-auth](https://www.better-auth.com/).

## Features

- Email/password authentication
- Session management with cookies
- User profile with personalization fields:
  - `pythonKnowledge` - Does user know Python?
  - `hasNvidiaGpu` - Does user have NVIDIA GPU?
  - `experienceLevel` - beginner/intermediate/advanced

## Setup

### 1. Install dependencies

```bash
cd auth-server
npm install
```

### 2. Configure environment

Copy the example env file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your Neon Postgres connection string:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
AUTH_PORT=3001
BETTER_AUTH_SECRET=your-secret-key-here
```

Generate a secret key:
```bash
openssl rand -base64 32
```

### 3. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start the server

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Endpoints

All auth endpoints are under `/api/auth/*`:

- `POST /api/auth/sign-up/email` - Create account
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/user/profile` - Get user profile (requires auth)
- `POST /api/auth/validate` - Validate session (for FastAPI)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Docusaurus    │────▶│   Auth Server   │────▶│  Neon Postgres  │
│   (Frontend)    │     │  (better-auth)  │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│    FastAPI      │────▶│  Validates via  │
│   (AI Backend)  │     │  /api/auth/     │
└─────────────────┘     └─────────────────┘
```

## Integration with FastAPI

FastAPI validates sessions by calling the auth server's `/api/auth/validate` endpoint. This allows FastAPI to verify better-auth session cookies without needing direct database access to the auth tables.
