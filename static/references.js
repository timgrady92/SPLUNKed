/**
 * SPLUNKed - Splunk Knowledge Data and Logic
 * Contains: fundamentals (concepts, fields, extractions, macros, engineering), CIM, antipatterns
 */

// ============================================
// Category Descriptions
// ============================================

const CATEGORY_INFO = {
    concepts: {
        title: 'Splunk Concepts',
        description: 'Core concepts: indexes, events, fields, search pipelines, and how Splunk processes data.'
    },
    fields: {
        title: 'Common Fields',
        description: 'Internal fields (_time, _raw) and standard fields (host, source, sourcetype) present across events.'
    },
    extractions: {
        title: 'Field Extractions',
        description: 'Techniques to parse structured data from raw event text using regex and built-in parsers.'
    },
    macros: {
        title: 'Macros & Lookups',
        description: 'Reusable search snippets (macros) and external data enrichment (lookups).'
    },
    engineering: {
        title: 'Splunk Engineering',
        description: 'Configuration files, architecture, deployment, and administration fundamentals.'
    },
    cim: {
        title: 'CIM & Data Models',
        description: 'Normalize data across sources with Common Information Model fields and accelerated data models.'
    },
    antipatterns: {
        title: 'Pitfalls',
        description: 'Common mistakes that cause slow searches, memory issues, or incorrect results at scale.'
    }
};

// ============================================
// Tab Consolidation Mapping (3 tabs)
// ============================================

const TAB_CATEGORY_MAP = {
    fundamentals: ['concepts', 'fields', 'extractions', 'macros', 'engineering'],
    cim: ['cim'],
    antipatterns: ['antipatterns']
};

const TAB_INFO = {
    fundamentals: {
        title: 'Fundamentals',
        description: 'Core Splunk concepts, fields, extraction techniques, macros, and engineering fundamentals.'
    },
    cim: CATEGORY_INFO.cim,
    antipatterns: CATEGORY_INFO.antipatterns
};

// Map from source categories to their parent tab
const CATEGORY_TO_TAB = {};
Object.entries(TAB_CATEGORY_MAP).forEach(([tab, categories]) => {
    categories.forEach(cat => CATEGORY_TO_TAB[cat] = tab);
});

// Subcategory labels for merged tabs
const SUBCATEGORY_LABELS = {
    concepts: 'Concept',
    fields: 'Field',
    extractions: 'Extraction',
    macros: 'Macro/Lookup',
    engineering: 'Engineering',
    cim: 'CIM/Data Model'
};

// ============================================
// References Data
// ============================================

