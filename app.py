"""
SPLUNKed - Educational SPL Learning Platform

A web application for Splunk analysts to learn SPL (Search Processing Language).
Mirrors SIFTed's scaffolding for learning philosophy with Splunk-inspired aesthetics.
"""

import re

import storage
import training_storage
from flask import Flask, render_template, request, jsonify, redirect, url_for

app = Flask(__name__)

storage.init_db()
training_storage.init_db()


def index_by_id(items):
    """Build an id->object lookup for fast access."""
    return {item.get("id"): item for item in items if item.get("id")}


# Page Routes
@app.route("/")
def index():
    """Landing page with feature overview."""
    return render_template("index.html")


@app.route("/glossary")
def glossary():
    """SPL Glossary page with searchable command and function reference."""
    return render_template("glossary.html")


@app.route("/references")
def references():
    """Splunk Knowledge page with concepts, fields, CIM, and best practices."""
    return render_template("references.html")


@app.route("/enterprise-security")
def enterprise_security():
    """Redirect to Knowledge page with Enterprise Security tab."""
    return redirect(url_for('references') + '?tab=enterpriseSecurity')


@app.route("/guides")
def guides():
    """Redirect to training page with lessons tab for backwards compatibility."""
    return redirect(url_for('training') + '?tab=lessons')


@app.route("/prompt-builder")
def prompt_builder():
    """Prompt Builder page for composing SPL queries."""
    return render_template("prompt-builder.html")


@app.route("/training")
def training():
    """Training page with curated learning pipelines and SOC scenarios."""
    return render_template("training.html")


@app.route("/query-library")
def query_library():
    """Query Library page with curated SPL queries for analyst inspiration."""
    return render_template("query-library.html")


# Training Content API
@app.route("/api/training/index", methods=["GET"])
def training_index():
    """Return lightweight training metadata for search and listings."""
    return jsonify(training_storage.get_training_index())


@app.route("/api/training/items/<item_id>", methods=["GET"])
def training_item(item_id):
    """Return full training content for a specific item."""
    item = training_storage.get_training_item(item_id)
    if not item:
        return jsonify({"error": f"Training item not found: {item_id}"}), 404
    return jsonify(item)


# API Routes for Prompt Builder
@app.route("/api/mappings", methods=['GET'])
def get_all_mappings():
    """Get all search objects."""
    return jsonify(storage.get_all_mappings())


@app.route("/api/mappings/<type_name>", methods=['GET'])
def get_mappings_by_type(type_name):
    """Get search objects by type."""
    type_key = storage.resolve_type_key(type_name)
    if not type_key:
        return jsonify({"error": f"Unknown type: {type_name}"}), 404

    records = storage.get_mappings_by_type(type_name)
    return jsonify(records)


