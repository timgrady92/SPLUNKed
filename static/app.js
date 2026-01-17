/**
 * SPLUNKed - Core Application JavaScript
 * Handles sidebar, navigation, tabs, and common utilities
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initKeyboardShortcuts();
    initCopyButtons();
    applySPLHighlighting();
});

/**
 * Sidebar Management
 */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (!sidebar) return;

    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', openSidebar);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebar);
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

/**
 * Tab Management
 */
function initTabs(containerSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const tabs = container.querySelectorAll('.category-tab');
    // Panels are siblings of the container, not children, so search in document
    const panels = document.querySelectorAll('.tab-panel');
    const storageKey = options.storageKey || null;

    // Restore saved tab if available
    if (storageKey) {
        const savedTab = localStorage.getItem(storageKey);
        if (savedTab) {
            activateTab(savedTab);
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            activateTab(category);

            if (storageKey) {
                localStorage.setItem(storageKey, category);
            }

            if (options.onTabChange) {
                options.onTabChange(category);
            }
        });
    });

    function activateTab(category) {
        tabs.forEach(t => {
            t.classList.toggle('active', t.dataset.category === category);
            t.setAttribute('aria-selected', t.dataset.category === category);
        });

        panels.forEach(p => {
            const isActive = p.id === `${category}Panel`;
            p.classList.toggle('active', isActive);
            p.hidden = !isActive;
        });
    }

    return { activateTab };
}

/**
 * Keyboard Shortcuts
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Skip if user is typing in an input
        if (e.target.matches('input, textarea, select')) return;

        switch (e.key) {
            case '/':
                // Focus search input
                e.preventDefault();
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                }
                break;

            case '?':
                // Toggle sidebar (help)
                e.preventDefault();
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('open');
                    document.getElementById('sidebarOverlay')?.classList.toggle('visible');
                }
                break;
        }
    });
}

/**
 * Search Functionality
 */
function initSearch(inputId, options = {}) {
    const input = document.getElementById(inputId);
    const clearBtn = document.getElementById(`${inputId}Clear`);

    if (!input) return;

    let debounceTimer;
    const debounceMs = options.debounce || 200;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (options.onSearch) {
                options.onSearch(input.value.toLowerCase().trim());
            }
        }, debounceMs);
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            input.focus();
            if (options.onSearch) {
                options.onSearch('');
            }
        });
    }

    // Focus on / key
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            input.focus();
        }
    });

    return {
        getValue: () => input.value.toLowerCase().trim(),
        setValue: (val) => { input.value = val; },
        clear: () => {
            input.value = '';
            if (options.onSearch) {
                options.onSearch('');
            }
        }
    };
}

/**
 * Filter Dropdown
 */
function initFilter(selectId, options = {}) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.addEventListener('change', () => {
        if (options.onChange) {
            options.onChange(select.value);
        }
    });

    return {
        getValue: () => select.value,
        setValue: (val) => { select.value = val; }
    };
}

/**
 * View Toggle (Grid/List)
 */
function initViewToggle(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const buttons = container.querySelectorAll('.view-btn');
    const storageKey = options.storageKey || 'splunked-view';

    // Restore saved view
    const savedView = localStorage.getItem(storageKey);
    if (savedView) {
        activateView(savedView);
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            activateView(view);
            localStorage.setItem(storageKey, view);

            if (options.onViewChange) {
                options.onViewChange(view);
            }
        });
    });

    function activateView(view) {
        buttons.forEach(b => {
            b.classList.toggle('active', b.dataset.view === view);
        });
    }

    return {
        getView: () => {
            const active = container.querySelector('.view-btn.active');
            return active ? active.dataset.view : 'categorized';
        }
    };
}

/**
 * Copy to Clipboard
 */
function initCopyButtons() {
    document.addEventListener('click', async (e) => {
        const copyBtn = e.target.closest('.spl-copy');
        if (!copyBtn) return;

        const block = copyBtn.closest('.spl-block');
        const code = block?.querySelector('code');

        if (code) {
            try {
                await navigator.clipboard.writeText(code.textContent);
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    });
}

/**
 * Modal Management
 */
function openModal(modalId) {
    const overlay = document.getElementById(`${modalId}Overlay`);
    if (overlay) {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const overlay = document.getElementById(`${modalId}Overlay`);
    if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function initModal(modalId) {
    const overlay = document.getElementById(`${modalId}Overlay`);
    const modal = document.getElementById(modalId);

    if (!overlay || !modal) return;

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(modalId);
        }
    });

    // Close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modalId));
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) {
            closeModal(modalId);
        }
    });

    return {
        open: () => openModal(modalId),
        close: () => closeModal(modalId)
    };
}

