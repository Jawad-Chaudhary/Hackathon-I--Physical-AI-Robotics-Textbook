# Physical AI & Humanoid Robotics - Smart Textbook Platform

[![Live Demo](https://hackathon-i-physical-ai-robotics-te.vercel.app/)]

An interactive educational platform for learning Physical AI and Humanoid Robotics with AI-powered personalization, translation, and intelligent tutoring.

## 🌟 Live Demo

| Service | URL |
|---------|-----|
| **📚 Textbook** | [hackathon-i-physical-ai-robotics-te.vercel.app](https://hackathon-i-physical-ai-robotics-te.vercel.app/) |
| **🔐 Auth Server** | [Railway - Auth](https://hackathon-i-physical-ai-robotics-textbook-production.up.railway.app) |
| **⚡ API Backend** | [Railway - API](https://clever-respect-production-5202.up.railway.app) |

## 📸 Features Overview

### ✨ AI-Powered Learning Features

| Feature | Description | Technology |
|---------|-------------|------------|
| **🎯 Personalization** | Content adapts to user's Python/GPU background | Gemini 1.5 Flash |
| **🌐 Urdu Translation** | Translate chapters while preserving code blocks | Gemini 1.5 Flash |
| **💬 RAG Chatbot** | Ask questions about textbook content with citations | Qdrant + OpenAI |
| **📝 Quiz Generation** | Auto-generated comprehension quizzes | GPT-4 |
| **🔐 User Profiles** | Signup with background questions | Better-Auth |

### 🤖 AI Agent Skills

Three standalone AI-powered CLI agents with **smart section-based chunking** for full content processing:

| Skill | File | AI Model | Description |
|-------|------|----------|-------------|
| Quiz Generator | `backend/skills/quiz_agent.py` | OpenAI GPT-4 | Generates 5-question comprehension quizzes |
| Translator | `backend/skills/translator_agent.py` | Gemini 1.5 Flash | Translates to Urdu, preserves HTML/code/LaTeX |
| Personalizer | `backend/skills/personalize_agent.py` | Gemini 1.5 Flash | Adapts content based on user profile |

> **New**: Smart section-based chunking splits content at `<h1>`, `<h2>`, `<h3>` boundaries to process full chapters without truncation.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────────┐                                                    │
│  │   Docusaurus    │  React 19 + TypeScript                             │
│  │   (Vercel)      │  - ChatWidget, PersonalizeButton, TranslateButton  │
│  │   :3000         │  - useAuth, useChat, useSkills hooks               │
│  └────────┬────────┘                                                    │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
┌───────────┼─────────────────────────────────────────────────────────────┐
│           ▼                         BACKEND                              │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │   Auth Server   │     │    FastAPI      │     │   AI Skills     │   │
│  │  (better-auth)  │◄───▶│   (Railway)     │────▶│ (Gemini/OpenAI) │   │
│  │   :3001         │     │   :8000         │     │                 │   │
│  └────────┬────────┘     └────────┬────────┘     └─────────────────┘   │
└───────────┼───────────────────────┼─────────────────────────────────────┘
            │                       │
┌───────────┼───────────────────────┼─────────────────────────────────────┐
│           ▼                       ▼               DATA LAYER             │
│  ┌─────────────────┐     ┌─────────────────┐                            │
│  │  Neon Postgres  │     │   Qdrant Cloud  │                            │
│  │   (Database)    │     │  (Vector Store) │                            │
│  └─────────────────┘     └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Docusaurus 3.9, React 19, TypeScript |
| **Backend** | FastAPI, SQLAlchemy, Python 3.11+ |
| **Auth** | better-auth, Express, Drizzle ORM |
| **Database** | Neon Serverless Postgres |
| **Vector Store** | Qdrant Cloud |
| **AI Models** | Google Gemini 1.5 Flash, OpenAI GPT-4, text-embedding-ada-002 |
| **Deployment** | Vercel (Frontend), Railway (Backend + Auth) |

## 📁 Project Structure

```
.
├── auth-server/              # Better-Auth authentication server (Node.js)
│   ├── src/                  # Source code
│   │   ├── auth.ts          # Better-auth configuration
│   │   └── index.ts         # Express server entry
│   ├── drizzle/             # Database migrations
│   └── package.json
│
├── backend/                  # FastAPI backend (Python)
│   ├── api/                 # API route handlers
│   │   ├── auth.py          # Legacy auth endpoints
│   │   ├── chat.py          # RAG chatbot endpoint
│   │   ├── personalize.py   # Personalization endpoint
│   │   └── translate.py     # Translation endpoint
│   ├── models/              # SQLAlchemy models & Pydantic schemas
│   ├── services/            # Business logic
│   │   ├── embeddings_service.py  # Qdrant integration
│   │   └── skill_runner.py        # AI skill orchestration
│   ├── skills/              # AI agent CLI tools
│   │   ├── quiz_agent.py          # Quiz generation
│   │   ├── translator_agent.py    # Urdu translation
│   │   └── personalize_agent.py   # Content personalization
│   └── main.py              # FastAPI application entry
│
├── textbook/                 # Docusaurus frontend
│   ├── docs/                # Textbook content (markdown)
│   │   ├── intro.md         # Welcome page (slug: /)
│   │   ├── module-1/        # Module 1: Introduction to Physical AI
│   │   ├── module-2/        # Module 2: Perception Systems
│   │   └── module-3/        # Module 3: Motion & Control
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ChatWidget.tsx
│   │   │   ├── PersonalizeButton.tsx
│   │   │   ├── TranslateButton.tsx
│   │   │   └── AuthNavbarItem.tsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useChat.ts
│   │   │   └── useSkills.ts
│   │   ├── pages/           # Custom pages
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   └── theme/           # Theme overrides
│   │       └── DocItem/Layout/  # AI toolbar injection
│   └── docusaurus.config.ts
│
├── tests/                    # Test suite
│   └── skills/              # Agent skill tests
└── specs/                   # Feature specifications
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0
- Python >= 3.11
- Neon Postgres database
- Qdrant Cloud cluster
- Google Gemini API key
- OpenAI API key

### Local Development

**1. Auth Server**
```bash
cd auth-server
npm install
cp .env.example .env  # Configure DATABASE_URL, BETTER_AUTH_SECRET
npm run dev           # Starts on http://localhost:3001
```

**2. Backend API**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt
cd backend
uvicorn main:app --reload  # Starts on http://localhost:8000
```

**3. Frontend**
```bash
cd textbook
npm install
# Edit docusaurus.config.ts to use localhost URLs
npm start  # Starts on http://localhost:3000
```

### Environment Variables

**Root `.env`** (for backend):
```env
DATABASE_URL=postgresql://...
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-key
OPENAI_API_KEY=sk-your-key
GEMINI_API_KEY=your-key
JWT_SECRET_KEY=your-secret
```

**`auth-server/.env`**:
```env
DATABASE_URL=postgresql://...
AUTH_PORT=3001
BETTER_AUTH_SECRET=your-secret
```

## 📡 API Endpoints

### Auth Server (`:3001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Create account with profile |
| POST | `/api/auth/sign-in/email` | Login |
| POST | `/api/auth/sign-out` | Logout |
| POST | `/api/auth/validate` | Validate session |

### Backend API (`:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/personalize` | Personalize chapter content |
| POST | `/api/translate` | Translate chapter to Urdu |
| POST | `/chat` | RAG chatbot query |
| GET | `/health` | Health check |

## 🎯 Hackathon Scoring

| Requirement | Points | Status |
|-------------|--------|--------|
| AI/Spec-Driven Book (Docusaurus + GitHub) | 100 | ✅ |
| Integrated RAG Chatbot (Qdrant + OpenAI) | Base | ✅ |
| Reusable AI Agent Skills | +50 | ✅ |
| Better-Auth Signup with Profile | +50 | ✅ |
| Personalize Button per Chapter | +50 | ✅ |
| Translate to Urdu Button | +50 | ✅ |
| **Potential Total** | **300** | ✅ |

## 🙏 Acknowledgments

- [Docusaurus](https://docusaurus.io/) - Documentation framework
- [better-auth](https://www.better-auth.com/) - Authentication
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI models
- [OpenAI](https://openai.com/) - GPT-4 & embeddings
- [Qdrant](https://qdrant.tech/) - Vector search
- [Neon](https://neon.tech/) - Serverless Postgres
- [Railway](https://railway.app/) - Backend hosting
- [Vercel](https://vercel.com/) - Frontend hosting

## 📄 License

This project was created for the Physical AI & Humanoid Robotics Hackathon.

---

**Created by [Jawad Chaudhary](https://github.com/Jawad-Chaudhary)**
