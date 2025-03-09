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
        
        // Apply text size
        document.body.style.fontSize = settings.currentTextSize;
        
        // Apply contrast mode
        if (settings.isHighContrast) {
            document.body.classList.add("high-contrast");
        } else {
            document.body.classList.remove("high-contrast");
        }
        
        return settings;
    }
};

export default SettingsManager;