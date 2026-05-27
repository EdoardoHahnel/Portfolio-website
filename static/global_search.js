/**
 * Global header search — loads static/search-index.json once, filters locally.
 * No /api/ calls (avoids ad-blockers and fetch failures on typeahead).
 */
(function () {
    'use strict';

    var MIN_LEN = 2;
    var MAX_RESULTS = 16;
    var debounceTimer = null;
    var portalEl = null;
    var searchIndex = [];
    var indexReady = false;
    var indexLoading = false;
    var indexError = null;

    function esc(text) {
        var d = document.createElement('div');
        d.textContent = text == null ? '' : String(text);
        return d.innerHTML;
    }

    function domainFromItem(item) {
        if (item.logo_domain) return String(item.logo_domain).trim();
        var raw = (item.logo_url || '').trim();
        if (raw.indexOf('logo.clearbit.com/') !== -1) {
            var m = raw.match(/logo\.clearbit\.com\/([^/?]+)/);
            if (m) return m[1].replace(/^www\./, '');
        }
        if (raw.indexOf('domain=') !== -1) {
            var m2 = raw.match(/[?&]domain=([^&]+)/);
            if (m2) return decodeURIComponent(m2[1]).replace(/^www\./, '');
        }
        return '';
    }

    function faviconForDomain(domain) {
        if (!domain) return '';
        return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=64';
    }

    function avatarForName(name) {
        return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || '?') + '&background=3f7de8&color=fff&size=64';
    }

    /** Prefer Google favicon (reliable); skip dead Clearbit URLs. */
    function logoSrc(item) {
        var direct = (item.logo_url || '').trim();
        if (direct && direct.indexOf('ui-avatars.com') === -1 && direct.indexOf('logo.clearbit.com') === -1) {
            return direct;
        }
        if (item.logo_favicon) return item.logo_favicon;
        var domain = domainFromItem(item);
        if (domain) return faviconForDomain(domain);
        return avatarForName(item.name);
    }

    function attachLogoFallback(img, item) {
        var domain = domainFromItem(item);
        var favicon = faviconForDomain(domain);
        var avatar = avatarForName(item.name);
        var tried = 0;
        img.onerror = function () {
            tried += 1;
            if (tried === 1 && favicon && img.src !== favicon) {
                img.src = favicon;
                return;
            }
            if (tried === 2 && avatar && img.src !== avatar) {
                img.src = avatar;
                return;
            }
            img.onerror = null;
        };
    }

    function getPortal() {
        if (!portalEl) {
            portalEl = document.createElement('div');
            portalEl.id = 'peSearchPortal';
            portalEl.className = 'pe-global-search-dropdown';
            portalEl.setAttribute('role', 'listbox');
            document.body.appendChild(portalEl);
        }
        return portalEl;
    }

    function hidePortal() {
        if (!portalEl) return;
        portalEl.classList.remove('is-open');
        portalEl.innerHTML = '';
        portalEl.style.display = 'none';
    }

    function positionPortal(input) {
        var portal = getPortal();
        var rect = input.getBoundingClientRect();
        var w = Math.max(rect.width, 340);
        var left = rect.left;
        if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
        if (left < 8) left = 8;
        portal.style.display = 'block';
        portal.style.position = 'fixed';
        portal.style.top = (rect.bottom + 6) + 'px';
        portal.style.left = left + 'px';
        portal.style.width = w + 'px';
        portal.style.zIndex = '200000';
    }

    function scoreItem(q, item) {
        var name = (item.name || '').toLowerCase();
        var blob = (item.search || (name + ' ' + (item.subtitle || ''))).toLowerCase();
        var score = 0;
        if (name === q) {
            score = 100;
        } else if (name.indexOf(q) === 0) {
            score = 80;
        } else if (name.indexOf(q) !== -1) {
            score = 65;
        } else if (blob.indexOf(q) !== -1) {
            score = 50;
        }
        // Only boost investors that actually matched the query (never +5 for non-matches).
        if (score > 0 && item.type === 'firm') score += 5;
        return score;
    }

    function filterIndex(q) {
        var ql = q.toLowerCase().trim();
        if (ql.length < MIN_LEN) return [];
        var scored = [];
        for (var i = 0; i < searchIndex.length; i++) {
            var item = searchIndex[i];
            var s = scoreItem(ql, item);
            if (s > 0) scored.push({ item: item, score: s });
        }
        scored.sort(function (a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return (a.item.name || '').localeCompare(b.item.name || '', undefined, { sensitivity: 'base' });
        });
        return scored.slice(0, MAX_RESULTS).map(function (x) { return x.item; });
    }

    function renderResults(results, query, input) {
        var portal = getPortal();
        positionPortal(input);

        if (!results.length) {
            portal.innerHTML = '<div class="pe-global-search-empty"><i class="fas fa-search"></i><span>No results for “' + esc(query) + '”</span></div>';
            portal.classList.add('is-open');
            input.setAttribute('aria-expanded', 'true');
            return;
        }

        var html = '';
        var lastSection = null;

        function row(item) {
            var label = item.type === 'firm' ? 'Investor' : 'Company';
            var src = logoSrc(item);
            return '<a href="' + esc(item.url) + '" class="pe-global-search-item" data-url="' + esc(item.url) + '">' +
                '<img src="' + esc(src) + '" alt="" class="pe-global-search-item-logo" width="32" height="32" loading="lazy">' +
                '<span class="pe-global-search-item-text"><span class="pe-global-search-item-name">' + esc(item.name) + '</span>' +
                '<span class="pe-global-search-item-sub">' + esc(item.subtitle || label) + '</span></span>' +
                '<span class="pe-global-search-item-type">' + label + '</span></a>';
        }

        results.forEach(function (item) {
            var section = item.type === 'firm' ? 'Investors' : 'Portfolio companies';
            if (section !== lastSection) {
                html += '<div class="pe-global-search-section-label">' + section + '</div>';
                lastSection = section;
            }
            html += row(item);
        });

        portal.innerHTML = html;
        portal.classList.add('is-open');
        input.setAttribute('aria-expanded', 'true');

        var rowItems = results;
        portal.querySelectorAll('.pe-global-search-item-logo').forEach(function (img, idx) {
            if (rowItems[idx]) attachLogoFallback(img, rowItems[idx]);
        });

        portal.querySelectorAll('.pe-global-search-item').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                var href = el.getAttribute('data-url') || el.getAttribute('href');
                if (href) window.location.href = href;
            });
        });
    }

    function showMessage(input, html) {
        positionPortal(input);
        getPortal().innerHTML = html;
        getPortal().classList.add('is-open');
        input.setAttribute('aria-expanded', 'true');
    }

    function loadSearchIndex() {
        if (indexReady || indexLoading) {
            return Promise.resolve(indexReady);
        }
        indexLoading = true;
        var url = window.PE_SEARCH_INDEX_URL || '/static/search-index.json';
        return fetch(url, { credentials: 'same-origin' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (Array.isArray(data)) {
                    searchIndex = data;
                } else if (data && Array.isArray(data.items)) {
                    searchIndex = data.items;
                } else if (data && data.firms && data.companies) {
                    searchIndex = data.firms.concat(data.companies);
                } else {
                    throw new Error('Invalid search index format');
                }
                indexReady = true;
                indexError = null;
                return true;
            })
            .catch(function (err) {
                indexError = err;
                console.error('Search index load failed:', err);
                return false;
            })
            .finally(function () {
                indexLoading = false;
            });
    }

    function attachInput(input) {
        var activeIdx = -1;
        var wrap = input.closest('.pe-global-search');

        function runSearch() {
            var q = input.value.trim();
            if (q.length < MIN_LEN) {
                hidePortal();
                input.setAttribute('aria-expanded', 'false');
                return;
            }

            if (!indexReady) {
                showMessage(input, '<div class="pe-global-search-empty"><i class="fas fa-spinner fa-spin"></i><span>Loading search index…</span></div>');
                loadSearchIndex().then(function (ok) {
                    if (ok) runSearch();
                    else {
                        showMessage(input, '<div class="pe-global-search-empty"><span>Could not load search data. Refresh the page or open <a href="/pe-firms">Investors</a>.</span></div>');
                    }
                });
                return;
            }

            renderResults(filterIndex(q), q, input);
        }

        function scheduleSearch() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(runSearch, 120);
        }

        input.addEventListener('input', scheduleSearch);
        input.addEventListener('focus', function () {
            if (wrap) wrap.classList.toggle('is-ready', indexReady);
            if (input.value.trim().length >= MIN_LEN) scheduleSearch();
        });

        input.addEventListener('keydown', function (e) {
            var portal = getPortal();
            if (!portal.classList.contains('is-open')) return;
            var items = portal.querySelectorAll('.pe-global-search-item');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                activeIdx = Math.min(activeIdx + 1, items.length - 1);
                items.forEach(function (el, i) { el.classList.toggle('is-active', i === activeIdx); });
                if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                activeIdx = Math.max(activeIdx - 1, 0);
                items.forEach(function (el, i) { el.classList.toggle('is-active', i === activeIdx); });
                if (items[activeIdx]) items[activeIdx].scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (items.length) {
                    var t = activeIdx >= 0 ? items[activeIdx] : items[0];
                    var href = t.getAttribute('data-url') || t.getAttribute('href');
                    if (href) window.location.href = href;
                } else if (indexReady) {
                    var hits = filterIndex(input.value.trim());
                    if (hits.length && hits[0].url) window.location.href = hits[0].url;
                }
            } else if (e.key === 'Escape') {
                hidePortal();
                input.blur();
            }
        });

        window.addEventListener('resize', function () {
            if (portalEl && portalEl.classList.contains('is-open')) positionPortal(input);
        });
    }

    function init() {
        var inputs = document.querySelectorAll('.pe-global-search-input');
        if (!inputs.length) return;

        inputs.forEach(function (inp) {
            inp.placeholder = 'Loading search…';
            attachInput(inp);
        });

        loadSearchIndex().then(function (ok) {
            inputs.forEach(function (inp) {
                inp.placeholder = ok ? 'Search investors & companies…' : 'Search unavailable — refresh page';
                var wrap = inp.closest('.pe-global-search');
                if (wrap) wrap.classList.toggle('is-ready', ok);
            });
        });

        document.addEventListener('click', function (e) {
            var t = e.target;
            if (t.closest && (t.closest('.pe-global-search') || t.closest('#peSearchPortal'))) return;
            hidePortal();
            inputs.forEach(function (inp) { inp.setAttribute('aria-expanded', 'false'); });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/i.test((e.target && e.target.tagName) || '')) {
                e.preventDefault();
                var inp = document.getElementById('peGlobalSearchInput') || inputs[0];
                if (inp) inp.focus();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
