/**
 * SPLUNKed Core - Unified Components Module
 * Shared component factories for cards, modals, and search
 */

(function() {
    'use strict';

    // Ensure SPLUNKed namespace exists
    window.SPLUNKed = window.SPLUNKed || {};

    // ============================================
    // Icon Definitions
    // ============================================

    const CARD_ICONS = {
        // Command pipeline stages
        get: { icon: '\u2193', label: 'Get data' },          // ↓
        filter: { icon: '\u29a9', label: 'Filter' },         // ⧩
        transform: { icon: '\u27f3', label: 'Transform' },   // ⟳
        aggregate: { icon: '\u03a3', label: 'Aggregate' },   // Σ
        combine: { icon: '\u2295', label: 'Combine' },       // ⊕
        output: { icon: '\u25a4', label: 'Output' },         // ▤

        // Function types
        functions: { icon: '\u0192', label: 'Eval Function' },     // ƒ
        statsFunctions: { icon: '\u2211', label: 'Stats Function' }, // ∑

        // Reference categories
        fields: { icon: '\u2b1a', label: 'Field' },          // ⬚
        concepts: { icon: '\u25c6', label: 'Concept' },      // ◆
        cim: { icon: '\u29c9', label: 'CIM' },               // ⧉
        extractions: { icon: '\u22d4', label: 'Extraction' }, // ⋔
        macros: { icon: '{ }', label: 'Macro' },
        engineering: { icon: '\u2699', label: 'Engineering' }, // ⚙

        // Antipatterns
        antipatterns: { icon: '\u26a0', label: 'Pitfall' },  // ⚠

        // Enterprise Security subcategories
        rba: { icon: '\u26a1', label: 'Risk-Based Alerting' },  // ⚡
        notable: { icon: '\u25c9', label: 'Notable Events' },   // ◉
        assetIdentity: { icon: '\u25ce', label: 'Asset/Identity' }, // ◎
        threatIntel: { icon: '\u229b', label: 'Threat Intel' }, // ⊛
        datamodels: { icon: '\u25c8', label: 'Data Models' },   // ◈
        correlation: { icon: '\u2b14', label: 'Correlation' },  // ⬔
        investigation: { icon: '\u25c7', label: 'Investigation' }, // ◇
        mitre: { icon: '\u2b21', label: 'MITRE ATT&CK' },       // ⬡
        content: { icon: '\u25a7', label: 'Content' },          // ▧
        enterpriseSecurity: { icon: '\u26e8', label: 'Enterprise Security' }, // ⛨
        detection: { icon: '\u25c7', label: 'Detection' },
        operations: { icon: '\u2699', label: 'Operations' },

        // Training types
        guide: { icon: '\ud83d\udcd6', label: 'Guide' },     // 📖
        tutorial: { icon: '\u25b7', label: 'Tutorial' },      // ▷
        scenario: { icon: '\u25ce', label: 'Scenario' },      // ◎
        challenge: { icon: '\u2605', label: 'Challenge' },    // ★
        pipeline: { icon: '\u2192', label: 'Pipeline' }       // →
    };

    // ============================================
    // Unified Card Component
    // ============================================

    /**
     * Create a card HTML string
     * @param {Object} entry - Card data
     * @param {Object} [options] - Card options
     * @param {string} [options.variant] - Card variant: 'glossary', 'query', 'training', 'guide', 'pipeline'
     * @param {boolean} [options.showSubcategory] - Show subcategory badge
     * @param {boolean} [options.showIcon] - Show card icon (default: true)
     * @returns {string} - HTML string
     */
    function createCard(entry, options = {}) {
        const { variant = 'glossary', showSubcategory = false, showIcon = true } = options;

        switch (variant) {
            case 'glossary':
            case 'reference':
                return createGlossaryCard(entry, { showSubcategory, showIcon });
            case 'query':
                return createQueryCard(entry);
            case 'training':
                return createTrainingCard(entry);
            case 'guide':
                return createGuideCard(entry);
            case 'pipeline':
                return createPipelineCard(entry);
            default:
                return createGlossaryCard(entry, { showSubcategory, showIcon });
        }
    }

    /**
     * Create glossary/reference style card
     */
    function createGlossaryCard(entry, options = {}) {
        const { showSubcategory = false, showIcon = true } = options;
        const escapeHtml = window.SPLUNKed.escapeHtml || defaultEscapeHtml;

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
        // ES entries use subcategory
        else if (entry.subcategory && CARD_ICONS[entry.subcategory]) {
            iconKey = entry.subcategory;
            iconClass = entry.subcategory;
        }
        // Other categories use source category
        else if (CARD_ICONS[entryCategory]) {
            iconKey = entryCategory;
            iconClass = entryCategory;
        }

        // Build the card icon
        let cardIcon = '';
        if (showIcon && iconKey && CARD_ICONS[iconKey]) {
            const { icon, label } = CARD_ICONS[iconKey];
            cardIcon = `<span class="card-icon ${iconClass}" title="${label}">${icon}</span>`;
        }

        return `
            <div class="glossary-card" data-id="${entry.id}" data-category="${entryCategory}">
                ${cardIcon}
                <div class="glossary-card-header">
                    <code class="glossary-name">${escapeHtml(entry.name)}</code>
                    ${experimentalBadge}
                </div>
                <p class="glossary-takeaway">${escapeHtml(entry.takeaway)}</p>
            </div>
        `;
    }

    /**
     * Create query library style card
     */
    function createQueryCard(query) {
        const escapeHtml = window.SPLUNKed.escapeHtml || defaultEscapeHtml;
        const highlightSPL = window.SPLUNKed.highlightSPL;
        const categories = window.QUERY_CATEGORIES || {};
        const category = categories[query.category] || { icon: '', name: query.category };

        // Get first 3 lines of SPL for preview
        const splLines = query.spl.split('\n');
        const splPreview = splLines.slice(0, 3).join('\n');
        const hasMoreLines = splLines.length > 3;

        // Apply syntax highlighting if available
        const highlightedPreview = highlightSPL
            ? highlightSPL(splPreview)
            : escapeHtml(splPreview);

        // Build metadata badges
        const metadataBadges = [];
        if (query.dataSource) {
            metadataBadges.push(`<span class="query-meta-badge data-source" title="Data Source">${escapeHtml(query.dataSource)}</span>`);
        }
        if (query.mitre) {
            const mitreArray = Array.isArray(query.mitre) ? query.mitre : [query.mitre];
            mitreArray.forEach(technique => {
                metadataBadges.push(`<span class="query-meta-badge mitre" title="MITRE ATT&CK">${escapeHtml(technique)}</span>`);
            });
        }
        if (query.useCase) {
            metadataBadges.push(`<span class="query-meta-badge use-case" title="Use Case">${escapeHtml(query.useCase)}</span>`);
        }

        return `
            <div class="query-card" data-id="${query.id}" data-category="${query.category}" data-difficulty="${query.difficulty}">
                <div class="query-card-header">
                    <span class="query-category-icon">${category.icon}</span>
                    <span class="query-difficulty-badge ${query.difficulty}">${query.difficulty}</span>
                </div>
                <h3 class="query-card-title">${escapeHtml(query.title)}</h3>
                <p class="query-card-description">${escapeHtml(query.description)}</p>
                ${metadataBadges.length > 0 ? `<div class="query-card-meta">${metadataBadges.join('')}</div>` : ''}
                <div class="query-card-preview${hasMoreLines ? ' has-more' : ''}">
                    <pre><code>${highlightedPreview}</code></pre>
                </div>
                <div class="query-card-footer">
                    <div class="query-tags">
                        ${query.tags.slice(0, 3).map(tag => `<span class="query-tag">${escapeHtml(tag)}</span>`).join('')}
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

    /**
     * Create training module style card (tutorial, scenario, challenge)
     */
    function createTrainingCard(module) {
        const escapeHtml = window.SPLUNKed.escapeHtml || defaultEscapeHtml;
        const typeIcons = {
            tutorial: '\u25b7',  // ▷
            scenario: '\u25ce',  // ◎
            challenge: '\u2605'  // ★
        };

        const tagsHtml = (module.tags || []).slice(0, 3)
            .map(tag => `<span class="training-tag">${escapeHtml(tag)}</span>`)
            .join('');

        return `
            <div class="training-card" data-id="${module.id}">
                <div class="training-card-header">
                    <span class="training-type-badge ${module.type}">
                        <span class="type-icon">${typeIcons[module.type] || ''}</span>
                        ${capitalize(module.type)}
                    </span>
                </div>
                <h3 class="training-card-title">${escapeHtml(module.title)}</h3>
                <p class="training-card-description">${escapeHtml(module.description)}</p>
                <div class="training-card-meta">
                    <span class="training-duration">${escapeHtml(module.duration)}</span>
                </div>
                <div class="training-card-tags">${tagsHtml}</div>
            </div>
        `;
    }

    /**
     * Create guide style card
     */
    function createGuideCard(guide) {
        const escapeHtml = window.SPLUNKed.escapeHtml || defaultEscapeHtml;

        return `
            <div class="guide-card" data-id="${guide.id}">
                <div class="guide-card-header">
                    <span class="guide-type-badge">
                        <span class="type-icon">\ud83d\udcd6</span>
                        Lesson
                    </span>
                </div>
                <h3 class="guide-card-title">${escapeHtml(guide.title)}</h3>
                <p class="guide-card-description">${escapeHtml(guide.description)}</p>
                <div class="guide-card-footer">
                    <span class="guide-open-cta">Open Lesson \u2192</span>
                </div>
            </div>
        `;
    }

    /**
     * Create pipeline style card
     */
    function createPipelineCard(pipeline) {
        const escapeHtml = window.SPLUNKed.escapeHtml || defaultEscapeHtml;
        const levelLabels = {
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced'
        };
        const track = pipeline.track || 'Power User';
        const trackClass = track.toLowerCase().replace(/\s+/g, '-');

        const objectivesHtml = (pipeline.objectives || []).slice(0, 3)
            .map(obj => `<li>${escapeHtml(obj)}</li>`)
            .join('');

        return `
            <div class="pipeline-card" data-id="${pipeline.id}">
                <div class="pipeline-card-icon">${pipeline.icon || ''}</div>
                <div class="pipeline-card-header">
                    <span class="pipeline-level-badge ${pipeline.level}">${levelLabels[pipeline.level] || pipeline.level}</span>
                    <span class="pipeline-track-badge ${trackClass}">${escapeHtml(track)}</span>
                    <span class="pipeline-duration">${escapeHtml(pipeline.duration)}</span>
                </div>
                <h3 class="pipeline-card-title">${escapeHtml(pipeline.title)}</h3>
                <p class="pipeline-card-description">${escapeHtml(pipeline.description)}</p>
                <div class="pipeline-card-objectives">
                    <ul>${objectivesHtml}</ul>
                </div>
                <div class="pipeline-card-footer">
                    <span class="pipeline-step-count">${pipeline.steps ? pipeline.steps.length : 0} steps</span>
                    <span class="pipeline-start-cta">Start Learning \u2192</span>
                </div>
            </div>
        `;
    }

    // ============================================
    // Enhanced Modal System
    // ============================================

    let openModalCount = 0;
    const modalHistory = {};

    /**
     * Open a modal
     * @param {string} modalId - Modal ID (without Overlay suffix)
     */
    function openModal(modalId) {
        const overlay = document.getElementById(`${modalId}Overlay`);
        if (!overlay || overlay.classList.contains('open')) return;

        overlay.classList.add('open');
        openModalCount += 1;
        if (openModalCount === 1) {
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close a modal
     * @param {string} modalId - Modal ID (without Overlay suffix)
     */
    function closeModal(modalId) {
        const overlay = document.getElementById(`${modalId}Overlay`);
        if (!overlay || !overlay.classList.contains('open')) return;

        overlay.classList.remove('open');
        openModalCount = Math.max(0, openModalCount - 1);
        if (openModalCount === 0) {
            document.body.style.overflow = '';
        }
    }

    /**
     * Set modal content dynamically
     * @param {string} modalId - Modal ID
     * @param {Object} content - Content to set
     * @param {string} [content.title] - Modal title
     * @param {string} [content.body] - Modal body HTML
     * @param {Object} [options] - Options
     * @param {boolean} [options.addToHistory] - Track for back navigation
     * @param {any} [options.historyData] - Data to store in history
     */
    function setModalContent(modalId, content, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const titleEl = modal.querySelector('.modal-title, [id$="ModalTitle"]');
        const bodyEl = modal.querySelector('.modal-body, [id$="ModalContent"], [id$="ModalBody"]');

        if (content.title && titleEl) {
            titleEl.textContent = content.title;
        }

        if (content.body && bodyEl) {
            bodyEl.innerHTML = content.body;
        }

        // Track history if requested
        if (options.addToHistory && options.historyData) {
            if (!modalHistory[modalId]) {
                modalHistory[modalId] = [];
            }
            modalHistory[modalId].push(options.historyData);
        }
    }

    /**
     * Go back in modal history
     * @param {string} modalId - Modal ID
     * @returns {any|null} - Previous history entry or null
     */
    function modalGoBack(modalId) {
        const history = modalHistory[modalId];
        if (history && history.length > 1) {
            history.pop(); // Remove current
            return history[history.length - 1]; // Return previous
        }
        return null;
    }

    /**
     * Clear modal history
     * @param {string} modalId - Modal ID
     */
    function clearModalHistory(modalId) {
        modalHistory[modalId] = [];
    }

    /**
     * Check if modal has history
     * @param {string} modalId - Modal ID
     * @returns {boolean}
     */
    function hasModalHistory(modalId) {
        return modalHistory[modalId] && modalHistory[modalId].length > 1;
    }

    /**
     * Initialize modal with standard event handlers
     * @param {string} modalId - Modal ID (without Overlay suffix)
     * @returns {Object} - Modal controller
     */
    function initModal(modalId) {
        const overlay = document.getElementById(`${modalId}Overlay`);
        const modal = document.getElementById(modalId);

        if (!overlay || !modal) return null;

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
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('open')) {
                closeModal(modalId);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        return {
            open: () => openModal(modalId),
            close: () => closeModal(modalId),
            setContent: (content, options) => setModalContent(modalId, content, options),
            goBack: () => modalGoBack(modalId),
            clearHistory: () => clearModalHistory(modalId),
            hasHistory: () => hasModalHistory(modalId)
        };
    }

    // ============================================
    // Unified Detail Section Factory
    // ============================================

    /**
     * Standard section types for detail modals
     */
    const SECTION_TYPES = {
        what: { header: 'WHAT', className: 'section-what' },
        why: { header: 'WHY', className: 'section-why' },
        whyItMatters: { header: 'WHY IT MATTERS', className: 'section-why' },
        keyPoint: { header: 'KEY POINT', className: 'section-key' },
        syntax: { header: 'SYNTAX', className: 'section-syntax' },
        usage: { header: 'USAGE', className: 'section-syntax' },
        examples: { header: 'EXAMPLES', className: 'section-examples' },
        moreExamples: { header: 'MORE EXAMPLES', className: 'section-examples' },
        gotchas: { header: 'WATCH OUT', className: 'section-gotchas' },
        performance: { header: 'PERFORMANCE', className: 'section-perf' },
        keyFields: { header: 'KEY FIELDS', className: 'section-fields' },
        commonMacros: { header: 'COMMON MACROS', className: 'section-macros' },
        dataModels: { header: 'ES DATA MODELS', className: 'section-datamodels' },
        actionTypes: { header: 'ACTION TYPES', className: 'section-actions' },
        suppressionFields: { header: 'COMMON SUPPRESSION PATTERNS', className: 'section-suppression' },
        workflow: { header: 'INVESTIGATION WORKFLOW', className: 'section-workflow' },
        advanced: { header: 'ADVANCED PATTERNS', className: 'section-advanced' },
        internals: { header: 'INTERNALS', className: 'section-internals' },
        alternatives: { header: 'VS. ALTERNATIVES', className: 'section-alternatives' },
        commonUses: { header: 'COMMON USES', className: 'section-uses' },
        related: { header: 'RELATED', className: 'section-related' },
        relatedConcepts: { header: 'RELATED CONCEPTS', className: 'section-related' }
    };

    /**
     * Create a detail section HTML
     * @param {string} type - Section type from SECTION_TYPES
     * @param {any} content - Section content
     * @param {Object} [options] - Rendering options
     * @returns {string} HTML string
     */
    function createDetailSection(type, content, options = {}) {
        if (!content || (Array.isArray(content) && content.length === 0)) return '';

        const escapeHtml = window.SPLUNKed.escapeHtml || defaultEscapeHtml;
        const sectionInfo = SECTION_TYPES[type] || { header: type.toUpperCase(), className: '' };

        let innerHtml = '';

        switch (type) {
            case 'what':
            case 'why':
            case 'whyItMatters':
            case 'performance':
            case 'internals':
                innerHtml = `<div class="tabbed-section-content">${escapeHtml(content)}</div>`;
                break;

            case 'keyPoint':
                innerHtml = `<div class="tabbed-section-content"><strong>${escapeHtml(content)}</strong></div>`;
                break;

            case 'syntax':
                innerHtml = `<div class="tabbed-section-content"><pre class="spl-example">${escapeHtml(content)}</pre></div>`;
                break;

            case 'usage':
                innerHtml = `<div class="tabbed-section-content"><p class="syntax-note">${escapeHtml(content)}</p></div>`;
                break;

            case 'examples':
            case 'moreExamples':
                innerHtml = `<div class="tabbed-section-content">${content.map(ex => `
                    <div class="example-pair">
                        <div class="spl-block">
                            <pre class="spl-code"><code>${escapeHtml(ex.spl)}</code></pre>
                        </div>
                        <p class="example-explanation">${escapeHtml(ex.explanation)}</p>
                    </div>
                `).join('')}</div>`;
                break;

            case 'gotchas':
                innerHtml = `<div class="tabbed-section-content">
                    <ul class="warning-list">
                        ${content.map(g => `<li><span class="warning-icon">!</span> ${escapeHtml(g)}</li>`).join('')}
                    </ul>
                </div>`;
                break;

            case 'commonUses':
                innerHtml = `<div class="tabbed-section-content">
                    <ul class="uses-list">
                        ${content.map(u => `<li><span class="use-arrow">\u2192</span> ${escapeHtml(u)}</li>`).join('')}
                    </ul>
                </div>`;
                break;

            case 'keyFields':
            case 'commonMacros':
            case 'dataModels':
            case 'actionTypes':
                const fieldKey = type === 'commonMacros' ? 'macro' :
                                type === 'dataModels' ? 'name' :
                                type === 'actionTypes' ? 'action' : 'field';
                innerHtml = `<div class="tabbed-section-content">
                    <table class="field-table">
                        ${content.map(f => `
                            <tr>
                                <td><code>${escapeHtml(f[fieldKey])}</code></td>
                                <td>${escapeHtml(f.description)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>`;
                break;

            case 'suppressionFields':
                innerHtml = `<div class="tabbed-section-content">
                    <table class="field-table">
                        <tr style="font-weight: 600; border-bottom: 1px solid var(--border-subtle);">
                            <td>Scenario</td><td>Suppress By</td><td>Window</td>
                        </tr>
                        ${content.map(s => `
                            <tr>
                                <td>${escapeHtml(s.scenario)}</td>
                                <td><code>${escapeHtml(s.fields)}</code></td>
                                <td>${escapeHtml(s.window)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>`;
                break;

            case 'workflow':
                innerHtml = `<div class="tabbed-section-content">
                    <ol class="workflow-list">
                        ${content.map(w => `<li><strong>Step ${escapeHtml(w.step)}:</strong> ${escapeHtml(w.description)}</li>`).join('')}
                    </ol>
                </div>`;
                break;

            case 'advanced':
                innerHtml = `<div class="tabbed-section-content">${content.map(ap => `
                    <div class="advanced-pattern">
                        <div class="pattern-name">${escapeHtml(ap.name)}</div>
                        <div class="spl-block">
                            <pre class="spl-code"><code>${escapeHtml(ap.spl)}</code></pre>
                        </div>
                        <p class="example-explanation">${escapeHtml(ap.explanation)}</p>
                    </div>
                `).join('')}</div>`;
                break;

            case 'alternatives':
                const findCommandData = options.findCommandData;
                innerHtml = `<div class="tabbed-section-content">
                    <ul class="alternatives-list">
                        ${Object.entries(content).map(([cmd, desc]) => {
                            const hasEntry = findCommandData && findCommandData(cmd) !== null;
                            if (hasEntry) {
                                return `<li><code class="command-link" data-command="${escapeHtml(cmd)}">${escapeHtml(cmd)}</code> \u2014 ${escapeHtml(desc)}</li>`;
                            }
                            return `<li><code class="alt-code">${escapeHtml(cmd)}</code> \u2014 ${escapeHtml(desc)}</li>`;
                        }).join('')}
                    </ul>
                </div>`;
                break;

            case 'related':
                innerHtml = `<div class="detail-content">${content.map(cmd =>
                    `<code>${escapeHtml(cmd)}</code>`).join(', ')}</div>`;
                break;

            case 'relatedConcepts':
                const relatedNames = options.relatedNames || content;
                innerHtml = `<div class="detail-content">${content.map((id, i) =>
                    `<code class="concept-link" data-concept="${escapeHtml(id)}">${escapeHtml(relatedNames[i])}</code>`).join(', ')}</div>`;
                break;

            default:
                innerHtml = `<div class="tabbed-section-content">${escapeHtml(String(content))}</div>`;
        }

        // Footer sections have different structure
        if (type === 'related' || type === 'relatedConcepts') {
            return `
                <div class="tabbed-footer" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                    <div class="detail-section">
                        <div class="detail-label">${sectionInfo.header}</div>
                        ${innerHtml}
                    </div>
                </div>
            `;
        }

        return `
            <div class="tabbed-section ${sectionInfo.className}">
                <div class="tabbed-section-header">${sectionInfo.header}</div>
                ${innerHtml}
            </div>
        `;
    }

    /**
     * Create complete detail content from an entry object
     * @param {Object} entry - Data entry with various fields
     * @param {Object} [options] - Options including findCommandData, getConceptName
     * @returns {string} Complete HTML for detail modal body
     */
    function createDetailContent(entry, options = {}) {
        const sections = [];

        // Standard sections in order
        if (entry.what) sections.push(createDetailSection('what', entry.what));
        if (entry.why) sections.push(createDetailSection(entry.keyPoint ? 'whyItMatters' : 'why', entry.why));
        if (entry.keyPoint) sections.push(createDetailSection('keyPoint', entry.keyPoint));
        if (entry.syntax) sections.push(createDetailSection('syntax', entry.syntax));
        if (entry.syntaxNote) sections.push(createDetailSection('usage', entry.syntaxNote));
        if (entry.examples?.length) sections.push(createDetailSection('examples', entry.examples));
        if (entry.gotchas?.length) sections.push(createDetailSection('gotchas', entry.gotchas));
        if (entry.keyFields?.length) sections.push(createDetailSection('keyFields', entry.keyFields));
        if (entry.commonMacros?.length) sections.push(createDetailSection('commonMacros', entry.commonMacros));
        if (entry.dataModels?.length) sections.push(createDetailSection('dataModels', entry.dataModels));
        if (entry.actionTypes?.length) sections.push(createDetailSection('actionTypes', entry.actionTypes));
        if (entry.suppressionFields?.length) sections.push(createDetailSection('suppressionFields', entry.suppressionFields));
        if (entry.workflow?.length) sections.push(createDetailSection('workflow', entry.workflow));
        if (entry.performance) sections.push(createDetailSection('performance', entry.performance));

        // Footer sections
        if (entry.relatedCommands?.length) {
            sections.push(createDetailSection('related', entry.relatedCommands));
        }
        if (entry.relatedConcepts?.length && options.getConceptName) {
            const relatedNames = entry.relatedConcepts.map(id => options.getConceptName(id));
            sections.push(createDetailSection('relatedConcepts', entry.relatedConcepts, { relatedNames }));
        }

        return `<div class="zone-content">${sections.join('')}</div>`;
    }

    // ============================================
    // Subcategory Labels (Unified Source)
    // ============================================

    const SUBCATEGORY_LABELS = {
        // Glossary
        functions: 'Eval Function',
        statsFunctions: 'Stats Function',
        // References
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

    // ============================================
    // Utility Functions
    // ============================================

    function defaultEscapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ============================================
    // Export to SPLUNKed namespace
    // ============================================

    window.SPLUNKed.CARD_ICONS = CARD_ICONS;
    window.SPLUNKed.SUBCATEGORY_LABELS = SUBCATEGORY_LABELS;
    window.SPLUNKed.SECTION_TYPES = SECTION_TYPES;

    window.SPLUNKed.components = {
        createCard,
        createGlossaryCard,
        createQueryCard,
        createTrainingCard,
        createGuideCard,
        createPipelineCard,
        createDetailSection,
        createDetailContent,
        CARD_ICONS,
        SUBCATEGORY_LABELS,
        SECTION_TYPES
    };

    // Modal management
    window.SPLUNKed.modal = {
        open: openModal,
        close: closeModal,
        setContent: setModalContent,
        goBack: modalGoBack,
        clearHistory: clearModalHistory,
        hasHistory: hasModalHistory,
        init: initModal
    };

    // Backward compatibility - keep existing function signatures
    window.SPLUNKed.openModal = openModal;
    window.SPLUNKed.closeModal = closeModal;
    window.SPLUNKed.initModal = initModal;

    // Utility
    if (!window.SPLUNKed.escapeHtml) {
        window.SPLUNKed.escapeHtml = defaultEscapeHtml;
    }

})();
