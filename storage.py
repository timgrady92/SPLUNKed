"""
SQLite-backed persistence for SPLUNKed prompt builder mappings.
Keeps the API contract stable while removing JSON write fragility.
"""

import json
import os
import sqlite3
import uuid
from datetime import datetime

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "splunked.db")
SEED_PATH = os.path.join(DATA_DIR, "prompt-builder-mappings.json")

DEFAULT_MAPPINGS = {
    "dataSources": [],
    "fieldValues": [],
    "patterns": [],
    "outputShapes": [],
    "timeRangePresets": []
}

TYPE_KEY_MAP = {
    "dataSource": "dataSources",
    "dataSources": "dataSources",
    "fieldValue": "fieldValues",
    "fieldValues": "fieldValues",
    "pattern": "patterns",
    "patterns": "patterns",
    "outputShape": "outputShapes",
    "outputShapes": "outputShapes",
    "timeRangePreset": "timeRangePresets",
    "timeRangePresets": "timeRangePresets"
}

ID_PREFIX_MAP = {
    "dataSources": "ds",
    "fieldValues": "fv",
    "patterns": "pf",
    "outputShapes": "os",
    "timeRangePresets": "tr"
}


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
            CREATE TABLE IF NOT EXISTS mappings (
                id TEXT PRIMARY KEY,
                type_key TEXT NOT NULL,
                type TEXT,
                name TEXT,
                friendly_name TEXT,
                spl TEXT,
                tags TEXT,
                description TEXT,
                requires_field INTEGER,
                field_placeholder TEXT,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_mappings_type_key ON mappings (type_key)"
        )

    _seed_if_empty()


def _seed_if_empty():
    with _connect() as conn:
        count = conn.execute("SELECT COUNT(*) FROM mappings").fetchone()[0]
        if count:
            return

    seed = DEFAULT_MAPPINGS
    if os.path.exists(SEED_PATH):
        try:
            with open(SEED_PATH, "r") as f:
                seed = json.load(f)
        except (OSError, json.JSONDecodeError):
            seed = DEFAULT_MAPPINGS

    for type_key, items in seed.items():
        for item in items:
            _insert_mapping(type_key, item, allow_existing=True)


def get_type_key(type_name):
    return TYPE_KEY_MAP.get(type_name, type_name)


def resolve_type_key(type_name):
    type_key = get_type_key(type_name)
    return type_key if type_key in DEFAULT_MAPPINGS else None


def singularize_type_name(type_name):
    return type_name[:-1] if type_name.endswith("s") else type_name


def _row_to_object(row):
    if row is None:
        return None

    tags = []
    if row["tags"]:
        try:
            tags = json.loads(row["tags"])
        except json.JSONDecodeError:
            tags = []

    obj = {
        "id": row["id"],
        "type": row["type"] or singularize_type_name(row["type_key"]),
        "name": row["name"] or "",
        "friendlyName": row["friendly_name"] or (row["name"] or "").upper(),
        "spl": row["spl"] or "",
        "tags": tags,
        "description": row["description"] or ""
    }

    if row["requires_field"] is not None:
        obj["requiresField"] = bool(row["requires_field"])
    if row["field_placeholder"]:
        obj["fieldPlaceholder"] = row["field_placeholder"]

    return obj


def _insert_mapping(type_key, data, allow_existing=False):
    obj_id = data.get("id") or _generate_id(type_key)
    obj_type = data.get("type") or singularize_type_name(type_key)

    now = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    tags = data.get("tags", [])
    tags_json = json.dumps(tags) if isinstance(tags, list) else json.dumps([])

    with _connect() as conn:
        if allow_existing:
            existing = conn.execute(
                "SELECT 1 FROM mappings WHERE id = ?",
                (obj_id,)
            ).fetchone()
            if existing:
                return obj_id

        conn.execute(
            """
            INSERT INTO mappings (
                id, type_key, type, name, friendly_name, spl,
                tags, description, requires_field, field_placeholder,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                obj_id,
                type_key,
                obj_type,
                data.get("name", ""),
                data.get("friendlyName", data.get("name", "").upper()),
                data.get("spl", ""),
                tags_json,
                data.get("description", ""),
                1 if data.get("requiresField") else 0 if data.get("requiresField") is not None else None,
                data.get("fieldPlaceholder", ""),
                now,
                now
            )
        )

    return obj_id


def _generate_id(type_key):
    prefix = ID_PREFIX_MAP.get(type_key, "obj")
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


def get_all_mappings():
    data = {key: [] for key in DEFAULT_MAPPINGS}
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM mappings ORDER BY type_key, name"
        ).fetchall()
    for row in rows:
        obj = _row_to_object(row)
        if obj:
            data[row["type_key"]].append(obj)
    return data


def get_mappings_by_type(type_name):
    type_key = resolve_type_key(type_name)
    if not type_key:
        return None
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM mappings WHERE type_key = ? ORDER BY name",
            (type_key,)
        ).fetchall()
    return [_row_to_object(row) for row in rows]


def create_mapping(type_name, data):
    type_key = resolve_type_key(type_name)
    if not type_key:
        return None
    obj_id = _insert_mapping(type_key, data)
    return get_mapping_by_id(type_key, obj_id)


def get_mapping_by_id(type_key, obj_id):
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM mappings WHERE type_key = ? AND id = ?",
            (type_key, obj_id)
        ).fetchone()
    return _row_to_object(row)


def update_mapping(type_name, obj_id, data):
    type_key = resolve_type_key(type_name)
    if not type_key:
        return None

    obj = get_mapping_by_id(type_key, obj_id)
    if not obj:
        return None

    now = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    tags = data.get("tags", obj.get("tags", []))
    tags_json = json.dumps(tags) if isinstance(tags, list) else json.dumps([])

    requires_field = data.get("requiresField")
    if requires_field is None:
        requires_field = obj.get("requiresField")

    field_placeholder = data.get("fieldPlaceholder")
    if field_placeholder is None:
        field_placeholder = obj.get("fieldPlaceholder", "")

    with _connect() as conn:
        conn.execute(
            """
            UPDATE mappings
            SET name = ?, friendly_name = ?, spl = ?, tags = ?, description = ?,
                requires_field = ?, field_placeholder = ?, updated_at = ?
            WHERE type_key = ? AND id = ?
            """,
            (
                data.get("name", obj.get("name")),
                data.get("friendlyName", data.get("name", obj.get("name", "")).upper()),
                data.get("spl", obj.get("spl")),
                tags_json,
                data.get("description", obj.get("description", "")),
                1 if requires_field else 0 if requires_field is not None else None,
                field_placeholder or "",
                now,
                type_key,
                obj_id
            )
        )

    return get_mapping_by_id(type_key, obj_id)


def delete_mapping(type_name, obj_id):
    type_key = resolve_type_key(type_name)
    if not type_key:
        return None
    obj = get_mapping_by_id(type_key, obj_id)
    if not obj:
        return None
    with _connect() as conn:
        conn.execute(
            "DELETE FROM mappings WHERE type_key = ? AND id = ?",
            (type_key, obj_id)
        )
    return obj
