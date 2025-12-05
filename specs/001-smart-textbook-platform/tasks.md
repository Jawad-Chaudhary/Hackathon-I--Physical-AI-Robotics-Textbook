# Tasks: Smart Textbook Platform with AI Agents

**Feature**: `001-smart-textbook-platform`
**Input**: Design documents from `/specs/001-smart-textbook-platform/`
**Prerequisites**: plan.md (✓), spec.md (✓)

**Organization**: Tasks are organized into 4 hackathon-focused phases to prioritize Agent Skills (bonus points) first, followed by infrastructure, content, and frontend integration.

## Format: `- [ ] [ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

## Phase 1: The Agent Skills (Priority - Bonus Points) 🧠

**Purpose**: Build the 3 mandatory AI agent skills as standalone CLI tools (50 bonus points)
**Validation**: Each skill must work independently via command line before backend integration

- [X] T001 Create `skills/` directory at project root
- [X] T002 [P] Create `tests/skills/` directory for skill tests
- [X] T003 [P] Create `skills/quiz_agent.py` with basic skeleton (stdin → stdout pattern)
- [X] T004 [P] Create `skills/translator_agent.py` with basic skeleton (stdin → stdout pattern)
- [X] T005 [P] Create `skills/personalize_agent.py` with basic skeleton (stdin → stdout pattern, JSON input)
- [X] T006 [P] Write test file `tests/skills/test_quiz_agent.py` (test quiz generation with sample markdown)
- [X] T007 [P] Write test file `tests/skills/test_translator_agent.py` (test Urdu translation preserves LaTeX/code)
- [X] T008 [P] Write test file `tests/skills/test_personalize_agent.py` (test personalization adapts to profile)
- [X] T009 Run `pytest tests/skills/ -v` and verify all tests FAIL (red phase)
- [X] T010 Implement `skills/quiz_agent.py` logic: Read markdown from stdin → Call OpenAI API with quiz generation prompt → Output markdown with appended 5-question quiz section to stdout
- [X] T011 Implement `skills/translator_agent.py` logic: Read markdown from stdin → Extract/preserve code blocks and LaTeX → Call OpenAI API for Urdu translation → Restore preserved blocks → Output to stdout
- [X] T012 Implement `skills/personalize_agent.py` logic: Read JSON from stdin (content + profile) → Build profile description → Call OpenAI API with personalization prompt → Output rewritten markdown to stdout
- [X] T013 Set environment variable `OPENAI_API_KEY` for testing
- [X] T014 Run `pytest tests/skills/ -v` and verify all tests PASS (green phase)
- [X] T015 Manual test: `echo "# Test Chapter\nContent here" | python skills/quiz_agent.py` (verify quiz appended)
- [X] T016 Manual test: `echo "# Test\nContent" | python skills/translator_agent.py` (verify Urdu output)
- [X] T017 Manual test: `echo '{"content":"# Test","profile":{"python_knowledge":true}}' | python skills/personalize_agent.py` (verify personalized output)

**Checkpoint**: All 3 skills work as standalone CLI tools ✅

---

## Phase 2: Backend Infrastructure (The "Spine") 🦴

**Purpose**: FastAPI backend with auth, database, vector store, and API endpoints
**Dependencies**: Phase 1 complete (skills ready for subprocess invocation)

### Setup & Configuration

- [X] T018 Create `backend/` directory at project root
- [X] T019 Create `backend/requirements.txt` with dependencies: `fastapi`, `uvicorn`, `qdrant-client`, `openai`, `psycopg[binary]`, `sqlalchemy`, `passlib`, `python-jose[cryptography]`, `python-multipart`
- [X] T020 Create `backend/.env.example` template with keys: `DATABASE_URL`, `QDRANT_URL`, `QDRANT_API_KEY`, `OPENAI_API_KEY`, `JWT_SECRET_KEY`
- [X] T021 Run `pip install -r backend/requirements.txt` to install dependencies
- [X] T022 Create `backend/config.py` to load environment variables using `os.getenv()`

### Database Setup (Neon Postgres)

- [X] T023 Create `backend/database.py` with SQLAlchemy engine, SessionLocal, Base, and get_db() dependency
- [X] T024 Create `backend/models/` directory
- [X] T025 Create `backend/models/user.py` with User model (id, email, password_hash, python_knowledge, has_nvidia_gpu, experience_level enum, created_at)
- [X] T026 Create `backend/migrations/` directory
- [X] T027 Create `backend/migrations/001_create_users_table.sql` with CREATE TABLE statement for users table
- [X] T028 Manually run migration SQL against Neon database (or use SQLAlchemy Base.metadata.create_all)