const REFERENCE_DATA = {
    extractions: [
        {
            id: 'erex_extraction',
            name: 'erex automatic extraction',
            category: 'extractions',
            takeaway: 'Machine-generated regex from examples',
            what: 'Automatically generates a regular expression based on example values you provide.',
            why: 'Helpful for quickly creating extractions when you have example values but not regex expertise.',
            syntax: 'erex <field> examples="value1,value2"',
            examples: [
                { spl: '| erex user examples="admin,jsmith,mary.jones"', explanation: 'Generate regex for username patterns' }
            ],
            performance: 'Extraction phase is slow as it generates the regex. Result regex may not be optimal.',
            gotchas: [
                'Generated regex may be overly specific or too broad',
                'Use the generated regex in rex command for better control',
                'Provide diverse examples for better results'
            ],
            relatedCommands: ['rex', 'extract']
        },
        {
            id: 'kvform_extraction',
            name: 'kvform key-value extraction',
            category: 'extractions',
            takeaway: 'Parse key=value formatted data',
            what: 'Extracts fields from data that follows key=value or key:value formats.',
            why: 'Quick extraction for well-structured log formats without writing regex.',
            syntax: 'kvform',
            examples: [
                { spl: '| kvform', explanation: 'Auto-extract all key=value pairs' },
                { spl: '| kvform pairdelim="," kvdelim="="', explanation: 'Custom delimiters' }
            ],
            gotchas: [
                'Works best with consistent key=value formatting',
                'May create many unwanted fields from complex data',
                'Use field filters to limit extracted fields'
            ],
            relatedCommands: ['rex', 'extract', 'spath']
        },
        {
            id: 'rex_extraction',
            name: 'rex field extraction',
            category: 'extractions',
            takeaway: 'Extract fields with named regex groups',
            what: 'Uses regular expressions with named capture groups to extract field values from text.',
            why: 'Most flexible extraction method for parsing unstructured or semi-structured data.',
            syntax: 'rex field=source_field "pattern_with_(?<fieldname>regex)"',
            examples: [
                { spl: '| rex field=_raw "Failed login for (?<user>\\S+) from (?<src_ip>\\d+\\.\\d+\\.\\d+\\.\\d+)"', explanation: 'Extract user and IP from auth log' },
                { spl: '| rex field=url "^https?://(?<domain>[^/]+)"', explanation: 'Extract domain from URL' }
            ],
            performance: 'CPU-intensive. Consider indexed extractions for high-volume data.',
            gotchas: [
                'Named groups use (?<name>pattern) syntax',
                'Backslashes must be doubled: \\\\d instead of \\d',
                'Default field is _raw if not specified'
            ],
            relatedCommands: ['erex', 'kvform', 'extract']
        },
        {
            id: 'spath_extraction',
            name: 'spath JSON/XML extraction',
            category: 'extractions',
            takeaway: 'Extract from JSON and XML data',
            what: 'Extracts field values from structured data formats like JSON and XML.',
            why: 'Essential for modern log formats that embed structured data.',
            syntax: 'spath [input=field] [path=json.path] [output=fieldname]',
            examples: [
                { spl: '| spath', explanation: 'Auto-extract all JSON fields' },
                { spl: '| spath input=json_data path=user.name output=username', explanation: 'Extract specific JSON path' },
                { spl: '| spath path=response.items{}', explanation: 'Extract array elements' }
            ],
            gotchas: [
                'Auto-mode can create many fields - use specific paths in production',
                'Nested objects use dot notation: object.nested.field',
                'Array access uses {}: items{}.name'
            ],
            relatedCommands: ['rex', 'kvform', 'xmlkv']
        },
        {
            id: 'field_alias',
            name: 'alias',
            category: 'extractions',
            takeaway: 'Persistent field renaming defined in props.conf',
            what: 'Field aliases in props.conf provide persistent, search-time field renames. Defines alternative names for existing fields without modifying the data.',
            why: 'Normalize field names across different data sources at search time. Makes searches consistent without re-indexing.',
            examples: [
                { spl: '[myapp:logs]\nFIELDALIAS-user = username AS user', explanation: 'Create user alias for username field' },
                { spl: '[firewall:traffic]\nFIELDALIAS-src = source_address AS src_ip', explanation: 'Normalize IP field name' }
            ],
            gotchas: [
                'Defined in props.conf, not in search',
                'Original field still exists - alias is additional name',
                'Requires app deployment or Splunk restart to take effect',
                'Use rename command for one-time renames in search'
            ],
            relatedCommands: ['rename', 'props.conf', 'eval']
        }
],

    fields: [
        {
            id: 'field_time',
            name: '_time',
            category: 'fields',
            subcategory: 'index-time',
            takeaway: 'Event timestamp in epoch format',
            what: 'The timestamp of the event in epoch time (seconds since January 1, 1970).',
            why: 'Fundamental for time-based analysis, sorting, and filtering. Every event has a _time.',
            examples: [
                { spl: '| where _time > relative_time(now(), "-1h")', explanation: 'Events from last hour' },
                { spl: '| eval event_date=strftime(_time, "%Y-%m-%d")', explanation: 'Format timestamp' }
            ],
            gotchas: [
                'Always in epoch format - use strftime() to display',
                'Set at index time - cannot be changed later',
                'Use earliest/latest for time range filtering (more efficient)'
            ]
        },
        {
            id: 'field_raw',
            name: '_raw',
            category: 'fields',
            subcategory: 'index-time',
            takeaway: 'Original event text',
            what: 'The original, unprocessed text of the event exactly as it was received.',
            why: 'Source for field extractions, debugging, and viewing complete event data.',
            examples: [
                { spl: '| rex field=_raw "error: (?<error_msg>.*)"', explanation: 'Extract from raw event' },
                { spl: '| table _time, _raw', explanation: 'View original events' }
            ],
            gotchas: [
                'Contains the complete event as indexed',
                'Large _raw values impact performance',
                'Extractions are more efficient than searching _raw'
            ]
        },
        {
            id: 'field_host',
            name: 'host',
            category: 'fields',
            subcategory: 'index-time',
            takeaway: 'Origin host of the event',
            what: 'The hostname or IP address of the system that generated the event.',
            why: 'Essential for identifying event sources, filtering by system, and infrastructure analysis.',
            examples: [
                { spl: 'index=main host=webserver*', explanation: 'Filter to web servers' },
                { spl: '| stats count by host | sort -count', explanation: 'Event count by host' }
            ],
            gotchas: [
                'Set at index time from input configuration',
                'May be IP or hostname depending on setup',
                'Can be overridden in props.conf/transforms.conf'
            ]
        },
        {
            id: 'field_source',
            name: 'source',
            category: 'fields',
            subcategory: 'index-time',
            takeaway: 'Input path or source identifier',
            what: 'The input source of the data, typically a file path, script, or network input.',
            why: 'Useful for filtering by log file, debugging data flow, and understanding data origins.',
            examples: [
                { spl: 'source=/var/log/auth.log', explanation: 'Filter to specific log file' },
                { spl: '| stats count by source', explanation: 'Count by data source' }
            ],
            gotchas: [
                'Full path for file-based inputs',
                'Script name for scripted inputs',
                'Can be long - use wildcards: source=*auth*'
            ]
        },
        {
            id: 'field_sourcetype',
            name: 'sourcetype',
            category: 'fields',
            subcategory: 'index-time',
            takeaway: 'Data format classification',
            what: 'The format or type of the data, which determines how Splunk parses the events.',
            why: 'Critical for proper parsing, field extraction, and filtering by data type.',
            examples: [
                { spl: 'sourcetype=syslog', explanation: 'Filter to syslog format' },
                { spl: '| stats count by sourcetype | sort -count', explanation: 'Data volume by type' }
            ],
            gotchas: [
                'Determines parsing rules and field extractions',
                'Should be consistent for similar data',
                'Custom sourcetypes defined in props.conf'
            ]
        },
        {
            id: 'field_index',
            name: 'index',
            category: 'fields',
            subcategory: 'index-time',
            takeaway: 'Data storage container',
            what: 'The index (database) where the event is stored.',
            why: 'Fundamental for data organization, access control, and search efficiency.',
            examples: [
                { spl: 'index=security', explanation: 'Search security index' },
                { spl: 'index=main OR index=security', explanation: 'Multiple indexes' }
            ],
            gotchas: [
                'Always specify index for faster searches',
                'Default search uses allowed indexes only',
                'Access controlled by roles and permissions'
            ]
        },
        // ========== COMMONLY EXTRACTED FIELDS ==========
        {
            id: 'field_user',
            name: 'user',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'The person or account that performed an action',
            what: 'Identifies who performed an action - a username, account name, or identity. One of the most frequently searched fields in security investigations.',
            why: 'Essential for tracking user activity, investigating incidents, and answering "who did this?"',
            examples: [
                { spl: 'index=security user=jsmith', explanation: 'Find all activity for user jsmith' },
                { spl: 'index=auth action=failed | stats count by user | sort -count', explanation: 'Users with most failed logins' },
                { spl: 'index=* user=admin OR user=root', explanation: 'Track privileged account usage' }
            ],
            gotchas: [
                'Field name varies by source: user, username, userName, AccountName, etc.',
                'May contain domain prefix: DOMAIN\\\\user or user@domain.com',
                'Service accounts and system accounts appear here too',
                'Case sensitivity depends on the source system'
            ],
            relatedFields: ['src_user', 'dest_user', 'AccountName']
        },
        {
            id: 'field_src_ip',
            name: 'src_ip / src',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'Where the connection or request came from',
            what: 'The source IP address - where network traffic, authentication attempts, or requests originated. Critical for identifying attackers and tracing activity.',
            why: 'Answers "where did this come from?" - essential for firewall analysis, auth logs, and threat hunting.',
            examples: [
                { spl: 'index=firewall src_ip=192.168.1.100', explanation: 'Traffic from a specific internal IP' },
                { spl: 'index=auth action=failed | stats count by src_ip | sort -count', explanation: 'IPs with most failed logins' },
                { spl: 'index=proxy src_ip=10.0.0.* | stats dc(url) by src_ip', explanation: 'Unique sites visited per internal IP' }
            ],
            gotchas: [
                'Field name varies: src_ip, src, source_ip, SrcIP, c-ip (IIS)',
                'May be IPv4 or IPv6',
                'NAT can obscure true source - check for X-Forwarded-For',
                'Internal IPs (10.x, 192.168.x, 172.16-31.x) vs external'
            ],
            relatedFields: ['dest_ip', 'src', 'source_address']
        },
        {
            id: 'field_dest_ip',
            name: 'dest_ip / dest',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'Where the connection or request went to',
            what: 'The destination IP address - where network traffic or requests were sent. Used to identify what systems were accessed or attacked.',
            why: 'Answers "where did this go?" - essential for identifying accessed resources, data exfiltration, and lateral movement.',
            examples: [
                { spl: 'index=firewall dest_ip=8.8.8.8', explanation: 'Traffic to Google DNS' },
                { spl: 'index=firewall action=blocked | stats count by dest_ip | sort -count', explanation: 'Most blocked destinations' },
                { spl: 'index=proxy src_ip=192.168.1.100 | stats values(dest_ip) as destinations', explanation: 'Where did this host connect?' }
            ],
            gotchas: [
                'Field name varies: dest_ip, dest, dest_address, dst, DstIP',
                'For web logs, this is usually your server (less interesting)',
                'External dest_ip in outbound traffic = potential exfil target',
                'Use iplocation to map IPs to countries'
            ],
            relatedFields: ['src_ip', 'dest', 'destination_address']
        },
        {
            id: 'field_action',
            name: 'action',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'What happened - success, failure, blocked, allowed',
            what: 'Describes the outcome or type of action taken. Common values include success/failure, allowed/blocked, login/logout, create/delete.',
            why: 'Critical for filtering to just failures, blocks, or specific action types. Turns raw logs into meaningful security events.',
            examples: [
                { spl: 'index=auth action=failed', explanation: 'Failed authentication attempts' },
                { spl: 'index=firewall action=blocked | stats count by src_ip', explanation: 'Who is getting blocked?' },
                { spl: 'index=security action=* | stats count by action', explanation: 'See all action types in your data' }
            ],
            gotchas: [
                'Values vary wildly: success/failure, allow/deny, blocked/permitted, 0/1',
                'Check what values exist: | stats count by action',
                'Some sources use status instead of action',
                'May need to normalize: eval action=lower(action)'
            ],
            relatedFields: ['status', 'result', 'outcome', 'EventType']
        },
        {
            id: 'field_status',
            name: 'status',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'HTTP status codes and response outcomes',
            what: 'For web/proxy logs, the HTTP status code (200, 404, 500, etc.). For other logs, may indicate success/failure status.',
            why: 'Quickly filter to errors (status>=400), successes (status=200), or specific issues (status=503 for service unavailable).',
            examples: [
                { spl: 'index=web status>=500', explanation: 'Server errors' },
                { spl: 'index=web status=404 | stats count by uri', explanation: 'Most common "not found" pages' },
                { spl: 'index=proxy status=403', explanation: 'Forbidden/blocked requests' }
            ],
            gotchas: [
                '2xx = success, 3xx = redirect, 4xx = client error, 5xx = server error',
                'Field may be status, status_code, sc-status (IIS), response_code',
                'A 200 status doesn\'t mean the request was legitimate',
                '401/403 often indicate access control issues'
            ],
            relatedFields: ['action', 'response_code', 'sc-status']
        },
        {
            id: 'field_bytes',
            name: 'bytes',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'Amount of data transferred',
            what: 'The number of bytes sent or received in a connection. Used to measure data volume, detect large transfers, and identify potential data exfiltration.',
            why: 'Large byte counts can indicate file downloads, data theft, or unusual activity. Essential for bandwidth monitoring and DLP.',
            examples: [
                { spl: 'index=proxy | stats sum(bytes) as total_bytes by user | sort -total_bytes', explanation: 'Top bandwidth users' },
                { spl: 'index=firewall bytes>10000000', explanation: 'Transfers over 10MB' },
                { spl: 'index=proxy | timechart sum(bytes) by user', explanation: 'Bandwidth usage over time' }
            ],
            gotchas: [
                'May be split: bytes_in/bytes_out, sent_bytes/received_bytes',
                'Values are typically in bytes - divide by 1024 for KB, 1048576 for MB',
                'High bytes to external IPs = potential data exfiltration',
                'Check both directions: uploads vs downloads'
            ],
            relatedFields: ['bytes_in', 'bytes_out', 'content_length', 'sc-bytes']
        },
        {
            id: 'field_url',
            name: 'url / uri',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'The web address or resource path accessed',
            what: 'The URL or URI of the resource accessed. May be full URL (https://example.com/path) or just the path (/path/to/resource).',
            why: 'Essential for web investigations - what sites were visited, what files were downloaded, what API endpoints were called.',
            examples: [
                { spl: 'index=proxy url=*malware*', explanation: 'URLs containing "malware"' },
                { spl: 'index=web uri="/admin/*"', explanation: 'Admin page access' },
                { spl: 'index=proxy | stats count by url | sort -count | head 20', explanation: 'Top 20 visited URLs' }
            ],
            gotchas: [
                'url usually = full URL, uri usually = just the path',
                'May be URL-encoded: %20 = space, %2F = /',
                'Query strings (?param=value) may be separate field',
                'Case sensitivity varies - normalize with lower(url)'
            ],
            relatedFields: ['uri', 'uri_path', 'cs-uri-stem', 'request']
        },
        {
            id: 'field_process',
            name: 'process / process_name',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'The program or executable that ran',
            what: 'The name of the process or executable. Critical for endpoint security - identifying what programs ran on a system.',
            why: 'Detect malicious executables, track software usage, and investigate what ran during an incident.',
            examples: [
                { spl: 'index=endpoint process_name=powershell.exe', explanation: 'PowerShell executions' },
                { spl: 'index=sysmon EventCode=1 | stats count by process_name | sort -count', explanation: 'Most run processes' },
                { spl: 'index=endpoint process_name=*.exe | rare process_name', explanation: 'Unusual executables' }
            ],
            gotchas: [
                'May include full path or just filename',
                'Field names vary: process, process_name, Image, NewProcessName, exe',
                'Attackers rename malware to look legitimate (svchost.exe in wrong location)',
                'Check parent process for context on how it was launched'
            ],
            relatedFields: ['Image', 'NewProcessName', 'ParentProcessName', 'exe']
        },
        {
            id: 'field_commandline',
            name: 'CommandLine',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'The full command that was executed',
            what: 'The complete command line including executable and all arguments. Shows exactly what was run, including parameters, flags, and targets.',
            why: 'The most valuable field for detecting malicious activity. Reveals encoded commands, suspicious arguments, and attack techniques.',
            examples: [
                { spl: 'index=endpoint CommandLine=*-encodedcommand*', explanation: 'Encoded PowerShell (often malicious)' },
                { spl: 'index=endpoint CommandLine=*password* OR CommandLine=*credential*', explanation: 'Credential access attempts' },
                { spl: 'index=sysmon EventCode=1 | table _time, user, process_name, CommandLine', explanation: 'Process execution timeline' }
            ],
            gotchas: [
                'Can be very long - may be truncated in some sources',
                'Field names vary: CommandLine, command_line, cmd, process_command_line',
                'Attackers use encoding, obfuscation, and special characters to evade detection',
                'Always check alongside parent process and user context'
            ],
            relatedFields: ['command_line', 'cmd', 'ParentCommandLine']
        },
        {
            id: 'field_eventcode',
            name: 'EventCode / EventID',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'Windows Event ID - the most important field for Windows security',
            what: 'A numeric identifier for the type of Windows event. Each EventCode represents a specific action like login (4624), failed login (4625), or process creation (4688).',
            why: 'THE most critical field for Windows security analysis. Knowing key EventCodes lets you quickly find logins, account changes, process executions, and security events.',
            examples: [
                { spl: 'index=security EventCode=4625', explanation: 'Failed login attempts' },
                { spl: 'index=security EventCode=4624 Logon_Type=10', explanation: 'Remote desktop logins' },
                { spl: 'index=security EventCode IN (4720, 4722, 4723, 4724, 4725, 4726)', explanation: 'Account management events' },
                { spl: 'index=sysmon EventCode=1', explanation: 'Process creation (Sysmon)' }
            ],
            gotchas: [
                'Windows Security log uses EventCode; some apps use EventID - check your data',
                'Same EventCode can mean different things in different Windows logs',
                'Sysmon has its own EventCode numbering (1-26) separate from Windows',
                'Keep a cheat sheet of critical EventCodes handy'
            ],
            relatedFields: ['EventID', 'event_id', 'signature_id'],
            keyEventCodes: [
                { code: '4624', meaning: 'Successful login' },
                { code: '4625', meaning: 'Failed login' },
                { code: '4688', meaning: 'Process created' },
                { code: '4689', meaning: 'Process terminated' },
                { code: '4672', meaning: 'Admin/special privileges assigned' },
                { code: '4720', meaning: 'User account created' },
                { code: '4726', meaning: 'User account deleted' },
                { code: '4732', meaning: 'User added to security group' },
                { code: '4648', meaning: 'Explicit credential login (runas)' },
                { code: '1102', meaning: 'Audit log cleared' }
            ]
        },
        {
            id: 'field_dest_port',
            name: 'dest_port / src_port',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'Network port numbers - what service or application is being used',
            what: 'The destination port (dest_port) identifies what service is being accessed. The source port (src_port) is typically random and less useful.',
            why: 'Ports tell you what protocol or service is involved. Port 443 = HTTPS, port 22 = SSH, port 3389 = RDP. Unusual ports may indicate malicious activity.',
            examples: [
                { spl: 'index=firewall dest_port=3389', explanation: 'Remote desktop traffic' },
                { spl: 'index=firewall dest_port!=443 dest_port!=80 | stats count by dest_port', explanation: 'Non-web traffic by port' },
                { spl: 'index=firewall dest_port>1024 dest_port<65535 | rare dest_port', explanation: 'Unusual high ports' },
                { spl: 'index=network dest_port IN (20, 21, 22, 23, 3389) | stats count by dest_port, src_ip', explanation: 'Administrative protocol usage' }
            ],
            gotchas: [
                'Source port is usually random (ephemeral) - focus on dest_port',
                'Field names vary: dest_port, dport, dst_port, DestinationPort',
                'Port 80/443 can tunnel anything - don\'t assume it\'s legitimate web traffic',
                'High ports (>1024) are not inherently suspicious, but uncommon ones may be'
            ],
            relatedFields: ['dport', 'dst_port', 'sport', 'DestinationPort', 'SourcePort'],
            commonPorts: [
                { port: '22', service: 'SSH' },
                { port: '23', service: 'Telnet (insecure)' },
                { port: '25', service: 'SMTP (email)' },
                { port: '53', service: 'DNS' },
                { port: '80', service: 'HTTP' },
                { port: '443', service: 'HTTPS' },
                { port: '445', service: 'SMB (file sharing)' },
                { port: '3389', service: 'RDP (Remote Desktop)' },
                { port: '5985/5986', service: 'WinRM (PowerShell remoting)' }
            ]
        },
        {
            id: 'field_severity',
            name: 'severity / priority',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'How serious is this event?',
            what: 'Indicates the importance or urgency of an event. Common values: critical, high, medium, low, informational (or numeric 1-5).',
            why: 'Filter to high-priority events first. During incidents, focus on critical/high severity. For tuning, review low-severity noise.',
            examples: [
                { spl: 'index=alerts severity=critical', explanation: 'Critical alerts only' },
                { spl: 'index=security | stats count by severity | sort -count', explanation: 'Alert distribution by severity' },
                { spl: 'index=ids severity IN (critical, high) | stats count by signature', explanation: 'High-priority IDS alerts' },
                { spl: 'index=alerts severity!=informational earliest=-1h', explanation: 'Non-info alerts in last hour' }
            ],
            gotchas: [
                'Field names vary: severity, priority, level, urgency, risk',
                'Values vary: critical/high/medium/low OR 1/2/3/4/5 OR P1/P2/P3',
                'Check what values exist: | stats count by severity',
                'A "critical" from one source may not equal "critical" from another'
            ],
            relatedFields: ['priority', 'level', 'urgency', 'risk_score', 'threat_level']
        },
        {
            id: 'field_message',
            name: 'message / Message',
            category: 'fields',
            subcategory: 'extracted',
            takeaway: 'Human-readable event description',
            what: 'A text description of what happened, often auto-generated by the source system. Contains the narrative explanation of the event.',
            why: 'When you need to understand what an event means, the message field explains it in plain language. Essential for unfamiliar event types.',
            examples: [
                { spl: 'index=security | search message=*failed*', explanation: 'Events with "failed" in message' },
                { spl: 'index=application message=*error* | stats count by message', explanation: 'Group similar error messages' },
                { spl: 'index=security EventCode=4625 | table _time, user, src_ip, message', explanation: 'Include message for context' },
                { spl: 'index=syslog | rex field=message "user=(?<extracted_user>\\w+)"', explanation: 'Extract data from message text' }
            ],
            gotchas: [
                'Field names vary: message, Message, msg, description, summary',
                'May contain structured data you can extract with rex',
                'Long messages may be truncated in display - expand to see full text',
                'Similar events may have slightly different messages - use wildcards or rex'
            ],
            relatedFields: ['msg', 'description', 'summary', 'event_description']
        }
    ],

    concepts: [
        {
            id: 'concept_apps',
            name: 'Apps and Add-ons',
            category: 'concepts',
            subcategory: 'customization',
            takeaway: 'Packaged functionality for specific use cases',
            what: 'Apps are packages containing dashboards, searches, and configurations for specific use cases. Add-ons (TAs) provide data inputs and field extractions for specific data sources.',
            why: 'Apps let you extend Splunk with pre-built solutions instead of building everything from scratch. The Splunk community shares thousands of apps.',
            keyPoint: 'Apps = interfaces and functionality. Add-ons (TAs) = data collection and parsing.',
            types: ['Apps (dashboards, reports)', 'Technology Add-ons (TAs)', 'Supporting Add-ons (SAs)'],
            gotchas: [
                'Apps can only see knowledge objects within themselves (unless shared globally)',
                'Some apps require specific add-ons for data',
                'Check Splunkbase for community apps'
            ],
            relatedConcepts: ['concept_knowledge_objects', 'concept_field_extraction']
        },
        {
            id: 'concept_events',
            name: 'Events',
            category: 'concepts',
            subcategory: 'data-fundamentals',
            takeaway: 'A single record or log entry in Splunk',
            what: 'An event is a single piece of data in Splunk - typically one log entry, one transaction, or one record. It\'s the basic unit of data you search and analyze.',
            why: 'Everything in Splunk revolves around events. When you search, you\'re finding events. When you count, you\'re counting events.',
            keyPoint: 'Each event has a timestamp (_time), raw text (_raw), and extracted fields.',
            examples: [
                { spl: 'index=security | head 1', explanation: 'Look at a single event' },
                { spl: 'index=security | table _time, _raw', explanation: 'See time and raw text' },
                { spl: 'index=security | stats count', explanation: 'Count total events' }
            ],
            gotchas: [
                'One line doesn\'t always equal one event - multiline events exist',
                'Fields like _time and _raw are "hidden" by default in the UI',
                'The same event text could have different extracted fields based on sourcetype'
            ],
            relatedConcepts: ['concept_fields', 'concept_time', 'concept_sourcetype']
        },
        {
            id: 'concept_field_extraction',
            name: 'Field Extraction',
            category: 'concepts',
            subcategory: 'customization',
            takeaway: 'How Splunk parses fields from raw event text',
            what: 'Field extraction is the process of identifying and parsing structured values (fields) from unstructured event text. This happens automatically for common patterns and can be customized.',
            why: 'Good field extraction is the foundation of useful searching. Without extracted fields, you\'re limited to text searches.',
            keyPoint: 'Splunk automatically extracts key=value pairs. Custom patterns need regex or the Field Extractor tool.',
            methods: ['Automatic key=value recognition', 'Field Extractor UI tool', 'rex command in search', 'props.conf/transforms.conf'],
            examples: [
                { spl: '| rex field=_raw "user=(?<username>\\w+)"', explanation: 'Extract username with regex' },
                { spl: '| extract', explanation: 'Force automatic KV extraction' }
            ],
            gotchas: [
                'Extractions are tied to sourcetypes',
                'Index-time extractions are faster but require re-indexing to change',
                'Search-time extractions are flexible but slower'
            ],
            relatedConcepts: ['concept_fields', 'concept_knowledge_objects', 'concept_sourcetype']
        },
        {
            id: 'concept_fields',
            name: 'Fields',
            category: 'concepts',
            subcategory: 'data-fundamentals',
            takeaway: 'Named values extracted from your events',
            what: 'Fields are named pieces of information extracted from events. Like columns in a spreadsheet - each field has a name (user, src_ip, action) and a value (jsmith, 192.168.1.1, login).',
            why: 'Fields let you search precisely, filter accurately, and aggregate meaningfully. Instead of searching raw text, you can say "show me events where user=admin".',
            keyPoint: 'Field names are case-sensitive. Field=value searches are precise and fast.',
            examples: [
                { spl: 'index=security user=admin', explanation: 'Search where field equals value' },
                { spl: 'index=security | stats count by user', explanation: 'Aggregate by field' },
                { spl: 'index=security | table user, src_ip, action', explanation: 'Display specific fields' }
            ],
            gotchas: [
                'Field names are CASE-SENSITIVE: User ≠ user ≠ USER',
                'Field values are case-insensitive by default in searches',
                'A field might not exist in every event'
            ],
            relatedConcepts: ['concept_events', 'concept_field_extraction', 'concept_knowledge_objects']
        },
        {
            id: 'concept_index',
            name: 'Indexes',
            category: 'concepts',
            subcategory: 'data-organization',
            takeaway: 'Containers that store your data in Splunk',
            what: 'An index is a repository where Splunk stores your data. Think of it as a folder or database that holds related events.',
            why: 'Understanding indexes helps you search efficiently. Specifying the right index dramatically speeds up searches and ensures you\'re looking at the correct data.',
            keyPoint: 'Always specify an index in your searches to avoid searching everything.',
            examples: [
                { spl: 'index=security', explanation: 'Search only the security index' },
                { spl: 'index=main OR index=security', explanation: 'Search multiple indexes' },
                { spl: '| eventcount summarize=false index=*', explanation: 'List all indexes you can access' }
            ],
            gotchas: [
                'Omitting index searches ALL indexes you have access to - very slow',
                'Index names are case-sensitive',
                'Your admin controls which indexes you can access via roles'
            ],
            relatedConcepts: ['concept_sourcetype', 'concept_events', 'concept_fields']
        },
        {
            id: 'concept_knowledge_objects',
            name: 'Knowledge Objects',
            category: 'concepts',
            subcategory: 'customization',
            takeaway: 'Saved configurations that enrich and organize your data',
            what: 'Knowledge objects are saved configurations that define how data is interpreted, enriched, and displayed. They include saved searches, field extractions, lookups, alerts, dashboards, and more.',
            why: 'Knowledge objects let you build reusable components, share work with others, and customize how Splunk interprets your specific data.',
            keyPoint: 'Knowledge objects are the building blocks for turning raw data into actionable intelligence.',
            types: ['Field extractions', 'Field aliases', 'Calculated fields', 'Lookups', 'Event types', 'Tags', 'Saved searches', 'Macros'],
            gotchas: [
                'Knowledge objects belong to apps - check which app you\'re in',
                'Permissions control who can see/use each object',
                'Objects can be private, app-scoped, or global'
            ],
            relatedConcepts: ['concept_field_extraction', 'concept_apps']
        },
        {
            id: 'concept_accelerations',
            name: 'Search Acceleration',
            category: 'concepts',
            subcategory: 'performance',
            takeaway: 'Pre-computed summaries for fast searches',
            what: 'Search acceleration pre-computes and stores search results so future searches are dramatically faster. This includes report acceleration, data model acceleration, and summary indexing.',
            why: 'Without acceleration, dashboards over large datasets can be unusably slow. Acceleration makes them respond in seconds instead of minutes.',
            keyPoint: 'Acceleration trades storage space for search speed - summaries must be stored and kept updated.',
            types: ['Report Acceleration', 'Data Model Acceleration', 'Summary Indexing'],
            examples: [
                { spl: '| tstats count FROM datamodel=Authentication BY user', explanation: 'Use accelerated data model - very fast' }
            ],
            gotchas: [
                'Acceleration takes time to build initially',
                'Summaries consume disk space',
                'Not all searches can be accelerated',
                'Accelerated data may be slightly behind real-time'
            ],
            relatedConcepts: ['concept_knowledge_objects', 'concept_streaming']
        },
        {
            id: 'concept_search_modes',
            name: 'Search Modes',
            category: 'concepts',
            subcategory: 'search-mechanics',
            takeaway: 'Fast, Smart, or Verbose - balance speed vs detail',
            what: 'Splunk has three search modes that control how much field extraction happens: Fast (minimal), Smart (automatic), and Verbose (everything).',
            why: 'The right search mode balances speed and field availability. Fast mode can be 10x faster when you don\'t need all fields.',
            keyPoint: 'Use Fast mode for counting and stats. Use Verbose when you need to see all possible fields.',
            modes: [
                { name: 'Fast', description: 'Only extracts fields needed for your search. Fastest.' },
                { name: 'Smart', description: 'Default. Extracts fields based on your search.' },
                { name: 'Verbose', description: 'Extracts ALL possible fields. Slowest but complete.' }
            ],
            gotchas: [
                'Fast mode may hide fields you didn\'t explicitly reference',
                'Dashboard searches often run in Fast mode automatically',
                'Mode selector is in the search bar (to the left of the time picker)'
            ],
            relatedConcepts: ['concept_fields', 'concept_field_extraction', 'concept_pipeline']
        },
        {
            id: 'concept_pipeline',
            name: 'Search Pipeline',
            category: 'concepts',
            subcategory: 'search-mechanics',
            takeaway: 'Commands flow left to right via pipe (|)',
            what: 'SPL processes data through a pipeline where each command receives the output of the previous command. The pipe symbol (|) connects commands.',
            why: 'Understanding the pipeline is fundamental to writing effective searches. Data flows through each command in sequence, being transformed at each step.',
            keyPoint: 'Think of it like an assembly line: data enters, gets processed by each command in order, and results come out.',
            examples: [
                { spl: 'index=main | stats count by host | sort -count | head 10', explanation: 'Pipeline: search → aggregate → sort → limit' },
                { spl: 'index=security | where action="failure" | stats count by user', explanation: 'Pipeline: search → filter → aggregate' }
            ],
            gotchas: [
                'Order matters! Filtering before stats processes fewer events',
                'Each pipe creates a new "table" of data',
                'After transforming commands (stats), original events are gone'
            ],
            relatedConcepts: ['concept_streaming', 'concept_search_modes']
        },
        {
            id: 'concept_sourcetype',
            name: 'Sourcetypes',
            category: 'concepts',
            subcategory: 'data-organization',
            takeaway: 'Defines what kind of data it is and how to parse it',
            what: 'A sourcetype tells Splunk what format the data is in - like a file type label. It determines how Splunk breaks data into events and extracts fields.',
            why: 'The right sourcetype means Splunk correctly parses timestamps, breaks events properly, and extracts the right fields automatically.',
            keyPoint: 'Sourcetype determines how your data is parsed and what fields are available.',
            examples: [
                { spl: 'index=security sourcetype=WinEventLog:Security', explanation: 'Windows Security Event logs' },
                { spl: 'sourcetype=syslog', explanation: 'Standard syslog format' },
                { spl: 'index=* | stats count by sourcetype', explanation: 'See all sourcetypes in your data' }
            ],
            gotchas: [
                'Sourcetype names are case-sensitive',
                'Wrong sourcetype = wrong field extractions and timestamps',
                'Custom sourcetypes may exist for your organization\'s specific applications'
            ],
            relatedConcepts: ['concept_index', 'concept_fields', 'concept_events']
        },
        {
            id: 'concept_architecture',
            name: 'Splunk Architecture',
            category: 'concepts',
            subcategory: 'infrastructure',
            takeaway: 'How Splunk components work together',
            what: 'Splunk consists of components that collect data (forwarders), store and index data (indexers), and run searches (search heads). These can all be on one server or distributed across many.',
            why: 'Understanding architecture helps you troubleshoot issues, understand search performance, and communicate with your Splunk admins.',
            keyPoint: 'Forwarders collect → Indexers store → Search Heads search. Simple setups combine these on one server.',
            components: ['Universal Forwarder (UF)', 'Heavy Forwarder (HF)', 'Indexer', 'Search Head', 'Deployment Server', 'License Master'],
            gotchas: [
                'Distributed searches run on multiple indexers in parallel',
                'Search head sends query to indexers, combines results',
                'Your Splunk instance might be any of these architectures'
            ],
            relatedConcepts: ['concept_streaming', 'concept_accelerations']
        },
        {
            id: 'concept_streaming',
            name: 'Streaming vs Transforming',
            category: 'concepts',
            subcategory: 'search-mechanics',
            takeaway: 'Command types affect where/how they run',
            what: 'Streaming commands process events one at a time as they flow through. Transforming commands need ALL events before producing results.',
            why: 'Understanding this distinction helps you write faster searches and troubleshoot performance issues.',
            keyPoint: 'Streaming = "Do this to each event". Transforming = "Look at all events and summarize".',
            streamingCommands: ['where', 'eval', 'rex', 'fields', 'rename'],
            transformingCommands: ['stats', 'sort', 'dedup', 'top', 'rare', 'timechart'],
            gotchas: [
                'After a transforming command, original events are replaced by summary rows',
                'eventstats and streamstats are special - they add stats without replacing events',
                'Put streaming commands BEFORE transforming commands for efficiency'
            ],
            relatedConcepts: ['concept_pipeline', 'concept_search_modes', 'concept_accelerations']
        },
        {
            id: 'concept_subsearch',
            name: 'Subsearches',
            category: 'concepts',
            subcategory: 'search-mechanics',
            takeaway: 'Nested searches in square brackets [ ]',
            what: 'A subsearch is a search enclosed in square brackets that runs first. Its results are injected into the outer (main) search.',
            why: 'Subsearches let you dynamically filter data based on another search. Find a list of values in one search and use them in another.',
            keyPoint: 'Subsearch runs FIRST and completes BEFORE the main search uses its results.',
            examples: [
                { spl: 'index=web [search index=threats | fields ip | format]', explanation: 'Filter web logs to only IPs found in threats' },
                { spl: 'index=main user=[search index=hr department="IT" | return 100 user]', explanation: 'Find events for IT department users' }
            ],
            gotchas: [
                'Default limits: 60 seconds, 10,000 results',
                'Use return or format to shape output properly',
                'For large datasets, consider join, lookup, or stats instead'
            ],
            relatedConcepts: ['concept_pipeline', 'concept_knowledge_objects']
        },
        {
            id: 'concept_time',
            name: 'Time in Splunk',
            category: 'concepts',
            subcategory: 'data-fundamentals',
            takeaway: 'The _time field is central to everything in Splunk',
            what: 'Every event has a timestamp stored in the _time field. This is when the event occurred (not when it was indexed). Time is fundamental to how Splunk organizes and searches data.',
            why: 'Time-based searching is Splunk\'s superpower. You can quickly find events from specific periods, see trends over time, and correlate events that happened together.',
            keyPoint: 'Always set an appropriate time range - it\'s the most important search optimization.',
            examples: [
                { spl: 'index=security earliest=-1h', explanation: 'Events from the last hour' },
                { spl: 'index=security earliest=-24h latest=-1h', explanation: '24 hours ago until 1 hour ago' },
                { spl: 'index=security earliest=-1d@d latest=@d', explanation: 'All of yesterday' }
            ],
            timeModifiers: [
                { modifier: '-1h', description: 'One hour ago' },
                { modifier: '-15m', description: '15 minutes ago' },
                { modifier: '-7d', description: '7 days ago' },
                { modifier: '@d', description: 'Snap to start of today (midnight)' },
                { modifier: '-1d@d', description: 'Yesterday at midnight' }
            ],
            gotchas: [
                'Searching "All Time" is extremely slow on large indexes',
                'Time picker in UI overrides earliest/latest in your search',
                '_time is in epoch seconds internally, displayed in your timezone'
            ],
            relatedConcepts: ['concept_events', 'concept_pipeline']
        }
],

    cim: [
        {
            id: 'cim_authentication',
            name: 'Authentication Data Model',
            category: 'cim',
            takeaway: 'Normalized login/logoff events',
            what: 'Data model for authentication events including logins, logoffs, and failures.',
            why: 'Essential for security monitoring, user behavior analysis, and compliance reporting.',
            examples: [
                { spl: '| tstats count from datamodel=Authentication where action=failure by user', explanation: 'Failed auth by user' },
                { spl: 'tag=authentication action=success | stats count by user, src', explanation: 'Successful logins' }
            ],
            gotchas: [
                'Key fields: user, src, dest, action, app',
                'action values: success, failure, error',
                'Requires proper CIM mapping of source data'
            ]
        },
        {
            id: 'cim_overview',
            name: 'Common Information Model',
            category: 'cim',
            takeaway: 'Normalized field names across data sources',
            what: 'A methodology for normalizing field names and event categories across different data sources.',
            why: 'Enables consistent analysis across vendors, simplified correlation, and reusable detections.',
            examples: [
                { spl: 'tag=authentication action=failure', explanation: 'CIM-compliant auth search' },
                { spl: '| from datamodel:Authentication.Authentication', explanation: 'Use data model directly' }
            ],
            gotchas: [
                'Requires data to be CIM-mapped via field aliases or calculated fields',
                'CIM app provides data models and documentation',
                'Not all fields required - implement what you use'
            ],
            relatedCommands: ['tstats', 'datamodel', 'from']
        },
        {
            id: 'cim_endpoint',
            name: 'Endpoint Data Model',
            category: 'cim',
            takeaway: 'Normalized endpoint activity',
            what: 'Data model covering processes, services, file system, and registry activity on endpoints.',
            why: 'Critical for endpoint detection and response, threat hunting, and incident investigation.',
            examples: [
                { spl: '| tstats count from datamodel=Endpoint.Processes by Processes.process_name', explanation: 'Process execution counts' },
                { spl: 'tag=process parent_process_name=cmd.exe', explanation: 'Find cmd.exe child processes' }
            ],
            gotchas: [
                'Key fields: process_name, parent_process_name, user, process_path',
                'Requires detailed endpoint telemetry (Sysmon, EDR)',
                'Multiple sub-models: Processes, Services, Filesystem, Registry'
            ]
        },
        {
            id: 'cim_network',
            name: 'Network Traffic Data Model',
            category: 'cim',
            takeaway: 'Normalized network flow data',
            what: 'Data model for network traffic including flows, connections, and sessions.',
            why: 'Enables network visibility, threat detection, and traffic analysis across vendors.',
            examples: [
                { spl: '| tstats sum(bytes) from datamodel=Network_Traffic by src_ip, dest_ip', explanation: 'Bytes transferred' },
                { spl: 'tag=network action=blocked', explanation: 'Blocked connections' }
            ],
            gotchas: [
                'Key fields: src_ip, dest_ip, src_port, dest_port, bytes, action',
                'action values: allowed, blocked, dropped',
                'Transport field for protocol (tcp, udp, icmp)'
            ]
        }
],

    macros: [
        {
            id: 'kvstore_lookup',
            name: 'KV Store Lookups',
            category: 'macros',
            takeaway: 'Dynamic, updatable lookups',
            what: 'Key-value store collections that can be queried and updated via REST API or SPL.',
            why: 'Enables dynamic lookup data, state tracking, and integration with external systems.',
            examples: [
                { spl: '| inputlookup my_kvstore_lookup', explanation: 'Query KV Store' },
                { spl: '| outputlookup my_kvstore_lookup append=true', explanation: 'Append to KV Store' }
            ],
            gotchas: [
                'Must be defined in collections.conf and transforms.conf',
                'Supports CRUD operations via REST API',
                'Can be modified during search with outputlookup'
            ],
            relatedCommands: ['inputlookup', 'outputlookup', 'lookup']
        },
        {
            id: 'lookup_basics',
            name: 'Lookup Tables',
            category: 'macros',
            takeaway: 'Enrich events with reference data',
            what: 'CSV or KV Store tables that add context to events based on field matching.',
            why: 'Essential for adding metadata, GeoIP, threat intel, asset info, and user details.',
            examples: [
                { spl: '| lookup user_info.csv user OUTPUT department', explanation: 'Add department to events' },
                { spl: '| inputlookup threat_indicators.csv', explanation: 'Query lookup directly' }
            ],
            gotchas: [
                'CSV lookups: static files, easy to create',
                'KV Store lookups: dynamic, can be updated programmatically',
                'Automatic lookups: applied at search time without explicit command'
            ],
            relatedCommands: ['lookup', 'inputlookup', 'outputlookup']
        },
        {
            id: 'macro_arguments',
            name: 'Macro Arguments',
            category: 'macros',
            takeaway: 'Parameterized search templates',
            what: 'Macros can accept arguments that are substituted at search time.',
            why: 'Enables flexible, reusable search patterns with customizable parameters.',
            syntaxNote: 'Definition: args = arg1, arg2  →  Usage: `macro_name(value1, value2)`',
            examples: [
                { spl: '`search_user(main, admin)`', explanation: 'Call macro with index and user params (definition: index=$index$ user=$user$)' },
                { spl: '`last_hours(24)`', explanation: 'Call time-based macro (definition: earliest=-$hours$h latest=now)' }
            ],
            gotchas: [
                'Argument count in name: macro_name(2) means 2 arguments',
                'Arguments are string substitution - quote carefully',
                'Validate arguments to prevent injection'
            ]
        },
        {
            id: 'macro_basics',
            name: 'Macro Basics',
            category: 'macros',
            takeaway: 'Reusable search snippets',
            what: 'Named search fragments that can be reused across multiple searches using backtick syntax.',
            why: 'Promotes code reuse, consistency, and maintainability across searches and dashboards.',
            syntaxNote: 'Call with backticks: `macro_name` or `macro_name(arg1, arg2)`',
            examples: [
                { spl: '`security_index` | stats count by user', explanation: 'Macro for index/filter' },
                { spl: '`get_user_activity(jsmith)`', explanation: 'Macro with argument' }
            ],
            gotchas: [
                'Defined in macros.conf or via Settings > Advanced search > Search macros',
                'Arguments use $arg$ syntax in definition',
                'Macros can call other macros (nesting limit applies)'
            ]
        }
],

    antipatterns: [
        {
            id: 'antipattern_subsearch',
            name: 'Subsearch Overuse',
            category: 'antipatterns',
            takeaway: 'Avoid subsearches for large datasets',
            what: 'Over-relying on subsearches when better alternatives exist.',
            why: 'Subsearches have built-in limits (10K results, 60s timeout) that cause silent data loss.',
            examples: [
                { spl: 'BAD: index=main [search index=users | fields user] - Limited to 10K users', explanation: 'May silently drop users' },
                { spl: 'BETTER: index=main | join user [search index=users]', explanation: 'Join has higher limits' },
                { spl: 'BEST: index=main | lookup users.csv user', explanation: 'Lookup for static data' }
            ],
            gotchas: [
                'Subsearch limits are silent - no error when exceeded',
                'Use stats, join, or lookups for large correlations',
                'Check Job Inspector to verify subsearch didn\'t truncate'
            ]
        },
        {
            id: 'antipattern_wildcards',
            name: 'Leading Wildcards',
            category: 'antipatterns',
            takeaway: 'Avoid wildcards at start of search terms',
            what: 'Using wildcards at the beginning of search terms forces full scan of all data.',
            why: 'Leading wildcards cannot use the index and dramatically slow searches.',
            examples: [
                { spl: 'BAD: index=main *error*', explanation: 'Cannot use index efficiently' },
                { spl: 'BETTER: index=main sourcetype=app error', explanation: 'Narrow first, then search' },
                { spl: 'OK: index=main error*', explanation: 'Trailing wildcard can use index' }
            ],
            gotchas: [
                'Trailing wildcards (error*) are OK',
                'Middle wildcards (err*or) act like leading wildcards',
                'Use specific field searches when possible'
            ]
        },
        {
            id: 'antipattern_alltime',
            name: 'All Time Searches',
            category: 'antipatterns',
            takeaway: 'Always specify time ranges',
            what: 'Running searches without time bounds scans all historical data.',
            why: 'Unbounded searches are slow, resource-intensive, and may hit result limits.',
            examples: [
                { spl: 'BAD: index=main | stats count by user', explanation: 'Scans all time' },
                { spl: 'BETTER: index=main earliest=-24h | stats count by user', explanation: 'Bounded to last day' }
            ],
            gotchas: [
                'Default time range in Splunk Web may not be what you expect',
                'Use earliest/latest in the search for explicit control',
                'Scheduled searches should always have explicit time ranges'
            ]
        },
        {
            id: 'antipattern_fields',
            name: 'Fetching Unnecessary Fields',
            category: 'antipatterns',
            takeaway: 'Remove unneeded fields early',
            what: 'Carrying all fields through the entire search pipeline when only a few are needed.',
            why: 'Extra fields consume memory and slow down processing, especially with large events.',
            examples: [
                { spl: 'BAD: index=main | stats count by user, src_ip | table user, count', explanation: 'Carried src_ip unnecessarily' },
                { spl: 'BETTER: index=main | fields user | stats count by user', explanation: 'Remove unneeded fields first' }
            ],
            gotchas: [
                'Use "fields" command early to keep only needed fields',
                'Especially important when _raw is large (full packet capture, etc)',
                '"fields - _raw" removes raw event if not needed'
            ]
        },
        {
            id: 'antipattern_transaction',
            name: 'Transaction Overuse',
            category: 'antipatterns',
            takeaway: 'Use stats instead of transaction when possible',
            what: 'Using transaction command when stats could achieve the same result.',
            why: 'Transaction is memory-intensive and slow compared to stats-based alternatives.',
            examples: [
                { spl: 'SLOW: | transaction user startswith="login" endswith="logout" | eval duration=duration', explanation: 'Memory-heavy' },
                { spl: 'FASTER: | stats earliest(_time) as start, latest(_time) as end by user, session | eval duration=end-start', explanation: 'Stats-based' }
            ],
            gotchas: [
                'Transaction creates multivalue fields and groups events in memory',
                'Stats can often calculate the same metrics more efficiently',
                'Use transaction only when you need the grouped events themselves'
            ]
        }
    ],

    engineering: [
        {
            id: 'eng-props-conf',
            name: 'props.conf',
            category: 'engineering',
            takeaway: 'Configure field extractions, timestamps, and line breaking per sourcetype',
            what: 'The primary configuration file for defining how Splunk parses and extracts data at index time and search time. Controls timestamp recognition, line breaking, field extractions, and source type definitions.',
            why: 'Essential for proper data parsing. Without correct props.conf settings, events may be merged incorrectly, timestamps may be wrong, and fields may not extract properly.',
            examples: [
                { spl: '[myapp:logs]\nTIME_FORMAT = %Y-%m-%d %H:%M:%S\nTIME_PREFIX = timestamp=\nLINE_BREAKER = ([\\r\\n]+)\nSHOULD_LINEMERGE = false', explanation: 'Basic sourcetype definition with timestamp and line breaking' },
                { spl: '[myapp:logs]\nEXTRACT-user = user=(?<user>\\w+)\nEXTRACT-action = action=(?<action>\\w+)', explanation: 'Search-time field extractions using regex' },
                { spl: '[myapp:logs]\nTRANSFORMS-routing = route_to_index\nTRANSFORMS-mask = mask_credit_cards', explanation: 'Reference transforms.conf for routing and masking' }
            ],
            gotchas: [
                'Index-time vs search-time: EXTRACT- is search-time, REPORT- references transforms for index-time',
                'Changes to index-time settings require re-indexing data',
                'Line breaking issues are the most common data onboarding problem',
                'Test with btool: ./splunk btool props list myapp:logs --debug'
            ],
            relatedCommands: ['transforms.conf', 'inputs.conf']
        },
        {
            id: 'eng-transforms-conf',
            name: 'transforms.conf',
            category: 'engineering',
            takeaway: 'Define complex extractions, lookups, routing, and data masking rules',
            what: 'Works with props.conf to define reusable extraction rules, lookup table definitions, index-time routing, and sensitive data masking. More powerful than inline extractions.',
            why: 'Needed for complex regex extractions, routing data to different indexes, masking sensitive data like credit cards or SSNs, and defining automatic lookups.',
            examples: [
                { spl: '[extract_fields]\nREGEX = user=(?<user>\\w+).*status=(?<status>\\d+)\nFORMAT = user::$1 status::$2', explanation: 'Named extraction stanza' },
                { spl: '[route_to_index]\nREGEX = severity=ERROR\nDEST_KEY = _MetaData:Index\nFORMAT = error_index', explanation: 'Route matching events to a different index' },
                { spl: '[mask_credit_cards]\nREGEX = \\b(\\d{4})[- ]?(\\d{4})[- ]?(\\d{4})[- ]?(\\d{4})\\b\nFORMAT = XXXX-XXXX-XXXX-$4\nDEST_KEY = _raw', explanation: 'Mask credit card numbers, keeping last 4 digits' }
            ],
            gotchas: [
                'Stanza names in transforms.conf are referenced by TRANSFORMS- or REPORT- in props.conf',
                'DEST_KEY = _raw modifies the raw event (use carefully)',
                'Index-time transforms are more efficient but require re-indexing to change',
                'Lookup definitions here enable automatic lookup in props.conf'
            ],
            relatedCommands: ['props.conf', 'lookup']
        },
        {
            id: 'eng-inputs-conf',
            name: 'inputs.conf',
            category: 'engineering',
            takeaway: 'Configure data inputs: files, network ports, scripts, and APIs',
            what: 'Defines what data Splunk collects and how. Configures file monitoring, network inputs (TCP/UDP), scripted inputs, HTTP Event Collector (HEC), and modular inputs.',
            why: 'The starting point for all data ingestion. Without inputs.conf, Splunk has no data to index.',
            examples: [
                { spl: '[monitor:///var/log/myapp/*.log]\nindex = main\nsourcetype = myapp:logs\ndisabled = false', explanation: 'Monitor a directory for log files' },
                { spl: '[tcp://514]\nconnection_host = dns\nsourcetype = syslog\nindex = network', explanation: 'Listen for syslog on TCP port 514' },
                { spl: '[script://./bin/myinput.py]\ninterval = 300\nsourcetype = custom:metrics\nindex = metrics', explanation: 'Run a script every 5 minutes' },
                { spl: '[http://mytoken]\ntoken = your-hec-token-here\nindex = main\nsourcetype = httpevent', explanation: 'HTTP Event Collector input' }
            ],
            gotchas: [
                'Use forwarders for production data collection, not indexers directly',
                'disabled = false is required to enable the input',
                'File inputs track position in fishbucket - delete to re-index',
                'Network inputs on ports below 1024 require root/admin privileges'
            ],
            relatedCommands: ['props.conf', 'outputs.conf']
        },
        {
            id: 'eng-outputs-conf',
            name: 'outputs.conf',
            category: 'engineering',
            takeaway: 'Configure where forwarders send data: indexers, load balancing, SSL',
            what: 'Defines forwarding behavior for Universal and Heavy Forwarders. Configures target indexers, load balancing, SSL encryption, and data routing.',
            why: 'Critical for distributed Splunk deployments. Controls data flow from forwarders to indexers and ensures high availability.',
            examples: [
                { spl: '[tcpout]\ndefaultGroup = indexers\n\n[tcpout:indexers]\nserver = idx1:9997, idx2:9997, idx3:9997\nautoLBFrequency = 30', explanation: 'Load balance across three indexers' },
                { spl: '[tcpout:indexers]\nserver = idx1:9997, idx2:9997\nuseSSL = true\nsslCertPath = $SPLUNK_HOME/etc/auth/server.pem\nsslPassword = password', explanation: 'SSL-encrypted forwarding' },
                { spl: '[indexAndForward]\nindex = true\n\n[tcpout:remote]\nserver = remote-idx:9997', explanation: 'Heavy forwarder: index locally AND forward' }
            ],
            gotchas: [
                'autoLB (automatic load balancing) switches between indexers periodically',
                'useACK = true ensures data delivery confirmation (slower but safer)',
                'Forwarders queue data locally if indexers are unavailable',
                'Check forwarder queue sizes during outages to prevent data loss'
            ],
            relatedCommands: ['inputs.conf', 'Splunk Architecture']
        },
        {
            id: 'eng-indexes-conf',
            name: 'indexes.conf',
            category: 'engineering',
            takeaway: 'Define indexes with storage paths, retention policies, and sizing',
            what: 'Creates and configures Splunk indexes. Controls storage locations, retention periods, bucket sizes, and data model acceleration settings.',
            why: 'Indexes are the fundamental storage unit in Splunk. Proper configuration affects search performance, storage costs, and compliance requirements.',
            examples: [
                { spl: '[security]\nhomePath = $SPLUNK_DB/security/db\ncoldPath = $SPLUNK_DB/security/colddb\nthawedPath = $SPLUNK_DB/security/thaweddb\nfrozenTimePeriodInSecs = 31536000', explanation: 'Create security index with 1-year retention' },
                { spl: '[security]\nmaxTotalDataSizeMB = 500000\nmaxDataSize = auto_high_volume\ncoldToFrozenDir = /archive/security', explanation: 'Size limits and archiving' },
                { spl: '[metrics]\ndatatype = metric\nmaxTotalDataSizeMB = 100000', explanation: 'Metrics index (optimized for metric data)' }
            ],
            gotchas: [
                'Default retention is 6 years - usually too long, costs storage',
                'frozenTimePeriodInSecs defines retention; coldToFrozenDir archives instead of deletes',
                'Metrics indexes require datatype = metric and different storage',
                'Index changes require restart; adding new index is safe, changing existing is risky'
            ],
            relatedCommands: ['props.conf', 'Data Onboarding']
        },
        {
            id: 'eng-architecture',
            name: 'Splunk Architecture',
            category: 'engineering',
            takeaway: 'Understand indexers, search heads, forwarders, and deployment patterns',
            what: 'Splunk deployments consist of forwarders (collect data), indexers (store and search), and search heads (user interface). Can scale from single instance to distributed clusters.',
            why: 'Understanding architecture is essential for troubleshooting, capacity planning, and designing resilient deployments.',
            examples: [
                { spl: 'Single Instance: All roles on one server. Good for labs, small deployments (<50GB/day).', explanation: 'Simplest deployment' },
                { spl: 'Distributed: Separate search heads and indexers. Forwarders send to indexer cluster. 50-500GB/day.', explanation: 'Mid-size production' },
                { spl: 'Clustered: Search head cluster + indexer cluster + deployment server. High availability, 500GB+/day.', explanation: 'Enterprise deployment' }
            ],
            gotchas: [
                'Universal Forwarder = lightweight, no parsing. Heavy Forwarder = can parse, filter, route',
                'License is based on daily indexed volume, not stored volume',
                'Search heads need fast disks for search artifacts, indexers need lots of storage',
                'Network bandwidth between forwarders and indexers is critical'
            ],
            relatedCommands: ['Deployment Server', 'Indexer Clustering', 'Search Head Clustering']
        },
        {
            id: 'eng-data-onboarding',
            name: 'Data Onboarding',
            category: 'engineering',
            takeaway: 'The process of getting data into Splunk correctly parsed and indexed',
            what: 'Data onboarding involves identifying data sources, installing forwarders, configuring inputs, defining sourcetypes, setting up parsing rules, and validating data quality.',
            why: 'Garbage in, garbage out. Poor data onboarding leads to broken timestamps, merged events, missing fields, and frustrated analysts.',
            examples: [
                { spl: '1. Identify source → 2. Sample data → 3. Create sourcetype → 4. Configure inputs → 5. Test parsing → 6. Deploy to production', explanation: 'Basic onboarding workflow' },
                { spl: 'Common sourcetypes: syslog, WinEventLog:Security, access_combined, aws:cloudtrail, pan:traffic', explanation: 'Splunk has built-in parsing for common formats' },
                { spl: '| metadata type=sourcetypes index=main | table sourcetype, totalCount, firstTime, lastTime', explanation: 'Check what sourcetypes exist in an index' }
            ],
            gotchas: [
                'Always test with sample data before production deployment',
                'Check _time is correct - wrong timestamps break time-based searches',
                'Verify event boundaries - look for events that should be multi-line',
                'Add Technology Add-ons (TAs) for common data sources instead of custom parsing'
            ],
            relatedCommands: ['props.conf', 'inputs.conf', 'transforms.conf']
        },
        {
            id: 'eng-forwarder-types',
            name: 'Universal vs Heavy Forwarder',
            category: 'engineering',
            takeaway: 'Choose the right forwarder type based on parsing, filtering, and routing needs',
            what: 'Universal Forwarder (UF) is lightweight, sends raw data. Heavy Forwarder (HF) can parse, filter, route, and modify data before forwarding. Both forward to indexers.',
            why: 'UFs are easier to deploy and manage at scale. HFs provide flexibility for complex data manipulation before indexing.',
            examples: [
                { spl: 'Universal Forwarder: 50MB install, minimal CPU/memory, no local parsing, no web UI, ideal for endpoints', explanation: 'Use for most data collection' },
                { spl: 'Heavy Forwarder: Full Splunk install with forwarding enabled, can run searches, parse data, apply transforms', explanation: 'Use for aggregation points, parsing, filtering' },
                { spl: 'Use case: UFs on 1000 servers → 2 HFs for aggregation/parsing → Indexer cluster', explanation: 'Tiered forwarding architecture' }
            ],
            gotchas: [
                'UF cannot modify _raw, apply complex transforms, or run searches',
                'HF requires more resources and a Splunk license (forwarder license is free)',
                'Intermediate HF adds latency but reduces indexer parsing load',
                'Consider Splunk Connect for Syslog for high-volume syslog aggregation'
            ],
            relatedCommands: ['outputs.conf', 'inputs.conf', 'Splunk Architecture']
        },
        {
            id: 'eng-deployment-server',
            name: 'Deployment Server',
            category: 'engineering',
            takeaway: 'Centrally manage forwarder configurations with server classes and apps',
            what: 'Deployment server pushes configuration apps to forwarders based on server classes. Forwarders check in periodically (deployment clients) to receive updates.',
            why: 'Managing hundreds or thousands of forwarders individually is impossible. Deployment server enables centralized, consistent configuration management.',
            examples: [
                { spl: '[serverClass:windows_servers]\nwhitelist.0 = *.windows.domain.com\n\n[serverClass:windows_servers:app:Splunk_TA_windows]\nrestartSplunkd = true', explanation: 'serverclass.conf - deploy Windows TA to Windows hosts' },
                { spl: '$SPLUNK_HOME/etc/deployment-apps/\n├── Splunk_TA_windows/\n├── Splunk_TA_nix/\n├── custom_outputs/\n└── custom_inputs/', explanation: 'Deployment apps directory structure' },
                { spl: './splunk reload deploy-server', explanation: 'Reload after changing deployment apps' }
            ],
            gotchas: [
                'Deployment server is NOT for deploying to indexers or search heads (use deployer/master)',
                'Forwarders must be configured as deployment clients with deploymentclient.conf',
                'Changes require reload: splunk reload deploy-server',
                'Test with a small server class before deploying broadly'
            ],
            relatedCommands: ['Splunk Architecture', 'Universal vs Heavy Forwarder']
        },
        {
            id: 'eng-indexer-cluster',
            name: 'Indexer Clustering',
            category: 'engineering',
            takeaway: 'Replicate data across indexers for high availability and disaster recovery',
            what: 'Indexer cluster replicates data across multiple indexers (peers) managed by a cluster manager. Provides data redundancy and search availability even when indexers fail.',
            why: 'Production Splunk deployments need data protection. Indexer clustering prevents data loss and maintains search availability during failures.',
            examples: [
                { spl: 'Replication Factor (RF) = 3: Each bucket stored on 3 indexers. Survive 2 indexer failures.', explanation: 'Data redundancy setting' },
                { spl: 'Search Factor (SF) = 2: Searchable copies on 2 indexers. Faster searches, more storage.', explanation: 'Search availability setting' },
                { spl: '[clustering]\nmode = manager\nreplication_factor = 3\nsearch_factor = 2\npass4SymmKey = your_secret_key', explanation: 'Cluster manager server.conf' }
            ],
            gotchas: [
                'RF and SF require that many indexers minimum (RF=3 needs 3+ peers)',
                'Storage multiplies by RF - plan capacity accordingly',
                'Cluster manager is single point of failure for cluster management (not searching)',
                'Rolling restart required for many configuration changes'
            ],
            relatedCommands: ['Splunk Architecture', 'Search Head Clustering']
        },
        {
            id: 'eng-search-head-cluster',
            name: 'Search Head Clustering',
            category: 'engineering',
            takeaway: 'Replicate knowledge objects and provide search high availability',
            what: 'Search head cluster replicates saved searches, dashboards, and knowledge objects across multiple search heads. Provides user-facing high availability.',
            why: 'Single search head is a bottleneck and single point of failure. Clustering enables horizontal scaling and continuous availability.',
            examples: [
                { spl: 'Captain: Elected leader that coordinates replication and scheduling', explanation: 'One SH is captain at any time' },
                { spl: 'Deployer: Pushes apps to all cluster members (like deployment server for SHs)', explanation: 'Centralized app management' },
                { spl: '[shclustering]\npass4SymmKey = your_secret_key\nreplication_factor = 2\nshcluster_label = shcluster1', explanation: 'Search head server.conf' }
            ],
            gotchas: [
                'Minimum 3 search heads for proper captain election',
                'Use deployer for apps, not individual SH configuration',
                'Some apps are not cluster-compatible - check before deploying',
                'Load balancer in front of SHC for user access'
            ],
            relatedCommands: ['Splunk Architecture', 'Indexer Clustering']
        },
        {
            id: 'eng-btool',
            name: 'btool',
            category: 'engineering',
            takeaway: 'Debug and validate Splunk configuration files',
            what: 'Command-line tool to check effective configuration after layering (default → system/local → app). Shows which file provides each setting.',
            why: 'Configuration problems are common. btool helps identify which file is setting (or overriding) a value and validates syntax.',
            examples: [
                { spl: './splunk btool props list myapp:logs --debug', explanation: 'Show all props.conf settings for a sourcetype with file locations' },
                { spl: './splunk btool inputs list --debug | grep monitor', explanation: 'Find all monitor inputs and their source files' },
                { spl: './splunk btool check', explanation: 'Validate all configuration files for syntax errors' }
            ],
            gotchas: [
                '--debug shows file paths, essential for troubleshooting',
                'btool shows effective config, not what you expect - helps find overrides',
                'Run as splunk user to see correct file permissions',
                'btool check finds syntax errors but not logic errors'
            ],
            relatedCommands: ['props.conf', 'transforms.conf', 'inputs.conf']
        },
        {
            id: 'eng-license',
            name: 'License Management',
            category: 'engineering',
            takeaway: 'Understand Splunk licensing based on daily indexed volume',
            what: 'Splunk licenses are based on daily ingestion volume (GB/day). License manager tracks usage. Violations occur when you exceed your license for multiple days.',
            why: 'License violations disable searching until resolved. Understanding licensing prevents unexpected outages and helps with capacity planning.',
            examples: [
                { spl: 'index=_internal source=*license_usage.log type=Usage | timechart span=1d sum(b) as bytes | eval GB=bytes/1024/1024/1024', explanation: 'Track daily license usage' },
                { spl: 'License pools: Group licenses together. Stacking: Add multiple licenses for more capacity.', explanation: 'License management concepts' },
                { spl: 'Violation: 5 warnings in 30-day window = search disabled until admin resets', explanation: 'Violation consequences' }
            ],
            gotchas: [
                'Forwarder license is free (no indexing), Enterprise license required for indexers',
                'Internal indexes (_internal, _audit) count toward license',
                'Dev/Test licenses have lower limits - dont use in production',
                'Monitor license usage trends to predict when you need more capacity'
            ],
            relatedCommands: ['Splunk Architecture', 'indexes.conf']
        }
    ]
};

