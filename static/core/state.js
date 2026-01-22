/**
 * SPLUNKed Core - State Management Module
 * Lightweight observable state for features
 */

(function() {
    'use strict';

    // Ensure SPLUNKed namespace exists
    window.SPLUNKed = window.SPLUNKed || {};

    // ============================================
    // Timing Constants
    // ============================================

    const TIMING = {
        DEBOUNCE_SEARCH: 200,
        DEBOUNCE_FILTER: 200,
        TOOLTIP_DELAY: 150,
        ANIMATION_FAST: 150,
        ANIMATION_NORMAL: 300,
        COPY_FEEDBACK: 2000
    };

    // ============================================
    // Feature State Factory
    // ============================================

    /**
     * Create a lightweight observable state for a feature
     * @param {Object} initialState - Initial state object
     * @param {Object} [options] - Configuration options
     * @param {string} [options.storageKey] - localStorage key for persistence
     * @param {string[]} [options.persistKeys] - Which keys to persist (default: all)
     * @param {Function} [options.onChange] - Global change callback
     * @returns {Object} State manager with get, set, subscribe, reset methods
     */
    function createFeatureState(initialState, options = {}) {
        const { storageKey, persistKeys, onChange } = options;

        // Deep clone initial state
        const defaultState = JSON.parse(JSON.stringify(initialState));
        let state = JSON.parse(JSON.stringify(initialState));
        const listeners = new Map();
        let listenerIdCounter = 0;

        // Load persisted state if configured
        if (storageKey) {
            try {
                const saved = localStorage.getItem(`splunked-${storageKey}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Merge persisted values into state
                    if (persistKeys) {
                        persistKeys.forEach(key => {
                            if (parsed.hasOwnProperty(key)) {
                                state[key] = parsed[key];
                            }
                        });
                    } else {
                        state = { ...state, ...parsed };
                    }
                }
            } catch (e) {
                console.warn('Failed to restore state:', e);
            }
        }

        /**
         * Get current state or a specific key
         * @param {string} [key] - Optional specific key to get
         * @returns {any} - State value or entire state
         */
        function get(key) {
            if (key !== undefined) {
                return state[key];
            }
            return { ...state };
        }

        /**
         * Set state value(s)
         * @param {string|Object} keyOrObj - Key to set or object of key/value pairs
         * @param {any} [value] - Value if key is a string
         */
        function set(keyOrObj, value) {
            const changes = {};
            const oldState = { ...state };

            if (typeof keyOrObj === 'string') {
                if (state[keyOrObj] !== value) {
                    state[keyOrObj] = value;
                    changes[keyOrObj] = { old: oldState[keyOrObj], new: value };
                }
            } else if (typeof keyOrObj === 'object') {
                Object.entries(keyOrObj).forEach(([k, v]) => {
                    if (state[k] !== v) {
                        state[k] = v;
                        changes[k] = { old: oldState[k], new: v };
                    }
                });
            }

            if (Object.keys(changes).length > 0) {
                // Notify listeners
                notifyListeners(changes, state);

                // Global callback
                if (onChange) {
                    onChange(changes, state);
                }

                // Persist if configured
                if (storageKey) {
                    persistState();
                }
            }
        }

        /**
         * Subscribe to state changes
         * @param {string|string[]|Function} keysOrCallback - Keys to watch or callback
         * @param {Function} [callback] - Callback if keys provided
         * @returns {Function} - Unsubscribe function
         */
        function subscribe(keysOrCallback, callback) {
            const id = ++listenerIdCounter;

            if (typeof keysOrCallback === 'function') {
                // Subscribe to all changes
                listeners.set(id, { keys: null, callback: keysOrCallback });
            } else {
                // Subscribe to specific keys
                const keys = Array.isArray(keysOrCallback) ? keysOrCallback : [keysOrCallback];
                listeners.set(id, { keys, callback });
            }

            // Return unsubscribe function
            return () => listeners.delete(id);
        }

        /**
         * Reset state to initial values
         * @param {string[]} [keys] - Optional specific keys to reset
         */
        function reset(keys) {
            if (keys) {
                keys.forEach(key => {
                    if (defaultState.hasOwnProperty(key)) {
                        set(key, defaultState[key]);
                    }
                });
            } else {
                set(JSON.parse(JSON.stringify(defaultState)));
            }
        }

        /**
         * Notify listeners of changes
         */
        function notifyListeners(changes, newState) {
            listeners.forEach(({ keys, callback }) => {
                if (keys === null) {
                    // Global listener
                    callback(changes, newState);
                } else {
                    // Check if any watched keys changed
                    const relevantChanges = {};
                    keys.forEach(key => {
                        if (changes[key]) {
                            relevantChanges[key] = changes[key];
                        }
                    });
                    if (Object.keys(relevantChanges).length > 0) {
                        callback(relevantChanges, newState);
                    }
                }
            });
        }

        /**
         * Persist state to localStorage
         */
        function persistState() {
            try {
                const toPersist = persistKeys
                    ? Object.fromEntries(persistKeys.map(k => [k, state[k]]))
                    : state;
                localStorage.setItem(`splunked-${storageKey}`, JSON.stringify(toPersist));
            } catch (e) {
                console.warn('Failed to persist state:', e);
            }
        }

        return { get, set, subscribe, reset };
    }

    // ============================================
    // URL State Sync Utility
    // ============================================

    /**
     * Sync state with URL parameters
     * @param {Object} stateManager - State manager from createFeatureState
     * @param {Object} keyMap - Map of state keys to URL param names
     * @returns {Object} - Methods for URL sync
     */
    function createUrlSync(stateManager, keyMap) {
        /**
         * Read URL params into state
         */
        function fromUrl() {
            const params = new URLSearchParams(window.location.search);
            const updates = {};

            Object.entries(keyMap).forEach(([stateKey, urlParam]) => {
                const value = params.get(urlParam);
                if (value !== null) {
                    updates[stateKey] = value;
                }
            });

            if (Object.keys(updates).length > 0) {
                stateManager.set(updates);
            }
        }

        /**
         * Write state to URL params
         * @param {boolean} [replace=true] - Use replaceState instead of pushState
         */
        function toUrl(replace = true) {
            const state = stateManager.get();
            const url = new URL(window.location);

            Object.entries(keyMap).forEach(([stateKey, urlParam]) => {
                const value = state[stateKey];
                if (value !== null && value !== undefined && value !== '') {
                    url.searchParams.set(urlParam, value);
                } else {
                    url.searchParams.delete(urlParam);
                }
            });

            if (replace) {
                window.history.replaceState({}, '', url);
            } else {
                window.history.pushState({}, '', url);
            }
        }

        return { fromUrl, toUrl };
    }

    // ============================================
    // Simple Local Storage Helpers
    // ============================================

    const storage = {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(`splunked-${key}`);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(`splunked-${key}`, JSON.stringify(value));
            } catch (e) {
                console.error('Storage error:', e);
            }
        },

        remove(key) {
            localStorage.removeItem(`splunked-${key}`);
        }
    };

    // ============================================
    // Export to SPLUNKed namespace
    // ============================================

    window.SPLUNKed.TIMING = TIMING;
    window.SPLUNKed.createFeatureState = createFeatureState;
    window.SPLUNKed.createUrlSync = createUrlSync;
    window.SPLUNKed.storage = storage;

})();
