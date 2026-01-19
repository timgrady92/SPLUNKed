# SPLUNKed

> **Note**: This is an offline educational resource and is not affiliated with Splunk Inc. SPL syntax and concepts are based on publicly available documentation.

**A structured learning platform for Splunk's Search Processing Language.**

SPLUNKed is an educational web application that helps security analysts learn SPL through curated reference materials, investigation guides, and progressive training scenarios. It's a sister project to [SIFTed](https://github.com/timgrady92/SIFTed)—where SIFTed provides guided tooling for forensic workflows, SPLUNKed provides guided learning for SIEM query language.

## Quick Start

```bash
git clone https://www.github.com/yourusername/SPLUNKed
cd SPLUNKed
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000` in your browser.

## Why SPLUNKed?

SPL has a steep learning curve. Official documentation is comprehensive but scattered. Most analysts learn through trial and error, Stack Overflow posts, and inherited queries they don't fully understand.

SPLUNKed organizes SPL knowledge the way analysts actually need it:

- **By task**: "How do I count failed logins?" not "What does the `stats` command do?"
- **By depth**: Essential syntax first, advanced patterns when you're ready
- **By context**: Security-focused examples, not generic data processing

The goal is confident SPL literacy—analysts who understand what they're writing, not just copying queries that work.

## Features

### Glossary

A reference library of 150+ SPL commands, functions, and concepts.

**Six command categories by function:**

| Icon | Category | Purpose |
|------|----------|---------|
| ↓ | Get Data | Retrieve events from indexes and data sources |
| ⧩ | Filter | Narrow results using search criteria |
| ⟳ | Transform | Reshape, rename, and manipulate fields |
| Σ | Aggregate | Count, sum, average, and statistical operations |
| ⊕ | Combine | Join, append, and correlate multiple datasets |
| ▤ | Output | Format results for tables, charts, and exports |

**Three depth levels per entry:**

- **Essential**: What it does and basic syntax
- **Practical**: Common use cases, gotchas, and working examples
- **Deep Dive**: Performance considerations, edge cases, and advanced patterns

Also covers eval functions, stats functions, CIM fields, and common antipatterns.

### Guides

Investigation playbooks that teach SPL through security use cases.

**Eight categories:**
- Search Basics
- Counting & Summarizing
- Filtering & Refining
- Visualizing Data
- Security & Investigation
- Data Sources
- Enriching Data
- Dashboards

Each guide provides context (what security question you're answering), working SPL patterns, interpretation guidance, and next steps for pivoting.

### Training Center

Structured learning paths organized by skill level and security domain.

**Five skill levels:**

| Level | Focus |
|-------|-------|
| Foundations | Basic syntax and search concepts |
| Core Skills | Essential commands every analyst needs |
| Intermediate | Combining techniques for real investigations |
| Advanced | Complex queries and performance optimization |
| Expert | Building production-ready searches and dashboards |

**Three learning types:**
- **Tutorials**: Step-by-step concept walkthroughs
- **Scenarios**: Realistic investigation situations
- **Challenges**: Problems that test mastery

**Five security domains:**
- Authentication
- Network
- Endpoint
- Incident Response
- Basics

### Prompt Builder

Visual query composition tool for learning SPL structure.

Combine reusable building blocks—data sources, filters, output shapes, time ranges—and see the SPL it generates. Useful for understanding how queries are constructed before writing them from scratch.

## Design Philosophy

### Progressive Disclosure

Content is layered. Start with essential syntax, explore practical usage when relevant, dive deep when you need the details. The three-tab structure (Essential / Practical / Deep Dive) lets you control how much information you're processing.

### Use-Case Driven

Reference materials are useful. But analysts learn faster when content is framed around real questions: "Show me failed authentication attempts" is more memorable than "The `stats` command aggregates data."

### Connected Knowledge

Glossary terms link to guides. Guides link to training scenarios. Training scenarios link back to the glossary. Everything cross-references so you can follow your curiosity without losing context.

## Requirements

- Python 3.11+
- Flask 3.0+
- A web browser

No Splunk installation required. SPLUNKed is an offline learning tool.

## Related Projects

- **[SIFTed](https://github.com/timgrady92/SIFTed)**: Guided interface for SANS SIFT forensic tools

## License

MIT
