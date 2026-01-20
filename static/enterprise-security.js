/**
 * SPLUNKed - Enterprise Security Data and Logic
 * Splunk ES features: RBA, Notable Events, Asset/Identity, Threat Intel, and more
 */
(function() {
'use strict';

// ============================================
// Category Info
// ============================================

const ES_CATEGORY_INFO = {
    title: 'Enterprise Security',
    description: 'Splunk Enterprise Security (ES) features: Risk-Based Alerting, Notable Events, Asset/Identity Framework, and Threat Intelligence.'
};

// ============================================
// Enterprise Security Data
// ============================================

const ES_DATA = [
        // ============================================
        // Risk-Based Alerting (RBA)
        // ============================================
        {
            id: 'es_rba_overview',
            name: 'Risk-Based Alerting (RBA)',
            category: 'enterpriseSecurity',
            subcategory: 'rba',
            takeaway: 'Aggregate risk scores to prioritize threats instead of alert fatigue',
            what: 'Risk-Based Alerting shifts from individual alerts to accumulated risk scores per entity (user, host). Instead of alerting on every suspicious event, ES tracks risk contributions and alerts when an entity\'s total risk exceeds a threshold.',
            why: 'Traditional alerting causes alert fatigue - too many individual alerts to investigate. RBA reduces noise by focusing on entities with multiple risk indicators, surfacing truly suspicious activity.',
            keyPoint: 'Think of RBA as a "credit score for bad behavior" - individual events contribute risk points, and you investigate when the score gets too high.',
            examples: [
                { spl: 'index=risk | stats sum(risk_score) as total_risk by risk_object | where total_risk > 100 | sort -total_risk', explanation: 'Find high-risk entities' },
                { spl: 'index=risk risk_object_type=user | stats sum(risk_score) as total, values(source) as detections by risk_object | sort -total', explanation: 'User risk with contributing detections' },
                { spl: '| tstats sum(All_Risk.calculated_risk_score) as risk from datamodel=Risk by All_Risk.risk_object | sort -risk', explanation: 'Risk via accelerated data model' }
            ],
            gotchas: [
                'risk_object is the entity being attributed risk (user, host, IP)',
                'risk_object_type identifies the entity type for correlation',
                'Risk scores reset on a rolling window (typically 24h-7d)',
                'Tune risk scores in correlation searches to balance signal vs noise'
            ],
            relatedCommands: ['index=risk', 'risk_object', 'risk_score']
        },
        {
            id: 'es_risk_index',
            name: 'Risk Index (index=risk)',
            category: 'enterpriseSecurity',
            subcategory: 'rba',
            takeaway: 'Where all risk events are stored',
            what: 'The risk index stores every risk attribution event from correlation searches. Each event represents a single risk contribution to an entity, including the source rule, score, and context.',
            why: 'Query the risk index directly to investigate what contributed to an entity\'s risk, build custom risk dashboards, or tune detection logic.',
            examples: [
                { spl: 'index=risk risk_object="jsmith" | table _time, source, risk_score, risk_message', explanation: 'All risk events for user jsmith' },
                { spl: 'index=risk | stats sum(risk_score) as total, dc(source) as unique_rules by risk_object, risk_object_type | sort -total', explanation: 'Risk summary by entity' },
                { spl: 'index=risk | timechart span=1h sum(risk_score) by risk_object limit=10', explanation: 'Risk over time for top entities' },
                { spl: 'index=risk source="*Brute Force*" | stats count, sum(risk_score) by risk_object', explanation: 'Find entities hit by brute force detections' }
            ],
            gotchas: [
                'source field contains the correlation search name that generated the risk',
                'risk_message provides human-readable context',
                'threat_object contains the IOC or threat indicator if applicable',
                'Use risk_object_type to filter to specific entity types (user, system, etc.)'
            ],
            relatedFields: ['risk_object', 'risk_object_type', 'risk_score', 'risk_message', 'source', 'threat_object']
        },
        {
            id: 'es_risk_score',
            name: 'risk_score Field',
            category: 'enterpriseSecurity',
            subcategory: 'rba',
            takeaway: 'Numeric value representing threat severity',
            what: 'The risk_score field contains a numeric value (typically 1-100) assigned by a correlation search to indicate how suspicious or severe an event is.',
            why: 'Risk scores enable prioritization. A failed login might score 5, while credential dumping scores 80. Total risk per entity determines investigation priority.',
            examples: [
                { spl: 'index=risk | stats avg(risk_score) as avg_score, max(risk_score) as max_score by source | sort -avg_score', explanation: 'Average risk by detection rule' },
                { spl: 'index=risk risk_score>=50 | stats count by risk_object, source', explanation: 'High-risk events (50+) by entity and rule' },
                { spl: '| from datamodel:Risk | where calculated_risk_score > 75', explanation: 'Very high risk events from data model' }
            ],
            gotchas: [
                'calculated_risk_score in data model may differ from raw risk_score',
                'Score values are configurable per correlation search',
                'Typical ranges: Low (1-20), Medium (21-50), High (51-80), Critical (81-100)',
                'Scores can be modified by risk modifiers based on asset criticality'
            ],
            relatedFields: ['calculated_risk_score', 'risk_modifier', 'risk_object']
        },
        {
            id: 'es_risk_object',
            name: 'risk_object / risk_object_type',
            category: 'enterpriseSecurity',
            subcategory: 'rba',
            takeaway: 'The entity receiving risk attribution',
            what: 'risk_object contains the entity (username, hostname, IP) being attributed risk. risk_object_type identifies what kind of entity it is (user, system, other).',
            why: 'Risk aggregates per entity. Knowing the risk_object lets you investigate a specific user or host, while risk_object_type enables filtering to user-based vs host-based threats.',
            examples: [
                { spl: 'index=risk risk_object_type=user | stats sum(risk_score) as total by risk_object | sort -total | head 20', explanation: 'Top 20 riskiest users' },
                { spl: 'index=risk risk_object_type=system | stats sum(risk_score) as total, values(source) as detections by risk_object', explanation: 'Risky systems with detection types' },
                { spl: 'index=risk risk_object="192.168.1.100" OR risk_object="workstation01" | table _time, source, risk_score', explanation: 'Risk timeline for specific entity' }
            ],
            gotchas: [
                'risk_object_type values: user, system, other (configurable)',
                'Same entity may appear with different names (DOMAIN\\user vs user@domain)',
                'Use Asset/Identity framework to normalize entity names',
                'Multiple risk_objects can be in one event (user AND system)'
            ],
            relatedFields: ['risk_score', 'risk_message', 'orig_risk_object']
        },
        {
            id: 'es_risk_drilldown',
            name: 'Risk Investigation Patterns',
            category: 'enterpriseSecurity',
            subcategory: 'rba',
            takeaway: 'SPL patterns for investigating high-risk entities',
            what: 'Common search patterns for drilling down into why an entity has elevated risk, what events contributed, and what the timeline looks like.',
            why: 'When an entity exceeds risk threshold, you need to quickly understand what happened. These patterns accelerate investigation.',
            examples: [
                { spl: 'index=risk risk_object="$entity$" | stats count, sum(risk_score) as total by source | sort -total', explanation: 'What rules contributed to this entity\'s risk?' },
                { spl: 'index=risk risk_object="$entity$" | timechart span=1h sum(risk_score)', explanation: 'When did risk accumulate?' },
                { spl: 'index=risk risk_object="$entity$" | stats earliest(_time) as first_seen, latest(_time) as last_seen, sum(risk_score) as total by source | sort -total', explanation: 'Detection timeline per rule' },
                { spl: 'index=risk risk_object="$entity$" | table _time, source, risk_score, risk_message | sort -_time', explanation: 'Chronological risk event log' }
            ],
            gotchas: [
                'Replace $entity$ with the actual user/host you\'re investigating',
                'Look for clusters of risk events - may indicate active attack',
                'Check if multiple unrelated rules fired - higher confidence threat',
                'Use orig_event_id to pivot to original raw events'
            ]
        },
        {
            id: 'es_risk_modifiers',
            name: 'Risk Modifiers',
            category: 'enterpriseSecurity',
            subcategory: 'rba',
            takeaway: 'Adjust risk scores based on asset/identity context',
            what: 'Risk modifiers automatically adjust risk scores based on the priority of the asset or identity involved. A critical server or privileged user receives amplified risk scores.',
            why: 'Not all entities are equal. A brute force attack against an admin account is more serious than against a regular user. Risk modifiers provide this context automatically.',
            keyPoint: 'Risk modifiers multiply base scores: critical asset (4x), high (3x), medium (2x), low (1x). Check your ES configuration for exact values.',
            examples: [
                { spl: 'index=risk | eval effective_risk=risk_score*risk_modifier | stats sum(effective_risk) by risk_object', explanation: 'Calculate effective risk with modifiers' },
                { spl: '| inputlookup asset_lookup_by_str | stats count by priority', explanation: 'Review asset priority distribution' },
                { spl: 'index=risk risk_modifier>1 | stats count by risk_object, risk_modifier | sort -risk_modifier', explanation: 'Entities receiving amplified risk' }
            ],
            gotchas: [
                'risk_modifier comes from asset/identity priority field',
                'Default modifiers: critical=4, high=3, medium=2, low=1, unknown=1',
                'Modifiers are configurable in ES settings',
                'calculated_risk_score = risk_score × risk_modifier'
            ],
            relatedFields: ['risk_modifier', 'calculated_risk_score', 'priority']
        },
        // ============================================
        // Notable Events
        // ============================================
        {
            id: 'es_notable_overview',
            name: 'Notable Events',
            category: 'enterpriseSecurity',
            subcategory: 'notable',
            takeaway: 'Security alerts that require analyst investigation',
            what: 'Notable events are high-fidelity alerts generated by ES correlation searches. They represent potential security incidents that require human review and are tracked through a workflow (New → In Progress → Resolved).',
            why: 'Not every log event needs investigation, but notable events do. They\'re the output of your detection logic and feed the Incident Review dashboard for SOC workflow.',
            keyPoint: 'Notable events = actionable alerts. Risk events = contributing indicators. Both work together in modern ES.',
            examples: [
                { spl: 'index=notable | stats count by rule_name, urgency | sort -count', explanation: 'Notable volume by rule and urgency' },
                { spl: 'index=notable status=new urgency=critical | table _time, rule_name, src, dest, user', explanation: 'New critical notables' },
                { spl: 'index=notable | timechart span=1d count by rule_name limit=10', explanation: 'Notable trend by rule over time' },
                { spl: '`notable` | search status=new | stats count by security_domain', explanation: 'New notables by security domain using ES macro' }
            ],
            gotchas: [
                'Use the `notable` macro for proper field normalization',
                'Notable events have a lifecycle: new → in progress → pending → resolved/closed',
                'owner field tracks analyst assignment',
                'urgency field (informational, low, medium, high, critical) determines priority'
            ],
            relatedFields: ['rule_name', 'urgency', 'status', 'owner', 'security_domain']
        },
        {
            id: 'es_notable_index',
            name: 'Notable Index (index=notable)',
            category: 'enterpriseSecurity',
            subcategory: 'notable',
            takeaway: 'Where all security alerts are stored',
            what: 'The notable index stores all notable events created by correlation searches. Each event includes the alert details, urgency, status, and fields from the triggering events.',
            why: 'Query notable directly to build custom alert dashboards, measure detection coverage, track analyst workload, and investigate security incidents.',
            examples: [
                { spl: 'index=notable | stats count by rule_name | sort -count', explanation: 'Most frequent notable types' },
                { spl: 'index=notable earliest=-24h | stats dc(src) as unique_sources, dc(dest) as unique_targets by rule_name', explanation: 'Alert scope analysis' },
                { spl: 'index=notable status=closed | stats avg(time_to_close) as avg_ttc by rule_name', explanation: 'Average time to close by rule (requires calculated field)' },
                { spl: 'index=notable owner=* status!=closed | stats count by owner | sort -count', explanation: 'Open notables by analyst' }
            ],
            gotchas: [
                'Notable events are created by correlation searches with "Notable" adaptive response action',
                'status_group field simplifies filtering: new, open, pending, closed',
                'event_id links to the original triggering events',
                'Custom fields from correlation search are preserved in the notable'
            ],
            relatedFields: ['rule_name', 'rule_title', 'urgency', 'status', 'owner', 'security_domain', 'event_id']
        },
        {
            id: 'es_notable_fields',
            name: 'Notable Event Key Fields',
            category: 'enterpriseSecurity',
            subcategory: 'notable',
            takeaway: 'Essential fields in every notable event',
            what: 'Notable events contain standard fields for workflow management (status, owner, urgency) plus context from the triggering correlation search (rule_name, src, dest, user, etc.).',
            why: 'Understanding notable fields enables effective querying, dashboard building, and workflow automation.',
            examples: [
                { spl: 'index=notable | table _time, rule_name, urgency, status, owner, src, dest, user', explanation: 'Core notable fields' },
                { spl: 'index=notable urgency IN ("critical", "high") status_group=open | stats count by rule_name, owner', explanation: 'High-urgency open notables' },
                { spl: 'index=notable | stats earliest(_time) as created, latest(status_end_time) as resolved by rule_id | eval mttr=resolved-created', explanation: 'Calculate MTTR' }
            ],
            keyFields: [
                { field: 'rule_name', description: 'Name of the correlation search that created this notable' },
                { field: 'urgency', description: 'Priority level: informational, low, medium, high, critical' },
                { field: 'status', description: 'Workflow state: new, in progress, pending, resolved, closed' },
                { field: 'owner', description: 'Analyst assigned to investigate' },
                { field: 'security_domain', description: 'Category: access, endpoint, network, threat, identity, audit' },
                { field: 'src / dest / user', description: 'Key entities from triggering events' },
                { field: 'drilldown_search', description: 'SPL to find original raw events' }
            ],
            gotchas: [
                'status_group simplifies queries: "open" includes new and in progress',
                'orig_time may differ from _time if notable was created asynchronously',
                'drilldown_search helps pivot to raw events for investigation'
            ]
        },
        {
            id: 'es_notable_workflow',
            name: 'Notable Workflow Queries',
            category: 'enterpriseSecurity',
            subcategory: 'notable',
            takeaway: 'SPL for managing and measuring SOC workflow',
            what: 'Queries to track notable event status, measure analyst performance, identify backlog, and monitor detection effectiveness.',
            why: 'SOC managers need visibility into alert volume, response times, and analyst workload. These patterns power operational dashboards.',
            examples: [
                { spl: 'index=notable | stats count as total, count(eval(status_group="open")) as open, count(eval(status_group="closed")) as closed by rule_name', explanation: 'Notable status breakdown by rule' },
                { spl: 'index=notable status_group=open | stats count by owner | sort -count', explanation: 'Open notable backlog by analyst' },
                { spl: 'index=notable status=closed | eval ttc=status_end_time-orig_time | stats avg(ttc) as avg_seconds by urgency | eval avg_hours=round(avg_seconds/3600,1)', explanation: 'Average time-to-close by urgency' },
                { spl: 'index=notable | bucket _time span=1d | stats count by _time, status_group | xyseries _time status_group count', explanation: 'Daily notable volume by status' }
            ],
            gotchas: [
                'status_end_time updates when status changes - track workflow timing',
                'Unassigned notables (owner=unassigned) indicate process gaps',
                'High "pending" count may indicate waiting on external teams',
                'Compare new vs closed rates to identify growing backlog'
            ]
        },
        // ============================================
        // Asset and Identity Framework
        // ============================================
        {
            id: 'es_asset_overview',
            name: 'Asset & Identity Framework',
            category: 'enterpriseSecurity',
            subcategory: 'assetIdentity',
            takeaway: 'Enrich events with business context about users and systems',
            what: 'The Asset & Identity Framework maintains lookup tables of known users (identities) and systems (assets) with metadata like department, business unit, criticality, and owner. ES automatically enriches events with this context.',
            why: 'A login from "jsmith" means little. A login from "John Smith, Domain Admin, Finance Department" on a "Critical - PCI Server" tells a story. Asset/Identity context enables prioritization.',
            keyPoint: 'Events without context are just noise. Asset/Identity framework transforms raw logs into business-relevant security information.',
            examples: [
                { spl: '| inputlookup asset_lookup_by_str | stats count by bunit, category, priority', explanation: 'Asset inventory summary' },
                { spl: '| inputlookup identity_lookup_expanded | search category="privileged" | table identity, email, managedBy, category', explanation: 'Privileged user list' },
                { spl: 'index=notable | lookup asset_lookup_by_str ip as dest OUTPUT priority, category, owner | where priority="critical"', explanation: 'Notable events on critical assets' },
                { spl: 'index=auth | lookup identity_lookup_expanded identity as user OUTPUT bunit, category | stats count by bunit, category', explanation: 'Auth events enriched with user business unit' }
            ],
            gotchas: [
                'Asset data sources: AD, CMDB, vulnerability scanners, cloud APIs',
                'Identity data sources: AD, HR systems, IAM platforms',
                'Regular updates are critical - stale data = wrong enrichment',
                'priority field enables risk modifiers (critical asset = higher risk)'
            ],
            relatedCommands: ['inputlookup', 'lookup', 'outputlookup']
        },
        {
            id: 'es_asset_lookup',
            name: 'Asset Lookups',
            category: 'enterpriseSecurity',
            subcategory: 'assetIdentity',
            takeaway: 'Enrich events with system/device context',
            what: 'ES provides asset lookups that map IP addresses, hostnames, and MAC addresses to asset metadata like owner, business unit, location, priority, and category.',
            why: 'Know what systems are involved in an alert. "External connection to 10.1.2.3" becomes "External connection to PROD-DB-01 (Critical, Finance, PCI-DSS scope)".',
            examples: [
                { spl: '| inputlookup asset_lookup_by_str | head 10', explanation: 'View asset lookup contents' },
                { spl: 'index=firewall action=blocked | lookup asset_lookup_by_str ip as src_ip OUTPUT dns, owner, priority | where priority="critical"', explanation: 'Blocked connections from critical assets' },
                { spl: '| inputlookup asset_lookup_by_cidr | where cidrmatch(ip, "10.1.0.0/16")', explanation: 'Assets in a subnet via CIDR lookup' },
                { spl: 'index=vuln | lookup asset_lookup_by_str ip as dest OUTPUT category, bunit | stats count by category, bunit', explanation: 'Vulnerability counts by asset category and business unit' }
            ],
            keyFields: [
                { field: 'ip', description: 'IP address (primary key for asset_lookup_by_str)' },
                { field: 'dns', description: 'Hostname/FQDN' },
                { field: 'owner', description: 'Responsible person or team' },
                { field: 'priority', description: 'Criticality: critical, high, medium, low, unknown' },
                { field: 'category', description: 'Type: server, workstation, network, database, etc.' },
                { field: 'bunit', description: 'Business unit' },
                { field: 'pci_domain', description: 'PCI compliance scope (true/false or zone)' }
            ],
            gotchas: [
                'asset_lookup_by_str for exact IP/hostname match',
                'asset_lookup_by_cidr for subnet-based matching',
                'Keep assets updated via scripted inputs from CMDB/AD',
                'Unknown assets (no match) should trigger asset discovery process'
            ]
        },
        {
            id: 'es_identity_lookup',
            name: 'Identity Lookups',
            category: 'enterpriseSecurity',
            subcategory: 'assetIdentity',
            takeaway: 'Enrich events with user context',
            what: 'ES identity lookups map usernames, email addresses, and other identifiers to user metadata like full name, department, manager, and privilege category.',
            why: 'Transform "user=jsmith" into actionable context: "John Smith, VP Finance, reports to CFO, Domain Admin privileges, high-risk travel last week".',
            examples: [
                { spl: '| inputlookup identity_lookup_expanded | head 10', explanation: 'View identity lookup contents' },
                { spl: 'index=auth action=failure | lookup identity_lookup_expanded identity as user OUTPUT email, managedBy, category | where category="privileged"', explanation: 'Failed logins by privileged users' },
                { spl: '| inputlookup identity_lookup_expanded | search category="executive" | table identity, first, last, email, managedBy', explanation: 'List executive users' },
                { spl: 'index=notable | lookup identity_lookup_expanded identity as user OUTPUT bunit, category, priority | stats count by bunit, category', explanation: 'Notables by user business unit and category' }
            ],
            keyFields: [
                { field: 'identity', description: 'Username (primary key, may be multivalued for aliases)' },
                { field: 'first / last', description: 'First and last name' },
                { field: 'email', description: 'Email address' },
                { field: 'managedBy', description: 'Manager\'s identity' },
                { field: 'bunit', description: 'Business unit / department' },
                { field: 'category', description: 'User type: normal, privileged, executive, service, etc.' },
                { field: 'priority', description: 'User criticality for risk scoring' },
                { field: 'watchlist', description: 'Boolean for users under enhanced monitoring' }
            ],
            gotchas: [
                'identity field may contain multiple values (username, email, UPN)',
                'category="privileged" identifies admin accounts',
                'watchlist field enables enhanced monitoring without separate logic',
                'Sync from AD/HR regularly to catch new users and terminations'
            ]
        },
        {
            id: 'es_asset_identity_enrichment',
            name: 'Enrichment Patterns',
            category: 'enterpriseSecurity',
            subcategory: 'assetIdentity',
            takeaway: 'SPL patterns for adding asset/identity context to events',
            what: 'Common lookup patterns to enrich raw events and notables with business context from the Asset & Identity framework.',
            why: 'Every SOC search benefits from enrichment. Know who and what is involved, not just IPs and usernames.',
            examples: [
                { spl: 'index=auth | lookup identity_lookup_expanded identity as user OUTPUT first, last, bunit, category | where category="privileged"', explanation: 'Enrich auth events with user details' },
                { spl: 'index=firewall | lookup asset_lookup_by_str ip as src_ip OUTPUTNEW src_owner, src_priority, src_category | lookup asset_lookup_by_str ip as dest_ip OUTPUTNEW dest_owner, dest_priority, dest_category', explanation: 'Enrich source and destination' },
                { spl: 'index=notable | lookup identity_lookup_expanded identity as user OUTPUTNEW user_category, user_bunit | lookup asset_lookup_by_str ip as dest OUTPUTNEW dest_priority, dest_owner', explanation: 'Fully enrich notables' },
                { spl: '`notable` | `get_asset(dest)` | `get_identity4events(user)`', explanation: 'Use ES macros for standard enrichment' }
            ],
            gotchas: [
                'OUTPUTNEW prevents overwriting existing fields',
                'Multiple lookups can chain (user + src + dest enrichment)',
                'ES macros like `get_asset()` and `get_identity4events()` handle edge cases',
                'Missing enrichment (null) indicates unknown asset/identity - valuable signal itself'
            ],
            relatedCommands: ['lookup', 'inputlookup']
        },
        // ============================================
        // Threat Intelligence
        // ============================================
        {
            id: 'es_threat_intel',
            name: 'Threat Intelligence Framework',
            category: 'enterpriseSecurity',
            subcategory: 'threatIntel',
            takeaway: 'Match events against known bad indicators (IOCs)',
            what: 'ES Threat Intelligence Framework ingests IOCs (IPs, domains, hashes, URLs) from feeds and automatically correlates them with your events via lookup-based matching.',
            why: 'Know when your network touches known malicious infrastructure. Threat intel transforms raw events into threat detections.',
            examples: [
                { spl: '| inputlookup ip_intel | stats count by threat_collection', explanation: 'View IP threat intel by source feed' },
                { spl: 'index=firewall | lookup ip_intel ip as dest_ip OUTPUTNEW threat_key, threat_collection | where isnotnull(threat_key)', explanation: 'Find firewall connections to known bad IPs' },
                { spl: '| inputlookup domain_intel | search threat_collection="*abuse*" | table domain, description, threat_collection', explanation: 'Browse domain intel from abuse feeds' },
                { spl: 'index=proxy | lookup domain_intel domain as url_domain OUTPUT threat_key | where isnotnull(threat_key) | stats count by url_domain, threat_key', explanation: 'Proxy hits on threat domains' }
            ],
            gotchas: [
                'Intel types: ip_intel, domain_intel, file_intel, http_intel, email_intel, etc.',
                'threat_key links to the original intel entry for context',
                'threat_collection identifies the feed source',
                'Threat intel requires regular updates - stale intel misses new threats'
            ],
            relatedLookups: ['ip_intel', 'domain_intel', 'file_intel', 'http_intel', 'email_intel', 'certificate_intel']
        },
        {
            id: 'es_threat_lookups',
            name: 'Threat Intel Lookups',
            category: 'enterpriseSecurity',
            subcategory: 'threatIntel',
            takeaway: 'Lookup tables containing IOCs by type',
            what: 'ES stores threat intel in type-specific lookups: ip_intel for IPs, domain_intel for domains, file_intel for hashes, etc. Each lookup contains the IOC, description, and source feed.',
            why: 'Query threat intel lookups directly to investigate IOCs, check coverage, or build custom threat matching logic.',
            examples: [
                { spl: '| inputlookup ip_intel | search ip="192.168.*" | table ip, description, threat_collection', explanation: 'Search for specific IP in threat intel' },
                { spl: '| inputlookup file_intel | stats count by threat_collection', explanation: 'File hash intel by feed' },
                { spl: '| inputlookup domain_intel | where match(domain, ".*\\.ru$") | table domain, description', explanation: 'Russian domains in threat intel' },
                { spl: '| inputlookup ip_intel | stats dc(ip) as unique_ips by threat_collection | sort -unique_ips', explanation: 'Intel coverage by feed' }
            ],
            keyFields: [
                { field: 'ip / domain / file_hash', description: 'The IOC value (varies by lookup type)' },
                { field: 'description', description: 'Context about the threat' },
                { field: 'threat_collection', description: 'Source feed name' },
                { field: 'threat_key', description: 'Unique identifier for this IOC entry' },
                { field: 'weight', description: 'Confidence/severity score' }
            ],
            gotchas: [
                'Use threat_collection to understand feed sources',
                'weight field indicates confidence - higher is more reliable',
                'time_added/time_updated help identify stale intel',
                'Threat intel audit: | inputlookup ip_intel | stats min(time_added), max(time_updated), count by threat_collection'
            ]
        },
        {
            id: 'es_threat_match',
            name: 'Threat Matching Patterns',
            category: 'enterpriseSecurity',
            subcategory: 'threatIntel',
            takeaway: 'SPL patterns to correlate events with threat intel',
            what: 'Search patterns to find events matching threat intel IOCs, using lookups or the Threat Activity data model.',
            why: 'Proactively hunt for threat intel matches beyond automated correlation searches.',
            examples: [
                { spl: 'index=firewall | lookup ip_intel ip as dest_ip OUTPUTNEW threat_key, description | where isnotnull(threat_key) | stats count by dest_ip, description', explanation: 'Firewall hits on threat IPs' },
                { spl: 'index=proxy | eval domain=lower(url_domain) | lookup domain_intel domain OUTPUTNEW threat_key | search threat_key=* | table _time, src_ip, url, threat_key', explanation: 'Proxy connections to threat domains' },
                { spl: 'index=endpoint | lookup file_intel file_hash as sha256 OUTPUTNEW threat_key, description | where isnotnull(threat_key)', explanation: 'Endpoint file hash matches' },
                { spl: '| tstats count from datamodel=Threat_Activity by Threat_Activity.threat_match_field, Threat_Activity.threat_collection', explanation: 'Threat matches via data model' }
            ],
            gotchas: [
                'Normalize fields before lookup (lowercase domains, consistent IP format)',
                'OUTPUTNEW prevents overwriting if field exists',
                'isnotnull(threat_key) confirms match',
                'Combine with asset/identity enrichment for full context'
            ]
        },
        // ============================================
        // ES Data Models
        // ============================================
        {
            id: 'es_datamodels',
            name: 'ES Data Models Overview',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Accelerated, normalized data for fast ES searches',
            what: 'ES ships with data models that normalize events into standard schemas and accelerate them for fast searching. These power ES dashboards, correlation searches, and the tstats command.',
            why: 'Data models enable fast, vendor-agnostic searches. Query "Authentication failures" without knowing if it\'s Windows EventCode 4625, Linux auth.log, or cloud provider logs.',
            keyPoint: 'Use tstats with ES data models for fastest queries. Full event searches (index=) for detailed investigation.',
            examples: [
                { spl: '| tstats count from datamodel=Authentication where Authentication.action=failure by Authentication.user', explanation: 'Failed logins via data model (fast)' },
                { spl: '| datamodel Network_Traffic All_Traffic search | head 100', explanation: 'Sample network traffic data model events' },
                { spl: '| tstats summariesonly=true count from datamodel=Endpoint.Processes by Processes.process_name | sort -count', explanation: 'Process execution counts (accelerated only)' },
                { spl: '| tstats count from datamodel=Risk.All_Risk by All_Risk.risk_object | sort -count', explanation: 'Risk events by entity' }
            ],
            dataModels: [
                { name: 'Authentication', description: 'Logins, logoffs, authentication failures' },
                { name: 'Network_Traffic', description: 'Firewall, netflow, connection data' },
                { name: 'Endpoint', description: 'Processes, services, filesystem, registry' },
                { name: 'Web', description: 'Proxy, web server access logs' },
                { name: 'Email', description: 'Email gateway, mail server logs' },
                { name: 'Risk', description: 'Risk events from RBA' },
                { name: 'Threat_Activity', description: 'Threat intel matches' }
            ],
            gotchas: [
                'summariesonly=true uses only accelerated data (faster, may miss recent events)',
                'summariesonly=false includes non-accelerated events (complete, slower)',
                'Check acceleration status in Settings > Data Models, or via REST: | rest /servicesNS/-/-/admin/datamodel-acceleration',
                'Data model field names use hierarchy: Authentication.user, not just user'
            ],
            relatedCommands: ['tstats', 'datamodel', 'from']
        },
        {
            id: 'es_tstats_patterns',
            name: 'tstats Patterns for ES',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Fast aggregate queries against ES data models',
            what: 'tstats queries accelerated data models without scanning raw events. Essential for ES dashboards and correlation searches that need to process large volumes quickly.',
            why: 'A stats query over 30 days of auth logs might take 10 minutes. The same tstats query against the Authentication data model takes seconds.',
            examples: [
                { spl: '| tstats count from datamodel=Authentication where Authentication.action=failure by Authentication.user, Authentication.src | where count>10', explanation: 'Users with 10+ failures by source' },
                { spl: '| tstats sum(All_Traffic.bytes) as bytes from datamodel=Network_Traffic by All_Traffic.src_ip, All_Traffic.dest_ip | sort -bytes', explanation: 'Top talkers by bytes' },
                { spl: '| tstats prestats=true count from datamodel=Authentication by _time, Authentication.action span=1h | timechart span=1h count by Authentication.action', explanation: 'Auth success/failure over time' },
                { spl: '| tstats dc(Authentication.src) as unique_sources from datamodel=Authentication where Authentication.action=failure by Authentication.user | where unique_sources>5', explanation: 'Users failing from many sources (credential stuffing)' }
            ],
            gotchas: [
                'Always specify from datamodel=ModelName and full field paths',
                'prestats=true required before timechart/chart',
                'where clause filters accelerated data efficiently',
                'dc() for distinct count, sum(), count(), avg(), min(), max() all work'
            ],
            relatedCommands: ['tstats', 'datamodel', 'timechart']
        },
        // ============================================
        // ES Macros
        // ============================================
        {
            id: 'es_macros',
            name: 'Common ES Macros',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Pre-built search snippets for ES workflows',
            what: 'ES includes many macros that encapsulate common search patterns, enrichment, and formatting. Using macros ensures consistency and benefits from ES updates.',
            why: 'Instead of writing complex enrichment logic, use ES macros. They handle edge cases and stay updated with ES versions.',
            examples: [
                { spl: '`notable` | search status=new', explanation: 'Query notables with proper normalization' },
                { spl: '`notable` | `get_asset(dest)` | `get_identity4events(user)`', explanation: 'Notable with asset/identity enrichment' },
                { spl: '| from datamodel:Risk | `get_risk_severity(risk_score)`', explanation: 'Add severity label to risk scores' },
                { spl: '| rest /servicesNS/-/-/admin/macros | search title="notable" | table title, definition', explanation: 'View macro definition via REST' }
            ],
            commonMacros: [
                { macro: '`notable`', description: 'Search notable index with field normalization' },
                { macro: '`get_asset(field)`', description: 'Enrich field with asset lookup data' },
                { macro: '`get_identity4events(field)`', description: 'Enrich field with identity lookup data' },
                { macro: '`get_risk_severity(score)`', description: 'Convert risk score to severity label' },
                { macro: '`risk_index`', description: 'Returns configured risk index name' },
                { macro: '`cim_normalize_*`', description: 'Various CIM field normalization macros' }
            ],
            gotchas: [
                'View macro definition via REST: | rest /servicesNS/-/-/admin/macros | search title="macro_name"',
                'Or check via Splunk Web: Settings > Advanced Search > Search Macros',
                'Macros can have arguments: `macro(arg1, arg2)`',
                'Custom macros should not conflict with ES macro names'
            ]
        },
        // ============================================
        // Correlation Searches
        // ============================================
        {
            id: 'es_correlation',
            name: 'Correlation Searches',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Scheduled searches that detect threats and create alerts',
            what: 'Correlation searches are scheduled SPL queries that detect suspicious patterns and trigger adaptive response actions (create notable, attribute risk, send email, etc.).',
            why: 'Correlation searches are your detection logic. They define what ES considers a security threat and what actions to take.',
            keyPoint: 'Modern ES: Most correlations should create risk events. Only high-fidelity detections should create notables directly.',
            examples: [
                { spl: '| tstats count from datamodel=Authentication where Authentication.action=failure by Authentication.user | where count>10', explanation: 'Simple brute force detection (add adaptive response in ES UI)' },
                { spl: '| tstats summariesonly=true count from datamodel=Authentication where Authentication.action=failure by Authentication.user, Authentication.src | where count>5', explanation: 'Brute force pattern for RBA (configure risk action in ES)' },
                { spl: 'index=firewall | lookup ip_intel ip as dest_ip OUTPUT threat_key | where isnotnull(threat_key) | table _time, src_ip, dest_ip, threat_key', explanation: 'Threat intel match detection base search' }
            ],
            gotchas: [
                'Correlation searches run on schedule (not real-time) - tune frequency',
                'Use throttling to prevent duplicate notables for ongoing attacks',
                'Test searches manually before enabling as correlations',
                'RBA approach: attribute risk in correlation, create notables from risk aggregation'
            ],
            relatedCommands: ['tstats', '`create_notable`', '`risk_score`']
        },
        {
            id: 'es_adaptive_response',
            name: 'Adaptive Response Actions',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Automated actions triggered by correlation searches',
            what: 'Adaptive Response Actions are automated responses triggered by correlation searches: create notable, submit to risk index, send email, run script, quarantine host, etc.',
            why: 'Automate response to detected threats. From simple alerting to active containment, adaptive responses extend detection into action.',
            examples: [
                { spl: '... | sendalert notable param.rule_title="Suspicious Activity" param.urgency="high"', explanation: 'Create notable via adaptive response' },
                { spl: '... | sendalert risk param.risk_score="50" param.risk_object_field="user" param.risk_object_type="user"', explanation: 'Attribute risk via adaptive response' },
                { spl: '... | sendalert email param.to="soc@company.com" param.subject="Critical Alert"', explanation: 'Send email alert' }
            ],
            actionTypes: [
                { action: 'notable', description: 'Create notable event for analyst investigation' },
                { action: 'risk', description: 'Attribute risk to entities (RBA)' },
                { action: 'email', description: 'Send email notification' },
                { action: 'script', description: 'Run custom script for remediation' },
                { action: 'webhook', description: 'Call external API (SOAR, ticketing)' }
            ],
            gotchas: [
                'Notable and risk are the most common actions',
                'External actions (script, webhook) require configuration in ES',
                'Actions run sequentially - complex actions add latency',
                'Test adaptive responses in dev before production deployment'
            ]
        },
        {
            id: 'es_suppression_throttling',
            name: 'Suppression & Throttling',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Prevent duplicate alerts for ongoing activity',
            what: 'Suppression prevents creating duplicate notables for the same condition within a time window. Throttling limits how often a correlation search can fire alerts.',
            why: 'Without suppression, a 10-minute brute force attack creates hundreds of notables. With proper suppression, you get one alert that can be updated as the attack continues.',
            keyPoint: 'Suppress by key fields (user, src, dest) + time window. One notable per unique combination per window.',
            examples: [
                { spl: 'index=notable | stats count by rule_name | where count>100 | sort -count', explanation: 'Find rules generating excessive notables (need suppression)' },
                { spl: 'index=notable rule_name="Brute Force" | stats count by user, src | where count>5', explanation: 'Check if suppression is working - should be 1 per user/src' },
                { spl: 'index=notable | timechart span=1h count by rule_name limit=10', explanation: 'Visualize notable frequency - spikes indicate suppression issues' }
            ],
            suppressionFields: [
                { scenario: 'Brute force', fields: 'user, src', window: '1 hour' },
                { scenario: 'Malware detected', fields: 'dest, file_hash', window: '24 hours' },
                { scenario: 'Lateral movement', fields: 'src, dest', window: '1 hour' },
                { scenario: 'Data exfiltration', fields: 'src, dest_ip', window: '4 hours' }
            ],
            gotchas: [
                'Configure suppression in correlation search settings, not in SPL',
                'Suppression fields should match the key entities in your detection',
                'Too short window = duplicate alerts; too long = missed new attacks',
                'Use aggregation (stats count) in the search itself to reduce result volume'
            ]
        },
        // ============================================
        // ES Investigation Patterns
        // ============================================
        {
            id: 'es_investigation_user',
            name: 'User Investigation Queries',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'SPL patterns for investigating a suspicious user',
            what: 'Common queries to investigate a user: authentication activity, risk history, notable involvement, and endpoint actions.',
            why: 'When a user trips alerts or has high risk, these queries help you quickly understand their activity and determine if it\'s malicious.',
            examples: [
                { spl: '| tstats count from datamodel=Authentication where Authentication.user="$user$" by Authentication.action, Authentication.src, Authentication.dest | sort -count', explanation: 'User auth summary across all sources' },
                { spl: 'index=risk risk_object="$user$" | stats sum(risk_score) as total, values(source) as detections by risk_object | sort -total', explanation: 'User risk with contributing rules' },
                { spl: 'index=notable user="$user$" OR src_user="$user$" | table _time, rule_name, urgency, status | sort -_time', explanation: 'Notables involving this user' },
                { spl: '| tstats count from datamodel=Endpoint.Processes where Processes.user="$user$" by Processes.process_name, Processes.dest | sort -count', explanation: 'Processes run by this user' },
                { spl: '| inputlookup identity_lookup_expanded | search identity="$user$" | table identity, first, last, email, bunit, category, managedBy, priority', explanation: 'User identity details' }
            ],
            gotchas: [
                'Replace $user$ with actual username',
                'User formats may vary: jsmith, DOMAIN\\jsmith, jsmith@company.com',
                'Use identity lookup to find all aliases for a user',
                'Correlate across data models for complete picture'
            ]
        },
        {
            id: 'es_investigation_host',
            name: 'Host Investigation Queries',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'SPL patterns for investigating a suspicious host',
            what: 'Common queries to investigate a host: network traffic, endpoint activity, risk history, and threat intel matches.',
            why: 'When a system is compromised or suspected, these queries reveal its activity profile and help scope the incident.',
            examples: [
                { spl: '| tstats count from datamodel=Network_Traffic where All_Traffic.src_ip="$ip$" OR All_Traffic.dest_ip="$ip$" by All_Traffic.src_ip, All_Traffic.dest_ip, All_Traffic.dest_port | sort -count', explanation: 'Network connections to/from host' },
                { spl: 'index=risk risk_object="$host$" OR risk_object="$ip$" | timechart span=1h sum(risk_score)', explanation: 'Risk over time for this host' },
                { spl: '| tstats count from datamodel=Endpoint.Processes where Processes.dest="$host$" by Processes.process_name, Processes.user | sort -count', explanation: 'Processes running on host' },
                { spl: 'index=firewall (src_ip="$ip$" OR dest_ip="$ip$") | lookup ip_intel ip as dest_ip OUTPUTNEW threat_key | where isnotnull(threat_key) | table _time, src_ip, dest_ip, dest_port, threat_key', explanation: 'Threat intel matches for host traffic' },
                { spl: '| inputlookup asset_lookup_by_str | search ip="$ip$" | table ip, dns, owner, priority, category, bunit, pci_domain', explanation: 'Asset details for this host' }
            ],
            gotchas: [
                'Replace $host$ and $ip$ with actual values',
                'Host may have multiple IPs, IP may have multiple hostnames',
                'Use asset lookup to find all identifiers for a system',
                'Check both src and dest - compromised hosts often beacon out'
            ]
        },
        {
            id: 'es_investigation_notable',
            name: 'Notable Investigation Workflow',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Step-by-step notable event investigation',
            what: 'A systematic approach to investigating notable events: understand the alert, gather context, check history, and determine disposition.',
            why: 'Consistent investigation methodology ensures thorough analysis and proper documentation.',
            examples: [
                { spl: 'index=notable event_id="$event_id$" | table _time, rule_name, rule_description, urgency, src, dest, user, drilldown_search', explanation: 'Step 1: Understand the alert' },
                { spl: 'index=notable event_id="$event_id$" | `get_asset(dest)` | `get_identity4events(user)` | table dest_priority, dest_owner, user_category, user_bunit', explanation: 'Step 2: Get asset/identity context' },
                { spl: 'index=notable rule_name="$rule_name$" (user="$user$" OR src="$src$" OR dest="$dest$") | stats count, earliest(_time) as first_seen, latest(_time) as last_seen', explanation: 'Step 3: Check for related notables' },
                { spl: 'index=risk (risk_object="$user$" OR risk_object="$dest$") | stats sum(risk_score) as total, values(source) as detections', explanation: 'Step 4: Check risk profile' }
            ],
            workflow: [
                { step: '1', description: 'Read alert details and understand what triggered it' },
                { step: '2', description: 'Enrich with asset/identity context - who and what is involved?' },
                { step: '3', description: 'Check for related alerts - is this part of a pattern?' },
                { step: '4', description: 'Review risk profile - what other suspicious activity?' },
                { step: '5', description: 'Drill down to raw events using drilldown_search' },
                { step: '6', description: 'Document findings and set disposition' }
            ],
            gotchas: [
                'drilldown_search field contains SPL to find original events',
                'Document investigation steps in notable comments',
                'Escalate to incident if confirmed malicious',
                'Close as false positive with justification for tuning'
            ]
        },
        // ============================================
        // MITRE ATT&CK
        // ============================================
        {
            id: 'es_mitre_attack',
            name: 'MITRE ATT&CK in ES',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Map detections to adversary techniques',
            what: 'ES can map correlation searches to MITRE ATT&CK tactics and techniques, enabling coverage analysis and threat-informed detection.',
            why: 'MITRE ATT&CK provides a common language for threats. Mapping detections helps identify gaps and prioritize development.',
            examples: [
                { spl: 'index=notable | stats count by mitre_attack_tactic, mitre_attack_technique | sort -count', explanation: 'Notable distribution by MITRE technique' },
                { spl: '| rest /servicesNS/-/-/saved/searches | search action.correlationsearch.annotations.mitre_attack=* | table title, action.correlationsearch.annotations.mitre_attack', explanation: 'Correlation searches with MITRE mappings' },
                { spl: 'index=notable mitre_attack_technique="T1059*" | stats count by rule_name, mitre_attack_technique', explanation: 'Notables for Command and Scripting Interpreter (T1059)' },
                { spl: 'index=risk | stats sum(risk_score) as risk, dc(source) as detections by mitre_attack_tactic | sort -risk', explanation: 'Risk by MITRE tactic' }
            ],
            gotchas: [
                'mitre_attack_tactic: High-level category (Initial Access, Execution, etc.)',
                'mitre_attack_technique: Specific technique (T1059, T1078, etc.)',
                'MITRE annotations are set in correlation search configuration',
                'Use ESCU (Splunk ES Content Updates) for pre-mapped detections'
            ],
            relatedFields: ['mitre_attack_tactic', 'mitre_attack_technique', 'mitre_attack_id']
        },
        // ============================================
        // ES Content Updates (ESCU)
        // ============================================
        {
            id: 'es_escu',
            name: 'ES Content Updates (ESCU)',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Pre-built detection content from Splunk Threat Research',
            what: 'ESCU (Enterprise Security Content Updates) is a regularly updated package of correlation searches, investigation dashboards, and response playbooks from Splunk\'s Threat Research team.',
            why: 'Don\'t build every detection from scratch. ESCU provides hundreds of tested detections mapped to MITRE ATT&CK and updated for emerging threats.',
            examples: [
                { spl: '| rest /servicesNS/-/-/saved/searches | search eai:appName="*ES Content*" | stats count by eai:appName', explanation: 'Count ESCU content' },
                { spl: '| rest /servicesNS/-/-/saved/searches | search action.correlationsearch=1 | stats count by action.correlationsearch.annotations.mitre_attack', explanation: 'ESCU detections by MITRE technique' },
                { spl: 'index=notable rule_name="*ESCU*" OR rule_name="*Splunk*" | stats count by rule_name | sort -count', explanation: 'Notables from ESCU detections' }
            ],
            gotchas: [
                'ESCU requires separate installation and updates',
                'Review detections before enabling - some may be noisy in your environment',
                'Customize thresholds and filters for your data',
                'ESCU includes analytic stories grouping related detections'
            ]
        },
        // ============================================
        // ES Administration & Deployment
        // ============================================
        {
            id: 'es_deployment_architecture',
            name: 'ES Deployment Architecture',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Distributed vs standalone ES deployment patterns',
            what: 'ES can be deployed standalone (single search head) or distributed (search head cluster). Architecture choice affects performance, redundancy, and operational complexity.',
            why: 'Proper architecture ensures ES scales with your data volume and analyst count. Wrong choice leads to performance issues, failed searches, or single points of failure.',
            keyPoint: 'Most production environments use distributed deployment with search head clustering for high availability and load distribution.',
            examples: [
                { spl: '| rest /services/server/info | table splunk_server, server_roles, version', explanation: 'Check server roles and version' },
                { spl: '| rest /services/shcluster/captain/info | table label, rolling_restart_flag, service_ready_flag', explanation: 'Check SHC captain status' },
                { spl: '| rest /services/search/distributed/peers | table peerName, status, searchable', explanation: 'View distributed search peers' }
            ],
            gotchas: [
                'ES requires at least 16GB RAM per search head in production',
                'Search head clustering requires minimum 3 members for quorum',
                'Data model acceleration storage grows significantly - plan disk space',
                'ES Premium app must be deployed identically across all SHC members'
            ]
        },
        {
            id: 'es_health_monitoring',
            name: 'ES Health Monitoring',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Monitor ES health via REST endpoints and internal logs',
            what: 'ES health monitoring involves checking correlation search execution, data model acceleration status, notable event generation, and system resource utilization through REST APIs and internal logs.',
            why: 'Proactive health monitoring catches silent failures - correlation searches that stop running, data models that fall behind, or memory exhaustion - before they impact security operations.',
            examples: [
                { spl: 'index=_internal sourcetype=scheduler savedsearch_name="*" status=* | stats count by status, savedsearch_name | where status!="success"', explanation: 'Find failing scheduled searches' },
                { spl: '| rest /services/admin/summarization | search eai:acl.app="*ES*" | table datamodel_name, summary.complete, summary.last_error', explanation: 'Check data model acceleration status' },
                { spl: 'index=_internal sourcetype=splunkd component=SearchScheduler log_level=ERROR | table _time, message', explanation: 'Find scheduler errors' },
                { spl: '| rest /services/server/status/resource-usage/splunk-processes | where search_props.provenance="scheduler" | table pid, elapsed, mem_used', explanation: 'Monitor scheduled search resource usage' }
            ],
            gotchas: [
                'Check _internal index for scheduler failures daily',
                'Data model acceleration "complete" percentage should be >95%',
                'Monitor correlation search runtime - searches timing out miss events',
                'Set up alerts for ES component failures in the monitoring console'
            ],
            relatedCommands: ['rest', 'internal index', 'scheduler']
        },
        {
            id: 'es_rbac',
            name: 'ES Role-Based Access Control',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Control ES access with ess_admin, ess_analyst, ess_user roles',
            what: 'ES includes predefined roles (ess_admin, ess_analyst, ess_user) that control access to features, dashboards, and data. Custom roles can be created inheriting from these base roles.',
            why: 'Proper RBAC ensures analysts see only relevant notables, admins can modify configuration, and users have read-only access. Misconfigured roles expose sensitive data or break workflows.',
            keyPoint: 'ess_admin can modify correlation searches, ess_analyst can work notables, ess_user can view dashboards read-only.',
            examples: [
                { spl: '| rest /services/authorization/roles | search title="ess_*" | table title, imported_roles, capabilities', explanation: 'View ES role configurations' },
                { spl: '| rest /services/authentication/users | table title, roles | search roles="*ess*"', explanation: 'Users with ES roles' },
                { spl: 'index=_audit action=login user=* info=succeeded | stats count by user | lookup user_role_lookup user OUTPUT roles | where match(roles, "ess")', explanation: 'ES user login activity' }
            ],
            gotchas: [
                'ess_analyst needs index access to risk and notable indexes',
                'Custom roles should inherit from ess_* roles, not duplicate permissions',
                'Test role changes in dev before applying to production',
                'Document custom role modifications for audit compliance'
            ],
            keyFields: [
                { field: 'ess_admin', description: 'Full ES administration including correlation search editing' },
                { field: 'ess_analyst', description: 'SOC analyst workflow - investigate and manage notables' },
                { field: 'ess_user', description: 'Read-only dashboard and report access' }
            ]
        },
        {
            id: 'es_capacity_planning',
            name: 'ES Capacity Planning',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Size ES based on indexing volume and concurrent users',
            what: 'ES capacity planning involves sizing search heads (CPU, RAM), estimating data model acceleration storage, planning for concurrent analysts, and accounting for correlation search overhead.',
            why: 'Under-provisioned ES deployments suffer from slow searches, failed accelerations, and analyst frustration. Over-provisioning wastes resources.',
            examples: [
                { spl: '| tstats count where index=* by index | stats sum(count) as total_events', explanation: 'Estimate event volume for sizing' },
                { spl: '| rest /services/admin/summarization | stats sum(summary.size) as total_accel_size', explanation: 'Current acceleration storage usage' },
                { spl: 'index=_internal sourcetype=splunkd component=Metrics group=search_concurrency | timechart max(active_searches)', explanation: 'Peak concurrent search load' },
                { spl: '| rest /services/server/status/resource-usage/hostwide | table cpu_system_pct, mem_used, splunk_version', explanation: 'Current resource utilization' }
            ],
            gotchas: [
                'Plan for 2-3x current load to accommodate growth',
                'Data model acceleration can consume 5-15% of raw data size',
                'Each concurrent analyst adds ~2GB RAM requirement',
                'Correlation searches running every 5 minutes need fast indexers'
            ]
        },
        {
            id: 'es_config_files',
            name: 'ES Configuration Files',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Manage ES configs in local vs default directories',
            what: 'ES configuration lives in $SPLUNK_HOME/etc/apps/SplunkEnterpriseSecuritySuite/ with default (vendor) and local (customizations) directories. Understanding the precedence and migration process is critical for upgrades.',
            why: 'Proper configuration management ensures customizations survive upgrades, allows version control of changes, and prevents accidental overwrites of production settings.',
            keyPoint: 'Never edit files in default/ - always copy to local/ and modify there. Changes in local/ override default/ and persist through upgrades.',
            examples: [
                { spl: '| rest /servicesNS/-/-/configs/conf-savedsearches | search eai:acl.app="*ES*" | table title, eai:acl.owner, updated', explanation: 'View ES saved search configs' },
                { spl: '| rest /services/admin/conf-correlationsearches | table title, disabled, search', explanation: 'List correlation search configurations' },
                { spl: '| btool savedsearches list --debug | grep -i "correlationsearch"', explanation: 'Debug config file precedence (command line)' }
            ],
            gotchas: [
                'Back up local/ directories before ES upgrades',
                'Use btool to verify effective configuration after changes',
                'Configuration changes may require restart or refresh',
                'Document all local/ customizations for disaster recovery'
            ]
        },
        {
            id: 'es_data_model_acceleration',
            name: 'ES Data Model Acceleration',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Accelerated data models enable fast tstats searches',
            what: 'Data model acceleration pre-computes summarized data from raw events, storing it in time-series index files (TSIDX). This enables sub-second tstats queries over months of data.',
            why: 'ES correlation searches use tstats for speed. Without acceleration, searches fall back to raw events, dramatically slowing detection and causing timeouts.',
            examples: [
                { spl: '| rest /services/datamodel/acceleration | table datamodel, acceleration, acceleration.earliest_time, summary.complete', explanation: 'Acceleration status for all data models' },
                { spl: '| rest /services/admin/summarization | search eai:acl.app="Splunk_SA_CIM" | table datamodel_name, summary.complete, summary.size, summary.buckets', explanation: 'Detailed CIM data model acceleration' },
                { spl: '| datamodel Authentication search | stats count', explanation: 'Test if Authentication model is searchable' },
                { spl: 'index=_internal sourcetype=splunkd component=DataModelAccelerator | timechart span=1h count by log_level', explanation: 'Monitor acceleration job health' }
            ],
            gotchas: [
                'Acceleration requires sufficient disk space (typically 5-15% of raw)',
                'New data sources need CIM mapping before acceleration works',
                'Acceleration lag means recent events may not appear in tstats',
                'Rebuild acceleration after significant CIM mapping changes'
            ],
            relatedFields: ['summary.complete', 'acceleration.earliest_time', 'summary.size']
        },
        {
            id: 'es_index_configuration',
            name: 'ES Index Configuration',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'ES uses dedicated indexes for risk, notable, and threat intelligence',
            what: 'ES creates several indexes: risk (risk events), notable (security alerts), threat_activity (threat intel matches), and summary indexes for long-term storage of processed data.',
            why: 'Understanding ES indexes enables proper retention policies, storage planning, access control, and custom searches against ES-specific data.',
            examples: [
                { spl: '| eventcount summarize=false index=risk OR index=notable OR index=threat_activity | table index, count', explanation: 'Count events in ES indexes' },
                { spl: '| rest /services/data/indexes | search title IN ("risk", "notable", "threat_activity") | table title, maxDataSize, frozenTimePeriodInSecs', explanation: 'ES index configuration' },
                { spl: 'index=notable | timechart span=1d count | stats avg(count) as avg_daily_notables', explanation: 'Average daily notable volume' }
            ],
            gotchas: [
                'risk index can grow large - tune retention based on your RBA windows',
                'notable index retention affects investigation lookback capability',
                'Consider summary indexes for long-term SOC metrics',
                'Set appropriate maxTotalDataSizeMB to prevent disk exhaustion'
            ],
            keyFields: [
                { field: 'index=risk', description: 'Stores all risk attribution events from RBA' },
                { field: 'index=notable', description: 'Stores all notable events (security alerts)' },
                { field: 'index=threat_activity', description: 'Stores threat intelligence matches' }
            ]
        },
        {
            id: 'es_licensing',
            name: 'ES Licensing Considerations',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'ES requires Splunk Enterprise license plus ES-specific entitlement',
            what: 'ES requires both a Splunk Enterprise license (based on daily indexing volume) and a separate ES entitlement. Risk and notable indexes contribute to license usage.',
            why: 'Understanding licensing prevents unexpected costs, helps optimize data onboarding decisions, and ensures compliance with Splunk agreements.',
            examples: [
                { spl: '| rest /services/licenser/pools | table title, used_bytes, effective_quota', explanation: 'Current license usage' },
                { spl: 'index=_internal source=*license_usage.log* type=Usage | timechart span=1d sum(b) by idx | where idx IN ("risk", "notable")', explanation: 'ES index license consumption' },
                { spl: '| rest /services/licenser/licenses | table label, type, status, expiration_time', explanation: 'Installed licenses' }
            ],
            gotchas: [
                'Risk events from many correlation searches can significantly impact license',
                'Summary indexes count toward license unless using report acceleration',
                'Monitor license usage trends to avoid warnings',
                'ES Premium features require additional licensing'
            ]
        },
        // ============================================
        // Content Tuning & False Positive Reduction
        // ============================================
        {
            id: 'es_false_positive_reduction',
            name: 'False Positive Reduction Strategies',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Systematic approaches to reduce alert noise',
            what: 'False positive reduction involves identifying benign alerts, understanding why they fired, and implementing appropriate countermeasures: whitelists, threshold adjustments, search modifications, or suppression rules.',
            why: 'Alert fatigue from false positives causes analysts to miss real threats. Systematic tuning improves detection fidelity and analyst productivity.',
            keyPoint: 'The goal is not zero false positives - it\'s reducing them to a level where each alert is worth investigating.',
            examples: [
                { spl: 'index=notable status=closed | stats count by rule_name, status_description | where match(status_description, "(?i)false|benign") | sort -count', explanation: 'Find rules generating most false positives' },
                { spl: 'index=notable rule_name="$rule$" | stats count by src, dest, user | sort -count | head 20', explanation: 'Identify top entities triggering a noisy rule' },
                { spl: 'index=notable | stats count, count(eval(status_group="closed")) as closed by rule_name | eval fp_rate=round(closed/count*100,1) | sort -count | head 20', explanation: 'Rules with highest close rates (potential FP issues)' }
            ],
            gotchas: [
                'Track FP rates over time - reduction efforts should show measurable improvement',
                'Document tuning decisions for audit trail and knowledge transfer',
                'Review tuned rules periodically - environment changes may require re-tuning',
                'Balance false positive reduction against detection coverage'
            ]
        },
        {
            id: 'es_risk_score_calibration',
            name: 'Risk Score Calibration',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Adjust risk scores to reflect true threat severity',
            what: 'Risk score calibration involves adjusting the numeric risk values assigned by correlation searches to accurately reflect the severity and confidence of each detection in your environment.',
            why: 'Uncalibrated scores lead to risk threshold alerts being too sensitive or too quiet. Proper calibration ensures high-risk entities truly deserve investigation priority.',
            examples: [
                { spl: 'index=risk | stats avg(risk_score) as avg_score, stdev(risk_score) as score_stdev by source | sort -avg_score', explanation: 'Risk score distribution by detection rule' },
                { spl: 'index=risk | stats sum(risk_score) as total by risk_object | stats perc50(total), perc90(total), perc99(total)', explanation: 'Risk distribution percentiles for threshold setting' },
                { spl: 'index=notable | join rule_name [search index=risk | stats avg(risk_score) as avg_risk_contrib by source | rename source as rule_name] | stats count, avg(avg_risk_contrib) by rule_name', explanation: 'Correlate notable volume with risk contribution' }
            ],
            gotchas: [
                'Start with default scores, then tune based on observed alert quality',
                'Higher confidence detections should have higher scores',
                'Consider asset/identity priority - critical systems warrant higher base scores',
                'Document your scoring rationale for consistency'
            ]
        },
        {
            id: 'es_correlation_search_tuning',
            name: 'Correlation Search Tuning',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Modify correlation searches to reduce noise while preserving detection',
            what: 'Correlation search tuning involves modifying the SPL logic, thresholds, time windows, and filters in detection rules to reduce false positives while maintaining the ability to detect real threats.',
            why: 'Out-of-box correlation searches are designed for broad coverage. Tuning customizes them for your specific environment, data sources, and threat profile.',
            examples: [
                { spl: '| rest /services/saved/searches | search action.correlationsearch.enabled=1 | table title, search, cron_schedule, action.correlationsearch.annotations.mitre_attack', explanation: 'View correlation search configurations' },
                { spl: 'index=notable rule_name="$rule$" earliest=-30d | timechart span=1d count | stats avg(count) as avg_daily, stdev(count) as daily_stdev', explanation: 'Analyze rule firing pattern for threshold tuning' },
                { spl: 'index=notable rule_name="$rule$" | stats dc(src) as unique_sources, dc(dest) as unique_targets, dc(user) as unique_users | table *', explanation: 'Understand rule scope before tuning' }
            ],
            gotchas: [
                'Test tuning changes in a clone before modifying production rules',
                'Increasing thresholds reduces FP but may miss low-and-slow attacks',
                'Document original search and change rationale',
                'Consider time-based tuning for business hour variations'
            ]
        },
        {
            id: 'es_suppression_rules',
            name: 'Suppression Rules Design',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Suppress known-good activity from generating alerts',
            what: 'Suppression rules prevent specific patterns from generating notable events or risk, typically for known benign activity like scheduled tasks, service accounts, or authorized tools.',
            why: 'Suppression is a surgical tool for handling known-good patterns without modifying the underlying correlation search logic. It preserves detection capability while eliminating specific noise.',
            examples: [
                { spl: '| rest /services/alerts/suppressions | table title, disabled, suppression_search, description', explanation: 'View configured suppression rules' },
                { spl: 'index=notable status=closed | where match(status_description, "suppress|whitelist|expected") | stats count by rule_name, src, user | sort -count', explanation: 'Identify suppression candidates from closed notables' },
                { spl: '| inputlookup es_suppression_lookup | table suppression_name, field, value, correlation_search', explanation: 'View lookup-based suppressions' }
            ],
            gotchas: [
                'Suppression should be specific - avoid broad wildcards that hide real threats',
                'Review suppressions periodically - temporary suppressions become permanent risks',
                'Document suppression rationale and expiration dates',
                'Use lookup-based suppression for large whitelists'
            ]
        },
        {
            id: 'es_threshold_adjustment',
            name: 'Threshold Adjustment Methodology',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Data-driven approach to setting detection thresholds',
            what: 'Threshold adjustment uses statistical analysis of historical data to determine appropriate numeric thresholds (count, duration, bytes) that separate normal activity from potentially malicious behavior.',
            why: 'Arbitrary thresholds cause either excessive false positives (too low) or missed detections (too high). Data-driven thresholds reflect actual behavior patterns in your environment.',
            examples: [
                { spl: 'index=auth action=failure | stats count by user | stats perc50(count) as p50, perc90(count) as p90, perc99(count) as p99, max(count) as max', explanation: 'Calculate baseline percentiles for failed login threshold' },
                { spl: 'index=proxy bytes_out>0 | stats sum(bytes_out) as daily_bytes by user, _time | bucket _time span=1d | stats avg(daily_bytes) as avg, stdev(daily_bytes) as stdev by user | eval threshold=avg+(3*stdev)', explanation: 'Calculate user-specific data exfil thresholds' },
                { spl: 'index=notable rule_name="$rule$" | stats count by _time | bucket _time span=1h | stats avg(count) as baseline | eval new_threshold=baseline*1.5', explanation: 'Analyze current firing rate to adjust threshold' }
            ],
            gotchas: [
                'Calculate baselines over representative time periods (30+ days)',
                'Account for seasonality - weekday vs weekend, business hours vs off-hours',
                'Start with higher percentiles (99th) and adjust down if FP persists',
                'Re-baseline after significant environment changes'
            ]
        },
        // ============================================
        // Mission Control & Incident Review UI
        // ============================================
        {
            id: 'es_incident_review_dashboard',
            name: 'Incident Review Dashboard',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'The primary SOC analyst interface for managing notable events',
            what: 'Incident Review is the main ES dashboard where analysts triage, investigate, and resolve notable events. It provides filtering, bulk actions, drill-downs, and workflow management.',
            why: 'Efficient use of Incident Review determines analyst productivity. Understanding its features enables faster triage, better collaboration, and proper incident documentation.',
            keyPoint: 'Incident Review is your daily command center. Master its filters, shortcuts, and workflow actions to work efficiently.',
            examples: [
                { spl: '`notable` | search status_group="open" | table _time, rule_name, urgency, owner, src, dest, user', explanation: 'Replicate Incident Review open queue' },
                { spl: '`notable` | stats count by rule_name, urgency | sort -count', explanation: 'Notable volume by rule and urgency' },
                { spl: '`notable` | where owner="$analyst$" AND status_group="open" | sort -urgency, _time', explanation: 'Analyst-specific queue view' }
            ],
            gotchas: [
                'Use saved filters for common views (My Queue, Critical Only, etc.)',
                'Bulk select and action for efficient triage of related notables',
                'Drill-down links provide pre-built investigation pivots',
                'Comment everything - it creates the audit trail'
            ]
        },
        {
            id: 'es_investigation_workbench',
            name: 'Investigation Workbench',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Visual investigation canvas for complex incidents',
            what: 'The Investigation Workbench provides a visual canvas for investigating incidents, allowing analysts to add entities (IPs, users, hosts), see their relationships, and document findings collaboratively.',
            why: 'Complex incidents involve multiple entities and events over time. The workbench provides visual context that linear search results cannot, enabling better pattern recognition.',
            examples: [
                { spl: '| rest /services/sa-investigations/investigations | table title, status, created_time, modified_time, owner', explanation: 'List saved investigations' },
                { spl: 'index=notable | stats count, values(rule_name) as rules, values(src) as sources, values(dest) as destinations by event_id | where count > 1', explanation: 'Find multi-faceted notables for investigation' }
            ],
            gotchas: [
                'Save investigations frequently - work can be lost on timeout',
                'Add timeline markers for key events during incident',
                'Use investigation templates for consistent documentation',
                'Link related notables to a single investigation for tracking'
            ]
        },
        {
            id: 'es_analyst_queue_management',
            name: 'Analyst Queue Management',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Efficiently distribute and track analyst workload',
            what: 'Queue management involves assigning notables to analysts, balancing workload across the team, and tracking individual and team progress through the alert backlog.',
            why: 'Poor queue management leads to burnout, missed SLAs, and duplicate work. Effective assignment ensures all alerts are handled and workload is fair.',
            examples: [
                { spl: 'index=notable status_group="open" | stats count by owner | sort -count', explanation: 'Open queue by analyst' },
                { spl: 'index=notable earliest=-7d | stats count as assigned, count(eval(status_group="closed")) as closed by owner | eval completion_rate=round(closed/assigned*100,1)', explanation: 'Analyst completion rates' },
                { spl: 'index=notable owner="unassigned" | stats count by urgency | sort -urgency', explanation: 'Unassigned notables by urgency' },
                { spl: 'index=notable | eval age_hours=round((now()-_time)/3600,1) | stats avg(age_hours) as avg_age, max(age_hours) as max_age by owner, status_group', explanation: 'Queue aging by analyst' }
            ],
            gotchas: [
                'Route high-urgency notables to senior analysts',
                'Use auto-assignment rules for high-volume, low-complexity alerts',
                'Monitor for "cherry picking" - some analysts avoiding difficult cases',
                'Consider skill-based routing for specialized detections'
            ]
        },
        {
            id: 'es_notable_workflow_states',
            name: 'Notable Event Workflow States',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Track incidents through New → In Progress → Resolved → Closed',
            what: 'Notable events progress through workflow states: New (unreviewed), In Progress (being investigated), Pending (waiting on external input), Resolved (investigation complete), Closed (case concluded).',
            why: 'Consistent state usage enables accurate metrics, proper handoffs, and management visibility into SOC operations.',
            keyPoint: 'Status + Status Description together tell the full story. "Closed" as true positive vs false positive requires the description.',
            examples: [
                { spl: 'index=notable | stats count by status, status_description | sort status, -count', explanation: 'Status distribution with descriptions' },
                { spl: 'index=notable | transaction rule_name, src, user maxspan=24h | stats count by eventcount | where eventcount > 1', explanation: 'Find notables that cycle through states' },
                { spl: 'index=notable | eval status_age_hours=(now()-status_end_time)/3600 | where status="in progress" AND status_age_hours > 24 | table rule_name, owner, status_age_hours', explanation: 'Stale "in progress" notables' }
            ],
            gotchas: [
                'Define team conventions for state transitions',
                '"Pending" should include what you\'re waiting for',
                'Status changes are logged - use them for MTTR calculations',
                'Closed status should always include True/False positive determination'
            ],
            keyFields: [
                { field: 'new', description: 'Alert received, no analyst review yet' },
                { field: 'in progress', description: 'Analyst actively investigating' },
                { field: 'pending', description: 'Waiting on external input or action' },
                { field: 'resolved', description: 'Investigation complete, findings documented' },
                { field: 'closed', description: 'Case concluded and dispositioned' }
            ]
        },
        // ============================================
        // SOAR Integration
        // ============================================
        {
            id: 'es_soar_overview',
            name: 'SOAR Integration Overview',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Connect ES to Splunk SOAR for automated response',
            what: 'SOAR (Security Orchestration, Automation and Response) integration connects ES notable events to automated playbooks that can enrich, contain, or remediate threats without manual intervention.',
            why: 'Manual response to every alert doesn\'t scale. SOAR automation handles routine tasks, enriches alerts with context, and accelerates response to real threats.',
            keyPoint: 'ES detects. SOAR responds. Together they close the loop from detection to action.',
            examples: [
                { spl: 'index=notable | where isnotnull(phantom_event_id) | stats count by rule_name, phantom_playbook_name', explanation: 'Notables sent to SOAR with playbook info' },
                { spl: 'index=_internal sourcetype=splunk_app_soar_connector | stats count by action, status', explanation: 'SOAR connector activity' },
                { spl: '`notable` | search soar_status=* | stats count by rule_name, soar_status', explanation: 'Notables with SOAR enrichment status' }
            ],
            gotchas: [
                'Test playbooks thoroughly in a sandbox before production deployment',
                'Start with enrichment playbooks before automated containment',
                'SOAR actions should be logged back to the notable for audit trail',
                'Monitor SOAR connectivity and playbook success rates'
            ]
        },
        {
            id: 'es_adaptive_response',
            name: 'Adaptive Response Actions',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Built-in ES actions triggered by correlation searches',
            what: 'Adaptive Response Actions are pre-built integrations that can be triggered when a correlation search fires, including notable creation, risk modification, email alerts, and custom scripts.',
            why: 'Adaptive responses automate common actions without requiring full SOAR integration, enabling quick wins like auto-escalation or context enrichment.',
            examples: [
                { spl: '| rest /services/alerts/alert_actions | search title="*adaptive*" OR title="*response*" | table title, disabled, label', explanation: 'Available adaptive response actions' },
                { spl: '| rest /services/saved/searches | search action.correlationsearch.enabled=1 | table title, actions', explanation: 'Correlation searches and their configured actions' },
                { spl: 'index=_internal sourcetype=adaptive_response_action_invocations | stats count by action_name, action_status', explanation: 'Adaptive response execution history' }
            ],
            gotchas: [
                'Test adaptive responses in dev environment first',
                'Chain multiple actions for complex response workflows',
                'Monitor action execution in _internal for failures',
                'Custom actions require Python development and testing'
            ]
        },
        {
            id: 'es_playbook_triggering',
            name: 'Playbook Triggering from ES',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Configure ES to automatically invoke SOAR playbooks',
            what: 'Playbook triggering connects specific ES correlation searches or notable conditions to SOAR playbooks, enabling automated investigation and response workflows.',
            why: 'Automated playbook triggering removes human delay from response, enabling 24/7 coverage and consistent handling of common alert types.',
            examples: [
                { spl: '| rest /services/saved/searches | search action.phantom=1 | table title, action.phantom.cam, action.phantom.label', explanation: 'Searches configured to trigger SOAR' },
                { spl: 'index=notable rule_name="*" | lookup soar_playbook_mapping rule_name OUTPUT playbook_name | stats count by rule_name, playbook_name', explanation: 'Map notables to playbooks' }
            ],
            gotchas: [
                'Use severity/urgency filtering to avoid overwhelming SOAR',
                'Implement rate limiting for high-volume detections',
                'Test playbook triggers with low-impact test cases',
                'Have a manual fallback process when SOAR is unavailable'
            ]
        },
        {
            id: 'es_custom_adaptive_response',
            name: 'Custom Adaptive Response Development',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Build custom integrations for ES adaptive response framework',
            what: 'Custom adaptive responses extend ES with organization-specific integrations: ticketing systems, communication platforms, custom APIs, or specialized security tools.',
            why: 'Out-of-box integrations don\'t cover every tool. Custom development enables ES to integrate with your specific security ecosystem.',
            examples: [
                { spl: '| rest /services/alerts/alert_actions | search eai:acl.app="*custom*" | table title, label, param.* ', explanation: 'View custom adaptive response configurations' },
                { spl: 'index=_internal sourcetype=adaptive_response_action_invocations action_name="custom_*" | stats count by action_name, action_status', explanation: 'Monitor custom action execution' }
            ],
            gotchas: [
                'Follow Splunk app development best practices',
                'Include robust error handling and logging',
                'Implement timeouts for external API calls',
                'Test thoroughly with edge cases before deployment'
            ]
        },
        // ============================================
        // Data Onboarding Best Practices
        // ============================================
        {
            id: 'es_cim_compliance',
            name: 'CIM Compliance Requirements',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Data must be CIM-compliant for ES data models to work',
            what: 'CIM (Common Information Model) compliance means data sources have field names normalized to Splunk\'s standard schema, enabling ES data models to recognize and accelerate the data.',
            why: 'ES correlation searches rely on data models. Non-CIM-compliant data won\'t be included in searches, leaving detection gaps.',
            keyPoint: 'If your data isn\'t CIM-compliant, ES literally cannot see it. Normalization is not optional.',
            examples: [
                { spl: '| datamodel Authentication search | head 1 | fields *', explanation: 'See expected CIM fields for Authentication' },
                { spl: 'index=your_auth_index | head 100 | table user, src, dest, action, app | rename your_user_field as user', explanation: 'Check if your data has required fields' },
                { spl: '| tstats count from datamodel=Authentication by sourcetype | sort -count', explanation: 'Which sourcetypes contribute to Authentication model' }
            ],
            gotchas: [
                'Splunk Add-ons (TAs) provide CIM mapping for many data sources',
                'Custom data requires field extraction and aliasing to CIM fields',
                'Test CIM compliance with | tstats before relying on detection',
                'Some CIM models have required fields - check model documentation'
            ]
        },
        {
            id: 'es_data_normalization',
            name: 'Data Normalization Strategies',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Map diverse data sources to common field names',
            what: 'Data normalization maps vendor-specific field names to CIM standard names using field aliases, calculated fields, and extractions in props.conf and transforms.conf.',
            why: 'Without normalization, you need separate searches for each data source. Normalization enables "search once, detect everywhere" across your entire environment.',
            examples: [
                { spl: 'index=* sourcetype=aws:cloudtrail | eval user=userIdentity.userName, src=sourceIPAddress, action=eventName | table user, src, action', explanation: 'Manual field mapping example' },
                { spl: '| datamodel Network_Traffic search | fieldsummary | table field, count, distinct_count | where count > 0', explanation: 'Fields in Network Traffic model' },
                { spl: '| inputlookup cim_validator_lookup | stats count by model, field, required', explanation: 'CIM field requirements lookup' }
            ],
            gotchas: [
                'Use field aliases (not renames) to preserve original field names',
                'Test normalizations in dev before deploying to production',
                'Document custom normalizations for maintenance',
                'Consider eventtypes for complex normalization logic'
            ]
        },
        {
            id: 'es_required_data_sources',
            name: 'ES Required Data Sources',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Prioritize data sources by ES detection coverage',
            what: 'ES has core data models (Authentication, Network Traffic, Endpoint, Web, etc.) that require specific data types. Understanding which sources feed which models guides onboarding priorities.',
            why: 'Limited onboarding resources mean prioritization. Focus on data sources that enable the most valuable ES detections first.',
            keyPoint: 'Authentication and Network Traffic data typically provide the highest ES detection coverage per effort invested.',
            examples: [
                { spl: '| rest /services/datamodel/model | search eai:acl.app="Splunk_SA_CIM" | table title, acceleration', explanation: 'List CIM data models ES uses' },
                { spl: '| tstats count from datamodel=* by datamodel | sort -count', explanation: 'Data model population status' },
                { spl: '| datamodel | table datamodel, object_count, acceleration_status', explanation: 'Data model overview' }
            ],
            gotchas: [
                'Start with Windows Event Logs and firewall data for quick wins',
                'Endpoint detection requires Sysmon or EDR data',
                'Cloud environments need CloudTrail/Azure AD/GCP audit logs',
                'Check correlation search requirements to prioritize sources'
            ],
            keyFields: [
                { field: 'Authentication', description: 'Login events from Windows, Linux, cloud identity providers' },
                { field: 'Network_Traffic', description: 'Firewall, proxy, flow data' },
                { field: 'Endpoint', description: 'Process, file, registry events from Sysmon/EDR' },
                { field: 'Web', description: 'Web server and proxy access logs' }
            ]
        },
        {
            id: 'es_field_extraction',
            name: 'Field Extraction for ES',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Extract fields at index time or search time for ES visibility',
            what: 'Field extraction uses regex patterns, JSON parsing, or key-value extraction to pull structured fields from raw log data, making them available for ES data models.',
            why: 'Raw logs are just text. Extracted fields enable filtering, aggregation, and data model mapping that ES requires for detection.',
            examples: [
                { spl: 'index=custom_logs | rex field=_raw "user=(?<user>[^\\s]+)" | table _time, user, _raw', explanation: 'Extract user field with regex' },
                { spl: 'index=json_logs | spath | table *', explanation: 'Auto-extract JSON fields' },
                { spl: '| makeresults | eval test_data="src=10.1.1.1 dest=10.2.2.2 action=allow" | extract auto=t | table *', explanation: 'Test key-value extraction' }
            ],
            gotchas: [
                'Prefer index-time extraction for high-volume fields (src, dest)',
                'Search-time extraction is more flexible but slower',
                'Test extractions on representative data samples',
                'Use field aliases to map extracted fields to CIM names'
            ]
        },
        {
            id: 'es_data_model_mapping',
            name: 'Data Model Mapping',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Configure data sources to populate ES data models',
            what: 'Data model mapping connects sourcetypes to CIM data models through tags, eventtypes, and field aliases defined in props.conf, tags.conf, and eventtypes.conf.',
            why: 'Proper mapping ensures your data appears in ES data models, enabling tstats acceleration and correlation search detection.',
            examples: [
                { spl: '| eventcount summarize=false index=* | lookup sourcetype_to_datamodel sourcetype OUTPUT datamodel | stats count by sourcetype, datamodel', explanation: 'Check sourcetype to model mapping' },
                { spl: '| tstats count from datamodel=Authentication by Authentication.sourcetype | rename Authentication.sourcetype as sourcetype', explanation: 'Sourcetypes in Authentication model' },
                { spl: '| tags | stats count by tag | where match(tag, "authentication|network|endpoint")', explanation: 'Security-relevant tags applied' }
            ],
            gotchas: [
                'Tags drive data model membership - check tag assignments',
                'Use Splunk Add-ons which include proper tagging',
                'Test mapping with | tstats before assuming it works',
                'Rebuild data model acceleration after mapping changes'
            ]
        },
        // ============================================
        // Compliance & Executive Reporting
        // ============================================
        {
            id: 'es_compliance_frameworks',
            name: 'ES Compliance Frameworks',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Map ES content to PCI, HIPAA, SOX requirements',
            what: 'ES includes content mapped to compliance frameworks (PCI-DSS, HIPAA, SOX, NIST) through correlation search annotations and pre-built compliance dashboards.',
            why: 'Compliance mapping demonstrates to auditors how ES detections satisfy specific control requirements, reducing audit burden and proving security program maturity.',
            examples: [
                { spl: '| rest /services/saved/searches | search action.correlationsearch.enabled=1 | spath input=action.correlationsearch.annotations path=cis20{} output=cis | table title, cis', explanation: 'Correlation searches mapped to CIS controls' },
                { spl: 'index=notable | stats count by rule_name | lookup compliance_mapping rule_name OUTPUT pci_requirement, hipaa_control | where isnotnull(pci_requirement)', explanation: 'Notables mapped to compliance requirements' },
                { spl: '| rest /services/saved/searches | where match(qualifiedSearch, "compliance") | table title, description', explanation: 'Compliance-related saved searches' }
            ],
            gotchas: [
                'Review and validate compliance mappings - defaults may not match your interpretation',
                'Document how ES detections satisfy specific controls',
                'Maintain evidence of detection testing for auditors',
                'Update mappings when compliance framework versions change'
            ]
        },
        {
            id: 'es_executive_dashboards',
            name: 'Executive Dashboard Patterns',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Build high-level security status views for leadership',
            what: 'Executive dashboards present security posture information at a strategic level: risk trends, incident volumes, compliance status, and key metrics without operational detail.',
            why: 'Executives need visibility into security program effectiveness without drowning in technical details. Well-designed dashboards support budget and resource decisions.',
            examples: [
                { spl: 'index=notable earliest=-30d | timechart span=1d count by urgency | addtotals fieldname=total', explanation: 'Daily alert volume trend for leadership' },
                { spl: 'index=notable earliest=-30d | stats count as total, count(eval(status_group="closed" AND match(status_description,"true positive"))) as confirmed_incidents | eval incident_rate=round(confirmed_incidents/total*100,1)', explanation: 'True positive rate metric' },
                { spl: 'index=risk | stats sum(risk_score) as total_risk, dc(risk_object) as entities_at_risk by risk_object_type | sort -total_risk', explanation: 'Risk summary by entity type' }
            ],
            gotchas: [
                'Use trend comparisons (this month vs last month)',
                'Include context - what does "1000 alerts" mean?',
                'Avoid technical jargon - translate to business impact',
                'Design for the question: "Are we more or less secure?"'
            ]
        },
        {
            id: 'es_audit_trail',
            name: 'Audit Trail Requirements',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Track who did what in ES for compliance evidence',
            what: 'ES audit trails capture user actions: notable status changes, investigation activities, configuration modifications, and search history for compliance and forensic purposes.',
            why: 'Auditors require evidence that incidents were properly handled and configurations properly controlled. Audit logs prove due diligence.',
            examples: [
                { spl: 'index=_audit action=* user=* sourcetype=audittrail | stats count by action, user | sort -count', explanation: 'Audit trail activity summary' },
                { spl: 'index=notable | transaction event_id | table event_id, rule_name, status, owner, _time, duration', explanation: 'Notable lifecycle audit' },
                { spl: 'index=_internal sourcetype=splunk_web_access method=POST uri_path="*notable*" | stats count by user, uri_path', explanation: 'Notable modification activity' }
            ],
            gotchas: [
                'Enable audit logging for ES-specific actions',
                'Retain audit logs per your compliance requirements',
                'Include audit log review in SOC processes',
                'Protect audit logs from tampering'
            ]
        },
        {
            id: 'es_compliance_evidence',
            name: 'Compliance Evidence Collection',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Generate evidence artifacts for compliance audits',
            what: 'Evidence collection involves generating reports, exports, and documentation that demonstrate ES detection capabilities, incident response actions, and security control effectiveness.',
            why: 'Audits require proof. Pre-built evidence generation reduces audit preparation time and ensures consistent, defensible documentation.',
            examples: [
                { spl: 'index=notable earliest=-90d status_group=closed | stats count as incidents, avg(eval((status_end_time-_time)/3600)) as avg_response_hours by rule_name | sort -incidents | outputlookup incident_evidence.csv', explanation: 'Export incident handling evidence' },
                { spl: '| rest /services/saved/searches | search action.correlationsearch.enabled=1 disabled=0 | table title, search, cron_schedule | outputlookup active_detections.csv', explanation: 'Document active detection rules' },
                { spl: 'index=_audit action="edit_*" OR action="create_*" | where match(object, "correlation") | table _time, user, action, object | outputlookup config_changes.csv', explanation: 'Configuration change evidence' }
            ],
            gotchas: [
                'Automate evidence generation on a schedule',
                'Include timestamps and hash verification for integrity',
                'Store evidence in immutable archives',
                'Map evidence to specific control requirements'
            ]
        },
        // ============================================
        // SOC Metrics & KPIs
        // ============================================
        {
            id: 'es_mttd',
            name: 'MTTD (Mean Time to Detect)',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Measure how quickly threats are detected',
            what: 'MTTD measures the average time between when a threat occurs and when it\'s detected by ES. It\'s calculated from the original event timestamp to the notable event creation time.',
            why: 'MTTD is a fundamental security metric. Lower MTTD means threats are caught earlier, reducing potential damage and demonstrating detection program effectiveness.',
            keyPoint: 'MTTD requires accurate timestamps on source events. If timestamps are wrong, MTTD calculations are meaningless.',
            examples: [
                { spl: 'index=notable | eval detection_delay=(orig_time-_time) | where detection_delay > 0 | stats avg(detection_delay) as avg_mttd_seconds | eval avg_mttd_minutes=round(avg_mttd_seconds/60,1)', explanation: 'Calculate MTTD in minutes' },
                { spl: 'index=notable | eval detection_delay=(_time-orig_time) | stats avg(detection_delay) as mttd by rule_name | sort -mttd', explanation: 'MTTD by detection rule' },
                { spl: 'index=notable earliest=-30d | eval detection_delay=(_time-orig_time)/3600 | bin _time span=1d | stats avg(detection_delay) as daily_mttd by _time', explanation: 'MTTD trend over time' }
            ],
            gotchas: [
                'orig_time field must be populated correctly for MTTD calculation',
                'Scheduled searches add inherent delay to MTTD',
                'Different attack types have different acceptable MTTD',
                'Compare MTTD against industry benchmarks'
            ]
        },
        {
            id: 'es_mttr',
            name: 'MTTR (Mean Time to Respond)',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Measure how quickly detected threats are resolved',
            what: 'MTTR measures the average time from notable event creation to resolution/closure. It reflects analyst efficiency, process maturity, and resource adequacy.',
            why: 'MTTR demonstrates operational effectiveness. Lower MTTR means faster threat neutralization, reduced business impact, and better SOC performance.',
            examples: [
                { spl: 'index=notable status_group=closed | eval response_time=status_end_time-_time | stats avg(response_time) as avg_mttr_seconds | eval avg_mttr_hours=round(avg_mttr_seconds/3600,1)', explanation: 'Calculate MTTR in hours' },
                { spl: 'index=notable status_group=closed | eval response_time=(status_end_time-_time)/3600 | stats avg(response_time) as mttr_hours by urgency | sort urgency', explanation: 'MTTR by urgency level' },
                { spl: 'index=notable status_group=closed | eval response_time=(status_end_time-_time)/3600 | stats avg(response_time) as mttr by owner | sort mttr', explanation: 'MTTR by analyst' }
            ],
            gotchas: [
                'Define "resolved" consistently - status change or containment complete?',
                'Track MTTR by urgency - critical should be faster',
                'Exclude false positives from MTTR to measure real incident response',
                'Long MTTR may indicate staffing or process issues'
            ]
        },
        {
            id: 'es_analyst_productivity',
            name: 'Analyst Productivity Metrics',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Measure individual and team efficiency',
            what: 'Analyst productivity metrics track alert handling volume, resolution rates, investigation thoroughness, and quality of work to evaluate performance and identify improvement opportunities.',
            why: 'Productivity metrics identify training needs, inform staffing decisions, and recognize high performers. They also detect gaming behaviors that undermine security.',
            examples: [
                { spl: 'index=notable earliest=-7d | stats count by owner | sort -count', explanation: 'Alert volume handled by analyst' },
                { spl: 'index=notable earliest=-7d status_group=closed | stats count as closed, avg(eval(status_end_time-_time)/3600) as avg_hours by owner | sort -closed', explanation: 'Closure volume and speed by analyst' },
                { spl: 'index=notable earliest=-30d | stats count as total, count(eval(status_group="closed")) as closed by owner | eval completion_rate=round(closed/total*100,1) | sort -completion_rate', explanation: 'Completion rates' },
                { spl: 'index=notable status_group=closed earliest=-7d | stats avg(len(comment)) as avg_comment_length by owner | sort -avg_comment_length', explanation: 'Documentation thoroughness' }
            ],
            gotchas: [
                'Volume metrics alone encourage rushing - pair with quality metrics',
                'Normalize for shift coverage and alert complexity',
                'Track trends over time, not just absolute numbers',
                'Use metrics for coaching, not punishment'
            ]
        },
        {
            id: 'es_detection_coverage',
            name: 'Detection Coverage Metrics',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Measure what attacks you can and cannot detect',
            what: 'Detection coverage metrics map enabled correlation searches to attack frameworks (MITRE ATT&CK) and data sources, identifying gaps where attacks would go undetected.',
            why: 'You can\'t defend against what you can\'t detect. Coverage metrics guide detection engineering priorities and security investment decisions.',
            examples: [
                { spl: '| rest /services/saved/searches | search action.correlationsearch.enabled=1 disabled=0 | stats count by action.correlationsearch.annotations.mitre_attack', explanation: 'Detection coverage by MITRE technique' },
                { spl: '| rest /services/saved/searches | search action.correlationsearch.enabled=1 disabled=0 | stats count by action.correlationsearch.security_domain', explanation: 'Coverage by security domain' },
                { spl: '| inputlookup mitre_attack_lookup | stats count by tactic | append [| rest /services/saved/searches | search action.correlationsearch.enabled=1 | stats count by action.correlationsearch.annotations.mitre_attack.tactic] | stats sum(count) as total by tactic', explanation: 'Compare coverage to full MITRE matrix' }
            ],
            gotchas: [
                'Coverage is not binary - consider detection quality and confidence',
                'Data source gaps limit detection coverage regardless of rules',
                'Map to MITRE ATT&CK for standardized coverage assessment',
                'Prioritize coverage for likely threats to your industry'
            ]
        },
        // ============================================
        // Attack-Specific Use Cases
        // ============================================
        {
            id: 'es_ransomware_detection',
            name: 'Ransomware Detection Patterns',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Detect ransomware before and during encryption',
            what: 'Ransomware detection focuses on pre-encryption indicators (lateral movement, privilege escalation, backup deletion) and encryption behaviors (mass file modifications, ransom note creation).',
            why: 'Early ransomware detection enables response before encryption completes, potentially saving data and limiting business impact.',
            examples: [
                { spl: '| tstats count from datamodel=Endpoint.Processes where Processes.process_name IN ("vssadmin.exe","wmic.exe") Processes.process IN ("*delete*shadows*","*shadowcopy*delete*") by Processes.user, Processes.dest', explanation: 'Shadow copy deletion - pre-encryption indicator' },
                { spl: '| tstats count from datamodel=Endpoint.Filesystem where Filesystem.action=created Filesystem.file_name IN ("*readme*.txt","*decrypt*.txt","*ransom*.txt") by Filesystem.dest, Filesystem.file_name', explanation: 'Ransom note file creation' },
                { spl: '| tstats count from datamodel=Endpoint.Filesystem where Filesystem.action=modified by Filesystem.dest, _time span=1m | where count > 1000', explanation: 'Mass file modification detection' },
                { spl: 'index=sysmon EventCode=11 | stats dc(TargetFilename) as unique_files by Computer | where unique_files > 500', explanation: 'High file creation rate - encryption in progress' }
            ],
            gotchas: [
                'Detect early indicators (recon, lateral movement) not just encryption',
                'Tune thresholds for legitimate high-volume file operations',
                'Monitor for backup deletion commands and VSS tampering',
                'Track known ransomware file extensions'
            ]
        },
        {
            id: 'es_insider_threat',
            name: 'Insider Threat Indicators',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Detect malicious or negligent insider activity',
            what: 'Insider threat detection focuses on behavioral anomalies: unusual data access, after-hours activity, resignation + data exfiltration patterns, and policy violations by trusted users.',
            why: 'Insiders have legitimate access, making detection harder. Behavioral analytics and pattern recognition identify abuse of trusted access.',
            examples: [
                { spl: 'index=proxy bytes>10000000 | stats sum(bytes) as total_bytes by user | where total_bytes > 1000000000 | lookup identity_lookup_expanded identity as user OUTPUT bunit, category', explanation: 'Large data transfers by user' },
                { spl: 'index=auth | eval hour=strftime(_time,"%H") | where hour < 6 OR hour > 22 | stats count by user | where count > 10', explanation: 'After-hours authentication activity' },
                { spl: 'index=email action=sent | stats dc(recipient_domain) as unique_domains, sum(attachment_count) as total_attachments by src_user | where unique_domains > 50', explanation: 'Unusual email patterns' },
                { spl: 'index=file_access action=read | stats dc(file_path) as unique_files by user | where unique_files > 1000', explanation: 'Mass file access' }
            ],
            gotchas: [
                'Baseline normal behavior before detecting anomalies',
                'Consider HR data (resignation, termination) for risk scoring',
                'Balance detection with privacy - follow your policies',
                'Look for combinations of indicators, not single events'
            ]
        },
        {
            id: 'es_bec_detection',
            name: 'BEC (Business Email Compromise) Detection',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Detect email fraud and impersonation attacks',
            what: 'BEC detection identifies email-based fraud: executive impersonation, invoice fraud, vendor compromise, and credential phishing targeting financial processes.',
            why: 'BEC causes massive financial losses with minimal technical footprint. Detection requires email analysis and understanding of business processes.',
            examples: [
                { spl: 'index=email | where src_user!=display_name_email | eval impersonation=if(match(display_name,"(?i)CEO|CFO|executive"),1,0) | where impersonation=1', explanation: 'Detect display name spoofing of executives' },
                { spl: 'index=email | regex subject="(?i)(wire|transfer|payment|invoice|urgent|confidential)" | stats count by src_user, recipient | where count > 10', explanation: 'Financial-themed email patterns' },
                { spl: 'index=email | where message_direction="inbound" | rex field=header_from "(?<domain>@[^>]+)" | lookup trusted_domains domain OUTPUT is_trusted | where is_trusted!=1 AND match(subject, "(?i)invoice|payment")', explanation: 'Invoice emails from untrusted domains' }
            ],
            gotchas: [
                'Monitor lookalike domains (company.com vs c0mpany.com)',
                'Flag emails requesting wire transfers or payment changes',
                'Detect forwarding rules that redirect executive emails',
                'Integrate with anti-phishing tools for full coverage'
            ]
        },
        {
            id: 'es_supply_chain_detection',
            name: 'Supply Chain Attack Detection',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Detect compromises through trusted third parties',
            what: 'Supply chain detection identifies attacks through trusted vendors: software update compromises, third-party access abuse, and upstream dependency vulnerabilities.',
            why: 'Supply chain attacks exploit trust relationships, bypassing traditional defenses. Detection requires monitoring vendor access and software integrity.',
            examples: [
                { spl: 'index=proxy | lookup approved_software_urls url OUTPUT is_approved | where is_approved!=1 AND match(url, "(?i)update|download|patch") | stats count by dest, url', explanation: 'Unapproved update downloads' },
                { spl: 'index=auth src_category="vendor" OR user_category="third_party" | stats count by user, dest, action | where count > baseline', explanation: 'Third-party access anomalies' },
                { spl: 'index=sysmon EventCode=1 | where NOT match(ParentImage, trusted_parent_list) | stats count by ParentImage, Image', explanation: 'Processes with unexpected parents' }
            ],
            gotchas: [
                'Maintain approved software and update source lists',
                'Monitor vendor access closely with dedicated alerting',
                'Track software signing and hash verification',
                'Implement software bill of materials (SBOM) tracking'
            ]
        },
        {
            id: 'es_cloud_security',
            name: 'Cloud Security in ES (AWS/Azure/GCP)',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Monitor cloud environments with ES data models',
            what: 'Cloud security in ES involves ingesting cloud audit logs (CloudTrail, Azure Activity, GCP Audit), mapping them to CIM data models, and using ES detections for cloud-specific threats.',
            why: 'Cloud environments are targets for credential theft, resource abuse, and data exfiltration. ES provides unified detection across hybrid environments.',
            examples: [
                { spl: '| tstats count from datamodel=Authentication where Authentication.app=aws* Authentication.action=failure by Authentication.user, Authentication.src | where count > 10', explanation: 'AWS authentication failures' },
                { spl: 'index=aws_cloudtrail eventName IN ("StopLogging","DeleteTrail","UpdateTrail") | table _time, userIdentity.arn, eventName, sourceIPAddress', explanation: 'CloudTrail tampering attempts' },
                { spl: 'index=azure_audit operationName="*Microsoft.Compute/virtualMachines/write*" | stats count by callerIpAddress, identity', explanation: 'Azure VM creation activity' },
                { spl: 'index=gcp_audit protoPayload.methodName="storage.buckets.setIamPolicy" | table timestamp, protoPayload.authenticationInfo.principalEmail, resource.labels.bucket_name', explanation: 'GCP bucket permission changes' }
            ],
            gotchas: [
                'Install cloud-specific Splunk Add-ons for proper parsing',
                'Cloud logs have different latency than on-prem',
                'Map cloud-specific fields to CIM for ES compatibility',
                'Monitor IAM changes, network changes, and data access'
            ]
        },
        {
            id: 'es_credential_theft',
            name: 'Credential Theft Detection',
            category: 'enterpriseSecurity',
            subcategory: 'detection',
            takeaway: 'Detect credential dumping and password attacks',
            what: 'Credential theft detection identifies attacks against authentication systems: Mimikatz/LSASS dumping, Kerberoasting, password spraying, and credential stuffing.',
            why: 'Stolen credentials enable attackers to move laterally and maintain persistence. Early detection limits the damage from compromised accounts.',
            examples: [
                { spl: 'index=sysmon EventCode=10 TargetImage="*lsass.exe" | stats count by SourceImage, Computer | where count > 1', explanation: 'LSASS access - credential dumping indicator' },
                { spl: 'index=wineventlog EventCode=4769 Ticket_Encryption_Type=0x17 | stats count by ServiceName, Account_Name | where count > 10', explanation: 'Kerberoasting detection (RC4 ticket requests)' },
                { spl: 'index=auth action=failure | stats dc(user) as unique_users, values(user) as users by src | where unique_users > 10 | head 10', explanation: 'Password spraying - one source, many users' },
                { spl: 'index=wineventlog EventCode IN (4768,4769) | stats dc(src_ip) as unique_sources by user | where unique_sources > 5', explanation: 'Account used from multiple locations' }
            ],
            gotchas: [
                'Sysmon EventCode 10 on lsass.exe has legitimate uses - tune carefully',
                'Track which service accounts receive TGS requests',
                'Monitor for password spray patterns: low rate, many accounts',
                'Correlate auth failures with subsequent successes'
            ]
        },
        // ============================================
        // Custom Content Development
        // ============================================
        {
            id: 'es_correlation_development',
            name: 'Correlation Search Development',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Build custom detection rules for ES',
            what: 'Correlation search development involves writing SPL detection logic, configuring notable event creation, setting risk scoring, and integrating with ES workflow.',
            why: 'Out-of-box content doesn\'t cover every threat. Custom development extends ES to detect organization-specific and emerging threats.',
            examples: [
                { spl: '| tstats count from datamodel=Authentication where Authentication.action=failure by Authentication.user, Authentication.src span=5m | where count > 10 | `create_notable(rule_name="Custom Brute Force")`', explanation: 'Custom brute force detection structure' },
                { spl: '| from datamodel:Endpoint.Processes | where process_name IN (suspicious_list) | `risk_score(risk_object=dest, risk_score=50, risk_message="Suspicious process")`', explanation: 'Risk-based detection pattern' },
                { spl: '| rest /services/saved/searches | search action.correlationsearch.enabled=1 | table title, search, cron_schedule, action.notable.param.rule_title', explanation: 'Review existing correlation search patterns' }
            ],
            gotchas: [
                'Use tstats for performance on large data volumes',
                'Test detection logic with | table before enabling notable creation',
                'Include drilldown_search for analyst investigation',
                'Document detection logic and expected false positives'
            ]
        },
        {
            id: 'es_risk_rule_development',
            name: 'Risk Rule Development',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Create custom risk attribution rules',
            what: 'Risk rule development focuses on correlation searches that contribute risk scores rather than creating notable events directly, feeding into Risk-Based Alerting aggregation.',
            why: 'RBA reduces alert fatigue by aggregating multiple low-confidence indicators. Custom risk rules extend this model to organization-specific detections.',
            examples: [
                { spl: '| tstats count from datamodel=Web where Web.http_user_agent="*suspicious*" by Web.src, Web.dest | `risk_score(risk_object=Web.src, risk_object_type="system", risk_score=15)`', explanation: 'Risk rule for suspicious user agents' },
                { spl: 'index=dns query_type=TXT | stats count by src | where count > 100 | `risk_score(risk_object=src, risk_object_type="system", risk_score=25, risk_message="High TXT query volume")`', explanation: 'DNS exfil risk indicator' },
                { spl: 'index=risk | stats sum(risk_score) as total, dc(source) as rule_count by risk_object | where total > 50 AND rule_count > 3', explanation: 'Analyze risk accumulation patterns' }
            ],
            gotchas: [
                'Lower risk scores for lower confidence detections',
                'Include descriptive risk_message for analyst context',
                'Consider risk_object_type for proper aggregation',
                'Balance risk contribution across rule categories'
            ]
        },
        {
            id: 'es_content_testing',
            name: 'Content Testing Methodology',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Validate detection content before production deployment',
            what: 'Content testing validates that correlation searches detect intended threats, don\'t generate excessive false positives, and integrate properly with ES workflows.',
            why: 'Untested content causes either missed detections or alert storms. Systematic testing ensures quality before impacting production SOC operations.',
            examples: [
                { spl: '| makeresults | eval _raw="simulated attack data" | collect index=test_data', explanation: 'Generate test data for validation' },
                { spl: 'YOUR_DETECTION_SEARCH | table _time, src, dest, user | outputlookup detection_test_results.csv', explanation: 'Capture detection results for review' },
                { spl: '| inputlookup detection_test_cases | stats count by expected_result, actual_result | eval match=if(expected_result==actual_result,"PASS","FAIL")', explanation: 'Compare expected vs actual results' }
            ],
            gotchas: [
                'Test with both positive (should detect) and negative (should not detect) cases',
                'Use representative data volumes for performance testing',
                'Validate notable event fields are populated correctly',
                'Test on a schedule similar to production (cron timing)'
            ]
        },
        {
            id: 'es_content_promotion',
            name: 'Content Promotion Workflow',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Move content safely from development to production',
            what: 'Content promotion is the process of moving tested correlation searches, lookups, and configurations from development environments to production with proper review and approval.',
            why: 'Uncontrolled changes to production ES cause outages, missed detections, or alert storms. Formal promotion processes ensure stability.',
            examples: [
                { spl: '| rest /services/saved/searches | search title="DEV - *" | table title, updated, eai:acl.owner', explanation: 'Find development content ready for promotion' },
                { spl: '| inputlookup content_promotion_tracker | where status="pending_review" | table content_name, author, test_date, reviewer', explanation: 'Content awaiting promotion approval' }
            ],
            gotchas: [
                'Require peer review before production deployment',
                'Test in production-like environment before promoting',
                'Document rollback procedures for failed promotions',
                'Track promotion history for audit compliance'
            ]
        },
        {
            id: 'es_version_control',
            name: 'Version Control for ES Content',
            category: 'enterpriseSecurity',
            subcategory: 'operations',
            takeaway: 'Manage ES content changes with git-based workflows',
            what: 'Version control for ES involves exporting correlation searches, lookups, and configurations to files that can be tracked in git repositories with proper branching and review workflows.',
            why: 'Version control enables change tracking, rollback capability, collaboration, and audit trails for ES content development.',
            examples: [
                { spl: '| rest /services/saved/searches | search action.correlationsearch.enabled=1 | outputlookup correlation_searches_export.csv', explanation: 'Export correlation searches for version control' },
                { spl: '| rest /services/data/transforms/lookups | outputlookup lookup_definitions_export.csv', explanation: 'Export lookup definitions' },
                { spl: '| inputlookup correlation_searches_export.csv | stats count by updated | sort updated', explanation: 'Track content changes over time' }
            ],
            gotchas: [
                'Use splunk packaging toolkit for proper app structure',
                'Store credentials and secrets outside version control',
                'Implement branch protection for production content',
                'Automate deployment from version control to Splunk'
            ]
        },
        // ============================================
        // Identity Resolution
        // ============================================
        {
            id: 'es_identity_correlation',
            name: 'Identity Correlation',
            category: 'enterpriseSecurity',
            subcategory: 'assetIdentity',
            takeaway: 'Link multiple account names to single individuals',
            what: 'Identity correlation connects different representations of the same person (jsmith, john.smith@company.com, DOMAIN\\jsmith) to a single canonical identity for unified tracking.',
            why: 'Without identity correlation, risk and notables for one person appear split across multiple identifiers, hiding the true threat picture.',
            examples: [
                { spl: '| inputlookup identity_lookup_expanded | stats values(identity) as all_identities, values(email) as emails by identity_id', explanation: 'View identity correlations' },
                { spl: 'index=risk | lookup identity_lookup_expanded identity as risk_object OUTPUT identity_id | stats sum(risk_score) as total by identity_id', explanation: 'Aggregate risk by correlated identity' },
                { spl: '| inputlookup identity_lookup_expanded | where mvcount(identity) > 1 | table identity_id, identity, email', explanation: 'Find identities with multiple aliases' }
            ],
            gotchas: [
                'Identity correlation rules are configured in the Identity Manager',
                'Test correlation with sample data before applying broadly',
                'Review uncorrelated identities regularly',
                'Conflicting correlations cause duplicate identities'
            ]
        },
        {
            id: 'es_identity_deduplication',
            name: 'Identity Deduplication',
            category: 'enterpriseSecurity',
            subcategory: 'assetIdentity',
            takeaway: 'Merge duplicate identity records',
            what: 'Identity deduplication identifies and merges records that represent the same person but were created from different sources or with different formats.',
            why: 'Duplicate identities dilute risk scores and create confusion in investigations. Clean identity data is essential for accurate ES operations.',
            examples: [
                { spl: '| inputlookup identity_lookup_expanded | stats count by email | where count > 1 | table email, count', explanation: 'Find duplicate emails in identity lookup' },
                { spl: '| inputlookup identity_lookup_expanded | stats values(identity) as identities, count by last, first | where count > 1', explanation: 'Find potential duplicates by name' },
                { spl: '| inputlookup identity_lookup_expanded | dedup identity_id | stats count', explanation: 'Count unique identities after dedup' }
            ],
            gotchas: [
                'Automate deduplication as part of identity import process',
                'Define canonical identity source (HR system typically)',
                'Preserve correlation history when merging',
                'Audit deduplication actions for compliance'
            ]
        },
        {
            id: 'es_hr_integration',
            name: 'HR System Integration',
            category: 'enterpriseSecurity',
            subcategory: 'assetIdentity',
            takeaway: 'Sync identity data from HR systems',
            what: 'HR integration imports employee data (name, department, manager, title, employment status) from HR systems to enrich ES identity lookups with authoritative business context.',
            why: 'HR systems are the authoritative source for employee identity. Integration ensures ES has accurate, current information for risk assessment and investigation.',
            examples: [
                { spl: '| inputlookup identity_lookup_expanded | stats count by bunit | sort -count', explanation: 'Identity distribution by business unit' },
                { spl: '| inputlookup identity_lookup_expanded | where startDate > relative_time(now(), "-30d") | table identity, first, last, bunit, startDate', explanation: 'Recently onboarded employees' },
                { spl: '| inputlookup identity_lookup_expanded | where endDate < now() AND endDate > relative_time(now(), "-7d") | table identity, first, last, endDate', explanation: 'Recently terminated employees' }
            ],
            gotchas: [
                'Schedule regular HR data sync (daily recommended)',
                'Handle terminated employees appropriately (don\'t delete history)',
                'Map HR fields to ES identity schema',
                'Validate HR data quality before import'
            ]
        },
        {
            id: 'es_identity_lifecycle',
            name: 'Identity Lifecycle Management',
            category: 'enterpriseSecurity',
            subcategory: 'assetIdentity',
            takeaway: 'Track identity changes from hire to termination',
            what: 'Identity lifecycle management tracks employees through hire, role changes, transfers, and termination, maintaining accurate ES data throughout their employment.',
            why: 'Stale identity data causes investigation errors and missed detections. Lifecycle management ensures ES reflects current organizational reality.',
            examples: [
                { spl: '| inputlookup identity_lookup_expanded | where category="terminated" AND watchlist="true" | table identity, first, last, endDate, watchlist_reason', explanation: 'Terminated employees on watchlist' },
                { spl: '| inputlookup identity_lookup_expanded | where managedBy!="*" | stats count by managedBy | sort -count', explanation: 'Identity reporting structure' },
                { spl: 'index=notable | lookup identity_lookup_expanded identity as user OUTPUT category | where category="terminated" | table _time, rule_name, user', explanation: 'Activity by terminated accounts' }
            ],
            gotchas: [
                'Alert on activity from terminated accounts',
                'Track role changes that affect access levels',
                'Maintain identity history for investigation lookback',
                'Integrate with identity governance for privileged accounts'
            ]
        }
];

// Sort entries alphabetically
ES_DATA.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

// ============================================
// Page Logic
// ============================================

let currentSearch = '';
let currentView = 'categorized';
let esFilters = new Set();

document.addEventListener('DOMContentLoaded', () => {
    initES();
});

function initES() {
    // Export data for global search
    window.ES_DATA = ES_DATA;

    // Initialize search
    SPLUNKed.initSearch('esSearch', {
        onSearch: (query) => {
            currentSearch = query;
            renderES();
        }
    });

    // Initialize view toggle
    SPLUNKed.initViewToggle('esView', {
        storageKey: 'splunked-es-view',
        onViewChange: (view) => {
            currentView = view;
            renderES();
        }
    });

    // Initialize icon filter
    initIconFilter('esFilter', esFilters);

    // Initialize modal
    SPLUNKed.initModal('esModal');

    // Render initial content
    renderES();

    // Add click handlers for cards
    document.addEventListener('click', handleCardClick);

    // Handle URL parameter for deep linking
    const params = new URLSearchParams(window.location.search);
    const openId = params.get('open');
    if (openId) {
        const entry = ES_DATA.find(e => e.id === openId);
        if (entry) {
            setTimeout(() => openDetailModal(entry), 100);
        }
    }
}

function initIconFilter(containerId, filterSet) {
    const filterContainer = document.getElementById(containerId);
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.icon-filter-btn');
        if (!btn) return;

        const filterValue = btn.dataset.filter;

        // Clear all active states
        filterContainer.querySelectorAll('.icon-filter-btn').forEach(b => {
            b.classList.remove('active');
        });

        // Activate clicked button
        btn.classList.add('active');

        // Update filter set
        filterSet.clear();
        if (filterValue !== 'all') {
            filterSet.add(filterValue);
        }

        renderES();
    });
}

