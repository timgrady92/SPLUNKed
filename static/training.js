/**
 * Training Center - SPLUNKed
 * Curated learning pipelines with realistic SOC scenarios
 */

// ============================================
// Training Data
// ============================================

const TRAINING_DATA = {
    foundations: [
        {
            id: 'found-001',
            title: 'Anatomy of a Search',
            type: 'tutorial',
            difficulty: 'beginner',
            duration: '15 min',
            objectives: [
                'Understand the SPL search pipeline',
                'Identify different command types',
                'Read searches from left to right'
            ],
            tags: ['basics', 'pipeline', 'syntax'],
            description: 'Learn how SPL searches flow through the pipeline, from data retrieval to final output.',
            content: {
                sections: [
                    {
                        title: 'What is SPL?',
                        body: `<p>SPL (Search Processing Language) is Splunk's query language. Every search follows a <strong>pipeline model</strong> - data flows from left to right through a series of commands, each transforming the data in some way.</p>
                        <p>Think of it like an assembly line: raw events come in, get processed by each command in sequence, and refined results come out.</p>`,
                        spl: 'index=main | stats count by host | sort -count | head 10',
                        explanation: 'This search retrieves events from "main", counts them by host, sorts by count descending, and shows the top 10.'
                    },
                    {
                        title: 'The Pipe Character',
                        body: `<p>The <code>|</code> (pipe) character is the heart of SPL. It separates commands and passes results from one command to the next.</p>
                        <p>Each command after the pipe receives the output of the previous command as its input.</p>`,
                        spl: 'index=security sourcetype=linux_secure | where action="failure" | stats count by user',
                        explanation: 'Events flow: retrieve from index → filter failures → count by user.'
                    },
                    {
                        title: 'Command Types',
                        body: `<p>SPL commands fall into categories:</p>
                        <ul>
                            <li><strong>Streaming</strong>: Process events one at a time (where, eval, rex)</li>
                            <li><strong>Transforming</strong>: Aggregate events into statistics (stats, timechart, chart)</li>
                            <li><strong>Generating</strong>: Create events from scratch (makeresults, inputlookup)</li>
                            <li><strong>Ordering</strong>: Reorder results (sort, reverse, head, tail)</li>
                        </ul>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'Reading a Search',
                        body: `<p>When reading an SPL search, work left to right and ask:</p>
                        <ol>
                            <li><strong>Where</strong> is data coming from? (index, sourcetype)</li>
                            <li><strong>What</strong> filtering happens? (where, search terms)</li>
                            <li><strong>How</strong> is it transformed? (stats, eval, rex)</li>
                            <li><strong>What</strong> is the output? (table, final aggregation)</li>
                        </ol>`,
                        spl: 'index=web sourcetype=access_combined status>=400 | stats count by status, uri_path | where count > 100 | sort -count',
                        explanation: 'Read as: "From web logs, find errors (400+), count by status and path, keep only those with 100+ occurrences, sort by most frequent."'
                    }
                ]
            }
        },
        {
            id: 'found-002',
            title: 'Understanding Time in Splunk',
            type: 'tutorial',
            difficulty: 'beginner',
            duration: '20 min',
            objectives: [
                'Use time range pickers effectively',
                'Apply earliest and latest modifiers',
                'Create time-based visualizations'
            ],
            tags: ['basics', 'time', 'timechart'],
            description: 'Master time concepts in Splunk - from relative time modifiers to time-series analysis.',
            content: {
                sections: [
                    {
                        title: 'Relative Time Modifiers',
                        body: `<p>Splunk uses intuitive time modifiers:</p>
                        <ul>
                            <li><code>-1h</code> = 1 hour ago</li>
                            <li><code>-7d</code> = 7 days ago</li>
                            <li><code>-1w</code> = 1 week ago</li>
                            <li><code>@d</code> = snap to beginning of day</li>
                            <li><code>@h</code> = snap to beginning of hour</li>
                        </ul>`,
                        spl: 'index=security earliest=-24h@h latest=now',
                        explanation: 'Search from 24 hours ago (snapped to the hour) until now.'
                    },
                    {
                        title: 'The timechart Command',
                        body: `<p><code>timechart</code> is essential for time-series analysis. It automatically buckets events by time and calculates statistics.</p>
                        <p>Use span= to control bucket size.</p>`,
                        spl: 'index=web | timechart span=1h count by status',
                        explanation: 'Creates an hourly chart showing event counts for each HTTP status code.'
                    },
                    {
                        title: 'Time-Based Filtering',
                        body: `<p>Use time fields for precise filtering:</p>
                        <ul>
                            <li><code>_time</code> - when Splunk indexed the event</li>
                            <li>Custom time fields from your data</li>
                            <li><code>earliest=</code> and <code>latest=</code> in search</li>
                        </ul>`,
                        spl: 'index=firewall | where _time >= relative_time(now(), "-1h") | stats count by src_ip',
                        explanation: 'Filter to events from the last hour using the where command.'
                    },
                    {
                        title: 'Comparing Time Periods',
                        body: `<p>Compare current data to historical baselines using time modifiers in subsearches or append.</p>`,
                        spl: 'index=web | timechart span=1h count | appendcols [search index=web earliest=-7d@d latest=-6d@d | timechart span=1h count | rename count as "Last Week"]',
                        explanation: 'Compare current hourly traffic to the same period last week.'
                    }
                ]
            }
        },
        {
            id: 'found-003',
            title: 'Your First Alert Investigation',
            type: 'scenario',
            difficulty: 'beginner',
            duration: '20 min',
            objectives: [
                'Respond to a basic security alert',
                'Analyze authentication patterns',
                'Document findings systematically'
            ],
            tags: ['authentication', 'windows', 'security', 'basics'],
            description: 'Investigate a spike in failed login attempts - your first SOC investigation scenario.',
            content: {
                situation: `You're a junior SOC analyst and receive an alert: "500% increase in failed authentication events in the last hour." Your task is to investigate and determine if this is a threat or false positive.`,
                steps: [
                    {
                        question: 'First, let\'s confirm the alert. How would you see the volume of failed logins over time?',
                        hint: 'Think about counting events over time periods. Which command creates time-based charts?',
                        spl: 'index=wineventlog EventCode=4625 earliest=-4h | timechart span=10m count',
                        analysis: 'This shows failed login (EventCode 4625) volume in 10-minute buckets over the last 4 hours.',
                        finding: 'Confirmed: We see a clear spike starting around 2 hours ago, with counts jumping from baseline ~20 to over 500 per 10-minute window.'
                    },
                    {
                        question: 'The spike is real. Now let\'s identify WHO is being targeted. Which accounts are seeing the most failures?',
                        hint: 'You need to count failures grouped by the target account field.',
                        spl: 'index=wineventlog EventCode=4625 earliest=-2h | stats count by TargetUserName | sort -count | head 20',
                        analysis: 'This counts failed logins by target username and shows the top 20.',
                        finding: 'Critical: The "administrator" and "admin" accounts have 3,000+ failures each. Service accounts like "svc_backup" show only normal baseline failures (~5 each).'
                    },
                    {
                        question: 'Administrator accounts are being targeted. Where are these attempts coming from?',
                        hint: 'Look at source IP addresses or workstation names.',
                        spl: 'index=wineventlog EventCode=4625 earliest=-2h TargetUserName IN ("administrator", "admin") | stats count by IpAddress | sort -count',
                        analysis: 'This shows which IP addresses are generating the failed logins for admin accounts.',
                        finding: 'All 6,000+ failures originate from a single IP: 10.45.23.99. This is NOT distributed - it\'s one source.'
                    },
                    {
                        question: 'Single source attacking admin accounts - this looks like brute force. Has the attacker succeeded? Check for any successful logins from that IP.',
                        hint: 'EventCode 4624 is successful login. Look for the suspicious IP.',
                        spl: 'index=wineventlog EventCode=4624 earliest=-2h IpAddress="10.45.23.99" | stats count by TargetUserName, LogonType',
                        analysis: 'This checks if the attacking IP has any successful authentications.',
                        finding: 'Good news: Zero successful logins from the attacking IP. The brute force attempt has not succeeded.'
                    },
                    {
                        question: 'Let\'s identify the attacking system. Is this IP internal or external? What do we know about it?',
                        hint: 'Check asset inventory or DHCP logs for IP context.',
                        spl: 'index=asset_inventory ip="10.45.23.99" | table hostname, department, owner, last_seen',
                        analysis: 'Cross-reference with asset inventory to identify the source machine.',
                        finding: 'The IP belongs to "WKS-RECEPTION-02" in the Lobby. This is a shared kiosk PC that shouldn\'t be making admin login attempts.'
                    }
                ],
                conclusion: `<strong>Investigation Complete!</strong><br><br>
                    <strong>Summary:</strong> Confirmed brute force attack against administrator accounts from an internal kiosk PC (10.45.23.99 / WKS-RECEPTION-02).<br><br>
                    <strong>Impact:</strong> No successful compromise - all attempts failed.<br><br>
                    <strong>Recommended Actions:</strong>
                    <ol>
                        <li>Isolate WKS-RECEPTION-02 from the network immediately</li>
                        <li>Check the physical kiosk for unauthorized access or malware</li>
                        <li>Review logs for how the attack was initiated (removable media? physical access?)</li>
                        <li>Consider blocking authentication attempts from kiosk systems to admin accounts</li>
                    </ol>`
            }
        },
        {
            id: 'found-004',
            title: 'Count Events',
            type: 'challenge',
            difficulty: 'beginner',
            duration: '10 min',
            objectives: [
                'Use the stats command',
                'Count events with grouping',
                'Understand count vs dc (distinct count)'
            ],
            tags: ['basics', 'aggregation', 'stats'],
            description: 'Practice the fundamental skill of counting and summarizing events.',
            content: {
                problem: 'You need to analyze web server logs. Find the total number of requests per HTTP status code (200, 404, 500, etc.) from the web index.',
                hints: [
                    'The stats command is used for aggregation',
                    'Use count to count events',
                    'Use "by" to group by a field (status)'
                ],
                solution: {
                    spl: 'index=web | stats count by status',
                    explanation: 'The stats command aggregates all events. "count" counts the number of events in each group. "by status" creates groups for each unique status code value.'
                },
                variations: [
                    {
                        description: 'Now count requests by status AND method (GET, POST, etc.):',
                        spl: 'index=web | stats count by status, method'
                    },
                    {
                        description: 'Count how many UNIQUE users got each status code:',
                        spl: 'index=web | stats dc(user) as unique_users by status'
                    }
                ]
            }
        },
        {
            id: 'found-005',
            title: 'Filter by Field Values',
            type: 'challenge',
            difficulty: 'beginner',
            duration: '10 min',
            objectives: [
                'Use the where command for filtering',
                'Apply comparison operators',
                'Combine multiple conditions'
            ],
            tags: ['basics', 'filtering', 'where'],
            description: 'Master the art of filtering events to find exactly what you need.',
            content: {
                problem: 'Find all firewall events where bytes_out is greater than 1MB (1048576 bytes) AND the destination port is NOT 80 or 443.',
                hints: [
                    'Use the where command after retrieving events',
                    'Greater than is just > in SPL',
                    'NOT IN checks if value is not in a list'
                ],
                solution: {
                    spl: 'index=firewall | where bytes_out > 1048576 AND dest_port NOT IN (80, 443)',
                    explanation: 'The where command evaluates each event. We check bytes_out exceeds 1MB AND the destination port is neither 80 (HTTP) nor 443 (HTTPS). This could indicate large data transfers over unusual ports.'
                },
                variations: [
                    {
                        description: 'Find events where bytes_out is more than 10x bytes_in (asymmetric traffic):',
                        spl: 'index=firewall | where bytes_out > (bytes_in * 10)'
                    },
                    {
                        description: 'Find connections lasting longer than 1 hour (3600 seconds):',
                        spl: 'index=firewall | where duration > 3600'
                    }
                ]
            }
        }
    ],

    coreSkills: [
        {
            id: 'core-001',
            title: 'Mastering Stats',
            type: 'tutorial',
            difficulty: 'intermediate',
            duration: '25 min',
            objectives: [
                'Use multiple aggregation functions',
                'Combine stats with filtering',
                'Create calculated fields in stats'
            ],
            tags: ['stats', 'aggregation', 'analysis'],
            description: 'Deep dive into the stats command - the workhorse of SPL analysis.',
            content: {
                sections: [
                    {
                        title: 'Aggregation Functions',
                        body: `<p>Stats supports many aggregation functions:</p>
                        <ul>
                            <li><code>count</code> - Number of events</li>
                            <li><code>dc(field)</code> - Distinct count of values</li>
                            <li><code>sum(field)</code> - Sum of numeric field</li>
                            <li><code>avg(field)</code> - Average value</li>
                            <li><code>min(field)</code> / <code>max(field)</code> - Extremes</li>
                            <li><code>values(field)</code> - List of all values</li>
                            <li><code>first(field)</code> / <code>last(field)</code> - First/last value</li>
                        </ul>`,
                        spl: 'index=web | stats count, dc(user) as unique_users, avg(response_time) as avg_ms by uri_path',
                        explanation: 'Multiple aggregations on web logs: request count, unique users, and average response time per URL path.'
                    },
                    {
                        title: 'Stats with Expressions',
                        body: `<p>You can use expressions in stats:</p>`,
                        spl: 'index=firewall | stats sum(bytes_in) as total_in, sum(bytes_out) as total_out, sum(eval(bytes_in + bytes_out)) as total_bytes by src_ip',
                        explanation: 'Calculate total inbound, outbound, and combined bytes using eval inside stats.'
                    },
                    {
                        title: 'Percentiles',
                        body: `<p>Use percentiles to understand distributions:</p>`,
                        spl: 'index=web | stats count, avg(response_time) as avg, perc50(response_time) as median, perc95(response_time) as p95, perc99(response_time) as p99 by uri_path | where count > 100',
                        explanation: 'See not just averages but distribution - p95 and p99 reveal outliers that averages hide.'
                    },
                    {
                        title: 'Time-Based Stats',
                        body: `<p>Use earliest() and latest() to capture time ranges:</p>`,
                        spl: 'index=vpn action=* | stats earliest(_time) as first_seen, latest(_time) as last_seen, values(action) as actions, dc(src_ip) as locations by user | eval duration=last_seen-first_seen',
                        explanation: 'Track each VPN user\'s session: when they started, ended, what actions they took, and from how many IPs.'
                    }
                ]
            }
        },
        {
            id: 'core-002',
            title: 'Brute Force Detection',
            type: 'scenario',
            difficulty: 'intermediate',
            duration: '25 min',
            objectives: [
                'Detect credential stuffing patterns',
                'Identify distributed attacks',
                'Calculate attack velocity'
            ],
            tags: ['authentication', 'security', 'brute-force'],
            description: 'Investigate a suspected credential stuffing attack against your web application.',
            content: {
                situation: `The web application team reports slow response times. Initial checks show the authentication endpoint is receiving unusual traffic. You suspect credential stuffing - attackers trying stolen username/password combinations.`,
                steps: [
                    {
                        question: 'First, let\'s examine authentication endpoint traffic. What does the failure rate look like?',
                        hint: 'Look at the /api/login endpoint and calculate success vs failure percentages.',
                        spl: 'index=web uri_path="/api/login" | stats count as total, count(eval(status=200)) as success, count(eval(status=401)) as failure | eval failure_rate=round((failure/total)*100, 2)',
                        analysis: 'This calculates the overall success/failure ratio for login attempts.',
                        finding: 'Alarming: 94% failure rate on login attempts (47,000 failures out of 50,000 attempts in the last hour). Normal is ~5%.'
                    },
                    {
                        question: 'That\'s a clear attack. Is it coming from one source or distributed?',
                        hint: 'Count failures by source IP to see the distribution.',
                        spl: 'index=web uri_path="/api/login" status=401 | stats count by src_ip | sort -count | head 20',
                        analysis: 'Shows how failures are distributed across source IPs.',
                        finding: 'Distributed attack: Top 20 IPs each have 200-500 failures. No single IP dominates - this is coordinated.'
                    },
                    {
                        question: 'Let\'s understand the attack pattern. Are they trying many passwords per user, or one password per many users?',
                        hint: 'Compare unique usernames to unique passwords per source IP.',
                        spl: 'index=web uri_path="/api/login" status=401 | stats dc(username) as unique_users, dc(password) as unique_passwords, count as attempts by src_ip | where attempts > 50 | eval ratio=round(unique_users/unique_passwords, 2)',
                        analysis: 'This reveals the attack strategy - credential stuffing typically has high user:password ratios.',
                        finding: 'Credential stuffing confirmed: ratio of ~50 unique users per password. They\'re trying known passwords across many accounts.'
                    },
                    {
                        question: 'Which user accounts are being targeted most heavily? Are any high-value accounts at risk?',
                        hint: 'Count attempts by username and look for patterns.',
                        spl: 'index=web uri_path="/api/login" status=401 | stats count by username | sort -count | head 30',
                        analysis: 'Shows which accounts are receiving the most attempts.',
                        finding: 'Top targets include: admin, administrator, test, demo, and several real employee email addresses. The attackers have some internal knowledge.'
                    },
                    {
                        question: 'Critical check - have any of these attacks succeeded? Look for successful logins from attacking IPs.',
                        hint: 'Cross-reference attacking IPs with successful authentication events.',
                        spl: `index=web uri_path="/api/login" status=401 | stats dc(username) as attempts by src_ip | where attempts > 50 | fields src_ip | map search="search index=web uri_path=\\"/api/login\\" status=200 src_ip=$src_ip$ | stats count by username, src_ip"`,
                        analysis: 'Check if any attacking IPs achieved successful logins.',
                        finding: 'CRITICAL: 3 successful logins from attacking IPs! Users jsmith@company.com, mwilson@company.com, and demo@company.com were compromised.'
                    }
                ],
                conclusion: `<strong>Investigation Complete!</strong><br><br>
                    <strong>Attack Type:</strong> Distributed credential stuffing attack from 200+ IPs<br><br>
                    <strong>Impact:</strong> 3 accounts compromised (jsmith, mwilson, demo)<br><br>
                    <strong>Immediate Actions:</strong>
                    <ol>
                        <li>Force password reset for compromised accounts</li>
                        <li>Revoke all active sessions for those users</li>
                        <li>Block attacking IP ranges at WAF</li>
                        <li>Enable rate limiting on /api/login endpoint</li>
                        <li>Review compromised accounts for any malicious activity post-login</li>
                    </ol>`
            }
        },
        {
            id: 'core-003',
            title: 'Find the Outlier',
            type: 'scenario',
            difficulty: 'intermediate',
            duration: '20 min',
            objectives: [
                'Establish traffic baselines',
                'Identify statistical anomalies',
                'Investigate unusual patterns'
            ],
            tags: ['network', 'anomaly', 'statistics'],
            description: 'A user reports slow internet - find the bandwidth hog hiding in network traffic.',
            content: {
                situation: `Users in the Finance department report "the internet is slow today." Network team confirms the 1Gbps uplink to their floor is saturated. You need to find what's consuming all the bandwidth.`,
                steps: [
                    {
                        question: 'First, confirm the issue. What\'s the current bandwidth usage from the Finance subnet?',
                        hint: 'Sum up bytes transferred over time from the Finance IP range.',
                        spl: 'index=firewall src_ip="10.20.30.*" | timechart span=5m sum(bytes_out) as bytes_out | eval MB=round(bytes_out/1024/1024, 2)',
                        analysis: 'Shows outbound traffic from Finance in 5-minute windows.',
                        finding: 'Confirmed: Sustained 800+ MB per 5 minutes (roughly 20 Mbps average, with spikes to 50+ Mbps). Normal baseline is ~5 Mbps.'
                    },
                    {
                        question: 'Which specific IP in Finance is responsible for most of this traffic?',
                        hint: 'Aggregate bytes by source IP and find the top consumers.',
                        spl: 'index=firewall src_ip="10.20.30.*" | stats sum(bytes_out) as total_bytes by src_ip | sort -total_bytes | eval GB=round(total_bytes/1024/1024/1024, 2) | head 10',
                        analysis: 'Ranks Finance IPs by total outbound traffic.',
                        finding: 'Single outlier: 10.20.30.47 has transferred 45GB outbound today. Next highest is 2GB. This IP is the problem.'
                    },
                    {
                        question: 'Where is 10.20.30.47 sending all this data?',
                        hint: 'Look at destination IPs and ports for this source.',
                        spl: 'index=firewall src_ip="10.20.30.47" | stats sum(bytes_out) as bytes, dc(dest_port) as ports by dest_ip | sort -bytes | eval GB=round(bytes/1024/1024/1024, 2) | head 10',
                        analysis: 'Shows where the traffic is going.',
                        finding: 'Bulk of traffic (40GB+) going to 185.199.x.x range - this is a cloud storage provider. Single port 443 suggests HTTPS uploads.'
                    },
                    {
                        question: 'What asset is this? Who owns it?',
                        hint: 'Cross-reference with asset inventory.',
                        spl: 'index=asset_inventory ip="10.20.30.47" | table hostname, department, owner, asset_type',
                        analysis: 'Identify the device and owner.',
                        finding: 'Asset: FIN-WKS-JONES (workstation), Owner: Patricia Jones, Department: Finance, Asset Type: Desktop PC'
                    },
                    {
                        question: 'Is this a data exfiltration attempt? Check what type of application is making these connections.',
                        hint: 'Look at connection patterns - user agent, app signatures, or process info if available.',
                        spl: 'index=firewall src_ip="10.20.30.47" dest_ip="185.199.*" | stats count, sum(bytes_out) as bytes by app_category, app_name | sort -bytes',
                        analysis: 'Identify the application responsible.',
                        finding: 'Application identified: "Dropbox" - 40GB uploaded. This is likely an authorized backup or sync, not exfiltration. But the volume is excessive.'
                    }
                ],
                conclusion: `<strong>Investigation Complete!</strong><br><br>
                    <strong>Root Cause:</strong> Patricia Jones (Finance) has Dropbox syncing 40GB+ of data, saturating department bandwidth.<br><br>
                    <strong>Assessment:</strong> Not malicious, but policy violation (personal cloud storage) causing operational impact.<br><br>
                    <strong>Recommended Actions:</strong>
                    <ol>
                        <li>Contact Patricia Jones - understand what's being synced</li>
                        <li>Apply QoS policy to limit cloud storage bandwidth</li>
                        <li>Review DLP policy compliance for synced content</li>
                        <li>Consider department-wide cloud storage policy</li>
                    </ol>`
            }
        },
        {
            id: 'core-004',
            title: 'Top N Analysis',
            type: 'challenge',
            difficulty: 'intermediate',
            duration: '10 min',
            objectives: [
                'Combine stats with sorting',
                'Calculate percentages',
                'Create meaningful rankings'
            ],
            tags: ['aggregation', 'ranking', 'analysis'],
            description: 'Find the most significant items in large datasets.',
            content: {
                problem: 'Find the top 10 source IPs by total bytes transferred in firewall logs. Include the percentage of total traffic each IP represents.',
                hints: [
                    'First calculate total bytes per IP with stats',
                    'Use eventstats to get the overall total',
                    'Calculate percentage and sort'
                ],
                solution: {
                    spl: 'index=firewall | stats sum(bytes_out) as bytes by src_ip | eventstats sum(bytes) as total_bytes | eval percentage=round((bytes/total_bytes)*100, 2) | sort -bytes | head 10 | table src_ip, bytes, percentage',
                    explanation: 'We first aggregate bytes per IP, then use eventstats to add the grand total to each row (without collapsing), calculate percentage, sort descending, and take top 10.'
                },
                variations: [
                    {
                        description: 'Find top 10 destination countries by request count with percentage:',
                        spl: 'index=firewall | stats count by dest_country | eventstats sum(count) as total | eval pct=round((count/total)*100, 2) | sort -count | head 10'
                    },
                    {
                        description: 'Find top 10 URLs by error rate (only URLs with 100+ requests):',
                        spl: 'index=web | stats count as total, count(eval(status>=400)) as errors by uri_path | where total >= 100 | eval error_rate=round((errors/total)*100, 2) | sort -error_rate | head 10'
                    }
                ]
            }
        },
        {
            id: 'core-005',
            title: 'Multi-Field Grouping',
            type: 'challenge',
            difficulty: 'intermediate',
            duration: '15 min',
            objectives: [
                'Group by multiple dimensions',
                'Analyze patterns across categories',
                'Identify unusual combinations'
            ],
            tags: ['stats', 'analysis', 'patterns'],
            description: 'Learn to analyze data across multiple dimensions simultaneously.',
            content: {
                problem: 'From Windows security logs, find all unique combinations of user, source workstation, and logon type. Show the count for each combination and identify any user logging in from more than 3 different workstations.',
                hints: [
                    'Group by multiple fields with stats count by field1, field2, field3',
                    'Then use stats again to count workstations per user',
                    'Filter to users with 3+ workstations'
                ],
                solution: {
                    spl: 'index=wineventlog EventCode=4624 | stats count by TargetUserName, WorkstationName, LogonType | stats dc(WorkstationName) as unique_workstations, values(WorkstationName) as workstations, sum(count) as total_logins by TargetUserName | where unique_workstations > 3 | sort -unique_workstations',
                    explanation: 'First grouping gets each unique combination with counts. Second grouping collapses by user, counting distinct workstations and preserving the list. Filter to users with anomalous behavior (3+ workstations).'
                },
                variations: [
                    {
                        description: 'Find users who authenticated from more than 2 countries in a day:',
                        spl: 'index=vpn | stats dc(src_country) as countries, values(src_country) as country_list by user | where countries > 2'
                    },
                    {
                        description: 'Find source IPs that connected to more than 50 unique destination IPs (potential scanning):',
                        spl: 'index=firewall | stats dc(dest_ip) as unique_dests, dc(dest_port) as unique_ports by src_ip | where unique_dests > 50 | sort -unique_dests'
                    }
                ]
            }
        }
    ],

    intermediate: [
        {
            id: 'int-001',
            title: 'Subsearch Strategies',
            type: 'tutorial',
            difficulty: 'intermediate',
            duration: '25 min',
            objectives: [
                'Understand when to use subsearches',
                'Master subsearch syntax',
                'Avoid common performance pitfalls'
            ],
            tags: ['subsearch', 'correlation', 'performance'],
            description: 'Learn when and how to use subsearches effectively without destroying performance.',
            content: {
                sections: [
                    {
                        title: 'What is a Subsearch?',
                        body: `<p>A subsearch runs first, returns results, and those results become part of the main search. They're enclosed in square brackets <code>[]</code>.</p>
                        <p>Think of it as: "Find X, then use X to find Y."</p>`,
                        spl: 'index=web [search index=security action=blocked | fields src_ip] | stats count by src_ip, uri_path',
                        explanation: 'Find IPs that were blocked in security logs, then find their web activity.'
                    },
                    {
                        title: 'Subsearch Returns Values',
                        body: `<p>By default, subsearch returns results as OR conditions:</p>
                        <pre>(src_ip="1.2.3.4") OR (src_ip="5.6.7.8")</pre>
                        <p>Use <code>format</code> to control output format. Use <code>return</code> for single values.</p>`,
                        spl: 'index=web status=500 | stats count by src_ip | head 1 | return src_ip',
                        explanation: 'Returns just the IP with the most 500 errors as a single value.'
                    },
                    {
                        title: 'Performance Considerations',
                        body: `<p><strong>Warning:</strong> Subsearches have limits!</p>
                        <ul>
                            <li>Max ~10,000 results (default)</li>
                            <li>Max 60 seconds runtime (default)</li>
                            <li>Results are expanded inline - huge subsearches = huge queries</li>
                        </ul>
                        <p>For large correlations, use <code>join</code> or <code>lookup</code> instead.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'Common Patterns',
                        body: `<p><strong>Pattern 1:</strong> Find events related to flagged items</p>`,
                        spl: 'index=web [search index=threats indicator_type=ip | fields indicator_value | rename indicator_value as src_ip]',
                        explanation: 'Find web traffic from IPs in your threat intelligence.'
                    }
                ]
            }
        },
        {
            id: 'int-002',
            title: 'Lateral Movement Hunt',
            type: 'scenario',
            difficulty: 'intermediate',
            duration: '30 min',
            objectives: [
                'Trace authentication chains',
                'Identify credential hopping',
                'Map attack paths'
            ],
            tags: ['authentication', 'windows', 'threat-hunting', 'incident-response'],
            description: 'Hunt for lateral movement after a compromised workstation is discovered.',
            content: {
                situation: `Endpoint protection flagged malware on workstation WKS-HR-022 (10.10.50.22). The malware included credential harvesting capabilities. You need to determine if the attacker moved laterally to other systems.`,
                steps: [
                    {
                        question: 'First, identify who was logged into the compromised workstation when the malware was active.',
                        hint: 'Look for logon events (4624) on the compromised system.',
                        spl: 'index=wineventlog EventCode=4624 host="WKS-HR-022" earliest=-24h | stats values(TargetUserName) as users, count by LogonType | sort -count',
                        analysis: 'Shows all users who logged into the compromised workstation.',
                        finding: 'Three users logged in: jmorgan (interactive, 47 times), svc_backup (service, 12 times), and admin_jmorgan (interactive, 3 times). The admin account is concerning.'
                    },
                    {
                        question: 'Those credentials may be compromised. Where else have these accounts authenticated FROM the compromised machine?',
                        hint: 'Look for network logon events (Type 3) where the source is the compromised workstation.',
                        spl: 'index=wineventlog EventCode=4624 LogonType=3 IpAddress="10.10.50.22" | stats count, dc(host) as systems by TargetUserName | sort -systems',
                        analysis: 'Shows accounts used to authenticate TO other systems FROM the compromised workstation.',
                        finding: 'admin_jmorgan connected to 14 different systems from the compromised machine. This is highly unusual for a 24-hour period.'
                    },
                    {
                        question: 'Map the admin_jmorgan lateral movement. What systems did they access?',
                        hint: 'Track the authentication events for admin_jmorgan from the compromised source.',
                        spl: 'index=wineventlog EventCode=4624 LogonType=3 IpAddress="10.10.50.22" TargetUserName="admin_jmorgan" | stats earliest(_time) as first, latest(_time) as last, count by host | sort first | table host, first, last, count',
                        analysis: 'Creates a timeline of lateral movement.',
                        finding: 'Movement chain identified: WKS-HR-022 → FILESRV-01 → DC-CORP-01 → SQLDB-PROD-01 → BACKUP-01. Attacker accessed domain controller and production database!'
                    },
                    {
                        question: 'Critical: Did the attacker access the domain controller? What actions were taken there?',
                        hint: 'Look for privileged actions on the DC from the compromised credentials.',
                        spl: 'index=wineventlog host="DC-CORP-01" TargetUserName="admin_jmorgan" earliest=-24h | stats count by EventCode | lookup wineventcode_lookup EventCode OUTPUT EventDescription | sort -count',
                        analysis: 'Shows what events the compromised account generated on the domain controller.',
                        finding: 'CRITICAL: EventCode 4728 (member added to security group) and 4738 (user account changed) detected. Attacker may have created persistence!'
                    },
                    {
                        question: 'Identify any new accounts or group membership changes made by the attacker.',
                        hint: 'Look at account creation and group modification events.',
                        spl: 'index=wineventlog host="DC-CORP-01" EventCode IN (4720, 4728, 4732) earliest=-24h | table _time, EventCode, TargetUserName, SubjectUserName, GroupName | sort _time',
                        analysis: 'Shows account creation and group membership changes.',
                        finding: 'Attacker created account "support_temp" and added it to "Domain Admins" group at 03:47 AM. This is a backdoor account!'
                    }
                ],
                conclusion: `<strong>Investigation Complete - CRITICAL INCIDENT</strong><br><br>
                    <strong>Confirmed Lateral Movement Path:</strong><br>
                    WKS-HR-022 → FILESRV-01 → DC-CORP-01 → SQLDB-PROD-01 → BACKUP-01<br><br>
                    <strong>Credentials Compromised:</strong> jmorgan, admin_jmorgan<br><br>
                    <strong>Persistence Established:</strong> Backdoor account "support_temp" added to Domain Admins<br><br>
                    <strong>IMMEDIATE ACTIONS:</strong>
                    <ol>
                        <li>Disable "support_temp" and "admin_jmorgan" accounts immediately</li>
                        <li>Force password reset for "jmorgan"</li>
                        <li>Isolate compromised workstation WKS-HR-022</li>
                        <li>Scan all accessed systems for malware/backdoors</li>
                        <li>Engage IR team - domain controller compromise requires full investigation</li>
                        <li>Check SQLDB-PROD-01 for data access/exfiltration</li>
                    </ol>`
            }
        },
        {
            id: 'int-003',
            title: 'Data Exfiltration Analysis',
            type: 'scenario',
            difficulty: 'intermediate',
            duration: '25 min',
            objectives: [
                'Identify abnormal data transfers',
                'Calculate baseline deviations',
                'Correlate network and endpoint data'
            ],
            tags: ['network', 'exfiltration', 'dlp'],
            description: 'Investigate suspected data exfiltration through unusual outbound transfers.',
            content: {
                situation: `DLP system flagged "possible data exfiltration" for user account "mchen" but has limited details. Your firewall and proxy logs should reveal if sensitive data left the network.`,
                steps: [
                    {
                        question: 'First, understand mchen\'s normal data transfer patterns. What\'s their baseline?',
                        hint: 'Calculate average daily outbound bytes for this user over the past 30 days.',
                        spl: 'index=proxy user="mchen" earliest=-30d latest=-1d | bin _time span=1d | stats sum(bytes_out) as daily_bytes by _time | stats avg(daily_bytes) as avg_daily, stdev(daily_bytes) as stdev_daily, max(daily_bytes) as max_daily',
                        analysis: 'Establish baseline transfer patterns.',
                        finding: 'Baseline: Average 150MB/day, std dev 45MB, max 280MB. Anything significantly above 300MB would be anomalous.'
                    },
                    {
                        question: 'Now check today\'s activity. How does it compare to baseline?',
                        hint: 'Sum today\'s outbound bytes and compare to the baseline we just established.',
                        spl: 'index=proxy user="mchen" earliest=@d | stats sum(bytes_out) as today_bytes | eval today_MB=round(today_bytes/1024/1024, 2) | eval baseline_avg_MB=150, anomaly_threshold_MB=300 | eval status=if(today_MB>anomaly_threshold_MB, "ANOMALOUS", "NORMAL")',
                        analysis: 'Compare today to baseline.',
                        finding: 'ANOMALOUS: User mchen has transferred 2.3GB today - 15x their normal average!'
                    },
                    {
                        question: 'Where is this data going? Identify the top destinations.',
                        hint: 'Group outbound traffic by destination domain or IP.',
                        spl: 'index=proxy user="mchen" earliest=@d | stats sum(bytes_out) as bytes by dest_domain | sort -bytes | eval MB=round(bytes/1024/1024, 2) | head 10',
                        analysis: 'Identify where data is being sent.',
                        finding: 'Top destination: mega.nz (cloud storage) with 2.1GB. Also: drive.google.com (120MB), pastebin.com (45MB). These are file-sharing services!'
                    },
                    {
                        question: 'What files or content type is being uploaded to these services?',
                        hint: 'Look at content types, file extensions, or request patterns in proxy logs.',
                        spl: 'index=proxy user="mchen" dest_domain IN ("mega.nz", "drive.google.com") action=upload | stats count, sum(bytes_out) as bytes by content_type, filename | sort -bytes',
                        analysis: 'Identify what types of files are being exfiltrated.',
                        finding: 'Uploaded files include: "Q4_Financial_Report.xlsx", "Customer_Database_Export.zip", "Strategy_2024.pptx". These are clearly sensitive documents!'
                    },
                    {
                        question: 'Timeline the exfiltration. When did it happen and was it during work hours?',
                        hint: 'Create a timeline of the suspicious uploads.',
                        spl: 'index=proxy user="mchen" dest_domain="mega.nz" action=upload | timechart span=1h sum(bytes_out) as bytes_uploaded | eval MB=round(bytes_uploaded/1024/1024, 2)',
                        analysis: 'Shows when the uploads occurred.',
                        finding: 'Bulk uploads occurred between 11 PM and 2 AM - outside business hours. User may have tried to avoid detection.'
                    }
                ],
                conclusion: `<strong>Investigation Complete - CONFIRMED EXFILTRATION</strong><br><br>
                    <strong>Volume:</strong> 2.3GB transferred to personal cloud storage (mega.nz)<br><br>
                    <strong>Sensitive Files Identified:</strong>
                    <ul>
                        <li>Q4_Financial_Report.xlsx</li>
                        <li>Customer_Database_Export.zip</li>
                        <li>Strategy_2024.pptx</li>
                    </ul><br>
                    <strong>Timing:</strong> 11 PM - 2 AM (outside business hours)<br><br>
                    <strong>Recommended Actions:</strong>
                    <ol>
                        <li>Preserve all evidence (proxy logs, endpoint forensics)</li>
                        <li>Engage HR and Legal immediately - this is a policy violation</li>
                        <li>Suspend mchen's network access pending investigation</li>
                        <li>Block mega.nz at proxy level</li>
                        <li>Determine if mchen gave notice or has reason for data collection</li>
                        <li>Prepare for potential law enforcement involvement</li>
                    </ol>`
            }
        },
        {
            id: 'int-004',
            title: 'Lookup Enrichment',
            type: 'challenge',
            difficulty: 'intermediate',
            duration: '15 min',
            objectives: [
                'Use lookup tables to add context',
                'Enrich security events with asset data',
                'Handle lookup mismatches'
            ],
            tags: ['lookups', 'enrichment', 'context'],
            description: 'Add business context to security events using lookup tables.',
            content: {
                problem: 'Enrich firewall events with asset information. For each source IP, add the hostname, department, and owner from the asset_inventory lookup. Flag any IPs that are NOT in the asset inventory as "Unknown Asset".',
                hints: [
                    'Use the lookup command to enrich events',
                    'Use OUTPUT to specify which fields to add',
                    'Use eval with if/isnull to handle missing lookups'
                ],
                solution: {
                    spl: 'index=firewall | lookup asset_inventory ip as src_ip OUTPUT hostname, department, owner | eval hostname=if(isnull(hostname), "Unknown Asset", hostname) | eval department=if(isnull(department), "INVESTIGATE", department) | stats count by src_ip, hostname, department, owner | sort -count',
                    explanation: 'The lookup command matches src_ip to the ip field in asset_inventory and adds hostname, department, and owner. We then use eval with isnull() to flag unknown assets that need investigation.'
                },
                variations: [
                    {
                        description: 'Enrich with threat intelligence and flag malicious IPs:',
                        spl: 'index=firewall | lookup threat_intel_ip ip as dest_ip OUTPUT threat_type, severity | where isnotnull(threat_type) | stats count by dest_ip, threat_type, severity'
                    },
                    {
                        description: 'Add GeoIP data and find connections to unusual countries:',
                        spl: 'index=firewall | iplocation dest_ip | stats count, sum(bytes_out) as bytes by dest_country | sort -bytes'
                    }
                ]
            }
        },
        {
            id: 'int-005',
            title: 'Transaction Building',
            type: 'challenge',
            difficulty: 'intermediate',
            duration: '20 min',
            objectives: [
                'Group related events into transactions',
                'Calculate session duration',
                'Identify incomplete transactions'
            ],
            tags: ['transaction', 'sessions', 'correlation'],
            description: 'Learn to group related events together using the transaction command.',
            content: {
                problem: 'Build VPN sessions from individual events. Group events by username, where a session starts with action="connect" and ends with action="disconnect". Calculate session duration and find any sessions longer than 8 hours.',
                hints: [
                    'Transaction groups events with common field values',
                    'startswith and endswith define session boundaries',
                    'Transaction automatically calculates duration'
                ],
                solution: {
                    spl: 'index=vpn | transaction user startswith=(action="connect") endswith=(action="disconnect") | where duration > 28800 | eval hours=round(duration/3600, 2) | table user, duration, hours, eventcount, _time',
                    explanation: 'Transaction groups VPN events by user, creating sessions that start with connect and end with disconnect. The duration field (in seconds) is automatically calculated. We filter to sessions over 8 hours (28800 seconds) which may indicate forgotten sessions or policy violations.'
                },
                variations: [
                    {
                        description: 'Find web sessions with more than 100 page views:',
                        spl: 'index=web | transaction session_id maxspan=30m | where eventcount > 100 | stats count by user, eventcount, duration'
                    },
                    {
                        description: 'Find incomplete VPN sessions (no disconnect):',
                        spl: 'index=vpn | transaction user startswith=(action="connect") endswith=(action="disconnect") maxspan=12h | where NOT closed_txn | table user, _time, eventcount'
                    }
                ]
            }
        }
    ],

    advanced: [
        {
            id: 'adv-001',
            title: 'Statistical Baselines',
            type: 'tutorial',
            difficulty: 'advanced',
            duration: '30 min',
            objectives: [
                'Calculate dynamic baselines with eventstats',
                'Detect deviations with streamstats',
                'Build anomaly detection logic'
            ],
            tags: ['statistics', 'baselines', 'anomaly-detection'],
            description: 'Master eventstats and streamstats for sophisticated statistical analysis.',
            content: {
                sections: [
                    {
                        title: 'eventstats vs stats',
                        body: `<p><code>eventstats</code> is like stats, but it adds the aggregation to each event WITHOUT collapsing rows. This lets you compare each event to the group.</p>`,
                        spl: 'index=web | eventstats avg(response_time) as avg_response, stdev(response_time) as stdev_response by uri_path | eval z_score=(response_time - avg_response) / stdev_response | where z_score > 3',
                        explanation: 'Calculate average response time per URL, then find requests with z-score > 3 (statistical outliers).'
                    },
                    {
                        title: 'streamstats for Moving Windows',
                        body: `<p><code>streamstats</code> calculates statistics over a moving window of events. Great for detecting sudden changes.</p>`,
                        spl: 'index=web | bin _time span=5m | stats count by _time | streamstats window=12 avg(count) as rolling_avg, stdev(count) as rolling_stdev | eval upper_bound=rolling_avg+(2*rolling_stdev) | where count > upper_bound',
                        explanation: 'Calculate 1-hour rolling average (12 x 5min buckets), flag when current count exceeds 2 standard deviations.'
                    },
                    {
                        title: 'Building Baselines',
                        body: `<p>Create robust baselines using historical data:</p>`,
                        spl: 'index=auth action=failure | bin _time span=1h | stats count as failures by _time, user | eventstats avg(failures) as baseline_avg, stdev(failures) as baseline_stdev by user | eval anomaly_score=(failures - baseline_avg) / baseline_stdev | where anomaly_score > 2',
                        explanation: 'Per-user baseline for failed authentications. Flag hours with significantly elevated failures.'
                    },
                    {
                        title: 'Percentile-Based Detection',
                        body: `<p>Percentiles can be more robust than standard deviation for non-normal distributions:</p>`,
                        spl: 'index=firewall | stats sum(bytes_out) as bytes by src_ip | eventstats perc95(bytes) as p95_bytes, perc99(bytes) as p99_bytes | eval severity=case(bytes>p99_bytes, "critical", bytes>p95_bytes, "warning", 1=1, "normal") | where severity!="normal"',
                        explanation: 'Flag IPs above the 95th and 99th percentile of traffic volume.'
                    }
                ]
            }
        },
        {
            id: 'adv-002',
            title: 'Beaconing Detection',
            type: 'scenario',
            difficulty: 'advanced',
            duration: '35 min',
            objectives: [
                'Identify periodic C2 communication patterns',
                'Calculate timing consistency metrics',
                'Distinguish beacons from legitimate traffic'
            ],
            tags: ['network', 'threat-hunting', 'malware', 'c2'],
            description: 'Hunt for command-and-control beacons hidden in network traffic.',
            content: {
                situation: `Threat intelligence suggests attackers are using HTTPS beacons with 5-minute intervals to exfiltrate data. These beacons blend in with normal traffic but have telltale timing patterns. Hunt for them.`,
                steps: [
                    {
                        question: 'First, find all external HTTPS connections and calculate how many times each src_ip/dest_ip pair communicated.',
                        hint: 'Filter to HTTPS (port 443) to external IPs and count connections per pair.',
                        spl: 'index=firewall dest_port=443 NOT dest_ip="10.*" NOT dest_ip="192.168.*" NOT dest_ip="172.16.*" | stats count by src_ip, dest_ip | where count > 20 | sort -count',
                        analysis: 'Find frequently communicating pairs.',
                        finding: 'Found 847 IP pairs with 20+ connections today. Need to narrow down to those with beacon-like regularity.'
                    },
                    {
                        question: 'Beacons have consistent timing. Calculate the time delta between consecutive connections for each pair.',
                        hint: 'Use streamstats to calculate time between events, then look at consistency.',
                        spl: 'index=firewall dest_port=443 src_ip="10.10.25.44" dest_ip="185.220.101.54" | sort _time | streamstats window=2 current=t earliest(_time) as prev_time by src_ip, dest_ip | eval delta=_time-prev_time | where isnotnull(delta) | stats avg(delta) as avg_delta, stdev(delta) as stdev_delta, count | eval consistency=stdev_delta/avg_delta',
                        analysis: 'Low consistency ratio (stdev/avg) means regular timing - beacon behavior.',
                        finding: 'This pair shows avg_delta=300 seconds (5 minutes) with stdev=15 (consistency=0.05). Extremely regular - strong beacon indicator!'
                    },
                    {
                        question: 'Now automate this across all pairs. Find those with beacon-like timing patterns.',
                        hint: 'Apply the timing analysis to all pairs with sufficient data points.',
                        spl: 'index=firewall dest_port=443 NOT dest_ip="10.*" NOT dest_ip="192.168.*" | sort _time | streamstats window=2 current=t earliest(_time) as prev_time by src_ip, dest_ip | eval delta=_time-prev_time | where isnotnull(delta) AND delta > 60 AND delta < 3600 | stats avg(delta) as avg_delta, stdev(delta) as stdev_delta, count by src_ip, dest_ip | where count > 10 | eval consistency=round(stdev_delta/avg_delta, 3) | where consistency < 0.15 | sort consistency | head 20',
                        analysis: 'Find pairs with high count, 1-60 minute intervals, and consistency < 0.15.',
                        finding: 'Top 3 beacon candidates:\n1. 10.10.25.44 → 185.220.101.54: 5-min interval, consistency=0.05\n2. 10.10.33.78 → 91.219.237.99: 10-min interval, consistency=0.08\n3. 10.10.42.19 → 45.33.32.156: 15-min interval, consistency=0.11'
                    },
                    {
                        question: 'Check if these destinations are known malicious or have suspicious characteristics.',
                        hint: 'Cross-reference with threat intel and check reverse DNS.',
                        spl: 'index=firewall dest_ip IN ("185.220.101.54", "91.219.237.99", "45.33.32.156") | iplocation dest_ip | lookup threat_intel_ip ip as dest_ip OUTPUT threat_type, malware_family | stats count, values(src_ip) as infected_hosts by dest_ip, dest_country, threat_type, malware_family',
                        analysis: 'Enrich beacon destinations with context.',
                        finding: 'CONFIRMED: 185.220.101.54 matches known Cobalt Strike C2 infrastructure in threat intel. 91.219.237.99 is TOR exit node. 45.33.32.156 is clean (legitimate SaaS - false positive).'
                    },
                    {
                        question: 'For confirmed C2, what data might be exfiltrated? Check bytes transferred.',
                        hint: 'Look at data volume over time for the malicious connection.',
                        spl: 'index=firewall dest_ip="185.220.101.54" | timechart span=1h sum(bytes_in) as bytes_in, sum(bytes_out) as bytes_out | eval in_MB=round(bytes_in/1024/1024,2), out_MB=round(bytes_out/1024/1024,2)',
                        analysis: 'Analyze data transfer patterns to/from C2.',
                        finding: 'Pattern shows small outbound (commands ~5KB) but larger inbound (responses ~50KB). Also one spike of 45MB outbound at 3 AM - possible data exfiltration event!'
                    }
                ],
                conclusion: `<strong>C2 Beaconing Confirmed!</strong><br><br>
                    <strong>Confirmed C2 Infrastructure:</strong>
                    <ul>
                        <li>185.220.101.54 - Cobalt Strike C2 (5-min beacon)</li>
                        <li>91.219.237.99 - TOR exit node (10-min beacon)</li>
                    </ul><br>
                    <strong>Infected Host:</strong> 10.10.25.44 (primary), 10.10.33.78 (secondary)<br><br>
                    <strong>Data Exfiltration:</strong> 45MB transferred to C2 at 3 AM<br><br>
                    <strong>Recommended Actions:</strong>
                    <ol>
                        <li>Isolate 10.10.25.44 and 10.10.33.78 immediately</li>
                        <li>Block C2 IPs at perimeter firewall</li>
                        <li>Forensic imaging of affected systems</li>
                        <li>Hunt for lateral movement from these hosts</li>
                        <li>Implement automated beaconing detection</li>
                    </ol>`
            }
        },
        {
            id: 'adv-003',
            title: 'Persistence Mechanism Detection',
            type: 'scenario',
            difficulty: 'advanced',
            duration: '30 min',
            objectives: [
                'Identify registry-based persistence',
                'Detect scheduled task abuse',
                'Recognize service installation patterns'
            ],
            tags: ['endpoint', 'persistence', 'threat-hunting', 'windows'],
            description: 'Hunt for attacker persistence mechanisms in Windows endpoint logs.',
            content: {
                situation: `After discovering a compromised system, you need to determine if the attacker established persistence. Check for common Windows persistence mechanisms: Run keys, scheduled tasks, and services.`,
                steps: [
                    {
                        question: 'Start with registry-based persistence. Look for modifications to common Run keys.',
                        hint: 'Registry events with paths containing "Run" or "RunOnce" are persistence indicators.',
                        spl: 'index=sysmon EventCode=13 | where match(TargetObject, "(?i)(Run|RunOnce)") | stats count, values(Details) as commands by TargetObject, Image, user | sort -count',
                        analysis: 'Sysmon EventCode 13 is registry value set. We filter to Run keys.',
                        finding: 'Suspicious entry found: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\WindowsUpdater" pointing to "C:\\Users\\Public\\updater.exe". This is NOT a Microsoft binary.'
                    },
                    {
                        question: 'Check scheduled tasks for suspicious entries. Look for newly created tasks.',
                        hint: 'Event 4698 is scheduled task creation. Look for unusual task paths or executables.',
                        spl: 'index=wineventlog EventCode=4698 | rex field=TaskContent "<Command>(?<command>[^<]+)</Command>" | rex field=TaskContent "<Arguments>(?<arguments>[^<]*)</Arguments>" | rex field=TaskContent "<UserId>(?<run_as>[^<]+)</UserId>" | stats count by TaskName, command, arguments, run_as, SubjectUserName | sort -count',
                        analysis: 'Parse scheduled task creation events to see what\'s being scheduled.',
                        finding: 'Suspicious task "GoogleUpdate" running C:\\Windows\\Temp\\update.exe as SYSTEM. Created by admin_jmorgan. Google doesn\'t put updates in TEMP!'
                    },
                    {
                        question: 'Check for new service installations that could be backdoors.',
                        hint: 'Event 4697 or 7045 indicates new service installation.',
                        spl: 'index=wineventlog EventCode IN (4697, 7045) | rex field=ServiceFileName "(?<service_path>[^\"]+)" | stats count by ServiceName, ServiceType, service_path, SubjectUserName | where NOT match(service_path, "(?i)(System32|SysWOW64|Program Files)")',
                        analysis: 'New services running from unusual paths are suspicious.',
                        finding: 'Service "WindowsHelper" installed from "C:\\ProgramData\\helper.exe" - services should NOT run from ProgramData!'
                    },
                    {
                        question: 'Correlate these persistence mechanisms. Were they all created around the same time?',
                        hint: 'Look at timestamps across all three persistence types.',
                        spl: '(index=sysmon EventCode=13 TargetObject="*Run*WindowsUpdater*") OR (index=wineventlog EventCode=4698 TaskName="GoogleUpdate") OR (index=wineventlog EventCode=7045 ServiceName="WindowsHelper") | eval persistence_type=case(EventCode=13, "Registry", EventCode=4698, "ScheduledTask", EventCode=7045, "Service") | table _time, persistence_type, host, SubjectUserName | sort _time',
                        analysis: 'Timeline the persistence installations.',
                        finding: 'All three created within 4 minutes of each other (2:41-2:45 AM) by admin_jmorgan. This is a coordinated persistence installation!'
                    },
                    {
                        question: 'Verify these executables are malicious. Check if they\'re calling back to C2.',
                        hint: 'Look for network connections from these suspicious paths.',
                        spl: 'index=sysmon EventCode=3 | where match(Image, "(?i)(updater|update|helper)\\.exe") | stats count, values(DestinationIp) as dest_ips, values(DestinationPort) as dest_ports by Image | where count > 0',
                        analysis: 'Check network activity from suspected malicious binaries.',
                        finding: 'Confirmed: All three executables connecting to 185.220.101.54:443 - same C2 identified in beaconing detection!'
                    }
                ],
                conclusion: `<strong>Multiple Persistence Mechanisms Identified!</strong><br><br>
                    <strong>Registry:</strong> HKLM\\..\\Run\\WindowsUpdater → C:\\Users\\Public\\updater.exe<br>
                    <strong>Scheduled Task:</strong> GoogleUpdate → C:\\Windows\\Temp\\update.exe (as SYSTEM)<br>
                    <strong>Service:</strong> WindowsHelper → C:\\ProgramData\\helper.exe<br><br>
                    <strong>Timeline:</strong> All installed 2:41-2:45 AM by admin_jmorgan (compromised account)<br><br>
                    <strong>C2:</strong> All executables beacon to 185.220.101.54<br><br>
                    <strong>Remediation:</strong>
                    <ol>
                        <li>Delete registry key, scheduled task, and service</li>
                        <li>Remove malicious executables from all paths</li>
                        <li>Verify no other persistence mechanisms exist</li>
                        <li>Check other systems for same IOCs</li>
                        <li>Full AV scan and reimage if needed</li>
                    </ol>`
            }
        },
        {
            id: 'adv-004',
            title: 'Anomaly Scoring',
            type: 'challenge',
            difficulty: 'advanced',
            duration: '20 min',
            objectives: [
                'Build composite anomaly scores',
                'Weight multiple indicators',
                'Prioritize investigation targets'
            ],
            tags: ['anomaly-detection', 'statistics', 'threat-hunting'],
            description: 'Create a weighted anomaly scoring system to prioritize threats.',
            content: {
                problem: 'Build an anomaly score for each user based on: (1) failed login ratio, (2) off-hours activity, (3) number of unique systems accessed. Weight factors: failed logins x3, off-hours x2, unique systems x1. Output a normalized 0-100 risk score.',
                hints: [
                    'Calculate each metric separately, then combine',
                    'Normalize each metric to 0-1 range before weighting',
                    'Use eventstats to get population-wide baselines for normalization'
                ],
                solution: {
                    spl: `index=wineventlog EventCode IN (4624, 4625)
| eval hour=strftime(_time, "%H")
| eval off_hours=if(hour<6 OR hour>20, 1, 0)
| stats count(eval(EventCode=4625)) as failures, count(eval(EventCode=4624)) as successes, sum(off_hours) as off_hour_events, dc(host) as unique_hosts by TargetUserName
| eval failure_ratio=failures/(failures+successes)
| eval off_hours_ratio=off_hour_events/(failures+successes)
| eventstats perc99(failure_ratio) as max_fail, perc99(off_hours_ratio) as max_offhours, perc99(unique_hosts) as max_hosts
| eval norm_fail=if(failure_ratio>max_fail, 1, failure_ratio/max_fail)
| eval norm_offhours=if(off_hours_ratio>max_offhours, 1, off_hours_ratio/max_offhours)
| eval norm_hosts=if(unique_hosts>max_hosts, 1, unique_hosts/max_hosts)
| eval risk_score=round(((norm_fail*3) + (norm_offhours*2) + (norm_hosts*1)) / 6 * 100, 0)
| where failures+successes > 10
| sort -risk_score
| table TargetUserName, risk_score, failures, successes, failure_ratio, off_hour_events, unique_hosts`,
                    explanation: 'We calculate three metrics per user, normalize each to 0-1 using percentile capping, apply weights (3, 2, 1), sum and normalize to 0-100. Users with highest composite scores should be investigated first.'
                },
                variations: [
                    {
                        description: 'Add data volume anomaly as a fourth factor (weight x2):',
                        spl: '... | join TargetUserName [search index=proxy | stats sum(bytes_out) as bytes by user | rename user as TargetUserName] | ... add bytes normalization and scoring ...'
                    },
                    {
                        description: 'Create IP-based risk scoring for firewall traffic:',
                        spl: 'index=firewall | stats dc(dest_ip) as unique_dests, dc(dest_port) as unique_ports, sum(bytes_out) as bytes by src_ip | ... normalize and score ...'
                    }
                ]
            }
        }
    ],

    expert: [
        {
            id: 'exp-001',
            title: 'Full Incident Timeline Reconstruction',
            type: 'scenario',
            difficulty: 'expert',
            duration: '45 min',
            objectives: [
                'Correlate events across multiple data sources',
                'Build complete attack timeline',
                'Determine full scope of compromise'
            ],
            tags: ['incident-response', 'timeline', 'correlation'],
            description: 'Reconstruct a complete attack timeline from initial access to impact.',
            content: {
                situation: `Critical alert: Ransomware encryption detected on FILESRV-02 at 4:32 AM. You need to reconstruct the complete attack timeline: initial access, lateral movement, privilege escalation, and impact. Multiple data sources are available: Windows event logs, Sysmon, firewall, proxy, and EDR.`,
                steps: [
                    {
                        question: 'Start at the end and work backwards. What process executed the ransomware on FILESRV-02?',
                        hint: 'Look for file creation or process execution events around 4:32 AM.',
                        spl: 'index=sysmon host="FILESRV-02" EventCode IN (1, 11) earliest="01/15/2024:04:25:00" latest="01/15/2024:04:35:00" | eval event_type=case(EventCode=1, "ProcessCreate", EventCode=11, "FileCreate") | table _time, event_type, Image, ParentImage, TargetFilename, User | sort _time',
                        analysis: 'Look for the ransomware execution event.',
                        finding: 'Ransomware "locker.exe" launched at 4:31:45 from C:\\Windows\\Temp\\. Parent process: powershell.exe running as SYSTEM. PowerShell was spawned by services.exe - indicates scheduled task or service abuse.'
                    },
                    {
                        question: 'How did locker.exe get onto the file server? Check for lateral movement or file drops.',
                        hint: 'Look for file creation of locker.exe and network connections to the server.',
                        spl: 'index=sysmon host="FILESRV-02" EventCode=11 TargetFilename="*locker.exe" | append [search index=sysmon host="FILESRV-02" EventCode=3 DestinationPort IN (445, 139, 5985)] | sort _time | table _time, EventCode, Image, TargetFilename, SourceIp, DestinationPort, User',
                        analysis: 'Track how the ransomware binary arrived.',
                        finding: 'locker.exe created at 4:15 AM by wmiprvse.exe (WMI). Inbound WMI connection (port 5985) from 10.10.25.44 at 4:14. That\'s the source of lateral movement!'
                    },
                    {
                        question: 'What happened on 10.10.25.44 before it attacked the file server? This is likely patient zero.',
                        hint: 'Look for suspicious activity on the attacking workstation.',
                        spl: 'index=sysmon host="10.10.25.44" earliest="01/15/2024:00:00:00" latest="01/15/2024:04:30:00" EventCode IN (1, 3, 11) | where NOT match(Image, "(?i)(svchost|csrss|lsass|explorer|chrome|edge)") | stats count by Image, ParentImage | sort -count | head 20',
                        analysis: 'Profile unusual process activity on patient zero.',
                        finding: 'Suspicious activity: mimikatz.exe, powershell encoded commands, wmic.exe remote execution. Classic attack toolkit. Earliest malicious activity: 1:47 AM.'
                    },
                    {
                        question: 'How was 10.10.25.44 initially compromised? Check for phishing or external access.',
                        hint: 'Look at email, web browsing, or VPN access for the user of that workstation.',
                        spl: 'index=proxy src_ip="10.10.25.44" earliest="01/14/2024:08:00:00" latest="01/15/2024:02:00:00" | where match(url, "(?i)(\\.exe|\\.dll|\\.zip|\\.js|\\.hta)") OR category="malware" | table _time, url, content_type, bytes, category, user',
                        analysis: 'Look for initial payload download.',
                        finding: 'At 11:47 PM on Jan 14, user rthompson downloaded "invoice_12847.zip" from hxxps://malicious-site[.]com. EDR logs show the ZIP contained a macro-enabled document.'
                    },
                    {
                        question: 'Map all systems the attacker touched. What\'s the full scope?',
                        hint: 'Track all lateral movement from patient zero using authentication and network logs.',
                        spl: 'index=wineventlog EventCode=4624 LogonType=3 IpAddress="10.10.25.44" earliest="01/15/2024:00:00:00" | append [search index=sysmon EventCode=3 SourceIp="10.10.25.44" earliest="01/15/2024:00:00:00" | where match(DestinationPort, "(445|139|5985|5986|3389)")] | stats earliest(_time) as first_access, latest(_time) as last_access, dc(DestinationPort) as ports by ComputerName, TargetUserName | sort first_access',
                        analysis: 'Full lateral movement map.',
                        finding: 'Attacker accessed 7 systems: WKS-FIN-04, WKS-HR-22, FILESRV-01, FILESRV-02, DC-CORP-01, SQLDB-PROD, BACKUP-01. Domain controller was compromised!'
                    }
                ],
                conclusion: `<strong>Complete Attack Timeline Reconstructed</strong><br><br>
                    <table style="width:100%; border-collapse: collapse;">
                    <tr><td style="padding:4px; border:1px solid #333;"><strong>11:47 PM Jan 14</strong></td><td style="padding:4px; border:1px solid #333;">Initial Access - Phishing email opened by rthompson</td></tr>
                    <tr><td style="padding:4px; border:1px solid #333;"><strong>11:52 PM</strong></td><td style="padding:4px; border:1px solid #333;">Malware execution on 10.10.25.44</td></tr>
                    <tr><td style="padding:4px; border:1px solid #333;"><strong>1:47 AM Jan 15</strong></td><td style="padding:4px; border:1px solid #333;">Credential harvesting (mimikatz)</td></tr>
                    <tr><td style="padding:4px; border:1px solid #333;"><strong>2:15 AM</strong></td><td style="padding:4px; border:1px solid #333;">Lateral movement begins</td></tr>
                    <tr><td style="padding:4px; border:1px solid #333;"><strong>2:45 AM</strong></td><td style="padding:4px; border:1px solid #333;">Domain controller compromised</td></tr>
                    <tr><td style="padding:4px; border:1px solid #333;"><strong>3:30 AM</strong></td><td style="padding:4px; border:1px solid #333;">Ransomware staged on file servers</td></tr>
                    <tr><td style="padding:4px; border:1px solid #333;"><strong>4:31 AM</strong></td><td style="padding:4px; border:1px solid #333;">Ransomware executed (encryption begins)</td></tr>
                    </table><br>
                    <strong>Affected Systems:</strong> 7 systems including DC and file servers<br>
                    <strong>Root Cause:</strong> Phishing email with malicious attachment<br>
                    <strong>Compromised Accounts:</strong> rthompson, admin_rthompson, domain admin account`
            }
        },
        {
            id: 'exp-002',
            title: 'Advanced Threat Hunt: Multi-Stage Attack',
            type: 'scenario',
            difficulty: 'expert',
            duration: '40 min',
            objectives: [
                'Hunt for stealthy attack patterns',
                'Correlate weak signals into strong indicators',
                'Identify living-off-the-land techniques'
            ],
            tags: ['threat-hunting', 'apt', 'lolbins'],
            description: 'Hunt for a sophisticated attacker using legitimate tools to evade detection.',
            content: {
                situation: `Threat intel reports APT group "ShadowBear" is targeting organizations in your sector. Their TTP includes: living-off-the-land binaries, memory-only malware, and slow beaconing. No alerts have fired, but you should hunt proactively.`,
                steps: [
                    {
                        question: 'Start with LOLBin hunting. Find unusual parent-child process relationships for Windows utilities.',
                        hint: 'Look for legitimate tools (certutil, bitsadmin, mshta) with unusual parent processes.',
                        spl: 'index=sysmon EventCode=1 Image IN ("*\\\\certutil.exe", "*\\\\bitsadmin.exe", "*\\\\mshta.exe", "*\\\\regsvr32.exe", "*\\\\rundll32.exe", "*\\\\msiexec.exe") | where NOT match(ParentImage, "(?i)(explorer|services|svchost|cmd|powershell)") | stats count, values(CommandLine) as commands by Image, ParentImage, User | sort -count',
                        analysis: 'Find LOLBins spawned by unusual parents.',
                        finding: 'Suspicious: certutil.exe spawned by WINWORD.EXE on 3 systems. This indicates Office macro downloading payloads using certutil.'
                    },
                    {
                        question: 'Check what certutil was downloading. Look for URL connections or decode operations.',
                        hint: 'Parse the certutil command line for URLs or file operations.',
                        spl: 'index=sysmon EventCode=1 Image="*\\\\certutil.exe" ParentImage="*\\\\WINWORD.EXE" | rex field=CommandLine "(?<url>https?://[^\\s]+)" | rex field=CommandLine "-decode\\s+(?<encoded_file>[^\\s]+)\\s+(?<decoded_file>[^\\s]+)" | table _time, host, User, url, encoded_file, decoded_file, CommandLine',
                        analysis: 'Extract the payload details.',
                        finding: 'certutil downloading from hxxps://cdn-update[.]com/font.txt and decoding to C:\\Users\\[user]\\AppData\\Local\\Temp\\update.dll. Classic base64 encoded payload technique!'
                    },
                    {
                        question: 'Track the downloaded DLL. How is it being executed?',
                        hint: 'Look for rundll32 or regsvr32 loading this DLL.',
                        spl: 'index=sysmon (EventCode=1 Image="*rundll32.exe" CommandLine="*update.dll*") OR (EventCode=7 ImageLoaded="*update.dll*") | table _time, host, EventCode, Image, ImageLoaded, CommandLine, User | sort _time',
                        analysis: 'Track DLL execution.',
                        finding: 'rundll32.exe loading update.dll with export function "Initialize". DLL also loaded by svchost.exe - indicates process injection!'
                    },
                    {
                        question: 'Check for process injection indicators. Look for suspicious memory operations.',
                        hint: 'Sysmon EventCode 8 (CreateRemoteThread) and 10 (ProcessAccess) show injection.',
                        spl: 'index=sysmon EventCode IN (8, 10) SourceImage="*\\\\svchost.exe" | where NOT match(TargetImage, "(?i)(svchost|csrss|lsass|services)") | stats count, values(TargetImage) as targets by SourceImage, GrantedAccess | where count > 0',
                        analysis: 'Detect process injection.',
                        finding: 'svchost.exe injecting into multiple processes including chrome.exe, teams.exe. GrantedAccess 0x1F0FFF indicates full process access - this is malware!'
                    },
                    {
                        question: 'The malware is hiding in legitimate processes. Hunt for its C2 communication.',
                        hint: 'Look for unusual network connections from processes that normally don\'t connect to the internet.',
                        spl: 'index=sysmon EventCode=3 Image IN ("*\\\\svchost.exe", "*\\\\chrome.exe") | where NOT match(DestinationIp, "^(10\\.|192\\.168\\.|172\\.(1[6-9]|2[0-9]|3[0-1]))") | stats count, dc(DestinationIp) as unique_dests, values(DestinationIp) as dest_ips by Image, host | where unique_dests > 5 AND unique_dests < 20',
                        analysis: 'Find C2 connections from injected processes.',
                        finding: 'Injected svchost.exe connecting to 8 unique IPs, all on port 443. One IP matches "cdn-update[.]com" - the same domain used for payload delivery. C2 confirmed!'
                    }
                ],
                conclusion: `<strong>APT Activity Confirmed</strong><br><br>
                    <strong>Attack Chain Identified:</strong>
                    <ol>
                        <li>Phishing document with macro</li>
                        <li>LOLBin abuse (certutil for download)</li>
                        <li>Encoded payload delivery</li>
                        <li>DLL execution via rundll32</li>
                        <li>Process injection for stealth</li>
                        <li>C2 via injected legitimate processes</li>
                    </ol><br>
                    <strong>IOCs Identified:</strong>
                    <ul>
                        <li>Domain: cdn-update[.]com</li>
                        <li>File: update.dll (various hashes per host)</li>
                        <li>Behavior: certutil spawned by Office applications</li>
                        <li>Behavior: svchost.exe with unusual network connections</li>
                    </ul><br>
                    <strong>Affected Hosts:</strong> 3 workstations confirmed, hunt for more using IOCs`
            }
        },
        {
            id: 'exp-003',
            title: 'Performance Optimization Challenge',
            type: 'challenge',
            difficulty: 'expert',
            duration: '25 min',
            objectives: [
                'Optimize slow-running searches',
                'Reduce search job resource consumption',
                'Apply SPL best practices'
            ],
            tags: ['performance', 'optimization', 'best-practices'],
            description: 'Take a slow search and make it fast without changing the results.',
            content: {
                problem: `The following search takes 45 minutes to run and times out. Optimize it to complete in under 2 minutes while returning the same results:

\`\`\`
index=* | eval threat_indicator=if(match(src_ip, "185\\.220\\..*") OR match(dest_ip, "185\\.220\\..*"), "yes", "no") | search threat_indicator="yes" | join src_ip [search index=asset_inventory | table ip, hostname, owner] | where isnotnull(hostname) | stats count by src_ip, dest_ip, hostname, owner | sort -count
\`\`\``,
                hints: [
                    'Never start with index=* - specify the actual index',
                    'Move filtering before eval where possible',
                    'Replace join with lookup for better performance',
                    'Filter before aggregating, not after'
                ],
                solution: {
                    spl: `index=firewall (src_ip="185.220.*" OR dest_ip="185.220.*")
| lookup asset_inventory ip as src_ip OUTPUT hostname, owner
| where isnotnull(hostname)
| stats count by src_ip, dest_ip, hostname, owner
| sort -count`,
                    explanation: `Optimizations applied:
1. **Specify index**: Changed from "index=*" to "index=firewall" - huge reduction in data scanned
2. **Push filtering left**: Moved IP filter into the base search instead of eval+search
3. **Use wildcard efficiently**: "185.220.*" in search is faster than regex in eval
4. **Replace join with lookup**: Lookups are orders of magnitude faster than joins for enrichment
5. **Removed unnecessary eval**: threat_indicator column was never used after filtering`
                },
                variations: [
                    {
                        description: 'Alternative using tstats for even faster execution (if data model exists):',
                        spl: '| tstats count from datamodel=Network_Traffic where (All_Traffic.src_ip="185.220.*" OR All_Traffic.dest_ip="185.220.*") by All_Traffic.src_ip, All_Traffic.dest_ip | rename All_Traffic.* as * | lookup asset_inventory ip as src_ip OUTPUT hostname, owner | where isnotnull(hostname)'
                    },
                    {
                        description: 'If you need to run across all indexes, use targeted OR:',
                        spl: 'index=firewall OR index=proxy (src_ip="185.220.*" OR dest_ip="185.220.*") | ...'
                    }
                ]
            }
        }
    ]
};


// ============================================
// State Management
// ============================================

let currentTab = 'foundations';
let currentFilters = { type: 'all', domain: 'all', search: '' };
let currentModalData = null;
let currentScenarioStep = 0;
let revealedHints = new Set();

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTrainingTabs();
    initFilters();
    initSearch();
    initModal();
    renderCurrentTab();
});

// ============================================
// Tab Management
// ============================================

function initTrainingTabs() {
    const savedTab = localStorage.getItem('trainingTab');
    if (savedTab && TRAINING_DATA[savedTab]) {
        currentTab = savedTab;
    }

    document.querySelectorAll('.tabs-list button').forEach(tab => {
        const tabId = tab.dataset.category;
        tab.classList.toggle('active', tabId === currentTab);
        tab.setAttribute('aria-selected', tabId === currentTab);

        tab.addEventListener('click', () => switchTab(tabId));
    });

    // Show the current panel
    updatePanelVisibility();
}

function switchTab(tabId) {
    if (!TRAINING_DATA[tabId]) return;

    currentTab = tabId;
    localStorage.setItem('trainingTab', tabId);

    document.querySelectorAll('.tabs-list button').forEach(tab => {
        const id = tab.dataset.category;
        tab.classList.toggle('active', id === tabId);
        tab.setAttribute('aria-selected', id === tabId);
    });

    updatePanelVisibility();
    renderCurrentTab();
}

function updatePanelVisibility() {
    document.querySelectorAll('.tab-panel').forEach(panel => {
        const panelId = panel.id.replace('Panel', '');
        const isActive = panelId === currentTab;
        panel.classList.toggle('active', isActive);
        panel.hidden = !isActive;
    });
}

// ============================================
// Filtering & Search
// ============================================

function initFilters() {
    const typeFilter = document.getElementById('typeFilter');
    const domainFilter = document.getElementById('domainFilter');

    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            currentFilters.type = e.target.value;
            renderCurrentTab();
        });
    }

    if (domainFilter) {
        domainFilter.addEventListener('change', (e) => {
            currentFilters.domain = e.target.value;
            renderCurrentTab();
        });
    }
}

