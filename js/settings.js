window.appSettings = {
    currentTextSize: "16px",
    isHighContrast: false,
    volume: 100,
    soundEnabled: true,
    cursorStyle: "block",
    terminalColor: "#171717",
    animationsEnabled: true,
    keyboardSounds: true,
    textSpeed: "normal"
};

import { Terminal } from "./terminal.js";
import * as Util from "./util.js";

document.addEventListener("DOMContentLoaded", async function () {
    
    let outputTerminal = document.getElementById("output-terminal");
    const userInput = document.getElementById("user-input");
    Terminal.initialize(outputTerminal, userInput);  // Initialize terminal
    let currentMode = "main"; 
    await Util.checkUserLogin();

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
            case "sound":
                processSoundInput(input);
                break;
            case "appearance":
                processAppearanceInput(input);
                break;
            case "accessibility":
                processAccessibilityInput(input);
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
                Terminal.outputMessage("Opening sound settings...", "#00FF00");
                setTimeout(() => { currentMode = "sound"; displaySoundOptions(); }, 500);
                break;
            case "5":
                Terminal.outputMessage("Opening appearance settings...", "#00FF00");
                setTimeout(() => { currentMode = "appearance"; displayAppearanceOptions(); }, 500);
                break;
            case "6":
                Terminal.outputMessage("Opening accessibility settings...", "#00FF00");
                setTimeout(() => { currentMode = "accessibility"; displayAccessibilityOptions(); }, 500);
                break;
            case "7":
                Terminal.outputMessage("Exiting to main page...", "#FF8181");
                window.location.replace("main_menu.html");
                break;
            default:
                Terminal.outputMessage("Invalid choice! Please enter 1-7.", "#FF8181");
                displayMainMenu();
        }
    }

    function processTextSizeInput(input) {
        let sizeLabel = "";
        let oldSize = window.appSettings.currentTextSize;
        
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
        
        console.log(`Text size changed from ${oldSize} to ${window.appSettings.currentTextSize}`);
        Terminal.outputMessage(`Text size changed to ${sizeLabel}`, "#00FF00");
        applyTextSize();
        saveSettings();
        setTimeout(() => { currentMode = "main"; displayMainMenu(); }, 500);
    }

    function applyTextSize() {
        console.log('Applying text size:', window.appSettings.currentTextSize);
        
        // Apply to body
        document.body.style.fontSize = window.appSettings.currentTextSize;
        
        // Apply to terminal elements
        const terminal = document.getElementById('output-terminal');
        const input = document.getElementById('user-input');
        
        if (terminal) {
            terminal.style.fontSize = window.appSettings.currentTextSize;
            console.log('Applied to terminal');
        }
        
        if (input) {
            input.style.fontSize = window.appSettings.currentTextSize;
            console.log('Applied to input');
        }
        
        // Force a redraw
        document.body.style.display = 'none';
        document.body.offsetHeight; // trigger a reflow
        document.body.style.display = '';
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
        
        let query = `UPDATE user_settings SET 
            currentTextSize='${window.appSettings.currentTextSize}',
            isHighContrast='${window.appSettings.isHighContrast ? 1 : 0}',
            volume='${window.appSettings.volume}',
            soundEnabled='${window.appSettings.soundEnabled ? 1 : 0}',
            cursorStyle='${window.appSettings.cursorStyle}',
            terminalColor='${window.appSettings.terminalColor}',
            animationsEnabled='${window.appSettings.animationsEnabled ? 1 : 0}',
            keyboardSounds='${window.appSettings.keyboardSounds ? 1 : 0}',
            textSpeed='${window.appSettings.textSpeed}'
            WHERE userID='${userID}'`;
        
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
        Terminal.outputMessage("4. Sound Settings", "#00FF00");
        Terminal.outputMessage("5. Terminal Appearance", "#00FF00");
        Terminal.outputMessage("6. Accessibility Options", "#00FF00");
        Terminal.outputMessage("7. Exit to Main Page", "#00FF00");
        displayActiveSettings();
        Terminal.outputMessage("Enter your choice (1-7):", "#FFFFFF");
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
        const oldState = window.appSettings.isHighContrast;
        window.appSettings.isHighContrast = !window.appSettings.isHighContrast;
        
        console.log(`High contrast mode changed from ${oldState} to ${window.appSettings.isHighContrast}`);
        Terminal.outputMessage(`High contrast mode ${window.appSettings.isHighContrast ? "enabled" : "disabled"}`, "#00FF00");
        
        document.body.classList.toggle("high-contrast");
        saveSettings();
    }

    function screenCalibration() {
        Terminal.outputMessage("===== SCREEN CALIBRATION =====", "#00FFFF");
        Terminal.outputMessage("The terminal will change from its default background (#171717) to black", "#FFFFFF");
        let countdown = 3;
      
        function updateBackground(element, color, message, nextStep) {
          if (countdown > 0) {
            Terminal.outputMessage(`Changing in... ${countdown}`, "#FF0000");
            countdown--;
            setTimeout(() => updateBackground(element, color, message, nextStep), 1000);
          } else {
            element.style.backgroundColor = color;
            if (element.id === "output-terminal") {
              element.style.color = "#FFFFFF";
            }
            Terminal.outputMessage(message, "#FFFFFF");
            countdown = 3;
            setTimeout(nextStep, 1000);
          }
        }
      
        const terminalContainer = document.getElementById("output-terminal");
      
        updateBackground(terminalContainer, "#000000", "Terminal background changed to black!", () => {
          Terminal.outputMessage("Changing body background to green", "#FFFFFF");
          updateBackground(terminalContainer, "#0d400d", "Body background changed to green!", () => {
            Terminal.outputMessage("Changing body background to blue", "#FFFFFF");
            updateBackground(terminalContainer, "#0000FF", "Body background changed to blue!", () => {
              Terminal.outputMessage("Calibration complete! ", "#FFFFFF");
              updateBackground(terminalContainer, "#171717", "Body background changed to default. Please ensure all the text was visible throughout the calibration to ensure a good gameplay experience. If you did not see the text well, change your monitor settings and rerun calibration.", () => {
                Terminal.outputMessage("Returning to menu... ", "#FFFFFF");
                
              setTimeout(() => { currentMode = "main"; displayMainMenu(); }, 2000);
            });
          });
        });
        });
      }
      

    function displayActiveSettings() {
        Terminal.outputMessage("Current Settings:", "#FFFF00");
        Terminal.outputMessage(`• Text Size: ${window.appSettings.currentTextSize}`, "#FFFF00");
        Terminal.outputMessage(`• High Contrast: ${window.appSettings.isHighContrast ? "Enabled" : "Disabled"}`, "#FFFF00");
        Terminal.outputMessage(`• Volume: ${window.appSettings.volume}%`, "#FFFF00");
        Terminal.outputMessage(`• Sound Effects: ${window.appSettings.soundEnabled ? "Enabled" : "Disabled"}`, "#FFFF00");
        Terminal.outputMessage(`• Keyboard Sounds: ${window.appSettings.keyboardSounds ? "Enabled" : "Disabled"}`, "#FFFF00");
        Terminal.outputMessage(`• Animations: ${window.appSettings.animationsEnabled ? "Enabled" : "Disabled"}`, "#FFFF00");
        Terminal.outputMessage(`• Text Speed: ${window.appSettings.textSpeed}`, "#FFFF00");
    }

    function displaySoundOptions() {
        Terminal.outputMessage("===== SOUND SETTINGS =====", "#00FFFF");
        Terminal.outputMessage("1. Volume Level", "#00FF00");
        Terminal.outputMessage("2. Toggle Sound Effects", "#00FF00");
        Terminal.outputMessage("3. Toggle Keyboard Sounds", "#00FF00");
        Terminal.outputMessage("0. Return to Main Menu", "#00FF00");
        Terminal.outputMessage("Enter your choice (0-3):", "#FFFFFF");
    }

    function displayAppearanceOptions() {
        Terminal.outputMessage("===== TERMINAL APPEARANCE =====", "#00FFFF");
        Terminal.outputMessage("1. Change Terminal Color", "#00FF00");
        Terminal.outputMessage("2. Change Cursor Style", "#00FF00");
        Terminal.outputMessage("3. Toggle Animations", "#00FF00");
        Terminal.outputMessage("0. Return to Main Menu", "#00FF00");
        Terminal.outputMessage("Enter your choice (0-3):", "#FFFFFF");
    }

    function displayAccessibilityOptions() {
        Terminal.outputMessage("===== ACCESSIBILITY OPTIONS =====", "#00FFFF");
        Terminal.outputMessage("1. Text Speed", "#00FF00");
        Terminal.outputMessage("2. Screen Reader Mode", "#00FF00");
        Terminal.outputMessage("3. Input Timing", "#00FF00");
        Terminal.outputMessage("0. Return to Main Menu", "#00FF00");
        Terminal.outputMessage("Enter your choice (0-3):", "#FFFFFF");
    }

    function processSoundInput(input) {
        switch (input) {
            case "1":
                displayVolumeSlider();
                break;
            case "2":
                toggleSoundEffects();
                break;
            case "3":
                toggleKeyboardSounds();
                break;
            case "0":
                currentMode = "main";
                displayMainMenu();
                break;
            default:
                Terminal.outputMessage("Invalid choice! Enter 0-3.", "#FF8181");
        }
    }

    function processAppearanceInput(input) {
        switch (input) {
            case "1":
                displayColorPicker();
                break;
            case "2":
                cycleCursorStyle();
                break;
            case "3":
                toggleAnimations();
                break;
            case "0":
                currentMode = "main";
                displayMainMenu();
                break;
            default:
                Terminal.outputMessage("Invalid choice! Enter 0-3.", "#FF8181");
        }
    }

    function processAccessibilityInput(input) {
        switch (input) {
            case "1":
                cycleTextSpeed();
                break;
            case "2":
                toggleScreenReader();
                break;
            case "3":
                adjustInputTiming();
                break;
            case "0":
                currentMode = "main";
                displayMainMenu();
                break;
            default:
                Terminal.outputMessage("Invalid choice! Enter 0-3.", "#FF8181");
        }
    }
});