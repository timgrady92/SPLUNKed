/**
 * Training Center - SPLUNKed
 * Unified learning hub: How-To Guides, Tutorials, Scenarios, Challenges, and Learning Paths
 */
(function() {
'use strict';

// ============================================
// Guides Data (merged from guides.js)
// ============================================

let GUIDES_DATA = {}


// ============================================
// Training Data (tutorials, scenarios, challenges)
// ============================================

let TRAINING_DATA = []


// ============================================
// Training Pipelines Data
// ============================================


// ============================================
// Training Pipelines Data
// ============================================

let PIPELINES_DATA = []




// ============================================
// State Management
// ============================================

let currentTab = 'guides';  // Default tab
let trainingSearch = '';
let currentModalData = null;
let currentScenarioStep = 0;
let revealedHints = new Set();

// Map training data categories to display levels
const LEVEL_CATEGORIES = {
    gettingStarted: ['foundations', 'coreSkills'],
    levelingUp: ['intermediate'],
    mastery: ['advanced', 'expert']
};

const LEVEL_NAMES = {
    gettingStarted: 'Getting Started',
    levelingUp: 'Leveling Up',
    mastery: 'Mastery'
};

// ============================================
// Initialization
// ============================================

async function initTrainingOnReady() {
    if (initTrainingOnReady.done) return;
    initTrainingOnReady.done = true;

    if (window.SPLUNKed?.loadTrainingData) {
        const data = await SPLUNKed.loadTrainingData();
        GUIDES_DATA = data?.guides || {};
        TRAINING_DATA = data?.training || [];
        PIPELINES_DATA = data?.pipelines || [];
    }

    // Export data for global search
    window.GUIDES_DATA = GUIDES_DATA;
    window.TRAINING_DATA = TRAINING_DATA;
    window.PIPELINES_DATA = PIPELINES_DATA;

    const storageKey = 'splunked-training-tab';
    const tabController = SPLUNKed.initTabs('#trainingTabs', {
        storageKey: storageKey,
        onTabChange: (tab) => {
            currentTab = tab;
            renderActiveTab();

            // Update URL without reload
            const url = new URL(window.location);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url);
        }
    });

    SPLUNKed.initSearch('trainingSearch', {
        onSearch: (query) => {
            trainingSearch = query;
            renderActiveTab();
        }
    });

    initGuideModal();
    initTrainingModal();
    initPipelineModal();

    // Check URL params for deep linking
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const openParam = urlParams.get('open');

    if (tabParam && ['guides', 'tutorials', 'scenarios', 'challenges', 'pipelines'].includes(tabParam)) {
        currentTab = tabParam;
        tabController?.activateTab(tabParam, { notify: true, persist: true });
    } else {
        renderActiveTab();
    }

    // Open specific guide if requested
    if (openParam) {
        const guide = findGuideById(openParam);
        if (guide) {
            setTimeout(() => openGuideModal(guide), 200);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initTrainingOnReady().catch((error) => {
            console.error('Failed to initialize training:', error);
        });
    });
} else {
    initTrainingOnReady().catch((error) => {
        console.error('Failed to initialize training:', error);
    });
}

function renderActiveTab() {
    switch(currentTab) {
        case 'guides':
            renderGuidesGrid();
            break;
        case 'tutorials':
            renderTutorialsGrid();
            break;
        case 'scenarios':
            renderScenariosGrid();
            break;
        case 'challenges':
            renderChallengesGrid();
            break;
        case 'pipelines':
            renderPipelinesGrid();
            break;
    }
    updateEmptyState();
}

// ============================================
// Search handled via SPLUNKed.initSearch

function updateEmptyState() {
    const emptyState = document.getElementById('trainingEmptyState');
    if (!emptyState) return;

    let hasContent = false;
    switch(currentTab) {
        case 'guides':
            hasContent = document.getElementById('guidesGrid')?.children.length > 0;
            break;
        case 'tutorials':
            hasContent = document.getElementById('tutorialsGrid')?.children.length > 0;
            break;
        case 'scenarios':
            hasContent = document.getElementById('scenariosGrid')?.children.length > 0;
            break;
        case 'challenges':
            hasContent = document.getElementById('challengesGrid')?.children.length > 0;
            break;
        case 'pipelines':
            hasContent = document.getElementById('pipelinesGrid')?.children.length > 0;
            break;
    }

    emptyState.classList.toggle('hidden', hasContent);
}

// ============================================
// Guides Rendering
// ============================================

function renderGuidesGrid() {
    const grid = document.getElementById('guidesGrid');
    if (!grid) return;

    // Flatten all guides from all categories
    let allGuides = [];
    Object.keys(GUIDES_DATA).forEach(category => {
        const guides = GUIDES_DATA[category] || [];
        guides.forEach(guide => {
            allGuides.push({ ...guide, category });
        });
    });

    // Filter by search
    if (trainingSearch) {
        allGuides = allGuides.filter(guide => {
            const searchText = (guide.title + ' ' + guide.description + ' ' + (guide.keywords || '')).toLowerCase();
            return searchText.includes(trainingSearch);
        });
    }

    grid.innerHTML = allGuides.map(guide => renderGuideCard(guide)).join('');

    // Add click handlers
    grid.querySelectorAll('.guide-card').forEach(card => {
        card.addEventListener('click', () => {
            const guideId = card.dataset.id;
            const guide = findGuideById(guideId);
            if (guide) openGuideModal(guide);
        });
    });
}

function renderGuideCard(guide) {
    return '<div class="guide-card" data-id="' + guide.id + '">' +
        '<div class="guide-card-header">' +
            '<span class="guide-type-badge">' +
                '<span class="type-icon">📖</span>' +
                'Guide' +
            '</span>' +
        '</div>' +
        '<h3 class="guide-card-title">' + guide.title + '</h3>' +
        '<p class="guide-card-description">' + guide.description + '</p>' +
        '<div class="guide-card-footer">' +
            '<span class="guide-open-cta">Open Guide →</span>' +
        '</div>' +
    '</div>';
}

function findGuideById(id) {
    for (const category of Object.keys(GUIDES_DATA)) {
        const guide = GUIDES_DATA[category].find(g => g.id === id);
        if (guide) return { ...guide, category };
    }
    return null;
}

// ============================================
// Tutorials Rendering
// ============================================

function renderTutorialsGrid() {
    const grid = document.getElementById('tutorialsGrid');
    if (!grid) return;

    let tutorials = getModulesByType('tutorial');

    if (trainingSearch) {
        tutorials = tutorials.filter(module => {
            const searchText = (module.title + ' ' + module.description + ' ' + module.objectives.join(' ') + ' ' + module.tags.join(' ')).toLowerCase();
            return searchText.includes(trainingSearch);
        });
    }

    grid.innerHTML = tutorials.map(module => renderTrainingCard(module)).join('');
    addTrainingCardHandlers(grid);
}

// ============================================
// Scenarios Rendering
// ============================================

function renderScenariosGrid() {
    const grid = document.getElementById('scenariosGrid');
    if (!grid) return;

    let scenarios = getModulesByType('scenario');

    if (trainingSearch) {
        scenarios = scenarios.filter(module => {
            const searchText = (module.title + ' ' + module.description + ' ' + module.objectives.join(' ') + ' ' + module.tags.join(' ')).toLowerCase();
            return searchText.includes(trainingSearch);
        });
    }

    grid.innerHTML = scenarios.map(module => renderTrainingCard(module)).join('');
    addTrainingCardHandlers(grid);
}

// ============================================
// Challenges Rendering
// ============================================

function renderChallengesGrid() {
    const grid = document.getElementById('challengesGrid');
    if (!grid) return;

    let challenges = getModulesByType('challenge');

    if (trainingSearch) {
        challenges = challenges.filter(module => {
            const searchText = (module.title + ' ' + module.description + ' ' + module.objectives.join(' ') + ' ' + module.tags.join(' ')).toLowerCase();
            return searchText.includes(trainingSearch);
        });
    }

    grid.innerHTML = challenges.map(module => renderTrainingCard(module)).join('');
    addTrainingCardHandlers(grid);
}

// ============================================
// Training Module Helpers
// ============================================

function getModulesByType(type) {
    let modules = [];
    Object.keys(TRAINING_DATA).forEach(category => {
        const categoryModules = TRAINING_DATA[category] || [];
        categoryModules.forEach(module => {
            if (module.type === type) {
                const displayLevel = Object.keys(LEVEL_CATEGORIES).find(lvl =>
                    LEVEL_CATEGORIES[lvl].includes(category)
                );
                modules.push({ ...module, category, displayLevel });
            }
        });
    });
    return modules;
}

function renderTrainingCard(module) {
    const typeIcons = {
        tutorial: '▷',
        scenario: '◎',
        challenge: '★'
    };

    const tagsHtml = module.tags.slice(0, 3).map(tag => '<span class="training-tag">' + tag + '</span>').join('');

    return '<div class="training-card" data-id="' + module.id + '">' +
        '<div class="training-card-header">' +
            '<span class="training-type-badge ' + module.type + '">' +
                '<span class="type-icon">' + (typeIcons[module.type] || '') + '</span>' +
                capitalize(module.type) +
            '</span>' +
        '</div>' +
        '<h3 class="training-card-title">' + module.title + '</h3>' +
        '<p class="training-card-description">' + module.description + '</p>' +
        '<div class="training-card-meta">' +
            '<span class="training-duration">' + module.duration + '</span>' +
        '</div>' +
        '<div class="training-card-tags">' + tagsHtml + '</div>' +
    '</div>';
}

function addTrainingCardHandlers(grid) {
    grid.querySelectorAll('.training-card').forEach(card => {
        card.addEventListener('click', () => {
            const moduleId = card.dataset.id;
            openTrainingModal(moduleId);
        });
    });
}

function findModuleWithLevel(moduleId) {
    for (const category of Object.keys(TRAINING_DATA)) {
        const module = TRAINING_DATA[category].find(m => m.id === moduleId);
        if (module) {
            const displayLevel = Object.keys(LEVEL_CATEGORIES).find(lvl =>
                LEVEL_CATEGORIES[lvl].includes(category)
            );
            return { ...module, displayLevel };
        }
    }
    return null;
}

// ============================================
// Guide Modal
// ============================================

function initGuideModal() {
    const modal = document.getElementById('guideModal');
    const overlay = document.getElementById('guideModalOverlay');
    const closeBtn = document.getElementById('guideModalClose');

    if (overlay) overlay.addEventListener('click', closeGuideModal);
    if (closeBtn) closeBtn.addEventListener('click', closeGuideModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeGuideModal();
        }
    });
}

