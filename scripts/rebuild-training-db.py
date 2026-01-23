#!/usr/bin/env python3
"""
Rebuild the training tables from content files and pipeline definitions.

Supports:
- Markdown lessons with JSON front matter
- JSON modules for tutorials/scenarios/challenges
"""

import argparse
import json
import sys
from pathlib import Path

import training_storage


# Validation warnings
WARNINGS = []


def warn(message, file_path=None):
    """Add a validation warning."""
    prefix = f"[{file_path}] " if file_path else ""
    WARNINGS.append(f"  WARNING: {prefix}{message}")


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


def validate_module(payload, content, file_path):
    """Validate module structure and emit warnings for issues."""
    module_type = payload.get("type")
    module_id = payload.get("id", "unknown")

    # Check required metadata fields
    required_fields = ["id", "type", "title", "description"]
    for field in required_fields:
        if not payload.get(field):
            warn(f"Missing required field '{field}'", file_path)

    # Check recommended metadata
    recommended_fields = ["category", "difficulty", "duration", "tags", "objectives"]
    for field in recommended_fields:
        if not payload.get(field):
            warn(f"Missing recommended field '{field}'", file_path)

    if not content:
        return

    # Scenario-specific validation
    if module_type == "scenario":
        # Warn on deprecated 'background' field
        if isinstance(content, dict) and "background" in content:
            warn(
                f"Deprecated 'background' field - migrate to 'situation' object format",
                file_path
            )

        # Check for situation object format
        if isinstance(content, dict):
            situation = content.get("situation")
            if situation and not isinstance(situation, dict):
                warn(
                    f"'situation' should be an object with 'title' and 'description'",
                    file_path
                )

            # Check for steps
            steps = content.get("steps")
            if not steps or not isinstance(steps, list):
                warn(f"Scenario missing 'steps' array", file_path)

    # Challenge-specific validation
    if module_type == "challenge" and isinstance(content, dict):
        # Detect schema type
        has_scenario = "scenario" in content
        has_requirements = "requirements" in content
        has_problem = "problem" in content or "problem_statement" in content
        has_solution = "solution" in content

        if has_scenario and has_requirements:
            # Assessment schema - validate requirements
            reqs = content.get("requirements", [])
            if not isinstance(reqs, list) or len(reqs) == 0:
                warn(f"Assessment challenge has empty 'requirements' array", file_path)
            for i, req in enumerate(reqs):
                if not req.get("title"):
                    warn(f"Requirement {i+1} missing 'title'", file_path)
                if not req.get("solution"):
                    warn(f"Requirement {i+1} missing 'solution'", file_path)
        elif has_problem or has_solution:
            # Structured schema - validate solution
            solution = content.get("solution")
            if not solution:
                warn(f"Structured challenge missing 'solution'", file_path)
            elif isinstance(solution, dict) and not solution.get("spl"):
                if not solution.get("panels"):
                    warn(f"Challenge solution missing 'spl' field", file_path)
        else:
            warn(
                f"Challenge doesn't match known schema (need scenario+requirements OR problem+solution)",
                file_path
            )

    # Tutorial-specific validation
    if module_type == "tutorial" and isinstance(content, dict):
        sections = content.get("sections")
        if not sections or not isinstance(sections, list):
            warn(f"Tutorial missing 'sections' array", file_path)
        else:
            for i, section in enumerate(sections):
                if not section.get("title"):
                    warn(f"Section {i+1} missing 'title'", file_path)


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

    # Run validation
    validate_module(payload, content, str(path))

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

    # Display validation warnings
    if WARNINGS:
        print(f"\nValidation warnings ({len(WARNINGS)}):")
        for warning in WARNINGS:
            print(warning)
        print("\nThese are warnings only - content was still imported.")


if __name__ == "__main__":
    main()
