// settings-manager.js
const SettingsManager = {
    // Default settings as fallback
    defaults: {
        currentTextSize: "16px",
        isHighContrast: false,
        volume: 100,
        soundEnabled: true,
        cursorStyle: "block",
        terminalColor: "#171717",
        animationsEnabled: true,
        keyboardSounds: true,
        textSpeed: "normal"
    },
    
    // Load settings from database
    loadFromDB: async function() {
        let userID = localStorage.getItem("userID");
        if (!userID) { 
            console.error("No user ID found for loading settings.");
            return this.defaults;
        }

        const params = new URLSearchParams();
        params.append('hostname', 'localhost');
        params.append('username', 'jdonnelly73');
        params.append('password', 'CHZHy02qM20fcLVt');
        params.append('database', 'CSC1034_CW_39');
        params.append('query', `SELECT * FROM user_settings WHERE userID='${userID}' LIMIT 1`);

        try {
            const response = await fetch('includes/db_connect.php', { 
                method: 'POST', 
                body: params 
            });
            const result = await response.json();

            if (result.data && result.data.length > 0) {
                const dbSettings = result.data[0];
                return {
                    currentTextSize: dbSettings.currentTextSize || this.defaults.currentTextSize,
                    isHighContrast: dbSettings.isHighContrast == 1,
                    volume: parseInt(dbSettings.volume) || this.defaults.volume,
                    soundEnabled: dbSettings.soundEnabled == 1,
                    cursorStyle: dbSettings.cursorStyle || this.defaults.cursorStyle,
                    terminalColor: dbSettings.terminalColor || this.defaults.terminalColor,
                    animationsEnabled: dbSettings.animationsEnabled == 1,
                    keyboardSounds: dbSettings.keyboardSounds == 1,
                    textSpeed: dbSettings.textSpeed || this.defaults.textSpeed
                };
            }

            // If no settings found, create default row
            await this.createDefaultSettings(userID);
            return this.defaults;
        } catch (e) {
            console.error("Database error:", e);
            return this.defaults;
        }
    },

    // Create default settings in database
    createDefaultSettings: async function(userID) {
        const params = new URLSearchParams();
        params.append('hostname', 'localhost');
        params.append('username', 'jdonnelly73');
        params.append('password', 'CHZHy02qM20fcLVt');
        params.append('database', 'CSC1034_CW_39');
        params.append('query', `
            INSERT INTO user_settings (
                userID, currentTextSize, isHighContrast, volume, 
                soundEnabled, cursorStyle, terminalColor,
                animationsEnabled, keyboardSounds, textSpeed
            ) VALUES (
                '${userID}', '${this.defaults.currentTextSize}', 
                ${this.defaults.isHighContrast ? 1 : 0}, ${this.defaults.volume},
                ${this.defaults.soundEnabled ? 1 : 0}, '${this.defaults.cursorStyle}', 
                '${this.defaults.terminalColor}', ${this.defaults.animationsEnabled ? 1 : 0},
                ${this.defaults.keyboardSounds ? 1 : 0}, '${this.defaults.textSpeed}'
            )
        `);

        try {
            await fetch('includes/db_connect.php', { method: 'POST', body: params });
        } catch (e) {
            console.error("Could not create default settings:", e);
        }
    },

    // Modified getSettings to properly handle DB vs localStorage
    getSettings: async function() {
        try {
            // Try to get from localStorage for immediate response
            const savedSettings = localStorage.getItem('appSettings');
            const savedTimestamp = localStorage.getItem('appSettingsTimestamp');
            const currentTime = new Date().getTime();
            
            // Use localStorage if available and less than 30 minutes old
            if (savedSettings && savedTimestamp && 
                (currentTime - parseInt(savedTimestamp) < 30 * 60 * 1000)) {
                return {...this.defaults, ...JSON.parse(savedSettings)};
            }
            
            // If not in localStorage or too old, load from DB
            const dbSettings = await this.loadFromDB();
            
            // Cache in localStorage with timestamp
            localStorage.setItem('appSettings', JSON.stringify(dbSettings));
            localStorage.setItem('appSettingsTimestamp', currentTime.toString());
            
            return dbSettings;
        } catch (e) {
            console.error("Could not load settings:", e);
            return {...this.defaults};
        }
    },

    // Modified applySettings to handle async correctly
    applySettings: async function() {
        const settings = await this.getSettings();
        console.log('Applying settings from DB:', settings);

        // Apply text size
        document.body.style.fontSize = settings.currentTextSize;
        const terminal = document.getElementById('output-terminal');
        const input = document.getElementById('user-input');
        
        if (terminal) {
            terminal.style.fontSize = settings.currentTextSize;
            terminal.style.backgroundColor = settings.terminalColor;
        }
        
        if (input) {
            input.style.fontSize = settings.currentTextSize;
        }

        // Apply high contrast
        document.body.classList.toggle('high-contrast', settings.isHighContrast);

        // Apply animations
        if (!settings.animationsEnabled) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }

        // Apply cursor style
        if (terminal) {
            terminal.style.cursor = settings.cursorStyle;
        }

        // Force a redraw to ensure changes take effect
        document.body.style.display = 'none';
        document.body.offsetHeight;
        document.body.style.display = '';

        return settings;
    },

    saveSettings: async function(settings) {
        try {
            localStorage.setItem('appSettings', JSON.stringify(settings));
            localStorage.setItem('appSettingsTimestamp', new Date().getTime().toString());
            
            // Also save to database
            await this.saveToDatabase(settings);
            
            // Apply the settings
            await this.applySettings();
        } catch (e) {
            console.error("Could not save settings:", e);
        }
    },

    saveToDatabase: async function(settings) {
        const userID = localStorage.getItem("userID");
        if (!userID) {
            console.error("No user ID found for saving settings.");
            return;
        }

        const params = new URLSearchParams();
        params.append('hostname', 'localhost');
        params.append('username', 'jdonnelly73');
        params.append('password', 'CHZHy02qM20fcLVt');
        params.append('database', 'CSC1034_CW_39');
        params.append('query', `
            UPDATE user_settings SET
                currentTextSize = '${settings.currentTextSize}',
                isHighContrast = ${settings.isHighContrast ? 1 : 0},
                volume = ${settings.volume},
                soundEnabled = ${settings.soundEnabled ? 1 : 0},
                cursorStyle = '${settings.cursorStyle}',
                terminalColor = '${settings.terminalColor}',
                animationsEnabled = ${settings.animationsEnabled ? 1 : 0},
                keyboardSounds = ${settings.keyboardSounds ? 1 : 0},
                textSpeed = '${settings.textSpeed}'
            WHERE userID = '${userID}'
        `);

        try {
            await fetch('includes/db_connect.php', { method: 'POST', body: params });
        } catch (e) {
            console.error("Could not save settings to database:", e);
        }
    },

    updateSetting: async function(key, value) {
        const settings = await this.getSettings();
        settings[key] = value;
        await this.saveSettings(settings);
    }
};

export default SettingsManager;