### Authentication (Better-Auth Pattern with JWT)

- [X] T029 Create `backend/services/` directory
- [X] T030 Create `backend/services/auth_service.py` with functions: hash_password(), verify_password(), create_access_token(), validate_token(), create_user()
- [X] T031 Create `backend/models/auth_schemas.py` with Pydantic models: SignupRequest, LoginRequest, TokenResponse
- [X] T032 Create `backend/api/` directory
- [X] T033 Create `backend/api/auth.py` with router, POST `/auth/signup` endpoint (creates user, returns JWT token)
- [X] T034 Add POST `/auth/login` endpoint to `backend/api/auth.py` (validates credentials, returns JWT token)

### Qdrant Vector Store Setup

- [X] T035 Create `backend/services/embeddings_service.py` with QdrantClient initialization
- [X] T036 Implement setup_collection() function in embeddings_service.py (creates collection with 1536 dimensions, COSINE distance)
- [X] T037 Implement embed_text() function using OpenAI `text-embedding-ada-002` model
- [X] T038 Implement search_similar() function (embeds query, searches Qdrant, returns top results)

### Subprocess Skill Runner

- [X] T039 Create `backend/services/skill_runner.py` with SkillRunner class
- [X] T040 Implement SkillRunner.run_quiz_generator() method (subprocess invocation of skills/quiz_agent.py)
- [X] T041 Implement SkillRunner.run_translator() method (subprocess invocation of skills/translator_agent.py)
- [X] T042 Implement SkillRunner.run_personalizer() method (subprocess invocation of skills/personalize_agent.py with JSON input)

### API Endpoints

- [X] T043 Create `backend/models/skill_request.py` with Pydantic schemas: PersonalizeRequest, PersonalizeResponse, TranslateRequest, TranslateResponse
- [X] T044 Create `backend/api/personalize.py` with router, POST `/api/personalize` endpoint (validates JWT, fetches user profile, invokes personalizer skill, returns personalized content)
- [X] T045 Create `backend/api/translate.py` with router, POST `/api/translate` endpoint (validates JWT, invokes translator skill, returns translated content)
- [X] T046 Create `backend/models/chat_schemas.py` with Pydantic models: ChatRequest, ChatResponse
- [X] T047 Create `backend/api/chat.py` with router, POST `/chat` endpoint (validates JWT, searches Qdrant, generates answer with OpenAI, returns answer + sources)
- [X] T048 Implement OpenAI chatbot logic in chat.py (use GPT-4 with system prompt for robotics tutor, include citations)

### FastAPI Main App

- [X] T049 Create `backend/main.py` with FastAPI app initialization
- [X] T050 Add CORS middleware to main.py (allow localhost:3000 for Docusaurus dev server)
- [X] T051 Register all routers in main.py (auth, chat, personalize, translate)
- [X] T052 Add database table creation on startup in main.py (Base.metadata.create_all)
- [X] T053 Add Qdrant collection setup on startup in main.py (call setup_collection())
- [X] T054 Add root endpoint GET `/` returning API info JSON

### Backend Testing & Validation

- [X] T055 Start backend server: `cd backend && uvicorn main:app --reload`
- [X] T056 Test signup endpoint: `curl -X POST http://localhost:8000/auth/signup -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123","python_knowledge":true,"has_nvidia_gpu":false}'`
- [X] T057 Test login endpoint: `curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'` (save returned token)
- [X] T058 Test personalize endpoint: `curl -X POST http://localhost:8000/api/personalize -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"chapter_slug":"intro","content":"# ROS 2\nNodes perform computation."}'`
- [X] T059 Test translate endpoint: `curl -X POST http://localhost:8000/api/translate -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d '{"chapter_slug":"intro","content":"# ROS 2\nNodes are processes."}'`

**Checkpoint**: Backend API fully functional with all endpoints responding ✅

---

## Phase 3: The Content (Module 1) 📚

**Purpose**: Initialize Docusaurus and create textbook content for Module 1
**Dependencies**: Phase 1 complete (quiz_agent.py ready to generate quizzes)

### Docusaurus Initialization

- [X] T060 Run `npx create-docusaurus@latest my-textbook classic` to create Docusaurus project
- [X] T061 Move generated files from `my-textbook/` to project root (or keep as `frontend/` directory - align with plan.md structure)
- [X] T062 Delete default sample docs in `docs/` directory
- [X] T063 Create `docs/module-01/` directory

### Write Chapter Content

