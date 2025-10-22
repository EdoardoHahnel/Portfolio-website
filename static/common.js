/*
Common JavaScript - Shared functionality across all pages
*/

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    // Add mobile menu button if needed
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth < 1024) {
        // Mobile functionality here
    }
    
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

