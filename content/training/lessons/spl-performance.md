---
{
  "id": "spl-performance",
  "type": "lesson",
  "title": "Query Performance Optimization",
  "description": "Write faster searches by understanding command ordering, field selection, streaming vs transforming commands, bloom filters, and Job Inspector interpretation.",
  "category": "spl-fundamentals",
  "bucket": "SPL Mastery",
  "keywords": ["performance", "optimization", "fields", "tstats", "bloom", "job inspector"],
  "tags": ["spl", "performance", "intermediate"],
  "difficulty": "intermediate",
  "duration": "20 min",
  "objectives": [
    "Structure searches for optimal performance",
    "Use field selection to reduce data transfer",
    "Understand streaming vs transforming commands",
    "Interpret Job Inspector metrics for optimization"
  ],
  "sortOrder": 110
}
---

## Goal

Write searches that return results faster and consume fewer resources. Understanding Splunk's search pipeline helps you structure queries for maximum efficiency.

## The Search Pipeline

Every SPL search flows through phases:

1. **Index Selection** - Which buckets contain matching data?
2. **Event Retrieval** - Read raw events from disk
3. **Field Extraction** - Parse fields from raw data
4. **Command Processing** - Apply your SPL commands
5. **Result Delivery** - Send results to client

Optimization targets each phase.

## Rule 1: Filter Early, Filter Aggressively

The most important optimization: reduce data volume as early as possible.

### Bad - Late Filtering

```spl
index=security sourcetype=auth
| eval is_failure = if(action="failure", 1, 0)
| where is_failure=1
| stats count by user
```

This extracts all events, creates a field, then filters.

### Good - Early Filtering

```spl
index=security sourcetype=auth action=failure
| stats count by user
```

This filters at index time, reading only matching events.

### The Impact

| Approach | Events Read | Time |
|----------|------------|------|
| Late filtering | 10,000,000 | 45s |
| Early filtering | 500,000 | 3s |

## Rule 2: Be Specific with Time

Explicit time ranges enable bucket-level filtering:

### Bad - Implicit Time

```spl
index=security action=failure
```

Uses UI time picker, which may default to All Time.

### Good - Explicit Time

```spl
index=security action=failure earliest=-24h latest=now
```

### Better - Specific Time

```spl
index=security action=failure earliest=-4h@h latest=@h
```

The `@h` snaps to hour boundaries, improving cache utilization.

## Rule 3: Use the Fields Command

Limit which fields are extracted and transferred:

### Bad - All Fields

```spl
index=security sourcetype=auth action=failure
| stats count by user, src_ip
```

Extracts all fields, transfers all fields to search head.

### Good - Selected Fields

```spl
index=security sourcetype=auth action=failure
| fields user, src_ip
| stats count by user, src_ip
```

Only extracts and transfers needed fields.

### Performance Gain

For events with 50 fields, selecting 2 fields can reduce data transfer by 90%.

## Rule 4: Understand Command Types

Commands fall into categories with different performance characteristics:

### Streaming Commands (Fast)

Process events one-at-a-time, can run on indexers:
- `eval`, `where`, `fields`, `rename`, `rex`, `search`

### Transforming Commands (Slower)

Need all events before producing results:
- `stats`, `timechart`, `chart`, `top`, `rare`, `dedup`

### Distributable vs Centralized

**Distributable** commands run on indexers (parallel):
```spl
| stats count by user
```

**Centralized** commands run only on search head (serial):
```spl
| sort - count
| head 10
```

### Optimal Structure

```
[Index-time filters]
| [Streaming commands - run on indexers]
| [Transforming commands - can be distributed]
| [Centralized commands - run on search head]
```

## Rule 5: Leverage Bloom Filters

Splunk maintains bloom filters for indexed fields. Searches that can use them are dramatically faster.

### Bloom-Eligible (Fast)

```spl
index=security user=admin
index=security status=404
```

Exact matches on indexed fields skip buckets without matches.

### Not Bloom-Eligible (Slower)

