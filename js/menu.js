//Imports
import { Terminal } from "./terminal.js";
import { DBQuery } from "./dbQuery.js";
import SettingsManager from "./settingsManager.js";
import * as Util from "./util.js";

//Constants
const menuOptions = ["New Game", "Load Game", "Settings", "Logout"];
const terminalColor = "#00FF00";
const optionsColor = "#00FF00";
const errorColor = "#FF0000";
const optionResultColor = "#0000FF";

//Variables
let inputFor = "menu";
let gameSaves = [];

document.addEventListener("DOMContentLoaded", async function () {
    //ensure the user is logged in
    await Util.checkUserLogin();
    
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
    userInput.addEventListener("keypress", async function (event) {
        if (event.key === "Enter") {
            
            //get the user input
            const choice = Terminal.getUserInput();

            switch(inputFor){
                case "menu": await chooseMenuOption(choice); break;
                case "loadGame": chooseGameSave(choice); break;
            }
        }
    });
    
});

//function to output the menu options to the terminal
function resetMenu(){
    document.getElementById("output-terminal").innerHTML = `
    <h2>Main Menu</h2>
        <ol>
            <li>1. New Game</li>
            <li>2. Load Game</li>
            <li>3. Settings</li>
            <li>4. Log Out</li>
        </ol>`;
}

//
//Functions for reading input
//
async function chooseMenuOption(choice){
    // Wait 1 second before processing the input
    setTimeout(async () => {
        switch (choice) {
            // user selects 1 / Begin game so the menu is hidden and the header appears INSIDE terminal (this can be changed to outside if necessary)
            case "1":
                window.location.replace("temp_game.html");        
                break;
            case "2":
                await loadGameSaves();
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

function chooseGameSave(choice){
    //if game saves weren't loaded correctly, return to menu input
    if(!gameSaves || gameSaves.length < 1){
        inputFor = "menu";
        return;
    }

    try{
        if(choice === gameSaves.length+1){
            let inputFor = "menu";
            Terminal.outputMessage("Retruning to main menu...", optionResultColor);
            resetMenu();
            return;
        }

        if(choice < 1 || choice > gameSaves.length){
            Terminal.outputMessage(`Invalid choice, please enter the number of the save file you wish to load (1-${gameSaves.length}).`, errorColor);
            return;
        }

        //set the gameSessionId of the selected save file and open the game
        let gameSessionId = gameSaves[choice-1].game_session_id;
        localStorage.setItem("gameSessionId", gameSessionId);
        Terminal.outputMessage("Loading Game...", optionResultColor);
        window.location.href = "temp_game.html";
    }
    catch(error){
        console.log("Error: ", error);
        Terminal.outputMessage("Invalid choice!");
    }
}

//function allowing user to select a game save
async function loadGameSaves(){
    //Get all the user's save files
    let query = `SELECT * FROM game_sessions WHERE user_id = ${localStorage.getItem("userID")} ORDER BY game_session_id ASC`;
    try{
        let result = await DBQuery.getQueryResult(query);
        gameSaves = result.data;
    }
    catch(error){
        Terminal.outputMessage("Error getting game saves: ", errorColor);
        return;
    }

    console.log(gameSaves);
    if(!gameSaves || gameSaves.length < 1){
        Terminal.outputMessage("There are no save files for this account.", optionResultColor);
        return;
    }

    Terminal.outputMessage("Choose a Game Save File:");
    let i = 0;
    for(i; i<gameSaves.length; i++){
        //capitalize first letter of location name
        let gameLocation = "";
        let gameLocationParts = gameSaves[i].current_location.split("_");
        if(gameLocationParts.length > 1){
            for(let j=0; j<gameLocationParts.length; j++){
                let locationPart = String(gameLocationParts[j]);
                locationPart = locationPart.charAt(0).toUpperCase() + locationPart.slice(1);
                gameLocation += `${locationPart} `;
            }
        }
        else{
            gameLocation = gameLocationParts[0];
        }

        //output game save file
        Terminal.outputMessage(`${i+1}. ${gameLocation} \u00a0 \u00a0 \u00a0 Updated: ${gameSaves[i].previous_save_datetime}`);
    }
    Terminal.outputMessage(`${i+1}. Return to Main Menu`);

    inputFor = "loadGame";
}
