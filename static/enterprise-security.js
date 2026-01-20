/**
 * SPLUNKed - Enterprise Security (Deprecated)
 * Redirects to the consolidated Knowledge page.
 */
(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname === '/enterprise-security') {
            window.location.replace('/references?tab=enterpriseSecurity');
        }
    });
})();
