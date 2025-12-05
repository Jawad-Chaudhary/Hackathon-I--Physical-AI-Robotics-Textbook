<!--
Sync Impact Report:
Version change: Initial → 1.0.0
Added sections:
  - Core Principles (7 principles defined)
  - Technical Stack Constraints
  - Content Standards
  - Architecture Requirements
  - Governance
Modified principles: N/A (initial version)
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md (aligned with technical stack and architecture requirements)
  ✅ spec-template.md (aligned with reusable intelligence and content standards)
  ✅ tasks-template.md (aligned with skills-first approach and testing discipline)
Follow-up TODOs: None
-->

# Physical AI & Humanoid Robotics Constitution

## Core Principles

### I. Technical Stack Adherence (NON-NEGOTIABLE)

The project MUST use the following technology stack without substitutions:

- **Frontend**: Docusaurus (React-based) - All UI components and documentation rendering
- **Backend**: FastAPI - All API endpoints and server logic
- **Database**: Neon Serverless Postgres - Primary data store
- **Vector Store**: Qdrant Cloud - RAG embeddings and semantic search
- **Authentication**: Better-Auth - User authentication with MANDATORY hardware/software background capture
- **AI Framework**: OpenAI Agents SDK - All AI agent implementations

**Rationale**: This stack provides serverless scalability, modern React tooling, and proven AI integration. Deviations require constitutional amendment.

### II. Reusable Intelligence (NON-NEGOTIABLE - 50 Points)

Every repetitive content operation MUST be implemented as a reusable agent skill. Do NOT manually perform operations that can be automated.

**Mandatory Skills** (must exist in `skills/` directory):

- `skills/generate_quiz.py`: Generate 5-question quiz for any markdown file
- `skills/translate_urdu.py`: Translate markdown to Urdu preserving formatting
- `skills/personalize.py`: Rewrite content based on user metadata (e.g., "Explain for C++ expert")

**Requirements**:
- All skills MUST be Python scripts callable as CLI tools
- Skills MUST accept stdin or file paths as input
- Skills MUST output to stdout (success) or stderr (errors)
- Skills MUST be independently testable with sample input/output
- New repetitive operations MUST trigger skill creation, not manual execution

**Rationale**: Agent skills prevent redundant work, ensure consistency, and enable batch operations. This principle treats content generation as software engineering.

### III. Content Formatting Standards (MANDATORY)

All textbook content MUST follow these formatting rules:

- **Admonitions**: Use Docusaurus admonitions (`:::note`, `:::warning`, `:::tip`, `:::danger`) for callouts
- **Mathematics**: Use LaTeX notation (`$inline$` for inline, `$$block$$` for block equations)
- **Code Examples**: All code MUST be ROS 2 Humble compatible with version annotations
- **Diagrams**: Use Mermaid.js for all architecture, sequence, and flow diagrams
- **Language**: Primary content in English; Urdu translations via `skills/translate_urdu.py` only

**Example**:
```markdown
:::note Key Concept
The forward kinematics equation is $\mathbf{T} = \prod_{i=1}^{n} A_i(\theta_i)$
:::
```

**Rationale**: Consistency ensures professional quality and enables automated validation.

### IV. ROS 2 Humble Compatibility (MANDATORY)

All robotics code examples MUST target ROS 2 Humble Hawksbill:

- Use `rclpy` for Python examples (not ROS 1 `rospy`)
- Use `std_msgs`, `geometry_msgs`, `sensor_msgs` from ROS 2 distributions
- Include `package.xml` and `CMakeLists.txt` references where applicable
- Document ROS 2 launch files using Python launch API (not XML)
- Annotate Ubuntu 22.04 LTS as the target platform

**Rationale**: ROS 2 Humble is the current LTS release (until 2027). Ensures examples remain relevant and executable.

### V. RAG Chatbot Architecture (NON-NEGOTIABLE)

The integrated chatbot MUST support "Select-to-Ask" functionality:

- **User Flow**: User highlights text → Clicks "Ask about this" → Chatbot answers with context
- **Implementation**:
  - Frontend: Capture text selection via `window.getSelection()` API
  - Backend: `/api/chat/select-query` endpoint accepting `{text: string, context: string}`
  - Vector Search: Query Qdrant with selected text as query vector
  - Response: Cite specific textbook sections in answers (e.g., "See Chapter 3.2: Inverse Kinematics")

**Rationale**: Select-to-Ask reduces friction for students seeking clarification on specific passages.

### VI. User Metadata Capture (MANDATORY)

Better-Auth configuration MUST capture:

- **Hardware Background**: Dropdown with options: `[None, Arduino/Raspberry Pi, Custom PCB, Industrial PLC, Other]`
- **Software Background**: Dropdown with options: `[None, Python, C++, MATLAB, ROS, Other]`
- **Experience Level**: Radio buttons: `[Beginner, Intermediate, Advanced]`

