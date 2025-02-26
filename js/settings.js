document.addEventListener("DOMContentLoaded", function () {
    const userInput = document.getElementById("userSettingsInput");
    const userSettingsDiv = document.getElementById("userSettings");
    // userSettingsDiv.style.display = "block"; Shows code straight away

    if (!userInput || !userSettingsDiv) {
        console.error("Error: userSettingsInput or userSettingsDiv not found!");
        return; // Exit if elements don't exist
    }

    // Get or create the terminal output container
    let terminalContainer = userSettingsDiv.querySelector(".terminal-two");
    let terminalOutputContainer = terminalContainer.querySelector(".terminal-output");

    if (!terminalOutputContainer) {
        terminalOutputContainer = document.createElement("ul");
        terminalOutputContainer.classList.add("terminal-output");
        terminalContainer.appendChild(terminalOutputContainer);
    }

    // Detect when the user presses Enter
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const choice = userInput.value.trim();
            console.log(`User entered: ${choice}`);

            // Create a new line in the terminal
            const newLine = document.createElement("li");
            newLine.textContent = `> ${choice}`;
            terminalOutputContainer.appendChild(newLine);

            userInput.value = ""; // Clear input field

            // Process the input after 1 second
            setTimeout(() => {
                switch (choice) {
                    case "1":
                        addSystemMessage("Option 1 selected: Text Size", "#FFFFFF");
                        break;
                    case "2":
                        addSystemMessage("Option 2 selected: High Contrast", "#FFFFFF");
                        break;
                    case "3":
                        ScreenCalibration();
                        break;
                    case "4":
                        addSystemMessage("Option 4 selected: Exit Settings", "#FFFFFF");
                        break;
                    default:
                        addSystemMessage("Invalid choice! Please enter 1, 2, 3, or 4.");
                }
            }, 1000);
        }
    });

    // Function to add system messages
    function addSystemMessage(message, color = "#FFFFFF") {
        const systemMessage = document.createElement("li");
        systemMessage.textContent = message;
        systemMessage.style.color = color;
        terminalOutputContainer.appendChild(systemMessage);

        // Keep only the last 4 messages
        while (terminalOutputContainer.children.length > 4) {
            terminalOutputContainer.removeChild(terminalOutputContainer.firstChild);
        }
    }

    /* Screen Calibration function 
    * - Change Terminal from white background black font to black background white font
    * - 
    */
    function ScreenCalibration() {
        addSystemMessage("The terminal will change from white to black", "#FFFFFF");
    
        let countdown = 3;
        let countdownRunning = false; // To prevent conflicts between countdowns
    
        // Function to change terminal background to black
        function updateTerminalCountdown() {
            if (countdown > 0) {
                addSystemMessage(`Changing in... ${countdown}`, "#FF0000"); // Red countdown text
                countdown--;
                setTimeout(updateTerminalCountdown, 1000); // Wait 1 second before updating again
            } else {
                // Change the terminal background color to black and text to white
                terminalContainer.style.backgroundColor = "#000000"; // Black background
                terminalContainer.style.color = "#FFFFFF"; // White text
                addSystemMessage("Terminal background changed to black!", "#FFFFFF");
    
                // Reset the countdown for the second phase
                countdown = 3;
                addSystemMessage("Changing body background to green", "#FFFFFF");
                updateBodyCountdown(); // Start second countdown to change body background
            }
        }
    
        // Function to change the body background to green
        function updateBodyCountdown() {
            if (countdown > 0) {
                addSystemMessage(`Changing in... ${countdown}`, "#FF0000"); // Red countdown text
                countdown--;
                setTimeout(updateBodyCountdown, 1000); // Wait 1 second before updating again
            } else {
                // Change the body's background color to green
                var body = document.getElementsByTagName("BODY")[0];
                body.style.backgroundColor = "#00FF00"; // Green background
                addSystemMessage("Body background changed to green!", "#FFFFFF");
            }
        }
    
        // Start the terminal countdown first
        updateTerminalCountdown();
    }
    
});
