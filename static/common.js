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
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-item').forEach(function(el) {
        observer.observe(el);
    });
});


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

