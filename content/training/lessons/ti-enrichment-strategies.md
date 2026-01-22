---
{
  "id": "ti-enrichment-strategies",
  "type": "lesson",
  "title": "GeoIP and Context Enrichment Strategies",
  "description": "Add geographic, organizational, and reputation context to events using GeoIP lookups, ASN data, and enrichment prioritization strategies.",
  "category": "threat-intel",
  "bucket": "Threat Intelligence",
  "keywords": ["geoip", "enrichment", "ASN", "reputation", "context"],
  "tags": ["threat-intel", "enrichment", "geoip", "advanced"],
  "difficulty": "advanced",
  "duration": "15 min",
  "objectives": [
    "Add geographic context using GeoIP lookups",
    "Enrich with ASN and organizational data",
    "Understand reputation scoring concepts",
    "Prioritize enrichment for maximum value"
  ],
  "sortOrder": 307
}
---

## Goal

Transform raw IP addresses into actionable context by adding geographic location, network ownership, and reputation data. Smart enrichment makes alerts more actionable and investigations faster.

## Why Enrichment Matters

Raw events tell you WHAT happened. Enrichment tells you WHERE, WHO, and HOW SUSPICIOUS.

### Before Enrichment

```
src_ip=185.234.72.100 dest_ip=10.1.2.50 bytes=50000
```

What do we know? An external IP sent data to an internal host. Is this suspicious?

### After Enrichment

```
src_ip=185.234.72.100 dest_ip=10.1.2.50 bytes=50000
src_country=RU src_city=Moscow src_asn=AS12345 src_org="Bulletproof Hosting Ltd"
src_reputation=high_risk threat_category=c2
```

Now we know: A high-risk IP from a bulletproof hosting provider in Russia, flagged as C2, sent 50KB to our server. Much more actionable.

## GeoIP Enrichment

### Basic GeoIP Lookup

```spl
index=firewall direction=outbound
| lookup geoip ip as dest_ip OUTPUT country, city, latitude, longitude
| table _time, src_ip, dest_ip, country, city
```

### GeoIP Fields Available

| Field | Description | Use Case |
|-------|-------------|----------|
| country | Country code (US, RU, CN) | Geographic filtering |
| country_name | Full country name | Display |
| city | City name | Granular location |
| region | State/province | Regional analysis |
| latitude/longitude | Coordinates | Map visualization |
| timezone | Local timezone | Time correlation |

### Common GeoIP Patterns

**Foreign Country Alert**:
```spl
index=vpn action=success
| lookup geoip src_ip OUTPUT country
| where NOT country IN ("US", "CA", "GB")
| table _time, user, src_ip, country
```

**Impossible Travel Detection**:
```spl
index=auth action=success
| lookup geoip src_ip OUTPUT country, lat, lon
| sort user, _time
| streamstats current=f last(country) as prev_country, last(lat) as prev_lat, last(lon) as prev_lon, last(_time) as prev_time by user
| eval distance_km = round(sqrt(pow((lat-prev_lat)*111, 2) + pow((lon-prev_lon)*85, 2)), 0)
| eval hours = (_time - prev_time) / 3600
| eval speed_kmh = if(hours > 0, distance_km / hours, 0)
| where speed_kmh > 800 AND prev_country != country
| table _time, user, prev_country, country, speed_kmh
```

### GeoIP Limitations

- **Accuracy varies**: Country-level is reliable; city-level less so
- **VPNs and proxies**: Location shows VPN exit, not user
- **CDNs**: May show CDN node, not origin
- **Mobile networks**: Can show network registration, not physical location
- **Database freshness**: IP allocations change; keep lookups updated

## ASN and Organization Enrichment

ASN (Autonomous System Number) reveals who owns the IP range.

### ASN Lookup

```spl
index=firewall
| lookup asn_lookup ip as src_ip OUTPUT asn, org_name, isp
| stats count by asn, org_name
| sort - count
```

### Valuable ASN Context

| ASN Type | Example | Implication |
|----------|---------|-------------|
| Major cloud | AWS, Azure, GCP | Could be legitimate or attacker infrastructure |
| Bulletproof hosting | Known bad hosters | High suspicion |
| Residential ISP | Comcast, Verizon | Likely end user or compromised host |
| Corporate | Company ASNs | Business partner or targeted org |
| VPN provider | NordVPN, ExpressVPN | Privacy-seeking user |
| Hosting provider | DigitalOcean, OVH | Server, could be anything |

