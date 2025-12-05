# Physical AI & Humanoid Robotics - Smart Textbook Platform

An interactive educational platform for learning Physical AI and Humanoid Robotics with AI-powered personalization, translation, and intelligent tutoring.

## Screenshots

> **Note**: Screenshots to be added after deployment. The following features should be captured:
> - Landing page with textbook navigation
> - Chapter page with "Personalize" and "Read in Urdu" buttons
> - Personalized content showing Python-specific analogies
> - Urdu translation with preserved code blocks
> - AI chat widget with question and cited response
> - Signup and login forms

## Features

### AI Agent Skills (CLI Tools)

Three standalone AI-powered CLI agents that can be used independently or through the backend API:

| Skill | File | AI Model | Description |
|-------|------|----------|-------------|
| Quiz Generator | `skills/quiz_agent.py` | OpenAI GPT-4 | Generates 5-question comprehension quizzes from markdown content |
| Translator | `skills/translator_agent.py` | Gemini 2.0 Flash | Translates content to Urdu preserving HTML, code blocks, and LaTeX |
| Personalizer | `skills/personalize_agent.py` | Gemini 2.5 Flash | Adapts content based on user's programming background |

### Interactive Learning Platform

- **Personalized Content**: Content adapts based on your Python knowledge and available hardware (GPU support)
- **Multilingual Support**: Read content in Urdu with preserved code examples and mathematical notation
- **AI Chatbot**: RAG-powered chatbot using Qdrant vector search with source citations
- **Self-Assessment Quizzes**: Each chapter includes auto-generated comprehension questions

### Textbook Content

- Module 1: Introduction to Physical AI and ROS 2
- Interactive Mermaid diagrams and LaTeX math equations
- Code syntax highlighting for ROS 2 Python examples
- Chapter quizzes with Docusaurus admonitions

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Docusaurus 3.9, React 19, TypeScript |
| Backend | FastAPI, SQLAlchemy, Python 3.11+ |
| Auth Server | better-auth, Express, Drizzle ORM |
| Database | Neon Serverless Postgres |
| Vector Store | Qdrant Cloud |
| AI/ML | Google Gemini (2.0/2.5 Flash), OpenAI GPT-4, text-embedding-ada-002 |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Docusaurus    │────▶│   Auth Server   │────▶│  Neon Postgres  │
│   (Frontend)    │     │  (better-auth)  │     │   (Database)    │
│   :3000         │     │   :3001         │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │ validates sessions
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    FastAPI      │────▶│   AI Skills     │────▶│   Qdrant Cloud  │
│   (AI Backend)  │     │ (Gemini/OpenAI) │     │  (Vector Store) │
│   :8000         │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Project Structure

```
.
├── auth-server/             # Better-Auth authentication server (Node.js)
│   ├── src/                # Source code
│   ├── drizzle/            # Database migrations
│   └── package.json
├── backend/                 # FastAPI backend (Python)
│   ├── api/                # API route handlers
│   ├── models/             # SQLAlchemy models & Pydantic schemas
│   ├── services/           # Business logic (embeddings, skills)
│   └── main.py            # FastAPI application entry
├── skills/                  # Standalone AI agent CLI tools
│   ├── quiz_agent.py      # Quiz generation (OpenAI GPT-4)
│   ├── translator_agent.py # Urdu translation (Gemini 2.0 Flash)
│   └── personalize_agent.py # Content personalization (Gemini 2.5 Flash)
├── textbook/               # Docusaurus frontend
│   ├── docs/              # Textbook content (markdown)
│   ├── src/               # React components & hooks
│   │   ├── components/    # ChatWidget, PersonalizeButton, TranslateButton
│   │   ├── hooks/         # useAuth, useChat, useSkills
│   │   └── lib/           # better-auth client
│   └── docusaurus.config.js
├── tests/                  # Test suite
│   └── skills/            # Agent skill tests
└── specs/                  # Feature specifications
```

## Prerequisites

- Node.js >= 20.0
- Python >= 3.11
- npm or yarn
- A Neon Postgres database
- A Qdrant Cloud cluster
- Google Gemini API key
- OpenAI API key (for quiz generation)

## Environment Variables

### Root `.env` (for skills and backend)

```bash
# Database Configuration (Neon Serverless Postgres)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Qdrant Vector Store
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key

# OpenAI API (for quiz generation and embeddings)
OPENAI_API_KEY=sk-your-openai-api-key

# Google Gemini API (for chat, translation, personalization)
GEMINI_API_KEY=your-gemini-api-key

# JWT Secret Key (legacy, for header-based auth)
JWT_SECRET_KEY=your-secret-key-here
```

### Auth Server `auth-server/.env`

```bash
# Database (Neon Serverless Postgres)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Auth Server Port
AUTH_PORT=3001

# Better Auth Secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-key-here
```

> **SECURITY WARNING**: Never commit `.env` files to version control. The `.gitignore` file is configured to exclude all `.env` files. Always use `.env.example` as a template for required variables.

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Hackathon I- Physical AI & Roborics Textbook"
```

### 2. Auth Server Setup (better-auth)

```bash
cd auth-server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Neon database URL and secret