function openGuideModal(guide) {
    const modal = document.getElementById('guideModal');
    const title = document.getElementById('guideModalTitle');
    const body = document.getElementById('guideModalBody');

    if (!modal || !title || !body) return;

    title.textContent = guide.title;
    body.innerHTML = guide.body;

    // Transform old .spl-block format to training-spl-block format with syntax highlighting
    body.querySelectorAll('.spl-block').forEach(block => {
        const codeEl = block.querySelector('.spl-code code, .spl-code');
        if (!codeEl) return;

        const splCode = codeEl.textContent.trim();

        // Check for explanation in a following .guide-explanation element
        let explanation = null;
        const nextEl = block.nextElementSibling;
        if (nextEl && nextEl.classList.contains('guide-explanation')) {
            explanation = nextEl.innerHTML;
            nextEl.remove();
        }

        // Create new training-style SPL block
        const newBlock = document.createElement('div');
        newBlock.className = 'training-spl-block';
        newBlock.innerHTML =
            '<div class="training-spl-header">' +
                '<span class="training-spl-label">SPL</span>' +
                '<button class="training-spl-copy">Copy</button>' +
            '</div>' +
            '<pre class="training-spl-code">' + highlightSpl(splCode) + '</pre>' +
            (explanation ? '<div class="training-spl-explanation">' + explanation + '</div>' : '');

        // Replace old block with new one
        block.parentNode.replaceChild(newBlock, block);
    });

    // Add copy handlers for transformed SPL blocks
    initSplCopyHandlers(body);

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function initSplCopyHandlers(container) {
    container.querySelectorAll('.training-spl-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const block = btn.closest('.training-spl-block');
            const codeEl = block.querySelector('.training-spl-code');
            if (!codeEl) return;

            // Get plain text without HTML tags
            const plainText = codeEl.textContent;

            if (window.SPLUNKed?.copyToClipboard) {
                window.SPLUNKed.copyToClipboard(plainText, btn, { label: 'Copied!' });
            } else {
                navigator.clipboard.writeText(plainText).then(() => {
                    const origText = btn.textContent;
                    btn.textContent = 'Copied!';
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.textContent = origText;
                        btn.classList.remove('copied');
                    }, 1500);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                });
            }
        });
    });
}