// Sort all entries alphabetically
Object.keys(REFERENCE_DATA).forEach((category) => {
    REFERENCE_DATA[category].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
});

// ============================================
// Splunk Knowledge Page Logic
// ============================================

let currentCategory = 'fundamentals';
let currentSearch = '';
let currentView = 'categorized';

// Multi-select filter states (empty Set = show all)
let fundamentalsFilters = new Set();

document.addEventListener('DOMContentLoaded', () => {
    initReferences();
});

function initReferences() {
    // Export data for global search
    window.REFERENCE_DATA = REFERENCE_DATA;
    window.REF_TAB_CATEGORY_MAP = TAB_CATEGORY_MAP;
    window.REF_CATEGORY_TO_TAB = CATEGORY_TO_TAB;

    // Initialize tabs
    const storageKey = 'splunked-references-tab';
    const tabController = SPLUNKed.initTabs('#referencesTabs', {
        storageKey: storageKey,
        onTabChange: (category) => {
            currentCategory = category;
            renderReferences();
        }
    });

    // Handle URL parameters for deep linking
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');
    const openId = params.get('open');

    if (urlTab && TAB_CATEGORY_MAP[urlTab]) {
        currentCategory = urlTab;
        if (tabController) {
            tabController.activateTab(urlTab);
        }
    } else {
        const savedTab = localStorage.getItem(storageKey);
        if (savedTab && TAB_CATEGORY_MAP[savedTab]) {
            currentCategory = savedTab;
        }
    }

    // Initialize search
    SPLUNKed.initSearch('referencesSearch', {
        onSearch: (query) => {
            currentSearch = query;
            renderReferences();
        }
    });

    // Initialize view toggle
    SPLUNKed.initViewToggle('referencesView', {
        storageKey: 'splunked-references-view',
        onViewChange: (view) => {
            currentView = view;
            renderReferences();
        }
    });

    // Initialize icon filters
    initIconFilter('fundamentalsFilter', fundamentalsFilters);

    // Initialize modal
    SPLUNKed.initModal('referencesModal');

    // Render initial content
    renderAllCategories();

    // Add click handlers for cards
    document.addEventListener('click', handleCardClick);

    // Open specific entry if requested via URL
    if (openId) {
        const entry = findEntryById(openId);
        if (entry) {
            setTimeout(() => openDetailModal(entry), 100);
        }
    }
}

