import * as Terminal from "./terminal.js";

document.addEventListener("DOMContentLoaded", function () {
    
    //initialize the terminal
    Terminal.initialize();

    //get the user-input element
    const userInput = document.getElementById("user-input");

    //add event for the user input
    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            
            //get the user input
            const choice = Terminal.getUserInput();

            // Wait 1 second before processing the input
            setTimeout(() => {
                switch (choice) {
                    // user selects 1 / Begin game so the menu is hidden and the header appears INSIDE terminal (this can be changed to outside if necessary)
                    case "1":
                        window.location.replace("game.html");        
                        break;
                    case "2":
                        Terminal.outputMessage("Loading Game...", "#00FF00");
                        break;
                    case "3":
                        document.getElementById("gameBegins").style.display = "none";
                        document.getElementById("menu").style.display = "none";
                        document.getElementById("userSettings").style.display = "block";
                        break;
                    case "4":
                        Terminal.outputMessage("Logging Out...", "#FF8181");
                        window.location.replace("index.html");
                        break;
                    default:
                        Terminal.outputMessage("Invalid choice! Please enter 1, 2, 3, or 4.", "#FF8181")
                }
            }, 1000); // 1 sec delay
        }
    });
    
});