```spl
index=security user=*admin*
index=security status>400
```

Wildcards and comparisons require scanning.

### Making Fields Indexed

Default indexed fields: `host`, `source`, `sourcetype`, `index`

Other fields use search-time extraction (slower).

## Rule 6: Use tstats for Indexed Data

When working with data models or indexed fields, `tstats` is dramatically faster:

### Standard Search (Slower)

```spl
index=security sourcetype=auth action=failure earliest=-24h
| stats count by user
```

Reads raw events, extracts fields.

### tstats (Faster)

```spl
| tstats count where index=security sourcetype=auth action=failure earliest=-24h by user
```

Reads only metadata and accelerated fields.

### When tstats Applies

- Counting/aggregating indexed fields
- Working with accelerated data models
- Simple aggregations without complex eval

## Reading Job Inspector

Job Inspector reveals where time is spent:

### Key Metrics

| Metric | Meaning |
|--------|---------|
| `command.search.index` | Time reading from indexes |
| `command.search.kv` | Time extracting fields |
| `command.search.filter` | Time applying filters |
| `command.stats.*` | Time in stats command |

### Diagnosing Problems

**High index time**: Too much data; add time/index filters

**High kv time**: Too many fields; use `fields` command

**High filter time**: Filtering after extraction; move to base search

**High stats time**: Complex aggregation; consider pre-aggregation

### Accessing Job Inspector

1. Run your search
2. Click "Job" menu
3. Select "Inspect Job"
4. Review execution costs

## Common Optimization Patterns

### Pattern 1: Replace table with fields + table

Bad:
```spl
| table user, src_ip, action
```

Good:
```spl
| fields user, src_ip, action
| table user, src_ip, action
```

The `fields` command reduces data early.

### Pattern 2: Replace dedup with stats

Bad:
```spl
| dedup user src_ip
```

Good (if only need counts):
```spl
| stats count by user, src_ip
```

`dedup` must track all unique combinations; `stats` is more efficient.

### Pattern 3: Use prefix searches

Bad:
```spl
index=security sourcetype=*auth*
```

Good:
```spl
index=security sourcetype=winevent* OR sourcetype=linux_secure
```

Wildcards at the start prevent bloom filter use.

### Pattern 4: Avoid subsearch when possible

Subsearches have limits and add overhead:
```spl
index=security user IN [search index=threats | fields user]
```

Consider lookups or stats alternatives:
```spl
index=threats | stats values(user) as users
| map search="index=security user IN ($users$)"
```

Or use a lookup table.

## The Dense vs Sparse Trade-off

### Dense Searches (Good Performance)

Fields exist in most events:
```spl
index=security action=failure
| stats count by user
```

### Sparse Searches (Poor Performance)

Fields exist in few events:
```spl
index=_internal
| where isnotnull(custom_rare_field)
| stats count by custom_rare_field
```

Splunk must scan many events to find few matches.

### Improving Sparse Searches

Add more restrictive filters:
```spl
index=_internal sourcetype=specific_type component=relevant
| where isnotnull(custom_rare_field)
```

## Variations

### When Performance Doesn't Matter

For ad-hoc investigation, optimize for clarity over speed. A 30-second search that's easy to understand beats a 5-second search that's incomprehensible.

### Scheduled Search Optimization

Scheduled searches run repeatedly. Invest time optimizing:
- Use explicit time ranges
- Consider summary indexing for long-term trends
- Enable report acceleration if appropriate

## Pitfalls

- **Don't over-optimize** - Readability matters; a 2-second search doesn't need optimization
- **Don't guess at bottlenecks** - Use Job Inspector to identify actual problems
- **Don't forget time ranges** - Unbounded searches scan everything
- **Don't ignore field extraction** - It's often the slowest part
- **Don't use `rename` before `fields`** - The original field name is still extracted

## Next Steps

- Apply optimization in "SPL Mastery Challenge"
- Learn accelerated search patterns in Enterprise Security content
- Use Job Inspector to analyze your own slow searches