// Unified icon filter initialization
function initIconFilter(containerId, filterSet) {
    const filterContainer = document.getElementById(containerId);
    if (!filterContainer) return;

    const allBtn = filterContainer.querySelector('[data-filter="all"]');
    const filterBtns = filterContainer.querySelectorAll('[data-filter]:not([data-filter="all"])');

    function updateAllButton() {
        if (allBtn) {
            const allActive = filterSet.size === 0;
            allBtn.classList.toggle('active', allActive);
        }
    }

    if (allBtn) {
        allBtn.addEventListener('click', () => {
            filterSet.clear();
            filterBtns.forEach(btn => btn.classList.remove('active'));
            updateAllButton();
            renderReferences();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            if (filterSet.has(filter)) {
                filterSet.delete(filter);
                btn.classList.remove('active');
            } else {
                filterSet.add(filter);
                btn.classList.add('active');
            }
            updateAllButton();
            renderReferences();
        });
    });
}

function renderAllCategories() {
    Object.keys(TAB_CATEGORY_MAP).forEach(tabCategory => {
        renderCategoryGrid(tabCategory);
    });
}

function renderReferences() {
    renderCategoryGrid(currentCategory);
}

function renderCategoryGrid(tabCategory) {
    const gridId = `${tabCategory}Grid`;
    const infoId = `${tabCategory}Info`;
    const grid = document.getElementById(gridId);
    const infoContainer = document.getElementById(infoId);

    if (!grid) return;

    // Get all source categories for this tab
    const sourceCategories = TAB_CATEGORY_MAP[tabCategory] || [tabCategory];

    // Render category info
    if (infoContainer) {
        const tabInfo = TAB_INFO[tabCategory] || CATEGORY_INFO[tabCategory];
        if (tabInfo) {
            infoContainer.innerHTML = `
                <h2 class="category-title">${tabInfo.title}</h2>
                <p class="category-description">${tabInfo.description}</p>
            `;
        }
    }

    // Get the filter set for this tab
    let filterSet = new Set();
    if (tabCategory === 'fundamentals') filterSet = fundamentalsFilters;

    // Collect and filter entries from all source categories
    let allEntries = [];
    sourceCategories.forEach(cat => {
        const entries = REFERENCE_DATA[cat] || [];
        entries.forEach(entry => {
            allEntries.push({ ...entry, _sourceCategory: cat });
        });
    });

    // Apply search filter
    if (currentSearch) {
        const query = currentSearch.toLowerCase();
        allEntries = allEntries.filter(entry => {
            return entry.name.toLowerCase().includes(query) ||
                   entry.takeaway?.toLowerCase().includes(query) ||
                   entry.what?.toLowerCase().includes(query);
        });
    }

    // Apply icon filter based on tab type
    if (filterSet.size > 0) {
        if (tabCategory === 'fundamentals') {
            allEntries = allEntries.filter(entry => filterSet.has(entry._sourceCategory));
        }
    }

    // Sort
    if (currentView === 'alphabetical') {
        allEntries.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }

    // Render
    if (allEntries.length === 0) {
        grid.innerHTML = '';
        document.getElementById('emptyState')?.classList.remove('hidden');
    } else {
        document.getElementById('emptyState')?.classList.add('hidden');

        const showSubcategory = sourceCategories.length > 1 && currentView === 'alphabetical';
        grid.innerHTML = allEntries.map(entry => createCardHTML(entry, showSubcategory)).join('');
    }
}

