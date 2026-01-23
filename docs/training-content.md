# Training Content Format

This project now stores training content in SQLite and serves a lightweight index
over `/api/training/index`. Full content is fetched on demand from
`/api/training/items/<id>`. Use the rebuild script to load content into the DB.

## Folder layout

```
content/
  training/
    lessons/
      basics/
        search-specific-value.md
    tutorials/
      foundations/
        found-001.json
    scenarios/
      intermediate/
        int-002.json
    challenges/
      advanced/
        adv-003.json
data/
  training-pipelines.json
```

## Lessons (Markdown)

Lessons use Markdown with a JSON front matter block:

```
---
{
  "id": "search-specific-value",
  "type": "lesson",
  "title": "How to search for a specific user, IP, or value",
  "description": "Find all events containing a specific username or IP.",
  "category": "basics",
  "bucket": "Foundations & Search Literacy",
  "keywords": ["user", "ip", "search"],
  "tags": ["basics", "filters"],
  "duration": "10 min",
  "sortOrder": 10
}
---
Write your lesson content in Markdown here.
```

The rebuild script converts Markdown to HTML and stores it in the DB.

## Tutorials (JSON)

Tutorials use a `sections` array within `content`:

```json
{
  "id": "found-001",
  "type": "tutorial",
  "title": "Anatomy of a Search",
  "description": "Learn how SPL searches flow through the pipeline.",
  "category": "foundations",
  "difficulty": "beginner",
  "duration": "15 min",
  "tags": ["basics", "pipeline"],
  "objectives": ["Understand the SPL search pipeline"],
  "content": {
    "sections": [
      {
        "title": "What is SPL?",
        "body": "<p>...</p>",
        "spl": "index=main | stats count",
        "explanation": "..."
      }
    ]
  }
}
```

Note: SPL blocks must not include inline comments; keep explanations in the
`explanation` fields or surrounding copy.

## Scenarios (JSON)

Scenarios use a `situation` object and `steps` array. The canonical format is:

```json
{
  "id": "inv-bruteforce",
  "type": "scenario",
  "title": "Brute Force Investigation",
  "description": "Investigate a brute force attack.",
  "category": "investigation",
  "difficulty": "intermediate",
  "duration": "25 min",
  "tags": ["investigation", "authentication"],
  "objectives": ["Investigate attack patterns", "Identify compromised accounts"],
  "content": {
    "situation": {
      "title": "Scenario Setup",
      "description": "<p>HTML content describing the situation...</p>",
      "environment": "Optional: describe available data sources and time context"
    },
    "steps": [
      {
        "id": 1,
        "title": "Confirm the Alert",
        "question": "How many failed attempts occurred?",
        "type": "pivot",
        "content": "<p>Explanation of this step...</p>",
        "hint": "Try filtering for EventCode=4625",
        "spl": "index=security EventCode=4625 | stats count",
        "options": ["Option A", "Option B"]
      }
    ],
    "conclusion": {
      "title": "Scenario Complete",
      "summary": "You investigated...",
      "key_takeaways": ["Takeaway 1", "Takeaway 2"],
      "next_steps": ["Next scenario to try"]
    }
  }
}
```

### Scenario Step Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | Step title |
| `question` | No | Question format alternative to title |
| `type` | No | Step type: `pivot`, `reasoning`, etc. |
| `content` | No | HTML explanation content |
| `hint` | No | Hint text for the step |
| `spl` or `solution` | No | SPL query for the step |
| `options` | No | Array of options for reasoning steps |
| `output` | No | Output table with `columns` and `rows` |

## Challenges (JSON)

Challenges support two schemas. The renderer auto-detects which to use.

### Schema 1: Structured Challenge

Traditional challenge with problem, hints, and solution:

```json
{
  "id": "spl-mastery-challenge",
  "type": "challenge",
  "title": "SPL Mastery Challenge",
  "description": "Build a sophisticated detection query.",
  "category": "spl-fundamentals",
  "difficulty": "intermediate",
  "duration": "35 min",
  "tags": ["spl", "challenge"],
  "objectives": ["Integrate multiple SPL techniques"],
  "content": {
    "problem_statement": {
      "title": "Challenge: Insider Threat Detection",
      "description": "Build a detection query that...",
      "requirements": ["Requirement 1", "Requirement 2"],
      "data_context": "Describe available data..."
    },
    "constraints": ["Query must complete in <30s", "No custom commands"],
    "hints": [
      {
        "id": 1,
        "title": "Hint Title",
        "content": "Hint content..."
      }
    ],
    "solution": {
      "spl": "index=... | stats ...",
      "explanation": "This solution uses...",
      "panels": [
        {
          "title": "Step 1: Calculate Baseline",
          "purpose": "Establish normal behavior",
          "spl": "...",
          "notes": "..."
        }
      ],
      "performance_notes": "Consider pre-calculating baselines..."
    }
  }
}
```

### Schema 2: Assessment Challenge

Multi-requirement assessment with scoring:

```json
{
  "id": "fund-basics-challenge",
  "type": "challenge",
  "title": "Splunk Fundamentals Challenge",
  "description": "Test your understanding of fundamentals.",
  "category": "fundamentals",
  "difficulty": "beginner",
  "duration": "25 min",
  "tags": ["fundamentals", "assessment"],
  "objectives": ["Demonstrate basic search proficiency"],
  "content": {
    "scenario": "<p>HTML scenario description...</p>",
    "requirements": [
      {
        "id": "req1",
        "title": "Requirement 1: Basic Search",
        "description": "Find all ERROR events...",
        "criteria": ["Filter for sourcetype=splunkd", "Limit to 20 results"],
        "hints": [],
        "solution": "index=_internal sourcetype=splunkd | head 20"
      }
    ],
    "scoring": {
      "total_points": 100,
      "passing_score": 70,
      "breakdown": [
        {"requirement": "Basic Search", "points": 10}
      ]
    },
    "bonus_challenges": [
      {
        "title": "Bonus: Error Trend Analysis",
        "description": "Compare first 30 min to last 30 min",
        "points": 10
      }
    ],
    "submission_checklist": [
      "All requirements produce results without errors",
      "Searches use appropriate time ranges"
    ]
  }
}
```

## Pipelines

Learning paths live in `data/training-pipelines.json`. They reference training
content by `sourceId`.

## Rebuild the training DB

```
python scripts/rebuild-training-db.py --reset
```
