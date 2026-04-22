/**
 * Transaction deal logos — GP side mirrors Investors (/pe-firms) resolution:
 * API logo_url (non–ui-avatars) → Clearbit(domain) → Google favicon → ui-avatars → briefcase fallback.
 */
(function () {
    const firmDomainOverrides = {
        'Alder': 'alder.se',
        'Celero Capital': 'celerocapital.com',
        'Celero': 'celerocapital.com',
        'FSN Capital': 'fsncapital.com',
        'Polaris': 'polarisequity.dk',
        'Impilo': 'impilo.se',
        'Axcel': 'axcel.dk',
        'CapMan': 'capman.com',
        'Amplio': 'amplio.se',
        'MVI': 'mvi.se',
        'Equip': 'equip.no',
        'Trill Impact': 'trillimpact.com'
    };

    function websiteToDomain(website) {
        if (!website) return '';
        return String(website)
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .split('/')[0]
            .trim();
    }

    function buildUrlsForFirmRecord(firm) {
        const websiteDomain = websiteToDomain(firm.website || '');
        const overrideDomain = firmDomainOverrides[firm.name] || websiteDomain;
        const firmLogoFromApi = (firm.logo_url || '').includes('ui-avatars.com')
            ? ''
            : (firm.logo_url || '');
        const clearbitLogo =
            firmLogoFromApi || (overrideDomain ? 'https://logo.clearbit.com/' + overrideDomain : '');
        const faviconLogo = overrideDomain
            ? 'https://www.google.com/s2/favicons?domain=' +
              encodeURIComponent(overrideDomain) +
              '&sz=128'
            : '';
        const avatarLogo =
            'https://ui-avatars.com/api/?name=' +
            encodeURIComponent(firm.name || 'PE') +
            '&background=3f7de8&color=ffffff&size=128';
        return { clearbitLogo, faviconLogo, avatarLogo };
    }

    function buildUrlsForDomainAndLabel(domain, label) {
        const d = (domain || '').trim();
        const clearbitLogo = d ? 'https://logo.clearbit.com/' + d : '';
        const faviconLogo = d
            ? 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(d) + '&sz=128'
            : '';
        const avatarLogo =
            'https://ui-avatars.com/api/?name=' +
            encodeURIComponent(label || 'Company') +
            '&background=64748b&color=ffffff&size=128';
        return { clearbitLogo, faviconLogo, avatarLogo };
    }

    function showBriefcaseFallback(img) {
        img.style.display = 'none';
        const fb = img.nextElementSibling;
        if (fb && fb.classList && fb.classList.contains('txn-logo-fallback')) {
            fb.style.display = 'flex';
        }
    }

    /** Try URLs in order (same idea as Investors list): each failed load advances to the next. */
    function attachFallbackChain(img, clearbitLogo, faviconLogo, avatarLogo) {
        const steps = [clearbitLogo, faviconLogo, avatarLogo].filter(Boolean);
        let idx = 0;
        function loadStep() {
            if (idx >= steps.length) {
                showBriefcaseFallback(img);
                return;
            }
            img.onerror = function () {
                this.onerror = null;
                idx += 1;
                loadStep();
            };
            img.src = steps[idx];
        }
        loadStep();
    }

    function resolveFirmMap(data) {
        const raw = (data && data.firms) || {};
        const map = {};
        Object.keys(raw).forEach(function (key) {
            map[key] = Object.assign({ key: key }, raw[key]);
        });
        return map;
    }

    function findFirm(firmsMap, gpKey) {
        if (!gpKey) return null;
        if (firmsMap[gpKey]) return firmsMap[gpKey];
        const lower = gpKey.toLowerCase();
        const hit = Object.keys(firmsMap).find(function (k) {
            return k.toLowerCase() === lower;
        });
        return hit ? firmsMap[hit] : null;
    }

    function applyLogos(firmsMap) {
        document.querySelectorAll('img.txn-logo-gp').forEach(function (img) {
            const gpKey = (img.getAttribute('data-gp-key') || '').trim();
            const fallbackDomain = (img.getAttribute('data-fallback-domain') || '').trim();
            const alt = img.getAttribute('alt') || '';
            const firm = findFirm(firmsMap, gpKey);
            if (firm) {
                const u = buildUrlsForFirmRecord(firm);
                attachFallbackChain(img, u.clearbitLogo, u.faviconLogo, u.avatarLogo);
            } else {
                const u = buildUrlsForDomainAndLabel(fallbackDomain, alt);
                attachFallbackChain(img, u.clearbitLogo, u.faviconLogo, u.avatarLogo);
            }
        });

        document.querySelectorAll('img.txn-logo-co').forEach(function (img) {
            const domain = (img.getAttribute('data-fallback-domain') || '').trim();
            const alt = img.getAttribute('alt') || '';
            const u = buildUrlsForDomainAndLabel(domain, alt);
            attachFallbackChain(img, u.clearbitLogo, u.faviconLogo, u.avatarLogo);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!document.querySelector('img.txn-logo-gp, img.txn-logo-co')) return;

        fetch('/api/pe-firms')
            .then(function (r) {
                return r.json();
            })
            .then(function (data) {
                if (data && data.success) {
                    applyLogos(resolveFirmMap(data));
                } else {
                    applyLogos({});
                }
            })
            .catch(function () {
                applyLogos({});
            });
    });
})();