### Suspicious ASN Patterns

```spl
index=firewall direction=outbound
| lookup asn_lookup ip as dest_ip OUTPUT asn, org_name
| lookup suspicious_asns asn OUTPUT risk_level, notes
| where isnotnull(risk_level)
| stats count by dest_ip, org_name, risk_level, notes
```

## Reputation Enrichment

Reputation scores aggregate multiple intelligence sources into a risk assessment.

### Reputation Categories

| Category | Score Range | Action |
|----------|-------------|--------|
| Clean | 0-20 | No action needed |
| Suspicious | 21-50 | Monitor, enrich further |
| Malicious | 51-80 | Alert, investigate |
| Critical | 81-100 | Block, immediate response |

### Multi-Source Reputation

```spl
index=firewall
| lookup virustotal_ip ip as dest_ip OUTPUT vt_score
| lookup abuseipdb ip as dest_ip OUTPUT abuse_score
| lookup internal_ti ip as dest_ip OUTPUT internal_score
| eval combined_score = max(vt_score, abuse_score, internal_score)
| eval risk_level = case(
    combined_score >= 80, "critical",
    combined_score >= 50, "malicious",
    combined_score >= 20, "suspicious",
    true(), "clean")
| where risk_level != "clean"
```

### Reputation Source Considerations

**External Sources**:
- VirusTotal: Aggregates multiple AV vendors
- AbuseIPDB: Community-reported abuse
- Commercial TI: Curated, contextualized

**Internal Sources**:
- Previous incident IOCs
- Blocked by security tools
- Analyst-flagged indicators

## Enrichment Prioritization

Not every event needs full enrichment. Prioritize based on:

### Enrichment Tiers

**Tier 1: Always Enrich**
- Alerts and notable events
- Outbound connections to unknown destinations
- Authentication from external sources

**Tier 2: Enrich on Demand**
- Internal-to-internal traffic
- Known good destinations
- High-volume, low-risk events

**Tier 3: Skip Enrichment**
- Health checks and heartbeats
- Internal monitoring traffic
- Already-enriched data

### Performance-Aware Enrichment

```spl
index=firewall direction=outbound
| where NOT cidrmatch("10.0.0.0/8", dest_ip)
| where NOT cidrmatch("172.16.0.0/12", dest_ip)
| where NOT cidrmatch("192.168.0.0/16", dest_ip)
| lookup geoip ip as dest_ip OUTPUT country
| lookup threat_intel ip as dest_ip OUTPUT threat_score
| where threat_score > 50 OR NOT country IN ("US", "CA", "GB", "DE", "FR")
```

Filter to external IPs first, then enrich only what matters.

## Enrichment Architecture

### Lookup-Time vs. Index-Time

**Lookup-Time (Search-Time)**:
- Enrichment happens during search
- Data stays current with lookup updates
- No storage overhead
- Slower for large result sets

**Index-Time**:
- Enrichment happens at ingestion
- Fast search performance
- Requires re-indexing to update
- Increases storage

### Recommendation

Use **lookup-time** for:
- Threat intelligence (changes frequently)
- Reputation scores
- GeoIP (monthly updates)

Use **index-time** for:
- Asset inventory (relatively static)
- User directory (changes infrequently)
- Critical enrichment needed for all searches

## Variations

### Cloud vs. On-Premises

**Cloud environments**: Many IPs are cloud providers
- Enrich with cloud provider metadata
- Consider cloud-specific reputation

**On-premises**: More stable IP ranges
- Internal asset lookup more valuable
- External traffic more suspicious

### High-Volume Environments

At scale, full enrichment is expensive:
- Use summary indexes with pre-enriched data
- Enrich alerts, not all events
- Cache lookup results where possible

## Pitfalls

- **Over-enriching**: Adding context to events you'll never investigate wastes resources
- **Stale data**: Outdated GeoIP/reputation data causes false positives
- **Missing internal context**: Enriching external data but not your own assets
- **Single source trust**: Relying on one reputation provider
- **Ignoring enrichment failures**: Null results may indicate evasion

## Next Steps

- Build multi-field IOC matching in the tutorial
- Practice enrichment in the TI scenarios
- Implement automatic lookup enrichment
