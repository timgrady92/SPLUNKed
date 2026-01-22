---
{
  "id": "onb-data-validation",
  "type": "lesson",
  "title": "Data Quality Validation",
  "description": "Learn systematic approaches to verify data completeness, accuracy, and consistency after onboarding new sources.",
  "category": "data-onboarding",
  "difficulty": "intermediate",
  "duration": "15 min",
  "tags": ["data-onboarding", "validation", "data-quality", "completeness", "accuracy"],
  "keywords": ["data quality", "validation", "completeness check", "field coverage", "timestamp accuracy"],
  "objectives": [
    "Verify data completeness against source systems",
    "Validate timestamp accuracy and consistency",
    "Check field extraction coverage and quality",
    "Establish ongoing data quality monitoring"
  ],
  "bucket": "Data Onboarding",
  "sortOrder": 305
}
---

## Goal

After configuring data inputs and parsing, you need to verify the data is complete, accurate, and properly structured. This validation ensures your data supports reliable searching and alerting.

## The Four Pillars of Data Quality

Data validation covers four key areas:

1. **Completeness** - Is all expected data arriving?
2. **Timeliness** - Are events indexed with minimal delay?
3. **Accuracy** - Are timestamps and fields correct?
4. **Consistency** - Does data follow expected patterns?

## Completeness Validation

### Event Count Comparison

Compare Splunk event counts to source system metrics:

```spl
index=firewall sourcetype=firewall:custom earliest=-24h@h latest=@h
| stats count as splunk_count
| eval expected_count = 1000000
| eval variance_pct = round(abs(splunk_count - expected_count) / expected_count * 100, 2)
| eval status = if(variance_pct < 5, "OK", "INVESTIGATE")
```

If your source system reports 1 million events daily, Splunk should show similar numbers (within 5% is typically acceptable).

### Check for Gaps

Identify time periods with no data:

```spl
index=firewall sourcetype=firewall:custom earliest=-24h
| timechart span=1h count
| where count = 0
| table _time, count
```

Any time buckets with zero events indicate potential collection gaps.

### Source Coverage

Verify all expected sources are reporting:

```spl
index=firewall sourcetype=firewall:custom earliest=-1h
| stats count, latest(_time) as last_seen by host
| eval minutes_ago = round((now() - last_seen) / 60, 0)
| where minutes_ago > 30
| table host, count, minutes_ago
```

Hosts with no recent data may have connectivity or forwarder issues.

## Timeliness Validation

### Indexing Delay

Measure the gap between event time and index time:

```spl
index=your_index sourcetype=your_sourcetype earliest=-1h
| eval delay_seconds = _indextime - _time
| stats avg(delay_seconds) as avg_delay,
        max(delay_seconds) as max_delay,
        perc95(delay_seconds) as p95_delay
| eval avg_delay = round(avg_delay, 2)
```

Normal delay is seconds to a few minutes. Large delays (>10 minutes) indicate:
- Network latency to forwarders
- Queue buildup on indexers
- Timestamp extraction using current time instead of event time

### Future-Dated Events

Events with timestamps in the future are always problematic:

```spl
index=your_index sourcetype=your_sourcetype earliest=-1h
| where _time > now()
| stats count by host, sourcetype
```

Future timestamps usually mean timezone configuration issues.

## Accuracy Validation

### Timestamp Consistency

Check that extracted timestamps match patterns in _raw:

```spl
index=your_index sourcetype=your_sourcetype earliest=-1h
| head 100
| eval extracted_time = strftime(_time, "%Y-%m-%d %H:%M:%S")
| rex field=_raw "(?<raw_timestamp>\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})"
| where extracted_time != raw_timestamp
| table _time, extracted_time, raw_timestamp, _raw
```

Mismatches indicate TIME_FORMAT configuration issues.

### Field Extraction Coverage

Measure how often fields are successfully extracted:

```spl
index=your_index sourcetype=your_sourcetype earliest=-1h
| eventstats count as total_events
| stats count as events_with_field,
        max(total_events) as total by sourcetype
| foreach src_ip dest_ip action [
    eval <<FIELD>>_coverage = round(events_with_field / total * 100, 1)
]
```

Critical fields should have >95% coverage. Lower percentages indicate:
- Extraction regex doesn't match all variations
- Some events have different formats
- Log format changed

### Field Value Distribution

Check that field values are reasonable:

```spl
index=your_index sourcetype=your_sourcetype earliest=-1h
| top 20 action
```

Unexpected values (like "ALLOW123" instead of "allowed") indicate incomplete normalization.

## Consistency Validation

### Volume Trending

Compare current volume to historical patterns:

```spl
index=your_index sourcetype=your_sourcetype earliest=-7d
| timechart span=1d count
| streamstats avg(count) as avg_daily window=7
| eval variance_pct = round((count - avg_daily) / avg_daily * 100, 1)
| table _time, count, avg_daily, variance_pct
```

Sudden volume changes (>50% variance) warrant investigation.

### Field Cardinality

Monitor for unexpected changes in unique values:

```spl
index=your_index sourcetype=your_sourcetype earliest=-1d
| stats dc(user) as unique_users,
        dc(src_ip) as unique_sources,
        dc(dest_ip) as unique_destinations
```

Sudden spikes might indicate:
- New systems coming online
- Scanning activity
- Extraction issues creating garbage values

## Building a Validation Dashboard

Create a dashboard that runs these checks automatically:

### Key Panels

1. **Event Volume Trend** - Timechart of events over 7 days
2. **Source Host Status** - Table of hosts with last seen time
3. **Indexing Delay** - Single value showing p95 delay
4. **Field Coverage** - Table showing extraction percentages for key fields
5. **Data Quality Score** - Composite metric combining all checks

### Alert Thresholds

Set up alerts for data quality issues:

| Check | Warning | Critical |
|-------|---------|----------|
| Event count variance | >10% | >25% |
| Indexing delay (p95) | >5 min | >15 min |
| Field coverage | <95% | <90% |
| Host silent time | >30 min | >60 min |

## Common Pitfalls

**Pitfall 1: Checking too soon**
Allow sufficient time for data to flow through the pipeline before validating. Check at least 1 hour of data, preferably 24 hours.

**Pitfall 2: Ignoring timezone issues**
Timestamp validation that compares across timezones will show false mismatches. Ensure consistent timezone handling.

**Pitfall 3: Using defaults for comparison**
"Expected count = 1000000" should come from actual source system metrics, not estimates.

**Pitfall 4: One-time validation only**
Data quality changes over time. Implement ongoing monitoring, not just initial validation.

## Validation Checklist

Before declaring a data source "production ready":

- [ ] Event counts match source system reports (±5%)
- [ ] No time gaps in last 24 hours
- [ ] All expected hosts reporting
- [ ] Indexing delay <5 minutes (p95)
- [ ] No future-dated events
- [ ] Critical fields >95% coverage
- [ ] Field values match expected distributions
- [ ] CIM normalization verified (if applicable)
- [ ] Validation dashboard created
- [ ] Data quality alerts configured

## Next Steps

With validated data, you can:
1. Enable data model acceleration
2. Create operational dashboards
3. Build detection rules
4. Document the data source for other analysts