- [X] T064 Create `docs/module-01/intro.md` with content:
  - Learning objectives admonition (:::note)
  - Section: "What is Physical AI?" (prose with Mermaid diagram showing sensor-brain-actuator loop)
  - Section: "Why ROS 2?" (benefits list, comparison table)
  - Section: "Course Roadmap" (Mermaid diagram of modules)
  - Further Reading section with citations
- [X] T065 Create `docs/module-01/ros2-nodes.md` with content:
  - Learning objectives admonition
  - Section: "Nodes: The Building Blocks" (concept explanation)
  - Section: "Creating Your First Node" (full rclpy publisher example with explanation)
  - Section: "Quality of Service (QoS)" (table of policies, code example)
  - Section: "Subscriber Example" (full rclpy subscriber code)
  - Section: "Python Launch Files" (launch file example with explanation)
  - Section: "Package Structure" (directory tree diagram, package.xml excerpt)
  - Further Reading section
- [X] T066 Verify all code examples use ROS 2 Humble syntax (`rclpy`, not `rospy`)
- [X] T067 Verify LaTeX math syntax is correct (inline `$...$` and block `$$...$$`)
- [X] T068 Verify Mermaid diagrams render correctly in Docusaurus

### Generate Quizzes Using Agent Skill

- [X] T069 Run `python skills/quiz_agent.py < docs/module-01/intro.md > docs/module-01/intro_with_quiz.md` to generate quiz
- [X] T070 Replace original file: `mv docs/module-01/intro_with_quiz.md docs/module-01/intro.md`
- [X] T071 Run `python skills/quiz_agent.py < docs/module-01/ros2-nodes.md > docs/module-01/ros2_with_quiz.md` to generate quiz
- [X] T072 Replace original file: `mv docs/module-01/ros2_with_quiz.md docs/module-01/ros2-nodes.md`
- [X] T073 Open `docs/module-01/intro.md` and verify "## Check Your Understanding" section exists with 5 questions in Docusaurus admonition format
- [X] T074 Open `docs/module-01/ros2-nodes.md` and verify quiz section exists with 5 questions

### Docusaurus Configuration

- [X] T075 Edit `docusaurus.config.js` to set title: "Physical AI & Humanoid Robotics"
- [X] T076 Edit `docusaurus.config.js` to set tagline: "Interactive Learning with AI Agents"
- [X] T077 Configure docs path in `docusaurus.config.js` to point to `docs/` directory
- [X] T078 Edit `sidebars.js` to create sidebar structure with "Module 1" category containing intro and ros2-nodes
- [X] T079 Enable Mermaid plugin in `docusaurus.config.js` (add to presets or themes config)
- [X] T080 Enable math equations plugin in `docusaurus.config.js` (KaTeX or MathJax)

### Content Validation

- [X] T081 Start Docusaurus dev server: `npm start` (or `cd frontend && npm start`)
- [X] T082 Open browser to `http://localhost:3000` and verify landing page loads
- [X] T083 Navigate to "Module 1 > Introduction" and verify content renders with Mermaid diagrams and LaTeX math
- [X] T084 Navigate to "Module 1 > ROS 2 Nodes" and verify code syntax highlighting works
- [X] T085 Verify quiz sections render correctly with Docusaurus admonitions (:::note Question N)

**Checkpoint**: Docusaurus site running with 2 complete chapters including quizzes ✅

---

## Phase 4: Frontend Integration (The "Face") 🎨

**Purpose**: React components for chat, personalization, and translation integrated into Docusaurus
**Dependencies**: Phase 2 complete (backend APIs), Phase 3 complete (Docusaurus site)

### Install Frontend Dependencies

- [X] T086 Run `npm install react-markdown` in frontend directory
- [X] T087 Run `npm install` to ensure all Docusaurus dependencies are installed

### Custom Hooks for API Integration

- [X] T088 Create `src/hooks/` directory
- [X] T089 Create `src/hooks/useAuth.ts` with useAuth() hook (manages JWT token in localStorage, provides login/logout/user state)
- [X] T090 Implement login() function in useAuth.ts (POST to `/auth/login`, stores token)
- [X] T091 Implement logout() function in useAuth.ts (clears localStorage)
- [X] T092 Create `src/hooks/useSkills.ts` with useSkills() hook
- [X] T093 Implement personalizeChapter() function in useSkills.ts (POST to `/api/personalize` with Authorization header)
- [X] T094 Implement translateChapter() function in useSkills.ts (POST to `/api/translate` with Authorization header)
- [X] T095 Create `src/hooks/useChat.ts` with useChat() hook (manages chat state, sends messages to `/chat` endpoint)

### React Components

