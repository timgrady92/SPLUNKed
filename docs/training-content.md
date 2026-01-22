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

## Tutorials/Scenarios/Challenges (JSON)

Structured modules should be JSON files with a `content` object:

```

Note: SPL blocks must not include inline comments; keep explanations in the
`explanation` fields or surrounding copy.
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

## Pipelines

Learning paths live in `data/training-pipelines.json`. They reference training
content by `sourceId`.

## Rebuild the training DB

```
python scripts/rebuild-training-db.py --reset
```
