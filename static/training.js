/**
 * Training Center - SPLUNKed
 * Unified learning hub: Lessons, Tutorials, Scenarios, Challenges, and Learning Paths
 */
(function() {
'use strict';

// ============================================
// Lessons Data (merged from guides.js)
// ============================================

let LESSONS_DATA = {}


// ============================================
// Training Data (tutorials, scenarios, challenges)
// ============================================

let TRAINING_DATA = {}


// ============================================
// Training Pipelines Data
// ============================================


// ============================================
// Training Pipelines Data
// ============================================

let PIPELINES_DATA = []

// Cached full training items (content fetched on demand)
const TRAINING_ITEM_CACHE = new Map();

function listToText(value) {
    if (Array.isArray(value)) {
        return value.join(' ');
    }
    return value || '';
}

async function fetchTrainingItem(itemId) {
    if (!itemId) return null;
    if (TRAINING_ITEM_CACHE.has(itemId)) {
        return TRAINING_ITEM_CACHE.get(itemId);
    }

    try {
        const response = await fetch(`/api/training/items/${encodeURIComponent(itemId)}`);
        if (!response.ok) {
            throw new Error(`Failed to load training item ${itemId}`);
        }
        const data = await response.json();
        TRAINING_ITEM_CACHE.set(itemId, data);
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}




// ============================================
// State Management
// ============================================

// Unified state management - single source of truth
let state = null;

function initState() {
    if (state) return state;

    state = window.SPLUNKed?.createFeatureState?.({
        tab: 'lessons',
        search: '',
        bucket: 'all',
        pipelineTrack: 'all'
    }, {
        storageKey: 'training',
        persistKeys: ['tab']
    });

    return state;
}

// State accessors
const getTab = () => state?.get('tab') || 'lessons';
const getSearch = () => state?.get('search') || '';
const getBucket = () => state?.get('bucket') || 'all';
const getPipelineTrack = () => state?.get('pipelineTrack') || 'all';

// Modal state (not persisted)
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

    initState();

    if (window.SPLUNKed?.loadTrainingData) {
        const data = await SPLUNKed.loadTrainingData();
        LESSONS_DATA = data?.lessons || {};
        TRAINING_DATA = data?.training || {};
        PIPELINES_DATA = data?.pipelines || [];
    }

    // Export data for global search
    window.LESSONS_DATA = LESSONS_DATA;
    window.TRAINING_DATA = TRAINING_DATA;
    window.PIPELINES_DATA = PIPELINES_DATA;

    const storageKey = 'splunked-training-tab';
    const tabController = SPLUNKed.initTabs('#trainingTabs', {
        storageKey: storageKey,
        onTabChange: (tab) => {
            state?.set('tab', tab);
            renderActiveTab();

            // Update URL without reload
            const url = new URL(window.location);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url);
        }
    });

    SPLUNKed.initSearch('trainingSearch', {
        onSearch: (query) => {
            state?.set('search', query);
            renderActiveTab();
        }
    });

    const categoryFilter = document.getElementById('trainingCategoryFilter');
    if (categoryFilter) {
        categoryFilter.value = getBucket();
        categoryFilter.addEventListener('change', () => {
            state?.set('bucket', categoryFilter.value);
            renderActiveTab();
        });
    }

    const pipelineTrackFilter = document.getElementById('pipelineTrackFilter');
    if (pipelineTrackFilter) {
        pipelineTrackFilter.value = getPipelineTrack();
        pipelineTrackFilter.addEventListener('change', () => {
            state?.set('pipelineTrack', pipelineTrackFilter.value);
            renderActiveTab();
        });
    }

    initGuideModal();
    initTrainingModal();
    initPipelineModal();
    initTrainingModals(); // Centralized escape key handler

    // Check URL params for deep linking
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const openParam = urlParams.get('open');

    const resolvedTab = tabParam === 'guides' ? 'lessons' : tabParam;
    if (resolvedTab && ['lessons', 'scenarios', 'challenges', 'pipelines'].includes(resolvedTab)) {
        state?.set('tab', resolvedTab);
        tabController?.activateTab(resolvedTab, { notify: true, persist: true });
    } else {
        renderActiveTab();
    }

    // Open specific guide if requested
    if (openParam) {
        const lesson = findLessonById(openParam);
        if (lesson) {
            setTimeout(() => openGuideModal(lesson), 200);
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
    const tab = getTab();
    switch(tab) {
        case 'lessons':
            renderLessonsGrid();
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
    updateFilterVisibility();
    updateEmptyState();
}

function updateFilterVisibility() {
    const categoryWrap = document.getElementById('trainingCategoryFilterWrap');
    if (categoryWrap) {
        categoryWrap.hidden = getTab() !== 'lessons';
    }
    const trackWrap = document.getElementById('pipelineTrackFilterWrap');
    if (trackWrap) {
        trackWrap.hidden = getTab() !== 'pipelines';
    }
}

// ============================================
// Search handled via SPLUNKed.initSearch

function updateEmptyState() {
    const gridIds = {
        lessons: 'lessonsGrid',
        scenarios: 'scenariosGrid',
        challenges: 'challengesGrid',
        pipelines: 'pipelinesGrid'
    };
    SPLUNKed.updateEmptyState(gridIds[getTab()], 'trainingEmptyState');
}

// ============================================
// Lessons Rendering
// ============================================

function renderLessonsGrid() {
    const grid = document.getElementById('lessonsGrid');
    if (!grid) return;

    const search = getSearch().toLowerCase();

    // Flatten all lessons from all categories
    let allLessons = [];
    Object.keys(LESSONS_DATA).forEach(category => {
        const lessons = LESSONS_DATA[category] || [];
        lessons.forEach(lesson => {
            allLessons.push({ ...lesson, category, contentType: 'lesson' });
        });
    });

    // Also include tutorials (now merged into lessons view)
    let tutorials = getModulesByType('tutorial');
    tutorials.forEach(tutorial => {
        allLessons.push({ ...tutorial, contentType: 'tutorial' });
    });

    // Filter by search
    if (search) {
        allLessons = allLessons.filter(item => {
            const keywords = listToText(item.keywords);
            const objectives = listToText(item.objectives);
            const tags = listToText(item.tags);
            const searchText = (
                item.title + ' ' +
                item.description + ' ' +
                keywords + ' ' +
                tags + ' ' +
                objectives
            ).toLowerCase();
            return searchText.includes(search);
        });
    }

    const bucket = getBucket();
    if (bucket && bucket !== 'all') {
        allLessons = allLessons.filter(item => item.bucket === bucket);
    }

    // Render lessons first, then tutorials
    const lessonsHtml = allLessons
        .filter(item => item.contentType === 'lesson')
        .map(lesson => renderLessonCard(lesson))
        .join('');

    const tutorialsHtml = allLessons
        .filter(item => item.contentType === 'tutorial')
        .map(tutorial => renderTrainingCard(tutorial))
        .join('');

    grid.innerHTML = lessonsHtml + tutorialsHtml;

    // Add click handlers for lessons
    grid.querySelectorAll('.guide-card').forEach(card => {
        card.addEventListener('click', () => {
            const lessonId = card.dataset.id;
            const lesson = findLessonById(lessonId);
            if (lesson) openGuideModal(lesson);
        });
    });

    // Add click handlers for tutorials
    addTrainingCardHandlers(grid);
}

/**
 * Render lesson card using shared component
 */
function renderLessonCard(lesson) {
    return SPLUNKed.components.createCard(lesson, { variant: 'guide' });
}

function findLessonById(id) {
    for (const category of Object.keys(LESSONS_DATA)) {
        const lesson = LESSONS_DATA[category].find(l => l.id === id);
        if (lesson) return { ...lesson, category };
    }
    return null;
}

// ============================================
// Tutorials Rendering
// ============================================

function renderTutorialsGrid() {
    renderModuleGrid('tutorialsGrid', 'tutorial');
}

// ============================================
// Scenarios Rendering
// ============================================

function renderScenariosGrid() {
    renderModuleGrid('scenariosGrid', 'scenario');
}

// ============================================
// Challenges Rendering
// ============================================

function renderChallengesGrid() {
    renderModuleGrid('challengesGrid', 'challenge');
}

/**
 * Unified module grid renderer
 */
function renderModuleGrid(gridId, type) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    const search = getSearch().toLowerCase();
    let modules = getModulesByType(type);

    if (search) {
        modules = modules.filter(module => {
            const objectives = listToText(module.objectives);
            const tags = listToText(module.tags);
            const searchText = (module.title + ' ' + module.description + ' ' + objectives + ' ' + tags).toLowerCase();
            return searchText.includes(search);
        });
    }

    grid.innerHTML = modules.map(module => renderTrainingCard(module)).join('');
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

/**
 * Render training card using shared component
 */
function renderTrainingCard(module) {
    return SPLUNKed.components.createCard(module, { variant: 'training' });
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

async function resolveLesson(lesson) {
    if (!lesson || lesson.body) {
        return lesson;
    }

    const full = await fetchTrainingItem(lesson.id);
    if (!full) {
        return lesson;
    }
    return { ...lesson, ...full };
}

async function resolveTrainingModule(moduleId) {
    const meta = findModuleWithLevel(moduleId);
    if (meta?.content) {
        return meta;
    }

    const full = await fetchTrainingItem(moduleId);
    if (!full) {
        return meta;
    }

    if (meta?.displayLevel && !full.displayLevel) {
        full.displayLevel = meta.displayLevel;
    }
    return { ...meta, ...full };
}

// ============================================
// Guide Modal
// ============================================

function initGuideModal() {
    const overlay = document.getElementById('guideModalOverlay');
    const closeBtn = document.getElementById('guideModalClose');

    if (overlay) overlay.addEventListener('click', closeGuideModal);
    if (closeBtn) closeBtn.addEventListener('click', closeGuideModal);
    // Escape key handling is now centralized in initTrainingModals()
}

async function openGuideModal(guide) {
    const modal = document.getElementById('guideModal');
    const title = document.getElementById('guideModalTitle');
    const body = document.getElementById('guideModalBody');

    if (!modal || !title || !body) return;

    try {
        const resolved = await resolveLesson(guide);
        if (!resolved || !resolved.body) {
            title.textContent = guide?.title || 'Lesson';
            body.innerHTML = '<p>Lesson content is coming soon.</p>';
        } else {
            title.textContent = resolved.title;
            body.innerHTML = resolved.body;
        }
    } catch (error) {
        console.error('Failed to load lesson:', error);
        title.textContent = guide?.title || 'Lesson';
        body.innerHTML = '<p>Lesson content is coming soon.</p>';
    }

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

        // Create new training-style SPL block with shared highlighting
        const highlightedCode = window.SPLUNKed?.highlightSPL
            ? window.SPLUNKed.highlightSPL(splCode, { formatPipelines: true })
            : escapeHtml(splCode);

        const newBlock = document.createElement('div');
        newBlock.className = 'training-spl-block';
        newBlock.innerHTML =
            '<div class="training-spl-header">' +
                '<span class="training-spl-label">SPL</span>' +
                '<button class="training-spl-copy">Copy</button>' +
            '</div>' +
            '<pre class="training-spl-code">' + highlightedCode + '</pre>' +
            (explanation ? '<div class="training-spl-explanation">' + explanation + '</div>' : '');

        // Replace old block with new one
        block.parentNode.replaceChild(newBlock, block);
    });

    // Add copy handlers for transformed SPL blocks
    initSplCopyHandlers(body);
    if (window.SPLUNKed?.applySPLHighlighting) {
        window.SPLUNKed.applySPLHighlighting(body, { force: true });
    }

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
    const overlay = document.getElementById('trainingModalOverlay');
    const closeBtn = document.getElementById('trainingModalClose');

    if (overlay) overlay.addEventListener('click', closeTrainingModal);
    if (closeBtn) closeBtn.addEventListener('click', closeTrainingModal);
    // Escape key handling is now centralized in initTrainingModals()
}

async function openTrainingModal(moduleId) {
    const module = await resolveTrainingModule(moduleId);
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

    if (!modal || !typeBadge || !duration || !title || !objectives || !body || !nav) {
        return;
    }

    typeBadge.textContent = module.type;
    typeBadge.className = 'training-type-badge ' + module.type;
    duration.textContent = module.duration || '';
    title.textContent = module.title || '';

    // Render objectives
    if (module.objectives && module.objectives.length) {
        objectives.innerHTML = '<h4>Learning Objectives</h4><ul>' +
            module.objectives.map(obj => '<li>' + obj + '</li>').join('') +
        '</ul>';
    } else {
        objectives.innerHTML = '<h4>Learning Objectives</h4><p>Objectives coming soon.</p>';
    }

    // Render content based on type
    if (!module.content) {
        body.innerHTML = '<p>Training content is coming soon.</p>';
        nav.innerHTML = '';
    } else {
        switch (module.type) {
            case 'tutorial':
                body.innerHTML = renderTutorialContent(module.content);
                nav.innerHTML = '';
                break;
            case 'scenario':
                body.innerHTML = renderScenarioContent(module.content);
                nav.innerHTML = renderScenarioNav(module.content.steps?.length || 0);
                initScenarioInteractivity();
                break;
            case 'challenge':
                body.innerHTML = renderChallengeContent(module.content);
                nav.innerHTML = '';
                initChallengeInteractivity();
                break;
            default:
                body.innerHTML = '<p>Training content is coming soon.</p>';
                nav.innerHTML = '';
        }
    }

    // Add copy button handlers for SPL blocks
    initSplCopyHandlers(body);
    if (window.SPLUNKed?.applySPLHighlighting) {
        window.SPLUNKed.applySPLHighlighting(body, { force: true });
    }

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

    const search = getSearch();
    let pipelines = PIPELINES_DATA;

    if (search) {
        pipelines = pipelines.filter(pipeline => {
            const searchText = (
                pipeline.title + ' ' +
                pipeline.description + ' ' +
                (pipeline.objectives || []).join(' ') + ' ' +
                (pipeline.track || '') + ' ' +
                (pipeline.level || '')
            ).toLowerCase();
            return searchText.includes(search);
        });
    }

    const trackFilter = getPipelineTrack();
    if (trackFilter && trackFilter !== 'all') {
        pipelines = pipelines.filter(pipeline => (pipeline.track || '') === trackFilter);
    }

    grid.innerHTML = pipelines.map(pipeline => renderPipelineCard(pipeline)).join('');

    grid.querySelectorAll('.pipeline-card').forEach(card => {
        card.addEventListener('click', () => {
            const pipelineId = card.dataset.id;
            openPipelineModal(pipelineId);
        });
    });
}

/**
 * Render pipeline card using shared component
 */
function renderPipelineCard(pipeline) {
    return SPLUNKed.components.createCard(pipeline, { variant: 'pipeline' });
}

// ============================================
// Pipeline Modal
// ============================================

function initPipelineModal() {
    const overlay = document.getElementById('pipelineModalOverlay');
    const closeBtn = document.getElementById('pipelineModalClose');

    if (overlay) overlay.addEventListener('click', closePipelineModal);
    if (closeBtn) closeBtn.addEventListener('click', closePipelineModal);
    // Escape key handling is now centralized in initTrainingModals()
}

/**
 * Centralized escape key handler for all training modals
 * Replaces 3 duplicate handlers with a single listener
 */
function initTrainingModals() {
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;

        const guideModal = document.getElementById('guideModal');
        const trainingModal = document.getElementById('trainingModal');
        const pipelineModal = document.getElementById('pipelineModal');

        if (guideModal?.classList.contains('open')) {
            closeGuideModal();
        } else if (trainingModal?.classList.contains('active')) {
            closeTrainingModal();
        } else if (pipelineModal?.classList.contains('active')) {
            closePipelineModal();
        }
    });
}

function openPipelineModal(pipelineId) {
    const pipeline = PIPELINES_DATA.find(p => p.id === pipelineId);
    if (!pipeline) return;

    const modal = document.getElementById('pipelineModal');
    const levelBadge = document.getElementById('pipelineLevelBadge');
    const trackBadge = document.getElementById('pipelineTrackBadge');
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
    if (trackBadge) {
        const track = pipeline.track || 'Power User';
        const trackClass = track.toLowerCase().replace(/\s+/g, '-');
        trackBadge.textContent = track;
        trackBadge.className = 'pipeline-track-badge ' + trackClass;
    }
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
        lesson: '📖',
        guide: '📖',
        tutorial: '▷',
        scenario: '◎',
        reference: '📚',
        challenge: '★'
    };

    const typeLabels = {
        lesson: 'Lesson',
        guide: 'Lesson',
        tutorial: 'Tutorial',
        scenario: 'Scenario',
        reference: 'Reference',
        challenge: 'Challenge'
    };

    return '<div class="pipeline-step" data-index="' + index + '" data-type="' + (step.type || '') + '">' +
        '<div class="pipeline-step-number">' + (index + 1) + '</div>' +
        '<div class="pipeline-step-content">' +
            '<div class="pipeline-step-header">' +
                '<span class="pipeline-step-type ' + (step.type || '') + '">' +
                    '<span class="step-type-icon">' + (typeIcons[step.type] || '•') + '</span>' +
                    (typeLabels[step.type] || step.type || 'Step') +
                '</span>' +
                '<span class="pipeline-step-duration">' + (step.duration || '') + '</span>' +
            '</div>' +
            '<h4 class="pipeline-step-title">' + (step.title || 'Untitled') + '</h4>' +
            '<p class="pipeline-step-description">' + (step.description || '') + '</p>' +
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
        case 'lessons':
            // Open lesson modal directly since lessons are now in training
            closePipelineModal();
            const lesson = findLessonById(step.sourceId);
            if (lesson) {
                setTimeout(() => openGuideModal(lesson), 300);
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

function renderTutorialExample(example) {
    if (!example || !example.spl) return '';
    return '<div class="tutorial-example">' +
        (example.description ? '<p class="tutorial-example-desc">' + example.description + '</p>' : '') +
        renderSplBlock(example.spl) +
    '</div>';
}

function renderTutorialContent(content) {
    if (!content || !Array.isArray(content.sections) || content.sections.length === 0) {
        return '<p>Training content is coming soon.</p>';
    }

    return content.sections.map(section => {
        let html = '<div class="tutorial-section">' +
            '<h3 class="tutorial-section-title">' + section.title + '</h3>' +
            '<div class="tutorial-section-body">' + section.body + '</div>';

        // Support both legacy section.spl and new section.example structure
        if (section.example) {
            html += renderTutorialExample(section.example);
        } else if (section.spl) {
            html += renderSplBlock(section.spl);
        }

        // Explanation comes after the first example
        if (section.explanation) {
            html += '<div class="tutorial-explanation">' + section.explanation + '</div>';
        }

        // Second example if present
        if (section.example2) {
            html += renderTutorialExample(section.example2);
        }

        html += '</div>';
        return html;
    }).join('');
}

// ============================================
// Scenario Rendering
// ============================================

function renderScenarioContent(content) {
    if (!content || !Array.isArray(content.steps) || content.steps.length === 0) {
        return '<p>Training content is coming soon.</p>';
    }

    // Support both 'situation' and 'background' field names
    const situationText = content.situation || content.background || '';
    const situationHtml = '<div class="scenario-situation">' +
        '<h3>Situation</h3>' +
        '<div class="scenario-situation-content">' + situationText + '</div>' +
    '</div>';

    const stepsHtml = content.steps.map((step, index) => {
        // Support both formats: question-based and title-based steps
        const headerText = step.question || step.title || 'Step ' + (index + 1);
        const spl = step.spl || step.solution || '';
        const explanation = step.analysis || step.content || '';
        const finding = step.finding || '';

        let bodyHtml = '';

        // Add explanation/content if present
        if (explanation) {
            bodyHtml += '<div class="scenario-step-content">' + explanation + '</div>';
        }

        // Add hint if present
        if (step.hint) {
            bodyHtml += '<div class="scenario-step-hint"><strong>Hint:</strong> ' + step.hint + '</div>';
        }

        // Add SPL block if present
        if (spl) {
            bodyHtml += renderSplBlock(spl);
        }

        // Add output table if present
        if (step.output) {
            bodyHtml += renderScenarioOutput(step.output);
        }

        // Add finding if present
        if (finding) {
            bodyHtml += '<div class="scenario-card-finding"><p>' + finding + '</p></div>';
        }

        // Add options for reasoning steps
        if (step.options && Array.isArray(step.options)) {
            bodyHtml += '<div class="scenario-options"><ul>' +
                step.options.map(opt => '<li>' + opt + '</li>').join('') +
            '</ul></div>';
        }

        return '<div class="scenario-card" data-step="' + index + '" data-type="' + (step.type || '') + '">' +
            '<div class="scenario-card-header">' +
                '<span class="scenario-card-number">' + (index + 1) + '</span>' +
                '<p class="scenario-card-question">' + headerText + '</p>' +
                '<span class="scenario-card-toggle">' +
                    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">' +
                        '<path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
                    '</svg>' +
                '</span>' +
            '</div>' +
            '<div class="scenario-card-body">' + bodyHtml + '</div>' +
        '</div>';
    }).join('');

    // Conclusion is optional
    let conclusionHtml = '';
    if (content.conclusion) {
        conclusionHtml = '<div class="scenario-conclusion">' +
            '<h3>Conclusion</h3>' +
            '<p>' + content.conclusion + '</p>' +
        '</div>';
    }

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
    if (!content || !content.problem || !content.solution) {
        return '<p>Training content is coming soon.</p>';
    }

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
        '<div class="challenge-spl-editor">' +
            '<pre class="challenge-spl-highlight" id="challengeSplHighlight"></pre>' +
            '<textarea class="challenge-spl-input" id="challengeSplInput" placeholder="Write your SPL query here..." spellcheck="false"></textarea>' +
        '</div>' +
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
    const splHighlight = document.getElementById('challengeSplHighlight');
    const formatBtn = document.getElementById('formatSplBtn');
    const clearBtn = document.getElementById('clearSplBtn');

    function updateSplHighlight(value) {
        if (!splHighlight) return;
        const content = value || '';
        const highlighted = window.SPLUNKed?.highlightSPL
            ? window.SPLUNKed.highlightSPL(content, { formatPipelines: false })
            : escapeHtml(content);
        splHighlight.innerHTML = highlighted || '';
    }

    if (splInput) {
        const editor = splInput.closest('.challenge-spl-editor');
        if (editor) {
            editor.classList.add('spl-highlight-ready');
        }

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
                updateSplHighlight(this.value);
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
                updateSplHighlight(this.value);
            }
        });

        splInput.addEventListener('input', function() {
            updateSplHighlight(this.value);
        });

        splInput.addEventListener('scroll', function() {
            if (!splHighlight) return;
            splHighlight.scrollTop = this.scrollTop;
            splHighlight.scrollLeft = this.scrollLeft;
        });
    }

    if (formatBtn && splInput) {
        formatBtn.addEventListener('click', function() {
            splInput.value = formatSplQuery(splInput.value);
            updateSplHighlight(splInput.value);
        });
    }

    if (clearBtn && splInput) {
        clearBtn.addEventListener('click', function() {
            splInput.value = '';
            splInput.focus();
            updateSplHighlight('');
        });
    }

    if (splInput) {
        updateSplHighlight(splInput.value);
    }
}

// ============================================
// SPL Block Rendering
// ============================================

function renderSplBlock(spl, explanation) {
    // Use shared SPL highlighting from core
    const highlightedSpl = window.SPLUNKed?.highlightSPL
        ? window.SPLUNKed.highlightSPL(spl, { formatPipelines: true })
        : escapeHtml(spl);

    return '<div class="training-spl-block">' +
        '<div class="training-spl-header">' +
            '<span class="training-spl-label">SPL</span>' +
            '<button class="training-spl-copy">Copy</button>' +
        '</div>' +
        '<pre class="training-spl-code">' + highlightedSpl + '</pre>' +
        (explanation ? '<div class="training-spl-explanation">' + explanation + '</div>' : '') +
    '</div>';
}

// Simple HTML escaping for fallback when highlightSPL is unavailable
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================
// Utility Functions
// ============================================

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

})();
