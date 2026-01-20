/**
 * SPLUNKed - SPL Reference Sidebar
 * Global sidebar for quick SPL command/function lookup without leaving current page
 */

(function() {
    'use strict';

    let isOpen = false;
    let isLoaded = false;
    let glossaryData = null;
    let currentSearch = '';
    let currentEntry = null;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initSPLSidebar);

    function initSPLSidebar() {
        const trigger = document.getElementById('splSidebarTrigger');
        const sidebar = document.getElementById('splSidebar');
        const overlay = document.getElementById('splSidebarOverlay');
        const closeBtn = document.getElementById('splSidebarClose');
        const backBtn = document.getElementById('splSidebarBack');
        const searchInput = document.getElementById('splSidebarSearch');

        if (!trigger || !sidebar) return;

        // Toggle sidebar
        trigger.addEventListener('click', toggleSidebar);

        // Close handlers
        if (overlay) overlay.addEventListener('click', closeSidebar);
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);

        // Back button
        if (backBtn) backBtn.addEventListener('click', showList);

        // Search input
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.toLowerCase();
                renderList();
            });
        }

        // Keyboard shortcut: S when not typing in an input
        document.addEventListener('keydown', (e) => {
            // Close on Escape
            if (e.key === 'Escape' && isOpen) {
                closeSidebar();
                return;
            }

            // Open with S key when not typing
            if (e.key.toLowerCase() === 's' && !isTyping()) {
                e.preventDefault();
                toggleSidebar();
            }
        });
    }

    function isTyping() {
        const active = document.activeElement;
        return active && (
            active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.isContentEditable
        );
    }

    function toggleSidebar() {
        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    function openSidebar() {
        const sidebar = document.getElementById('splSidebar');
        const overlay = document.getElementById('splSidebarOverlay');

        sidebar.classList.add('open');
        overlay.classList.add('visible');
        isOpen = true;

        // Load data if not already loaded
        if (!isLoaded) {
            loadGlossaryData();
        }

        // Focus search input
        setTimeout(() => {
            const searchInput = document.getElementById('splSidebarSearch');
            if (searchInput) searchInput.focus();
        }, 100);
    }

    function closeSidebar() {
        const sidebar = document.getElementById('splSidebar');
        const overlay = document.getElementById('splSidebarOverlay');

        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        isOpen = false;
    }

    function loadGlossaryData() {
        const listContainer = document.getElementById('splSidebarList');

        // GLOSSARY_DATA should be available from glossary.js (loaded on all pages)
        if (window.GLOSSARY_DATA) {
            glossaryData = window.GLOSSARY_DATA;
            isLoaded = true;
            renderList();
        } else {
            listContainer.innerHTML = '<div class="spl-sidebar-error">SPL reference data not available. <br><a href="/glossary" style="color: var(--splunk-orange);">Go to Glossary</a></div>';
        }
    }

    function renderList() {
        const listContainer = document.getElementById('splSidebarList');
        const detailContainer = document.getElementById('splSidebarDetail');
        const backBtn = document.getElementById('splSidebarBack');

        // Show list, hide detail
        listContainer.classList.remove('hidden');
        detailContainer.classList.add('hidden');
        backBtn.classList.add('hidden');
        currentEntry = null;

        if (!glossaryData) return;

        // Collect all entries
        let allEntries = [];

        // Commands
        if (glossaryData.commands) {
            glossaryData.commands.forEach(entry => {
                allEntries.push({ ...entry, _type: 'command' });
            });
        }

        // Functions
        if (glossaryData.functions) {
            glossaryData.functions.forEach(entry => {
                allEntries.push({ ...entry, _type: 'function' });
            });
        }

        // Stats Functions
        if (glossaryData.statsFunctions) {
            glossaryData.statsFunctions.forEach(entry => {
                allEntries.push({ ...entry, _type: 'stats' });
            });
        }

        // Filter by search
        if (currentSearch) {
            allEntries = allEntries.filter(entry => {
                const searchText = `${entry.name} ${entry.takeaway || ''} ${entry.zones?.essential?.what || ''}`.toLowerCase();
                return searchText.includes(currentSearch);
            });
        }

        // Sort alphabetically
        allEntries.sort((a, b) => a.name.localeCompare(b.name));

        // Render
        if (allEntries.length === 0) {
            listContainer.innerHTML = `
                <div class="spl-sidebar-empty">
                    <p>No matches found</p>
                    <p class="spl-sidebar-empty-hint">Try a different search term</p>
                </div>
            `;
            return;
        }

        const typeIcons = {
            command: '|',
            function: 'f()',
            stats: 'Σ'
        };

        const typeLabels = {
            command: 'Command',
            function: 'Eval Function',
            stats: 'Stats Function'
        };

        listContainer.innerHTML = allEntries.map(entry => `
            <button class="spl-sidebar-item" data-id="${entry.id}" data-category="${entry.category}">
                <span class="spl-sidebar-item-icon ${entry._type}">${typeIcons[entry._type]}</span>
                <div class="spl-sidebar-item-content">
                    <code class="spl-sidebar-item-name">${SPLUNKed.escapeHtml(entry.name)}</code>
                    <span class="spl-sidebar-item-takeaway">${SPLUNKed.escapeHtml(entry.takeaway || '')}</span>
                </div>
                <span class="spl-sidebar-item-type">${typeLabels[entry._type]}</span>
            </button>
        `).join('');

        // Add click handlers
        listContainer.querySelectorAll('.spl-sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const category = item.dataset.category;
                const entry = glossaryData[category]?.find(e => e.id === id);
                if (entry) {
                    showDetail(entry);
                }
            });
        });
    }

    function showDetail(entry) {
        const listContainer = document.getElementById('splSidebarList');
        const detailContainer = document.getElementById('splSidebarDetail');
        const backBtn = document.getElementById('splSidebarBack');

        // Hide list, show detail
        listContainer.classList.add('hidden');
        detailContainer.classList.remove('hidden');
        backBtn.classList.remove('hidden');
        currentEntry = entry;

        // Build detail HTML
        const zones = entry.zones || {};
        const essential = zones.essential || {};

        let html = `
            <div class="spl-sidebar-detail-header">
                <code class="spl-sidebar-detail-name">${SPLUNKed.escapeHtml(entry.name)}</code>
                <p class="spl-sidebar-detail-takeaway">${SPLUNKed.escapeHtml(entry.takeaway || '')}</p>
            </div>
        `;

        // What it does
        if (essential.what) {
            html += `
                <div class="spl-sidebar-section">
                    <h4 class="spl-sidebar-section-title">What it does</h4>
                    <p>${SPLUNKed.escapeHtml(essential.what)}</p>
                </div>
            `;
        }

        // Why use it
        if (essential.why) {
            html += `
                <div class="spl-sidebar-section">
                    <h4 class="spl-sidebar-section-title">Why use it</h4>
                    <p>${SPLUNKed.escapeHtml(essential.why)}</p>
                </div>
            `;
        }

        // Syntax
        if (essential.syntax) {
            html += `
                <div class="spl-sidebar-section">
                    <h4 class="spl-sidebar-section-title">Syntax</h4>
                    <pre class="spl-sidebar-syntax"><code>${SPLUNKed.escapeHtml(essential.syntax)}</code></pre>
                </div>
            `;
        }

        // Example
        if (essential.example) {
            const example = essential.example;
            html += `
                <div class="spl-sidebar-section">
                    <h4 class="spl-sidebar-section-title">Example</h4>
                    <pre class="spl-sidebar-example"><code>${SPLUNKed.escapeHtml(example.spl)}</code></pre>
                    ${example.explanation ? `<p class="spl-sidebar-example-explanation">${SPLUNKed.escapeHtml(example.explanation)}</p>` : ''}
                </div>
            `;
        }

        // Gotchas from practical zone
        const practical = zones.practical || {};
        if (practical.gotchas && practical.gotchas.length > 0) {
            html += `
                <div class="spl-sidebar-section">
                    <h4 class="spl-sidebar-section-title">Watch out for</h4>
                    <ul class="spl-sidebar-gotchas">
                        ${practical.gotchas.map(g => `<li>${SPLUNKed.escapeHtml(g)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Link to full reference
        html += `
            <div class="spl-sidebar-section spl-sidebar-link-section">
                <a href="/glossary?open=${entry.id}" class="spl-sidebar-full-link">
                    View full reference →
                </a>
            </div>
        `;

        detailContainer.innerHTML = html;

        // Apply SPL highlighting if available
        if (window.SPLUNKed?.highlightSPL) {
            detailContainer.querySelectorAll('pre code').forEach(block => {
                block.innerHTML = window.SPLUNKed.highlightSPL(block.textContent);
            });
        }
    }

    function showList() {
        renderList();
    }

})();
