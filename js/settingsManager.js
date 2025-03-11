// settings-manager.js
const SettingsManager = {
    // Default settings
    defaults: {
        currentTextSize: "16px",
        isHighContrast: false
    },
    
    // Get current settings
    getSettings: function() {
        try {
            const savedSettings = localStorage.getItem('appSettings');
            if (savedSettings) {
                return {...this.defaults, ...JSON.parse(savedSettings)};
            }
        } catch (e) {
            console.error("Could not load settings:", e);
        }
        return {...this.defaults};
    },
    
    // Apply settings to current page
    applySettings: function() {
        const settings = this.getSettings();
        
        let styleEl = document.getElementById("user-settings-style");
        if (!styleEl) {
            styleEl = document.createElement("style");
            styleEl.id = "user-settings-style";
            document.head.appendChild(styleEl);
        }
        // Force the font-size for html and body elements
        styleEl.textContent = `
            html, body {
                font-size: ${settings.currentTextSize} !important;
            }
        `;
        
        // Apply high contrast mode
        if (settings.isHighContrast) {
            document.body.classList.add("high-contrast");
        } else {
            document.body.classList.remove("high-contrast");
        }
        
        return settings;
    }
};

export default SettingsManager;