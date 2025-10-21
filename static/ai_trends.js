// AI Trends & Analysis Charts

document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
});

function initializeCharts() {
    // Funding by Quarter Chart
    const fundingCtx = document.getElementById('fundingChart').getContext('2d');
    new Chart(fundingCtx, {
        type: 'line',
        data: {
            labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'],
            datasets: [{
                label: 'Funding (€M)',
                data: [250, 480, 720, 1100, 1800],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
    
    // Category Distribution Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['AI Assistant', 'Healthcare', 'LegalTech', 'Developer Tools', 'Enterprise', 'Other'],
            datasets: [{
                data: [25, 18, 15, 20, 12, 10],
                backgroundColor: [
                    '#667eea',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#fa709a',
                    '#c471ed'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Valuation Trends Chart
    const valuationCtx = document.getElementById('valuationChart').getContext('2d');
    new Chart(valuationCtx, {
        type: 'bar',
        data: {
            labels: ['Seed', 'Series A', 'Series B', 'Growth', 'Unicorn'],
            datasets: [{
                label: 'Avg Valuation (€M)',
                data: [5, 50, 200, 800, 5000],
                backgroundColor: [
                    '#667eea',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#fa709a'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
    
    // Geographic Distribution Chart
    const geoCtx = document.getElementById('geoChart').getContext('2d');
    new Chart(geoCtx, {
        type: 'pie',
        data: {
            labels: ['Stockholm', 'Copenhagen', 'Helsinki', 'Oslo', 'Other'],
            datasets: [{
                data: [65, 15, 10, 7, 3],
                backgroundColor: [
                    '#667eea',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#fa709a'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

