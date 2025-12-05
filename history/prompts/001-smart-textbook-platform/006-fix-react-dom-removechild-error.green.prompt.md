---
id: 006
title: Fix React DOM removeChild Error
stage: green
date: 2025-12-05
surface: agent
model: claude-opus-4-5-20251101
feature: 001-smart-textbook-platform
branch: 001-smart-textbook-platform
user: developer
command: bug-fix
labels: ["react", "dom", "bug-fix", "frontend"]
links:
  spec: specs/001-smart-textbook-platform/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - textbook/src/theme/DocItem/Layout/index.tsx
  - textbook/src/components/PersonalizeButton.tsx
  - textbook/src/components/TranslateButton.tsx
tests:
  - null
---

## Prompt

User reported React error:
```
NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.
```

Error occurred in DocItem Layout component during React's commit phase when trying to delete elements.

## Response snapshot

**Root Cause**: Direct DOM manipulation (`innerHTML` and `insertBefore`) in the Layout wrapper conflicted with React's virtual DOM reconciliation.

**Fix Applied**: Replaced direct DOM mutations with React state-managed overlay pattern:

1. **Layout/index.tsx**:
   - Removed `element.innerHTML = newContent` (line 74)
   - Removed `insertBefore` DOM manipulation (lines 63-66)
   - Added `ContentOverlay` component that renders transformed content as a React-managed full-screen overlay
   - Uses `transformedContent` state instead of mutating existing DOM nodes

2. **PersonalizeButton.tsx & TranslateButton.tsx**:
   - Added `isShowingTransformed` prop for coordination
   - `onContentChange` now accepts `null` to close overlay
   - Shows checkmark (✓) when content is cached

**Key insight**: Original content stays untouched in the DOM; transformed content renders in an overlay that React fully controls.

## Outcome

- ✅ Impact: Fixed React DOM reconciliation error, eliminated crash on content transformation
- 🧪 Tests: TypeScript compilation passes, no IDE diagnostics
- 📁 Files: 3 files modified (Layout/index.tsx, PersonalizeButton.tsx, TranslateButton.tsx)
- 🔁 Next prompts: Manual testing of personalize/translate features in browser
- 🧠 Reflection: Never mutate DOM directly when working within React - always use state

## Evaluation notes (flywheel)

- Failure modes observed: Direct DOM manipulation causing React virtual DOM desync
- Graders run and results (PASS/FAIL): TypeScript PASS, IDE diagnostics PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Consider using React Portal for overlay instead of inline component