function renderES() {
    const grid = document.getElementById('esGrid');
    if (!grid) return;

    let entries = [...ES_DATA];

    // Apply subcategory filter
    if (esFilters.size > 0) {
        entries = entries.filter(entry => esFilters.has(entry.subcategory));
    }

    // Apply search filter
    if (currentSearch) {
        const query = currentSearch.toLowerCase();
        entries = entries.filter(entry => {
            return entry.name.toLowerCase().includes(query) ||
                   entry.takeaway?.toLowerCase().includes(query) ||
                   entry.what?.toLowerCase().includes(query);
        });
    }

    // Sort
    if (currentView === 'alphabetical') {
        entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }

    // Render
    if (entries.length === 0) {
        grid.innerHTML = '';
        document.getElementById('emptyState')?.classList.remove('hidden');
    } else {
        document.getElementById('emptyState')?.classList.add('hidden');
        grid.innerHTML = entries.map(entry => createCardHTML(entry)).join('');
    }
}

const CARD_ICONS = {
    rba: { icon: '⚡', label: 'Risk-Based Alerting' },
    notable: { icon: '◉', label: 'Notable Events' },
    assetIdentity: { icon: '◎', label: 'Assets/Identity' },
    threatIntel: { icon: '⊛', label: 'Threat Intel' },
    detection: { icon: '◇', label: 'Detection' },
    operations: { icon: '⚙', label: 'Operations' }
};


