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

    //remove previously loaded game
    localStorage.removeItem("loadGame");
    localStorage.removeItem("gameSessionId");
    
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
        handleMenuChoice(choice);
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
        localStorage.setItem("loadGame", true); //game to be loaded

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

function handleMenuChoice(choice) {
    switch(choice.toLowerCase()) {
        case '1':
            window.location.href = 'temp_game.html';
            break;
        case '2':
            loadGameSaves();
            break;
        case '3':
            window.location.href = 'settings.html';
            break;
        case '4':
            window.location.href = 'edit_account.html';
            break;
        case "5":
             window.location.href = "player_stats.html";
            break;
        case '6':
            handleLogout();
            break;
        default:
            Terminal.outputMessage("Invalid choice. Please try again.", "#FF0000");
    }
}

/**
 * Handles user logout by clearing session data and redirecting to login page
 */
function handleLogout() {
    try {
        // Clear session storage
        sessionStorage.clear();
        // Clear local storage
        localStorage.clear();
        // Play logout sound if enabled
        const clickSound = new Audio('css/assets/sounds/button-click.mp3');
        clickSound.play();
        // Redirect to login page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        // Fallback redirect
        window.location.href = 'index.html';
    }
}

//button sound effect
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function() {
            const clickSound = new Audio('css/assets/sounds/button-click.mp3');
            clickSound.play();
        });
    });
});