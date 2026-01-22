/**
 * SPLUNKed Core - Rendering Utilities Module
 * DOM rendering helpers and search/filter functionality
 */

(function() {
    'use strict';

    // Ensure SPLUNKed namespace exists
    window.SPLUNKed = window.SPLUNKed || {};

    // ============================================
    // Debounce Utility
    // ============================================

    /**
     * Debounce a function
     * @param {Function} fn - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} - Debounced function
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

    // ============================================
    // Search Functionality
    // ============================================

    /**
     * Initialize search input with debouncing
     * @param {string} inputId - Input element ID
     * @param {Object} [options] - Configuration
     * @param {Function} [options.onSearch] - Callback when search value changes
     * @param {number} [options.debounce] - Debounce delay in ms (default: 200)
     * @param {Function} [options.onClear] - Callback when cleared
     * @returns {Object|null} - Search controller or null
     */
    function initSearch(inputId, options = {}) {
        const input = document.getElementById(inputId);
        const clearBtn = document.getElementById(`${inputId}Clear`);

        if (!input) return null;

        let debounceTimer;
        const debounceMs = options.debounce || window.SPLUNKed.TIMING?.DEBOUNCE_SEARCH || 200;

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
                if (options.onClear) {
                    options.onClear();
                }
                if (options.onSearch) {
                    options.onSearch('');
                }
            });
        }

        return {
            getValue: () => input.value.toLowerCase().trim(),
            setValue: (val) => { input.value = val; },
            clear: () => {
                input.value = '';
                if (options.onSearch) {
                    options.onSearch('');
                }
            },
            focus: () => input.focus()
        };
    }

    // ============================================
    // Filter Functionality
    // ============================================

    /**
     * Initialize filter dropdown
     * @param {string} selectId - Select element ID
     * @param {Object} [options] - Configuration
     * @param {Function} [options.onChange] - Callback when filter changes
     * @returns {Object|null} - Filter controller or null
     */
    function initFilter(selectId, options = {}) {
        const select = document.getElementById(selectId);
        if (!select) return null;

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
     * Initialize icon filter (single-select toggle buttons)
     * @param {string} containerId - Container element ID
     * @param {Object} [options] - Configuration
     * @param {Set} [options.filterSet] - Set to store active filter
     * @param {Function} [options.onChange] - Callback when filter changes
     * @returns {Object|null} - Filter controller or null
     */
    function initIconFilter(containerId, options = {}) {
        const filterContainer = document.getElementById(containerId);
        if (!filterContainer) return null;

        const { filterSet = null, onChange = null } = options;

        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.icon-filter-btn');
            if (!btn) return;

            const filterValue = btn.dataset.filter;

            filterContainer.querySelectorAll('.icon-filter-btn').forEach(b => {
                b.classList.remove('active');
            });

            btn.classList.add('active');

            if (filterSet) {
                filterSet.clear();
                if (filterValue !== 'all') {
                    filterSet.add(filterValue);
                }
            }

            if (onChange) {
                onChange(filterValue);
            }
        });

        return {
            getValue: () => {
                const active = filterContainer.querySelector('.icon-filter-btn.active');
                return active ? active.dataset.filter : 'all';
            },
            setValue: (value) => {
                filterContainer.querySelectorAll('.icon-filter-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === value);
                });
                if (filterSet) {
                    filterSet.clear();
                    if (value !== 'all') {
                        filterSet.add(value);
                    }
                }
            }
        };
    }

    /**
     * Initialize combined search + filter
     * @param {Object} config - Configuration
     * @param {string} config.searchId - Search input ID
     * @param {string[]} [config.filterIds] - Filter select/container IDs
     * @param {Function} config.onUpdate - Callback when any value changes
     * @param {Object} [config.urlSync] - URL parameter mapping { search: 'q', filter: 'cat' }
     * @returns {Object} - Combined controller
     */
    function initSearchFilter(config) {
        const { searchId, filterIds = [], onUpdate, urlSync } = config;
        const controllers = {};

        // Initialize search
        controllers.search = initSearch(searchId, {
            onSearch: () => triggerUpdate()
        });

        // Initialize filters
        filterIds.forEach((filterId, index) => {
            const filterController = initFilter(filterId, {
                onChange: () => triggerUpdate()
            }) || initIconFilter(filterId, {
                onChange: () => triggerUpdate()
            });

            if (filterController) {
                controllers[`filter${index}`] = filterController;
            }
        });

        function triggerUpdate() {
            const values = {
                search: controllers.search?.getValue() || '',
                filters: filterIds.map((_, i) => controllers[`filter${i}`]?.getValue())
            };

            if (onUpdate) {
                onUpdate(values);
            }

            if (urlSync) {
                updateUrl(values, urlSync);
            }
        }

        function updateUrl(values, mapping) {
            const url = new URL(window.location);

            if (mapping.search) {
                if (values.search) {
                    url.searchParams.set(mapping.search, values.search);
                } else {
                    url.searchParams.delete(mapping.search);
                }
            }

            window.history.replaceState({}, '', url);
        }

        return {
            getValues: () => ({
                search: controllers.search?.getValue() || '',
                filters: filterIds.map((_, i) => controllers[`filter${i}`]?.getValue())
            }),
            setSearch: (val) => {
                controllers.search?.setValue(val);
                triggerUpdate();
            },
            triggerUpdate
        };
    }

    // ============================================
    // View Toggle
    // ============================================

    /**
     * Initialize view toggle (Grid/List/etc.)
     * @param {string} containerId - Container element ID
     * @param {Object} [options] - Configuration
     * @param {string} [options.storageKey] - localStorage key for persistence
     * @param {Function} [options.onViewChange] - Callback when view changes
     * @returns {Object|null} - View controller or null
     */
    function initViewToggle(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return null;

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
            },
            setView: (view) => {
                activateView(view);
                localStorage.setItem(storageKey, view);
            }
        };
    }

    // ============================================
    // Tab Management
    // ============================================

    /**
     * Initialize tabs
     * @param {string} containerSelector - Container selector
     * @param {Object} [options] - Configuration
     * @param {string} [options.storageKey] - localStorage key for persistence
     * @param {Function} [options.onTabChange] - Callback when tab changes
     * @returns {Object|null} - Tab controller or null
     */
    function initTabs(containerSelector, options = {}) {
        const container = document.querySelector(containerSelector);
        if (!container) return null;

        const tabs = container.querySelectorAll('.category-tab, .training-tab');
        // Panels are siblings of the container, not children, so search in document
        const panels = document.querySelectorAll('.tab-panel');
        const storageKey = options.storageKey || null;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const category = tab.dataset.category;
                activateTab(category, { persist: true });
            });
        });

        function activateTab(category, activateOptions = {}) {
            if (!category) return;

            const { notify = true, persist = false } = activateOptions;
            tabs.forEach(t => {
                t.classList.toggle('active', t.dataset.category === category);
                t.setAttribute('aria-selected', t.dataset.category === category);
            });

            panels.forEach(p => {
                const isActive = p.id === `${category}Panel`;
                p.classList.toggle('active', isActive);
                p.hidden = !isActive;
            });

            if (persist && storageKey) {
                localStorage.setItem(storageKey, category);
            }

            if (notify && options.onTabChange) {
                options.onTabChange(category);
            }
        }

        // Restore saved tab if available
        if (storageKey) {
            const savedTab = localStorage.getItem(storageKey);
            if (savedTab) {
                const hasTab = Array.from(tabs).some(t => t.dataset.category === savedTab);
                if (hasTab) {
                    activateTab(savedTab, { notify: true, persist: false });
                }
            }
        }

        return { activateTab };
    }

    // ============================================
    // Progressive Disclosure
    // ============================================

    /**
     * Initialize progressive disclosure sections
     * @param {string} containerSelector - Container selector
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

    // ============================================
    // Copy to Clipboard
    // ============================================

    /**
     * Copy text to clipboard with visual feedback
     * @param {string} text - Text to copy
     * @param {HTMLElement} [button] - Button element for feedback
     * @param {Object} [options] - Options
     * @param {string} [options.label] - Success label text
     * @param {HTMLElement} [options.labelTarget] - Element to update label (default: button)
     * @param {number} [options.resetDelay] - Delay before resetting (default: 2000)
     */
    async function copyToClipboard(text, button = null, options = {}) {
        if (!text) return;

        const {
            label = null,
            labelTarget = button,
            resetDelay = window.SPLUNKed.TIMING?.COPY_FEEDBACK || 2000
        } = options;
        const originalLabel = label && labelTarget ? labelTarget.textContent : null;

        try {
            await navigator.clipboard.writeText(text);
            if (button) {
                button.classList.add('copied');
                if (label && labelTarget) {
                    labelTarget.textContent = label;
                }
                setTimeout(() => {
                    button.classList.remove('copied');
                    if (label && labelTarget && originalLabel !== null) {
                        labelTarget.textContent = originalLabel;
                    }
                }, resetDelay);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    /**
     * Initialize copy buttons with event delegation
     * @param {HTMLElement} [container] - Container to scope handlers (default: document)
     * @param {string} [selector] - Button selector (default: '.spl-copy')
     */
    function initCopyButtons(container = document, selector = '.spl-copy') {
        container.addEventListener('click', async (e) => {
            const copyBtn = e.target.closest(selector);
            if (!copyBtn) return;

            const block = copyBtn.closest('.spl-block');
            const code = block?.querySelector('code');

            if (code) {
                await copyToClipboard(code.textContent, copyBtn);
            }
        });
    }

    // ============================================
    // Empty State Handling
    // ============================================

    /**
     * Show or hide empty state based on content availability
     * @param {string} emptyStateId - Empty state element ID
     * @param {boolean} hasContent - Whether content exists
     */
    function showEmptyState(emptyStateId, hasContent) {
        const emptyState = document.getElementById(emptyStateId);
        if (emptyState) {
            emptyState.classList.toggle('hidden', hasContent);
        }
    }

    /**
     * Check if a grid has content and update empty state accordingly
     * @param {string} gridId - Grid container ID
     * @param {string} emptyStateId - Empty state element ID
     * @returns {boolean} - Whether the grid has content
     */
    function updateEmptyState(gridId, emptyStateId) {
        const grid = document.getElementById(gridId);
        const hasContent = grid && grid.children.length > 0;
        showEmptyState(emptyStateId, hasContent);
        return hasContent;
    }

    // ============================================
    // Grid Rendering
    // ============================================

    /**
     * Render items to a grid container
     * @param {string} gridId - Grid container ID
     * @param {Array} items - Items to render
     * @param {Function} renderFn - Function to render each item to HTML string
     * @param {Object} [options] - Options
     * @param {string} [options.emptyStateId] - Empty state element ID to toggle
     * @param {Function} [options.onRendered] - Callback after rendering
     */
    function renderGrid(gridId, items, renderFn, options = {}) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        const { emptyStateId, onRendered } = options;
        const hasContent = items.length > 0;

        if (!hasContent) {
            grid.innerHTML = '';
        } else {
            grid.innerHTML = items.map(renderFn).join('');
        }

        if (emptyStateId) {
            showEmptyState(emptyStateId, hasContent);
        }

        if (onRendered) {
            onRendered(grid, items);
        }
    }

    // ============================================
    // Export to SPLUNKed namespace
    // ============================================

    // Core render utilities
    window.SPLUNKed.render = {
        debounce,
        initSearch,
        initFilter,
        initIconFilter,
        initSearchFilter,
        initViewToggle,
        initTabs,
        initDisclosure,
        copyToClipboard,
        initCopyButtons,
        showEmptyState,
        updateEmptyState,
        renderGrid
    };

    // Backward compatibility - expose at top level
    window.SPLUNKed.debounce = debounce;
    window.SPLUNKed.initSearch = initSearch;
    window.SPLUNKed.initFilter = initFilter;
    window.SPLUNKed.initIconFilter = initIconFilter;
    window.SPLUNKed.initViewToggle = initViewToggle;
    window.SPLUNKed.initTabs = initTabs;
    window.SPLUNKed.initDisclosure = initDisclosure;
    window.SPLUNKed.copyToClipboard = copyToClipboard;
    window.SPLUNKed.initCopyButtons = initCopyButtons;
    window.SPLUNKed.showEmptyState = showEmptyState;
    window.SPLUNKed.updateEmptyState = updateEmptyState;

})();
