document.addEventListener("DOMContentLoaded", function () {
    
    // Get the user input
    const userInput = document.getElementById("userInput");
    const terminalOutputContainer = document.createElement("ul"); 
    terminalOutputContainer.classList.add("terminal-output-text"); 
    document.getElementById("output-terminal").appendChild(terminalOutputContainer); 

    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const choice = userInput.value.trim();
            // Create a new line in the terminal with user input
            const newLine = document.createElement("li");
            newLine.textContent = `> ${choice}`;
            terminalOutputContainer.appendChild(newLine);
            userInput.value = ""; // Clear input 

            // Wait 1 second before processing the input
            setTimeout(() => {
                switch (choice) {
                    // user selects 1 / Begin game so the menu is hidden and the header appears INSIDE terminal (this can be changed to outside if necessary)
                    case "1":
                        window.location.replace("../html/game.html");        
                        break;
                    case "2":
                        addSystemMessage("Loading Game...");
                        break;
                    case "3":
                        document.getElementById("gameBegins").style.display = "none";
                        document.getElementById("menu").style.display = "none";
                        document.getElementById("userSettings").style.display = "block";
                        break;
                    case "4":
                        addSystemMessage("Logging Out...");
                        window.location.replace("../html/index.html");
                        break;
                    default:
                        addSystemMessage("Invalid choice! Please enter 1, 2, 3, or 4.");
                }
            }, 1000); // 1 sec delay
        }
    });

    // Function to add system messages after user input
    function addSystemMessage(message) {
        const systemMessage = document.createElement("li");
        systemMessage.textContent = message;
        systemMessage.style.color = "#FF8181"; 
        terminalOutputContainer.appendChild(systemMessage);

        while (terminalOutputContainer.children.length > 4) {
            terminalOutputContainer.removeChild(terminalOutputContainer.firstChild);
        }
    }

    
});