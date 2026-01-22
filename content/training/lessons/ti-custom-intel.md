---
{
  "id": "ti-custom-intel",
  "type": "lesson",
  "title": "Building Custom Threat Intelligence",
  "description": "Create internal threat intelligence from your own incidents, hunting discoveries, and environmental knowledge to build the most relevant intelligence for your organization.",
  "category": "threat-intel",
  "bucket": "Threat Intelligence",
  "keywords": ["custom intel", "internal TI", "IOC extraction", "sharing"],
  "tags": ["threat-intel", "custom", "advanced"],
  "difficulty": "advanced",
  "duration": "15 min",
  "objectives": [
    "Extract IOCs from your own incidents",
    "Build and maintain internal threat intelligence",
    "Share intelligence with trusted communities",
    "Ensure quality of custom intelligence"
  ],
  "sortOrder": 310
}
---

## Goal

Build threat intelligence from your own environment. Internal TI is often more relevant than external feeds because it reflects threats actually targeting your organization.

## Why Custom Intelligence?

### External TI Limitations

- Generic: May not target your industry
- Delayed: You learn about threats after others
- Noisy: High false positive rate for your environment
- Incomplete: Doesn't know your infrastructure

### Custom TI Advantages

- **Relevant**: Based on actual attacks against you
- **Timely**: Generated as incidents occur
- **Contextual**: Includes your environmental knowledge
- **Actionable**: Already proven to affect your systems

## Sources of Custom Intelligence

### 1. Incident Investigations

Every incident generates intelligence:

**IOCs to Extract**:
- Attacker IP addresses
- Malicious domains and URLs
- File hashes (malware, tools)
- Email addresses used in phishing
- User agents and other artifacts

**Context to Capture**:
- Attack timeline
- Techniques observed
- Business impact
- Related campaigns

### 2. Threat Hunting Discoveries

Hunting finds threats that evade detection:

**Hunt Outputs**:
- Previously unknown malicious infrastructure
- Novel attack patterns
- Environmental anomalies
- Behavioral indicators

**Example**:
```
Hunt finding: New C2 pattern using DNS TXT queries to *.updates.legit-looking.com
Intelligence: Domain pattern, DNS query characteristics, associated process
```

### 3. Security Tool Blocks

Your security tools see threats daily:

**Sources**:
- Firewall blocked connections
- Endpoint protection quarantines
- Email gateway rejections
- Web proxy blocks

**Value**: Already validated as blocked threats targeting you

### 4. Peer and Community Sharing

Intelligence from trusted partners:

- Industry ISACs
- Regional sharing groups
- Vendor threat briefings
- Peer organization exchanges

## IOC Extraction Process

### From Investigation Queries

```spl
index=security src_ip!="10.*" earliest=-7d
| search EventCode=4625 user=compromised_user
| stats count by src_ip
| where count > 5
| table src_ip
| outputcsv investigation_iocs.csv
```

### From Malware Analysis

When malware is analyzed:
- File hashes (MD5, SHA1, SHA256)
- C2 domains and IPs
- Mutex names
- Registry keys created
- Files dropped

### From Email Threats

```spl
index=email action=blocked
| stats count by sender_domain, attachment_hash, url_domain
| where count > 3
| table sender_domain, attachment_hash, url_domain
```

### Quality Filtering

Not everything blocked is TI-worthy:

```spl
| inputlookup raw_blocked_ips.csv
| lookup known_scanners ip OUTPUT scanner_name
| where isnull(scanner_name)
| lookup cloud_providers ip OUTPUT provider
| where isnull(provider)
| eval confidence = case(
    hit_count > 100, "high",
    hit_count > 10, "medium",
    true(), "low")
| where confidence IN ("high", "medium")
```

Filter out:
- Known vulnerability scanners
- Cloud provider ranges
- CDN infrastructure
- Legitimate services miscategorized

## Building Your IOC Database

### Lookup Table Structure

Create a comprehensive IOC lookup:

```
indicator,type,confidence,first_seen,last_seen,source,campaign,description
192.168.50.100,ip,high,2024-01-15,2024-01-15,incident-001,APT-X,"C2 server"
evil.example.com,domain,medium,2024-01-10,2024-01-15,hunting,"Phishing infrastructure"
abc123def456...,sha256,high,2024-01-14,2024-01-14,incident-001,APT-X,"Dropper malware"
```

### Required Fields

| Field | Purpose |
|-------|---------|
| indicator | The actual IOC value |
| type | ip, domain, hash, url, email |
| confidence | high, medium, low |
| first_seen | When first observed |
| last_seen | Most recent observation |
| source | incident-id, hunt-id, tool |
| campaign | Related campaign/actor if known |
| description | Human-readable context |

