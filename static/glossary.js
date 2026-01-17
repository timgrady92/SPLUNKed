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
            difficulty: 'beginner',
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
            difficulty: 'beginner',
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
            difficulty: 'beginner',
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
        }
    ],

    functions: [
        {
            id: 'if',
            name: 'if()',
            category: 'functions',
            subcategory: 'conditional',
            difficulty: 'beginner',
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
            difficulty: 'intermediate',
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
            difficulty: 'beginner',
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
            difficulty: 'intermediate',
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
            difficulty: 'intermediate',
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
            difficulty: 'beginner',
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
            difficulty: 'beginner',
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
    const experimentalBadge = entry.experimental
        ? '<span class="experimental-badge">Test</span>'
        : '';

    return `
        <div class="glossary-card" data-id="${entry.id}" data-category="${entry.category}">
            <div class="glossary-card-header">
                <code class="glossary-name">${escapeHtml(entry.name)}</code>
                ${experimentalBadge}
                <span class="skill-badge ${entry.difficulty}">${entry.difficulty}</span>
            </div>
            <p class="glossary-takeaway">${escapeHtml(entry.takeaway)}</p>
            <button class="glossary-expand" aria-label="View details">
                <span class="expand-icon">+</span>
            </button>
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

    // Track current entry
    currentCardEntry = entry;

    title.textContent = entry.name;

    // Update back button visibility
    if (backBtn) {
        backBtn.hidden = cardHistory.length === 0;
    }

    // Check for experimental card styles
    if (entry.cardStyle === 'tabbed') {
        content.innerHTML = createTabbedHTML(entry);
        initTabbedModal(content);
    } else if (entry.cardStyle === 'progressive') {
        content.innerHTML = createProgressiveHTML(entry);
        initProgressiveModal(content);
    } else if (entry.cardStyle === 'layered') {
        content.innerHTML = createLayeredHTML(entry);
    } else {
        // Standard rendering
        content.innerHTML = createDetailHTML(entry);
        populateStandardSPLBlocks(content, entry);
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
            <button class="zone-tab active" data-zone="essential" role="tab" aria-selected="true">Essential</button>
            <button class="zone-tab" data-zone="practical" role="tab" aria-selected="false">Practical</button>
            <button class="zone-tab" data-zone="deep" role="tab" aria-selected="false">Deep Dive</button>
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
                        ${entry.relatedCommands.map(c => `<code class="command-link" data-command="${escapeHtml(c)}">${escapeHtml(c)}</code>`).join(', ')}
                    </div>
                </div>
            </div>
        `;
    }

    return html;
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
                <div class="tabbed-section-content">${escapeHtml(zone.what)}</div>
            </div>
        `;
    }

    if (zone.why) {
        html += `
            <div class="tabbed-section section-why">
                <div class="tabbed-section-header">WHY</div>
                <div class="tabbed-section-content">${escapeHtml(zone.why)}</div>
            </div>
        `;
    }

    if (zone.syntax) {
        html += `
            <div class="tabbed-section section-syntax">
                <div class="tabbed-section-header">SYNTAX</div>
                <div class="tabbed-section-content">
                    <pre class="spl-example">${escapeHtml(zone.syntax)}</pre>
                </div>
            </div>
        `;
    }

    if (zone.example) {
        html += `
            <div class="example-pair">
                <div class="spl-block">
                    <pre class="spl-code"><code>${escapeHtml(zone.example.spl)}</code></pre>
                </div>
                <p class="example-explanation">${escapeHtml(zone.example.explanation)}</p>
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
                                <pre class="spl-code"><code>${escapeHtml(ex.spl)}</code></pre>
                            </div>
                            <p class="example-explanation">${escapeHtml(ex.explanation)}</p>
                        </div>
                    `).join('')}
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
                        ${zone.gotchas.map(g => `<li><span class="warning-icon">!</span> ${escapeHtml(g)}</li>`).join('')}
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
                        ${zone.commonUses.map(u => `<li><span class="use-arrow">→</span> ${escapeHtml(u)}</li>`).join('')}
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
                            <div class="pattern-name">${escapeHtml(ap.name)}</div>
                            <div class="spl-block">
                                <pre class="spl-code"><code>${escapeHtml(ap.spl)}</code></pre>
                            </div>
                            <p class="example-explanation">${escapeHtml(ap.explanation)}</p>
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
                <div class="tabbed-section-content">${escapeHtml(zone.performance)}</div>
            </div>
        `;
    }

    if (zone.internals) {
        html += `
            <div class="tabbed-section section-internals">
                <div class="tabbed-section-header">INTERNALS</div>
                <div class="tabbed-section-content">${escapeHtml(zone.internals)}</div>
            </div>
        `;
    }

    if (zone.vsAlternatives) {
        html += `
            <div class="tabbed-section section-alternatives">
                <div class="tabbed-section-header">VS. ALTERNATIVES</div>
                <div class="tabbed-section-content">
                    <ul class="alternatives-list">
                        ${Object.entries(zone.vsAlternatives).map(([cmd, desc]) => `
                            <li><code class="command-link" data-command="${escapeHtml(cmd)}">${escapeHtml(cmd)}</code> — ${escapeHtml(desc)}</li>
                        `).join('')}
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
    for (const category of Object.keys(GLOSSARY_DATA)) {
        const entries = GLOSSARY_DATA[category];
        const found = entries.find(e => e.name.toLowerCase() === commandName.toLowerCase());
        if (found) return found;
    }
    return null;
}

function showCommandTooltip(element, commandName) {
    const data = findCommandData(commandName);
    const tooltip = ensureTooltipElement();
    const tooltipContent = tooltip.querySelector('.command-tooltip-content');

    if (!data) {
        tooltipContent.innerHTML = `<h4>${escapeHtml(commandName)}</h4><p>No description available</p>`;
    } else {
        const description = data.takeaway || data.what || 'No description available';
        tooltipContent.innerHTML = `<h4>${escapeHtml(data.name)}</h4><p>${escapeHtml(description)}</p>`;
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
                    <span class="progressive-stage-title">${escapeHtml(stage.title)}</span>
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
                    ${entry.relatedCommands.map(c => `<code>${escapeHtml(c)}</code>`).join(', ')}
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
                <div class="detail-content">${escapeHtml(content.what)}</div>
            </div>
        `;
    }

    if (content.why) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Why</div>
                <div class="detail-content">${escapeHtml(content.why)}</div>
            </div>
        `;
    }

    if (content.syntax) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Syntax</div>
                <pre class="spl-example">${escapeHtml(content.syntax)}</pre>
            </div>
        `;
    }

    if (content.advancedSyntax) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Full Syntax</div>
                <pre class="spl-example">${escapeHtml(content.advancedSyntax)}</pre>
            </div>
        `;
    }

    if (content.examples && content.examples.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Examples</div>
                ${content.examples.map(ex => `
                    <div class="spl-block">
                        <pre class="spl-code"><code>${escapeHtml(ex.spl)}</code></pre>
                    </div>
                    <p class="detail-content" style="margin-top: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem;">${escapeHtml(ex.explanation)}</p>
                `).join('')}
            </div>
        `;
    }

    if (content.patterns && content.patterns.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Common Patterns</div>
                ${content.patterns.map(p => `
                    <p style="font-weight: 600; margin-bottom: 0.25rem; font-size: 0.875rem;">${escapeHtml(p.name)}</p>
                    <div class="spl-block">
                        <pre class="spl-code"><code>${escapeHtml(p.spl)}</code></pre>
                    </div>
                    <p class="detail-content" style="margin-top: 0.5rem; margin-bottom: 1rem; font-size: 0.8rem;">${escapeHtml(p.explanation)}</p>
                `).join('')}
            </div>
        `;
    }

    if (content.gotchas && content.gotchas.length > 0) {
        html += `
            <div class="detail-section">
                <div class="detail-label" style="color: var(--splunk-amber);">Watch Out</div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${content.gotchas.map(g => `<li style="padding-left: 1rem; margin-bottom: 0.25rem; position: relative; font-size: 0.875rem;"><span style="position: absolute; left: 0; color: var(--splunk-amber);">!</span>${escapeHtml(g)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (content.relatedTip) {
        html += `
            <div class="detail-section">
                <div class="detail-content" style="color: var(--splunk-teal); font-size: 0.875rem;">
                    💡 ${escapeHtml(content.relatedTip)}
                </div>
            </div>
        `;
    }

    if (content.performance) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Performance</div>
                <div class="detail-content">${escapeHtml(content.performance)}</div>
            </div>
        `;
    }

    if (content.internals) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Under the Hood</div>
                <div class="detail-content" style="font-size: 0.8rem; color: var(--text-dim);">${escapeHtml(content.internals)}</div>
            </div>
        `;
    }

    if (content.securityPattern) {
        const sp = content.securityPattern;
        html += `
            <div class="detail-section">
                <div class="detail-label" style="color: var(--splunk-pink);">Security Pattern: ${escapeHtml(sp.name)}</div>
                <div class="spl-block">
                    <pre class="spl-code"><code>${escapeHtml(sp.spl)}</code></pre>
                </div>
                <p class="detail-content" style="margin-top: 0.5rem; font-size: 0.8rem;">${escapeHtml(sp.explanation)}</p>
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
        <div class="layer-zone core" data-layer-label="${escapeHtml(zones.core.label)}">
            <div class="layer-section">
                <div class="detail-label">What</div>
                <div class="detail-content">${escapeHtml(zones.core.what)}</div>
            </div>
            <div class="layer-section">
                <div class="detail-label">Why</div>
                <div class="detail-content">${escapeHtml(zones.core.why)}</div>
            </div>
            <div class="layer-section">
                <div class="detail-label">Syntax</div>
                <pre class="spl-example">${escapeHtml(zones.core.syntax)}</pre>
            </div>
            ${zones.core.example ? `
                <div class="layer-section">
                    <div class="spl-block">
                        <pre class="spl-code"><code>${escapeHtml(zones.core.example.spl)}</code></pre>
                    </div>
                    <p class="detail-content" style="margin-top: 0.5rem; font-size: 0.875rem;">${escapeHtml(zones.core.example.explanation)}</p>
                </div>
            ` : ''}
        </div>
    `;

    // Practical zone (moderate prominence)
    html += `
        <div class="layer-zone practical" data-layer-label="${escapeHtml(zones.practical.label)}">
    `;

    if (zones.practical.examples && zones.practical.examples.length > 0) {
        html += `
            <div class="layer-section">
                <div class="detail-label">More Examples</div>
                ${zones.practical.examples.map(ex => `
                    <div class="spl-block" style="margin-bottom: 0.5rem;">
                        <pre class="spl-code"><code>${escapeHtml(ex.spl)}</code></pre>
                    </div>
                    <p class="detail-content" style="margin-top: 0.25rem; margin-bottom: 0.75rem;">${escapeHtml(ex.explanation)}</p>
                `).join('')}
            </div>
        `;
    }

    if (zones.practical.gotchas && zones.practical.gotchas.length > 0) {
        html += `
            <div class="layer-section">
                <div class="detail-label">Watch Out</div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${zones.practical.gotchas.map(g => `<li style="padding-left: 1rem; margin-bottom: 0.25rem; position: relative;"><span style="position: absolute; left: 0; color: var(--splunk-amber);">!</span>${escapeHtml(g)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (zones.practical.commonUses && zones.practical.commonUses.length > 0) {
        html += `
            <div class="layer-section">
                <div class="detail-label">Common Uses</div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${zones.practical.commonUses.map(u => `<li style="padding-left: 1rem; margin-bottom: 0.25rem; position: relative;"><span style="position: absolute; left: 0; color: var(--splunk-teal);">→</span>${escapeHtml(u)}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    html += `</div>`;

    // Deep zone (subtle)
    html += `
        <div class="layer-zone deep" data-layer-label="${escapeHtml(zones.deep.label)}">
    `;

    if (zones.deep.advancedPatterns && zones.deep.advancedPatterns.length > 0) {
        html += `
            <div class="layer-section">
                <div class="detail-label">Advanced Patterns</div>
                ${zones.deep.advancedPatterns.map(p => `
                    <p style="font-weight: 500; margin-bottom: 0.25rem;">${escapeHtml(p.name)}</p>
                    <div class="spl-block" style="margin-bottom: 0.25rem;">
                        <pre class="spl-code"><code>${escapeHtml(p.spl)}</code></pre>
                    </div>
                    <p class="detail-content" style="margin-top: 0.25rem; margin-bottom: 0.75rem;">${escapeHtml(p.explanation)}</p>
                `).join('')}
            </div>
        `;
    }

    if (zones.deep.performance) {
        html += `
            <div class="layer-section">
                <div class="detail-label">Performance</div>
                <div class="detail-content">${escapeHtml(zones.deep.performance)}</div>
            </div>
        `;
    }

    if (zones.deep.internals) {
        html += `
            <div class="layer-section">
                <div class="detail-label">Internals</div>
                <div class="detail-content">${escapeHtml(zones.deep.internals)}</div>
            </div>
        `;
    }

    if (zones.deep.vsAlternatives) {
        html += `
            <div class="layer-section">
                <div class="detail-label">vs. Alternatives</div>
                ${Object.entries(zones.deep.vsAlternatives).map(([cmd, desc]) => `
                    <div style="margin-bottom: 0.5rem;">
                        <code>${escapeHtml(cmd)}</code>
                        <span class="detail-content"> — ${escapeHtml(desc)}</span>
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
                    ${entry.relatedCommands.map(c => `<code>${escapeHtml(c)}</code>`).join(', ')}
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
