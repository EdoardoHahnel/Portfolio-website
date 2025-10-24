/*
Robust Logo Loading Utilities
Handles logo loading with multiple fallbacks for better deployment reliability
*/

// Enhanced logo loading with multiple fallbacks
function createRobustLogoElement(logoUrl, altText, size = '24px', fallbackIcon = '🏢', backgroundColor = '#4c1d95') {
    const escapedAlt = escapeHtml(altText);
    const encodedName = encodeURIComponent(altText);
    
    return `
        <div class="robust-logo-container" style="position: relative; display: inline-block;">
            <img src="${logoUrl}" 
                 alt="${escapedAlt}" 
                 style="width: ${size}; height: ${size}; border-radius: 4px; object-fit: contain;"
                 onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodedName}&background=${backgroundColor.replace('#', '')}&color=ffffff&size=${parseInt(size)}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}">
            <div class="logo-fallback" 
                 style="display: none; width: ${size}; height: ${size}; background: ${backgroundColor}; color: white; border-radius: 4px; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
                ${fallbackIcon}
            </div>
        </div>
    `;
}

// Preload logos for better performance
function preloadLogo(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
    });
}

// Test logo availability
async function testLogoAvailability(url) {
    try {
        await preloadLogo(url);
        return true;
    } catch {
        return false;
    }
}

// Enhanced logo loading with testing
async function createTestedLogoElement(logoUrl, altText, size = '24px', fallbackIcon = '🏢', backgroundColor = '#4c1d95') {
    const isAvailable = await testLogoAvailability(logoUrl);
    
    if (isAvailable) {
        return createRobustLogoElement(logoUrl, altText, size, fallbackIcon, backgroundColor);
    } else {
        // Skip primary logo, go straight to fallback
        const encodedName = encodeURIComponent(altText);
        return `
            <div class="robust-logo-container" style="position: relative; display: inline-block;">
                <img src="https://ui-avatars.com/api/?name=${encodedName}&background=${backgroundColor.replace('#', '')}&color=ffffff&size=${parseInt(size)}" 
                     alt="${escapeHtml(altText)}" 
                     style="width: ${size}; height: ${size}; border-radius: 4px; object-fit: contain;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="logo-fallback" 
                     style="display: none; width: ${size}; height: ${size}; background: ${backgroundColor}; color: white; border-radius: 4px; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
                    ${fallbackIcon}
                </div>
            </div>
        `;
    }
}

// Utility function for escaping HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions for use in other files
window.LogoUtils = {
    createRobustLogoElement,
    createTestedLogoElement,
    preloadLogo,
    testLogoAvailability,
    escapeHtml
};