### Optional Enrichment Fields

| Field | Purpose |
|-------|---------|
| kill_chain_phase | reconnaissance, delivery, c2, etc. |
| mitre_technique | T1566, T1059, etc. |
| severity | critical, high, medium, low |
| expiration | When to retire the IOC |
| related_iocs | Linked indicators |

## Maintaining Intelligence Quality

### Lifecycle Management

**Active**: Recently observed, high confidence
- Full detection and alerting

**Aging**: Not seen in 30-90 days
- Continue matching, lower alert priority

**Retired**: Not seen in 90+ days
- Archive, remove from active detection

### Aging Query

```spl
| inputlookup internal_iocs.csv
| eval days_since_seen = (now() - strptime(last_seen, "%Y-%m-%d")) / 86400
| eval status = case(
    days_since_seen < 30, "active",
    days_since_seen < 90, "aging",
    true(), "retire")
| stats count by status, type
```

### Confidence Updates

Increase confidence when:
- IOC seen in multiple incidents
- Corroborated by external TI
- Associated with confirmed attack

Decrease confidence when:
- False positive confirmed
- Infrastructure appears legitimate
- Shared hosting/CDN identified

### Regular Review

Schedule periodic TI hygiene:

```spl
| inputlookup internal_iocs.csv
| eval age_days = (now() - strptime(first_seen, "%Y-%m-%d")) / 86400
| where age_days > 90
| where last_seen < relative_time(now(), "-60d")
| table indicator, type, first_seen, last_seen, source
```

## Sharing Intelligence

### When to Share

**Good Candidates for Sharing**:
- IOCs from confirmed attacks
- Novel techniques not widely known
- Industry-specific threats
- Indicators with good context

**Don't Share**:
- Unvalidated IOCs
- Indicators that reveal your vulnerabilities
- Information that identifies your organization
- Intelligence received under NDA

### Sharing Formats

**STIX/TAXII**: Industry standard
```json
{
  "type": "indicator",
  "spec_version": "2.1",
  "pattern": "[ipv4-addr:value = '192.168.50.100']",
  "valid_from": "2024-01-15T00:00:00Z"
}
```

**CSV**: Simple, widely compatible
```
indicator,type,confidence,description
192.168.50.100,ip,high,C2 server observed in phishing campaign
```

### Sharing Channels

- **ISAC membership**: Submit to your industry ISAC
- **Vendor sharing**: Report to your security vendors
- **Trusted peers**: Direct sharing with partner organizations
- **Public contribution**: Submit to community databases (with care)

## From Incidents to Intelligence

### Post-Incident Intelligence Workflow

1. **During Incident**: Collect all IOCs encountered
2. **Validation**: Confirm IOCs are truly malicious
3. **Deduplication**: Check against existing TI
4. **Enrichment**: Add context and classification
5. **Documentation**: Record in standard format
6. **Dissemination**: Add to detection systems
7. **Sharing**: Contribute to community (if appropriate)

### Intelligence Template

```
## Incident Intelligence Report

**Incident ID**: INC-2024-001
**Date**: 2024-01-15
**Classification**: Phishing → Credential Theft → Lateral Movement

### Indicators of Compromise

| Type | Indicator | Confidence | Notes |
|------|-----------|------------|-------|
| IP | 192.168.50.100 | High | C2 server |
| Domain | evil.example.com | High | Phishing site |
| SHA256 | abc123... | High | Malware dropper |
| Email | attacker@evil.com | Medium | Phishing sender |

### Behavioral Indicators
- PowerShell with -EncodedCommand spawned by Outlook
- DNS queries to *.updates.evil.com at regular intervals
- LSASS access from non-system process

### MITRE ATT&CK Mapping
- T1566.001: Phishing: Spearphishing Attachment
- T1059.001: PowerShell
- T1003.001: LSASS Memory

### Recommendations
- Block identified IPs and domains at perimeter
- Add file hashes to endpoint protection
- Create detection for DNS pattern
```

## Variations

### Small Teams

With limited resources:
- Focus on high-confidence IOCs only
- Use simple CSV lookups
- Prioritize automation over documentation

### Large Teams

With dedicated TI function:
- Full STIX/TAXII implementation
- Threat intelligence platform (TIP)
- Formal sharing agreements
- Attribution and campaign tracking

## Pitfalls

- **Hoarding without sharing**: Intelligence gains value through community
- **No expiration**: Old IOCs become false positive generators
- **Missing context**: IOCs without context aren't useful
- **Over-classification**: Not everything needs to be secret
- **No feedback loop**: Never improving based on detection results

## Next Steps

- Practice IOC extraction in the scenario exercises
- Build an internal IOC lookup table
- Integrate custom TI with external feeds