// Unified icon mapping for all card categories
const CARD_ICONS = {
    fields: { icon: '⬚', label: 'Field' },
    concepts: { icon: '◆', label: 'Concept' },
    cim: { icon: '⧉', label: 'CIM' },
    extractions: { icon: '⋔', label: 'Extraction' },
    macros: { icon: '{ }', label: 'Macro' },
    engineering: { icon: '⚙', label: 'Engineering' },
    antipatterns: { icon: '⚠', label: 'Pitfall' }
};

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createCardHTML(entry, showSubcategory = false) {
    const entryCategory = entry._sourceCategory || entry.category;

    let cardIcon = '';
    if (CARD_ICONS[entryCategory]) {
        const { icon, label } = CARD_ICONS[entryCategory];
        cardIcon = `<span class="card-icon ${entryCategory}" title="${label}">${icon}</span>`;
    }

    return `
        <div class="glossary-card" data-id="${entry.id}" data-category="${entry.category}">
            ${cardIcon}
            <div class="glossary-card-header">
                <code class="glossary-name">${escapeHtml(entry.name)}</code>
            </div>
            <p class="glossary-takeaway">${escapeHtml(entry.takeaway)}</p>
        </div>
    `;
}

// Card navigation history
let cardHistory = [];
let currentCardEntry = null;

