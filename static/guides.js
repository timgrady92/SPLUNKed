/**
 * SPLUNKed - Investigation Guides Data and Logic
 * Contains detection-driven and data-source guides
 */

// ============================================
// Guides Data
// ============================================

const GUIDES_DATA = {
    detection: [
        {
            id: 'brute-force',
            title: 'I suspect brute force or credential stuffing',
            description: 'Detect and investigate authentication attacks targeting user credentials through repeated login attempts.',
            category: 'Credential Attacks',
            difficulty: 'intermediate',
            keywords: 'brute force password spray credential stuffing lockout failed login authentication',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Framing</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">The hypothesis</div>
                        <p>An attacker is attempting to gain unauthorized access by repeatedly trying different passwords against one or more user accounts. This could be a targeted attack against specific high-value accounts or a broader spray attack across many accounts.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Key questions</div>
                        <ul>
                            <li>Which accounts are being targeted?</li>
                            <li>What is the source IP or range of the attempts?</li>
                            <li>Is this a spray attack (many users, few passwords) or a focused attack (few users, many passwords)?</li>
                            <li>Were any attempts successful?</li>
                            <li>Are there any account lockouts?</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Evidence</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Primary data sources</div>
                        <ul>
                            <li><strong>Windows Event 4625</strong> - Failed logon attempt</li>
                            <li><strong>Windows Event 4771</strong> - Kerberos pre-authentication failed</li>
                            <li><strong>Windows Event 4776</strong> - NTLM authentication failed</li>
                            <li><strong>Windows Event 4740</strong> - Account locked out</li>
                            <li><strong>VPN/SSO logs</strong> - Remote authentication failures</li>
                        </ul>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Detection SPL</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=wineventlog EventCode=4625
| bin _time span=5m
| stats count dc(user) as unique_users values(user) as targeted_users by src_ip, _time
| where count > 10 OR unique_users > 5
| sort -count</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Identifies IPs with high failure rates or attempts against many users</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Password Spray Detection</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=wineventlog EventCode=4625
| bin _time span=1h
| stats dc(user) as unique_users count by src_ip, _time
| where unique_users > 20 AND count/unique_users < 3
| sort -unique_users</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Detects spray pattern: many users, few attempts each</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Analysis</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Corroboration</div>
                        <p>After identifying suspicious activity, check for:</p>
                        <ul>
                            <li>Successful logins from the same source IP after failures</li>
                            <li>Changes in user behavior after successful authentication</li>
                            <li>Account lockout events correlating with the attack window</li>
                            <li>Geographic anomalies in source IP locations</li>
                        </ul>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Success After Failure</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=wineventlog (EventCode=4625 OR EventCode=4624)
| transaction user maxspan=1h
| where eventcount > 1
| search EventCode=4625 EventCode=4624
| table _time, user, src_ip, eventcount</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label warning">Pitfalls</div>
                        <ul>
                            <li>Time zone mismatches can hide attack patterns across sources</li>
                            <li>Service accounts may generate legitimate high-volume failures</li>
                            <li>Shared IPs (VPN, NAT) can make source attribution difficult</li>
                            <li>Some applications log failures differently - check sourcetype variations</li>
                        </ul>
                    </div>
                </div>
            `
        },
        {
            id: 'data-exfiltration',
            title: 'I think sensitive data is leaving the network',
            description: 'Identify potential data exfiltration through unusual outbound data transfers, DNS tunneling, or cloud uploads.',
            category: 'Data Loss',
            difficulty: 'advanced',
            keywords: 'data exfiltration leak transfer upload outbound bytes dns tunneling',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Framing</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">The hypothesis</div>
                        <p>An insider or attacker is extracting sensitive data from the network. This could occur through large file transfers, encrypted tunnels, cloud storage uploads, or covert channels like DNS.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Key questions</div>
                        <ul>
                            <li>What is the volume of outbound data per user/host?</li>
                            <li>Are there unusual destinations for data transfers?</li>
                            <li>Is data being sent to personal cloud storage?</li>
                            <li>Are there signs of DNS tunneling or other covert channels?</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Evidence</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Primary data sources</div>
                        <ul>
                            <li><strong>Proxy/Web logs</strong> - Upload destinations and volumes</li>
                            <li><strong>Firewall logs</strong> - Outbound connection volumes</li>
                            <li><strong>DNS logs</strong> - Query patterns for tunneling</li>
                            <li><strong>DLP alerts</strong> - Policy violations</li>
                            <li><strong>Cloud access logs</strong> - SaaS application usage</li>
                        </ul>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Large Outbound Transfers</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy action=allowed
| stats sum(bytes_out) as total_bytes by src_ip, user
| eval mb=round(total_bytes/1024/1024, 2)
| where mb > 100
| sort -mb
| table user, src_ip, mb</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Cloud Storage Uploads</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
    (url=*dropbox* OR url=*drive.google* OR url=*onedrive* OR url=*box.com*)
    http_method=POST
| stats sum(bytes_out) as bytes count by user, url
| sort -bytes</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">DNS Tunneling Indicators</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=dns
| eval query_len=len(query)
| stats avg(query_len) as avg_len, count, dc(query) as unique_queries by src_ip
| where avg_len > 50 OR unique_queries > 1000
| sort -avg_len</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Long DNS queries or high query volume can indicate tunneling</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Analysis</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Baseline Comparison</div>
                        <p>Compare current activity against historical baselines to identify anomalies:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
| bin _time span=1d
| stats sum(bytes_out) as daily_bytes by user, _time
| eventstats avg(daily_bytes) as avg_daily, stdev(daily_bytes) as stdev_daily by user
| eval zscore=(daily_bytes-avg_daily)/stdev_daily
| where zscore > 3</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label warning">Pitfalls</div>
                        <ul>
                            <li>Legitimate large file transfers (backups, software updates) can trigger false positives</li>
                            <li>Encrypted traffic hides content - focus on volume and destination</li>
                            <li>Personal device usage may bypass corporate proxies</li>
                        </ul>
                    </div>
                </div>
            `
        },
        {
            id: 'lateral-movement',
            title: 'An attacker may be moving through the network',
            description: 'Detect lateral movement patterns as attackers spread from initial compromise to other systems.',
            category: 'Post-Exploitation',
            difficulty: 'advanced',
            keywords: 'lateral movement pivot pass the hash remote access psexec wmi rdp',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Framing</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">The hypothesis</div>
                        <p>An attacker who has compromised one system is moving laterally through the network to reach additional targets. This typically involves using stolen credentials, remote administration tools, or exploitation of trust relationships.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Key questions</div>
                        <ul>
                            <li>What authentication events show unusual source-destination patterns?</li>
                            <li>Are there new remote service connections between systems?</li>
                            <li>Is a single account authenticating to many systems in a short time?</li>
                            <li>Are there signs of pass-the-hash or token theft?</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Evidence</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Primary data sources</div>
                        <ul>
                            <li><strong>Windows Event 4624</strong> - Successful logon (look for Type 3, 10)</li>
                            <li><strong>Windows Event 4648</strong> - Explicit credential logon</li>
                            <li><strong>Windows Event 4688</strong> - Process creation</li>
                            <li><strong>Sysmon Event 1</strong> - Process create with command line</li>
                            <li><strong>Sysmon Event 3</strong> - Network connections</li>
                        </ul>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Account Hopping</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=wineventlog EventCode=4624 Logon_Type IN (3, 10)
| bin _time span=1h
| stats dc(dest) as unique_hosts values(dest) as hosts by user, src_ip, _time
| where unique_hosts > 5
| sort -unique_hosts</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Identifies accounts accessing many systems rapidly</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Remote Tool Execution</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=sysmon EventCode=1
    (CommandLine=*psexec* OR CommandLine=*wmic* OR CommandLine=*winrm* OR
     Image=*\\powershell.exe AND CommandLine=*-ComputerName*)
| stats count by Computer, User, CommandLine
| sort -count</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Analysis</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Movement Visualization</div>
                        <p>Map the movement pattern by tracking source to destination over time. Look for chains of connections originating from a single compromised system.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label warning">Pitfalls</div>
                        <ul>
                            <li>IT admin activity often looks like lateral movement - correlate with change tickets</li>
                            <li>Logon Type 3 can be legitimate file share access</li>
                            <li>Service accounts may authenticate to many systems legitimately</li>
                        </ul>
                    </div>
                </div>
            `
        },
        {
            id: 'malware-execution',
            title: 'I suspect malicious code ran on endpoints',
            description: 'Detect signs of malware execution through process analysis, suspicious parent-child relationships, and anomalous behavior.',
            category: 'Malware',
            difficulty: 'intermediate',
            keywords: 'malware virus trojan ransomware process execution suspicious behavior',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Framing</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">The hypothesis</div>
                        <p>Malicious code has executed on one or more endpoints, potentially through phishing, drive-by download, or exploitation. This includes ransomware, trojans, RATs, and other malware families.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Key questions</div>
                        <ul>
                            <li>What suspicious processes have been created?</li>
                            <li>Are there unusual parent-child process relationships?</li>
                            <li>What network connections did suspicious processes make?</li>
                            <li>Were any files dropped or modified in unusual locations?</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Evidence</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Primary data sources</div>
                        <ul>
                            <li><strong>Sysmon Event 1</strong> - Process creation with hashes</li>
                            <li><strong>Sysmon Event 3</strong> - Network connections</li>
                            <li><strong>Sysmon Event 11</strong> - File creation</li>
                            <li><strong>Windows Event 4688</strong> - Process creation (if auditing enabled)</li>
                            <li><strong>EDR/AV alerts</strong> - Signature and behavioral detections</li>
                        </ul>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Suspicious Process Spawning</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=sysmon EventCode=1
    ParentImage IN (*\\outlook.exe, *\\winword.exe, *\\excel.exe, *\\powerpnt.exe)
    Image IN (*\\cmd.exe, *\\powershell.exe, *\\wscript.exe, *\\cscript.exe, *\\mshta.exe)
| table _time, Computer, User, ParentImage, Image, CommandLine</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Office applications spawning scripting interpreters is highly suspicious</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Encoded PowerShell</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=sysmon EventCode=1 Image=*\\powershell.exe
    (CommandLine=*-enc* OR CommandLine=*-e * OR CommandLine=*hidden* OR CommandLine=*bypass*)
| table _time, Computer, User, CommandLine</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Analysis</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Process Tree Analysis</div>
                        <p>Build the process tree to understand the full attack chain from initial execution through any child processes:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=sysmon EventCode=1 ProcessGuid="{...}"
| eval path=ParentImage." -> ".Image
| stats values(CommandLine) by path</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label warning">Pitfalls</div>
                        <ul>
                            <li>Legitimate admin scripts may use encoded commands</li>
                            <li>Some software installers spawn scripting interpreters normally</li>
                            <li>Hash-based detection fails for polymorphic malware</li>
                        </ul>
                    </div>
                </div>
            `
        },
        {
            id: 'command-control',
            title: 'Compromised systems may be beaconing out',
            description: 'Identify command and control (C2) communication through periodic connections, unusual protocols, or known-bad infrastructure.',
            category: 'C2 Detection',
            difficulty: 'advanced',
            keywords: 'command control beacon c2 callback periodic connection malware communication',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Framing</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">The hypothesis</div>
                        <p>Compromised systems are communicating with attacker-controlled infrastructure to receive commands, exfiltrate data, or maintain persistence. C2 often uses periodic beaconing patterns that can be detected through traffic analysis.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Key questions</div>
                        <ul>
                            <li>Are there regular, periodic connections to the same destination?</li>
                            <li>Are systems connecting to unusual domains or IPs?</li>
                            <li>Is DNS being used for data exfiltration or C2?</li>
                            <li>Are there long-lived connections or unusual protocols?</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Evidence</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Primary data sources</div>
                        <ul>
                            <li><strong>Firewall/Proxy logs</strong> - Connection metadata</li>
                            <li><strong>DNS logs</strong> - Query patterns and unusual domains</li>
                            <li><strong>Sysmon Event 3</strong> - Network connections from processes</li>
                            <li><strong>Threat intelligence feeds</strong> - Known-bad indicators</li>
                        </ul>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Beacon Detection</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=allowed
| bin _time span=5m
| stats count by src_ip, dest_ip, dest_port, _time
| stats count as connection_count, stdev(count) as std_dev, avg(count) as avg_conn by src_ip, dest_ip, dest_port
| eval jitter=std_dev/avg_conn
| where connection_count > 50 AND jitter < 0.3
| sort jitter</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Low jitter (consistent timing) indicates automated/beacon traffic</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Rare Destination Analysis</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
| stats dc(src_ip) as unique_sources count by dest_domain
| where unique_sources < 3 AND count > 10
| sort -count</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                        <p style="font-size: 0.875rem; color: var(--text-muted);">Domains accessed by few systems but with many connections</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Analysis</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label warning">Pitfalls</div>
                        <ul>
                            <li>Legitimate software updates can have beacon-like patterns</li>
                            <li>CDNs and cloud services may obscure true destinations</li>
                            <li>Some C2 uses legitimate services (social media, cloud storage)</li>
                            <li>Jitter can be added to evade beacon detection</li>
                        </ul>
                    </div>
                </div>
            `
        }
    ],

    datasource: [
        {
            id: 'windows-eventlog',
            title: 'Windows Event Logs',
            description: 'Core Windows security, system, and application events. Foundation for Windows endpoint visibility.',
            category: 'Endpoint',
            difficulty: 'beginner',
            keywords: 'windows event log security system application eventcode 4624 4625 4688',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Overview</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">What it contains</div>
                        <p>Windows Event Logs record system, security, and application events on Windows endpoints and servers. Key channels include Security, System, Application, and PowerShell operational logs.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Key Event IDs</div>
                        <ul>
                            <li><strong>4624</strong> - Successful logon</li>
                            <li><strong>4625</strong> - Failed logon</li>
                            <li><strong>4648</strong> - Logon using explicit credentials</li>
                            <li><strong>4688</strong> - Process creation</li>
                            <li><strong>4720/4726</strong> - User account created/deleted</li>
                            <li><strong>4740</strong> - Account locked out</li>
                            <li><strong>7045</strong> - Service installed</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Common Queries</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Authentication Summary</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=wineventlog EventCode IN (4624, 4625)
| stats count by EventCode, user, src_ip
| eval status=if(EventCode=4624, "success", "failure")</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Account Changes</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=wineventlog EventCode IN (4720, 4722, 4725, 4726, 4738)
| table _time, EventCode, user, TargetUserName, SubjectUserName</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">CIM Mapping</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Field Mappings</div>
                        <ul>
                            <li>EventCode 4624/4625 → Authentication data model</li>
                            <li>EventCode 4688 → Endpoint.Processes (with command line audit enabled)</li>
                            <li>Account change events → Change Analysis data model</li>
                        </ul>
                    </div>
                </div>
            `
        },
        {
            id: 'sysmon',
            title: 'Sysmon Logs',
            description: 'Enhanced Windows endpoint telemetry including process creation, network connections, and file operations.',
            category: 'Endpoint',
            difficulty: 'intermediate',
            keywords: 'sysmon process network file registry dns hash commandline',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Overview</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">What it contains</div>
                        <p>Sysmon (System Monitor) provides detailed visibility into process creation, network connections, file changes, registry modifications, and more. It's essential for threat hunting and incident response.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Key Event Types</div>
                        <ul>
                            <li><strong>Event 1</strong> - Process creation (with command line, hashes, parent process)</li>
                            <li><strong>Event 3</strong> - Network connection</li>
                            <li><strong>Event 7</strong> - Image loaded (DLL)</li>
                            <li><strong>Event 8</strong> - CreateRemoteThread</li>
                            <li><strong>Event 10</strong> - Process access</li>
                            <li><strong>Event 11</strong> - File created</li>
                            <li><strong>Event 12/13/14</strong> - Registry events</li>
                            <li><strong>Event 22</strong> - DNS query</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Common Queries</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Process Tree</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=sysmon EventCode=1
| eval proc_path=Image
| rex field=proc_path "\\\\(?<process_name>[^\\\\]+)$"
| rex field=ParentImage "\\\\(?<parent_name>[^\\\\]+)$"
| stats count by parent_name, process_name, User</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Network Connections by Process</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=sysmon EventCode=3
| stats count values(DestinationIp) as dest_ips dc(DestinationIp) as unique_dests by Image, User
| sort -unique_dests</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">DNS Queries</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=sysmon EventCode=22
| stats count by QueryName, Image
| sort -count</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Configuration Notes</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label warning">Important</div>
                        <ul>
                            <li>Sysmon configuration determines what gets logged - review your config</li>
                            <li>High-noise environments may need tuning to reduce volume</li>
                            <li>Hash algorithms (MD5, SHA256) configured at install time</li>
                            <li>SwiftOnSecurity's sysmon-config is a popular starting point</li>
                        </ul>
                    </div>
                </div>
            `
        },
        {
            id: 'dns-logs',
            title: 'DNS Logs',
            description: 'DNS query and response logs for threat detection, tunneling identification, and domain analysis.',
            category: 'Network',
            difficulty: 'intermediate',
            keywords: 'dns query domain resolution tunneling dga threat intel',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Overview</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">What it contains</div>
                        <p>DNS logs record domain name resolution queries from endpoints. This data is valuable for detecting C2 communication, data exfiltration via DNS tunneling, DGA domains, and connections to malicious infrastructure.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Common sources</div>
                        <ul>
                            <li>Windows DNS Server logs</li>
                            <li>BIND/named query logs</li>
                            <li>Infoblox, BlueCat, or other DNS appliances</li>
                            <li>Sysmon Event 22 (per-endpoint)</li>
                            <li>Passive DNS from network taps</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Detection Patterns</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">High Query Volume (Tunneling)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=dns
| stats count dc(query) as unique_queries by src_ip
| where count > 10000 OR unique_queries > 5000
| sort -count</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">DGA Detection (High Entropy)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=dns
| rex field=query "^(?<subdomain>[^.]+)\\.(?<domain>[^.]+\\.[^.]+)$"
| eval len=len(subdomain)
| where len > 20
| stats count by query, src_ip
| sort -count</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Newly Seen Domains</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=dns
| stats earliest(_time) as first_seen count by query
| where first_seen > relative_time(now(), "-24h")
| sort -count</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Notes</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label warning">Considerations</div>
                        <ul>
                            <li>DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT) bypass traditional DNS logging</li>
                            <li>Recursive resolver logs show what clients query, authoritative logs show what's asked of your domains</li>
                            <li>Volume can be very high - consider sampling or aggregation for long-term storage</li>
                        </ul>
                    </div>
                </div>
            `
        },
        {
            id: 'firewall-proxy',
            title: 'Firewall and Proxy Logs',
            description: 'Network traffic metadata including connections, bytes transferred, and web requests.',
            category: 'Network',
            difficulty: 'beginner',
            keywords: 'firewall proxy web traffic network connection bytes url block allow',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Overview</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">What it contains</div>
                        <p>Firewall logs capture network connections (allowed and denied) with metadata like source/destination IPs, ports, and protocols. Proxy logs add URL-level visibility for web traffic including full URLs, user agents, and bytes transferred.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Key fields</div>
                        <ul>
                            <li><strong>src_ip, dest_ip</strong> - Endpoints of connection</li>
                            <li><strong>src_port, dest_port</strong> - Ports involved</li>
                            <li><strong>action</strong> - allowed, blocked, denied</li>
                            <li><strong>bytes_in, bytes_out</strong> - Transfer volumes</li>
                            <li><strong>url</strong> - Full URL (proxy)</li>
                            <li><strong>user</strong> - Authenticated user (proxy)</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Common Queries</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Top Talkers</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=allowed
| stats sum(bytes) as total_bytes dc(dest_ip) as unique_dests by src_ip
| sort -total_bytes
| head 20</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Blocked Connection Summary</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action IN (blocked, denied)
| stats count by src_ip, dest_ip, dest_port
| sort -count</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Web Traffic by User</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
| stats sum(bytes_out) as uploaded sum(bytes_in) as downloaded dc(url) as unique_urls by user
| eval total_mb=round((uploaded+downloaded)/1024/1024, 2)
| sort -total_mb</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">CIM Mapping</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Data Models</div>
                        <ul>
                            <li>Firewall logs → Network Traffic data model</li>
                            <li>Proxy logs → Web data model</li>
                            <li>Ensure action field is normalized: allowed, blocked, dropped</li>
                        </ul>
                    </div>
                </div>
            `
        },
        {
            id: 'cloud-logs',
            title: 'Cloud Audit Logs (AWS/Azure/GCP)',
            description: 'Cloud provider audit trails for API calls, resource access, and configuration changes.',
            category: 'Cloud',
            difficulty: 'advanced',
            keywords: 'aws cloudtrail azure activity gcp audit iam cloud api',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Overview</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">What it contains</div>
                        <p>Cloud audit logs record API calls and administrative actions across cloud services. This includes resource creation/deletion, IAM changes, configuration modifications, and data access events.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Sources by provider</div>
                        <ul>
                            <li><strong>AWS</strong> - CloudTrail, VPC Flow Logs, GuardDuty</li>
                            <li><strong>Azure</strong> - Activity Logs, Sign-in Logs, Audit Logs</li>
                            <li><strong>GCP</strong> - Cloud Audit Logs, VPC Flow Logs</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">AWS CloudTrail Queries</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Failed API Calls</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=aws sourcetype=aws:cloudtrail errorCode=*
| stats count by errorCode, eventName, userIdentity.arn
| sort -count</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">IAM Changes</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=aws sourcetype=aws:cloudtrail
    eventName IN (CreateUser, DeleteUser, AttachUserPolicy, CreateAccessKey, PutUserPolicy)
| table _time, eventName, userIdentity.arn, requestParameters.*</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Console vs API Access</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=aws sourcetype=aws:cloudtrail
| eval access_type=if(userAgent LIKE "%console%", "Console", "API/CLI")
| stats count by userIdentity.arn, access_type, sourceIPAddress</code></pre>
                            <button class="spl-copy" aria-label="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Key Considerations</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label warning">Important</div>
                        <ul>
                            <li>CloudTrail delivery can be delayed by several minutes</li>
                            <li>Data events (S3 object access) must be explicitly enabled</li>
                            <li>Multi-region trail needed for complete visibility</li>
                            <li>Root account usage should be minimal and alarmed</li>
                        </ul>
                    </div>
                </div>
            `
        }
    ]
};

