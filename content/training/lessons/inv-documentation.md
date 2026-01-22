---
{
  "id": "inv-documentation",
  "type": "lesson",
  "title": "Investigation Documentation",
  "description": "Learn to document investigations effectively with reproducible queries, proper evidence preservation, clear findings presentation, and chain of custody awareness.",
  "category": "investigation",
  "bucket": "Security Investigation",
  "keywords": ["documentation", "evidence", "chain of custody", "reporting"],
  "tags": ["investigation", "documentation", "intermediate"],
  "difficulty": "intermediate",
  "duration": "15 min",
  "objectives": [
    "Document investigations with reproducible queries",
    "Preserve evidence appropriately",
    "Present findings clearly for different audiences",
    "Maintain chain of custody awareness"
  ],
  "sortOrder": 209
}
---

## Goal

Document investigations so that anyone can understand what you found, how you found it, and why it matters. Good documentation protects you, helps your team, and may be required for legal proceedings.

## Why Documentation Matters

### Reproducibility

Six months later, can you:
- Re-run the same queries?
- Get the same results?
- Remember why this mattered?

### Knowledge Transfer

When you're unavailable:
- Can another analyst continue your work?
- Can they understand your reasoning?
- Can they verify your conclusions?

### Legal and Compliance

If this goes to court or audit:
- Is your evidence defensible?
- Can you prove chain of custody?
- Are your methods documented?

### Your Own Protection

If questioned about your findings:
- Can you explain your methodology?
- Can you show your work?
- Did you follow proper procedures?

## What to Document

### The Investigation Record

**Header Information**:
- Case/ticket number
- Date and time started
- Analyst name
- Trigger (what initiated investigation)

**Scope**:
- Time range covered
- Systems involved
- Users involved
- Data sources queried

**Hypothesis and Reasoning**:
- Initial hypothesis
- What evidence would confirm/refute
- How hypothesis evolved

**Evidence**:
- Queries run (exact SPL)
- Results summary
- Screenshots where relevant
- Interpretation of each finding

**Conclusions**:
- Findings (confirmed/unconfirmed)
- Root cause if determined
- Impact assessment
- Recommendations

## Query Documentation

### Always Include

```
# What I'm looking for
# Why I expect to find it this way

index=security sourcetype=wineventlog EventCode=4625
| stats count by user, src_ip
| where count > 10
| sort - count

# Expected result: Users with >10 failed logins
# If found: Indicates potential brute force attempt
```

### Bad Documentation

```spl
index=security EventCode=4625 | stats count by user
```

What's wrong:
- No context for why
- No explanation of what to look for
- No interpretation guidance

### Good Documentation

```
Hypothesis: Account jsmith was targeted by brute force attack
Testing: Look for failed authentication attempts (4625) targeting jsmith

Query:
index=security sourcetype=wineventlog EventCode=4625 user=jsmith earliest=-24h
| stats count, values(src_ip) as source_ips, values(SubStatus) as failure_reasons
| eval attack_indicator = if(count > 10, "High", "Low")

Result: 247 failures from 1 IP (10.5.3.100), all SubStatus=0xC000006A (bad password)

Interpretation: Single source attempting repeated password guesses against jsmith.
This confirms brute force attack targeting this specific account.
Next step: Check if any subsequent successful login from this IP or for this user.
```

## Evidence Preservation

### Levels of Preservation

**Level 1: Query + Summary** (Minimum)
- Save the SPL
- Document result count and key findings
- Sufficient for routine investigations

**Level 2: Query + Screenshot** (Standard)
- Save the SPL
- Screenshot the results
- Include timestamp visible in screenshot
- Good for escalated incidents

**Level 3: Query + Export** (Forensic)
- Save the SPL
- Export full results to CSV/JSON
- Hash the export file
- Required for legal/compliance matters

### Screenshot Best Practices

Include in screenshot:
- Search bar with query visible
- Time range picker
- Results with relevant columns
- Splunk timestamp

Don't include:
- Personal browser tabs
- Unrelated dashboard elements
- Credentials or tokens

### Export Practices

For formal evidence:

```spl
index=security EventCode=4625 user=jsmith earliest=-24h
| table _time, user, src_ip, SubStatus, dest
| outputcsv evidence_case12345_bruteforce.csv
```

Then document:
- Export timestamp
- File hash (SHA256)
- Storage location
- Access controls applied

## Findings Format

### Executive Summary Format

For leadership/non-technical audiences:

```
SUMMARY: Brute force attack detected against user account jsmith

IMPACT: Account was targeted but not compromised. No unauthorized access occurred.

TIMELINE:
- Jan 15, 14:23: Attack began from IP 10.5.3.100
- Jan 15, 14:31: Account locked after 15 failures
- Jan 15, 15:00: IT notified, account reset

ACTIONS TAKEN:
- Blocked source IP at perimeter
- Reset account password
- Verified no successful unauthorized access

RECOMMENDATIONS:
- Implement account lockout after 5 failures
- Enable MFA for this user
- Monitor for similar patterns from other IPs
```

### Technical Summary Format

For SOC team/incident responders:

```
INVESTIGATION: Case #12345 - Brute Force Against jsmith

TRIGGER: Alert "Multiple Failed Logins" fired 2024-01-15 14:25

SCOPE:
- Time: 2024-01-15 14:00 to 2024-01-15 16:00
- User: jsmith
- Sources: index=security (wineventlog), index=proxy

EVIDENCE:
1. 247 failed logins (4625) for jsmith in 8 minutes
   - Source: 10.5.3.100
   - Failure code: 0xC000006A (bad password)
   - Query: [attached]

2. No successful login from attacking IP
   - Query: [attached]
   - Result: 0 events

3. User's subsequent legitimate login at 15:45 from known workstation
   - Source: 10.1.2.50 (JSMITH-PC)
   - Confirms account not compromised

CONCLUSION:
- Attack confirmed: brute force password guessing
- Attack unsuccessful: account remained secure
- Attacker IP: 10.5.3.100 (external, unattributed)

RECOMMENDATIONS:
[detailed technical recommendations]
```

## Chain of Custody

For investigations that may have legal implications:

### Documentation Requirements

1. **Who collected the evidence**: Your name, role
2. **When it was collected**: Timestamp (timezone noted)
3. **How it was collected**: Query, method
4. **Where it's stored**: Location, access controls
5. **Who has accessed it**: Access log

### Simple Custody Log

| Date/Time | Action | Person | Notes |
|-----------|--------|--------|-------|
| 2024-01-15 15:00 | Exported logs | J. Analyst | SHA256: abc123... |
| 2024-01-15 15:30 | Copied to secure share | J. Analyst | \\\\secure\\evidence\\case12345 |
| 2024-01-16 09:00 | Reviewed | M. Senior | No modifications |

### When Chain of Custody Matters

- HR investigations
- Legal hold situations
- Regulatory compliance audits
- Criminal referrals
- Insurance claims

## Documentation Templates

### Quick Investigation Note

```
Date: [Date]
Case: [Ticket #]
Analyst: [Name]

Alert: [Alert name]
Hypothesis: [Brief hypothesis]

Key Query:
[SPL]

Result: [X events / Y users / etc.]

Conclusion: [True positive / False positive / Needs escalation]

Action: [What was done]
```

### Full Investigation Report

```
# Investigation Report: [Title]

## Metadata
- Case Number:
- Date Range Investigated:
- Analyst:
- Date Completed:

## Executive Summary
[2-3 sentences for leadership]

## Background
[What triggered this investigation]

## Scope
[Time range, systems, users, data sources]

## Methodology
[Approach taken, hypotheses tested]

## Findings
### Finding 1: [Title]
- Evidence: [Description]
- Query: [SPL]
- Result: [Screenshot/summary]
- Interpretation: [What this means]

### Finding 2: [Title]
[Repeat structure]

## Timeline
[Chronological event sequence]

## Conclusions
[What happened, who/what was affected]

## Recommendations
[Actions to take]

## Appendix
- Full query list
- Exported data references
- Related tickets
```

## Variations

### Real-Time Documentation

During active incidents, documentation is minimal:
- Quick notes in ticket
- Screenshot key findings immediately
- Full write-up after containment

### Retrospective Documentation

After investigation complete:
- Organize notes into coherent narrative
- Fill in gaps from memory while fresh
- Add context that was obvious at the time

## Pitfalls

- **Don't wait until the end** - Document as you go; you'll forget details
- **Don't skip "negative" findings** - No evidence is still evidence
- **Don't assume context is obvious** - Future readers won't know what you knew
- **Don't forget time zones** - Specify UTC or local time explicitly
- **Don't over-document routine cases** - Scale effort to significance

## Next Steps

- Practice documentation during investigation scenarios
- Develop personal templates that work for you
- Review peer documentation for quality ideas
