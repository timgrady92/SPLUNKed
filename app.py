"""
SPLUNKed - Educational SPL Learning Platform

A web application for Splunk analysts to learn SPL (Search Processing Language).
Mirrors SIFTed's scaffolding for learning philosophy with Splunk-inspired aesthetics.
"""

import json
import os
import uuid
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Path to the mappings JSON file
MAPPINGS_FILE = os.path.join(os.path.dirname(__file__), 'data', 'prompt-builder-mappings.json')


def load_mappings():
    """Load mappings from JSON file."""
    try:
        with open(MAPPINGS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "dataSources": [],
            "fieldValues": [],
            "patterns": [],
            "outputShapes": [],
            "timeRangePresets": []
        }


def save_mappings(data):
    """Save mappings to JSON file."""
    os.makedirs(os.path.dirname(MAPPINGS_FILE), exist_ok=True)
    with open(MAPPINGS_FILE, 'w') as f:
        json.dump(data, f, indent=4)


def get_type_key(type_name):
    """Convert type name to JSON key."""
    type_map = {
        'dataSource': 'dataSources',
        'dataSources': 'dataSources',
        'fieldValue': 'fieldValues',
        'fieldValues': 'fieldValues',
        'pattern': 'patterns',
        'patterns': 'patterns',
        'outputShape': 'outputShapes',
        'outputShapes': 'outputShapes'
    }
    return type_map.get(type_name, type_name)


# Page Routes
@app.route("/")
def index():
    """Landing page with feature overview."""
    return render_template("index.html")


@app.route("/glossary")
def glossary():
    """SPL Glossary page with searchable command reference."""
    return render_template("glossary.html")


@app.route("/guides")
def guides():
    """Investigation guides page with detection and data source guides."""
    return render_template("guides.html")


@app.route("/prompt-builder")
def prompt_builder():
    """Prompt Builder page for composing SPL queries."""
    return render_template("prompt-builder.html")


@app.route("/training")
def training():
    """Training page with curated learning pipelines and SOC scenarios."""
    return render_template("training.html")


# API Routes for Prompt Builder
@app.route("/api/mappings", methods=['GET'])
def get_all_mappings():
    """Get all search objects."""
    mappings = load_mappings()
    return jsonify(mappings)


@app.route("/api/mappings/<type_name>", methods=['GET'])
def get_mappings_by_type(type_name):
    """Get search objects by type."""
    mappings = load_mappings()
    type_key = get_type_key(type_name)
    if type_key in mappings:
        return jsonify(mappings[type_key])
    return jsonify({"error": f"Unknown type: {type_name}"}), 404


