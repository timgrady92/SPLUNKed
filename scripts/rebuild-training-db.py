#!/usr/bin/env python3
"""
Rebuild the training tables from content files and pipeline definitions.

Supports:
- Markdown lessons with JSON front matter
- JSON modules for tutorials/scenarios/challenges
"""

import argparse
import json
from pathlib import Path

import training_storage


def read_text(path):
    return path.read_text(encoding="utf-8")


def parse_front_matter(raw):
    if not raw.startswith("---"):
        raise ValueError("Missing front matter block")

    parts = raw.split("---", 2)
    if len(parts) < 3:
        raise ValueError("Invalid front matter block")

    meta_text = parts[1].strip()
    body = parts[2].lstrip("\n")
    meta = json.loads(meta_text)
    return meta, body


def render_markdown(markdown_text):
    try:
        import markdown  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "Markdown is required to build lesson HTML. "
            "Install with: pip install markdown"
        ) from exc

    return markdown.markdown(markdown_text, extensions=["extra", "tables"])


def load_markdown_module(path):
    raw = read_text(path)
    meta, body = parse_front_matter(raw)

    module_type = meta.get("type")
    if module_type != "lesson":
        raise ValueError(f"Markdown content only supports lessons (got {module_type})")

    html_body = render_markdown(body)
    return {
        **meta,
        "content_format": "html",
        "content": html_body
    }


def load_json_module(path):
    payload = json.loads(read_text(path))
    module_type = payload.get("type")
    content_format = payload.get("content_format")

    content = payload.pop("content", None)
    if module_type == "lesson":
        content = payload.pop("body", content)
        content_format = content_format or "html"
    else:
        content_format = content_format or "json"

    if module_type != "lesson" and content is None:
        raise ValueError(f"Missing content for module {payload.get('id')}")

    return {
        **payload,
        "content_format": content_format,
        "content": json.dumps(content) if content_format == "json" else (content or "")
    }


def iter_modules(content_dir):
    for path in sorted(content_dir.rglob("*")):
        if path.suffix == ".md":
            yield load_markdown_module(path)
        elif path.suffix == ".json":
            yield load_json_module(path)


def load_pipelines(path):
    if not path.exists():
        return []
    return json.loads(read_text(path))


def main():
    parser = argparse.ArgumentParser(description="Rebuild training database.")
    parser.add_argument(
        "--content-dir",
        default="content/training",
        help="Path to training content directory"
    )
    parser.add_argument(
        "--pipelines",
        default="data/training-pipelines.json",
        help="Path to pipeline definition JSON"
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Clear existing training data before importing"
    )
    args = parser.parse_args()

    training_storage.init_db()
    if args.reset:
        training_storage.reset_training_data()

    content_dir = Path(args.content_dir)
    if content_dir.exists():
        for module in iter_modules(content_dir):
            training_storage.upsert_module(module)

    pipelines = load_pipelines(Path(args.pipelines))
    for pipeline in pipelines:
        training_storage.upsert_pipeline(pipeline)

    print("Training database rebuild complete.")


if __name__ == "__main__":
    main()
