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
    let currentFilter = 'all';
    let currentEntry = null;
    let allEntries = [];

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

        // Filter buttons
        initFilterButtons();

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

    function initFilterButtons() {
        const filtersContainer = document.getElementById('splSidebarFilters');
        if (!filtersContainer) return;

        filtersContainer.querySelectorAll('.spl-sidebar-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active state
                filtersContainer.querySelectorAll('.spl-sidebar-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update filter and re-render
                currentFilter = btn.dataset.filter;
                renderList();
            });
        });
    }

    function updateFilterCounts() {
        if (!glossaryData) return;

        const counts = { all: 0, command: 0, function: 0, stats: 0 };

        if (glossaryData.commands) counts.command = glossaryData.commands.length;
        if (glossaryData.functions) counts.function = glossaryData.functions.length;
        if (glossaryData.statsFunctions) counts.stats = glossaryData.statsFunctions.length;
        counts.all = counts.command + counts.function + counts.stats;

        document.getElementById('filterCountAll').textContent = counts.all;
        document.getElementById('filterCountCommands').textContent = counts.command;
        document.getElementById('filterCountFunctions').textContent = counts.function;
        document.getElementById('filterCountStats').textContent = counts.stats;
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

    async function loadGlossaryData() {
        const listContainer = document.getElementById('splSidebarList');

        if (window.GLOSSARY_DATA) {
            glossaryData = window.GLOSSARY_DATA;
            isLoaded = true;
            buildEntriesCache();
            updateFilterCounts();
            renderList();
            return;
        }

        if (window.SPLUNKed?.loadGlossaryData) {
            listContainer.innerHTML = '<div class="spl-sidebar-loading">Loading SPL reference...</div>';
            const data = await window.SPLUNKed.loadGlossaryData();
            if (data) {
                glossaryData = data;
                isLoaded = true;
                buildEntriesCache();
                updateFilterCounts();
                renderList();
                return;
            }
        }

        listContainer.innerHTML = '<div class="spl-sidebar-error">SPL reference data not available. <br><a href="/glossary" style="color: var(--splunk-orange);">Go to Glossary</a></div>';
    }

    function buildEntriesCache() {
        allEntries = [];

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

        // Sort alphabetically
        allEntries.sort((a, b) => a.name.localeCompare(b.name));
    }

    function renderList() {
        const listContainer = document.getElementById('splSidebarList');
        const detailContainer = document.getElementById('splSidebarDetail');
        const alphaNav = document.getElementById('splSidebarAlphaNav');
        const backBtn = document.getElementById('splSidebarBack');

        // Show list, hide detail
        listContainer.classList.remove('hidden');
        detailContainer.classList.add('hidden');
        backBtn.classList.add('hidden');
        currentEntry = null;

        if (!glossaryData || allEntries.length === 0) return;

        // Filter entries
        let filteredEntries = allEntries;

        // Apply type filter
        if (currentFilter !== 'all') {
            filteredEntries = filteredEntries.filter(entry => entry._type === currentFilter);
        }

        // Apply search filter
        if (currentSearch) {
            filteredEntries = filteredEntries.filter(entry => {
                const searchText = `${entry.name} ${entry.takeaway || ''} ${entry.zones?.essential?.what || ''}`.toLowerCase();
                return searchText.includes(currentSearch);
            });
        }

        // Render empty state
        if (filteredEntries.length === 0) {
            alphaNav.innerHTML = '';
            listContainer.innerHTML = `
                <div class="spl-sidebar-empty">
                    <p>No matches found</p>
                    <p class="spl-sidebar-empty-hint">Try a different search term or filter</p>
                </div>
            `;
            return;
        }

        // Group by first letter
        const grouped = {};
        const letters = [];
        filteredEntries.forEach(entry => {
            const letter = entry.name.charAt(0).toUpperCase();
            if (!grouped[letter]) {
                grouped[letter] = [];
                letters.push(letter);
            }
            grouped[letter].push(entry);
        });

        // Render alphabetical navigation
        alphaNav.innerHTML = letters.map(letter =>
            `<button class="spl-alpha-btn" data-letter="${letter}">${letter}</button>`
        ).join('');

        // Add alpha nav click handlers
        alphaNav.querySelectorAll('.spl-alpha-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const letter = btn.dataset.letter;
                const section = listContainer.querySelector(`[data-section="${letter}"]`);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        const typeIcons = {
            command: '|',
            function: 'f()',
            stats: '\u03A3'
        };

        // Render grouped list
        let html = '';
        letters.forEach(letter => {
            html += `<div class="spl-sidebar-section-header" data-section="${letter}">${letter}</div>`;
            html += grouped[letter].map(entry => `
                <button class="spl-sidebar-item" data-id="${entry.id}" data-category="${entry.category}" data-type="${entry._type}">
                    <span class="spl-sidebar-item-icon ${entry._type}">${typeIcons[entry._type]}</span>
                    <div class="spl-sidebar-item-content">
                        <code class="spl-sidebar-item-name">${SPLUNKed.escapeHtml(entry.name)}</code>
                        <span class="spl-sidebar-item-takeaway">${SPLUNKed.escapeHtml(entry.takeaway || '')}</span>
                    </div>
                </button>
            `).join('');
        });

        listContainer.innerHTML = html;

        // Add click handlers
        listContainer.querySelectorAll('.spl-sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const category = item.dataset.category;
                const entry = glossaryData[category]?.find(e => e.id === id);
                if (entry) {
                    showDetail({ ...entry, _type: item.dataset.type });
                }
            });
        });
    }

    function showDetail(entry) {
        const listContainer = document.getElementById('splSidebarList');
        const alphaNav = document.getElementById('splSidebarAlphaNav');
        const detailContainer = document.getElementById('splSidebarDetail');
        const backBtn = document.getElementById('splSidebarBack');

        // Hide list and alpha nav, show detail
        listContainer.classList.add('hidden');
        alphaNav.style.display = 'none';
        detailContainer.classList.remove('hidden');
        backBtn.classList.remove('hidden');
        currentEntry = entry;

        // Build detail HTML with tabs
        const zones = entry.zones || {};
        const essential = zones.essential || {};
        const practical = zones.practical || {};
        const deep = zones.deep || {};
        const entryType = entry._type || 'command';

        // Check if entry has full zones structure or simplified flat structure
        const hasZones = entry.zones && (zones.essential || zones.practical || zones.deep);
        const isSimplified = !hasZones && (entry.what || entry.syntax || entry.examples);

        const typeLabels = {
            command: 'Command',
            function: 'Eval Function',
            stats: 'Stats Function'
        };

        const typeIcons = {
            command: '|',
            function: 'f()',
            stats: '\u03A3'
        };

        // Determine which tabs to show based on data format
        let hasPractical, hasDeep;
        if (isSimplified) {
            hasPractical = entry.examples && entry.examples.length > 0;
            hasDeep = false;
        } else {
            hasPractical = practical.examples || practical.gotchas || practical.commonUses;
            hasDeep = deep.advancedPatterns || deep.performance || deep.vsAlternatives;
        }

        let html = `
            <div class="spl-sidebar-detail-header ${entryType}">
                <span class="spl-sidebar-detail-type ${entryType}">
                    <span>${typeIcons[entryType]}</span>
                    ${typeLabels[entryType]}
                </span>
                <code class="spl-sidebar-detail-name">${SPLUNKed.escapeHtml(entry.name)}</code>
                <p class="spl-sidebar-detail-takeaway">${SPLUNKed.escapeHtml(entry.takeaway || '')}</p>
            </div>
        `;

        // Tab navigation
        html += `
            <div class="spl-sidebar-tabs">
                <button class="spl-sidebar-tab active" data-tab="essential">
                    <span class="tab-icon">✦</span> Essential
                </button>
                ${hasPractical ? `
                <button class="spl-sidebar-tab" data-tab="practical">
                    <span class="tab-icon">⚡</span> Practical
                </button>
                ` : ''}
                ${hasDeep ? `
                <button class="spl-sidebar-tab" data-tab="deep">
                    <span class="tab-icon">◈</span> Deep Dive
                </button>
                ` : ''}
            </div>
        `;

        // Essential tab content
        html += `<div class="spl-sidebar-tab-content active" data-tab="essential">`;

        // Get what/why/syntax from either flat structure or zones
        const whatText = isSimplified ? entry.what : essential.what;
        const whyText = isSimplified ? entry.why : essential.why;
        const syntaxText = isSimplified ? entry.syntax : essential.syntax;
        const exampleObj = isSimplified ? null : essential.example;

        if (whatText) {
            html += `
                <div class="spl-sidebar-section spl-section-what">
                    <h4 class="spl-sidebar-section-title">What it does</h4>
                    <p>${SPLUNKed.escapeHtml(whatText)}</p>
                </div>
            `;
        }
        if (whyText) {
            html += `
                <div class="spl-sidebar-section spl-section-why">
                    <h4 class="spl-sidebar-section-title">Why use it</h4>
                    <p>${SPLUNKed.escapeHtml(whyText)}</p>
                </div>
            `;
        }
        if (syntaxText) {
            html += `
                <div class="spl-sidebar-section spl-section-syntax">
                    <h4 class="spl-sidebar-section-title">Syntax</h4>
                    <pre class="spl-sidebar-syntax"><code>${SPLUNKed.escapeHtml(syntaxText)}</code></pre>
                </div>
            `;
        }

        // Quick example for entries with zones.essential.example
        if (exampleObj) {
            html += `
                <div class="spl-sidebar-section spl-section-example">
                    <h4 class="spl-sidebar-section-title">Quick Example</h4>
                    <pre class="spl-sidebar-example"><code>${SPLUNKed.escapeHtml(exampleObj.spl)}</code></pre>
                    ${exampleObj.explanation ? `<div class="spl-sidebar-example-explanation">${SPLUNKed.escapeHtml(exampleObj.explanation)}</div>` : ''}
                </div>
            `;
        }

        html += `</div>`; // end essential tab

        // Practical tab content
        if (hasPractical) {
            html += `<div class="spl-sidebar-tab-content" data-tab="practical">`;

            // Get examples from either flat structure or practical zone
            const examples = isSimplified ? entry.examples : practical.examples;
            if (examples && examples.length > 0) {
                html += `
                    <div class="spl-sidebar-section spl-section-examples">
                        <h4 class="spl-sidebar-section-title">Examples</h4>
                        <div class="spl-sidebar-examples-list">
                            ${examples.map((ex, i) => `
                                <div class="spl-sidebar-example-item">
                                    <pre class="spl-sidebar-example"><code>${SPLUNKed.escapeHtml(ex.spl)}</code></pre>
                                    ${ex.explanation ? `<div class="spl-sidebar-example-explanation">${SPLUNKed.escapeHtml(ex.explanation)}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            if (practical.gotchas && practical.gotchas.length > 0) {
                html += `
                    <div class="spl-sidebar-section spl-section-gotchas">
                        <h4 class="spl-sidebar-section-title">Watch Out For</h4>
                        <ul class="spl-sidebar-gotchas">
                            ${practical.gotchas.map(g => `<li>${SPLUNKed.escapeHtml(g)}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            if (practical.commonUses && practical.commonUses.length > 0) {
                html += `
                    <div class="spl-sidebar-section spl-section-uses">
                        <h4 class="spl-sidebar-section-title">Common Uses</h4>
                        <ul class="spl-sidebar-uses">
                            ${practical.commonUses.map(u => `<li>${SPLUNKed.escapeHtml(u)}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            html += `</div>`; // end practical tab
        }

        // Deep Dive tab content
        if (hasDeep) {
            html += `<div class="spl-sidebar-tab-content" data-tab="deep">`;

            if (deep.advancedPatterns && deep.advancedPatterns.length > 0) {
                html += `
                    <div class="spl-sidebar-section spl-section-advanced">
                        <h4 class="spl-sidebar-section-title">Advanced Patterns</h4>
                        <div class="spl-sidebar-patterns-list">
                            ${deep.advancedPatterns.map(p => `
                                <div class="spl-sidebar-pattern-item">
                                    <span class="pattern-name">${SPLUNKed.escapeHtml(p.name)}</span>
                                    <pre class="spl-sidebar-example"><code>${SPLUNKed.escapeHtml(p.spl)}</code></pre>
                                    ${p.explanation ? `<div class="spl-sidebar-example-explanation">${SPLUNKed.escapeHtml(p.explanation)}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            if (deep.performance) {
                html += `
                    <div class="spl-sidebar-section spl-section-perf">
                        <h4 class="spl-sidebar-section-title">Performance</h4>
                        <p>${SPLUNKed.escapeHtml(deep.performance)}</p>
                    </div>
                `;
            }

            if (deep.vsAlternatives && Object.keys(deep.vsAlternatives).length > 0) {
                html += `
                    <div class="spl-sidebar-section spl-section-alts">
                        <h4 class="spl-sidebar-section-title">Alternatives</h4>
                        <div class="spl-sidebar-alternatives">
                            ${Object.entries(deep.vsAlternatives).map(([cmd, desc]) => `
                                <div class="spl-sidebar-alt-item">
                                    <code class="alt-cmd">${SPLUNKed.escapeHtml(cmd)}</code>
                                    <span class="alt-desc">${SPLUNKed.escapeHtml(desc)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            html += `</div>`; // end deep tab
        }

        // Related commands
        if (entry.relatedCommands && entry.relatedCommands.length > 0) {
            html += `
                <div class="spl-sidebar-related">
                    <h4 class="spl-sidebar-section-title">Related</h4>
                    <div class="spl-sidebar-related-list">
                        ${entry.relatedCommands.map(cmd => `
                            <button class="spl-sidebar-related-btn" data-cmd="${SPLUNKed.escapeHtml(cmd)}">${SPLUNKed.escapeHtml(cmd)}</button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Link to full reference
        html += `
            <div class="spl-sidebar-section spl-sidebar-link-section">
                <a href="/glossary?open=${entry.id}" class="spl-sidebar-full-link">
                    Open in Glossary
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                </a>
            </div>
        `;

        detailContainer.innerHTML = html;

        // Initialize tabs
        initDetailTabs(detailContainer);

        // Initialize related command clicks
        detailContainer.querySelectorAll('.spl-sidebar-related-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmdName = btn.dataset.cmd;
                const related = allEntries.find(e => e.name === cmdName || e.name === cmdName + '()');
                if (related) {
                    showDetail(related);
                }
            });
        });

        // Apply SPL highlighting if available
        if (window.SPLUNKed?.highlightSPL) {
            detailContainer.querySelectorAll('pre code').forEach(block => {
                block.innerHTML = window.SPLUNKed.highlightSPL(block.textContent);
            });
        }

        // Scroll to top of detail
        detailContainer.scrollTop = 0;
    }

    function initDetailTabs(container) {
        const tabs = container.querySelectorAll('.spl-sidebar-tab');
        const contents = container.querySelectorAll('.spl-sidebar-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Update tab active state
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update content visibility
                contents.forEach(content => {
                    content.classList.toggle('active', content.dataset.tab === targetTab);
                });
            });
        });
    }

    function showList() {
        const alphaNav = document.getElementById('splSidebarAlphaNav');
        if (alphaNav) alphaNav.style.display = '';
        renderList();
    }

})();