function initSearch() {
    const searchInput = document.getElementById('trainingSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentFilters.search = e.target.value.toLowerCase();
            renderCurrentTab();
        }, 200));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Rendering
// ============================================

function renderCurrentTab() {
    const grid = document.getElementById(`${currentTab}Grid`);
    const emptyState = document.getElementById('trainingEmptyState');

    if (!grid) return;

    const modules = filterModules(TRAINING_DATA[currentTab] || []);

    if (modules.length === 0) {
        grid.innerHTML = '';
        emptyState?.classList.remove('hidden');
        return;
    }

    emptyState?.classList.add('hidden');
    grid.innerHTML = modules.map(module => renderTrainingCard(module)).join('');

    // Add click handlers
    grid.querySelectorAll('.training-card').forEach(card => {
        card.addEventListener('click', () => {
            const moduleId = card.dataset.id;
            openTrainingModal(moduleId);
        });
    });
}

function filterModules(modules) {
    return modules.filter(module => {
        // Type filter
        if (currentFilters.type !== 'all' && module.type !== currentFilters.type) {
            return false;
        }

        // Domain filter
        if (currentFilters.domain !== 'all') {
            const hasTag = module.tags.some(tag =>
                tag.toLowerCase().includes(currentFilters.domain.toLowerCase())
            );
            if (!hasTag) return false;
        }

        // Search filter
        if (currentFilters.search) {
            const searchText = `${module.title} ${module.description} ${module.tags.join(' ')}`.toLowerCase();
            if (!searchText.includes(currentFilters.search)) {
                return false;
            }
        }

        return true;
    });
}

