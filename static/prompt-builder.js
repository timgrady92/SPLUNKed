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
            timeRange: null,
            outputShape: null,
            outputField: ''
        },
        currentObjectType: 'dataSources',
        currentFilterType: 'patterns',
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
        elements.manageObjectsBtn = document.querySelector('.manage-objects-btn');
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

        // Table of Contents
        elements.toc = document.getElementById('pbToc');
        elements.tocToggle = document.getElementById('pbTocToggle');
        elements.tocLinks = document.querySelectorAll('.pb-toc-link');
        elements.tocItems = document.querySelectorAll('.pb-toc-item');
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

        // Manage Objects icon button
        elements.manageObjectsBtn?.addEventListener('click', () => switchMainTab('manage'));

        // Filter type tabs (patterns/field values)
        elements.filterTypeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                state.currentFilterType = tab.dataset.filterType;
                elements.filterTypeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderIncludeChips();
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
        elements.objectModalOverlay?.addEventListener('click', (e) => {
            if (e.target === elements.objectModalOverlay) closeObjectModal();
        });
        elements.objectModal?.querySelector('.modal-close')?.addEventListener('click', closeObjectModal);
        elements.cancelObject?.addEventListener('click', closeObjectModal);
        elements.objectForm?.addEventListener('submit', handleObjectSubmit);
        elements.deleteObject?.addEventListener('click', showDeleteConfirmation);

        // Requires field checkbox
        elements.requiresField?.addEventListener('change', () => {
            const fieldGroup = document.querySelector('.field-placeholder-group');
            fieldGroup.style.display = elements.requiresField.checked ? 'block' : 'none';
        });

        // Delete confirmation modal
        elements.deleteModalOverlay?.addEventListener('click', (e) => {
            if (e.target === elements.deleteModalOverlay) closeDeleteModal();
        });
        elements.deleteModalOverlay?.querySelector('.modal-close')?.addEventListener('click', closeDeleteModal);
        elements.cancelDelete?.addEventListener('click', closeDeleteModal);
        elements.confirmDelete?.addEventListener('click', handleDeleteConfirm);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeObjectModal();
                closeDeleteModal();
            }
        });

        // Table of Contents
        setupTocListeners();
    }

    // Table of Contents Functions
    function setupTocListeners() {
        // TOC toggle for mobile
        elements.tocToggle?.addEventListener('click', () => {
            elements.toc?.classList.toggle('expanded');
        });

        // TOC link clicks
        elements.tocLinks?.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                handleTocClick(link);
            });
        });

        // Close TOC on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (elements.toc?.classList.contains('expanded') &&
                !elements.toc.contains(e.target)) {
                elements.toc.classList.remove('expanded');
            }
        });
    }

    function handleTocClick(link) {
        const href = link.getAttribute('href');
        const targetId = href?.replace('#', '');
        const filterType = link.dataset.filter;
        const objectType = link.dataset.objectType;
        const tocItem = link.closest('.pb-toc-item');
        const section = tocItem?.dataset.section;

        // Determine if we need to switch main tabs
        const isBuildSection = ['build', 'dataSources', 'includes', 'patterns', 'fieldValues', 'excludes', 'timeRange', 'outputShape', 'splPreview'].includes(section);
        const isManageSection = section?.startsWith('manage');

        if (isBuildSection) {
            switchMainTab('build');
        } else if (isManageSection || objectType) {
            switchMainTab('manage');
        }

        // Handle filter type switching
        if (filterType) {
            const filterTab = document.querySelector(`.filter-type-tab[data-filter-type="${filterType}"]`);
            if (filterTab) {
                state.currentFilterType = filterType;
                elements.filterTypeTabs.forEach(t => t.classList.remove('active'));
                filterTab.classList.add('active');
                renderIncludeChips();
            }
        }

        // Handle object type switching in manage panel
        if (objectType) {
            const objectTab = document.querySelector(`.object-tab[data-object-type="${objectType}"]`);
            if (objectTab) {
                state.currentObjectType = objectType;
                elements.objectTabs.forEach(t => t.classList.remove('active'));
                objectTab.classList.add('active');
                renderObjectsGrid();
            }
        }

        // Scroll to target element
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }

        // Update TOC active state
        updateTocActiveState(section);

        // Close mobile TOC
        elements.toc?.classList.remove('expanded');
    }

    function updateTocActiveState(activeSection) {
        elements.tocItems?.forEach(item => {
            item.classList.remove('active');
        });

        // Activate the clicked item
        const activeItem = document.querySelector(`.pb-toc-item[data-section="${activeSection}"]`);
        if (activeItem) {
            activeItem.classList.add('active');

            // Also activate parent items
            let parent = activeItem.parentElement?.closest('.pb-toc-item');
            while (parent) {
                parent.classList.add('active');
                parent = parent.parentElement?.closest('.pb-toc-item');
            }
        }
    }

    // Tab Management
    function switchMainTab(tabName) {
        elements.builderTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        // Toggle active state on manage objects icon button
        elements.manageObjectsBtn?.classList.toggle('active', tabName === 'manage');

        elements.buildPanel.classList.toggle('active', tabName === 'build');
        elements.buildPanel.hidden = tabName !== 'build';
        elements.managePanel.classList.toggle('active', tabName === 'manage');
        elements.managePanel.hidden = tabName !== 'manage';

        // Update TOC active state for main sections
        updateTocActiveState(tabName);
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
        const allItems = [...state.mappings.patterns, ...state.mappings.fieldValues];

        const filtered = allItems.filter(item =>
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

        // Time range
        let timeSpl = '';
        if (state.selections.timeRange) {
            const preset = state.mappings.timeRangePresets.find(t => t.id === state.selections.timeRange);
            if (preset) {
                timeSpl = preset.spl;
                explanations.push(`Time range: ${preset.name}`);
            } else {
                timeSpl = state.selections.timeRange;
                explanations.push(`Time range: ${state.selections.timeRange}`);
            }
        }

        // Build base search
        let baseSearch = parts.length > 0 ? parts.join(' ') : '*';
        if (timeSpl) {
            baseSearch = `${baseSearch} ${timeSpl}`;
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

        const fullSpl = outputSpl ? `${baseSearch} ${outputSpl}` : baseSearch;

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
        navigator.clipboard.writeText(spl).then(() => {
            elements.copySPL.classList.add('copied');
            elements.copySPL.querySelector('span').textContent = 'Copied!';
            setTimeout(() => {
                elements.copySPL.classList.remove('copied');
                elements.copySPL.querySelector('span').textContent = 'Copy';
            }, 2000);
        });
    }

    function clearBuilder() {
        state.selections = {
            dataSources: [],
            includes: [],
            excludes: [],
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

        elements.objectModalOverlay.classList.add('open');
    }

    function closeObjectModal() {
        elements.objectModalOverlay.classList.remove('open');
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
        elements.deleteModalOverlay.classList.add('open');
    }

    function closeDeleteModal() {
        elements.deleteModalOverlay.classList.remove('open');
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
