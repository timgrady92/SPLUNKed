---
{
  "id": "inv-methodology",
  "type": "lesson",
  "title": "Investigation Methodology Fundamentals",
  "description": "Learn the structured approach to security investigations including the OODA loop, hypothesis-driven analysis, proper scoping, and evidence preservation requirements.",
  "category": "investigation",
  "bucket": "Security Investigation",
  "keywords": ["investigation", "methodology", "OODA", "hypothesis", "evidence"],
  "tags": ["investigation", "methodology", "intermediate"],
  "difficulty": "intermediate",
  "duration": "15 min",
  "objectives": [
    "Apply structured investigation methodology",
    "Develop and test hypotheses systematically",
    "Scope investigations appropriately",
    "Preserve evidence for documentation and escalation"
  ],
  "sortOrder": 200
}
---

## Goal

Approach security investigations systematically rather than randomly. A structured methodology produces consistent, defensible results and prevents tunnel vision.

## The OODA Loop

Investigations follow the OODA loop: Observe, Orient, Decide, Act.

### Observe

Gather initial facts without interpretation:
- What triggered this investigation? (alert, report, anomaly)
- What data sources are available?
- What time range is relevant?
- Who/what is involved?

### Orient

Analyze observations in context:
- Is this normal for this user/system/time?
- What threat scenarios could explain this?
- What additional context do I need?
- What doesn't fit the pattern?

### Decide

Form hypotheses and choose next steps:
- What's the most likely explanation?
- What evidence would confirm or refute it?
- What's the highest-priority question to answer?
- Should I escalate now or continue?

### Act

Execute your decision:
- Run the query
- Gather the evidence
- Document findings
- Loop back to Observe with new data

## Hypothesis-Driven Investigation

Don't search aimlessly. Form hypotheses and test them.

### Bad Approach

"Let me search around and see what I find."

This leads to:
- Wasted time on irrelevant data
- Missing important evidence
- Inconsistent results
- Poor documentation

### Good Approach

"I hypothesize this is a compromised account. If true, I should see: unusual login times, logins from new locations, and access to sensitive resources."

This leads to:
- Focused, efficient searches
- Clear success/failure criteria
- Reproducible investigation
- Documented reasoning

### Hypothesis Template

```
If [threat scenario] is occurring, then I should observe:
1. [Observable evidence 1]
2. [Observable evidence 2]
3. [Observable evidence 3]

If I don't observe these, then [alternative explanation].
```

### Example

```
If this account was compromised via phishing, then I should observe:
1. Email with malicious link/attachment shortly before suspicious activity
2. Login from IP address different from user's normal pattern
3. Activity inconsistent with user's typical behavior

If I don't observe email-based initial access, consider:
credential stuffing, password spray, or insider threat.
```

## Investigation Scoping

Define boundaries before diving in.

### Scope Questions

**Time Scope**
- When did suspicious activity start?
- How far back should I look for precursors?
- Is this ongoing or completed?

**Entity Scope**
- Which users are involved?
- Which systems are affected?
- Which network segments?

**Data Scope**
- Which indexes have relevant data?
- What sourcetypes are needed?
- Are there data gaps?

### Scope Creep Warning

Investigations naturally expand. A single compromised account might lead to:
- Compromised credentials → other accounts
- Compromised system → lateral movement
- Malware → other infections

**Know when to:**
- Expand scope (evidence of broader compromise)
- Escalate (beyond your authority/capability)
- Document and stop (sufficient for current ticket)

## Evidence Preservation

Preserve evidence as you investigate.

### What to Capture

For each significant finding:
1. **The SPL query** - Exact query that produced results
2. **The results** - Screenshot or exported data
3. **The timestamp** - When you ran the query
4. **The interpretation** - What this evidence means

### Evidence Standards

**Reproducible**: Another analyst can run your query and get same results

**Timestamped**: When did this evidence exist in Splunk?

**Contextualized**: Why is this significant?

**Complete**: Include negative results (absence of expected evidence)

### Simple Documentation Pattern

```
[Timestamp] Investigating alert: [Alert Name]
Hypothesis: [What I'm testing]

Query: [SPL]
Result: [Summary - X events, Y users, etc.]
Interpretation: [What this means]

Next step: [What I'll investigate next]
```

## Investigation Phases

### Phase 1: Initial Triage (5-10 min)

- Verify the alert/report is valid
- Identify affected entities
- Determine severity and urgency
- Decide: investigate, escalate, or close

### Phase 2: Scoping (5-10 min)

- Define time boundaries
- Identify all involved entities
- Map available data sources
- Form initial hypothesis

### Phase 3: Deep Analysis (variable)

- Test hypotheses systematically
- Follow evidence chains
- Document each finding
- Revise hypotheses as needed

### Phase 4: Conclusion (10-15 min)

- Summarize findings
- Determine root cause if possible
- Identify remediation needs
- Document for future reference

## Common Investigation Mistakes

### Tunnel Vision

**Problem**: Focusing on first theory, ignoring contradicting evidence

**Solution**: Actively seek disconfirming evidence. Ask "What would prove me wrong?"

### Scope Explosion

**Problem**: Investigation grows without bounds

**Solution**: Set explicit scope. Document when scope changes and why.

### Poor Documentation

**Problem**: Can't reproduce findings or explain reasoning

**Solution**: Document as you go, not at the end. Include queries.

### Assuming Malice

**Problem**: Every anomaly is an attack

**Solution**: Consider benign explanations. Most alerts are false positives.

### Premature Closure

**Problem**: Stopping at first plausible explanation

**Solution**: Verify hypothesis with multiple evidence sources.

## Variations

### Incident Response vs. Threat Hunting

**Incident Response**: Start with alert, determine if real, scope impact
- More structured, time-sensitive
- Clear success criteria (confirm/deny, contain, remediate)

**Threat Hunting**: Start with hypothesis, look for evidence
- More exploratory, less urgent
- Success is finding something OR confirming absence

### Solo vs. Team Investigation

**Solo**: Document more thoroughly - you're your only reviewer

**Team**: Coordinate scope, share findings, avoid duplicate work

## Pitfalls

- **Don't skip documentation** - You'll forget details
- **Don't assume single root cause** - Attackers use multiple techniques
- **Don't ignore negative results** - Absence of evidence is evidence
- **Don't work indefinitely** - Set time limits, escalate if stuck

## Next Steps

- Apply methodology in Windows Events 101 tutorial
- Practice hypothesis formation in investigation scenarios
- Build documentation habits early
