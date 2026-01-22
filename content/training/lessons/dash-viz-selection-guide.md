---
{
  "id": "dash-viz-selection-guide",
  "type": "lesson",
  "title": "Visualization Selection for Security Data",
  "description": "Learn to choose the right visualization type for different security data patterns and avoid common dashboard design mistakes.",
  "category": "dashboards",
  "bucket": "Dashboard Development",
  "keywords": ["visualization", "timechart", "chart", "stats", "table", "dashboard"],
  "tags": ["dashboards", "visualization", "intermediate"],
  "difficulty": "intermediate",
  "duration": "15 min",
  "objectives": [
    "Apply a decision framework for selecting visualization types",
    "Match security data patterns to appropriate chart types",
    "Avoid common visualization anti-patterns in security dashboards"
  ],
  "sortOrder": 20
}
---

## Goal

Select the right visualization type for your security data so analysts can interpret results quickly and accurately. The wrong chart type can hide critical patterns or mislead investigation.

## The Visualization Decision Framework

When building a security dashboard panel, ask these questions in order:

### 1. What question are you answering?

| Question Type | Best Visualization |
|--------------|-------------------|
| "How many?" (single metric) | Single value |
| "How is it changing over time?" | Timechart (line/area) |
| "What are the top contributors?" | Bar chart or table |
| "How is it distributed?" | Bar chart or histogram |
| "What's the breakdown?" | Stacked bar or table |
| "Where is it happening?" | Choropleth map |
| "What are the details?" | Table |

### 2. How many data series do you have?

- **Single series**: Line chart, bar chart, or single value
- **2-5 series**: Multi-line timechart or grouped bar chart
- **6+ series**: Table, or aggregate into "Other"

### 3. What action should the analyst take?

- **Monitor for anomalies**: Timechart with baseline overlay
- **Triage a queue**: Table with sortable columns
- **Investigate specifics**: Table with drilldown
- **Report to management**: Single values with sparklines

## Security Data Patterns and Their Visualizations

### Trends Over Time

Use `timechart` for any metric that changes over time:

```spl
index=security sourcetype=auth action=failure
| timechart span=1h count by src_ip limit=5
```

**When to use**: Authentication failures, event volumes, alert counts, connection patterns.

**Span selection**: Match your monitoring cadence. 1-hour spans for shift dashboards, 1-day spans for weekly reviews.

### Categorical Comparisons

Use `chart` or `stats` with bar visualization for comparing categories:

```spl
index=security sourcetype=auth action=failure
| stats count by src_ip
| sort - count
| head 10
```

**When to use**: Top talkers, error code distribution, user activity comparison.

**Orientation**: Horizontal bars work better for long category names (usernames, hostnames).

### Distributions

Use bar charts or histograms to show how values spread:

```spl
index=network
| stats count by bytes_out
| bin bytes_out span=1000
| stats sum(count) as events by bytes_out
```

**When to use**: Byte transfer sizes, session durations, response times.

### Detailed Investigation Data

Use tables when analysts need to see individual records or multiple fields:

```spl
index=security sourcetype=auth action=failure
| table _time, user, src_ip, dest, app, reason
| sort - _time
```

**When to use**: Alert triage queues, investigation details, audit logs.

**Field ordering**: Put the most important triage field first (usually timestamp or severity).

## Common Anti-Patterns to Avoid

### Pie Charts for Security Data

Pie charts fail in security contexts because:
- Hard to compare similar-sized slices
- Can't show change over time
- Useless with more than 5 categories
- Analysts can't quickly spot the outlier

**Instead**: Use horizontal bar charts or tables with percentages.

### Over-Aggregation

Aggregating too much hides the signal:

```spl
| timechart span=1d count
```

Daily aggregation might hide a 2-hour attack. Match your span to your detection requirements.

### Rainbow Charts

Using too many colors makes patterns impossible to see:

```spl
| timechart count by src_ip limit=20
```

**Instead**: Limit to 5 series maximum, use "Other" for the rest, or switch to a table.

### Missing Context

A single value without context is meaningless. Always add:
- Trend indicator (up/down from previous period)
- Sparkline showing recent history
- Threshold coloring (red/yellow/green)

## Variations

### When Tables Beat Charts

Use tables when:
- Analysts need exact values, not patterns
- Data has many dimensions (5+ fields)
- Records need individual action (click to investigate)
- Precision matters more than trends

### When Single Values Shine

Use single values for:
- KPIs that need instant recognition (queue depth, MTTR)
- Status indicators (systems up/down)
- Metrics with known thresholds (SLA compliance)

## Pitfalls

- **Don't use 3D charts** - They distort perception and add no value
- **Don't rely on color alone** - Consider colorblind analysts; add icons or labels
- **Don't mix units** - A chart showing both "count" and "bytes" confuses interpretation
- **Don't truncate axes** - Starting a y-axis at non-zero exaggerates small changes

## Next Steps

- Apply these principles in the "Building Your First SOC Monitoring Dashboard" scenario
- Learn to build effective timecharts in "Timechart Mastery for Security Monitoring"
- Master table design in "Building Investigation-Ready Tables"
