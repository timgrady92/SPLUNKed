/**
 * SPLUNKed Core - Data Loading Module
 * Centralized data loading with caching and promise deduplication
 */

(function() {
    'use strict';

    // Ensure SPLUNKed namespace exists
    window.SPLUNKed = window.SPLUNKed || {};

    // ============================================
    // Data Cache and Loading
    // ============================================

    const DATA_CACHE = {};
    const DATA_PROMISES = {};

    /**
     * Load JSON data once with caching and deduplication
     * @param {string} cacheKey - Key for caching
     * @param {string} url - URL to fetch
     * @returns {Promise<any>} - Resolved data or null on error
     */
    function loadJsonOnce(cacheKey, url) {
        if (DATA_CACHE[cacheKey]) {
            return Promise.resolve(DATA_CACHE[cacheKey]);
        }

        if (!DATA_PROMISES[cacheKey]) {
            DATA_PROMISES[cacheKey] = fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to load ${url}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    DATA_CACHE[cacheKey] = data;
                    return data;
                })
                .catch((error) => {
                    console.error(error);
                    delete DATA_PROMISES[cacheKey];
                    return null;
                });
        }

        return DATA_PROMISES[cacheKey];
    }

    /**
     * Get cached data without fetching
     * @param {string} cacheKey - Key to retrieve
     * @returns {any|null} - Cached data or null
     */
    function getCached(cacheKey) {
        return DATA_CACHE[cacheKey] || null;
    }

    /**
     * Clear cached data
     * @param {string} [cacheKey] - Optional specific key to clear, or all if omitted
     */
    function clearCache(cacheKey) {
        if (cacheKey) {
            delete DATA_CACHE[cacheKey];
            delete DATA_PROMISES[cacheKey];
        } else {
            Object.keys(DATA_CACHE).forEach(key => delete DATA_CACHE[key]);
            Object.keys(DATA_PROMISES).forEach(key => delete DATA_PROMISES[key]);
        }
    }

    // ============================================
    // Feature-specific Data Loaders
    // ============================================

    /**
     * Load glossary data and sync SPL syntax highlighting
     */
    function loadGlossaryData() {
        return loadJsonOnce('glossary', '/static/data/glossary.json')
            .then((data) => {
                if (data) {
                    window.GLOSSARY_DATA = data;
                    syncSPLSyntax(data);
                    // Re-apply highlighting with updated syntax
                    if (window.SPLUNKed.applySPLHighlighting) {
                        window.SPLUNKed.applySPLHighlighting(document, { force: true });
                    }
                }
                return data;
            });
    }

    /**
     * Load references data (concepts, fields, extractions, etc.)
     */
    function loadReferencesData() {
        return loadJsonOnce('references', '/static/data/references.json')
            .then((data) => {
                if (data) {
                    window.REFERENCE_DATA = data;
                }
                return data;
            });
    }

    /**
     * Load training index data (metadata only; content fetched on demand)
     */
    function loadTrainingData() {
        return loadJsonOnce('training', '/api/training/index')
            .then((data) => {
                if (data) {
                    window.LESSONS_DATA = data.lessons || {};
                    window.TRAINING_DATA = data.training || {};
                    window.PIPELINES_DATA = data.pipelines || [];
                }
                return data;
            });
    }

    /**
     * Load query library data
     */
    function loadQueryData() {
        return loadJsonOnce('queries', '/static/data/queries.json')
            .then((data) => {
                if (data) {
                    window.QUERY_CATEGORIES = data.categories || {};
                    window.QUERY_LIBRARY = data.library || [];
                }
                return data;
            });
    }

    /**
     * Sync SPL syntax definitions from glossary data
     * Updates the global SPL_SYNTAX object with commands and functions from glossary
     */
    function syncSPLSyntax(glossaryData) {
        if (!glossaryData || !window.SPL_SYNTAX) return;

        const commandNames = (glossaryData.commands || []).map(entry => entry.name);
        const functionNames = [
            ...(glossaryData.functions || []).map(entry => entry.name),
            ...(glossaryData.statsFunctions || []).map(entry => entry.name)
        ];

        const unique = (items) => [...new Set(items.filter(Boolean))];

        window.SPL_SYNTAX.commands = unique(commandNames);
        window.SPL_SYNTAX.functions = unique(functionNames);
    }

    // ============================================
    // Export to SPLUNKed namespace
    // ============================================

    // Data loading functions
    window.SPLUNKed.data = {
        loadJsonOnce,
        getCached,
        clearCache,
        loadGlossaryData,
        loadReferencesData,
        loadTrainingData,
        loadQueryData,
        syncSPLSyntax
    };

    // Backward compatibility - expose at top level
    window.SPLUNKed.loadJsonOnce = loadJsonOnce;
    window.SPLUNKed.loadGlossaryData = loadGlossaryData;
    window.SPLUNKed.loadReferencesData = loadReferencesData;
    window.SPLUNKed.loadTrainingData = loadTrainingData;
    window.SPLUNKed.loadQueryData = loadQueryData;
    window.SPLUNKed.syncSPLSyntax = syncSPLSyntax;

})();
