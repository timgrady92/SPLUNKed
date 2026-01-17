"""
SPLUNKed - Educational SPL Learning Platform

A web application for Splunk analysts to learn SPL (Search Processing Language).
Mirrors SIFTed's scaffolding for learning philosophy with Splunk-inspired aesthetics.
"""

from flask import Flask, render_template

app = Flask(__name__)


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
