/**
 * SPLUNKed - Glossary Data and Logic
 * Contains all glossary entries organized by category
 */

// ============================================
// Category Descriptions
// ============================================

const CATEGORY_INFO = {
    commands: {
        title: 'SPL Commands',
        description: 'Commands chained with pipes (|) to filter, transform, and format search results.'
    },
    functions: {
        title: 'Eval Functions',
        description: 'Functions for calculations, string manipulation, and conditional logic within eval and where commands.'
    },
    statsFunctions: {
        title: 'Stats Functions',
        description: 'Aggregation functions for stats, eventstats, streamstats, timechart, and chart commands.'
    }
};

// ============================================
// Purpose Labels (for "When you need to..." categories)
// ============================================

const PURPOSE_LABELS = {
    get: 'Get data',
    filter: 'Filter',
    transform: 'Transform',
    aggregate: 'Aggregate',
    combine: 'Combine',
    output: 'Output'
};

// Purpose labels for eval functions (organized by problem, not technical category)
const FUNCTION_PURPOSE_LABELS = {
    decide: 'Make decisions',
    missing: 'Handle missing data',
    text: 'Work with text',
    time: 'Work with time',
    numbers: 'Work with numbers',
    multivalue: 'Work with lists',
    validate: 'Check & validate'
};

// ============================================
// Tab Consolidation Mapping (2 tabs for SPL Glossary)
// ============================================

const TAB_CATEGORY_MAP = {
    commands: ['commands'],
    functions: ['functions', 'statsFunctions']
};

const TAB_INFO = {
    commands: CATEGORY_INFO.commands,
    functions: {
        title: 'Functions',
        description: 'Eval functions for calculations and string manipulation, plus aggregation functions for stats commands.'
    }
};

// Map from source categories to their parent tab
const CATEGORY_TO_TAB = {};
Object.entries(TAB_CATEGORY_MAP).forEach(([tab, categories]) => {
    categories.forEach(cat => CATEGORY_TO_TAB[cat] = tab);
});

