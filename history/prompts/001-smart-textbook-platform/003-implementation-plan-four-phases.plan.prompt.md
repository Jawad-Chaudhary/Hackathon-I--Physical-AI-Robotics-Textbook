---
id: 003
title: Implementation Plan Four Phases
stage: plan
date: 2025-12-03
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-smart-textbook-platform
branch: 001-smart-textbook-platform
user: Jawad0Chaudhary
command: /sp.plan
labels: ["planning", "phased-implementation", "brain-spine-body-face", "tdd", "constitution-compliance"]
links:
  spec: specs/001-smart-textbook-platform/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-smart-textbook-platform/plan.md
tests:
  - null
---

## Prompt

Based on the specification, generate a phased implementation plan.

Phase 1: Skills & Tools (The "Brain")
- Priority: Create the `skills/` folder and the 3 subagents (Quiz, Translate, Personalize) first. We will use these to generate content later.

Phase 2: Infrastructure (The "Spine")
- Setup FastAPI with Neon (Postgres) and Qdrant.
- Implement Better-Auth with the custom schema for "User Background".

Phase 3: The Content (The "Body")
- Write Module 1 (ROS 2 & Physical AI).
- Run `skills/quiz_agent.py` to append quizzes to Module 1.

Phase 4: The Interface (The "Face")
- Build the React components for Docusaurus: ChatWidget, PersonalizeButton, TranslateButton.
- Connect buttons to the Backend API.

Validation:
- Confirm that the "Personalize" button actually changes the text based on the mock user profile.

## Response snapshot

Created comprehensive 4-phase implementation plan (2147 lines) for Smart Textbook Platform aligned with user's "Brain → Spine → Body → Face" metaphor.

**Constitution Compliance**: 7/7 principles validated ✅
- Principle I (Stack): Docusaurus, FastAPI, Neon, Qdrant, Better-Auth, OpenAI SDK - 100%
- Principle II (Reusable Intelligence): 3 mandatory skills as CLI tools (stdin/stdout) - 100%
- Principle III (Formatting): Docusaurus admonitions, LaTeX, Mermaid planned - 100%
- Principle IV (ROS 2 Humble): rclpy examples, Python launch files documented - 100%
- Principle V (RAG Architecture): Select-to-Ask with Qdrant + source citations - 100%
- Principle VI (User Metadata): Better-Auth captures python_knowledge, has_nvidia_gpu - 100%
- Principle VII (TDD): Test-first workflow for all skills (Red → Green cycle) - 100%

**Technical Context Established**:
- Languages: Python 3.11+, Node.js 18+, TypeScript 5+
- Performance: <2s chatbot, <5s skills, <1s page load
- Constraints: 500 OpenAI API calls/hour, Qdrant free tier (1M vectors), synchronous subprocess
- Scale: 100 concurrent users, 2 chapters initially (expandable to 20-30)

**Phase 0: Research (6 unknowns identified)**:
1. Better-Auth + FastAPI integration patterns
2. Subprocess best practices (error handling, timeouts, buffering)
3. Qdrant chunking strategy (heading-based vs token-count)
4. OpenAI Agents SDK prompt engineering
5. Docusaurus swizzling for custom components
6. Neon Postgres connection pooling (async vs sync)

**Phase 1: Skills & Tools (The "Brain" 🧠)** - TDD-First Approach:
- Step 1: Write tests FIRST (`tests/skills/test_*.py`) - verify RED
- Step 2: Implement 3 skills as CLI tools (stdin → stdout):
  - `backend/skills/generate_quiz.py`: Appends 5-question quiz to markdown
  - `backend/skills/translate_urdu.py`: Translates with LaTeX/code preservation via regex placeholders
  - `backend/skills/personalize.py`: Rewrites content based on JSON profile input
- Step 3: Run tests → verify GREEN
- Deliverable: All skills pass `pytest tests/skills/ -v` before Phase 2

**Phase 2: Infrastructure (The "Spine" 🦴)** - API-Only Backend:
- Database: Neon Postgres with `users` table (email, password_hash, python_knowledge, has_nvidia_gpu, experience_level)
- Auth: Better-Auth via JWT tokens (24hr expiration), bcrypt password hashing
- Qdrant: Collection setup (1536-dim vectors, COSINE distance)
- API Endpoints:
  - POST `/auth/signup` + `/auth/login` (returns JWT)
  - POST `/api/personalize` (validates token → queries profile → subprocess skill → returns personalized markdown)
  - POST `/api/translate` (validates token → subprocess skill → returns Urdu)
  - POST `/chat` (validates token → Qdrant search → OpenAI completion → returns answer + sources)
- Subprocess Runner: `SkillRunner` class with 15s timeout, error propagation
- Validation: curl/Postman testing (no frontend yet)

