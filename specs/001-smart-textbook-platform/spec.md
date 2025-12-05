# Feature Specification: Smart Textbook Platform with AI Agents

**Feature Branch**: `001-smart-textbook-platform`
**Created**: 2025-12-03
**Status**: Draft
**Input**: User description: "Physical AI Textbook with Agents, RAG, and Auth - Building a smart textbook that adapts to the user with content, backend infrastructure, and Agent Skills"

## Clarifications

### Session 2025-12-03

- Q: How will the frontend retrieve the user's "Hardware/Software Profile" from the database when a user clicks "Personalize"? → A: Better-Auth provides a session token in cookies/headers; FastAPI validates token and extracts user_id to query Postgres directly (server-side profile fetch)
- Q: What specific JSON payload will be sent to the `/api/personalize` endpoint? → A: `{ "chapter_slug": "intro", "content": "<markdown_text>" }` (frontend sends chapter identifier and markdown; backend fetches profile server-side)
- Q: How will the `skills/personalizer_agent.py` script be invoked by the FastAPI backend? → A: Subprocess invocation via Python's `subprocess.run()` (CLI tool pattern: pass markdown via stdin, read result from stdout)
- Q: How will the rewritten markdown be rendered back on the screen without refreshing the page? → A: Client-side DOM replacement (React state update: fetch personalized markdown → parse to HTML → replace chapter content div)
- Q: Should the complete personalization data flow be documented in the spec as a sequence diagram or step-by-step walkthrough? → A: Add step-by-step walkthrough in new "Data Flow" section (numbered sequence with actor → action → result format)

## Data Flow

### Personalization Request Flow (User Story 3)

This walkthrough describes the complete technical sequence when a user clicks "Personalize" on a chapter:

1. **User Action**: Authenticated user viewing "Chapter 1: Introduction to ROS 2" clicks the "Personalize" button
   - **Frontend State**: User session contains Better-Auth token (stored in cookies/localStorage)
   - **Chapter State**: Original markdown content loaded in React component state

2. **Frontend Request Preparation**: React component extracts chapter data
   - **Action**: Read current chapter markdown from DOM or component state
   - **Action**: Extract chapter slug from URL or metadata (e.g., "intro")
   - **Action**: Construct JSON payload: `{ "chapter_slug": "intro", "content": "<full_chapter_markdown>" }`

3. **API Request**: Frontend sends POST to `/api/personalize`
   - **Headers**: `Authorization: Bearer <session_token>` (or token in cookies)
   - **Body**: JSON payload from step 2
   - **Result**: Async fetch initiated, UI shows loading state ("Personalizing...")

4. **Backend Authentication**: FastAPI middleware validates request
   - **Action**: Extract session token from request headers/cookies
   - **Action**: Validate token with Better-Auth library
   - **Result**: If invalid → Return 401 Unauthorized; If valid → Extract `user_id` and proceed

5. **Backend Profile Retrieval**: FastAPI queries database
   - **Action**: Execute SQL query: `SELECT python_knowledge, has_nvidia_gpu, experience_level FROM users WHERE id = <user_id>`
   - **Result**: Retrieve profile object: `{ "python_knowledge": true, "has_nvidia_gpu": false, "experience_level": "intermediate" }`

6. **Backend Skill Invocation**: FastAPI calls personalizer agent
   - **Action**: Prepare stdin input combining markdown + profile as JSON: `{ "content": "<markdown>", "profile": { ... } }`
   - **Action**: Execute subprocess: `subprocess.run(["python", "skills/personalizer_agent.py"], input=stdin_json, capture_output=True, text=True)`
   - **Result**: Agent processes markdown, returns personalized version to stdout

7. **Agent Processing**: `skills/personalizer_agent.py` executes
   - **Action**: Parse stdin JSON to extract content and profile
   - **Action**: Send markdown + profile to OpenAI Agents SDK with prompt: "Rewrite this robotics content for a user with Python knowledge, no GPU. Use Python analogies."
   - **Action**: Receive rewritten markdown from AI model
   - **Result**: Output personalized markdown to stdout, exit code 0

