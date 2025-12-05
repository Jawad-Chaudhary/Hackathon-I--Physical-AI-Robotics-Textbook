---
id: 001
title: Physical AI Robotics Constitution
stage: constitution
date: 2025-12-03
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: Jawad0Chaudhary
command: /sp.constitution
labels: ["constitution", "technical-stack", "reusable-intelligence", "ros2", "docusaurus", "fastapi"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

Role: You are an expert Professor of Robotics and AI Engineering.
Project: A technical textbook "Physical AI & Humanoid Robotics" with an integrated RAG Chatbot.

Global Guidelines:
1. Tech Stack (Strict):
   - Frontend: Docusaurus (React).
   - Backend: FastAPI, Neon Serverless Postgres, Qdrant Cloud.
   - Auth: Better-Auth (Must capture User Hardware/Software background).
   - AI: OpenAI Agents SDK.

2. Reusable Intelligence (CRITICAL - 50 Points):
   - Do not just "write" the content. You must create reusable **Agent Skills** (Python scripts or tools) for repetitive tasks.
   - Specifically, create a `skills/` directory containing:
     - `skills/generate_quiz.py`: A tool to generate a 5-question quiz for any markdown file.
     - `skills/translate_urdu.py`: A tool to translate markdown content to Urdu while preserving formatting.
     - `skills/personalize.py`: A tool to rewrite content based on user metadata (e.g., "Explain for a C++ expert").

3. Formatting & Tone:
   - Use Docusaurus Admonitions (::note) and LaTeX ($...$) for math.
   - All code examples must be ROS 2 Humble compatible.

4. Architecture:
   - The Chatbot must support "Select-to-Ask" (answering based on highlighted text).
   - Use Mermaid.js for all diagrams.

## Response snapshot

Created comprehensive project constitution v1.0.0 for "Physical AI & Humanoid Robotics" textbook project with the following structure:

**Core Principles (7 NON-NEGOTIABLE rules)**:
1. Technical Stack Adherence: Docusaurus, FastAPI, Neon Postgres, Qdrant Cloud, Better-Auth, OpenAI Agents SDK
2. Reusable Intelligence: Mandatory agent skills (generate_quiz.py, translate_urdu.py, personalize.py) - treats content generation as software engineering
3. Content Formatting Standards: Docusaurus admonitions, LaTeX math, Mermaid.js diagrams
4. ROS 2 Humble Compatibility: All robotics code examples target ROS 2 Humble Hawksbill with rclpy
5. RAG Chatbot Architecture: Select-to-Ask functionality with text selection API and vector search
6. User Metadata Capture: Hardware/Software background and experience level via Better-Auth
7. Test-First for Skills: TDD mandatory for all agent skills with tests/skills/ directory

**Additional Sections**:
- Technical Stack Constraints: Language versions (Python 3.11+, Node 18+, ROS 2 Humble), dependencies, storage strategy, performance goals
- Content Standards: Academic tone, chapter structure (learning objectives → concepts → math → ROS 2 code → quizzes → references), accessibility requirements
- Architecture Requirements: Monorepo structure with docs/, backend/skills/, frontend/, tests/ separation, API contract for select-to-ask endpoint
- Governance: Amendment procedure, semantic versioning (MAJOR/MINOR/PATCH), compliance enforcement, review cycle

**Key Innovations**:
- Skills-first approach: Every repetitive task becomes a reusable Python tool (50-point emphasis)
- Test-driven skills development: All skills require tests/skills/test_[name].py before implementation
- Personalization via metadata: User background captured for adaptive explanations
- Select-to-Ask UX: Reduces friction with window.getSelection() → /api/chat/select-query → cited answers

**Version**: 1.0.0 (initial ratification)
**Ratification Date**: 2025-12-03

## Outcome

- ✅ Impact: Established foundational governance document defining technical stack, development principles, and quality standards for Physical AI & Humanoid Robotics textbook project
- 🧪 Tests: No tests required (constitution document)
- 📁 Files: Created .specify/memory/constitution.md (v1.0.0) with 7 core principles, technical constraints, content standards, architecture requirements, and governance rules
- 🔁 Next prompts: Create feature specs for: (1) Agent skills implementation (/sp.specify skills-infrastructure), (2) Select-to-Ask chatbot (/sp.specify select-to-ask-feature), (3) Better-Auth integration (/sp.specify user-metadata-capture)
- 🧠 Reflection: Constitution emphasizes reusable intelligence (skills) as first-class engineering artifacts, not ad-hoc scripting. This shifts content generation from manual work to systematic tool development with TDD. The 50-point weight on skills reflects the project's commitment to automation and consistency.

## Evaluation notes (flywheel)

- Failure modes observed: None - initial constitution creation
- Graders run and results (PASS/FAIL): PASS - All placeholders filled, no bracket tokens remaining, version semantics correct, dates in ISO format (2025-12-03)
- Prompt variant (if applicable): Standard /sp.constitution workflow with user-provided technical stack and requirements
- Next experiment (smallest change to try): When implementing first feature, validate whether skills-first principle needs refinement (e.g., should skills support streaming output for long translations?)
