/**
 * SPLUNKed - Query Library
 * A curated collection of SPL queries for security analysts
 */

// ============================================
// Category Definitions
// ============================================

let QUERY_CATEGORIES = {}


// ============================================
// Query Library Data (~100 Queries)
// ============================================

let QUERY_LIBRARY = []


// ============================================
// UI State
// ============================================

let filteredQueries = [...QUERY_LIBRARY];
let currentRandomQuery = null;
let randomQueryHistory = [];
let randomQueryIndex = -1;

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initQueryLibrary().catch((error) => {
        console.error('Failed to initialize query library:', error);
    });
});

async function initQueryLibrary() {
    if (window.SPLUNKed?.loadQueryData) {
        const data = await SPLUNKed.loadQueryData();
        QUERY_CATEGORIES = data?.categories || {};
        QUERY_LIBRARY = data?.library || [];
    }

    window.QUERY_LIBRARY = QUERY_LIBRARY;
    window.QUERY_CATEGORIES = QUERY_CATEGORIES;

    filteredQueries = [...QUERY_LIBRARY];
    initializeFilters();
    renderQueryGrid();
    setupEventListeners();
    updateQueryCount();
}

// ============================================
// Filter Initialization
// ============================================

function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');

    // Populate category filter
    Object.entries(QUERY_CATEGORIES).forEach(([key, value]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${value.icon} ${value.name}`;
        categoryFilter.appendChild(option);
    });
}

// ============================================
// Rendering
// ============================================

function renderQueryGrid() {
    const grid = document.getElementById('queryGrid');
    const emptyState = document.getElementById('emptyState');

    if (filteredQueries.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = filteredQueries.map(query => createQueryCard(query)).join('');

    // Add click handlers
    grid.querySelectorAll('.query-card').forEach(card => {
        card.addEventListener('click', () => {
            const queryId = card.dataset.id;
            const query = QUERY_LIBRARY.find(q => q.id === queryId);
            if (query) showQueryModal(query);
        });
    });

    // Add copy handlers
    grid.querySelectorAll('.query-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const queryId = btn.closest('.query-card').dataset.id;
            const query = QUERY_LIBRARY.find(q => q.id === queryId);
            if (query) {
                if (window.SPLUNKed?.copyToClipboard) {
                    window.SPLUNKed.copyToClipboard(query.spl, btn);
                } else {
                    navigator.clipboard.writeText(query.spl).catch(err => {
                        console.error('Failed to copy:', err);
                    });
                }
            }
        });
    });
}

function createQueryCard(query) {
    const category = QUERY_CATEGORIES[query.category];

    // Get first 3 lines of SPL for preview
    const splLines = query.spl.split('\n');
    const splPreview = splLines.slice(0, 3).join('\n');
    const hasMoreLines = splLines.length > 3;

    // Apply syntax highlighting if available
    const highlightedPreview = window.SPLUNKed?.highlightSPL
        ? window.SPLUNKed.highlightSPL(splPreview)
        : SPLUNKed.escapeHtml(splPreview);

    // Build metadata badges
    const metadataBadges = [];
    if (query.dataSource) {
        metadataBadges.push(`<span class="query-meta-badge data-source" title="Data Source">${SPLUNKed.escapeHtml(query.dataSource)}</span>`);
    }
    if (query.mitre) {
        const mitreArray = Array.isArray(query.mitre) ? query.mitre : [query.mitre];
        mitreArray.forEach(technique => {
            metadataBadges.push(`<span class="query-meta-badge mitre" title="MITRE ATT&CK">${SPLUNKed.escapeHtml(technique)}</span>`);
        });
    }
    if (query.useCase) {
        metadataBadges.push(`<span class="query-meta-badge use-case" title="Use Case">${SPLUNKed.escapeHtml(query.useCase)}</span>`);
    }

    return `
        <div class="query-card" data-id="${query.id}" data-category="${query.category}" data-difficulty="${query.difficulty}">
            <div class="query-card-header">
                <span class="query-category-icon">${category.icon}</span>
                <span class="query-difficulty-badge ${query.difficulty}">${query.difficulty}</span>
            </div>
            <h3 class="query-card-title">${query.title}</h3>
            <p class="query-card-description">${query.description}</p>
            ${metadataBadges.length > 0 ? `<div class="query-card-meta">${metadataBadges.join('')}</div>` : ''}
            <div class="query-card-preview${hasMoreLines ? ' has-more' : ''}">
                <pre><code>${highlightedPreview}</code></pre>
            </div>
            <div class="query-card-footer">
                <div class="query-tags">
                    ${query.tags.slice(0, 3).map(tag => `<span class="query-tag">${tag}</span>`).join('')}
                </div>
                <button class="query-copy-btn" aria-label="Copy query">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

// ============================================
// Modal
// ============================================

function showQueryModal(query) {
    const overlay = document.getElementById('queryModalOverlay');
    const title = document.getElementById('queryModalTitle');
    const content = document.getElementById('queryModalContent');
    const category = QUERY_CATEGORIES[query.category];

    title.textContent = query.title;

    // Build metadata section
    const metadataItems = [];
    if (query.dataSource) {
        metadataItems.push(`
            <div class="modal-meta-item">
                <span class="modal-meta-label">Data Source</span>
                <span class="modal-meta-value data-source">${SPLUNKed.escapeHtml(query.dataSource)}</span>
            </div>
        `);
    }
    if (query.mitre) {
        const mitreArray = Array.isArray(query.mitre) ? query.mitre : [query.mitre];
        metadataItems.push(`
            <div class="modal-meta-item">
                <span class="modal-meta-label">MITRE ATT&CK</span>
                <span class="modal-meta-value mitre">${mitreArray.map(t => SPLUNKed.escapeHtml(t)).join(', ')}</span>
            </div>
        `);
    }
    if (query.useCase) {
        metadataItems.push(`
            <div class="modal-meta-item">
                <span class="modal-meta-label">Use Case</span>
                <span class="modal-meta-value use-case">${SPLUNKed.escapeHtml(query.useCase)}</span>
            </div>
        `);
    }

    content.innerHTML = `
        <div class="query-modal-meta">
            <span class="query-category-badge">${category.icon} ${category.name}</span>
            <span class="query-difficulty-badge ${query.difficulty}">${query.difficulty}</span>
        </div>

        <div class="query-modal-section">
            <h4>Description</h4>
            <p>${query.description}</p>
        </div>

        ${metadataItems.length > 0 ? `
        <div class="query-modal-section query-modal-metadata">
            <h4>Details</h4>
            <div class="modal-meta-grid">
                ${metadataItems.join('')}
            </div>
        </div>
        ` : ''}

        <div class="query-modal-section">
            <h4>SPL Query</h4>
            <div class="spl-block">
                <pre class="spl-code"><code>${window.SPLUNKed?.highlightSPL ? window.SPLUNKed.highlightSPL(query.spl) : SPLUNKed.escapeHtml(query.spl)}</code></pre>
                <button class="spl-copy modal-copy-btn" aria-label="Copy to clipboard">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="query-modal-section">
            <h4>Tags</h4>
            <div class="query-tags-full">
                ${query.tags.map(tag => `<span class="query-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;

    if (window.SPLUNKed?.openModal) {
        window.SPLUNKed.openModal('queryModal');
    } else {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (window.SPLUNKed?.closeModal) {
        window.SPLUNKed.closeModal('queryModal');
        return;
    }

    const overlay = document.getElementById('queryModalOverlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ============================================
// Random Query
// ============================================

function showRandomQuery() {
    const randomIndex = Math.floor(Math.random() * QUERY_LIBRARY.length);
    const query = QUERY_LIBRARY[randomIndex];

    // If we're not at the end of history, truncate forward history
    if (randomQueryIndex < randomQueryHistory.length - 1) {
        randomQueryHistory = randomQueryHistory.slice(0, randomQueryIndex + 1);
    }

    // Add to history and move index forward
    randomQueryHistory.push(query);
    randomQueryIndex = randomQueryHistory.length - 1;

    displayRandomQuery(query);
}

function displayRandomQuery(query) {
    currentRandomQuery = query;
    const category = QUERY_CATEGORIES[query.category];

    document.getElementById('randomQueryTitle').textContent = query.title;
    document.getElementById('randomQueryDescription').textContent = query.description;

    // Apply SPL syntax highlighting
    const splElement = document.getElementById('randomQuerySPL');
    if (window.SPLUNKed?.highlightSPL) {
        splElement.innerHTML = window.SPLUNKed.highlightSPL(query.spl);
    } else {
        splElement.textContent = query.spl;
    }

    document.getElementById('randomQueryCategory').textContent = `${category.icon} ${category.name}`;
    document.getElementById('randomQueryCategory').className = `query-category-badge`;
    document.getElementById('randomQueryDifficulty').textContent = query.difficulty;
    document.getElementById('randomQueryDifficulty').className = `query-difficulty-badge ${query.difficulty}`;

    document.getElementById('randomQueryDisplay').classList.remove('hidden');
    updateRandomNavButtons();
}

function goBackRandom() {
    if (randomQueryIndex > 0) {
        randomQueryIndex--;
        displayRandomQuery(randomQueryHistory[randomQueryIndex]);
    }
}

function goForwardRandom() {
    if (randomQueryIndex < randomQueryHistory.length - 1) {
        randomQueryIndex++;
        displayRandomQuery(randomQueryHistory[randomQueryIndex]);
    }
}

function updateRandomNavButtons() {
    const backBtn = document.getElementById('randomQueryBack');
    const forwardBtn = document.getElementById('randomQueryForward');

    if (backBtn) backBtn.disabled = randomQueryIndex <= 0;
    if (forwardBtn) forwardBtn.disabled = randomQueryIndex >= randomQueryHistory.length - 1;
}

function hideRandomQuery() {
    document.getElementById('randomQueryDisplay').classList.add('hidden');
    currentRandomQuery = null;
}

// ============================================
// Filtering
// ============================================

function applyFilters() {
    const searchTerm = document.getElementById('querySearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;

    filteredQueries = QUERY_LIBRARY.filter(query => {
        const matchesSearch = !searchTerm ||
            query.title.toLowerCase().includes(searchTerm) ||
            query.description.toLowerCase().includes(searchTerm) ||
            query.spl.toLowerCase().includes(searchTerm) ||
            query.tags.some(tag => tag.toLowerCase().includes(searchTerm));

        const matchesCategory = categoryFilter === 'all' || query.category === categoryFilter;
        const matchesDifficulty = difficultyFilter === 'all' || query.difficulty === difficultyFilter;

        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    renderQueryGrid();
    updateQueryCount();
}

function updateQueryCount() {
    document.getElementById('visibleCount').textContent = filteredQueries.length;
    document.getElementById('totalCount').textContent = QUERY_LIBRARY.length;
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Search
    if (window.SPLUNKed?.initSearch) {
        SPLUNKed.initSearch('querySearch', {
            debounce: 300,
            onSearch: () => applyFilters()
        });
    }

    // Filters
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('difficultyFilter').addEventListener('change', applyFilters);

    // Random query buttons
    document.getElementById('randomQueryBtn').addEventListener('click', showRandomQuery);
    document.getElementById('randomQueryClose').addEventListener('click', hideRandomQuery);
    document.getElementById('randomQueryAnother').addEventListener('click', showRandomQuery);
    document.getElementById('randomQueryBack').addEventListener('click', goBackRandom);
    document.getElementById('randomQueryForward').addEventListener('click', goForwardRandom);
    if (window.SPLUNKed?.initModal) {
        window.SPLUNKed.initModal('queryModal');
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            hideRandomQuery();
        }
    });
}