/**
 * Progressive Disclosure
 */
function initDisclosure(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.addEventListener('click', (e) => {
        const header = e.target.closest('.disclosure-header');
        if (!header) return;

        const section = header.closest('.disclosure-section');
        if (section) {
            section.classList.toggle('expanded');
            header.setAttribute('aria-expanded', section.classList.contains('expanded'));
        }
    });
}

/**
 * SPL Syntax Highlighting
 */
const SPL_SYNTAX = {
    keywords: [
        'AND', 'OR', 'NOT', 'BY', 'AS', 'WHERE', 'IN', 'OVER', 'OUTPUT',
        'OUTPUTNEW', 'TRUE', 'FALSE', 'NULL'
    ],
    commands: [
        'abstract', 'accum', 'addcoltotals', 'addinfo', 'addtotals', 'analyzefields',
        'anomalies', 'anomalousvalue', 'anomalydetection', 'append', 'appendcols',
        'appendpipe', 'arules', 'associate', 'audit', 'autoregress', 'bin', 'bucket',
        'bucketdir', 'chart', 'cluster', 'cofilter', 'collect', 'concurrency',
        'contingency', 'convert', 'correlate', 'datamodel', 'dbinspect', 'dedup',
        'delete', 'delta', 'diff', 'erex', 'eval', 'eventcount', 'eventstats',
        'extract', 'fieldformat', 'fields', 'fieldsummary', 'filldown', 'fillnull',
        'findtypes', 'folderize', 'foreach', 'format', 'from', 'gauge', 'gentimes',
        'geom', 'geomfilter', 'geostats', 'head', 'highlight', 'history', 'iconify',
        'input', 'inputcsv', 'inputlookup', 'iplocation', 'join', 'kmeans', 'kvform',
        'loadjob', 'localize', 'localop', 'lookup', 'makecontinuous', 'makemv',
        'makeresults', 'map', 'metadata', 'metasearch', 'multikv', 'multisearch',
        'mvcombine', 'mvexpand', 'nomv', 'outlier', 'outputcsv', 'outputlookup',
        'outputtext', 'overlap', 'pivot', 'predict', 'rangemap', 'rare', 'regex',
        'relevancy', 'reltime', 'rename', 'replace', 'require', 'rest', 'return',
        'reverse', 'rex', 'rtorder', 'run', 'savedsearch', 'script', 'scrub',
        'search', 'searchtxn', 'selfjoin', 'sendemail', 'set', 'setfields', 'sichart',
        'sirare', 'sistats', 'sitimechart', 'sitop', 'sort', 'spath', 'stats',
        'strcat', 'streamstats', 'table', 'tags', 'tail', 'timechart', 'timewrap',
        'top', 'transaction', 'transpose', 'trendline', 'tscollect', 'tstats',
        'typeahead', 'typelearner', 'typer', 'union', 'uniq', 'untable', 'where',
        'x11', 'xmlkv', 'xmlunescape', 'xpath', 'xyseries'
    ],
    functions: [
        // Aggregate functions
        'avg', 'count', 'dc', 'distinct_count', 'estdc', 'estdc_error', 'exactperc',
        'first', 'last', 'list', 'max', 'mean', 'median', 'min', 'mode', 'perc',
        'percint', 'range', 'rate', 'stdev', 'stdevp', 'sum', 'sumsq', 'upperperc',
        'values', 'var', 'varp',
        // Eval functions
        'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'case',
        'ceiling', 'ceil', 'cidrmatch', 'coalesce', 'commands', 'cos', 'cosh',
        'exact', 'exp', 'floor', 'hypot', 'if', 'in', 'isbool', 'isint', 'isnotnull',
        'isnull', 'isnum', 'isstr', 'len', 'like', 'ln', 'log', 'lower', 'ltrim',
        'match', 'max', 'md5', 'min', 'mvappend', 'mvcount', 'mvdedup', 'mvfilter',
        'mvfind', 'mvindex', 'mvjoin', 'mvrange', 'mvsort', 'mvzip', 'now', 'null',
        'nullif', 'pi', 'pow', 'printf', 'random', 'relative_time', 'replace',
        'round', 'rtrim', 'searchmatch', 'sha1', 'sha256', 'sha512', 'sigfig', 'sin',
        'sinh', 'spath', 'split', 'sqrt', 'strftime', 'strptime', 'substr', 'tan',
        'tanh', 'time', 'tonumber', 'tostring', 'trim', 'typeof', 'upper', 'urldecode',
        'validate', 'true', 'false'
    ],
    commonFields: [
        '_time', '_raw', '_indextime', 'host', 'source', 'sourcetype', 'index',
        'linecount', 'splunk_server', 'punct', 'eventtype', 'tag', 'src', 'dest',
        'src_ip', 'dest_ip', 'src_port', 'dest_port', 'user', 'action', 'status',
        'bytes', 'duration', 'EventCode', 'EventID', 'Computer', 'Message'
    ]
};