**Rationale**: User background enables the `skills/personalize.py` tool to adapt explanations (e.g., "You're familiar with Arduino; think of ROS nodes as Arduino sketches communicating via Serial").

### VII. Test-First for Skills (NON-NEGOTIABLE)

All agent skills MUST follow TDD:

1. **Write Test First**: Create `tests/skills/test_[skill_name].py` with expected input/output
2. **Verify Failure**: Run test and confirm it fails (skill doesn't exist yet)
3. **Implement Skill**: Build `skills/[skill_name].py` to pass test
4. **Verify Success**: Run test and confirm it passes

**Example Test**:
```python
# tests/skills/test_generate_quiz.py
def test_generate_quiz():
    input_md = "# Newton's Laws\nF = ma"
    result = run_skill("generate_quiz.py", input_md)
    assert "What is the equation for force?" in result
    assert len(extract_questions(result)) == 5
```

**Rationale**: Skills are code. Testing prevents regressions and ensures reliability.

## Technical Stack Constraints

**Language Versions**:
- Python: 3.11+ (for FastAPI and OpenAI SDK)
- Node.js: 18+ (for Docusaurus)
- ROS 2: Humble Hawksbill (Ubuntu 22.04 LTS)

**Mandatory Dependencies**:
- `fastapi`, `uvicorn` (backend)
- `psycopg[binary]` (Postgres client)
- `qdrant-client` (vector store)
- `better-auth` (authentication)
- `openai` (OpenAI Agents SDK)
- `@docusaurus/core`, `@docusaurus/preset-classic` (frontend)

**Storage**:
- Postgres: User profiles, progress tracking, quiz results
- Qdrant: Textbook embeddings (chunked by section)
- File system: Static markdown content in `docs/`

**Performance Goals**:
- Chatbot response: <2s for select-to-ask queries
- Page load: <1s for textbook pages
- Quiz generation: <5s per markdown file

## Content Standards

**Tone**: Academic but approachable. Professor explaining to graduate students.

**Structure** (per chapter):
1. Learning Objectives (3-5 bullet points)
2. Conceptual Explanation (prose with diagrams)
3. Mathematical Formulation (LaTeX equations with derivations)
4. ROS 2 Implementation (code example with explanation)
5. Practice Problems (generated via `skills/generate_quiz.py`)
6. Further Reading (3-5 academic references)

**Accessibility**:
- Alt text for all Mermaid diagrams
- Equation descriptions for screen readers (e.g., `$F=ma$ <!-- Force equals mass times acceleration -->`)
- Urdu translations available via language toggle (powered by `skills/translate_urdu.py`)

## Architecture Requirements

**Monorepo Structure**:
```
physical-ai-robotics/
├── docs/                    # Docusaurus content
│   ├── intro.md
│   ├── kinematics/
│   └── control/
├── backend/                 # FastAPI application
│   ├── api/
│   ├── models/
│   ├── services/
│   └── skills/              # Reusable agent skills (CRITICAL)
│       ├── generate_quiz.py
│       ├── translate_urdu.py
│       └── personalize.py
├── frontend/                # Docusaurus site
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   └── docusaurus.config.js
└── tests/
    ├── skills/              # Skill tests (TDD)
    ├── api/
    └── integration/
```

**Separation of Concerns**:
- `docs/`: Content only (markdown, assets)
- `backend/skills/`: Content generation tools (Python)
- `frontend/src/`: UI components (React/TypeScript)
- `backend/api/`: Chatbot endpoints (FastAPI)

**API Contract** (select-to-ask):
```typescript
POST /api/chat/select-query
Request: {
  text: string,           // User-selected text
  context: string,        // Surrounding paragraph
  userId: string          // For personalization
}
Response: {
  answer: string,         // AI-generated explanation
  sources: Array<{        // Cited textbook sections
    chapter: string,
    section: string,
    url: string
  }>,
  personalized: boolean   // Was user metadata applied?
}
```

## Governance

**Amendment Procedure**:
1. Propose change in `specs/[###-constitution-amendment]/spec.md`
2. Document rationale and impact analysis
3. Update `.specify/memory/constitution.md` with version bump
4. Propagate changes to dependent templates
5. Create ADR if architecturally significant

**Version Semantics**:
- **MAJOR**: Stack change (e.g., replacing FastAPI), principle removal
- **MINOR**: New principle, new mandatory skill
- **PATCH**: Clarification, typo fix, version bumps

**Compliance**:
- All PRs MUST pass constitution checks (enforced in `/sp.plan` Phase 0)
- Violations require justification in `Complexity Tracking` section
- Agent MUST suggest ADR for significant architectural decisions

**Review Cycle**: Constitution reviewed after every major milestone (e.g., Chapter 1 complete, Chatbot MVP launched)

**Ratification Date**: 2025-12-03 (initial version, no prior ratification)

---

**Version**: 1.0.0 | **Ratified**: 2025-12-03 | **Last Amended**: 2025-12-03
