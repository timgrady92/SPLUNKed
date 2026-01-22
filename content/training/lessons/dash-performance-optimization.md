---
{
  "id": "dash-performance-optimization",
  "type": "lesson",
  "title": "Dashboard Performance for Production",
  "description": "Optimize dashboard load times using base searches, efficient time ranges, tstats, and report acceleration for production SOC environments.",
  "category": "dashboards",
  "bucket": "Dashboard Development",
  "keywords": ["performance", "base search", "tstats", "acceleration", "optimization"],
  "tags": ["dashboards", "performance", "advanced", "optimization"],
  "difficulty": "intermediate",
  "duration": "20 min",
  "objectives": [
    "Implement base search patterns to reduce redundant queries",
    "Select appropriate time ranges for dashboard panels",
    "Apply tstats for high-performance aggregate queries",
    "Configure report acceleration for complex dashboards"
  ],
  "sortOrder": 100
}
---

## Goal

Make your dashboards load in under 10 seconds so analysts use them during real incidents instead of abandoning them for ad-hoc searches. A slow dashboard is a dashboard nobody trusts.

## Why Dashboard Performance Matters

Every second of load time costs analyst attention:
- **< 3 seconds**: Dashboard feels instant, builds trust
- **3-10 seconds**: Acceptable for shift-start views
- **10-30 seconds**: Analysts switch to ad-hoc searches
- **> 30 seconds**: Dashboard becomes "that thing we don't use"

## The Base Search Pattern

When multiple panels query similar data, use a base search to query once and post-process:

### Without Base Search (Inefficient)

Panel 1:
```spl
index=security sourcetype=auth action=failure earliest=-24h
| stats count by src_ip
```

Panel 2:
```spl
index=security sourcetype=auth action=failure earliest=-24h
| stats count by user
```

Panel 3:
```spl
index=security sourcetype=auth action=failure earliest=-24h
| timechart span=1h count
```

This queries the same data three times.

### With Base Search (Efficient)

Base search (hidden panel):
```spl
index=security sourcetype=auth action=failure earliest=-24h
| fields _time, src_ip, user, dest
```

Panel 1:
```spl
| stats count by src_ip
```

Panel 2:
```spl
| stats count by user
```

Panel 3:
```spl
| timechart span=1h count
```

The base search runs once; each panel filters the cached results.

### Base Search Best Practices

1. **Include all fields** panels will need
2. **Keep transforming commands out** of the base search
3. **Name base searches clearly** for maintainability
4. **Don't over-fetch**: Only pull necessary fields with `fields` command

```spl
index=security sourcetype=auth action=failure earliest=-24h
| fields _time, src_ip, dest_ip, user, action, status, app
```

## Efficient Time Range Selection

Time range has the biggest impact on query performance:

| Use Case | Recommended Range |
|----------|------------------|
| Real-time monitoring | Last 15-60 minutes |
| Shift dashboard | Last 8-24 hours |
| Weekly trends | Last 7 days |
| Monthly reports | Last 30 days (use acceleration) |

### Avoid Open-Ended Searches

**Bad**: `earliest=0` (searches all time)
**Good**: `earliest=-24h` (explicit boundary)

### Use Snap-To for Consistency

```spl
earliest=-7d@d latest=@d
```

This snaps to midnight boundaries, making results consistent and cacheable.

## Using tstats for Speed

`tstats` queries accelerated data models, returning results 10-100x faster than raw searches:

### Standard Search (Slow)

```spl
index=security sourcetype=auth
| stats count by action, user
```

### tstats Equivalent (Fast)

```spl
| tstats count from datamodel=Authentication where nodename=Authentication
    by Authentication.action, Authentication.user
| rename Authentication.* as *
```

### When to Use tstats

- Data model exists and is accelerated
- Query needs aggregates (count, sum, avg)
- Dashboard shows summary data, not raw events

### tstats Limitations

- Only works with accelerated data models
- Cannot use arbitrary field extractions
- Results limited to data model fields

## Report Acceleration

For complex queries that can't use tstats, enable report acceleration:

### Enabling Acceleration

In savedsearches.conf or via the UI:
```
[My Complex Dashboard Search]
search = index=security | complex transformation | stats ...
auto_summarize = 1
auto_summarize.dispatch.earliest_time = -7d@d
auto_summarize.dispatch.latest_time = @d
```

### Good Candidates for Acceleration

- Queries running on schedules (every 15 minutes or more)
- Complex aggregations over large time ranges
- Searches used by multiple dashboard panels

### Poor Candidates

- Searches with tokens that change frequently
- Real-time searches
- Searches with earliest/latest in the last hour

## Performance Optimization Checklist

### Before Building

- [ ] Identify the minimum time range needed
- [ ] Check if relevant data models exist
- [ ] Plan base search strategy for related panels

### During Development

- [ ] Use `fields` to limit data transfer
- [ ] Place filtering commands early in the pipeline
- [ ] Use `stats` instead of `transaction` when possible
- [ ] Limit table results with `head` command

### Query Optimization Examples

**Inefficient**:
```spl
index=security
| eval is_failure = if(action="failure", 1, 0)
| stats sum(is_failure) as failures
```

**Efficient**:
```spl
index=security action=failure
| stats count as failures
```

**Inefficient**:
```spl
index=security
| stats count by src_ip, dest_ip, user, action, status
| search action=failure
```

**Efficient**:
```spl
index=security action=failure
| stats count by src_ip, dest_ip, user, status
```

## Monitoring Dashboard Performance

Track your own dashboard health:

```spl
index=_audit action=search info=completed
    savedsearch_name="My Dashboard - *"
| stats avg(total_run_time) as avg_time,
        max(total_run_time) as max_time,
        count as executions
    by savedsearch_name
| sort - avg_time
```

Set alerts when panel average exceeds thresholds.

## Variations

### Post-Process Searches

For truly real-time dashboards, use post-process searches:

Base (runs every refresh):
```spl
index=security sourcetype=auth action=failure earliest=-1h
| stats count by _time, src_ip, user
```

Post-process (filters base results):
```spl
| stats sum(count) as total_failures
```

### Scheduled Searches with Summary Index

For historical trends, write summaries to a dedicated index:

```spl
index=security sourcetype=auth
| stats count by action, src_ip
| collect index=summary source="auth_daily_summary"
```

Then query the summary index in dashboards for instant results.

## Pitfalls

- **Premature optimization**: Build correct dashboards first, then optimize
- **Over-caching**: Stale data can mislead investigations
- **Ignoring search concurrency**: Too many panels = search queue backup
- **Silent failures**: Accelerated reports can fail silently; monitor acceleration status

## Next Steps

- Apply these techniques in "Build a Complete SOC Operations Dashboard"
- Learn tstats deeply in the Enterprise Security track
- Monitor your search performance in "Search Optimization and Performance" pipeline
