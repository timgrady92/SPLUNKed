---
{
  "id": "spl-eval-conditionals",
  "type": "lesson",
  "title": "Eval Functions: Conditionals and Math",
  "description": "Master conditional field creation, null handling patterns, data type conversion, and calculated fields using eval functions.",
  "category": "spl-fundamentals",
  "bucket": "SPL Mastery",
  "keywords": ["eval", "if", "case", "coalesce", "null", "isnull", "isnotnull", "math"],
  "tags": ["spl", "eval", "conditionals", "intermediate"],
  "difficulty": "intermediate",
  "duration": "15 min",
  "objectives": [
    "Create conditional fields using if() and case()",
    "Handle null values with coalesce and null functions",
    "Convert data types for reliable comparisons",
    "Build calculated fields with mathematical operators"
  ],
  "sortOrder": 70
}
---

## Goal

Transform raw fields into meaningful analysis fields. The `eval` command with conditional and mathematical functions lets you categorize data, handle missing values, and create calculated metrics.

## The if() Function

The simplest conditional - two outcomes based on one condition:

```spl
index=security sourcetype=auth
| eval auth_result = if(action="success", "Allowed", "Blocked")
```

Syntax: `if(condition, value_if_true, value_if_false)`

### Common if() Patterns

**Binary classification:**
```spl
| eval is_internal = if(cidrmatch("10.0.0.0/8", src_ip), 1, 0)
```

**Threshold flagging:**
```spl
| eval high_volume = if(bytes_out > 1000000, "Yes", "No")
```

**Field existence:**
```spl
| eval has_user = if(isnotnull(user), "Identified", "Anonymous")
```

## The case() Function

For multiple conditions, `case()` is cleaner than nested `if()`:

```spl
index=security sourcetype=auth
| eval severity = case(
    action="failure" AND user LIKE "admin%", "critical",
    action="failure", "high",
    action="success" AND app="vpn", "medium",
    true(), "low"
)
```

Conditions are evaluated in order. The first true condition wins. Always include `true()` as a catch-all default.

### Severity Classification Example

```spl
index=security
| eval risk_level = case(
    status >= 500, "critical",
    status >= 400, "warning",
    status >= 300, "info",
    status >= 200, "success",
    true(), "unknown"
)
```

### Time-Based Classification

```spl
index=security sourcetype=auth
| eval time_category = case(
    date_hour >= 0 AND date_hour < 6, "Night",
    date_hour >= 6 AND date_hour < 12, "Morning",
    date_hour >= 12 AND date_hour < 18, "Afternoon",
    true(), "Evening"
)
```

## Null Handling Functions

Nulls are one of the most common sources of unexpected results.

### isnull() and isnotnull()

Check if a field has a value:

```spl
| where isnotnull(user)
| eval user_status = if(isnull(user), "Unknown", user)
```

### coalesce() - The Null Killer

Returns the first non-null value:

```spl
| eval display_name = coalesce(user, src_user, "Anonymous")
```

This checks `user` first, then `src_user`, then falls back to "Anonymous".

**Common pattern - normalizing user fields:**
```spl
| eval normalized_user = coalesce(user, src_user, dest_user, Account_Name, "unknown")
```

### null() - Explicitly Setting Null

Remove or clear a field:

```spl
| eval user = if(user="-", null(), user)
```

This replaces "-" placeholder values with actual nulls.

### The validate() Function

Returns null if any condition is false:

```spl
| eval valid_auth = validate(isnotnull(user), isnotnull(src_ip), action IN("success", "failure"))
```

Useful for filtering records that meet all requirements.

## Data Type Conversion

### tonumber()

Convert strings to numbers:

```spl
| eval numeric_status = tonumber(status)
| where numeric_status >= 400
```

Handles invalid strings gracefully (returns null):

```spl
| eval port = tonumber(dest_port)
| where isnotnull(port) AND port < 1024
```

### tostring()

Convert to strings for concatenation or formatting:

```spl
| eval message = "User " . tostring(user) . " from " . tostring(src_ip)
```

Format numbers:
```spl
| eval formatted_bytes = tostring(bytes, "commas")
| eval hex_value = tostring(status, "hex")
```

## Mathematical Operations

All standard math operators work in eval:

```spl
| eval bytes_total = bytes_in + bytes_out
| eval ratio = bytes_out / bytes_in
| eval difference = abs(bytes_out - bytes_in)
| eval squared = pow(value, 2)
| eval remainder = value % 10
```

### Safe Division

Avoid division by zero:

```spl
| eval ratio = if(bytes_in > 0, bytes_out / bytes_in, 0)
```

Or use case:
```spl
| eval ratio = case(
    bytes_in = 0, null(),
    true(), round(bytes_out / bytes_in, 2)
)
```

### Rounding Functions

```spl
| eval rounded = round(value, 2)
| eval floored = floor(value)
| eval ceiled = ceiling(value)
```

### Percentage Calculation

```spl
| eval failure_pct = round((failures / total) * 100, 1)
```

## Building Calculated Fields

### Duration Calculations

```spl
| eval duration_seconds = end_time - start_time
| eval duration_minutes = round(duration_seconds / 60, 1)
| eval duration_display = case(
    duration_seconds < 60, tostring(duration_seconds) . "s",
    duration_seconds < 3600, tostring(round(duration_seconds/60, 1)) . "m",
    true(), tostring(round(duration_seconds/3600, 1)) . "h"
)
```

### Composite Risk Scores

```spl
| eval risk_score = (
    if(is_admin, 50, 0) +
    if(action="failure", 20, 0) +
    if(src_country != "US", 15, 0) +
    if(hour >= 22 OR hour <= 5, 10, 0)
)
```

### Data Size Formatting

```spl
| eval size_display = case(
    bytes < 1024, tostring(bytes) . " B",
    bytes < 1048576, tostring(round(bytes/1024, 1)) . " KB",
    bytes < 1073741824, tostring(round(bytes/1048576, 1)) . " MB",
    true(), tostring(round(bytes/1073741824, 2)) . " GB"
)
```

## Chaining Multiple Evals

You can create multiple fields in one eval:

```spl
| eval
    is_failure = if(action="failure", 1, 0),
    is_admin = if(user LIKE "admin%", 1, 0),
    risk = is_failure * 10 + is_admin * 20
```

Or chain for readability:

```spl
| eval is_failure = if(action="failure", 1, 0)
| eval is_admin = if(user LIKE "admin%", 1, 0)
| eval risk = is_failure * 10 + is_admin * 20
```

## Variations

### Ternary-Style One-Liners

```spl
| eval status_text = if(status>=400, "Error", if(status>=300, "Redirect", "OK"))
```

Nested if() works but case() is more readable for multiple branches.

### Using IN for Multiple Values

```spl
| eval is_privileged = if(user IN("admin", "root", "system"), 1, 0)
```

Cleaner than multiple OR conditions.

## Pitfalls

- **Don't forget the default in case()** - Without `true()`, unmatched events get null
- **Watch for type mismatches** - `"200" != 200` in eval; use tonumber()
- **Remember null propagation** - Math on null returns null: `null + 5 = null`
- **Don't over-nest if()** - More than two levels should be case() instead
- **Handle division by zero** - Always check denominator before dividing

## Next Steps

- Apply conditionals in "Stats Family Practice Scenario"
- Learn string manipulation in "Eval Functions - String Manipulation"
- Use calculated fields in "Query Performance Optimization"