function createCardHTML(entry) {
    let cardIcon = '';
    if (entry.subcategory && CARD_ICONS[entry.subcategory]) {
        const { icon, label } = CARD_ICONS[entry.subcategory];
        cardIcon = `<span class="card-icon ${entry.subcategory}" title="${label}">${icon}</span>`;
    }

    return `
        <div class="glossary-card" data-id="${entry.id}" data-category="enterpriseSecurity">
            ${cardIcon}
            <div class="glossary-card-header">
                <code class="glossary-name">${SPLUNKed.escapeHtml(entry.name)}</code>
            </div>
            <p class="glossary-takeaway">${SPLUNKed.escapeHtml(entry.takeaway)}</p>
        </div>
    `;
}

let cardHistory = [];
let currentCardEntry = null;

function handleCardClick(e) {
    const card = e.target.closest('.glossary-card');
    if (!card) return;

    const id = card.dataset.id;
    const entry = ES_DATA.find(e => e.id === id);

    if (entry) {
        cardHistory = [];
        currentCardEntry = null;
        openDetailModal(entry);
    }
}

function openDetailModal(entry) {
    const title = document.getElementById('esModalTitle');
    const content = document.getElementById('esModalContent');
    const backBtn = document.getElementById('esModalBack');

    currentCardEntry = entry;
    title.textContent = entry.name;

    if (backBtn) {
        backBtn.hidden = cardHistory.length === 0;
    }

    content.innerHTML = createDetailHTML(entry);

    SPLUNKed.applySPLHighlighting(content);
    SPLUNKed.openModal('esModal');
}