**Phase 3: Content (The "Body" 📚)** - ROS 2 Humble Chapters:
- `docs/intro.md`: Introduction to Physical AI (What is Physical AI, Why ROS 2, Course Roadmap)
  - Mermaid diagrams: Sensor-AI-Actuator loop, Module roadmap
  - Learning objectives, Further Reading
- `docs/ros2-basics.md`: ROS 2 Fundamentals (Nodes, Topics, QoS, Launch Files)
  - rclpy examples: MinimalPublisher, MinimalSubscriber
  - QoS policy table, Package structure
- Quiz Generation: Run `python backend/skills/generate_quiz.py < docs/intro.md > docs/intro_with_quiz.md` (appends "## Check Your Understanding" with 5 questions)
- Validation: Verify Docusaurus admonitions (`:::note`), LaTeX equations, Mermaid renders correctly

**Phase 4: Interface (The "Face" 🎨)** - Docusaurus + React:
- Setup: `npx create-docusaurus@latest frontend classic` + npm deps (better-auth, react-markdown)
- Custom Hooks:
  - `useAuth.ts`: localStorage session management, login/logout
  - `useSkills.ts`: API calls to `/api/personalize` + `/api/translate` with loading states
- React Components:
  - `PersonalizeButton.tsx`: Toggles personalized ↔ original content
  - `TranslateButton.tsx`: Toggles Urdu ↔ English
  - `ChatWidget.tsx`: Floating chat (💬 icon → 350px×500px dialog)
- Integration: Swizzle `DocItem/Layout` to inject buttons + extract markdown content
- Validation (Manual E2E):
  1. Signup with python_knowledge=true
  2. Click "Personalize" → verify Python analogies appear
  3. Click "Show Original" → verify restoration
  4. Chat widget sends query → receives answer with sources

**Project Structure** (Monorepo):
```
physical-ai-textbook/
├── docs/                   # Phase 3 (Markdown chapters)
├── backend/
│   ├── skills/             # Phase 1 (CLI tools)
│   ├── api/                # Phase 2 (FastAPI routes)
│   ├── services/           # Phase 2 (Auth, Qdrant, SkillRunner)
│   └── models/             # Phase 2 (SQLAlchemy User)
├── frontend/               # Phase 4 (Docusaurus + React)
│   └── src/components/     # PersonalizeButton, TranslateButton, ChatWidget
└── tests/                  # Phase 1 TDD + Phase 2 API tests
```

**Code Samples Provided** (2100+ lines across phases):
- Complete skill implementations with error handling
- Full FastAPI backend (auth, skill runner, Qdrant, chat endpoint)
- React hooks + components with TypeScript interfaces
- Test files demonstrating TDD workflow

**Key Architectural Decisions**:
1. **Subprocess Pattern**: Skills invoked via `subprocess.run()` (aligns Constitution Principle II - CLI tools, not microservices)
2. **Ephemeral Personalization**: Generated per-request, not persisted (reduces storage, simplifies versioning)
3. **Server-Side Profile Fetch**: Token validation → DB query (security: profile never exposed client-side)
4. **Client-Side Rendering**: React state update → markdown parser → DOM replacement (no page refresh)

**Validation Criteria**:
- Phase 1: `pytest tests/skills/ -v` 100% pass rate
- Phase 2: curl tests (signup → login → personalize returns different content)
- Phase 3: Quizzes appended (5 questions each), Mermaid/LaTeX renders
- Phase 4: Manual E2E (personalize button changes text with user-specific analogies)

## Outcome

- ✅ Impact: Established detailed 4-phase implementation roadmap for Smart Textbook Platform MVP with Brain → Spine → Body → Face architecture
- 🧪 Tests: TDD workflow documented for Phase 1 (write tests → red → implement → green); API tests for Phase 2; E2E validation for Phase 4
- 📁 Files: Created specs/001-smart-textbook-platform/plan.md (2147 lines covering Phase 0-4, constitution check, project structure, complete code samples, validation criteria)
- 🔁 Next prompts: Run /sp.tasks to generate concrete, ordered implementation tasks based on this plan (after Phase 0 research complete)
- 🧠 Reflection: Phase metaphor ("Brain" skills, "Spine" infrastructure, "Body" content, "Face" interface) provides intuitive structure. TDD-first for skills (Phase 1) ensures reusable intelligence foundation. Subprocess pattern aligns perfectly with Constitution Principle II (CLI tools). Comprehensive code samples (400+ lines per phase) enable direct implementation without ambiguity.

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution check passed 7/7, all phases planned with validation criteria
- Graders run and results (PASS/FAIL): PASS - Constitution compliance 100%, technical context complete, unknowns identified in Phase 0, TDD workflow clear, code samples provided for direct implementation
- Prompt variant (if applicable): User-requested phased plan structure ("Brain → Spine → Body → Face") integrated seamlessly with standard planning template
- Next experiment (smallest change to try): For future plans, consider adding "anti-patterns to avoid" section for each phase (e.g., Phase 1: don't use direct imports instead of subprocess; Phase 2: don't expose profile in API payloads)