// Subcategory labels for merged tabs
const SUBCATEGORY_LABELS = {
    functions: 'Eval Function',
    statsFunctions: 'Stats Function'
};

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
            purpose: 'aggregate',
            takeaway: 'Aggregate data with statistical functions',
            cardStyle: 'tabbed',
            relatedSection: { category: 'statsFunctions', label: 'View Stats Functions', shortLabel: 'Functions' },
            zones: {
                essential: {
                    what: 'Calculates aggregate statistics over search results, transforming events into a summary table.',
                    why: 'Essential for summarizing data, creating reports, identifying patterns, and reducing large datasets to meaningful metrics.',
                    syntax: 'stats <functions> [as <field>] [by <field-list>]',
                    example: { spl: '... | stats count by src_ip', explanation: 'Count events per source IP' }
                },
                practical: {
                    examples: [
                        { spl: '... | stats count by src_ip, dest_port | where count > 100', explanation: 'Find high-volume connections (potential scanning)' },
                        { spl: '... | stats dc(dest_ip) as unique_targets by src_ip | where unique_targets > 50', explanation: 'Detect horizontal scanning' },
                        { spl: '... | stats earliest(_time) as first, latest(_time) as last, values(action) as actions by user', explanation: 'Session summary with time bounds' },
                        { spl: '... | stats sum(bytes) as total_bytes, avg(bytes) as avg_bytes by host', explanation: 'Multiple aggregations in one command' }
                    ],
                    gotchas: [
                        'Null values excluded from calculations - use fillnull first if needed',
                        'Use "dc" not "distinct_count" (common typo)',
                        'Results unordered - add | sort if order matters',
                        'values() returns multivalue field; list() preserves duplicates'
                    ],
                    commonUses: [
                        'Counting or aggregating events into summary rows',
                        'Finding unique values (dc) or collecting values (values, list)',
                        'Calculating metrics like sum, avg, min, max across groups',
                        'Creating summary tables for dashboards and reports'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Nested aggregation', spl: '... | stats count by user | stats avg(count) as avg_events_per_user', explanation: 'Calculate average events per user' },
                        { name: 'Conditional counting', spl: '... | stats count(eval(action="failure")) as failures, count as total by user', explanation: 'Count subset while also counting total' },
                        { name: 'Time windowing', spl: '... | bin _time span=1h | stats count by _time, src_ip', explanation: 'Aggregate into time buckets before stats' }
                    ],
                    performance: 'Efficient for most uses. High-cardinality "by" fields increase memory. Very high cardinality (>1M unique values) may need alternative approaches.',
                    internals: 'Map-reduce across indexers; partial results combined on search head. Common functions: count, sum, avg, min, max, dc, values, list, earliest, latest.',
                    vsAlternatives: {
                        'eventstats': 'Adds stats as new fields while keeping all original events',
                        'streamstats': 'Running calculations as events stream - for cumulative totals',
                        'timechart': 'Use when you need time-series visualization',
                        'chart': 'Use when you need two grouping dimensions'
                    }
                }
            },
            relatedCommands: ['eventstats', 'streamstats', 'chart', 'timechart', 'top', 'rare']
        },
        {
            id: 'eval',
            name: 'eval',
            category: 'commands',
            subcategory: 'manipulating',
            purpose: 'transform',
            takeaway: 'Create or modify fields with expressions',
            cardStyle: 'tabbed',
            relatedSection: { category: 'functions', label: 'View Eval Functions', shortLabel: 'Functions' },
            zones: {
                essential: {
                    what: 'Calculates an expression and puts the resulting value into a new or existing field.',
                    why: 'Core command for data transformation, field creation, conditional logic, and mathematical calculations.',
                    syntax: 'eval field=expression [, field=expression]...',
                    example: { spl: '... | eval duration_mins=duration/60', explanation: 'Convert seconds to minutes' }
                },
                practical: {
                    examples: [
                        { spl: '... | eval status=if(code>=400, "error", "ok")', explanation: 'Conditional field creation' },
                        { spl: '... | eval fullname=first." ".last', explanation: 'Concatenate strings with dot operator' },
                        { spl: '... | eval mb=bytes/1024/1024, gb=mb/1024', explanation: 'Multiple fields at once' },
                        { spl: '... | eval severity=case(code<400,"info",code<500,"warn",true(),"error")', explanation: 'Multi-condition classification' }
                    ],
                    gotchas: [
                        'Field names are case-sensitive',
                        'Use double-quotes for strings, not single quotes',
                        'Eval overwrites existing fields without warning',
                        'Dot operator (.) concatenates strings, plus (+) is for math'
                    ],
                    commonUses: [
                        'Create calculated fields (ratios, conversions, durations)',
                        'Conditional logic with if() and case()',
                        'String manipulation and formatting',
                        'Combine or split field values'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Chained calculations', spl: '... | eval kb=bytes/1024, mb=kb/1024, size_label=if(mb>1, mb." MB", kb." KB")', explanation: 'Build on previous eval results' },
                        { name: 'Multivalue creation', spl: '... | eval all_ips=mvappend(src_ip, dest_ip)', explanation: 'Combine fields into multivalue' },
                        { name: 'Time calculations', spl: '... | eval age_days=round((now()-_time)/86400,1)', explanation: 'Calculate event age in days' }
                    ],
                    performance: 'Fast operation. Multiple eval statements can be combined for efficiency. Avoid repeated eval calls when one will do.',
                    internals: 'Eval expressions use a rich library of functions including mathematical, string, conditional, date/time, and multivalue functions.',
                    vsAlternatives: {
                        'rex': 'Use rex when extracting from text with regex patterns',
                        'where': 'Eval creates fields; where filters events using same expression syntax',
                        'lookup': 'Use lookup when values come from external reference data'
                    }
                }
            },
            relatedCommands: ['where', 'rex', 'rename', 'fields']
        },
        {
            id: 'search',
            name: 'search',
            category: 'commands',
            subcategory: 'searching',
            purpose: 'get',
            takeaway: 'Filter events based on search criteria',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Filters search results to only include events matching the specified criteria.',
                    why: 'Fundamental command for narrowing down results. Can be used at any point in the search pipeline.',
                    syntax: 'search <search-expression>',
                    example: { spl: '... | search status=error', explanation: 'Filter to error events only' }
                },
                practical: {
                    examples: [
                        { spl: '... | search src_ip=10.* NOT dest_ip=10.*', explanation: 'Complex boolean logic with wildcards' },
                        { spl: '... | search "login failed"', explanation: 'Full-text search in results' },
                        { spl: '... | search (status=error OR status=warning) host=prod*', explanation: 'Combine conditions with parentheses' },
                        { spl: 'index=security sourcetype=syslog error', explanation: 'Initial search (implicit search command)' }
                    ],
                    gotchas: [
                        'Implicit at the start of any search (you can omit "search" at the beginning)',
                        'Case-insensitive for field values by default',
                        'Wildcards (*) work in field values',
                        'Use AND, OR, NOT for boolean logic (AND is implicit between terms)'
                    ],
                    commonUses: [
                        'Filter to specific field values',
                        'Narrow down results after transformations',
                        'Combine multiple filter conditions',
                        'Full-text search within result data'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Field existence', spl: '... | search error_code=*', explanation: 'Find events where field exists' },
                        { name: 'Negation', spl: '... | search NOT (status=success OR status=info)', explanation: 'Exclude multiple values' },
                        { name: 'Time filtering', spl: '... | search earliest=-1h@h latest=@h', explanation: 'Time modifiers in search' }
                    ],
                    performance: 'Most efficient when used early in the search. Filtering before transformations reduces data volume significantly.',
                    internals: 'Search command uses Splunk\'s search language which is optimized for index-time filtering when possible.',
                    vsAlternatives: {
                        'where': 'Use where for numeric comparisons, function calls, and case-sensitive matching',
                        'dedup': 'Use dedup to remove duplicate events by field values',
                        'head/tail': 'Use for simple result limiting by count'
                    }
                }
            },
            relatedCommands: ['where', 'dedup', 'head', 'tail']
        },
        {
            id: 'where',
            name: 'where',
            category: 'commands',
            subcategory: 'searching',
            purpose: 'filter',
            takeaway: 'Filter with eval-style expressions',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Filters results using eval-like boolean expressions, allowing for more complex logic than the search command.',
                    why: 'Enables mathematical comparisons, function calls, and complex conditions not possible with basic search.',
                    syntax: 'where <eval-expression>',
                    example: { spl: '... | where bytes > 1000000', explanation: 'Numeric comparison (greater than 1MB)' }
                },
                practical: {
                    examples: [
                        { spl: '... | where like(user, "admin%")', explanation: 'Pattern matching with like()' },
                        { spl: '... | where isnull(error_code)', explanation: 'Check for null values' },
                        { spl: '... | where cidrmatch("10.0.0.0/8", src_ip)', explanation: 'CIDR matching for IP ranges' },
                        { spl: '... | stats count by user | where count > avg(count)', explanation: 'Compare to aggregate value' }
                    ],
                    gotchas: [
                        'Field names are case-sensitive (unlike search)',
                        'String comparisons are case-sensitive',
                        'Use like() or match() for pattern matching, not wildcards',
                        'Null comparisons require isnull()/isnotnull() functions'
                    ],
                    commonUses: [
                        'Numeric threshold filtering (bytes > X, count < Y)',
                        'Pattern matching with like() or match()',
                        'Null value checking',
                        'Post-stats filtering on calculated values'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Complex conditions', spl: '... | where (bytes > 1000000 AND duration < 10) OR priority="critical"', explanation: 'Combine multiple conditions' },
                        { name: 'Regex filtering', spl: '... | where match(url, "^/api/v[0-9]+/")', explanation: 'Full regex pattern matching' },
                        { name: 'Time comparison', spl: '... | where _time > relative_time(now(), "-1h@h")', explanation: 'Dynamic time filtering' }
                    ],
                    performance: 'Slightly slower than search for simple comparisons. Use search for basic field=value filters.',
                    internals: 'Where uses the same expression evaluator as eval, so all eval functions are available.',
                    vsAlternatives: {
                        'search': 'Use search for simple field=value, wildcards, and case-insensitive matching',
                        'eval': 'Eval creates fields; where filters using the same expression syntax',
                        'regex': 'Alternative for pure regex filtering on _raw'
                    }
                }
            },
            relatedCommands: ['search', 'eval', 'fillnull']
        },
        {
            id: 'table',
            name: 'table',
            category: 'commands',
            subcategory: 'manipulating',
            purpose: 'output',
            takeaway: 'Display specific fields in table format',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Creates a table with only the specified fields, in the order you specify.',
                    why: 'Essential for creating clean output, reports, and focusing on relevant fields.',
                    syntax: 'table <field1>, <field2>, ...',
                    example: { spl: '... | table _time, src_ip, dest_ip, action', explanation: 'Select and order specific fields' }
                },
                practical: {
                    examples: [
                        { spl: '... | table user, action, status', explanation: 'Clean output with just the fields you need' },
                        { spl: '... | stats count by host | table host, count', explanation: 'Format stats output for display' },
                        { spl: '... | table _time, src_ip, dest_*, bytes', explanation: 'Wildcards select multiple fields' }
                    ],
                    gotchas: [
                        'Fields not in the list are removed from results',
                        'Order of fields in table command = order in output',
                        'Does not deduplicate — use dedup if you need unique rows'
                    ],
                    commonUses: [
                        'Create clean output for reports and dashboards',
                        'Select specific fields after stats or other transformations',
                        'Reorder fields for readability'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Wildcard fields', spl: '... | table _time, *_ip, *_port', explanation: 'Select all fields matching a pattern' },
                        { name: 'Rename inline', spl: '... | table _time, src_ip AS "Source", dest_ip AS "Destination"', explanation: 'Rename fields in the table output' }
                    ],
                    performance: 'Table is a streaming command — very efficient. Place at the end to keep all fields available for earlier operations.',
                    internals: 'Table removes fields from the results and reorders remaining fields. Does not modify the underlying events.',
                    vsAlternatives: {
                        'fields': 'Removes or keeps fields but preserves original order',
                        'rename': 'Changes field names without removing other fields',
                        'format': 'Formats results as a single string for subsearches'
                    }
                }
            },
            relatedCommands: ['fields', 'rename', 'format']
        },
        {
            id: 'timechart',
            name: 'timechart',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'aggregate',
            takeaway: 'Create time-series charts and analysis',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Creates a statistical aggregation against time, perfect for visualizing trends over time.',
                    why: 'Critical for trend analysis, anomaly detection, and creating time-based visualizations.',
                    syntax: 'timechart [span=<time>] <stats-function> [by <field>]',
                    example: { spl: '... | timechart span=1h count', explanation: 'Hourly event count' }
                },
                practical: {
                    examples: [
                        { spl: '... | timechart span=5m avg(response_time) by service', explanation: 'Response time trends by service' },
                        { spl: '... | timechart span=1d sum(bytes) as daily_bytes', explanation: 'Daily byte transfer totals' },
                        { spl: '... | timechart span=1h count by status limit=5', explanation: 'Top 5 status codes over time' },
                        { spl: '... | timechart span=15m dc(user) as unique_users', explanation: 'Unique user count over time' }
                    ],
                    gotchas: [
                        'Default span is auto-calculated based on time range',
                        'The "by" clause is limited to one field',
                        'Use "limit" option to control series count: timechart limit=10',
                        'Results automatically sorted by _time'
                    ],
                    commonUses: [
                        'Visualize event volume trends over time',
                        'Compare metrics across categories (by field)',
                        'Identify patterns, spikes, or anomalies in time-series data',
                        'Create dashboards showing historical trends'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Percentage over time', spl: '... | timechart span=1h count(eval(status="error")) as errors, count as total | eval error_rate=errors/total*100', explanation: 'Calculate error rate trend' },
                        { name: 'Multiple metrics', spl: '... | timechart span=1h avg(cpu) as avg_cpu, max(cpu) as peak_cpu by host', explanation: 'Multiple aggregations with split' },
                        { name: 'Fill gaps', spl: '... | timechart span=1h count | fillnull value=0', explanation: 'Fill missing time buckets with zero' }
                    ],
                    performance: 'The span affects result size. Larger spans = fewer data points = faster. Very small spans over large time ranges can be slow.',
                    internals: 'Timechart automatically bins _time and groups by the bin. The span determines bucket size.',
                    vsAlternatives: {
                        'chart': 'Use chart for non-time X-axis or multiple grouping dimensions',
                        'stats + bin': 'Manual approach: bin _time span=1h | stats ... by _time',
                        'tstats': 'Use tstats for accelerated data models - much faster on large datasets'
                    }
                }
            },
            relatedCommands: ['chart', 'stats', 'bucket', 'bin']
        },
        {
            id: 'rex',
            name: 'rex',
            category: 'commands',
            subcategory: 'manipulating',
            purpose: 'transform',
            takeaway: 'Extract fields using regular expressions',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Uses regular expressions to extract fields from event data or modify field values.',
                    why: 'Essential for parsing unstructured data, extracting embedded values, and advanced field manipulation.',
                    syntax: 'rex [field=<field>] "<regex-with-named-groups>"',
                    example: { spl: '... | rex field=_raw "user=(?<username>\\w+)"', explanation: 'Extract username from raw event' }
                },
                practical: {
                    examples: [
                        { spl: '... | rex field=url "(?<domain>[^/]+)"', explanation: 'Extract domain from URL' },
                        { spl: '... | rex mode=sed field=email "s/@.*//"', explanation: 'Modify field with sed mode' },
                        { spl: '... | rex "src=(?<src>\\S+).*dst=(?<dst>\\S+)"', explanation: 'Extract multiple fields at once' },
                        { spl: '... | rex max_match=0 "(?<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)"', explanation: 'Extract all IP addresses (multivalue)' }
                    ],
                    gotchas: [
                        'Named groups use (?<fieldname>pattern) syntax',
                        'Backslashes need escaping in SPL: use \\\\d not \\d',
                        'mode=sed allows substitution operations',
                        'Default field is _raw if not specified'
                    ],
                    commonUses: [
                        'Extract values from unstructured log messages',
                        'Parse custom log formats',
                        'Clean or transform field values with sed mode',
                        'Extract multiple related fields in one pass'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'All matches', spl: '... | rex max_match=0 field=body "(?<email>[\\w.]+@[\\w.]+)"', explanation: 'Extract all email addresses into multivalue field' },
                        { name: 'Sed replacement', spl: '... | rex mode=sed field=path "s/\\\\/[0-9]+\\\\//\\\\/ID\\\\//"', explanation: 'Replace numeric IDs in paths' },
                        { name: 'Optional groups', spl: '... | rex "user=(?<user>\\S+)(?:\\s+session=(?<session>\\S+))?"', explanation: 'Handle optional parts of pattern' }
                    ],
                    performance: 'Regex processing is CPU-intensive. Use indexed extractions for high-volume data. Avoid overly complex regex patterns.',
                    internals: 'Rex uses PCRE regex syntax. Named capture groups become new fields. Without max_match, only first match is captured.',
                    vsAlternatives: {
                        'erex': 'Automatic regex generation from examples',
                        'spath': 'Use for JSON/XML structured data instead of regex',
                        'extract': 'Use for simple key=value parsing',
                        'eval + replace': 'Simpler for basic string replacement'
                    }
                }
            },
            relatedCommands: ['eval', 'erex', 'kvform', 'extract']
        },
        {
            id: 'dedup',
            name: 'dedup',
            category: 'commands',
            subcategory: 'searching',
            purpose: 'filter',
            takeaway: 'Remove duplicate events',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Removes duplicate events based on specified fields, keeping only the first occurrence.',
                    why: 'Get unique values, remove redundant events, and simplify result sets.',
                    syntax: 'dedup <field-list>',
                    example: { spl: '... | dedup user', explanation: 'One event per unique user' }
                },
                practical: {
                    examples: [
                        { spl: '... | dedup src_ip, dest_ip', explanation: 'One event per unique IP pair' },
                        { spl: '... | dedup host sortby -_time', explanation: 'Keep most recent event per host' },
                        { spl: '... | dedup 5 user sortby -_time', explanation: 'Keep 5 most recent events per user' }
                    ],
                    gotchas: [
                        'By default keeps the FIRST event found — use sortby to control which',
                        'Does not work on null values — nulls are ignored',
                        'High-cardinality fields (many unique values) can be memory-intensive'
                    ],
                    commonUses: [
                        'Get one representative event per entity (user, host, IP)',
                        'Remove repeated log entries or duplicate alerts',
                        'Find unique combinations of field values'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Keep N per group', spl: '... | dedup 3 src_ip sortby -bytes', explanation: 'Top 3 events by bytes for each source IP' },
                        { name: 'Consecutive only', spl: '... | dedup consecutive=true status', explanation: 'Only removes adjacent duplicates' },
                        { name: 'Keep empty values', spl: '... | dedup keepempty=true user', explanation: 'Include events where user is null' }
                    ],
                    performance: 'Memory-efficient for low-cardinality fields. Very high cardinality (millions of unique values) may need alternative approaches.',
                    internals: 'Dedup maintains a hash table of seen values. Events are checked against this table as they stream through.',
                    vsAlternatives: {
                        'stats dc()': 'Counts unique values without returning events',
                        'stats values()': 'Collects unique values into a multivalue field',
                        'uniq': 'Similar but only works on sorted, adjacent duplicates'
                    }
                }
            },
            relatedCommands: ['sort', 'head', 'uniq', 'stats']
        },
        {
            id: 'join',
            name: 'join',
            category: 'commands',
            subcategory: 'joining',
            purpose: 'combine',
            takeaway: 'Combine results from subsearches',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Combines the results of a main search with the results of a subsearch based on matching field values.',
                    why: 'Enables correlation between different data sources or enrichment of results with additional context.',
                    syntax: 'join [type=inner|outer|left] <field-list> [subsearch]',
                    example: { spl: '... | join user [search index=hr | table user, department]', explanation: 'Enrich with HR data' }
                },
                practical: {
                    examples: [
                        { spl: '... | join user [search index=hr | table user, department]', explanation: 'INNER (default): Only returns events where user exists in BOTH searches. Events without HR matches disappear.' },
                        { spl: '... | join type=left src_ip [search index=assets | table ip as src_ip, hostname]', explanation: 'LEFT: Keeps ALL events from main search. Adds hostname where found, leaves it blank where not. Use when you want to enrich but not lose events.' },
                        { spl: '... | join type=outer host [search index=inventory | table host, owner]', explanation: 'OUTER: Keeps ALL events from BOTH searches. Shows matches together, unmatched events appear separately. Use for "show me everything" comparisons.' }
                    ],
                    joinTypes: [
                        { type: 'inner', title: 'INNER (default)', description: 'Only matching records survive', scenario: 'Alert on failed logins, but only for users who exist in HR system', result: 'If user not in HR → event dropped' },
                        { type: 'left', title: 'LEFT', description: 'All main search events survive', scenario: 'Enrich firewall logs with asset info, keep all logs even if asset unknown', result: 'If asset not found → event kept, asset fields blank' },
                        { type: 'outer', title: 'OUTER', description: 'All events from both sides survive', scenario: 'Compare active users vs licensed users to find orphans on either side', result: 'Shows matched pairs + unmatched from both searches' }
                    ],
                    gotchas: [
                        'Default is INNER join — non-matching events silently disappear!',
                        'Use type=left when enriching data you cannot afford to lose',
                        'Subsearch must complete first — can be slow',
                        'Subsearch results limited to 50K rows by default',
                        'Consider using lookups for static data instead'
                    ],
                    commonUses: [
                        'Correlate events from different data sources',
                        'Enrich security events with asset or user context',
                        'Combine real-time data with historical baselines',
                        'Match events across different indexes'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Extended limits', spl: '... | join max=100000 user [search index=large ...]', explanation: 'Increase subsearch result limit' },
                        { name: 'Multi-field join', spl: '... | join src_ip, dest_ip [search index=flows | table src_ip, dest_ip, bytes]', explanation: 'Join on multiple fields' },
                        { name: 'Self-join pattern', spl: '... | join user [search index=auth action=login | table user, login_time]', explanation: 'Join events from same index' }
                    ],
                    performance: 'Subsearch results held in memory. Can be very memory-intensive. For large joins, consider alternatives like stats or lookups.',
                    internals: 'Join executes subsearch first, stores results in memory, then matches against main search results. This is why subsearch limits apply.',
                    vsAlternatives: {
                        'lookup': 'Much faster for static reference data - use lookups when possible',
                        'stats': 'For self-correlation: stats values() by key is often more efficient',
                        'append + stats': 'Alternative pattern: append results then use stats to merge',
                        'Subsearches': 'For simple value lists, subsearch with format may be faster'
                    }
                }
            },
            relatedCommands: ['append', 'appendcols', 'lookup', 'stats']
        },
        {
            id: 'lookup',
            name: 'lookup',
            category: 'commands',
            subcategory: 'lookup',
            purpose: 'combine',
            takeaway: 'Enrich events with external data',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Enriches events with fields from an external lookup table based on matching field values.',
                    why: 'Essential for adding context, mapping codes to descriptions, and enriching events with reference data.',
                    syntax: 'lookup <lookup-name> <lookup-field> [AS <event-field>] [OUTPUT <output-fields>]',
                    example: { spl: '... | lookup user_info user OUTPUT department, manager', explanation: 'Add user details' }
                },
                practical: {
                    examples: [
                        { spl: '... | lookup geo_ip ip as src_ip OUTPUT country, city', explanation: 'GeoIP enrichment with field mapping' },
                        { spl: '... | lookup status_codes code OUTPUTNEW description', explanation: 'Only add if field missing' },
                        { spl: '... | lookup assets.csv ip as dest_ip OUTPUT hostname, owner, criticality', explanation: 'Asset context enrichment' },
                        { spl: '... | lookup threat_intel.csv ioc as src_ip OUTPUTNEW threat_type, confidence', explanation: 'Threat intelligence matching' }
                    ],
                    gotchas: [
                        'Lookup must be defined in transforms.conf or via GUI',
                        'OUTPUTNEW prevents overwriting existing fields',
                        'Case-sensitivity depends on lookup configuration',
                        'Missing matches result in null output fields'
                    ],
                    commonUses: [
                        'Add user details (department, manager, location)',
                        'Enrich IPs with geographic or asset information',
                        'Map status codes to human-readable descriptions',
                        'Check against threat intelligence indicators'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Multiple field match', spl: '... | lookup permissions.csv user, role OUTPUT allowed_actions', explanation: 'Match on multiple fields' },
                        { name: 'Wildcard lookup', spl: '... | lookup threat_patterns.csv domain OUTPUTNEW threat_category', explanation: 'Lookups can support wildcards in data' },
                        { name: 'Time-based lookup', spl: '... | lookup local=true schedules.csv _time as start_time RANGE(start_time, end_time) OUTPUT maintenance_window', explanation: 'Time range matching (KV store)' }
                    ],
                    performance: 'Very efficient for static data. Lookup files are cached in memory. Much faster than join for reference data.',
                    internals: 'Lookups are defined in transforms.conf with reference to lookup files in $SPLUNK_HOME/etc/apps/<app>/lookups/. Can also use KV Store collections.',
                    vsAlternatives: {
                        'join': 'Use join when lookup data is dynamic or from another search',
                        'inputlookup': 'Use to read lookup as events (starting point of search)',
                        'iplocation': 'Built-in command for IP geolocation - no lookup needed',
                        'eval + case': 'For simple static mappings, eval may be simpler'
                    }
                }
            },
            relatedCommands: ['inputlookup', 'outputlookup', 'join']
        },
        {
            id: 'fields',
            name: 'fields',
            category: 'commands',
            subcategory: 'manipulating',
            purpose: 'output',
            takeaway: 'Keep or remove specific fields',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Keeps or removes fields from search results. By default keeps only specified fields; with minus sign removes specified fields.',
                    why: 'Reduce data volume early in searches, focus on relevant fields, and improve search performance.',
                    syntax: 'fields [+|-] <field-list>',
                    example: { spl: '... | fields src_ip, dest_ip, action', explanation: 'Keep only these three fields' }
                },
                practical: {
                    examples: [
                        { spl: '... | fields - _raw, _time', explanation: 'Remove _raw and _time, keep everything else' },
                        { spl: '... | fields + src_ip, dest_ip', explanation: 'Explicitly keep only these fields (+ is optional)' },
                        { spl: '... | fields src_*, dest_*', explanation: 'Wildcards to keep matching fields' },
                        { spl: 'index=web | fields status, uri | stats count by status', explanation: 'Reduce fields early for performance' }
                    ],
                    gotchas: [
                        'fields (no minus) removes all other fields — different from fields -',
                        'Place early in search to improve performance',
                        'Internal fields like _time, _raw need explicit inclusion if you want them'
                    ],
                    commonUses: [
                        'Reduce memory usage by dropping unneeded fields early',
                        'Prepare data for export with specific columns',
                        'Remove sensitive fields before displaying results'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Keep internal fields', spl: '... | fields _time, _raw, host, source', explanation: 'Must explicitly include internal fields' },
                        { name: 'Remove after enrichment', spl: '... | lookup geo ip | fields - lat, lon', explanation: 'Drop helper fields after lookup' }
                    ],
                    performance: 'Using fields early dramatically reduces memory and network traffic. One of the most impactful performance optimizations.',
                    internals: 'Fields operates at the metadata level, not modifying _raw. Removed fields are simply not passed to next command.',
                    vsAlternatives: {
                        'table': 'Also selects fields but formats as table output — use at end',
                        'rename': 'Changes field names rather than removing',
                        'eval': 'Use to create new fields, not remove existing ones'
                    }
                }
            },
            relatedCommands: ['table', 'rename', 'eval', 'stats']
        },
        {
            id: 'fieldsummary',
            name: 'fieldsummary',
            category: 'commands',
            subcategory: 'reporting',
            purpose: 'get',
            takeaway: 'Get statistics about your fields - counts, values, types',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Generates summary statistics for each field in your search results: count, distinct count, whether it\'s numeric, sample values, and more.',
                    why: 'Essential for data discovery. When you\'re unfamiliar with a data source, fieldsummary tells you what fields exist and what they contain.',
                    syntax: 'fieldsummary [maxvals=<int>] [<field-list>]',
                    example: { spl: 'index=security | fieldsummary', explanation: 'Explore all fields in security index' }
                },
                practical: {
                    examples: [
                        { spl: 'index=security earliest=-1h | fieldsummary | where count > 100', explanation: 'Fields with significant data' },
                        { spl: 'index=new_source | fieldsummary | table field, count, distinct_count, values', explanation: 'Explore a new data source' },
                        { spl: 'sourcetype=syslog | fieldsummary maxvals=10', explanation: 'Show up to 10 sample values per field' },
                        { spl: 'index=* user=admin | fieldsummary | search field=*ip*', explanation: 'Find IP-related fields' }
                    ],
                    gotchas: [
                        'Returns one row per field, not per event',
                        'maxvals controls how many sample values to show (default 100)',
                        'Only analyzes the events returned by your search',
                        'Large result sets can make fieldsummary slow - limit with head first'
                    ],
                    commonUses: [
                        'Exploring unfamiliar data sources',
                        'Finding which fields have data vs. are mostly empty',
                        'Discovering field names in new sourcetypes',
                        'Data quality assessment'
                    ]
                },
                deep: {
                    performance: 'Scans all returned events. For exploration, limit with head 10000 first.',
                    vsAlternatives: {
                        'stats dc()': 'Use stats dc(field) for specific field cardinality',
                        'top': 'Use top to see most common values of specific fields',
                        'metadata': 'Use metadata for index-level field info without searching events'
                    }
                }
            },
            relatedCommands: ['fields', 'stats', 'metadata', 'top']
        },
        {
            id: 'fillnull',
            name: 'fillnull',
            category: 'commands',
            subcategory: 'manipulating',
            purpose: 'transform',
            takeaway: 'Replace null values with a default',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Replaces null field values with a specified value (default is "0").',
                    why: 'Prevent null-related issues in calculations, create cleaner reports, and handle missing data gracefully.',
                    syntax: 'fillnull [value=<string>] [<field-list>]',
                    example: { spl: '... | fillnull value="N/A"', explanation: 'Replace all nulls with "N/A"' }
                },
                practical: {
                    examples: [
                        { spl: '... | fillnull value=0 bytes', explanation: 'Set null bytes to 0 for calculations' },
                        { spl: '... | fillnull value="unknown" user, host', explanation: 'Fill specific fields only' },
                        { spl: '... | stats sum(bytes) by user | fillnull value=0', explanation: 'Ensure no null values in stats output' }
                    ],
                    gotchas: [
                        'Default fill value is "0" (string zero)',
                        'Without field list, fills ALL null fields',
                        'Empty string ("") is different from null — fillnull won\'t replace empty strings'
                    ],
                    commonUses: [
                        'Prepare data for mathematical operations',
                        'Create cleaner reports and visualizations',
                        'Handle optional fields in data sources'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Conditional fill', spl: '... | eval user=coalesce(user, src_user, "unknown")', explanation: 'Use eval+coalesce for smarter defaults' },
                        { name: 'Fill before stats', spl: '... | fillnull value=0 count | stats sum(count) by host', explanation: 'Ensure all values included in aggregation' }
                    ],
                    performance: 'Minimal overhead — simple null check and replace operation.',
                    internals: 'Fillnull checks each specified field for null and replaces with the value. Does not modify _raw.',
                    vsAlternatives: {
                        'coalesce()': 'Returns first non-null value from multiple fields',
                        'isnull()/isnotnull()': 'Functions to test for null in eval/where',
                        'eval with if()': 'More control: eval field=if(isnull(field), "default", field)'
                    }
                }
            },
            relatedCommands: ['eval', 'coalesce', 'stats', 'chart']
        },
        {
            id: 'bin',
            name: 'bin',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'transform',
            takeaway: 'Group values into discrete buckets',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Groups continuous values into discrete bins or buckets. Works on time fields and numeric fields.',
                    why: 'Essential for creating histograms, time-based aggregations, and grouping numeric ranges.',
                    syntax: 'bin [span=<span>] <field> [AS <newfield>]',
                    example: { spl: '... | bin span=1h _time', explanation: 'Group events into 1-hour buckets' }
                },
                practical: {
                    examples: [
                        { spl: '... | bin span=5m _time | stats count by _time', explanation: '5-minute event counts' },
                        { spl: '... | bin span=100 bytes as byte_range | stats count by byte_range', explanation: 'Group bytes into ranges of 100' },
                        { spl: '... | bin bins=10 response_time | stats avg(response_time) by response_time', explanation: 'Auto-calculate 10 equal bins' },
                        { spl: '... | bin span=1d _time | timechart span=1d count', explanation: 'Daily aggregation' }
                    ],
                    gotchas: [
                        'bin is an alias for bucket — they are identical',
                        'For _time, span uses time notation (s, m, h, d, w, mon)',
                        'For numeric fields, span is a number representing bucket size',
                        'bins=N creates approximately N buckets with auto-calculated span'
                    ],
                    commonUses: [
                        'Create time-based aggregations before stats',
                        'Build histograms of numeric values',
                        'Reduce cardinality of continuous fields'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Log-scale buckets', spl: '... | eval log_bytes=log(bytes,10) | bin span=1 log_bytes', explanation: 'Logarithmic binning for wide ranges' },
                        { name: 'Align to boundaries', spl: '... | bin span=1h aligntime=@d _time', explanation: 'Align buckets to day boundaries' },
                        { name: 'Custom ranges', spl: '... | eval range=case(bytes<1000,"small",bytes<10000,"medium",true(),"large")', explanation: 'Use eval for custom non-uniform bins' }
                    ],
                    performance: 'Very efficient streaming operation. Reduces downstream cardinality which improves stats performance.',
                    internals: 'Bin truncates values to bucket boundaries. For time, rounds down to span start. For numbers, floors to nearest multiple.',
                    vsAlternatives: {
                        'timechart': 'Has built-in binning with span parameter',
                        'eval with case()': 'For non-uniform or custom bucket definitions',
                        'cluster': 'For automatic clustering of similar values'
                    }
                }
            },
            relatedCommands: ['timechart', 'stats', 'chart', 'eval']
        },
        {
            id: 'eventstats',
            name: 'eventstats',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'aggregate',
            takeaway: 'Add aggregations while keeping all events',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Calculates statistics and adds them as new fields to each event, without reducing the number of events.',
                    why: 'Compare individual events to group averages, add context to events, and enable row-level calculations with aggregates.',
                    syntax: 'eventstats <stats-function> [as <field>] [by <field-list>]',
                    example: { spl: '... | eventstats avg(bytes) as avg_bytes', explanation: 'Add overall average to each event' }
                },
                practical: {
                    examples: [
                        { spl: '... | eventstats avg(response_time) as avg_rt by service | eval deviation=response_time-avg_rt', explanation: 'Calculate deviation from service average' },
                        { spl: '... | eventstats count as total_events | eval pct=count/total_events*100', explanation: 'Calculate percentage of total' },
                        { spl: '... | eventstats max(bytes) as max_bytes by src_ip | where bytes=max_bytes', explanation: 'Find max event per source' },
                        { spl: '... | eventstats dc(dest_ip) as unique_dests by src_ip | where unique_dests > 100', explanation: 'Filter by group statistics' }
                    ],
                    gotchas: [
                        'Returns ALL original events — does not reduce like stats',
                        'Memory-intensive for large datasets with high cardinality by-fields',
                        'Statistics are calculated after all events are gathered',
                        'Cannot use streaming — waits for all results first'
                    ],
                    commonUses: [
                        'Compare individual values to group averages',
                        'Calculate percentages of totals',
                        'Add group-level context to individual events',
                        'Filter events based on aggregate thresholds'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Anomaly detection', spl: '... | eventstats avg(bytes) as avg, stdev(bytes) as std by host | where bytes > avg + 3*std', explanation: 'Find outliers beyond 3 standard deviations' },
                        { name: 'Ranking within groups', spl: '... | sort -bytes | eventstats count as rank by src_ip | where rank <= 5', explanation: 'Top 5 by bytes for each source' },
                        { name: 'Running comparison', spl: '... | eventstats avg(duration) as baseline | eval vs_baseline=round((duration/baseline-1)*100,1)."%"', explanation: 'Show percent vs baseline' }
                    ],
                    performance: 'Must process all events before returning results. Memory usage proportional to cardinality of by-fields.',
                    internals: 'Two-pass command: first pass calculates statistics, second pass adds them to events.',
                    vsAlternatives: {
                        'stats': 'Reduces to summary rows — use when you don\'t need original events',
                        'streamstats': 'Running calculations as events stream — lower memory but different semantics',
                        'appendcols': 'Alternative approach for adding aggregated columns'
                    }
                }
            },
            relatedCommands: ['stats', 'streamstats', 'eval', 'where']
        },
        {
            id: 'streamstats',
            name: 'streamstats',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'aggregate',
            takeaway: 'Running calculations as events stream',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Calculates statistics in a streaming manner, updating values as each event is processed.',
                    why: 'Calculate running totals, moving averages, row numbers, and cumulative statistics.',
                    syntax: 'streamstats [window=<N>] <stats-function> [as <field>] [by <field-list>]',
                    example: { spl: '... | streamstats count as row_number', explanation: 'Add sequential row numbers' }
                },
                practical: {
                    examples: [
                        { spl: '... | sort _time | streamstats sum(bytes) as running_total', explanation: 'Cumulative sum over time' },
                        { spl: '... | streamstats window=5 avg(response_time) as moving_avg', explanation: '5-event moving average' },
                        { spl: '... | streamstats count as rank by user | where rank <= 3', explanation: 'First 3 events per user' },
                        { spl: '... | sort _time | streamstats current=f window=1 last(status) as prev_status', explanation: 'Get previous event value' }
                    ],
                    gotchas: [
                        'Order matters — sort first if needed',
                        'current=f excludes current event from calculation (useful for previous values)',
                        'window=N limits calculation to last N events',
                        'Results depend on event order — different order = different results'
                    ],
                    commonUses: [
                        'Calculate running totals and cumulative sums',
                        'Compute moving averages for trend analysis',
                        'Number events sequentially within groups',
                        'Compare current event to previous values'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Time between events', spl: '... | sort _time | streamstats current=f window=1 last(_time) as prev_time | eval gap=_time-prev_time', explanation: 'Calculate time delta between events' },
                        { name: 'Detect value changes', spl: '... | streamstats current=f window=1 last(status) as prev_status | where status!=prev_status', explanation: 'Find state transitions' },
                        { name: 'Rate calculation', spl: '... | bin _time span=1m | stats sum(bytes) as bytes by _time | streamstats current=f window=1 last(bytes) as prev | eval rate=bytes-prev', explanation: 'Calculate change rate' },
                        { name: 'Reset on group', spl: '... | streamstats reset_on_change=true sum(bytes) as session_bytes by user, session_id', explanation: 'Reset accumulator when group changes' }
                    ],
                    performance: 'Memory efficient — only keeps window of events. Much better than eventstats for large datasets.',
                    internals: 'Single-pass streaming command. Maintains sliding window buffer and updates statistics as events flow through.',
                    vsAlternatives: {
                        'eventstats': 'Uses ALL events for calculation — when you need overall statistics',
                        'autoregress': 'Specialized for accessing previous event values',
                        'accum': 'Simple running total — streamstats sum() is more flexible'
                    }
                }
            },
            relatedCommands: ['eventstats', 'stats', 'autoregress', 'accum', 'delta']
        },
        {
            id: 'top',
            name: 'top',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'aggregate',
            takeaway: 'Find most common values',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns the most frequent values for specified fields, with count and percentage.',
                    why: 'Quickly identify the most common values in your data — users, IPs, status codes, etc.',
                    syntax: 'top [N] <field-list> [by <field>]',
                    example: { spl: '... | top src_ip', explanation: 'Top 10 source IPs by frequency (default N=10)' }
                },
                practical: {
                    examples: [
                        { spl: '... | top 5 user', explanation: 'Top 5 most active users' },
                        { spl: '... | top limit=20 src_ip, dest_port', explanation: 'Top 20 IP/port combinations' },
                        { spl: '... | top status by host', explanation: 'Most common status per host' },
                        { spl: '... | top useother=t limit=5 action', explanation: 'Top 5 plus "OTHER" for rest' }
                    ],
                    gotchas: [
                        'Default limit is 10 — use limit=N or just N to change',
                        'Automatically adds count and percent fields',
                        'countfield=, percentfield=, showcount=, showperc= control output fields',
                        'useother=t adds row for all non-top values'
                    ],
                    commonUses: [
                        'Find top talkers (most active IPs, users)',
                        'Identify most common errors or status codes',
                        'Quick frequency analysis of categorical fields'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Top with suppressed fields', spl: '... | top limit=10 user showperc=f', explanation: 'Remove percentage column' },
                        { name: 'Rename output fields', spl: '... | top src_ip countfield=events percentfield=pct', explanation: 'Custom output field names' },
                        { name: 'Top by time period', spl: '... | bin _time span=1h | top limit=3 src_ip by _time', explanation: 'Top 3 per hour' }
                    ],
                    performance: 'Efficient for finding top values — does not require full sort of all results.',
                    internals: 'Uses heap-based algorithm to track top N values without sorting entire dataset.',
                    vsAlternatives: {
                        'rare': 'Opposite of top — returns least common values',
                        'stats count by': 'More control but requires explicit sort afterwards',
                        'timechart': 'For top values over time, use timechart with limit parameter'
                    }
                }
            },
            relatedCommands: ['rare', 'stats', 'sort', 'timechart']
        },
        {
            id: 'tail',
            name: 'tail',
            category: 'commands',
            subcategory: 'filtering',
            purpose: 'filter',
            takeaway: 'Return last N results',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns only the last N events from your search results.',
                    why: 'View the oldest events in time-ordered results or get the bottom N after sorting.',
                    syntax: 'tail [N]',
                    example: { spl: '... | tail 10', explanation: 'Last 10 results' }
                },
                practical: {
                    examples: [
                        { spl: '... | tail', explanation: 'Last 10 results (default)' },
                        { spl: '... | tail 50', explanation: 'Last 50 results' },
                        { spl: '... | sort -bytes | tail 10', explanation: 'Bottom 10 by bytes (smallest)' },
                        { spl: '... | sort _time | tail 5', explanation: 'Most recent 5 events (after sorting oldest-first)' }
                    ],
                    gotchas: [
                        'Must wait for all results before returning — not streaming',
                        'Default N is 10 like head',
                        'Remember: tail returns LAST events, so "oldest" depends on sort order'
                    ],
                    commonUses: [
                        'Get oldest events in a time-ordered search',
                        'Find bottom N values after sorting',
                        'View end of large result sets'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Bottom performers', spl: '... | stats count by user | sort -count | tail 10', explanation: 'Least active users' },
                        { name: 'First events per day', spl: '... | sort _time | tail 1', explanation: 'Very first event in time range' }
                    ],
                    performance: 'Must buffer all events to determine the last N. Less efficient than head for large result sets.',
                    internals: 'Collects all events, then returns only the last N. Higher memory usage than head.',
                    vsAlternatives: {
                        'head': 'Returns FIRST N events — streaming and more efficient',
                        'reverse | head': 'Alternative approach if events are already in reverse order',
                        'sort | head': 'Sort descending then head is often clearer than tail'
                    }
                }
            },
            relatedCommands: ['head', 'reverse', 'sort', 'sample']
        },
        {
            id: 'transaction',
            name: 'transaction',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'combine',
            takeaway: 'Group events into transactions',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Groups events into transactions based on shared field values, time proximity, or start/end patterns.',
                    why: 'Track multi-event activities like user sessions, request/response pairs, or multi-step processes.',
                    syntax: 'transaction <field-list> [maxspan=<time>] [startswith=<search>] [endswith=<search>]',
                    example: { spl: '... | transaction session_id maxspan=30m', explanation: 'Group events by session, max 30 min gap' }
                },
                practical: {
                    examples: [
                        { spl: '... | transaction src_ip, dest_ip maxspan=5m', explanation: 'Group connection events by IP pair' },
                        { spl: '... | transaction user startswith="login" endswith="logout"', explanation: 'Track login sessions' },
                        { spl: '... | transaction host maxpause=1m', explanation: 'Group with max 1 min between events' },
                        { spl: '... | transaction request_id | eval duration=_time-earliest_time', explanation: 'Calculate transaction duration' }
                    ],
                    gotchas: [
                        'Very memory-intensive — avoid on large datasets',
                        'Creates _raw as concatenation of all event _raw values',
                        'Adds duration, eventcount fields automatically',
                        'maxspan is total time; maxpause is max gap between events'
                    ],
                    commonUses: [
                        'Track user sessions from login to logout',
                        'Correlate request and response events',
                        'Analyze multi-step attack patterns',
                        'Build activity timelines per entity'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'With event limits', spl: '... | transaction user maxevents=100 maxspan=1h', explanation: 'Limit events per transaction' },
                        { name: 'Closed transactions only', spl: '... | transaction user startswith="start" endswith="end" | where closed_txn=1', explanation: 'Filter to complete transactions' },
                        { name: 'Session analysis', spl: '... | transaction session_id | stats avg(duration) as avg_session, avg(eventcount) as avg_events', explanation: 'Session metrics' }
                    ],
                    performance: 'VERY expensive — buffers all events in memory. For high-volume data, consider stats with earliest/latest instead.',
                    internals: 'Maintains state for all open transactions. Memory usage grows with cardinality and event count.',
                    vsAlternatives: {
                        'stats': 'For simple grouping: stats earliest(_time), latest(_time), values(*) by session',
                        'streamstats': 'For sequential processing without full transaction semantics',
                        'join': 'For correlating specific start/end events without concatenating all events'
                    }
                }
            },
            relatedCommands: ['stats', 'streamstats', 'concurrency', 'associate']
        },
        {
            id: 'rare',
            name: 'rare',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'aggregate',
            takeaway: 'Find least common values',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns the least frequent values for specified fields, with count and percentage.',
                    why: 'Quickly identify outliers, anomalies, or unusual values that might indicate problems or attacks.',
                    syntax: 'rare [N] <field-list> [by <field>]',
                    example: { spl: '... | rare user', explanation: 'Find 10 least active users (default N=10)' }
                },
                practical: {
                    examples: [
                        { spl: '... | rare limit=20 src_ip', explanation: 'Find 20 least common source IPs' },
                        { spl: '... | rare status by host', explanation: 'Least common status codes per host' },
                        { spl: '... | rare useother=t limit=5 user_agent', explanation: 'Rare user agents plus "OTHER" for common ones' },
                        { spl: '... | rare process_name by host | where count < 5', explanation: 'Find processes that ran very few times' }
                    ],
                    gotchas: [
                        'Default limit is 10 — use limit=N to change',
                        'Automatically adds count and percent fields like top',
                        'Useful for finding anomalies, but rare doesn\'t mean malicious'
                    ],
                    commonUses: [
                        'Find unusual user agents or rare process names',
                        'Identify outlier behavior for investigation',
                        'Discover uncommon error codes or status values'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Anomaly hunting', spl: '... | rare limit=10 process_name by host | where count=1', explanation: 'Processes that ran exactly once' },
                        { name: 'Rare by time', spl: '... | bin _time span=1d | rare limit=5 src_ip by _time', explanation: 'Rare IPs each day' }
                    ],
                    performance: 'Same efficiency as top — uses heap-based algorithm without full sort.',
                    internals: 'Inverse of top command. Tracks bottom N values by frequency.',
                    vsAlternatives: {
                        'top': 'Returns most common values instead',
                        'stats count by | sort count': 'More control but less efficient'
                    }
                }
            },
            relatedCommands: ['top', 'stats', 'sort', 'anomalydetection']
        },
        {
            id: 'iplocation',
            name: 'iplocation',
            category: 'commands',
            subcategory: 'enrichment',
            purpose: 'combine',
            takeaway: 'Add geographic info to IP addresses',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Adds geographic information (city, country, region, coordinates) to events based on IP address fields.',
                    why: 'Essential for security analysis — identify where attacks originate, detect geographic anomalies, and visualize traffic on maps.',
                    syntax: 'iplocation [prefix=<string>] [allfields=<bool>] <ip-field>',
                    example: { spl: '... | iplocation src_ip', explanation: 'Add location fields for source IP' }
                },
                practical: {
                    examples: [
                        { spl: '... | iplocation src_ip | stats count by Country', explanation: 'Count events by source country' },
                        { spl: '... | iplocation prefix=src_ src_ip | iplocation prefix=dest_ dest_ip', explanation: 'Geo-locate both source and destination' },
                        { spl: '... | iplocation allfields=true clientip | table clientip, City, Region, Country, lat, lon', explanation: 'Get all geo fields including coordinates' },
                        { spl: '... | iplocation src_ip | search Country!="United States"', explanation: 'Find non-US traffic' }
                    ],
                    gotchas: [
                        'Private IPs (10.x, 192.168.x, 172.16-31.x) return no location',
                        'Default fields: City, Country, Region, lat, lon',
                        'Use prefix= when geo-locating multiple IP fields',
                        'Accuracy varies — city-level is approximate'
                    ],
                    commonUses: [
                        'Identify geographic origin of attacks',
                        'Detect impossible travel (user in two countries)',
                        'Create geographic visualizations and maps',
                        'Filter or alert on traffic from specific countries'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Impossible travel', spl: '... | iplocation src_ip | stats earliest(_time) as first, latest(_time) as last, values(Country) as countries by user | where mvcount(countries) > 1', explanation: 'Users appearing in multiple countries' },
                        { name: 'Map visualization', spl: '... | iplocation src_ip | geostats count by Country', explanation: 'Prepare data for cluster map' },
                        { name: 'Country allowlist', spl: '... | iplocation src_ip | where NOT match(Country, "^(United States|Canada|United Kingdom)$")', explanation: 'Find traffic from non-allowed countries' }
                    ],
                    performance: 'Fast lookup operation. Uses MaxMind GeoIP database bundled with Splunk.',
                    internals: 'Performs lookup against local GeoIP database. Database updates come with Splunk upgrades.',
                    vsAlternatives: {
                        'lookup': 'Use custom geo lookup for more control or additional data',
                        'External enrichment': 'Third-party threat intel can provide more context than location alone'
                    }
                }
            },
            relatedCommands: ['lookup', 'geostats', 'geom']
        },
        {
            id: 'inputcsv',
            name: 'inputcsv',
            category: 'commands',
            subcategory: 'input',
            purpose: 'get',
            takeaway: 'Load data from a CSV file',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Reads a CSV file from the Splunk server and returns its contents as search results. The file must be in $SPLUNK_HOME/var/run/splunk/ or a dispatch directory.',
                    why: 'Load external data into Splunk for analysis, testing, or one-time investigations without creating a formal lookup.',
                    syntax: '| inputcsv [append=<bool>] <filename>',
                    example: { spl: '| inputcsv my_data.csv', explanation: 'Load my_data.csv into search results' }
                },
                practical: {
                    examples: [
                        { spl: '| inputcsv threat_indicators.csv | rename indicator as src_ip | join src_ip [search index=firewall]', explanation: 'Match CSV data against logs' },
                        { spl: '| inputcsv exported_data.csv | stats count by category', explanation: 'Analyze previously exported data' },
                        { spl: '| inputcsv append=true file1.csv | inputcsv append=true file2.csv', explanation: 'Combine multiple CSV files' },
                        { spl: '| inputcsv results.csv | where severity="critical"', explanation: 'Filter loaded CSV data' }
                    ],
                    gotchas: [
                        'File must exist in specific Splunk directories (not arbitrary paths)',
                        'First row is treated as header (field names)',
                        'Starts with pipe (|) since it generates events',
                        'For persistent reference data, use lookups instead'
                    ],
                    commonUses: [
                        'Loading previously exported search results',
                        'One-time import of external data for investigation',
                        'Testing with sample data files',
                        'Comparing exported baselines to current data'
                    ]
                },
                deep: {
                    performance: 'Reads entire file into memory. For large files or frequent access, use lookup tables instead.',
                    vsAlternatives: {
                        'inputlookup': 'Use inputlookup for persistent reference data (lookups are managed and versioned)',
                        'outputcsv': 'Use outputcsv to export data, inputcsv to re-import it',
                        'lookup': 'Use lookup command for enrichment during a search'
                    }
                }
            },
            relatedCommands: ['outputcsv', 'inputlookup', 'outputlookup']
        },
        {
            id: 'inputlookup',
            name: 'inputlookup',
            category: 'commands',
            subcategory: 'lookup',
            purpose: 'get',
            takeaway: 'Read lookup table as search results',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Reads the contents of a lookup table and returns them as search results.',
                    why: 'Access reference data directly, use lookup tables as the starting point for searches, or inspect lookup contents.',
                    syntax: 'inputlookup [append=<bool>] <lookup-name> [WHERE <search>]',
                    example: { spl: '| inputlookup user_list.csv', explanation: 'Read entire user list lookup' }
                },
                practical: {
                    examples: [
                        { spl: '| inputlookup assets.csv | search department="IT"', explanation: 'Filter lookup contents' },
                        { spl: '| inputlookup threat_intel.csv WHERE ioc_type="ip"', explanation: 'Server-side filter (more efficient)' },
                        { spl: '| inputlookup watchlist.csv | rename ip AS src_ip | join src_ip [search index=firewall]', explanation: 'Use lookup as search driver' },
                        { spl: '| inputlookup append=true list1.csv | inputlookup append=true list2.csv', explanation: 'Combine multiple lookups' }
                    ],
                    gotchas: [
                        'Starts with pipe (|) since it generates events, not filters them',
                        'WHERE clause filters server-side before returning results',
                        'append=true adds to existing results instead of replacing',
                        'Limited to lookup table size limits (default 10MB)'
                    ],
                    commonUses: [
                        'Inspect or audit lookup table contents',
                        'Use threat intel lists to drive searches',
                        'Export lookup data for review',
                        'Compare lookup contents to live data'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Lookup-driven search', spl: '| inputlookup bad_ips.csv | rename ip as src_ip | join src_ip [search index=firewall earliest=-24h]', explanation: 'Find matches to known-bad list' },
                        { name: 'Lookup diff', spl: '| inputlookup current_users.csv | eval source="lookup" | append [search index=ad | dedup user | eval source="ad"] | stats values(source) as sources by user | where mvcount(sources)=1', explanation: 'Find discrepancies' },
                        { name: 'KV Store access', spl: '| inputlookup kvstore_collection', explanation: 'Read from KV Store collection' }
                    ],
                    performance: 'Fast for reasonably sized lookups. WHERE clause filtering is more efficient than post-search filtering.',
                    internals: 'Reads directly from lookup file or KV Store. No index search required.',
                    vsAlternatives: {
                        'lookup': 'Enriches existing events; inputlookup generates new events',
                        'outputlookup': 'Writes TO lookups; inputlookup reads FROM lookups'
                    }
                }
            },
            relatedCommands: ['outputlookup', 'lookup', 'join']
        },
        {
            id: 'outputlookup',
            name: 'outputlookup',
            category: 'commands',
            subcategory: 'lookup',
            purpose: 'output',
            takeaway: 'Write search results to lookup table',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Writes search results to a lookup table file or KV Store collection.',
                    why: 'Save search results for later use, create dynamic lookup tables, or build state across searches.',
                    syntax: 'outputlookup [append=<bool>] [create_empty=<bool>] <lookup-name>',
                    example: { spl: '... | table user, department | outputlookup user_dept.csv', explanation: 'Save user-department mapping' }
                },
                practical: {
                    examples: [
                        { spl: '... | stats count by src_ip | where count > 1000 | outputlookup high_volume_ips.csv', explanation: 'Save high-volume IPs for later reference' },
                        { spl: '... | outputlookup append=true daily_summary.csv', explanation: 'Append to existing lookup' },
                        { spl: '... | stats latest(status) as status by host | outputlookup host_status.csv', explanation: 'Track current host status' },
                        { spl: '| inputlookup users.csv | where active="true" | outputlookup active_users.csv', explanation: 'Filter and save subset' }
                    ],
                    gotchas: [
                        'Without append=true, OVERWRITES existing lookup completely',
                        'Lookup must be defined in transforms.conf or created via UI first',
                        'Results must have field names matching lookup schema',
                        'create_empty=false (default) won\'t create lookup if no results'
                    ],
                    commonUses: [
                        'Build dynamic watchlists from search results',
                        'Cache expensive query results for reuse',
                        'Track state between scheduled searches',
                        'Create summary tables for faster reporting'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Rolling window', spl: '| inputlookup bad_ips.csv | where _time > relative_time(now(), "-7d") | append [search index=threat earliest=-1d | table ip, _time] | outputlookup bad_ips.csv', explanation: 'Maintain 7-day rolling list' },
                        { name: 'Conditional update', spl: '... | stats count by user | where count > 100 | outputlookup create_empty=false suspicious_users.csv', explanation: 'Only write if results exist' },
                        { name: 'KV Store write', spl: '... | outputlookup kvstore_collection | stats count', explanation: 'Write to KV Store with confirmation' }
                    ],
                    performance: 'Writes are relatively fast but add overhead. Avoid in high-frequency searches.',
                    internals: 'Writes to $SPLUNK_HOME/etc/apps/<app>/lookups/ or KV Store.',
                    vsAlternatives: {
                        'collect': 'Writes to summary index for historical analysis',
                        'inputlookup': 'Reads FROM lookups; outputlookup writes TO lookups'
                    }
                }
            },
            relatedCommands: ['inputlookup', 'lookup', 'collect']
        },
        {
            id: 'append',
            name: 'append',
            category: 'commands',
            subcategory: 'joining',
            purpose: 'combine',
            takeaway: 'Add results from a subsearch',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Appends the results of a subsearch to the current results as additional rows.',
                    why: 'Combine results from multiple searches, add reference data, or union different datasets.',
                    syntax: 'append [maxtime=<int>] [maxout=<int>] [<subsearch>]',
                    example: { spl: '... | append [search index=other | stats count]', explanation: 'Add results from another index' }
                },
                practical: {
                    examples: [
                        { spl: 'index=windows | append [search index=linux] | stats count by host', explanation: 'Combine Windows and Linux events' },
                        { spl: '... | stats sum(bytes) as current | append [| makeresults | eval baseline=1000000] | transpose', explanation: 'Add baseline for comparison' },
                        { spl: '... | append [| inputlookup thresholds.csv]', explanation: 'Add lookup data to results' },
                        { spl: '... | stats count as today | append [search earliest=-2d latest=-1d | stats count as yesterday]', explanation: 'Compare today vs yesterday' }
                    ],
                    gotchas: [
                        'Subsearch runs completely before results are appended',
                        'Default subsearch limits: 60 seconds, 50K results',
                        'Results are simply stacked — no joining on fields',
                        'Field names should match for meaningful combination'
                    ],
                    commonUses: [
                        'Union data from multiple indexes or sources',
                        'Add static reference values for comparison',
                        'Combine current data with historical baselines',
                        'Merge lookup tables with search results'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Multi-source union', spl: 'index=fw_cisco | append [search index=fw_palo] | append [search index=fw_checkpoint] | stats sum(bytes) by src_ip', explanation: 'Combine multiple firewall sources' },
                        { name: 'With extended limits', spl: '... | append maxtime=120 maxout=100000 [search index=large ...]', explanation: 'Extend subsearch limits' },
                        { name: 'Running baseline', spl: '... | stats avg(response_time) as current | append [| inputlookup baselines.csv | where metric="response_time"] | transpose', explanation: 'Compare to stored baseline' }
                    ],
                    performance: 'Subsearch runs synchronously. Long subsearches block the main search.',
                    internals: 'Subsearch completes entirely, then results are concatenated to main results.',
                    vsAlternatives: {
                        'appendcols': 'Adds fields (columns) instead of rows',
                        'join': 'Combines on matching field values',
                        'union': 'More efficient for combining multiple datasets',
                        'multisearch': 'Runs searches in parallel instead of sequentially'
                    }
                }
            },
            relatedCommands: ['appendcols', 'join', 'union', 'multisearch']
        },
        {
            id: 'appendcols',
            name: 'appendcols',
            category: 'commands',
            subcategory: 'joining',
            purpose: 'combine',
            takeaway: 'Add fields from a subsearch',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Appends the fields from a subsearch as new columns to existing results.',
                    why: 'Add calculated values, statistics, or reference data as new fields without joining on keys.',
                    syntax: 'appendcols [override=<bool>] [<subsearch>]',
                    example: { spl: '... | appendcols [| stats count as total]', explanation: 'Add total count as new column' }
                },
                practical: {
                    examples: [
                        { spl: '... | stats count by user | appendcols [search index=main | stats count as total] | eval pct=round(count/total*100,2)', explanation: 'Calculate percentage of total' },
                        { spl: '... | appendcols override=true [| inputlookup thresholds.csv | head 1]', explanation: 'Add threshold values to each row' },
                        { spl: '... | appendcols [search earliest=-7d latest=-6d | stats avg(bytes) as baseline_avg]', explanation: 'Add last week baseline' },
                        { spl: '... | table host, cpu | appendcols [| inputlookup sla.csv | fields max_cpu]', explanation: 'Add SLA threshold column' }
                    ],
                    gotchas: [
                        'Subsearch should return single row (or fields are taken from first row)',
                        'override=true replaces existing fields with same name',
                        'No field matching — values applied to all rows equally',
                        'Subsearch fields become new columns in output'
                    ],
                    commonUses: [
                        'Add aggregate totals for percentage calculations',
                        'Include baseline or threshold values',
                        'Add static reference data to results',
                        'Combine point-in-time stats with detailed events'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Multiple metrics', spl: '... | appendcols [| stats avg(x) as avg_x, stdev(x) as std_x] | eval zscore=(x-avg_x)/std_x', explanation: 'Calculate z-scores' },
                        { name: 'Config injection', spl: '... | appendcols [| rest /services/configs/conf-limits | table max_count] | where count > max_count', explanation: 'Use Splunk config in search' }
                    ],
                    performance: 'Subsearch runs synchronously. Keep subsearch simple and fast.',
                    internals: 'Takes first row of subsearch results and adds its fields to every row in main results.',
                    vsAlternatives: {
                        'append': 'Adds rows instead of columns',
                        'eventstats': 'Adds statistics as columns without subsearch',
                        'join': 'Combines on matching keys'
                    }
                }
            },
            relatedCommands: ['append', 'eventstats', 'join']
        },
        {
            id: 'mvexpand',
            name: 'mvexpand',
            category: 'commands',
            subcategory: 'manipulating',
            purpose: 'transform',
            takeaway: 'Expand multivalue fields into separate events',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Expands a multivalue field into separate events, one event per value.',
                    why: 'Work with individual values from multivalue fields for analysis, counting, or joining.',
                    syntax: 'mvexpand <field> [limit=<int>]',
                    example: { spl: '... | mvexpand dest_port', explanation: 'Create one event per destination port' }
                },
                practical: {
                    examples: [
                        { spl: '... | stats values(action) as actions by user | mvexpand actions | stats count by actions', explanation: 'Count each action type across users' },
                        { spl: '... | mvexpand categories | where categories="malware"', explanation: 'Filter on individual category values' },
                        { spl: '... | stats values(dest_ip) as targets by src_ip | mvexpand targets | iplocation targets', explanation: 'Geo-locate each target IP' },
                        { spl: '... | mvexpand limit=100 values', explanation: 'Limit expansion to first 100 values' }
                    ],
                    gotchas: [
                        'Creates many events from one — can explode result count',
                        'All other fields are duplicated for each new event',
                        'Default limit is 100 values per field',
                        'Use mvcount() first to check cardinality before expanding'
                    ],
                    commonUses: [
                        'Analyze individual values from aggregated multivalue fields',
                        'Expand split() results for further processing',
                        'Prepare multivalue data for joins or lookups',
                        'Convert multivalue stats output to individual rows'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Parse and expand', spl: '... | eval ports=split(port_list, ",") | mvexpand ports | stats count by ports', explanation: 'Split comma-separated then count each' },
                        { name: 'Expand then aggregate', spl: '... | mvexpand tags | stats count by tags | sort -count', explanation: 'Count frequency of each tag' },
                        { name: 'Controlled expansion', spl: '... | eval item_count=mvcount(items) | where item_count < 50 | mvexpand items', explanation: 'Only expand small lists' }
                    ],
                    performance: 'Can dramatically increase event count. Filter or limit before expanding when possible.',
                    internals: 'Creates N copies of each event where N is the multivalue count. Memory usage multiplies.',
                    vsAlternatives: {
                        'mvzip': 'Combines multiple multivalue fields in parallel',
                        'mvjoin': 'Converts multivalue to single value string (opposite direction)'
                    }
                }
            },
            relatedCommands: ['mvcombine', 'mvjoin', 'split', 'makemv']
        },
        {
            id: 'spath',
            name: 'spath',
            category: 'commands',
            subcategory: 'manipulating',
            purpose: 'transform',
            takeaway: 'Extract fields from JSON or XML',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Extracts fields from structured data formats like JSON and XML.',
                    why: 'Parse nested or complex structured data that automatic field extraction doesn\'t handle well.',
                    syntax: 'spath [input=<field>] [output=<field>] [path=<path>]',
                    example: { spl: '... | spath input=_raw', explanation: 'Auto-extract all fields from JSON' }
                },
                practical: {
                    examples: [
                        { spl: '... | spath input=json_field path=user.name output=username', explanation: 'Extract nested field' },
                        { spl: '... | spath input=_raw path=data{}.ip', explanation: 'Extract from JSON array' },
                        { spl: '... | spath input=xml_data path=response.status', explanation: 'Extract from XML' },
                        { spl: '... | spath | search user.role=admin', explanation: 'Auto-extract then filter' }
                    ],
                    gotchas: [
                        'Without path=, extracts ALL fields (can be slow)',
                        'Array notation: data{} for all items, data{0} for first',
                        'Dot notation for nested: parent.child.field',
                        'Output field names default to the path if not specified'
                    ],
                    commonUses: [
                        'Parse JSON API responses or logs',
                        'Extract fields from nested structures',
                        'Handle XML configuration or event data',
                        'Work with cloud service logs (AWS, Azure, GCP)'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Extract array length', spl: '... | spath path=items{} output=items | eval item_count=mvcount(items)', explanation: 'Count array elements' },
                        { name: 'Multiple extractions', spl: '... | spath input=_raw path=user.id output=user_id | spath input=_raw path=action output=action', explanation: 'Extract specific fields only' },
                        { name: 'Handle missing data', spl: '... | spath path=error.message output=error_msg | fillnull value="none" error_msg', explanation: 'Handle optional fields' }
                    ],
                    performance: 'Specifying path= is much faster than auto-extraction. Always use path= in production searches.',
                    internals: 'Uses streaming JSON/XML parser. Auto-extraction mode builds complete field structure.',
                    vsAlternatives: {
                        'rex': 'For non-structured text extraction with regex',
                        'kvform': 'For key=value formatted data',
                        'extract': 'For automatic extraction at search time'
                    }
                }
            },
            relatedCommands: ['rex', 'xmlkv', 'mvexpand']
        },
        {
            id: 'makeresults',
            name: 'makeresults',
            category: 'commands',
            subcategory: 'generating',
            purpose: 'get',
            takeaway: 'Generate results from nothing',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Creates a specified number of results with _time field, without reading any index.',
                    why: 'Generate test data, create static results, build lookup-driven searches, or add reference values.',
                    syntax: '| makeresults [count=<int>] [annotate=<bool>]',
                    example: { spl: '| makeresults | eval message="Hello World"', explanation: 'Generate single result with custom field' }
                },
                practical: {
                    examples: [
                        { spl: '| makeresults | eval threshold=100, alert_name="High CPU"', explanation: 'Create static reference values' },
                        { spl: '| makeresults count=24 | streamstats count as hour | eval hour=hour-1', explanation: 'Generate 24 rows for hourly data' },
                        { spl: '| makeresults | eval hosts="host1,host2,host3" | makemv delim="," hosts | mvexpand hosts', explanation: 'Generate host list' },
                        { spl: '| makeresults count=5 | streamstats count as id | eval status=case(id<=2,"ok",id<=4,"warn",true(),"error")', explanation: 'Generate test dataset' }
                    ],
                    gotchas: [
                        'Starts with pipe (|) since it generates events',
                        'Default count is 1',
                        'Creates _time field set to current time',
                        'annotate=true adds server and splunk_server fields'
                    ],
                    commonUses: [
                        'Test eval expressions and search logic',
                        'Create static lookup data',
                        'Generate time series scaffolding',
                        'Build mock data for dashboard development'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Time series scaffold', spl: '| makeresults count=7 | streamstats count as day | eval _time=relative_time(now(), "-".day."d")', explanation: 'Generate last 7 days' },
                        { name: 'Test data generator', spl: '| makeresults count=100 | eval user="user".random()%10, action=if(random()%3=0,"fail","success")', explanation: 'Generate random test events' },
                        { name: 'Cartesian product', spl: '| makeresults | eval host="a,b,c", status="ok,warn,error" | makemv host | makemv status | mvexpand host | mvexpand status', explanation: 'Generate all combinations' }
                    ],
                    performance: 'Extremely fast — no index access. Limited by count parameter and memory.',
                    internals: 'Generates synthetic events entirely in memory. No disk I/O.',
                    vsAlternatives: {
                        'inputlookup': 'Read existing data instead of generating',
                        'rest': 'Generate results from Splunk REST API',
                        'datamodel': 'Generate from accelerated data model'
                    }
                }
            },
            relatedCommands: ['eval', 'streamstats', 'makemv', 'mvexpand']
        },
        {
            id: 'regex',
            name: 'regex',
            category: 'commands',
            subcategory: 'filtering',
            purpose: 'filter',
            takeaway: 'Filter events using regular expressions',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Filters results to only include events where a field matches (or doesn\'t match) a regular expression.',
                    why: 'Filter on complex patterns that can\'t be expressed with simple wildcards or exact matches.',
                    syntax: 'regex <field>=<regex> | regex <field>!=<regex>',
                    example: { spl: '... | regex _raw="(?i)error|fail|critical"', explanation: 'Case-insensitive match for error terms' }
                },
                practical: {
                    examples: [
                        { spl: '... | regex src_ip!="^10\\."', explanation: 'Exclude internal 10.x.x.x IPs' },
                        { spl: '... | regex email="^[a-zA-Z0-9._%+-]+@company\\.com$"', explanation: 'Match company email format' },
                        { spl: '... | regex user="^(admin|root|system)$"', explanation: 'Match specific usernames exactly' },
                        { spl: '... | regex url="\\.(exe|dll|bat|ps1)$"', explanation: 'Find executable file downloads' }
                    ],
                    gotchas: [
                        'Uses PCRE regex syntax',
                        'Backslashes must be escaped: use \\\\d not \\d',
                        '!= means "does not match" (inverse filter)',
                        'Field name without value matches against _raw'
                    ],
                    commonUses: [
                        'Filter on complex patterns (IP ranges, email formats)',
                        'Exclude events matching a pattern',
                        'Validate field format compliance',
                        'Match multiple alternatives efficiently'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'IP range match', spl: '... | regex src_ip="^192\\.168\\.(1[0-9]|2[0-5])\\."', explanation: 'Match specific subnet range' },
                        { name: 'Negative lookahead', spl: '... | regex _raw="error(?!.*expected)"', explanation: 'Error but not "expected error"' },
                        { name: 'Anchored match', spl: '... | regex user="^(?!admin$|root$).*$"', explanation: 'Exclude exactly "admin" or "root"' }
                    ],
                    performance: 'Regex matching is CPU-intensive. Use simple search terms first to reduce volume, then apply regex.',
                    internals: 'PCRE regex engine. No indexing benefit — every event is tested.',
                    vsAlternatives: {
                        'search with wildcards': 'Faster for simple patterns — use when possible',
                        'where match()': 'Same regex in eval expression context',
                        'rex': 'Extract fields with regex, not just filter'
                    }
                }
            },
            relatedCommands: ['rex', 'search', 'where']
        },
        {
            id: 'tstats',
            name: 'tstats',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'aggregate',
            takeaway: 'Fast statistics over indexed or accelerated data',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Performs statistical queries on indexed fields (tsidx) or accelerated data models, dramatically faster than regular searches.',
                    why: 'Essential for high-performance dashboards, large-scale analysis, and searches over data models.',
                    syntax: '| tstats <stats-func> from <datamodel> [where <conditions>] [by <fields>]',
                    example: { spl: '| tstats count from datamodel=Authentication where Authentication.action=failure by Authentication.user', explanation: 'Count failed logins by user' }
                },
                practical: {
                    examples: [
                        { spl: '| tstats count where index=main by host, sourcetype', explanation: 'Fast count over indexed metadata' },
                        { spl: '| tstats sum(Authentication.bytes) from datamodel=Authentication by Authentication.src', explanation: 'Sum bytes by source from data model' },
                        { spl: '| tstats prestats=true count from datamodel=Network_Traffic by Network_Traffic.dest_port | timechart count by dest_port', explanation: 'Use prestats for timechart' },
                        { spl: '| tstats earliest(_time) as first, latest(_time) as last from datamodel=Endpoint by Endpoint.dest', explanation: 'Time bounds per endpoint' }
                    ],
                    gotchas: [
                        'Starts with pipe (|) — it generates events',
                        'Data model must be accelerated for full speed benefit',
                        'Field names must be fully qualified (ModelName.field)',
                        'Limited functions: count, dc, sum, avg, min, max, earliest, latest, values, list'
                    ],
                    commonUses: [
                        'Fast dashboards over CIM-compliant data',
                        'Large-scale statistical analysis',
                        'Summary searches for reports',
                        'High-performance alerting'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Raw index tstats', spl: '| tstats count where index=* by index, sourcetype | sort -count', explanation: 'Index inventory without data model' },
                        { name: 'With timespan', spl: '| tstats count from datamodel=Authentication where earliest=-24h by _time span=1h', explanation: 'Hourly counts for last day' },
                        { name: 'Chained to stats', spl: '| tstats count from datamodel=Network_Traffic by src_ip | stats sum(count) as total, dc(src_ip) as unique_sources', explanation: 'Aggregate tstats results' },
                        { name: 'summariesonly', spl: '| tstats summariesonly=true count from datamodel=Authentication', explanation: 'Only use accelerated data (faster but may be incomplete)' }
                    ],
                    performance: '10-100x faster than equivalent raw search on accelerated data. Uses tsidx files instead of raw data.',
                    internals: 'Queries pre-computed index summary files (tsidx). Skips raw event parsing entirely.',
                    vsAlternatives: {
                        'stats': 'More flexible but much slower — searches raw events',
                        'datamodel search': 'Similar results but slower syntax',
                        'mstats': 'For metrics data specifically'
                    }
                }
            },
            relatedCommands: ['stats', 'datamodel', 'mstats']
        },
        {
            id: 'rest',
            name: 'rest',
            category: 'commands',
            subcategory: 'generating',
            purpose: 'get',
            takeaway: 'Query Splunk REST API endpoints',
            what: 'Retrieves data from Splunk REST API endpoints. Returns configuration data, system status, user information, and other Splunk metadata.',
            why: 'Access Splunk configuration and status without leaving SPL. Useful for auditing, capacity planning, and building admin dashboards.',
            syntax: 'rest <endpoint> [count=<int>] [splunk_server=<server>]',
            examples: [
                { spl: '| rest /services/server/info | table serverName, version, os_name', explanation: 'Get Splunk server information' },
                { spl: '| rest /services/saved/searches | table title, search, cron_schedule', explanation: 'List all saved searches' },
                { spl: '| rest /services/authentication/users | table title, roles, email', explanation: 'List Splunk users and their roles' },
                { spl: '| rest /services/data/indexes | table title, currentDBSizeMB, maxTotalDataSizeMB', explanation: 'Index size and capacity' }
            ],
            gotchas: [
                'Requires admin or appropriate capabilities for most endpoints',
                'Results are from Splunk config, not indexed data',
                'Use splunk_server=local or splunk_server=* for distributed environments',
                'Some endpoints require count=0 to return all results'
            ],
            relatedCommands: ['makeresults', 'inputlookup', 'metadata']
        },
        {
            id: 'return',
            name: 'return',
            category: 'commands',
            subcategory: 'subsearch',
            purpose: 'combine',
            takeaway: 'Return values from subsearch to outer search',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Formats subsearch results for use in the outer search, returning field values as search terms.',
                    why: 'Pass values from a subsearch to filter or enrich the main search.',
                    syntax: 'return [count] <field> [AS <alias>] | return $<field>',
                    example: { spl: '... [search index=threats | return 10 src_ip]', explanation: 'Get top 10 threat IPs for main search' }
                },
                practical: {
                    examples: [
                        { spl: 'index=web [search index=threats | return 100 ip AS src_ip]', explanation: 'Find web events from threat IPs' },
                        { spl: '... | where user IN [search index=watchlist | return 50 $user]', explanation: 'Match users on watchlist' },
                        { spl: 'index=auth [search index=alerts severity=critical | dedup user | return 20 $user]', explanation: 'Auth events for users with critical alerts' },
                        { spl: '... [search index=baseline | stats avg(count) as threshold | return $threshold]', explanation: 'Pass calculated value to outer search' }
                    ],
                    gotchas: [
                        'Default count is 1 — specify higher for multiple values',
                        '$field syntax returns field=value format',
                        'Field without $ returns value only',
                        'Subsearch limits apply (default 50K results, 60 seconds)'
                    ],
                    commonUses: [
                        'Filter main search using values from another search',
                        'Pass threat intel matches to event search',
                        'Use calculated thresholds in the outer search',
                        'Dynamic filtering based on related data'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Multiple fields', spl: '... [search index=assets | return 100 $ip $hostname]', explanation: 'Return multiple field conditions' },
                        { name: 'OR conditions', spl: '... [search index=bad_users | return 50 $user | format]', explanation: 'Format combines with OR logic' },
                        { name: 'Threshold passing', spl: '... | where bytes > [search index=baselines type=bytes | return $value]', explanation: 'Compare against dynamic baseline' }
                    ],
                    performance: 'Subsearch completes first. Keep subsearch fast and result count low.',
                    internals: 'Converts results to search string format. $field becomes field=value, plain field becomes just value.',
                    vsAlternatives: {
                        'format': 'More control over output format',
                        'join': 'For row-level matching rather than filter generation',
                        'lookup': 'For static reference data matching'
                    }
                }
            },
            relatedCommands: ['format', 'join', 'lookup']
        },
        {
            id: 'chart',
            name: 'chart',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'aggregate',
            takeaway: 'Create charts with two grouping dimensions',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Creates tabular data for visualization with a statistical aggregation split over two dimensions.',
                    why: 'Build pivot tables and charts that show metrics across two categorical fields.',
                    syntax: 'chart <stats-func> [over <row-field>] [by <column-field>]',
                    example: { spl: '... | chart count over host by status', explanation: 'Count by host (rows) and status (columns)' }
                },
                practical: {
                    examples: [
                        { spl: '... | chart count over src_ip by dest_port', explanation: 'Traffic matrix: sources vs ports' },
                        { spl: '... | chart avg(response_time) over service by region', explanation: 'Response times: service vs region' },
                        { spl: '... | chart sum(bytes) over _time span=1h by host', explanation: 'Hourly bytes per host (timechart alternative)' },
                        { spl: '... | chart dc(user) over department by action', explanation: 'Unique users: department vs action' }
                    ],
                    gotchas: [
                        'over = row field, by = column field (series)',
                        'Without over, uses _time by default (like timechart)',
                        'High cardinality by-fields create many columns',
                        'limit=N controls maximum columns (default 10)'
                    ],
                    commonUses: [
                        'Create pivot tables for reports',
                        'Build heatmap visualizations',
                        'Compare metrics across two dimensions',
                        'Alternative to timechart with more control'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'With time bucketing', spl: '... | chart count over _time span=1d by sourcetype', explanation: 'Daily counts per sourcetype' },
                        { name: 'Multiple functions', spl: '... | chart count, avg(bytes) over host by status', explanation: 'Multiple aggregations' },
                        { name: 'Controlled series', spl: '... | chart limit=5 useother=true count over dept by user', explanation: 'Top 5 users plus OTHER per department' }
                    ],
                    performance: 'Similar to stats. High cardinality in by-field increases memory usage.',
                    internals: 'Creates matrix structure with row-field values as rows and by-field values as columns.',
                    vsAlternatives: {
                        'timechart': 'Specifically for time-based X-axis',
                        'stats': 'When you need just one grouping dimension',
                        'xyseries': 'Converts stats output to chart format'
                    }
                }
            },
            relatedCommands: ['timechart', 'stats', 'xyseries', 'untable']
        },

        // ============================================
        // EXPERIMENTAL CARD STYLES - Test Entries
        // ============================================

        // Zone-based card
        {
            id: 'sort',
            name: 'sort',
            category: 'commands',
            subcategory: 'ordering',
            purpose: 'filter',
            takeaway: 'Order results by field values',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Puts your search results in order — like sorting a spreadsheet column from A→Z or highest→lowest.',
                    why: 'Find the biggest, smallest, newest, or oldest items in your results quickly.',
                    syntax: 'sort <field>\nsort -<field>',
                    example: { spl: '... | sort -_time', explanation: 'Newest events first' }
                },
                practical: {
                    examples: [
                        { spl: '... | sort -count', explanation: 'Biggest counts at top' },
                        { spl: '... | sort _time', explanation: 'Oldest events first' },
                        { spl: '... | sort -count, user', explanation: 'Sort by count, then alphabetically by user' },
                        { spl: '... | sort limit=100 -bytes', explanation: 'Top 100 by bytes transferred' }
                    ],
                    gotchas: [
                        'Default limit is 10,000 results — use limit=0 or sort 0 for unlimited',
                        'Minus sign (-) before field = descending (biggest/newest first)',
                        'Numbers stored as strings sort wrong: "9" comes after "10"'
                    ],
                    commonUses: [
                        'Find top N results by a metric',
                        'Order events chronologically for timeline analysis',
                        'Rank items by count, bytes, or other numeric fields'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Sort IPs numerically', spl: '... | sort ip(src_ip)', explanation: '10.0.0.2 comes before 10.0.0.10' },
                        { name: 'Force numeric sort', spl: '... | sort num(port)', explanation: 'Ensures 80 < 443 < 8080' },
                        { name: 'Force string sort', spl: '... | sort str(error_code)', explanation: 'Preserves leading zeros like "007"' }
                    ],
                    performance: 'Sort loads all results into memory. For large datasets, consider using stats, top, or rare instead when you only need extremes.',
                    internals: 'Sort buffers all events in memory before outputting. For truly large-scale sorting, consider indexed-time sorting or summary indexing.',
                    vsAlternatives: {
                        'top': 'Returns top N values with counts — faster for "top 10" scenarios',
                        'rare': 'Returns least common values — inverse of top',
                        'head': 'Use after sort to limit results: sort -count | head 10'
                    }
                }
            },
            relatedCommands: ['reverse', 'head', 'tail', 'top', 'rare']
        },

        // Zone-based card
        {
            id: 'head',
            name: 'head',
            category: 'commands',
            subcategory: 'filtering',
            purpose: 'filter',
            takeaway: 'Return first N results',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns only the first N events from your search results.',
                    why: 'Quickly preview data without waiting for the full search to complete. Essential for testing and exploration.',
                    syntax: 'head [N]',
                    example: { spl: '... | head 10', explanation: 'First 10 results' }
                },
                practical: {
                    examples: [
                        { spl: '... | head', explanation: 'First 10 results (default)' },
                        { spl: '... | head 5', explanation: 'First 5 results' },
                        { spl: '... | sort -count | head 20', explanation: 'Top 20 by count' },
                        { spl: '... | head 1000 | rex field=_raw "..."', explanation: 'Test regex on subset first' }
                    ],
                    gotchas: [
                        'Results are NOT random — they\'re the first events found',
                        'Order depends on what comes before: raw search order or previous sort',
                        'For random sampling, use the "sample" command instead'
                    ],
                    commonUses: [
                        'Preview data without running full search',
                        'Get top N after sorting by a field',
                        'Test expensive operations on a small subset first'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Keep last event', spl: '... | head limit=100 keeplast=true', explanation: 'Ensures last event passes through even at limit' },
                        { name: 'Skip nulls', spl: '... | head 50 null=false', explanation: 'Skip events with null in first field' },
                        { name: 'Alert triage', spl: 'index=alerts severity=critical | sort -_time | head 5', explanation: 'Quick view of most recent critical alerts' }
                    ],
                    performance: 'Head is a streaming command — it stops processing as soon as N events pass through. Very efficient for early termination.',
                    internals: 'In distributed search, each indexer returns up to N events. Search head then takes first N from combined results.',
                    vsAlternatives: {
                        'tail': 'Returns the LAST N events instead of first',
                        'sample': 'Returns random events, not first N',
                        'top': 'Returns top values by count with automatic aggregation'
                    }
                }
            },
            relatedCommands: ['tail', 'sample', 'sort', 'top']
        },

        // Zone-based card
        {
            id: 'rename',
            name: 'rename',
            category: 'commands',
            subcategory: 'manipulating',
            purpose: 'output',
            takeaway: 'Change field names in results',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Changes the name of a field in your search results.',
                    why: 'Make field names more readable, match expected naming conventions, or prepare data for joins and lookups.',
                    syntax: 'rename <old-field> AS <new-field>',
                    example: { spl: '... | rename src_ip AS source_address', explanation: 'More descriptive name' }
                },
                practical: {
                    examples: [
                        { spl: '... | rename count AS "Event Count"', explanation: 'Spaces require quotes' },
                        { spl: '... | rename src AS src_ip, dst AS dest_ip', explanation: 'Multiple renames' },
                        { spl: '... | rename *_addr AS *_ip', explanation: 'Wildcard rename pattern' }
                    ],
                    gotchas: [
                        'New name with spaces or special chars needs quotes',
                        'Renaming to existing field name overwrites it',
                        'Case-sensitive: "User" and "user" are different'
                    ],
                    commonUses: [
                        'Standardize field names across different data sources',
                        'Create friendly names for dashboard display',
                        'Prepare fields for lookup table matching'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Wildcard prefix change', spl: '... | rename SC_* AS StatusCode_*', explanation: 'Rename all SC_ prefixed fields' },
                        { name: 'Swap field names', spl: '... | rename src AS temp, dest AS src, temp AS dest', explanation: 'Use temp field to swap' }
                    ],
                    performance: 'Rename is extremely fast — just metadata change, no data transformation.',
                    internals: 'Rename modifies the field metadata table, not the actual event data. Original _raw is unchanged.',
                    vsAlternatives: {
                        'eval': 'Creates new field with value copy — use when you need both old and new',
                        'fields': 'Use "fields - oldname" after rename if you want to remove original',
                        'alias': 'Field aliases in props.conf for persistent renames at search time'
                    }
                }
            },
            relatedCommands: ['eval', 'fields', 'table', 'rex']
        },
        {
            id: 'bucket',
            name: 'bucket',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'transform',
            takeaway: 'Alias for bin - group numeric or time values into buckets',
            what: 'Alias for the bin command. Groups continuous numeric values or time into discrete buckets.',
            why: 'Some users prefer "bucket" over "bin" - they work identically.',
            syntax: 'bucket <field> [span=<value>] [bins=<count>]',
            examples: [
                { spl: '... | bucket _time span=1h', explanation: 'Same as bin - group events by hour' },
                { spl: '... | bucket bytes bins=10', explanation: 'Create 10 equal-sized buckets' }
            ],
            relatedCommands: ['bin', 'timechart', 'stats']
        },
        {
            id: 'accum',
            name: 'accum',
            category: 'commands',
            subcategory: 'streaming',
            purpose: 'transform',
            takeaway: 'Calculate running totals across events',
            what: 'Keeps a running total of a numeric field, adding each event\'s value to the accumulated sum.',
            why: 'Useful for calculating cumulative values like running totals of bytes transferred, counts over time, or progressive sums.',
            syntax: 'accum <field> [as <newfield>]',
            examples: [
                { spl: '... | sort _time | accum bytes as running_total', explanation: 'Running total of bytes over time' },
                { spl: '... | accum count as cumulative_count', explanation: 'Cumulative count across events' }
            ],
            relatedCommands: ['streamstats', 'autoregress', 'delta', 'stats']
        },
        {
            id: 'addtotals',
            name: 'addtotals',
            category: 'commands',
            subcategory: 'reporting',
            purpose: 'output',
            takeaway: 'Add row and column totals to tables',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Adds a total row and/or column to your results. Can sum across rows (adding a Total column) or down columns (adding a Total row).',
                    why: 'Essential for creating report-ready tables with totals. Makes summary tables more useful for stakeholders.',
                    syntax: 'addtotals [row=<bool>] [col=<bool>] [fieldname=<name>] [<field-list>]',
                    example: { spl: '... | stats count by host | addtotals', explanation: 'Add a total row to the bottom' }
                },
                practical: {
                    examples: [
                        { spl: '... | stats count by host, status | addtotals col=true', explanation: 'Add Total column summing across each row' },
                        { spl: '... | chart count by host over status | addtotals row=true col=true', explanation: 'Add both row and column totals' },
                        { spl: '... | stats sum(bytes) as bytes by user | addtotals fieldname="TOTAL"', explanation: 'Custom name for total row' },
                        { spl: '... | stats count as events, sum(bytes) as bytes by host | addtotals', explanation: 'Totals for multiple numeric columns' }
                    ],
                    gotchas: [
                        'Only works on numeric fields',
                        'Default adds row totals (row=true, col=false)',
                        'Total row appears at the bottom of results',
                        'Use fieldname= to change "Total" label'
                    ],
                    commonUses: [
                        'Creating summary reports with totals',
                        'Adding "Total" row to stats tables',
                        'Cross-tab reports with row and column totals',
                        'Executive dashboards and reports'
                    ]
                },
                deep: {
                    performance: 'Lightweight operation performed after main search.',
                    vsAlternatives: {
                        'eventstats': 'Use eventstats sum() to add running totals as a field',
                        'appendcols': 'For more complex total calculations'
                    }
                }
            },
            relatedCommands: ['stats', 'chart', 'eventstats']
        },
        {
            id: 'anomalydetection',
            name: 'anomalydetection',
            category: 'commands',
            subcategory: 'ml',
            purpose: 'transform',
            takeaway: 'Detect anomalies using machine learning',
            what: 'Uses machine learning algorithms to identify unusual patterns or outliers in your data.',
            why: 'Automates the detection of anomalies without manually setting thresholds. Good for finding unusual behavior in metrics, user activity, or system performance.',
            syntax: 'anomalydetection <field> [method=<algorithm>] [threshold=<value>]',
            examples: [
                { spl: '... | timechart span=1h count | anomalydetection count', explanation: 'Find unusual spikes in event counts' },
                { spl: '... | anomalydetection bytes method=histogram', explanation: 'Detect anomalous byte transfers' }
            ],
            relatedCommands: ['stats', 'streamstats', 'eventstats', 'predict']
        },
        {
            id: 'associate',
            name: 'associate',
            category: 'commands',
            subcategory: 'reporting',
            purpose: 'aggregate',
            takeaway: 'Find correlations between fields',
            what: 'Identifies fields that frequently appear together, helping discover relationships in your data.',
            why: 'Useful for exploratory analysis when you want to understand what fields or values tend to co-occur.',
            syntax: 'associate [supcnt=<min>] [supfreq=<min>] [improv=<min>]',
            examples: [
                { spl: '... | associate', explanation: 'Find all field correlations' },
                { spl: '... | associate supcnt=100', explanation: 'Only correlations with 100+ occurrences' }
            ],
            relatedCommands: ['stats', 'contingency', 'correlate']
        },
        {
            id: 'autoregress',
            name: 'autoregress',
            category: 'commands',
            subcategory: 'streaming',
            purpose: 'transform',
            takeaway: 'Access values from previous events',
            what: 'Copies field values from previous events into the current event, creating lagged values for comparison.',
            why: 'Essential for time-series analysis where you need to compare current values with past values - detecting changes, calculating deltas, or building forecasts.',
            syntax: 'autoregress <field> [p=<lags>] [as <newfield>]',
            examples: [
                { spl: '... | sort _time | autoregress bytes p=1 as prev_bytes', explanation: 'Get previous event\'s bytes value' },
                { spl: '... | autoregress count p=1-3', explanation: 'Get values from 1, 2, and 3 events ago' }
            ],
            relatedCommands: ['streamstats', 'accum', 'delta', 'trendline']
        },
        {
            id: 'collect',
            name: 'collect',
            category: 'commands',
            subcategory: 'output',
            purpose: 'output',
            takeaway: 'Write results to a summary index',
            what: 'Saves search results to a summary index for later retrieval, enabling report acceleration and data collection.',
            why: 'Use for scheduled searches that build up summary data over time, or to store search results for future analysis without re-running expensive searches.',
            syntax: 'collect index=<summary_index> [source=<value>] [sourcetype=<value>]',
            examples: [
                { spl: '... | stats count by user | collect index=summary', explanation: 'Save aggregated results to summary index' },
                { spl: '... | collect index=notable marker="alert_data"', explanation: 'Collect events for notable index' }
            ],
            relatedCommands: ['outputlookup', 'outputcsv', 'sendemail']
        },
        {
            id: 'concurrency',
            name: 'concurrency',
            category: 'commands',
            subcategory: 'streaming',
            purpose: 'transform',
            takeaway: 'Count concurrent events at each point in time',
            what: 'Calculates how many events are occurring simultaneously based on start and duration fields.',
            why: 'Perfect for understanding resource utilization - how many sessions are active, how many jobs are running concurrently, or peak load analysis.',
            syntax: 'concurrency duration=<field> [start=<field>] [output=<field>]',
            examples: [
                { spl: '... | concurrency duration=session_length', explanation: 'Count concurrent sessions' },
                { spl: '... | concurrency duration=job_duration start=start_time', explanation: 'Concurrent jobs over time' }
            ],
            relatedCommands: ['timechart', 'streamstats', 'transaction']
        },
        {
            id: 'datamodel',
            name: 'datamodel',
            category: 'commands',
            subcategory: 'generating',
            purpose: 'get',
            takeaway: 'Search data models directly',
            what: 'Searches accelerated data models, providing fast access to pre-indexed, normalized data.',
            why: 'Data models with acceleration are much faster than raw searches. Essential for Enterprise Security and large-scale deployments.',
            syntax: 'datamodel <model> <object> search | ...',
            examples: [
                { spl: '| datamodel Authentication Successful_Authentication search | stats count by user', explanation: 'Search successful logins from Authentication model' },
                { spl: '| datamodel Network_Traffic All_Traffic search', explanation: 'Search all network traffic from data model' }
            ],
            relatedCommands: ['tstats', 'from', 'pivot']
        },
        {
            id: 'delta',
            name: 'delta',
            category: 'commands',
            subcategory: 'streaming',
            purpose: 'transform',
            takeaway: 'Calculate difference from previous event',
            what: 'Computes the difference between the current event\'s field value and the previous event\'s value.',
            why: 'Quick way to see changes between consecutive events - useful for monitoring counters, tracking rate of change, or identifying sudden jumps.',
            syntax: 'delta <field> [p=<events_back>] [as <newfield>]',
            examples: [
                { spl: '... | sort _time | delta bytes as bytes_change', explanation: 'Change in bytes from previous event' },
                { spl: '... | delta count p=5 as change_from_5_ago', explanation: 'Difference from 5 events ago' }
            ],
            relatedCommands: ['accum', 'autoregress', 'streamstats', 'trendline']
        },
        {
            id: 'erex',
            name: 'erex',
            category: 'commands',
            subcategory: 'extraction',
            purpose: 'transform',
            takeaway: 'Extract fields using examples instead of regex',
            what: 'Automatically generates a regex pattern based on examples you provide, then extracts matching values.',
            why: 'When you don\'t know regex but can identify the values you want - give examples and let Splunk figure out the pattern.',
            syntax: 'erex <field> examples="value1,value2" [fromfield=<field>]',
            examples: [
                { spl: '... | erex username examples="jsmith,admin123"', explanation: 'Extract usernames based on examples' },
                { spl: '... | erex ip examples="192.168.1.1,10.0.0.5" fromfield=_raw', explanation: 'Extract IPs matching example format' }
            ],
            relatedCommands: ['rex', 'extract', 'regex', 'kvform']
        },
        {
            id: 'extract',
            name: 'extract',
            category: 'commands',
            subcategory: 'extraction',
            purpose: 'transform',
            takeaway: 'Auto-extract key=value pairs (alias for kv)',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Automatically extracts fields from key=value pairs in your data. Alias for the kv command.',
                    why: 'Quick way to parse structured data that uses key=value format without writing explicit regex patterns.',
                    syntax: 'extract [<field>] [pairdelim=<char>] [kvdelim=<char>]',
                    example: { spl: '... | extract', explanation: 'Auto-extract all key=value pairs from _raw' }
                },
                practical: {
                    examples: [
                        { spl: '... | extract pairdelim=";" kvdelim=":"', explanation: 'Extract with custom delimiters (key:value;key:value)' },
                        { spl: '... | extract field=message', explanation: 'Extract from a specific field' }
                    ],
                    gotchas: [
                        'Default delimiters are space for pairs and = for key/value',
                        'Works best with consistently formatted data',
                        'May create many fields - use fields command to limit'
                    ],
                    commonUses: ['Parse application logs with key=value format', 'Extract configuration settings', 'Quick field extraction without regex']
                },
                deep: {
                    performance: 'Fast for well-formatted data. Less flexible than rex for complex patterns.',
                    vsAlternatives: { 'rex': 'Use rex for complex or variable patterns', 'spath': 'Use spath for JSON/XML structured data' }
                }
            },
            relatedCommands: ['kvform', 'rex', 'spath', 'xmlkv']
        },
        {
            id: 'format',
            name: 'format',
            category: 'commands',
            subcategory: 'formatting',
            purpose: 'output',
            takeaway: 'Format subsearch results for use in main search',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts subsearch results into a format suitable for use in the main search, typically creating OR-joined conditions.',
                    why: 'Used with subsearches to build dynamic filter lists - find a set of values in one search and use them to filter another.',
                    syntax: 'format [mvsep=<sep>] [maxresults=<n>]',
                    example: { spl: '[search index=threats | fields ip | format] index=network', explanation: 'Use threat IPs to filter network logs' }
                },
                practical: {
                    examples: [
                        { spl: '[search failed_logins>10 | fields user | format]', explanation: 'Build OR list of problem users' },
                        { spl: '[search index=blocklist | fields domain | format maxresults=1000]', explanation: 'Limit results in subsearch' }
                    ],
                    gotchas: [
                        'Subsearch has time and result limits (60s, 50K by default)',
                        'Creates (field=val1 OR field=val2) format by default',
                        'Use return command for different output formats'
                    ],
                    commonUses: ['Dynamic filter lists from threat intel', 'Find events matching criteria from another search', 'Build watchlist-based queries']
                },
                deep: {
                    performance: 'Subsearch completes before main search uses results. Keep subsearch results small.',
                    vsAlternatives: { 'return': 'More control over output format', 'lookup': 'Better for static reference lists', 'join': 'When you need field enrichment not filtering' }
                }
            },
            relatedCommands: ['return', 'search', 'join', 'lookup']
        },
        {
            id: 'from',
            name: 'from',
            category: 'commands',
            subcategory: 'generating',
            purpose: 'get',
            takeaway: 'Search datasets, data models, or saved searches',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Retrieves data from various Splunk datasets including data models, lookups, and saved searches.',
                    why: 'Cleaner syntax for accessing data models and other dataset types. Alternative to datamodel command with more flexibility.',
                    syntax: 'from datamodel:<model>.<object> | from lookup:<lookup> | from savedsearch:<name>',
                    example: { spl: '| from datamodel:Authentication.Authentication', explanation: 'Search Authentication data model' }
                },
                practical: {
                    examples: [
                        { spl: '| from lookup:assets.csv', explanation: 'Search a lookup table directly' },
                        { spl: '| from savedsearch:"Daily Summary"', explanation: 'Run a saved search' }
                    ],
                    gotchas: [
                        'Starts with pipe (|) since it generates events',
                        'Data model must be accelerated for best performance',
                        'Saved search name with spaces needs quotes'
                    ],
                    commonUses: ['Access CIM-normalized data models', 'Read from lookup tables', 'Reuse saved searches']
                },
                deep: {
                    performance: 'For data models, similar to datamodel command. Use tstats for better performance on accelerated models.',
                    vsAlternatives: { 'tstats': 'Faster for accelerated data models', 'inputlookup': 'More options for reading lookups', 'datamodel': 'Original command for data models' }
                }
            },
            relatedCommands: ['datamodel', 'inputlookup', 'tstats', 'savedsearch']
        },
        {
            id: 'geom',
            name: 'geom',
            category: 'commands',
            subcategory: 'geographic',
            purpose: 'combine',
            takeaway: 'Add geographic boundary data for choropleth maps',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Adds geographic feature definitions (polygons) for creating choropleth (filled region) maps.',
                    why: 'When you want to visualize data on maps by region - countries, states, or custom boundaries like sales territories.',
                    syntax: 'geom <featureCollection> [featureIdField=<field>]',
                    example: { spl: '... | stats count by country | geom geo_countries featureIdField=country', explanation: 'Add country boundaries for map' }
                },
                practical: {
                    examples: [
                        { spl: '... | geom geo_us_states featureIdField=state', explanation: 'US state boundaries' },
                        { spl: '... | stats sum(revenue) by region | geom sales_regions featureIdField=region', explanation: 'Custom region boundaries' }
                    ],
                    gotchas: [
                        'Feature collection must be installed (geo_countries, geo_us_states are built-in)',
                        'Field values must match feature IDs in the collection',
                        'Use for choropleth maps, not point/cluster maps'
                    ],
                    commonUses: ['Country-level attack visualization', 'State/region comparisons', 'Custom territory mapping']
                },
                deep: {
                    performance: 'Adds polygon data for visualization. Keep data aggregated by region before using.',
                    vsAlternatives: { 'geostats': 'Use for cluster/point maps instead of filled regions', 'iplocation': 'Adds lat/lon coordinates for point mapping' }
                }
            },
            relatedCommands: ['iplocation', 'geostats', 'stats']
        },
        {
            id: 'geostats',
            name: 'geostats',
            category: 'commands',
            subcategory: 'geographic',
            purpose: 'aggregate',
            takeaway: 'Aggregate statistics for map visualization',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Calculates statistics grouped by geographic location for cluster map visualizations.',
                    why: 'When you want to see data distribution on a map - where are attacks coming from, where are your users located.',
                    syntax: 'geostats [latfield=<field>] [longfield=<field>] <stats-func> [by <field>]',
                    example: { spl: '... | iplocation src_ip | geostats count by action', explanation: 'Map event counts by source location' }
                },
                practical: {
                    examples: [
                        { spl: '... | geostats latfield=lat longfield=lon sum(bytes)', explanation: 'Map data transfer by location' },
                        { spl: '... | iplocation src_ip | geostats count', explanation: 'Simple count by geographic location' }
                    ],
                    gotchas: [
                        'Requires lat/lon coordinates (use iplocation first for IPs)',
                        'Default field names are lat and lon',
                        'Creates clustered visualization for dense data'
                    ],
                    commonUses: ['Visualize attack origins on world map', 'Show user distribution geographically', 'Map traffic volumes by location']
                },
                deep: {
                    performance: 'Efficient aggregation. Use iplocation before geostats to add coordinates to IP addresses.',
                    vsAlternatives: { 'geom': 'Use for filled region (choropleth) maps instead of clusters', 'stats + iplocation': 'Manual approach with more control' }
                }
            },
            relatedCommands: ['iplocation', 'geom', 'stats', 'timechart']
        },
        {
            id: 'kvform',
            name: 'kvform',
            category: 'commands',
            subcategory: 'extraction',
            purpose: 'transform',
            takeaway: 'Extract fields using a form template',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Extracts fields based on a predefined form template that maps field positions to names.',
                    why: 'When data follows a consistent structure that can be described with a form template rather than regex.',
                    syntax: 'kvform [form=<form_name>] [field=<field>]',
                    example: { spl: '... | kvform form=my_log_format', explanation: 'Extract using defined form template' }
                },
                practical: {
                    examples: [
                        { spl: '... | kvform field=message', explanation: 'Apply form extraction to message field' }
                    ],
                    gotchas: [
                        'Form templates must be defined in advance',
                        'Less flexible than rex but easier for non-regex users',
                        'Good for consistently structured data'
                    ],
                    commonUses: ['Parse standardized log formats', 'Extract from structured templates', 'Non-regex field extraction']
                },
                deep: {
                    performance: 'Fast for matching templates. Define templates in transforms.conf.',
                    vsAlternatives: { 'rex': 'More flexible but requires regex knowledge', 'extract': 'Simpler for key=value patterns' }
                }
            },
            relatedCommands: ['extract', 'rex', 'spath', 'xmlkv']
        },
        {
            id: 'makemv',
            name: 'makemv',
            category: 'commands',
            subcategory: 'multivalue',
            purpose: 'transform',
            takeaway: 'Split a field into multivalue',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts a single-value field into a multivalue field by splitting on a delimiter.',
                    why: 'When a field contains multiple values in one string (like comma-separated lists) and you need to work with them individually.',
                    syntax: 'makemv [delim=<string>] [allowempty=<bool>] <field>',
                    example: { spl: '... | makemv delim="," recipients', explanation: 'Split comma-separated recipients into multivalue' }
                },
                practical: {
                    examples: [
                        { spl: '... | makemv delim=" " tags | mvexpand tags', explanation: 'Split and expand space-separated tags' },
                        { spl: '... | makemv delim="|" categories | stats count by categories', explanation: 'Split pipe-delimited then count' }
                    ],
                    gotchas: [
                        'Creates multivalue field - use mvexpand to create separate events',
                        'Default delimiter is space',
                        'allowempty=true includes empty values between delimiters'
                    ],
                    commonUses: ['Parse comma-separated values', 'Split multi-value strings for analysis', 'Prepare data for mvexpand']
                },
                deep: {
                    performance: 'Fast streaming operation. Combine with mvexpand for event multiplication.',
                    vsAlternatives: { 'split()': 'Eval function version: eval mv=split(field, ",")', 'rex': 'Use for pattern-based splitting' }
                }
            },
            relatedCommands: ['mvexpand', 'mvcombine', 'split', 'mvjoin']
        },
        {
            id: 'mstats',
            name: 'mstats',
            category: 'commands',
            subcategory: 'metrics',
            purpose: 'aggregate',
            takeaway: 'Query metrics data efficiently',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Retrieves and aggregates data from metrics indexes, which store time-series numeric data efficiently.',
                    why: 'Metrics indexes are optimized for numeric time-series data like system performance, application metrics, and IoT sensor data.',
                    syntax: 'mstats <stats-func> WHERE index=<metrics_index> [by <dimensions>] [span=<time>]',
                    example: { spl: '| mstats avg(cpu.percent) WHERE index=metrics by host span=5m', explanation: 'Average CPU by host every 5 min' }
                },
                practical: {
                    examples: [
                        { spl: '| mstats max(memory.used) WHERE index=metrics prestats=true | timechart max(memory.used)', explanation: 'Memory usage over time' },
                        { spl: '| mstats count(cpu.percent) as datapoints WHERE index=metrics by host', explanation: 'Count metric data points per host' }
                    ],
                    gotchas: [
                        'Only works with metrics indexes, not event indexes',
                        'Use mcatalog to discover available metrics',
                        'prestats=true needed for timechart compatibility'
                    ],
                    commonUses: ['Monitor system performance metrics', 'Analyze application metrics', 'IoT and sensor data analysis']
                },
                deep: {
                    performance: 'Much faster than regular stats on event data. Metrics indexes are highly optimized for numeric time-series.',
                    vsAlternatives: { 'stats': 'For event data (non-metrics indexes)', 'tstats': 'For accelerated data models' }
                }
            },
            relatedCommands: ['stats', 'tstats', 'timechart', 'mcatalog']
        },
        {
            id: 'multisearch',
            name: 'multisearch',
            category: 'commands',
            subcategory: 'generating',
            purpose: 'combine',
            takeaway: 'Run multiple searches and combine results',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Executes multiple independent searches simultaneously and combines their results into one dataset.',
                    why: 'More efficient than append when you need to run several different searches - they execute in parallel rather than sequentially.',
                    syntax: 'multisearch [<search1>] [<search2>] ...',
                    example: { spl: '| multisearch [search index=web error] [search index=app error]', explanation: 'Search errors in both indexes simultaneously' }
                },
                practical: {
                    examples: [
                        { spl: '| multisearch [search src_ip=10.*] [search dest_ip=10.*]', explanation: 'Find internal traffic as source or dest' }
                    ],
                    gotchas: ['Searches run in parallel - good for independent queries', 'Each search must be in brackets', 'Results are simply concatenated'],
                    commonUses: ['Search multiple indexes in parallel', 'Combine independent queries efficiently', 'Union different data sources']
                },
                deep: {
                    performance: 'Parallel execution is faster than sequential append for independent searches.',
                    vsAlternatives: { 'append': 'Sequential - use multisearch for parallel', 'union': 'More flexible dataset support' }
                }
            },
            relatedCommands: ['append', 'union', 'join']
        },
        {
            id: 'mvcombine',
            name: 'mvcombine',
            category: 'commands',
            subcategory: 'multivalue',
            purpose: 'output',
            takeaway: 'Combine rows into multivalue fields',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Combines multiple events into one, merging field values into multivalue fields.',
                    why: 'Opposite of mvexpand - when you want to collapse multiple rows back into a single event with multivalue fields.',
                    syntax: 'mvcombine [delim=<string>] <field>',
                    example: { spl: '... | stats count by user, action | mvcombine action', explanation: 'Combine actions per user into one row' }
                },
                practical: {
                    examples: [
                        { spl: '... | mvcombine delim="; " dest_ip', explanation: 'Combine destination IPs with semicolon delimiter' }
                    ],
                    gotchas: ['All other fields must be identical for rows to combine', 'Creates multivalue field from single values', 'Use delim for display formatting'],
                    commonUses: ['Collapse expanded rows back together', 'Create summary with multivalue lists', 'Reverse mvexpand operation']
                },
                deep: {
                    performance: 'Requires matching on all other fields. Works best after stats or dedup.',
                    vsAlternatives: { 'mvexpand': 'Opposite operation - expands multivalue to rows', 'stats values()': 'Alternative for collecting unique values' }
                }
            },
            relatedCommands: ['mvexpand', 'makemv', 'mvjoin', 'stats']
        },
        {
            id: 'mvdedup',
            name: 'mvdedup',
            category: 'commands',
            subcategory: 'multivalue',
            purpose: 'output',
            takeaway: 'Remove duplicates from multivalue field',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Removes duplicate values from a multivalue field, keeping only unique values.',
                    why: 'Clean up multivalue fields that may have accumulated duplicate entries.',
                    syntax: 'mvdedup <field>',
                    example: { spl: '... | mvdedup tags', explanation: 'Remove duplicate tags' }
                },
                practical: {
                    examples: [
                        { spl: '... | eval all_users=mvappend(src_user, dest_user) | mvdedup all_users', explanation: 'Combine and dedupe user lists' }
                    ],
                    gotchas: ['Only removes duplicates within a single multivalue field', 'Preserves order of first occurrence', 'Different from dedup command which works on events'],
                    commonUses: ['Clean up merged multivalue fields', 'Remove duplicate values after mvappend', 'Ensure unique values in lists']
                },
                deep: {
                    performance: 'Fast operation on multivalue fields.',
                    vsAlternatives: { 'dedup': 'For removing duplicate events, not multivalue values', 'stats values()': 'Automatically provides unique values' }
                }
            },
            relatedCommands: ['mvexpand', 'mvcombine', 'dedup', 'stats']
        },
        {
            id: 'reverse',
            name: 'reverse',
            category: 'commands',
            subcategory: 'ordering',
            purpose: 'filter',
            takeaway: 'Reverse the order of results',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Reverses the order of search results.',
                    why: 'Quick way to flip result order - useful after sorting or when you want to see events in opposite order.',
                    syntax: 'reverse',
                    example: { spl: '... | sort _time | reverse', explanation: 'Sort by time then reverse (newest last)' }
                },
                practical: {
                    examples: [
                        { spl: '... | head 100 | reverse', explanation: 'Get first 100 events in reverse order' }
                    ],
                    gotchas: ['Must collect all results before reversing', 'Simple but can be memory-intensive on large results'],
                    commonUses: ['Flip sorted order', 'View oldest events first after time sort', 'Reverse display order']
                },
                deep: {
                    performance: 'Must buffer all results. For large datasets, consider sort with descending flag instead.',
                    vsAlternatives: { 'sort -field': 'Sort descending directly instead of sort then reverse' }
                }
            },
            relatedCommands: ['sort', 'head', 'tail']
        },
        {
            id: 'sample',
            name: 'sample',
            category: 'commands',
            subcategory: 'filtering',
            purpose: 'filter',
            takeaway: 'Return a random sample of events',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns a random sample of events from the results, useful for working with large datasets.',
                    why: 'When you have too much data and need a representative subset for analysis, testing, or exploration.',
                    syntax: 'sample [<ratio>] [<count>]',
                    example: { spl: '... | sample 1000', explanation: 'Random sample of 1000 events' }
                },
                practical: {
                    examples: [
                        { spl: '... | sample ratio=0.1', explanation: '10% random sample' }
                    ],
                    gotchas: ['Results are non-deterministic (different each time)', 'Use ratio for percentage, count for fixed number', 'Good for exploratory analysis'],
                    commonUses: ['Explore large datasets', 'Test queries on subset', 'Statistical sampling']
                },
                deep: {
                    performance: 'Efficient for reducing result size. Sample is applied after other commands.',
                    vsAlternatives: { 'head': 'For first N events (not random)', 'where random()': 'Alternative: where random() < 0.1 for 10% sample' }
                }
            },
            relatedCommands: ['head', 'tail']
        },
        {
            id: 'union',
            name: 'union',
            category: 'commands',
            subcategory: 'combining',
            purpose: 'combine',
            takeaway: 'Combine results from multiple datasets',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Merges results from multiple datasets (searches, lookups, data models) into a single result set.',
                    why: 'Cleaner alternative to append for combining data from multiple sources. Supports various dataset types.',
                    syntax: 'union [<dataset1>] [<dataset2>] ...',
                    example: { spl: '| union [search index=web] [search index=app]', explanation: 'Combine web and app log results' }
                },
                practical: {
                    examples: [
                        { spl: '... | union [inputlookup known_bad.csv]', explanation: 'Add lookup data to search results' }
                    ],
                    gotchas: ['Supports datasets, lookups, and searches', 'Field names should match for meaningful union', 'Results concatenated without deduplication'],
                    commonUses: ['Combine data from multiple sources', 'Add reference data to search results', 'Union different dataset types']
                },
                deep: {
                    performance: 'Efficient for combining datasets. Use for heterogeneous sources.',
                    vsAlternatives: { 'append': 'Similar but union supports more dataset types', 'multisearch': 'For parallel search execution' }
                }
            },
            relatedCommands: ['append', 'appendcols', 'multisearch', 'join']
        },
        {
            id: 'uniq',
            name: 'uniq',
            category: 'commands',
            subcategory: 'filtering',
            purpose: 'filter',
            takeaway: 'Remove consecutive duplicate events',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Removes duplicate events that appear consecutively (adjacent duplicates only).',
                    why: 'Like the Unix uniq command - removes repeated lines only when they\'re next to each other. Use sort first for true deduplication.',
                    syntax: 'uniq',
                    example: { spl: '... | sort user | uniq', explanation: 'Sort then remove consecutive duplicates' }
                },
                practical: {
                    examples: [
                        { spl: '... | uniq', explanation: 'Remove adjacent duplicate events' }
                    ],
                    gotchas: ['Only removes ADJACENT duplicates', 'Sort first to group duplicates together', 'Usually dedup is more useful'],
                    commonUses: ['Remove repeated log lines', 'Clean up sorted output', 'Unix-style deduplication']
                },
                deep: {
                    performance: 'Streaming operation - efficient but limited functionality.',
                    vsAlternatives: { 'dedup': 'More powerful - removes duplicates regardless of position' }
                }
            },
            relatedCommands: ['dedup', 'sort', 'mvdedup']
        },
        {
            id: 'untable',
            name: 'untable',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'output',
            takeaway: 'Convert table columns to rows (unpivot)',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts a wide table format into a tall format - turns column names into values (opposite of xyseries).',
                    why: 'When you need to "unpivot" data - convert multiple columns into rows for different visualizations or analysis.',
                    syntax: 'untable <row_field> <column_field> <value_field>',
                    example: { spl: '... | untable _time metric_name value', explanation: 'Convert columns to metric_name/value rows' }
                },
                practical: {
                    examples: [
                        { spl: '... | chart count by host action | untable host action count', explanation: 'Unpivot chart results' }
                    ],
                    gotchas: ['Creates more rows from fewer columns', 'Opposite of xyseries/pivot', 'Useful for converting wide data to tall format'],
                    commonUses: ['Unpivot chart/timechart output', 'Convert wide to tall format for analysis', 'Prepare data for certain visualizations']
                },
                deep: {
                    performance: 'Can increase row count significantly. Plan for larger result set.',
                    vsAlternatives: { 'xyseries': 'Opposite operation - pivot tall to wide', 'transpose': 'Simple row/column swap' }
                }
            },
            relatedCommands: ['xyseries', 'chart', 'timechart', 'transpose']
        },
        {
            id: 'xyseries',
            name: 'xyseries',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'output',
            takeaway: 'Convert rows to columns (pivot)',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts a tall data format into a wide format - turns values into column names (opposite of untable).',
                    why: 'Create pivot table style output where unique values become columns. Good for comparison views.',
                    syntax: 'xyseries <row_field> <column_field> <value_field>',
                    example: { spl: '... | stats count by _time, host | xyseries _time host count', explanation: 'Pivot hosts into columns' }
                },
                practical: {
                    examples: [
                        { spl: '... | xyseries user action count', explanation: 'Actions as columns for each user' }
                    ],
                    gotchas: ['Creates columns from unique values in column_field', 'Row_field values become row identifiers', 'High cardinality = many columns'],
                    commonUses: ['Create pivot tables from stats output', 'Side-by-side comparisons', 'Wide format for certain visualizations']
                },
                deep: {
                    performance: 'Column count depends on unique values. Keep cardinality manageable.',
                    vsAlternatives: { 'untable': 'Opposite operation - wide to tall', 'chart': 'Built-in pivot functionality' }
                }
            },
            relatedCommands: ['untable', 'chart', 'timechart', 'transpose']
        },
        {
            id: 'xmlkv',
            name: 'xmlkv',
            category: 'commands',
            subcategory: 'extraction',
            purpose: 'transform',
            takeaway: 'Extract fields from XML data',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Extracts field-value pairs from XML formatted data.',
                    why: 'Quick way to parse XML logs without complex xpath expressions. Creates fields from XML element names.',
                    syntax: 'xmlkv [<field>] [maxinputs=<n>]',
                    example: { spl: '... | xmlkv', explanation: 'Extract all XML fields from _raw' }
                },
                practical: {
                    examples: [
                        { spl: '... | xmlkv message', explanation: 'Extract XML from message field' }
                    ],
                    gotchas: ['Creates fields from XML element names', 'May create many fields', 'For complex XML use spath or xpath'],
                    commonUses: ['Parse Windows Event XML', 'Extract simple XML structures', 'Quick XML field extraction']
                },
                deep: {
                    performance: 'Fast for simple XML. Use xpath for complex nested structures.',
                    vsAlternatives: { 'xpath': 'For precise XPath queries', 'spath': 'More flexible for JSON and XML' }
                }
            },
            relatedCommands: ['spath', 'xpath', 'kvform', 'extract']
        },
        {
            id: 'contingency',
            name: 'contingency',
            category: 'commands',
            subcategory: 'reporting',
            purpose: 'aggregate',
            takeaway: 'Build a contingency table (cross-tabulation)',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Creates a contingency table showing the frequency of combinations of two fields.',
                    why: 'Statistical analysis tool for understanding relationships between categorical variables - how often do values co-occur?',
                    syntax: 'contingency <field1> <field2> [usetotal=<bool>]',
                    example: { spl: '... | contingency user action', explanation: 'Cross-tabulation of users vs actions' }
                },
                practical: {
                    examples: [
                        { spl: '... | contingency src_ip dest_port usetotal=true', explanation: 'Source IP vs port with totals' }
                    ],
                    gotchas: ['Creates matrix of co-occurrences', 'usetotal adds row/column totals', 'Good for statistical analysis'],
                    commonUses: ['Analyze relationships between fields', 'Cross-tabulation analysis', 'Statistical frequency tables']
                },
                deep: {
                    performance: 'Depends on cardinality of both fields.',
                    vsAlternatives: { 'chart': 'More flexible visualization options', 'stats count by': 'Manual cross-tabulation' }
                }
            },
            relatedCommands: ['stats', 'chart', 'associate', 'correlate']
        },
        {
            id: 'correlate',
            name: 'correlate',
            category: 'commands',
            subcategory: 'reporting',
            purpose: 'aggregate',
            takeaway: 'Calculate correlation between numeric fields',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Computes correlation coefficients between numeric fields to identify relationships.',
                    why: 'Find which metrics move together - useful for identifying dependencies, anomalies, or predictive relationships.',
                    syntax: 'correlate [type=<correlation_type>]',
                    example: { spl: '... | correlate', explanation: 'Calculate all pairwise correlations' }
                },
                practical: {
                    examples: [
                        { spl: '... | correlate type=pearson', explanation: 'Pearson correlation coefficients' }
                    ],
                    gotchas: ['Works with numeric fields only', 'Returns correlation matrix', 'Values range -1 to 1'],
                    commonUses: ['Find related metrics', 'Identify dependencies', 'Statistical analysis']
                },
                deep: {
                    performance: 'Requires numeric data. Computational cost increases with field count.',
                    vsAlternatives: { 'stats': 'For specific correlation calculations', 'associate': 'For categorical field relationships' }
                }
            },
            relatedCommands: ['stats', 'associate', 'contingency']
        },
        {
            id: 'mcatalog',
            name: 'mcatalog',
            category: 'commands',
            subcategory: 'metrics',
            purpose: 'get',
            takeaway: 'List available metrics metadata',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns metadata about metrics in metrics indexes - what metrics exist, their dimensions, and values.',
                    why: 'Discover what metrics are available before querying with mstats. Like tstats for metrics data.',
                    syntax: 'mcatalog values(<field>) WHERE index=<metrics_index>',
                    example: { spl: '| mcatalog values(metric_name) WHERE index=metrics', explanation: 'List all metric names' }
                },
                practical: {
                    examples: [
                        { spl: '| mcatalog values(host) WHERE index=metrics metric_name=cpu.*', explanation: 'Hosts with CPU metrics' }
                    ],
                    gotchas: ['Only works with metrics indexes', 'Returns metadata, not actual metrics', 'Use before mstats to discover data'],
                    commonUses: ['Discover available metrics', 'Find metric dimensions', 'Explore metrics index structure']
                },
                deep: {
                    performance: 'Fast metadata lookup. Use to understand metrics structure.',
                    vsAlternatives: { 'mstats': 'For actual metric values', 'metadata': 'For event index metadata' }
                }
            },
            relatedCommands: ['mstats', 'tstats', 'metadata']
        },
        {
            id: 'outputcsv',
            name: 'outputcsv',
            category: 'commands',
            subcategory: 'output',
            purpose: 'output',
            takeaway: 'Export results to a CSV file',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Writes search results to a CSV file in the Splunk dispatch directory.',
                    why: 'Export data for use in other tools, reporting, or archival. Simple way to get data out of Splunk.',
                    syntax: 'outputcsv [<filename>]',
                    example: { spl: '... | outputcsv my_results.csv', explanation: 'Save results to CSV file' }
                },
                practical: {
                    examples: [
                        { spl: '... | table user, action, count | outputcsv report.csv', explanation: 'Export formatted table to CSV' }
                    ],
                    gotchas: ['File saved to dispatch directory', 'Access via Job Inspector or REST API', 'For persistent storage use outputlookup'],
                    commonUses: ['Export results for external analysis', 'Create downloadable reports', 'Data export for compliance']
                },
                deep: {
                    performance: 'Adds I/O overhead. File size limited by available disk.',
                    vsAlternatives: { 'outputlookup': 'For reusable lookup tables', 'collect': 'For saving to summary index' }
                }
            },
            relatedCommands: ['outputlookup', 'collect', 'sendemail']
        },
        {
            id: 'pivot',
            name: 'pivot',
            category: 'commands',
            subcategory: 'reporting',
            purpose: 'aggregate',
            takeaway: 'Generate pivot table reports from data models',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Creates pivot table style reports from data models with rows, columns, and aggregations.',
                    why: 'Build reports using a structured data model without writing complex SPL. Designed for Pivot UI integration.',
                    syntax: 'pivot <datamodel> <object> <pivot-elements>',
                    example: { spl: '| pivot Authentication Authentication count(Authentication) splitrow user', explanation: 'Auth counts by user from data model' }
                },
                practical: {
                    examples: [
                        { spl: '| pivot Network_Traffic All_Traffic sum(bytes) splitrow src_ip', explanation: 'Bytes by source IP' }
                    ],
                    gotchas: ['Requires data model', 'Syntax matches Pivot UI output', 'For best performance use accelerated data models'],
                    commonUses: ['Create reports from data models', 'Replicate Pivot UI searches', 'Structured reporting']
                },
                deep: {
                    performance: 'Performance depends on data model acceleration.',
                    vsAlternatives: { 'tstats': 'Faster for accelerated models', 'stats': 'More flexible but requires SPL knowledge' }
                }
            },
            relatedCommands: ['datamodel', 'tstats', 'from', 'stats']
        },
        {
            id: 'predict',
            name: 'predict',
            category: 'commands',
            subcategory: 'ml',
            purpose: 'transform',
            takeaway: 'Forecast future values using machine learning',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Uses time-series algorithms to predict future values based on historical patterns.',
                    why: 'Forecast trends, predict capacity needs, or detect when metrics will cross thresholds.',
                    syntax: 'predict <field> [algorithm=<name>] [future_timespan=<span>]',
                    example: { spl: '... | timechart span=1d count | predict count', explanation: 'Predict future daily counts' }
                },
                practical: {
                    examples: [
                        { spl: '... | predict bytes future_timespan=7d', explanation: 'Forecast bytes 7 days ahead' }
                    ],
                    gotchas: ['Works best with time-series data', 'Requires historical data for training', 'Predictions are estimates, not guarantees'],
                    commonUses: ['Capacity planning', 'Trend forecasting', 'Anomaly prediction']
                },
                deep: {
                    performance: 'Computational cost depends on data size and algorithm.',
                    vsAlternatives: { 'trendline': 'For simpler moving averages', 'anomalydetection': 'For detecting outliers vs predicting future' }
                }
            },
            relatedCommands: ['anomalydetection', 'trendline', 'timechart']
        },
        {
            id: 'savedsearch',
            name: 'savedsearch',
            category: 'commands',
            subcategory: 'generating',
            purpose: 'get',
            takeaway: 'Run a saved search by name',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Executes a previously saved search and returns its results.',
                    why: 'Reuse existing searches without duplicating SPL. Good for incorporating shared logic.',
                    syntax: 'savedsearch <name>',
                    example: { spl: '| savedsearch "Daily Security Summary"', explanation: 'Run saved search by name' }
                },
                practical: {
                    examples: [
                        { spl: '| savedsearch my_base_search | stats count by user', explanation: 'Run saved search then add more processing' }
                    ],
                    gotchas: ['Search name with spaces needs quotes', 'Uses saved search time range unless overridden', 'Inherits saved search permissions'],
                    commonUses: ['Reuse complex search logic', 'Incorporate standardized searches', 'Build on existing searches']
                },
                deep: {
                    performance: 'Performance same as running the saved search directly.',
                    vsAlternatives: { 'from': 'Can also run saved searches: from savedsearch:name', 'Macro Basics': 'For reusable search fragments' }
                }
            },
            relatedCommands: ['from', 'search', 'inputlookup']
        },
        {
            id: 'sendemail',
            name: 'sendemail',
            category: 'commands',
            subcategory: 'output',
            purpose: 'output',
            takeaway: 'Send search results via email',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Emails search results to specified recipients, with options for format and attachments.',
                    why: 'Alert stakeholders, send scheduled reports, or notify on-call staff when conditions are met.',
                    syntax: 'sendemail to=<addresses> [subject=<text>] [format=<type>]',
                    example: { spl: '... | sendemail to="admin@example.com" subject="Alert: High Error Rate"', explanation: 'Email alert to admin' }
                },
                practical: {
                    examples: [
                        { spl: '... | sendemail to="team@example.com" format=csv', explanation: 'Send results as CSV attachment' }
                    ],
                    gotchas: ['Requires mail server configuration in Splunk', 'Multiple recipients: comma-separated', 'format options: table, csv, raw'],
                    commonUses: ['Send alerts on conditions', 'Email scheduled reports', 'Notify stakeholders']
                },
                deep: {
                    performance: 'Email delivery depends on mail server. Avoid in high-frequency searches.',
                    vsAlternatives: { 'Alert actions': 'Better for automated alerting', 'outputcsv': 'For file-based sharing instead of email' }
                }
            },
            relatedCommands: ['collect', 'outputcsv', 'outputlookup']
        },
        {
            id: 'transpose',
            name: 'transpose',
            category: 'commands',
            subcategory: 'transforming',
            purpose: 'output',
            takeaway: 'Swap rows and columns',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts rows to columns and columns to rows - a simple matrix transpose.',
                    why: 'Reorient data for different visualizations or when you need to pivot the structure of your results.',
                    syntax: 'transpose [<max_rows>] [column_name=<field>] [header_field=<field>]',
                    example: { spl: '... | stats count by host | transpose', explanation: 'Turn hosts from rows to columns' }
                },
                practical: {
                    examples: [
                        { spl: '... | transpose 5 header_field=metric', explanation: 'Transpose with custom header field' }
                    ],
                    gotchas: ['Limited by max_rows (default 5)', 'Creates "column" and "row X" fields by default', 'Good for small result sets'],
                    commonUses: ['Reorient data for display', 'Create comparison tables', 'Format for specific visualizations']
                },
                deep: {
                    performance: 'Memory usage grows with result size. Use max_rows limit.',
                    vsAlternatives: { 'xyseries': 'More control over pivot structure', 'untable': 'For tall-to-wide conversion' }
                }
            },
            relatedCommands: ['xyseries', 'untable', 'chart']
        },
        {
            id: 'trendline',
            name: 'trendline',
            category: 'commands',
            subcategory: 'streaming',
            purpose: 'transform',
            takeaway: 'Calculate moving averages and trends',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Computes moving averages (simple, exponential, weighted) to smooth data and identify trends.',
                    why: 'Smooth out noise in time-series data to see underlying trends, or detect when values deviate from the trend.',
                    syntax: 'trendline <trendtype><period>(<field>) [as <newfield>]',
                    example: { spl: '... | timechart span=1h count | trendline sma5(count) as moving_avg', explanation: '5-period simple moving average' }
                },
                practical: {
                    examples: [
                        { spl: '... | trendline ema10(response_time) as trend', explanation: '10-period exponential moving average' },
                        { spl: '... | trendline wma3(bytes) as weighted_avg', explanation: '3-period weighted moving average' }
                    ],
                    gotchas: ['sma = simple, ema = exponential, wma = weighted moving average', 'Number is the period/window size', 'First N-1 values will be null'],
                    commonUses: ['Smooth noisy time-series data', 'Identify trends', 'Create baseline for comparison']
                },
                deep: {
                    performance: 'Efficient streaming operation.',
                    vsAlternatives: { 'predict': 'For future forecasting', 'streamstats avg()': 'Alternative for custom window calculations' }
                }
            },
            relatedCommands: ['predict', 'timechart', 'autoregress', 'streamstats']
        },
        {
            id: 'validate',
            name: 'validate',
            category: 'commands',
            subcategory: 'filtering',
            purpose: 'transform',
            takeaway: 'Return first failing validation message',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Evaluates a series of boolean expressions and returns the message for the first one that fails.',
                    why: 'Data validation and quality checks - identify which validation rule failed for each event.',
                    syntax: 'validate <condition1> <message1> [<condition2> <message2>]...',
                    example: { spl: '... | validate bytes>0 "Bytes must be positive" user!="" "User is required"', explanation: 'Validate required fields' }
                },
                practical: {
                    examples: [
                        { spl: '... | validate isnotnull(src_ip) "Missing source IP"', explanation: 'Check for missing values' }
                    ],
                    gotchas: ['Returns first failing message only', 'No message if all validations pass', 'Good for data quality checks'],
                    commonUses: ['Data quality validation', 'Identify missing required fields', 'Check data constraints']
                },
                deep: {
                    performance: 'Lightweight evaluation operation.',
                    vsAlternatives: { 'where': 'For filtering invalid events', 'eval + case': 'For multiple error messages' }
                }
            },
            relatedCommands: ['where', 'eval', 'case']
        },
        {
            id: 'xpath',
            name: 'xpath',
            category: 'commands',
            subcategory: 'extraction',
            purpose: 'transform',
            takeaway: 'Extract XML values using XPath expressions',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Extracts values from XML data using XPath query syntax for precise targeting.',
                    why: 'When you need to extract specific nested values from complex XML structures.',
                    syntax: 'xpath [field=<field>] outfield=<newfield> <xpath_expression>',
                    example: { spl: '... | xpath outfield=username "//User/Name"', explanation: 'Extract username from XML path' }
                },
                practical: {
                    examples: [
                        { spl: '... | xpath field=xml_data outfield=error_code "//Error/@code"', explanation: 'Extract attribute from XML' }
                    ],
                    gotchas: ['Use // for any depth, / for direct child', '@attr for attributes', 'Requires valid XPath syntax'],
                    commonUses: ['Parse complex XML logs', 'Extract specific nested values', 'Windows Event XML parsing']
                },
                deep: {
                    performance: 'More precise than xmlkv but requires XPath knowledge.',
                    vsAlternatives: { 'xmlkv': 'For simple XML extraction', 'spath': 'More flexible, works with JSON too' }
                }
            },
            relatedCommands: ['xmlkv', 'spath', 'rex']
        },
        {
            id: 'metadata',
            name: 'metadata',
            category: 'commands',
            subcategory: 'generating',
            purpose: 'get',
            takeaway: 'Get metadata about indexes, hosts, sources, or sourcetypes',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns metadata about your Splunk data - what indexes exist, which hosts are logging, what sourcetypes are available.',
                    why: 'Discover what data you have access to, when it was last updated, and what sources are available for searching.',
                    syntax: 'metadata type=<hosts|sources|sourcetypes> [index=<index>]',
                    example: { spl: '| metadata type=sourcetypes index=security', explanation: 'List sourcetypes in security index' }
                },
                practical: {
                    examples: [
                        { spl: '| metadata type=hosts | sort -lastTime', explanation: 'Hosts sorted by most recent activity' },
                        { spl: '| metadata type=sources index=*', explanation: 'All sources across all indexes' }
                    ],
                    gotchas: ['Returns metadata, not events', 'Includes firstTime, lastTime, totalCount', 'Fast way to explore data inventory'],
                    commonUses: ['Discover available data sources', 'Find inactive hosts', 'Inventory data sources']
                },
                deep: {
                    performance: 'Very fast - reads metadata, not events.',
                    vsAlternatives: { 'eventcount': 'For event counts per index', 'tstats': 'For indexed field values' }
                }
            },
            relatedCommands: ['tstats', 'eventcount', 'mcatalog']
        },
        {
            id: 'eventcount',
            name: 'eventcount',
            category: 'commands',
            subcategory: 'generating',
            purpose: 'get',
            takeaway: 'Quickly count events per index',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns event counts for indexes without actually searching the data - much faster than stats count.',
                    why: 'Quickly check how much data exists in each index, useful for capacity planning and data validation.',
                    syntax: 'eventcount [summarize=<bool>] [index=<index>]',
                    example: { spl: '| eventcount summarize=false index=* | table index count', explanation: 'Count events per index' }
                },
                practical: {
                    examples: [
                        { spl: '| eventcount index=security', explanation: 'Total events in security index' }
                    ],
                    gotchas: ['summarize=false shows per-index counts', 'summarize=true (default) shows total', 'Uses metadata, not full search'],
                    commonUses: ['Check index sizes', 'Capacity monitoring', 'Data ingestion verification']
                },
                deep: {
                    performance: 'Very fast - reads index metadata only.',
                    vsAlternatives: { 'stats count': 'Slower but allows filtering', 'metadata': 'More metadata details' }
                }
            },
            relatedCommands: ['metadata', 'tstats', 'stats']
        },
        {
            id: 'map',
            name: 'map',
            category: 'commands',
            subcategory: 'subsearch',
            purpose: 'combine',
            takeaway: 'Run a search for each result row (iterative subsearch)',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Executes a search once for each result row, substituting field values into the search string. Enables iterative or recursive lookups.',
                    why: 'Essential for process tree traversal, chained investigations, and scenarios where you need to "follow the trail" through multiple hops.',
                    syntax: 'map search="<search_string>" [maxsearches=<int>]',
                    example: { spl: '... | map search="search index=security ParentProcessId=$ProcessId$"', explanation: 'Find child processes for each process' }
                },
                practical: {
                    examples: [
                        { spl: 'index=security EventCode=4688 user=admin | head 5 | map search="search index=security ProcessId=$ProcessId$ | stats count by CommandLine"', explanation: 'Get command details for each process started by admin' },
                        { spl: '| inputlookup suspicious_ips.csv | map search="search index=firewall src_ip=$ip$ | stats sum(bytes) as total_bytes" maxsearches=100', explanation: 'Check traffic volume for each suspicious IP' },
                        { spl: 'index=endpoint malware | map search="search index=endpoint host=$host$ earliest=$_time$ latest=+1h | stats values(process) as subsequent_processes"', explanation: 'Find processes launched within 1 hour of malware detection' }
                    ],
                    gotchas: [
                        'Default maxsearches=10 - increase for larger datasets but watch performance',
                        'Use $field$ syntax to substitute values from each row',
                        'Each mapped search runs independently - can be slow with many rows',
                        'Results are appended together from all searches'
                    ],
                    commonUses: [
                        'Process tree traversal (parent→child→grandchild)',
                        'Investigating IOCs from a lookup table',
                        'Following lateral movement paths',
                        'Chained correlation across data sources'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Recursive process tree', spl: '| makeresults | eval ProcessId="4688" | map search="search index=security EventCode=4688 ParentProcessId=$ProcessId$ | table ProcessId, NewProcessName" maxsearches=50', explanation: 'Traverse process tree from known PID' },
                        { name: 'Time-bounded follow-up', spl: '... | map search="search index=proxy src_ip=$src_ip$ earliest=\"$_time$\" latest=\"$_time$+5m\""', explanation: 'Find proxy events within 5 minutes of each alert' }
                    ],
                    performance: 'Runs N separate searches where N = number of input rows (up to maxsearches). Can be expensive - limit input rows with head/where first.',
                    internals: 'Each map iteration is a full search job. Field values are string-substituted into the search before execution.',
                    vsAlternatives: {
                        'join': 'Use join for simple key matching; map for complex iterative logic',
                        'lookup': 'Use lookup for static enrichment; map for dynamic searches',
                        'Subsearches': 'Subsearch runs once; map runs per row'
                    }
                }
            },
            relatedCommands: ['join', 'lookup', 'append']
        },
        {
            id: 'cluster',
            name: 'cluster',
            category: 'commands',
            subcategory: 'analysis',
            purpose: 'filter',
            takeaway: 'Group similar events together automatically',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Automatically groups events with similar field values, assigning a cluster ID to each group. Uses text similarity algorithms.',
                    why: 'Find patterns in unstructured data, group similar error messages, or identify related events without knowing the exact values in advance.',
                    syntax: 'cluster [field=<field>] [t=<threshold>] [showcount=<bool>]',
                    example: { spl: '... | cluster field=Message showcount=true | table cluster_count, Message', explanation: 'Group similar messages and count each cluster' }
                },
                practical: {
                    examples: [
                        { spl: 'index=web status>=500 | cluster field=uri t=0.8 | stats count by cluster_label', explanation: 'Group similar error URLs (80% similarity threshold)' },
                        { spl: 'index=security EventCode=4625 | cluster field=FailureReason showcount=true | dedup cluster_label', explanation: 'Find unique failure reason patterns' },
                        { spl: 'index=endpoint CommandLine=*powershell* | cluster field=CommandLine t=0.7 | where cluster_count > 5', explanation: 'Find repeated PowerShell command patterns' },
                        { spl: 'index=proxy | cluster field=url | stats dc(src_ip) as unique_sources by cluster_label | where unique_sources > 10', explanation: 'Find URL patterns accessed by many sources' }
                    ],
                    gotchas: [
                        'Threshold t (0-1) controls similarity - lower = looser grouping',
                        'Works best on text fields with natural variation',
                        'Adds cluster_label and optionally cluster_count fields',
                        'Default field is _raw if not specified'
                    ],
                    commonUses: [
                        'Grouping similar error messages',
                        'Finding command-line attack patterns',
                        'Identifying data staging (similar file operations)',
                        'Detecting variations of the same attack'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Attack pattern detection', spl: 'index=endpoint CommandLine=* | cluster field=CommandLine t=0.6 | eventstats count as pattern_count by cluster_label | where pattern_count > 3 AND pattern_count < 20', explanation: 'Find repeated but not ubiquitous command patterns' },
                        { name: 'Data staging detection', spl: 'index=endpoint (copy OR move OR xcopy) | cluster field=CommandLine | stats values(dest_path) as destinations, count by cluster_label, user | where count > 10', explanation: 'Group similar copy operations by user' }
                    ],
                    performance: 'Memory-intensive for large result sets. Filter events first to reduce clustering overhead.',
                    internals: 'Uses locality-sensitive hashing for efficient similarity matching. The t parameter controls the Jaccard similarity threshold.',
                    vsAlternatives: {
                        'dedup': 'For exact duplicates only',
                        'transaction': 'For grouping by field values and time, not similarity'
                    }
                }
            },
            relatedCommands: ['dedup', 'transaction', 'anomalydetection']
        },
        {
            id: 'diff',
            name: 'diff',
            category: 'commands',
            subcategory: 'comparison',
            purpose: 'filter',
            takeaway: 'Compare two search results and show differences',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Compares the current search results with a saved search or another dataset, showing what changed between them.',
                    why: 'Critical for before/after analysis, configuration change detection, and identifying what\'s different between two points in time.',
                    syntax: 'diff <position> [attribute=<field>] [diffheader=<bool>] [maxlen=<int>]',
                    example: { spl: '| diff position1=baseline position2=current attribute=config_value', explanation: 'Compare current config to baseline' }
                },
                practical: {
                    examples: [
                        { spl: '| savedsearch baseline_configs | diff position2=[| savedsearch current_configs] attribute=value', explanation: 'Compare saved config snapshots' },
                        { spl: '| inputlookup authorized_admins.csv | diff position2=[search index=security EventCode=4728 | table user] attribute=user', explanation: 'Find users added to admin groups not in authorized list' }
                    ],
                    gotchas: [
                        'Requires two datasets to compare (position1 and position2)',
                        'Shows additions, deletions, and changes',
                        'Often used with savedsearch or inputlookup for baseline comparison',
                        'Results show which position each row came from'
                    ],
                    commonUses: [
                        'Configuration change detection',
                        'Identifying new entries since baseline',
                        'Before/after incident comparison',
                        'Compliance drift detection'
                    ]
                },
                deep: {
                    performance: 'Both datasets must fit in memory for comparison.',
                    vsAlternatives: {
                        'set diff': 'For simpler set subtraction without detailed diff output',
                        'join type=left': 'For finding non-matching rows',
                        'stats earliest/latest': 'For detecting value changes over time'
                    }
                }
            },
            relatedCommands: ['set', 'join', 'append']
        },
        {
            id: 'selfjoin',
            name: 'selfjoin',
            category: 'commands',
            subcategory: 'combining',
            purpose: 'combine',
            takeaway: 'Join results with themselves on a key field',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Joins the search results with themselves based on a specified field, creating pairs of related events.',
                    why: 'Essential for finding relationships within the same dataset - like matching login/logout pairs, request/response events, or parent/child processes.',
                    syntax: 'selfjoin <field> [max=<int>] [overwrite=<bool>]',
                    example: { spl: '... | selfjoin session_id', explanation: 'Match events with same session_id' }
                },
                practical: {
                    examples: [
                        { spl: 'index=auth action IN (login, logout) | selfjoin user | where action="login" AND action2="logout" | eval session_duration=_time2-_time', explanation: 'Calculate session duration from login/logout pairs' },
                        { spl: 'index=web transaction_id=* | selfjoin transaction_id | where phase="request" AND phase2="response" | eval latency=_time2-_time', explanation: 'Match request/response pairs for latency calculation' },
                        { spl: 'index=security EventCode IN (4624, 4634) | selfjoin LogonId | where EventCode=4624 AND EventCode2=4634', explanation: 'Match logon/logoff events by LogonId' }
                    ],
                    gotchas: [
                        'Creates new fields with "2" suffix for the joined row (field2, _time2, etc.)',
                        'Can produce many combinations - filter first',
                        'max parameter limits matches per key (default 1)',
                        'Order matters - first occurrence matches with subsequent ones'
                    ],
                    commonUses: [
                        'Matching start/end event pairs',
                        'Calculating duration between related events',
                        'Finding request/response correlation',
                        'Session analysis'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Login without logout detection', spl: 'index=auth | selfjoin user max=0 | where action="login" AND NOT isnotnull(action2) earliest=-1h', explanation: 'Find logins with no matching logout' }
                    ],
                    performance: 'Memory-intensive for high-cardinality join fields. Use max to limit combinations.',
                    vsAlternatives: {
                        'transaction': 'Better for grouping related events with flexible matching',
                        'join': 'For joining with different datasets',
                        'stats': 'For first/last/list aggregations'
                    }
                }
            },
            relatedCommands: ['join', 'transaction', 'stats']
        },
        {
            id: 'set',
            name: 'set',
            category: 'commands',
            subcategory: 'combining',
            purpose: 'combine',
            takeaway: 'Perform set operations (union, diff, intersect) on results',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Performs mathematical set operations on two or more search results: union (combine all), diff (subtract), or intersect (common only).',
                    why: 'Perfect for threat intelligence matching, finding what\'s new or missing between datasets, and combining results from multiple searches.',
                    syntax: 'set <union|diff|intersect> [subsearch1] [subsearch2]...',
                    example: { spl: '| set diff [search index=current_users] [search index=authorized_users]', explanation: 'Find users not in authorized list' }
                },
                practical: {
                    examples: [
                        { spl: '| set intersect [search index=firewall src_ip=* | stats count by src_ip | fields src_ip] [| inputlookup threat_intel.csv | fields ip | rename ip as src_ip]', explanation: 'Find IPs in both traffic and threat intel' },
                        { spl: '| set union [search index=windows EventCode=4688] [search index=sysmon EventCode=1]', explanation: 'Combine process creation events from multiple sources' },
                        { spl: '| set diff [search index=auth user=* | dedup user | fields user] [| inputlookup terminated_users.csv | fields user]', explanation: 'Find active users excluding terminated list' }
                    ],
                    gotchas: [
                        'union: All rows from all searches (duplicates removed)',
                        'diff: Rows in first search NOT in subsequent searches',
                        'intersect: Only rows appearing in ALL searches',
                        'Fields must match for proper comparison'
                    ],
                    commonUses: [
                        'Threat intel IOC matching',
                        'Finding unauthorized users/systems',
                        'Combining data from multiple indexes',
                        'Exclusion list filtering'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        { name: 'Multi-source threat matching', spl: '| set intersect [search index=dns query=* | stats count by query | fields query] [search index=proxy url=* | rex field=url "https?://(?<query>[^/]+)" | stats count by query | fields query] [| inputlookup malicious_domains.csv | fields query]', explanation: 'Find domains appearing in DNS, proxy, AND threat intel' },
                        { name: 'New process detection', spl: '| set diff [search index=sysmon EventCode=1 earliest=-1d | stats count by Image | fields Image] [search index=sysmon EventCode=1 earliest=-8d latest=-1d | stats count by Image | fields Image]', explanation: 'Find executables seen today but not in prior week' }
                    ],
                    performance: 'Each subsearch runs fully before set operation. Keep subsearches efficient.',
                    vsAlternatives: {
                        'join': 'For field-based matching with different schemas',
                        'append': 'For simple concatenation without duplicate removal',
                        'diff': 'For detailed row-by-row comparison'
                    }
                }
            },
            relatedCommands: ['append', 'join', 'diff', 'multisearch']
        }
    ],

    functions: [
        {
            id: 'if',
            name: 'if()',
            category: 'functions',
            subcategory: 'conditional',
            purpose: 'decide',
            takeaway: 'Conditional value selection - returns one value if true, another if false',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns one value if a condition is true, or a different value if false. Like asking "if this, then that, otherwise something else."',
                    why: 'Core function for conditional logic - classify data, create flags, handle missing values, and make decisions based on field values.',
                    syntax: 'if(condition, value_if_true, value_if_false)',
                    example: {
                        spl: '| eval status=if(code>=400, "error", "ok")',
                        explanation: 'Creates a status field: "error" for codes 400+, "ok" for anything else'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval size=if(bytes>1000000, "large", "small")', explanation: 'Categorize by size threshold' },
                        { spl: '| eval risk=if(isnull(user), "unknown", "identified")', explanation: 'Handle null values with conditional' },
                        { spl: '| eval priority=if(severity>7 AND type="security", "critical", "normal")', explanation: 'Combine multiple conditions' }
                    ],
                    gotchas: [
                        'Both value expressions are evaluated even if not used - avoid expensive functions in both branches',
                        'Nested if() statements become hard to read - use case() for 3+ conditions',
                        'Condition must evaluate to boolean - use comparison operators or functions like isnull()'
                    ],
                    commonUses: [
                        'Creating binary flags from thresholds',
                        'Handling null or missing values',
                        'Simple classification (good/bad, yes/no)',
                        'Conditional field creation for dashboards'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Nested Conditional',
                            spl: '| eval tier=if(bytes>1000000, "large", if(bytes>1000, "medium", "small"))',
                            explanation: 'Multiple tiers - but consider case() for cleaner code'
                        },
                        {
                            name: 'Combined with Coalesce',
                            spl: '| eval user=if(isnull(username), coalesce(email, "unknown"), username)',
                            explanation: 'Fallback chain with null handling'
                        }
                    ],
                    performance: 'Lightweight function. However, both true and false expressions are evaluated during parsing, so avoid placing expensive operations (like lookups or complex regex) in either branch unless necessary.',
                    internals: 'if() is a true ternary operator evaluated at search time. Unlike some languages, SPL always evaluates both branches during the parse phase, though only one result is used.',
                    vsAlternatives: {
                        'case': 'Use case() for 3+ conditions - cleaner than nested if()',
                        'coalesce': 'Use coalesce() when just picking the first non-null value',
                        'validate': 'Use validate() when checking multiple conditions that must all be true'
                    }
                }
            },
            relatedCommands: ['case', 'coalesce', 'validate', 'isnull']
        },
        {
            id: 'case',
            name: 'case()',
            category: 'functions',
            subcategory: 'conditional',
            purpose: 'decide',
            takeaway: 'Multi-way conditional - first matching condition wins',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Evaluates multiple conditions in order and returns the value for the first condition that\'s true. Like a series of if/else-if statements.',
                    why: 'Much cleaner than nested if() statements when you have 3+ possible outcomes. Essential for classification, severity levels, and categorization.',
                    syntax: 'case(cond1, val1, cond2, val2, ..., true(), default)',
                    example: {
                        spl: '| eval severity=case(level<3,"low", level<7,"medium", level>=7,"high")',
                        explanation: 'Creates three severity categories based on level thresholds'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval category=case(port=80,"web", port=443,"https", port=22,"ssh", true(),"other")', explanation: 'Port-based service classification with default' },
                        { spl: '| eval daytype=case(date_wday="saturday" OR date_wday="sunday","weekend", true(),"weekday")', explanation: 'Weekend vs weekday classification' },
                        { spl: '| eval response=case(status<200,"info", status<300,"success", status<400,"redirect", status<500,"client_error", true(),"server_error")', explanation: 'HTTP status code categorization' }
                    ],
                    gotchas: [
                        'Order matters! First true condition wins - put most specific conditions first',
                        'Always include true() as last condition for a default, otherwise returns null',
                        'All conditions must come in pairs (condition, value) - odd arguments cause errors'
                    ],
                    commonUses: [
                        'Severity/priority classification',
                        'Port or protocol categorization',
                        'Status code grouping',
                        'Time-based bucketing (morning/afternoon/evening)'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Complex Condition Grouping',
                            spl: '| eval risk=case(src_ip="10.0.0.1" AND action="login_failed","high", match(user,"^admin"),"medium", true(),"low")',
                            explanation: 'Combine multiple field checks in each condition'
                        },
                        {
                            name: 'Null-Safe Classification',
                            spl: '| eval category=case(isnull(field),"missing", field="","empty", len(field)<5,"short", true(),"valid")',
                            explanation: 'Handle nulls, empty strings, and validation in one expression'
                        }
                    ],
                    performance: 'Efficient for multiple conditions - stops evaluating after first match. However, Splunk may still parse all value expressions, so avoid expensive operations.',
                    internals: 'case() uses short-circuit evaluation at runtime - once a condition matches, remaining conditions are not evaluated. Useful for performance with many branches.',
                    vsAlternatives: {
                        'if': 'Use if() for simple binary (true/false) decisions only',
                        'match': 'Use match() when conditions are all regex patterns against one field',
                        'lookup': 'Use lookup tables for large static mappings (100+ categories)'
                    }
                }
            },
            relatedCommands: ['if', 'coalesce', 'match', 'validate']
        },
        {
            id: 'coalesce',
            name: 'coalesce()',
            category: 'functions',
            subcategory: 'conditional',
            purpose: 'missing',
            takeaway: 'Returns first non-null value from a list',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns the first value in its argument list that is not null. Useful for picking from multiple possible field sources.',
                    why: 'Essential for handling missing data gracefully - merge similar fields, provide defaults, and normalize data that might be in different fields.',
                    syntax: 'coalesce(value1, value2, value3, ...)',
                    example: {
                        spl: '| eval user=coalesce(username, email, "unknown")',
                        explanation: 'Uses username if present, falls back to email, then "unknown" as last resort'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval ip=coalesce(src_ip, client_ip, c_ip, source)', explanation: 'Merge IP fields from different log formats' },
                        { spl: '| eval action=coalesce(event_action, action, "none")', explanation: 'Normalize action field with default' },
                        { spl: '| eval timestamp=coalesce(_time, event_time, indextime)', explanation: 'Use best available time field' }
                    ],
                    gotchas: [
                        'Empty string "" is NOT null - it will be returned! Use nullif() to convert empty to null first',
                        'Order matters - put your preferred field first',
                        'All arguments are evaluated, even if early ones aren\'t null'
                    ],
                    commonUses: [
                        'Normalizing fields across different sourcetypes',
                        'Providing sensible defaults for missing data',
                        'Merging similar fields (user/username/userid)',
                        'Creating unified fields for dashboards and reports'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Handle Empty Strings as Null',
                            spl: '| eval user=coalesce(nullif(username,""), nullif(email,""), "unknown")',
                            explanation: 'Treats empty strings as null for cleaner fallback logic'
                        },
                        {
                            name: 'Chained with Transformation',
                            spl: '| eval normalized_ip=coalesce(src_ip, if(isnotnull(xff), mvindex(split(xff,","),0), null()))',
                            explanation: 'Fall back to first IP from X-Forwarded-For header'
                        }
                    ],
                    performance: 'Lightweight function, but evaluates all arguments. Keep the list reasonably short (5-7 max) and avoid expensive transformations in the argument list.',
                    internals: 'coalesce() evaluates arguments left-to-right but all are parsed before execution. At runtime, returns immediately upon finding non-null. Works with any data type.',
                    vsAlternatives: {
                        'fillnull': 'Use fillnull command to replace nulls across many fields at once',
                        'if+isnull': 'if(isnull(a), b, a) is equivalent but coalesce() is cleaner',
                        'eval with default': 'For single field: eval field=if(isnull(field), "default", field)'
                    }
                }
            },
            relatedCommands: ['if', 'isnull', 'nullif', 'fillnull', 'isnotnull']
        },
        {
            id: 'strftime',
            name: 'strftime()',
            category: 'functions',
            subcategory: 'datetime',
            purpose: 'time',
            takeaway: 'Format epoch time as human-readable string',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts epoch time (seconds since 1970) into a formatted date/time string you can read and use in reports.',
                    why: 'Essential for making timestamps human-readable, extracting time components (hour, day), and grouping events by time periods.',
                    syntax: 'strftime(epoch_time, "format_string")',
                    example: {
                        spl: '| eval date=strftime(_time, "%Y-%m-%d")',
                        explanation: 'Converts _time to readable date like "2024-01-15"'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval hour=strftime(_time, "%H")', explanation: 'Extract hour (00-23) for hourly analysis' },
                        { spl: '| eval day_of_week=strftime(_time, "%A")', explanation: 'Get day name (Monday, Tuesday, etc.)' },
                        { spl: '| eval timestamp=strftime(_time, "%Y-%m-%d %H:%M:%S")', explanation: 'Full readable timestamp' },
                        { spl: '| stats count by strftime(_time, "%Y-%m")', explanation: 'Group by month directly in stats' }
                    ],
                    gotchas: [
                        'Input MUST be epoch time - use strptime() first if you have a string',
                        'Format codes are case-sensitive: %H (24-hour) vs %I (12-hour)',
                        'Timezone is Splunk server timezone unless you use %z to include offset'
                    ],
                    commonUses: [
                        'Creating readable timestamps for reports',
                        'Extracting hour/day for pattern analysis',
                        'Grouping events by time periods (weekly, monthly)',
                        'Formatting for dashboard displays'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Common Format Codes',
                            spl: '%Y=year %m=month %d=day %H=hour24 %M=min %S=sec %A=dayname %B=monthname',
                            explanation: 'Reference: %Y-%m-%d %H:%M:%S → 2024-01-15 14:30:00'
                        },
                        {
                            name: 'ISO 8601 Format',
                            spl: '| eval iso_time=strftime(_time, "%Y-%m-%dT%H:%M:%S%z")',
                            explanation: 'Standard format for APIs and logs: 2024-01-15T14:30:00-0500'
                        },
                        {
                            name: 'Business Hours Detection',
                            spl: '| eval is_business=if(strftime(_time,"%H")>=9 AND strftime(_time,"%H")<17 AND NOT match(strftime(_time,"%A"),"Saturday|Sunday"), 1, 0)',
                            explanation: 'Flag events during 9-5 on weekdays'
                        }
                    ],
                    performance: 'Fast function, minimal overhead. Fine to use in stats by clauses. For heavy use, consider pre-extracting time fields at index time.',
                    internals: 'strftime() wraps the C library strftime function. Uses server timezone by default. The %s format returns the original epoch (useful for round-tripping).',
                    vsAlternatives: {
                        'strptime': 'Opposite operation - parses string to epoch time',
                        'relative_time': 'For time math (adding/subtracting time spans)',
                        'now': 'For current time in epoch format'
                    }
                }
            },
            relatedCommands: ['strptime', 'now', 'relative_time', '_time']
        },
        {
            id: 'mvcount',
            name: 'mvcount()',
            category: 'functions',
            subcategory: 'multivalue',
            purpose: 'multivalue',
            takeaway: 'Count values in a multivalue field',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Counts how many individual values are in a multivalue field. Single values return 1, nulls return null.',
                    why: 'Essential for analyzing multivalue fields - find events with multiple values, detect anomalies, or validate data completeness.',
                    syntax: 'mvcount(multivalue_field)',
                    example: {
                        spl: '| eval ip_count=mvcount(src_ip)',
                        explanation: 'Counts how many IPs are in the src_ip field for each event'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| where mvcount(user) > 1', explanation: 'Find events with multiple users (potential shared sessions)' },
                        { spl: '| eval has_many_ips=if(mvcount(dest_ip)>5, "suspicious", "normal")', explanation: 'Flag events contacting many destinations' },
                        { spl: '| stats avg(mvcount(tags)) as avg_tags by sourcetype', explanation: 'Average number of tags per event by type' }
                    ],
                    gotchas: [
                        'Returns null (not 0) if field is empty or null - use coalesce(mvcount(field), 0) for numeric comparison',
                        'Single value fields return 1, not null',
                        'Works on any multivalue field, including those created by makemv or split'
                    ],
                    commonUses: [
                        'Detecting multi-value anomalies (too many IPs, users, etc.)',
                        'Validating data has expected number of values',
                        'Filtering for events with/without multiple values',
                        'Analyzing tag or category distributions'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Null-Safe Count',
                            spl: '| eval count=coalesce(mvcount(field), 0) | where count > 0',
                            explanation: 'Safely handle null fields by defaulting to 0'
                        },
                        {
                            name: 'Cardinality Check',
                            spl: '| eval unique_count=mvcount(mvdedup(values)) | where unique_count != mvcount(values)',
                            explanation: 'Find events with duplicate values in multivalue field'
                        }
                    ],
                    performance: 'Very fast operation - O(1) lookup of field metadata. Use freely in where clauses and evals.',
                    internals: 'Multivalue fields store a count internally, so mvcount() is a simple metadata lookup rather than iteration.',
                    vsAlternatives: {
                        'mvindex': 'Access specific position in multivalue field',
                        'mvfilter': 'Filter values within multivalue field, then count result',
                        'mvexpand': 'Expand multivalue to multiple events instead of counting'
                    }
                }
            },
            relatedCommands: ['mvindex', 'mvfilter', 'mvjoin', 'mvexpand', 'makemv']
        },
        {
            id: 'split',
            name: 'split()',
            category: 'functions',
            subcategory: 'string',
            purpose: 'text',
            takeaway: 'Split string into multivalue field by delimiter',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Breaks a string into multiple values based on a delimiter character. Creates a multivalue field from a single string.',
                    why: 'Essential for parsing delimited data - split paths, comma-separated lists, or any compound field into individual values you can analyze.',
                    syntax: 'split(string, "delimiter")',
                    example: {
                        spl: '| eval parts=split(path, "/")',
                        explanation: 'Splits "/var/log/syslog" into ["", "var", "log", "syslog"]'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval tags=split(tag_list, ",")', explanation: 'Parse comma-separated tags into multivalue field' },
                        { spl: '| eval domain_parts=split(domain, ".") | eval tld=mvindex(domain_parts, -1)', explanation: 'Split domain and extract TLD' },
                        { spl: '| eval filename=mvindex(split(path, "/"), -1)', explanation: 'Get filename from path (last segment)' }
                    ],
                    gotchas: [
                        'Delimiter is literal, not regex - use rex for complex patterns',
                        'Empty strings between delimiters are preserved (a,,b → ["a","","b"])',
                        'Leading delimiter creates empty first value (/path → ["", "path"])'
                    ],
                    commonUses: [
                        'Parsing comma or pipe-delimited fields',
                        'Breaking apart file paths',
                        'Splitting compound identifiers (user@domain)',
                        'Preparing data for mvindex or mvfilter'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Extract Specific Position',
                            spl: '| eval third=mvindex(split(field, ","), 2)',
                            explanation: 'Get third value (0-indexed) from comma-separated field'
                        },
                        {
                            name: 'Filter Split Results',
                            spl: '| eval non_empty=mvfilter(split(field, ",") != "")',
                            explanation: 'Split and remove empty values in one step'
                        },
                        {
                            name: 'Count Segments',
                            spl: '| eval depth=mvcount(split(path, "/"))-1',
                            explanation: 'Count path depth (subtract 1 for leading slash)'
                        }
                    ],
                    performance: 'Fast operation, but creates multivalue fields which consume more memory. For very long strings with many delimiters, consider processing limits.',
                    internals: 'split() is a simple string tokenization. Unlike makemv, it works on field values rather than the entire field. Result is an in-memory multivalue array.',
                    vsAlternatives: {
                        'makemv': 'Use makemv command for splitting into separate field values',
                        'rex': 'Use rex for complex regex-based extraction',
                        'mvjoin': 'Opposite operation - joins multivalue back to string'
                    }
                }
            },
            relatedCommands: ['mvjoin', 'mvindex', 'mvfilter', 'rex', 'makemv']
        },
        {
            id: 'now',
            name: 'now()',
            category: 'functions',
            subcategory: 'datetime',
            purpose: 'time',
            takeaway: 'Get current time as epoch timestamp',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns the current system time as an epoch timestamp (seconds since January 1, 1970). Takes no arguments.',
                    why: 'Essential for calculating how old events are, creating time-based thresholds, and filtering by relative time.',
                    syntax: 'now()',
                    example: {
                        spl: '| eval age_seconds=now()-_time',
                        explanation: 'Calculate how many seconds ago each event occurred'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval age_hours=(now()-_time)/3600', explanation: 'Event age in hours' },
                        { spl: '| where _time > now()-86400', explanation: 'Keep only events from last 24 hours (86400 seconds)' },
                        { spl: '| eval is_stale=if(now()-last_seen > 3600, "yes", "no")', explanation: 'Flag if over 1 hour since last seen' }
                    ],
                    gotchas: [
                        'Returns epoch time (integer seconds), not a readable string',
                        'Fixed at search start time - consistent across the entire search',
                        'For readable format: strftime(now(), "%Y-%m-%d %H:%M:%S")'
                    ],
                    commonUses: [
                        'Calculating event age or staleness',
                        'Creating time-based thresholds',
                        'Relative time filtering in eval/where',
                        'Computing time until future events (expiration, SLA)'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'SLA Monitoring',
                            spl: '| eval sla_remaining=(created_time + 86400) - now() | eval sla_status=case(sla_remaining<0,"breached", sla_remaining<3600,"critical", true(),"ok")',
                            explanation: 'Calculate remaining SLA time and classify status'
                        },
                        {
                            name: 'Age Bucketing',
                            spl: '| eval age_bucket=case((now()-_time)<3600,"last_hour", (now()-_time)<86400,"today", (now()-_time)<604800,"this_week", true(),"older")',
                            explanation: 'Categorize events by age relative to now'
                        }
                    ],
                    performance: 'Extremely lightweight - just returns a single value computed once at search start. No performance concerns.',
                    internals: 'now() is evaluated once when the search starts and that value is reused throughout. This ensures consistent age calculations even for long-running searches.',
                    vsAlternatives: {
                        'relative_time': 'Use relative_time(now(), "-1d@d") for time math like "start of yesterday"',
                        'strftime': 'Use strftime(now(), format) to display current time as string',
                        '_time': '_time is the event timestamp, now() is the search time'
                    }
                }
            },
            relatedCommands: ['relative_time', 'strftime', 'strptime', '_time']
        },

        // ============================================
        // Decision Functions
        // ============================================
        {
            id: 'in',
            name: 'in()',
            category: 'functions',
            subcategory: 'conditional',
            purpose: 'decide',
            takeaway: 'Check if value matches any item in a list',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns true if the first argument equals any of the following arguments. Like asking "is this value one of these options?"',
                    why: 'Much cleaner than writing multiple OR conditions. Essential for matching against known lists of values.',
                    syntax: 'in(field, value1, value2, value3, ...)',
                    example: {
                        spl: '| where in(status, "error", "critical", "fatal")',
                        explanation: 'Keep only events where status is error, critical, or fatal'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| where in(dest_port, 22, 23, 3389)', explanation: 'Filter for remote access ports' },
                        { spl: '| eval is_admin=if(in(user, "root", "admin", "administrator"), "yes", "no")', explanation: 'Flag admin accounts' },
                        { spl: '| where NOT in(src_ip, "10.0.0.1", "10.0.0.2")', explanation: 'Exclude specific IPs' }
                    ],
                    gotchas: [
                        'First argument is the field to check, remaining are values to match',
                        'Case-sensitive for strings - use lower() if needed',
                        'For large lists (100+), consider using a lookup instead'
                    ],
                    commonUses: [
                        'Filter for specific status codes or error types',
                        'Match against lists of known bad values',
                        'Check if port is in a defined service group',
                        'Validate field against allowed values'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Case-Insensitive Match',
                            spl: '| where in(lower(action), "block", "deny", "drop")',
                            explanation: 'Normalize case before checking'
                        },
                        {
                            name: 'Combined with Other Conditions',
                            spl: '| where in(dest_port, 80, 443) AND action="blocked"',
                            explanation: 'Web traffic that was blocked'
                        }
                    ],
                    performance: 'Efficient for small to medium lists. For very large lists, use a lookup table with | lookup or inputlookup instead.',
                    internals: 'in() performs sequential comparison and returns on first match. Order values by likelihood for micro-optimization.',
                    vsAlternatives: {
                        'OR conditions': 'in(x, "a", "b") is cleaner than x="a" OR x="b"',
                        'lookup': 'Use lookup for dynamic or large value lists',
                        'match': 'Use match() for regex pattern matching'
                    }
                }
            },
            relatedCommands: ['case', 'if', 'match', 'lookup']
        },

        // ============================================
        // Missing Data Functions
        // ============================================
        {
            id: 'isnull',
            name: 'isnull()',
            category: 'functions',
            subcategory: 'informational',
            purpose: 'missing',
            takeaway: 'Check if a field has no value (is null)',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns true if the field value is null (missing/undefined). Does NOT match empty strings.',
                    why: 'Essential for handling missing data - filter events with missing fields, provide defaults, or identify data quality issues.',
                    syntax: 'isnull(field)',
                    example: {
                        spl: '| where isnull(user)',
                        explanation: 'Find events where user field is missing'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval user=if(isnull(user), "unknown", user)', explanation: 'Replace null with default value' },
                        { spl: '| stats count(eval(isnull(src_ip))) as missing_ip', explanation: 'Count events missing source IP' },
                        { spl: '| where isnull(bytes) OR bytes=0', explanation: 'Find events with no byte count' }
                    ],
                    gotchas: [
                        'Null is different from empty string ("") - isnull("") returns false',
                        'Null is different from zero - isnull(0) returns false',
                        'Field that was never set is null; field set to "" is empty string'
                    ],
                    commonUses: [
                        'Find events with missing required fields',
                        'Conditional logic based on field presence',
                        'Data quality validation',
                        'Handle optional fields gracefully'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Check Multiple Fields',
                            spl: '| where isnull(src_ip) OR isnull(dest_ip) OR isnull(user)',
                            explanation: 'Find events missing any critical field'
                        },
                        {
                            name: 'Null vs Empty Handling',
                            spl: '| eval status=case(isnull(field), "missing", field="", "empty", true(), "present")',
                            explanation: 'Distinguish between null, empty, and present'
                        }
                    ],
                    performance: 'Extremely fast - simple null check.',
                    internals: 'Checks if field has no value in the event. Different from checking if field equals empty string.',
                    vsAlternatives: {
                        'isnotnull': 'Opposite - returns true if field HAS a value',
                        'coalesce': 'Returns first non-null value from list',
                        'fillnull': 'Command that replaces nulls with a value'
                    }
                }
            },
            relatedCommands: ['isnotnull', 'coalesce', 'nullif', 'fillnull']
        },
        {
            id: 'isnotnull',
            name: 'isnotnull()',
            category: 'functions',
            subcategory: 'informational',
            purpose: 'missing',
            takeaway: 'Check if a field has a value (is not null)',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns true if the field has any value (including empty string or zero). Opposite of isnull().',
                    why: 'Filter for events that have a specific field populated, or count populated vs missing values.',
                    syntax: 'isnotnull(field)',
                    example: {
                        spl: '| where isnotnull(error_message)',
                        explanation: 'Find events that have an error message field'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| stats count(eval(isnotnull(user))) as with_user, count as total', explanation: 'Count events with vs without user' },
                        { spl: '| where isnotnull(threat_score) AND threat_score > 50', explanation: 'Filter for high threat scores (must exist first)' },
                        { spl: '| eval has_email=if(isnotnull(email), "yes", "no")', explanation: 'Create flag for email presence' }
                    ],
                    gotchas: [
                        'Returns true for empty strings - isnotnull("") is true',
                        'Returns true for zero - isnotnull(0) is true',
                        'Use in combination with other checks if you need non-empty values'
                    ],
                    commonUses: [
                        'Filter for events with specific optional fields',
                        'Count field population rates',
                        'Validate required fields are present',
                        'Conditional processing based on field presence'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Non-Null AND Non-Empty',
                            spl: '| where isnotnull(field) AND field!=""',
                            explanation: 'Field must exist AND have actual content'
                        },
                        {
                            name: 'Population Rate',
                            spl: '| stats count(eval(isnotnull(user))) as populated, count as total | eval rate=round(populated/total*100, 1)."%"',
                            explanation: 'Calculate what percentage of events have user field'
                        }
                    ],
                    performance: 'Extremely fast - simple null check.',
                    internals: 'Equivalent to NOT isnull(field). Checks for presence of any value.',
                    vsAlternatives: {
                        'isnull': 'Opposite - returns true if field is missing',
                        'coalesce': 'For selecting first non-null from multiple fields'
                    }
                }
            },
            relatedCommands: ['isnull', 'coalesce', 'if']
        },
        {
            id: 'isnum',
            name: 'isnum()',
            category: 'functions',
            subcategory: 'informational',
            purpose: 'type',
            takeaway: 'Check if a value is numeric',
            what: 'Returns true if the value is a number (integer or float). Returns false for strings, nulls, or non-numeric values.',
            why: 'Validate data types before numeric operations, handle mixed-type fields gracefully, identify data quality issues.',
            syntax: 'isnum(field)',
            examples: [
                { spl: '| where isnum(bytes)', explanation: 'Filter for events where bytes is a valid number' },
                { spl: '| eval safe_bytes=if(isnum(bytes), bytes, 0)', explanation: 'Use 0 for non-numeric bytes' },
                { spl: '| stats count(eval(isnum(response_time))) as valid, count(eval(NOT isnum(response_time))) as invalid', explanation: 'Count valid vs invalid numeric values' }
            ],
            gotchas: [
                'String "123" may or may not be considered numeric depending on context',
                'Null values return false',
                'Useful before mathematical operations to avoid errors'
            ],
            relatedCommands: ['isstr', 'isnull', 'tonumber', 'typeof']
        },
        {
            id: 'isstr',
            name: 'isstr()',
            category: 'functions',
            subcategory: 'informational',
            purpose: 'type',
            takeaway: 'Check if a value is a string',
            what: 'Returns true if the value is a string type. Returns false for numbers, nulls, or other types.',
            why: 'Validate data types, handle mixed-type fields, ensure string operations are safe.',
            syntax: 'isstr(field)',
            examples: [
                { spl: '| where isstr(user)', explanation: 'Filter for events where user is a string' },
                { spl: '| eval display=if(isstr(value), value, tostring(value))', explanation: 'Ensure value is string for display' },
                { spl: '| eval type=case(isnum(field), "number", isstr(field), "string", isnull(field), "null", 1=1, "other")', explanation: 'Classify field type' }
            ],
            gotchas: [
                'Empty string "" returns true (it is a string)',
                'Null values return false',
                'Numbers stored as strings may return true'
            ],
            relatedCommands: ['isnum', 'isnull', 'tostring', 'typeof']
        },
        {
            id: 'nullif',
            name: 'nullif()',
            category: 'functions',
            subcategory: 'conditional',
            purpose: 'missing',
            takeaway: 'Replace specific value with null',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns null if the two arguments are equal, otherwise returns the first argument. Useful for treating specific values as "missing."',
                    why: 'Convert placeholder values (like "-", "N/A", "unknown") to null so they can be handled consistently with other missing data.',
                    syntax: 'nullif(field, value_to_nullify)',
                    example: {
                        spl: '| eval user=nullif(user, "-")',
                        explanation: 'Treat "-" as null in the user field'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval user=nullif(user, "N/A")', explanation: 'Treat "N/A" as null' },
                        { spl: '| eval bytes=nullif(bytes, 0)', explanation: 'Treat zero bytes as null (missing data)' },
                        { spl: '| eval clean_ip=coalesce(nullif(src_ip, "-"), nullif(client_ip, "-"), "unknown")', explanation: 'Chain: remove placeholders, then pick first real value' }
                    ],
                    gotchas: [
                        'Only nullifies exact matches - case-sensitive for strings',
                        'Returns null if equal, returns first argument if not equal',
                        'Often used with coalesce() to clean up then provide defaults'
                    ],
                    commonUses: [
                        'Clean up placeholder values like "-", "N/A", "none"',
                        'Treat zero as missing for calculations',
                        'Normalize data before aggregation',
                        'Prepare fields for coalesce() chains'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Multiple Placeholder Cleanup',
                            spl: '| eval user=nullif(nullif(nullif(user, "-"), "N/A"), "unknown")',
                            explanation: 'Remove multiple placeholder values (nested)'
                        },
                        {
                            name: 'Combined Cleanup and Default',
                            spl: '| eval user=coalesce(nullif(user, "-"), nullif(src_user, "-"), "anonymous")',
                            explanation: 'Clean both fields, pick first real value, default to anonymous'
                        }
                    ],
                    performance: 'Very fast - simple equality check.',
                    internals: 'Equivalent to: if(field=value, null(), field)',
                    vsAlternatives: {
                        'if with null': 'if(field="-", null(), field) does the same thing',
                        'coalesce': 'For selecting non-null values after nullif cleanup',
                        'fillnull': 'Opposite direction - replaces null with a value'
                    }
                }
            },
            relatedCommands: ['coalesce', 'isnull', 'fillnull', 'if']
        },

        // ============================================
        // Text Functions
        // ============================================
        {
            id: 'lower',
            name: 'lower()',
            category: 'functions',
            subcategory: 'text',
            purpose: 'text',
            takeaway: 'Convert text to lowercase',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts all characters in a string to lowercase.',
                    why: 'Essential for case-insensitive comparisons and normalizing data from different sources that may use inconsistent casing.',
                    syntax: 'lower(string)',
                    example: {
                        spl: '| eval username=lower(username)',
                        explanation: 'Normalize username to lowercase'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| where lower(action)="blocked"', explanation: 'Case-insensitive match for "blocked"' },
                        { spl: '| stats count by lower(user)', explanation: 'Aggregate treating USER, User, user as same' },
                        { spl: '| eval domain=lower(domain) | dedup domain', explanation: 'Normalize before deduplication' }
                    ],
                    gotchas: [
                        'Returns null if field is null',
                        'Only affects alphabetic characters - numbers and symbols unchanged',
                        'Consider normalizing at search time vs. in stats for performance'
                    ],
                    commonUses: [
                        'Case-insensitive comparisons',
                        'Normalizing usernames, hostnames, domains',
                        'Deduplication across inconsistent sources',
                        'Consistent aggregation grouping'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Normalize in Search',
                            spl: 'index=web | eval uri=lower(uri_path) | stats count by uri',
                            explanation: 'Aggregate URIs case-insensitively'
                        }
                    ],
                    performance: 'Very fast. When used in stats grouping, normalizes each value once.',
                    internals: 'Simple character-by-character transformation. Unicode-aware.',
                    vsAlternatives: {
                        'upper': 'Convert to uppercase instead',
                        'match with (?i)': 'Case-insensitive regex: match(field, "(?i)pattern")'
                    }
                }
            },
            relatedCommands: ['upper', 'trim', 'replace']
        },
        {
            id: 'upper',
            name: 'upper()',
            category: 'functions',
            subcategory: 'text',
            purpose: 'text',
            takeaway: 'Convert text to uppercase',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts all characters in a string to uppercase.',
                    why: 'Normalize text for comparison or display. Less common than lower() but useful for certain conventions.',
                    syntax: 'upper(string)',
                    example: {
                        spl: '| eval hostname=upper(hostname)',
                        explanation: 'Convert hostname to uppercase'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval status_code=upper(status)', explanation: 'Normalize status to uppercase' },
                        { spl: '| where upper(country)="US"', explanation: 'Case-insensitive country check' }
                    ],
                    gotchas: [
                        'Returns null if field is null',
                        'Most organizations standardize on lower() - be consistent'
                    ],
                    commonUses: [
                        'Match conventions requiring uppercase (some protocols, codes)',
                        'Display formatting',
                        'Case-insensitive comparison (though lower() is more common)'
                    ]
                },
                deep: {
                    performance: 'Very fast - same as lower().',
                    vsAlternatives: {
                        'lower': 'More commonly used for normalization'
                    }
                }
            },
            relatedCommands: ['lower', 'trim', 'replace']
        },
        {
            id: 'substr',
            name: 'substr()',
            category: 'functions',
            subcategory: 'text',
            purpose: 'text',
            takeaway: 'Extract part of a string',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns a substring from a string, starting at a specified position for a specified length.',
                    why: 'Extract fixed-position data from strings - parse codes, get prefixes, or split at known positions.',
                    syntax: 'substr(string, start, [length])',
                    example: {
                        spl: '| eval country_code=substr(phone, 1, 3)',
                        explanation: 'Get first 3 characters (country code) from phone number'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval prefix=substr(order_id, 1, 2)', explanation: 'Get 2-character prefix from order ID' },
                        { spl: '| eval domain_ext=substr(domain, -4)', explanation: 'Get last 4 chars (like .com) - negative start counts from end' },
                        { spl: '| eval year=substr(_time, 1, 4)', explanation: 'Extract year from timestamp string' },
                        { spl: '| eval middle=substr(code, 3, 5)', explanation: 'Get 5 characters starting at position 3' }
                    ],
                    gotchas: [
                        'Position starts at 1, not 0 (unlike many programming languages)',
                        'Negative start counts from the end (-1 is last character)',
                        'If length omitted, returns everything from start to end',
                        'Returns null if field is null'
                    ],
                    commonUses: [
                        'Extract fixed-position codes or identifiers',
                        'Get file extensions or domain suffixes',
                        'Parse structured strings with known format',
                        'Truncate strings for display'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Extract by Position',
                            spl: '| eval region=substr(location_code, 1, 2), office=substr(location_code, 3, 3)',
                            explanation: 'Split structured code into components'
                        },
                        {
                            name: 'Get Suffix',
                            spl: '| eval ext=substr(filename, -3)',
                            explanation: 'Get 3-character file extension'
                        }
                    ],
                    performance: 'Very fast - simple string operation.',
                    internals: 'Returns portion of string. Out-of-range positions return empty string or partial result, not error.',
                    vsAlternatives: {
                        'rex': 'For pattern-based extraction (not fixed position)',
                        'split': 'For delimiter-based splitting',
                        'replace': 'For removing/replacing parts of strings'
                    }
                }
            },
            relatedCommands: ['len', 'replace', 'rex', 'split']
        },
        {
            id: 'replace',
            name: 'replace()',
            category: 'functions',
            subcategory: 'text',
            purpose: 'text',
            takeaway: 'Find and replace text using regex',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Replaces all occurrences of a regex pattern with a replacement string.',
                    why: 'Clean up data, normalize formats, remove unwanted characters, or transform strings.',
                    syntax: 'replace(string, regex_pattern, replacement)',
                    example: {
                        spl: '| eval clean_phone=replace(phone, "-", "")',
                        explanation: 'Remove all dashes from phone numbers'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval domain=replace(url, "^https?://([^/]+).*", "\\1")', explanation: 'Extract domain from URL using capture group' },
                        { spl: '| eval masked=replace(ssn, "\\d{3}-\\d{2}", "XXX-XX")', explanation: 'Mask first 5 digits of SSN' },
                        { spl: '| eval clean=replace(field, "[^a-zA-Z0-9]", "")', explanation: 'Remove all non-alphanumeric characters' },
                        { spl: '| eval normalized=replace(host, "\\.domain\\.com$", "")', explanation: 'Strip domain suffix from hostnames' }
                    ],
                    gotchas: [
                        'Pattern is a regex, not literal string (escape special chars)',
                        'Use \\1, \\2 for capture group backreferences',
                        'Replaces ALL matches, not just first',
                        'Returns original if no match found'
                    ],
                    commonUses: [
                        'Remove unwanted characters (dashes, spaces)',
                        'Mask sensitive data (partial redaction)',
                        'Normalize formats (phones, IDs)',
                        'Extract using capture groups'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Capture Group Extraction',
                            spl: '| eval user=replace(email, "(.+)@.+", "\\1")',
                            explanation: 'Get username part of email'
                        },
                        {
                            name: 'Multiple Replacements',
                            spl: '| eval clean=replace(replace(field, "\\s+", " "), "^\\s+|\\s+$", "")',
                            explanation: 'Normalize whitespace: collapse multiple spaces, trim ends'
                        }
                    ],
                    performance: 'Moderate - depends on regex complexity. Simple patterns are fast.',
                    internals: 'Uses PCRE regex engine. Replacement happens in single pass for all matches.',
                    vsAlternatives: {
                        'rex mode=sed': 'For complex multi-step replacements',
                        'substr': 'For fixed-position extraction (faster when applicable)'
                    }
                }
            },
            relatedCommands: ['rex', 'substr', 'trim', 'match']
        },
        {
            id: 'len',
            name: 'len()',
            category: 'functions',
            subcategory: 'text',
            purpose: 'text',
            takeaway: 'Get the length of a string',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns the number of characters in a string.',
                    why: 'Validate string lengths, find unusually long or short values, or check for empty strings.',
                    syntax: 'len(string)',
                    example: {
                        spl: '| eval name_length=len(username)',
                        explanation: 'Get character count of username'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| where len(password) < 8', explanation: 'Find weak passwords (too short)' },
                        { spl: '| where len(query) > 1000', explanation: 'Find suspiciously long queries (possible injection)' },
                        { spl: '| eval is_empty=if(len(field)=0, "yes", "no")', explanation: 'Check for empty string (not null)' },
                        { spl: '| stats avg(len(message)) as avg_msg_length', explanation: 'Average message length' }
                    ],
                    gotchas: [
                        'Returns null if field is null (not 0)',
                        'Empty string returns 0',
                        'Counts characters, not bytes (matters for Unicode)'
                    ],
                    commonUses: [
                        'Validate input lengths',
                        'Find anomalously long/short values',
                        'Distinguish null from empty string',
                        'Data quality checks'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Length-Based Anomaly',
                            spl: '| stats avg(len(user_agent)) as avg_len, stdev(len(user_agent)) as std_len | ... | where len(user_agent) > avg_len + 3*std_len',
                            explanation: 'Find unusually long user agents'
                        }
                    ],
                    performance: 'Very fast - O(1) for most implementations.',
                    vsAlternatives: {
                        'mvcount': 'For counting values in multivalue fields, not string length'
                    }
                }
            },
            relatedCommands: ['substr', 'isnull', 'mvcount']
        },
        {
            id: 'trim',
            name: 'trim()',
            category: 'functions',
            subcategory: 'text',
            purpose: 'text',
            takeaway: 'Remove leading and trailing whitespace',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Removes whitespace (spaces, tabs) from both ends of a string. Also ltrim() and rtrim() for left/right only.',
                    why: 'Clean up data with extra spaces that cause matching failures or inconsistent grouping.',
                    syntax: 'trim(string) | ltrim(string) | rtrim(string)',
                    example: {
                        spl: '| eval clean_user=trim(user)',
                        explanation: 'Remove leading/trailing spaces from username'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval user=trim(user) | stats count by user', explanation: 'Clean before aggregating' },
                        { spl: '| where trim(status)!=""', explanation: 'Filter out whitespace-only values' },
                        { spl: '| eval log_msg=ltrim(message, "0")', explanation: 'Remove leading zeros (second arg specifies chars to trim)' }
                    ],
                    gotchas: [
                        'Only removes whitespace by default',
                        'Optional second argument specifies characters to trim: trim(str, "chars")',
                        'Does not affect spaces in the middle of strings'
                    ],
                    commonUses: [
                        'Clean up user input or imported data',
                        'Normalize fields before comparison',
                        'Fix data with inconsistent spacing',
                        'Remove padding characters'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Trim Specific Characters',
                            spl: `| eval clean=trim(field, "\\"' ")`,
                            explanation: 'Remove quotes and spaces from both ends'
                        }
                    ],
                    performance: 'Very fast.',
                    vsAlternatives: {
                        'replace': 'For removing characters from anywhere in string, not just ends'
                    }
                }
            },
            relatedCommands: ['lower', 'upper', 'replace', 'len']
        },

        // ============================================
        // Time Functions
        // ============================================
        {
            id: 'strptime',
            name: 'strptime()',
            category: 'functions',
            subcategory: 'datetime',
            purpose: 'time',
            takeaway: 'Parse string into epoch timestamp',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts a human-readable timestamp string into epoch time (seconds since 1970). Opposite of strftime().',
                    why: 'Convert timestamps from external sources or string fields into proper epoch time for calculations and comparisons.',
                    syntax: 'strptime(timestring, format)',
                    example: {
                        spl: '| eval epoch=strptime(date_field, "%Y-%m-%d %H:%M:%S")',
                        explanation: 'Parse "2024-01-15 14:30:00" into epoch time'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval parsed_time=strptime(timestamp, "%d/%b/%Y:%H:%M:%S")', explanation: 'Parse Apache log format (15/Jan/2024:14:30:00)' },
                        { spl: '| eval event_epoch=strptime(event_date, "%m/%d/%Y")', explanation: 'Parse US date format (01/15/2024)' },
                        { spl: '| eval duration=now()-strptime(start_time, "%Y-%m-%d %H:%M:%S")', explanation: 'Calculate seconds since start_time' }
                    ],
                    gotchas: [
                        'Format string must match input exactly',
                        'Returns null if parse fails - check your format codes',
                        'Common format codes: %Y (4-digit year), %m (month), %d (day), %H (hour), %M (minute), %S (second)',
                        '%b for abbreviated month name (Jan, Feb), %B for full name'
                    ],
                    commonUses: [
                        'Parse timestamps from external data sources',
                        'Convert string dates for time calculations',
                        'Normalize different timestamp formats',
                        'Calculate time differences between events'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Time Math After Parse',
                            spl: '| eval start=strptime(start_date, "%Y-%m-%d"), end=strptime(end_date, "%Y-%m-%d") | eval days_diff=(end-start)/86400',
                            explanation: 'Calculate days between two date strings'
                        },
                        {
                            name: 'ISO 8601 Format',
                            spl: '| eval epoch=strptime(iso_time, "%Y-%m-%dT%H:%M:%S")',
                            explanation: 'Parse ISO format timestamp'
                        }
                    ],
                    performance: 'Moderate - string parsing. Cache results if reusing.',
                    internals: 'Uses system strptime(). Timezone handling depends on Splunk server settings if not specified in string.',
                    vsAlternatives: {
                        'strftime': 'Opposite direction - epoch to string',
                        '_time': 'Already parsed event timestamp'
                    }
                }
            },
            relatedCommands: ['strftime', 'now', 'relative_time', '_time']
        },
        {
            id: 'relative_time',
            name: 'relative_time()',
            category: 'functions',
            subcategory: 'datetime',
            purpose: 'time',
            takeaway: 'Calculate time relative to a base time',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns an epoch timestamp based on a relative time modifier applied to a base time. Like asking "what time was it 24 hours ago?"',
                    why: 'Calculate time boundaries for comparisons - find events older than X days, or get start/end of time periods.',
                    syntax: 'relative_time(time, relative_specifier)',
                    example: {
                        spl: '| eval yesterday=relative_time(now(), "-1d@d")',
                        explanation: 'Get epoch time for start of yesterday'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| where _time > relative_time(now(), "-24h")', explanation: 'Events from last 24 hours' },
                        { spl: '| eval week_start=relative_time(now(), "-7d@d")', explanation: '7 days ago, snapped to start of day' },
                        { spl: '| eval age_days=(now()-_time)/86400 | where age_days > 30', explanation: 'Events older than 30 days' },
                        { spl: '| eval month_start=relative_time(now(), "@mon")', explanation: 'Start of current month' }
                    ],
                    gotchas: [
                        'Format: -/+ followed by number and unit (s, m, h, d, w, mon, y)',
                        '@ snaps to boundary: @d = start of day, @h = start of hour',
                        'Combine offset and snap: "-1d@d" = start of yesterday',
                        'Returns epoch time, use strftime() to display as string'
                    ],
                    commonUses: [
                        'Filter events by age',
                        'Calculate time boundaries for reports',
                        'Compare event time to thresholds',
                        'Get consistent time periods (start of day/week/month)'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Business Hours Check',
                            spl: '| eval hour=tonumber(strftime(_time, "%H")) | where hour >= 9 AND hour < 17',
                            explanation: 'Filter for business hours (9 AM to 5 PM)'
                        },
                        {
                            name: 'Rolling 7-Day Window',
                            spl: '| where _time >= relative_time(now(), "-7d@d") AND _time < relative_time(now(), "@d")',
                            explanation: 'Last 7 complete days (not including today)'
                        }
                    ],
                    performance: 'Fast - simple arithmetic on epoch time.',
                    internals: 'Splunk relative time syntax is powerful - supports complex modifiers like "-1d@w1" (last Monday).',
                    vsAlternatives: {
                        'earliest/latest': 'In search: earliest=-24h is simpler for basic filtering',
                        'now() with math': 'now()-86400 for 24 hours ago (but no snapping)'
                    }
                }
            },
            relatedCommands: ['now', 'strftime', 'strptime', '_time']
        },

        // ============================================
        // Number Functions
        // ============================================
        {
            id: 'round',
            name: 'round()',
            category: 'functions',
            subcategory: 'math',
            purpose: 'numbers',
            takeaway: 'Round number to specified decimal places',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Rounds a number to the specified number of decimal places. Defaults to 0 (whole number).',
                    why: 'Clean up calculated values for display, reduce precision for grouping, or prepare numbers for reporting.',
                    syntax: 'round(number, [decimal_places])',
                    example: {
                        spl: '| eval pct=round(count/total*100, 2)',
                        explanation: 'Calculate percentage rounded to 2 decimal places'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval avg_time=round(avg_response_ms, 0)', explanation: 'Round to whole milliseconds' },
                        { spl: '| eval mb=round(bytes/1024/1024, 2)', explanation: 'Convert bytes to MB with 2 decimals' },
                        { spl: '| stats avg(duration) as avg_dur | eval avg_dur=round(avg_dur, 1)', explanation: 'Round stats output for display' }
                    ],
                    gotchas: [
                        'Uses standard rounding (0.5 rounds up)',
                        'Second argument optional - defaults to 0 (integer)',
                        'Returns null if input is null'
                    ],
                    commonUses: [
                        'Format percentages and ratios',
                        'Clean up division results',
                        'Prepare values for display in dashboards',
                        'Reduce precision for grouping similar values'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Round to Significant Figures',
                            spl: '| eval rounded=round(value, -2)',
                            explanation: 'Negative decimals: -2 rounds to nearest 100'
                        }
                    ],
                    performance: 'Very fast - simple arithmetic.',
                    vsAlternatives: {
                        'floor': 'Always rounds down',
                        'ceil': 'Always rounds up',
                        'tonumber with format': 'For more control over display format'
                    }
                }
            },
            relatedCommands: ['floor', 'ceil', 'abs', 'tonumber']
        },
        {
            id: 'floor',
            name: 'floor()',
            category: 'functions',
            subcategory: 'math',
            purpose: 'numbers',
            takeaway: 'Round down to nearest integer',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Rounds a number DOWN to the nearest integer. Always goes toward negative infinity.',
                    why: 'Get whole number counts, calculate complete units, or ensure you never overestimate.',
                    syntax: 'floor(number)',
                    example: {
                        spl: '| eval complete_hours=floor(duration_seconds/3600)',
                        explanation: 'Calculate complete hours (ignore partial)'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval gb=floor(bytes/1073741824)', explanation: 'Complete gigabytes' },
                        { spl: '| eval age_days=floor((now()-_time)/86400)', explanation: 'Complete days since event' },
                        { spl: '| eval bucket=floor(value/10)*10', explanation: 'Bucket values into groups of 10' }
                    ],
                    gotchas: [
                        'floor(-2.5) = -3 (goes toward negative infinity)',
                        'floor(2.9) = 2',
                        'Different from integer truncation for negative numbers'
                    ],
                    commonUses: [
                        'Calculate complete time units',
                        'Create numeric buckets/bins',
                        'Conservative estimates (never round up)',
                        'Array-like index calculations'
                    ]
                },
                deep: {
                    performance: 'Very fast - single operation.',
                    vsAlternatives: {
                        'ceiling/ceil': 'Round UP instead',
                        'round': 'Standard rounding (up or down based on .5)'
                    }
                }
            },
            relatedCommands: ['ceil', 'round', 'abs']
        },
        {
            id: 'ceil',
            name: 'ceil()',
            category: 'functions',
            subcategory: 'math',
            purpose: 'numbers',
            takeaway: 'Round up to nearest integer',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Rounds a number UP to the nearest integer. Also available as ceiling().',
                    why: 'Ensure you never underestimate - useful for capacity planning, resource allocation, or conservative sizing.',
                    syntax: 'ceil(number) or ceiling(number)',
                    example: {
                        spl: '| eval pages_needed=ceil(total_records/100)',
                        explanation: 'Pages needed if 100 records per page (rounds up for partial page)'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval min_servers=ceil(users/1000)', explanation: 'Minimum servers needed (1000 users each)' },
                        { spl: '| eval delivery_days=ceil(distance/100)', explanation: 'Delivery days (100 miles per day, round up)' }
                    ],
                    gotchas: [
                        'ceil(2.1) = 3',
                        'ceil(-2.5) = -2 (goes toward positive infinity)',
                        'ceil() and ceiling() are identical'
                    ],
                    commonUses: [
                        'Capacity planning (always round up)',
                        'Calculate minimum resources needed',
                        'Page counts for pagination',
                        'Conservative time estimates'
                    ]
                },
                deep: {
                    performance: 'Very fast - single operation.',
                    vsAlternatives: {
                        'floor': 'Round DOWN instead',
                        'round': 'Standard rounding'
                    }
                }
            },
            relatedCommands: ['floor', 'round', 'abs']
        },
        {
            id: 'abs',
            name: 'abs()',
            category: 'functions',
            subcategory: 'math',
            purpose: 'numbers',
            takeaway: 'Get absolute value (remove negative sign)',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns the absolute (positive) value of a number. Removes the negative sign if present.',
                    why: 'Calculate magnitude regardless of direction - useful for differences, deviations, and distances.',
                    syntax: 'abs(number)',
                    example: {
                        spl: '| eval deviation=abs(actual-expected)',
                        explanation: 'Calculate deviation regardless of direction'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval diff=abs(current-baseline)', explanation: 'Difference from baseline (always positive)' },
                        { spl: '| where abs(value-avg_value) > 3*stdev_value', explanation: 'Find outliers beyond 3 standard deviations' },
                        { spl: '| eval time_diff=abs(_time-other_time)', explanation: 'Time difference regardless of order' }
                    ],
                    gotchas: [
                        'abs(-5) = 5, abs(5) = 5',
                        'Returns null if input is null'
                    ],
                    commonUses: [
                        'Calculate deviations from expected values',
                        'Find outliers regardless of direction',
                        'Time differences between events',
                        'Magnitude of changes'
                    ]
                },
                deep: {
                    performance: 'Very fast.',
                    vsAlternatives: {
                        'Manual: if(x<0, -x, x)': 'abs() is cleaner and more readable'
                    }
                }
            },
            relatedCommands: ['round', 'floor', 'ceil']
        },
        {
            id: 'tonumber',
            name: 'tonumber()',
            category: 'functions',
            subcategory: 'conversion',
            purpose: 'numbers',
            takeaway: 'Convert string to number',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts a string representation of a number into an actual numeric value.',
                    why: 'Required when numeric fields are stored as strings - enables math operations, comparisons, and proper sorting.',
                    syntax: 'tonumber(string, [base])',
                    example: {
                        spl: '| eval bytes_num=tonumber(bytes)',
                        explanation: 'Convert bytes from string to number for math'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval port=tonumber(dest_port) | where port < 1024', explanation: 'Convert port for numeric comparison' },
                        { spl: '| eval hex_value=tonumber(hex_string, 16)', explanation: 'Convert hexadecimal string to number' },
                        { spl: '| eval total=tonumber(price)*tonumber(quantity)', explanation: 'Convert before multiplication' }
                    ],
                    gotchas: [
                        'Returns null if string cannot be converted (non-numeric characters)',
                        'Optional second argument for base (2, 8, 16, etc.)',
                        'Leading/trailing spaces may cause conversion to fail'
                    ],
                    commonUses: [
                        'Enable math on string fields',
                        'Fix sorting (string sort: "9" > "10")',
                        'Convert hex values to decimal',
                        'Prepare for numeric comparisons'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Safe Conversion',
                            spl: '| eval num=if(match(field, "^\\d+$"), tonumber(field), 0)',
                            explanation: 'Only convert if field is purely numeric'
                        },
                        {
                            name: 'Hex Conversion',
                            spl: '| eval decimal=tonumber("FF", 16)',
                            explanation: 'Convert hex FF to decimal 255'
                        }
                    ],
                    performance: 'Fast - simple parsing.',
                    vsAlternatives: {
                        'tostring': 'Opposite - convert number to string',
                        'Implicit conversion': 'Sometimes happens automatically in math expressions'
                    }
                }
            },
            relatedCommands: ['tostring', 'round', 'floor']
        },
        {
            id: 'tostring',
            name: 'tostring()',
            category: 'functions',
            subcategory: 'conversion',
            purpose: 'numbers',
            takeaway: 'Convert value to string with optional formatting',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Converts a value to a string. Optional second argument specifies format for numbers or times.',
                    why: 'Format numbers for display, convert epoch times to readable strings, or prepare values for string operations.',
                    syntax: 'tostring(value, [format])',
                    example: {
                        spl: '| eval display_size=tostring(bytes, "commas")',
                        explanation: 'Format bytes with commas: 1234567 → "1,234,567"'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval formatted=tostring(count, "commas")', explanation: 'Add thousand separators' },
                        { spl: '| eval duration_str=tostring(duration, "duration")', explanation: 'Convert seconds to "1d 2h 3m" format' },
                        { spl: '| eval hex=tostring(number, "hex")', explanation: 'Convert to hexadecimal string' },
                        { spl: '| eval combined=tostring(user)." - ".tostring(action)', explanation: 'Concatenate with explicit conversion' }
                    ],
                    gotchas: [
                        'Format options: "commas", "duration", "hex"',
                        '"duration" format works on seconds',
                        'Without format, simple string conversion'
                    ],
                    commonUses: [
                        'Format large numbers with commas for readability',
                        'Convert epoch seconds to human-readable duration',
                        'Prepare for string concatenation',
                        'Convert for display in dashboards'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Duration Formatting',
                            spl: '| eval uptime_str=tostring(uptime_seconds, "duration")',
                            explanation: '86523 → "1d 0h 2m 3s"'
                        }
                    ],
                    performance: 'Very fast.',
                    vsAlternatives: {
                        'strftime': 'For formatting epoch as specific date/time format',
                        'tonumber': 'Opposite - string to number'
                    }
                }
            },
            relatedCommands: ['tonumber', 'strftime', 'round']
        },

        // ============================================
        // Multivalue Functions
        // ============================================
        {
            id: 'mvindex',
            name: 'mvindex()',
            category: 'functions',
            subcategory: 'multivalue',
            purpose: 'multivalue',
            takeaway: 'Get specific value(s) from a multivalue field',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns a specific value or range of values from a multivalue field by index position.',
                    why: 'Extract the first, last, or specific item from a list - useful for getting the most relevant value.',
                    syntax: 'mvindex(mvfield, startindex, [endindex])',
                    example: {
                        spl: '| eval first_ip=mvindex(ip_list, 0)',
                        explanation: 'Get the first IP from a list of IPs'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval first=mvindex(values, 0)', explanation: 'Get first value (index 0)' },
                        { spl: '| eval last=mvindex(values, -1)', explanation: 'Get last value (negative index)' },
                        { spl: '| eval top3=mvindex(sorted_list, 0, 2)', explanation: 'Get first 3 values (indices 0, 1, 2)' },
                        { spl: '| eval second_part=mvindex(split(path, "/"), 1)', explanation: 'Get second segment of path' }
                    ],
                    gotchas: [
                        'Indices start at 0, not 1',
                        'Negative indices count from end (-1 is last)',
                        'Returns null if index out of range',
                        'Second index is inclusive (0, 2 returns 3 values)'
                    ],
                    commonUses: [
                        'Get first or last value from a list',
                        'Extract specific part after split()',
                        'Get top N from a sorted multivalue',
                        'Parse structured data like paths or domains'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Parse Domain Parts',
                            spl: '| eval parts=split(fqdn, ".") | eval tld=mvindex(parts, -1), domain=mvindex(parts, -2)',
                            explanation: 'Get TLD and domain from "www.example.com"'
                        },
                        {
                            name: 'Get All But First',
                            spl: '| eval rest=mvindex(list, 1, -1)',
                            explanation: 'Everything except the first element'
                        }
                    ],
                    performance: 'Fast - direct index lookup.',
                    vsAlternatives: {
                        'mvfilter': 'For conditional selection, not positional',
                        'mvjoin + split': 'Alternative for complex extractions'
                    }
                }
            },
            relatedCommands: ['mvcount', 'mvfilter', 'split', 'mvjoin']
        },
        {
            id: 'mvjoin',
            name: 'mvjoin()',
            category: 'functions',
            subcategory: 'multivalue',
            purpose: 'multivalue',
            takeaway: 'Join multivalue field into single string',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Combines all values in a multivalue field into a single string, separated by a delimiter.',
                    why: 'Convert lists to readable strings for display, export, or comparison.',
                    syntax: 'mvjoin(mvfield, delimiter)',
                    example: {
                        spl: '| eval ip_string=mvjoin(ip_list, ", ")',
                        explanation: 'Convert IP list to comma-separated string'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval users_display=mvjoin(users, "; ")', explanation: 'Create semicolon-separated list' },
                        { spl: '| eval combined=mvjoin(tags, " | ")', explanation: 'Join tags with pipe separator' },
                        { spl: '| eval path=mvjoin(path_parts, "/")', explanation: 'Reconstruct path from parts' }
                    ],
                    gotchas: [
                        'Delimiter is required (use "" for no separator)',
                        'Opposite of split()',
                        'Returns single string value, not multivalue'
                    ],
                    commonUses: [
                        'Format lists for display or export',
                        'Reconstruct paths or URLs',
                        'Create searchable combined strings',
                        'Prepare for string comparisons'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Round-Trip',
                            spl: '| eval list=split(string, ",") | ... | eval string=mvjoin(list, ",")',
                            explanation: 'Split, process, rejoin'
                        }
                    ],
                    performance: 'Fast - simple string concatenation.',
                    vsAlternatives: {
                        'split': 'Opposite - string to multivalue',
                        'mvappend': 'For combining multiple multivalue fields'
                    }
                }
            },
            relatedCommands: ['split', 'mvindex', 'mvcount', 'mvappend']
        },
        {
            id: 'mvzip',
            name: 'mvzip()',
            category: 'functions',
            subcategory: 'multivalue',
            purpose: 'multivalue',
            takeaway: 'Combine multivalue fields element by element',
            what: 'Zips two or more multivalue fields together, combining corresponding elements with a delimiter.',
            why: 'Process parallel arrays together, combine related multivalue fields into pairs or tuples.',
            syntax: 'mvzip(mvfield1, mvfield2, [delimiter])',
            examples: [
                { spl: '| eval pairs=mvzip(keys, values, "=")', explanation: 'Create key=value pairs from parallel arrays' },
                { spl: '| eval combined=mvzip(names, scores, ": ")', explanation: 'Create "name: score" entries' },
                { spl: '| eval user_role=mvzip(users, roles)', explanation: 'Default delimiter is comma' }
            ],
            gotchas: [
                'Fields must have same number of values for clean pairing',
                'Default delimiter is comma if not specified',
                'Missing values result in empty elements',
                'Useful when fields were extracted in parallel from same source'
            ],
            relatedCommands: ['mvappend', 'mvjoin', 'mvexpand', 'split']
        },
        {
            id: 'mvappend',
            name: 'mvappend()',
            category: 'functions',
            subcategory: 'multivalue',
            purpose: 'multivalue',
            takeaway: 'Combine values into a multivalue field',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Creates a multivalue field by appending multiple values or multivalue fields together.',
                    why: 'Combine multiple fields into a single list for analysis, comparison, or iteration.',
                    syntax: 'mvappend(value1, value2, ...)',
                    example: {
                        spl: '| eval all_ips=mvappend(src_ip, dest_ip)',
                        explanation: 'Combine source and destination IPs into one list'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval all_users=mvappend(user, src_user, dest_user)', explanation: 'Combine all user fields' },
                        { spl: '| eval combined=mvappend(field1, field2) | mvexpand combined', explanation: 'Combine then expand for analysis' },
                        { spl: '| eval check_list=mvappend(src_ip, dest_ip) | where mvcount(check_list) > 1', explanation: 'Create list for comparison' }
                    ],
                    gotchas: [
                        'Null values are skipped (not added to list)',
                        'Can append individual values or entire multivalue fields',
                        'Duplicates are NOT removed - use mvdedup() if needed'
                    ],
                    commonUses: [
                        'Combine related fields for unified analysis',
                        'Create lists for iteration with mvexpand',
                        'Prepare for deduplication across fields',
                        'Build dynamic field lists'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Dedup After Append',
                            spl: '| eval all=mvappend(src, dest) | eval unique=mvdedup(all)',
                            explanation: 'Combine and remove duplicates'
                        },
                        {
                            name: 'Count Unique Across Fields',
                            spl: '| eval all_hosts=mvappend(src_host, dest_host) | eval unique_hosts=mvdedup(all_hosts) | eval host_count=mvcount(unique_hosts)',
                            explanation: 'Count unique hosts involved in event'
                        }
                    ],
                    performance: 'Fast - simple list concatenation.',
                    vsAlternatives: {
                        'mvjoin': 'Creates string, not multivalue',
                        'makemv': 'For creating multivalue from delimited string'
                    }
                }
            },
            relatedCommands: ['mvjoin', 'mvdedup', 'mvexpand', 'mvcount']
        },
        {
            id: 'mvfilter',
            name: 'mvfilter()',
            category: 'functions',
            subcategory: 'multivalue',
            purpose: 'multivalue',
            takeaway: 'Filter multivalue field by condition',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns only the values in a multivalue field that match a condition.',
                    why: 'Filter lists to relevant items - find specific IPs in a list, values above a threshold, or matching patterns.',
                    syntax: 'mvfilter(expression)',
                    example: {
                        spl: '| eval internal_ips=mvfilter(match(ips, "^10\\."))',
                        explanation: 'Keep only IPs starting with 10.'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| eval errors=mvfilter(match(messages, "error|fail"))', explanation: 'Keep only error messages' },
                        { spl: '| eval high_ports=mvfilter(tonumber(ports) > 1024)', explanation: 'Keep only ports > 1024' },
                        { spl: '| eval external=mvfilter(NOT cidrmatch("10.0.0.0/8", ips))', explanation: 'Keep only external IPs' }
                    ],
                    gotchas: [
                        'Expression operates on each value - use implicit field name',
                        'Inside mvfilter, refer to current value directly (not field name)',
                        'Returns null if no values match'
                    ],
                    commonUses: [
                        'Filter IP lists by subnet',
                        'Keep only values matching a pattern',
                        'Filter numeric lists by threshold',
                        'Extract specific items from mixed lists'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Filter by Length',
                            spl: '| eval long_values=mvfilter(len(values) > 10)',
                            explanation: 'Keep values longer than 10 characters'
                        },
                        {
                            name: 'Complex Filter',
                            spl: '| eval valid_emails=mvfilter(match(emails, "^[^@]+@company\\.com$"))',
                            explanation: 'Keep only company email addresses'
                        }
                    ],
                    performance: 'Moderate - evaluates expression for each value.',
                    internals: 'Iterates through multivalue, applies condition to each, returns matching values.',
                    vsAlternatives: {
                        'mvindex': 'For positional selection, not conditional',
                        'where with mvexpand': 'Alternative approach for complex filtering'
                    }
                }
            },
            relatedCommands: ['mvindex', 'mvcount', 'match', 'cidrmatch']
        },

        // ============================================
        // Validation Functions
        // ============================================
        {
            id: 'cidrmatch',
            name: 'cidrmatch()',
            category: 'functions',
            subcategory: 'conditional',
            purpose: 'validate',
            takeaway: 'Check if IP address is in a subnet',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns true if an IP address matches a CIDR subnet specification.',
                    why: 'Essential for security analysis - identify internal vs external IPs, check against known ranges, or classify by network zone.',
                    syntax: 'cidrmatch("cidr_notation", ip_field)',
                    example: {
                        spl: '| where cidrmatch("10.0.0.0/8", src_ip)',
                        explanation: 'Find events from internal 10.x.x.x network'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| where NOT cidrmatch("10.0.0.0/8", src_ip)', explanation: 'Find external source IPs' },
                        { spl: '| eval is_internal=if(cidrmatch("192.168.0.0/16", ip), "yes", "no")', explanation: 'Flag internal IPs' },
                        { spl: '| eval zone=case(cidrmatch("10.1.0.0/16", ip), "datacenter", cidrmatch("10.2.0.0/16", ip), "office", true(), "other")', explanation: 'Classify by network zone' }
                    ],
                    gotchas: [
                        'CIDR must be a string (quoted), not a field reference',
                        'First argument is the subnet, second is the IP to check',
                        'Only works with IPv4 (IPv6 requires different approach)'
                    ],
                    commonUses: [
                        'Identify internal vs external traffic',
                        'Classify IPs by network zone',
                        'Filter for specific subnet activity',
                        'Validate IP assignments'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Multiple Subnet Check',
                            spl: '| where cidrmatch("10.0.0.0/8", ip) OR cidrmatch("172.16.0.0/12", ip) OR cidrmatch("192.168.0.0/16", ip)',
                            explanation: 'Check against all RFC1918 private ranges'
                        },
                        {
                            name: 'Dynamic Subnet from Lookup',
                            spl: '| lookup subnets subnet OUTPUT zone | where cidrmatch(subnet, src_ip)',
                            explanation: 'Use lookup for dynamic subnet matching'
                        }
                    ],
                    performance: 'Moderate - bit manipulation for each IP. Filter other ways first when possible.',
                    internals: 'Performs bitwise AND of IP with subnet mask and compares to network address.',
                    vsAlternatives: {
                        'lookup': 'For complex subnet-to-zone mappings',
                        'iplocation': 'For geographic rather than network classification'
                    }
                }
            },
            relatedCommands: ['iplocation', 'if', 'case', 'lookup']
        },
        {
            id: 'match',
            name: 'match()',
            category: 'functions',
            subcategory: 'text',
            purpose: 'validate',
            takeaway: 'Test if string matches regex pattern',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns true if a string matches a regular expression pattern.',
                    why: 'Powerful pattern matching for validation, filtering, and classification - more flexible than literal string matching.',
                    syntax: 'match(string, regex_pattern)',
                    example: {
                        spl: '| where match(user_agent, "bot|crawler|spider")',
                        explanation: 'Find bot traffic by user agent pattern'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| where match(email, "^[^@]+@company\\.com$")', explanation: 'Validate company email format' },
                        { spl: '| eval is_ip=if(match(field, "^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}$"), "yes", "no")', explanation: 'Check if field looks like IP' },
                        { spl: '| where match(url, "(?i)\\.(exe|dll|bat|ps1)$")', explanation: 'Find executable downloads (case-insensitive)' },
                        { spl: '| where NOT match(host, "^(web|app|db)\\d+-")', explanation: 'Exclude standard server naming' }
                    ],
                    gotchas: [
                        'Pattern is regex, not wildcard (use .* not *)',
                        'Case-sensitive by default - use (?i) for case-insensitive',
                        'Partial match is true - use ^ and $ for full string match',
                        'Escape special chars: \\. for literal dot'
                    ],
                    commonUses: [
                        'Validate field formats (emails, IPs, codes)',
                        'Filter by pattern (bots, suspicious strings)',
                        'Classify by naming conventions',
                        'Find anomalous values'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Case-Insensitive',
                            spl: '| where match(action, "(?i)^(deny|block|drop)$")',
                            explanation: 'Match regardless of case'
                        },
                        {
                            name: 'Negative Lookahead',
                            spl: '| where match(log, "error(?!.*expected)")',
                            explanation: 'Error but NOT "expected error"'
                        }
                    ],
                    performance: 'Moderate - depends on regex complexity. Simple patterns are fast.',
                    internals: 'Uses PCRE regex engine. Supports lookahead, lookbehind, and other advanced features.',
                    vsAlternatives: {
                        'like': 'Simpler wildcard matching (% and _)',
                        'in': 'For matching against specific values, not patterns',
                        'searchmatch': 'For Splunk search syntax matching'
                    }
                }
            },
            relatedCommands: ['like', 'replace', 'rex', 'searchmatch']
        },
        {
            id: 'searchmatch',
            name: 'searchmatch()',
            category: 'functions',
            subcategory: 'text',
            purpose: 'validate',
            takeaway: 'Match using Splunk search syntax',
            what: 'Returns true if the event matches a Splunk search expression. Uses the same syntax as the search command.',
            why: 'Apply complex Splunk search logic within eval expressions. Useful when you need full search syntax capabilities in a calculation.',
            syntax: 'searchmatch(search_expression)',
            examples: [
                { spl: '| eval is_error=if(searchmatch("error OR fail*"), "yes", "no")', explanation: 'Check if event matches search terms' },
                { spl: '| where searchmatch("src_ip=10.* dest_ip!=10.*")', explanation: 'Internal source to external destination' },
                { spl: '| eval priority=case(searchmatch("critical OR emergency"), "high", searchmatch("error OR warn*"), "medium", 1=1, "low")', explanation: 'Classify by search match' }
            ],
            gotchas: [
                'Uses Splunk search syntax, not regex',
                'Matches against _raw and extracted fields',
                'Can be slower than specific field comparisons',
                'Wildcards use * not %'
            ],
            relatedCommands: ['match', 'like', 'search', 'where']
        },
        {
            id: 'like',
            name: 'like()',
            category: 'functions',
            subcategory: 'text',
            purpose: 'validate',
            takeaway: 'Simple wildcard pattern matching',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns true if a string matches a pattern using SQL-style wildcards (% and _).',
                    why: 'Simpler than regex for basic pattern matching - easier to read and write for common use cases.',
                    syntax: 'like(string, pattern)',
                    example: {
                        spl: '| where like(email, "%@company.com")',
                        explanation: 'Find company email addresses'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| where like(filename, "%.exe")', explanation: 'Find .exe files' },
                        { spl: '| where like(hostname, "web%")', explanation: 'Find hosts starting with "web"' },
                        { spl: '| where like(code, "ERR___")', explanation: 'Match 3-character error codes (_ = any single char)' },
                        { spl: '| eval is_admin=if(like(user, "admin%"), "yes", "no")', explanation: 'Flag admin accounts' }
                    ],
                    gotchas: [
                        '% matches any sequence of characters (including empty)',
                        '_ matches exactly one character',
                        'Case-sensitive (use lower() for case-insensitive)',
                        'To match literal % or _, escape them'
                    ],
                    commonUses: [
                        'Match file extensions',
                        'Filter by hostname prefix/suffix',
                        'Simple pattern validation',
                        'User/account name patterns'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Case-Insensitive',
                            spl: '| where like(lower(filename), "%.pdf")',
                            explanation: 'Match .pdf, .PDF, .Pdf, etc.'
                        }
                    ],
                    performance: 'Fast - simpler than regex.',
                    vsAlternatives: {
                        'match': 'For complex patterns requiring full regex',
                        'in': 'For matching against specific values'
                    }
                }
            },
            relatedCommands: ['match', 'lower', 'in']
        },
        {
            id: 'typeof',
            name: 'typeof()',
            category: 'functions',
            subcategory: 'informational',
            purpose: 'validate',
            takeaway: 'Get the data type of a value',
            cardStyle: 'tabbed',
            zones: {
                essential: {
                    what: 'Returns the data type of a value: "Number", "String", "Boolean", or "Null".',
                    why: 'Debug data type issues, validate field types, or handle mixed-type fields appropriately.',
                    syntax: 'typeof(value)',
                    example: {
                        spl: '| eval type=typeof(bytes)',
                        explanation: 'Check if bytes is numeric or string'
                    }
                },
                practical: {
                    examples: [
                        { spl: '| where typeof(port)="String"', explanation: 'Find events where port is stored as string' },
                        { spl: '| eval debug=field." is ".typeof(field)', explanation: 'Debug field types' },
                        { spl: '| where typeof(value)!="Null"', explanation: 'Alternative to isnotnull()' }
                    ],
                    gotchas: [
                        'Returns: "Number", "String", "Boolean", or "Null"',
                        'Multivalue fields return type of first value',
                        'Useful for debugging unexpected behavior'
                    ],
                    commonUses: [
                        'Debug type mismatches',
                        'Validate data quality',
                        'Handle mixed-type fields',
                        'Understand why comparisons fail'
                    ]
                },
                deep: {
                    advancedPatterns: [
                        {
                            name: 'Type-Safe Conversion',
                            spl: '| eval numeric=if(typeof(field)="String", tonumber(field), field)',
                            explanation: 'Convert only if needed'
                        }
                    ],
                    performance: 'Very fast - simple type check.',
                    vsAlternatives: {
                        'isnum': 'Specifically checks if numeric',
                        'isstr': 'Specifically checks if string'
                    }
                }
            },
            relatedCommands: ['tonumber', 'tostring', 'isnull']
        }
    ],

    statsFunctions: [
        {
            id: 'stats_avg',
            name: 'avg()',
            category: 'statsFunctions',
            takeaway: 'Calculate the mean average',
            what: 'Returns the arithmetic mean (average) of numeric values for a field.',
            why: 'Understand typical values, baseline metrics, identify anomalies that deviate from the average.',
            syntax: 'avg(field)',
            examples: [
                { spl: '| stats avg(response_time) as avg_response', explanation: 'Average response time' },
                { spl: '| stats avg(bytes) by host', explanation: 'Average bytes per host' },
                { spl: '| stats avg(duration) as avg_dur, max(duration) as max_dur by user', explanation: 'Compare average vs maximum duration' }
            ],
            gotchas: [
                'Sensitive to outliers - one huge value skews the average',
                'Consider using median() for skewed distributions',
                'Non-numeric and null values are ignored'
            ],
            relatedCommands: ['median', 'stdev', 'min', 'max']
        },
        {
            id: 'stats_count',
            name: 'count()',
            category: 'statsFunctions',
            takeaway: 'Count events or non-null field values',
            what: 'Returns the number of events, or if a field is specified, the number of events where that field has a value.',
            why: 'The most fundamental aggregation - essential for understanding data volume, frequency, and distribution.',
            syntax: 'count | count(field)',
            examples: [
                { spl: '| stats count', explanation: 'Total number of events' },
                { spl: '| stats count by user', explanation: 'Events per user' },
                { spl: '| stats count(dest_port) as ports_seen by src_ip', explanation: 'Count non-null port values per source IP' }
            ],
            gotchas: [
                'count (no field) counts ALL events, even those with null values',
                'count(field) only counts events where field is NOT null',
                'For distinct counting, use dc() instead'
            ],
            relatedCommands: ['dc', 'sum', 'values']
        },
        {
            id: 'stats_dc',
            name: 'dc()',
            category: 'statsFunctions',
            takeaway: 'Count unique/distinct values',
            what: 'Returns the count of distinct (unique) values for a field. Also known as "distinct count" or "cardinality".',
            why: 'Essential for finding unique users, IPs, hosts, or any entity. Answers "how many different X are there?"',
            syntax: 'dc(field)',
            examples: [
                { spl: '| stats dc(user) as unique_users', explanation: 'Count unique users' },
                { spl: '| stats dc(src_ip) as sources by dest_port', explanation: 'Unique source IPs per destination port' },
                { spl: '| stats count, dc(user) by host', explanation: 'Events and unique users per host' }
            ],
            gotchas: [
                'Memory-intensive for high-cardinality fields (millions of unique values)',
                'Null values are not counted',
                'Approximation may occur with very large datasets (use estdc for explicit estimation)'
            ],
            performance: 'More expensive than count(). For very high cardinality, consider estdc() which uses HyperLogLog estimation.',
            relatedCommands: ['count', 'values']
        },
        {
            id: 'stats_earliest',
            name: 'earliest()',
            category: 'statsFunctions',
            takeaway: 'Get value from the earliest event by time',
            what: 'Returns the value from the event with the earliest (oldest) _time timestamp.',
            why: 'Get the first chronological value. Essential for seeing initial state or first occurrence.',
            syntax: 'earliest(field)',
            examples: [
                { spl: '| stats earliest(status) as initial_status by user', explanation: 'First status for each user chronologically' },
                { spl: '| stats earliest(src_ip) as first_source, latest(src_ip) as last_source by user', explanation: 'First and last source IP' },
                { spl: '| stats earliest(_time) as first_seen by host', explanation: 'When each host first appeared' }
            ],
            gotchas: [
                'Based on _time, not processing order - more reliable than first()',
                'Slightly slower than first() due to time comparison',
                'Returns value from earliest event, not earliest value',
                'Use earliest_time() to get the actual timestamp'
            ],
            relatedCommands: ['latest', 'first', 'earliest_time() / latest_time()', 'min']
        },
        {
            id: 'stats_earliest_time',
            name: 'earliest_time() / latest_time()',
            category: 'statsFunctions',
            takeaway: 'Get the actual timestamp of earliest/latest event',
            what: 'Returns the _time value of the earliest or latest event in each group.',
            why: 'Get exact timestamps for first/last occurrence without needing to return _time as a value.',
            syntax: 'earliest_time(field) | latest_time(field)',
            examples: [
                { spl: '| stats earliest_time(_time) as first_seen, latest_time(_time) as last_seen by user', explanation: 'When each user was first and last seen' },
                { spl: '| stats earliest_time(status) as first_status_time, earliest(status) as first_status by host', explanation: 'Get both time and value' },
                { spl: '| eval first_seen=strftime(earliest_time(_time), "%Y-%m-%d %H:%M:%S")', explanation: 'Format the timestamp' }
            ],
            gotchas: [
                'Returns epoch time - use strftime() to format',
                'The field argument is used to check for non-null values',
                'earliest_time(_time) finds earliest event overall',
                'earliest_time(status) finds earliest event where status is non-null'
            ],
            relatedCommands: ['earliest', 'latest', 'min', 'max']
        },
        {
            id: 'stats_first',
            name: 'first()',
            category: 'statsFunctions',
            takeaway: 'Get the first value encountered',
            what: 'Returns the first value seen for a field based on processing order.',
            why: 'Get a representative value quickly. Useful when you need any value and don\'t care which.',
            syntax: 'first(field)',
            examples: [
                { spl: '| stats first(user) as sample_user by department', explanation: 'Get one user per department' },
                { spl: '| stats first(src_ip) as example_source by dest_port', explanation: 'One source IP per destination port' }
            ],
            gotchas: [
                'Order depends on search processing, NOT event time',
                'Use earliest() if you need the value from the earliest event by _time',
                'Non-deterministic if search order varies',
                'Faster than earliest() as it doesn\'t need to compare times'
            ],
            relatedCommands: ['last', 'earliest', 'latest']
        },
        {
            id: 'stats_last',
            name: 'last()',
            category: 'statsFunctions',
            takeaway: 'Get the last value encountered',
            what: 'Returns the last value seen for a field based on processing order.',
            why: 'Get the most recently processed value. Useful for getting final state.',
            syntax: 'last(field)',
            examples: [
                { spl: '| stats last(status) as final_status by transaction_id', explanation: 'Final status of each transaction' },
                { spl: '| stats last(action) as last_action by user', explanation: 'Last action per user (by processing order)' }
            ],
            gotchas: [
                'Order depends on search processing, NOT event time',
                'Use latest() if you need the value from the latest event by _time',
                'Non-deterministic if search order varies',
                'Faster than latest() as it doesn\'t need to compare times'
            ],
            relatedCommands: ['first', 'earliest', 'latest']
        },
        {
            id: 'stats_latest',
            name: 'latest()',
            category: 'statsFunctions',
            takeaway: 'Get value from the latest event by time',
            what: 'Returns the value from the event with the latest (newest) _time timestamp.',
            why: 'Get the most recent chronological value. Essential for seeing current state.',
            syntax: 'latest(field)',
            examples: [
                { spl: '| stats latest(status) as current_status by user', explanation: 'Current status for each user' },
                { spl: '| stats latest(severity) as latest_severity by alert_name', explanation: 'Most recent severity per alert' },
                { spl: '| stats latest(_time) as last_seen by host', explanation: 'When each host was last seen' }
            ],
            gotchas: [
                'Based on _time, not processing order - more reliable than last()',
                'Slightly slower than last() due to time comparison',
                'Returns value from latest event, not latest value',
                'Use latest_time() to get the actual timestamp'
            ],
            relatedCommands: ['earliest', 'last', 'earliest_time() / latest_time()', 'max']
        },
        {
            id: 'stats_list',
            name: 'list()',
            category: 'statsFunctions',
            takeaway: 'Collect all values including duplicates',
            what: 'Returns all values for a field as a multivalue result, preserving duplicates and order of occurrence.',
            why: 'See every value in sequence. Useful for transaction analysis or when duplicates matter.',
            syntax: 'list(field)',
            examples: [
                { spl: '| stats list(action) as action_sequence by session_id', explanation: 'All actions in order per session' },
                { spl: '| stats list(status_code) as responses by transaction_id', explanation: 'All status codes including repeated ones' },
                { spl: '| stats list(_time) as times, list(action) as actions by user', explanation: 'Parallel lists of times and actions' }
            ],
            gotchas: [
                'PRESERVES duplicates - same value can appear multiple times',
                'NOT sorted - preserves order of occurrence',
                'Can produce very large multivalue fields - use with caution',
                'Memory-intensive for large result sets'
            ],
            relatedCommands: ['values', 'first', 'last']
        },
        {
            id: 'stats_max',
            name: 'max()',
            category: 'statsFunctions',
            takeaway: 'Find the largest value',
            what: 'Returns the maximum value for a field. Works with numbers, strings (alphabetical), and times.',
            why: 'Find peak values, worst case, latest time, or upper bounds.',
            syntax: 'max(field)',
            examples: [
                { spl: '| stats max(_time) as last_seen by user', explanation: 'Most recent time each user appeared' },
                { spl: '| stats max(cpu_percent) as peak_cpu by host', explanation: 'Peak CPU usage per host' },
                { spl: '| stats max(bytes) as largest_transfer by src_ip', explanation: 'Largest single transfer per source' }
            ],
            gotchas: [
                'For strings, returns alphabetically last value',
                'For times, returns latest',
                'Null values are ignored'
            ],
            relatedCommands: ['min', 'latest', 'last', 'range']
        },
        {
            id: 'stats_median',
            name: 'median()',
            category: 'statsFunctions',
            takeaway: 'Find the middle value (50th percentile)',
            what: 'Returns the median (middle value) of numeric values. Half the values are above, half are below.',
            why: 'Better than avg() for skewed data. Not affected by extreme outliers.',
            syntax: 'median(field)',
            examples: [
                { spl: '| stats median(response_time) as typical_response', explanation: 'Typical response time (not skewed by outliers)' },
                { spl: '| stats median(bytes) as median_size, avg(bytes) as avg_size by host', explanation: 'Compare median vs average' },
                { spl: '| stats median(duration) as median_dur, perc95(duration) as p95_dur by user', explanation: 'Typical vs worst-case duration' }
            ],
            gotchas: [
                'More robust than avg() when outliers exist',
                'Equivalent to perc50() or p50()',
                'Requires sorting internally - more expensive than avg()'
            ],
            relatedCommands: ['avg', 'perc<N>() / p<N>()', 'mode']
        },
        {
            id: 'stats_min',
            name: 'min()',
            category: 'statsFunctions',
            takeaway: 'Find the smallest value',
            what: 'Returns the minimum value for a field. Works with numbers, strings (alphabetical), and times.',
            why: 'Find first occurrence, lowest value, earliest time, or baseline minimum.',
            syntax: 'min(field)',
            examples: [
                { spl: '| stats min(_time) as first_seen by user', explanation: 'First time each user appeared' },
                { spl: '| stats min(response_time) as fastest by endpoint', explanation: 'Fastest response per endpoint' },
                { spl: '| stats min(severity) by host', explanation: 'Lowest severity per host (alphabetical for strings)' }
            ],
            gotchas: [
                'For strings, returns alphabetically first value',
                'For times, returns earliest',
                'Null values are ignored'
            ],
            relatedCommands: ['max', 'earliest', 'first', 'range']
        },
        {
            id: 'stats_mode',
            name: 'mode()',
            category: 'statsFunctions',
            takeaway: 'Find the most common value',
            what: 'Returns the most frequently occurring value for a field.',
            why: 'Find the typical case, most common error, dominant user, or prevalent pattern.',
            syntax: 'mode(field)',
            examples: [
                { spl: '| stats mode(status_code) as common_status by endpoint', explanation: 'Most common status code per endpoint' },
                { spl: '| stats mode(user_agent) as typical_browser', explanation: 'Most frequently seen browser' },
                { spl: '| stats mode(src_ip) as top_source, count by dest_port', explanation: 'Most common source per port' }
            ],
            gotchas: [
                'If multiple values tie, returns one of them (non-deterministic)',
                'For finding top N, use top command instead',
                'Null values are ignored'
            ],
            relatedCommands: ['median', 'avg', 'top']
        },
        {
            id: 'stats_perc',
            name: 'perc<N>() / p<N>()',
            category: 'statsFunctions',
            takeaway: 'Find the Nth percentile value',
            what: 'Returns the value at the Nth percentile. perc95(field) means 95% of values are at or below this.',
            why: 'Essential for SLAs and performance monitoring. "95% of requests complete in X ms."',
            syntax: 'perc<N>(field) or p<N>(field) where N is 1-99',
            examples: [
                { spl: '| stats perc95(response_time) as p95_response', explanation: '95th percentile response time' },
                { spl: '| stats perc50(duration) as median, perc90(duration) as p90, perc99(duration) as p99', explanation: 'Multiple percentiles' },
                { spl: '| stats p99(bytes) as p99_bytes by endpoint', explanation: 'Short form: p99 instead of perc99' }
            ],
            gotchas: [
                'perc50 = median',
                'p95 and perc95 are equivalent',
                'Higher percentiles (p99, p999) need more events to be meaningful',
                'Memory-intensive as values must be sorted'
            ],
            relatedCommands: ['median', 'avg', 'max']
        },
        {
            id: 'stats_range',
            name: 'range()',
            category: 'statsFunctions',
            takeaway: 'Difference between max and min',
            what: 'Returns the difference between the maximum and minimum values.',
            why: 'Quick measure of spread. See how wide the range of values is.',
            syntax: 'range(field)',
            examples: [
                { spl: '| stats range(response_time) as response_spread by endpoint', explanation: 'Range of response times per endpoint' },
                { spl: '| stats range(_time) as duration by session_id', explanation: 'Session duration (last - first event time)' },
                { spl: '| stats min(bytes) as min_b, max(bytes) as max_b, range(bytes) as spread by user', explanation: 'Full range analysis' }
            ],
            gotchas: [
                'Equivalent to max(field) - min(field)',
                'Sensitive to outliers (one extreme value affects result)',
                'For time fields, result is in seconds (epoch difference)'
            ],
            relatedCommands: ['min', 'max', 'stdev']
        },
        {
            id: 'stats_rate',
            name: 'rate()',
            category: 'statsFunctions',
            takeaway: 'Calculate per-second rate of a counter',
            what: 'Returns the rate of change per second for a cumulative counter field.',
            why: 'Convert cumulative counters (like total bytes) to rates (bytes per second).',
            syntax: 'rate(field)',
            examples: [
                { spl: '| stats rate(total_bytes) as bytes_per_sec by interface', explanation: 'Throughput rate per interface' },
                { spl: '| stats rate(request_count) as requests_per_sec by endpoint', explanation: 'Request rate per endpoint' }
            ],
            gotchas: [
                'Designed for monotonically increasing counters',
                'May produce unexpected results if counter resets',
                'Often used with timechart for rate visualization',
                'Alternative: use delta and manual calculation'
            ],
            relatedCommands: ['sum', 'avg']
        },
        {
            id: 'stats_stdev',
            name: 'stdev()',
            category: 'statsFunctions',
            takeaway: 'Measure spread/variability of values',
            what: 'Returns the sample standard deviation, measuring how spread out values are from the average.',
            why: 'Detect anomalies, understand variability, identify when values deviate from normal.',
            syntax: 'stdev(field)',
            examples: [
                { spl: '| stats avg(response_time) as avg_rt, stdev(response_time) as stdev_rt by host', explanation: 'Average and variability per host' },
                { spl: '| stats stdev(bytes) as variability by user | where variability > 1000000', explanation: 'Find users with highly variable transfer sizes' }
            ],
            gotchas: [
                'stdev() is sample standard deviation (N-1 denominator)',
                'stdevp() is population standard deviation (N denominator)',
                'Higher stdev = more variability = less predictable',
                'Useful with avg() to define "normal" ranges'
            ],
            relatedCommands: ['avg', 'range']
        },
        {
            id: 'stats_sum',
            name: 'sum()',
            category: 'statsFunctions',
            takeaway: 'Add up numeric values',
            what: 'Returns the sum of all values for a numeric field.',
            why: 'Essential for totaling bytes transferred, calculating total duration, summing costs, or any additive metric.',
            syntax: 'sum(field)',
            examples: [
                { spl: '| stats sum(bytes) as total_bytes', explanation: 'Total bytes transferred' },
                { spl: '| stats sum(bytes) by src_ip | sort -sum(bytes)', explanation: 'Total bytes per source, sorted descending' },
                { spl: '| stats sum(bytes_in) as download, sum(bytes_out) as upload by user', explanation: 'Network usage per user' }
            ],
            gotchas: [
                'Non-numeric values are ignored',
                'Null values are ignored',
                'Very large sums may need formatting: use fieldformat or eval to add commas'
            ],
            relatedCommands: ['avg', 'count', 'max', 'min']
        },
        {
            id: 'stats_values',
            name: 'values()',
            category: 'statsFunctions',
            takeaway: 'Collect unique values into a multivalue field',
            what: 'Returns all distinct values for a field as a multivalue result, sorted alphabetically.',
            why: 'See all unique values at a glance. Great for listing distinct IPs, users, or actions per group.',
            syntax: 'values(field)',
            examples: [
                { spl: '| stats values(dest_port) as ports by src_ip', explanation: 'All unique destination ports per source' },
                { spl: '| stats values(action) as actions by user', explanation: 'All actions performed by each user' },
                { spl: '| stats dc(dest_ip) as count, values(dest_ip) as destinations by src_ip', explanation: 'Count and list destinations' }
            ],
            gotchas: [
                'Results are DEDUPLICATED - each value appears only once',
                'Results are SORTED alphabetically (not by occurrence order)',
                'Use list() if you need all occurrences including duplicates',
                'Memory-intensive for high-cardinality fields'
            ],
            relatedCommands: ['list', 'dc', 'earliest', 'latest']
        }
    ]
};