function goBackCard() {
    if (cardHistory.length > 0) {
        const previousEntry = cardHistory.pop();
        openDetailModal(previousEntry);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('esModalBack');
    if (backBtn) {
        backBtn.addEventListener('click', goBackCard);
    }
});

function createDetailHTML(entry) {
    let html = '<div class="concept-detail">';

    if (entry.what) {
        html += `
            <div class="tabbed-section section-what">
                <div class="tabbed-section-header">WHAT</div>
                <div class="tabbed-section-content">${SPLUNKed.escapeHtml(entry.what)}</div>
            </div>
        `;
    }

    if (entry.why) {
        html += `
            <div class="tabbed-section section-why">
                <div class="tabbed-section-header">WHY</div>
                <div class="tabbed-section-content">${SPLUNKed.escapeHtml(entry.why)}</div>
            </div>
        `;
    }

    if (entry.keyPoint) {
        html += `
            <div class="tabbed-section section-key">
                <div class="tabbed-section-header">KEY POINT</div>
                <div class="tabbed-section-content"><strong>${SPLUNKed.escapeHtml(entry.keyPoint)}</strong></div>
            </div>
        `;
    }

    if (entry.examples && entry.examples.length > 0) {
        html += `
            <div class="tabbed-section section-examples">
                <div class="tabbed-section-header">EXAMPLES</div>
                <div class="tabbed-section-content">
                    ${entry.examples.map(ex => `
                        <div class="example-pair">
                            <div class="spl-block">
                                <pre class="spl-code"><code>${SPLUNKed.escapeHtml(ex.spl)}</code></pre>
                            </div>
                            <p class="example-explanation">${SPLUNKed.escapeHtml(ex.explanation)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (entry.keyFields && entry.keyFields.length > 0) {
        html += `
            <div class="tabbed-section section-fields">
                <div class="tabbed-section-header">KEY FIELDS</div>
                <div class="tabbed-section-content">
                    <table class="field-table">
                        ${entry.keyFields.map(f => `
                            <tr>
                                <td><code>${SPLUNKed.escapeHtml(f.field)}</code></td>
                                <td>${SPLUNKed.escapeHtml(f.description)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        `;
    }

    if (entry.gotchas && entry.gotchas.length > 0) {
        html += `
            <div class="tabbed-section section-gotchas">
                <div class="tabbed-section-header">WATCH OUT</div>
                <div class="tabbed-section-content">
                    <ul class="warning-list">
                        ${entry.gotchas.map(g => `<li><span class="warning-icon">!</span> ${SPLUNKed.escapeHtml(g)}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    html += '</div>';

    if (entry.relatedCommands && entry.relatedCommands.length > 0) {
        html += `
            <div class="tabbed-footer" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <div class="detail-section">
                    <div class="detail-label">Related</div>
                    <div class="detail-content">
                        ${entry.relatedCommands.map(cmd => `<code>${SPLUNKed.escapeHtml(cmd)}</code>`).join(', ')}
                    </div>
                </div>
            </div>
        `;
    }

    return html;
}

})();