function renderTrainingCard(module) {
    const tagHtml = module.tags.slice(0, 3).map(tag =>
        `<span class="training-tag">${tag}</span>`
    ).join('');

    return `
        <div class="training-card" data-id="${module.id}" data-type="${module.type}" data-difficulty="${module.difficulty}">
            <div class="training-card-header">
                <span class="training-type-badge ${module.type}">${module.type}</span>
                <span class="training-difficulty ${module.difficulty}">${capitalize(module.difficulty)}</span>
            </div>
            <h3 class="training-card-title">${module.title}</h3>
            <p class="training-card-description">${module.description}</p>
            <div class="training-card-meta">
                <span class="training-duration">${module.duration}</span>
                <div class="training-tags">${tagHtml}</div>
            </div>
        </div>
    `;
}

// ============================================
// Modal Management
// ============================================

function initModal() {
    const modal = document.getElementById('trainingModal');
    const overlay = document.getElementById('trainingModalOverlay');
    const closeBtn = document.getElementById('trainingModalClose');

    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function findModule(moduleId) {
    for (const tab of Object.values(TRAINING_DATA)) {
        const module = tab.find(m => m.id === moduleId);
        if (module) return module;
    }
    return null;
}

function openTrainingModal(moduleId) {
    const module = findModule(moduleId);
    if (!module) return;

    currentModalData = module;
    currentScenarioStep = 0;
    revealedHints = new Set();

    const modal = document.getElementById('trainingModal');
    const typeBadge = document.getElementById('modalTypeBadge');
    const difficulty = document.getElementById('modalDifficulty');
    const duration = document.getElementById('modalDuration');
    const title = document.getElementById('trainingModalTitle');
    const objectives = document.getElementById('trainingModalObjectives');
    const body = document.getElementById('trainingModalBody');
    const nav = document.getElementById('trainingModalNav');

    typeBadge.textContent = module.type;
    typeBadge.className = `training-type-badge ${module.type}`;
    difficulty.textContent = capitalize(module.difficulty);
    difficulty.className = `training-difficulty ${module.difficulty}`;
    duration.textContent = module.duration;
    title.textContent = module.title;

    // Render objectives
    objectives.innerHTML = `
        <h4>Learning Objectives</h4>
        <ul>
            ${module.objectives.map(obj => `<li>${obj}</li>`).join('')}
        </ul>
    `;

    // Render content based on type
    switch (module.type) {
        case 'tutorial':
            body.innerHTML = renderTutorialContent(module.content);
            nav.innerHTML = '';
            break;
        case 'scenario':
            body.innerHTML = renderScenarioContent(module.content);
            nav.innerHTML = renderScenarioNav(module.content.steps.length);
            initScenarioInteractivity();
            break;
        case 'challenge':
            body.innerHTML = renderChallengeContent(module.content);
            nav.innerHTML = '';
            initChallengeInteractivity();
            break;
    }

    // Add copy button handlers
    body.querySelectorAll('.training-spl-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const spl = btn.closest('.training-spl-block').querySelector('.training-spl-code').textContent;
            copyToClipboard(spl, btn);
        });
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('trainingModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentModalData = null;
}

// ============================================
// Tutorial Rendering
// ============================================

function renderTutorialContent(content) {
    return content.sections.map(section => `
        <div class="tutorial-section">
            <h3 class="tutorial-section-title">${section.title}</h3>
            <div class="tutorial-section-body">${section.body}</div>
            ${section.spl ? renderSplBlock(section.spl, section.explanation) : ''}
        </div>
    `).join('');
}

// ============================================
// Scenario Rendering
// ============================================

function renderScenarioContent(content) {
    const situationHtml = `
        <div class="scenario-situation">
            <h3>Situation</h3>
            <p>${content.situation}</p>
        </div>
    `;

    const stepsHtml = content.steps.map((step, index) => `
        <div class="scenario-step ${index === 0 ? 'current' : ''}" data-step="${index}">
            <div class="scenario-step-header">
                <span class="scenario-step-number">${index + 1}</span>
                <p class="scenario-step-question">${step.question}</p>
            </div>
            <div class="scenario-step-content">
                <button class="hint-toggle" data-step="${index}">Show Hint</button>
                <div class="hint-content" data-step="${index}">${step.hint}</div>
                <button class="spl-reveal-btn" data-step="${index}">Reveal SPL Query</button>
                <div class="spl-hidden" data-step="${index}">
                    ${renderSplBlock(step.spl, step.analysis)}
                    <div class="scenario-finding">
                        <h5>Finding</h5>
                        <p>${step.finding}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    const conclusionHtml = `
        <div class="scenario-conclusion hidden" id="scenarioConclusion">
            <h3>Conclusion</h3>
            <p>${content.conclusion}</p>
        </div>
    `;

    return situationHtml + '<div class="scenario-steps">' + stepsHtml + '</div>' + conclusionHtml;
}

function renderScenarioNav(totalSteps) {
    return `
        <button class="nav-btn" id="scenarioPrev" disabled>Previous</button>
        <span class="step-progress">Step <span id="currentStepNum">1</span> of ${totalSteps}</span>
        <button class="nav-btn primary" id="scenarioNext">Reveal & Continue</button>
    `;
}

function initScenarioInteractivity() {
    // Hint toggles
    document.querySelectorAll('.hint-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const step = btn.dataset.step;
            btn.classList.toggle('active');
            const hintContent = document.querySelector(`.hint-content[data-step="${step}"]`);
            hintContent.classList.toggle('visible');
            btn.textContent = btn.classList.contains('active') ? 'Hide Hint' : 'Show Hint';
        });
    });

    // SPL reveal buttons
    document.querySelectorAll('.spl-reveal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const step = btn.dataset.step;
            btn.classList.add('revealed');
            document.querySelector(`.spl-hidden[data-step="${step}"]`).style.display = 'block';
        });
    });

    // Navigation
    const prevBtn = document.getElementById('scenarioPrev');
    const nextBtn = document.getElementById('scenarioNext');

    if (prevBtn) prevBtn.addEventListener('click', () => navigateScenario(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateScenario(1));
}

function navigateScenario(direction) {
    if (!currentModalData || currentModalData.type !== 'scenario') return;

    const steps = currentModalData.content.steps;
    const stepElements = document.querySelectorAll('.scenario-step');
    const conclusion = document.getElementById('scenarioConclusion');

    // Reveal current step content before moving forward
    if (direction > 0) {
        const currentStepEl = stepElements[currentScenarioStep];
        currentStepEl.classList.add('revealed');

        // Show SPL
        const splBtn = currentStepEl.querySelector('.spl-reveal-btn');
        if (splBtn) splBtn.classList.add('revealed');
        const splHidden = currentStepEl.querySelector('.spl-hidden');
        if (splHidden) splHidden.style.display = 'block';
    }

    // Update step
    currentScenarioStep = Math.max(0, Math.min(steps.length - 1, currentScenarioStep + direction));

    // Update UI
    stepElements.forEach((el, index) => {
        el.classList.remove('current');
        if (index === currentScenarioStep) {
            el.classList.add('current');
        }
    });

    // Update nav
    document.getElementById('currentStepNum').textContent = currentScenarioStep + 1;
    document.getElementById('scenarioPrev').disabled = currentScenarioStep === 0;

    const nextBtn = document.getElementById('scenarioNext');
    if (currentScenarioStep === steps.length - 1 && stepElements[currentScenarioStep].classList.contains('revealed')) {
        nextBtn.textContent = 'Complete';
        nextBtn.addEventListener('click', () => {
            conclusion.classList.remove('hidden');
            nextBtn.disabled = true;
        }, { once: true });
    } else {
        nextBtn.textContent = 'Reveal & Continue';
    }

    // Scroll step into view
    stepElements[currentScenarioStep].scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ============================================
// Challenge Rendering
// ============================================

function renderChallengeContent(content) {
    const problemHtml = `
        <div class="challenge-problem">
            <h3>Challenge</h3>
            <p>${content.problem}</p>
        </div>
    `;

    const hintsHtml = `
        <div class="challenge-hints">
            <h4>Hints (click to reveal)</h4>
            ${content.hints.map((hint, index) => `
                <div class="challenge-hint" data-hint="${index}">
                    <span class="challenge-hint-number">${index + 1}</span>
                    <span class="challenge-hint-text">${hint}</span>
                </div>
            `).join('')}
        </div>
    `;

    const solutionHtml = `
        <div class="challenge-solution">
            <div class="challenge-solution-header">
                <h4>Solution</h4>
                <button class="show-solution-btn" id="showSolutionBtn">Show Solution</button>
            </div>
            <div class="challenge-solution-content" id="challengeSolutionContent">
                ${renderSplBlock(content.solution.spl, content.solution.explanation)}
                ${content.variations ? renderVariations(content.variations) : ''}
            </div>
        </div>
    `;

    return problemHtml + hintsHtml + solutionHtml;
}

function renderVariations(variations) {
    return `
        <div class="challenge-variations">
            <h4>Try These Variations</h4>
            ${variations.map(v => `
                <div class="challenge-variation">
                    <p class="challenge-variation-desc">${v.description}</p>
                    ${renderSplBlock(v.spl, null)}
                </div>
            `).join('')}
        </div>
    `;
}

function initChallengeInteractivity() {
    // Hint clicks
    document.querySelectorAll('.challenge-hint').forEach(hint => {
        hint.addEventListener('click', () => {
            hint.classList.add('revealed');
        });
    });

    // Show solution
    const showBtn = document.getElementById('showSolutionBtn');
    const solutionContent = document.getElementById('challengeSolutionContent');

    if (showBtn && solutionContent) {
        showBtn.addEventListener('click', () => {
            solutionContent.classList.add('visible');
            showBtn.style.display = 'none';
        });
    }
}

// ============================================
// SPL Block Rendering
// ============================================

function renderSplBlock(spl, explanation) {
    const highlightedSpl = highlightSpl(spl);

    return `
        <div class="training-spl-block">
            <div class="training-spl-header">
                <span class="training-spl-label">SPL Query</span>
                <button class="training-spl-copy">Copy</button>
            </div>
            <pre class="training-spl-code">${highlightedSpl}</pre>
            ${explanation ? `<div class="training-spl-explanation">${explanation}</div>` : ''}
        </div>
    `;
}

function highlightSpl(spl) {
    if (!spl) return '';

    // Escape HTML first
    let highlighted = spl.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Use placeholders to avoid regex conflicts between replacements
    const placeholders = [];
    const addPlaceholder = (text, className) => {
        const id = `__SPL_${placeholders.length}__`;
        placeholders.push({ id, text, className });
        return id;
    };

    // Strings (quoted) - do first to protect quoted content
    highlighted = highlighted.replace(/"([^"]+)"/g, (match, content) => {
        return addPlaceholder(`"${content}"`, 'spl-string');
    });

    // Keywords (commands)
    const keywords = ['index', 'search', 'where', 'stats', 'eval', 'table', 'sort', 'head', 'tail',
                      'rex', 'rename', 'fields', 'lookup', 'join', 'append', 'appendcols', 'timechart',
                      'chart', 'transaction', 'eventstats', 'streamstats', 'bin', 'bucket', 'dedup',
                      'tstats', 'map', 'return', 'format', 'subsearch', 'iplocation', 'inputlookup',
                      'outputlookup', 'fillnull', 'makemv', 'mvexpand', 'earliest', 'latest', 'span'];

    keywords.forEach(kw => {
        const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
        highlighted = highlighted.replace(regex, (match) => addPlaceholder(match, 'spl-keyword'));
    });

    // Functions
    const functions = ['count', 'sum', 'avg', 'min', 'max', 'dc', 'values', 'list', 'first', 'last',
                       'stdev', 'perc\\d+', 'if', 'case', 'match', 'isnull', 'isnotnull', 'coalesce',
                       'round', 'floor', 'ceil', 'len', 'substr', 'replace', 'split', 'mvcount',
                       'strftime', 'strptime', 'now', 'relative_time', 'tonumber', 'tostring'];

    functions.forEach(fn => {
        const regex = new RegExp(`\\b(${fn})\\(`, 'gi');
        highlighted = highlighted.replace(regex, (match, fn) => addPlaceholder(fn, 'spl-function') + '(');
    });

    // Operators
    highlighted = highlighted.replace(/(\|)/g, (match) => addPlaceholder(match, 'spl-operator'));
    highlighted = highlighted.replace(/\b(AND|OR|NOT|AS|BY|IN)\b/gi, (match) => addPlaceholder(match, 'spl-operator'));

    // Replace all placeholders with actual spans
    placeholders.forEach(({ id, text, className }) => {
        highlighted = highlighted.replace(id, `<span class="${className}">${text}</span>`);
    });

    return highlighted;
}

// ============================================
// Utility Functions
// ============================================

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}
