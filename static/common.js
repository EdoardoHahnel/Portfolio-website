/*
Common JavaScript - Shared functionality across all pages
*/

// Scroll reveal - animate elements into view (all pages)
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        root: null,
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    };
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                const counters = entry.target.querySelectorAll('.counter-animate');
                counters.forEach(function(counter) {
                    if (!counter.classList.contains('counted') && counter.getAttribute('data-target')) {
                        const target = parseInt(counter.getAttribute('data-target'), 10);
                        const duration = 1800;
                        const start = performance.now();
                        function animate(now) {
                            const elapsed = now - start;
                            const progress = Math.min(elapsed / duration, 1);
                            counter.textContent = Math.floor(progress * target);
                            if (progress < 1) requestAnimationFrame(animate);
                            else { counter.textContent = target; counter.classList.add('counted'); }
                        }
                        requestAnimationFrame(animate);
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    function revealIfInViewport(el) {
        const rect = el.getBoundingClientRect();
        const margin = 80;
        if (rect.top < window.innerHeight - margin && rect.bottom > margin) {
            el.classList.add('revealed');
        }
    }

    document.querySelectorAll('.scroll-reveal, .scroll-reveal-item').forEach(function(el) {
        revealIfInViewport(el);
        observer.observe(el);
    });
});

/** Scale metric for firm cards (AUM vs portfolio sales / NAV for listed cos). */
window.getFirmScaleMetric = function (firm) {
    if (!firm) return { label: 'AUM', value: '—', icon: 'fa-dollar-sign' };
    const label = (firm.aum_label || '').trim();
    const value = (firm.aum || '—').trim();
    if (label) {
        const icon = /nav|sales|revenue/i.test(label) ? 'fa-chart-line' : 'fa-dollar-sign';
        return { label: label, value: value, icon: icon };
    }
    if ((firm.name || '') === 'Ratos') {
        return { label: 'Portfolio net sales', value: value, icon: 'fa-chart-line' };
    }
    return { label: 'AUM', value: value, icon: 'fa-dollar-sign' };
};


// Utility functions available globally
window.escapeHtml = function(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

window.extractDomain = function(url) {
    if (!url) return '';
    return url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
};

window.formatCurrency = function(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

window.formatDate = function(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString;
    }
};

console.log('🌐 Common functions loaded');

