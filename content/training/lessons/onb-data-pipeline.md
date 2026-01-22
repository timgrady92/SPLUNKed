---
{
  "id": "onb-data-pipeline",
  "type": "lesson",
  "title": "Understanding the Splunk Data Pipeline",
  "description": "Learn how data flows through Splunk from input to searchable events, and understand where configuration happens at each stage.",
  "category": "data-onboarding",
  "difficulty": "intermediate",
  "duration": "12 min",
  "tags": ["data-onboarding", "architecture", "pipeline", "inputs", "parsing", "indexing"],
  "keywords": ["data pipeline", "input phase", "parsing phase", "indexing phase", "props.conf", "inputs.conf"],
  "objectives": [
    "Understand the three phases of data ingestion",
    "Know which configuration files affect each phase",
    "Identify where parsing decisions are made",
    "Distinguish between index-time and search-time processing"
  ],
  "bucket": "Data Onboarding",
  "sortOrder": 300
}
---

## Goal

Before configuring any data input, you need to understand how data flows through Splunk. This knowledge helps you troubleshoot issues and make informed decisions about where to apply configurations.

## The Three Phases

Data entering Splunk passes through three distinct phases, each with its own configuration options and processing behavior.

### Phase 1: Input

The input phase handles getting data into Splunk. This is where you define what data to collect and how to collect it.

**What happens:**
- Data sources are monitored or received
- Raw data streams enter the pipeline
- Source, sourcetype, and host metadata are assigned
- Data is forwarded to indexers (in distributed environments)

**Key configuration:** `inputs.conf`

```spl
| Common input types you'll configure:
| - monitor:// for files and directories
| - tcp:// and udp:// for network streams
| - http:// for HTTP Event Collector
| - script:// for scripted inputs
```

**Critical decision:** The sourcetype you assign here determines how Splunk parses the data in the next phase.

### Phase 2: Parsing

The parsing phase transforms raw data streams into individual events with extracted timestamps.

**What happens:**
- Line breaking: Raw streams are split into individual events
- Timestamp extraction: Event time is identified and normalized
- Character encoding: Data is converted to UTF-8
- Line merging: Multi-line events are reassembled

**Key configuration:** `props.conf`

```spl
| Parsing settings in props.conf:
| LINE_BREAKER - regex defining event boundaries
| SHOULD_LINEMERGE - whether to combine lines
| TIME_PREFIX - text before the timestamp
| TIME_FORMAT - strptime format for parsing time
| MAX_TIMESTAMP_LOOKAHEAD - how far to search for time
```

**Critical decision:** Incorrect parsing creates events with wrong boundaries or timestamps, making data nearly unusable.

### Phase 3: Indexing

The indexing phase stores parsed events and builds search indexes.

**What happens:**
- Events are written to index buckets
- TSIDX (time-series index) files are created
- Bloom filters are generated for fast searching
- Optional index-time field extractions occur

**Key configuration:** `indexes.conf`, `props.conf` (TRANSFORMS)

```spl
| Index-time extractions (use sparingly):
| TRANSFORMS-<class> in props.conf
| Corresponding stanza in transforms.conf
| WRITE_META = true for indexed fields
```

**Critical decision:** Index-time extractions cannot be changed retroactively. Prefer search-time extractions unless you have a specific performance requirement.

## Where Processing Happens

In a distributed Splunk environment, understanding where each phase executes helps you place configurations correctly.

| Phase | Component | Configuration Location |
|-------|-----------|----------------------|
| Input | Forwarder or Indexer | inputs.conf on data collection tier |
| Parsing | Indexer (usually) | props.conf on indexers |
| Indexing | Indexer | indexes.conf, props.conf on indexers |
| Search-time | Search Head | props.conf, transforms.conf on search heads |

**Heavy Forwarder Exception:** If using a heavy forwarder, parsing can occur there instead of on indexers. This is configured with `TRANSFORMS` in props.conf on the forwarder.

## Index-Time vs Search-Time

This distinction is fundamental to Splunk configuration.

**Index-time processing:**
- Happens once when data is ingested
- Cannot be changed without re-indexing
- Affects storage size and indexing performance
- Use for: event breaking, timestamps, critical indexed fields

**Search-time processing:**
- Happens every time you search
- Can be modified anytime by updating configurations
- Affects search performance (not storage)
- Use for: field extractions, aliases, calculated fields, lookups

**Best Practice:** Default to search-time processing. Only use index-time when you have a documented performance requirement that search-time cannot meet.

## Common Pitfalls

**Pitfall 1: Wrong sourcetype assignment**
If you assign the wrong sourcetype, Splunk applies incorrect parsing rules. Always verify sourcetype before troubleshooting parsing issues.

**Pitfall 2: Parsing on wrong component**
Configurations must exist on the component doing the processing. props.conf on a search head won't fix parsing issues that happen on indexers.

**Pitfall 3: Over-using index-time extractions**
Index-time extractions increase storage requirements and cannot be retroactively fixed. Reserve them for fields you'll filter on in every search.

**Pitfall 4: Ignoring the data preview**
Always use Settings > Data Inputs > Preview to verify parsing before enabling a production input.

## Verification Queries

Check how data was parsed:

```spl
index=your_index sourcetype=your_sourcetype
| head 10
| table _time, _raw, source, sourcetype, host
```

Check for timestamp parsing issues:

```spl
index=your_index sourcetype=your_sourcetype
| where _indextime - _time > 300 OR _time - _indextime > 300
| stats count by sourcetype
```

Events where `_time` differs significantly from `_indextime` may have timestamp extraction problems.

## Next Steps

With this foundation, you're ready to:
1. Configure specific input types in `inputs.conf`
2. Set up event breaking and timestamp extraction in `props.conf`
3. Create field extractions for your data