function handleCardClick(e) {
    const card = e.target.closest('.glossary-card');
    if (!card) return;

    const id = card.dataset.id;
    const category = card.dataset.category;
    const entry = REFERENCE_DATA[category]?.find(e => e.id === id);

    if (entry) {
        cardHistory = [];
        currentCardEntry = null;
        openDetailModal(entry);
    }
}

function findEntryById(id) {
    for (const category of Object.keys(REFERENCE_DATA)) {
        const entry = REFERENCE_DATA[category].find(e => e.id === id);
        if (entry) return entry;
    }
    return null;
}

function openDetailModal(entry) {
    const title = document.getElementById('referencesModalTitle');
    const content = document.getElementById('referencesModalContent');
    const backBtn = document.getElementById('referencesModalBack');

    currentCardEntry = entry;
    title.textContent = entry.name;

    if (backBtn) {
        backBtn.hidden = cardHistory.length === 0;
    }

    content.innerHTML = createConceptHTML(entry);
    initConceptLinks(content);

    SPLUNKed.applySPLHighlighting(content);
    SPLUNKed.openModal('referencesModal');
}

function goBackCard() {
    if (cardHistory.length > 0) {
        const previousEntry = cardHistory.pop();
        openDetailModal(previousEntry);
    }
}

// Initialize back button
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('referencesModalBack');
    if (backBtn) {
        backBtn.addEventListener('click', goBackCard);
    }
});