// ============================================
// Guides Logic
// ============================================

let currentGuideTab = 'detection';
let currentGuideFilter = 'all';
let currentGuideSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    initGuides();
});

function initGuides() {
    // Initialize tabs
    SPLUNKed.initTabs('#guidesTabs', {
        storageKey: 'splunked-guides-tab',
        onTabChange: (tab) => {
            currentGuideTab = tab;
            renderGuides();
        }
    });

    // Initialize search
    SPLUNKed.initSearch('guidesSearch', {
        onSearch: (query) => {
            currentGuideSearch = query;
            renderGuides();
        }
    });

    // Initialize filter
    SPLUNKed.initFilter('guidesDifficultyFilter', {
        onChange: (value) => {
            currentGuideFilter = value;
            renderGuides();
        }
    });

    // Initialize modal
    initGuideModal();

    // Render initial content
    renderAllGuides();

    // Add click handlers for guide cards
    document.addEventListener('click', handleGuideClick);
}

function initGuideModal() {
    const modal = document.getElementById('guideModal');
    const overlay = document.getElementById('guideModalOverlay');
    const closeBtn = document.getElementById('guideModalClose');

    if (!modal) return;

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    overlay?.addEventListener('click', closeModal);
    closeBtn?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

function renderAllGuides() {
    renderGuideGrid('detection');
    renderGuideGrid('datasource');
}

function renderGuides() {
    renderGuideGrid(currentGuideTab);
    updateGuidesEmptyState();
}

function renderGuideGrid(tab) {
    const grid = document.getElementById(`${tab}Grid`);
    if (!grid) return;

    const guides = GUIDES_DATA[tab] || [];
    const filtered = filterGuides(guides);

    grid.innerHTML = filtered.map(guide => createGuideCardHTML(guide)).join('');
}

function filterGuides(guides) {
    return guides.filter(guide => {
        // Filter by difficulty
        if (currentGuideFilter !== 'all' && guide.difficulty !== currentGuideFilter) {
            return false;
        }

        // Filter by search
        if (currentGuideSearch) {
            const searchable = [
                guide.title,
                guide.description,
                guide.category,
                guide.keywords
            ].join(' ').toLowerCase();

            return searchable.includes(currentGuideSearch);
        }

        return true;
    });
}

function createGuideCardHTML(guide) {
    return `
        <div class="guide-card" data-id="${guide.id}" data-tab="${currentGuideTab}">
            <div class="guide-card-header">
                <span class="guide-category-badge">${escapeHtml(guide.category)}</span>
                <span class="skill-badge ${guide.difficulty}">${guide.difficulty}</span>
            </div>
            <h3 class="guide-title">${escapeHtml(guide.title)}</h3>
            <p class="guide-description">${escapeHtml(guide.description)}</p>
            <button class="guide-open-btn">
                Open Guide
                <span class="btn-arrow">&rarr;</span>
            </button>
        </div>
    `;
}

function handleGuideClick(e) {
    const openBtn = e.target.closest('.guide-open-btn');
    if (!openBtn) return;

    const card = openBtn.closest('.guide-card');
    if (!card) return;

    const id = card.dataset.id;
    const tab = card.dataset.tab;
    const guide = GUIDES_DATA[tab]?.find(g => g.id === id);

    if (guide) {
        openGuideModal(guide);
    }
}

function openGuideModal(guide) {
    const modal = document.getElementById('guideModal');
    const title = document.getElementById('guideModalTitle');
    const body = document.getElementById('guideModalBody');

    if (!modal || !title || !body) return;

    title.textContent = guide.title;
    body.innerHTML = guide.body;

    // Apply syntax highlighting to SPL code blocks
    SPLUNKed.applySPLHighlighting(body);

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function updateGuidesEmptyState() {
    const grid = document.getElementById(`${currentGuideTab}Grid`);
    const emptyState = document.getElementById('guidesEmptyState');

    if (!grid || !emptyState) return;

    const hasResults = grid.children.length > 0;
    emptyState.classList.toggle('hidden', hasResults);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
