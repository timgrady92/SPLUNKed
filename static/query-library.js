/**
 * SPLUNKed - Query Library
 * A curated collection of SPL queries for security analysts
 */

// ============================================
// Category Definitions
// ============================================

const QUERY_CATEGORIES = {
    authentication: {
        name: 'Authentication',
        icon: '🔐',
        description: 'Login, logout, and access-related queries'
    },
    network: {
        name: 'Network Security',
        icon: '🌐',
        description: 'Network traffic and connection analysis'
    },
    endpoint: {
        name: 'Endpoint Security',
        icon: '💻',
        description: 'Host-based detection and analysis'
    },
    malware: {
        name: 'Malware Detection',
        icon: '🦠',
        description: 'Malicious activity and threat hunting'
    },
    dataExfiltration: {
        name: 'Data Exfiltration',
        icon: '📤',
        description: 'Data loss prevention and detection'
    },
    userBehavior: {
        name: 'User Behavior',
        icon: '👤',
        description: 'User activity and anomaly detection'
    },
    privilegeEscalation: {
        name: 'Privilege Escalation',
        icon: '⬆️',
        description: 'Privilege abuse and escalation attempts'
    },
    persistence: {
        name: 'Persistence',
        icon: '📌',
        description: 'Attacker persistence mechanisms'
    },
    reconnaissance: {
        name: 'Reconnaissance',
        icon: '🔍',
        description: 'Scanning and enumeration detection'
    },
    cloudSecurity: {
        name: 'Cloud Security',
        icon: '☁️',
        description: 'AWS, Azure, and cloud service monitoring'
    },
    compliance: {
        name: 'Compliance',
        icon: '📋',
        description: 'Audit and compliance reporting'
    },
    performance: {
        name: 'Performance',
        icon: '📊',
        description: 'System health and performance monitoring'
    },
    lateralMovement: {
        name: 'Lateral Movement',
        icon: '↔️',
        description: 'Detecting attacker movement between systems'
    },
    emailSecurity: {
        name: 'Email Security',
        icon: '📧',
        description: 'Phishing, BEC, and email-based threats'
    },
    webSecurity: {
        name: 'Web Security',
        icon: '🌍',
        description: 'Web application attacks and WAF analysis'
    },
    incidentResponse: {
        name: 'Incident Response',
        icon: '🚨',
        description: 'Investigation and incident timeline queries'
    },
    defenseEvasion: {
        name: 'Defense Evasion',
        icon: '🥷',
        description: 'Detecting attacker attempts to avoid detection'
    },
    containerSecurity: {
        name: 'Container Security',
        icon: '📦',
        description: 'Kubernetes, Docker, and container orchestration'
    },
    databaseSecurity: {
        name: 'Database Security',
        icon: '🗄️',
        description: 'Database access, queries, and configuration monitoring'
    },
    activeDirectory: {
        name: 'Active Directory',
        icon: '🏛️',
        description: 'AD-specific attacks and domain security'
    },
    ransomware: {
        name: 'Ransomware',
        icon: '💀',
        description: 'Ransomware lifecycle detection and prevention'
    },
    commandControl: {
        name: 'Command & Control',
        icon: '📡',
        description: 'C2 communication, beaconing, and tunneling'
    },
    initialAccess: {
        name: 'Initial Access',
        icon: '🚪',
        description: 'Exploitation, drive-by, and initial compromise'
    },
    impact: {
        name: 'Impact',
        icon: '💥',
        description: 'Destruction, wipers, cryptomining, and disruption'
    },
    splunkAdmin: {
        name: 'Splunk Administration',
        icon: '⚙️',
        description: 'Splunk platform auditing, configuration changes, and administrative tasks'
    }
};

// ============================================
// Query Library Data (~100 Queries)
// ============================================