function highlightSPL(code) {
    if (!code) return code;

    // Escape HTML to prevent XSS
    // After this: < becomes &lt;, > becomes &gt;
    let highlighted = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Highlight strings (double-quoted) - do this early to protect content inside strings
    highlighted = highlighted.replace(
        /"([^"]*?)"/g,
        '<span class="spl-string">"$1"</span>'
    );

    // Highlight strings (single-quoted)
    highlighted = highlighted.replace(
        /'([^']*?)'/g,
        '<span class="spl-string">\'$1\'</span>'
    );

    // Highlight comparison operators BEFORE adding any HTML tags
    // Match the escaped versions: &lt; &gt; and also = != ==
    highlighted = highlighted.replace(
        /(&lt;=?|&gt;=?|!=|==)/g,
        '<span class="spl-operator">$1</span>'
    );

    // Highlight the pipe operator
    highlighted = highlighted.replace(
        /(\|)/g,
        '<span class="spl-operator">$1</span>'
    );

    // Highlight commands (after | or at start)
    const cmdPattern = new RegExp(
        `(^|\\|\\s*)(${SPL_SYNTAX.commands.join('|')})\\b`,
        'gim'
    );
    highlighted = highlighted.replace(cmdPattern, '$1<span class="spl-command">$2</span>');

    // Highlight functions (word followed by parenthesis)
    const funcPattern = new RegExp(
        `\\b(${SPL_SYNTAX.functions.join('|')})\\s*\\(`,
        'gi'
    );
    highlighted = highlighted.replace(funcPattern, '<span class="spl-function">$1</span>(');

    // Highlight keywords
    const kwPattern = new RegExp(
        `\\b(${SPL_SYNTAX.keywords.join('|')})\\b`,
        'g'
    );
    highlighted = highlighted.replace(kwPattern, '<span class="spl-keyword">$1</span>');

    // Highlight common fields (when followed by = or comparison operators)
    // Match against escaped comparison operators
    const fieldPattern = new RegExp(
        `\\b(${SPL_SYNTAX.commonFields.join('|')})\\b(?=\\s*[=!]|\\s*&lt;|\\s*&gt;)`,
        'g'
    );
    highlighted = highlighted.replace(fieldPattern, '<span class="spl-field">$1</span>');

    // Highlight index, sourcetype, source, host at search start
    highlighted = highlighted.replace(
        /\b(index|sourcetype|source|host)\s*=/gi,
        '<span class="spl-field">$1</span>='
    );

    // Highlight numbers (but not inside HTML entities like &amp; or &#123;)
    highlighted = highlighted.replace(
        /(?<!&[#a-z]*)(\b\d+(?:\.\d+)?\b)/gi,
        '<span class="spl-number">$1</span>'
    );

    // Highlight single = for assignment (but avoid matching inside our span attributes)
    // Only match = that is NOT part of class=" or other HTML attributes
    highlighted = highlighted.replace(
        /(?<![a-zA-Z"])=(?!=)(?!")/g,
        '<span class="spl-operator">=</span>'
    );

    return highlighted;
}

/**
 * Apply SPL highlighting to all code blocks on the page
 */
function applySPLHighlighting(container = document) {
    // Select all SPL code blocks
    const selectors = [
        '.spl-code code',
        '.spl-example',
        'pre.spl-example',
        '.spl-block code'
    ];

    const codeBlocks = container.querySelectorAll(selectors.join(', '));

    codeBlocks.forEach(block => {
        // Skip if already highlighted
        if (block.dataset.splHighlighted) return;

        // Get the original text content
        const originalCode = block.textContent;

        // Apply highlighting
        block.innerHTML = highlightSPL(originalCode);

        // Mark as highlighted
        block.dataset.splHighlighted = 'true';
    });
}

/**
 * Local Storage Helpers
 */
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`splunked-${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(`splunked-${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },

    remove(key) {
        localStorage.removeItem(`splunked-${key}`);
    }
};

/**
 * Debounce utility
 */
function debounce(fn, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            fn(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Export utilities for use in other modules
 */
window.SPLUNKed = {
    initTabs,
    initSearch,
    initFilter,
    initViewToggle,
    initModal,
    initDisclosure,
    openModal,
    closeModal,
    highlightSPL,
    applySPLHighlighting,
    storage,
    debounce
};
