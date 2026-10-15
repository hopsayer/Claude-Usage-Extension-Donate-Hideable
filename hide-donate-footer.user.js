// ==UserScript==
// @name         Claude.ai — hide donation footer
// @namespace    https://github.com/hopsayer/Claude-Usage-Extension-Donate-Hideable
// @homepageURL  https://github.com/hopsayer/Claude-Usage-Extension-Donate-Hideable
// @supportURL  https://github.com/hopsayer/Claude-Usage-Extension-Donate-Hideable/issues
// @version      1.1.1
// @description  Hides donate footer hardcoded by Claude Usage Extension and keeps sidebar spacing symmetric.
// @match        https://claude.ai/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    const KO_FI = 'a[href*="ko-fi.com"]';

    // Tunable: bottom margin added back to the last bar so the gap below the
    // sidebar matches the gap above it. Adjust if upstream changes its padding.
    const BOTTOM_MARGIN = '3px';

    function applyFix() {
        const container = document.querySelector('.ut-usage-sidebar');
        if (!container) return;

        // Hide the donate footer.
        container.querySelectorAll('.ut-sidebar-footer').forEach(footer => {
            if (!footer.querySelector(KO_FI)) return;
            if (footer.style.display === 'none'
                && footer.style.getPropertyPriority('display') === 'important') return;
            footer.style.setProperty('display', 'none', 'important');
        });

        // Recompute visibility.
        const anyVisible = Array.from(container.querySelectorAll('.ut-sidebar-footer'))
            .some(f => getComputedStyle(f).display !== 'none');

        container.classList.toggle('mb-6', anyVisible);
        container.classList.toggle('pt-1.5', !anyVisible);
        container.classList.toggle('ut-no-footers', !anyVisible);

        const bars = container.querySelector('.ut-bars-container');
        const lastRow = bars?.querySelector('.ut-limit-row:last-child');
        const utContainer = bars?.closest('.ut-container');

        // Spacing fix: when no footer is visible, the extension leaves extra
        // trailing space below the last bar. Strip it, then add back BOTTOM_MARGIN
        // so the gap below the sidebar matches the gap above it.
        if (!anyVisible) {
            if (lastRow) lastRow.style.setProperty('margin-bottom', BOTTOM_MARGIN, 'important');
            if (utContainer) utContainer.style.setProperty('margin-bottom', '0', 'important');
        } else {
            if (lastRow) lastRow.style.removeProperty('margin-bottom');
            if (utContainer) utContainer.style.removeProperty('margin-bottom');
        }
    }

    let scheduled = false;
    function schedule() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => { scheduled = false; applyFix(); });
    }

    schedule();
    new MutationObserver(schedule).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
    });
})();