const QUERY_LIBRARY = [
    // ========== AUTHENTICATION (1-12) ==========
    {
        id: 'auth-001',
        title: 'Failed Login Attempts by User',
        description: 'Identify users with the most failed authentication attempts, useful for detecting brute force attacks or compromised accounts.',
        category: 'authentication',
        difficulty: 'beginner',
        dataSource: 'Windows Security',
        mitre: 'T1110',
        useCase: 'Threat Detection',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4625
| stats count as failed_attempts by user
| sort -failed_attempts
| head 20`,
        tags: ['windows', 'brute-force', 'failed-login']
    },
    {
        id: 'auth-002',
        title: 'Successful Logins After Multiple Failures',
        description: 'Detect accounts that successfully logged in after multiple failed attempts - potential indicator of successful brute force.',
        category: 'authentication',
        difficulty: 'intermediate',
        dataSource: 'Windows Security',
        mitre: 'T1110',
        useCase: 'Threat Detection',
        spl: `index=security sourcetype=WinEventLog:Security (EventCode=4625 OR EventCode=4624)
| stats count(eval(EventCode=4625)) as failures, count(eval(EventCode=4624)) as successes by user
| where failures >= 5 AND successes >= 1
| sort -failures`,
        tags: ['windows', 'brute-force', 'compromise']
    },
    {
        id: 'auth-003',
        title: 'Logins Outside Business Hours',
        description: 'Find authentication events occurring outside normal business hours (6 PM to 6 AM).',
        category: 'authentication',
        difficulty: 'beginner',
        dataSource: 'Windows Security',
        mitre: 'T1078',
        useCase: 'Anomaly Detection',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4624
| eval hour=strftime(_time, "%H")
| where hour < 6 OR hour >= 18
| stats count by user, src_ip
| sort -count`,
        tags: ['windows', 'anomaly', 'after-hours']
    },
    {
        id: 'auth-004',
        title: 'Password Spray Detection',
        description: 'Detect password spray attacks by finding single source IPs attempting to authenticate against many accounts.',
        category: 'authentication',
        difficulty: 'intermediate',
        dataSource: 'Windows Security',
        mitre: 'T1110.003',
        useCase: 'Threat Detection',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4625
| bin _time span=15m
| stats dc(user) as unique_users, count as attempts by src_ip, _time
| where unique_users > 10 AND attempts > 20
| sort -unique_users`,
        tags: ['windows', 'password-spray', 'lateral-movement']
    },
    {
        id: 'auth-005',
        title: 'Account Lockouts',
        description: 'Track account lockout events to identify potential attacks or misconfigured services.',
        category: 'authentication',
        difficulty: 'beginner',
        dataSource: 'Windows Security',
        mitre: 'T1110',
        useCase: 'Monitoring',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4740
| stats count, values(src_ip) as source_ips by user
| sort -count`,
        tags: ['windows', 'lockout', 'brute-force']
    },
    {
        id: 'auth-006',
        title: 'Interactive Logins to Servers',
        description: 'Monitor interactive (console) logins to servers which may indicate unauthorized access.',
        category: 'authentication',
        difficulty: 'intermediate',
        dataSource: 'Windows Security',
        mitre: 'T1078',
        useCase: 'Monitoring',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4624 Logon_Type=2
| stats count, earliest(_time) as first_login, latest(_time) as last_login by user, dest
| eval first_login=strftime(first_login, "%Y-%m-%d %H:%M:%S")
| eval last_login=strftime(last_login, "%Y-%m-%d %H:%M:%S")
| sort -count`,
        tags: ['windows', 'interactive', 'server']
    },
    {
        id: 'auth-007',
        title: 'RDP Logins from External IPs',
        description: 'Detect Remote Desktop connections originating from external (non-RFC1918) IP addresses.',
        category: 'authentication',
        difficulty: 'intermediate',
        dataSource: 'Windows Security',
        mitre: 'T1021.001',
        useCase: 'Threat Detection',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4624 Logon_Type=10
| where NOT (cidrmatch("10.0.0.0/8", src_ip) OR cidrmatch("172.16.0.0/12", src_ip) OR cidrmatch("192.168.0.0/16", src_ip))
| stats count by user, src_ip, dest
| sort -count`,
        tags: ['windows', 'rdp', 'external']
    },
    {
        id: 'auth-008',
        title: 'Kerberos Ticket Anomalies',
        description: 'Detect Kerberos authentication anomalies that may indicate Golden/Silver ticket attacks.',
        category: 'authentication',
        difficulty: 'advanced',
        dataSource: 'Windows Security',
        mitre: ['T1558.001', 'T1558.002'],
        useCase: 'Threat Hunting',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4769
| eval ticket_options=tonumber(Ticket_Options, 16)
| where ticket_options=0x40810000 OR Failure_Code!="0x0"
| stats count by user, Service_Name, Client_Address, Failure_Code
| sort -count`,
        tags: ['windows', 'kerberos', 'golden-ticket']
    },
    {
        id: 'auth-009',
        title: 'Service Account Anomalous Logins',
        description: 'Detect service accounts logging in from unexpected locations or with interactive logon types.',
        category: 'authentication',
        difficulty: 'intermediate',
        dataSource: 'Windows Security',
        mitre: 'T1078.002',
        useCase: 'Anomaly Detection',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4624
| search user="svc_*" OR user="service_*"
| where Logon_Type=2 OR Logon_Type=10
| stats count by user, src_ip, Logon_Type, dest
| sort -count`,
        tags: ['windows', 'service-account', 'anomaly']
    },
    {
        id: 'auth-010',
        title: 'VPN Concurrent Sessions',
        description: 'Find users with concurrent VPN sessions from different locations.',
        category: 'authentication',
        difficulty: 'intermediate',
        dataSource: 'VPN Logs',
        mitre: 'T1133',
        useCase: 'Anomaly Detection',
        spl: `index=vpn action=connected
| stats dc(src_ip) as unique_sources, values(src_ip) as source_ips by user
| where unique_sources > 1
| sort -unique_sources`,
        tags: ['vpn', 'concurrent', 'anomaly']
    },
    {
        id: 'auth-011',
        title: 'Disabled Account Login Attempts',
        description: 'Detect attempts to authenticate with disabled accounts.',
        category: 'authentication',
        difficulty: 'intermediate',
        dataSource: 'Windows Security',
        mitre: 'T1078',
        useCase: 'Threat Detection',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4625 Sub_Status="0xC0000072"
| stats count, values(src_ip) as source_ips by user
| sort -count`,
        tags: ['windows', 'disabled-account', 'failed-login']
    },
    {
        id: 'auth-012',
        title: 'NTLM Authentication Usage',
        description: 'Monitor NTLM authentication which may indicate legacy systems or potential downgrade attacks.',
        category: 'authentication',
        difficulty: 'advanced',
        dataSource: 'Windows Security',
        mitre: 'T1557.001',
        useCase: 'Threat Hunting',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4624 Authentication_Package=NTLM
| stats count by user, src_ip, dest, LmPackageName
| sort -count`,
        tags: ['windows', 'ntlm', 'downgrade']
    },

    // ========== NETWORK SECURITY (13-24) ==========
    {
        id: 'net-001',
        title: 'Top Talkers by Bytes',
        description: 'Identify the source IPs transferring the most data across the network.',
        category: 'network',
        difficulty: 'beginner',
        dataSource: 'Firewall',
        mitre: 'T1048',
        useCase: 'Monitoring',
        spl: `index=firewall
| stats sum(bytes_out) as total_bytes by src_ip
| eval total_mb=round(total_bytes/1024/1024, 2)
| sort -total_bytes
| head 20
| fields src_ip, total_mb`,
        tags: ['firewall', 'bandwidth', 'exfiltration']
    },
    {
        id: 'net-002',
        title: 'Connections to Known Bad IPs',
        description: 'Detect connections to IP addresses on threat intelligence lists.',
        category: 'network',
        difficulty: 'beginner',
        dataSource: 'Firewall',
        mitre: 'T1071',
        useCase: 'Threat Detection',
        spl: `index=firewall action=allowed
| lookup threat_intel_ip ip as dest_ip OUTPUT threat_type, threat_score
| where isnotnull(threat_type)
| stats count, values(threat_type) as threats by src_ip, dest_ip
| sort -count`,
        tags: ['firewall', 'threat-intel', 'ioc']
    },
    {
        id: 'net-003',
        title: 'Unusual Port Usage',
        description: 'Find connections using uncommon destination ports that may indicate C2 or tunneling.',
        category: 'network',
        difficulty: 'intermediate',
        dataSource: 'Firewall',
        mitre: 'T1571',
        useCase: 'Threat Hunting',
        spl: `index=firewall action=allowed dest_port!=80 dest_port!=443 dest_port!=53 dest_port!=22 dest_port!=25
| stats count, dc(src_ip) as unique_sources by dest_port
| where count > 100
| sort -count`,
        tags: ['firewall', 'ports', 'c2']
    },
    {
        id: 'net-004',
        title: 'DNS Query Volume Anomaly',
        description: 'Detect hosts making an unusually high number of DNS queries which may indicate DNS tunneling or malware.',
        category: 'network',
        difficulty: 'intermediate',
        dataSource: 'DNS',
        mitre: 'T1071.004',
        useCase: 'Anomaly Detection',
        spl: `index=dns
| stats count as query_count, dc(query) as unique_queries by src_ip
| where query_count > 1000
| eval ratio=round(query_count/unique_queries, 2)
| sort -query_count`,
        tags: ['dns', 'tunneling', 'exfiltration']
    },
    {
        id: 'net-005',
        title: 'Long DNS Query Names',
        description: 'Find DNS queries with unusually long domain names which may indicate DNS tunneling or DGA malware.',
        category: 'network',
        difficulty: 'intermediate',
        dataSource: 'DNS',
        mitre: ['T1071.004', 'T1568.002'],
        useCase: 'Threat Detection',
        spl: `index=dns
| eval query_length=len(query)
| where query_length > 50
| stats count by query, src_ip
| sort -count`,
        tags: ['dns', 'tunneling', 'dga']
    },
    {
        id: 'net-006',
        title: 'Beaconing Detection',
        description: 'Identify potential C2 beaconing by finding connections with regular intervals.',
        category: 'network',
        difficulty: 'advanced',
        dataSource: 'Firewall',
        mitre: 'T1071',
        useCase: 'Threat Hunting',
        spl: `index=firewall action=allowed
| bin _time span=1m
| stats count by _time, src_ip, dest_ip
| streamstats current=f last(_time) as prev_time by src_ip, dest_ip
| eval interval=_time-prev_time
| stats stdev(interval) as interval_stdev, avg(interval) as avg_interval, count by src_ip, dest_ip
| where interval_stdev < 60 AND count > 50 AND avg_interval < 600
| sort interval_stdev`,
        tags: ['firewall', 'beaconing', 'c2']
    },
    {
        id: 'net-007',
        title: 'Outbound Connections to Rare Destinations',
        description: 'Find outbound connections to destinations that are rarely contacted by your organization.',
        category: 'network',
        difficulty: 'intermediate',
        dataSource: 'Firewall',
        mitre: 'T1071',
        useCase: 'Threat Hunting',
        spl: `index=firewall action=allowed direction=outbound
| stats dc(src_ip) as unique_sources, count as connections by dest_ip
| where unique_sources <= 2 AND connections > 10
| sort -connections`,
        tags: ['firewall', 'rare', 'c2']
    },
    {
        id: 'net-008',
        title: 'Port Scanning Detection',
        description: 'Detect potential port scanning by identifying sources hitting many different ports.',
        category: 'network',
        difficulty: 'intermediate',
        dataSource: 'Firewall',
        mitre: 'T1046',
        useCase: 'Threat Detection',
        spl: `index=firewall
| bin _time span=5m
| stats dc(dest_port) as unique_ports, dc(dest_ip) as unique_hosts by src_ip, _time
| where unique_ports > 20
| stats sum(unique_ports) as total_ports, sum(unique_hosts) as total_hosts by src_ip
| sort -total_ports`,
        tags: ['firewall', 'scanning', 'reconnaissance']
    },
    {
        id: 'net-009',
        title: 'Tor Exit Node Connections',
        description: 'Detect connections to or from known Tor exit nodes.',
        category: 'network',
        difficulty: 'intermediate',
        dataSource: 'Firewall',
        mitre: 'T1090.003',
        useCase: 'Threat Detection',
        spl: `index=firewall
| lookup tor_exit_nodes ip as dest_ip OUTPUT is_tor
| where is_tor="true"
| stats count by src_ip, dest_ip, dest_port
| sort -count`,
        tags: ['firewall', 'tor', 'anonymization']
    },
    {
        id: 'net-010',
        title: 'SSL/TLS Certificate Anomalies',
        description: 'Find SSL connections with suspicious certificate characteristics.',
        category: 'network',
        difficulty: 'advanced',
        dataSource: 'Zeek',
        mitre: 'T1573.002',
        useCase: 'Threat Hunting',
        spl: `index=zeek sourcetype=zeek_ssl
| where certificate_not_valid_before > _time OR certificate_not_valid_after < _time
| stats count by dest_ip, server_name, certificate_issuer
| sort -count`,
        tags: ['zeek', 'ssl', 'certificates']
    },
    {
        id: 'net-011',
        title: 'ICMP Tunneling Detection',
        description: 'Detect potential ICMP tunneling by finding unusually large or frequent ICMP traffic.',
        category: 'network',
        difficulty: 'advanced',
        dataSource: 'Firewall',
        mitre: 'T1095',
        useCase: 'Threat Hunting',
        spl: `index=firewall protocol=icmp
| stats count, sum(bytes) as total_bytes, avg(bytes) as avg_bytes by src_ip, dest_ip
| where avg_bytes > 100 OR count > 1000
| sort -total_bytes`,
        tags: ['firewall', 'icmp', 'tunneling']
    },
    {
        id: 'net-012',
        title: 'Geographic Connection Anomalies',
        description: 'Identify connections to unusual geographic locations based on your organization baseline.',
        category: 'network',
        difficulty: 'intermediate',
        dataSource: 'Firewall',
        mitre: 'T1071',
        useCase: 'Anomaly Detection',
        spl: `index=firewall action=allowed direction=outbound
| iplocation dest_ip
| stats count, dc(src_ip) as unique_sources by Country
| where count > 10 AND Country!="United States"
| sort -count`,
        tags: ['firewall', 'geolocation', 'anomaly']
    },

    // ========== ENDPOINT SECURITY (25-36) ==========
    {
        id: 'ep-001',
        title: 'New Process Execution',
        description: 'Identify newly executed processes that have not been seen before in your environment.',
        category: 'endpoint',
        difficulty: 'intermediate',
        dataSource: 'Sysmon',
        mitre: 'T1059',
        useCase: 'Threat Hunting',
        spl: `index=sysmon EventCode=1
| stats earliest(_time) as first_seen, count by process_name, process_path
| where first_seen > relative_time(now(), "-24h")
| sort -first_seen
| eval first_seen=strftime(first_seen, "%Y-%m-%d %H:%M:%S")`,
        tags: ['sysmon', 'process', 'new']
    },
    {
        id: 'ep-002',
        title: 'PowerShell Encoded Commands',
        description: 'Detect PowerShell execution with encoded command line arguments often used by attackers.',
        category: 'endpoint',
        difficulty: 'beginner',
        dataSource: 'Sysmon',
        mitre: 'T1059.001',
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=1 process_name="powershell.exe"
| search CommandLine="*-enc*" OR CommandLine="*-encoded*" OR CommandLine="*-e *" OR CommandLine="*FromBase64*"
| stats count by user, CommandLine, ParentCommandLine
| sort -count`,
        tags: ['sysmon', 'powershell', 'encoded']
    },
    {
        id: 'ep-003',
        title: 'Suspicious Parent-Child Process',
        description: 'Find unusual parent-child process relationships that may indicate exploitation.',
        category: 'endpoint',
        difficulty: 'intermediate',
        dataSource: 'Sysmon',
        mitre: ['T1059', 'T1203'],
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=1
| eval suspicious=case(
    parent_process_name="winword.exe" AND (process_name="cmd.exe" OR process_name="powershell.exe"), "Office spawning shell",
    parent_process_name="outlook.exe" AND process_name="powershell.exe", "Outlook spawning PowerShell",
    parent_process_name="excel.exe" AND process_name="mshta.exe", "Excel spawning MSHTA",
    true(), null())
| where isnotnull(suspicious)
| stats count by suspicious, parent_process_name, process_name, CommandLine
| sort -count`,
        tags: ['sysmon', 'process', 'exploitation']
    },
    {
        id: 'ep-004',
        title: 'LOLBAS Execution',
        description: 'Detect execution of Living Off the Land Binaries, Scripts, and Libraries.',
        category: 'endpoint',
        difficulty: 'intermediate',
        dataSource: 'Sysmon',
        mitre: ['T1218', 'T1127'],
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=1
| search process_name IN ("certutil.exe", "bitsadmin.exe", "mshta.exe", "regsvr32.exe", "rundll32.exe", "wmic.exe", "cmstp.exe", "msiexec.exe")
| stats count by process_name, CommandLine, user, host
| sort -count`,
        tags: ['sysmon', 'lolbas', 'evasion']
    },
    {
        id: 'ep-005',
        title: 'File Downloads via CertUtil',
        description: 'Detect certutil.exe being used to download files, a common attacker technique.',
        category: 'endpoint',
        difficulty: 'beginner',
        dataSource: 'Sysmon',
        mitre: 'T1105',
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=1 process_name="certutil.exe"
| search CommandLine="*urlcache*" OR CommandLine="*split*" OR CommandLine="*-decode*"
| stats count by host, user, CommandLine
| sort -count`,
        tags: ['sysmon', 'certutil', 'download']
    },
    {
        id: 'ep-006',
        title: 'Credential Dumping Indicators',
        description: 'Detect potential credential dumping through LSASS access or common tools.',
        category: 'endpoint',
        difficulty: 'advanced',
        dataSource: 'Sysmon',
        mitre: 'T1003.001',
        useCase: 'Threat Detection',
        spl: `index=sysmon (EventCode=10 TargetImage="*lsass.exe") OR (EventCode=1 (process_name="procdump.exe" OR process_name="mimikatz.exe" OR CommandLine="*sekurlsa*"))
| stats count by EventCode, process_name, SourceImage, TargetImage, user, host
| sort -count`,
        tags: ['sysmon', 'credential-dump', 'lsass']
    },
    {
        id: 'ep-007',
        title: 'Registry Run Key Modification',
        description: 'Detect modifications to registry Run keys used for persistence.',
        category: 'endpoint',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=13
| search TargetObject="*\\Run\\*" OR TargetObject="*\\RunOnce\\*"
| stats count by host, user, process_name, TargetObject, Details
| sort -count`,
        tags: ['sysmon', 'registry', 'persistence']
    },
    {
        id: 'ep-008',
        title: 'DLL Side-Loading Detection',
        description: 'Identify potential DLL side-loading by finding DLLs loaded from unusual locations.',
        category: 'endpoint',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=7
| where NOT match(ImageLoaded, "^(C:\\\\Windows|C:\\\\Program Files)")
| stats count by process_name, ImageLoaded, host
| sort -count`,
        tags: ['sysmon', 'dll', 'side-loading']
    },
    {
        id: 'ep-009',
        title: 'Scheduled Task Creation',
        description: 'Monitor creation of scheduled tasks which can be used for persistence.',
        category: 'endpoint',
        difficulty: 'beginner',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4698
| stats count by user, TaskName, host
| sort -count`,
        tags: ['windows', 'scheduled-task', 'persistence']
    },
    {
        id: 'ep-010',
        title: 'Service Installation',
        description: 'Track new service installations which may indicate persistence or privilege escalation.',
        category: 'endpoint',
        difficulty: 'beginner',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4697
| stats count by user, ServiceName, ServiceFileName, host
| sort -count`,
        tags: ['windows', 'service', 'persistence']
    },
    {
        id: 'ep-011',
        title: 'Unsigned Binaries Execution',
        description: 'Find execution of unsigned binaries which may indicate malware or unauthorized software.',
        category: 'endpoint',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1 Signature="*unsigned*" OR SignatureStatus!="Valid"
| stats count by process_name, process_path, SignatureStatus, host
| sort -count`,
        tags: ['sysmon', 'unsigned', 'malware']
    },
    {
        id: 'ep-012',
        title: 'Process Injection Indicators',
        description: 'Detect potential process injection through CreateRemoteThread calls.',
        category: 'endpoint',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=8
| where SourceImage!=TargetImage
| stats count by SourceImage, TargetImage, host
| sort -count`,
        tags: ['sysmon', 'injection', 'evasion']
    },

    // ========== MALWARE DETECTION (37-46) ==========
    {
        id: 'mal-001',
        title: 'Executable in Temp Folder',
        description: 'Detect execution of files from temporary directories, common for malware droppers.',
        category: 'malware',
        difficulty: 'beginner',
        spl: `index=sysmon EventCode=1
| search process_path="*\\Temp\\*" OR process_path="*\\tmp\\*" OR process_path="*\\AppData\\Local\\Temp\\*"
| stats count by process_name, process_path, user, host
| sort -count`,
        tags: ['sysmon', 'temp', 'dropper']
    },
    {
        id: 'mal-002',
        title: 'Double Extension Files',
        description: 'Find files with double extensions commonly used to trick users (e.g., invoice.pdf.exe).',
        category: 'malware',
        difficulty: 'beginner',
        spl: `index=sysmon EventCode=11
| rex field=TargetFilename "(?<filename>[^\\\\]+)$"
| where match(filename, "\\.(doc|pdf|jpg|png|txt)\\.(exe|scr|bat|cmd|vbs|js)$")
| stats count by filename, TargetFilename, host
| sort -count`,
        tags: ['sysmon', 'double-extension', 'phishing']
    },
    {
        id: 'mal-003',
        title: 'Known Malware Hashes',
        description: 'Check process hashes against known malware hash lists.',
        category: 'malware',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| lookup malware_hashes hash as Hashes OUTPUT malware_name, malware_family
| where isnotnull(malware_name)
| stats count by malware_name, malware_family, process_name, host
| sort -count`,
        tags: ['sysmon', 'hash', 'ioc']
    },
    {
        id: 'mal-004',
        title: 'WMI Execution',
        description: 'Monitor WMI command execution which can be used for lateral movement and persistence.',
        category: 'malware',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1 (parent_process_name="wmiprvse.exe" OR process_name="wmic.exe")
| stats count by process_name, CommandLine, parent_process_name, user, host
| sort -count`,
        tags: ['sysmon', 'wmi', 'lateral-movement']
    },
    {
        id: 'mal-005',
        title: 'Macro-Enabled Document Access',
        description: 'Track access to macro-enabled Office documents which are common malware vectors.',
        category: 'malware',
        difficulty: 'beginner',
        spl: `index=sysmon EventCode=11
| search TargetFilename="*.xlsm" OR TargetFilename="*.docm" OR TargetFilename="*.pptm"
| stats count by TargetFilename, process_name, user, host
| sort -count`,
        tags: ['sysmon', 'macro', 'office']
    },
    {
        id: 'mal-006',
        title: 'Suspicious Script Downloads',
        description: 'Detect downloads of potentially malicious script files.',
        category: 'malware',
        difficulty: 'intermediate',
        spl: `index=proxy OR index=firewall
| search url="*.ps1" OR url="*.vbs" OR url="*.js" OR url="*.hta" OR url="*.bat"
| stats count by src_ip, url, dest_ip
| sort -count`,
        tags: ['proxy', 'scripts', 'download']
    },
    {
        id: 'mal-007',
        title: 'Ransomware File Extension Changes',
        description: 'Detect mass file renaming with known ransomware extensions.',
        category: 'malware',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=11
| rex field=TargetFilename "\\.(?<extension>[^\\\\.]+)$"
| search extension IN ("encrypted", "locked", "crypto", "crypt", "enc", "locky", "cerber", "wannacry")
| stats count by host, extension
| where count > 10
| sort -count`,
        tags: ['sysmon', 'ransomware', 'encryption']
    },
    {
        id: 'mal-008',
        title: 'Shadow Copy Deletion',
        description: 'Detect deletion of shadow copies, a common ransomware precursor.',
        category: 'malware',
        difficulty: 'beginner',
        spl: `index=sysmon EventCode=1
| search CommandLine="*vssadmin*delete*" OR CommandLine="*wmic*shadowcopy*delete*"
| stats count by host, user, CommandLine
| sort -count`,
        tags: ['sysmon', 'ransomware', 'shadow-copy']
    },
    {
        id: 'mal-009',
        title: 'Base64 in Command Line',
        description: 'Find processes with Base64-encoded strings in command lines, often used to obfuscate malicious commands.',
        category: 'malware',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| rex field=CommandLine "(?<b64_string>[A-Za-z0-9+/=]{50,})"
| where isnotnull(b64_string)
| stats count by process_name, b64_string, user, host
| sort -count`,
        tags: ['sysmon', 'base64', 'obfuscation']
    },
    {
        id: 'mal-010',
        title: 'Cobalt Strike Indicators',
        description: 'Detect potential Cobalt Strike beacons through common behavioral indicators.',
        category: 'malware',
        difficulty: 'advanced',
        spl: `index=sysmon (EventCode=1 CommandLine="*rundll32.exe*,StartW*") OR
(EventCode=3 dest_port IN (80, 443, 8080) Image="*rundll32.exe*") OR
(EventCode=1 parent_process_name="rundll32.exe" process_name IN ("cmd.exe", "powershell.exe"))
| stats count by EventCode, process_name, CommandLine, dest_ip, host
| sort -count`,
        tags: ['sysmon', 'cobalt-strike', 'c2']
    },

    // ========== DATA EXFILTRATION (47-54) ==========
    {
        id: 'exfil-001',
        title: 'Large Outbound Data Transfers',
        description: 'Identify unusually large outbound data transfers that may indicate exfiltration.',
        category: 'dataExfiltration',
        difficulty: 'beginner',
        spl: `index=firewall direction=outbound
| stats sum(bytes_out) as total_bytes by src_ip, dest_ip
| eval total_mb=round(total_bytes/1024/1024, 2)
| where total_mb > 100
| sort -total_mb`,
        tags: ['firewall', 'data-transfer', 'exfiltration']
    },
    {
        id: 'exfil-002',
        title: 'Cloud Storage Uploads',
        description: 'Track uploads to cloud storage services that may be used for data exfiltration.',
        category: 'dataExfiltration',
        difficulty: 'beginner',
        spl: `index=proxy
| search url="*dropbox.com*" OR url="*drive.google.com*" OR url="*onedrive.live.com*" OR url="*box.com*"
| where http_method="POST" OR http_method="PUT"
| stats sum(bytes_out) as uploaded_bytes, count by src_ip, user, url
| sort -uploaded_bytes`,
        tags: ['proxy', 'cloud-storage', 'upload']
    },
    {
        id: 'exfil-003',
        title: 'USB Device Usage',
        description: 'Monitor USB storage device connections for potential data theft.',
        category: 'dataExfiltration',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=6 OR index=security EventCode=6416
| stats count, earliest(_time) as first_seen, latest(_time) as last_seen by DeviceDescription, host, user
| eval first_seen=strftime(first_seen, "%Y-%m-%d %H:%M:%S")
| eval last_seen=strftime(last_seen, "%Y-%m-%d %H:%M:%S")
| sort -count`,
        tags: ['sysmon', 'usb', 'removable-media']
    },
    {
        id: 'exfil-004',
        title: 'Email with Large Attachments',
        description: 'Find emails with unusually large attachments being sent externally.',
        category: 'dataExfiltration',
        difficulty: 'intermediate',
        spl: `index=email direction=outbound
| where attachment_size > 10000000
| stats sum(attachment_size) as total_size, values(attachment_name) as attachments by sender, recipient
| eval total_mb=round(total_size/1024/1024, 2)
| sort -total_mb`,
        tags: ['email', 'attachment', 'exfiltration']
    },
    {
        id: 'exfil-005',
        title: 'After-Hours Data Access',
        description: 'Detect file access to sensitive directories outside business hours.',
        category: 'dataExfiltration',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=11
| eval hour=strftime(_time, "%H")
| where (hour < 6 OR hour >= 20) AND (TargetFilename="*Finance*" OR TargetFilename="*HR*" OR TargetFilename="*Confidential*")
| stats count by user, TargetFilename, host
| sort -count`,
        tags: ['sysmon', 'file-access', 'after-hours']
    },
    {
        id: 'exfil-006',
        title: 'Bulk File Access',
        description: 'Identify users accessing an unusually high number of files in a short period.',
        category: 'dataExfiltration',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=11
| bin _time span=1h
| stats dc(TargetFilename) as unique_files, count by user, host, _time
| where unique_files > 100
| sort -unique_files`,
        tags: ['sysmon', 'file-access', 'bulk']
    },
    {
        id: 'exfil-007',
        title: 'FTP/SFTP Transfers',
        description: 'Monitor FTP and SFTP file transfers for potential data exfiltration.',
        category: 'dataExfiltration',
        difficulty: 'beginner',
        spl: `index=firewall dest_port IN (20, 21, 22, 990) action=allowed
| stats sum(bytes_out) as total_bytes, count by src_ip, dest_ip, dest_port
| eval total_mb=round(total_bytes/1024/1024, 2)
| sort -total_mb`,
        tags: ['firewall', 'ftp', 'sftp']
    },
    {
        id: 'exfil-008',
        title: 'Print Job Monitoring',
        description: 'Track print jobs that may indicate document exfiltration via printing.',
        category: 'dataExfiltration',
        difficulty: 'intermediate',
        spl: `index=windows sourcetype=WinEventLog:PrintService EventCode=307
| stats count, sum(Pages) as total_pages by user, DocumentName, PrinterName
| where total_pages > 50
| sort -total_pages`,
        tags: ['windows', 'print', 'document']
    },

    // ========== USER BEHAVIOR (55-64) ==========
    {
        id: 'ub-001',
        title: 'First Time Access to Resource',
        description: 'Detect when users access resources for the first time.',
        category: 'userBehavior',
        difficulty: 'intermediate',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=5140
| stats earliest(_time) as first_access by user, ShareName
| where first_access > relative_time(now(), "-24h")
| eval first_access=strftime(first_access, "%Y-%m-%d %H:%M:%S")
| sort -first_access`,
        tags: ['windows', 'file-share', 'first-access']
    },
    {
        id: 'ub-002',
        title: 'User Account Activity Spike',
        description: 'Find users with sudden increase in activity compared to their baseline.',
        category: 'userBehavior',
        difficulty: 'advanced',
        spl: `index=security EventCode=4624
| bin _time span=1d
| stats count as daily_logins by user, _time
| streamstats avg(daily_logins) as baseline, stdev(daily_logins) as stdev_logins by user
| eval zscore=(daily_logins-baseline)/stdev_logins
| where zscore > 3
| sort -zscore`,
        tags: ['windows', 'anomaly', 'baseline']
    },
    {
        id: 'ub-003',
        title: 'Multiple Concurrent Sessions',
        description: 'Identify users with multiple active sessions from different sources.',
        category: 'userBehavior',
        difficulty: 'intermediate',
        spl: `index=security EventCode=4624 Logon_Type IN (2, 3, 10)
| stats dc(src_ip) as unique_sources, values(src_ip) as sources by user
| where unique_sources > 2
| sort -unique_sources`,
        tags: ['windows', 'concurrent', 'sessions']
    },
    {
        id: 'ub-004',
        title: 'Dormant Account Reactivation',
        description: 'Detect when accounts that have been inactive for 30+ days become active.',
        category: 'userBehavior',
        difficulty: 'advanced',
        spl: `index=security EventCode=4624
| stats latest(_time) as last_login, earliest(_time) as first_login by user
| eval days_inactive=round((last_login-first_login)/86400, 0)
| where days_inactive > 30 AND last_login > relative_time(now(), "-24h")
| eval last_login=strftime(last_login, "%Y-%m-%d %H:%M:%S")
| sort -days_inactive`,
        tags: ['windows', 'dormant', 'reactivation']
    },
    {
        id: 'ub-005',
        title: 'Admin Tool Usage by Non-Admins',
        description: 'Detect non-admin users running administrative tools.',
        category: 'userBehavior',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search process_name IN ("net.exe", "net1.exe", "dsquery.exe", "nltest.exe", "whoami.exe", "gpresult.exe")
| lookup admin_users user OUTPUT is_admin
| where is_admin!="true"
| stats count by user, process_name, CommandLine, host
| sort -count`,
        tags: ['sysmon', 'admin-tools', 'unauthorized']
    },
    {
        id: 'ub-006',
        title: 'Unusual Application Usage',
        description: 'Find users running applications they have never used before.',
        category: 'userBehavior',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| stats earliest(_time) as first_use, count by user, process_name
| where first_use > relative_time(now(), "-24h")
| stats count as new_apps, values(process_name) as applications by user
| where new_apps > 5
| sort -new_apps`,
        tags: ['sysmon', 'application', 'new-usage']
    },
    {
        id: 'ub-007',
        title: 'High-Risk User Activity',
        description: 'Correlate multiple risk indicators for users who may be compromised.',
        category: 'userBehavior',
        difficulty: 'advanced',
        spl: `index=security OR index=sysmon
| eval risk_score=case(
    EventCode=4625, 1,
    EventCode=4720, 5,
    EventCode=4728, 5,
    process_name="mimikatz.exe", 10,
    match(CommandLine, ".*encoded.*"), 3,
    true(), 0)
| stats sum(risk_score) as total_risk by user
| where total_risk > 10
| sort -total_risk`,
        tags: ['multi-source', 'risk-score', 'correlation']
    },
    {
        id: 'ub-008',
        title: 'Workstation Hopping',
        description: 'Detect users logging into an unusual number of workstations.',
        category: 'userBehavior',
        difficulty: 'intermediate',
        spl: `index=security EventCode=4624 Logon_Type=3
| bin _time span=1d
| stats dc(dest) as unique_hosts, values(dest) as hosts by user, _time
| where unique_hosts > 10
| sort -unique_hosts`,
        tags: ['windows', 'lateral-movement', 'workstation']
    },
    {
        id: 'ub-009',
        title: 'Session Duration Anomalies',
        description: 'Find sessions that are unusually long or short compared to typical patterns.',
        category: 'userBehavior',
        difficulty: 'advanced',
        spl: `index=security (EventCode=4624 OR EventCode=4634) Logon_Type=3
| transaction user startswith=EventCode=4624 endswith=EventCode=4634
| eval duration_hours=duration/3600
| stats avg(duration_hours) as avg_duration, stdev(duration_hours) as stdev_duration by user
| where stdev_duration > 2
| sort -stdev_duration`,
        tags: ['windows', 'session', 'duration']
    },
    {
        id: 'ub-010',
        title: 'Failed Resource Access Patterns',
        description: 'Identify users repeatedly failing to access resources they do not have permission for.',
        category: 'userBehavior',
        difficulty: 'intermediate',
        spl: `index=security EventCode=5145 Status="0xC0000022"
| stats count, dc(ShareName) as unique_shares by user
| where count > 10
| sort -count`,
        tags: ['windows', 'access-denied', 'enumeration']
    },

    // ========== PRIVILEGE ESCALATION (65-72) ==========
    {
        id: 'priv-001',
        title: 'User Added to Admin Group',
        description: 'Detect when users are added to privileged groups like Domain Admins.',
        category: 'privilegeEscalation',
        difficulty: 'beginner',
        spl: `index=security EventCode=4728 OR EventCode=4732 OR EventCode=4756
| search TargetUserName="*admin*" OR TargetUserName="Domain Admins" OR TargetUserName="Enterprise Admins"
| stats count by MemberName, TargetUserName, SubjectUserName
| sort -count`,
        tags: ['windows', 'group-membership', 'admin']
    },
    {
        id: 'priv-002',
        title: 'Privilege Escalation via Token',
        description: 'Detect processes acquiring sensitive privileges that may indicate privilege escalation.',
        category: 'privilegeEscalation',
        difficulty: 'advanced',
        spl: `index=security EventCode=4672
| search PrivilegeList="*SeDebugPrivilege*" OR PrivilegeList="*SeTcbPrivilege*"
| stats count by SubjectUserName, ProcessName, PrivilegeList
| sort -count`,
        tags: ['windows', 'privilege', 'token']
    },
    {
        id: 'priv-003',
        title: 'UAC Bypass Attempts',
        description: 'Detect potential UAC bypass techniques through suspicious process chains.',
        category: 'privilegeEscalation',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1
| search (parent_process_name="eventvwr.exe" AND process_name!="mmc.exe") OR
         (parent_process_name="fodhelper.exe" AND process_name!="fodhelper.exe") OR
         (parent_process_name="computerdefaults.exe")
| stats count by parent_process_name, process_name, CommandLine, user
| sort -count`,
        tags: ['sysmon', 'uac', 'bypass']
    },
    {
        id: 'priv-004',
        title: 'Sudo Abuse (Linux)',
        description: 'Detect suspicious sudo usage or attempts to escalate privileges on Linux systems.',
        category: 'privilegeEscalation',
        difficulty: 'intermediate',
        spl: `index=linux sourcetype=linux_secure
| search "sudo:" AND ("FAILED" OR "NOT in sudoers" OR "incorrect password")
| stats count by user, host, command
| sort -count`,
        tags: ['linux', 'sudo', 'failed']
    },
    {
        id: 'priv-005',
        title: 'Pass-the-Hash Detection',
        description: 'Detect potential Pass-the-Hash attacks through NTLM authentication anomalies.',
        category: 'privilegeEscalation',
        difficulty: 'advanced',
        spl: `index=security EventCode=4624 Logon_Type=3 Authentication_Package=NTLM
| where user!=src_user AND isnotnull(src_user)
| stats count by user, src_user, src_ip, dest
| sort -count`,
        tags: ['windows', 'pass-the-hash', 'ntlm']
    },
    {
        id: 'priv-006',
        title: 'Password Reset by Non-Help Desk',
        description: 'Detect password resets performed by users outside the help desk team.',
        category: 'privilegeEscalation',
        difficulty: 'intermediate',
        spl: `index=security EventCode=4724
| lookup helpdesk_users user as SubjectUserName OUTPUT is_helpdesk
| where is_helpdesk!="true"
| stats count by SubjectUserName, TargetUserName
| sort -count`,
        tags: ['windows', 'password-reset', 'unauthorized']
    },
    {
        id: 'priv-007',
        title: 'Service Account Privilege Use',
        description: 'Monitor when service accounts use interactive or elevated privileges.',
        category: 'privilegeEscalation',
        difficulty: 'intermediate',
        spl: `index=security EventCode=4672
| search SubjectUserName="svc_*" OR SubjectUserName="service_*"
| where NOT match(ProcessName, "(?i)(services|svchost|system)")
| stats count by SubjectUserName, ProcessName, PrivilegeList
| sort -count`,
        tags: ['windows', 'service-account', 'privilege']
    },
    {
        id: 'priv-008',
        title: 'RunAs Execution',
        description: 'Track usage of RunAs to execute processes with different credentials.',
        category: 'privilegeEscalation',
        difficulty: 'beginner',
        spl: `index=sysmon EventCode=1 process_name="runas.exe"
| stats count by user, CommandLine, host
| sort -count`,
        tags: ['sysmon', 'runas', 'impersonation']
    },

    // ========== PERSISTENCE (73-80) ==========
    {
        id: 'pers-001',
        title: 'New Startup Items',
        description: 'Detect new items added to Windows startup locations.',
        category: 'persistence',
        difficulty: 'beginner',
        spl: `index=sysmon EventCode=11
| search TargetFilename="*\\Startup\\*" OR TargetFilename="*\\Start Menu\\Programs\\Startup\\*"
| stats count by TargetFilename, process_name, user, host
| sort -count`,
        tags: ['sysmon', 'startup', 'autorun']
    },
    {
        id: 'pers-002',
        title: 'WMI Event Subscription',
        description: 'Detect WMI event subscriptions used for persistence.',
        category: 'persistence',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=19 OR EventCode=20 OR EventCode=21
| stats count by EventType, Operation, User, Consumer, host
| sort -count`,
        tags: ['sysmon', 'wmi', 'subscription']
    },
    {
        id: 'pers-003',
        title: 'Cron Job Modifications (Linux)',
        description: 'Monitor changes to cron jobs which can be used for persistence.',
        category: 'persistence',
        difficulty: 'intermediate',
        spl: `index=linux (source="/var/log/cron" OR source="/var/log/syslog")
| search "EDIT" OR "REPLACE" OR "crontab"
| stats count by user, host, _raw
| sort -count`,
        tags: ['linux', 'cron', 'scheduled-task']
    },
    {
        id: 'pers-004',
        title: 'Browser Extension Installation',
        description: 'Detect installation of browser extensions which can be used for persistence or data theft.',
        category: 'persistence',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=11
| search TargetFilename="*\\Extensions\\*" OR TargetFilename="*\\chrome\\*extension*"
| stats count by TargetFilename, process_name, user, host
| sort -count`,
        tags: ['sysmon', 'browser', 'extension']
    },
    {
        id: 'pers-005',
        title: 'New GPO Creation',
        description: 'Monitor creation of new Group Policy Objects which can be used for persistence.',
        category: 'persistence',
        difficulty: 'intermediate',
        spl: `index=security EventCode=5136 AttributeLDAPDisplayName="gPLink"
| stats count by SubjectUserName, ObjectDN, AttributeValue
| sort -count`,
        tags: ['windows', 'gpo', 'active-directory']
    },
    {
        id: 'pers-006',
        title: 'Boot Record Modification',
        description: 'Detect potential bootkit installation through MBR/VBR modifications.',
        category: 'persistence',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1
| search process_path="*\\System32\\*" AND (CommandLine="*mbr*" OR CommandLine="*vbr*" OR CommandLine="*boot*sector*")
| stats count by process_name, CommandLine, user, host
| sort -count`,
        tags: ['sysmon', 'bootkit', 'mbr']
    },
    {
        id: 'pers-007',
        title: 'SSH Authorized Keys Modification',
        description: 'Monitor modifications to SSH authorized_keys files for unauthorized access.',
        category: 'persistence',
        difficulty: 'intermediate',
        spl: `index=linux source="/var/log/audit/audit.log"
| search name="authorized_keys"
| stats count by user, host, key
| sort -count`,
        tags: ['linux', 'ssh', 'authorized-keys']
    },
    {
        id: 'pers-008',
        title: 'DLL Search Order Hijacking',
        description: 'Detect potential DLL hijacking by monitoring DLL loads from writable locations.',
        category: 'persistence',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=7
| where NOT match(ImageLoaded, "^C:\\\\Windows\\\\") AND NOT match(ImageLoaded, "^C:\\\\Program Files")
| eval loaded_path=replace(ImageLoaded, "[^\\\\]+$", "")
| eval process_path=replace(Image, "[^\\\\]+$", "")
| where loaded_path!=process_path
| stats count by process_name, ImageLoaded, host
| sort -count`,
        tags: ['sysmon', 'dll-hijacking', 'persistence']
    },

    // ========== RECONNAISSANCE (81-88) ==========
    {
        id: 'recon-001',
        title: 'Active Directory Enumeration',
        description: 'Detect AD enumeration through LDAP queries or enumeration tools.',
        category: 'reconnaissance',
        difficulty: 'intermediate',
        spl: `index=security EventCode=4662
| search ObjectType="*user*" OR ObjectType="*group*" OR ObjectType="*computer*"
| stats count by SubjectUserName, ObjectName, ObjectType
| where count > 100
| sort -count`,
        tags: ['windows', 'active-directory', 'ldap']
    },
    {
        id: 'recon-002',
        title: 'Network Share Enumeration',
        description: 'Detect enumeration of network shares which may precede lateral movement.',
        category: 'reconnaissance',
        difficulty: 'beginner',
        spl: `index=sysmon EventCode=1
| search CommandLine="*net view*" OR CommandLine="*net share*" OR CommandLine="*Get-SmbShare*"
| stats count by user, CommandLine, host
| sort -count`,
        tags: ['sysmon', 'shares', 'enumeration']
    },
    {
        id: 'recon-003',
        title: 'System Information Gathering',
        description: 'Detect commands used to gather system information.',
        category: 'reconnaissance',
        difficulty: 'beginner',
        spl: `index=sysmon EventCode=1
| search CommandLine="*systeminfo*" OR CommandLine="*hostname*" OR CommandLine="*whoami*" OR CommandLine="*ipconfig*"
| stats count by user, CommandLine, host
| sort -count`,
        tags: ['sysmon', 'system-info', 'discovery']
    },
    {
        id: 'recon-004',
        title: 'User and Group Enumeration',
        description: 'Detect enumeration of user accounts and group memberships.',
        category: 'reconnaissance',
        difficulty: 'beginner',
        spl: `index=sysmon EventCode=1
| search CommandLine="*net user*" OR CommandLine="*net group*" OR CommandLine="*net localgroup*" OR CommandLine="*Get-ADUser*"
| stats count by user, CommandLine, host
| sort -count`,
        tags: ['sysmon', 'users', 'groups']
    },
    {
        id: 'recon-005',
        title: 'Port Scanning from Internal Host',
        description: 'Detect internal hosts performing port scanning activities.',
        category: 'reconnaissance',
        difficulty: 'intermediate',
        spl: `index=firewall action=blocked
| bin _time span=5m
| stats dc(dest_port) as unique_ports, dc(dest_ip) as unique_hosts by src_ip, _time
| where unique_ports > 50 OR unique_hosts > 20
| sort -unique_ports`,
        tags: ['firewall', 'scanning', 'internal']
    },
    {
        id: 'recon-006',
        title: 'BloodHound/SharpHound Detection',
        description: 'Detect usage of BloodHound/SharpHound for AD reconnaissance.',
        category: 'reconnaissance',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1
| search CommandLine="*SharpHound*" OR CommandLine="*Invoke-Bloodhound*" OR CommandLine="*-CollectionMethod*"
| stats count by user, CommandLine, host
| sort -count`,
        tags: ['sysmon', 'bloodhound', 'ad-recon']
    },
    {
        id: 'recon-007',
        title: 'DNS Zone Transfer Attempts',
        description: 'Detect attempts to perform DNS zone transfers.',
        category: 'reconnaissance',
        difficulty: 'intermediate',
        spl: `index=dns query_type=AXFR OR query_type=IXFR
| stats count by src_ip, query
| sort -count`,
        tags: ['dns', 'zone-transfer', 'enumeration']
    },
    {
        id: 'recon-008',
        title: 'SNMP Enumeration',
        description: 'Detect SNMP enumeration attempts against network devices.',
        category: 'reconnaissance',
        difficulty: 'intermediate',
        spl: `index=firewall dest_port=161
| stats count, dc(dest_ip) as unique_targets by src_ip
| where unique_targets > 5
| sort -unique_targets`,
        tags: ['firewall', 'snmp', 'enumeration']
    },

    // ========== CLOUD SECURITY (89-96) ==========
    {
        id: 'cloud-001',
        title: 'AWS Root Account Login',
        description: 'Detect logins using the AWS root account which should be avoided.',
        category: 'cloudSecurity',
        difficulty: 'beginner',
        spl: `index=aws sourcetype=aws:cloudtrail eventName=ConsoleLogin userIdentity.type=Root
| stats count by sourceIPAddress, eventTime, userAgent
| sort -count`,
        tags: ['aws', 'root', 'console-login']
    },
    {
        id: 'cloud-002',
        title: 'AWS Security Group Changes',
        description: 'Monitor changes to AWS security groups that control network access.',
        category: 'cloudSecurity',
        difficulty: 'beginner',
        spl: `index=aws sourcetype=aws:cloudtrail eventName IN ("AuthorizeSecurityGroupIngress", "AuthorizeSecurityGroupEgress", "RevokeSecurityGroupIngress", "CreateSecurityGroup")
| stats count by userIdentity.userName, eventName, requestParameters.groupId
| sort -count`,
        tags: ['aws', 'security-group', 'network']
    },
    {
        id: 'cloud-003',
        title: 'AWS IAM Policy Changes',
        description: 'Track changes to IAM policies which control permissions.',
        category: 'cloudSecurity',
        difficulty: 'intermediate',
        spl: `index=aws sourcetype=aws:cloudtrail eventName IN ("PutUserPolicy", "PutRolePolicy", "AttachUserPolicy", "AttachRolePolicy", "CreatePolicy")
| stats count by userIdentity.userName, eventName, requestParameters.policyName
| sort -count`,
        tags: ['aws', 'iam', 'policy']
    },
    {
        id: 'cloud-004',
        title: 'AWS S3 Public Access',
        description: 'Detect S3 buckets being made publicly accessible.',
        category: 'cloudSecurity',
        difficulty: 'intermediate',
        spl: `index=aws sourcetype=aws:cloudtrail eventName IN ("PutBucketAcl", "PutBucketPolicy")
| search requestParameters.accessControlPolicy.grants{}.grantee.uri="*AllUsers*" OR requestParameters.accessControlPolicy.grants{}.grantee.uri="*AuthenticatedUsers*"
| stats count by userIdentity.userName, requestParameters.bucketName
| sort -count`,
        tags: ['aws', 's3', 'public-access']
    },
    {
        id: 'cloud-005',
        title: 'Azure Sign-in from New Location',
        description: 'Detect Azure AD sign-ins from new geographic locations.',
        category: 'cloudSecurity',
        difficulty: 'intermediate',
        spl: `index=azure sourcetype=azure:aad:signin
| stats earliest(_time) as first_seen by userPrincipalName, location.city, location.countryOrRegion
| where first_seen > relative_time(now(), "-24h")
| eval first_seen=strftime(first_seen, "%Y-%m-%d %H:%M:%S")
| sort -first_seen`,
        tags: ['azure', 'signin', 'geolocation']
    },
    {
        id: 'cloud-006',
        title: 'Azure Privileged Role Assignment',
        description: 'Monitor assignment of privileged Azure AD roles.',
        category: 'cloudSecurity',
        difficulty: 'intermediate',
        spl: `index=azure sourcetype=azure:aad:audit operationName="Add member to role"
| search targetResources{}.modifiedProperties{}.displayName="Role.DisplayName" targetResources{}.modifiedProperties{}.newValue="*Admin*"
| stats count by initiatedBy.user.userPrincipalName, targetResources{}.userPrincipalName
| sort -count`,
        tags: ['azure', 'rbac', 'admin']
    },
    {
        id: 'cloud-007',
        title: 'GCP Service Account Key Creation',
        description: 'Track creation of service account keys which can be misused.',
        category: 'cloudSecurity',
        difficulty: 'intermediate',
        spl: `index=gcp sourcetype=google:gcp:pubsub:message methodName="google.iam.admin.v1.CreateServiceAccountKey"
| stats count by protoPayload.authenticationInfo.principalEmail, protoPayload.resourceName
| sort -count`,
        tags: ['gcp', 'service-account', 'key']
    },
    {
        id: 'cloud-008',
        title: 'Cloud API Errors Spike',
        description: 'Detect sudden increases in cloud API errors which may indicate attack attempts.',
        category: 'cloudSecurity',
        difficulty: 'advanced',
        spl: `index=aws sourcetype=aws:cloudtrail errorCode!=""
| timechart span=1h count by errorCode
| foreach * [eval <<FIELD>>=if(<<FIELD>>>100, <<FIELD>>, null())]
| where isnotnull(AccessDenied) OR isnotnull(UnauthorizedAccess)`,
        tags: ['aws', 'api-errors', 'anomaly']
    },

    // ========== COMPLIANCE (97-100) ==========
    {
        id: 'comp-001',
        title: 'Audit Policy Changes',
        description: 'Track changes to Windows audit policies which may indicate an attacker covering tracks.',
        category: 'compliance',
        difficulty: 'intermediate',
        spl: `index=security EventCode=4719
| stats count by SubjectUserName, CategoryId, SubcategoryGuid, AuditPolicyChanges
| sort -count`,
        tags: ['windows', 'audit', 'policy']
    },
    {
        id: 'comp-002',
        title: 'Log Clearing Events',
        description: 'Detect when security logs are cleared which may indicate evidence destruction.',
        category: 'compliance',
        difficulty: 'beginner',
        spl: `index=security EventCode=1102 OR EventCode=104
| stats count by SubjectUserName, Channel, host
| sort -count`,
        tags: ['windows', 'log-clear', 'evidence']
    },
    {
        id: 'comp-003',
        title: 'User Account Changes Summary',
        description: 'Comprehensive view of user account modifications for compliance reporting.',
        category: 'compliance',
        difficulty: 'intermediate',
        spl: `index=security EventCode IN (4720, 4722, 4723, 4724, 4725, 4726, 4738)
| eval action=case(
    EventCode=4720, "Created",
    EventCode=4722, "Enabled",
    EventCode=4723, "Password Changed (by user)",
    EventCode=4724, "Password Reset",
    EventCode=4725, "Disabled",
    EventCode=4726, "Deleted",
    EventCode=4738, "Changed")
| stats count by action, SubjectUserName, TargetUserName
| sort action`,
        tags: ['windows', 'user-management', 'audit']
    },
    {
        id: 'comp-004',
        title: 'Failed Access to Sensitive Data',
        description: 'Track failed attempts to access files in sensitive directories.',
        category: 'compliance',
        difficulty: 'intermediate',
        spl: `index=security EventCode=4656 Keywords="Audit Failure"
| search ObjectName="*Finance*" OR ObjectName="*HR*" OR ObjectName="*Legal*" OR ObjectName="*Confidential*"
| stats count by SubjectUserName, ObjectName, ProcessName
| sort -count`,
        tags: ['windows', 'file-access', 'sensitive']
    },

    // ========== PERFORMANCE & HEALTH (101-108) ==========
    {
        id: 'perf-001',
        title: 'Splunk Indexing Lag',
        description: 'Monitor the delay between event time and index time to detect ingestion issues.',
        category: 'performance',
        difficulty: 'intermediate',
        spl: `index=_internal sourcetype=splunkd component=Metrics group=queue
| eval lag=indexing_lag
| timechart span=5m avg(lag) as avg_lag_seconds
| where avg_lag_seconds > 60`,
        tags: ['splunk', 'indexing', 'lag']
    },
    {
        id: 'perf-002',
        title: 'Data Source Volume Monitoring',
        description: 'Track event volume by sourcetype to identify unexpected drops or spikes.',
        category: 'performance',
        difficulty: 'beginner',
        spl: `| tstats count where index=* by index, sourcetype, _time span=1h
| timechart span=1h sum(count) by sourcetype`,
        tags: ['volume', 'sourcetype', 'monitoring']
    },
    {
        id: 'perf-003',
        title: 'Silent Log Sources',
        description: 'Find hosts that have stopped sending logs in the last 24 hours.',
        category: 'performance',
        difficulty: 'intermediate',
        spl: `| tstats latest(_time) as last_seen where index=* by host
| eval hours_ago=round((now()-last_seen)/3600, 1)
| where hours_ago > 24
| sort -hours_ago
| eval last_seen=strftime(last_seen, "%Y-%m-%d %H:%M:%S")`,
        tags: ['host', 'silent', 'data-quality']
    },
    {
        id: 'perf-004',
        title: 'Search Performance Issues',
        description: 'Identify slow-running searches that may impact system performance.',
        category: 'performance',
        difficulty: 'intermediate',
        spl: `index=_audit action=search info=completed
| eval runtime_mins=total_run_time/60
| where runtime_mins > 5
| stats count, avg(runtime_mins) as avg_runtime by user, search
| sort -avg_runtime`,
        tags: ['splunk', 'search', 'performance']
    },
    {
        id: 'perf-005',
        title: 'Forwarder Health Check',
        description: 'Monitor Universal Forwarder connectivity and data transmission status.',
        category: 'performance',
        difficulty: 'intermediate',
        spl: `index=_internal sourcetype=splunkd component=Metrics group=tcpin_connections
| stats latest(connectionType) as type, latest(fwdType) as forwarder_type, latest(version) as version by hostname
| join type=left hostname [| tstats latest(_time) as last_event where index=* by host | rename host as hostname]
| eval status=if(now()-last_event>3600, "STALE", "OK")
| table hostname, type, forwarder_type, version, status`,
        tags: ['forwarder', 'health', 'connectivity']
    },
    {
        id: 'perf-006',
        title: 'License Usage Tracking',
        description: 'Monitor daily license usage to prevent overages and plan capacity.',
        category: 'performance',
        difficulty: 'beginner',
        spl: `index=_internal sourcetype=splunkd component=LicenseUsage type=Usage
| timechart span=1d sum(b) as bytes_indexed
| eval gb_indexed=round(bytes_indexed/1024/1024/1024, 2)
| fields _time, gb_indexed`,
        tags: ['license', 'capacity', 'planning']
    },
    {
        id: 'perf-007',
        title: 'Queue Fill Ratio',
        description: 'Monitor Splunk internal queues to detect processing bottlenecks.',
        category: 'performance',
        difficulty: 'advanced',
        spl: `index=_internal sourcetype=splunkd component=Metrics group=queue
| eval fill_ratio=current_size_kb/max_size_kb*100
| where fill_ratio > 70
| stats avg(fill_ratio) as avg_fill by name, host
| sort -avg_fill`,
        tags: ['splunk', 'queue', 'bottleneck']
    },
    {
        id: 'perf-008',
        title: 'Event Parsing Errors',
        description: 'Identify data sources with parsing or timestamp extraction issues.',
        category: 'performance',
        difficulty: 'intermediate',
        spl: `index=_internal sourcetype=splunkd component=DateParserVerbose
| stats count by sourcetype, punct
| where count > 100
| sort -count`,
        tags: ['parsing', 'timestamp', 'errors']
    },

    // ========== LATERAL MOVEMENT (109-116) ==========
    {
        id: 'lat-001',
        title: 'PsExec Remote Execution',
        description: 'Detect PsExec usage for remote command execution, commonly used for lateral movement.',
        category: 'lateralMovement',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search (process_name="psexec.exe" OR process_name="psexesvc.exe" OR CommandLine="*\\\\\\\\*" process_name="cmd.exe")
| stats count by user, src_ip, dest, CommandLine
| sort -count`,
        tags: ['sysmon', 'psexec', 'remote-execution']
    },
    {
        id: 'lat-002',
        title: 'WMI Remote Process Creation',
        description: 'Detect remote process creation via WMI, a common lateral movement technique.',
        category: 'lateralMovement',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1 parent_process_name="wmiprvse.exe"
| search process_name!="wmiprvse.exe"
| stats count by host, user, process_name, CommandLine
| sort -count`,
        tags: ['sysmon', 'wmi', 'remote']
    },
    {
        id: 'lat-003',
        title: 'Remote Service Installation',
        description: 'Detect services being installed on remote systems for lateral movement.',
        category: 'lateralMovement',
        difficulty: 'intermediate',
        spl: `index=security EventCode=4697
| where src_ip!=dest_ip OR isnotnull(src_ip)
| stats count by SubjectUserName, ServiceName, ServiceFileName, dest
| sort -count`,
        tags: ['windows', 'service', 'remote']
    },
    {
        id: 'lat-004',
        title: 'SMB File Share Access Anomaly',
        description: 'Detect unusual patterns of SMB share access that may indicate lateral movement.',
        category: 'lateralMovement',
        difficulty: 'advanced',
        spl: `index=security EventCode=5140
| bin _time span=1h
| stats dc(ShareName) as unique_shares, dc(dest) as unique_hosts, values(ShareName) as shares by src_ip, _time
| where unique_shares > 5 OR unique_hosts > 3
| sort -unique_shares`,
        tags: ['windows', 'smb', 'file-share']
    },
    {
        id: 'lat-005',
        title: 'Remote Desktop Hopping',
        description: 'Detect RDP sessions chaining through multiple hosts (pivoting).',
        category: 'lateralMovement',
        difficulty: 'advanced',
        spl: `index=security EventCode=4624 Logon_Type=10
| transaction user maxspan=4h
| where eventcount > 2
| stats values(src_ip) as hop_chain, dc(dest) as hosts_accessed by user
| where hosts_accessed > 2`,
        tags: ['windows', 'rdp', 'pivoting']
    },
    {
        id: 'lat-006',
        title: 'Windows Admin Share Access',
        description: 'Monitor access to administrative shares (C$, ADMIN$) used in lateral movement.',
        category: 'lateralMovement',
        difficulty: 'beginner',
        spl: `index=security EventCode=5140
| search ShareName="*$"
| stats count, dc(dest) as unique_targets by src_ip, SubjectUserName, ShareName
| sort -unique_targets`,
        tags: ['windows', 'admin-share', 'c$']
    },
    {
        id: 'lat-007',
        title: 'SSH Lateral Movement (Linux)',
        description: 'Track SSH connections between internal hosts that may indicate lateral movement.',
        category: 'lateralMovement',
        difficulty: 'intermediate',
        spl: `index=linux sourcetype=linux_secure "Accepted"
| where cidrmatch("10.0.0.0/8", src_ip) OR cidrmatch("192.168.0.0/16", src_ip)
| stats count, dc(dest) as unique_targets by src_ip, user
| where unique_targets > 3
| sort -unique_targets`,
        tags: ['linux', 'ssh', 'internal']
    },
    {
        id: 'lat-008',
        title: 'Remote Scheduled Task Creation',
        description: 'Detect scheduled tasks created on remote systems for lateral movement or persistence.',
        category: 'lateralMovement',
        difficulty: 'intermediate',
        spl: `index=security EventCode=4698
| search TaskName!="*Microsoft*" TaskName!="*Windows*"
| where src_ip!=dest OR isnotnull(src_ip)
| stats count by SubjectUserName, TaskName, dest
| sort -count`,
        tags: ['windows', 'scheduled-task', 'remote']
    },

    // ========== EMAIL SECURITY (117-124) ==========
    {
        id: 'email-001',
        title: 'Phishing Email Indicators',
        description: 'Detect emails with common phishing characteristics like suspicious attachments or links.',
        category: 'emailSecurity',
        difficulty: 'intermediate',
        spl: `index=email
| search (attachment_name="*.exe" OR attachment_name="*.js" OR attachment_name="*.vbs" OR attachment_name="*.scr" OR body="*click here*" OR body="*verify your account*")
| stats count by sender, subject, attachment_name
| sort -count`,
        tags: ['email', 'phishing', 'attachment']
    },
    {
        id: 'email-002',
        title: 'External Sender Spoofing Internal Domain',
        description: 'Detect emails from external sources claiming to be from your internal domain.',
        category: 'emailSecurity',
        difficulty: 'intermediate',
        spl: `index=email
| where like(sender, "%@yourdomain.com") AND NOT cidrmatch("10.0.0.0/8", src_ip)
| stats count by sender, src_ip, subject
| sort -count`,
        tags: ['email', 'spoofing', 'impersonation']
    },
    {
        id: 'email-003',
        title: 'Business Email Compromise Patterns',
        description: 'Detect emails with BEC indicators like wire transfer requests or urgency keywords.',
        category: 'emailSecurity',
        difficulty: 'intermediate',
        spl: `index=email
| search (subject="*wire*" OR subject="*transfer*" OR subject="*urgent*" OR subject="*payment*" OR body="*bank account*" OR body="*routing number*")
| stats count by sender, recipient, subject
| sort -count`,
        tags: ['email', 'bec', 'fraud']
    },
    {
        id: 'email-004',
        title: 'Email Forwarding Rules',
        description: 'Detect creation of email forwarding rules that may be used for data exfiltration.',
        category: 'emailSecurity',
        difficulty: 'intermediate',
        spl: `index=o365 OR index=exchange Operation="New-InboxRule" OR Operation="Set-InboxRule"
| search Parameters="*ForwardTo*" OR Parameters="*RedirectTo*"
| stats count by UserId, Parameters
| sort -count`,
        tags: ['email', 'forwarding', 'o365']
    },
    {
        id: 'email-005',
        title: 'Mass Email Deletion',
        description: 'Detect bulk email deletions that may indicate evidence destruction or compromise.',
        category: 'emailSecurity',
        difficulty: 'intermediate',
        spl: `index=o365 OR index=exchange Operation="HardDelete" OR Operation="SoftDelete"
| bin _time span=1h
| stats count by UserId, _time
| where count > 100
| sort -count`,
        tags: ['email', 'deletion', 'o365']
    },
    {
        id: 'email-006',
        title: 'Emails with Password-Protected Attachments',
        description: 'Identify emails with encrypted attachments often used to bypass security scanning.',
        category: 'emailSecurity',
        difficulty: 'beginner',
        spl: `index=email
| search attachment_name="*.zip" OR attachment_name="*.7z" OR attachment_name="*.rar"
| where isnotnull(attachment_password) OR body="*password*"
| stats count by sender, recipient, attachment_name
| sort -count`,
        tags: ['email', 'encrypted', 'attachment']
    },
    {
        id: 'email-007',
        title: 'Newly Registered Domain in Email',
        description: 'Detect emails from recently registered domains commonly used in phishing campaigns.',
        category: 'emailSecurity',
        difficulty: 'advanced',
        spl: `index=email
| rex field=sender "@(?<sender_domain>[^>]+)"
| lookup whois_data domain as sender_domain OUTPUT creation_date
| eval domain_age_days=(now()-strptime(creation_date, "%Y-%m-%d"))/86400
| where domain_age_days < 30
| stats count by sender_domain, domain_age_days
| sort domain_age_days`,
        tags: ['email', 'new-domain', 'phishing']
    },
    {
        id: 'email-008',
        title: 'Email Authentication Failures',
        description: 'Monitor SPF, DKIM, and DMARC failures that may indicate spoofing attempts.',
        category: 'emailSecurity',
        difficulty: 'intermediate',
        spl: `index=email
| search spf_result="fail" OR dkim_result="fail" OR dmarc_result="fail"
| stats count by sender_domain, spf_result, dkim_result, dmarc_result
| sort -count`,
        tags: ['email', 'spf', 'dmarc']
    },

    // ========== WEB SECURITY (125-132) ==========
    {
        id: 'web-001',
        title: 'SQL Injection Attempts',
        description: 'Detect potential SQL injection attacks in web application logs.',
        category: 'webSecurity',
        difficulty: 'intermediate',
        spl: `index=web OR index=waf
| search uri="*'*" OR uri="*--*" OR uri="*;*" OR uri="*UNION*" OR uri="*SELECT*" OR uri="*DROP*"
| rex field=uri "(?<sqli_pattern>('|--|;|UNION|SELECT|DROP|INSERT|UPDATE|DELETE))"
| stats count by src_ip, uri, sqli_pattern
| sort -count`,
        tags: ['waf', 'sql-injection', 'owasp']
    },
    {
        id: 'web-002',
        title: 'Cross-Site Scripting (XSS) Attempts',
        description: 'Detect potential XSS attacks in web requests.',
        category: 'webSecurity',
        difficulty: 'intermediate',
        spl: `index=web OR index=waf
| search uri="*<script*" OR uri="*javascript:*" OR uri="*onerror=*" OR uri="*onload=*"
| stats count by src_ip, uri
| sort -count`,
        tags: ['waf', 'xss', 'owasp']
    },
    {
        id: 'web-003',
        title: 'Directory Traversal Attempts',
        description: 'Detect attempts to access files outside the web root using path traversal.',
        category: 'webSecurity',
        difficulty: 'beginner',
        spl: `index=web OR index=waf
| search uri="*../*" OR uri="*..\\\\*" OR uri="*/etc/passwd*" OR uri="*boot.ini*"
| stats count by src_ip, uri
| sort -count`,
        tags: ['waf', 'path-traversal', 'owasp']
    },
    {
        id: 'web-004',
        title: 'Web Application Scanning',
        description: 'Detect automated vulnerability scanning against web applications.',
        category: 'webSecurity',
        difficulty: 'intermediate',
        spl: `index=web
| bin _time span=5m
| stats dc(uri) as unique_uris, count as requests by src_ip, _time
| where unique_uris > 100 AND requests > 500
| sort -unique_uris`,
        tags: ['waf', 'scanning', 'automated']
    },
    {
        id: 'web-005',
        title: 'Suspicious User Agents',
        description: 'Identify requests from known malicious or scanning tool user agents.',
        category: 'webSecurity',
        difficulty: 'beginner',
        spl: `index=web
| search user_agent="*sqlmap*" OR user_agent="*nikto*" OR user_agent="*nmap*" OR user_agent="*curl*" OR user_agent="*wget*" OR user_agent="*python*"
| stats count by src_ip, user_agent
| sort -count`,
        tags: ['waf', 'user-agent', 'tools']
    },
    {
        id: 'web-006',
        title: 'HTTP 4xx/5xx Error Spike',
        description: 'Detect unusual increases in web application errors that may indicate attacks.',
        category: 'webSecurity',
        difficulty: 'beginner',
        spl: `index=web status>=400
| timechart span=5m count by status
| where '404' > 100 OR '403' > 50 OR '500' > 20`,
        tags: ['web', 'errors', 'anomaly']
    },
    {
        id: 'web-007',
        title: 'Web Shell Detection',
        description: 'Detect potential web shell activity through suspicious URI patterns and parameters.',
        category: 'webSecurity',
        difficulty: 'advanced',
        spl: `index=web
| search (uri="*.php?cmd=*" OR uri="*.asp?exec=*" OR uri="*.jsp?c=*" OR uri="*shell*" OR uri="*eval(*" OR uri="*base64_decode*")
| stats count by src_ip, uri, dest
| sort -count`,
        tags: ['waf', 'webshell', 'backdoor']
    },
    {
        id: 'web-008',
        title: 'Brute Force Login Attempts',
        description: 'Detect brute force attacks against web application login pages.',
        category: 'webSecurity',
        difficulty: 'intermediate',
        spl: `index=web (uri="*login*" OR uri="*signin*" OR uri="*auth*") method=POST status=401
| bin _time span=5m
| stats count by src_ip, _time
| where count > 20
| sort -count`,
        tags: ['waf', 'brute-force', 'login']
    },

    // ========== INCIDENT RESPONSE (133-140) ==========
    {
        id: 'ir-001',
        title: 'User Activity Timeline',
        description: 'Build a comprehensive timeline of all activity for a specific user during an incident.',
        category: 'incidentResponse',
        difficulty: 'intermediate',
        spl: `index=* user="YOURUSER"
| eval event_type=case(
    sourcetype="WinEventLog:Security", "Windows Security",
    sourcetype="sysmon", "Sysmon",
    sourcetype="web", "Web Access",
    true(), sourcetype)
| table _time, event_type, sourcetype, action, src_ip, dest, process_name, CommandLine, _raw
| sort _time`,
        tags: ['timeline', 'user', 'investigation']
    },
    {
        id: 'ir-002',
        title: 'Host Activity Timeline',
        description: 'Create a timeline of all security-relevant events on a compromised host.',
        category: 'incidentResponse',
        difficulty: 'intermediate',
        spl: `index=* (host="YOURHOST" OR dest="YOURHOST" OR src="YOURHOST")
| eval event_summary=coalesce(signature, EventCode, action, process_name)
| table _time, sourcetype, event_summary, user, src_ip, dest_ip, process_name, CommandLine
| sort _time`,
        tags: ['timeline', 'host', 'investigation']
    },
    {
        id: 'ir-003',
        title: 'First Occurrence of IOC',
        description: 'Find the first time a specific indicator of compromise appeared in your environment.',
        category: 'incidentResponse',
        difficulty: 'beginner',
        spl: `index=* ("MALICIOUS_IP" OR "MALICIOUS_DOMAIN" OR "MALICIOUS_HASH")
| stats earliest(_time) as first_seen, latest(_time) as last_seen, count by sourcetype, host
| eval first_seen=strftime(first_seen, "%Y-%m-%d %H:%M:%S")
| eval last_seen=strftime(last_seen, "%Y-%m-%d %H:%M:%S")
| sort first_seen`,
        tags: ['ioc', 'first-seen', 'investigation']
    },
    {
        id: 'ir-004',
        title: 'Affected Systems by IOC',
        description: 'Identify all systems that communicated with or executed a malicious indicator.',
        category: 'incidentResponse',
        difficulty: 'beginner',
        spl: `index=* ("MALICIOUS_IP" OR "MALICIOUS_DOMAIN" OR "MALICIOUS_HASH")
| stats count, earliest(_time) as first_contact, latest(_time) as last_contact by host
| eval first_contact=strftime(first_contact, "%Y-%m-%d %H:%M:%S")
| sort first_contact`,
        tags: ['ioc', 'scope', 'blast-radius']
    },
    {
        id: 'ir-005',
        title: 'Process Execution Chain',
        description: 'Trace the parent-child process chain to understand attack execution flow.',
        category: 'incidentResponse',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1 host="YOURHOST"
| eval process_chain=ParentImage." -> ".Image
| stats values(CommandLine) as commands by process_chain, user
| sort process_chain`,
        tags: ['sysmon', 'process-tree', 'investigation']
    },
    {
        id: 'ir-006',
        title: 'Lateral Movement Path',
        description: 'Map the path an attacker took moving between systems.',
        category: 'incidentResponse',
        difficulty: 'advanced',
        spl: `index=security EventCode=4624 Logon_Type IN (3, 10) user="COMPROMISED_USER"
| sort _time
| streamstats current=f last(dest) as previous_host by user
| where isnotnull(previous_host)
| eval hop=previous_host." -> ".dest
| stats earliest(_time) as time, values(src_ip) as src by hop
| sort time`,
        tags: ['lateral-movement', 'path', 'investigation']
    },
    {
        id: 'ir-007',
        title: 'Data Access During Incident',
        description: 'Identify what files and data a compromised account accessed during the incident window.',
        category: 'incidentResponse',
        difficulty: 'intermediate',
        spl: `index=security (EventCode=4663 OR EventCode=5145) user="COMPROMISED_USER" earliest="INCIDENT_START" latest="INCIDENT_END"
| stats count, values(AccessMask) as access_types by ObjectName, ShareName
| sort -count`,
        tags: ['file-access', 'data', 'investigation']
    },
    {
        id: 'ir-008',
        title: 'Network Connections During Incident',
        description: 'Map all network connections made by a compromised host during an incident.',
        category: 'incidentResponse',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=3 host="COMPROMISED_HOST" earliest="INCIDENT_START" latest="INCIDENT_END"
| stats count, values(DestinationPort) as ports by DestinationIp, Image
| iplocation DestinationIp
| sort -count`,
        tags: ['network', 'connections', 'investigation']
    },

    // ========== ADDITIONAL COMPLIANCE (141-144) ==========
    {
        id: 'comp-005',
        title: 'Privileged Command Execution',
        description: 'Track execution of privileged commands for compliance auditing.',
        category: 'compliance',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search user IN ("Administrator", "SYSTEM", "root") OR CommandLine="*sudo*"
| stats count by user, process_name, CommandLine, host
| sort -count`,
        tags: ['privileged', 'commands', 'audit']
    },
    {
        id: 'comp-006',
        title: 'System Time Changes',
        description: 'Detect system time modifications that could indicate anti-forensics.',
        category: 'compliance',
        difficulty: 'beginner',
        spl: `index=security EventCode=4616
| stats count by SubjectUserName, PreviousTime, NewTime, host
| sort -count`,
        tags: ['windows', 'time-change', 'anti-forensics']
    },
    {
        id: 'comp-007',
        title: 'Security Software Status',
        description: 'Monitor for disabled or stopped security software.',
        category: 'compliance',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search CommandLine="*Stop-Service*" OR CommandLine="*net stop*" OR CommandLine="*taskkill*"
| search CommandLine="*defender*" OR CommandLine="*antivirus*" OR CommandLine="*security*" OR CommandLine="*firewall*"
| stats count by user, CommandLine, host
| sort -count`,
        tags: ['security-software', 'disabled', 'evasion']
    },
    {
        id: 'comp-008',
        title: 'Administrative Actions Summary',
        description: 'Daily summary of all administrative actions for compliance reporting.',
        category: 'compliance',
        difficulty: 'intermediate',
        spl: `index=security EventCode IN (4720, 4722, 4725, 4726, 4728, 4732, 4756, 4697, 4698, 4719)
| eval action=case(
    EventCode=4720, "User Created",
    EventCode=4722, "User Enabled",
    EventCode=4725, "User Disabled",
    EventCode=4726, "User Deleted",
    EventCode=4728, "Added to Global Group",
    EventCode=4732, "Added to Local Group",
    EventCode=4756, "Added to Universal Group",
    EventCode=4697, "Service Installed",
    EventCode=4698, "Scheduled Task Created",
    EventCode=4719, "Audit Policy Changed")
| stats count by action, SubjectUserName
| sort action`,
        tags: ['admin-actions', 'summary', 'audit']
    },

    // ========== DEFENSE EVASION (145-152) ==========
    {
        id: 'evasion-001',
        title: 'Timestomping Detection',
        description: 'Detect file timestamp manipulation used to hide malicious file creation times.',
        category: 'defenseEvasion',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=2
| eval time_diff=abs(CreationUtcTime-PreviousCreationUtcTime)
| where time_diff > 86400
| stats count by TargetFilename, Image, user, host
| sort -count`,
        tags: ['sysmon', 'timestomp', 'anti-forensics']
    },
    {
        id: 'evasion-002',
        title: 'Process Masquerading',
        description: 'Detect processes running from unexpected locations or with misleading names.',
        category: 'defenseEvasion',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| eval suspicious=case(
    like(Image, "%\\svchost.exe") AND NOT like(Image, "%\\System32\\%"), "svchost outside System32",
    like(Image, "%\\csrss.exe") AND NOT like(Image, "%\\System32\\%"), "csrss outside System32",
    like(Image, "%\\lsass.exe") AND NOT like(Image, "%\\System32\\%"), "lsass outside System32",
    like(Image, "%\\services.exe") AND NOT like(Image, "%\\System32\\%"), "services outside System32",
    true(), null())
| where isnotnull(suspicious)
| stats count by suspicious, Image, CommandLine, host
| sort -count`,
        tags: ['sysmon', 'masquerading', 'mitre']
    },
    {
        id: 'evasion-003',
        title: 'Indicator Removal - File Deletion',
        description: 'Detect mass deletion of files that may indicate evidence destruction.',
        category: 'defenseEvasion',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=23
| bin _time span=5m
| stats count, dc(TargetFilename) as unique_files by user, host, _time
| where count > 50 OR unique_files > 20
| sort -count`,
        tags: ['sysmon', 'file-deletion', 'anti-forensics']
    },
    {
        id: 'evasion-004',
        title: 'Windows Event Log Tampering',
        description: 'Detect attempts to clear, disable, or tamper with Windows event logs.',
        category: 'defenseEvasion',
        difficulty: 'beginner',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*wevtutil*cl*" OR CommandLine="*Clear-EventLog*" OR CommandLine="*wevtutil*sl*/e:false*")
| stats count by user, CommandLine, host
| sort -count`,
        tags: ['sysmon', 'log-tampering', 'anti-forensics']
    },
    {
        id: 'evasion-005',
        title: 'AMSI Bypass Attempts',
        description: 'Detect attempts to bypass the Antimalware Scan Interface (AMSI).',
        category: 'defenseEvasion',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1
| search CommandLine="*AmsiScanBuffer*" OR CommandLine="*amsiInitFailed*" OR CommandLine="*AmsiUtils*" OR CommandLine="*amsi.dll*"
| stats count by user, CommandLine, ParentCommandLine, host
| sort -count`,
        tags: ['sysmon', 'amsi', 'bypass']
    },
    {
        id: 'evasion-006',
        title: 'Alternate Data Stream Usage',
        description: 'Detect creation or execution of alternate data streams used to hide malware.',
        category: 'defenseEvasion',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=15
| stats count by TargetFilename, Contents, host
| sort -count`,
        tags: ['sysmon', 'ads', 'hidden-data']
    },
    {
        id: 'evasion-007',
        title: 'Security Tool Process Termination',
        description: 'Detect attempts to kill security tool processes.',
        category: 'defenseEvasion',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*taskkill*" OR CommandLine="*Stop-Process*")
| search (CommandLine="*MsMpEng*" OR CommandLine="*defender*" OR CommandLine="*carbon*" OR CommandLine="*crowd*" OR CommandLine="*sentinel*" OR CommandLine="*symantec*" OR CommandLine="*mcafee*")
| stats count by user, CommandLine, host
| sort -count`,
        tags: ['sysmon', 'security-tools', 'termination']
    },
    {
        id: 'evasion-008',
        title: 'Parent PID Spoofing',
        description: 'Detect processes with suspicious parent process relationships indicating PPID spoofing.',
        category: 'defenseEvasion',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1
| where ParentImage!=Image
| eval suspicious=case(
    ParentImage="C:\\Windows\\System32\\svchost.exe" AND NOT match(Image, "(?i)C:\\\\Windows\\\\"), "svchost spawning non-Windows process",
    ParentImage="C:\\Windows\\explorer.exe" AND match(Image, "(?i)powershell|cmd"), "Explorer spawning shell",
    true(), null())
| where isnotnull(suspicious) AND ParentCommandLine=""
| stats count by suspicious, ParentImage, Image, CommandLine, host
| sort -count`,
        tags: ['sysmon', 'ppid-spoofing', 'evasion']
    },

    // ========== CONTAINER SECURITY (153-160) ==========
    {
        id: 'container-001',
        title: 'Kubernetes API Unauthorized Access',
        description: 'Detect unauthorized or anonymous access attempts to the Kubernetes API.',
        category: 'containerSecurity',
        difficulty: 'intermediate',
        spl: `index=kubernetes sourcetype=kube:apiserver
| search responseStatus.code>=400 OR user.username="system:anonymous"
| stats count by user.username, verb, requestURI, responseStatus.code, sourceIPs{}
| sort -count`,
        tags: ['kubernetes', 'api', 'unauthorized']
    },
    {
        id: 'container-002',
        title: 'Privileged Container Creation',
        description: 'Detect creation of privileged containers that can access host resources.',
        category: 'containerSecurity',
        difficulty: 'beginner',
        spl: `index=kubernetes sourcetype=kube:apiserver verb=create
| spath input=requestObject output=privileged path=spec.containers{}.securityContext.privileged
| where privileged="true"
| stats count by user.username, objectRef.name, objectRef.namespace
| sort -count`,
        tags: ['kubernetes', 'privileged', 'container']
    },
    {
        id: 'container-003',
        title: 'Container Escape Indicators',
        description: 'Detect potential container escape attempts through suspicious mount paths or capabilities.',
        category: 'containerSecurity',
        difficulty: 'advanced',
        spl: `index=kubernetes sourcetype=kube:apiserver verb=create
| spath input=requestObject
| search "spec.volumes{}.hostPath.path"="/var/run/docker.sock" OR "spec.volumes{}.hostPath.path"="/" OR "spec.containers{}.securityContext.capabilities.add{}"="SYS_ADMIN"
| stats count by user.username, objectRef.name, objectRef.namespace
| sort -count`,
        tags: ['kubernetes', 'escape', 'breakout']
    },
    {
        id: 'container-004',
        title: 'Kubectl Exec into Container',
        description: 'Monitor interactive shell sessions into containers which may indicate compromise.',
        category: 'containerSecurity',
        difficulty: 'beginner',
        spl: `index=kubernetes sourcetype=kube:apiserver verb=create
| search requestURI="*/exec*" OR requestURI="*/attach*"
| stats count by user.username, objectRef.name, objectRef.namespace, sourceIPs{}
| sort -count`,
        tags: ['kubernetes', 'exec', 'interactive']
    },
    {
        id: 'container-005',
        title: 'Secrets Access Monitoring',
        description: 'Track access to Kubernetes secrets which may contain sensitive credentials.',
        category: 'containerSecurity',
        difficulty: 'intermediate',
        spl: `index=kubernetes sourcetype=kube:apiserver objectRef.resource=secrets verb IN (get, list, watch)
| stats count, dc(objectRef.name) as unique_secrets by user.username, objectRef.namespace, verb
| where count > 10 OR unique_secrets > 5
| sort -count`,
        tags: ['kubernetes', 'secrets', 'credentials']
    },
    {
        id: 'container-006',
        title: 'Docker Socket Access',
        description: 'Detect processes accessing the Docker socket which could indicate container escape.',
        category: 'containerSecurity',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search CommandLine="*/var/run/docker.sock*" OR CommandLine="*docker.sock*"
| stats count by user, Image, CommandLine, host
| sort -count`,
        tags: ['docker', 'socket', 'escape']
    },
    {
        id: 'container-007',
        title: 'New Container Image Deployed',
        description: 'Track deployment of new or unknown container images in the environment.',
        category: 'containerSecurity',
        difficulty: 'intermediate',
        spl: `index=kubernetes sourcetype=kube:apiserver verb=create objectRef.resource=pods
| spath input=requestObject output=image path=spec.containers{}.image
| stats earliest(_time) as first_seen, count by image, objectRef.namespace
| where first_seen > relative_time(now(), "-24h")
| eval first_seen=strftime(first_seen, "%Y-%m-%d %H:%M:%S")
| sort first_seen`,
        tags: ['kubernetes', 'image', 'deployment']
    },
    {
        id: 'container-008',
        title: 'Pod Security Policy Violations',
        description: 'Detect attempts to create pods that violate security policies.',
        category: 'containerSecurity',
        difficulty: 'intermediate',
        spl: `index=kubernetes sourcetype=kube:apiserver verb=create objectRef.resource=pods responseStatus.code>=400
| search responseStatus.message="*forbidden*" OR responseStatus.message="*denied*" OR responseStatus.message="*policy*"
| stats count by user.username, objectRef.namespace, responseStatus.message
| sort -count`,
        tags: ['kubernetes', 'psp', 'policy']
    },

    // ========== DATABASE SECURITY (161-168) ==========
    {
        id: 'db-001',
        title: 'Database Login Failures',
        description: 'Monitor failed database authentication attempts that may indicate brute force attacks.',
        category: 'databaseSecurity',
        difficulty: 'beginner',
        spl: `index=database sourcetype IN ("oracle:audit", "mssql:audit", "mysql:audit")
| search action=LOGON_FAILED OR action=LOGIN_FAILED OR action="FAILED_LOGIN"
| stats count by user, src_ip, database_name
| where count > 5
| sort -count`,
        tags: ['database', 'login', 'brute-force']
    },
    {
        id: 'db-002',
        title: 'Privileged Database Operations',
        description: 'Track usage of privileged database commands like GRANT, DROP, or ALTER.',
        category: 'databaseSecurity',
        difficulty: 'intermediate',
        spl: `index=database sourcetype IN ("oracle:audit", "mssql:audit", "mysql:audit")
| search query_type IN ("GRANT", "REVOKE", "DROP", "ALTER", "CREATE USER", "DROP USER", "TRUNCATE")
| stats count by user, query_type, database_name, query
| sort -count`,
        tags: ['database', 'privileged', 'ddl']
    },
    {
        id: 'db-003',
        title: 'Large Data Extraction',
        description: 'Detect queries returning unusually large result sets that may indicate data theft.',
        category: 'databaseSecurity',
        difficulty: 'intermediate',
        spl: `index=database sourcetype IN ("oracle:audit", "mssql:audit", "mysql:audit")
| where rows_returned > 10000 OR bytes_returned > 10000000
| stats sum(rows_returned) as total_rows, sum(bytes_returned) as total_bytes by user, database_name, src_ip
| sort -total_rows`,
        tags: ['database', 'exfiltration', 'large-query']
    },
    {
        id: 'db-004',
        title: 'After-Hours Database Access',
        description: 'Monitor database access occurring outside normal business hours.',
        category: 'databaseSecurity',
        difficulty: 'beginner',
        spl: `index=database sourcetype IN ("oracle:audit", "mssql:audit", "mysql:audit") action=LOGON OR action=LOGIN
| eval hour=strftime(_time, "%H")
| where hour < 6 OR hour >= 20
| stats count by user, database_name, src_ip
| sort -count`,
        tags: ['database', 'after-hours', 'anomaly']
    },
    {
        id: 'db-005',
        title: 'Database Schema Changes',
        description: 'Track modifications to database schema including table and column changes.',
        category: 'databaseSecurity',
        difficulty: 'intermediate',
        spl: `index=database sourcetype IN ("oracle:audit", "mssql:audit", "mysql:audit")
| search query_type IN ("CREATE TABLE", "DROP TABLE", "ALTER TABLE", "CREATE INDEX", "DROP INDEX")
| stats count by user, query_type, object_name, database_name
| sort -count`,
        tags: ['database', 'schema', 'ddl']
    },
    {
        id: 'db-006',
        title: 'Sensitive Table Access',
        description: 'Monitor access to tables containing sensitive data like PII or financial information.',
        category: 'databaseSecurity',
        difficulty: 'intermediate',
        spl: `index=database sourcetype IN ("oracle:audit", "mssql:audit", "mysql:audit")
| search object_name IN ("CUSTOMERS", "USERS", "EMPLOYEES", "CREDIT_CARDS", "PAYMENTS", "SSN", "PASSWORDS", "CREDENTIALS")
| stats count, dc(user) as unique_users by object_name, database_name
| sort -count`,
        tags: ['database', 'sensitive', 'pii']
    },
    {
        id: 'db-007',
        title: 'SQL Injection via Database Logs',
        description: 'Detect SQL injection patterns in database query logs.',
        category: 'databaseSecurity',
        difficulty: 'advanced',
        spl: `index=database sourcetype IN ("oracle:audit", "mssql:audit", "mysql:audit")
| search query="*'*OR*'*" OR query="*UNION*SELECT*" OR query="*;*DROP*" OR query="*1=1*" OR query="*--*"
| stats count by user, query, src_ip
| sort -count`,
        tags: ['database', 'sql-injection', 'attack']
    },
    {
        id: 'db-008',
        title: 'Database Backup Operations',
        description: 'Monitor database backup activities to ensure compliance and detect unauthorized backups.',
        category: 'databaseSecurity',
        difficulty: 'beginner',
        spl: `index=database sourcetype IN ("oracle:audit", "mssql:audit", "mysql:audit")
| search query_type IN ("BACKUP", "EXPORT", "DUMP", "BACKUP DATABASE", "expdp", "mysqldump")
| stats count by user, query_type, database_name, dest_path
| sort -count`,
        tags: ['database', 'backup', 'export']
    },

    // ========== ACTIVE DIRECTORY ATTACKS (169-176) ==========
    {
        id: 'ad-001',
        title: 'DCSync Attack Detection',
        description: 'Detect DCSync attacks by monitoring directory replication requests from non-DC sources.',
        category: 'activeDirectory',
        difficulty: 'advanced',
        spl: `index=security EventCode=4662
| search Properties="*Replicating Directory Changes*" OR Properties="*1131f6ad-9c07-11d1-f79f-00c04fc2dcd2*" OR Properties="*1131f6aa-9c07-11d1-f79f-00c04fc2dcd2*"
| lookup is_domain_controller host OUTPUT is_dc
| where is_dc!="true"
| stats count by SubjectUserName, SubjectDomainName, ObjectName, host
| sort -count`,
        tags: ['active-directory', 'dcsync', 'credential-theft']
    },
    {
        id: 'ad-002',
        title: 'Kerberoasting Detection',
        description: 'Detect Kerberoasting attacks by monitoring TGS requests for service accounts.',
        category: 'activeDirectory',
        difficulty: 'advanced',
        spl: `index=security EventCode=4769 Ticket_Encryption_Type=0x17
| bin _time span=5m
| stats dc(ServiceName) as unique_spns, count as requests by Client_Address, _time
| where unique_spns > 5
| sort -unique_spns`,
        tags: ['active-directory', 'kerberoasting', 'spn']
    },
    {
        id: 'ad-003',
        title: 'AS-REP Roasting Detection',
        description: 'Detect AS-REP Roasting by monitoring pre-authentication disabled accounts.',
        category: 'activeDirectory',
        difficulty: 'advanced',
        spl: `index=security EventCode=4768 Pre_Authentication_Type=0
| stats count by Client_Address, user
| where count > 5
| sort -count`,
        tags: ['active-directory', 'asrep-roasting', 'kerberos']
    },
    {
        id: 'ad-004',
        title: 'Group Policy Object Modification',
        description: 'Monitor changes to Group Policy Objects that could affect domain security.',
        category: 'activeDirectory',
        difficulty: 'intermediate',
        spl: `index=security EventCode=5136 ObjectClass=groupPolicyContainer
| stats count by SubjectUserName, ObjectDN, AttributeLDAPDisplayName, AttributeValue
| sort -count`,
        tags: ['active-directory', 'gpo', 'policy']
    },
    {
        id: 'ad-005',
        title: 'LDAP Reconnaissance',
        description: 'Detect LDAP queries commonly used for Active Directory enumeration.',
        category: 'activeDirectory',
        difficulty: 'intermediate',
        spl: `index=security EventCode=1644
| search SearchFilter="*objectClass=*" OR SearchFilter="*samAccountType*" OR SearchFilter="*userAccountControl*"
| stats count, dc(SearchFilter) as unique_queries by Client_IP
| where count > 50 OR unique_queries > 10
| sort -count`,
        tags: ['active-directory', 'ldap', 'enumeration']
    },
    {
        id: 'ad-006',
        title: 'AdminSDHolder Modification',
        description: 'Detect modifications to AdminSDHolder which can be used for AD persistence.',
        category: 'activeDirectory',
        difficulty: 'advanced',
        spl: `index=security EventCode=5136
| search ObjectDN="*AdminSDHolder*"
| stats count by SubjectUserName, ObjectDN, AttributeLDAPDisplayName, AttributeValue
| sort -count`,
        tags: ['active-directory', 'adminsdholder', 'persistence']
    },
    {
        id: 'ad-007',
        title: 'SID History Injection',
        description: 'Detect SID History modifications that could indicate privilege escalation.',
        category: 'activeDirectory',
        difficulty: 'advanced',
        spl: `index=security EventCode=4765 OR EventCode=4766
| stats count by SubjectUserName, TargetUserName, SidHistory
| sort -count`,
        tags: ['active-directory', 'sid-history', 'escalation']
    },
    {
        id: 'ad-008',
        title: 'Domain Trust Modifications',
        description: 'Monitor creation or modification of domain trusts that could indicate compromise.',
        category: 'activeDirectory',
        difficulty: 'intermediate',
        spl: `index=security EventCode=4706 OR EventCode=4707 OR EventCode=4716 OR EventCode=4865
| stats count by SubjectUserName, TrustDirection, TrustType, TrustedDomain
| sort -count`,
        tags: ['active-directory', 'trust', 'domain']
    },

    // ========== RANSOMWARE (177-184) ==========
    {
        id: 'ransom-001',
        title: 'Ransomware Note File Creation',
        description: 'Detect creation of common ransomware note files indicating active encryption.',
        category: 'ransomware',
        difficulty: 'beginner',
        dataSource: 'Sysmon',
        mitre: 'T1486',
        useCase: 'Incident Response',
        spl: `index=sysmon EventCode=11
| search TargetFilename="*README*" OR TargetFilename="*DECRYPT*" OR TargetFilename="*RECOVER*" OR TargetFilename="*HOW_TO*" OR TargetFilename="*RESTORE*" OR TargetFilename="*.hta"
| bin _time span=5m
| stats count, dc(host) as affected_hosts by TargetFilename, _time
| where count > 5
| sort -count`,
        tags: ['ransomware', 'ransom-note', 'encryption']
    },
    {
        id: 'ransom-002',
        title: 'Mass File Encryption Activity',
        description: 'Detect rapid file modifications with extension changes indicating ransomware encryption.',
        category: 'ransomware',
        difficulty: 'intermediate',
        dataSource: 'Sysmon',
        mitre: 'T1486',
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=11
| bin _time span=1m
| stats count as file_changes, dc(TargetFilename) as unique_files by host, user, _time
| where file_changes > 100 AND unique_files > 50
| sort -file_changes`,
        tags: ['ransomware', 'encryption', 'mass-modification']
    },
    {
        id: 'ransom-003',
        title: 'Volume Shadow Copy Deletion',
        description: 'Detect deletion of shadow copies, a key ransomware preparation step.',
        category: 'ransomware',
        difficulty: 'beginner',
        dataSource: 'Sysmon',
        mitre: 'T1490',
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*vssadmin*delete*shadow*" OR CommandLine="*wmic*shadowcopy*delete*" OR CommandLine="*bcdedit*/set*recoveryenabled*no*" OR CommandLine="*wbadmin*delete*catalog*")
| stats count by host, user, CommandLine, ParentImage
| sort -count`,
        tags: ['ransomware', 'vss', 'shadow-copy']
    },
    {
        id: 'ransom-004',
        title: 'Backup Destruction Commands',
        description: 'Detect commands targeting backup systems and recovery options.',
        category: 'ransomware',
        difficulty: 'intermediate',
        dataSource: 'Sysmon',
        mitre: 'T1490',
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*delete*backup*" OR CommandLine="*wbadmin*delete*" OR CommandLine="*recoveryenabled*No*" OR CommandLine="*bootstatuspolicy*ignoreallfailures*")
| stats count by host, user, CommandLine
| sort -count`,
        tags: ['ransomware', 'backup', 'recovery']
    },
    {
        id: 'ransom-005',
        title: 'Ransomware Process Behavior',
        description: 'Detect processes exhibiting ransomware-like behavior patterns.',
        category: 'ransomware',
        difficulty: 'advanced',
        dataSource: 'Sysmon',
        mitre: ['T1486', 'T1490'],
        useCase: 'Threat Hunting',
        spl: `index=sysmon EventCode=1
| join type=inner host [search index=sysmon EventCode=11 | bin _time span=5m | stats count as file_mods by host, Image | where file_mods > 100]
| join type=inner host [search index=sysmon EventCode=1 CommandLine="*vssadmin*" OR CommandLine="*shadow*"]
| stats count by host, Image, CommandLine
| sort -count`,
        tags: ['ransomware', 'behavior', 'correlation']
    },
    {
        id: 'ransom-006',
        title: 'Network Share Enumeration Before Encryption',
        description: 'Detect network share discovery that often precedes ransomware spread.',
        category: 'ransomware',
        difficulty: 'intermediate',
        dataSource: 'Sysmon',
        mitre: ['T1135', 'T1486'],
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*net view*" OR CommandLine="*net share*" OR CommandLine="*Get-SmbShare*")
| bin _time span=10m
| stats count by host, user, _time
| where count > 3
| sort -count`,
        tags: ['ransomware', 'enumeration', 'lateral']
    },
    {
        id: 'ransom-007',
        title: 'Known Ransomware File Extensions',
        description: 'Detect files being renamed to known ransomware extensions.',
        category: 'ransomware',
        difficulty: 'beginner',
        dataSource: 'Sysmon',
        mitre: 'T1486',
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=11
| rex field=TargetFilename "\\.(?<extension>[^\\.]+)$"
| search extension IN ("encrypted", "locked", "crypto", "crypt", "enc", "locky", "cerber", "wcry", "wncry", "wncryt", "crinf", "r5a", "XRNT", "XTBL", "aaa", "abc", "xyz", "zzz", "micro", "xxx", "ttt", "mp3", "vvv", "ecc", "exx", "ezz")
| stats count by host, extension
| where count > 10
| sort -count`,
        tags: ['ransomware', 'extension', 'encryption']
    },
    {
        id: 'ransom-008',
        title: 'Ransomware Canary File Access',
        description: 'Detect access to honeypot/canary files placed to detect ransomware.',
        category: 'ransomware',
        difficulty: 'intermediate',
        dataSource: 'Sysmon',
        mitre: 'T1486',
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=11 OR index=security EventCode=4663
| search TargetFilename="*canary*" OR TargetFilename="*honeypot*" OR ObjectName="*RANSOMWARE_DETECTION*"
| stats count by host, user, TargetFilename, Image
| sort -count`,
        tags: ['ransomware', 'canary', 'honeypot']
    },

    // ========== COMMAND & CONTROL (185-192) ==========
    {
        id: 'c2-001',
        title: 'DNS Tunneling Detection',
        description: 'Detect DNS tunneling through unusually long queries or high query volumes.',
        category: 'commandControl',
        difficulty: 'intermediate',
        dataSource: 'DNS',
        mitre: 'T1071.004',
        useCase: 'Threat Detection',
        spl: `index=dns
| eval query_length=len(query)
| eval subdomain_count=mvcount(split(query, "."))
| where query_length > 50 OR subdomain_count > 5
| stats count, avg(query_length) as avg_length by src_ip, query
| where count > 10
| sort -avg_length`,
        tags: ['c2', 'dns', 'tunneling']
    },
    {
        id: 'c2-002',
        title: 'HTTP Beaconing Pattern',
        description: 'Detect regular HTTP callbacks indicative of C2 beaconing.',
        category: 'commandControl',
        difficulty: 'advanced',
        dataSource: 'Proxy/Firewall',
        mitre: 'T1071.001',
        useCase: 'Threat Hunting',
        spl: `index=proxy OR index=firewall
| bin _time span=1m
| stats count by src_ip, dest_ip, dest_port, _time
| streamstats current=f window=10 stdev(count) as stdev_count, avg(count) as avg_count by src_ip, dest_ip
| where stdev_count < 1 AND avg_count > 0
| stats count as beacon_minutes, avg(avg_count) as requests_per_min by src_ip, dest_ip, dest_port
| where beacon_minutes > 30
| sort -beacon_minutes`,
        tags: ['c2', 'beaconing', 'http']
    },
    {
        id: 'c2-003',
        title: 'Domain Generation Algorithm (DGA)',
        description: 'Detect communication with DGA domains through entropy analysis.',
        category: 'commandControl',
        difficulty: 'advanced',
        dataSource: 'DNS',
        mitre: 'T1568.002',
        useCase: 'Threat Hunting',
        spl: `index=dns
| rex field=query "(?<domain>[^.]+)\\.[^.]+$"
| eval domain_length=len(domain)
| eval consonant_ratio=len(replace(domain, "[aeiouAEIOU0-9]", ""))/domain_length
| where domain_length > 10 AND consonant_ratio > 0.7
| stats count by query, src_ip
| where count > 5
| sort -count`,
        tags: ['c2', 'dga', 'dns']
    },
    {
        id: 'c2-004',
        title: 'HTTPS to Non-Standard Ports',
        description: 'Detect HTTPS/TLS traffic to non-standard ports often used by C2.',
        category: 'commandControl',
        difficulty: 'intermediate',
        dataSource: 'Firewall',
        mitre: 'T1571',
        useCase: 'Threat Detection',
        spl: `index=firewall OR index=proxy
| search (app=ssl OR app=https) dest_port!=443 dest_port!=8443
| stats count, dc(src_ip) as unique_sources by dest_ip, dest_port
| where count > 10
| sort -count`,
        tags: ['c2', 'https', 'non-standard-port']
    },
    {
        id: 'c2-005',
        title: 'Long Connection Duration',
        description: 'Detect unusually long-lived connections that may indicate C2 channels.',
        category: 'commandControl',
        difficulty: 'intermediate',
        dataSource: 'Firewall',
        mitre: 'T1071',
        useCase: 'Threat Hunting',
        spl: `index=firewall
| where duration > 3600
| stats count, avg(duration) as avg_duration, sum(bytes) as total_bytes by src_ip, dest_ip, dest_port
| eval avg_duration_hours=round(avg_duration/3600, 2)
| where avg_duration_hours > 1
| sort -avg_duration`,
        tags: ['c2', 'long-connection', 'persistent']
    },
    {
        id: 'c2-006',
        title: 'Cobalt Strike Default Indicators',
        description: 'Detect default Cobalt Strike malleable C2 profile indicators.',
        category: 'commandControl',
        difficulty: 'advanced',
        dataSource: 'Proxy',
        mitre: 'S0154',
        useCase: 'Threat Detection',
        spl: `index=proxy OR index=web
| search (uri="*/pixel*" OR uri="*/__utm.gif*" OR uri="*/submit.php*" OR uri="*/visit.js*" OR uri="*jquery*.js*" OR user_agent="*Mozilla/5.0 (compatible; MSIE*")
| stats count by src_ip, dest, uri, user_agent
| where count > 5
| sort -count`,
        tags: ['c2', 'cobalt-strike', 'malleable']
    },
    {
        id: 'c2-007',
        title: 'Cloud Service C2 Abuse',
        description: 'Detect abuse of legitimate cloud services for C2 communication.',
        category: 'commandControl',
        difficulty: 'intermediate',
        dataSource: 'Proxy',
        mitre: 'T1102',
        useCase: 'Threat Detection',
        spl: `index=proxy
| search (url="*pastebin.com*" OR url="*githubusercontent.com*" OR url="*discord.com/api*" OR url="*slack.com/api*" OR url="*telegram.org*" OR url="*notion.so*")
| bin _time span=1h
| stats count, dc(src_ip) as unique_sources by url, _time
| where count > 20
| sort -count`,
        tags: ['c2', 'cloud', 'legitimate-service']
    },
    {
        id: 'c2-008',
        title: 'Encoded PowerShell Web Requests',
        description: 'Detect PowerShell making web requests with encoded commands, common in staged C2.',
        category: 'commandControl',
        difficulty: 'intermediate',
        dataSource: 'Sysmon',
        mitre: ['T1059.001', 'T1105'],
        useCase: 'Threat Detection',
        spl: `index=sysmon EventCode=1 process_name="powershell.exe"
| search (CommandLine="*Net.WebClient*" OR CommandLine="*Invoke-WebRequest*" OR CommandLine="*Invoke-RestMethod*" OR CommandLine="*DownloadString*" OR CommandLine="*DownloadFile*")
| search (CommandLine="*-enc*" OR CommandLine="*-e *" OR CommandLine="*FromBase64*")
| stats count by host, user, CommandLine
| sort -count`,
        tags: ['c2', 'powershell', 'download']
    },

    // ========== INITIAL ACCESS (193-200) ==========
    {
        id: 'access-001',
        title: 'Exploitation of Public-Facing Application',
        description: 'Detect potential exploitation through web application error patterns.',
        category: 'initialAccess',
        difficulty: 'intermediate',
        spl: `index=web status=500
| bin _time span=5m
| stats count as errors, dc(uri) as unique_uris by src_ip, dest, _time
| where errors > 20 AND unique_uris > 5
| sort -errors`,
        tags: ['initial-access', 'exploitation', 'web-app']
    },
    {
        id: 'access-002',
        title: 'Suspicious Office Document Execution',
        description: 'Detect Office applications spawning suspicious child processes indicating macro exploitation.',
        category: 'initialAccess',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search parent_process_name IN ("winword.exe", "excel.exe", "powerpnt.exe", "outlook.exe")
| search process_name IN ("cmd.exe", "powershell.exe", "wscript.exe", "cscript.exe", "mshta.exe", "regsvr32.exe", "rundll32.exe")
| stats count by parent_process_name, process_name, CommandLine, user, host
| sort -count`,
        tags: ['initial-access', 'macro', 'office']
    },
    {
        id: 'access-003',
        title: 'Browser Exploitation Indicators',
        description: 'Detect browser processes spawning unusual child processes indicating drive-by compromise.',
        category: 'initialAccess',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search parent_process_name IN ("chrome.exe", "firefox.exe", "iexplore.exe", "msedge.exe", "browser_broker.exe")
| search process_name IN ("cmd.exe", "powershell.exe", "wscript.exe", "cscript.exe", "mshta.exe", "regsvr32.exe")
| stats count by parent_process_name, process_name, CommandLine, user, host
| sort -count`,
        tags: ['initial-access', 'drive-by', 'browser']
    },
    {
        id: 'access-004',
        title: 'Valid Account Compromise Indicators',
        description: 'Detect valid account abuse through impossible travel or unusual access patterns.',
        category: 'initialAccess',
        difficulty: 'advanced',
        spl: `index=security EventCode=4624
| iplocation src_ip
| streamstats current=f last(City) as prev_city, last(_time) as prev_time, last(src_ip) as prev_ip by user
| eval time_diff_hours=((_time-prev_time)/3600)
| where City!=prev_city AND time_diff_hours < 2 AND isnotnull(prev_city)
| stats count by user, prev_city, City, prev_ip, src_ip, time_diff_hours
| sort time_diff_hours`,
        tags: ['initial-access', 'valid-accounts', 'impossible-travel']
    },
    {
        id: 'access-005',
        title: 'External Remote Services Abuse',
        description: 'Detect suspicious access to external remote services like VPN or RDP.',
        category: 'initialAccess',
        difficulty: 'intermediate',
        spl: `index=vpn OR index=security EventCode=4624 Logon_Type=10
| iplocation src_ip
| search Country!="United States"
| stats count, dc(Country) as unique_countries, values(Country) as countries by user, src_ip
| where unique_countries > 1 OR count > 10
| sort -count`,
        tags: ['initial-access', 'remote-services', 'vpn']
    },
    {
        id: 'access-006',
        title: 'Supply Chain Compromise - Unexpected Updates',
        description: 'Detect software updates from unusual sources or at unusual times.',
        category: 'initialAccess',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1
| search (process_name="*update*" OR process_name="*setup*" OR process_name="*install*")
| search NOT (Image="*\\Windows\\*" OR Image="*\\Program Files*\\Microsoft*" OR Image="*\\Program Files (x86)\\*")
| eval hour=strftime(_time, "%H")
| where hour < 6 OR hour > 20
| stats count by Image, CommandLine, user, host
| sort -count`,
        tags: ['initial-access', 'supply-chain', 'update']
    },
    {
        id: 'access-007',
        title: 'Spearphishing Link Click',
        description: 'Detect users clicking links that lead to file downloads or suspicious sites.',
        category: 'initialAccess',
        difficulty: 'intermediate',
        spl: `index=proxy
| search (url="*download*" OR url="*.exe" OR url="*.zip" OR url="*.rar" OR url="*.js" OR url="*.hta")
| lookup email_links url OUTPUT email_subject, sender
| where isnotnull(email_subject)
| stats count by user, url, email_subject, sender
| sort -count`,
        tags: ['initial-access', 'phishing', 'link']
    },
    {
        id: 'access-008',
        title: 'Hardware Addition Detection',
        description: 'Detect new hardware devices that could be used for initial access.',
        category: 'initialAccess',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=6 OR index=security EventCode=6416
| search DeviceDescription="*USB*" OR DeviceDescription="*Removable*" OR DeviceDescription="*Network*"
| stats earliest(_time) as first_seen, count by DeviceDescription, host, user
| where first_seen > relative_time(now(), "-24h")
| eval first_seen=strftime(first_seen, "%Y-%m-%d %H:%M:%S")
| sort first_seen`,
        tags: ['initial-access', 'hardware', 'usb']
    },

    // ========== IMPACT (201-208) ==========
    {
        id: 'impact-001',
        title: 'Wiper Malware Indicators',
        description: 'Detect disk wiping utilities and destructive malware patterns.',
        category: 'impact',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*format*" AND CommandLine="*/y*") OR CommandLine="*dd*if=/dev/zero*" OR CommandLine="*cipher*/w*" OR CommandLine="*sdelete*" OR process_name IN ("diskpart.exe", "clean.exe")
| stats count by host, user, CommandLine, ParentImage
| sort -count`,
        tags: ['impact', 'wiper', 'destruction']
    },
    {
        id: 'impact-002',
        title: 'MBR/Boot Record Modification',
        description: 'Detect attempts to modify master boot record or boot configuration.',
        category: 'impact',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*bootrec*" OR CommandLine="*bcdedit*" OR CommandLine="*fixmbr*" OR CommandLine="*PhysicalDrive0*")
| stats count by host, user, CommandLine, ParentImage
| sort -count`,
        tags: ['impact', 'mbr', 'boot']
    },
    {
        id: 'impact-003',
        title: 'Cryptomining Process Detection',
        description: 'Detect cryptocurrency mining processes consuming system resources.',
        category: 'impact',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*stratum+tcp*" OR CommandLine="*-o pool.*" OR CommandLine="*xmrig*" OR CommandLine="*minerd*" OR CommandLine="*cgminer*" OR CommandLine="*cpuminer*" OR CommandLine="*--donate-level*")
| stats count by host, user, Image, CommandLine
| sort -count`,
        tags: ['impact', 'cryptomining', 'resource-hijack']
    },
    {
        id: 'impact-004',
        title: 'Cryptomining Network Connections',
        description: 'Detect network connections to known cryptocurrency mining pools.',
        category: 'impact',
        difficulty: 'intermediate',
        spl: `index=firewall OR index=proxy
| search (dest_port IN (3333, 4444, 5555, 7777, 8888, 9999, 14444, 14433) OR url="*pool.*" OR url="*mining.*" OR url="*xmr.*" OR url="*monero*" OR url="*nicehash*")
| stats count, sum(bytes) as total_bytes by src_ip, dest_ip, dest_port
| sort -count`,
        tags: ['impact', 'cryptomining', 'pool']
    },
    {
        id: 'impact-005',
        title: 'Service Disruption - Mass Service Stop',
        description: 'Detect mass stopping of services that may indicate sabotage.',
        category: 'impact',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*net stop*" OR CommandLine="*Stop-Service*" OR CommandLine="*sc stop*")
| bin _time span=5m
| stats count, dc(CommandLine) as unique_services by host, user, _time
| where count > 5 OR unique_services > 3
| sort -count`,
        tags: ['impact', 'service', 'disruption']
    },
    {
        id: 'impact-006',
        title: 'Data Destruction Commands',
        description: 'Detect commands used to permanently destroy data.',
        category: 'impact',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*del /f /s /q*" OR CommandLine="*rm -rf*" OR CommandLine="*Remove-Item*-Recurse*-Force*" OR CommandLine="*format*" OR CommandLine="*cipher /w*")
| search (CommandLine="*C:\\*" OR CommandLine="*D:\\*" OR CommandLine="*/*")
| stats count by host, user, CommandLine
| sort -count`,
        tags: ['impact', 'destruction', 'deletion']
    },
    {
        id: 'impact-007',
        title: 'Defacement Indicators',
        description: 'Detect modifications to web server content that may indicate defacement.',
        category: 'impact',
        difficulty: 'intermediate',
        spl: `index=sysmon EventCode=11
| search (TargetFilename="*wwwroot*" OR TargetFilename="*htdocs*" OR TargetFilename="*public_html*" OR TargetFilename="*inetpub*")
| search (TargetFilename="*index.*" OR TargetFilename="*default.*" OR TargetFilename="*.html" OR TargetFilename="*.htm" OR TargetFilename="*.php")
| stats count by TargetFilename, Image, user, host
| sort -count`,
        tags: ['impact', 'defacement', 'web']
    },
    {
        id: 'impact-008',
        title: 'Firmware/BIOS Access Attempts',
        description: 'Detect attempts to access or modify system firmware.',
        category: 'impact',
        difficulty: 'advanced',
        spl: `index=sysmon EventCode=1
| search (CommandLine="*firmware*" OR CommandLine="*bios*" OR CommandLine="*uefi*" OR CommandLine="*fwupd*" OR process_name IN ("fwupdate.exe", "flashrom.exe", "afuwin.exe"))
| stats count by host, user, Image, CommandLine
| sort -count`,
        tags: ['impact', 'firmware', 'bios']
    },

    // ========== JUNIOR ANALYST ESSENTIALS ==========
    {
        id: 'basic-001',
        title: 'Quick IOC Search',
        description: 'Search for a specific IP address, domain, or hash across all log sources. Replace the placeholder with your IOC.',
        category: 'incidentResponse',
        difficulty: 'beginner',
        dataSource: 'All',
        useCase: 'Investigation',
        spl: `index=* ("192.168.1.100" OR "suspicious-domain.com" OR "abc123hash")
| stats count by index, sourcetype, source
| sort -count`,
        tags: ['ioc', 'search', 'investigation', 'beginner']
    },
    {
        id: 'basic-002',
        title: 'Events Around a Timestamp',
        description: 'Find all events within 5 minutes of a specific time. Useful when you know something happened at a particular moment.',
        category: 'incidentResponse',
        difficulty: 'beginner',
        dataSource: 'All',
        useCase: 'Investigation',
        spl: `index=* earliest="01/15/2024:14:30:00" latest="01/15/2024:14:35:00"
| stats count by index, sourcetype, host
| sort -count`,
        tags: ['timeline', 'investigation', 'beginner']
    },
    {
        id: 'basic-003',
        title: 'Data Source Inventory',
        description: 'See what log sources you have available and how much data each contains. Essential for understanding your visibility.',
        category: 'performance',
        difficulty: 'beginner',
        dataSource: 'All',
        useCase: 'Monitoring',
        spl: `| tstats count where index=* by index, sourcetype
| sort -count
| head 50`,
        tags: ['inventory', 'data-sources', 'visibility', 'beginner']
    },
    {
        id: 'basic-004',
        title: 'Firewall Blocked Connections',
        description: 'View all connections that were blocked by the firewall. Helps identify what threats are being stopped.',
        category: 'network',
        difficulty: 'beginner',
        dataSource: 'Firewall',
        mitre: 'T1071',
        useCase: 'Monitoring',
        spl: `index=firewall action IN (blocked, denied, drop, reject)
| stats count by src_ip, dest_ip, dest_port, action
| sort -count
| head 50`,
        tags: ['firewall', 'blocked', 'denied', 'beginner']
    },
    {
        id: 'basic-005',
        title: 'Windows Service Failures',
        description: 'Find Windows services that failed to start. Can indicate misconfigurations or malware interference.',
        category: 'endpoint',
        difficulty: 'beginner',
        dataSource: 'Windows System',
        useCase: 'Troubleshooting',
        spl: `index=windows sourcetype=WinEventLog:System EventCode=7000 OR EventCode=7009 OR EventCode=7011
| stats count by host, EventCode, Message
| sort -count`,
        tags: ['windows', 'services', 'failures', 'beginner']
    },
    {
        id: 'basic-006',
        title: 'Search for Error Messages',
        description: 'Find events containing "error", "failed", or "denied". A simple way to hunt for problems.',
        category: 'performance',
        difficulty: 'beginner',
        dataSource: 'All',
        useCase: 'Troubleshooting',
        spl: `index=* (error OR failed OR failure OR denied OR "access denied" OR "permission denied")
| stats count by sourcetype, host
| sort -count
| head 30`,
        tags: ['errors', 'troubleshooting', 'failures', 'beginner']
    },
    {
        id: 'basic-007',
        title: 'Most Active Endpoints',
        description: 'Identify which hosts are generating the most log events. Unusual spikes may indicate issues or attacks.',
        category: 'endpoint',
        difficulty: 'beginner',
        dataSource: 'All',
        useCase: 'Monitoring',
        spl: `index=* host=*
| stats count by host
| sort -count
| head 20`,
        tags: ['hosts', 'activity', 'monitoring', 'beginner']
    },
    {
        id: 'basic-008',
        title: 'Antivirus and EDR Alerts',
        description: 'View recent security tool alerts from common AV/EDR solutions. Essential daily review for analysts.',
        category: 'endpoint',
        difficulty: 'beginner',
        dataSource: 'Antivirus/EDR',
        mitre: 'T1059',
        useCase: 'Threat Detection',
        spl: `index=* sourcetype IN (symantec*, mcafee*, defender*, crowdstrike*, carbonblack*, sentinelone*)
| search action IN (blocked, quarantined, detected, alert, suspicious)
| stats count by host, signature, action, file_path
| sort -count`,
        tags: ['antivirus', 'edr', 'alerts', 'malware', 'beginner']
    },
    {
        id: 'basic-009',
        title: 'Today\'s Login Summary',
        description: 'Quick overview of all successful logins today. Good for daily review and spotting unusual accounts.',
        category: 'authentication',
        difficulty: 'beginner',
        dataSource: 'Windows Security',
        mitre: 'T1078',
        useCase: 'Monitoring',
        spl: `index=security sourcetype=WinEventLog:Security EventCode=4624 earliest=-24h
| stats count, dc(dest) as systems_accessed, values(dest) as destinations by user
| sort -count
| head 30`,
        tags: ['logins', 'daily-review', 'authentication', 'beginner']
    },
    {
        id: 'basic-010',
        title: 'Recent Password Changes',
        description: 'Monitor password change and reset events. Unexpected changes may indicate compromise.',
        category: 'authentication',
        difficulty: 'beginner',
        dataSource: 'Windows Security',
        mitre: 'T1098',
        useCase: 'Monitoring',
        spl: `index=security sourcetype=WinEventLog:Security (EventCode=4723 OR EventCode=4724)
| eval action=case(EventCode=4723, "Password Change Attempt", EventCode=4724, "Password Reset by Admin")
| stats count by user, action, src_user, dest
| sort -_time`,
        tags: ['password', 'changes', 'account-management', 'beginner']
    },

    // ========== SPLUNK ADMINISTRATION ==========
    {
        id: 'admin-001',
        title: 'ES Risk Score Modifications',
        description: 'Audit who changed risk scores on correlation searches in Enterprise Security. Critical for maintaining RBA integrity.',
        category: 'splunkAdmin',
        difficulty: 'intermediate',
        dataSource: 'Splunk Audit',
        useCase: 'Audit',
        spl: `index=_audit sourcetype=audittrail action=edit_savedsearch
| search info="*risk*" OR savedsearch_name="*Risk*" OR savedsearch_name="*rule*"
| rex field=info "risk_score[^\\d]*(?<new_risk_score>\\d+)"
| stats count, latest(_time) as last_modified, values(info) as changes by user, savedsearch_name
| eval last_modified=strftime(last_modified, "%Y-%m-%d %H:%M:%S")
| sort -last_modified`,
        tags: ['splunk', 'enterprise-security', 'risk', 'audit', 'rba']
    },
    {
        id: 'admin-002',
        title: 'Saved Search and Alert Changes',
        description: 'Track who created, modified, or deleted saved searches and alerts. Essential for change management.',
        category: 'splunkAdmin',
        difficulty: 'beginner',
        dataSource: 'Splunk Audit',
        useCase: 'Audit',
        spl: `index=_audit sourcetype=audittrail action IN (edit_savedsearch, create_savedsearch, delete_savedsearch)
| eval action_type=case(
    action="create_savedsearch", "Created",
    action="edit_savedsearch", "Modified",
    action="delete_savedsearch", "Deleted")
| stats count by user, savedsearch_name, action_type, _time
| sort -_time
| head 50`,
        tags: ['splunk', 'alerts', 'saved-searches', 'audit', 'change-management']
    },
    {
        id: 'admin-003',
        title: 'User Role and Capability Changes',
        description: 'Monitor changes to user roles and capabilities. Detect unauthorized privilege modifications.',
        category: 'splunkAdmin',
        difficulty: 'intermediate',
        dataSource: 'Splunk Audit',
        useCase: 'Audit',
        spl: `index=_audit sourcetype=audittrail (action=edit_user OR action=create_user OR action=edit_roles)
| stats count, values(info) as changes, latest(_time) as last_change by user, action
| eval last_change=strftime(last_change, "%Y-%m-%d %H:%M:%S")
| sort -last_change`,
        tags: ['splunk', 'users', 'roles', 'permissions', 'audit']
    },
    {
        id: 'admin-004',
        title: 'Knowledge Object Modifications',
        description: 'Audit changes to props, transforms, lookups, and other knowledge objects that affect data parsing.',
        category: 'splunkAdmin',
        difficulty: 'intermediate',
        dataSource: 'Splunk Audit',
        useCase: 'Audit',
        spl: `index=_audit sourcetype=audittrail action IN (*props*, *transforms*, *lookup*, *field*, *extract*, *eventtypes*, *tags*)
| stats count, values(action) as actions, latest(_time) as last_change by user, info
| eval last_change=strftime(last_change, "%Y-%m-%d %H:%M:%S")
| sort -last_change
| head 50`,
        tags: ['splunk', 'knowledge-objects', 'props', 'transforms', 'audit']
    },
    {
        id: 'admin-005',
        title: 'App Installation and Changes',
        description: 'Track app installations, updates, and configuration changes across the Splunk environment.',
        category: 'splunkAdmin',
        difficulty: 'beginner',
        dataSource: 'Splunk Audit',
        useCase: 'Audit',
        spl: `index=_audit sourcetype=audittrail action IN (install_app, edit_app, *app*)
| stats count, values(action) as actions, latest(_time) as last_change by user, info
| eval last_change=strftime(last_change, "%Y-%m-%d %H:%M:%S")
| sort -last_change`,
        tags: ['splunk', 'apps', 'installation', 'audit']
    },
    {
        id: 'admin-006',
        title: 'Splunk User Login Activity',
        description: 'Review who logged into Splunk, when, and from where. Detect unauthorized access attempts.',
        category: 'splunkAdmin',
        difficulty: 'beginner',
        dataSource: 'Splunk Audit',
        useCase: 'Audit',
        spl: `index=_audit sourcetype=audittrail action=login
| stats count as login_count, earliest(_time) as first_login, latest(_time) as last_login, values(info) as login_info by user
| eval first_login=strftime(first_login, "%Y-%m-%d %H:%M:%S")
| eval last_login=strftime(last_login, "%Y-%m-%d %H:%M:%S")
| sort -last_login`,
        tags: ['splunk', 'login', 'access', 'audit']
    },
    {
        id: 'admin-007',
        title: 'Expensive Search Audit',
        description: 'Identify users running resource-intensive searches that may impact Splunk performance.',
        category: 'splunkAdmin',
        difficulty: 'intermediate',
        dataSource: 'Splunk Audit',
        useCase: 'Performance',
        spl: `index=_audit sourcetype=audittrail action=search info=completed
| eval scan_count=coalesce(scan_count, 0), event_count=coalesce(event_count, 0), run_time=coalesce(total_run_time, 0)
| where scan_count > 1000000 OR run_time > 300
| stats count as expensive_searches, sum(scan_count) as total_scanned, avg(run_time) as avg_runtime by user
| eval avg_runtime=round(avg_runtime, 2)
| sort -total_scanned`,
        tags: ['splunk', 'performance', 'searches', 'audit', 'optimization']
    },
    {
        id: 'admin-008',
        title: 'Dashboard Modifications',
        description: 'Track who created or modified dashboards. Important for maintaining dashboard integrity.',
        category: 'splunkAdmin',
        difficulty: 'beginner',
        dataSource: 'Splunk Audit',
        useCase: 'Audit',
        spl: `index=_audit sourcetype=audittrail action IN (*dashboard*, *view*)
| stats count, values(action) as actions, latest(_time) as last_change by user, info
| eval last_change=strftime(last_change, "%Y-%m-%d %H:%M:%S")
| sort -last_change
| head 50`,
        tags: ['splunk', 'dashboards', 'views', 'audit']
    },
    {
        id: 'admin-009',
        title: 'Data Input Configuration Changes',
        description: 'Monitor changes to data inputs, forwarder configurations, and ingestion settings.',
        category: 'splunkAdmin',
        difficulty: 'intermediate',
        dataSource: 'Splunk Audit',
        useCase: 'Audit',
        spl: `index=_audit sourcetype=audittrail action IN (*input*, *forward*, *receive*, *tcp*, *udp*, *monitor*, *scripted*)
| stats count, values(action) as actions, latest(_time) as last_change by user, info
| eval last_change=strftime(last_change, "%Y-%m-%d %H:%M:%S")
| sort -last_change`,
        tags: ['splunk', 'inputs', 'forwarders', 'data-collection', 'audit']
    },
    {
        id: 'admin-010',
        title: 'REST API Usage Audit',
        description: 'Track REST API calls to Splunk endpoints. Detect automation and potential API abuse.',
        category: 'splunkAdmin',
        difficulty: 'advanced',
        dataSource: 'Splunk Audit',
        useCase: 'Audit',
        spl: `index=_internal sourcetype=splunkd_access method IN (POST, PUT, DELETE)
| rex field=uri_path "/services/(?<endpoint>[^/]+)"
| stats count, dc(uri_path) as unique_endpoints, values(method) as methods by user, endpoint, clientip
| where count > 10
| sort -count`,
        tags: ['splunk', 'rest-api', 'automation', 'audit', 'security']
    }
];

