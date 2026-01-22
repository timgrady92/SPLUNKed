# Training Authoring Baseline

Use this checklist to create consistent, high‑quality lessons, tutorials, scenarios, challenges, and pipelines. Flexibility is welcome, but all **Baseline (must)** items are required for acceptance.

## Global Baseline (all content)

**Baseline (must)**
- Clear objectives (2–5 action verbs, e.g., “identify”, “summarize”, “pivot”).
- Accurate scope and prerequisites (state assumptions or required knowledge).
- Realistic context and data sources (SOC‑relevant, no toy‑only data).
- Clean SPL with brief, targeted explanations of why each step exists.
- No comments inside SPL blocks; put explanations in surrounding text or explanation fields.
- Validation cues (expected results, sanity checks, or interpretation notes).
- Dense metadata: `id`, `type`, `title`, `description`, `category`, `difficulty`, `duration`, `tags`, `objectives`, plus `keywords` when helpful.

**Nice‑to‑have**
- Performance notes (e.g., earliest/latest, field scoping).
- Common pitfalls or false‑positive warnings.

## Lessons (How‑to guides)

**Baseline (must)**
- Goal → Minimal path → Variations → Pitfalls → Next steps.
- 1–3 SPL examples with short interpretation notes.
- Useful for a first‑time analyst without guessing.

**Nice‑to‑have**
- Alternative data sources or field mappings.

## Tutorials (Concept walkthroughs)

**Baseline (must)**
- Concept → Why it matters → Step‑by‑step build → Summary.
- Progressive query evolution (each step builds on prior).
- Learner can restate concept and adapt a variant.

**Nice‑to‑have**
- Side‑by‑side “before/after” comparison.

## Scenarios (Guided investigations)

**Baseline (must)**
- Situation → Step questions → SPL + analysis → Findings → Conclusion.
- At least one pivot step and one reasoning checkpoint.
- Results interpretation explains “what this means next.”

**Nice‑to‑have**
- “Wrong turn” warning and how to recover.

## Challenges (Assessment)

**Baseline (must)**
- Problem statement with constraints.
- Optional hints (1–3) and a full solution with explanation.
- Acceptance criteria (what makes a correct answer).

**Nice‑to‑have**
- Multiple solution paths or variations.

## Pipelines (Learning paths)

**Baseline (must)**
- Clear objectives and sequencing rationale.
- Steps reference valid `sourceId` entries.
- Mix of lesson/tutorial/scenario/challenge when appropriate.

**Nice‑to‑have**
- Checkpoints or capstone steps.

## Acceptance Gate

Content is acceptable when all Baseline items are satisfied, metadata is complete, and placeholders (“TBD”, “coming soon”) are removed.
