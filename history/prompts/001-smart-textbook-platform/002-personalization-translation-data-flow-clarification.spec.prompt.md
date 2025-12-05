---
id: 002
title: Personalization Translation Data Flow Clarification
stage: spec
date: 2025-12-03
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-smart-textbook-platform
branch: 001-smart-textbook-platform
user: Jawad0Chaudhary
command: /sp.clarify
labels: ["clarification", "data-flow", "personalization", "translation", "authentication", "api-design", "subprocess"]
links:
  spec: specs/001-smart-textbook-platform/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-smart-textbook-platform/spec.md
tests:
  - null
---

## Prompt

Clarify the technical integration strategy for the "Personalization" and "Translation" bonus features.

Specifically, explain the data flow for the following scenario:
1. A user logs in via Better-Auth on the Docusaurus site.
2. The user clicks the "Personalize" button on "Chapter 1".
3. The frontend sends the request to the FastAPI backend.

Please clarify:
- How will the frontend retrieve the user's "Hardware/Software Profile" from the database?
- What specific JSON payload will be sent to the `/api/personalize` endpoint?
- How will the `skills/personalize_agent.py` script be invoked by the API?
- How will the rewritten markdown be rendered back on the screen without refreshing the page (Client-side replacement vs Server-side)?

Provide a sequence diagram description or a step-by-step technical walkthrough of this specific loop.

## Response snapshot

Conducted interactive 5-question clarification session to resolve technical integration ambiguities for personalization and translation features. All questions answered with recommended best practices.

**Clarifications Documented** (Session 2025-12-03):

1. **User Profile Retrieval Mechanism**
   - **Q**: How will the frontend retrieve the user's profile from database?
   - **A**: Better-Auth session token → FastAPI validates → Extract user_id → Query Postgres (server-side)
   - **Rationale**: Standard session-based auth pattern; secure, stateless, scalable

2. **API Payload Structure**
   - **Q**: What JSON payload for `/api/personalize`?
   - **A**: `{ "chapter_slug": "intro", "content": "<markdown>" }` (minimal payload, profile fetched server-side)
   - **Rationale**: Keeps payload minimal, secure (no client-side profile exposure), aligns with Q1 decision

3. **Agent Skill Invocation Method**
   - **Q**: How to invoke `skills/personalizer_agent.py`?
   - **A**: Subprocess via `subprocess.run()` (stdin for input, stdout for output)
   - **Rationale**: Aligns with Constitution Principle II (CLI tools), enables standalone testing, simpler than microservices for MVP

4. **Frontend Rendering Strategy**
   - **Q**: How to render personalized markdown without page refresh?
   - **A**: Client-side DOM replacement (React state update → parse markdown → replace content div)
   - **Rationale**: Standard React SPA pattern, preserves scroll position, maintains Docusaurus architecture

5. **Data Flow Documentation Format**
   - **Q**: Sequence diagram or step-by-step walkthrough?
   - **A**: Step-by-step walkthrough in new "Data Flow" section
   - **Rationale**: Easier to maintain in markdown, serves as acceptance criteria, testable

**Specification Updates**:
- Added `## Clarifications` section with Session 2025-12-03 (5 Q&A pairs)
- Added `## Data Flow` section with 10-step personalization walkthrough + translation variant
- Updated FR-006: Clarified `/api/translate` payload structure
- Updated FR-007: Clarified `/api/personalize` payload + server-side profile retrieval + subprocess invocation
- Updated FR-008: Clarified subprocess invocation (stdin/stdout) for all agent skills
- Added FR-010a: Client-side rendering via React state updates
- Updated FR-015: Authentication middleware validates Better-Auth token, returns 401 on failure
- Updated ASMP-009: Clarified synchronous subprocess invocation (no async queue)

**Data Flow Walkthrough** (10-step sequence):
1. User clicks "Personalize" → Frontend extracts chapter markdown
2. Frontend POSTs to `/api/personalize` with session token + payload
3. Backend validates token → Extract user_id
4. Backend queries Postgres for profile
5. Backend invokes `subprocess.run(["python", "skills/personalizer_agent.py"], input=stdin_json)`
6. Agent processes via OpenAI SDK → Returns personalized markdown to stdout
7. Backend returns JSON response with personalized content
8. Frontend parses markdown → Updates React state
9. React re-renders with personalized content (no page refresh)
10. User sees Python-specific analogies, original file unchanged

## Outcome

- ✅ Impact: Resolved all technical integration ambiguities for personalization/translation features; established clear data flow from frontend → backend → agent skills → rendering
- 🧪 Tests: No tests required (clarification session) - data flow serves as acceptance criteria for implementation
- 📁 Files: Updated specs/001-smart-textbook-platform/spec.md (added Clarifications section with 5 Q&A, Data Flow section with 10-step walkthrough, updated 6 functional requirements, 1 assumption)
- 🔁 Next prompts: Run /sp.plan to create implementation plan with constitution compliance check (data flow now unambiguous for planning)
- 🧠 Reflection: Interactive questioning with recommended answers streamlined decision-making. Server-side profile retrieval + subprocess invocation + client-side rendering form coherent architecture aligned with Constitution (skills as CLI tools). Step-by-step walkthrough provides testable acceptance criteria superior to visual diagrams for this use case.

## Evaluation notes (flywheel)

- Failure modes observed: None - all 5 questions answered decisively with best practice recommendations
- Graders run and results (PASS/FAIL): PASS - All clarifications integrated into spec, no contradictions, terminology consistent, data flow walkthrough comprehensive (10 steps covering authentication → invocation → rendering)
- Prompt variant (if applicable): Interactive clarification with recommended answers (user accepted all 5 recommendations via "yes")
- Next experiment (smallest change to try): For future clarifications, consider presenting decision rationale AFTER user choice (not before) to avoid anchoring bias; measure if users challenge recommendations more frequently
