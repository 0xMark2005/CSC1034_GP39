document.addEventListener("DOMContentLoaded", function () {

    const userInput = document.getElementById("userSettingsInput");
    const userSettingsDiv = document.getElementById("userSettings");


    // Ensure terminal output container exists
    let terminalContainer = userSettingsDiv.querySelector(".terminal-two");
    let terminalOutputContainer = terminalContainer.querySelector(".terminal-output");

    // AI fix to query needs to be rewritten or looked at as I have no idea why this makes or break the code
    terminalOutputContainer = document.createElement("ul");
    terminalOutputContainer.classList.add("terminal-output");
    terminalContainer.appendChild(terminalOutputContainer);
    

    // Detect when the user presses Enter
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const choice = userInput.value.trim();

            if (choice === "") {
                console.warn("User entered empty input");
                return;
            }

            console.log(`User entered: ${choice}`);

            // Create a new line in the terminal
            const newLine = document.createElement("li");
            newLine.textContent = `> ${choice}`;
            terminalOutputContainer.appendChild(newLine);

            console.log("New line added to terminal");

            userInput.value = "";

            // Process the input after 1 second
            setTimeout(() => {
                switch (choice) {
                    case "1":
                        addSystemMessage("Option 1 selected: Text Size");
                        break;
                    case "2":
                        addSystemMessage("Option 2 selected: High Contrast");
                        break;
                    case "3":
                        addSystemMessage("Option 3 selected: Screen Colour Calibration");
                        break;
                    case "4":
                        addSystemMessage("Option 4 selected: Exit Settings");
                        break;
                    default:
                        addSystemMessage("Invalid choice! Please enter 1, 2, 3, or 4.");
                }
            }, 1000);
        }
    });

    // Function to add system messages
    function addSystemMessage(message) {
        const systemMessage = document.createElement("li");
        systemMessage.textContent = message;
        systemMessage.style.color = "#FF8181";
        terminalOutputContainer.appendChild(systemMessage);


        // Keep only the last 4 messages
        while (terminalOutputContainer.children.length > 4) {
            terminalOutputContainer.removeChild(terminalOutputContainer.firstChild);
        }
    }
});
