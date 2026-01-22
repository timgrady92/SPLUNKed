# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SPLUNKed is an offline-first educational web application for learning Splunk's Search Processing Language (SPL). It provides reference materials, investigation guides, and progressive training scenarios for security analysts.

## Development Commands

```bash
# Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run server (http://127.0.0.1:5000)
python app.py

# Rebuild training content from content/ directory
python scripts/rebuild-training-db.py --reset
```

## Architecture

### Backend (Flask)
- `app.py` - Flask entrypoint with page routes and API endpoints
- `storage.py` - SQLite storage for Prompt Builder mappings (CRUD on `data/splunked.db`)
- `training_storage.py` - SQLite storage for training content (modules, pipelines, steps)

### Frontend
Each page has a corresponding JS file in `static/` that handles client-side logic:
- `glossary.js` - SPL command/function reference with search and three-depth tabs
- `training.js` - Training center with lessons, scenarios, challenges, and pipelines
- `prompt-builder.js` - Visual query composition tool
- `references.js` - Splunk knowledge base
- `query-library.js` - Curated query examples

Templates in `templates/` use Jinja2 with `_base.html` as the layout.

### Data Flow
- **Prompt Builder**: Browser → `/api/mappings/*` → `storage.py` → SQLite
- **Training**: Browser → `/api/training/*` → `training_storage.py` → SQLite
- Static JSON content in `static/data/` is loaded directly by frontend JS

### Training Content Pipeline
Training content can be authored as:
- **Markdown** (`.md`) with JSON front matter for lessons
- **JSON** files for tutorials, scenarios, and challenges

Content lives in `content/training/` and is imported into SQLite via `scripts/rebuild-training-db.py`. Pipelines are defined in `data/training-pipelines.json` and reference training module IDs.

## Code Style

- Python: 4-space indent, snake_case
- JavaScript: 4-space indent, camelCase
- CSS: kebab-case class names
- No formatter enforced; match existing patterns

## Testing

No formal test framework. After training changes:
1. Run `python scripts/rebuild-training-db.py --reset`
2. Open `/training` and verify content loads
3. Optionally: `curl http://127.0.0.1:5000/api/training/index`

## Content Authoring

See `docs/training-authoring.md` for training content standards. Key requirements:
- Dense metadata: id, type, title, description, category, difficulty, duration, tags, objectives
- No comments inside SPL blocks; explanations go in surrounding text
- Lessons follow: Goal → Minimal path → Variations → Pitfalls → Next steps
- Scenarios require pivot steps and reasoning checkpoints