- [X] T096 Create `src/components/` directory
- [X] T097 Create `src/components/PersonalizeButton.tsx` component (renders button, calls personalizeChapter on click, toggles between "Personalize" and "Show Original")
- [X] T098 Add loading state to PersonalizeButton (show "Personalizing..." during API call)
- [X] T099 Add error handling to PersonalizeButton (display alert on API failure)
- [X] T100 Create `src/components/TranslateButton.tsx` component (renders button, calls translateChapter on click, toggles between "Read in Urdu" and "Show English")
- [X] T101 Add loading state to TranslateButton (show "Translating..." during API call)
- [X] T102 Add error handling to TranslateButton (display alert on API failure)
- [X] T103 Create `src/components/ChatWidget.tsx` component (floating button at bottom-right, opens chat dialog)
- [X] T104 Implement chat dialog UI in ChatWidget.tsx (header with close button, message list, input field, send button)
- [X] T105 Implement sendMessage() function in ChatWidget.tsx (calls `/chat` endpoint, displays response in message list)
- [X] T106 Add loading state to ChatWidget (disable input during API call)
- [X] T107 Style ChatWidget with CSS (fixed position, z-index 1000, white background, shadow, rounded corners)

### Swizzle Docusaurus to Integrate Components

- [X] T108 Run `npm run swizzle @docusaurus/theme-classic DocItem/Layout -- --wrap` to create custom layout wrapper
- [X] T109 Edit `src/theme/DocItem/Layout/index.tsx` to import PersonalizeButton, TranslateButton, ChatWidget components
- [X] T110 Add PersonalizeButton and TranslateButton to top of page in Layout wrapper (above document content)
- [X] T111 Add ChatWidget to Layout wrapper (renders at bottom-right of all pages)
- [X] T112 Implement content state management in Layout wrapper (originalContent, currentContent, setContent callback)
- [X] T113 Connect PersonalizeButton onContentChange callback to replace rendered markdown
- [X] T114 Connect TranslateButton onContentChange callback to replace rendered markdown
- [X] T115 Add conditional rendering: only show buttons if user is authenticated (useAuth().isAuthenticated)

### Authentication UI

- [X] T116 Create `src/pages/login.tsx` page component with login form (email, password fields)
- [X] T117 Implement form submission in login.tsx (calls useAuth().login(), redirects to docs on success)
- [X] T118 Create `src/pages/signup.tsx` page component with signup form (email, password, "Do you know Python?", "Do you have an NVIDIA GPU?")
- [X] T119 Implement form submission in signup.tsx (POST to `/auth/signup`, stores token, redirects to docs)
- [X] T120 Add "Login" and "Sign Up" links to Docusaurus navbar in `docusaurus.config.js`
- [X] T121 Add user email display and "Logout" button to navbar (conditionally rendered when authenticated)

### Styling

- [X] T122 Create `src/css/custom.css` with custom styles for buttons and chat widget
- [X] T123 Style PersonalizeButton (blue background, white text, rounded corners, 10px margin-right)
- [X] T124 Style TranslateButton (green background, white text, rounded corners)
- [X] T125 Add hover effects to buttons (darker background on hover)
- [X] T126 Add disabled state styling (gray background, cursor wait)

### Frontend Testing & Validation

- [X] T127 Ensure backend is running: `cd backend && uvicorn main:app --reload`
- [X] T128 Start Docusaurus dev server: `npm start`
- [X] T129 Open browser to `http://localhost:3000` and click "Sign Up"
- [X] T130 Complete signup form with email, password, python_knowledge=true, has_nvidia_gpu=false
- [X] T131 Verify redirect to docs and token stored in localStorage (check browser dev tools)
- [X] T132 Navigate to "Module 1 > Introduction" page
- [X] T133 Verify "Personalize" and "Read in Urdu" buttons appear at top of page
- [X] T134 Click "Personalize" button and verify loading state appears ("Personalizing...")
- [X] T135 Verify personalized content appears with Python-specific analogies (e.g., "like Python generators")
- [X] T136 Click "Show Original" and verify original content is restored
- [X] T137 Click "Read in Urdu" button and verify translated content appears (Urdu text with preserved code/LaTeX)
- [X] T138 Click "Show English" and verify original content is restored
- [X] T139 Click floating chat button at bottom-right and verify chat dialog opens
- [X] T140 Type question in chat input: "What is a ROS 2 node?" and click Send
- [X] T141 Verify chatbot response appears with source citations (e.g., "See Chapter 1.2: ROS 2 Nodes")
- [X] T142 Test Select-to-Ask: highlight text on page (if implemented - optional for MVP)

**Checkpoint**: Full end-to-end flow working - signup, login, personalize, translate, chat ✅

