# SPLUNKed

> **Note**: This is an offline educational resource and is not affiliated with Splunk Inc. SPL syntax and concepts are based on publicly available documentation.

**Training wheels for security analysts.**

SPLUNKed is a guided interface for learning Splunk's Search Processing Language (SPL). It lets junior analysts write meaningful queries on day one while building the knowledge to outgrow it.

## Quick Start

1. Clone the repository, create a virtual environment, and install dependencies:

```bash
git clone https://www.github.com/yourusername/SPLUNKed
cd SPLUNKed
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Start the server:

```bash
source venv/bin/activate
python app.py
```

3. Open `http://127.0.0.1:5000` in your browser.

## Philosophy

Most SIEM tools assume you already know SPL. SPLUNKed assumes you're learning.

Every glossary entry shows the exact syntax that will run. Every guide links back to the commands that matter. Every training scenario explains not just *what* to search for, but *why* it matters and *when* to pivot.

**We measure success by obsolescence.** An analyst who needs SPLUNKed indefinitely isn't learning—they're dependent. The goal is internalized knowledge, not a permanent crutch.

## How It Works

### Day One Value

Junior analysts can write effective SPL queries immediately:

- **Search basics**—filter events, extract fields, and narrow results without memorizing syntax
- **Statistical analysis**—count, aggregate, and summarize security data with guided examples
- **Threat hunting**—investigate authentication failures, process execution, and network anomalies
- **Timeline building**—correlate events across sources to reconstruct incidents

No command-line memorization required. No syntax errors. No wasted cycles on typos.

### Transparent Learning

Every action teaches:

- **Syntax preview**: See exactly what each command does before using it. Read it. Understand it. Eventually, type it yourself.
- **Integrated glossary**: Access 150+ SPL commands, functions, and concepts. Each entry explains what it does, when to use it, and common pitfalls to avoid.
- **Investigation guides**: Use-case driven playbooks that frame security problems, identify data sources, and define what "done" looks like.

The UI is explicit about what it's doing. Nothing is hidden. Nothing is magic.

### Progressive Disclosure

Content reveals detail as needed:

- **Essential tab**: Core understanding—what the command does and basic syntax
- **Practical tab**: Hands-on usage—gotchas, common use cases, and real examples
- **Deep Dive tab**: Advanced patterns—performance considerations, edge cases, and internals

Start simple. Go deeper when ready. Skip what you already know.

## Glossary

The glossary is an SPL reference library available everywhere in SPLUNKed.

### Six Categories

Commands are organized by what they do:

| Icon | Category | Purpose |
|------|----------|---------|
| ↓ | Get Data | Retrieve events from indexes and data sources |
| ⧩ | Filter | Narrow results using search criteria |
| ⟳ | Transform | Reshape, rename, and manipulate fields |
| Σ | Aggregate | Count, sum, average, and statistical operations |
| ⊕ | Combine | Join, append, and correlate multiple datasets |
| ▤ | Output | Format results for tables, charts, and exports |

### Functions and Reference

Beyond commands, the glossary covers:

- **Eval functions**: String manipulation, math, date/time conversions, conditional logic
- **Stats functions**: Aggregation functions for summarizing data
- **Reference material**: Common fields, CIM compliance, field extractions, macros
- **Antipatterns**: Common mistakes and how to avoid them

### Contextual Access

Glossary terms are linked throughout guides and training scenarios. See a command you don't recognize? It's a link. Click it for the full reference without leaving the page.

## Guides

Guides are investigation playbooks designed to build security intuition.

### Eight Categories

- **Search Basics**: Foundation queries every analyst needs
- **Counting & Summarizing**: Statistical analysis for security metrics
- **Filtering & Refining**: Narrowing results to what matters
- **Visualizing Data**: Charts, timelines, and dashboards
- **Security & Investigation**: Threat hunting and incident response
- **Data Sources**: Understanding what your logs contain
- **Enriching Data**: Lookups, joins, and correlation
- **Dashboards**: Building operational views

### What Every Guide Contains

- **Context**: What security question you're answering
- **Data sources**: Which indexes and sourcetypes to query
- **SPL patterns**: Working queries you can adapt
- **Interpretation**: What the results mean and what to look for
- **Next steps**: Where to pivot when you find something

## Training Center

Structured learning paths organized by skill level and security domain.

### Five Skill Levels

| Level | Focus |
|-------|-------|
| Foundations | Basic syntax and search concepts |
| Core Skills | Essential commands every analyst needs |
| Intermediate | Combining techniques for real investigations |
| Advanced | Complex queries and performance optimization |
| Expert | Building production-ready searches and dashboards |

### Three Learning Types

- **Tutorials**: Step-by-step walkthroughs of concepts
- **Scenarios**: Realistic situations requiring investigation
- **Challenges**: Advanced problems that test mastery

### Five Security Domains

- **Authentication**: Identity, access, and credential events
- **Network**: Traffic analysis and connection patterns
- **Endpoint**: Process execution, file activity, and system events
- **Incident Response**: Threat hunting and forensic queries
- **Basics**: Foundational concepts for all domains

## Prompt Builder

Visual query composition for building SPL without memorizing syntax.

Combine reusable building blocks:

- **Data Sources**: Pre-built index and sourcetype combinations
- **Filters**: Common field values and search patterns
- **Output Shapes**: Formatting for tables, charts, and timelines
- **Time Ranges**: Preset windows for common investigations

Build queries visually. See the SPL it generates. Learn by doing.

## The Goal

SPLUNKed is scaffolding. Scaffolding comes down.

When an analyst can write SPL directly, explain what each command does, and build their own queries without guidance—they've outgrown the training wheels. That's the win.

## Requirements

- Python 3.11+
- Flask 3.0+
- A web browser

No Splunk installation required. SPLUNKed is an offline learning tool.

## License

MIT
