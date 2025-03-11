window.appSettings = {
    currentTextSize: "16px",
    isHighContrast: false
};

import * as Terminal from "./terminal.js";

document.addEventListener("DOMContentLoaded", function () {
    Terminal.initialize();  // Initialize terminal
    const userInput = document.getElementById("user-input");
    let currentMode = "main"; 

    // loading settings from db first
    loadSettings().then(() => {
        applyCurrentSettings();
        displayMainMenu();
    });

    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const input = Terminal.getUserInput().trim();
            if (input !== "") processInput(input);
        }
    });

    function processInput(input) {
        switch (currentMode) {
            case "main":
                processMainMenuInput(input);
                break;
            case "textSize":
                processTextSizeInput(input);
                break;
            default:
                Terminal.outputMessage("Unknown mode. Returning to main menu.", "#FF8181");
                displayMainMenu();
        }
    }

    function processMainMenuInput(input) {
        switch (input) {
            case "1":
                Terminal.outputMessage("Opening text size settings...", "#00FF00");
                setTimeout(() => { currentMode = "textSize"; displayTextSizeOptions(); }, 500);
                break;
            case "2":
                toggleHighContrast();
                displayMainMenu();
                break;
            case "3":
                screenCalibration();
                break;
            case "4":
                Terminal.outputMessage("Exiting to main page...", "#FF8181");
                window.location.replace("main_menu.html");
                break;
            default:
                Terminal.outputMessage("Invalid choice! Please enter 1, 2, 3, or 4.", "#FF8181");
                displayMainMenu();
        }
    }

    function processTextSizeInput(input) {
        let sizeLabel = "";
        
        switch (input) {
            case "1": 
                window.appSettings.currentTextSize = "12px"; 
                sizeLabel = "small";
                break;
            case "2": 
                window.appSettings.currentTextSize = "16px"; 
                sizeLabel = "medium";
                break;
            case "3": 
                window.appSettings.currentTextSize = "20px"; 
                sizeLabel = "large";
                break;
            case "0": 
                Terminal.outputMessage("Returning to main menu...", "#00FF00"); 
                setTimeout(() => { currentMode = "main"; displayMainMenu(); }, 500);
                return;
            default:
                Terminal.outputMessage("Invalid choice! Enter 1, 2, 3, or 0 to return.", "#FF8181");
                displayTextSizeOptions();
                return;
        }
        
        Terminal.outputMessage(`Text size changed to ${sizeLabel}`, "#00FF00");
        applyTextSize();
        saveSettings();
        setTimeout(() => { currentMode = "main"; displayMainMenu(); }, 500);
    }

    function applyTextSize() {
        document.body.style.fontSize = window.appSettings.currentTextSize;
    }

    function applyCurrentSettings() {
        // Apply text size
        applyTextSize();
        
        // Apply contrast mode
        document.body.classList.toggle("high-contrast", window.appSettings.isHighContrast);
    }
    
    async function saveSettings() {
        let userID = localStorage.getItem("userID");
        if (!userID) { 
            console.error("No user ID found for saving settings."); 
            return; 
        }
        let textSize = window.appSettings.currentTextSize;
        let highContrast = window.appSettings.isHighContrast ? 1 : 0;
        let query = `UPDATE user_settings SET currentTextSize='${textSize}', isHighContrast='${highContrast}' WHERE userID='${userID}'`;
        let params = new URLSearchParams();
        params.append('hostname', 'localhost');
        params.append('username', 'jdonnelly73');
        params.append('password', 'CHZHy02qM20fcLVt');
        params.append('database', 'CSC1034_CW_39');
        params.append('query', query);
        try {
            let response = await fetch('includes/db_connect.php', { method: 'POST', body: params });
            let result = await response.json();
            if(result.error) {
                console.error("Error saving settings:", result.error);
            } else {
                console.log("Settings saved to DB successfully");
            }
        } catch(e) {
            console.error("Could not save settings to DB:", e);
        }
    }
    
    // Load settings from DB for the current user
    async function loadSettings() {
        let userID = localStorage.getItem("userID");
        if (!userID) { 
            console.error("No user ID found for loading settings."); 
            return; 
        }
        let query = `SELECT * FROM user_settings WHERE userID='${userID}' LIMIT 1`;
        let params = new URLSearchParams();
        params.append('hostname', 'localhost');
        params.append('username', 'jdonnelly73');
        params.append('password', 'CHZHy02qM20fcLVt');
        params.append('database', 'CSC1034_CW_39');
        params.append('query', query);
        try {
            let response = await fetch('includes/db_connect.php', { method: 'POST', body: params });
            let result = await response.json();
            if (result.data && result.data.length > 0) {
                const settingsData = result.data[0];
                window.appSettings.currentTextSize = settingsData.currentTextSize;
                window.appSettings.isHighContrast = (settingsData.isHighContrast == 1);
            } else {
                // No settings exist; create default row
                let defaultTextSize = window.appSettings.currentTextSize;
                let defaultHighContrast = window.appSettings.isHighContrast ? 1 : 0;
                let insertQuery = `INSERT INTO user_settings (userID, currentTextSize, isHighContrast) VALUES ('${userID}', '${defaultTextSize}', '${defaultHighContrast}')`;
                let insertParams = new URLSearchParams();
                insertParams.append('hostname', 'localhost');
                insertParams.append('username', 'jdonnelly73');
                insertParams.append('password', 'CHZHy02qM20fcLVt');
                insertParams.append('database', 'CSC1034_CW_39');
                insertParams.append('query', insertQuery);
                let insertResponse = await fetch('includes/db_connect.php', { method: 'POST', body: insertParams });
                let insertResult = await insertResponse.json();
                if (insertResult.error) {
                    console.error("Error inserting default settings:", insertResult.error);
                }
            }
            console.log("Settings loaded from DB successfully");
        } catch(e) {
            console.error("Could not load settings from DB:", e);
        }
    }

    function displayMainMenu() {
        Terminal.outputMessage("===== SETTINGS MENU =====", "#00FFFF");
        Terminal.outputMessage("1. Change Text Size", "#00FF00");
        Terminal.outputMessage("2. Toggle High Contrast Mode", "#00FF00");
        Terminal.outputMessage("3. Screen Calibration", "#00FF00");
        Terminal.outputMessage("4. Exit to Main Page", "#00FF00");
        displayActiveSettings();
        Terminal.outputMessage("Enter your choice (1-4):", "#FFFFFF");
    }

    function displayTextSizeOptions() {
        Terminal.outputMessage("===== TEXT SIZE SETTINGS =====", "#00FFFF");
        Terminal.outputMessage("1. Small (12px)", "#00FF00");
        Terminal.outputMessage("2. Medium (16px) - default", "#00FF00");
        Terminal.outputMessage("3. Large (20px)", "#00FF00");
        Terminal.outputMessage("0. Return to Main Menu", "#00FF00");
        Terminal.outputMessage("Enter your choice (0-3):", "#FFFFFF");
    }

    function toggleHighContrast() {
        window.appSettings.isHighContrast = !window.appSettings.isHighContrast;
        Terminal.outputMessage(`High contrast mode ${window.appSettings.isHighContrast ? "enabled" : "disabled"}`, "#00FF00");
        document.body.classList.toggle("high-contrast");
        saveSettings();
    }

    function screenCalibration() {
        Terminal.outputMessage("===== SCREEN CALIBRATION =====", "#00FFFF");
        Terminal.outputMessage("The terminal will change from white to black", "#FFFFFF");
        let countdown = 3;

        function updateBackground(color, message, nextStep) {
            if (countdown > 0) {
                Terminal.outputMessage(`Changing in... ${countdown}`, "#FF0000");
                countdown--;
                setTimeout(() => updateBackground(color, message, nextStep), 1000);
            } else {
                const terminalContainer = document.getElementById("output-terminal");
                if (color === "#000000") {
                    terminalContainer.style.backgroundColor = color;
                    terminalContainer.style.color = "#FFFFFF";
                } else {
                    document.body.style.backgroundColor = color;
                }
                Terminal.outputMessage(message, "#FFFFFF");
                countdown = 3;
                setTimeout(nextStep, 1000);
            }
        }

        // Start calibration sequence
        updateBackground("#000000", "Terminal background changed to black!", () => {
            Terminal.outputMessage("Changing body background to green", "#FFFFFF");
            updateBackground("#00FF00", "Body background changed to green!", () => {
                Terminal.outputMessage("Changing body background to blue", "#FFFFFF");
                updateBackground("#0000FF", "Body background changed to blue!", () => {
                    Terminal.outputMessage("Calibration complete! Returning to main menu...", "#FFFFFF");
                    setTimeout(() => { currentMode = "main"; displayMainMenu(); }, 2000);
                });
            });
        });
    }

    function displayActiveSettings() {
        Terminal.outputMessage("Current Settings:", "#FFFF00");
        Terminal.outputMessage(`• Text Size: ${window.appSettings.currentTextSize}`, "#FFFF00");
        Terminal.outputMessage(`• High Contrast: ${window.appSettings.isHighContrast ? "Enabled" : "Disabled"}`, "#FFFF00");
    }
});