Object.keys(GLOSSARY_DATA).forEach((category) => {
    GLOSSARY_DATA[category].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
});

// Export GLOSSARY_DATA immediately for use by SPL sidebar and other components
window.GLOSSARY_DATA = GLOSSARY_DATA;

// ============================================
// Glossary Logic
// ============================================

let currentCategory = 'commands';
let currentSearch = '';
let currentView = 'categorized';

// Multi-select filter states (empty Set = show all)
let commandFilters = new Set();
let functionFilters = new Set();

document.addEventListener('DOMContentLoaded', () => {
    // Only initialize glossary UI if we're on the glossary page
    if (document.getElementById('glossaryTabs')) {
        initGlossary();
    }
});

function initGlossary() {
    // Export glossary data for global search
    window.GLOSSARY_DATA = GLOSSARY_DATA;
    window.TAB_CATEGORY_MAP = TAB_CATEGORY_MAP;
    window.CATEGORY_TO_TAB = CATEGORY_TO_TAB;

    // Initialize tabs
    const storageKey = 'splunked-glossary-tab';
    const tabController = SPLUNKed.initTabs('#glossaryTabs', {
        storageKey: storageKey,
        onTabChange: (category) => {
            currentCategory = category;
            renderGlossary();
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
        // Sync currentCategory with restored tab from localStorage
        const savedTab = localStorage.getItem(storageKey);
        if (savedTab && TAB_CATEGORY_MAP[savedTab]) {
            currentCategory = savedTab;
        }
    }

    // Initialize search
    SPLUNKed.initSearch('glossarySearch', {
        onSearch: (query) => {
            currentSearch = query;
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

    // Initialize icon filters for each tab
    initIconFilter('commandsFilter', commandFilters);
    initIconFilter('functionsFilter', functionFilters);

    // Initialize modal
    SPLUNKed.initModal('glossaryModal');

    // Render initial content
    renderAllCategories();

    // Add click handlers for cards
    document.addEventListener('click', handleCardClick);

    // Open specific entry if requested via URL
    if (openId) {
        const entry = findEntryById(openId);
        if (entry) {
            // Slight delay to ensure DOM is ready
            setTimeout(() => openDetailModal(entry), 100);
        }
    }
}

// Unified icon filter initialization - single-select (one category at a time)
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

        renderGlossary();
    });
}

// Find an entry by ID across all categories
function findEntryById(id) {
    for (const category of Object.keys(GLOSSARY_DATA)) {
        const entry = GLOSSARY_DATA[category].find(e => e.id === id);
        if (entry) return entry;
    }
    return null;
}

function renderAllCategories() {
    // Render all 4 consolidated tabs
    Object.keys(TAB_CATEGORY_MAP).forEach(tab => {
        renderCategoryGrid(tab);
    });
}

function renderGlossary() {
    renderCategoryGrid(currentCategory);
    updateEmptyState();
}

function renderCategoryGrid(tab) {
    const grid = document.getElementById(`${tab}Grid`);
    const infoContainer = document.getElementById(`${tab}Info`);
    if (!grid) return;

    // Render tab info
    if (infoContainer && TAB_INFO[tab]) {
        infoContainer.innerHTML = createCategoryInfoHTML(tab);
    }

    // Get source categories for this tab
    const sourceCategories = TAB_CATEGORY_MAP[tab] || [tab];

    // Merge entries from all source categories
    let entries = [];
    sourceCategories.forEach(sourceCat => {
        const catEntries = GLOSSARY_DATA[sourceCat] || [];
        catEntries.forEach(entry => {
            entries.push({
                ...entry,
                _sourceCategory: sourceCat
            });
        });
    });

    // Filter entries
    const filtered = filterEntries(entries);

    // Sort alphabetically if requested
    if (currentView === 'alphabetical') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Render cards with optional subcategory badges for merged tabs
    const showSubcategory = sourceCategories.length > 1;
    grid.innerHTML = filtered.map(entry => createCardHTML(entry, showSubcategory)).join('');
}

function createCategoryInfoHTML(tab) {
    const info = TAB_INFO[tab] || CATEGORY_INFO[tab];
    if (!info) return '';

    return `
        <div class="category-info-content">
            <p class="category-description">${SPLUNKed.escapeHtml(info.description)}</p>
        </div>
    `;
}

function filterEntries(entries) {
    return entries.filter(entry => {
        // Multi-select filtering based on current tab
        // Empty filter set = show all

        // Commands tab: filter by pipeline stage (purpose)
        if (currentCategory === 'commands' && commandFilters.size > 0) {
            if (!entry.purpose || !commandFilters.has(entry.purpose)) {
                return false;
            }
        }

        // Functions tab: filter by function type (eval/stats)
        if (currentCategory === 'functions' && functionFilters.size > 0) {
            const entryCategory = entry._sourceCategory || entry.category;
            // Map filter values to source categories
            const filterMatches =
                (functionFilters.has('eval') && entryCategory === 'functions') ||
                (functionFilters.has('stats') && entryCategory === 'statsFunctions');
            if (!filterMatches) {
                return false;
            }
        }

        // Filter by search
        if (currentSearch) {
            const purposeLabel = entry.purpose
                ? (PURPOSE_LABELS[entry.purpose] || FUNCTION_PURPOSE_LABELS[entry.purpose] || '')
                : '';
            const searchable = [
                entry.name,
                entry.takeaway,
                entry.what,
                entry.why,
                entry.subcategory || '',
                purposeLabel
            ].join(' ').toLowerCase();

            return searchable.includes(currentSearch);
        }

        return true;
    });
}

// Unified icon mapping for all card categories
const CARD_ICONS = {
    // Command pipeline stages
    get: { icon: '↓', label: 'Get data' },
    filter: { icon: '⧩', label: 'Filter' },
    transform: { icon: '⟳', label: 'Transform' },
    aggregate: { icon: 'Σ', label: 'Aggregate' },
    combine: { icon: '⊕', label: 'Combine' },
    output: { icon: '▤', label: 'Output' },
    // Function types
    functions: { icon: 'ƒ', label: 'Eval Function' },
    statsFunctions: { icon: '∑', label: 'Stats Function' },
    // Reference categories
    fields: { icon: '⬚', label: 'Field' },
    concepts: { icon: '◆', label: 'Concept' },
    cim: { icon: '⧉', label: 'CIM' },
    extractions: { icon: '⋔', label: 'Extraction' },
    macros: { icon: '{ }', label: 'Macro' },
    engineering: { icon: '⚙', label: 'Engineering' },
    // Antipatterns
    antipatterns: { icon: '⚠', label: 'Pitfall' },
    // Enterprise Security subcategories
    rba: { icon: '⚡', label: 'Risk-Based Alerting' },
    notable: { icon: '◉', label: 'Notable Events' },
    assetIdentity: { icon: '◎', label: 'Asset/Identity' },
    threatIntel: { icon: '⊛', label: 'Threat Intel' },
    datamodels: { icon: '◈', label: 'Data Models' },
    correlation: { icon: '⬔', label: 'Correlation' },
    investigation: { icon: '◇', label: 'Investigation' },
    mitre: { icon: '⬡', label: 'MITRE ATT&CK' },
    content: { icon: '▧', label: 'Content' },
    enterpriseSecurity: { icon: '⛨', label: 'Enterprise Security' }
};

function createCardHTML(entry, showSubcategory = false) {
    const experimentalBadge = entry.experimental
        ? '<span class="experimental-badge">Test</span>'
        : '';

    // Determine the icon key based on entry type
    const entryCategory = entry._sourceCategory || entry.category;
    let iconKey = null;
    let iconClass = '';

    // Commands use purpose (pipeline stage)
    if (entry.purpose && CARD_ICONS[entry.purpose]) {
        iconKey = entry.purpose;
        iconClass = entry.purpose;
    }
    // Other categories use source category
    else if (CARD_ICONS[entryCategory]) {
        iconKey = entryCategory;
        iconClass = entryCategory;
    }

    // Build the card icon (positioned absolutely in top-right)
    let cardIcon = '';
    if (iconKey && CARD_ICONS[iconKey]) {
        const { icon, label } = CARD_ICONS[iconKey];
        cardIcon = `<span class="card-icon ${iconClass}" title="${label}">${icon}</span>`;
    }

    return `
        <div class="glossary-card" data-id="${entry.id}" data-category="${entry.category}">
            ${cardIcon}
            <div class="glossary-card-header">
                <code class="glossary-name">${SPLUNKed.escapeHtml(entry.name)}</code>
                ${experimentalBadge}
            </div>
            <p class="glossary-takeaway">${SPLUNKed.escapeHtml(entry.takeaway)}</p>
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
    const entry = GLOSSARY_DATA[category]?.find(e => e.id === id);

    if (entry) {
        // Clear history when opening from grid
        cardHistory = [];
        currentCardEntry = null;
        openDetailModal(entry);
    }
}

function openDetailModal(entry) {
    const title = document.getElementById('glossaryModalTitle');
    const content = document.getElementById('glossaryModalContent');
    const backBtn = document.getElementById('glossaryModalBack');
    const modalHeader = document.querySelector('#glossaryModal .modal-header');

    // Track current entry
    currentCardEntry = entry;

    title.textContent = entry.name;

    // Update back button visibility
    if (backBtn) {
        backBtn.hidden = cardHistory.length === 0;
    }

    // Handle "View Functions" button in header
    const existingBtn = modalHeader.querySelector('.view-functions-btn');
    if (existingBtn) {
        existingBtn.remove();
    }

    if (entry.relatedSection) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary view-functions-btn';
        // Map old category to new consolidated tab
        const targetTabName = CATEGORY_TO_TAB[entry.relatedSection.category] || entry.relatedSection.category;
        btn.dataset.category = targetTabName;
        const shortLabel = entry.relatedSection.shortLabel || 'Functions';
        btn.innerHTML = `<span class="full-label">${entry.relatedSection.label}</span><span class="short-label">${shortLabel}</span> <span class="btn-arrow">→</span>`;
        btn.addEventListener('click', () => {
            SPLUNKed.closeModal('glossaryModal');
            const targetTab = document.querySelector(`.category-tab[data-category="${targetTabName}"]`);
            if (targetTab) {
                targetTab.click();
            }
        });
        // Insert after title
        title.insertAdjacentElement('afterend', btn);
    }

    // Check for card styles
    if (entry.cardStyle === 'tabbed') {
        // Tabbed style for commands and functions
        content.innerHTML = createTabbedHTML(entry);
        initTabbedModal(content);
    } else if (entry.cardStyle === 'progressive') {
        content.innerHTML = createProgressiveHTML(entry);
        initProgressiveModal(content);
    } else if (entry.cardStyle === 'layered') {
        content.innerHTML = createLayeredHTML(entry);
    } else {
        // Concept-style format for all other categories
        content.innerHTML = createConceptHTML(entry);
        initConceptLinks(content);
    }

    // Apply syntax highlighting to all SPL code blocks
    SPLUNKed.applySPLHighlighting(content);

    SPLUNKed.openModal('glossaryModal');
}

function goBackCard() {
    if (cardHistory.length > 0) {
        const previousEntry = cardHistory.pop();
        openDetailModal(previousEntry, false);
    }
}

// Initialize back button
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('glossaryModalBack');
    if (backBtn) {
        backBtn.addEventListener('click', goBackCard);
    }
});

// Helper to populate SPL blocks for standard entries
function populateStandardSPLBlocks(content, entry) {
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
}

// ============================================
// Tabbed Card Style (by skill level)
// ============================================
function createTabbedHTML(entry) {
    const zones = entry.zones;

    let html = `
        <div class="zone-tabs" role="tablist">
            <button class="zone-tab active" data-zone="essential" role="tab" aria-selected="true">
                <span class="full-label">Essential</span><span class="short-label">Core</span>
            </button>
            <button class="zone-tab" data-zone="practical" role="tab" aria-selected="false">
                <span class="full-label">Practical</span><span class="short-label">Use</span>
            </button>
            <button class="zone-tab" data-zone="deep" role="tab" aria-selected="false">
                <span class="full-label">Deep Dive</span><span class="short-label">Deep</span>
            </button>
        </div>
    `;

    // Essential tab content
    html += `<div class="zone-tab-content active" data-zone="essential">`;
    html += renderEssentialZone(zones.essential);
    html += `</div>`;

    // Practical tab content
    html += `<div class="zone-tab-content" data-zone="practical">`;
    html += renderPracticalZone(zones.practical);
    html += `</div>`;

    // Deep Dive tab content
    html += `<div class="zone-tab-content" data-zone="deep">`;
    html += renderDeepZone(zones.deep);
    html += `</div>`;

    // Footer with Related commands
    if (entry.relatedCommands && entry.relatedCommands.length > 0) {
        html += `
            <div class="tabbed-footer" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <div class="detail-section">
                    <div class="detail-label">Related</div>
                    <div class="detail-content">
                        ${entry.relatedCommands.map(c => `<code class="command-link" data-command="${SPLUNKed.escapeHtml(c)}">${SPLUNKed.escapeHtml(c)}</code>`).join(', ')}
                    </div>
                </div>
            </div>
        `;
    }

    return html;
}

// ============================================
// Concept Card Style (flat, visually aligned with tabbed)
// ============================================
function createConceptHTML(entry) {
    let html = '<div class="zone-content">';

    // WHAT section
    if (entry.what) {
        html += `
            <div class="tabbed-section section-what">
                <div class="tabbed-section-header">WHAT</div>
                <div class="tabbed-section-content">${SPLUNKed.escapeHtml(entry.what)}</div>
            </div>
        `;
    }

    // WHY section
    if (entry.why) {
        html += `
            <div class="tabbed-section section-why">
                <div class="tabbed-section-header">WHY IT MATTERS</div>
                <div class="tabbed-section-content">${SPLUNKed.escapeHtml(entry.why)}</div>
            </div>
        `;
    }

    // KEY POINT section
    if (entry.keyPoint) {
        html += `
            <div class="tabbed-section section-key">
                <div class="tabbed-section-header">KEY POINT</div>
                <div class="tabbed-section-content" style="font-weight: 500; color: var(--splunk-teal);">${SPLUNKed.escapeHtml(entry.keyPoint)}</div>
            </div>
        `;
    }

    // SYNTAX section (for extractions, macros, etc.)
    if (entry.syntax) {
        html += `
            <div class="tabbed-section section-syntax">
                <div class="tabbed-section-header">SYNTAX</div>
                <div class="tabbed-section-content">
                    <pre class="spl-example">${SPLUNKed.escapeHtml(entry.syntax)}</pre>
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
                                <pre class="spl-code"><code>${SPLUNKed.escapeHtml(ex.spl)}</code></pre>
                            </div>
                            <p class="example-explanation">${SPLUNKed.escapeHtml(ex.explanation)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // WATCH OUT section (gotchas)
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

    // KEY FIELDS section (ES-specific)
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

    // COMMON MACROS section (ES-specific)
    if (entry.commonMacros && entry.commonMacros.length > 0) {
        html += `
            <div class="tabbed-section section-macros">
                <div class="tabbed-section-header">COMMON MACROS</div>
                <div class="tabbed-section-content">
                    <table class="field-table">
                        ${entry.commonMacros.map(m => `
                            <tr>
                                <td><code>${SPLUNKed.escapeHtml(m.macro)}</code></td>
                                <td>${SPLUNKed.escapeHtml(m.description)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        `;
    }

    // DATA MODELS section (ES-specific)
    if (entry.dataModels && entry.dataModels.length > 0) {
        html += `
            <div class="tabbed-section section-datamodels">
                <div class="tabbed-section-header">ES DATA MODELS</div>
                <div class="tabbed-section-content">
                    <table class="field-table">
                        ${entry.dataModels.map(dm => `
                            <tr>
                                <td><code>${SPLUNKed.escapeHtml(dm.name)}</code></td>
                                <td>${SPLUNKed.escapeHtml(dm.description)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        `;
    }

    // ACTION TYPES section (ES-specific)
    if (entry.actionTypes && entry.actionTypes.length > 0) {
        html += `
            <div class="tabbed-section section-actions">
                <div class="tabbed-section-header">ACTION TYPES</div>
                <div class="tabbed-section-content">
                    <table class="field-table">
                        ${entry.actionTypes.map(a => `
                            <tr>
                                <td><code>${SPLUNKed.escapeHtml(a.action)}</code></td>
                                <td>${SPLUNKed.escapeHtml(a.description)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        `;
    }

    // SUPPRESSION FIELDS section (ES-specific)
    if (entry.suppressionFields && entry.suppressionFields.length > 0) {
        html += `
            <div class="tabbed-section section-suppression">
                <div class="tabbed-section-header">COMMON SUPPRESSION PATTERNS</div>
                <div class="tabbed-section-content">
                    <table class="field-table">
                        <tr style="font-weight: 600; border-bottom: 1px solid var(--border-subtle);">
                            <td>Scenario</td>
                            <td>Suppress By</td>
                            <td>Window</td>
                        </tr>
                        ${entry.suppressionFields.map(s => `
                            <tr>
                                <td>${SPLUNKed.escapeHtml(s.scenario)}</td>
                                <td><code>${SPLUNKed.escapeHtml(s.fields)}</code></td>
                                <td>${SPLUNKed.escapeHtml(s.window)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </div>
        `;
    }

    // WORKFLOW section (ES-specific - for investigation)
    if (entry.workflow && entry.workflow.length > 0) {
        html += `
            <div class="tabbed-section section-workflow">
                <div class="tabbed-section-header">INVESTIGATION WORKFLOW</div>
                <div class="tabbed-section-content">
                    <ol class="workflow-list">
                        ${entry.workflow.map(w => `
                            <li><strong>Step ${SPLUNKed.escapeHtml(w.step)}:</strong> ${SPLUNKed.escapeHtml(w.description)}</li>
                        `).join('')}
                    </ol>
                </div>
            </div>
        `;
    }

    // PERFORMANCE section
    if (entry.performance) {
        html += `
            <div class="tabbed-section section-perf">
                <div class="tabbed-section-header">PERFORMANCE</div>
                <div class="tabbed-section-content">${SPLUNKed.escapeHtml(entry.performance)}</div>
            </div>
        `;
    }

    html += '</div>';

    // Footer with Related commands (for non-concepts)
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

    // Footer with Related concepts
    if (entry.relatedConcepts && entry.relatedConcepts.length > 0) {
        const relatedNames = entry.relatedConcepts.map(id => {
            const concept = GLOSSARY_DATA.concepts?.find(c => c.id === id);
            return concept ? concept.name : id.replace('concept_', '');
        });
        html += `
            <div class="tabbed-footer" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <div class="detail-section">
                    <div class="detail-label">Related Concepts</div>
                    <div class="detail-content">
                        ${entry.relatedConcepts.map((id, i) => `<code class="concept-link" data-concept="${SPLUNKed.escapeHtml(id)}">${SPLUNKed.escapeHtml(relatedNames[i])}</code>`).join(', ')}
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
            const concept = GLOSSARY_DATA.concepts?.find(c => c.id === conceptId);
            if (concept) {
                // Add current to history for back navigation
                if (currentCardEntry) {
                    cardHistory.push(currentCardEntry);
                }
                openDetailModal(concept);
            }
        });
    });
}

// ============================================
// Zone Render Functions
// ============================================

function renderEssentialZone(zone) {
    let html = '<div class="zone-content">';

    if (zone.what) {
        html += `
            <div class="tabbed-section section-what">
                <div class="tabbed-section-header">WHAT</div>
                <div class="tabbed-section-content">${SPLUNKed.escapeHtml(zone.what)}</div>
            </div>
        `;
    }

    if (zone.why) {
        html += `
            <div class="tabbed-section section-why">
                <div class="tabbed-section-header">WHY</div>
                <div class="tabbed-section-content">${SPLUNKed.escapeHtml(zone.why)}</div>
            </div>
        `;
    }

    if (zone.syntax) {
        html += `
            <div class="tabbed-section section-syntax">
                <div class="tabbed-section-header">SYNTAX</div>
                <div class="tabbed-section-content">
                    <pre class="spl-example">${SPLUNKed.escapeHtml(zone.syntax)}</pre>
                </div>
            </div>
        `;
    }

    if (zone.example) {
        html += `
            <div class="example-pair">
                <div class="spl-block">
                    <pre class="spl-code"><code>${SPLUNKed.escapeHtml(zone.example.spl)}</code></pre>
                </div>
                <p class="example-explanation">${SPLUNKed.escapeHtml(zone.example.explanation)}</p>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

function renderPracticalZone(zone) {
    let html = '<div class="zone-content">';

    if (zone.examples && zone.examples.length > 0) {
        html += `
            <div class="tabbed-section section-examples">
                <div class="tabbed-section-header">MORE EXAMPLES</div>
                <div class="tabbed-section-content">
                    ${zone.examples.map(ex => `
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

    if (zone.joinTypes && zone.joinTypes.length > 0) {
        html += `
            <div class="tabbed-section section-join-types">
                <div class="tabbed-section-header">JOIN TYPES EXPLAINED</div>
                <div class="tabbed-section-content">
                    <div class="join-types-grid">
                        ${zone.joinTypes.map(jt => `
                            <div class="join-type-card join-type-${jt.type}">
                                <div class="join-type-header">${SPLUNKed.escapeHtml(jt.title)}</div>
                                <div class="join-type-desc">${SPLUNKed.escapeHtml(jt.description)}</div>
                                <div class="join-type-scenario">
                                    <strong>Scenario:</strong> ${SPLUNKed.escapeHtml(jt.scenario)}
                                </div>
                                <div class="join-type-result">
                                    <strong>Result:</strong> ${SPLUNKed.escapeHtml(jt.result)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    if (zone.gotchas && zone.gotchas.length > 0) {
        html += `
            <div class="tabbed-section section-gotchas">
                <div class="tabbed-section-header">WATCH OUT</div>
                <div class="tabbed-section-content">
                    <ul class="warning-list">
                        ${zone.gotchas.map(g => `<li><span class="warning-icon">!</span> ${SPLUNKed.escapeHtml(g)}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    if (zone.commonUses && zone.commonUses.length > 0) {
        html += `
            <div class="tabbed-section section-uses">
                <div class="tabbed-section-header">COMMON USES</div>
                <div class="tabbed-section-content">
                    <ul class="uses-list">
                        ${zone.commonUses.map(u => `<li><span class="use-arrow">→</span> ${SPLUNKed.escapeHtml(u)}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

function renderDeepZone(zone) {
    let html = '<div class="zone-content">';

    if (zone.advancedPatterns && zone.advancedPatterns.length > 0) {
        html += `
            <div class="tabbed-section section-advanced">
                <div class="tabbed-section-header">ADVANCED PATTERNS</div>
                <div class="tabbed-section-content">
                    ${zone.advancedPatterns.map(ap => `
                        <div class="advanced-pattern">
                            <div class="pattern-name">${SPLUNKed.escapeHtml(ap.name)}</div>
                            <div class="spl-block">
                                <pre class="spl-code"><code>${SPLUNKed.escapeHtml(ap.spl)}</code></pre>
                            </div>
                            <p class="example-explanation">${SPLUNKed.escapeHtml(ap.explanation)}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    if (zone.performance) {
        html += `
            <div class="tabbed-section section-performance">
                <div class="tabbed-section-header">PERFORMANCE</div>
                <div class="tabbed-section-content">${SPLUNKed.escapeHtml(zone.performance)}</div>
            </div>
        `;
    }

    if (zone.internals) {
        html += `
            <div class="tabbed-section section-internals">
                <div class="tabbed-section-header">INTERNALS</div>
                <div class="tabbed-section-content">${SPLUNKed.escapeHtml(zone.internals)}</div>
            </div>
        `;
    }

    if (zone.vsAlternatives) {
        html += `
            <div class="tabbed-section section-alternatives">
                <div class="tabbed-section-header">VS. ALTERNATIVES</div>
                <div class="tabbed-section-content">
                    <ul class="alternatives-list">
                        ${Object.entries(zone.vsAlternatives).map(([cmd, desc]) => {
                            // Only make it a link if the entry exists in the glossary
                            const hasEntry = findCommandData(cmd) !== null;
                            if (hasEntry) {
                                return `<li><code class="command-link" data-command="${SPLUNKed.escapeHtml(cmd)}">${SPLUNKed.escapeHtml(cmd)}</code> — ${SPLUNKed.escapeHtml(desc)}</li>`;
                            } else {
                                return `<li><code class="alt-code">${SPLUNKed.escapeHtml(cmd)}</code> — ${SPLUNKed.escapeHtml(desc)}</li>`;
                            }
                        }).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    html += '</div>';
    return html;
}

function initTabbedModal(content) {
    const tabs = content.querySelectorAll('.zone-tab');
    const panels = content.querySelectorAll('.zone-tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const zone = tab.dataset.zone;

            // Update tab states
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Update panel visibility
            panels.forEach(p => {
                p.classList.toggle('active', p.dataset.zone === zone);
            });

            // Re-apply highlighting to newly visible content
            SPLUNKed.applySPLHighlighting(content);
        });
    });

    // Initialize command tooltips
    initCommandTooltips(content);
}

// ============================================
// Command Tooltips for Related Terms
// ============================================
let commandTooltip = null;
let tooltipTimeout = null;

function ensureTooltipElement() {
    if (!commandTooltip) {
        commandTooltip = document.createElement('div');
        commandTooltip.className = 'command-tooltip';
        commandTooltip.id = 'commandTooltip';
        commandTooltip.hidden = true;
        commandTooltip.innerHTML = '<div class="command-tooltip-content" id="commandTooltipContent"></div>';
        document.body.appendChild(commandTooltip);

        // Keep tooltip visible when hovering over it
        commandTooltip.addEventListener('mouseenter', () => {
            clearTimeout(tooltipTimeout);
        });
        commandTooltip.addEventListener('mouseleave', () => {
            tooltipTimeout = setTimeout(hideCommandTooltip, 100);
        });
    }
    return commandTooltip;
}

function findCommandData(commandName) {
    // Search through all categories for the command
    const searchName = commandName.toLowerCase();
    for (const category of Object.keys(GLOSSARY_DATA)) {
        const entries = GLOSSARY_DATA[category];
        // Try exact match first
        let found = entries.find(e => e.name.toLowerCase() === searchName);
        if (found) return found;
        // Try with () appended (for functions like coalesce -> coalesce())
        found = entries.find(e => e.name.toLowerCase() === searchName + '()');
        if (found) return found;
        // Try without () (for references like coalesce() -> coalesce)
        if (searchName.endsWith('()')) {
            found = entries.find(e => e.name.toLowerCase() === searchName.slice(0, -2));
            if (found) return found;
        }
    }
    return null;
}

function showCommandTooltip(element, commandName) {
    const data = findCommandData(commandName);
    const tooltip = ensureTooltipElement();
    const tooltipContent = tooltip.querySelector('.command-tooltip-content');

    if (!data) {
        tooltipContent.innerHTML = `<h4>${SPLUNKed.escapeHtml(commandName)}</h4><p>No description available</p>`;
    } else {
        const description = data.takeaway || data.what || 'No description available';
        tooltipContent.innerHTML = `<h4>${SPLUNKed.escapeHtml(data.name)}</h4><p>${SPLUNKed.escapeHtml(description)}</p>`;
    }

    // Position tooltip
    const rect = element.getBoundingClientRect();
    let left = rect.left + (rect.width / 2) - 160;
    let top = rect.bottom + 8;

    // Keep in viewport
    if (left < 10) left = 10;
    if (left + 320 > window.innerWidth - 10) {
        left = window.innerWidth - 330;
    }
    if (top + 100 > window.innerHeight) {
        top = rect.top - 100;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.hidden = false;

    requestAnimationFrame(() => {
        tooltip.classList.add('visible');
    });
}

function hideCommandTooltip() {
    if (commandTooltip) {
        commandTooltip.classList.remove('visible');
        setTimeout(() => {
            commandTooltip.hidden = true;
        }, 150);
    }
}

function initCommandTooltips(container) {
    const links = container.querySelectorAll('.command-link:not([data-tooltip-init])');

    links.forEach(link => {
        link.dataset.tooltipInit = 'true';

        link.addEventListener('mouseenter', () => {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(() => {
                showCommandTooltip(link, link.dataset.command);
            }, 200);
        });

        link.addEventListener('mouseleave', () => {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(hideCommandTooltip, 100);
        });

        link.addEventListener('click', (e) => {
            e.preventDefault();
            hideCommandTooltip();
            const data = findCommandData(link.dataset.command);
            if (data) {
                // Push current card to history before navigating
                if (currentCardEntry) {
                    cardHistory.push(currentCardEntry);
                }
                openDetailModal(data);
            }
        });
    });
}

// ============================================
// Progressive Card Style (staged reveal)
// ============================================
function createProgressiveHTML(entry) {
    const stages = entry.stages;
    let html = '<div class="progressive-container">';

    stages.forEach((stage, index) => {
        const isFirst = index === 0;
        const stageClass = isFirst ? 'completed' : 'locked';

        html += `
            <div class="progressive-stage ${stageClass}" data-stage="${index}">
                <div class="progressive-stage-header">
                    <span class="progressive-stage-number">${index + 1}</span>
                    <span class="progressive-stage-title">${SPLUNKed.escapeHtml(stage.title)}</span>
                    ${isFirst
                        ? '<span class="progressive-complete-indicator">✓</span>'
                        : '<button class="progressive-unlock-btn">Unlock</button>'
                    }
                </div>
                <div class="progressive-stage-content">
                    ${renderStageContent(stage.content)}
                </div>
            </div>
        `;
    });

    html += '</div>';

    // Related commands
    if (entry.relatedCommands && entry.relatedCommands.length > 0) {
        html += `
            <div class="detail-section" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <div class="detail-label">Related</div>
                <div class="detail-content">
                    ${entry.relatedCommands.map(c => `<code>${SPLUNKed.escapeHtml(c)}</code>`).join(', ')}
                </div>
            </div>
        `;
    }

    return html;
}

function renderStageContent(content) {
    let html = '';

    if (content.what) {
        html += `
            <div class="detail-section">
                <div class="detail-label">What</div>
                <div class="detail-content">${SPLUNKed.escapeHtml(content.what)}</div>
            </div>
        `;
    }

    if (content.why) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Why</div>
                <div class="detail-content">${SPLUNKed.escapeHtml(content.why)}</div>
            </div>
        `;
    }

    if (content.syntax) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Syntax</div>
                <pre class="spl-example">${SPLUNKed.escapeHtml(content.syntax)}</pre>
            </div>
        `;
    }

    if (content.advancedSyntax) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Full Syntax</div>
                <pre class="spl-example">${SPLUNKed.escapeHtml(content.advancedSyntax)}</pre>
            </div>
        `;
    }

    if (content.examples && content.examples.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Examples</div>
                ${content.examples.map(ex => `
                    <div class="spl-block">
                        <pre class="spl-code"><code>${SPLUNKed.escapeHtml(ex.spl)}</code></pre>
                    </div>
                    <p class="detail-content" style="margin-top: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem;">${SPLUNKed.escapeHtml(ex.explanation)}</p>
                `).join('')}
            </div>
        `;
    }

    if (content.patterns && content.patterns.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Common Patterns</div>
                ${content.patterns.map(p => `
                    <p style="font-weight: 600; margin-bottom: 0.25rem; font-size: 0.875rem;">${SPLUNKed.escapeHtml(p.name)}</p>
                    <div class="spl-block">
                        <pre class="spl-code"><code>${SPLUNKed.escapeHtml(p.spl)}</code></pre>
                    </div>
                    <p class="detail-content" style="margin-top: 0.5rem; margin-bottom: 1rem; font-size: 0.8rem;">${SPLUNKed.escapeHtml(p.explanation)}</p>
                `).join('')}
            </div>
        `;
    }

    if (content.gotchas && content.gotchas.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-label" style="color: var(--splunk-amber);">Watch Out</div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${content.gotchas.map(g => `<li style="padding-left: 1rem; margin-bottom: 0.25rem; position: relative; font-size: 0.875rem;"><span style="position: absolute; left: 0; color: var(--splunk-amber);">!</span>${SPLUNKed.escapeHtml(g)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (content.relatedTip) {
        html += `
            <div class="detail-section">
                <div class="detail-content" style="color: var(--splunk-teal); font-size: 0.875rem;">
                    💡 ${SPLUNKed.escapeHtml(content.relatedTip)}
                </div>
            </div>
        `;
    }

    if (content.performance) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Performance</div>
                <div class="detail-content">${SPLUNKed.escapeHtml(content.performance)}</div>
            </div>
        `;
    }

    if (content.internals) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Under the Hood</div>
                <div class="detail-content" style="font-size: 0.8rem; color: var(--text-dim);">${SPLUNKed.escapeHtml(content.internals)}</div>
            </div>
        `;
    }

    if (content.securityPattern) {
        const sp = content.securityPattern;
        html += `
            <div class="detail-section">
                <div class="detail-label" style="color: var(--splunk-pink);">Security Pattern: ${SPLUNKed.escapeHtml(sp.name)}</div>
                <div class="spl-block">
                    <pre class="spl-code"><code>${SPLUNKed.escapeHtml(sp.spl)}</code></pre>
                </div>
                <p class="detail-content" style="margin-top: 0.5rem; font-size: 0.8rem;">${SPLUNKed.escapeHtml(sp.explanation)}</p>
            </div>
        `;
    }

    return html;
}

function initProgressiveModal(content) {
    const stages = content.querySelectorAll('.progressive-stage');
    const unlockBtns = content.querySelectorAll('.progressive-unlock-btn');

    unlockBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const stage = btn.closest('.progressive-stage');
            const stageIndex = parseInt(stage.dataset.stage);

            // Unlock this stage
            stage.classList.remove('locked');
            stage.classList.add('completed');

            // Replace button with checkmark
            btn.replaceWith(Object.assign(document.createElement('span'), {
                className: 'progressive-complete-indicator',
                textContent: '✓'
            }));

            // Re-apply highlighting
            SPLUNKed.applySPLHighlighting(content);
        });
    });
}

// ============================================
// Layered Card Style (visual zones)
// ============================================
function createLayeredHTML(entry) {
    const zones = entry.zones;
    let html = '<div class="layered-container">';

    // Core zone (most prominent)
    html += `
        <div class="layer-zone core" data-layer-label="${SPLUNKed.escapeHtml(zones.core.label)}">
            <div class="layer-section">
                <div class="detail-label">What</div>
                <div class="detail-content">${SPLUNKed.escapeHtml(zones.core.what)}</div>
            </div>
            <div class="layer-section">
                <div class="detail-label">Why</div>
                <div class="detail-content">${SPLUNKed.escapeHtml(zones.core.why)}</div>
            </div>
            <div class="layer-section">
                <div class="detail-label">Syntax</div>
                <pre class="spl-example">${SPLUNKed.escapeHtml(zones.core.syntax)}</pre>
            </div>
            ${zones.core.example ? `
                <div class="layer-section">
                    <div class="spl-block">
                        <pre class="spl-code"><code>${SPLUNKed.escapeHtml(zones.core.example.spl)}</code></pre>
                    </div>
                    <p class="detail-content" style="margin-top: 0.5rem; font-size: 0.875rem;">${SPLUNKed.escapeHtml(zones.core.example.explanation)}</p>
                </div>
            ` : ''}
        </div>
    `;

    // Practical zone (moderate prominence)
    html += `
        <div class="layer-zone practical" data-layer-label="${SPLUNKed.escapeHtml(zones.practical.label)}">
    `;

    if (zones.practical.examples && zones.practical.examples.length > 0) {
        html += `
            <div class="layer-section">
                <div class="detail-label">More Examples</div>
                ${zones.practical.examples.map(ex => `
                    <div class="spl-block" style="margin-bottom: 0.5rem;">
                        <pre class="spl-code"><code>${SPLUNKed.escapeHtml(ex.spl)}</code></pre>
                    </div>
                    <p class="detail-content" style="margin-top: 0.25rem; margin-bottom: 0.75rem;">${SPLUNKed.escapeHtml(ex.explanation)}</p>
                `).join('')}
            </div>
        `;
    }

    if (zones.practical.gotchas && zones.practical.gotchas.length > 0) {
        html += `
            <div class="layer-section">
                <div class="detail-label">Watch Out</div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${zones.practical.gotchas.map(g => `<li style="padding-left: 1rem; margin-bottom: 0.25rem; position: relative;"><span style="position: absolute; left: 0; color: var(--splunk-amber);">!</span>${SPLUNKed.escapeHtml(g)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (zones.practical.commonUses && zones.practical.commonUses.length > 0) {
        html += `
            <div class="layer-section">
                <div class="detail-label">Common Uses</div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${zones.practical.commonUses.map(u => `<li style="padding-left: 1rem; margin-bottom: 0.25rem; position: relative;"><span style="position: absolute; left: 0; color: var(--splunk-teal);">→</span>${SPLUNKed.escapeHtml(u)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    html += `</div>`;

    // Deep zone (subtle)
    html += `
        <div class="layer-zone deep" data-layer-label="${SPLUNKed.escapeHtml(zones.deep.label)}">
    `;

    if (zones.deep.advancedPatterns && zones.deep.advancedPatterns.length > 0) {
        html += `
            <div class="layer-section">
                <div class="detail-label">Advanced Patterns</div>
                ${zones.deep.advancedPatterns.map(p => `
                    <p style="font-weight: 500; margin-bottom: 0.25rem;">${SPLUNKed.escapeHtml(p.name)}</p>
                    <div class="spl-block" style="margin-bottom: 0.25rem;">
                        <pre class="spl-code"><code>${SPLUNKed.escapeHtml(p.spl)}</code></pre>
                    </div>
                    <p class="detail-content" style="margin-top: 0.25rem; margin-bottom: 0.75rem;">${SPLUNKed.escapeHtml(p.explanation)}</p>
                `).join('')}
            </div>
        `;
    }

    if (zones.deep.performance) {
        html += `
            <div class="layer-section">
                <div class="detail-label">Performance</div>
                <div class="detail-content">${SPLUNKed.escapeHtml(zones.deep.performance)}</div>
            </div>
        `;
    }

    if (zones.deep.internals) {
        html += `
            <div class="layer-section">
                <div class="detail-label">Internals</div>
                <div class="detail-content">${SPLUNKed.escapeHtml(zones.deep.internals)}</div>
            </div>
        `;
    }

    if (zones.deep.vsAlternatives) {
        html += `
            <div class="layer-section">
                <div class="detail-label">vs. Alternatives</div>
                ${Object.entries(zones.deep.vsAlternatives).map(([cmd, desc]) => `
                    <div style="margin-bottom: 0.5rem;">
                        <code>${SPLUNKed.escapeHtml(cmd)}</code>
                        <span class="detail-content"> — ${SPLUNKed.escapeHtml(desc)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    html += `</div>`;

    html += '</div>';

    // Related commands
    if (entry.relatedCommands && entry.relatedCommands.length > 0) {
        html += `
            <div class="detail-section" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <div class="detail-label">Related</div>
                <div class="detail-content">
                    ${entry.relatedCommands.map(c => `<code>${SPLUNKed.escapeHtml(c)}</code>`).join(', ')}
                </div>
            </div>
        `;
    }

    return html;
}

function createDetailHTML(entry) {
    let html = '';

    // Basic section (always visible)
    html += `
        <div class="detail-section">
            <div class="detail-label">What</div>
            <div class="detail-content">${SPLUNKed.escapeHtml(entry.what)}</div>
        </div>
        <div class="detail-section">
            <div class="detail-label">Why</div>
            <div class="detail-content">${SPLUNKed.escapeHtml(entry.why)}</div>
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
                    <p class="detail-content" style="margin-top: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem;">${SPLUNKed.escapeHtml(ex.explanation)}</p>
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
                    ${entry.commonFunctions.map(f => `<code>${SPLUNKed.escapeHtml(f)}</code>`).join(', ')}
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
                    ${entry.commonPipeline.before ? `<div style="margin-bottom: 0.5rem;"><span style="color: var(--text-dim);">Before:</span> ${entry.commonPipeline.before.map(c => `<code>${SPLUNKed.escapeHtml(c)}</code>`).join(', ')}</div>` : ''}
                    ${entry.commonPipeline.after ? `<div><span style="color: var(--text-dim);">After:</span> ${entry.commonPipeline.after.map(c => `<code>${SPLUNKed.escapeHtml(c)}</code>`).join(', ')}</div>` : ''}
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
                    ${entry.whenToUse.map(w => `<li style="padding-left: 1rem; margin-bottom: 0.25rem; position: relative; font-size: 0.875rem;"><span style="position: absolute; left: 0; color: var(--splunk-green);">✓</span>${SPLUNKed.escapeHtml(w)}</li>`).join('')}
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
                    ${entry.whenNotToUse.map(w => `<li style="padding-left: 1rem; margin-bottom: 0.25rem; position: relative; font-size: 0.875rem;"><span style="position: absolute; left: 0; color: var(--splunk-pink);">✗</span>${SPLUNKed.escapeHtml(w)}</li>`).join('')}
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
                    <p>${SPLUNKed.escapeHtml(entry.performance)}</p>
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
                        ${entry.gotchas.map(g => `<li style="padding-left: 1rem; margin-bottom: 0.5rem; position: relative;"><span style="position: absolute; left: 0; color: var(--splunk-amber);">!</span>${SPLUNKed.escapeHtml(g)}</li>`).join('')}
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
                        <p style="font-weight: 600; margin-bottom: 0.5rem;">${SPLUNKed.escapeHtml(ap.pattern)}</p>
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
                    <p>${SPLUNKed.escapeHtml(entry.internals)}</p>
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
                    ${entry.relatedCommands.map(c => `<code>${SPLUNKed.escapeHtml(c)}</code>`).join(', ')}
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