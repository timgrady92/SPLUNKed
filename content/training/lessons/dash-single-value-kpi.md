---
{
  "id": "dash-single-value-kpi",
  "type": "lesson",
  "title": "Building Effective SOC KPIs",
  "description": "Create single-value panels that communicate SOC operational health at a glance with trend indicators, thresholds, and sparklines.",
  "category": "dashboards",
  "bucket": "Dashboard Development",
  "keywords": ["kpi", "single value", "sparkline", "rangemap", "metrics", "dashboard"],
  "tags": ["dashboards", "kpi", "metrics", "intermediate"],
  "difficulty": "intermediate",
  "duration": "15 min",
  "objectives": [
    "Build single-value KPI panels with meaningful context",
    "Add sparklines to show recent trends",
    "Implement threshold-based coloring with rangemap",
    "Create comparison metrics showing change over time"
  ],
  "sortOrder": 40
}
---

## Goal

Build single-value dashboard panels that let SOC managers and analysts assess operational health in under three seconds. A good KPI tells you what's happening now, how it compares to normal, and whether action is needed.

## Essential SOC Metrics

Before building panels, identify what matters:

| Metric | What It Measures | Why It Matters |
|--------|-----------------|----------------|
| Alert Queue Depth | Unacknowledged alerts | Staffing adequacy |
| MTTD (Mean Time to Detect) | Time from event to alert | Detection effectiveness |
| MTTR (Mean Time to Respond) | Time from alert to closure | Response efficiency |
| False Positive Rate | Alerts closed as FP / total | Detection quality |
| Escalation Rate | Alerts escalated / total | Tier distribution |

## Basic KPI: Alert Queue Depth

Start with a simple count:

```spl
index=alerts status=open
| stats count as queue_depth
```

This works but lacks context. Is 47 alerts good or bad?

## Adding Threshold Coloring

Use `rangemap` to add color-coded status:

```spl
index=alerts status=open
| stats count as queue_depth
| eval status=case(
    queue_depth < 20, "low",
    queue_depth < 50, "elevated",
    queue_depth < 100, "high",
    true(), "critical")
| rangemap field=queue_depth low=0-19 elevated=20-49 high=50-99 severe=100-10000
```

Configure the single value visualization to use the `range` field for coloring.

**Threshold guidelines**:
- Base thresholds on historical data, not gut feelings
- Adjust for time of day and staffing levels
- Review and tune quarterly

## Adding Sparklines for Trend Context

A sparkline shows the recent trend without taking up panel space:

```spl
index=alerts status=open
| timechart span=1h count as hourly_count
| stats sparkline(hourly_count) as trend, latest(hourly_count) as current_queue
```

The sparkline shows whether the queue is growing, shrinking, or stable.

**Sparkline best practices**:
- Use 24-48 hours of history for operational dashboards
- Match span to your monitoring granularity
- Consider using `sparkline(avg(count))` for smoother trends

## Comparison Metrics: Change Over Time

Show improvement or degradation compared to a baseline:

```spl
index=alerts status=closed
| eval response_time = closure_time - detection_time
| stats avg(response_time) as mttr_current by _time span=1d
| appendcols [
    search index=alerts status=closed earliest=-8d@d latest=-7d@d
    | eval response_time = closure_time - detection_time
    | stats avg(response_time) as mttr_previous
]
| eval change = round(((mttr_current - mttr_previous) / mttr_previous) * 100, 1)
| eval trend_indicator = if(change < 0, "improved", "degraded")
```

Display as: "MTTR: 4.2 hours (-12% vs last week)"

## Complete KPI Panel: Queue Health

Combine all elements for a comprehensive KPI:

```spl
index=alerts status=open
| stats count as current_queue
| appendcols [
    search index=alerts status=open
    | timechart span=1h count
    | stats sparkline as trend
]
| appendcols [
    search index=alerts status=open earliest=-1d@d latest=@d
    | stats count as yesterday_queue
]
| eval change = current_queue - yesterday_queue
| eval change_pct = round((change / yesterday_queue) * 100, 1)
| eval status = case(
    current_queue < 20, "low",
    current_queue < 50, "elevated",
    current_queue < 100, "high",
    true(), "critical")
| table current_queue, trend, change, change_pct, status
```

## Calculating MTTR

Mean Time to Respond requires tracking alert lifecycle:

```spl
index=alerts status=closed earliest=-24h
| eval response_time_sec = closure_time - creation_time
| eval response_time_hrs = round(response_time_sec / 3600, 2)
| stats avg(response_time_hrs) as mttr_hrs,
        median(response_time_hrs) as mttr_median,
        perc90(response_time_hrs) as mttr_p90
```

**Which metric to display**:
- **Average (mean)**: Useful for capacity planning but skewed by outliers
- **Median**: Better represents typical analyst experience
- **90th percentile**: Shows worst-case for SLA tracking

## Variations

### Percentage KPIs

For rates like false positive percentage:

```spl
index=alerts status=closed earliest=-7d
| stats count(eval(resolution="false_positive")) as fp_count, count as total
| eval fp_rate = round((fp_count / total) * 100, 1)
| eval status = case(fp_rate > 50, "critical", fp_rate > 30, "high", true(), "normal")
```

### Availability KPIs

For uptime and system health:

```spl
index=_internal sourcetype=splunkd component=Metrics
| timechart span=5m count as heartbeats
| stats count(eval(heartbeats > 0)) as up_intervals, count as total_intervals
| eval availability = round((up_intervals / total_intervals) * 100, 2)
```

### Coverage KPIs

For detection coverage metrics:

```spl
| inputlookup mitre_coverage.csv
| stats count(eval(has_detection="yes")) as covered, count as total
| eval coverage_pct = round((covered / total) * 100, 1)
```

## Pitfalls

- **Vanity metrics**: Don't display numbers that can't drive action
- **Missing thresholds**: A number without context is just noise
- **Stale data**: Always show when the metric was last updated
- **Over-precision**: "MTTR: 4.2367 hours" implies false precision; round appropriately
- **Ignoring seasonality**: Queue depth at 3 AM differs from 3 PM; compare like periods

## Next Steps

- Build complete dashboards in "Building Your First SOC Monitoring Dashboard"
- Add interactivity with "Tokens and Input Controls for Investigation"
- Connect KPIs to alerts in "Connecting Dashboards and Alerts"
