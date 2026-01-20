/**
 * SPLUNKed - Splunk Knowledge Data and Logic
 * Contains: fundamentals (concepts, fields, extractions, macros, engineering), CIM, antipatterns
 */
(function() {
'use strict';

// ============================================
// Category Descriptions
// ============================================

const CATEGORY_INFO = {
    concepts: {
        title: 'Splunk Concepts',
        description: 'Core concepts: indexes, events, fields, search pipelines, and how Splunk processes data.'
    },
    fields: {
        title: 'Common Fields',
        description: 'Internal fields (_time, _raw) and standard fields (host, source, sourcetype) present across events.'
    },
    extractions: {
        title: 'Field Extractions',
        description: 'Techniques to parse structured data from raw event text using regex and built-in parsers.'
    },
    macros: {
        title: 'Macros & Lookups',
        description: 'Reusable search snippets (macros) and external data enrichment (lookups).'
    },
    engineering: {
        title: 'Splunk Engineering',
        description: 'Configuration files, architecture, deployment, and administration fundamentals.'
    },
    enterpriseSecurity: {
        title: 'Enterprise Security',
        description: 'Splunk ES features: Risk-Based Alerting, Notable Events, Asset/Identity Framework, and Threat Intelligence.'
    },
    cim: {
        title: 'CIM & Data Models',
        description: 'Normalize data across sources with Common Information Model fields and accelerated data models.'
    },
    antipatterns: {
        title: 'Pitfalls',
        description: 'Common mistakes that cause slow searches, memory issues, or incorrect results at scale.'
    }
};

// ============================================
// Tab Consolidation Mapping (3 tabs)
// ============================================

const TAB_CATEGORY_MAP = {
    fundamentals: ['concepts', 'fields', 'extractions', 'macros', 'engineering'],
    enterpriseSecurity: ['enterpriseSecurity'],
    cim: ['cim'],
    antipatterns: ['antipatterns']
};

const TAB_INFO = {
    fundamentals: {
        title: 'Fundamentals',
        description: 'Core Splunk concepts, fields, extraction techniques, macros, and engineering fundamentals.'
    },
    enterpriseSecurity: CATEGORY_INFO.enterpriseSecurity,
    cim: CATEGORY_INFO.cim,
    antipatterns: CATEGORY_INFO.antipatterns
};

// Map from source categories to their parent tab
const CATEGORY_TO_TAB = {};
Object.entries(TAB_CATEGORY_MAP).forEach(([tab, categories]) => {
    categories.forEach(cat => CATEGORY_TO_TAB[cat] = tab);
});

// Subcategory labels for merged tabs
const SUBCATEGORY_LABELS = {
    concepts: 'Concept',
    fields: 'Field',
    extractions: 'Extraction',
    macros: 'Macro/Lookup',
    engineering: 'Engineering',
    cim: 'CIM/Data Model',
    // ES subcategories
    rba: 'Risk-Based Alerting',
    notable: 'Notable Events',
    assetIdentity: 'Asset & Identity',
    threatIntel: 'Threat Intel',
    detection: 'Detection',
    operations: 'Operations'
};

// ES subcategory groupings for filtering
const ES_SUBCATEGORIES = {
    rba: 'Risk-Based Alerting',
    notable: 'Notable Events',
    assetIdentity: 'Asset & Identity',
    threatIntel: 'Threat Intel',
    detection: 'Detection',
    operations: 'Operations'
};

// ============================================
// References Data
// ============================================

let REFERENCE_DATA = {};

// ============================================
// Splunk Knowledge Page Logic
// ============================================

let currentCategory = 'fundamentals';
let currentSearch = '';
let currentView = 'categorized';

// Single-select filter states (empty Set = show all)
let fundamentalsFilters = new Set();
let esFilters = new Set();

document.addEventListener('DOMContentLoaded', () => {
    initReferences().catch((error) => {
        console.error('Failed to initialize references:', error);
    });
});

async function initReferences() {
    if (window.SPLUNKed?.loadReferencesData) {
        const data = await SPLUNKed.loadReferencesData();
        REFERENCE_DATA = data || {};
    } else if (window.REFERENCE_DATA) {
        REFERENCE_DATA = window.REFERENCE_DATA;
    }

    // Sort all entries alphabetically
    Object.keys(REFERENCE_DATA).forEach((category) => {
        REFERENCE_DATA[category].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    });

    // Export data for global search
    window.REFERENCE_DATA = REFERENCE_DATA;
    window.REF_TAB_CATEGORY_MAP = TAB_CATEGORY_MAP;
    window.REF_CATEGORY_TO_TAB = CATEGORY_TO_TAB;

    // Initialize tabs
    const storageKey = 'splunked-references-tab';
    const tabController = SPLUNKed.initTabs('#referencesTabs', {
        storageKey: storageKey,
        onTabChange: (category) => {
            currentCategory = category;
            renderReferences();
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
        const savedTab = localStorage.getItem(storageKey);
        if (savedTab && TAB_CATEGORY_MAP[savedTab]) {
            currentCategory = savedTab;
        }
    }

    // Initialize search
    SPLUNKed.initSearch('referencesSearch', {
        onSearch: (query) => {
            currentSearch = query;
            renderReferences();
        }
    });

    // Initialize view toggle
    SPLUNKed.initViewToggle('referencesView', {
        storageKey: 'splunked-references-view',
        onViewChange: (view) => {
            currentView = view;
            renderReferences();
        }
    });

    // Initialize icon filters
    SPLUNKed.initIconFilter('fundamentalsFilter', {
        filterSet: fundamentalsFilters,
        onChange: () => renderReferences()
    });
    SPLUNKed.initIconFilter('enterpriseSecurityFilter', {
        filterSet: esFilters,
        onChange: () => renderReferences()
    });

    // Initialize modal
    SPLUNKed.initModal('referencesModal');

    // Render initial content
    renderAllCategories();

    // Add click handlers for cards
    document.addEventListener('click', handleCardClick);

    // Open specific entry if requested via URL
    if (openId) {
        const entry = findEntryById(openId);
        if (entry) {
            setTimeout(() => openDetailModal(entry), 100);
        }
    }
}

function renderAllCategories() {
    Object.keys(TAB_CATEGORY_MAP).forEach(tabCategory => {
        renderCategoryGrid(tabCategory);
    });
}

function renderReferences() {
    renderCategoryGrid(currentCategory);
}

function renderCategoryGrid(tabCategory) {
    const gridId = `${tabCategory}Grid`;
    const infoId = `${tabCategory}Info`;
    const grid = document.getElementById(gridId);
    const infoContainer = document.getElementById(infoId);

    if (!grid) return;

    // Get all source categories for this tab
    const sourceCategories = TAB_CATEGORY_MAP[tabCategory] || [tabCategory];

    // Render category info
    if (infoContainer) {
        const tabInfo = TAB_INFO[tabCategory] || CATEGORY_INFO[tabCategory];
        if (tabInfo) {
            infoContainer.innerHTML = `
                <h2 class="category-title">${tabInfo.title}</h2>
                <p class="category-description">${tabInfo.description}</p>
            `;
        }
    }

    // Get the filter set for this tab
    let filterSet = new Set();
    if (tabCategory === 'fundamentals') filterSet = fundamentalsFilters;
    if (tabCategory === 'enterpriseSecurity') filterSet = esFilters;

    // Collect and filter entries from all source categories
    let allEntries = [];
    sourceCategories.forEach(cat => {
        const entries = REFERENCE_DATA[cat] || [];
        entries.forEach(entry => {
            allEntries.push({ ...entry, _sourceCategory: cat });
        });
    });

    // Apply search filter
    if (currentSearch) {
        const query = currentSearch.toLowerCase();
        allEntries = allEntries.filter(entry => {
            return entry.name.toLowerCase().includes(query) ||
                   entry.takeaway?.toLowerCase().includes(query) ||
                   entry.what?.toLowerCase().includes(query);
        });
    }

    // Apply icon filter based on tab type
    if (filterSet.size > 0) {
        if (tabCategory === 'fundamentals') {
            allEntries = allEntries.filter(entry => filterSet.has(entry._sourceCategory));
        } else if (tabCategory === 'enterpriseSecurity') {
            // ES uses subcategory field for filtering
            allEntries = allEntries.filter(entry => filterSet.has(entry.subcategory));
        }
    }

    // Sort
    if (currentView === 'alphabetical') {
        allEntries.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }

    // Render
    if (allEntries.length === 0) {
        grid.innerHTML = '';
        document.getElementById('emptyState')?.classList.remove('hidden');
    } else {
        document.getElementById('emptyState')?.classList.add('hidden');

        const showSubcategory = sourceCategories.length > 1 && currentView === 'alphabetical';
        grid.innerHTML = allEntries.map(entry => createCardHTML(entry, showSubcategory)).join('');
    }
}

// Unified icon mapping for all card categories
const CARD_ICONS = {
    fields: { icon: '⬚', label: 'Field' },
    concepts: { icon: '◆', label: 'Concept' },
    cim: { icon: '⧉', label: 'CIM' },
    extractions: { icon: '⋔', label: 'Extraction' },
    macros: { icon: '{ }', label: 'Macro' },
    engineering: { icon: '⚙', label: 'Engineering' },
    antipatterns: { icon: '⚠', label: 'Pitfall' },
    // ES subcategories
    enterpriseSecurity: { icon: '⛨', label: 'Enterprise Security' },
    rba: { icon: '⚡', label: 'RBA' },
    notable: { icon: '◉', label: 'Notable' },
    assetIdentity: { icon: '◎', label: 'Asset/Identity' },
    threatIntel: { icon: '⊛', label: 'Threat Intel' },
    detection: { icon: '◇', label: 'Detection' },
    operations: { icon: '⚙', label: 'Operations' }
};


function createCardHTML(entry, showSubcategory = false) {
    const entryCategory = entry._sourceCategory || entry.category;
    // For ES entries, use subcategory for icon if it has one in CARD_ICONS; otherwise use category
    const iconKey = (entry.subcategory && CARD_ICONS[entry.subcategory]) ? entry.subcategory : entryCategory;

    let cardIcon = '';
    if (CARD_ICONS[iconKey]) {
        const { icon, label } = CARD_ICONS[iconKey];
        cardIcon = `<span class="card-icon ${iconKey}" title="${label}">${icon}</span>`;
    }

    return `
        <div class="glossary-card" data-id="${entry.id}" data-category="${entry.category}">
            ${cardIcon}
            <div class="glossary-card-header">
                <code class="glossary-name">${SPLUNKed.escapeHtml(entry.name)}</code>
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
    const entry = REFERENCE_DATA[category]?.find(e => e.id === id);

    if (entry) {
        cardHistory = [];
        currentCardEntry = null;
        openDetailModal(entry);
    }
}

function findEntryById(id) {
    for (const category of Object.keys(REFERENCE_DATA)) {
        const entry = REFERENCE_DATA[category].find(e => e.id === id);
        if (entry) return entry;
    }
    return null;
}

function openDetailModal(entry) {
    const title = document.getElementById('referencesModalTitle');
    const content = document.getElementById('referencesModalContent');
    const backBtn = document.getElementById('referencesModalBack');

    currentCardEntry = entry;
    title.textContent = entry.name;

    if (backBtn) {
        backBtn.hidden = cardHistory.length === 0;
    }

    content.innerHTML = createConceptHTML(entry);
    initConceptLinks(content);

    SPLUNKed.applySPLHighlighting(content);
    SPLUNKed.openModal('referencesModal');
}

function goBackCard() {
    if (cardHistory.length > 0) {
        const previousEntry = cardHistory.pop();
        openDetailModal(previousEntry);
    }
}

// Initialize back button
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('referencesModalBack');
    if (backBtn) {
        backBtn.addEventListener('click', goBackCard);
    }
});

function createConceptHTML(entry) {
    let html = '<div class="concept-detail">';

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
                <div class="tabbed-section-header">WHY</div>
                <div class="tabbed-section-content">${SPLUNKed.escapeHtml(entry.why)}</div>
            </div>
        `;
    }

    // KEY POINT section
    if (entry.keyPoint) {
        html += `
            <div class="tabbed-section section-key">
                <div class="tabbed-section-header">KEY POINT</div>
                <div class="tabbed-section-content"><strong>${SPLUNKed.escapeHtml(entry.keyPoint)}</strong></div>
            </div>
        `;
    }

    // SYNTAX section (code block for actual SPL)
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

    // SYNTAX NOTE section (plain text for patterns/descriptions)
    if (entry.syntaxNote) {
        html += `
            <div class="tabbed-section section-syntax">
                <div class="tabbed-section-header">USAGE</div>
                <div class="tabbed-section-content">
                    <p class="syntax-note">${SPLUNKed.escapeHtml(entry.syntaxNote)}</p>
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

    // GOTCHAS section
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

    // Footer with Related commands
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
            const concept = REFERENCE_DATA.concepts?.find(c => c.id === id);
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
            const concept = REFERENCE_DATA.concepts?.find(c => c.id === conceptId);
            if (concept) {
                if (currentCardEntry) {
                    cardHistory.push(currentCardEntry);
                }
                openDetailModal(concept);
            }
        });
    });
}

})();
