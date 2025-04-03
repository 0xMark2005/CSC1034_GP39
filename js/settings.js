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

window.audioContext = null;
window.gainNode = null;

import { DBQuery } from "./dbQuery.js";
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
            case "terminalColor":
                window.colorHandler(input);
                break;
            case "textSpeed":
                processTextSpeedInput(input);
                break;
            case "volume":
                processVolumeInput(input);
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

    async function applyCurrentSettings() {
        // Apply text size
        applyTextSize();
        
        // Apply contrast mode
        document.body.classList.toggle("high-contrast", window.appSettings.isHighContrast);
        
        // Apply text speed
        switch (window.appSettings.textSpeed) {
            case 'slow':
                Terminal.textDelay = 25;
                break;
            case 'normal':
                Terminal.textDelay = 10;
                break;
            case 'fast':
                Terminal.textDelay = 1;
                break;
            default:
                Terminal.textDelay = 10; // Default to normal
        }

        // Initialize and apply volume
        initializeAudio();
        if (window.gainNode) {
            window.gainNode.gain.value = window.appSettings.volume / 100;
        }
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

        try {
            let result = await DBQuery.getQueryResult(query);
            
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


        let query = `SELECT * FROM user_settings WHERE userID=${userID} LIMIT 1`;

        try {
            let result = await DBQuery.getQueryResult(query);

            if (result.data && result.data.length > 0) {
                const settingsData = result.data[0];
                window.appSettings.currentTextSize = settingsData.currentTextSize;
                window.appSettings.isHighContrast = (settingsData.isHighContrast == 1);
            } 
            else {
                // No settings exist; create default row
                let defaultTextSize = window.appSettings.currentTextSize;
                let defaultHighContrast = window.appSettings.isHighContrast ? 1 : 0;

                let insertQuery = `INSERT INTO user_settings (userID, currentTextSize, isHighContrast) VALUES (${userID}, '${defaultTextSize}', '${defaultHighContrast}')`;
                let insertResult = await DBQuery.getQueryResult(insertQuery);

                if (!insertResult.success) {
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
        Terminal.outputMessage("2. Toggle Sound Effects (Coming Soon)", "#808080");  // Changed to gray
        Terminal.outputMessage("3. Toggle Keyboard Sounds (Coming Soon)", "#808080");  // Changed to gray
        Terminal.outputMessage("0. Return to Main Menu", "#00FF00");
        Terminal.outputMessage("Enter your choice (0-3):", "#FFFFFF");
    }

    function displayAppearanceOptions() {
        Terminal.outputMessage("===== TERMINAL APPEARANCE =====", "#00FFFF");
        Terminal.outputMessage("1. Change Terminal Color", "#00FF00");
        Terminal.outputMessage("2. Change Cursor Style (Coming Soon)", "#808080");  // Changed to gray
        Terminal.outputMessage("3. Toggle Animations (Coming Soon)", "#808080");    // Changed to gray
        Terminal.outputMessage("0. Return to Main Menu", "#00FF00");
        Terminal.outputMessage("Enter your choice (0-3):", "#FFFFFF");
    }

    function displayAccessibilityOptions() {
        Terminal.outputMessage("===== ACCESSIBILITY OPTIONS =====", "#00FFFF");
        Terminal.outputMessage("1. Text Speed", "#00FF00");
        Terminal.outputMessage("2. Screen Reader Mode (Coming Soon)", "#808080");  // Changed to gray
        Terminal.outputMessage("3. Input Timing (Coming Soon)", "#808080");        // Changed to gray
        Terminal.outputMessage("0. Return to Main Menu", "#00FF00");
        Terminal.outputMessage("Enter your choice (0-3):", "#FFFFFF");
    }

    function processAccessibilityInput(input) {
        switch (input) {
            case "1":
                currentMode = "textSpeed";
                displayTextSpeedOptions();
                break;
            case "2":
                Terminal.outputMessage("This feature is coming soon!", "#FF8181");
                break;
            case "3":
                Terminal.outputMessage("This feature is coming soon!", "#FF8181");
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
                Terminal.outputMessage("This feature is coming soon!", "#FF8181");
                break;
            case "3":
                Terminal.outputMessage("This feature is coming soon!", "#FF8181");
                break;
            case "0":
                currentMode = "main";
                displayMainMenu();
                break;
            default:
                Terminal.outputMessage("Invalid choice! Enter 0-3.", "#FF8181");
        }
    }

    function processSoundInput(input) {
        switch (input) {
            case "1":
                displayVolumeOptions();
                break;
            case "2":
                Terminal.outputMessage("This feature is coming soon!", "#FF8181");
                break;
            case "3":
                Terminal.outputMessage("This feature is coming soon!", "#FF8181");
                break;
            case "0":
                currentMode = "main";
                displayMainMenu();
                break;
            default:
                Terminal.outputMessage("Invalid choice! Enter 0-3.", "#FF8181");
        }
    }

    function displayVolumeOptions() {
        Terminal.outputMessage("===== VOLUME SETTINGS =====", "#00FFFF");
        Terminal.outputMessage("Current Volume: " + window.appSettings.volume + "%", "#FFFF00");
        Terminal.outputMessage("\nEnter a value between 0-100:", "#FFFFFF");
        currentMode = "volume";
    }

    function displayColorPicker() {
        Terminal.outputMessage("===== TERMINAL COLOR =====", "#00FFFF");
        Terminal.outputMessage("1. Default (#171717)", "#00FF00");
        Terminal.outputMessage("2. Dark Blue (#001133)", "#00FF00");
        Terminal.outputMessage("3. Forest Green (#0d400d)", "#00FF00");
        Terminal.outputMessage("4. Deep Purple (#2d0040)", "#00FF00");
        Terminal.outputMessage("5. Dark Red (#400d0d)", "#00FF00");
        Terminal.outputMessage("0. Return to Appearance Menu", "#00FF00");
        Terminal.outputMessage("Enter your choice (0-5):", "#FFFFFF");
        
        // Update input handler for color selection
        currentMode = "terminalColor";
        
        // Add the color selection handler to processInput switch
        if (!window.colorHandler) {
            window.colorHandler = function(input) {
                let color = "";
                switch (input) {
                    case "1":
                        color = "#171717";
                        break;
                    case "2":
                        color = "#001133";
                        break;
                    case "3":
                        color = "#0d400d";
                        break;
                    case "4":
                        color = "#2d0040";
                        break;
                    case "5":
                        color = "#400d0d";
                        break;
                    case "0":
                        currentMode = "appearance";
                        displayAppearanceOptions();
                        return;
                    default:
                        Terminal.outputMessage("Invalid choice! Enter 0-5.", "#FF8181");
                        return;
                }
                
                window.appSettings.terminalColor = color;
                document.getElementById("output-terminal").style.backgroundColor = color;
                Terminal.outputMessage(`Terminal color changed to ${color}`, "#00FF00");
                saveSettings();
                
                setTimeout(() => {
                    currentMode = "appearance";
                    displayAppearanceOptions();
                }, 1000);
            };
        }
    }

    function cycleCursorStyle() {
        const cursorStyles = ['block', 'underline', 'bar'];
        const currentIndex = cursorStyles.indexOf(window.appSettings.cursorStyle);
        const nextIndex = (currentIndex + 1) % cursorStyles.length;
        const newStyle = cursorStyles[nextIndex];
        
        window.appSettings.cursorStyle = newStyle;
        
        // Apply the new cursor style to the input element
        const userInput = document.getElementById("user-input");
        if (userInput) {
            switch (newStyle) {
                case 'block':
                    userInput.style.caretShape = 'block';
                    break;
                case 'underline':
                    userInput.style.caretShape = 'underscore';
                    break;
                case 'bar':
                    userInput.style.caretShape = 'bar';
                    break;
            }
        }

        Terminal.outputMessage(`Cursor style changed to ${newStyle}`, "#00FF00");
        saveSettings();
        
        // Return to appearance menu after a short delay
        setTimeout(() => {
            currentMode = "appearance";
            displayAppearanceOptions();
        }, 1000);
    }

    function cycleTextSpeed() {
        const speeds = ['slow', 'normal', 'fast'];
        const currentIndex = speeds.indexOf(window.appSettings.textSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        const newSpeed = speeds[nextIndex];
        
        window.appSettings.textSpeed = newSpeed;
        Terminal.outputMessage(`Text speed changed to ${newSpeed}`, "#00FF00");
        
        // Apply the new text speed setting
        switch (newSpeed) {
            case 'slow':
                Terminal.textDelay = 100; // 100ms between characters
                break;
            case 'normal':
                Terminal.textDelay = 50;  // 50ms between characters
                break;
            case 'fast':
                Terminal.textDelay = 25;  // 25ms between characters
                break;
        }
        
        saveSettings();
        
        // Return to accessibility menu after a short delay
        setTimeout(() => {
            currentMode = "accessibility";
            displayAccessibilityOptions();
        }, 1000);
    }

    function displayTextSpeedOptions() {
        Terminal.outputMessage("===== TEXT SPEED SETTINGS =====", "#00FFFF");
        Terminal.outputMessage("1. Slow (25ms - Readable)", "#00FF00");
        Terminal.outputMessage("2. Normal (10ms - Quick)", "#00FF00");
        Terminal.outputMessage("3. Fast (1ms - Instant)", "#00FF00");
        Terminal.outputMessage("0. Return to Accessibility Menu", "#00FF00");
        Terminal.outputMessage("\nCurrent Speed: " + window.appSettings.textSpeed, "#FFFF00");
        Terminal.outputMessage("Enter your choice (0-3):", "#FFFFFF");
    }

    function processTextSpeedInput(input) {
        let speed = "";
        let delay = 10; // default
        
        switch (input) {
            case "1":
                speed = "slow";
                delay = 25;
                break;
            case "2":
                speed = "normal";
                delay = 10;
                break;
            case "3":
                speed = "fast";
                delay = 1;
                break;
            case "0":
                currentMode = "accessibility";
                displayAccessibilityOptions();
                return;
            default:
                Terminal.outputMessage("Invalid choice! Please enter 0-3.", "#FF8181");
                return;
        }
        
        // Update settings and apply immediately
        window.appSettings.textSpeed = speed;
        Terminal.textDelay = delay;
        
        // Save to both localStorage and database
        localStorage.setItem('appSettings', JSON.stringify(window.appSettings));
        saveSettings();
        
        // Demo text with new speed
        Terminal.outputMessage(`Text speed changed to ${speed}! This is a demonstration of the new speed.`, "#00FF00");
        
        setTimeout(() => {
            currentMode = "accessibility";
            displayAccessibilityOptions();
        }, 2000);
    }

    function processVolumeInput(input) {
        const volume = parseInt(input, 10);
        if (isNaN(volume) || volume < 0 || volume > 100) {
            Terminal.outputMessage("Invalid volume! Enter a value between 0-100.", "#FF8181");
            displayVolumeOptions();
            return;
        }

        // Initialize audio context if not already done
        initializeAudio();

        // Update volume in settings
        window.appSettings.volume = volume;
        
        // Actually apply the volume change
        if (window.gainNode) {
            window.gainNode.gain.value = volume / 100;
        }

        // Update any currently playing audio elements
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.volume = volume / 100;
        });

        Terminal.outputMessage(`Volume set to ${volume}%`, "#00FF00");
        saveSettings();

        // Play a test sound to demonstrate new volume
        playTestSound();

        setTimeout(() => {
            currentMode = "sound";
            displaySoundOptions();
        }, 1000);
    }

    function initializeAudio() {
        if (!window.audioContext) {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            window.gainNode = window.audioContext.createGain();
            window.gainNode.connect(window.audioContext.destination);
            // Set initial volume
            window.gainNode.gain.value = window.appSettings.volume / 100;
        }
    }

    function playTestSound() {
        // Create a brief test tone
        const oscillator = window.audioContext.createOscillator();
        oscillator.connect(window.gainNode);
        oscillator.frequency.value = 440; // A4 note
        oscillator.type = 'sine';
        
        // Play for 200ms
        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, 200);
    }
});