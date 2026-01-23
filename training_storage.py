"""
SQLite-backed storage for SPLUNKed training content and pipelines.
Keeps training metadata small for fast index loads and fetches full content on demand.
"""

import json
import os
import sqlite3
from datetime import datetime

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "splunked.db")
PIPELINES_SEED_PATH = os.path.join(DATA_DIR, "training-pipelines.json")


def _connect():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    return conn


def init_db():
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS training_modules (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT,
                bucket TEXT,
                difficulty TEXT,
                duration TEXT,
                tags_json TEXT,
                objectives_json TEXT,
                keywords_json TEXT,
                content_format TEXT,
                content TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS training_pipelines (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                level TEXT,
                duration TEXT,
                icon TEXT,
                objectives_json TEXT,
                track TEXT,
                sort_order INTEGER DEFAULT 0,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS training_pipeline_steps (
                id TEXT PRIMARY KEY,
                pipeline_id TEXT NOT NULL,
                step_index INTEGER NOT NULL,
                title TEXT NOT NULL,
                type TEXT,
                source TEXT,
                source_id TEXT,
                description TEXT,
                duration TEXT,
                link TEXT
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_training_modules_type ON training_modules (type)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_training_modules_category ON training_modules (category)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_training_pipeline_steps_pipeline ON training_pipeline_steps (pipeline_id)"
        )

    _seed_pipelines_if_empty()


def _seed_pipelines_if_empty():
    with _connect() as conn:
        count = conn.execute("SELECT COUNT(*) FROM training_pipelines").fetchone()[0]
        if count:
            return

    if not os.path.exists(PIPELINES_SEED_PATH):
        return

    try:
        with open(PIPELINES_SEED_PATH, "r") as handle:
            pipelines = json.load(handle)
    except (OSError, json.JSONDecodeError):
        return

    for pipeline in pipelines:
        upsert_pipeline(pipeline)


def _json_load(value, default):
    if not value:
        return default
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return default


def _json_dump(value):
    return json.dumps(value) if value is not None else None


def _row_to_module(row, include_content=False):
    if row is None:
        return None

    module = {
        "id": row["id"],
        "type": row["type"],
        "title": row["title"],
        "description": row["description"] or "",
        "category": row["category"],
        "bucket": row["bucket"],
        "difficulty": row["difficulty"],
        "duration": row["duration"],
        "tags": _json_load(row["tags_json"], []),
        "objectives": _json_load(row["objectives_json"], []),
        "keywords": _json_load(row["keywords_json"], []),
        "sortOrder": row["sort_order"] or 0
    }

    if include_content:
        content_format = row["content_format"] or "json"
        if module["type"] == "lesson":
            module["body"] = row["content"] or ""
        elif content_format == "json":
            module["content"] = _json_load(row["content"], {})
        else:
            module["content"] = row["content"] or ""

    return module


def _row_to_pipeline(row, steps):
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"] or "",
        "level": row["level"],
        "duration": row["duration"],
        "icon": row["icon"] or "",
        "objectives": _json_load(row["objectives_json"], []),
        "track": row["track"],
        "sortOrder": row["sort_order"] or 0,
        "steps": steps
    }


def _row_to_step(row):
    return {
        "id": row["id"],
        "title": row["title"] or "",
        "type": row["type"] or "",
        "source": row["source"] or "",
        "sourceId": row["source_id"],
        "description": row["description"] or "",
        "duration": row["duration"] or "",
        "link": row["link"]
    }


def get_training_index():
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT id, type, title, description, category, bucket, difficulty, duration,
                   tags_json, objectives_json, keywords_json, sort_order
            FROM training_modules
            ORDER BY sort_order ASC, title ASC
            """
        ).fetchall()

    lessons = {}
    training = {}
    for row in rows:
        module = _row_to_module(row, include_content=False)
        category = module.get("category") or "general"
        if module["type"] == "lesson":
            lessons.setdefault(category, []).append(module)
        else:
            training.setdefault(category, []).append(module)

    return {
        "lessons": lessons,
        "training": training,
        "pipelines": get_pipelines()
    }


def get_training_item(item_id):
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM training_modules WHERE id = ?",
            (item_id,)
        ).fetchone()
    return _row_to_module(row, include_content=True)


def get_pipelines():
    pipelines = []
    with _connect() as conn:
        pipeline_rows = conn.execute(
            """
            SELECT * FROM training_pipelines
            ORDER BY sort_order ASC, title ASC
            """
        ).fetchall()
        for row in pipeline_rows:
            steps_rows = conn.execute(
                """
                SELECT * FROM training_pipeline_steps
                WHERE pipeline_id = ?
                ORDER BY step_index ASC
                """,
                (row["id"],)
            ).fetchall()
            steps = [_row_to_step(step) for step in steps_rows]
            pipelines.append(_row_to_pipeline(row, steps))
    return pipelines


def reset_training_data():
    with _connect() as conn:
        conn.execute("DELETE FROM training_pipeline_steps")
        conn.execute("DELETE FROM training_pipelines")
        conn.execute("DELETE FROM training_modules")


def upsert_module(module):
    module_id = module.get("id")
    if not module_id:
        return None

    now = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    tags = module.get("tags") or []
    objectives = module.get("objectives") or []
    keywords = module.get("keywords") or []
    content = module.get("content", "")
    content_format = module.get("content_format", "json")
    if content_format == "json" and not isinstance(content, str):
        content = json.dumps(content)

    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO training_modules (
                id, type, title, description, category, bucket, difficulty, duration,
                tags_json, objectives_json, keywords_json, content_format, content,
                sort_order, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                type = excluded.type,
                title = excluded.title,
                description = excluded.description,
                category = excluded.category,
                bucket = excluded.bucket,
                difficulty = excluded.difficulty,
                duration = excluded.duration,
                tags_json = excluded.tags_json,
                objectives_json = excluded.objectives_json,
                keywords_json = excluded.keywords_json,
                content_format = excluded.content_format,
                content = excluded.content,
                sort_order = excluded.sort_order,
                updated_at = excluded.updated_at
            """,
            (
                module_id,
                module.get("type"),
                module.get("title"),
                module.get("description", ""),
                module.get("category"),
                module.get("bucket"),
                module.get("difficulty"),
                module.get("duration"),
                _json_dump(tags),
                _json_dump(objectives),
                _json_dump(keywords),
                content_format,
                content,
                module.get("sortOrder", 0),
                now,
                now
            )
        )
    return module_id


