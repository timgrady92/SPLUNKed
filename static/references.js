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

// Subcategory labels - use centralized definitions
const getSubcategoryLabel = (cat) => window.SPLUNKed?.SUBCATEGORY_LABELS?.[cat] || cat;

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

// Unified state management - single source of truth
let state = null;

function initState() {
    if (state) return state;

    if (!window.SPLUNKed?.createFeatureState) {
        console.warn('SPLUNKed.createFeatureState not available, using fallback state');
        // Fallback simple state implementation
        const stateObj = {
            category: 'fundamentals',
            search: '',
            view: 'categorized',
            fundamentalsFilters: [],
            esFilters: []
        };
        state = {
            get: (key) => key ? stateObj[key] : { ...stateObj },
            set: (keyOrObj, value) => {
                if (typeof keyOrObj === 'string') {
                    stateObj[keyOrObj] = value;
                } else {
                    Object.assign(stateObj, keyOrObj);
                }
            }
        };
        return state;
    }

    state = window.SPLUNKed.createFeatureState({
        category: 'fundamentals',
        search: '',
        view: 'categorized',
        fundamentalsFilters: [],
        esFilters: []
    }, {
        storageKey: 'references',
        persistKeys: ['category', 'view']
    });

    return state;
}

// State accessors
const getCategory = () => state?.get('category') || 'fundamentals';
const getSearch = () => state?.get('search') || '';
const getView = () => state?.get('view') || 'categorized';
const getFundamentalsFilters = () => new Set(state?.get('fundamentalsFilters') || []);
const getEsFilters = () => new Set(state?.get('esFilters') || []);

// Mutable filter sets for initIconFilter compatibility (synced with state)
let fundamentalsFilters = new Set();
let esFilters = new Set();

document.addEventListener('DOMContentLoaded', () => {
    initReferences().catch((error) => {
        console.error('Failed to initialize references:', error);
    });
});

async function initReferences() {
    initState();

    // Restore filter sets from state
    const savedFundamentals = state?.get('fundamentalsFilters') || [];
    const savedEs = state?.get('esFilters') || [];
    savedFundamentals.forEach(f => fundamentalsFilters.add(f));
    savedEs.forEach(f => esFilters.add(f));

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
            state?.set('category', category);
            renderReferences();
        }
    });

    // Handle URL parameters for deep linking
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');
    const openId = params.get('open');

    if (urlTab && TAB_CATEGORY_MAP[urlTab]) {
        state?.set('category', urlTab);
        if (tabController) {
            tabController.activateTab(urlTab);
        }
    }

    // Initialize search
    SPLUNKed.initSearch('referencesSearch', {
        onSearch: (query) => {
            state?.set('search', query);
            renderReferences();
        }
    });

    // Initialize view toggle
    SPLUNKed.initViewToggle('referencesView', {
        storageKey: 'splunked-references-view',
        onViewChange: (view) => {
            state?.set('view', view);
            renderReferences();
        }
    });

    // Initialize icon filters (sync local sets with state on change)
    SPLUNKed.initIconFilter('fundamentalsFilter', {
        filterSet: fundamentalsFilters,
        onChange: () => {
            state?.set('fundamentalsFilters', [...fundamentalsFilters]);
            renderReferences();
        }
    });
    SPLUNKed.initIconFilter('enterpriseSecurityFilter', {
        filterSet: esFilters,
        onChange: () => {
            state?.set('esFilters', [...esFilters]);
            renderReferences();
        }
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
    renderCategoryGrid(getCategory());
}

function renderCategoryGrid(tabCategory) {
    const grid = document.getElementById(`${tabCategory}Grid`);
    const infoContainer = document.getElementById(`${tabCategory}Info`);

    if (!grid) return;

    const sourceCategories = TAB_CATEGORY_MAP[tabCategory] || [tabCategory];
    const search = getSearch();
    const view = getView();

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
    const filterSet = tabCategory === 'fundamentals' ? getFundamentalsFilters() :
                      tabCategory === 'enterpriseSecurity' ? getEsFilters() :
                      new Set();

    // Collect entries from all source categories
    let allEntries = [];
    sourceCategories.forEach(cat => {
        const entries = REFERENCE_DATA[cat] || [];
        entries.forEach(entry => {
            allEntries.push({ ...entry, _sourceCategory: cat });
        });
    });

    // Apply search filter
    if (search) {
        const query = search.toLowerCase();
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
            allEntries = allEntries.filter(entry => filterSet.has(entry.subcategory));
        }
    }

    // Sort
    if (view === 'alphabetical') {
        allEntries.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }

    // Render
    const hasContent = allEntries.length > 0;
    const showSubcategory = sourceCategories.length > 1 && view === 'alphabetical';
    grid.innerHTML = hasContent
        ? allEntries.map(entry => createCardHTML(entry, showSubcategory)).join('')
        : '';

    SPLUNKed.showEmptyState('emptyState', hasContent);
}

/**
 * Create card HTML using shared component
 */
function createCardHTML(entry, showSubcategory = false) {
    return SPLUNKed.components.createCard(entry, {
        variant: 'reference',
        showSubcategory,
        showIcon: true
    });
}

// Card navigation history
let cardHistory = [];
let currentCardEntry = null;

function handleCardClick(e) {
    const card = e.target.closest('.glossary-card');
    if (!card) return;

    const id = card.dataset.id;
    const category = card.dataset.category;

    // Try to find entry in specified category first
    let entry = REFERENCE_DATA[category]?.find(e => e.id === id);

    // Fallback: search all categories if not found
    if (!entry) {
        entry = findEntryById(id);
    }

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
    const getConceptName = (id) => {
        const concept = REFERENCE_DATA.concepts?.find(c => c.id === id);
        return concept ? concept.name : id.replace('concept_', '');
    };

    return SPLUNKed.components.createDetailContent(entry, { getConceptName });
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