function createConceptHTML(entry) {
    let html = '<div class="concept-detail">';

    // WHAT section
    if (entry.what) {
        html += `
            <div class="tabbed-section section-what">
                <div class="tabbed-section-header">WHAT</div>
                <div class="tabbed-section-content">${escapeHtml(entry.what)}</div>
            </div>
        `;
    }

    // WHY section
    if (entry.why) {
        html += `
            <div class="tabbed-section section-why">
                <div class="tabbed-section-header">WHY</div>
                <div class="tabbed-section-content">${escapeHtml(entry.why)}</div>
            </div>
        `;
    }

    // KEY POINT section
    if (entry.keyPoint) {
        html += `
            <div class="tabbed-section section-key">
                <div class="tabbed-section-header">KEY POINT</div>
                <div class="tabbed-section-content"><strong>${escapeHtml(entry.keyPoint)}</strong></div>
            </div>
        `;
    }

    // SYNTAX section (code block for actual SPL)
    if (entry.syntax) {
        html += `
            <div class="tabbed-section section-syntax">
                <div class="tabbed-section-header">SYNTAX</div>
                <div class="tabbed-section-content">
                    <pre class="spl-example">${escapeHtml(entry.syntax)}</pre>
                </div>
            </div>
        `;
    }

    // SYNTAX NOTE section (plain text for patterns/descriptions)
    if (entry.syntaxNote) {
        html += `
            <div class="tabbed-section section-syntax">
                <div class="tabbed-section-header">USAGE</div>
                <div class="tabbed-section-content">
                    <p class="syntax-note">${escapeHtml(entry.syntaxNote)}</p>
                </div>
            </div>
        `;
    }

    // EXAMPLES section
    if (entry.examples && entry.examples.length > 0) {
        html += `
            <div class="tabbed-section section-examples">
                <div class="tabbed-section-header">EXAMPLES</div>
                <div class="tabbed-section-content">
                    ${entry.examples.map(ex => `
                        <div class="example-pair">
                            <div class="spl-block">
                                <pre class="spl-code"><code>${escapeHtml(ex.spl)}</code></pre>
                            </div>
                            <p class="example-explanation">${escapeHtml(ex.explanation)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // GOTCHAS section
    if (entry.gotchas && entry.gotchas.length > 0) {
        html += `
            <div class="tabbed-section section-gotchas">
                <div class="tabbed-section-header">WATCH OUT</div>
                <div class="tabbed-section-content">
                    <ul class="warning-list">
                        ${entry.gotchas.map(g => `<li><span class="warning-icon">!</span> ${escapeHtml(g)}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    // KEY FIELDS section (ES-specific)
    if (entry.keyFields && entry.keyFields.length > 0) {
        html += `
            <div class="tabbed-section section-fields">
                <div class="tabbed-section-header">KEY FIELDS</div>
                <div class="tabbed-section-content">
                    <table class="field-table">
                        ${entry.keyFields.map(f => `
                            <tr>
                                <td><code>${escapeHtml(f.field)}</code></td>
                                <td>${escapeHtml(f.description)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        `;
    }

    // PERFORMANCE section
    if (entry.performance) {
        html += `
            <div class="tabbed-section section-perf">
                <div class="tabbed-section-header">PERFORMANCE</div>
                <div class="tabbed-section-content">${escapeHtml(entry.performance)}</div>
            </div>
        `;
    }

    html += '</div>';

    // Footer with Related commands
    if (entry.relatedCommands && entry.relatedCommands.length > 0) {
        html += `
            <div class="tabbed-footer" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <div class="detail-section">
                    <div class="detail-label">Related</div>
                    <div class="detail-content">
                        ${entry.relatedCommands.map(cmd => `<code>${escapeHtml(cmd)}</code>`).join(', ')}
                    </div>
                </div>
            </div>
        `;
    }

    // Footer with Related concepts
    if (entry.relatedConcepts && entry.relatedConcepts.length > 0) {
        const relatedNames = entry.relatedConcepts.map(id => {
            const concept = REFERENCE_DATA.concepts?.find(c => c.id === id);
            return concept ? concept.name : id.replace('concept_', '');
        });
        html += `
            <div class="tabbed-footer" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <div class="detail-section">
                    <div class="detail-label">Related Concepts</div>
                    <div class="detail-content">
                        ${entry.relatedConcepts.map((id, i) => `<code class="concept-link" data-concept="${escapeHtml(id)}">${escapeHtml(relatedNames[i])}</code>`).join(', ')}
                    </div>
                </div>
            </div>
        `;
    }

    return html;
}

// Initialize concept link click handlers
function initConceptLinks(container) {
    container.querySelectorAll('.concept-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const conceptId = link.dataset.concept;
            const concept = REFERENCE_DATA.concepts?.find(c => c.id === conceptId);
            if (concept) {
                if (currentCardEntry) {
                    cardHistory.push(currentCardEntry);
                }
                openDetailModal(concept);
            }
        });
    });
}