def upsert_pipeline(pipeline):
    pipeline_id = pipeline.get("id")
    if not pipeline_id:
        return None

    now = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    objectives = pipeline.get("objectives", [])

    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO training_pipelines (
                id, title, description, level, duration, icon,
                objectives_json, track, sort_order, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                level = excluded.level,
                duration = excluded.duration,
                icon = excluded.icon,
                objectives_json = excluded.objectives_json,
                track = excluded.track,
                sort_order = excluded.sort_order,
                updated_at = excluded.updated_at
            """,
            (
                pipeline_id,
                pipeline.get("title"),
                pipeline.get("description", ""),
                pipeline.get("level"),
                pipeline.get("duration"),
                pipeline.get("icon", ""),
                _json_dump(objectives),
                pipeline.get("track"),
                pipeline.get("sortOrder", 0),
                now,
                now
            )
        )

        conn.execute(
            "DELETE FROM training_pipeline_steps WHERE pipeline_id = ?",
            (pipeline_id,)
        )

        for index, step in enumerate(pipeline.get("steps", [])):
            raw_step_id = step.get("id") or f"step-{index + 1}"
            step_id = f"{pipeline_id}-{raw_step_id}"
            conn.execute(
                """
                INSERT INTO training_pipeline_steps (
                    id, pipeline_id, step_index, title, type, source, source_id,
                    description, duration, link
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    step_id,
                    pipeline_id,
                    index,
                    step.get("title", ""),
                    step.get("type"),
                    step.get("source"),
                    step.get("sourceId"),
                    step.get("description", ""),
                    step.get("duration"),
                    step.get("link")
                )
            )

    return pipeline_id
