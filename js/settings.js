document.addEventListener("DOMContentLoaded", function () {
    // Same input field used by menu
    const userInput = document.getElementById("userInput");

    // Create a separate output list for settings
    const settingsOutput = document.createElement("ul");
    settingsOutput.classList.add("terminal-output");
    // Append it under the existing `.terminal-two` inside #settings
    document.querySelector("#settings .terminal-two").appendChild(settingsOutput);

    userInput.addEventListener("keypress", function (event) {
        // Only handle input if settings screen is currently visible
        if (document.getElementById("settings").style.display === "block") {
            if (event.key === "Enter") {
                const choice = userInput.value.trim();
                // Show user input in terminal
                const newLine = document.createElement("li");
                newLine.textContent = `> ${choice}`;
                settingsOutput.appendChild(newLine);
                userInput.value = "";

                setTimeout(() => {
                    switch (choice) {
                        case "1":
                            addSystemMessage("Sample text for Text Size (Larger/Smaller).");
                            break;
                        case "2":
                            addSystemMessage("Sample text for High Contrast mode.");
                            break;
                        case "3":
                            addSystemMessage("Sample text for Screen Colour Calibration.");
                            break;
                        default:
                            addSystemMessage("Invalid input. Please select 1, 2, or 3.");
                    }
                }, 1000);
            }
        }
    });

    function addSystemMessage(message) {
        const systemMessage = document.createElement("li");
        systemMessage.textContent = message;
        systemMessage.style.color = "#FFD700"; 
        settingsOutput.appendChild(systemMessage);

        // Limit messages to the last 4
        while (settingsOutput.children.length > 4) {
            settingsOutput.removeChild(settingsOutput.firstChild);
        }
    }
});
