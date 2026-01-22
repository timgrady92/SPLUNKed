---
{
  "id": "ti-fundamentals",
  "type": "lesson",
  "title": "Threat Intelligence Fundamentals",
  "description": "Understand threat intelligence types, IOC categories, confidence levels, intelligence sources, and the TI lifecycle to effectively leverage external intelligence in your detection program.",
  "category": "threat-intel",
  "bucket": "Threat Intelligence",
  "keywords": ["threat intelligence", "IOC", "indicators", "feeds", "STIX", "TAXII"],
  "tags": ["threat-intel", "fundamentals", "advanced"],
  "difficulty": "advanced",
  "duration": "20 min",
  "objectives": [
    "Understand threat intelligence types and their uses",
    "Identify different IOC categories and their value",
    "Evaluate intelligence quality using confidence levels",
    "Apply TI lifecycle concepts to your program"
  ],
  "sortOrder": 300
}
---

## Goal

Understand what threat intelligence is, how it's categorized, and how to evaluate its quality so you can effectively integrate external intelligence into your detection and hunting programs.

## What is Threat Intelligence?

Threat intelligence is evidence-based knowledge about threats that helps you make decisions. It answers questions like:

- Who is attacking organizations like mine?
- What techniques are they using?
- What indicators reveal their presence?
- How should I prioritize my defenses?

### TI is NOT Just IOCs

A common misconception: threat intelligence = lists of bad IPs and domains.

Real threat intelligence includes:
- **Context**: Who uses this IOC? What campaign?
- **Confidence**: How certain are we this is malicious?
- **Relevance**: Does this threat target my industry?
- **Actionability**: What should I do with this information?

## Types of Threat Intelligence

### Strategic Intelligence

High-level information for executives and planners:
- Threat landscape trends
- Adversary motivations and capabilities
- Industry targeting patterns
- Geopolitical factors

**Use**: Risk assessment, budget justification, security strategy

### Operational Intelligence

Information about specific campaigns and threat actors:
- Attack campaign details
- Threat actor TTPs (Tactics, Techniques, Procedures)
- Infrastructure used in attacks
- Timeline of activities

**Use**: Understanding attack context, preparing defenses

### Tactical Intelligence

Technical details for defenders:
- Indicators of Compromise (IOCs)
- Detection signatures
- Malware analysis results
- Exploit details

**Use**: Detection rules, blocking lists, hunting queries

## Indicator of Compromise (IOC) Types

### Network Indicators

| Type | Example | Lifespan | Value |
|------|---------|----------|-------|
| IP Address | 192.168.1.100 | Days-Weeks | Medium |
| Domain | evil.example.com | Weeks-Months | Medium-High |
| URL | http://evil.com/malware.exe | Days | Medium |
| Email Address | attacker@evil.com | Weeks | Medium |

**Network IOC Considerations**:
- IPs change frequently (especially with cloud/CDN)
- Domains persist longer but can be hijacked
- URLs are specific but short-lived
- Consider infrastructure reuse patterns

### Host Indicators

| Type | Example | Lifespan | Value |
|------|---------|----------|-------|
| File Hash (MD5) | d41d8cd98f00b204... | Permanent | Low |
| File Hash (SHA256) | e3b0c44298fc1c14... | Permanent | Medium |
| File Name | update.exe | Variable | Low |
| File Path | C:\ProgramData\evil\ | Variable | Low-Medium |
| Registry Key | HKLM\Software\Evil | Variable | Medium |
| Mutex | Global\EvilMutex | Permanent | High |

**Host IOC Considerations**:
- Hashes are exact but trivially changed by attackers
- File names and paths are easily modified
- Mutexes and unique artifacts are harder to change
- Behavioral indicators outlast static ones

### Behavioral Indicators

More durable than atomic IOCs:
- Process parent-child relationships
- Command line patterns
- Network connection patterns
- File system behaviors

**Example**: "PowerShell spawned by Word downloading executable"

This pattern persists even when specific files/IPs change.

## Intelligence Quality: Confidence Levels

Not all intelligence is equal. Evaluate using confidence:

### Confidence Scoring

| Level | Score | Meaning |
|-------|-------|---------|
| High | 80-100 | Verified malicious, multiple sources confirm |
| Medium | 50-79 | Probably malicious, some corroboration |
| Low | 20-49 | Possibly malicious, limited evidence |
| Unknown | 0-19 | Unverified, single source |