function closeGuideModal() {
    const modal = document.getElementById('guideModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// ============================================
// Training Modal
// ============================================

function initTrainingModal() {
    const modal = document.getElementById('trainingModal');
    const overlay = document.getElementById('trainingModalOverlay');
    const closeBtn = document.getElementById('trainingModalClose');

    if (overlay) overlay.addEventListener('click', closeTrainingModal);
    if (closeBtn) closeBtn.addEventListener('click', closeTrainingModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeTrainingModal();
        }
    });
}

function openTrainingModal(moduleId) {
    const module = findModuleWithLevel(moduleId);
    if (!module) return;

    currentModalData = module;
    currentScenarioStep = 0;
    revealedHints = new Set();

    const modal = document.getElementById('trainingModal');
    const typeBadge = document.getElementById('modalTypeBadge');
    const duration = document.getElementById('modalDuration');
    const title = document.getElementById('trainingModalTitle');
    const objectives = document.getElementById('trainingModalObjectives');
    const body = document.getElementById('trainingModalBody');
    const nav = document.getElementById('trainingModalNav');

    typeBadge.textContent = module.type;
    typeBadge.className = 'training-type-badge ' + module.type;
    duration.textContent = module.duration;
    title.textContent = module.title;

    // Render objectives
    objectives.innerHTML = '<h4>Learning Objectives</h4><ul>' +
        module.objectives.map(obj => '<li>' + obj + '</li>').join('') +
    '</ul>';

    // Render content based on type
    switch (module.type) {
        case 'tutorial':
            body.innerHTML = renderTutorialContent(module.content);
            nav.innerHTML = '';
            break;
        case 'scenario':
            body.innerHTML = renderScenarioContent(module.content);
            nav.innerHTML = renderScenarioNav(module.content.steps.length);
            initScenarioInteractivity();
            break;
        case 'challenge':
            body.innerHTML = renderChallengeContent(module.content);
            nav.innerHTML = '';
            initChallengeInteractivity();
            break;
    }

    // Add copy button handlers for SPL blocks
    initSplCopyHandlers(body);

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeTrainingModal() {
    const modal = document.getElementById('trainingModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentModalData = null;
}

// ============================================
// Pipeline Rendering
// ============================================

function renderPipelinesGrid() {
    const grid = document.getElementById('pipelinesGrid');
    if (!grid) return;

    let pipelines = PIPELINES_DATA;
    if (trainingSearch) {
        pipelines = pipelines.filter(pipeline => {
            const searchText = (pipeline.title + ' ' + pipeline.description + ' ' + pipeline.objectives.join(' ')).toLowerCase();
            return searchText.includes(trainingSearch);
        });
    }

    grid.innerHTML = pipelines.map(pipeline => renderPipelineCard(pipeline)).join('');

    grid.querySelectorAll('.pipeline-card').forEach(card => {
        card.addEventListener('click', () => {
            const pipelineId = card.dataset.id;
            openPipelineModal(pipelineId);
        });
    });
}

function renderPipelineCard(pipeline) {
    const objectivesHtml = pipeline.objectives.slice(0, 3).map(obj =>
        '<li>' + obj + '</li>'
    ).join('');

    const levelLabels = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
    };

    return '<div class="pipeline-card" data-id="' + pipeline.id + '">' +
        '<div class="pipeline-card-icon">' + pipeline.icon + '</div>' +
        '<div class="pipeline-card-header">' +
            '<span class="pipeline-level-badge ' + pipeline.level + '">' + (levelLabels[pipeline.level] || pipeline.level) + '</span>' +
            '<span class="pipeline-duration">' + pipeline.duration + '</span>' +
        '</div>' +
        '<h3 class="pipeline-card-title">' + pipeline.title + '</h3>' +
        '<p class="pipeline-card-description">' + pipeline.description + '</p>' +
        '<div class="pipeline-card-objectives">' +
            '<ul>' + objectivesHtml + '</ul>' +
        '</div>' +
        '<div class="pipeline-card-footer">' +
            '<span class="pipeline-step-count">' + pipeline.steps.length + ' steps</span>' +
            '<span class="pipeline-start-cta">Start Learning →</span>' +
        '</div>' +
    '</div>';
}

// ============================================
// Pipeline Modal
// ============================================

function initPipelineModal() {
    const modal = document.getElementById('pipelineModal');
    const overlay = document.getElementById('pipelineModalOverlay');
    const closeBtn = document.getElementById('pipelineModalClose');

    if (overlay) overlay.addEventListener('click', closePipelineModal);
    if (closeBtn) closeBtn.addEventListener('click', closePipelineModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closePipelineModal();
        }
    });
}

