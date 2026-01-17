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

    investigating: [
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
    // Initialize tabs
    SPLUNKed.initTabs('#guidesTabs', {
        storageKey: 'splunked-guides-tab',
        onTabChange: (category) => {
            currentCategory = category;
            renderGuides();
        }
    });

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
