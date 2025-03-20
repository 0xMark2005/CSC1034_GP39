import { Terminal } from "./terminal.js";
import { DBQuery } from "./dbQuery.js";
import SettingsManager from "./settingsManager.js";

document.addEventListener("DOMContentLoaded", function () {
    
    //ensure the user is logged in
    checkUserLogin();
    
    //Initialize the terminal
    let outputTerminal = document.getElementById("output-terminal"); 
    let userInput = document.getElementById("user-input");
    Terminal.initialize(outputTerminal, userInput);
    const currentSettings = SettingsManager.applySettings();

    // Retrieve username from session (stored during login)
    let username = localStorage.getItem("username");
    if (username) {
        Terminal.outputMessage(`Hello, ${username}`, "#00FF00");
    }

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
                        window.location.replace("settings.html");  
                        break;
                        case "4":
                            Terminal.outputMessage("Logging Out...", "#FF8181");
                            localStorage.removeItem("loggedIn");
                            localStorage.removeItem("username");
                            window.location.replace("index.html");
                            break;
                        
                    default:
                        Terminal.outputMessage("Invalid choice! Please enter 1, 2, 3, or 4.", "#FF8181")
                }
            }, 1000); // 1 sec delay
        }
    });
    
});

async function checkUserLogin(){
    let loggedIn = localStorage.getItem("loggedIn");
    let sessionToken = localStorage.getItem("sessionToken");
    let userID = localStorage.getItem("userID");

    if (loggedIn !== "true" || !sessionToken || !userID) {
        window.location.href = "index.html";
        return;
    }

    // Verify the session token in the database
    let query = `SELECT * FROM user_sessions WHERE user_id='${userID}' AND session_token='${sessionToken}' AND expires_at > NOW() LIMIT 1`;

    try {
        let result = await DBQuery.getQueryResult(query);
        if (!(result.data && result.data.length > 0)) {
            localStorage.removeItem("loggedIn");
            localStorage.removeItem("userID");
            localStorage.removeItem("sessionToken");
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Session verification error:", error);
        window.location.href = "index.html";
    }
}