function openPipelineModal(pipelineId) {
    const pipeline = PIPELINES_DATA.find(p => p.id === pipelineId);
    if (!pipeline) return;

    const modal = document.getElementById('pipelineModal');
    const levelBadge = document.getElementById('pipelineLevelBadge');
    const duration = document.getElementById('pipelineDuration');
    const title = document.getElementById('pipelineModalTitle');
    const description = document.getElementById('pipelineModalDescription');
    const stepsContainer = document.getElementById('pipelineSteps');

    const levelLabels = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced'
    };

    levelBadge.textContent = levelLabels[pipeline.level] || pipeline.level;
    levelBadge.className = 'pipeline-level-badge ' + pipeline.level;
    duration.textContent = pipeline.duration;
    title.textContent = pipeline.title;
    description.textContent = pipeline.description;

    const objectivesHtml = '<div class="pipeline-objectives">' +
        '<h4>Learning Objectives</h4>' +
        '<ul>' + pipeline.objectives.map(obj => '<li>' + obj + '</li>').join('') + '</ul>' +
    '</div>';

    const stepsHtml = pipeline.steps.map((step, index) => renderPipelineStep(step, index)).join('');

    stepsContainer.innerHTML = objectivesHtml + '<div class="pipeline-steps-list">' + stepsHtml + '</div>';

    stepsContainer.querySelectorAll('.pipeline-step').forEach(stepEl => {
        stepEl.addEventListener('click', () => {
            const stepIndex = parseInt(stepEl.dataset.index);
            const step = pipeline.steps[stepIndex];
            handlePipelineStepClick(step);
        });
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePipelineModal() {
    const modal = document.getElementById('pipelineModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function renderPipelineStep(step, index) {
    const typeIcons = {
        guide: '📖',
        tutorial: '▷',
        scenario: '◎',
        reference: '📚',
        challenge: '★'
    };

    const typeLabels = {
        guide: 'Guide',
        tutorial: 'Tutorial',
        scenario: 'Scenario',
        reference: 'Reference',
        challenge: 'Challenge'
    };

    return '<div class="pipeline-step" data-index="' + index + '" data-type="' + step.type + '">' +
        '<div class="pipeline-step-number">' + (index + 1) + '</div>' +
        '<div class="pipeline-step-content">' +
            '<div class="pipeline-step-header">' +
                '<span class="pipeline-step-type ' + step.type + '">' +
                    '<span class="step-type-icon">' + (typeIcons[step.type] || '•') + '</span>' +
                    (typeLabels[step.type] || step.type) +
                '</span>' +
                '<span class="pipeline-step-duration">' + step.duration + '</span>' +
            '</div>' +
            '<h4 class="pipeline-step-title">' + step.title + '</h4>' +
            '<p class="pipeline-step-description">' + step.description + '</p>' +
        '</div>' +
        '<div class="pipeline-step-action">' +
            '<span class="step-go-icon">→</span>' +
        '</div>' +
    '</div>';
}

function handlePipelineStepClick(step) {
    switch (step.source) {
        case 'training':
            closePipelineModal();
            setTimeout(() => {
                openTrainingModal(step.sourceId);
            }, 300);
            break;
        case 'guides':
            // Open guide modal directly since guides are now in training
            closePipelineModal();
            const guide = findGuideById(step.sourceId);
            if (guide) {
                setTimeout(() => openGuideModal(guide), 300);
            } else if (step.link) {
                window.location.href = step.link;
            }
            break;
        case 'glossary':
        case 'queries':
            if (step.link) {
                window.location.href = step.link;
            }
            break;
        default:
            if (step.sourceId) {
                closePipelineModal();
                setTimeout(() => {
                    openTrainingModal(step.sourceId);
                }, 300);
            }
    }
}

// ============================================
// Tutorial Rendering
// ============================================

function renderTutorialContent(content) {
    return content.sections.map(section =>
        '<div class="tutorial-section">' +
            '<h3 class="tutorial-section-title">' + section.title + '</h3>' +
            '<div class="tutorial-section-body">' + section.body + '</div>' +
            (section.spl ? renderSplBlock(section.spl, section.explanation) : '') +
        '</div>'
    ).join('');
}

// ============================================
// Scenario Rendering
// ============================================

function renderScenarioContent(content) {
    const situationHtml = '<div class="scenario-situation">' +
        '<h3>Situation</h3>' +
        '<p>' + content.situation + '</p>' +
    '</div>';

    const stepsHtml = content.steps.map((step, index) =>
        '<div class="scenario-card" data-step="' + index + '">' +
            '<div class="scenario-card-header">' +
                '<span class="scenario-card-number">' + (index + 1) + '</span>' +
                '<p class="scenario-card-question">' + step.question + '</p>' +
                '<span class="scenario-card-toggle">' +
                    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">' +
                        '<path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
                    '</svg>' +
                '</span>' +
            '</div>' +
            '<div class="scenario-card-body">' +
                renderSplBlock(step.spl, step.analysis) +
                (step.output ? renderScenarioOutput(step.output) : '') +
                '<div class="scenario-card-finding">' +
                    '<p>' + step.finding + '</p>' +
                '</div>' +
            '</div>' +
        '</div>'
    ).join('');

    const conclusionHtml = '<div class="scenario-conclusion">' +
        '<h3>Conclusion</h3>' +
        '<p>' + content.conclusion + '</p>' +
    '</div>';

    return situationHtml + '<div class="scenario-narrative">' + stepsHtml + '</div>' + conclusionHtml;
}

function renderScenarioOutput(output) {
    if (!output || !output.columns) return '';

    if (output.rows.length === 0) {
        return '<div class="scenario-output">' +
            '<div class="scenario-output-header">' +
                '<span class="scenario-output-label">Results</span>' +
            '</div>' +
            '<div class="scenario-output-empty">' + (output.emptyMessage || 'No results found') + '</div>' +
        '</div>';
    }

    const headerHtml = output.columns.map(col => '<th>' + col + '</th>').join('');
    const rowsHtml = output.rows.map(row => {
        const cells = output.columns.map(col => '<td>' + (row[col] || '-') + '</td>').join('');
        return '<tr>' + cells + '</tr>';
    }).join('');

    const truncatedHtml = output.truncated
        ? '<div class="scenario-output-truncated">' + output.truncated + '</div>'
        : '';

    const noteHtml = output.note
        ? '<div class="scenario-output-note">' + output.note + '</div>'
        : '';

    return '<div class="scenario-output">' +
        '<div class="scenario-output-header">' +
            '<span class="scenario-output-label">Results</span>' +
        '</div>' +
        '<div class="scenario-output-table-wrapper">' +
            '<table class="scenario-output-table">' +
                '<thead><tr>' + headerHtml + '</tr></thead>' +
                '<tbody>' + rowsHtml + '</tbody>' +
            '</table>' +
        '</div>' +
        noteHtml +
        truncatedHtml +
    '</div>';
}

function renderScenarioNav(totalSteps) {
    return '';
}

function initScenarioInteractivity() {
    document.querySelectorAll('.scenario-card-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.scenario-card');
            card.classList.toggle('expanded');
        });
    });
}

