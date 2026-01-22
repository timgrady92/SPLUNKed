# Repository Guidelines

## Project Structure & Module Organization

- `app.py` is the Flask entrypoint and defines web/API routes.
- `storage.py` handles prompt-builder mappings in SQLite.
- `training_storage.py` stores training content and pipelines in SQLite.
- `templates/` contains Jinja2 HTML templates.
- `static/` holds JS/CSS assets and fonts.
- `content/` is the file-based source for training content (imported into SQLite).
- `data/` stores SQLite DB (`data/splunked.db`) and seed files (e.g., `data/training-pipelines.json`).
- `scripts/` includes maintenance tools like the training DB rebuild script.

## Build, Test, and Development Commands

- `python -m venv venv` and `source venv/bin/activate` to create/activate the virtual env.
- `pip install -r requirements.txt` to install dependencies.
- `python app.py` to run the local server at `http://127.0.0.1:5000`.
- `python scripts/rebuild-training-db.py --reset` to rebuild training content from `content/`.

## Coding Style & Naming Conventions

- Python: 4-space indent, snake_case for functions and variables.
- JavaScript: 4-space indent, camelCase for variables, const for constants.
- CSS: kebab-case class names; reuse existing utility styles where possible.
- Keep changes consistent with existing patterns; no formatter is enforced.

## Testing Guidelines

- No formal test framework is configured.
- For training changes, rebuild and sanity-check endpoints:
  - `python scripts/rebuild-training-db.py --reset`
  - Open `/training` and verify cards/modals load.
  - Optional: `curl http://127.0.0.1:5000/api/training/index`

## Commit & Pull Request Guidelines

- Commit messages are short, imperative summaries (e.g., `Add training index API`).
- PRs should include a clear description, relevant screenshots for UI changes,
  and note any data migrations or content rebuild steps.

## Data & Content Notes

- Training content is stored in SQLite and fetched via `/api/training/index`
  and `/api/training/items/<id>`.
- Pipelines live in `data/training-pipelines.json` and reference training IDs.