### Factors Affecting Confidence

**Increases Confidence**:
- Multiple independent sources report same IOC
- Observed in confirmed incident
- Correlated with known threat actor
- Recent observation (fresh intelligence)

**Decreases Confidence**:
- Single source only
- Aged intelligence (months old)
- Shared infrastructure (CDN, hosting providers)
- Generic indicators (common file names)

### Using Confidence in Detection

```
High Confidence → Alert and investigate
Medium Confidence → Alert with context
Low Confidence → Enrich, don't alert
Unknown → Log for correlation only
```

## Intelligence Sources

### Commercial Feeds

**Pros**: Curated, contextualized, supported
**Cons**: Expensive, potential overlap between vendors

Examples: Recorded Future, Mandiant, CrowdStrike

### Open Source Feeds

**Pros**: Free, community-driven, diverse
**Cons**: Variable quality, limited context, maintenance burden

Examples:
- Abuse.ch (malware, botnets)
- AlienVault OTX (community indicators)
- PhishTank (phishing URLs)
- Emerging Threats (Suricata/Snort rules)

### ISACs (Information Sharing and Analysis Centers)

Industry-specific sharing communities:
- FS-ISAC (Financial Services)
- H-ISAC (Healthcare)
- IT-ISAC (Information Technology)

**Pros**: Industry-relevant, trusted community
**Cons**: Membership requirements, sharing obligations

### Internal Intelligence

Your own incidents generate valuable intelligence:
- IOCs from your investigations
- Patterns specific to your environment
- Threat actor focus on your organization

Often the most relevant intelligence you have.

## The TI Lifecycle

### 1. Collection

Gather intelligence from sources:
- Subscribe to feeds
- Join sharing communities
- Extract from incidents
- Monitor threat reports

### 2. Processing

Normalize and structure the data:
- Parse different formats (STIX, CSV, JSON)
- Normalize field names
- Deduplicate indicators
- Validate format correctness

### 3. Analysis

Evaluate and enrich intelligence:
- Assess confidence levels
- Add context (campaign, actor, malware family)
- Determine relevance to your environment
- Prioritize for action

### 4. Dissemination

Distribute to detection systems:
- Load into lookup tables
- Create detection rules
- Update blocking lists
- Share with analysts

### 5. Feedback

Improve intelligence quality:
- Track hit rates
- Identify false positives
- Report back to sources
- Retire stale indicators

## TI Quality Metrics

Measure your TI program effectiveness:

### Hit Rate

```
Hit Rate = (Alerts from TI) / (Total TI Indicators)
```

Very low hit rate may indicate:
- Irrelevant intelligence
- Poor indicator quality
- Detection gaps

### True Positive Rate

```
TP Rate = (Confirmed True Positives) / (Total TI Alerts)
```

Low TP rate indicates:
- Too many false positives
- Need better confidence filtering
- Overly broad indicators

### Coverage

```
Coverage = (Threats Detected by TI) / (Total Threats Detected)
```

Low coverage means TI isn't your primary detection mechanism (normal for most orgs).

### Freshness

```
Avg Age = Average(Current Date - IOC First Seen)
```

Old indicators may be:
- No longer in use by attackers
- Already blocked elsewhere
- Generating false positives from legitimate takeovers

## Variations

### TI for Detection vs. Hunting

**Detection**: Automated matching against live data
- Focus on high-confidence, actionable IOCs
- Minimize false positives
- Real-time or near-real-time

**Hunting**: Proactive search using TI as starting point
- Can use lower-confidence intelligence
- Human analysis of results
- Historical data search

### TI at Different Maturity Levels

**Beginning**:
- Single commercial feed
- Basic IP/domain blocking
- Manual lookup matching

**Intermediate**:
- Multiple feeds aggregated
- Automated enrichment
- Confidence-based alerting

**Advanced**:
- Custom intelligence from incidents
- TI-driven hunt program
- Automated feedback loops
- Attribution and campaign tracking

## Pitfalls

- **Indicator overload**: Too many IOCs = alert fatigue
- **Stale intelligence**: Old IOCs generate false positives
- **Lack of context**: IOCs without context aren't actionable
- **Single source dependency**: One feed = single point of failure
- **No feedback loop**: Never improving intelligence quality

## Next Steps

- Learn IOC types and matching patterns in detail
- Practice lookup-based IOC matching
- Build automated enrichment workflows
