/**
 * SPLUNKed Prompt Builder
 * Handles query composition and search object management
 */

(function() {
    'use strict';

    // State Management
    const state = {
        mappings: {
            dataSources: [],
            fieldValues: [],
            patterns: [],
            outputShapes: [],
            timeRangePresets: []
        },
        selections: {
            dataSources: [],
            includes: [],
            excludes: [],
            transforms: [],
            timeRange: null,
            outputShape: null,
            outputField: ''
        },
        currentObjectType: 'dataSources',
        currentFilterType: 'patterns',
        currentFilterMode: 'include',
        editingObject: null
    };

    // DOM Elements
    const elements = {};

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', init);

    async function init() {
        cacheElements();
        await loadMappings();
        setupEventListeners();
        renderBuilder();
        renderObjectsGrid();
    }

    function cacheElements() {
        // Main tabs
        elements.builderTabs = document.querySelectorAll('.builder-tab');
        elements.buildPanel = document.getElementById('buildPanel');
        elements.managePanel = document.getElementById('managePanel');

        // Build tab elements
        elements.dsSearch = document.getElementById('dsSearch');
        elements.dataSourceChips = document.getElementById('dataSourceChips');
        elements.selectedDataSources = document.getElementById('selectedDataSources');

        elements.includeSearch = document.getElementById('includeSearch');
        elements.includeChips = document.getElementById('includeChips');
        elements.selectedIncludes = document.getElementById('selectedIncludes');
        elements.filterTypeTabs = document.querySelectorAll('.filter-type-tab');

        elements.excludeSearch = document.getElementById('excludeSearch');
        elements.excludeChips = document.getElementById('excludeChips');
        elements.selectedExcludes = document.getElementById('selectedExcludes');

        // Transform elements
        elements.transformCategories = document.querySelectorAll('.transform-category-btn');
        elements.transformPipeline = document.getElementById('transformPipeline');
        elements.transformEmpty = document.getElementById('transformEmpty');

        elements.timePresets = document.getElementById('timePresets');
        elements.customTimeRange = document.getElementById('customTimeRange');

        elements.outputShapeChips = document.getElementById('outputShapeChips');
        elements.outputFieldContainer = document.getElementById('outputFieldContainer');
        elements.outputField = document.getElementById('outputField');

        elements.clearBuilder = document.getElementById('clearBuilder');
        elements.generateSPL = document.getElementById('generateSPL');
        elements.copySPL = document.getElementById('copySPL');
        elements.splOutput = document.getElementById('splOutput');
        elements.splExplanation = document.getElementById('splExplanation');

        // Manage tab elements
        elements.objectTabs = document.querySelectorAll('.object-tab');
        elements.objectSearch = document.getElementById('objectSearch');
        elements.objectsGrid = document.getElementById('objectsGrid');
        elements.objectsEmptyState = document.getElementById('objectsEmptyState');
        elements.addNewObject = document.getElementById('addNewObject');

        // Modals
        elements.objectModalOverlay = document.getElementById('objectModalOverlay');
        elements.objectModal = document.getElementById('objectModal');
        elements.objectModalTitle = document.getElementById('objectModalTitle');
        elements.objectForm = document.getElementById('objectForm');
        elements.objectId = document.getElementById('objectId');
        elements.objectType = document.getElementById('objectType');
        elements.objectName = document.getElementById('objectName');
        elements.objectFriendlyName = document.getElementById('objectFriendlyName');
        elements.objectSPL = document.getElementById('objectSPL');
        elements.objectDescription = document.getElementById('objectDescription');
        elements.objectTags = document.getElementById('objectTags');
        elements.requiresField = document.getElementById('requiresField');
        elements.fieldPlaceholder = document.getElementById('fieldPlaceholder');
        elements.deleteObject = document.getElementById('deleteObject');
        elements.cancelObject = document.getElementById('cancelObject');

        elements.deleteModalOverlay = document.getElementById('deleteModalOverlay');
        elements.cancelDelete = document.getElementById('cancelDelete');
        elements.confirmDelete = document.getElementById('confirmDelete');
    }

    async function loadMappings() {
        try {
            const response = await fetch('/api/mappings');
            if (response.ok) {
                state.mappings = await response.json();
            }
        } catch (error) {
            console.error('Failed to load mappings:', error);
        }
    }

    function setupEventListeners() {
        // Main tab switching
        elements.builderTabs.forEach(tab => {
            tab.addEventListener('click', () => switchMainTab(tab.dataset.tab));
        });

        // Filter mode toggle (include/exclude)
        document.querySelectorAll('.filter-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                state.currentFilterMode = mode;

                // Update button states
                document.querySelectorAll('.filter-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update section hint text and styling
                const filterHint = document.getElementById('filterSectionHint');
                if (filterHint) {
                    filterHint.innerHTML = mode === 'include'
                        ? 'What to find <span class="hint-operator">AND</span>'
                        : 'What to exclude <span class="hint-operator exclude">NOT</span>';
                    filterHint.classList.toggle('exclude-mode', mode === 'exclude');
                }

                // Toggle content visibility
                document.getElementById('includeModeContent')?.classList.toggle('hidden', mode !== 'include');
                document.getElementById('excludeModeContent')?.classList.toggle('hidden', mode !== 'exclude');

                // Re-render appropriate chips
                if (mode === 'include') {
                    renderIncludeChips();
                } else {
                    renderExcludeChips();
                }
            });
        });

        // Filter type tabs (patterns/field values)
        elements.filterTypeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                state.currentFilterType = tab.dataset.filterType;
                elements.filterTypeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // Render chips for current mode
                if (state.currentFilterMode === 'include') {
                    renderIncludeChips();
                } else {
                    renderExcludeChips();
                }
            });
        });

        // Search inputs
        elements.dsSearch?.addEventListener('input', () => renderDataSourceChips());
        elements.includeSearch?.addEventListener('input', () => renderIncludeChips());
        elements.excludeSearch?.addEventListener('input', () => renderExcludeChips());
        elements.objectSearch?.addEventListener('input', () => renderObjectsGrid());

        // Search clear buttons
        document.getElementById('objectSearchClear')?.addEventListener('click', () => {
            elements.objectSearch.value = '';
            renderObjectsGrid();
        });

        // Custom time range
        elements.customTimeRange?.addEventListener('input', () => {
            if (elements.customTimeRange.value) {
                // Clear preset selection
                document.querySelectorAll('.time-preset').forEach(p => p.classList.remove('selected'));
                state.selections.timeRange = elements.customTimeRange.value;
                updateSPLPreview();
                updateSelectionCounts();
            }
        });

        // Output field
        elements.outputField?.addEventListener('input', () => {
            state.selections.outputField = elements.outputField.value;
            updateSPLPreview();
        });

        // Action buttons
        elements.clearBuilder?.addEventListener('click', clearBuilder);
        elements.generateSPL?.addEventListener('click', generateSPL);
        elements.copySPL?.addEventListener('click', copySPLToClipboard);

        // Object management tabs
        elements.objectTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                state.currentObjectType = tab.dataset.objectType;
                elements.objectTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderObjectsGrid();
            });
        });

        // Add new object
        elements.addNewObject?.addEventListener('click', () => openObjectModal());

        // Modal events
        window.SPLUNKed?.initModal?.('objectModal');
        elements.cancelObject?.addEventListener('click', closeObjectModal);
        elements.objectForm?.addEventListener('submit', handleObjectSubmit);
        elements.deleteObject?.addEventListener('click', showDeleteConfirmation);

        // Requires field checkbox
        elements.requiresField?.addEventListener('change', () => {
            const fieldGroup = document.querySelector('.field-placeholder-group');
            fieldGroup.style.display = elements.requiresField.checked ? 'block' : 'none';
        });

        // Delete confirmation modal
        window.SPLUNKed?.initModal?.('deleteModal');
        elements.cancelDelete?.addEventListener('click', closeDeleteModal);
        elements.confirmDelete?.addEventListener('click', handleDeleteConfirm);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeObjectModal();
                closeDeleteModal();
            }
        });

        // Collapsible sections
        setupCollapsibleSections();

        // Transform pipeline
        setupTransformListeners();
    }

    // Collapsible Sections
    function setupCollapsibleSections() {
        const sections = document.querySelectorAll('.composer-section');
        sections.forEach(section => {
            const header = section.querySelector('.section-header[data-collapse-toggle]');
            if (header) {
                header.addEventListener('click', (e) => {
                    // Don't collapse if clicking on interactive elements inside header
                    if (e.target.closest('input, button:not(.section-collapse-btn), select')) {
                        return;
                    }
                    section.classList.toggle('collapsed');
                });
            }
        });
    }

    // Update selection count badges
    function updateSelectionCounts() {
        // Data sources count
        const dsCount = document.getElementById('dsSelectionCount');
        if (dsCount) {
            const count = state.selections.dataSources.length;
            dsCount.textContent = count;
            dsCount.classList.toggle('visible', count > 0);
        }

        // Combined filters count (for section header)
        const filterCount = document.getElementById('filterSelectionCount');
        if (filterCount) {
            const totalFilters = state.selections.includes.length + state.selections.excludes.length;
            filterCount.textContent = totalFilters;
            filterCount.classList.toggle('visible', totalFilters > 0);
        }

        // Include mode count (for toggle button)
        const includeModeCount = document.getElementById('includeModeCount');
        if (includeModeCount) {
            const count = state.selections.includes.length;
            includeModeCount.textContent = count;
            includeModeCount.classList.toggle('visible', count > 0);
        }

        // Exclude mode count (for toggle button)
        const excludeModeCount = document.getElementById('excludeModeCount');
        if (excludeModeCount) {
            const count = state.selections.excludes.length;
            excludeModeCount.textContent = count;
            excludeModeCount.classList.toggle('visible', count > 0);
        }

        // Transforms count
        const transformCount = document.getElementById('transformSelectionCount');
        if (transformCount) {
            const count = state.selections.transforms.length;
            transformCount.textContent = count;
            transformCount.classList.toggle('visible', count > 0);
        }

        // Time range count (1 if selected)
        const timeCount = document.getElementById('timeSelectionCount');
        if (timeCount) {
            const hasTime = state.selections.timeRange !== null;
            timeCount.textContent = hasTime ? '1' : '';
            timeCount.classList.toggle('visible', hasTime);
        }

        // Output shape count (1 if selected)
        const outputCount = document.getElementById('outputSelectionCount');
        if (outputCount) {
            const hasOutput = state.selections.outputShape !== null;
            outputCount.textContent = hasOutput ? '1' : '';
            outputCount.classList.toggle('visible', hasOutput);
        }
    }

    // ============================================
    // Transformation Pipeline Management
    // ============================================

    // Transform type definitions with their UI configuration
    const TRANSFORM_TYPES = {
        // Field Operations
        eval: {
            category: 'fields',
            label: 'Eval Expression',
            icon: 'f(x)',
            fields: [
                { name: 'fieldName', label: 'New Field Name', type: 'text', placeholder: 'e.g., duration_mins' },
                { name: 'expression', label: 'Expression', type: 'textarea', placeholder: 'e.g., round(duration/60, 2)', mono: true }
            ],
            presets: [
                { label: 'lower(field)', value: 'lower({field})' },
                { label: 'upper(field)', value: 'upper({field})' },
                { label: 'len(field)', value: 'len({field})' },
                { label: 'round(num,2)', value: 'round({field}, 2)' },
                { label: 'now()', value: 'now()' },
                { label: 'if(cond,t,f)', value: 'if({condition}, {true_val}, {false_val})' }
            ],
            toSPL: (step) => step.fieldName && step.expression ? `| eval ${step.fieldName}=${step.expression}` : ''
        },
        rex: {
            category: 'fields',
            label: 'Extract Field (rex)',
            icon: '.*',
            fields: [
                { name: 'sourceField', label: 'Source Field', type: 'text', placeholder: 'e.g., _raw, message' },
                { name: 'pattern', label: 'Regex Pattern', type: 'textarea', placeholder: 'e.g., user=(?<username>\\w+)', mono: true, hint: 'Use (?<fieldname>...) for named capture groups' }
            ],
            presets: [
                { label: 'IP Address', value: '(?<ip_addr>\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3})' },
                { label: 'Email', value: '(?<email>[\\w.-]+@[\\w.-]+)' },
                { label: 'Key=Value', value: '{key}=(?<{key}_value>[^\\s]+)' }
            ],
            toSPL: (step) => step.sourceField && step.pattern ? `| rex field=${step.sourceField} "${step.pattern}"` : ''
        },
        rename: {
            category: 'fields',
            label: 'Rename Field',
            icon: 'A→B',
            fields: [
                { name: 'oldName', label: 'Original Field', type: 'text', placeholder: 'e.g., src_ip' },
                { name: 'newName', label: 'New Name', type: 'text', placeholder: 'e.g., source_address' }
            ],
            toSPL: (step) => step.oldName && step.newName ? `| rename ${step.oldName} AS ${step.newName}` : ''
        },

        // Aggregation Operations
        stats: {
            category: 'aggregate',
            label: 'Statistics',
            icon: 'Σ',
            fields: [
                { name: 'functions', label: 'Aggregation Functions', type: 'textarea', placeholder: 'e.g., count, avg(bytes), max(duration)', mono: true },
                { name: 'byFields', label: 'Group By Fields (optional)', type: 'text', placeholder: 'e.g., user, src_ip' }
            ],
            presets: [
                { label: 'count', value: 'count' },
                { label: 'count by field', value: 'count by {field}' },
                { label: 'dc(field)', value: 'dc({field})' },
                { label: 'sum(field)', value: 'sum({field})' },
                { label: 'avg(field)', value: 'avg({field})' },
                { label: 'min/max', value: 'min({field}), max({field})' },
                { label: 'values(field)', value: 'values({field})' },
                { label: 'list(field)', value: 'list({field})' }
            ],
            toSPL: (step) => {
                if (!step.functions) return '';
                let spl = `| stats ${step.functions}`;
                if (step.byFields) spl += ` by ${step.byFields}`;
                return spl;
            }
        },
        chart: {
            category: 'aggregate',
            label: 'Chart',
            icon: '📊',
            fields: [
                { name: 'functions', label: 'Aggregation', type: 'text', placeholder: 'e.g., count, avg(bytes)' },
                { name: 'overField', label: 'X-Axis Field', type: 'text', placeholder: 'e.g., status' },
                { name: 'byField', label: 'Split By (optional)', type: 'text', placeholder: 'e.g., host' }
            ],
            toSPL: (step) => {
                if (!step.functions || !step.overField) return '';
                let spl = `| chart ${step.functions} over ${step.overField}`;
                if (step.byField) spl += ` by ${step.byField}`;
                return spl;
            }
        },
        timechart: {
            category: 'aggregate',
            label: 'Time Chart',
            icon: '📈',
            fields: [
                { name: 'span', label: 'Time Span', type: 'select', options: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'] },
                { name: 'functions', label: 'Aggregation', type: 'text', placeholder: 'e.g., count, avg(response_time)' },
                { name: 'byField', label: 'Split By (optional)', type: 'text', placeholder: 'e.g., status' }
            ],
            toSPL: (step) => {
                if (!step.functions) return '';
                let spl = `| timechart`;
                if (step.span) spl += ` span=${step.span}`;
                spl += ` ${step.functions}`;
                if (step.byField) spl += ` by ${step.byField}`;
                return spl;
            }
        },

        // Data Shaping Operations
        sort: {
            category: 'shape',
            label: 'Sort',
            icon: '↕',
            fields: [
                { name: 'fields', label: 'Sort Fields', type: 'text', placeholder: 'e.g., -count, +user (- desc, + asc)' },
                { name: 'limit', label: 'Limit (optional)', type: 'text', placeholder: 'e.g., 100' }
            ],
            toSPL: (step) => {
                if (!step.fields) return '';
                let spl = `| sort`;
                if (step.limit) spl += ` ${step.limit}`;
                spl += ` ${step.fields}`;
                return spl;
            }
        },
        dedup: {
            category: 'shape',
            label: 'Deduplicate',
            icon: '⊖',
            fields: [
                { name: 'fields', label: 'Dedup Fields', type: 'text', placeholder: 'e.g., user, src_ip' },
                { name: 'keepevents', label: 'Keep Events', type: 'select', options: ['', 'keepevents=true'], advanced: true },
                { name: 'consecutive', label: 'Consecutive Only', type: 'select', options: ['', 'consecutive=true'], advanced: true }
            ],
            toSPL: (step) => {
                if (!step.fields) return '';
                let spl = `| dedup ${step.fields}`;
                if (step.keepevents) spl += ` ${step.keepevents}`;
                if (step.consecutive) spl += ` ${step.consecutive}`;
                return spl;
            }
        },
        table: {
            category: 'shape',
            label: 'Table',
            icon: '▦',
            fields: [
                { name: 'fields', label: 'Fields to Display', type: 'textarea', placeholder: 'e.g., _time, user, action, status', mono: true }
            ],
            toSPL: (step) => step.fields ? `| table ${step.fields}` : ''
        },
        head: {
            category: 'shape',
            label: 'Head (First N)',
            icon: '⤒',
            fields: [
                { name: 'count', label: 'Number of Results', type: 'text', placeholder: 'e.g., 10' }
            ],
            toSPL: (step) => step.count ? `| head ${step.count}` : ''
        },
        tail: {
            category: 'shape',
            label: 'Tail (Last N)',
            icon: '⤓',
            fields: [
                { name: 'count', label: 'Number of Results', type: 'text', placeholder: 'e.g., 10' }
            ],
            toSPL: (step) => step.count ? `| tail ${step.count}` : ''
        },

        // Custom SPL
        custom: {
            category: 'custom',
            label: 'Custom SPL',
            icon: '</>',
            fields: [
                { name: 'spl', label: 'SPL Commands', type: 'textarea', placeholder: 'e.g., | lookup users.csv user OUTPUT department | where isnotnull(department)', mono: true, rows: 3 }
            ],
            toSPL: (step) => step.spl ? (step.spl.startsWith('|') ? step.spl : `| ${step.spl}`) : ''
        }
    };

    // Category to transform type mapping
    const CATEGORY_TRANSFORMS = {
        fields: ['eval', 'rex', 'rename'],
        aggregate: ['stats', 'chart', 'timechart'],
        shape: ['sort', 'dedup', 'table', 'head', 'tail'],
        custom: ['custom']
    };

    // Quick Action definitions - map action names to transform configurations
    const QUICK_ACTIONS = {
        'count-by': {
            type: 'stats',
            defaults: { functions: 'count', byFields: '' },
            prompt: 'byFields',
            promptLabel: 'Group by field'
        },
        'top-values': {
            type: 'custom',
            defaults: { spl: '| top limit=10 ' },
            prompt: 'spl',
            promptLabel: 'Field to count',
            appendToSpl: true
        },
        'timeline': {
            type: 'timechart',
            defaults: { span: '1h', functions: 'count', byField: '' }
        },
        'unique-values': {
            type: 'stats',
            defaults: { functions: 'dc()', byFields: '' },
            prompt: 'functions',
            promptLabel: 'Field for distinct count',
            wrapInFunction: 'dc'
        },
        'sort-results': {
            type: 'sort',
            defaults: { fields: '-', limit: '' },
            prompt: 'fields',
            promptLabel: 'Sort by field (- for descending)'
        },
        'remove-duplicates': {
            type: 'dedup',
            defaults: { fields: '' },
            prompt: 'fields',
            promptLabel: 'Deduplicate by field(s)'
        },
        'select-fields': {
            type: 'table',
            defaults: { fields: '_time, ' },
            prompt: 'fields',
            promptLabel: 'Fields to display'
        },
        'calculate-field': {
            type: 'eval',
            defaults: { fieldName: '', expression: '' },
            prompt: 'fieldName',
            promptLabel: 'New field name'
        }
    };

    // Setup transform listeners for Quick Actions and advanced panel
    function setupTransformListeners() {
        // Quick Action cards
        document.querySelectorAll('.quick-action-card').forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                handleQuickAction(action);
            });
            // Keyboard support
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const action = card.dataset.action;
                    handleQuickAction(action);
                }
            });
        });

        // More Transforms toggle
        const moreToggle = document.getElementById('transformMoreToggle');
        const advancedPanel = document.getElementById('transformAdvancedPanel');
        moreToggle?.addEventListener('click', () => {
            moreToggle.classList.toggle('expanded');
            advancedPanel?.classList.toggle('hidden');
        });

        // Advanced transform buttons
        document.querySelectorAll('.advanced-transform-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                addTransformStep(type);
            });
        });
    }

    // Handle Quick Action click
    function handleQuickAction(actionName) {
        const action = QUICK_ACTIONS[actionName];
        if (!action) return;

        const config = TRANSFORM_TYPES[action.type];
        if (!config) return;

        // Create the step with defaults
        const step = {
            id: Date.now(),
            type: action.type,
            ...Object.fromEntries(config.fields.map(f => [f.name, ''])),
            ...action.defaults
        };

        state.selections.transforms.push(step);
        renderTransformPipeline();
        updateSPLPreview();
        updateSelectionCounts();

        // Focus the prompt field if specified
        if (action.prompt) {
            setTimeout(() => {
                const lastStep = document.querySelector('.transform-step:last-child');
                const input = lastStep?.querySelector(`[data-field="${action.prompt}"]`);
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 50);
        }
    }

    // Add a new transform step
    function addTransformStep(type) {
        const config = TRANSFORM_TYPES[type];
        if (!config) return;

        const step = {
            id: Date.now(),
            type: type,
            // Initialize all field values to empty
            ...Object.fromEntries(config.fields.map(f => [f.name, '']))
        };

        state.selections.transforms.push(step);
        renderTransformPipeline();
        updateSPLPreview();
        updateSelectionCounts();
    }

    // Remove a transform step
    function removeTransformStep(stepId) {
        state.selections.transforms = state.selections.transforms.filter(s => s.id !== stepId);
        renderTransformPipeline();
        updateSPLPreview();
        updateSelectionCounts();
    }

    // Move a transform step up or down
    function moveTransformStep(stepId, direction) {
        const index = state.selections.transforms.findIndex(s => s.id === stepId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= state.selections.transforms.length) return;

        const [step] = state.selections.transforms.splice(index, 1);
        state.selections.transforms.splice(newIndex, 0, step);
        renderTransformPipeline();
        updateSPLPreview();
    }

    // Update a transform step field value
    function updateTransformStep(stepId, fieldName, value) {
        const step = state.selections.transforms.find(s => s.id === stepId);
        if (step) {
            step[fieldName] = value;
            updateSPLPreview();
        }
    }

    // Render the entire transform pipeline
    function renderTransformPipeline() {
        if (!elements.transformPipeline) return;

        const hasTransforms = state.selections.transforms.length > 0;

        // Toggle empty state visibility
        if (elements.transformEmpty) {
            elements.transformEmpty.classList.toggle('hidden', hasTransforms);
        }

        // Toggle pipeline visibility
        elements.transformPipeline.classList.toggle('hidden', !hasTransforms);

        if (!hasTransforms) {
            elements.transformPipeline.innerHTML = '';
            return;
        }

        elements.transformPipeline.innerHTML = state.selections.transforms.map((step, index) => {
            const config = TRANSFORM_TYPES[step.type];
            if (!config) return '';

            const hasAdvanced = config.fields.some(f => f.advanced);

            return `
                <div class="transform-step" data-step-id="${step.id}">
                    <div class="transform-step-header">
                        <span class="transform-step-number">${index + 1}</span>
                        <span class="transform-step-type">${config.label}</span>
                        <div class="transform-step-actions">
                            ${index > 0 ? `
                                <button class="transform-step-btn move-up" title="Move up" type="button">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="18 15 12 9 6 15"/>
                                    </svg>
                                </button>
                            ` : ''}
                            ${index < state.selections.transforms.length - 1 ? `
                                <button class="transform-step-btn move-down" title="Move down" type="button">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="6 9 12 15 18 9"/>
                                    </svg>
                                </button>
                            ` : ''}
                            <button class="transform-step-btn delete" title="Remove" type="button">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="transform-step-body">
                        ${renderTransformFields(step, config)}
                        ${config.presets ? renderTransformPresets(step, config) : ''}
                        ${hasAdvanced ? renderAdvancedToggle(step, config) : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Attach event listeners
        attachTransformStepListeners();
    }

    // Render fields for a transform step
    function renderTransformFields(step, config) {
        const basicFields = config.fields.filter(f => !f.advanced);
        return basicFields.map(field => renderTransformField(step, field)).join('');
    }

    // Render a single field
    function renderTransformField(step, field) {
        const value = step[field.name] || '';
        const monoClass = field.mono ? 'style="font-family: var(--font-mono);"' : '';

        let input;
        if (field.type === 'select') {
            const options = field.options.map(opt =>
                `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt || '(none)'}</option>`
            ).join('');
            input = `<select class="transform-field-select" data-field="${field.name}">${options}</select>`;
        } else if (field.type === 'textarea') {
            const rows = field.rows || 2;
            input = `<textarea class="transform-field-textarea" data-field="${field.name}"
                        placeholder="${field.placeholder || ''}" rows="${rows}" ${monoClass}>${value}</textarea>`;
        } else {
            input = `<input type="text" class="transform-field-input" data-field="${field.name}"
                        value="${value}" placeholder="${field.placeholder || ''}" ${monoClass}>`;
        }

        return `
            <div class="transform-field-group">
                <label class="transform-field-label">${field.label}</label>
                ${input}
                ${field.hint ? `<div class="transform-field-hint">${field.hint}</div>` : ''}
            </div>
        `;
    }

    // Render preset chips
    function renderTransformPresets(step, config) {
        if (!config.presets || config.presets.length === 0) return '';

        return `
            <div class="transform-presets">
                ${config.presets.map(preset =>
                    `<button class="transform-preset" data-value="${preset.value}" type="button">${preset.label}</button>`
                ).join('')}
            </div>
        `;
    }

    // Render advanced options toggle
    function renderAdvancedToggle(step, config) {
        const advancedFields = config.fields.filter(f => f.advanced);

        return `
            <button class="transform-advanced-toggle" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
                Advanced options
            </button>
            <div class="transform-advanced-options">
                ${advancedFields.map(field => renderTransformField(step, field)).join('')}
            </div>
        `;
    }

    // Attach event listeners to transform step elements
    function attachTransformStepListeners() {
        document.querySelectorAll('.transform-step').forEach(stepEl => {
            const stepId = parseInt(stepEl.dataset.stepId);

            // Field inputs
            stepEl.querySelectorAll('.transform-field-input, .transform-field-textarea, .transform-field-select').forEach(input => {
                input.addEventListener('input', () => {
                    updateTransformStep(stepId, input.dataset.field, input.value);
                });
                input.addEventListener('change', () => {
                    updateTransformStep(stepId, input.dataset.field, input.value);
                });
            });

            // Preset buttons - insert into the first textarea or appropriate field
            stepEl.querySelectorAll('.transform-preset').forEach(btn => {
                btn.addEventListener('click', () => {
                    const textarea = stepEl.querySelector('.transform-field-textarea, .transform-field-input[data-field="expression"], .transform-field-input[data-field="functions"]');
                    if (textarea) {
                        const cursorPos = textarea.selectionStart || textarea.value.length;
                        const before = textarea.value.substring(0, cursorPos);
                        const after = textarea.value.substring(cursorPos);
                        textarea.value = before + btn.dataset.value + after;
                        textarea.focus();
                        updateTransformStep(stepId, textarea.dataset.field, textarea.value);
                    }
                });
            });

            // Move buttons
            stepEl.querySelector('.move-up')?.addEventListener('click', () => moveTransformStep(stepId, 'up'));
            stepEl.querySelector('.move-down')?.addEventListener('click', () => moveTransformStep(stepId, 'down'));

            // Delete button
            stepEl.querySelector('.delete')?.addEventListener('click', () => removeTransformStep(stepId));

            // Advanced toggle
            const advToggle = stepEl.querySelector('.transform-advanced-toggle');
            const advOptions = stepEl.querySelector('.transform-advanced-options');
            advToggle?.addEventListener('click', () => {
                advToggle.classList.toggle('expanded');
                advOptions?.classList.toggle('visible');
            });
        });
    }

    // Tab Management
    function switchMainTab(tabName) {
        elements.builderTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        elements.buildPanel.classList.toggle('active', tabName === 'build');
        elements.buildPanel.hidden = tabName !== 'build';
        elements.managePanel.classList.toggle('active', tabName === 'manage');
        elements.managePanel.hidden = tabName !== 'manage';
    }

    // Render Functions
    function renderBuilder() {
        renderDataSourceChips();
        renderIncludeChips();
        renderExcludeChips();
        renderTimePresets();
        renderOutputShapes();
        updateSPLPreview();
    }

    function renderDataSourceChips() {
        const searchTerm = elements.dsSearch?.value.toLowerCase() || '';
        const filtered = state.mappings.dataSources.filter(ds =>
            ds.name.toLowerCase().includes(searchTerm) ||
            ds.friendlyName.toLowerCase().includes(searchTerm) ||
            ds.tags.some(t => t.toLowerCase().includes(searchTerm))
        );

        elements.dataSourceChips.innerHTML = filtered.map(ds => `
            <div class="chip ${state.selections.dataSources.includes(ds.id) ? 'selected' : ''}"
                 data-id="${ds.id}" data-type="dataSource" title="${ds.description}">
                ${ds.friendlyName}
            </div>
        `).join('');

        // Add click handlers
        elements.dataSourceChips.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => toggleSelection('dataSources', chip.dataset.id));
        });

        renderSelectedDataSources();
    }

    function renderSelectedDataSources() {
        elements.selectedDataSources.innerHTML = state.selections.dataSources.map(id => {
            const ds = state.mappings.dataSources.find(d => d.id === id);
            if (!ds) return '';
            return `
                <div class="selected-tag" data-id="${id}">
                    ${ds.friendlyName}
                    <button class="remove-tag" data-id="${id}">&times;</button>
                </div>
            `;
        }).join('');

        elements.selectedDataSources.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSelection('dataSources', btn.dataset.id);
            });
        });
    }

    function renderIncludeChips() {
        const searchTerm = elements.includeSearch?.value.toLowerCase() || '';
        const sourceType = state.currentFilterType;
        const items = state.mappings[sourceType] || [];

        const filtered = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.friendlyName.toLowerCase().includes(searchTerm) ||
            item.tags.some(t => t.toLowerCase().includes(searchTerm))
        );

        elements.includeChips.innerHTML = filtered.map(item => `
            <div class="chip ${state.selections.includes.includes(item.id) ? 'selected' : ''}"
                 data-id="${item.id}" title="${item.description}">
                ${item.friendlyName}
            </div>
        `).join('');

        elements.includeChips.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => toggleSelection('includes', chip.dataset.id));
        });

        renderSelectedIncludes();
    }

    function renderSelectedIncludes() {
        const allItems = [...state.mappings.patterns, ...state.mappings.fieldValues];
        elements.selectedIncludes.innerHTML = state.selections.includes.map(id => {
            const item = allItems.find(i => i.id === id);
            if (!item) return '';
            return `
                <div class="selected-tag" data-id="${id}">
                    ${item.friendlyName}
                    <button class="remove-tag" data-id="${id}">&times;</button>
                </div>
            `;
        }).join('');

        elements.selectedIncludes.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSelection('includes', btn.dataset.id);
            });
        });
    }

    function renderExcludeChips() {
        const searchTerm = elements.excludeSearch?.value.toLowerCase() || '';
        const sourceType = state.currentFilterType;
        const items = state.mappings[sourceType] || [];

        const filtered = items.filter(item =>
            (item.name.toLowerCase().includes(searchTerm) ||
            item.friendlyName.toLowerCase().includes(searchTerm) ||
            item.tags.some(t => t.toLowerCase().includes(searchTerm))) &&
            !state.selections.includes.includes(item.id) // Don't show items already included
        );

        elements.excludeChips.innerHTML = filtered.map(item => `
            <div class="chip ${state.selections.excludes.includes(item.id) ? 'selected' : ''}"
                 data-id="${item.id}" title="${item.description}">
                ${item.friendlyName}
            </div>
        `).join('');

        elements.excludeChips.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => toggleSelection('excludes', chip.dataset.id));
        });

        renderSelectedExcludes();
    }

    function renderSelectedExcludes() {
        const allItems = [...state.mappings.patterns, ...state.mappings.fieldValues];
        elements.selectedExcludes.innerHTML = state.selections.excludes.map(id => {
            const item = allItems.find(i => i.id === id);
            if (!item) return '';
            return `
                <div class="selected-tag" data-id="${id}">
                    ${item.friendlyName}
                    <button class="remove-tag" data-id="${id}">&times;</button>
                </div>
            `;
        }).join('');

        elements.selectedExcludes.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleSelection('excludes', btn.dataset.id);
            });
        });
    }

    function renderTimePresets() {
        elements.timePresets.innerHTML = state.mappings.timeRangePresets.map(preset => `
            <button class="time-preset ${state.selections.timeRange === preset.id ? 'selected' : ''}"
                    data-id="${preset.id}" type="button">
                ${preset.name}
            </button>
        `).join('');

        elements.timePresets.querySelectorAll('.time-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.time-preset').forEach(p => p.classList.remove('selected'));
                btn.classList.add('selected');
                state.selections.timeRange = btn.dataset.id;
                elements.customTimeRange.value = '';
                updateSPLPreview();
                updateSelectionCounts();
            });
        });
    }

    function renderOutputShapes() {
        elements.outputShapeChips.innerHTML = state.mappings.outputShapes.map(shape => `
            <div class="chip ${state.selections.outputShape === shape.id ? 'selected' : ''}"
                 data-id="${shape.id}" data-requires-field="${shape.requiresField || false}"
                 title="${shape.description}">
                ${shape.friendlyName}
            </div>
        `).join('');

        elements.outputShapeChips.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const wasSelected = state.selections.outputShape === chip.dataset.id;

                // Deselect all
                elements.outputShapeChips.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));

                if (wasSelected) {
                    state.selections.outputShape = null;
                    elements.outputFieldContainer.style.display = 'none';
                } else {
                    chip.classList.add('selected');
                    state.selections.outputShape = chip.dataset.id;

                    // Show field input if required
                    const requiresField = chip.dataset.requiresField === 'true';
                    elements.outputFieldContainer.style.display = requiresField ? 'flex' : 'none';
                }

                updateSPLPreview();
                updateSelectionCounts();
            });
        });
    }

    // Selection Management
    function toggleSelection(type, id) {
        const index = state.selections[type].indexOf(id);
        if (index === -1) {
            state.selections[type].push(id);
        } else {
            state.selections[type].splice(index, 1);
        }

        // Re-render appropriate section
        switch(type) {
            case 'dataSources':
                renderDataSourceChips();
                break;
            case 'includes':
                renderIncludeChips();
                renderExcludeChips(); // Update excludes to hide included items
                break;
            case 'excludes':
                renderExcludeChips();
                break;
        }

        updateSPLPreview();
        updateSelectionCounts();
    }

    // SPL Generation
    async function updateSPLPreview() {
        const spl = generateLocalSPL();
        elements.splOutput.querySelector('.spl-code-display').textContent = spl.spl;
        elements.splExplanation.textContent = spl.explanation;
    }

    function generateLocalSPL() {
        const parts = [];
        const explanations = [];

        // Data sources (OR together)
        if (state.selections.dataSources.length > 0) {
            const dsSpls = state.selections.dataSources.map(id => {
                const ds = state.mappings.dataSources.find(d => d.id === id);
                return ds ? `(${ds.spl})` : null;
            }).filter(Boolean);

            if (dsSpls.length > 1) {
                parts.push(`(${dsSpls.join(' OR ')})`);
            } else if (dsSpls.length === 1) {
                parts.push(dsSpls[0]);
            }

            const dsNames = state.selections.dataSources.map(id => {
                const ds = state.mappings.dataSources.find(d => d.id === id);
                return ds?.name;
            }).filter(Boolean);
            explanations.push(`Search in: ${dsNames.join(', ')}`);
        }

        // Time range (placed early to match UI order and SPL best practice)
        if (state.selections.timeRange) {
            const preset = state.mappings.timeRangePresets.find(t => t.id === state.selections.timeRange);
            if (preset) {
                parts.push(preset.spl);
                explanations.push(`Time: ${preset.name}`);
            } else {
                parts.push(state.selections.timeRange);
                explanations.push(`Time: ${state.selections.timeRange}`);
            }
        }

        // Includes (AND together)
        const allItems = [...state.mappings.patterns, ...state.mappings.fieldValues];
        if (state.selections.includes.length > 0) {
            const includeSpls = state.selections.includes.map(id => {
                const item = allItems.find(i => i.id === id);
                return item?.spl;
            }).filter(Boolean);

            parts.push(...includeSpls);

            const includeNames = state.selections.includes.map(id => {
                const item = allItems.find(i => i.id === id);
                return item?.name;
            }).filter(Boolean);
            explanations.push(`Filter for: ${includeNames.join(', ')}`);
        }

        // Excludes (NOT each)
        if (state.selections.excludes.length > 0) {
            const excludeSpls = state.selections.excludes.map(id => {
                const item = allItems.find(i => i.id === id);
                return item ? `NOT ${item.spl}` : null;
            }).filter(Boolean);

            parts.push(...excludeSpls);

            const excludeNames = state.selections.excludes.map(id => {
                const item = allItems.find(i => i.id === id);
                return item?.name;
            }).filter(Boolean);
            explanations.push(`Excluding: ${excludeNames.join(', ')}`);
        }

        // Build base search
        let baseSearch = parts.length > 0 ? parts.join(' ') : '*';

        // Transformations
        let transformSpl = '';
        if (state.selections.transforms.length > 0) {
            const transformParts = state.selections.transforms.map(step => {
                const config = TRANSFORM_TYPES[step.type];
                if (config && config.toSPL) {
                    return config.toSPL(step);
                }
                return '';
            }).filter(Boolean);

            if (transformParts.length > 0) {
                transformSpl = transformParts.join(' ');
                const transformNames = state.selections.transforms.map(step => {
                    const config = TRANSFORM_TYPES[step.type];
                    return config?.label || step.type;
                });
                explanations.push(`Transform: ${transformNames.join(' → ')}`);
            }
        }

        // Output shape
        let outputSpl = '';
        if (state.selections.outputShape) {
            const shape = state.mappings.outputShapes.find(o => o.id === state.selections.outputShape);
            if (shape) {
                outputSpl = shape.spl;
                if (shape.requiresField && state.selections.outputField) {
                    outputSpl = outputSpl.replace(/\{field\}/g, state.selections.outputField);
                    outputSpl = outputSpl.replace(/\{field1\}/g, state.selections.outputField);
                    outputSpl = outputSpl.replace(/\{field2\}/g, state.selections.outputField);
                }
                explanations.push(`Output: ${shape.name}`);
            }
        }

        // Combine: base search + transforms + output shape
        let fullSpl = baseSearch;
        if (transformSpl) {
            fullSpl = `${fullSpl} ${transformSpl}`;
        }
        if (outputSpl) {
            fullSpl = `${fullSpl} ${outputSpl}`;
        }

        return {
            spl: fullSpl,
            explanation: explanations.length > 0 ? explanations.join(' | ') : 'Search all events'
        };
    }

    async function generateSPL() {
        try {
            const response = await fetch('/api/generate-spl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dataSources: state.selections.dataSources,
                    includes: state.selections.includes,
                    excludes: state.selections.excludes,
                    timeRange: state.selections.timeRange,
                    outputShape: state.selections.outputShape,
                    outputField: state.selections.outputField
                })
            });

            if (response.ok) {
                const result = await response.json();
                elements.splOutput.querySelector('.spl-code-display').textContent = result.spl;
                elements.splExplanation.textContent = result.explanation;
            }
        } catch (error) {
            console.error('Failed to generate SPL:', error);
        }
    }

    function copySPLToClipboard() {
        const spl = elements.splOutput.querySelector('.spl-code-display').textContent;
        if (window.SPLUNKed?.copyToClipboard) {
            window.SPLUNKed.copyToClipboard(spl, elements.copySPL, {
                label: 'Copied!',
                labelTarget: elements.copySPL.querySelector('span')
            });
        } else {
            navigator.clipboard.writeText(spl).catch((error) => {
                console.error('Failed to copy SPL:', error);
            });
        }
    }

    function clearBuilder() {
        state.selections = {
            dataSources: [],
            includes: [],
            excludes: [],
            transforms: [],
            timeRange: null,
            outputShape: null,
            outputField: ''
        };

        elements.dsSearch.value = '';
        elements.includeSearch.value = '';
        elements.excludeSearch.value = '';
        elements.customTimeRange.value = '';
        elements.outputField.value = '';
        elements.outputFieldContainer.style.display = 'none';

        renderBuilder();
        renderTransformPipeline();
        updateSelectionCounts();
    }

    // Object Management
    function renderObjectsGrid() {
        const searchTerm = elements.objectSearch?.value.toLowerCase() || '';
        const objects = state.mappings[state.currentObjectType] || [];

        const filtered = objects.filter(obj =>
            obj.name.toLowerCase().includes(searchTerm) ||
            obj.friendlyName.toLowerCase().includes(searchTerm) ||
            obj.spl.toLowerCase().includes(searchTerm) ||
            obj.tags.some(t => t.toLowerCase().includes(searchTerm))
        );

        if (filtered.length === 0) {
            elements.objectsGrid.innerHTML = '';
            elements.objectsEmptyState.classList.remove('hidden');
            return;
        }

        elements.objectsEmptyState.classList.add('hidden');
        elements.objectsGrid.innerHTML = filtered.map(obj => `
            <div class="object-card" data-id="${obj.id}">
                <div class="object-card-header">
                    <span class="object-friendly-name">${obj.friendlyName}</span>
                    <span class="object-type-badge">${formatTypeName(obj.type)}</span>
                </div>
                <div class="object-name">${obj.name}</div>
                <div class="object-description">${obj.description || 'No description'}</div>
                <div class="object-spl-preview">${obj.spl}</div>
                <div class="object-tags">
                    ${(obj.tags || []).map(tag => `<span class="object-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');

        elements.objectsGrid.querySelectorAll('.object-card').forEach(card => {
            card.addEventListener('click', () => {
                const obj = objects.find(o => o.id === card.dataset.id);
                if (obj) openObjectModal(obj);
            });
        });
    }

    function formatTypeName(type) {
        const names = {
            dataSource: 'Source',
            fieldValue: 'Field',
            pattern: 'Pattern',
            outputShape: 'Output'
        };
        return names[type] || type;
    }

    function openObjectModal(obj = null) {
        state.editingObject = obj;

        elements.objectModalTitle.textContent = obj ? 'Edit Object' : 'Add New Object';
        elements.deleteObject.style.display = obj ? 'block' : 'none';

        // Clear form
        elements.objectForm.reset();

        // Set values if editing
        if (obj) {
            elements.objectId.value = obj.id;
            elements.objectType.value = obj.type;
            elements.objectName.value = obj.name;
            elements.objectFriendlyName.value = obj.friendlyName;
            elements.objectSPL.value = obj.spl;
            elements.objectDescription.value = obj.description || '';
            elements.objectTags.value = (obj.tags || []).join(', ');

            if (obj.requiresField) {
                elements.requiresField.checked = true;
                elements.fieldPlaceholder.value = obj.fieldPlaceholder || '{field}';
                document.querySelector('.field-placeholder-group').style.display = 'block';
            }
        } else {
            elements.objectType.value = state.currentObjectType.replace(/s$/, '');
        }

        // Show/hide output shape fields
        const showOutputFields = state.currentObjectType === 'outputShapes';
        document.querySelector('.output-shape-fields').style.display = showOutputFields ? 'block' : 'none';

        if (window.SPLUNKed?.openModal) {
            window.SPLUNKed.openModal('objectModal');
        } else {
            elements.objectModalOverlay.classList.add('open');
        }
    }

    function closeObjectModal() {
        if (window.SPLUNKed?.closeModal) {
            window.SPLUNKed.closeModal('objectModal');
        } else {
            elements.objectModalOverlay.classList.remove('open');
        }
        state.editingObject = null;
    }

    async function handleObjectSubmit(e) {
        e.preventDefault();

        const formData = {
            name: elements.objectName.value,
            friendlyName: elements.objectFriendlyName.value || elements.objectName.value.toUpperCase(),
            spl: elements.objectSPL.value,
            description: elements.objectDescription.value,
            tags: elements.objectTags.value.split(',').map(t => t.trim()).filter(Boolean)
        };

        // Add output shape fields
        if (state.currentObjectType === 'outputShapes') {
            formData.requiresField = elements.requiresField.checked;
            if (formData.requiresField) {
                formData.fieldPlaceholder = elements.fieldPlaceholder.value || '{field}';
            }
        }

        try {
            let response;
            if (state.editingObject) {
                // Update existing
                response = await fetch(`/api/mappings/${state.currentObjectType}/${state.editingObject.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                // Create new
                response = await fetch(`/api/mappings/${state.currentObjectType}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            if (response.ok) {
                await loadMappings();
                renderBuilder();
                renderObjectsGrid();
                closeObjectModal();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.error || 'Failed to save object'));
            }
        } catch (error) {
            console.error('Failed to save object:', error);
            alert('Failed to save object');
        }
    }

    function showDeleteConfirmation() {
        if (window.SPLUNKed?.openModal) {
            window.SPLUNKed.openModal('deleteModal');
        } else {
            elements.deleteModalOverlay.classList.add('open');
        }
    }

    function closeDeleteModal() {
        if (window.SPLUNKed?.closeModal) {
            window.SPLUNKed.closeModal('deleteModal');
        } else {
            elements.deleteModalOverlay.classList.remove('open');
        }
    }

    async function handleDeleteConfirm() {
        if (!state.editingObject) return;

        try {
            const response = await fetch(`/api/mappings/${state.currentObjectType}/${state.editingObject.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await loadMappings();
                renderBuilder();
                renderObjectsGrid();
                closeDeleteModal();
                closeObjectModal();
            } else {
                const error = await response.json();
                alert('Error: ' + (error.error || 'Failed to delete object'));
            }
        } catch (error) {
            console.error('Failed to delete object:', error);
            alert('Failed to delete object');
        }
    }

})();
