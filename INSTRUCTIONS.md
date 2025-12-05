# Smart Textbook Platform - Complete Deployment Guide

A comprehensive, step-by-step guide to deploy the Smart Textbook Platform using **100% FREE** resources.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites Checklist](#prerequisites-checklist)
3. [Part 1: Set Up Free Cloud Services](#part-1-set-up-free-cloud-services)
   - [Step 1.1: Create Neon PostgreSQL Database](#step-11-create-neon-postgresql-database)
   - [Step 1.2: Create Qdrant Cloud Vector Database](#step-12-create-qdrant-cloud-vector-database)
   - [Step 1.3: Get OpenAI API Key](#step-13-get-openai-api-key)
   - [Step 1.4: Get Google Gemini API Key](#step-14-get-google-gemini-api-key)
4. [Part 2: Local Development Setup](#part-2-local-development-setup)
   - [Step 2.1: Clone and Configure](#step-21-clone-and-configure)
   - [Step 2.2: Start Auth Server](#step-22-start-auth-server)
   - [Step 2.3: Start Backend Server](#step-23-start-backend-server)
   - [Step 2.4: Start Frontend](#step-24-start-frontend)
   - [Step 2.5: Test Everything Locally](#step-25-test-everything-locally)
5. [Part 3: Deploy to Production (Free Tier)](#part-3-deploy-to-production-free-tier)
   - [Step 3.1: Push Code to GitHub](#step-31-push-code-to-github)
   - [Step 3.2: Deploy Auth Server to Render](#step-32-deploy-auth-server-to-render)
   - [Step 3.3: Deploy Backend to Render](#step-33-deploy-backend-to-render)
   - [Step 3.4: Deploy Frontend to Vercel](#step-34-deploy-frontend-to-vercel)
   - [Step 3.5: Configure Production URLs](#step-35-configure-production-urls)
6. [Part 4: Post-Deployment Configuration](#part-4-post-deployment-configuration)
7. [Part 5: Verification & Testing](#part-5-verification--testing)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Cost Summary](#cost-summary)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRODUCTION ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐       │
│   │   VERCEL     │         │   RENDER     │         │   RENDER     │       │
│   │  (Frontend)  │────────▶│ (Auth Server)│────────▶│  (Backend)   │       │
│   │  Docusaurus  │         │   Node.js    │         │   FastAPI    │       │
│   │    FREE      │         │    FREE      │         │    FREE      │       │
│   └──────────────┘         └──────────────┘         └──────────────┘       │
│          │                        │                        │                │
│          │                        │                        │                │
│          │                        ▼                        ▼                │
│          │                 ┌──────────────┐         ┌──────────────┐       │
│          │                 │    NEON      │         │   QDRANT     │       │
│          │                 │  PostgreSQL  │         │    Cloud     │       │
│          │                 │    FREE      │         │    FREE      │       │
│          │                 └──────────────┘         └──────────────┘       │
│          │                                                 │                │
│          │                                                 ▼                │
│          │                                          ┌──────────────┐       │
│          └─────────────────────────────────────────▶│   OpenAI /   │       │
│                                                     │   Gemini     │       │
│                                                     │  (Pay-as-go) │       │
│                                                     └──────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Services Overview

| Service | Purpose | Platform | Free Tier Limits |
|---------|---------|----------|------------------|
| Frontend | Docusaurus site | Vercel | Unlimited bandwidth |
| Auth Server | User authentication | Render | 750 hrs/month |
| Backend | API + AI skills | Render | 750 hrs/month |
| Database | User data | Neon | 0.5 GB storage |
| Vector Store | Embeddings | Qdrant Cloud | 1 GB storage |
| AI | Content generation | OpenAI/Gemini | Pay-as-you-go |

---

## Prerequisites Checklist

Before starting, ensure you have:

### Software Requirements

```bash
# Check Node.js (need v20+)
node --version
# Expected: v20.x.x or higher

# Check Python (need 3.11+)
python --version
# Expected: Python 3.11.x or higher

# Check Git
git --version
# Expected: git version 2.x.x
```

### Accounts to Create (All Free)

- [ ] **GitHub** - [github.com](https://github.com) - Code hosting
- [ ] **Neon** - [neon.tech](https://neon.tech) - PostgreSQL database
- [ ] **Qdrant Cloud** - [cloud.qdrant.io](https://cloud.qdrant.io) - Vector database
- [ ] **OpenAI** - [platform.openai.com](https://platform.openai.com) - AI API
- [ ] **Google AI Studio** - [aistudio.google.com](https://aistudio.google.com) - Gemini API
- [ ] **Render** - [render.com](https://render.com) - Backend hosting
- [ ] **Vercel** - [vercel.com](https://vercel.com) - Frontend hosting

---

## Part 1: Set Up Free Cloud Services

### Step 1.1: Create Neon PostgreSQL Database

Neon provides a free serverless PostgreSQL database.

#### 1.1.1 Create Account

1. Go to [neon.tech](https://neon.tech)
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

#### 1.1.2 Create New Project

1. Click **"Create Project"**
2. Fill in the details:
   - **Project name**: `smart-textbook`
   - **Region**: Choose closest to your users (e.g., `US East`)
   - **Postgres version**: `16` (latest)
3. Click **"Create Project"**

#### 1.1.3 Get Connection String

1. After creation, you'll see the **Connection Details** panel
2. Click **"Show password"** to reveal credentials
3. Copy the **Connection string** (looks like):
   ```
   postgresql://username:password@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. **Save this connection string** - you'll need it multiple times

#### 1.1.4 Important Notes

- Free tier includes 0.5 GB storage
- Database auto-suspends after 5 minutes of inactivity
- First query after suspension takes ~1 second to wake up

---

### Step 1.2: Create Qdrant Cloud Vector Database

Qdrant stores embeddings for the AI chat feature.

#### 1.2.1 Create Account

1. Go to [cloud.qdrant.io](https://cloud.qdrant.io)
2. Click **"Sign Up"**
3. Sign up with GitHub, Google, or email
4. Verify your email if required

#### 1.2.2 Create Free Cluster

1. Click **"Create Cluster"**
2. Select **"Free"** tier
3. Configure:
   - **Cluster name**: `smart-textbook-vectors`
   - **Cloud provider**: `AWS` or `GCP` (either works)
   - **Region**: Choose same region as Neon for lower latency
4. Click **"Create"**
5. Wait 1-2 minutes for cluster to provision

#### 1.2.3 Get API Credentials

1. Once cluster is ready, click on it
2. Go to **"Data Access Control"** or **"API Keys"** tab
3. Click **"Create API Key"**
4. Name it: `textbook-backend`
5. Copy and save:
   - **Cluster URL**: `https://xxx-xxx-xxx.us-east4-0.gcp.cloud.qdrant.io:6333`
   - **API Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### Step 1.3: Get OpenAI API Key

OpenAI powers the quiz generation and chat features.

#### 1.3.1 Create Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Click **"Sign Up"**
3. Create account with email or Google
4. Verify phone number (required)

#### 1.3.2 Add Payment Method (Required)

1. Go to **Settings** → **Billing**
2. Click **"Add payment method"**
3. Add credit card (you'll only be charged for what you use)
4. Set a **usage limit** (e.g., $5/month) to avoid surprises

#### 1.3.3 Create API Key

1. Go to **API Keys** section (or [platform.openai.com/api-keys](https://platform.openai.com/api-keys))
2. Click **"Create new secret key"**
3. Name it: `smart-textbook`
4. Copy the key immediately (starts with `sk-`)
5. **Save it securely** - you won't see it again!

#### 1.3.4 Cost Estimates

| Feature | Model | Est. Cost per 1000 uses |
|---------|-------|-------------------------|
| Quiz Generation | GPT-4o-mini | ~$0.30 |
| Chat | GPT-4o-mini | ~$0.15 |
| Embeddings | text-embedding-ada-002 | ~$0.01 |
| Personalization | GPT-4o-mini | ~$0.20 |

---

### Step 1.4: Get Google Gemini API Key

Gemini powers the Urdu translation feature (free tier available).

#### 1.4.1 Create API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with Google account
3. Click **"Get API key"** in the left sidebar
4. Click **"Create API key"**
5. Select or create a Google Cloud project
6. Copy the API key

#### 1.4.2 Free Tier Limits

- **60 requests per minute** (free)
- **1 million tokens per day** (free)
- No credit card required!

---

## Part 2: Local Development Setup

### Step 2.1: Clone and Configure

#### 2.1.1 Clone Repository

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/smart-textbook-platform.git
cd smart-textbook-platform
```

#### 2.1.2 Create Environment Files

**Create `auth-server/.env`:**

```bash
cd auth-server
copy .env.example .env  # Windows
# OR: cp .env.example .env  # Mac/Linux
```

Edit `auth-server/.env`:

```env
# Database (from Step 1.1)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Server Config
AUTH_PORT=3001

# Auth Secret (generate a random string)
BETTER_AUTH_SECRET=your-super-secret-key-at-least-32-characters-long

# CORS (for local development)
CORS_ORIGIN=http://localhost:3000
```

**Create `backend/.env`:**

```bash
cd ../backend
copy .env.example .env  # Windows
# OR: cp .env.example .env  # Mac/Linux
```

Edit `backend/.env`:

```env
# Database (same as auth-server)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Qdrant Vector Database (from Step 1.2)
QDRANT_URL=https://xxx-xxx-xxx.us-east4-0.gcp.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key

# AI APIs (from Steps 1.3 and 1.4)
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key

# JWT Secret (can be same as BETTER_AUTH_SECRET)
JWT_SECRET_KEY=your-super-secret-key-at-least-32-characters-long

# Auth Server URL (local)
AUTH_SERVER_URL=http://localhost:3001
```

**Create root `.env`** (for skills):

```bash
cd ..
```

Create `.env` in project root:

```env
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

---

### Step 2.2: Start Auth Server

Open **Terminal 1**:

```bash
# Navigate to auth-server
cd auth-server

# Install dependencies
npm install

# Generate database schema
npm run db:generate

# Run database migrations (creates tables)
npm run db:migrate

# Start development server
npm run dev
```

**Expected output:**
```
Auth server running on http://localhost:3001
Database connected successfully
```

**Verify it works:**
```bash
curl http://localhost:3001/api/auth/session
# Expected: {"session":null}
```

---

### Step 2.3: Start Backend Server

Open **Terminal 2**:

```bash
# Navigate to project root
cd smart-textbook-platform

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Navigate to backend
cd backend

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx]
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify it works:**
```bash
curl http://localhost:8000/
# Expected: {"message":"Smart Textbook API","version":"1.0.0",...}
```

---

### Step 2.4: Start Frontend

Open **Terminal 3**:

```bash
# Navigate to textbook directory
cd textbook

# Install dependencies
npm install

# Start Docusaurus development server
npm start
```

**Expected output:**
```
[SUCCESS] Docusaurus website is running at: http://localhost:3000/
```

Browser should automatically open to `http://localhost:3000`

---

### Step 2.5: Test Everything Locally

#### Test 1: Create Account

1. Open http://localhost:3000
2. Click **"Sign Up"** in navbar
3. Fill form:
   - Email: `test@example.com`
   - Password: `Password123!`
   - Check "I know Python"
   - Leave "I have NVIDIA GPU" unchecked
4. Click **"Sign Up"**
5. Should redirect to docs page

#### Test 2: Login

1. Click **"Logout"** (if logged in)
2. Click **"Login"**
3. Enter credentials from Test 1
4. Should redirect to docs page

#### Test 3: AI Personalization

1. Navigate to **Module 1 → Introduction**
2. Look for green "AI Features" bar at top
3. Click **"Personalize"**
4. Wait for loading (5-10 seconds)
5. Content should appear with Python-specific explanations
6. Click **"Close & Show Original"** to return

#### Test 4: Translation

1. Click **"Read in Urdu"**
2. Wait for translation (10-15 seconds)
3. Content should appear in Urdu
4. Click **"Close & Show Original"** to return

#### Test 5: AI Chat

1. Click chat icon (bottom-right corner)
2. Type: `What is a ROS 2 node?`
3. Click Send
4. Should receive answer with source citations

---

## Part 3: Deploy to Production (Free Tier)

### Step 3.1: Push Code to GitHub

#### 3.1.1 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `smart-textbook-platform`
3. Keep it **Public** (required for free Vercel/Render)
4. **Don't** initialize with README (we have code)
5. Click **"Create repository"**

#### 3.1.2 Push Your Code

```bash
# In project root directory
cd smart-textbook-platform

# Initialize git if not already
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Smart Textbook Platform"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/smart-textbook-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### 3.1.3 Verify Upload

1. Go to your GitHub repository
2. Verify all folders are present:
   - `auth-server/`
   - `backend/`
   - `textbook/`
   - `skills/`

---

### Step 3.2: Deploy Auth Server to Render

#### 3.2.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (recommended for easy repo access)

#### 3.2.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** if not connected
   - Select `smart-textbook-platform` repository
3. Configure service:

| Setting | Value |
|---------|-------|
| **Name** | `textbook-auth` |
| **Region** | `Oregon (US West)` or closest to you |
| **Branch** | `main` |
| **Root Directory** | `auth-server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

#### 3.2.3 Add Environment Variables

Scroll down to **"Environment Variables"** section. Click **"Add Environment Variable"** for each:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `AUTH_PORT` | `10000` |
| `BETTER_AUTH_SECRET` | Your secret key (32+ chars) |
| `NODE_ENV` | `production` |

#### 3.2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Watch the logs for errors
4. Once deployed, note your URL: `https://textbook-auth.onrender.com`

#### 3.2.5 Run Database Migration

1. In Render dashboard, go to your auth service
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run db:migrate
   ```
4. Should see: `Migration complete`

---

### Step 3.3: Deploy Backend to Render

#### 3.3.1 Create Another Web Service

1. Click **"New +"** → **"Web Service"**
2. Select same GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `textbook-backend` |
| **Region** | Same as auth server |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

#### 3.3.2 Add Environment Variables

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `QDRANT_URL` | Your Qdrant cluster URL |
| `QDRANT_API_KEY` | Your Qdrant API key |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `GEMINI_API_KEY` | Your Gemini API key |
| `JWT_SECRET_KEY` | Same as BETTER_AUTH_SECRET |
| `AUTH_SERVER_URL` | `https://textbook-auth.onrender.com` |
| `PYTHON_VERSION` | `3.11.0` |

#### 3.3.3 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Note your URL: `https://textbook-backend.onrender.com`

#### 3.3.4 Verify Backend

```bash
curl https://textbook-backend.onrender.com/
# Expected: {"message":"Smart Textbook API",...}
```

---

### Step 3.4: Deploy Frontend to Vercel

#### 3.4.1 Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with **GitHub** (recommended)

#### 3.4.2 Import Project

1. Click **"Add New..."** → **"Project"**
2. Click **"Import"** next to your repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Project Name** | `smart-textbook` |
| **Framework Preset** | `Other` |
| **Root Directory** | Click "Edit" → select `textbook` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

#### 3.4.3 Add Environment Variables

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_AUTH_URL` | `https://textbook-auth.onrender.com` |
| `NEXT_PUBLIC_API_URL` | `https://textbook-backend.onrender.com` |

#### 3.4.4 Deploy

1. Click **"Deploy"**
2. Wait for build (2-5 minutes)
3. Your site is live at: `https://smart-textbook.vercel.app`

---

### Step 3.5: Configure Production URLs

After deploying all services, you need to update the code with production URLs.

#### 3.5.1 Update Frontend Hooks

Edit `textbook/src/hooks/useAuth.ts`:

```typescript
// Find this line:
const AUTH_URL = 'http://localhost:3001';

// Change to:
const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://textbook-auth.onrender.com';
```

Edit `textbook/src/hooks/useSkills.ts`:

```typescript
// Find this line:
const API_URL = 'http://localhost:8000';

// Change to:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://textbook-backend.onrender.com';
```

Edit `textbook/src/hooks/useChat.ts`:

```typescript
// Find this line:
const API_URL = 'http://localhost:8000';

// Change to:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://textbook-backend.onrender.com';
```

#### 3.5.2 Update Backend CORS

Edit `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://smart-textbook.vercel.app",  # Add your Vercel URL
        "https://*.vercel.app",  # Allow Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3.5.3 Commit and Push

```bash
git add .
git commit -m "Configure production URLs"
git push origin main
```

Vercel and Render will automatically redeploy.

---

## Part 4: Post-Deployment Configuration

### 4.1 Update Render Environment Variables

Go to Render dashboard and update both services:

**Auth Server** - Add CORS origin:
| Key | Value |
|-----|-------|
| `CORS_ORIGIN` | `https://smart-textbook.vercel.app` |

**Backend** - Already configured in Step 3.3.2

### 4.2 Verify All Services

Run these checks:

```bash
# 1. Check Auth Server
curl https://textbook-auth.onrender.com/api/auth/session
# Expected: {"session":null}

# 2. Check Backend
curl https://textbook-backend.onrender.com/
# Expected: {"message":"Smart Textbook API",...}

# 3. Check Frontend
# Open https://smart-textbook.vercel.app in browser
```

### 4.3 Keep Services Awake (Optional)

Render's free tier sleeps after 15 minutes of inactivity. To keep services awake:

1. Go to [uptimerobot.com](https://uptimerobot.com) (free)
2. Create account
3. Add monitors:
   - **Auth**: `https://textbook-auth.onrender.com/api/auth/session`
   - **Backend**: `https://textbook-backend.onrender.com/`
4. Set interval: **5 minutes**

---

## Part 5: Verification & Testing

### Production Testing Checklist

Open your Vercel URL (e.g., `https://smart-textbook.vercel.app`):

- [ ] **Homepage loads** without errors
- [ ] **Sign Up** creates new account
- [ ] **Login** works with created account
- [ ] **Logout** clears session
- [ ] Navigate to **Module 1 → Introduction**
- [ ] **"AI Features" bar** appears (when logged in)
- [ ] **Personalize** generates personalized content
- [ ] **Read in Urdu** translates content
- [ ] **Chat widget** opens and responds to questions
- [ ] **No console errors** in browser dev tools

### API Testing

```bash
# Test signup
curl -X POST https://textbook-auth.onrender.com/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"prod-test@example.com","password":"TestPass123!","name":"Test User"}'

# Test backend health
curl https://textbook-backend.onrender.com/health

# Test chat (requires valid token)
curl -X POST https://textbook-backend.onrender.com/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"What is ROS 2?"}'
```

---

## Troubleshooting Guide

### Issue: "Service Unavailable" or Slow Response

**Cause**: Render free tier sleeps after 15 minutes of inactivity.

**Solution**:
1. Wait 30 seconds and refresh
2. Set up UptimeRobot (see Step 4.3)
3. Or upgrade to Render paid tier ($7/month)

---

### Issue: "CORS Error" in Browser Console

**Cause**: Backend doesn't allow requests from frontend domain.

**Solution**:
1. Update `backend/main.py` CORS origins (see Step 3.5.2)
2. Add your exact Vercel URL to allowed origins
3. Redeploy backend

---

### Issue: "Database Connection Failed"

**Cause**: Neon database is paused or connection string is wrong.

**Solution**:
1. Go to Neon dashboard
2. Check if database is paused → Click to wake it
3. Verify connection string includes `?sslmode=require`
4. Test connection:
   ```bash
   psql "YOUR_CONNECTION_STRING"
   ```

---

### Issue: "Invalid API Key" for OpenAI/Gemini

**Cause**: API key is incorrect or has no credits.

**Solution**:
1. Verify key in respective dashboard
2. Check billing/credits status
3. Regenerate key if needed
4. Update environment variables in Render

---

### Issue: "Qdrant Connection Error"

**Cause**: Qdrant cluster URL or API key is wrong.

**Solution**:
1. Go to Qdrant Cloud dashboard
2. Verify cluster is running
3. Check API key is correct
4. Ensure URL format: `https://xxx.region.cloud.qdrant.io` (no port)

---

### Issue: "Build Failed" on Vercel

**Cause**: Usually Node.js version mismatch or missing dependencies.

**Solution**:
1. Check Vercel build logs for specific error
2. Add to `textbook/package.json`:
   ```json
   "engines": {
     "node": ">=20.0"
   }
   ```
3. Ensure all imports exist in `package.json`
4. Try building locally: `npm run build`

---

### Issue: "Module Not Found" on Render (Python)

**Cause**: Missing dependency in `requirements.txt`.

**Solution**:
1. Check Render build logs for missing module
2. Add to `backend/requirements.txt`
3. Commit and push to trigger redeploy

---

### Issue: Auth Not Working / "Session null"

**Cause**: BETTER_AUTH_SECRET mismatch or CORS issue.

**Solution**:
1. Ensure `BETTER_AUTH_SECRET` is identical on auth server and backend
2. Check CORS_ORIGIN includes your frontend URL
3. Verify cookies are being set (check browser dev tools → Application → Cookies)

---

## Cost Summary

### Free Tier Limits

| Service | Free Limit | Est. Monthly Usage |
|---------|------------|-------------------|
| **Vercel** | 100 GB bandwidth | Well under limit |
| **Render** | 750 hours/month | ~360 hrs (1 service always on) |
| **Neon** | 0.5 GB storage | ~100 MB (users table) |
| **Qdrant** | 1 GB storage | ~500 MB (embeddings) |
| **OpenAI** | Pay-as-you-go | ~$1-5/month for light use |
| **Gemini** | 1M tokens/day | FREE for most use cases |

### Estimated Monthly Costs

| Scenario | Cost |
|----------|------|
| **Development/Testing** | $0 |
| **Light Production** (100 users) | $1-3 |
| **Medium Production** (1000 users) | $5-15 |

### Tips to Minimize Costs

1. **Use Gemini for translation** - it's free!
2. **Cache AI responses** in Qdrant to avoid repeated calls
3. **Use GPT-4o-mini** instead of GPT-4 (10x cheaper)
4. **Set OpenAI usage limits** to avoid surprises
5. **Use UptimeRobot** to keep free tiers awake

---

## Quick Reference: All URLs

### Local Development

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Auth Server | http://localhost:3001 |
| Backend | http://localhost:8000 |

### Production (Replace with your URLs)

| Service | URL |
|---------|-----|
| Frontend | https://smart-textbook.vercel.app |
| Auth Server | https://textbook-auth.onrender.com |
| Backend | https://textbook-backend.onrender.com |
| Database | (Neon connection string) |
| Vector DB | (Qdrant cluster URL) |

---

## Need Help?

1. Check the [README.md](./README.md) for project overview
2. Review error logs in Render/Vercel dashboards
3. Open an issue on [GitHub](https://github.com/YOUR_USERNAME/smart-textbook-platform/issues)
4. Check service status pages:
   - [Render Status](https://status.render.com)
   - [Vercel Status](https://www.vercel-status.com)
   - [Neon Status](https://status.neon.tech)

---

*Last updated: December 2024*
*Total deployment time: ~45-60 minutes*