---

## Phase 5: Final Polish & Deployment Prep

**Purpose**: Documentation, cleanup, and deployment preparation

- [X] T143 Create `README.md` at project root with project overview, setup instructions, and feature list
- [X] T144 Document environment variables in README.md (Neon DATABASE_URL, Qdrant credentials, OpenAI API key)
- [X] T145 Create `.gitignore` file with patterns: `node_modules/`, `__pycache__/`, `.env`, `*.pyc`, `.DS_Store`, `build/`, `.docusaurus/`
- [X] T146 Create `backend/.env` from `.env.example` with actual credentials (DO NOT COMMIT)
- [X] T147 Add security note to README.md: "Never commit `.env` file to version control"
- [X] T148 Test full workflow one more time from clean state (signup → personalize → translate → chat)
- [X] T149 Take screenshots of working features for documentation (placeholder section added to README)
- [X] T150 Write deployment notes for backend (Railway/Render instructions)
- [X] T151 Write deployment notes for frontend (Vercel/Netlify instructions)
- [X] T152 Document OpenAI API cost estimates and rate limiting strategy in README.md

**Checkpoint**: Project complete and ready for hackathon submission 🎉

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 1 (Agent Skills)**: No dependencies - START HERE ⭐
2. **Phase 2 (Backend)**: Depends on Phase 1 complete (skills exist for subprocess invocation)
3. **Phase 3 (Content)**: Depends on Phase 1 complete (quiz_agent.py needed), can run in parallel with Phase 2 early tasks
4. **Phase 4 (Frontend)**: Depends on Phase 2 complete (APIs exist) AND Phase 3 complete (Docusaurus site exists)
5. **Phase 5 (Polish)**: Depends on all previous phases complete

### Parallel Opportunities

**Within Phase 1**:
- T003, T004, T005 (create skill files) can run in parallel
- T006, T007, T008 (create test files) can run in parallel after T002
- T010, T011, T012 (implement skills) can run in parallel after T009

**Within Phase 2**:
- T033, T044, T045 (API endpoint files) can run in parallel after auth service is ready
- Database setup (T023-T028) and Qdrant setup (T035-T038) can run in parallel

**Within Phase 3**:
- T064, T065 (write chapters) can run in parallel
- T069-T072 (quiz generation) can run in parallel after chapters exist

**Within Phase 4**:
- T089, T092, T095 (custom hooks) can run in parallel after T088
- T097, T100, T103 (component files) can run in parallel after T096

---

## Implementation Strategy

### Recommended Execution Order (Sequential, MVP-focused)

1. **Phase 1** (T001-T017): Complete all agent skills with TDD → VALIDATE
2. **Phase 2** (T018-T059): Complete backend infrastructure → VALIDATE
3. **Phase 3** (T060-T085): Complete content creation → VALIDATE
4. **Phase 4** (T086-T142): Complete frontend integration → VALIDATE
5. **Phase 5** (T143-T152): Final polish and documentation

### Checkpoint Validations

- ✅ **After Phase 1**: All 3 skills work as CLI tools (can manually test with echo/pipe)
- ✅ **After Phase 2**: All API endpoints respond correctly (test with curl)
- ✅ **After Phase 3**: Docusaurus site displays 2 chapters with quizzes
- ✅ **After Phase 4**: Full user flow works (signup → login → personalize → translate → chat)
- ✅ **After Phase 5**: Project documented and deployment-ready

---

## Notes

- **Constitution Compliance**: All tasks align with Physical AI & Humanoid Robotics Constitution v1.0.0 (see plan.md for detailed compliance check)
- **Hackathon Priority**: Phase 1 (Agent Skills) delivers 50 bonus points - complete this first!
- **TDD for Skills**: Tasks T006-T009 ensure tests are written and fail before implementation (red-green-refactor cycle)
- **Ephemeral Personalization**: Personalized/translated content is NOT saved to disk (generated per-request)
- **Error Handling**: All API endpoints should handle errors gracefully (see tasks T099, T102, T106)
- **Security**: JWT tokens are validated on all protected endpoints (see tasks T044, T045, T047)
- **Testing Strategy**: Manual testing via curl (backend) and browser (frontend) - automated tests are bonus but not required for MVP

---

**Total Tasks**: 152
**Estimated Completion Time**: 12-16 hours for experienced developer (hackathon timeline)
**MVP Scope**: Phases 1-4 (Tasks T001-T142)
**Stretch Goals**: Phase 5 polish, Select-to-Ask UI enhancement, answer tracking for quizzes

**Ready to implement!** Start with Phase 1 to maximize hackathon bonus points. 🚀
