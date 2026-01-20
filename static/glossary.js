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

let GLOSSARY_DATA = {};

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
        initGlossary().catch((error) => {
            console.error('Failed to initialize glossary:', error);
        });
    }
});

async function initGlossary() {
    if (window.SPLUNKed?.loadGlossaryData) {
        const data = await SPLUNKed.loadGlossaryData();
        GLOSSARY_DATA = data || {};
    } else if (window.GLOSSARY_DATA) {
        GLOSSARY_DATA = window.GLOSSARY_DATA;
    }

    Object.keys(GLOSSARY_DATA).forEach((category) => {
        GLOSSARY_DATA[category].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    });

    // Export glossary data for global search and the SPL sidebar
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
    SPLUNKed.initIconFilter('commandsFilter', {
        filterSet: commandFilters,
        onChange: () => renderGlossary()
    });
    SPLUNKed.initIconFilter('functionsFilter', {
        filterSet: functionFilters,
        onChange: () => renderGlossary()
    });

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