8. **Backend Response**: FastAPI returns result to frontend
   - **Action**: Capture stdout from subprocess (personalized markdown)
   - **Action**: Construct JSON response: `{ "personalized_content": "<rewritten_markdown>", "chapter_slug": "intro" }`
   - **Result**: Return 200 OK with JSON body

9. **Frontend Rendering**: React component updates UI
   - **Action**: Receive API response, extract `personalized_content`
   - **Action**: Parse markdown to HTML using markdown parser (e.g., `react-markdown` or `remark`)
   - **Action**: Update React state: `setChapterContent(parsedHTML)`
   - **Result**: React re-renders, replacing original chapter content with personalized version (no page refresh)

10. **User Experience**: Personalized chapter displayed
    - **Visual**: Chapter now includes Python-specific analogies (e.g., "ROS 2 publishers work like Python generators")
    - **Visual**: Loading state removed, "Personalize" button may change to "Show Original"
    - **State**: Original content not modified on filesystem (ephemeral personalization)

### Translation Request Flow (User Story 4)

Similar sequence for "Read in Urdu" button, with these differences:
- **Step 4**: No profile retrieval needed (translation is not user-specific)
- **Step 6**: Invoke `skills/translator_agent.py` instead of personalizer
- **Step 7**: Agent translates text to Urdu while preserving LaTeX/code blocks
- **Step 9**: Frontend may apply RTL text direction CSS for Urdu rendering

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Student Onboarding with Background Capture (Priority: P1)

A new student arrives at the textbook site wanting to access personalized learning content tailored to their existing technical background and hardware capabilities.

**Why this priority**: Foundation for all personalization features. Without user profiles, the platform cannot adapt content. This is the entry point that enables all other adaptive features.

**Independent Test**: Can be fully tested by completing signup with different background combinations (Python+GPU, C++, No background) and verifying profile data is stored correctly in database.

**Acceptance Scenarios**:

1. **Given** a new visitor arrives at the textbook site, **When** they click "Get Started", **Then** they are presented with a signup form asking for email, password, and two background questions: "Do you know Python?" and "Do you have an NVIDIA GPU?"
2. **Given** a user completes the signup form with their background selections, **When** they submit the form, **Then** their account is created in Neon Postgres with profile fields stored (email, hashed password, python_knowledge: boolean, has_nvidia_gpu: boolean, experience_level)
3. **Given** a user has signed up, **When** they log in on subsequent visits, **Then** their session is authenticated via Better-Auth and their profile data is available for personalization

---

### User Story 2 - Interactive Reading with Select-to-Ask (Priority: P1)

A student reading a chapter encounters a confusing concept and wants immediate clarification without leaving the page or losing context.

**Why this priority**: Core learning experience. The Select-to-Ask RAG chatbot is the primary differentiation from static textbooks. Students need this to overcome learning blockers in real-time.

**Independent Test**: Can be tested by highlighting any text passage, clicking "Ask AI", and verifying the chatbot returns a relevant answer with source citations from the textbook.

**Acceptance Scenarios**:

1. **Given** a student is reading a chapter on Forward Kinematics, **When** they highlight the text "Denavit-Hartenberg parameters", **Then** a tooltip appears with "Ask AI" option
2. **Given** the student clicks "Ask AI" on highlighted text, **When** the chatbot processes the query, **Then** it returns an explanation in under 2 seconds with citations to specific textbook sections (e.g., "See Chapter 3.2: D-H Convention")
3. **Given** the student has a profile indicating C++ background, **When** they ask about ROS 2 nodes, **Then** the chatbot adapts the explanation: "Think of ROS 2 nodes like C++ objects with message-passing interfaces"
4. **Given** the student clicks the floating chat widget at any time, **When** they type a question, **Then** the chatbot searches the Qdrant vector store and returns contextually relevant answers from the textbook embeddings

---

### User Story 3 - Content Personalization (Priority: P2)

A student with advanced Python knowledge wants explanations tailored to their background, avoiding redundant basics and using familiar analogies.

**Why this priority**: Enhances learning efficiency. Once the core reading experience (P1) works, personalization makes content more engaging and time-efficient for experienced learners.

**Independent Test**: Can be tested by clicking "Personalize" on any chapter with different user profiles and verifying the rewritten content adapts tone and analogies appropriately.

**Acceptance Scenarios**:

1. **Given** a student with Python background is viewing Chapter 1: Introduction to ROS 2, **When** they click the "Personalize" button at the top of the chapter, **Then** the backend triggers `skills/personalizer_agent.py` with their profile data
2. **Given** the personalizer agent receives the chapter markdown and profile (python_knowledge=true), **When** it rewrites the content, **Then** it replaces generic code examples with Python-centric analogies (e.g., "ROS 2 publishers are like Python generators yielding messages")
3. **Given** the personalized content is generated, **When** it is displayed to the student, **Then** the original chapter remains unchanged in the docs directory (personalization is ephemeral/session-based)

---

### User Story 4 - Multilingual Support with Urdu Translation (Priority: P2)

A student whose primary language is Urdu wants to read the textbook in their native language while preserving technical formatting and code examples.

**Why this priority**: Accessibility and inclusivity. Expands the textbook's reach to non-English speakers. Lower priority than core learning features but critical for target audience.

**Independent Test**: Can be tested by clicking "Read in Urdu" on any chapter and verifying the translation preserves LaTeX equations, code blocks, and Docusaurus admonitions.

**Acceptance Scenarios**:

1. **Given** a student is viewing any chapter, **When** they click the "Read in Urdu" button at the top, **Then** the frontend sends the chapter markdown to `/api/translate`
2. **Given** the translator agent receives the markdown, **When** it translates the content, **Then** it preserves:
   - LaTeX equations (e.g., `$F = ma$` remains unchanged)
   - Code blocks (ROS 2 code stays in English)
   - Docusaurus admonitions (structure intact, only inner text translated)
   - Mermaid.js diagrams (node labels translated, syntax preserved)
3. **Given** the translation is complete, **When** the student views the Urdu version, **Then** the reading experience is seamless with proper RTL (right-to-left) text rendering where appropriate

---

### User Story 5 - Self-Assessment with Auto-Generated Quizzes (Priority: P3)

A student finishes reading a chapter and wants to test their understanding with practice questions before moving to the next topic.

**Why this priority**: Reinforces learning but not blocking. Students can learn without quizzes, but quizzes improve retention. Can be added after core reading experience is solid.

**Independent Test**: Can be tested by running `skills/quiz_agent.py` on any chapter markdown file and verifying it appends a "Check Your Understanding" section with 5 contextually relevant questions.

**Acceptance Scenarios**:

1. **Given** a chapter exists at `docs/kinematics/forward-kinematics.md`, **When** the content team runs `python skills/quiz_agent.py docs/kinematics/forward-kinematics.md`, **Then** the agent reads the chapter and generates 5 multiple-choice questions covering key concepts
2. **Given** the quiz questions are generated, **When** the agent appends them to the file, **Then** the format matches Docusaurus syntax:
   ```markdown
   ## Check Your Understanding

   :::note Question 1
   What is the purpose of the Denavit-Hartenberg convention?
   A) [...]
   B) [...]
   :::
   ```
3. **Given** the chapter now has quiz questions, **When** a student views the chapter, **Then** the quiz appears at the end with interactive UI (future: could track answers in Postgres)

---

### Edge Cases