// ============================================
// UI State
// ============================================

let filteredQueries = [...QUERY_LIBRARY];
let currentRandomQuery = null;
let randomQueryHistory = [];
let randomQueryIndex = -1;

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    renderQueryGrid();
    setupEventListeners();
    updateQueryCount();
});

// ============================================
// Filter Initialization
// ============================================

function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');

    // Populate category filter
    Object.entries(QUERY_CATEGORIES).forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${value.icon} ${value.name}`;
        categoryFilter.appendChild(option);
    });
}

// ============================================
// Rendering
// ============================================

function renderQueryGrid() {
    const grid = document.getElementById('queryGrid');
    const emptyState = document.getElementById('emptyState');

    if (filteredQueries.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = filteredQueries.map(query => createQueryCard(query)).join('');

    // Add click handlers
    grid.querySelectorAll('.query-card').forEach(card => {
        card.addEventListener('click', () => {
            const queryId = card.dataset.id;
            const query = QUERY_LIBRARY.find(q => q.id === queryId);
            if (query) showQueryModal(query);
        });
    });

    // Add copy handlers
    grid.querySelectorAll('.query-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const queryId = btn.closest('.query-card').dataset.id;
            const query = QUERY_LIBRARY.find(q => q.id === queryId);
            if (query) copyToClipboard(query.spl, btn);
        });
    });
}

function createQueryCard(query) {
    const category = QUERY_CATEGORIES[query.category];

    // Get first 3 lines of SPL for preview
    const splLines = query.spl.split('\n');
    const splPreview = splLines.slice(0, 3).join('\n');
    const hasMoreLines = splLines.length > 3;

    // Apply syntax highlighting if available
    const highlightedPreview = window.SPLUNKed?.highlightSPL
        ? window.SPLUNKed.highlightSPL(splPreview)
        : SPLUNKed.escapeHtml(splPreview);

    // Build metadata badges
    const metadataBadges = [];
    if (query.dataSource) {
        metadataBadges.push(`<span class="query-meta-badge data-source" title="Data Source">${SPLUNKed.escapeHtml(query.dataSource)}</span>`);
    }
    if (query.mitre) {
        const mitreArray = Array.isArray(query.mitre) ? query.mitre : [query.mitre];
        mitreArray.forEach(technique => {
            metadataBadges.push(`<span class="query-meta-badge mitre" title="MITRE ATT&CK">${SPLUNKed.escapeHtml(technique)}</span>`);
        });
    }
    if (query.useCase) {
        metadataBadges.push(`<span class="query-meta-badge use-case" title="Use Case">${SPLUNKed.escapeHtml(query.useCase)}</span>`);
    }

    return `
        <div class="query-card" data-id="${query.id}" data-category="${query.category}" data-difficulty="${query.difficulty}">
            <div class="query-card-header">
                <span class="query-category-icon">${category.icon}</span>
                <span class="query-difficulty-badge ${query.difficulty}">${query.difficulty}</span>
            </div>
            <h3 class="query-card-title">${query.title}</h3>
            <p class="query-card-description">${query.description}</p>
            ${metadataBadges.length > 0 ? `<div class="query-card-meta">${metadataBadges.join('')}</div>` : ''}
            <div class="query-card-preview${hasMoreLines ? ' has-more' : ''}">
                <pre><code>${highlightedPreview}</code></pre>
            </div>
            <div class="query-card-footer">
                <div class="query-tags">
                    ${query.tags.slice(0, 3).map(tag => `<span class="query-tag">${tag}</span>`).join('')}
                </div>
                <button class="query-copy-btn" aria-label="Copy query">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