# Run database migrations
npm run db:generate
npm run db:migrate

# Start the auth server
npm run dev
```

The auth server will be available at `http://localhost:3001`

### 3. Backend Setup (FastAPI)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment (in project root)
cp backend/.env.example .env
# Edit .env with your credentials (including GEMINI_API_KEY)

# Start the backend server
cd backend
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`

### 4. Frontend Setup (Docusaurus)

```bash
cd textbook
npm install

# Start development server
npm start
```

The textbook will be available at `http://localhost:3000`

### 5. Using AI Skills (CLI)

The AI agents can be used directly from command line:

```bash
# Quiz generation (uses OpenAI GPT-4)
cat docs/module-01/intro.md | python skills/quiz_agent.py

# Urdu translation (uses Gemini 2.0 Flash)
echo "<h1>ROS 2 Nodes</h1><p>Nodes are the building blocks.</p>" | python skills/translator_agent.py

# Content personalization (uses Gemini 2.5 Flash)
echo '{"content":"<h1>Test</h1>","profile":{"python_knowledge":true,"has_nvidia_gpu":false}}' | python skills/personalize_agent.py
```

## API Endpoints

### Auth Server (`:3001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/sign-up/email` | Create new user account |
| POST | `/api/auth/sign-in/email` | Login and get session |
| POST | `/api/auth/sign-out` | Logout |
| GET | `/api/user/profile` | Get user profile |
| POST | `/api/auth/validate` | Validate session (for FastAPI) |

### Backend API (`:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/personalize` | Get personalized chapter content (Gemini) |
| POST | `/api/translate` | Translate chapter to Urdu (Gemini) |
| POST | `/chat` | Ask questions about textbook (RAG + Gemini) |
| GET | `/` | API health check |

## Testing

### Run Skill Tests

```bash
# Run all skill tests
pytest tests/skills/ -v

# Run specific test
pytest tests/skills/test_quiz_agent.py -v
```

### Manual API Testing

```bash
# Signup via auth server
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test","pythonKnowledge":true,"hasNvidiaGpu":false,"experienceLevel":"beginner"}'

# Login via auth server
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"test123"}'

# Use cookies for FastAPI endpoints
curl -X POST http://localhost:8000/api/personalize \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"chapter_slug":"intro","content":"<h1>ROS 2</h1><p>Nodes perform computation.</p>"}'
```

## Deployment

### Auth Server Deployment (Railway / Render)

1. **Railway**:
   - Connect your repository to Railway
   - Set root directory to `auth-server`
   - Set environment variables in Railway dashboard
   - Start command: `npm start`

2. **Render**:
   - Create new Web Service from repository
   - Set root directory to `auth-server`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

### Backend Deployment (Railway / Render)

1. **Railway**:
   - Connect your repository to Railway
   - Set environment variables in Railway dashboard
   - Start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Render**:
   - Create new Web Service from repository
   - Set root directory to `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment (Vercel / Netlify)

1. **Vercel**:
   - Import repository to Vercel
   - Set root directory to `textbook`
   - Framework preset: Docusaurus 2
   - Build command: `npm run build`
   - Output directory: `build`

2. **Netlify**:
   - Connect repository to Netlify
   - Base directory: `textbook`
   - Build command: `npm run build`
   - Publish directory: `textbook/build`

> **Note**: Update `auth-client.ts` and API URLs with your production endpoints.

## AI API Usage & Cost Estimates

### Token Usage Per Feature

| Feature | Model | Est. Tokens/Request | Est. Cost |
|---------|-------|---------------------|-----------|
| Personalization | Gemini 2.5 Flash | ~2,000-4,000 | ~$0.0005 |
| Translation | Gemini 2.0 Flash | ~2,000-4,000 | ~$0.0003 |
| Chat Response | Gemini 2.0 Flash | ~500-1,500 | ~$0.0001 |
| Quiz Generation | GPT-4 | ~1,500-3,000 | $0.05-0.09 |
| Embedding | ada-002 | ~500-1,000 | $0.0001 |

> **Cost Advantage**: Using Gemini Flash models for translation, personalization, and chat significantly reduces costs compared to GPT-4 while maintaining quality.

### Rate Limiting Strategy

- **Authentication required** for all AI-powered endpoints
- **Session-based auth** via better-auth cookies
- **Response caching**: Consider caching repeated translations/personalizations
- **Batch operations**: Quiz generation runs once per chapter (at build time)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project was created for the Physical AI & Humanoid Robotics Hackathon.

## Acknowledgments

- Built with [Docusaurus](https://docusaurus.io/)
- Authentication by [better-auth](https://www.better-auth.com/)
- AI powered by [Google Gemini](https://deepmind.google/technologies/gemini/) and [OpenAI](https://openai.com/)
- Vector search by [Qdrant](https://qdrant.tech/)
- Database hosting by [Neon](https://neon.tech/)