@app.route("/api/mappings/<type_name>", methods=['POST'])
def create_mapping(type_name):
    """Create a new search object."""
    type_key = storage.resolve_type_key(type_name)
    if not type_key:
        return jsonify({"error": f"Unknown type: {type_name}"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    new_object = storage.create_mapping(type_name, data)
    return jsonify(new_object), 201


@app.route("/api/mappings/<type_name>/<obj_id>", methods=['PUT'])
def update_mapping(type_name, obj_id):
    """Update an existing search object."""
    type_key = storage.resolve_type_key(type_name)
    if not type_key:
        return jsonify({"error": f"Unknown type: {type_name}"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    obj = storage.update_mapping(type_name, obj_id, data)
    if not obj:
        return jsonify({"error": f"Object not found: {obj_id}"}), 404
    return jsonify(obj)


@app.route("/api/mappings/<type_name>/<obj_id>", methods=['DELETE'])
def delete_mapping(type_name, obj_id):
    """Delete a search object."""
    type_key = storage.resolve_type_key(type_name)
    if not type_key:
        return jsonify({"error": f"Unknown type: {type_name}"}), 404

    deleted = storage.delete_mapping(type_name, obj_id)
    if not deleted:
        return jsonify({"error": f"Object not found: {obj_id}"}), 404
    return jsonify({"message": "Deleted", "object": deleted})


@app.route("/api/generate-spl", methods=['POST'])
def generate_spl():
    """Generate SPL from a composition of search objects."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    def normalize_spl_part(spl):
        return " ".join(spl.split()) if spl else ""

    def is_generating_spl(spl):
        return normalize_spl_part(spl).startswith("|")

    def is_wrapped(spl):
        return spl.startswith("(") and spl.endswith(")")

    def is_negated(spl):
        return bool(re.match(r"^NOT\b", normalize_spl_part(spl), flags=re.IGNORECASE))

    def wrap_spl(spl):
        trimmed = normalize_spl_part(spl)
        if not trimmed:
            return ""
        return trimmed if is_wrapped(trimmed) else f"({trimmed})"

    def wrap_if_or(spl):
        trimmed = normalize_spl_part(spl)
        if not trimmed:
            return ""
        if is_negated(trimmed):
            remainder = re.sub(r"^NOT\b\s*", "", trimmed, flags=re.IGNORECASE)
            if not remainder:
                return trimmed
            if re.search(r"\bOR\b", remainder, flags=re.IGNORECASE) and not is_wrapped(remainder):
                return f"NOT {wrap_spl(remainder)}"
            return trimmed
        return wrap_spl(trimmed) if re.search(r"\bOR\b", trimmed, flags=re.IGNORECASE) else trimmed

    mappings = storage.get_all_mappings()
    data_sources_by_id = index_by_id(mappings.get("dataSources", []))
    patterns_by_id = index_by_id(mappings.get("patterns", []))
    field_values_by_id = index_by_id(mappings.get("fieldValues", []))
    output_shapes_by_id = index_by_id(mappings.get("outputShapes", []))
    time_presets_by_id = index_by_id(mappings.get("timeRangePresets", []))
    filter_objects_by_id = {**patterns_by_id, **field_values_by_id}

    # Extract selections from request
    data_sources = data.get("dataSources", [])
    includes = data.get("includes", [])  # Patterns and field values to include
    excludes = data.get("excludes", [])  # Patterns and field values to exclude
    time_range = data.get("timeRange", "")
    output_shape = data.get("outputShape", None)
    output_field = data.get("outputField", "")

    filter_parts = []
    explanation_parts = []
    base_search = ""

    # Build data sources (OR together)
    data_source_entries = []
    if data_sources:
        for ds_id in data_sources:
            ds = data_sources_by_id.get(ds_id)
            if ds:
                spl = normalize_spl_part(ds.get("spl", ""))
                if spl:
                    data_source_entries.append({
                        "name": ds.get("name"),
                        "spl": spl
                    })

        generating_sources = [e for e in data_source_entries if is_generating_spl(e["spl"])]
        event_sources = [e for e in data_source_entries if not is_generating_spl(e["spl"])]

        if generating_sources:
            base_search = generating_sources[0]["spl"]
            explanation_parts.append(f"Search in: {generating_sources[0]['name']}")
        elif event_sources:
            ds_names = [e["name"] for e in event_sources if e["name"]]
            ds_spls = [e["spl"] for e in event_sources]
            or_group = " OR ".join(ds_spls)
            base_search = or_group if len(ds_spls) > 1 else ds_spls[0]
            if ds_names:
                explanation_parts.append(f"Search in: {', '.join(ds_names)}")

    # Build includes (AND together)
    if includes:
        include_spls = []
        include_names = []
        for inc_id in includes:
            obj = filter_objects_by_id.get(inc_id)
            if obj:
                normalized = normalize_spl_part(obj.get("spl", ""))
                if not normalized:
                    continue
                include_spls.append(wrap_if_or(normalized))
                include_names.append(obj.get("name"))
        if include_spls:
            filter_parts.extend(include_spls)
            explanation_parts.append(f"Filter for: {', '.join(include_names)}")

    # Build excludes (NOT each)
    if excludes:
        exclude_spls = []
        exclude_names = []
        for exc_id in excludes:
            obj = filter_objects_by_id.get(exc_id)
            if obj:
                normalized = normalize_spl_part(obj.get("spl", ""))
                if not normalized:
                    continue
                if is_negated(normalized):
                    exclude_spls.append(wrap_if_or(normalized))
                else:
                    exclude_spls.append(f"NOT {wrap_spl(normalized)}")
                exclude_names.append(obj.get("name"))
        if exclude_spls:
            filter_parts.extend(exclude_spls)
            explanation_parts.append(f"Excluding: {', '.join(exclude_names)}")

    # Add time range
    time_spl = ""
    if time_range:
        # Check if it's a preset ID
        preset = time_presets_by_id.get(time_range)
        if preset:
            time_spl = normalize_spl_part(preset.get("spl", ""))
            explanation_parts.append(f"Time range: {preset.get('name')}")
        else:
            # Assume it's custom SPL
            time_spl = normalize_spl_part(time_range)
            explanation_parts.append(f"Time range: {time_range}")

    # Build base search
    if not base_search and not filter_parts:
        base_search = "*"

    if base_search and not is_generating_spl(base_search):
        if len([e for e in data_source_entries if not is_generating_spl(e["spl"])]) > 1 and (filter_parts or time_spl):
            base_search = wrap_spl(base_search)
        combined = [base_search]
        if time_spl:
            combined.append(time_spl)
        combined.extend(filter_parts)
        base_search = " ".join([c for c in combined if c])
    elif base_search:
        if time_spl:
            base_search = f"{base_search} {time_spl}"
        if filter_parts:
            base_search = f"{base_search} | search {' '.join(filter_parts)}"
    else:
        combined = []
        if filter_parts:
            combined.append(" ".join(filter_parts))
        if time_spl:
            combined.append(time_spl)
        base_search = " ".join([c for c in combined if c]) or "*"

    # Add output shape
    output_spl = ""
    if output_shape:
        os_obj = output_shapes_by_id.get(output_shape)
        if os_obj:
            output_spl = os_obj.get("spl", "")
            # Replace field placeholder if needed
            if os_obj.get("requiresField") and output_field:
                output_spl = output_spl.replace(os_obj.get("fieldPlaceholder", "{field}"), output_field)
                output_spl = output_spl.replace("{field1}", output_field)
                output_spl = output_spl.replace("{field2}", output_field)
            explanation_parts.append(f"Output: {os_obj.get('name')}")

    # Combine everything
    full_spl = base_search
    if output_spl:
        full_spl = f"{base_search} {output_spl}"

    return jsonify({
        "spl": full_spl,
        "explanation": " | ".join(explanation_parts) if explanation_parts else "Search all events",
        "components": {
            "baseSearch": base_search,
            "outputShape": output_spl
        }
    })


# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors."""
    return render_template("index.html"), 404


@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors."""
    return render_template("index.html"), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