- **What happens when a user highlights code blocks?** The Select-to-Ask feature should detect code context and respond with code-specific explanations (e.g., "This rclpy code initializes a ROS 2 node")
- **How does the system handle rate limiting for AI API calls?** Backend implements per-user rate limits (e.g., 20 chatbot queries per hour) to prevent abuse and manage OpenAI API costs
- **What if a translation fails midway (API timeout)?** The frontend displays the original English version with an error notification: "Translation temporarily unavailable"
- **How does personalization work for users without profiles (guest readers)?** Personalization and translation buttons are hidden for unauthenticated users; they see default content only
- **What happens when embeddings are out of sync with content?** A background job re-embeds modified chapters nightly; the chatbot includes a disclaimer if embeddings are >7 days old

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide user signup via Better-Auth with fields: email, password, "Do you know Python?" (boolean), "Do you have an NVIDIA GPU?" (boolean)
- **FR-002**: System MUST store user profiles in Neon Serverless Postgres with schema: users(id, email, password_hash, python_knowledge, has_nvidia_gpu, experience_level, created_at)
- **FR-003**: System MUST implement text selection API on all chapter pages using `window.getSelection()` to capture highlighted text and display "Ask AI" tooltip
- **FR-004**: System MUST provide `/chat` endpoint using OpenAI Agents SDK that accepts user query + selected text context and returns AI-generated answers with source citations
- **FR-005**: System MUST store textbook chapter embeddings in Qdrant Cloud vector store, chunked by section (heading level 2 and below)
- **FR-006**: System MUST provide `/api/translate` endpoint that accepts JSON payload `{ "chapter_slug": string, "content": string }` where content is chapter markdown; endpoint returns Urdu translation via `skills/translator_agent.py`
- **FR-007**: System MUST provide `/api/personalize` endpoint that accepts JSON payload `{ "chapter_slug": string, "content": string }` where content is chapter markdown; endpoint validates session token, retrieves user profile from Postgres by user_id, and returns adapted content via `skills/personalizer_agent.py`
- **FR-008**: System MUST implement three agent skills as standalone Python CLI tools invoked via subprocess (stdin for input, stdout for output):
  - `skills/quiz_agent.py`: Reads chapter markdown from stdin, outputs markdown with appended 5-question quiz to stdout
  - `skills/translator_agent.py`: Reads markdown from stdin, outputs Urdu translation to stdout (preserves formatting)
  - `skills/personalizer_agent.py`: Reads markdown + JSON profile from stdin, outputs rewritten content to stdout
- **FR-009**: Frontend MUST display floating chat widget (React component) on all pages, connected to `/chat` endpoint
- **FR-010**: Frontend MUST add "Personalize" and "Read in Urdu" buttons at the top of every chapter page
- **FR-010a**: Frontend MUST implement client-side rendering for personalized/translated content via React state updates; when API returns markdown, frontend parses to HTML and replaces chapter content div without page refresh
- **FR-011**: System MUST provide initial textbook content with at least `docs/intro.md` and `docs/ros2-basics.md` chapters using Docusaurus admonitions, LaTeX math, and Mermaid.js diagrams
- **FR-012**: All ROS 2 code examples MUST target ROS 2 Humble Hawksbill with `rclpy` (not ROS 1 `rospy`)
- **FR-013**: Chatbot responses MUST cite specific textbook sections with format: "See Chapter X.Y: [Section Title]" and include clickable links
- **FR-014**: Personalized and translated content MUST be ephemeral (not persisted to docs directory), generated per-request
- **FR-015**: System MUST implement authentication middleware to protect `/api/personalize` and `/api/translate` endpoints; middleware validates Better-Auth session token from request cookies/headers and rejects requests with invalid or missing tokens (returns 401 Unauthorized)

### Key Entities

- **User**: Represents a learner with profile attributes (id, email, password_hash, python_knowledge: boolean, has_nvidia_gpu: boolean, experience_level: enum[beginner, intermediate, advanced], created_at)
- **Chapter**: Textbook content unit stored as markdown in `docs/` directory (file_path, title, slug, content, last_modified, embedding_status)
- **Embedding**: Vector representation of chapter sections stored in Qdrant (vector_id, chapter_slug, section_title, text_chunk, embedding_vector[1536], metadata)
- **ChatMessage**: User-chatbot interaction log (id, user_id, query_text, selected_context, response_text, sources: array, timestamp, personalized: boolean)
- **AgentSkill**: Python CLI tool for content operations (skill_name, script_path, input_format, output_format, test_coverage)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Students can complete account signup in under 60 seconds with background questions included
- **SC-002**: Select-to-Ask chatbot returns relevant answers in under 2 seconds for 95% of queries
- **SC-003**: Chatbot answers cite specific textbook sections with 90% accuracy (validated via spot-checks)
- **SC-004**: Translation to Urdu preserves all LaTeX equations, code blocks, and admonitions with 100% structural integrity
- **SC-005**: Personalized content includes at least 3 user-specific analogies per chapter based on profile metadata
- **SC-006**: Quiz agent generates 5 contextually relevant questions per chapter with 80% student satisfaction (measured via feedback)
- **SC-007**: System supports at least 100 concurrent users reading and chatting without performance degradation
- **SC-008**: Page load time for textbook chapters remains under 1 second (excluding chat API latency)
- **SC-009**: Agent skills (quiz, translator, personalizer) complete processing within 5 seconds for average chapter length (2000 words)
- **SC-010**: Students using personalized content report 40% faster comprehension in user surveys compared to default content

