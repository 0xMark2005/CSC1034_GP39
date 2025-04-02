// Imports
import { DBQuery } from "./dbQuery.js";
import SettingsManager from "./settingsManager.js";
import * as Util from "./util.js";

let gameSaves = [];

document.addEventListener("DOMContentLoaded", async function () {
  await Util.checkUserLogin();
  localStorage.removeItem("loadGame");
  localStorage.removeItem("gameSessionId");

  document.getElementById("new-game").addEventListener("click", () => {
    localStorage.setItem("loadGame", false);
    window.location.href = "temp_game.html";
  });

  document.getElementById("load-game").addEventListener("click", async () => {
    await loadGameSaves();
  });

  document.getElementById("settings-menu").addEventListener("click", () => {
    window.location.href = "settings.html";
  });

  document.getElementById("player-stats").addEventListener("click", () => {
    window.location.href = "profile.html";
  });

  document.getElementById("leaderboard-menu").addEventListener("click", () => {
    window.location.href = "Leaderboard.html";
  });

  document.getElementById("popup-close").addEventListener("click", closePopup);
});

async function loadGameSaves() {
  const query = `SELECT * FROM game_sessions 
                 WHERE user_id = ${localStorage.getItem("userID")} 
                 ORDER BY previous_save_datetime DESC 
                 LIMIT 5`;
    try{
        let result = await DBQuery.getQueryResult(query);
        gameSaves = result.data;
    }
    catch(error){
        Terminal.outputMessage("Error getting game saves: ", errorColor);
        return;
    }

    if(!gameSaves || gameSaves.length < 1){
        Terminal.outputMessage("There are no save files for this account.", optionResultColor);
        return;
    }

    Terminal.outputMessage("Choose a Game Save File:");
    
    // Show only up to 5 most recent saves
    for(let i = 0; i < gameSaves.length; i++){
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

        //output game save file with delete option
        Terminal.outputMessage(`${i+1}. ${gameLocation} \u00a0 \u00a0 \u00a0 Updated: ${gameSaves[i].previous_save_datetime} [D]elete`);
    }
    Terminal.outputMessage(`${gameSaves.length + 1}. Return to Main Menu`);

    inputFor = "loadGame";
}

function handleMenuChoice(choice) {
    switch(choice.toLowerCase()) {
        case '1':
            localStorage.setItem("loadGame", false); // Indicate this is a new game
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
        case "6":
             window.location.href = "leaderboard.html";
            break;
        case '7':
            handleLogout();
            break;
        default:
            Terminal.outputMessage("Invalid choice. Please try again.", errorColor);
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

function closePopup() {
  document.getElementById("popup-container").style.display = "none";
}
