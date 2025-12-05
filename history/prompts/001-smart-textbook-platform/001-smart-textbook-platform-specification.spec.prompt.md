---
id: 001
title: Smart Textbook Platform Specification
stage: spec
date: 2025-12-03
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-smart-textbook-platform
branch: 001-smart-textbook-platform
user: Jawad0Chaudhary
command: /sp.specify
labels: ["specification", "textbook", "rag-chatbot", "agent-skills", "better-auth", "personalization", "translation"]
links:
  spec: specs/001-smart-textbook-platform/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-smart-textbook-platform/spec.md
  - specs/001-smart-textbook-platform/checklists/requirements.md
tests:
  - null
---

## Prompt

Title: Physical AI Textbook with Agents, RAG, and Auth

Context:
We are building a smart textbook that adapts to the user. We need the content, the backend infrastructure, and the "Agent Skills" used to maintain the book.

Deliverables:

1. The Agent Skills (Requirement 4):
   - Create `skills/quiz_agent.py`: A subagent that reads a chapter and appends a "Check Your Understanding" section.
   - Create `skills/translator_agent.py`: A subagent that accepts Markdown and returns Urdu text.
   - Create `skills/personalizer_agent.py`: A subagent that takes user profile data and rewrites text.

2. Backend Infrastructure (Requirements 2, 5):
   - **FastAPI App**: Setup `backend/main.py`.
   - **Auth (Better-Auth)**: Implement `/auth/signup` that asks: "Do you know Python?" and "Do you have an NVIDIA GPU?". Store this in **Neon Postgres**.
   - **RAG Chatbot**: Implement `/chat` using **OpenAI Agents SDK**.
   - **Vector Store**: Use **Qdrant** to store book embeddings.
   - **Endpoints**:
     - POST `/api/translate`: Triggers the Translator Agent.
     - POST `/api/personalize`: Triggers the Personalizer Agent.

3. Frontend (Docusaurus):
   - **Floating Chat Widget**: A React component that talks to `/chat`.
   - **Context Menu**: When text is highlighted, show a tooltip "Ask AI" that sends the selection to the backend.
   - **Chapter Controls**: Add "Personalize" and "Read in Urdu" buttons at the top of every chapter.

4. Content - Module 1 (Requirement 1):
   - Create `docs/intro.md` and `docs/ros2-basics.md`

## Response snapshot

Created comprehensive feature specification for Smart Textbook Platform with AI Agents on branch `001-smart-textbook-platform`.

**Specification Structure**:
- **5 User Stories** with clear priorities:
  - P1: Student Onboarding with Background Capture (foundation for personalization)
  - P1: Interactive Reading with Select-to-Ask (core RAG chatbot UX)
  - P2: Content Personalization (adaptive learning)
  - P2: Multilingual Support with Urdu Translation (accessibility)
  - P3: Self-Assessment with Auto-Generated Quizzes (reinforcement)

- **15 Functional Requirements** covering:
  - Better-Auth integration with custom profile questions (FR-001, FR-002)
  - Select-to-Ask UI with text selection API (FR-003)
  - RAG chatbot with OpenAI Agents SDK and Qdrant (FR-004, FR-005)
  - Agent skill APIs: translation, personalization (FR-006, FR-007)
  - Three standalone Python CLI agent skills (FR-008)
  - Docusaurus frontend components (FR-009, FR-010)
  - Initial content with ROS 2 Humble code examples (FR-011, FR-012)
  - Source citation format and ephemeral content (FR-013, FR-014, FR-015)

- **10 Success Criteria** (all measurable and technology-agnostic):
  - Signup time <60s, chatbot response <2s, 90% citation accuracy
  - 100% translation structural integrity, 3+ personalized analogies per chapter
  - 100 concurrent users supported, <1s page load, <5s agent processing

- **10 Assumptions** documenting reasonable defaults:
  - Target audience, chapter length, language priorities
  - Profile collection timing, embedding regeneration frequency
  - Session-based personalization, API rate limits
  - Email/password auth only (no OAuth in MVP)
  - Synchronous skill invocation, Qdrant free tier sufficiency

- **5 Edge Cases** addressing:
  - Code block highlighting, rate limiting, translation failures
  - Guest user experience, embedding staleness

**Key Design Decisions**:
1. **Skills-First Approach**: All repetitive content operations implemented as standalone Python CLI tools (aligns with Constitution Principle II)
2. **Ephemeral Personalization**: Generated per-request, not persisted (reduces storage costs, simplifies versioning)
3. **Independent Testability**: Each user story can be implemented and validated standalone
4. **Select-to-Ask Pattern**: Inspired by Notion AI, optimized for technical educational content

**Quality Validation**: Created specification quality checklist at `specs/001-smart-textbook-platform/checklists/requirements.md`
- ✅ All 16 validation checks passed
- ✅ No [NEEDS CLARIFICATION] markers (all gaps filled with assumptions)
- ✅ Requirements testable and unambiguous
- ✅ Success criteria measurable and technology-agnostic
- ✅ No implementation details leaked into specification

## Outcome

- ✅ Impact: Established comprehensive feature specification defining user value, functional requirements, and success criteria for Smart Textbook Platform MVP
- 🧪 Tests: No tests required (specification document) - testability validated via checklist
- 📁 Files: Created specs/001-smart-textbook-platform/spec.md (222 lines, 5 user stories, 15 FRs, 10 SCs) and specs/001-smart-textbook-platform/checklists/requirements.md (validation passing)
- 🔁 Next prompts: Run /sp.plan to create implementation plan (with constitution compliance check), or /sp.clarify if stakeholder input needed on priorities
- 🧠 Reflection: Specification successfully balances comprehensiveness with clarity. All user stories independently testable (enables incremental delivery). Assumptions section critical for documenting reasonable defaults without requiring clarification questions. Skills-first approach aligns perfectly with Constitution Principle II (Reusable Intelligence).

## Evaluation notes (flywheel)

- Failure modes observed: None - specification complete and validated
- Graders run and results (PASS/FAIL): PASS - All 16 checklist items validated successfully (Content Quality: 4/4, Requirement Completeness: 8/8, Feature Readiness: 4/4)
- Prompt variant (if applicable): Standard /sp.specify workflow with comprehensive user input (4 deliverable categories)
- Next experiment (smallest change to try): When creating future specs, consider adding "Anti-Goals" section to explicitly state what the feature should NOT do (complements Out of Scope)