// ============================================
// Challenge Rendering
// ============================================

function formatProblemText(text) {
    // Convert code blocks (```...```) to SPL blocks
    var formatted = text.replace(/```([^`]+)```/g, function(match, code) {
        var trimmedCode = code.trim();
        // Remove optional language hint like ```spl
        if (trimmedCode.toLowerCase().startsWith('spl\n')) {
            trimmedCode = trimmedCode.substring(4);
        }
        return '</p>' + renderSplBlock(trimmedCode.trim(), null) + '<p>';
    });

    // Convert inline code (`...`) to <code> tags
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert newlines to <br> for readability
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = formatted.replace(/\n/g, '<br>');

    // Clean up empty paragraphs
    formatted = formatted.replace(/<p><\/p>/g, '');
    formatted = formatted.replace(/<p><br>/g, '<p>');

    return formatted;
}

function formatInlineCode(text) {
    // Convert inline code (`...`) to <code> tags
    return text.replace(/`([^`]+)`/g, '<code>$1</code>');
}

function renderChallengeContent(content) {
    const problemHtml = '<div class="challenge-problem">' +
        '<h3>Challenge</h3>' +
        '<div class="challenge-problem-text"><p>' + formatProblemText(content.problem) + '</p></div>' +
    '</div>';

    const hintsHtml = '<div class="challenge-hints">' +
        '<h4>Hints (click to reveal)</h4>' +
        content.hints.map((hint, index) =>
            '<div class="challenge-hint" data-hint="' + index + '">' +
                '<span class="challenge-hint-number">' + (index + 1) + '</span>' +
                '<span class="challenge-hint-text">' + formatInlineCode(hint) + '</span>' +
            '</div>'
        ).join('') +
    '</div>';

    const workspaceHtml = '<div class="challenge-workspace">' +
        '<div class="challenge-workspace-header">' +
            '<h4>Your Solution</h4>' +
            '<div class="challenge-workspace-actions">' +
                '<button class="workspace-btn" id="formatSplBtn" title="Format SPL">Format</button>' +
                '<button class="workspace-btn" id="clearSplBtn" title="Clear">Clear</button>' +
            '</div>' +
        '</div>' +
        '<textarea class="challenge-spl-input" id="challengeSplInput" placeholder="Write your SPL query here..." spellcheck="false"></textarea>' +
    '</div>';

    const solutionHtml = '<div class="challenge-solution">' +
        '<div class="challenge-solution-header">' +
            '<h4>Solution</h4>' +
            '<button class="show-solution-btn" id="showSolutionBtn">Show Solution</button>' +
        '</div>' +
        '<div class="challenge-solution-content" id="challengeSolutionContent">' +
            renderSplBlock(content.solution.spl, content.solution.explanation) +
            (content.variations ? renderVariations(content.variations) : '') +
        '</div>' +
    '</div>';

    return problemHtml + hintsHtml + workspaceHtml + solutionHtml;
}

function renderVariations(variations) {
    return '<div class="challenge-variations">' +
        '<h4>Try These Variations</h4>' +
        variations.map(v =>
            '<div class="challenge-variation">' +
                '<p class="challenge-variation-desc">' + v.description + '</p>' +
                renderSplBlock(v.spl, null) +
            '</div>'
        ).join('') +
    '</div>';
}

function formatSplQuery(spl) {
    // Format SPL: new line after each pipe, trim whitespace
    if (!spl) return '';

    // Normalize whitespace around pipes and add newlines
    var formatted = spl
        .replace(/\s*\|\s*/g, '\n| ')  // Newline before each pipe
        .replace(/^\n\|\s*/, '')        // Remove leading newline if query starts with pipe
        .trim();

    return formatted;
}

function initChallengeInteractivity() {
    document.querySelectorAll('.challenge-hint').forEach(hint => {
        hint.addEventListener('click', () => {
            hint.classList.add('revealed');
        });
    });

    const showBtn = document.getElementById('showSolutionBtn');
    const solutionContent = document.getElementById('challengeSolutionContent');

    if (showBtn && solutionContent) {
        showBtn.addEventListener('click', () => {
            solutionContent.classList.add('visible');
            showBtn.style.display = 'none';
        });
    }

    // SPL Input functionality
    const splInput = document.getElementById('challengeSplInput');
    const formatBtn = document.getElementById('formatSplBtn');
    const clearBtn = document.getElementById('clearSplBtn');

    if (splInput) {
        // Auto-format on pipe: add newline after typing |
        splInput.addEventListener('keydown', function(e) {
            if (e.key === '|') {
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;
                var value = this.value;

                // Insert newline + pipe + space
                var insertion = '\n| ';
                this.value = value.substring(0, start) + insertion + value.substring(end);

                // Move cursor after the insertion
                this.selectionStart = this.selectionEnd = start + insertion.length;
            }
        });

        // Tab key inserts spaces instead of changing focus
        splInput.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });
    }

    if (formatBtn && splInput) {
        formatBtn.addEventListener('click', function() {
            splInput.value = formatSplQuery(splInput.value);
        });
    }

    if (clearBtn && splInput) {
        clearBtn.addEventListener('click', function() {
            splInput.value = '';
            splInput.focus();
        });
    }
}

// ============================================
// SPL Block Rendering
// ============================================

function renderSplBlock(spl, explanation) {
    const highlightedSpl = highlightSpl(spl);

    return '<div class="training-spl-block">' +
        '<div class="training-spl-header">' +
            '<span class="training-spl-label">SPL</span>' +
            '<button class="training-spl-copy">Copy</button>' +
        '</div>' +
        '<pre class="training-spl-code">' + highlightedSpl + '</pre>' +
        (explanation ? '<div class="training-spl-explanation">' + explanation + '</div>' : '') +
    '</div>';
}

function highlightSpl(spl, formatPipelines) {
    if (formatPipelines === undefined) formatPipelines = true;
    if (!spl) return '';

    var highlighted = spl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    var placeholders = [];
    function addPlaceholder(text, className) {
        var id = '__SPL_' + placeholders.length + '__';
        placeholders.push({ id: id, text: text, className: className });
        return id;
    }

    highlighted = highlighted.replace(/"([^"]+)"/g, function(match, content) {
        return addPlaceholder('"' + content + '"', 'spl-string');
    });
    highlighted = highlighted.replace(/'([^']+)'/g, function(match, content) {
        return addPlaceholder("'" + content + "'", 'spl-string');
    });

    var keywords = ['index', 'search', 'where', 'stats', 'eval', 'table', 'sort', 'head', 'tail',
                      'rex', 'rename', 'fields', 'lookup', 'join', 'append', 'appendcols', 'timechart',
                      'chart', 'transaction', 'eventstats', 'streamstats', 'bin', 'bucket', 'dedup',
                      'tstats', 'map', 'return', 'format', 'subsearch', 'iplocation', 'inputlookup',
                      'outputlookup', 'fillnull', 'makemv', 'mvexpand', 'earliest', 'latest', 'span',
                      'top', 'rare', 'multisearch', 'union', 'datamodel', 'from', 'pivot', 'collect',
                      'outputcsv', 'inputcsv', 'metadata', 'rest', 'mstats', 'mcatalog', 'spath'];

    keywords.forEach(function(kw) {
        var regex = new RegExp('\\b(' + kw + ')\\b', 'gi');
        highlighted = highlighted.replace(regex, function(match) { return addPlaceholder(match, 'spl-keyword'); });
    });

    var functions = ['count', 'sum', 'avg', 'min', 'max', 'dc', 'values', 'list', 'first', 'last',
                       'stdev', 'perc\\d+', 'if', 'case', 'match', 'isnull', 'isnotnull', 'coalesce',
                       'round', 'floor', 'ceil', 'len', 'substr', 'replace', 'split', 'mvcount',
                       'strftime', 'strptime', 'now', 'relative_time', 'tonumber', 'tostring',
                       'mvjoin', 'mvindex', 'mvfilter', 'mvappend', 'mvzip', 'cidrmatch', 'like',
                       'searchmatch', 'typeof', 'nullif', 'true', 'false', 'null', 'earliest', 'latest'];

    functions.forEach(function(fn) {
        var regex = new RegExp('\\b(' + fn + ')\\(', 'gi');
        highlighted = highlighted.replace(regex, function(match, fn) { return addPlaceholder(fn, 'spl-function') + '('; });
    });

    highlighted = highlighted.replace(/\b(AND|OR|NOT|AS|BY|IN)\b/gi, function(match) { return addPlaceholder(match, 'spl-operator'); });

    placeholders.forEach(function(p) {
        highlighted = highlighted.replace(p.id, '<span class="' + p.className + '">' + p.text + '</span>');
    });

    if (formatPipelines) {
        var segments = highlighted.split(/(\|)/);
        if (segments.length > 1) {
            var result = '';
            var isFirst = true;
            for (var i = 0; i < segments.length; i++) {
                var segment = segments[i];
                if (segment === '|') continue;
                var trimmedSegment = segment.trim();
                if (!trimmedSegment) continue;

                var hasPipe = i > 0 && segments[i - 1] === '|';
                if (isFirst) {
                    result += '<span class="spl-pipe-line">' + trimmedSegment + '</span>';
                    isFirst = false;
                } else if (hasPipe) {
                    result += '<span class="spl-pipe-line"><span class="spl-pipe">|</span> ' + trimmedSegment + '</span>';
                }
            }
            highlighted = result;
        }
    }

    return highlighted;
}

// ============================================
// Utility Functions
// ============================================

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

})();
