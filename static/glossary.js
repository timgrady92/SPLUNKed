/**
 * SPLUNKed - Glossary Data and Logic
 * Contains all glossary entries organized by category
 */

// ============================================
// Glossary Data
// ============================================

const GLOSSARY_DATA = {
    commands: [
        {
            id: 'stats',
            name: 'stats',
            category: 'commands',
            subcategory: 'transforming',
            difficulty: 'beginner',
            takeaway: 'Aggregate data with statistical functions',
            what: 'Calculates aggregate statistics over search results, transforming events into a summary table.',
            why: 'Essential for summarizing data, creating reports, identifying patterns, and reducing large datasets to meaningful metrics.',
            syntax: 'stats <functions> [as <field>] [by <field-list>]',
            commonFunctions: ['count', 'sum', 'avg', 'min', 'max', 'dc', 'values', 'list', 'earliest', 'latest'],
            examples: [
                { spl: '... | stats count by src_ip', explanation: 'Count events per source IP' },
                { spl: '... | stats count by src_ip, dest_port | where count > 100', explanation: 'Find high-volume connections (potential scanning)' },
                { spl: '... | stats dc(dest_ip) as unique_targets by src_ip | where unique_targets > 50', explanation: 'Detect horizontal scanning' },
                { spl: '... | stats earliest(_time) as first, latest(_time) as last, values(action) as actions by user', explanation: 'Session summary with time bounds' }
            ],
            commonPipeline: {
                before: ['search', 'where', 'fields', 'eval'],
                after: ['sort', 'head', 'table', 'where', 'eval']
            },
            whenToUse: [
                'Counting or aggregating events into summary rows',
                'Finding unique values (dc) or collecting values (values, list)',
                'Calculating metrics like sum, avg, min, max across groups'
            ],
            whenNotToUse: [
                'Need time-series visualization → use timechart',
                'Need to keep original events while adding aggregates → use eventstats',
                'Need running totals or window functions → use streamstats',
                'Need two grouping dimensions for charting → use chart'
            ],
            performance: 'Efficient for most uses. High-cardinality "by" fields increase memory. Very high cardinality (>1M unique values) may need alternative approaches.',
            gotchas: [
                'Null values excluded from calculations - use fillnull first if needed',
                'Use "dc" not "distinct_count" (common typo)',
                'Results unordered - add | sort if order matters',
                'values() returns multivalue field; list() preserves duplicates'
            ],
            relatedCommands: ['eventstats', 'streamstats', 'chart', 'timechart', 'top', 'rare'],
            advancedPatterns: [
                { pattern: 'Nested aggregation', spl: '... | stats count by user | stats avg(count) as avg_events_per_user' },
                { pattern: 'Conditional counting', spl: '... | stats count(eval(action="failure")) as failures, count as total by user' },
                { pattern: 'Time windowing', spl: '... | bin _time span=1h | stats count by _time, src_ip' }
            ],
            internals: 'Map-reduce across indexers; partial results combined on search head.'
        },
        {
            id: 'eval',
            name: 'eval',
            category: 'commands',
            subcategory: 'manipulating',
            difficulty: 'beginner',
            takeaway: 'Create or modify fields with expressions',
            what: 'Calculates an expression and puts the resulting value into a new or existing field.',
            why: 'Core command for data transformation, field creation, conditional logic, and mathematical calculations.',
            syntax: 'eval field=expression [, field=expression]...',
            examples: [
                { spl: '... | eval duration_mins=duration/60', explanation: 'Convert seconds to minutes' },
                { spl: '... | eval status=if(code>=400, "error", "ok")', explanation: 'Conditional field creation' },
                { spl: '... | eval fullname=first." ".last', explanation: 'Concatenate strings' }
            ],
            performance: 'Fast operation. Multiple eval statements can be combined for efficiency.',
            gotchas: [
                'Field names are case-sensitive',
                'Use double-quotes for strings, not single quotes',
                'Eval overwrites existing fields without warning'
            ],
            relatedCommands: ['where', 'rex', 'rename', 'fields'],
            advancedPatterns: [
                { pattern: 'Multiple fields at once', spl: '... | eval mb=bytes/1024/1024, gb=mb/1024' },
                { pattern: 'Case statement', spl: '... | eval severity=case(code<400,"info",code<500,"warn",true(),"error")' }
            ]
        },
        {
            id: 'search',
            name: 'search',
            category: 'commands',
            subcategory: 'searching',
            difficulty: 'beginner',
            takeaway: 'Filter events based on search criteria',
            what: 'Filters search results to only include events matching the specified criteria.',
            why: 'Fundamental command for narrowing down results. Can be used at any point in the search pipeline.',
            syntax: 'search <search-expression>',
            examples: [
                { spl: '... | search status=error', explanation: 'Filter to error events only' },
                { spl: '... | search src_ip=10.* NOT dest_ip=10.*', explanation: 'Complex boolean logic' },
                { spl: '... | search "login failed"', explanation: 'Full-text search in results' }
            ],
            performance: 'Most efficient when used early in the search. Filtering before transformations reduces data volume.',
            gotchas: [
                'Implicit at the start of any search (you can omit "search" at the beginning)',
                'Case-insensitive for field values by default',
                'Wildcards (*) work in field values'
            ],
            relatedCommands: ['where', 'dedup', 'head', 'tail']
        },
        {
            id: 'where',
            name: 'where',
            category: 'commands',
            subcategory: 'searching',
            difficulty: 'intermediate',
            takeaway: 'Filter with eval-style expressions',
            what: 'Filters results using eval-like boolean expressions, allowing for more complex logic than the search command.',
            why: 'Enables mathematical comparisons, function calls, and complex conditions not possible with basic search.',
            syntax: 'where <eval-expression>',
            examples: [
                { spl: '... | where bytes > 1000000', explanation: 'Numeric comparison' },
                { spl: '... | where like(user, "admin%")', explanation: 'Pattern matching with like()' },
                { spl: '... | where isnull(error_code)', explanation: 'Check for null values' }
            ],
            performance: 'Slightly slower than search for simple comparisons. Use search for basic field=value filters.',
            gotchas: [
                'Field names are case-sensitive (unlike search)',
                'String comparisons are case-sensitive',
                'Use like() or match() for pattern matching, not wildcards'
            ],
            relatedCommands: ['search', 'eval', 'fillnull']
        },
        {
            id: 'table',
            name: 'table',
            category: 'commands',
            subcategory: 'manipulating',
            difficulty: 'beginner',
            takeaway: 'Display specific fields in table format',
            what: 'Creates a table with only the specified fields, in the order specified.',
            why: 'Essential for creating clean output, reports, and focusing on relevant fields.',
            syntax: 'table <field-list>',
            examples: [
                { spl: '... | table _time, src_ip, dest_ip, action', explanation: 'Select specific fields' },
                { spl: '... | table host, count, percent', explanation: 'Format stats output' }
            ],
            performance: 'Placing table at the end is slightly more efficient than early field removal.',
            gotchas: [
                'Fields not in the list are removed from results',
                'Order of fields matters - matches your specified order',
                'Does not deduplicate - use dedup if needed'
            ],
            relatedCommands: ['fields', 'rename', 'format']
        },
        {
            id: 'timechart',
            name: 'timechart',
            category: 'commands',
            subcategory: 'transforming',
            difficulty: 'intermediate',
            takeaway: 'Create time-series charts and analysis',
            what: 'Creates a statistical aggregation against time, perfect for visualizing trends over time.',
            why: 'Critical for trend analysis, anomaly detection, and creating time-based visualizations.',
            syntax: 'timechart [span=<time>] <stats-function> [by <field>]',
            examples: [
                { spl: '... | timechart span=1h count', explanation: 'Hourly event count' },
                { spl: '... | timechart span=5m avg(response_time) by service', explanation: 'Response time trends by service' },
                { spl: '... | timechart span=1d sum(bytes) as daily_bytes', explanation: 'Daily byte transfer totals' }
            ],
            performance: 'The span affects result size. Larger spans = fewer data points = faster.',
            gotchas: [
                'Default span is auto-calculated based on time range',
                'The "by" clause is limited to one field',
                'Use "limit" option to control series count: timechart limit=10'
            ],
            relatedCommands: ['chart', 'stats', 'bucket', 'bin'],
            advancedPatterns: [
                { pattern: 'Percentage over time', spl: '... | timechart span=1h count(eval(status="error")) as errors, count as total | eval error_rate=errors/total*100' }
            ]
        },
        {
            id: 'rex',
            name: 'rex',
            category: 'commands',
            subcategory: 'manipulating',
            difficulty: 'intermediate',
            takeaway: 'Extract fields using regular expressions',
            what: 'Uses regular expressions to extract fields from event data or modify field values.',
            why: 'Essential for parsing unstructured data, extracting embedded values, and advanced field manipulation.',
            syntax: 'rex [field=<field>] "<regex-with-named-groups>"',
            examples: [
                { spl: '... | rex field=_raw "user=(?<username>\\w+)"', explanation: 'Extract username from raw event' },
                { spl: '... | rex field=url "(?<domain>[^/]+)"', explanation: 'Extract domain from URL' },
                { spl: '... | rex mode=sed field=email "s/@.*//"', explanation: 'Modify field with sed mode' }
            ],
            performance: 'Regex processing is CPU-intensive. Use indexed extractions for high-volume data.',
            gotchas: [
                'Named groups use (?<fieldname>pattern) syntax',
                'Backslashes need escaping in SPL: use \\\\d not \\d',
                'mode=sed allows substitution operations'
            ],
            relatedCommands: ['eval', 'erex', 'kvform', 'extract'],
            advancedPatterns: [
                { pattern: 'Multiple extractions', spl: '... | rex "src=(?<src>\\S+).*dst=(?<dst>\\S+)"' },
                { pattern: 'Extract with max_match', spl: '... | rex max_match=0 "(?<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)"' }
            ]
        },
        {
            id: 'dedup',
            name: 'dedup',
            category: 'commands',
            subcategory: 'searching',
            difficulty: 'beginner',
            takeaway: 'Remove duplicate events',
            what: 'Removes duplicate events based on specified fields, keeping only the first occurrence.',
            why: 'Useful for getting unique values, removing redundant events, and simplifying result sets.',
            syntax: 'dedup [N] <field-list> [sortby <sort-field>]',
            examples: [
                { spl: '... | dedup user', explanation: 'One event per unique user' },
                { spl: '... | dedup src_ip, dest_ip', explanation: 'One event per IP pair' },
                { spl: '... | dedup 5 host sortby -_time', explanation: 'Keep 5 most recent per host' }
            ],
            performance: 'Memory-efficient for dedup on low-cardinality fields. High cardinality can be expensive.',
            gotchas: [
                'By default keeps the first event - use sortby to control which',
                'Consecutive option only removes adjacent duplicates',
                'Does not work on null values'
            ],
            relatedCommands: ['sort', 'head', 'uniq', 'stats dc()']
        },
        {
            id: 'join',
            name: 'join',
            category: 'commands',
            subcategory: 'joining',
            difficulty: 'advanced',
            takeaway: 'Combine results from subsearches',
            what: 'Combines the results of a main search with the results of a subsearch based on matching field values.',
            why: 'Enables correlation between different data sources or enrichment of results with additional context.',
            syntax: 'join [type=inner|outer|left] <field-list> [subsearch]',
            examples: [
                { spl: '... | join user [search index=hr | table user, department]', explanation: 'Enrich with HR data' },
                { spl: '... | join type=left src_ip [search index=assets | table ip as src_ip, hostname]', explanation: 'Left join with asset data' }
            ],
            performance: 'Subsearch results limited to 50K rows by default. Can be memory-intensive.',
            gotchas: [
                'Subsearch must complete first - can be slow',
                'Default is inner join - non-matching events are dropped',
                'Consider using lookups for static data instead'
            ],
            relatedCommands: ['append', 'appendcols', 'lookup', 'stats'],
            advancedPatterns: [
                { pattern: 'Time-windowed join', spl: '... | join user [search earliest=-1h latest=now index=auth]' }
            ],
            internals: 'Subsearch results held in memory. For large joins, consider alternatives like stats or lookups.'
        },
        {
            id: 'lookup',
            name: 'lookup',
            category: 'commands',
            subcategory: 'lookup',
            difficulty: 'intermediate',
            takeaway: 'Enrich events with external data',
            what: 'Enriches events with fields from an external lookup table based on matching field values.',
            why: 'Essential for adding context, mapping codes to descriptions, and enriching events with reference data.',
            syntax: 'lookup <lookup-name> <lookup-field> [AS <event-field>] [OUTPUT <output-fields>]',
            examples: [
                { spl: '... | lookup user_info user OUTPUT department, manager', explanation: 'Add user details' },
                { spl: '... | lookup geo_ip ip as src_ip OUTPUT country, city', explanation: 'GeoIP enrichment' },
                { spl: '... | lookup status_codes code OUTPUTNEW description', explanation: 'Only add if field missing' }
            ],
            performance: 'Very efficient for static data. Lookup files are cached in memory.',
            gotchas: [
                'Lookup must be defined in transforms.conf or via GUI',
                'OUTPUTNEW prevents overwriting existing fields',
                'Case-sensitivity depends on lookup configuration'
            ],
            relatedCommands: ['inputlookup', 'outputlookup', 'join'],
            advancedPatterns: [
                { pattern: 'Lookup with wildcards', spl: '... | lookup threat_intel domain OUTPUTNEW threat_type' }
            ]
        }
    ],

    functions: [
        {
            id: 'if',
            name: 'if()',
            category: 'functions',
            subcategory: 'conditional',
            difficulty: 'beginner',
            takeaway: 'Conditional value selection',
            what: 'Returns one value if the condition is true, another if false.',
            why: 'Core function for conditional logic, data classification, and field creation based on criteria.',
            syntax: 'if(condition, value_if_true, value_if_false)',
            examples: [
                { spl: '| eval status=if(code>=400, "error", "ok")', explanation: 'Classify by status code' },
                { spl: '| eval size=if(bytes>1000000, "large", "small")', explanation: 'Categorize by size' },
                { spl: '| eval risk=if(isnull(user), "unknown", "identified")', explanation: 'Handle nulls' }
            ],
            gotchas: [
                'Condition must evaluate to boolean true/false',
                'Nested if() statements can become hard to read - use case() instead',
                'Both value expressions are evaluated - be careful with expensive functions'
            ],
            relatedCommands: ['case', 'coalesce', 'validate']
        },
        {
            id: 'case',
            name: 'case()',
            category: 'functions',
            subcategory: 'conditional',
            difficulty: 'intermediate',
            takeaway: 'Multiple condition evaluation',
            what: 'Evaluates multiple conditions and returns the value associated with the first true condition.',
            why: 'Cleaner alternative to nested if() statements for multi-way conditionals.',
            syntax: 'case(condition1, value1, condition2, value2, ..., true(), default_value)',
            examples: [
                { spl: '| eval severity=case(level<3,"low", level<7,"medium", level>=7,"high")', explanation: 'Multi-level classification' },
                { spl: '| eval category=case(port=80,"web", port=443,"https", port=22,"ssh", true(),"other")', explanation: 'Port categorization with default' }
            ],
            gotchas: [
                'Conditions are evaluated in order - first true wins',
                'Use true() as last condition for default value',
                'Returns null if no conditions match and no default provided'
            ],
            relatedCommands: ['if', 'coalesce', 'match']
        },
        {
            id: 'coalesce',
            name: 'coalesce()',
            category: 'functions',
            subcategory: 'conditional',
            difficulty: 'beginner',
            takeaway: 'Return first non-null value',
            what: 'Returns the first non-null value from a list of arguments.',
            why: 'Essential for handling missing data, providing defaults, and merging fields.',
            syntax: 'coalesce(value1, value2, ...)',
            examples: [
                { spl: '| eval user=coalesce(username, email, "unknown")', explanation: 'Fallback chain for user identity' },
                { spl: '| eval ip=coalesce(src_ip, client_ip, source)', explanation: 'Merge multiple IP fields' }
            ],
            gotchas: [
                'Empty string is not null - use nullif() to convert if needed',
                'Order matters - put preferred fields first',
                'All arguments evaluated - watch for expensive operations'
            ],
            relatedCommands: ['if', 'isnull', 'nullif', 'fillnull']
        },
        {
            id: 'strftime',
            name: 'strftime()',
            category: 'functions',
            subcategory: 'datetime',
            difficulty: 'intermediate',
            takeaway: 'Format timestamps as strings',
            what: 'Converts epoch time to a formatted date/time string.',
            why: 'Essential for human-readable time display, reporting, and time-based grouping.',
            syntax: 'strftime(time, format)',
            examples: [
                { spl: '| eval date=strftime(_time, "%Y-%m-%d")', explanation: 'Format as YYYY-MM-DD' },
                { spl: '| eval hour=strftime(_time, "%H")', explanation: 'Extract hour for analysis' },
                { spl: '| eval day_of_week=strftime(_time, "%A")', explanation: 'Get day name' }
            ],
            gotchas: [
                'Input must be epoch time (use strptime to convert strings first)',
                'Format codes are case-sensitive (%H vs %I for 24h vs 12h)',
                'Timezone is based on Splunk server unless specified'
            ],
            relatedCommands: ['strptime', 'now', 'relative_time'],
            advancedPatterns: [
                { pattern: 'Common formats', spl: '%Y-%m-%d %H:%M:%S (2024-01-15 14:30:00)' },
                { pattern: 'ISO 8601', spl: '%Y-%m-%dT%H:%M:%S%z' }
            ]
        },
        {
            id: 'mvcount',
            name: 'mvcount()',
            category: 'functions',
            subcategory: 'multivalue',
            difficulty: 'intermediate',
            takeaway: 'Count values in multivalue field',
            what: 'Returns the count of values in a multivalue field.',
            why: 'Essential for analyzing multivalue fields like lists of users, IPs, or events.',
            syntax: 'mvcount(multivalue_field)',
            examples: [
                { spl: '| eval ip_count=mvcount(src_ip)', explanation: 'Count IPs per event' },
                { spl: '| where mvcount(user) > 1', explanation: 'Find events with multiple users' }
            ],
            gotchas: [
                'Returns null if field is empty or null',
                'Single value fields return 1',
                'Use mvexpand to break apart multivalue fields'
            ],
            relatedCommands: ['mvindex', 'mvfilter', 'mvjoin', 'mvexpand']
        },
        {
            id: 'split',
            name: 'split()',
            category: 'functions',
            subcategory: 'string',
            difficulty: 'beginner',
            takeaway: 'Split string into multivalue field',
            what: 'Splits a string into a multivalue field based on a delimiter.',
            why: 'Essential for parsing delimited data, breaking apart compound fields.',
            syntax: 'split(string, delimiter)',
            examples: [
                { spl: '| eval parts=split(path, "/")', explanation: 'Split path into segments' },
                { spl: '| eval tags=split(tag_list, ",")', explanation: 'Parse comma-separated tags' }
            ],
            gotchas: [
                'Delimiter is literal, not regex',
                'Empty strings between delimiters are preserved',
                'Use mvindex() to access specific positions'
            ],
            relatedCommands: ['mvjoin', 'mvindex', 'rex']
        },
        {
            id: 'now',
            name: 'now()',
            category: 'functions',
            subcategory: 'datetime',
            difficulty: 'beginner',
            takeaway: 'Current time as epoch',
            what: 'Returns the current system time as an epoch timestamp.',
            why: 'Essential for calculating time differences, age of events, and time-based logic.',
            syntax: 'now()',
            examples: [
                { spl: '| eval age_seconds=now()-_time', explanation: 'Calculate event age' },
                { spl: '| eval age_hours=(now()-_time)/3600', explanation: 'Event age in hours' },
                { spl: '| where _time > now()-86400', explanation: 'Last 24 hours only' }
            ],
            gotchas: [
                'Returns epoch time (seconds since 1970)',
                'Fixed at search start time for consistency across the search',
                'For current time in display format, combine with strftime()'
            ],
            relatedCommands: ['relative_time', 'strftime', 'strptime']
        }
    ],

    extractions: [
        {
            id: 'rex_extraction',
            name: 'rex field extraction',
            category: 'extractions',
            difficulty: 'intermediate',
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
            id: 'erex_extraction',
            name: 'erex automatic extraction',
            category: 'extractions',
            difficulty: 'advanced',
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
            difficulty: 'beginner',
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
            id: 'spath_extraction',
            name: 'spath JSON/XML extraction',
            category: 'extractions',
            difficulty: 'intermediate',
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
        }
    ],

    fields: [
        {
            id: 'field_time',
            name: '_time',
            category: 'fields',
            subcategory: 'index-time',
            difficulty: 'beginner',
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
            difficulty: 'beginner',
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
            difficulty: 'beginner',
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
            difficulty: 'beginner',
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
            difficulty: 'beginner',
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
            difficulty: 'beginner',
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
        }
    ],

    concepts: [
        {
            id: 'concept_pipeline',
            name: 'Search Pipeline',
            category: 'concepts',
            difficulty: 'beginner',
            takeaway: 'Commands flow left to right via pipe (|)',
            what: 'SPL processes data through a pipeline where each command receives the output of the previous command.',
            why: 'Understanding the pipeline is fundamental to writing effective and efficient searches.',
            examples: [
                { spl: 'index=main | stats count by host | sort -count | head 10', explanation: 'Pipeline: search -> aggregate -> sort -> limit' }
            ],
            gotchas: [
                'Data flows left to right through the pipe',
                'Each command transforms or filters the data',
                'Order matters - filtering before aggregation is more efficient'
            ]
        },
        {
            id: 'concept_streaming',
            name: 'Streaming vs Transforming',
            category: 'concepts',
            difficulty: 'intermediate',
            takeaway: 'Understand command types for optimization',
            what: 'Streaming commands process events one at a time. Transforming commands require all events before producing results.',
            why: 'Understanding this distinction helps optimize search performance and troubleshoot issues.',
            examples: [
                { spl: 'Streaming: where, eval, rex, fields', explanation: 'Process each event independently' },
                { spl: 'Transforming: stats, sort, dedup, top', explanation: 'Need all events to compute results' }
            ],
            gotchas: [
                'Streaming commands can run on indexers (distributed)',
                'Transforming commands typically run on search head',
                'Place streaming commands before transforming for efficiency'
            ]
        },
        {
            id: 'concept_subsearch',
            name: 'Subsearches',
            category: 'concepts',
            difficulty: 'advanced',
            takeaway: 'Nested searches in square brackets',
            what: 'A search enclosed in square brackets that runs first and feeds results into the outer search.',
            why: 'Enables dynamic filtering, lookups, and correlation between different data sets.',
            syntax: 'search criteria [subsearch]',
            examples: [
                { spl: 'index=main [search index=alerts | return 100 src_ip]', explanation: 'Filter to IPs from alerts' },
                { spl: 'index=web user=[search index=hr department="IT" | return user]', explanation: 'Find web activity for IT users' }
            ],
            performance: 'Subsearch results limited to 10K results and 60 seconds by default. Can be a bottleneck.',
            gotchas: [
                'Subsearch runs first, then results injected into main search',
                'Use "return" command to format subsearch output',
                'Consider alternatives: join, lookup, or stats for large datasets'
            ]
        },
        {
            id: 'concept_accelerations',
            name: 'Search Acceleration',
            category: 'concepts',
            difficulty: 'advanced',
            takeaway: 'Pre-computed summaries for speed',
            what: 'Techniques like report acceleration and data model acceleration that pre-compute search results.',
            why: 'Essential for making dashboards and reports fast, especially over large datasets.',
            examples: [
                { spl: 'Report acceleration: Saved search results cached', explanation: 'Scheduled pre-computation' },
                { spl: 'Data model acceleration: tstats uses accelerated data models', explanation: 'Much faster than raw search' }
            ],
            performance: 'Accelerated searches can be 10-100x faster but require storage for summaries.',
            gotchas: [
                'Acceleration takes time to build initially',
                'Summaries consume disk space',
                'Not all searches can be accelerated'
            ]
        }
    ],

    cim: [
        {
            id: 'cim_overview',
            name: 'Common Information Model',
            category: 'cim',
            difficulty: 'intermediate',
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
            id: 'cim_authentication',
            name: 'Authentication Data Model',
            category: 'cim',
            difficulty: 'intermediate',
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
            id: 'cim_network',
            name: 'Network Traffic Data Model',
            category: 'cim',
            difficulty: 'intermediate',
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
        },
        {
            id: 'cim_endpoint',
            name: 'Endpoint Data Model',
            category: 'cim',
            difficulty: 'advanced',
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
        }
    ],

    macros: [
        {
            id: 'macro_basics',
            name: 'Macro Basics',
            category: 'macros',
            difficulty: 'intermediate',
            takeaway: 'Reusable search snippets',
            what: 'Named search fragments that can be reused across multiple searches using backtick syntax.',
            why: 'Promotes code reuse, consistency, and maintainability across searches and dashboards.',
            syntax: '`macro_name` or `macro_name(arg1, arg2)`',
            examples: [
                { spl: '`security_index` | stats count by user', explanation: 'Macro for index/filter' },
                { spl: '`get_user_activity(jsmith)`', explanation: 'Macro with argument' }
            ],
            gotchas: [
                'Defined in macros.conf or via Settings > Advanced search > Search macros',
                'Arguments use $arg$ syntax in definition',
                'Macros can call other macros (nesting limit applies)'
            ]
        },
        {
            id: 'lookup_basics',
            name: 'Lookup Tables',
            category: 'macros',
            difficulty: 'beginner',
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
            difficulty: 'advanced',
            takeaway: 'Parameterized search templates',
            what: 'Macros can accept arguments that are substituted at search time.',
            why: 'Enables flexible, reusable search patterns with customizable parameters.',
            syntax: 'Macro definition: args = arg1, arg2  |  Usage: `macro(value1, value2)`',
            examples: [
                { spl: 'Definition: index=$index$ user=$user$ | Call: `search_user(main, admin)`', explanation: 'Index and user as params' },
                { spl: 'Definition: earliest=-$hours$h latest=now | Call: `last_hours(24)`', explanation: 'Time-based macro' }
            ],
            gotchas: [
                'Argument count in name: macro_name(2) means 2 arguments',
                'Arguments are string substitution - quote carefully',
                'Validate arguments to prevent injection'
            ]
        },
        {
            id: 'kvstore_lookup',
            name: 'KV Store Lookups',
            category: 'macros',
            difficulty: 'advanced',
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
        }
    ],

    antipatterns: [
        {
            id: 'antipattern_subsearch',
            name: 'Subsearch Overuse',
            category: 'antipatterns',
            difficulty: 'intermediate',
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
            difficulty: 'beginner',
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
            difficulty: 'beginner',
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
            difficulty: 'intermediate',
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
            difficulty: 'advanced',
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
    ]
};

// ============================================
// Glossary Logic
// ============================================

let currentCategory = 'commands';
let currentFilter = 'all';
let currentSearch = '';
let currentView = 'categorized';

document.addEventListener('DOMContentLoaded', () => {
    initGlossary();
});

function initGlossary() {
    // Initialize tabs
    SPLUNKed.initTabs('#glossaryTabs', {
        storageKey: 'splunked-glossary-tab',
        onTabChange: (category) => {
            currentCategory = category;
            renderGlossary();
        }
    });

    // Initialize search
    SPLUNKed.initSearch('glossarySearch', {
        onSearch: (query) => {
            currentSearch = query;
            renderGlossary();
        }
    });

    // Initialize filter
    SPLUNKed.initFilter('difficultyFilter', {
        onChange: (value) => {
            currentFilter = value;
            renderGlossary();
        }
    });

    // Initialize view toggle
    SPLUNKed.initViewToggle('glossaryView', {
        storageKey: 'splunked-glossary-view',
        onViewChange: (view) => {
            currentView = view;
            renderGlossary();
        }
    });

    // Initialize modal
    SPLUNKed.initModal('glossaryModal');

    // Render initial content
    renderAllCategories();

    // Add click handlers for cards
    document.addEventListener('click', handleCardClick);
}

function renderAllCategories() {
    Object.keys(GLOSSARY_DATA).forEach(category => {
        renderCategoryGrid(category);
    });
}

function renderGlossary() {
    renderCategoryGrid(currentCategory);
    updateEmptyState();
}

function renderCategoryGrid(category) {
    const grid = document.getElementById(`${category}Grid`);
    if (!grid) return;

    const entries = GLOSSARY_DATA[category] || [];
    const filtered = filterEntries(entries);

    if (currentView === 'alphabetical') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    grid.innerHTML = filtered.map(entry => createCardHTML(entry)).join('');
}

function filterEntries(entries) {
    return entries.filter(entry => {
        // Filter by difficulty
        if (currentFilter !== 'all' && entry.difficulty !== currentFilter) {
            return false;
        }

        // Filter by search
        if (currentSearch) {
            const searchable = [
                entry.name,
                entry.takeaway,
                entry.what,
                entry.why,
                entry.subcategory || ''
            ].join(' ').toLowerCase();

            return searchable.includes(currentSearch);
        }

        return true;
    });
}

function createCardHTML(entry) {
    return `
        <div class="glossary-card" data-id="${entry.id}" data-category="${entry.category}">
            <div class="glossary-card-header">
                <code class="glossary-name">${escapeHtml(entry.name)}</code>
                <span class="skill-badge ${entry.difficulty}">${entry.difficulty}</span>
            </div>
            <p class="glossary-takeaway">${escapeHtml(entry.takeaway)}</p>
            <button class="glossary-expand" aria-label="View details">
                <span class="expand-icon">+</span>
            </button>
        </div>
    `;
}

function handleCardClick(e) {
    const card = e.target.closest('.glossary-card');
    if (!card) return;

    const id = card.dataset.id;
    const category = card.dataset.category;
    const entry = GLOSSARY_DATA[category]?.find(e => e.id === id);

    if (entry) {
        openDetailModal(entry);
    }
}

function openDetailModal(entry) {
    const title = document.getElementById('glossaryModalTitle');
    const content = document.getElementById('glossaryModalContent');

    title.textContent = entry.name;
    content.innerHTML = createDetailHTML(entry);

    // Populate SPL code blocks with raw content (textContent auto-escapes)
    // Then highlighting will process them properly
    if (entry.syntax) {
        const syntaxEl = content.querySelector('.spl-example:not([data-pattern-index])');
        if (syntaxEl) syntaxEl.textContent = entry.syntax;
    }

    if (entry.examples) {
        entry.examples.forEach((ex, i) => {
            const codeEl = content.querySelector(`code[data-example-index="${i}"]`);
            if (codeEl) codeEl.textContent = ex.spl;
        });
    }

    if (entry.advancedPatterns) {
        entry.advancedPatterns.forEach((ap, i) => {
            const patternEl = content.querySelector(`pre[data-pattern-index="${i}"]`);
            if (patternEl) patternEl.textContent = ap.spl;
        });
    }

    // Apply syntax highlighting to SPL code blocks
    SPLUNKed.applySPLHighlighting(content);

    SPLUNKed.openModal('glossaryModal');
}

function createDetailHTML(entry) {
    let html = '';

    // Basic section (always visible)
    html += `
        <div class="detail-section">
            <div class="detail-label">What</div>
            <div class="detail-content">${escapeHtml(entry.what)}</div>
        </div>
        <div class="detail-section">
            <div class="detail-label">Why</div>
            <div class="detail-content">${escapeHtml(entry.why)}</div>
        </div>
    `;

    // Syntax - don't escapeHtml here, highlightSPL handles it
    if (entry.syntax) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Syntax</div>
                <pre class="spl-example"></pre>
            </div>
        `;
    }

    // Examples - don't escapeHtml for SPL, highlightSPL handles it
    if (entry.examples && entry.examples.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Examples</div>
                ${entry.examples.map((ex, i) => `
                    <div class="spl-block">
                        <pre class="spl-code"><code data-example-index="${i}"></code></pre>
                        <button class="spl-copy" aria-label="Copy to clipboard">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                        </button>
                    </div>
                    <p class="detail-content" style="margin-top: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem;">${escapeHtml(ex.explanation)}</p>
                `).join('')}
            </div>
        `;
    }

    // Common functions (for commands like stats)
    if (entry.commonFunctions && entry.commonFunctions.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Common Functions</div>
                <div class="detail-content">
                    ${entry.commonFunctions.map(f => `<code>${escapeHtml(f)}</code>`).join(', ')}
                </div>
            </div>
        `;
    }

    // Common pipeline (what comes before/after)
    if (entry.commonPipeline) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Common Pipeline</div>
                <div class="detail-content" style="font-size: 0.875rem;">
                    ${entry.commonPipeline.before ? `<div style="margin-bottom: 0.5rem;"><span style="color: var(--text-dim);">Before:</span> ${entry.commonPipeline.before.map(c => `<code>${escapeHtml(c)}</code>`).join(', ')}</div>` : ''}
                    ${entry.commonPipeline.after ? `<div><span style="color: var(--text-dim);">After:</span> ${entry.commonPipeline.after.map(c => `<code>${escapeHtml(c)}</code>`).join(', ')}</div>` : ''}
                </div>
            </div>
        `;
    }

    // When to use
    if (entry.whenToUse && entry.whenToUse.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-label" style="color: var(--splunk-green);">When to Use</div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${entry.whenToUse.map(w => `<li style="padding-left: 1rem; margin-bottom: 0.25rem; position: relative; font-size: 0.875rem;"><span style="position: absolute; left: 0; color: var(--splunk-green);">✓</span>${escapeHtml(w)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // When NOT to use
    if (entry.whenNotToUse && entry.whenNotToUse.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-label" style="color: var(--splunk-pink);">When NOT to Use</div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${entry.whenNotToUse.map(w => `<li style="padding-left: 1rem; margin-bottom: 0.25rem; position: relative; font-size: 0.875rem;"><span style="position: absolute; left: 0; color: var(--splunk-pink);">✗</span>${escapeHtml(w)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Performance notes (intermediate+)
    if (entry.performance) {
        html += `
            <div class="disclosure-section intermediate">
                <button class="disclosure-header" aria-expanded="false">
                    <span class="disclosure-level">Intermediate</span>
                    <span class="disclosure-title">Performance</span>
                    <span class="disclosure-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </span>
                </button>
                <div class="disclosure-content">
                    <p>${escapeHtml(entry.performance)}</p>
                </div>
            </div>
        `;
    }

    // Gotchas (intermediate+)
    if (entry.gotchas && entry.gotchas.length > 0) {
        html += `
            <div class="disclosure-section intermediate">
                <button class="disclosure-header" aria-expanded="false">
                    <span class="disclosure-level">Intermediate</span>
                    <span class="disclosure-title">Gotchas</span>
                    <span class="disclosure-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </span>
                </button>
                <div class="disclosure-content">
                    <ul style="list-style: none; padding: 0;">
                        ${entry.gotchas.map(g => `<li style="padding-left: 1rem; margin-bottom: 0.5rem; position: relative;"><span style="position: absolute; left: 0; color: var(--splunk-amber);">!</span>${escapeHtml(g)}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    // Advanced patterns (advanced+)
    if (entry.advancedPatterns && entry.advancedPatterns.length > 0) {
        html += `
            <div class="disclosure-section advanced">
                <button class="disclosure-header" aria-expanded="false">
                    <span class="disclosure-level">Advanced</span>
                    <span class="disclosure-title">Advanced Patterns</span>
                    <span class="disclosure-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </span>
                </button>
                <div class="disclosure-content">
                    ${entry.advancedPatterns.map((ap, i) => `
                        <p style="font-weight: 600; margin-bottom: 0.5rem;">${escapeHtml(ap.pattern)}</p>
                        <pre class="spl-example" data-pattern-index="${i}"></pre>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Internals (expert)
    if (entry.internals) {
        html += `
            <div class="disclosure-section expert">
                <button class="disclosure-header" aria-expanded="false">
                    <span class="disclosure-level">Expert</span>
                    <span class="disclosure-title">Internals</span>
                    <span class="disclosure-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </span>
                </button>
                <div class="disclosure-content">
                    <p>${escapeHtml(entry.internals)}</p>
                </div>
            </div>
        `;
    }

    // Related commands
    if (entry.relatedCommands && entry.relatedCommands.length > 0) {
        html += `
            <div class="detail-section" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <div class="detail-label">Related</div>
                <div class="detail-content">
                    ${entry.relatedCommands.map(c => `<code>${escapeHtml(c)}</code>`).join(', ')}
                </div>
            </div>
        `;
    }

    return html;
}

function updateEmptyState() {
    const grid = document.getElementById(`${currentCategory}Grid`);
    const emptyState = document.getElementById('emptyState');

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

// Initialize disclosure sections
document.addEventListener('click', (e) => {
    const header = e.target.closest('.disclosure-header');
    if (header) {
        const section = header.closest('.disclosure-section');
        if (section) {
            section.classList.toggle('expanded');
            header.setAttribute('aria-expanded', section.classList.contains('expanded'));
        }
    }
});