@app.route("/api/mappings/<type_name>", methods=['POST'])
def create_mapping(type_name):
    """Create a new search object."""
    mappings = load_mappings()
    type_key = get_type_key(type_name)

    if type_key not in mappings:
        return jsonify({"error": f"Unknown type: {type_name}"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Generate ID and set type
    prefix_map = {
        'dataSources': 'ds',
        'fieldValues': 'fv',
        'patterns': 'pf',
        'outputShapes': 'os'
    }
    prefix = prefix_map.get(type_key, 'obj')
    new_id = f"{prefix}_{uuid.uuid4().hex[:8]}"

    new_object = {
        "id": new_id,
        "type": type_name.rstrip('s') if type_name.endswith('s') else type_name,
        "name": data.get("name", ""),
        "friendlyName": data.get("friendlyName", data.get("name", "").upper()),
        "spl": data.get("spl", ""),
        "tags": data.get("tags", []),
        "description": data.get("description", "")
    }

    # Add optional fields for output shapes
    if type_key == 'outputShapes':
        if data.get("requiresField"):
            new_object["requiresField"] = True
            new_object["fieldPlaceholder"] = data.get("fieldPlaceholder", "{field}")

    mappings[type_key].append(new_object)
    save_mappings(mappings)

    return jsonify(new_object), 201


@app.route("/api/mappings/<type_name>/<obj_id>", methods=['PUT'])
def update_mapping(type_name, obj_id):
    """Update an existing search object."""
    mappings = load_mappings()
    type_key = get_type_key(type_name)

    if type_key not in mappings:
        return jsonify({"error": f"Unknown type: {type_name}"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Find and update the object
    for i, obj in enumerate(mappings[type_key]):
        if obj.get("id") == obj_id:
            # Update fields
            mappings[type_key][i]["name"] = data.get("name", obj.get("name"))
            mappings[type_key][i]["friendlyName"] = data.get("friendlyName", data.get("name", obj.get("name")).upper())
            mappings[type_key][i]["spl"] = data.get("spl", obj.get("spl"))
            mappings[type_key][i]["tags"] = data.get("tags", obj.get("tags", []))
            mappings[type_key][i]["description"] = data.get("description", obj.get("description"))

            # Handle optional fields for output shapes
            if type_key == 'outputShapes':
                mappings[type_key][i]["requiresField"] = data.get("requiresField", obj.get("requiresField", False))
                if mappings[type_key][i]["requiresField"]:
                    mappings[type_key][i]["fieldPlaceholder"] = data.get("fieldPlaceholder", obj.get("fieldPlaceholder", "{field}"))

            save_mappings(mappings)
            return jsonify(mappings[type_key][i])

    return jsonify({"error": f"Object not found: {obj_id}"}), 404


@app.route("/api/mappings/<type_name>/<obj_id>", methods=['DELETE'])
def delete_mapping(type_name, obj_id):
    """Delete a search object."""
    mappings = load_mappings()
    type_key = get_type_key(type_name)

    if type_key not in mappings:
        return jsonify({"error": f"Unknown type: {type_name}"}), 404

    # Find and remove the object
    for i, obj in enumerate(mappings[type_key]):
        if obj.get("id") == obj_id:
            deleted = mappings[type_key].pop(i)
            save_mappings(mappings)
            return jsonify({"message": "Deleted", "object": deleted})

    return jsonify({"error": f"Object not found: {obj_id}"}), 404


@app.route("/api/generate-spl", methods=['POST'])
def generate_spl():
    """Generate SPL from a composition of search objects."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    mappings = load_mappings()

    # Extract selections from request
    data_sources = data.get("dataSources", [])
    includes = data.get("includes", [])  # Patterns and field values to include
    excludes = data.get("excludes", [])  # Patterns and field values to exclude
    time_range = data.get("timeRange", "")
    output_shape = data.get("outputShape", None)
    output_field = data.get("outputField", "")

    spl_parts = []
    explanation_parts = []

    # Build data sources (OR together)
    if data_sources:
        ds_spls = []
        ds_names = []
        for ds_id in data_sources:
            ds = next((d for d in mappings.get("dataSources", []) if d.get("id") == ds_id), None)
            if ds:
                ds_spls.append(f"({ds.get('spl')})")
                ds_names.append(ds.get("name"))
        if ds_spls:
            if len(ds_spls) > 1:
                spl_parts.append(f"({' OR '.join(ds_spls)})")
            else:
                spl_parts.append(ds_spls[0])
            explanation_parts.append(f"Search in: {', '.join(ds_names)}")

    # Build includes (AND together)
    if includes:
        include_spls = []
        include_names = []
        all_objects = mappings.get("patterns", []) + mappings.get("fieldValues", [])
        for inc_id in includes:
            obj = next((o for o in all_objects if o.get("id") == inc_id), None)
            if obj:
                include_spls.append(obj.get("spl"))
                include_names.append(obj.get("name"))
        if include_spls:
            spl_parts.extend(include_spls)
            explanation_parts.append(f"Filter for: {', '.join(include_names)}")

    # Build excludes (NOT each)
    if excludes:
        exclude_spls = []
        exclude_names = []
        all_objects = mappings.get("patterns", []) + mappings.get("fieldValues", [])
        for exc_id in excludes:
            obj = next((o for o in all_objects if o.get("id") == exc_id), None)
            if obj:
                exclude_spls.append(f"NOT {obj.get('spl')}")
                exclude_names.append(obj.get("name"))
        if exclude_spls:
            spl_parts.extend(exclude_spls)
            explanation_parts.append(f"Excluding: {', '.join(exclude_names)}")

    # Add time range
    time_spl = ""
    if time_range:
        # Check if it's a preset ID
        preset = next((t for t in mappings.get("timeRangePresets", []) if t.get("id") == time_range), None)
        if preset:
            time_spl = preset.get("spl", "")
            explanation_parts.append(f"Time range: {preset.get('name')}")
        else:
            # Assume it's custom SPL
            time_spl = time_range
            explanation_parts.append(f"Time range: {time_range}")

    # Build base search
    base_search = " ".join(spl_parts) if spl_parts else "*"
    if time_spl:
        base_search = f"{base_search} {time_spl}"

    # Add output shape
    output_spl = ""
    if output_shape:
        os_obj = next((o for o in mappings.get("outputShapes", []) if o.get("id") == output_shape), None)
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
