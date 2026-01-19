/**
 * SPLUNKed - How-To Guides Data and Logic
 * Practical beginner guides for getting things done in Splunk
 */

// ============================================
// Guides Data
// ============================================

const GUIDES_DATA = {
    basics: [
        {
            id: 'search-time-range',
            title: 'How to search a specific time range',
            description: 'Find events from the last hour, a specific day, or any custom time window.',
            keywords: 'time range earliest latest timerange date hour day week',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to find events from a specific time period - maybe the last hour, yesterday, or a particular window when something happened.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">The Quick Way (Time Picker)</div>
                    <div class="guide-detail-section">
                        <p>The easiest way is using Splunk's time picker dropdown (top right of the search bar). Select presets like "Last 15 minutes" or "Last 24 hours".</p>
                        <p>But sometimes you need more control - that's when you use time modifiers in your search.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using Time Modifiers</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Last N minutes/hours/days</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main earliest=-1h</code></pre>
                        </div>
                        <p class="guide-explanation">Events from the last 1 hour. Use <code>-15m</code> for 15 minutes, <code>-7d</code> for 7 days, <code>-1w</code> for 1 week.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Specific time window</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main earliest=-24h latest=-1h</code></pre>
                        </div>
                        <p class="guide-explanation">Events from 24 hours ago up until 1 hour ago. Useful for excluding recent events.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Specific date/time</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main earliest="01/15/2024:09:00:00" latest="01/15/2024:17:00:00"</code></pre>
                        </div>
                        <p class="guide-explanation">Events from 9 AM to 5 PM on January 15, 2024.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Snap to time boundaries</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main earliest=-1d@d latest=@d</code></pre>
                        </div>
                        <p class="guide-explanation">Yesterday (midnight to midnight). The <code>@d</code> "snaps" to the start of the day.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Common Time Shortcuts</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><code>-1h</code> = 1 hour ago</li>
                            <li><code>-30m</code> = 30 minutes ago</li>
                            <li><code>-7d</code> = 7 days ago</li>
                            <li><code>-1w</code> = 1 week ago</li>
                            <li><code>-1mon</code> = 1 month ago</li>
                            <li><code>@d</code> = start of today</li>
                            <li><code>@h</code> = start of current hour</li>
                            <li><code>@w0</code> = start of this week (Sunday)</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Always start with the smallest time range that makes sense. Searching "All Time" on a busy index can take forever and time out. Start with 15 minutes, then expand if needed.</p>
                </div>
            `
        },
        {
            id: 'search-specific-value',
            title: 'How to search for a specific user, IP, or value',
            description: 'Find all events containing a specific username, IP address, hostname, or any other value.',
            keywords: 'user username ip address hostname search find specific value field',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You have a specific value - a username, IP address, hostname, or error message - and you want to find all events that contain it.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Basic Search</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Just type it</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main jsmith</code></pre>
                        </div>
                        <p class="guide-explanation">Finds any event containing "jsmith" anywhere in the raw text. Simple but may find false matches.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Search a specific field</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main user=jsmith</code></pre>
                        </div>
                        <p class="guide-explanation">Finds events where the <code>user</code> field equals "jsmith". More precise.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Search for an IP</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main src_ip=192.168.1.100</code></pre>
                        </div>
                        <p class="guide-explanation">Events from a specific source IP. Use <code>dest_ip</code> for destination.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Combine Multiple Values</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">AND - both must match</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main user=jsmith action=login</code></pre>
                        </div>
                        <p class="guide-explanation">Events where user is jsmith AND action is login. Putting terms next to each other implies AND.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">OR - either can match</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main user=jsmith OR user=admin</code></pre>
                        </div>
                        <p class="guide-explanation">Events for jsmith OR admin. Note: OR must be uppercase.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">NOT - exclude matches</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main user=jsmith NOT action=logout</code></pre>
                        </div>
                        <p class="guide-explanation">Events for jsmith, excluding logouts.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Finding the Right Field Name</div>
                    <div class="guide-detail-section">
                        <p>Not sure what field to use? Run a simple search and look at the "Fields" sidebar on the left. Click a field to see its values. Common fields:</p>
                        <ul>
                            <li><code>user</code>, <code>username</code>, <code>account_name</code> - User identifiers</li>
                            <li><code>src_ip</code>, <code>src</code>, <code>source_ip</code> - Source addresses</li>
                            <li><code>dest_ip</code>, <code>dest</code>, <code>destination_ip</code> - Destination addresses</li>
                            <li><code>host</code> - The system that generated the log</li>
                            <li><code>action</code>, <code>status</code> - What happened</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Use quotes for values with spaces or special characters: <code>user="John Smith"</code> or <code>message="error: connection failed"</code></p>
                </div>
            `
        },
        {
            id: 'search-wildcards',
            title: 'How to use wildcards to find partial matches',
            description: 'Find events when you only know part of a value, like "admin*" or "*failed*".',
            keywords: 'wildcard asterisk star partial match pattern',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to find events but you only know part of the value. Maybe you're looking for any user starting with "admin" or any error containing "timeout".</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using the Asterisk (*)</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Starts with</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main user=admin*</code></pre>
                        </div>
                        <p class="guide-explanation">Matches admin, administrator, admin_backup, admin123, etc.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Ends with</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main host=*-prod</code></pre>
                        </div>
                        <p class="guide-explanation">Matches web-prod, db-prod, app-prod, etc.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Contains</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main *timeout*</code></pre>
                        </div>
                        <p class="guide-explanation">Matches any event containing "timeout" anywhere.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Multiple wildcards</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main src_ip=192.168.1.*</code></pre>
                        </div>
                        <p class="guide-explanation">Matches any IP in the 192.168.1.x subnet.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Common Patterns</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><code>user=svc_*</code> - All service accounts (if they start with svc_)</li>
                            <li><code>host=*dc*</code> - All domain controllers (if "dc" is in hostname)</li>
                            <li><code>sourcetype=*:security</code> - All security-related sourcetypes</li>
                            <li><code>*error* OR *fail*</code> - Any error or failure message</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Performance Warning</div>
                    <p><strong>Leading wildcards are slow.</strong> Searching <code>*something</code> is much slower than <code>something*</code> because Splunk can't use its index efficiently.</p>
                    <p>If possible, restructure your search to avoid leading wildcards, or accept that it will take longer.</p>
                </div>
            `
        },
        {
            id: 'search-index-sourcetype',
            title: 'How to search the right data (index and sourcetype)',
            description: 'Understand where your data lives and how to search the correct logs.',
            keywords: 'index sourcetype data source logs where find',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You need to search the right data. Splunk organizes data into <strong>indexes</strong> (like folders) and <strong>sourcetypes</strong> (like file formats). Knowing these helps you search faster and find the right logs.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Index = Where Data Lives</div>
                    <div class="guide-detail-section">
                        <p>An index is like a bucket that holds related data. Common setups:</p>
                        <ul>
                            <li><code>index=main</code> - Often the default catch-all</li>
                            <li><code>index=security</code> - Security-related logs</li>
                            <li><code>index=network</code> - Firewall, DNS, proxy logs</li>
                            <li><code>index=windows</code> - Windows event logs</li>
                        </ul>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=jsmith</code></pre>
                        </div>
                        <p class="guide-explanation">Search for jsmith only in security logs.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Sourcetype = Type of Log</div>
                    <div class="guide-detail-section">
                        <p>Sourcetype identifies what kind of log it is, which determines how it's parsed:</p>
                        <ul>
                            <li><code>sourcetype=WinEventLog:Security</code> - Windows Security events</li>
                            <li><code>sourcetype=syslog</code> - Standard syslog format</li>
                            <li><code>sourcetype=pan:traffic</code> - Palo Alto firewall traffic</li>
                            <li><code>sourcetype=aws:cloudtrail</code> - AWS CloudTrail logs</li>
                        </ul>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=windows sourcetype=WinEventLog:Security EventCode=4625</code></pre>
                        </div>
                        <p class="guide-explanation">Failed logon events from Windows Security logs.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">How to Find Available Indexes</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| eventcount summarize=false index=* | table index count</code></pre>
                        </div>
                        <p class="guide-explanation">Lists all indexes you have access to and their event counts.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">How to Find Sourcetypes</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | stats count by sourcetype</code></pre>
                        </div>
                        <p class="guide-explanation">Shows all sourcetypes in the security index.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p><strong>Always specify an index.</strong> Searching <code>index=*</code> or omitting the index searches everything, which is slow and may hit data you don't need. Ask your Splunk admin which indexes contain the data you need.</p>
                </div>
            `
        }
    ],

    summarizing: [
        {
            id: 'count-events',
            title: 'How to count events',
            description: 'Get a simple count of how many events match your search.',
            keywords: 'count total number how many events',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to know "how many?" - how many login failures, how many errors, how many events from a host.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Basic Count</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Total count</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure | stats count</code></pre>
                        </div>
                        <p class="guide-explanation">Returns a single number: total failed actions.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Count by Category</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Count per user</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure | stats count by user</code></pre>
                        </div>
                        <p class="guide-explanation">Shows how many failures each user had.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Count per source IP</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure | stats count by src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Shows failures grouped by source IP.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Count by multiple fields</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | stats count by user, action</code></pre>
                        </div>
                        <p class="guide-explanation">Shows count for each combination of user and action.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Sorting Results</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure | stats count by user | sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Sort by count descending (highest first). Remove the <code>-</code> for ascending.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Give It a Better Name</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure | stats count as failures by user</code></pre>
                        </div>
                        <p class="guide-explanation">Names the column "failures" instead of "count".</p>
                    </div>
                </div>
            `
        },
        {
            id: 'find-top-values',
            title: 'How to find the most common values',
            description: 'See the top users, IPs, errors, or any field values by frequency.',
            keywords: 'top most common frequent values top 10 popular',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to see which values appear most often - the top talkers, most active users, most common errors.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using top</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Top 10 users</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | top user</code></pre>
                        </div>
                        <p class="guide-explanation">Shows the 10 most common users with count and percentage.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Top 20 source IPs</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network | top limit=20 src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Shows top 20 instead of default 10.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Top combinations</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | top user, action</code></pre>
                        </div>
                        <p class="guide-explanation">Most common user + action pairs.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Finding Rare Values</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | rare user</code></pre>
                        </div>
                        <p class="guide-explanation">Shows the LEAST common values - useful for finding anomalies.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Count Without Percentages</div>
                    <div class="guide-detail-section">
                        <p>If you just want counts without the percentage columns:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | top user | fields user count</code></pre>
                        </div>
                        <p class="guide-explanation">Removes the percent column, keeping just user and count.</p>
                    </div>
                </div>

                <div class="guide-callout note">
                    <div class="guide-callout-title">top vs stats count</div>
                    <p>Both can show counts by field:</p>
                    <ul>
                        <li><code>top user</code> - Quick, includes percentage, limited to top N</li>
                        <li><code>stats count by user | sort -count</code> - More flexible, shows all values</li>
                    </ul>
                    <p>Use <code>top</code> for a quick look, <code>stats</code> when you need more control.</p>
                </div>
            `
        },
        {
            id: 'count-unique',
            title: 'How to count unique values',
            description: 'Find how many different users, IPs, or hosts appear in your results.',
            keywords: 'unique distinct count dc different values how many unique',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to know how many <em>different</em> values exist - how many unique users logged in, how many distinct IPs connected, how many different hosts are affected.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Distinct Count (dc)</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Count unique users</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | stats dc(user) as unique_users</code></pre>
                        </div>
                        <p class="guide-explanation">Returns the number of different users in the results.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Unique IPs per host</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network | stats dc(src_ip) as unique_sources by dest_host</code></pre>
                        </div>
                        <p class="guide-explanation">How many different IPs connected to each destination host.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Combine with Regular Count</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | stats count, dc(user) as unique_users by src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">For each source IP: total events AND number of different users. Useful for detecting password spraying (many users from one IP).</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">See the Actual Values</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">List unique values</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | stats values(user) as users by src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Shows the actual user names, not just the count.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Both count and values</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | stats dc(user) as user_count, values(user) as users by src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Shows both the count and the actual values.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p><code>dc()</code> stands for "distinct count". It's one of the most useful stats functions for security analysis - finding one IP hitting many users, one user accessing many systems, etc.</p>
                </div>
            `
        },
        {
            id: 'count-over-time',
            title: 'How to see activity over time',
            description: 'Create a timeline showing how event counts change hour by hour or day by day.',
            keywords: 'timeline time series over time timechart hourly daily trend',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to see how activity changes over time - is there a spike at 3 AM? Did errors increase yesterday? What's the trend?</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using timechart</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Events per hour</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | timechart span=1h count</code></pre>
                        </div>
                        <p class="guide-explanation">Shows event count for each hour. Displays as a line chart.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Events per day</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | timechart span=1d count</code></pre>
                        </div>
                        <p class="guide-explanation">Daily counts - good for weekly patterns.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Split by field</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | timechart span=1h count by action</code></pre>
                        </div>
                        <p class="guide-explanation">Shows a line for each action type (success, failure, etc).</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Common Time Spans</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><code>span=1m</code> - Per minute (for real-time or short windows)</li>
                            <li><code>span=5m</code> - Every 5 minutes</li>
                            <li><code>span=1h</code> - Hourly (most common)</li>
                            <li><code>span=1d</code> - Daily</li>
                            <li><code>span=1w</code> - Weekly</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Spot Anomalies</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure
| timechart span=1h count
| where count > 100</code></pre>
                        </div>
                        <p class="guide-explanation">Find hours with more than 100 failures.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Match your span to your time range. If you're searching 7 days, <code>span=1h</code> gives 168 data points - plenty for a chart. Searching 1 hour? Use <code>span=1m</code> for detail.</p>
                </div>
            `
        }
    ],

    security: [
        {
            id: 'investigate-user',
            title: 'How to see what a user did',
            description: 'Build a timeline of all activity for a specific user account.',
            keywords: 'user activity timeline what did user do investigate account',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You have a username and need to understand what that account did - logins, file access, commands run, systems accessed.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Start Broad</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Find all events for the user</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=* user=jsmith earliest=-24h</code></pre>
                        </div>
                        <p class="guide-explanation">Everything mentioning jsmith in the last 24 hours, across all indexes.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">See what data sources have activity</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=* user=jsmith | stats count by index, sourcetype</code></pre>
                        </div>
                        <p class="guide-explanation">Shows where this user appears - helps you focus your search.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Build a Timeline</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=* user=jsmith
| table _time, sourcetype, action, src_ip, dest, _raw
| sort _time</code></pre>
                        </div>
                        <p class="guide-explanation">Chronological list of activity with key fields.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Focus Areas</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Authentication activity</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=jsmith (action=login OR action=logout OR action=failure)
| table _time, action, src_ip, dest, result</code></pre>
                        </div>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Systems accessed</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=* user=jsmith | stats count, earliest(_time) as first, latest(_time) as last by dest</code></pre>
                        </div>
                        <p class="guide-explanation">Which systems did this user touch, when first and last?</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Source locations</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=* user=jsmith | stats count by src_ip | iplocation src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Where did logins come from? Add geographic context.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Users might appear under different field names (<code>user</code>, <code>username</code>, <code>account_name</code>, <code>src_user</code>). Search broadly first: <code>jsmith</code> without specifying a field.</p>
                </div>
            `
        },
        {
            id: 'investigate-ip',
            title: 'How to track activity from an IP address',
            description: 'See everything an IP address did - connections, logins, requests.',
            keywords: 'ip address activity track investigate source destination connections',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You have a suspicious IP address and need to understand what it did - what systems it connected to, what accounts it tried to use, what it transferred.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Find All Activity</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=* 192.168.1.100 earliest=-24h</code></pre>
                        </div>
                        <p class="guide-explanation">Everything mentioning this IP anywhere. Broad but effective starting point.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">See data sources</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=* 192.168.1.100 | stats count by index, sourcetype</code></pre>
                        </div>
                        <p class="guide-explanation">Which logs contain this IP?</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">As Source (Outbound)</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">What did this IP connect to?</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network src_ip=192.168.1.100
| stats count by dest_ip, dest_port
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Destinations and ports this IP connected to.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">What accounts did it use?</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security src_ip=192.168.1.100
| stats count by user, action</code></pre>
                        </div>
                        <p class="guide-explanation">Accounts and actions from this source.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">As Destination (Inbound)</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Who connected to this IP?</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network dest_ip=192.168.1.100
| stats count by src_ip, dest_port
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Sources connecting to this system.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Timeline</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=* src_ip=192.168.1.100 OR dest_ip=192.168.1.100
| timechart span=1h count by sourcetype</code></pre>
                        </div>
                        <p class="guide-explanation">Activity over time, split by log type.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>IPs can appear in many fields: <code>src_ip</code>, <code>dest_ip</code>, <code>src</code>, <code>dest</code>, <code>client_ip</code>, etc. Start with a raw search for the IP to catch all variations.</p>
                </div>
            `
        },
        {
            id: 'find-failed-logins',
            title: 'How to find failed login attempts',
            description: 'Identify failed authentication attempts and who/where they came from.',
            keywords: 'failed login authentication failure password attempt locked',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to find authentication failures - failed passwords, locked accounts, rejected logins. This helps identify attacks or user issues.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Windows Authentication Failures</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Failed logons (Event 4625)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=windows sourcetype=WinEventLog:Security EventCode=4625
| table _time, user, src_ip, Failure_Reason</code></pre>
                        </div>
                        <p class="guide-explanation">Windows failed login events with reason.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Account lockouts (Event 4740)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=windows sourcetype=WinEventLog:Security EventCode=4740
| table _time, user, ComputerName</code></pre>
                        </div>
                        <p class="guide-explanation">Accounts that got locked out.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Generic Authentication Logs</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security (action=failure OR status=failed OR result=fail*)
| stats count by user, src_ip
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Works across many log types that use common field names.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Find Patterns</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Failures by source IP</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure
| stats count, dc(user) as users_targeted by src_ip
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">IPs with most failures. High user count = possible spray attack.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Failures by user</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure
| stats count, dc(src_ip) as source_ips by user
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Users with most failures. Many IPs = possible credential stuffing.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Check for Success After Failure</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security (action=failure OR action=success)
| stats count(eval(action="failure")) as failures, count(eval(action="success")) as successes by user, src_ip
| where failures > 5 AND successes > 0</code></pre>
                        </div>
                        <p class="guide-explanation">Users who had failures then succeeded - possible compromised credentials.</p>
                    </div>
                </div>
            `
        },
        {
            id: 'find-brute-force',
            title: 'How to find brute force attacks',
            description: 'Detect repeated failed login attempts that indicate password guessing or credential stuffing.',
            keywords: 'brute force attack failed login password security detection',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to find patterns indicating brute force attacks - many failed logins from one source, or against one account.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Failed Logins Per Source IP</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Find sources with many failures</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure
| stats count as failures, dc(user) as targeted_users by src_ip
| where failures > 10
| sort - failures</code></pre>
                        </div>
                        <p class="guide-explanation">Sources with >10 failures. High failures + many targeted users = likely attack.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Failed Logins Per User</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Find targeted accounts</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure
| stats count as failures, dc(src_ip) as attack_sources by user
| where failures > 5
| sort - failures</code></pre>
                        </div>
                        <p class="guide-explanation">Users receiving failed logins. Multiple sources = distributed attack or credential stuffing.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Failure Spikes Over Time</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Visualize attack patterns</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure
| timechart span=5m count by src_ip limit=10</code></pre>
                        </div>
                        <p class="guide-explanation">See when attacks happen and which sources are most active. Spikes indicate active attacks.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Success After Many Failures</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Detect successful brute force</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security
| stats count(eval(action="failure")) as failures,
        count(eval(action="success")) as successes by src_ip, user
| where failures > 5 AND successes > 0
| sort - failures</code></pre>
                        </div>
                        <p class="guide-explanation">Most critical - successful login after many failures means the attack worked!</p>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Alert Priority</div>
                    <p>Many failures = investigate. Failures followed by success = respond immediately. This pattern indicates a compromised account.</p>
                </div>
            `
        },
        {
            id: 'find-impossible-travel',
            title: 'How to find impossible travel',
            description: 'Detect when a user logs in from geographically impossible locations in a short time.',
            keywords: 'impossible travel geography location login security anomaly',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to detect when a user authenticates from two locations that are too far apart to travel between in the time elapsed - a strong indicator of credential compromise.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Prerequisites</div>
                    <div class="guide-detail-section">
                        <p>This detection requires GeoIP enrichment on your authentication logs. The examples assume you have <code>City</code> or <code>Country</code> fields from iplocation.</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | iplocation src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">If not already enriched, add iplocation to get City, Country, lat, lon fields.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Find Users in Multiple Countries</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Quick check for multi-country logins</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=success
| iplocation src_ip
| stats dc(Country) as countries, values(Country) as country_list by user
| where countries > 1</code></pre>
                        </div>
                        <p class="guide-explanation">Find users logging in from multiple countries. Not always malicious, but worth investigating.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Time-Based Impossible Travel</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Detect rapid location changes</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=success
| iplocation src_ip
| sort user, _time
| streamstats current=f last(City) as prev_city, last(_time) as prev_time by user
| eval time_diff_hours = (_time - prev_time) / 3600
| where City != prev_city AND time_diff_hours < 2
| table _time, user, prev_city, City, time_diff_hours, src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Users who changed cities within 2 hours. Adjust threshold based on your geography.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Known Good Locations</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Exclude expected countries</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=success
| iplocation src_ip
| search NOT Country IN ("United States", "Canada", "United Kingdom")
| stats count, values(Country) as countries by user</code></pre>
                        </div>
                        <p class="guide-explanation">Find logins from unexpected countries. Customize the list for your organization.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Consider VPN usage - legitimate users might appear to "travel" when connecting through different VPN endpoints. Correlate with VPN logs if available.</p>
                </div>
            `
        },
        {
            id: 'privileged-account-usage',
            title: 'How to find privileged account usage',
            description: 'Monitor admin and service account activity for unauthorized use.',
            keywords: 'admin privileged account root service security monitoring',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to monitor how privileged accounts (admin, root, service accounts) are being used and detect potential misuse.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Track All Admin Activity</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Find all admin user events</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user IN (admin, administrator, root, sa)
| stats count by user, action, src_ip
| sort - count</code></pre>
                        </div>
                        <p class="guide-explanation">Overview of privileged account usage. Add your known admin accounts to the list.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Pattern-based admin detection</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security (user=*admin* OR user=svc_* OR user=srv*)
| stats count, values(action) as actions by user, src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Find accounts matching admin/service naming patterns.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Unusual Admin Behavior</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Admin logins from new sources</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=admin action=success
| stats earliest(_time) as first_seen, latest(_time) as last_seen, count by src_ip
| where first_seen > relative_time(now(), "-24h")
| convert ctime(first_seen), ctime(last_seen)</code></pre>
                        </div>
                        <p class="guide-explanation">Admin logins from IPs first seen in the last 24 hours - potential compromise.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Off-hours admin activity</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user IN (admin, administrator)
| eval hour = strftime(_time, "%H")
| where hour < 6 OR hour > 20
| stats count by user, src_ip, date_wday</code></pre>
                        </div>
                        <p class="guide-explanation">Admin activity outside business hours (adjust hours for your timezone).</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Service Account Anomalies</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Interactive service account logins</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=svc_* LogonType=2
| stats count by user, src_ip, dest
| sort - count</code></pre>
                        </div>
                        <p class="guide-explanation">Service accounts shouldn't have interactive logins (LogonType 2). This is suspicious.</p>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Alert Priority</div>
                    <p>Service accounts logging in interactively, or admin accounts from new locations are high-priority alerts. These often indicate credential theft.</p>
                </div>
            `
        },
        {
            id: 'baseline-behavior',
            title: 'How to baseline normal behavior',
            description: 'Establish what normal looks like so you can detect anomalies.',
            keywords: 'baseline normal behavior anomaly average statistics',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to understand what "normal" looks like in your environment so you can identify when something is abnormal.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Volume Baselines</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Average events per hour</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security earliest=-7d
| timechart span=1h count
| stats avg(count) as avg_hourly, stdev(count) as stdev_hourly, max(count) as peak</code></pre>
                        </div>
                        <p class="guide-explanation">Baseline event volume. Anything beyond avg + 2*stdev is unusual.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Per-user activity baseline</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security earliest=-7d
| stats count by user, date_mday
| stats avg(count) as avg_daily, stdev(count) as stdev_daily by user</code></pre>
                        </div>
                        <p class="guide-explanation">Each user's normal daily activity level. Compare current day to baseline.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Time-of-Day Patterns</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Activity by hour</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security earliest=-7d
| eval hour = strftime(_time, "%H")
| stats count by hour
| sort hour</code></pre>
                        </div>
                        <p class="guide-explanation">See when activity normally occurs. Activity outside these hours is worth investigating.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Weekend vs weekday</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security earliest=-30d
| eval is_weekend = if(date_wday="saturday" OR date_wday="sunday", "weekend", "weekday")
| stats count by is_weekend
| eval daily_avg = count / if(is_weekend="weekend", 8, 22)</code></pre>
                        </div>
                        <p class="guide-explanation">Compare weekend to weekday volume. Significant weekend activity might be suspicious.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Detect Anomalies from Baseline</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Find unusual spikes</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security
| timechart span=1h count
| eventstats avg(count) as avg_count, stdev(count) as stdev_count
| eval threshold = avg_count + (2 * stdev_count)
| where count > threshold
| eval deviation = round((count - avg_count) / stdev_count, 2)</code></pre>
                        </div>
                        <p class="guide-explanation">Hours where activity exceeds 2 standard deviations from average.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Build baselines from at least 7 days of data (30 days is better). Exclude known anomalies like holidays or maintenance windows when calculating your baseline.</p>
                </div>
            `
        }
    ],

    refining: [
        {
            id: 'filter-results',
            title: 'How to filter out noise',
            description: 'Remove unwanted events from your results using where and NOT.',
            keywords: 'filter exclude remove noise where not ignore skip',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>Your search returns too much data. You need to exclude known-good activity, service accounts, or irrelevant events to focus on what matters.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Exclude in the Search</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">NOT keyword</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure NOT user=svc_*</code></pre>
                        </div>
                        <p class="guide-explanation">Exclude service accounts (starting with svc_).</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Multiple exclusions</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security NOT (user=admin OR user=system OR user=service)</code></pre>
                        </div>
                        <p class="guide-explanation">Exclude multiple known accounts.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Exclude by source</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network NOT src_ip=10.0.0.* NOT dest_ip=10.0.0.*</code></pre>
                        </div>
                        <p class="guide-explanation">Exclude internal-only traffic.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Filter After Stats (where)</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Only high counts</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | stats count by user | where count > 100</code></pre>
                        </div>
                        <p class="guide-explanation">Only show users with more than 100 events.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Exclude specific values</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | stats count by user | where user!="admin"</code></pre>
                        </div>
                        <p class="guide-explanation">Remove admin from results after counting.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Pattern matching</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | stats count by user | where NOT like(user, "svc_%")</code></pre>
                        </div>
                        <p class="guide-explanation">Exclude service accounts using pattern match.</p>
                    </div>
                </div>

                <div class="guide-callout note">
                    <div class="guide-callout-title">NOT vs where</div>
                    <ul>
                        <li><strong>NOT</strong> - Filters raw events BEFORE processing. Faster. Use when possible.</li>
                        <li><strong>where</strong> - Filters AFTER commands like stats. Use for calculated values.</li>
                    </ul>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Build a list of your environment's "known good" - service accounts, monitoring systems, scanner IPs. Create a lookup table to exclude them easily across all searches.</p>
                </div>
            `
        },
        {
            id: 'remove-duplicates',
            title: 'How to remove duplicate events',
            description: 'Keep only unique events when you have repeated entries.',
            keywords: 'duplicate dedup unique remove repeated same',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>Your search shows the same event multiple times, or you only want to see each unique value once instead of every occurrence.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using dedup</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">One event per user</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | dedup user</code></pre>
                        </div>
                        <p class="guide-explanation">Keeps only the first event for each unique user.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">One event per user+IP combo</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | dedup user, src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">One event per unique combination of user and IP.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Keep more than one</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | dedup 3 user</code></pre>
                        </div>
                        <p class="guide-explanation">Keep up to 3 events per user instead of just 1.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Dedup with Sorting</div>
                    <div class="guide-detail-section">
                        <p>Dedup keeps the FIRST match. To keep the most recent:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | sort -_time | dedup user</code></pre>
                        </div>
                        <p class="guide-explanation">Sort newest first, then dedup - keeps most recent per user.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">When to Use What</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><code>dedup</code> - When you want to see actual events, just fewer of them</li>
                            <li><code>stats dc()</code> - When you just need a count of unique values</li>
                            <li><code>stats values()</code> - When you want a list of unique values</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Example: Unique Users Per System</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=login
| dedup user, dest
| stats count by dest
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Count of unique users per destination system.</p>
                    </div>
                </div>
            `
        },
        {
            id: 'choose-fields',
            title: 'How to show only the fields you need',
            description: 'Clean up your output to show just the relevant columns.',
            keywords: 'fields table columns output show hide select',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>Your results have too many columns, or you want to display data in a clean, readable format with just the fields that matter.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using table</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Select specific fields</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | table _time, user, src_ip, action</code></pre>
                        </div>
                        <p class="guide-explanation">Shows only these four columns in this order.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Include raw event</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | table _time, user, _raw</code></pre>
                        </div>
                        <p class="guide-explanation">Shows time, user, and the full raw event text.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using fields</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Keep only certain fields</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | fields _time, user, src_ip, action</code></pre>
                        </div>
                        <p class="guide-explanation">Similar to table but keeps event structure for further processing.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Remove specific fields</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | fields - _raw, _indextime, linecount</code></pre>
                        </div>
                        <p class="guide-explanation">Remove these fields, keep everything else.</p>
                    </div>
                </div>

                <div class="guide-callout note">
                    <div class="guide-callout-title">table vs fields</div>
                    <ul>
                        <li><code>table</code> - Final output. Converts to table format. Use at the END of your search.</li>
                        <li><code>fields</code> - Reduces fields but keeps events as events. Use DURING processing to improve performance.</li>
                    </ul>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Rename Columns</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | table _time, src_ip, user | rename src_ip as "Source IP", user as "Username"</code></pre>
                        </div>
                        <p class="guide-explanation">Give columns friendlier names for reports.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Add <code>| fields</code> early in long searches to remove fields you don't need. This speeds up processing, especially with <code>_raw</code> which can be large.</p>
                </div>
            `
        },
        {
            id: 'limit-results',
            title: 'How to limit the number of results',
            description: 'Show just the first N results, or the top/bottom entries.',
            keywords: 'limit head tail first last top bottom number results',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You have thousands of results but only need to see the first 10, the most recent 50, or the top 5 by count.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">First N Results (head)</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | head 10</code></pre>
                        </div>
                        <p class="guide-explanation">Returns only the first 10 events.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | sort -_time | head 20</code></pre>
                        </div>
                        <p class="guide-explanation">Most recent 20 events (sort by time descending first).</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Last N Results (tail)</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | tail 10</code></pre>
                        </div>
                        <p class="guide-explanation">Returns the last 10 events (oldest if not sorted).</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Top N After Stats</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | stats count by user | sort -count | head 10</code></pre>
                        </div>
                        <p class="guide-explanation">Top 10 users by event count.</p>
                    </div>
                    <div class="guide-detail-section">
                        <p>Or use the built-in <code>top</code> command:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | top limit=10 user</code></pre>
                        </div>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Limit at Search Time</div>
                    <div class="guide-detail-section">
                        <p>For faster results when you just need a sample:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security | head 100 | stats count by action</code></pre>
                        </div>
                        <p class="guide-explanation">Stats on just the first 100 events - fast way to explore data structure.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Use <code>head 1000</code> during development to test your search quickly. Remove it when you're ready for full results. Just remember that stats on limited data may not be representative!</p>
                </div>
            `
        },
        {
            id: 'boolean-logic',
            title: 'How to use AND, OR, NOT',
            description: 'Combine search conditions with boolean logic to find exactly what you need.',
            keywords: 'and or not boolean logic combine conditions filter',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to combine multiple conditions - find events that match this AND that, this OR that, or everything EXCEPT something.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">AND - All Conditions Must Match</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Implicit AND (just use spaces)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=admin action=failure</code></pre>
                        </div>
                        <p class="guide-explanation">Finds events where user is admin AND action is failure. Spaces between conditions mean AND.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Explicit AND</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=admin AND action=failure</code></pre>
                        </div>
                        <p class="guide-explanation">Same result. Explicit AND is optional but can improve readability.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">OR - Any Condition Can Match</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Match any of several values</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security (user=admin OR user=root OR user=system)</code></pre>
                        </div>
                        <p class="guide-explanation">Finds events where user is admin OR root OR system. Use parentheses to group OR conditions.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">IN operator (cleaner syntax)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user IN (admin, root, system)</code></pre>
                        </div>
                        <p class="guide-explanation">Same result, cleaner syntax. Best when checking one field against multiple values.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">NOT - Exclude Matches</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Exclude specific values</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security NOT user=serviceaccount</code></pre>
                        </div>
                        <p class="guide-explanation">All events EXCEPT those where user is serviceaccount.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Using != (not equal)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user!=serviceaccount action!=success</code></pre>
                        </div>
                        <p class="guide-explanation">User is not serviceaccount AND action is not success.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Combining Them</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Complex conditions</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security (action=failure OR action=error) user!=serviceaccount earliest=-1h</code></pre>
                        </div>
                        <p class="guide-explanation">Failed or error events, excluding service accounts, from last hour. Parentheses control grouping.</p>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Watch Out</div>
                    <p>OR without parentheses can give unexpected results. <code>user=admin OR user=root action=failure</code> means "admin OR (root AND failure)" - probably not what you wanted!</p>
                </div>
            `
        },
        {
            id: 'eval-basics',
            title: 'How to create calculated fields',
            description: 'Use eval to create new fields, do math, or transform values.',
            keywords: 'eval calculate field create math transform convert',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to create a new field based on existing data - calculate a value, convert units, combine fields, or apply conditional logic.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Basic Calculations</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Convert bytes to megabytes</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | eval size_mb = bytes / 1024 / 1024</code></pre>
                        </div>
                        <p class="guide-explanation">Creates a new field <code>size_mb</code> from the existing <code>bytes</code> field.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Calculate duration</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | eval duration_mins = (end_time - start_time) / 60</code></pre>
                        </div>
                        <p class="guide-explanation">Subtract times and convert seconds to minutes.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Conditional Logic</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">If-then-else</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | eval status = if(code >= 400, "error", "ok")</code></pre>
                        </div>
                        <p class="guide-explanation">If code is 400 or higher, status is "error", otherwise "ok".</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Multiple conditions (case)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | eval severity = case(
    code >= 500, "critical",
    code >= 400, "error",
    code >= 300, "warning",
    true(), "ok"
)</code></pre>
                        </div>
                        <p class="guide-explanation">Check conditions in order, return first match. <code>true()</code> is the default/else case.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Text Manipulation</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Combine fields</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | eval full_name = first_name . " " . last_name</code></pre>
                        </div>
                        <p class="guide-explanation">Concatenate fields with <code>.</code> (dot). Creates "John Smith" from "John" and "Smith".</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Convert to lowercase</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | eval user = lower(user)</code></pre>
                        </div>
                        <p class="guide-explanation">Normalize case for consistent matching. Also: <code>upper()</code>, <code>trim()</code>.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Handle Missing Values</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Use coalesce for defaults</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | eval user = coalesce(user, src_user, "unknown")</code></pre>
                        </div>
                        <p class="guide-explanation">Use first non-null value. If user is empty, try src_user, otherwise use "unknown".</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Create multiple fields in one eval: <code>| eval size_mb = bytes/1024/1024, duration_mins = duration/60</code></p>
                </div>
            `
        },
        {
            id: 'sort-results',
            title: 'How to sort results',
            description: 'Order your results by any field - highest to lowest, alphabetically, or by time.',
            keywords: 'sort order ascending descending alphabetical top bottom',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to order your results - show the biggest first, the most recent first, or alphabetically.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Basic Sorting</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Sort descending (highest first)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | stats count by user | sort - count</code></pre>
                        </div>
                        <p class="guide-explanation">The <code>-</code> means descending. Shows users with most events first.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Sort ascending (lowest first)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | stats count by user | sort + count</code></pre>
                        </div>
                        <p class="guide-explanation">The <code>+</code> means ascending (default). Shows users with fewest events first.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Sort alphabetically</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | stats count by user | sort user</code></pre>
                        </div>
                        <p class="guide-explanation">Sort by username A-Z. Use <code>- user</code> for Z-A.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Multiple Sort Fields</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Sort by multiple columns</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | stats count by department, user | sort department, - count</code></pre>
                        </div>
                        <p class="guide-explanation">Sort by department A-Z first, then by count descending within each department.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Sort by Time</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Most recent first</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | sort - _time</code></pre>
                        </div>
                        <p class="guide-explanation">Show newest events first. This is usually the default for raw events.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Oldest first</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | sort + _time</code></pre>
                        </div>
                        <p class="guide-explanation">Show oldest events first. Useful for timeline analysis.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Limit After Sorting</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Get top 10</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | stats sum(bytes) as total by user | sort - total | head 10</code></pre>
                        </div>
                        <p class="guide-explanation">Top 10 users by bytes transferred.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Use <code>sort 0</code> to sort ALL results (removes default 10,000 limit), or <code>sort 100</code> to only return the first 100 after sorting.</p>
                </div>
            `
        },
        {
            id: 'compare-values',
            title: 'How to compare values',
            description: 'Filter events using greater than, less than, equals, and other comparisons.',
            keywords: 'compare greater less than equal threshold filter where',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to find events where a value is above a threshold, below a limit, or within a range.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using WHERE for Comparisons</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Greater than / Less than</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | where bytes > 1000000</code></pre>
                        </div>
                        <p class="guide-explanation">Events where bytes is greater than 1MB. Also: <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code></p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Equals (exact match)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | where status = 200</code></pre>
                        </div>
                        <p class="guide-explanation">Numeric comparison with single <code>=</code> or <code>==</code> in where.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Not equals</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | where status != 200</code></pre>
                        </div>
                        <p class="guide-explanation">All events where status is anything except 200.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Range Checks</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Between two values</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | where bytes >= 1000 AND bytes <= 10000</code></pre>
                        </div>
                        <p class="guide-explanation">Events where bytes is between 1KB and 10KB (inclusive).</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Outside a range</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | where response_time < 100 OR response_time > 5000</code></pre>
                        </div>
                        <p class="guide-explanation">Very fast OR very slow responses (outliers).</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Comparing After Aggregation</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Filter aggregated results</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | stats count by user | where count > 100</code></pre>
                        </div>
                        <p class="guide-explanation">Find users with more than 100 events.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Compare averages to threshold</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | stats avg(response_time) as avg_time by endpoint | where avg_time > 1000</code></pre>
                        </div>
                        <p class="guide-explanation">Find endpoints with average response time over 1 second.</p>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Watch Out</div>
                    <p>Use <code>where</code> for numeric comparisons. The search command (field>100) sometimes works but is less reliable. <code>where</code> always evaluates numerically.</p>
                </div>
            `
        },
        {
            id: 'rename-fields',
            title: 'How to rename fields',
            description: 'Give fields clearer names for better readability in reports and dashboards.',
            keywords: 'rename field name as alias column header',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to give fields better names - more readable for reports, or consistent naming across different data sources.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using AS in Stats</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Name your aggregations</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | stats count as "Total Events", dc(user) as "Unique Users"</code></pre>
                        </div>
                        <p class="guide-explanation">Use <code>as</code> to name stats results. Quotes allow spaces in names.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Simple naming</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | stats sum(bytes) as total_bytes by src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Without quotes for simple names (no spaces).</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using the Rename Command</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Rename a single field</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | rename src_ip as "Source IP"</code></pre>
                        </div>
                        <p class="guide-explanation">Changes <code>src_ip</code> to "Source IP" for display.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Rename multiple fields</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | rename src_ip as "Source IP", dest_ip as "Destination IP", _time as "Timestamp"</code></pre>
                        </div>
                        <p class="guide-explanation">Rename several fields at once, comma-separated.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Rename with wildcards</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | rename *_ip as *_address</code></pre>
                        </div>
                        <p class="guide-explanation">Rename src_ip to src_address, dest_ip to dest_address, etc.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Practical Example</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Clean report output</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security
| stats count as "Failed Attempts", dc(src_ip) as "Unique Sources" by user
| rename user as "Username"
| sort - "Failed Attempts"</code></pre>
                        </div>
                        <p class="guide-explanation">Produces a clean, readable report with proper column headers.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Use <code>as</code> in stats when creating fields, use <code>rename</code> when cleaning up existing fields. Both work - pick what's cleaner for your search.</p>
                </div>
            `
        }
    ],

    visualizing: [
        {
            id: 'viz-trends-over-time',
            title: 'How to visualize trends over time',
            description: 'Create time-based charts showing how metrics change over hours, days, or weeks.',
            keywords: 'timechart trend time series line chart graph over time',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to see how something changes over time - like failed logins per hour, errors per day, or traffic volume over a week.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">The Key Command: timechart</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Basic time trend</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security EventCode=4625
| timechart count</code></pre>
                        </div>
                        <p class="guide-explanation">Count of failed logins over time. Splunk auto-picks the time interval (span) based on your time range.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Control the time interval</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security EventCode=4625
| timechart span=1h count</code></pre>
                        </div>
                        <p class="guide-explanation">Count per hour. Use <code>span=15m</code> for 15 minutes, <code>span=1d</code> for daily.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Split by a field (multiple lines)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security EventCode=4625
| timechart span=1h count by src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Creates a separate line for each source IP. Great for comparing patterns.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Limit the number of series</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web status>=500
| timechart span=1h count by uri limit=10 useother=false</code></pre>
                        </div>
                        <p class="guide-explanation">Top 10 URIs only. <code>useother=false</code> hides the "OTHER" bucket.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Real-World Scenarios</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Detect brute force attacks</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security EventCode=4625
| timechart span=5m count by TargetUserName
| where count > 10</code></pre>
                        </div>
                        <p class="guide-explanation">Spike in failed logins for a user in a 5-minute window = potential brute force.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Compare this week vs last week</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web status=200
| timechart span=1h count
| eval hour=strftime(_time, "%H")
| stats avg(count) as avg_requests by hour</code></pre>
                        </div>
                        <p class="guide-explanation">Average requests by hour of day - shows your traffic pattern.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Network traffic volume</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network
| timechart span=1h sum(bytes) as total_bytes
| eval total_GB=round(total_bytes/1024/1024/1024, 2)</code></pre>
                        </div>
                        <p class="guide-explanation">Total bytes transferred per hour, converted to GB.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Visualization Tips</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><strong>Line chart</strong> - Best for continuous trends over time</li>
                            <li><strong>Area chart</strong> - Good for showing volume/magnitude</li>
                            <li><strong>Column chart</strong> - Better for discrete time periods (daily counts)</li>
                        </ul>
                        <p>After running your search, click the "Visualization" tab and select your chart type.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>If your chart has too many spikes, increase the span. If it's too smooth and hides detail, decrease the span. Match the span to what you're investigating.</p>
                </div>
            `
        },
        {
            id: 'viz-compare-categories',
            title: 'How to compare categories',
            description: 'Create bar charts and column charts to compare values across different groups.',
            keywords: 'bar chart column compare categories comparison hosts users top',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to compare values across categories - like which hosts have the most errors, which users generate the most traffic, or which applications are most used.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">The Key Command: stats + by</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Count by category</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web status>=500
| stats count by host
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Count of errors per host, sorted highest first. Perfect for a bar chart.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Multiple metrics per category</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web
| stats count as requests, avg(response_time) as avg_response,
        sum(bytes) as total_bytes by host</code></pre>
                        </div>
                        <p class="guide-explanation">Multiple measurements per host. Great for grouped bar charts.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Using chart command</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=*
| chart count by action, user</code></pre>
                        </div>
                        <p class="guide-explanation">Creates a matrix - rows are actions, columns are users. Good for stacked bars.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Real-World Scenarios</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Which servers have the most errors?</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=application level=ERROR
| stats count by host
| sort -count
| head 10</code></pre>
                        </div>
                        <p class="guide-explanation">Top 10 hosts by error count. Helps prioritize troubleshooting.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: User activity comparison</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
| stats dc(url) as unique_sites, sum(bytes) as total_bytes by user
| eval total_MB=round(total_bytes/1024/1024, 2)
| sort -total_MB
| head 20</code></pre>
                        </div>
                        <p class="guide-explanation">Compare users by sites visited and bandwidth used.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Success vs failure by source</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=auth
| eval status=if(action="success", "Success", "Failed")
| chart count by src_ip, status</code></pre>
                        </div>
                        <p class="guide-explanation">Stacked bar showing success/failure ratio per source IP.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Choosing the Right Chart</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><strong>Bar chart (horizontal)</strong> - Best when category names are long</li>
                            <li><strong>Column chart (vertical)</strong> - Good for fewer categories with short names</li>
                            <li><strong>Stacked bar</strong> - Shows composition within each category</li>
                            <li><strong>Grouped bar</strong> - Compares multiple metrics side by side</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Always sort your data and limit to top N results. A bar chart with 100+ categories is unreadable. Use <code>| sort -count | head 10</code> to show just the top 10.</p>
                </div>
            `
        },
        {
            id: 'viz-top-offenders',
            title: 'How to show top offenders',
            description: 'Quickly find and display the top N values for any field.',
            keywords: 'top rare bottom highest lowest most least frequent',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to quickly identify the most common (or least common) values - top talkers, most blocked IPs, most frequent errors, etc.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">The Quick Way: top and rare</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Top values</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=blocked
| top 10 src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Top 10 most blocked source IPs. Includes count and percentage automatically.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Rare values (least common)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=endpoint process_name=*
| rare 10 process_name</code></pre>
                        </div>
                        <p class="guide-explanation">10 least common processes. Unusual processes might be suspicious.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Top with multiple fields</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=auth action=failed
| top 10 user, src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Top user/IP combinations for failed auth. Shows attack patterns.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Real-World Scenarios</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Top blocked IPs (firewall)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=blocked
| top 10 src_ip
| rename src_ip as "Blocked IP", count as "Block Count", percent as "% of Total"</code></pre>
                        </div>
                        <p class="guide-explanation">Clean table of most blocked IPs, ready for a report.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Heaviest bandwidth users</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
| stats sum(bytes) as total_bytes by user
| sort -total_bytes
| head 10
| eval total_GB=round(total_bytes/1024/1024/1024, 2)
| table user, total_GB</code></pre>
                        </div>
                        <p class="guide-explanation">Top 10 users by bandwidth, shown in GB.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Unusual user agents (threat hunting)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
| rare 20 user_agent
| where count < 5</code></pre>
                        </div>
                        <p class="guide-explanation">User agents seen fewer than 5 times. Rare agents may indicate malware.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Visualization Options</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><strong>Bar chart</strong> - Clear comparison of magnitudes</li>
                            <li><strong>Pie chart</strong> - Shows proportion of total (use sparingly, max 5-7 slices)</li>
                            <li><strong>Table</strong> - Best when exact numbers matter</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Heads Up</div>
                    <p>The <code>top</code> command only shows count and percentage. If you need other aggregations (sum, avg), use <code>stats ... | sort -field | head N</code> instead.</p>
                </div>
            `
        },
        {
            id: 'viz-single-kpi',
            title: 'How to display a single KPI value',
            description: 'Create dashboard-ready single value displays for key metrics.',
            keywords: 'single value kpi metric number count total dashboard',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to display a single important number - total alerts today, active users, error rate - prominently on a dashboard.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Creating Single Values</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Simple count</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security severity=critical
| stats count as critical_alerts</code></pre>
                        </div>
                        <p class="guide-explanation">Total count of critical alerts. Returns one row, one number.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Percentage calculation</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=auth
| stats count(eval(action="failed")) as failed, count as total
| eval failure_rate=round(failed/total*100, 1)
| fields failure_rate</code></pre>
                        </div>
                        <p class="guide-explanation">Authentication failure rate as a percentage.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">With trend indicator</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web status>=500
| stats count as current_errors
| appendcols [search index=web status>=500 earliest=-2d latest=-1d | stats count as yesterday_errors]
| eval trend=if(current_errors>yesterday_errors, "up", "down")</code></pre>
                        </div>
                        <p class="guide-explanation">Today's errors with comparison to yesterday. Single value viz can show trend arrows.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Real-World Scenarios</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Active users right now</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=auth action=login earliest=-15m
| stats dc(user) as active_users</code></pre>
                        </div>
                        <p class="guide-explanation">Distinct count of users who logged in the last 15 minutes.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: System uptime percentage</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=monitoring host=webserver01
| stats count(eval(status="up")) as up_checks, count as total_checks
| eval uptime_pct=round(up_checks/total_checks*100, 2)." %"
| fields uptime_pct</code></pre>
                        </div>
                        <p class="guide-explanation">Shows "99.95 %" - perfect for an uptime dashboard.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Average response time</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web
| stats avg(response_time) as avg_ms
| eval avg_ms=round(avg_ms, 0)." ms"</code></pre>
                        </div>
                        <p class="guide-explanation">Average response time with units - "245 ms".</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Dashboard Formatting</div>
                    <div class="guide-detail-section">
                        <p>When creating single value visualizations in dashboards:</p>
                        <ul>
                            <li>Use <strong>color ranges</strong> - green for good, yellow for warning, red for critical</li>
                            <li>Add <strong>trend indicators</strong> - show if the value is up or down vs. previous period</li>
                            <li>Include <strong>sparklines</strong> - small inline chart showing recent trend</li>
                            <li>Set <strong>unit labels</strong> - "ms", "%", "GB" make numbers meaningful</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Format numbers in your search using <code>round()</code> and concatenating units. A KPI showing "2,847,293" is hard to read - "2.85 M" is much better. Use <code>eval display=round(value/1000000, 2)." M"</code></p>
                </div>
            `
        },
        {
            id: 'viz-geographic',
            title: 'How to show geographic activity',
            description: 'Map IP addresses to locations and visualize geographic patterns.',
            keywords: 'map geo geographic location ip country city iplocation geostats',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to see where activity is coming from geographically - map attack sources, visualize user locations, or identify unusual geographic patterns.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 1: Convert IPs to Locations</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Basic IP lookup</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=blocked
| iplocation src_ip
| table src_ip, Country, City, Region, lat, lon</code></pre>
                        </div>
                        <p class="guide-explanation">Adds geographic fields to each event. Works with any IP field.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Aggregate by country</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=blocked
| iplocation src_ip
| stats count by Country
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Count of blocked connections per country.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 2: Create Map Visualization</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Cluster map with geostats</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=blocked
| iplocation src_ip
| geostats count by Country</code></pre>
                        </div>
                        <p class="guide-explanation">Creates a cluster map. Larger circles = more events from that area.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Choropleth (filled map)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=blocked
| iplocation src_ip
| stats count by Country
| geom geo_countries featureIdField=Country</code></pre>
                        </div>
                        <p class="guide-explanation">Colors countries based on count. Requires the geo_countries lookup.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Real-World Scenarios</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Where are attacks coming from?</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=blocked
| iplocation src_ip
| search Country!=United States
| geostats count by Country</code></pre>
                        </div>
                        <p class="guide-explanation">Map of foreign attack sources, excluding domestic traffic.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Impossible travel detection</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=auth action=success
| iplocation src_ip
| stats earliest(_time) as first_login, latest(_time) as last_login,
        values(Country) as countries, dc(Country) as country_count by user
| where country_count > 1</code></pre>
                        </div>
                        <p class="guide-explanation">Users logging in from multiple countries. Could indicate compromised accounts.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: VPN usage by region</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=vpn action=connect
| iplocation src_ip
| stats dc(user) as unique_users, sum(bytes) as total_bytes by Country
| sort -unique_users</code></pre>
                        </div>
                        <p class="guide-explanation">VPN connections by country - useful for capacity planning.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Available Geographic Fields</div>
                    <div class="guide-detail-section">
                        <p>After running <code>iplocation</code>, these fields are available:</p>
                        <ul>
                            <li><code>Country</code> - Country name</li>
                            <li><code>Region</code> - State/province</li>
                            <li><code>City</code> - City name</li>
                            <li><code>lat</code> - Latitude</li>
                            <li><code>lon</code> - Longitude</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Heads Up</div>
                    <p>IP geolocation isn't 100% accurate, especially for VPNs, proxies, and mobile IPs. It's useful for broad patterns but don't rely on it for precise location.</p>
                </div>
            `
        },
        {
            id: 'viz-distribution',
            title: 'How to visualize distribution',
            description: 'Show how values are spread using histograms and percentiles.',
            keywords: 'histogram distribution percentile spread range bin bucket',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to understand the spread of values - are response times mostly fast with some outliers? What's the typical file size? Is the data clustered or evenly distributed?</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Creating Histograms</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Basic histogram with bin</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web
| bin response_time span=100
| stats count by response_time</code></pre>
                        </div>
                        <p class="guide-explanation">Groups response times into 100ms buckets. Shows distribution shape.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Auto-binning</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web
| bin response_time bins=20
| stats count by response_time</code></pre>
                        </div>
                        <p class="guide-explanation">Splunk auto-picks bucket size to create 20 bins.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Log-scale buckets (for wide ranges)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
| eval size_bucket=case(
    bytes<1024, "<1KB",
    bytes<10240, "1-10KB",
    bytes<102400, "10-100KB",
    bytes<1048576, "100KB-1MB",
    bytes<10485760, "1-10MB",
    true(), ">10MB")
| stats count by size_bucket</code></pre>
                        </div>
                        <p class="guide-explanation">Custom buckets for file sizes that span many orders of magnitude.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Percentile Analysis</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Key percentiles</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web
| stats min(response_time) as min,
        perc50(response_time) as median,
        perc90(response_time) as p90,
        perc99(response_time) as p99,
        max(response_time) as max</code></pre>
                        </div>
                        <p class="guide-explanation">Shows the full distribution: minimum, median, 90th and 99th percentile, and maximum.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Percentiles by category</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web
| stats perc50(response_time) as median,
        perc95(response_time) as p95 by uri
| sort -p95</code></pre>
                        </div>
                        <p class="guide-explanation">Find which endpoints have the worst 95th percentile response times.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Real-World Scenarios</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Response time SLA compliance</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web
| stats count(eval(response_time<500)) as under_sla, count as total
| eval compliance_pct=round(under_sla/total*100, 1)</code></pre>
                        </div>
                        <p class="guide-explanation">Percentage of requests meeting 500ms SLA.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Identify outliers</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web
| eventstats perc99(response_time) as p99
| where response_time > p99
| table _time, uri, response_time</code></pre>
                        </div>
                        <p class="guide-explanation">Find the worst 1% of response times - the true outliers.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Data transfer size patterns</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
| bin bytes span=1048576
| stats count by bytes
| eval size_MB=bytes/1048576
| table size_MB, count</code></pre>
                        </div>
                        <p class="guide-explanation">Distribution of file download sizes in 1MB buckets.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>When analyzing performance data, focus on percentiles over averages. An average of 200ms doesn't tell you that 1% of users experience 5 second delays. P99 does.</p>
                </div>
            `
        },
        {
            id: 'viz-before-after',
            title: 'How to create before/after comparisons',
            description: 'Compare metrics between two time periods to show change impact.',
            keywords: 'compare before after change impact difference delta trend',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to compare two time periods - did the firewall change reduce traffic? Are errors up after the deploy? How does this week compare to last week?</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Technique 1: appendcols</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">This week vs last week</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web status>=500 earliest=-7d
| stats count as this_week
| appendcols [search index=web status>=500 earliest=-14d latest=-7d
    | stats count as last_week]
| eval change_pct=round((this_week-last_week)/last_week*100, 1)</code></pre>
                        </div>
                        <p class="guide-explanation">Compare error counts and calculate percentage change.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Before/after a specific time</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=blocked earliest=-2d
| stats count as after_change
| appendcols [search index=firewall action=blocked earliest=-4d latest=-2d
    | stats count as before_change]
| eval reduction_pct=round((before_change-after_change)/before_change*100, 1)</code></pre>
                        </div>
                        <p class="guide-explanation">Measure impact of a change made 2 days ago.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Technique 2: Comparing Over Time</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Overlay this week on last week</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web
| eval period=if(_time>relative_time(now(), "-7d"), "This Week", "Last Week")
| eval normalized_time=if(period="Last Week", _time+604800, _time)
| bin normalized_time span=1h
| timechart span=1h count by period</code></pre>
                        </div>
                        <p class="guide-explanation">Shows both weeks on the same timeline for visual comparison.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Hour-by-hour comparison</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=web earliest=-14d
| eval week=if(_time>relative_time(now(), "-7d"), "Current", "Previous")
| eval hour=strftime(_time, "%H")
| stats count by hour, week
| xyseries hour week count</code></pre>
                        </div>
                        <p class="guide-explanation">Compare traffic patterns by hour of day between two weeks.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Real-World Scenarios</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Post-deployment error monitoring</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=application level=ERROR
| eval period=if(_time>strptime("2024-01-15 14:00", "%Y-%m-%d %H:%M"),
                 "After Deploy", "Before Deploy")
| stats count by period, error_type
| xyseries error_type period count</code></pre>
                        </div>
                        <p class="guide-explanation">Compare error types before/after a deploy at 2 PM on Jan 15.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Measure policy effectiveness</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>| multisearch
    [search index=firewall action=blocked earliest=-7d | stats count as blocked_after]
    [search index=firewall action=blocked earliest=-14d latest=-7d | stats count as blocked_before]
| stats values(blocked_after) as after, values(blocked_before) as before
| eval effectiveness=round((after-before)/before*100, 1)."%"</code></pre>
                        </div>
                        <p class="guide-explanation">Measure if new firewall rules are blocking more threats.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>When showing before/after, always use the same time duration for both periods. Comparing 2 days before to 1 day after gives misleading results.</p>
                </div>
            `
        },
        {
            id: 'viz-event-timeline',
            title: 'How to build a timeline of events',
            description: 'Create chronological views showing the sequence of events during an incident.',
            keywords: 'timeline sequence chronological order incident investigation transaction',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to reconstruct what happened in order - show the sequence of an attack, trace a user's activity, or understand the timeline of an incident.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Simple Event Timeline</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Basic chronological table</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=jsmith earliest=-1d
| table _time, action, src_ip, dest, status
| sort _time</code></pre>
                        </div>
                        <p class="guide-explanation">All events for a user in time order. The foundation of timeline analysis.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Formatted timestamps</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=jsmith earliest=-1d
| eval time=strftime(_time, "%H:%M:%S")
| table time, action, src_ip, dest
| sort _time</code></pre>
                        </div>
                        <p class="guide-explanation">Human-readable time format for easier reading.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Multi-Source Timelines</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Combine multiple data sources</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=jsmith OR src_ip=192.168.1.100
| eval source=case(
    sourcetype="WinEventLog:Security", "Windows",
    sourcetype="linux_secure", "Linux",
    sourcetype="pan:traffic", "Firewall",
    true(), sourcetype)
| table _time, source, action, dest, status
| sort _time</code></pre>
                        </div>
                        <p class="guide-explanation">Unified timeline across Windows, Linux, and firewall logs.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Add time gaps</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=jsmith earliest=-1d
| sort _time
| streamstats current=false last(_time) as prev_time
| eval gap_seconds=_time-prev_time
| eval gap=if(gap_seconds>300, "⏸️ ".tostring(gap_seconds/60, "duration"), "")
| table _time, gap, action, src_ip, dest</code></pre>
                        </div>
                        <p class="guide-explanation">Highlight time gaps longer than 5 minutes - shows breaks in activity.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Real-World Scenarios</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Attack reconstruction</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=* (user=compromised_user OR src_ip=attacker_ip) earliest=-24h
| eval phase=case(
    action="login", "1-Initial Access",
    action="exec", "2-Execution",
    action="copy", "3-Collection",
    action="upload", "4-Exfiltration",
    true(), "0-Other")
| table _time, phase, host, action, details
| sort _time</code></pre>
                        </div>
                        <p class="guide-explanation">Map events to attack phases for incident reporting.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Session reconstruction</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy user=jsmith earliest=-8h
| transaction user maxpause=30m
| table _time, duration, eventcount, values(url)
| sort _time</code></pre>
                        </div>
                        <p class="guide-explanation">Group activity into sessions (30 min idle = new session).</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Scenario: Process execution chain</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=endpoint host=infected_host EventCode=4688 earliest=-1h
| table _time, ParentProcessName, NewProcessName, CommandLine
| sort _time</code></pre>
                        </div>
                        <p class="guide-explanation">Process execution timeline showing what spawned what.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>For incident reports, add a <code>| eval description="..."</code> to annotate key events. This creates a narrative that's easier to follow than raw log data.</p>
                </div>
            `
        }
    ],

    datasources: [
        {
            id: 'windows-event-logs',
            title: 'How to work with Windows Event Logs',
            description: 'Navigate Windows Security, System, and Application event logs effectively.',
            keywords: 'windows event log eventcode security 4624 4625 4688',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to search and analyze Windows Event Logs - the primary source for Windows security monitoring.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Finding Windows Logs</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Common sourcetypes</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=windows sourcetype="WinEventLog:Security"</code></pre>
                        </div>
                        <p class="guide-explanation">Security events. Also: <code>WinEventLog:System</code>, <code>WinEventLog:Application</code>, <code>XmlWinEventLog</code>.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Key Security Event Codes</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Authentication events</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=windows sourcetype="WinEventLog:Security" EventCode IN (4624, 4625, 4634, 4647)
| stats count by EventCode
| eval description = case(
    EventCode=4624, "Successful login",
    EventCode=4625, "Failed login",
    EventCode=4634, "Logoff",
    EventCode=4647, "User initiated logoff"
)</code></pre>
                        </div>
                        <p class="guide-explanation">Core authentication events. 4624=success, 4625=failure.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Process execution</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=windows EventCode=4688
| stats count by New_Process_Name, Creator_Process_Name
| sort - count</code></pre>
                        </div>
                        <p class="guide-explanation">Process creation events - essential for endpoint detection.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Account management</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=windows EventCode IN (4720, 4722, 4724, 4728, 4732, 4756)
| stats count by EventCode, TargetUserName, SubjectUserName</code></pre>
                        </div>
                        <p class="guide-explanation">User/group changes: created (4720), enabled (4722), password reset (4724), group membership changes.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Logon Types</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Understand how users connected</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=windows EventCode=4624
| stats count by Logon_Type
| eval type_name = case(
    Logon_Type=2, "Interactive (console)",
    Logon_Type=3, "Network",
    Logon_Type=4, "Batch",
    Logon_Type=5, "Service",
    Logon_Type=7, "Unlock",
    Logon_Type=10, "RemoteInteractive (RDP)",
    Logon_Type=11, "CachedInteractive"
)</code></pre>
                        </div>
                        <p class="guide-explanation">Type 10 = RDP, Type 3 = network shares/remote access, Type 2 = local keyboard.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Filter out noise: <code>NOT user="*$"</code> removes computer accounts (they end in $). <code>NOT Logon_Type=3</code> removes noisy network logons if focusing on interactive sessions.</p>
                </div>
            `
        },
        {
            id: 'firewall-logs',
            title: 'How to work with firewall logs',
            description: 'Analyze network traffic, blocked connections, and security events from firewalls.',
            keywords: 'firewall network traffic blocked allowed connection palo cisco',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to analyze firewall logs to understand network traffic, find blocked threats, and investigate connections.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Finding Firewall Logs</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Common sourcetypes</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network sourcetype IN (pan:traffic, cisco:asa, fortinet_traffic)</code></pre>
                        </div>
                        <p class="guide-explanation">Depends on your firewall. Check with <code>| stats count by sourcetype</code> in your network index.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Using CIM-normalized fields</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network tag=network tag=communicate
| stats count by action, src_ip, dest_ip, dest_port</code></pre>
                        </div>
                        <p class="guide-explanation">CIM fields work across vendors: src_ip, dest_ip, dest_port, action, bytes_in, bytes_out.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Traffic Analysis</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Top talkers (by volume)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network
| stats sum(bytes) as total_bytes by src_ip
| sort - total_bytes
| head 20
| eval total_gb = round(total_bytes/1024/1024/1024, 2)</code></pre>
                        </div>
                        <p class="guide-explanation">Who's sending the most data? Large outbound = potential exfiltration.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Top destinations</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network action=allowed
| stats sum(bytes) as bytes, dc(src_ip) as sources by dest_ip
| sort - bytes
| head 20</code></pre>
                        </div>
                        <p class="guide-explanation">Most accessed destinations. Many sources to one dest might indicate C2 or popular service.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Security Analysis</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Blocked connections</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network action IN (blocked, denied, drop)
| stats count by src_ip, dest_ip, dest_port
| sort - count
| head 50</code></pre>
                        </div>
                        <p class="guide-explanation">What's being blocked? High counts might indicate attacks or misconfigurations.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Unusual ports</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network dest_port > 1024 NOT dest_port IN (3389, 8080, 8443, 443)
| stats dc(src_ip) as sources, sum(bytes) as bytes by dest_port
| where sources > 5
| sort - bytes</code></pre>
                        </div>
                        <p class="guide-explanation">High ports used by multiple sources - possible C2 or unauthorized services.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Use <code>| iplocation dest_ip</code> to add geographic context. Outbound traffic to unexpected countries is worth investigating.</p>
                </div>
            `
        },
        {
            id: 'proxy-web-logs',
            title: 'How to work with proxy and web logs',
            description: 'Analyze web traffic, detect threats, and investigate user browsing activity.',
            keywords: 'proxy web traffic http url browsing squid bluecoat zscaler',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to analyze web/proxy logs to investigate browsing activity, detect malicious sites, and find data exfiltration.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Finding Proxy Logs</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Common sourcetypes</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy sourcetype IN (bluecoat:proxysg, squid, zscalernss-web)</code></pre>
                        </div>
                        <p class="guide-explanation">Varies by vendor. Use CIM tag <code>tag=web</code> for normalized access.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">CIM-normalized web data</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy tag=web
| stats count by user, url, status, action</code></pre>
                        </div>
                        <p class="guide-explanation">Common CIM fields: url, uri_path, user, src_ip, dest, status, action, bytes_in, bytes_out.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">User Activity Analysis</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Sites visited by user</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy user=jsmith
| rex field=url "https?://(?<domain>[^/]+)"
| stats count, sum(bytes_out) as uploaded by domain
| sort - count</code></pre>
                        </div>
                        <p class="guide-explanation">What sites did this user visit? How much data did they upload?</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Top bandwidth users</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
| stats sum(bytes_in) as download, sum(bytes_out) as upload by user
| eval total = download + upload
| sort - total
| head 20</code></pre>
                        </div>
                        <p class="guide-explanation">Who's using the most bandwidth? High upload = potential exfiltration.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Threat Detection</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Blocked malicious sites</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy action=blocked category IN (malware, phishing, "command-and-control")
| stats count by user, url, category
| sort - count</code></pre>
                        </div>
                        <p class="guide-explanation">Users hitting blocked threat categories. Multiple hits = possible infection.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Uploads to file sharing sites</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy http_method=POST bytes_out > 1000000
| rex field=url "https?://(?<domain>[^/]+)"
| search domain IN (*dropbox*, *drive.google*, *onedrive*, *wetransfer*, *mega.nz*)
| stats sum(bytes_out) as uploaded by user, domain</code></pre>
                        </div>
                        <p class="guide-explanation">Large uploads to file sharing - potential data exfiltration.</p>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Watch For</div>
                    <p>Repeated connections to newly registered domains, raw IP URLs, or unusual TLDs (.tk, .top, .xyz). These are common in phishing and malware infrastructure.</p>
                </div>
            `
        }
    ],

    enriching: [
        {
            id: 'use-lookups',
            title: 'How to use lookups',
            description: 'Enrich your events with external data like asset info, user details, or threat intelligence.',
            keywords: 'lookup enrich context asset user threat intel csv',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to add context to your events - turn IP addresses into hostnames, user IDs into names, or match against threat intelligence.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Basic Lookup</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Add fields from a lookup</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security
| lookup user_info.csv user OUTPUT department, manager, title</code></pre>
                        </div>
                        <p class="guide-explanation">For each event, look up the <code>user</code> in user_info.csv and add department, manager, and title fields.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Map field names with AS</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network
| lookup assets.csv ip AS src_ip OUTPUT hostname, owner, criticality</code></pre>
                        </div>
                        <p class="guide-explanation">Match src_ip in events to the "ip" column in the lookup. Add hostname, owner, criticality.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Lookup Options</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Only add if field doesn't exist</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | lookup assets.csv ip AS src_ip OUTPUTNEW hostname</code></pre>
                        </div>
                        <p class="guide-explanation"><code>OUTPUTNEW</code> only adds the field if it doesn't already exist in the event.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Output all lookup fields</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>... | lookup assets.csv ip AS src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Without OUTPUT, adds all fields from the matching lookup row.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Threat Intelligence Matching</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Check IPs against threat list</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=network
| lookup threat_intel.csv ip AS dest_ip OUTPUTNEW threat_type, confidence
| where isnotnull(threat_type)</code></pre>
                        </div>
                        <p class="guide-explanation">Match destination IPs against threat intel. Only keep events that matched.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Query a Lookup Directly</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">See what's in the lookup</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>| inputlookup assets.csv
| head 100</code></pre>
                        </div>
                        <p class="guide-explanation">View lookup contents. Useful for understanding available fields.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Lookups are fast because they're loaded into memory. For large reference data (millions of rows), consider KV Store collections instead of CSV lookups.</p>
                </div>
            `
        },
        {
            id: 'join-data-sources',
            title: 'How to join data from different sources',
            description: 'Combine events from different indexes or sourcetypes based on a common field.',
            keywords: 'join combine correlate multiple sources subsearch',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to correlate data from different sources - like matching authentication logs with VPN logs, or combining user activity with HR data.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using Join</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Basic join</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=*
| join user [search index=hr | table user, department, manager]</code></pre>
                        </div>
                        <p class="guide-explanation">Add HR info to security events by matching on user. INNER join - events without matches are dropped.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Left join (keep all main events)</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=*
| join type=left user [search index=hr | table user, department]</code></pre>
                        </div>
                        <p class="guide-explanation"><code>type=left</code> keeps all security events, even if no HR match. Unmatched fields are empty.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using Stats (Often Better)</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Append and combine with stats</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security action=failure
| append [search index=security action=success]
| stats count(eval(action="failure")) as failures,
        count(eval(action="success")) as successes by user</code></pre>
                        </div>
                        <p class="guide-explanation">Append combines result sets. Stats then aggregates across both. More flexible than join.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Multiple indexes, same stats</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>(index=auth OR index=vpn) user=*
| stats count by user, index
| xyseries user index count</code></pre>
                        </div>
                        <p class="guide-explanation">Search multiple indexes at once, then pivot the results.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Subsearch for Filtering</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Find events for users in another list</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security
    [search index=hr status=terminated | fields user | format]
| stats count by user, action</code></pre>
                        </div>
                        <p class="guide-explanation">Find security events for terminated users. Subsearch returns a list of users to match.</p>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Watch Out</div>
                    <p>Join holds the subsearch results in memory - limited to 50,000 rows by default. For large datasets, consider using <code>lookup</code> (for reference data) or <code>append + stats</code> (for combining search results).</p>
                </div>
            `
        }
    ],

    dashboards: [
        {
            id: 'dash-fundamentals',
            title: 'Dashboard fundamentals for analysts',
            description: 'Understand what dashboards are, when to use them, and how they fit into your analysis workflow.',
            keywords: 'dashboard basics fundamentals overview introduction why use panels',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">What is a Dashboard?</div>
                    <div class="guide-detail-section">
                        <p>A dashboard is a collection of panels - each panel runs a search and displays results as a visualization, table, or single value. Dashboards let you monitor multiple things at once without re-running searches manually.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Why Use Dashboards?</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><strong>Save time</strong> - Stop re-typing the same searches every day</li>
                            <li><strong>Monitor at a glance</strong> - See the health of systems, security posture, or KPIs instantly</li>
                            <li><strong>Share knowledge</strong> - Give your team pre-built views instead of teaching everyone SPL</li>
                            <li><strong>Consistency</strong> - Everyone sees the same data, calculated the same way</li>
                            <li><strong>Investigation launchpads</strong> - Start from a dashboard, then drill down into details</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Dashboard Components</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Panels</div>
                        <p>Each panel contains one search and one visualization. A dashboard typically has 4-12 panels arranged in rows.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Inputs</div>
                        <p>Dropdowns, text boxes, and time pickers that let users filter the dashboard without editing searches. Example: a dropdown to select which server to view.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Drilldowns</div>
                        <p>Click actions that take you somewhere else - another dashboard, a detailed search, or an external URL. Essential for investigation workflows.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">When to Build a Dashboard</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li>You run the same searches daily or weekly</li>
                            <li>Multiple people need to see the same data</li>
                            <li>You want to monitor something continuously</li>
                            <li>You need a starting point for investigations</li>
                            <li>Leadership wants visibility without learning SPL</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Analyst Tip</div>
                    <p>Don't dashboard everything. Keep ad-hoc investigation searches ad-hoc. Dashboard the things you check repeatedly - daily health checks, weekly reports, ongoing monitoring. Your dashboards should answer questions you ask over and over.</p>
                </div>
            `
        },
        {
            id: 'dash-first-dashboard',
            title: 'How to build your first dashboard',
            description: 'Step-by-step guide to creating a dashboard from scratch using the Splunk UI.',
            keywords: 'create build new dashboard first beginner tutorial step by step',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>Create a simple dashboard with 2-3 panels that you can use and customize. We'll use the Dashboard Studio (the modern editor) which is the default in newer Splunk versions.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 1: Create the Dashboard</div>
                    <div class="guide-detail-section">
                        <ol>
                            <li>From the Splunk home page, click <strong>Dashboards</strong> in the left menu</li>
                            <li>Click <strong>Create New Dashboard</strong></li>
                            <li>Give it a name (e.g., "Security Overview")</li>
                            <li>Select <strong>Dashboard Studio</strong> (recommended) or Classic Dashboards</li>
                            <li>Click <strong>Create</strong></li>
                        </ol>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 2: Add Your First Panel</div>
                    <div class="guide-detail-section">
                        <ol>
                            <li>Click <strong>Add Panel</strong> or the <strong>+</strong> icon</li>
                            <li>Select a visualization type (start with <strong>Table</strong> or <strong>Single Value</strong>)</li>
                            <li>In the search editor, enter your SPL:</li>
                        </ol>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security EventCode=4625
| stats count as "Failed Logins"</code></pre>
                        </div>
                        <p class="guide-explanation">A simple single value showing total failed logins.</p>
                    </div>
                    <div class="guide-detail-section">
                        <ol start="4">
                            <li>Set your time range (e.g., "Last 24 hours")</li>
                            <li>Click <strong>Apply</strong> to see results</li>
                            <li>Give the panel a title like "Failed Logins (24h)"</li>
                        </ol>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 3: Add More Panels</div>
                    <div class="guide-detail-section">
                        <p>Repeat the process. Good starter panels:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security EventCode=4625
| timechart span=1h count</code></pre>
                        </div>
                        <p class="guide-explanation">Line chart showing failed logins over time.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security EventCode=4625
| stats count by src_ip
| sort - count
| head 10</code></pre>
                        </div>
                        <p class="guide-explanation">Table of top 10 source IPs with failed logins.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 4: Arrange and Save</div>
                    <div class="guide-detail-section">
                        <ol>
                            <li>Drag panels to rearrange them</li>
                            <li>Resize panels by dragging corners</li>
                            <li>Click <strong>Save</strong> in the top right</li>
                        </ol>
                        <p>Your dashboard is now saved and accessible from the Dashboards menu.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Start with searches you've already tested in the Search app. Get the search working first, then add it to a dashboard. Don't try to write new SPL directly in the dashboard editor.</p>
                </div>
            `
        },
        {
            id: 'dash-best-practices',
            title: 'Dashboard design best practices',
            description: 'Design principles for creating effective, performant dashboards that people actually use.',
            keywords: 'best practices design layout performance tips efficient effective',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Layout Principles</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Most important = top left</div>
                        <p>People read dashboards like a page - top to bottom, left to right. Put your key metrics and alerts at the top.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Group related panels</div>
                        <p>Keep authentication panels together, network panels together, etc. Use visual rows to create sections.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Limit to 8-12 panels</div>
                        <p>More panels = slower load times and visual overload. If you need more, create multiple focused dashboards.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Performance Tips</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Use specific indexes</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security sourcetype=WinEventLog:Security</code></pre>
                        </div>
                        <p class="guide-explanation">Always specify index and sourcetype. Never use <code>index=*</code> on dashboards.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Use tstats for high-volume data</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>| tstats count WHERE index=web by _time span=1h</code></pre>
                        </div>
                        <p class="guide-explanation">tstats searches indexed fields only - much faster than regular searches for simple counts.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Limit time ranges</div>
                        <p>Default to 24 hours or 7 days, not "All Time". Let users expand if needed via time picker input.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Use base searches</div>
                        <p>If multiple panels use similar data, create one base search and have panels reference it. This runs one search instead of many.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Visualization Choice</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><strong>Single Value</strong> - Key metrics, counts, current status</li>
                            <li><strong>Line/Area Chart</strong> - Trends over time</li>
                            <li><strong>Bar Chart</strong> - Comparing categories (top users, top sources)</li>
                            <li><strong>Pie Chart</strong> - Proportions (use sparingly, max 5-6 slices)</li>
                            <li><strong>Table</strong> - Detailed data, lists, when you need exact values</li>
                            <li><strong>Map</strong> - Geographic data only</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Usability</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><strong>Descriptive titles</strong> - "Failed Logins by User (7d)" not "Panel 1"</li>
                            <li><strong>Consistent time ranges</strong> - All panels should use the same time range or make it obvious when they don't</li>
                            <li><strong>Add drilldowns</strong> - Let users click to investigate further</li>
                            <li><strong>Include context</strong> - What's normal? Add thresholds or comparisons</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Common Mistakes</div>
                    <p>Avoid real-time searches unless truly needed (they're expensive). Don't use <code>| table *</code> (pulls all fields). Don't create "everything" dashboards - make focused ones for specific purposes.</p>
                </div>
            `
        },
        {
            id: 'dash-inputs-filters',
            title: 'How to add inputs and filters',
            description: 'Make dashboards interactive with dropdowns, time pickers, and text inputs that filter your data.',
            keywords: 'input filter dropdown time picker text box token interactive dynamic',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>Add interactive controls that let users filter dashboard data without editing searches. For example, a dropdown to select a specific host or user.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">How Inputs Work</div>
                    <div class="guide-detail-section">
                        <p>Inputs create <strong>tokens</strong> - variables that get inserted into your searches. When a user selects "server01" from a dropdown, the token <code>$host$</code> becomes "server01" and all searches using that token re-run.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Adding a Dropdown Input</div>
                    <div class="guide-detail-section">
                        <ol>
                            <li>In Dashboard Studio, click <strong>Add Input</strong></li>
                            <li>Select <strong>Dropdown</strong></li>
                            <li>Configure the input:
                                <ul>
                                    <li><strong>Token:</strong> <code>selected_host</code></li>
                                    <li><strong>Label:</strong> "Select Host"</li>
                                    <li><strong>Default:</strong> <code>*</code> (shows all)</li>
                                </ul>
                            </li>
                            <li>For dynamic choices, add a search:</li>
                        </ol>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main | stats count by host | fields host</code></pre>
                        </div>
                        <p class="guide-explanation">Populates dropdown with actual hosts from your data.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using Tokens in Searches</div>
                    <div class="guide-detail-section">
                        <p>Reference the token in your panel searches with <code>$token_name$</code>:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=main host=$selected_host$
| stats count by sourcetype</code></pre>
                        </div>
                        <p class="guide-explanation">When user selects "server01", this becomes <code>host=server01</code>. When they select the default "*", it shows all hosts.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Common Input Types</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Time Range Picker</div>
                        <p>Lets users control the dashboard time range. Uses <code>$time.earliest$</code> and <code>$time.latest$</code> tokens.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Text Input</div>
                        <p>Free-form text entry. Good for searching specific usernames, IPs, or error messages.</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security user=*$search_user$*</code></pre>
                        </div>
                        <p class="guide-explanation">Wildcards around the token allow partial matches.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Multiselect Dropdown</div>
                        <p>Select multiple values. The token contains all selections in a search-friendly format.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Input Best Practices</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li>Always set a sensible default value</li>
                            <li>Add an "All" option with value <code>*</code></li>
                            <li>Keep dropdown lists reasonable (under 100 items)</li>
                            <li>Put inputs at the top of the dashboard</li>
                            <li>Group related inputs together</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Test your dashboard with different input combinations. Make sure it handles edge cases like empty selections or special characters in values. A dropdown that breaks the search when you select "O'Brien" is not a good dropdown.</p>
                </div>
            `
        },
        {
            id: 'dash-drilldowns',
            title: 'How to set up drilldowns for investigations',
            description: 'Configure click actions that take users from summary views to detailed investigations.',
            keywords: 'drilldown click action investigate detail link navigation workflow',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>Make your dashboards interactive investigation tools. When an analyst sees something suspicious, they should be able to click and dig deeper immediately.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">What is a Drilldown?</div>
                    <div class="guide-detail-section">
                        <p>A drilldown is an action triggered when someone clicks on a chart, table row, or value. It can:</p>
                        <ul>
                            <li>Open a new search with the clicked value</li>
                            <li>Navigate to another dashboard with context</li>
                            <li>Link to an external system (ticketing, wiki, etc.)</li>
                            <li>Set tokens to filter the current dashboard</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Setting Up Basic Drilldowns</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">In Dashboard Studio</div>
                        <ol>
                            <li>Select a panel</li>
                            <li>Click the <strong>Interactions</strong> tab (or drilldown settings)</li>
                            <li>Enable drilldown</li>
                            <li>Choose the action type</li>
                        </ol>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Drilldown to Search</div>
                        <p>Open the Search app with a pre-built query. Use tokens to pass the clicked value:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security src_ip=$click.value$
| table _time, user, action, dest</code></pre>
                        </div>
                        <p class="guide-explanation"><code>$click.value$</code> contains whatever the user clicked on.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Useful Drilldown Tokens</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><code>$click.value$</code> - The value that was clicked</li>
                            <li><code>$click.name$</code> - The field name of the clicked value</li>
                            <li><code>$row.&lt;fieldname&gt;$</code> - Value of a specific field in the clicked row</li>
                            <li><code>$earliest$</code> / <code>$latest$</code> - Time range of the panel</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Drilldown to Another Dashboard</div>
                    <div class="guide-detail-section">
                        <p>Pass context to a detailed dashboard using URL parameters:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>/app/search/user_investigation?form.username=$row.user$</code></pre>
                        </div>
                        <p class="guide-explanation">Opens the "user_investigation" dashboard with the username pre-filled.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Investigation Workflow Example</div>
                    <div class="guide-detail-section">
                        <p>Build a three-level investigation flow:</p>
                        <ol>
                            <li><strong>Overview Dashboard</strong> - High-level metrics and alerts</li>
                            <li><strong>Entity Dashboard</strong> - Details about a specific user, host, or IP (reached via drilldown)</li>
                            <li><strong>Raw Search</strong> - Full event details (final drilldown)</li>
                        </ol>
                        <p>Each level provides more detail. Analysts start broad and click to focus.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Analyst Tip</div>
                    <p>Design drilldowns around investigation questions. When an analyst sees a spike in failed logins, what's their next question? Probably "which users?" or "which sources?" - make those one click away.</p>
                </div>
            `
        },
        {
            id: 'dash-analyst-workflows',
            title: 'Using dashboards in analyst workflows',
            description: 'Practical strategies for integrating dashboards into daily monitoring, triage, and investigation routines.',
            keywords: 'workflow monitoring triage investigation routine daily soc analyst hunting',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Big Picture</div>
                    <div class="guide-detail-section">
                        <p>Dashboards aren't just pretty pictures - they're operational tools. Used well, they make you faster and help you catch things you'd otherwise miss.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Daily Monitoring Workflow</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Morning Check Dashboard</div>
                        <p>Create a "start of shift" dashboard that answers: What happened overnight? What needs attention?</p>
                        <ul>
                            <li>Alert counts by severity (last 12-24 hours)</li>
                            <li>Failed authentication trends</li>
                            <li>System health indicators</li>
                            <li>Anomalies or threshold breaches</li>
                        </ul>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Make it actionable</div>
                        <p>Every panel should either show "all clear" or lead somewhere. If failed logins are high, one click should show you which accounts. Don't make analysts context-switch to investigate.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Triage Workflow</div>
                    <div class="guide-detail-section">
                        <p>When alerts fire, you need to quickly determine: Is this real? How bad? What's affected?</p>
                        <div class="guide-detail-label">Alert Triage Dashboard Pattern</div>
                        <ul>
                            <li><strong>Top row:</strong> Key context about the alerted entity (user/host/IP)</li>
                            <li><strong>Middle:</strong> Related activity timeline</li>
                            <li><strong>Bottom:</strong> Historical baseline - is this normal for this entity?</li>
                        </ul>
                    </div>
                    <div class="guide-detail-section">
                        <p>Use inputs to quickly pivot between entities. Drilldowns to raw events for evidence.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Investigation Dashboard</div>
                    <div class="guide-detail-section">
                        <p>Deep-dive dashboards for confirmed incidents. Build these around entities:</p>
                        <div class="guide-detail-label">User Investigation Dashboard</div>
                        <ul>
                            <li>Authentication history (successes and failures)</li>
                            <li>Systems accessed</li>
                            <li>Data accessed or transferred</li>
                            <li>Timeline of all activity</li>
                            <li>Comparison to peer group behavior</li>
                        </ul>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Host Investigation Dashboard</div>
                        <ul>
                            <li>Process execution history</li>
                            <li>Network connections</li>
                            <li>File modifications</li>
                            <li>User logins</li>
                            <li>Installed software changes</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Threat Hunting with Dashboards</div>
                    <div class="guide-detail-section">
                        <p>Hunting dashboards focus on patterns and anomalies:</p>
                        <ul>
                            <li>Rare process executions</li>
                            <li>First-time connections</li>
                            <li>Outliers in behavior (statistical or rule-based)</li>
                            <li>Known-bad indicators</li>
                        </ul>
                        <p>These dashboards surface candidates for investigation. Not every hit is malicious - that's where analyst judgment comes in.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Workflow Tip</div>
                    <p>Create a personal "Analyst Home" dashboard with links to all your operational dashboards. Organize by workflow: Monitoring, Triage, Investigation, Hunting. One bookmark, everything accessible.</p>
                </div>
            `
        },
        {
            id: 'dash-realtime-monitoring',
            title: 'Building real-time monitoring dashboards',
            description: 'When and how to use real-time searches for live monitoring, and how to avoid performance pitfalls.',
            keywords: 'real-time realtime live monitoring streaming performance refresh',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">When to Use Real-Time</div>
                    <div class="guide-detail-section">
                        <p>Real-time searches continuously process events as they arrive. Use them when:</p>
                        <ul>
                            <li>You need to see events within seconds of occurrence</li>
                            <li>You're monitoring active incidents</li>
                            <li>You're watching a deployment or change window</li>
                            <li>Display screens for NOC/SOC visibility</li>
                        </ul>
                    </div>
                    <div class="guide-detail-section">
                        <p><strong>Don't use real-time</strong> for general dashboards. Scheduled searches with auto-refresh are usually better - same visibility, fraction of the cost.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Real-Time Search Types</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Windowed Real-Time</div>
                        <p>Shows a sliding time window (e.g., last 5 minutes). Less resource-intensive.</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=security EventCode=4625 earliest=-5m
| stats count by src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Set time picker to "5 minute window" in real-time options.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">All-Time Real-Time</div>
                        <p>Accumulates all events since the search started. Use sparingly - memory intensive.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Performance Considerations</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><strong>Limit concurrent real-time searches</strong> - Each one consumes resources continuously</li>
                            <li><strong>Use specific filters</strong> - The more data flowing through, the higher the cost</li>
                            <li><strong>Prefer windowed over all-time</strong> - Bounded memory usage</li>
                            <li><strong>Avoid transforming commands when possible</strong> - Stats, timechart, etc. add overhead</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Alternative: Scheduled + Auto-Refresh</div>
                    <div class="guide-detail-section">
                        <p>For most monitoring needs, this pattern works better:</p>
                        <ol>
                            <li>Create a scheduled search that runs every 1-5 minutes</li>
                            <li>Save results to a summary index or lookup</li>
                            <li>Dashboard reads from the summary (fast)</li>
                            <li>Set dashboard to auto-refresh every minute</li>
                        </ol>
                        <p>Result: Near-real-time visibility with much lower resource usage.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Real-Time Dashboard Pattern</div>
                    <div class="guide-detail-section">
                        <p>A typical real-time ops dashboard:</p>
                        <ul>
                            <li><strong>Row 1:</strong> Single values showing current counts/rates</li>
                            <li><strong>Row 2:</strong> Live event stream (last 100 events)</li>
                            <li><strong>Row 3:</strong> 5-minute trending chart</li>
                        </ul>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=blocked
| head 100
| table _time, src_ip, dest_ip, dest_port, rule</code></pre>
                        </div>
                        <p class="guide-explanation">Live stream of blocked connections - useful during active monitoring.</p>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Resource Warning</div>
                    <p>Real-time searches run until you close them. A dashboard with 6 real-time panels left open overnight is running 6 continuous searches. Always close real-time dashboards when you're done, or set them to convert to historical after a timeout.</p>
                </div>
            `
        },
        {
            id: 'dash-sharing-permissions',
            title: 'How to share dashboards and manage permissions',
            description: 'Control who can view, edit, and manage your dashboards across the organization.',
            keywords: 'share sharing permissions access control roles private app global',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">Permission Levels</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Private (User)</div>
                        <p>Only you can see and edit. Good for personal dashboards and work-in-progress.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">App-Level (App)</div>
                        <p>Anyone with access to the app can see it. Most common for team dashboards.</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Global (All Apps)</div>
                        <p>Visible across all apps. Use for organization-wide dashboards.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Changing Permissions</div>
                    <div class="guide-detail-section">
                        <ol>
                            <li>Go to <strong>Settings > User Interface > Views</strong></li>
                            <li>Find your dashboard</li>
                            <li>Click <strong>Permissions</strong></li>
                            <li>Set the sharing level and role-based access</li>
                        </ol>
                        <p>Or from the dashboard: <strong>Edit > Edit Permissions</strong></p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Role-Based Access</div>
                    <div class="guide-detail-section">
                        <p>Within each sharing level, you can set per-role permissions:</p>
                        <ul>
                            <li><strong>Read</strong> - Can view the dashboard</li>
                            <li><strong>Write</strong> - Can edit the dashboard</li>
                        </ul>
                        <p>Example: Share with App, give all users Read, give analysts Write.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Sharing Best Practices</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><strong>Start private</strong> - Build and test before sharing</li>
                            <li><strong>Use descriptive names</strong> - "Q4 Security Metrics" not "Dashboard 2"</li>
                            <li><strong>Document your dashboards</strong> - Add a description explaining what it shows and who it's for</li>
                            <li><strong>Limit write access</strong> - Too many editors leads to inconsistency</li>
                            <li><strong>Consider creating an app</strong> - For major dashboard collections, a dedicated app keeps things organized</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Exporting Dashboards</div>
                    <div class="guide-detail-section">
                        <p>To share dashboards between Splunk instances:</p>
                        <ol>
                            <li>Go to the dashboard</li>
                            <li>Click <strong>Edit > Export</strong></li>
                            <li>Download as XML or JSON</li>
                            <li>Import on the target system via UI or copying to <code>$SPLUNK_HOME/etc/apps/[app]/local/data/ui/views/</code></li>
                        </ol>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Create a "Dashboard Directory" dashboard - a simple page with links and descriptions of all your team's dashboards. Makes it easy for new team members to find what they need.</p>
                </div>
            `
        }
    ],

    enterpriseSecurity: [
        {
            id: 'es-investigate-notable',
            title: 'How to investigate a notable event',
            description: 'Step-by-step workflow for triaging and investigating ES notable events.',
            keywords: 'notable event investigate triage incident review ES enterprise security alert',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You have a notable event in Incident Review that needs investigation. You want to determine if it's a true positive (real threat), false positive (benign), or needs escalation.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 1: Understand the Alert</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=notable event_id="YOUR_EVENT_ID" | table _time, rule_name, rule_description, urgency, src, dest, user, drilldown_search</code></pre>
                        </div>
                        <p class="guide-explanation">Start by reading the rule description and understanding what triggered the alert. The drilldown_search field contains SPL to find the original events.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 2: Add Business Context</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>\`notable\` | search event_id="YOUR_EVENT_ID"
| \`get_asset(dest)\`
| \`get_identity4events(user)\`
| table dest, dest_priority, dest_owner, dest_category, user, user_category, user_bunit</code></pre>
                        </div>
                        <p class="guide-explanation">Enrich with asset and identity data. Is this a critical server? A privileged user? An executive? Context determines urgency.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 3: Check for Related Activity</div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Related notables for same entities</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=notable (user="jsmith" OR src="192.168.1.100" OR dest="server01")
| stats count, earliest(_time) as first, latest(_time) as last by rule_name
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Are there other alerts involving the same user/host? Multiple different detections = higher confidence.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 4: Review Risk Profile</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=risk (risk_object="jsmith" OR risk_object="192.168.1.100")
| stats sum(risk_score) as total_risk, dc(source) as unique_rules, values(source) as detections
| table total_risk, unique_rules, detections</code></pre>
                        </div>
                        <p class="guide-explanation">Check accumulated risk. High risk from multiple rules indicates sustained suspicious activity.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 5: Drill Down to Raw Events</div>
                    <div class="guide-detail-section">
                        <p>Use the <code>drilldown_search</code> field from the notable, or build your own query to the source data:</p>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=wineventlog user="jsmith" earliest=-24h
| table _time, EventCode, ComputerName, src_ip, action</code></pre>
                        </div>
                        <p class="guide-explanation">Look at the actual events that triggered the detection. Verify the behavior is what the alert claims.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Step 6: Document and Disposition</div>
                    <div class="guide-detail-section">
                        <p>Based on your investigation:</p>
                        <ul>
                            <li><strong>True Positive</strong> - Escalate to incident, assign owner, begin response</li>
                            <li><strong>Benign True Positive</strong> - Real activity but expected (e.g., admin doing their job). Document and close</li>
                            <li><strong>False Positive</strong> - Detection is wrong. Close with notes, consider tuning the rule</li>
                        </ul>
                        <p>Always add comments documenting what you found and why you made your decision.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Create saved searches for your common investigation pivots. "Investigate User" and "Investigate Host" searches with tokens make triage much faster.</p>
                </div>
            `
        },
        {
            id: 'es-analyze-risk',
            title: 'How to analyze a high-risk user or host',
            description: 'Investigate why an entity has elevated risk and what contributed to it.',
            keywords: 'risk RBA risk-based alerting risk_score investigate user host entity',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>An entity (user or host) has high risk in ES. You need to understand what events contributed to the risk and determine if it represents a real threat.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Find the Risk Summary</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=risk risk_object="jsmith"
| stats sum(risk_score) as total_risk,
        dc(source) as unique_detections,
        values(source) as detection_types,
        earliest(_time) as first_seen,
        latest(_time) as last_seen</code></pre>
                        </div>
                        <p class="guide-explanation">Get a high-level summary: total risk, how many different rules fired, and the time window.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Break Down by Contributing Rule</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=risk risk_object="jsmith"
| stats count, sum(risk_score) as risk_contributed by source
| sort -risk_contributed
| head 10</code></pre>
                        </div>
                        <p class="guide-explanation">See which detection rules contributed the most risk. This tells you what type of suspicious behavior was detected.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">View Risk Timeline</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=risk risk_object="jsmith"
| timechart span=1h sum(risk_score) by source limit=5</code></pre>
                        </div>
                        <p class="guide-explanation">When did risk accumulate? Look for spikes that indicate active attacks or a single risky session.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Read Individual Risk Events</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=risk risk_object="jsmith"
| sort -_time
| table _time, source, risk_score, risk_message, threat_object
| head 20</code></pre>
                        </div>
                        <p class="guide-explanation">The risk_message field often explains what specifically triggered the detection. threat_object may contain IOCs.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Cross-Reference with Identity</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| inputlookup identity_lookup_expanded
| search identity="jsmith"
| table identity, first, last, email, bunit, category, managedBy, priority, watchlist</code></pre>
                        </div>
                        <p class="guide-explanation">Who is this user? Are they privileged? Executive? On a watchlist? This context helps interpret the risk.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Interpreting Risk Patterns</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><strong>Many low-risk events</strong> - Could be noisy detection rules; review for tuning</li>
                            <li><strong>Few high-risk events</strong> - Investigate urgently; high-confidence detections</li>
                            <li><strong>Multiple unrelated rules</strong> - Higher confidence; independent indicators of compromise</li>
                            <li><strong>Single rule firing repeatedly</strong> - Could be ongoing attack or noisy rule</li>
                            <li><strong>Risk spike then quiet</strong> - Investigate the spike window closely</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>If a user has high risk from many brute-force attempts, check if they actually got compromised: look for successful logins after the failures, especially from new locations.</p>
                </div>
            `
        },
        {
            id: 'es-query-notable',
            title: 'How to query and filter notable events',
            description: 'Find and filter notable events for reporting, metrics, and investigation.',
            keywords: 'notable query filter search metrics reporting SOC status urgency',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You need to query notable events for reporting, metrics, or bulk investigation. This guide shows common patterns for working with the notable index.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Basic Notable Query</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=notable earliest=-24h
| stats count by rule_name, urgency
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Count notables by rule and urgency in the last 24 hours. Good for understanding alert volume.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Filter by Status</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=notable status_group=open
| stats count by rule_name, owner
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">status_group simplifies filtering: "new", "open" (includes in progress), "pending", "closed".</p>
                    </div>
                    <div class="guide-detail-section">
                        <div class="guide-detail-label">Filter by specific status</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=notable status="new" | stats count
index=notable status="in progress" | stats count
index=notable status="pending" | stats count
index=notable status="resolved" OR status="closed" | stats count</code></pre>
                        </div>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Filter by Urgency</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=notable urgency IN ("critical", "high") status_group=open
| table _time, rule_name, urgency, src, dest, user, owner</code></pre>
                        </div>
                        <p class="guide-explanation">Focus on high and critical urgency notables that haven't been closed yet.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Filter by Security Domain</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=notable security_domain=endpoint
| stats count by rule_name | sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">security_domain values: access, endpoint, network, threat, identity, audit. Useful for domain-specific reporting.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Analyst Workload Report</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=notable earliest=-7d
| stats count as total,
        count(eval(status_group="closed")) as closed,
        count(eval(status_group="open")) as open
    by owner
| eval close_rate=round(closed/total*100,1)."%"
| sort -total</code></pre>
                        </div>
                        <p class="guide-explanation">See how many notables each analyst handled and their close rate.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Notable Trend Over Time</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=notable earliest=-30d
| bucket _time span=1d
| stats count by _time, urgency
| xyseries _time urgency count</code></pre>
                        </div>
                        <p class="guide-explanation">Daily notable volume by urgency. Great for spotting trends or impact of new detections.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Use the \`notable\` macro instead of index=notable when you need field normalization and ES enrichment: <code>\`notable\` | search status=new</code></p>
                </div>
            `
        },
        {
            id: 'es-asset-identity-enrich',
            title: 'How to enrich events with asset and identity data',
            description: 'Add business context to your searches using ES Asset and Identity lookups.',
            keywords: 'asset identity lookup enrich context business priority owner category',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to add context to raw events - who is this user, what is this system, how critical is it, who owns it. ES Asset and Identity lookups provide this enrichment.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Enrich with Asset Data</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall action=blocked
| lookup asset_lookup_by_str ip as dest_ip
    OUTPUT dns as dest_hostname, owner as dest_owner, priority as dest_priority, category as dest_category
| where dest_priority="critical"
| table _time, src_ip, dest_ip, dest_hostname, dest_owner, dest_priority</code></pre>
                        </div>
                        <p class="guide-explanation">Add asset details to firewall events, then filter to critical assets. Now you know what was targeted.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Enrich with Identity Data</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=auth action=failure
| lookup identity_lookup_expanded identity as user
    OUTPUT first, last, bunit, category as user_category, managedBy
| where user_category="privileged"
| table _time, user, first, last, bunit, managedBy, src_ip</code></pre>
                        </div>
                        <p class="guide-explanation">Add identity details to auth failures, filter to privileged users. Failed logins by admins need faster investigation.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using ES Macros (Recommended)</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>\`notable\`
| \`get_asset(dest)\`
| \`get_identity4events(user)\`
| table rule_name, dest, dest_priority, dest_owner, user, user_category, user_bunit</code></pre>
                        </div>
                        <p class="guide-explanation">ES macros handle edge cases and are maintained by Splunk. Use them when possible.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Enrich Both Source and Destination</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall
| lookup asset_lookup_by_str ip as src_ip OUTPUTNEW dns as src_name, priority as src_priority
| lookup asset_lookup_by_str ip as dest_ip OUTPUTNEW dns as dest_name, priority as dest_priority
| search src_priority="critical" OR dest_priority="critical"
| table _time, src_ip, src_name, src_priority, dest_ip, dest_name, dest_priority</code></pre>
                        </div>
                        <p class="guide-explanation">OUTPUTNEW prevents overwriting if fields exist. Chain lookups for full context.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">View Available Asset/Identity Data</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| inputlookup asset_lookup_by_str | head 10
| inputlookup identity_lookup_expanded | head 10</code></pre>
                        </div>
                        <p class="guide-explanation">Explore what fields are available in your asset and identity data.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Key Asset Fields</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><code>ip</code> - IP address</li>
                            <li><code>dns</code> - Hostname</li>
                            <li><code>owner</code> - Responsible person/team</li>
                            <li><code>priority</code> - critical, high, medium, low</li>
                            <li><code>category</code> - server, workstation, network, etc.</li>
                            <li><code>bunit</code> - Business unit</li>
                            <li><code>pci_domain</code> - Compliance scope</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Key Identity Fields</div>
                    <div class="guide-detail-section">
                        <ul>
                            <li><code>identity</code> - Username (may have aliases)</li>
                            <li><code>first</code>, <code>last</code> - Full name</li>
                            <li><code>email</code> - Email address</li>
                            <li><code>managedBy</code> - Manager's identity</li>
                            <li><code>bunit</code> - Business unit/department</li>
                            <li><code>category</code> - normal, privileged, executive, service</li>
                            <li><code>watchlist</code> - Enhanced monitoring flag</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-callout warning">
                    <div class="guide-callout-title">Important</div>
                    <p>Asset and identity data is only as good as your data sources. If lookups return null, the asset/identity isn't in the system. Treat unknown assets as potentially suspicious.</p>
                </div>
            `
        },
        {
            id: 'es-threat-intel-match',
            title: 'How to find threat intelligence matches',
            description: 'Query for events matching known malicious indicators (IOCs).',
            keywords: 'threat intelligence IOC indicator IP domain hash match correlation',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You want to find events where your network touched known malicious IPs, domains, or file hashes from threat intelligence feeds.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Check for IP Matches</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=firewall
| lookup ip_intel ip as dest_ip OUTPUTNEW threat_key, description, threat_collection
| where isnotnull(threat_key)
| stats count by dest_ip, description, threat_collection
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">Find firewall connections to IPs in threat intel. threat_collection tells you which feed matched.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Check for Domain Matches</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=proxy
| eval domain=lower(url_domain)
| lookup domain_intel domain OUTPUTNEW threat_key, description
| where isnotnull(threat_key)
| table _time, src_ip, url, domain, description</code></pre>
                        </div>
                        <p class="guide-explanation">Find proxy connections to malicious domains. Lowercase the domain first for consistent matching.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Check for File Hash Matches</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>index=endpoint file_hash=*
| lookup file_intel file_hash OUTPUTNEW threat_key, description
| where isnotnull(threat_key)
| table _time, host, file_name, file_hash, description</code></pre>
                        </div>
                        <p class="guide-explanation">Find endpoint events with known malicious file hashes.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Browse Threat Intel Feeds</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| inputlookup ip_intel | stats count by threat_collection | sort -count
| inputlookup domain_intel | stats dc(domain) as domains by threat_collection
| inputlookup file_intel | stats dc(file_hash) as hashes by threat_collection</code></pre>
                        </div>
                        <p class="guide-explanation">See what feeds you have and how much coverage each provides.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Search for a Specific IOC</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| inputlookup ip_intel | search ip="185.220.101.*"
| inputlookup domain_intel | search domain="*malicious.com"
| inputlookup file_intel | search file_hash="a1b2c3d4..."</code></pre>
                        </div>
                        <p class="guide-explanation">Check if a specific indicator is in your threat intel.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using the Threat Activity Data Model</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| tstats count from datamodel=Threat_Activity
    by Threat_Activity.threat_match_field, Threat_Activity.threat_collection
| sort -count</code></pre>
                        </div>
                        <p class="guide-explanation">ES automatically populates the Threat_Activity data model with matches. tstats is faster for aggregate queries.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>Threat intel matches should generate risk events or notables automatically via correlation searches. If you're finding matches manually that weren't alerted, check your threat intel correlation search configuration.</p>
                </div>
            `
        },
        {
            id: 'es-tstats-datamodels',
            title: 'How to use tstats with ES data models',
            description: 'Write fast aggregate queries using ES accelerated data models.',
            keywords: 'tstats data model accelerated fast search authentication network endpoint',
            body: `
                <div class="guide-group">
                    <div class="guide-group-header">The Goal</div>
                    <div class="guide-detail-section">
                        <p>You need to search large volumes of data quickly. ES data models pre-normalize and accelerate data, making aggregate searches orders of magnitude faster.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Basic tstats Syntax</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| tstats count from datamodel=Authentication
    where Authentication.action=failure
    by Authentication.user</code></pre>
                        </div>
                        <p class="guide-explanation">Count failed authentications by user. Notice: field names use DataModel.field_name format.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Authentication Data Model</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| tstats count from datamodel=Authentication
    where Authentication.action=failure
    by Authentication.user, Authentication.src
| where count > 10</code></pre>
                        </div>
                        <p class="guide-explanation">Find users with more than 10 failed logins, grouped by source. Good for brute force detection.</p>
                        <div class="guide-detail-label">Key Authentication fields:</div>
                        <ul>
                            <li><code>action</code> - success, failure</li>
                            <li><code>user</code> - Username</li>
                            <li><code>src</code> - Source address</li>
                            <li><code>dest</code> - Destination system</li>
                            <li><code>app</code> - Application</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Network Traffic Data Model</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| tstats sum(All_Traffic.bytes) as total_bytes from datamodel=Network_Traffic
    by All_Traffic.src_ip, All_Traffic.dest_ip
| sort -total_bytes
| head 20</code></pre>
                        </div>
                        <p class="guide-explanation">Top talkers by bytes transferred. Much faster than querying raw firewall logs.</p>
                        <div class="guide-detail-label">Key Network_Traffic fields:</div>
                        <ul>
                            <li><code>src_ip</code>, <code>dest_ip</code> - IP addresses</li>
                            <li><code>src_port</code>, <code>dest_port</code> - Ports</li>
                            <li><code>bytes</code>, <code>bytes_in</code>, <code>bytes_out</code></li>
                            <li><code>action</code> - allowed, blocked</li>
                        </ul>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Endpoint (Processes) Data Model</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| tstats count from datamodel=Endpoint.Processes
    by Processes.process_name, Processes.user
| sort -count
| head 20</code></pre>
                        </div>
                        <p class="guide-explanation">Most common processes by user. Useful for baseline and anomaly detection.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">Using tstats with timechart</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| tstats prestats=true count from datamodel=Authentication
    by _time, Authentication.action span=1h
| timechart span=1h count by Authentication.action</code></pre>
                        </div>
                        <p class="guide-explanation">prestats=true is required before timechart or chart commands.</p>
                    </div>
                </div>

                <div class="guide-group">
                    <div class="guide-group-header">summariesonly Option</div>
                    <div class="guide-detail-section">
                        <div class="spl-block">
                            <pre class="spl-code"><code>| tstats summariesonly=true count from datamodel=Authentication by Authentication.user</code></pre>
                        </div>
                        <p class="guide-explanation"><code>summariesonly=true</code> = faster, only accelerated data (may miss recent events). <code>summariesonly=false</code> (default) = complete but slower.</p>
                    </div>
                </div>

                <div class="guide-callout tip">
                    <div class="guide-callout-title">Pro Tip</div>
                    <p>When building ES dashboards, always use tstats against data models for aggregate panels. Save raw index searches for drilldowns and detailed investigation.</p>
                </div>
            `
        }
    ]
};

// ============================================
// Guides Logic
// ============================================

let currentCategory = 'basics';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
    initGuides();
});

function initGuides() {
    // Export guides data for global search
    window.GUIDES_DATA = GUIDES_DATA;

    // Initialize tabs
    const tabController = SPLUNKed.initTabs('#guidesTabs', {
        storageKey: 'splunked-guides-tab',
        onTabChange: (category) => {
            currentCategory = category;
            renderGuides();
        }
    });

    // Handle URL parameters for deep linking
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');
    const openId = params.get('open');

    if (urlTab && GUIDES_DATA[urlTab]) {
        currentCategory = urlTab;
        if (tabController) {
            tabController.activateTab(urlTab);
        }
    }

    // Initialize search
    SPLUNKed.initSearch('guidesSearch', {
        onSearch: (query) => {
            currentSearch = query;
            renderAllCategories();
            updateEmptyState();
        }
    });

    // Initialize modal
    initGuideModal();

    // Render initial content
    renderAllCategories();

    // Add click handlers for cards
    document.addEventListener('click', handleGuideClick);

    // Open specific guide if requested via URL
    if (openId) {
        const guide = findGuideById(openId);
        if (guide) {
            // Slight delay to ensure DOM is ready
            setTimeout(() => openGuideModal(guide), 100);
        }
    }
}

// Find a guide by ID across all categories
function findGuideById(id) {
    for (const category of Object.keys(GUIDES_DATA)) {
        const guide = GUIDES_DATA[category].find(g => g.id === id);
        if (guide) return guide;
    }
    return null;
}

function renderAllCategories() {
    Object.keys(GUIDES_DATA).forEach(category => {
        renderCategoryGrid(category);
    });
}

function renderGuides() {
    renderCategoryGrid(currentCategory);
    updateEmptyState();
}

function renderCategoryGrid(category) {
    const grid = document.getElementById(`${category}Grid`);
    if (!grid) return;

    const guides = GUIDES_DATA[category] || [];
    const filtered = filterGuides(guides);

    grid.innerHTML = filtered.map(guide => createGuideCardHTML(guide)).join('');
}

function filterGuides(guides) {
    return guides.filter(guide => {
        if (currentSearch) {
            const searchable = [
                guide.title,
                guide.description,
                guide.keywords || ''
            ].join(' ').toLowerCase();

            return searchable.includes(currentSearch.toLowerCase());
        }
        return true;
    });
}

function createGuideCardHTML(guide) {
    return `
        <div class="guide-card" data-id="${guide.id}">
            <div class="guide-card-header">
            </div>
            <h3 class="guide-title">${escapeHtml(guide.title)}</h3>
            <p class="guide-description">${escapeHtml(guide.description)}</p>
            <button class="guide-open-btn">
                Open Guide
                <span class="btn-arrow">→</span>
            </button>
        </div>
    `;
}

function handleGuideClick(e) {
    const card = e.target.closest('.guide-card');
    if (!card) return;

    const btn = e.target.closest('.guide-open-btn');
    if (!btn && !e.target.closest('.guide-card-header')) {
        // Only open if clicking the button or card content
        if (!e.target.closest('.guide-open-btn')) {
            const clickedBtn = card.querySelector('.guide-open-btn');
            if (e.target !== clickedBtn && !clickedBtn.contains(e.target)) {
                return;
            }
        }
    }

    const id = card.dataset.id;

    // Find the guide across all categories
    for (const category of Object.keys(GUIDES_DATA)) {
        const guide = GUIDES_DATA[category].find(g => g.id === id);
        if (guide) {
            openGuideModal(guide);
            break;
        }
    }
}

function initGuideModal() {
    const modal = document.getElementById('guideModal');
    const overlay = document.getElementById('guideModalOverlay');
    const closeBtn = document.getElementById('guideModalClose');

    if (overlay) {
        overlay.addEventListener('click', closeGuideModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeGuideModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('open')) {
            closeGuideModal();
        }
    });
}

function openGuideModal(guide) {
    const modal = document.getElementById('guideModal');
    const title = document.getElementById('guideModalTitle');
    const body = document.getElementById('guideModalBody');

    if (!modal || !title || !body) return;

    title.textContent = guide.title;
    body.innerHTML = guide.body;

    // Apply SPL syntax highlighting
    if (window.SPLUNKed && SPLUNKed.applySPLHighlighting) {
        SPLUNKed.applySPLHighlighting(body);
    }

    // Initialize copy buttons
    initCopyButtons(body);

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeGuideModal() {
    const modal = document.getElementById('guideModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function initCopyButtons(container) {
    const copyButtons = container.querySelectorAll('.spl-copy');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const codeBlock = btn.closest('.spl-block').querySelector('code');
            if (codeBlock) {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    btn.classList.add('copied');
                    setTimeout(() => btn.classList.remove('copied'), 2000);
                });
            }
        });
    });
}

function updateEmptyState() {
    const emptyState = document.getElementById('guidesEmptyState');
    const currentGrid = document.getElementById(`${currentCategory}Grid`);

    if (!emptyState || !currentGrid) return;

    const hasResults = currentGrid.children.length > 0;
    emptyState.classList.toggle('hidden', hasResults);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