## Assumptions

- **ASMP-001**: Target audience includes robotics students with varying programming backgrounds (Python, C++, MATLAB, or none)
- **ASMP-002**: Average chapter length is 1500-2500 words with 3-5 code examples
- **ASMP-003**: Urdu is the primary non-English language; future languages can be added by creating new translator agent variants
- **ASMP-004**: User profiles are collected at signup; no dynamic profile updates during sessions initially
- **ASMP-005**: Embeddings are regenerated nightly for modified chapters via cron job (not real-time)
- **ASMP-006**: Personalization and translation are session-based (not cached/persisted) to reduce storage costs
- **ASMP-007**: OpenAI API rate limits are sufficient for expected user load (100 concurrent users × 5 queries/hour = 500 API calls/hour)
- **ASMP-008**: Better-Auth is configured for email/password authentication (no OAuth providers in MVP)
- **ASMP-009**: All agent skills are invoked synchronously via subprocess from HTTP endpoints using `subprocess.run()` (no background job queue or async processing initially)
- **ASMP-010**: Qdrant Cloud free tier provides sufficient vector storage for initial 20-30 chapters

## Scope

### In Scope

- User authentication with Better-Auth (email/password + background questions)
- RAG chatbot with Select-to-Ask UI and Qdrant vector search
- Three agent skills: quiz generation, Urdu translation, content personalization
- FastAPI backend with `/chat`, `/api/translate`, `/api/personalize` endpoints
- Docusaurus frontend with floating chat widget and chapter control buttons
- Initial textbook content (2 chapters: intro + ROS 2 basics)
- User profile storage in Neon Postgres
- Chapter embedding pipeline (manual trigger or nightly cron)

### Out of Scope

- Real-time collaborative editing of textbook content
- Student progress tracking and analytics dashboard (future feature)
- Interactive code execution environment (Jupyter-style notebooks)
- Video/audio content integration
- Mobile native apps (iOS/Android)
- OAuth social login providers (Google, GitHub)
- Quiz answer tracking and grading system (quizzes are display-only in MVP)
- Multi-tenant content management (single textbook instance only)
- Advanced RAG features (re-ranking, hybrid search, query rewriting)
- Content recommendation engine based on learning paths

## Dependencies

- **External Services**: OpenAI API (GPT-4 for agents), Qdrant Cloud (vector store), Neon Serverless Postgres (database)
- **Authentication**: Better-Auth library (npm package for frontend + backend integration)
- **Framework Dependencies**: Docusaurus (frontend), FastAPI (backend), OpenAI Agents SDK (chatbot logic)
- **Content Dependencies**: ROS 2 Humble documentation (for code examples), LaTeX/MathJax (equation rendering), Mermaid.js (diagrams)

## Risks

- **RISK-001**: OpenAI API cost escalation if usage exceeds budget (mitigation: implement aggressive rate limiting and caching)
- **RISK-002**: Qdrant vector search latency degrades with large corpus (mitigation: monitor p95 latency, consider sharding if exceeds 500ms)
- **RISK-003**: Agent skills produce low-quality output (hallucinated quiz questions, poor translations) (mitigation: human review workflow for content team before publishing)
- **RISK-004**: Better-Auth integration complexity delays MVP (mitigation: start with basic email/password, defer advanced features)
- **RISK-005**: Personalization feels gimmicky if profile questions are too simplistic (mitigation: iterate on profile schema based on beta user feedback)

## Open Questions

None - all critical decisions have been resolved with reasonable defaults. Future iterations may refine profile questions, add more languages, or enhance chatbot capabilities based on user feedback.

## Notes

- This specification intentionally avoids implementation details (database schemas, API route structures, React component names) to remain technology-agnostic at the requirements level
- Agent skills are designed as CLI tools to enable standalone testing and reuse outside the web application
- Personalization and translation are ephemeral to reduce storage costs and simplify content versioning
- The Select-to-Ask pattern is inspired by Notion AI and Google Docs Smart Compose but optimized for technical educational content