// ============================================
// Modal
// ============================================

function showQueryModal(query) {
    const overlay = document.getElementById('queryModalOverlay');
    const title = document.getElementById('queryModalTitle');
    const content = document.getElementById('queryModalContent');
    const category = QUERY_CATEGORIES[query.category];

    title.textContent = query.title;

    // Build metadata section
    const metadataItems = [];
    if (query.dataSource) {
        metadataItems.push(`
            <div class="modal-meta-item">
                <span class="modal-meta-label">Data Source</span>
                <span class="modal-meta-value data-source">${SPLUNKed.escapeHtml(query.dataSource)}</span>
            </div>
        `);
    }
    if (query.mitre) {
        const mitreArray = Array.isArray(query.mitre) ? query.mitre : [query.mitre];
        metadataItems.push(`
            <div class="modal-meta-item">
                <span class="modal-meta-label">MITRE ATT&CK</span>
                <span class="modal-meta-value mitre">${mitreArray.map(t => SPLUNKed.escapeHtml(t)).join(', ')}</span>
            </div>
        `);
    }
    if (query.useCase) {
        metadataItems.push(`
            <div class="modal-meta-item">
                <span class="modal-meta-label">Use Case</span>
                <span class="modal-meta-value use-case">${SPLUNKed.escapeHtml(query.useCase)}</span>
            </div>
        `);
    }

    content.innerHTML = `
        <div class="query-modal-meta">
            <span class="query-category-badge">${category.icon} ${category.name}</span>
            <span class="query-difficulty-badge ${query.difficulty}">${query.difficulty}</span>
        </div>

        <div class="query-modal-section">
            <h4>Description</h4>
            <p>${query.description}</p>
        </div>

        ${metadataItems.length > 0 ? `
        <div class="query-modal-section query-modal-metadata">
            <h4>Details</h4>
            <div class="modal-meta-grid">
                ${metadataItems.join('')}
            </div>
        </div>
        ` : ''}

        <div class="query-modal-section">
            <h4>SPL Query</h4>
            <div class="spl-block">
                <pre class="spl-code"><code>${window.SPLUNKed?.highlightSPL ? window.SPLUNKed.highlightSPL(query.spl) : SPLUNKed.escapeHtml(query.spl)}</code></pre>
                <button class="spl-copy modal-copy-btn" aria-label="Copy to clipboard">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="query-modal-section">
            <h4>Tags</h4>
            <div class="query-tags-full">
                ${query.tags.map(tag => `<span class="query-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;

    // Add copy handler for modal
    content.querySelector('.modal-copy-btn').addEventListener('click', (e) => {
        copyToClipboard(query.spl, e.target.closest('.spl-copy'));
    });

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('queryModalOverlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ============================================
// Random Query
// ============================================

function showRandomQuery() {
    const randomIndex = Math.floor(Math.random() * QUERY_LIBRARY.length);
    const query = QUERY_LIBRARY[randomIndex];

    // If we're not at the end of history, truncate forward history
    if (randomQueryIndex < randomQueryHistory.length - 1) {
        randomQueryHistory = randomQueryHistory.slice(0, randomQueryIndex + 1);
    }

    // Add to history and move index forward
    randomQueryHistory.push(query);
    randomQueryIndex = randomQueryHistory.length - 1;

    displayRandomQuery(query);
}

function displayRandomQuery(query) {
    currentRandomQuery = query;
    const category = QUERY_CATEGORIES[query.category];

    document.getElementById('randomQueryTitle').textContent = query.title;
    document.getElementById('randomQueryDescription').textContent = query.description;

    // Apply SPL syntax highlighting
    const splElement = document.getElementById('randomQuerySPL');
    if (window.SPLUNKed?.highlightSPL) {
        splElement.innerHTML = window.SPLUNKed.highlightSPL(query.spl);
    } else {
        splElement.textContent = query.spl;
    }

    document.getElementById('randomQueryCategory').textContent = `${category.icon} ${category.name}`;
    document.getElementById('randomQueryCategory').className = `query-category-badge`;
    document.getElementById('randomQueryDifficulty').textContent = query.difficulty;
    document.getElementById('randomQueryDifficulty').className = `query-difficulty-badge ${query.difficulty}`;

    document.getElementById('randomQueryDisplay').classList.remove('hidden');
    updateRandomNavButtons();
}

function goBackRandom() {
    if (randomQueryIndex > 0) {
        randomQueryIndex--;
        displayRandomQuery(randomQueryHistory[randomQueryIndex]);
    }
}

function goForwardRandom() {
    if (randomQueryIndex < randomQueryHistory.length - 1) {
        randomQueryIndex++;
        displayRandomQuery(randomQueryHistory[randomQueryIndex]);
    }
}

function updateRandomNavButtons() {
    const backBtn = document.getElementById('randomQueryBack');
    const forwardBtn = document.getElementById('randomQueryForward');

    if (backBtn) backBtn.disabled = randomQueryIndex <= 0;
    if (forwardBtn) forwardBtn.disabled = randomQueryIndex >= randomQueryHistory.length - 1;
}

function hideRandomQuery() {
    document.getElementById('randomQueryDisplay').classList.add('hidden');
    currentRandomQuery = null;
}

// ============================================
// Filtering
// ============================================

function applyFilters() {
    const searchTerm = document.getElementById('querySearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;

    filteredQueries = QUERY_LIBRARY.filter(query => {
        const matchesSearch = !searchTerm ||
            query.title.toLowerCase().includes(searchTerm) ||
            query.description.toLowerCase().includes(searchTerm) ||
            query.spl.toLowerCase().includes(searchTerm) ||
            query.tags.some(tag => tag.toLowerCase().includes(searchTerm));

        const matchesCategory = categoryFilter === 'all' || query.category === categoryFilter;
        const matchesDifficulty = difficultyFilter === 'all' || query.difficulty === difficultyFilter;

        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    renderQueryGrid();
    updateQueryCount();
}

function updateQueryCount() {
    document.getElementById('visibleCount').textContent = filteredQueries.length;
    document.getElementById('totalCount').textContent = QUERY_LIBRARY.length;
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Search
    if (window.SPLUNKed?.initSearch) {
        SPLUNKed.initSearch('querySearch', {
            debounce: 300,
            onSearch: () => applyFilters()
        });
    }

    // Filters
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('difficultyFilter').addEventListener('change', applyFilters);

    // Random query buttons
    document.getElementById('randomQueryBtn').addEventListener('click', showRandomQuery);
    document.getElementById('randomQueryClose').addEventListener('click', hideRandomQuery);
    document.getElementById('randomQueryAnother').addEventListener('click', showRandomQuery);
    document.getElementById('randomQueryBack').addEventListener('click', goBackRandom);
    document.getElementById('randomQueryForward').addEventListener('click', goForwardRandom);
    document.getElementById('randomQueryCopy').addEventListener('click', (e) => {
        if (currentRandomQuery) {
            copyToClipboard(currentRandomQuery.spl, e.target.closest('.spl-copy'));
        }
    });

    // Modal
    const modalOverlay = document.getElementById('queryModalOverlay');
    const modalClose = modalOverlay.querySelector('.modal-close');

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            hideRandomQuery();
        }
    });
}

// ============================================
// Utility Functions
// ============================================

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalContent = button.innerHTML;
        button.innerHTML = '<span style="color: var(--splunk-green);">Copied!</span>';
        button.classList.add('copied');
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// ============================================
// Export for global search
// ============================================

window.QUERY_LIBRARY = QUERY_LIBRARY;
window.QUERY_CATEGORIES = QUERY_CATEGORIES;
