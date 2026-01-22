---
{
  "id": "fund-time-concepts",
  "type": "lesson",
  "title": "Time in Splunk",
  "description": "Master time ranges, the time picker, and time-based searching—the foundation of effective Splunk use.",
  "category": "fundamentals",
  "bucket": "Fundamentals",
  "keywords": ["time", "time-picker", "earliest", "latest", "relative-time"],
  "tags": ["fundamentals", "time", "time-picker", "beginner"],
  "difficulty": "beginner",
  "duration": "10 min",
  "objectives": [
    "Understand why time range selection is critical for searches",
    "Use the time picker effectively",
    "Write searches with explicit time modifiers",
    "Convert between relative and absolute time formats"
  ],
  "sortOrder": 3
}
---

## Why Time Matters

Every search in Splunk runs against a time range. This is fundamental because:

1. **Performance**: Searching 1 hour of data is much faster than searching 1 year
2. **Relevance**: You usually want recent events, not ancient history
3. **Context**: Investigations focus on specific time windows
4. **Cost**: Searching more data uses more resources

**The most common mistake new users make**: Running searches with "All Time" selected. This can take forever and often returns more data than you need.

## The Time Picker

The time picker (top-right of the search bar) controls what time range your search covers.

### Presets

Quick selections for common needs:

| Preset | Meaning |
|--------|---------|
| Last 15 minutes | Events from now back 15 minutes |
| Last 60 minutes | Events from now back 1 hour |
| Last 4 hours | Events from now back 4 hours |
| Last 24 hours | Events from now back 1 day |
| Last 7 days | Events from now back 1 week |
| Last 30 days | Events from now back 30 days |

These are **relative** times—they're calculated from the current moment, so they stay current if you re-run the search later.

### Relative Time

For custom ranges, use relative time syntax:

| Syntax | Meaning |
|--------|---------|
| `-1h` | 1 hour ago |
| `-30m` | 30 minutes ago |
| `-7d` | 7 days ago |
| `-1w` | 1 week ago |
| `-1mon` | 1 month ago |
| `@d` | Beginning of today (midnight) |
| `@h` | Beginning of current hour |
| `-1d@d` | Beginning of yesterday |

**Examples:**
- "Last 2 hours": Earliest = `-2h`, Latest = `now`
- "Yesterday only": Earliest = `-1d@d`, Latest = `@d`
- "Last 7 days, excluding today": Earliest = `-7d@d`, Latest = `@d`

### Absolute Time

For investigations, you often need exact time windows:

- **Date Range**: Pick specific start and end dates from a calendar
- **Date & Time Range**: Pick dates AND times (e.g., 2024-01-15 10:00 to 2024-01-15 14:00)
- **Between**: Specify exact timestamps

Use absolute time when:
- Investigating a specific incident
- Comparing the same time period across days
- Creating reproducible searches for reports

## Time Modifiers in SPL

You can specify time directly in your search, overriding the time picker:

```spl
index=firewall earliest=-1h latest=now
```

```spl
index=windows earliest="01/15/2024:10:00:00" latest="01/15/2024:14:00:00"
```

### Useful Time Modifiers

| Modifier | Example | Meaning |
|----------|---------|---------|
| `earliest` | `earliest=-24h` | Start of time range |
| `latest` | `latest=-1h` | End of time range |
| `_time` | `_time > relative_time(now(), "-1h")` | Filter by event timestamp |

### Snap-to Syntax

The `@` symbol "snaps" to a time boundary:

| Expression | Meaning |
|------------|---------|
| `-1h@h` | 1 hour ago, snapped to the start of that hour |
| `-1d@d` | 1 day ago, snapped to midnight |
| `@w0` | Beginning of this week (Sunday) |
| `@mon` | Beginning of this month |

**Example**: It's currently Wednesday 2:30 PM

- `-1d` = Tuesday 2:30 PM
- `-1d@d` = Tuesday 12:00 AM (midnight)
- `@d` = Wednesday 12:00 AM (start of today)

## The _time Field

Every event has a `_time` field containing its timestamp as a Unix epoch (seconds since 1970).

You can use `_time` in searches:

```spl
index=web
| where _time > relative_time(now(), "-1h")
```

Or format it for display:

```spl
index=web
| eval human_time = strftime(_time, "%Y-%m-%d %H:%M:%S")
```

### Common Time Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `now()` | Current time | `eval current = now()` |
| `relative_time(t, offset)` | Calculate relative time | `relative_time(now(), "-1d")` |
| `strftime(_time, format)` | Format timestamp | `strftime(_time, "%H:%M")` |
| `strptime(string, format)` | Parse string to time | `strptime(date, "%Y-%m-%d")` |

## Time Zones

Splunk stores all times in UTC internally but displays them in your configured time zone.

**Important considerations:**
- Logs from different sources may have different time zones embedded
- The time picker uses your browser's time zone
- When sharing searches, consider time zone differences

If a log's timestamps are in a different time zone, Splunk handles the conversion during indexing—you search in your local time.

## Best Practices

### Start Narrow, Expand If Needed

```
Start: Last 15 minutes
Not enough data? → Last 1 hour
Still need more? → Last 24 hours
```

This approach:
- Gets results faster
- Uses fewer resources
- Helps you refine your search before scaling up

### Be Specific for Investigations

When investigating an incident at a known time:

```spl
index=firewall src_ip=10.1.2.50 earliest="01/15/2024:10:20:00" latest="01/15/2024:10:40:00"
```

Don't search all of last week if you know the incident was at 10:30 AM on January 15th.

### Use Relative Time for Dashboards

Dashboard panels should use relative time so they stay current:

```spl
index=security alert_severity=critical earliest=-24h
| stats count by alert_name
```

This always shows the last 24 hours, no matter when you view the dashboard.

## Key Takeaways

- Every search runs against a time range—be intentional about selecting it
- Start with narrow time ranges and expand if needed
- Use relative time (`-1h`, `-7d`) for ongoing monitoring
- Use absolute time for incident investigations
- The `@` symbol snaps to time boundaries (`-1d@d` = start of yesterday)
- `earliest` and `latest` in SPL override the time picker
- All times are stored in UTC; display uses your time zone
