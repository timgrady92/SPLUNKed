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
- Results interpretation explains "what this means next."
- Use the `situation` object format (not deprecated `background` string):

```json
"content": {
  "situation": {
    "title": "Scenario Setup",
    "description": "<p>Your SIEM generated an alert...</p>",
    "environment": "Data sources: index=security, index=firewall"
  },
  "steps": [...]
}
```

**Step structure:**
```json
{
  "title": "Step 1: Confirm the Alert",
  "type": "pivot",
  "content": "<p>First, verify the alert details...</p>",
  "hint": "Use stats to count events",
  "spl": "index=security | stats count"
}
```

**Reasoning checkpoint:**
```json
{
  "title": "Checkpoint: Assess Findings",
  "type": "reasoning",
  "content": "<p>Before continuing, assess what you found...</p>",
  "question": "Based on your findings, what is your assessment?",
  "options": ["Option A", "Option B", "Option C", "Option D"]
}
```

**Nice‑to‑have**
- "Wrong turn" warning and how to recover.

## Challenges (Assessment)

SPLUNKed supports two challenge schemas. Choose based on your content needs.

### Schema 1: Structured Challenge (skill-building)
Best for: single complex problem with guided hints and one solution

**Baseline (must)**
- `problem_statement` object with `title`, `description`, and optional `requirements`
- Optional `constraints` array
- `hints` array (can be strings or objects with `title`/`content`)
- `solution` object with `spl` and `explanation`

```json
"content": {
  "problem_statement": {
    "title": "Build a Detection Query",
    "description": "Create a query that identifies...",
    "requirements": ["Calculate baseline", "Identify anomalies"]
  },
  "constraints": ["Must complete in <30 seconds"],
  "hints": [
    {"title": "Hint 1", "content": "Start with stats..."}
  ],
  "solution": {
    "spl": "index=... | stats ...",
    "explanation": "This works because..."
  }
}
```

### Schema 2: Assessment Challenge (skill-testing)
Best for: multiple discrete requirements with individual scoring

**Baseline (must)**
- `scenario` string with HTML context
- `requirements` array with `title`, `description`, `criteria`, `solution`
- `scoring` object with `total_points`, `passing_score`, `breakdown`

```json
"content": {
  "scenario": "<p>Complete these tasks to demonstrate your skills...</p>",
  "requirements": [
    {
      "title": "Requirement 1: Basic Search",
      "description": "Find all ERROR events",
      "criteria": ["Filter by log_level", "Show 20 results"],
      "solution": "index=_internal log_level=ERROR | head 20"
    }
  ],
  "scoring": {
    "total_points": 100,
    "passing_score": 70,
    "breakdown": [{"requirement": "Basic Search", "points": 15}]
  }
}
```

**Nice‑to‑have**
- `bonus_challenges` array with extra-credit tasks
- `submission_checklist` array for self-verification

## Pipelines (Learning paths)

**Baseline (must)**
- Clear objectives and sequencing rationale.
- Steps reference valid `sourceId` entries.
- Mix of lesson/tutorial/scenario/challenge when appropriate.

**Nice‑to‑have**
- Checkpoints or capstone steps.

## Acceptance Gate

Content is acceptable when all Baseline items are satisfied, metadata is complete, and placeholders (“TBD”, “coming soon”) are removed.
