//Imports
import {DBQuery} from "../dbQuery.js";
import {GameTracker} from "./game_tracker.js";
import * as Util from "../util.js";

//Check for a game save
export async function loadGame(){
    await Util.checkUserLogin(); //ensure a user is logged in

    //get gameSessionId for the selected game save file
    let gameSessionId = localStorage.getItem("gameSessionId");

    let gameSessionData; //variable to hold game data

    //sets the game data depending on if an existing save is loaded or a new game is created
    if(gameSessionId){ //if loading an existing game
        let query = `SELECT * FROM game_sessions WHERE game_session_id = ${gameSessionId} LIMIT 1`;
        try{
            let result = await DBQuery.getQueryResult(query);
            gameSessionData = result.data[0];
        }
        catch(error){
            console.error("Error getting game file: ", error);
            alert("Game file could not be found, please try again.");
            window.location.href = "main_menu.html";
            return;
        }
    }
    else{ //if making a new game
        gameSessionData = await setupNewGame();
    }

    //
    //Load the player's allies, logs, and inventory
    //


    //set the GameTracker variables accordingly
    GameTracker.areaName = gameSessionData.current_location;
    GameTracker.setFilepath();
    GameTracker.currentDialogue = gameSessionData.current_dialogue;
    GameTracker.reputation = gameSessionData.reputation;
    GameTracker.score = gameSessionData.score;
}

async function setupNewGame(){
    //set the new game's data (NOTE: game_session_id is not set yet as the DB creates that)
    let newGameData = {
        user_id: localStorage.getItem("userID"),
        game_session_id: 0,
        current_location: "burning_village",
        current_dialogue: "burning_village_intro",
        reputation: generateRandomReputation(),
        game_over: false,
        game_completed: false,
        score: 0
    }

    //
    //Inserts the new game data into the database
    //
    let createNewGameQuery = `INSERT INTO game_sessions(user_id, current_location, current_dialogue, reputation, game_over, game_completed, previous_save_datetime, score)
    VALUES (${newGameData.user_id}, '${newGameData.current_location}', '${newGameData.current_dialogue}', ${newGameData.reputation}, ${newGameData.game_over}, ${newGameData.game_completed}, NOW(), ${newGameData.score});`;
    try{
        let result = await DBQuery.getQueryResult(createNewGameQuery);

        //checks if query was successful
        if(!result.success){ //if unsuccessful, return to main menu
            console.error(`Failed Query: ${createNewGameQuery}`);
            alert("An error occured when initializing a new game. Please try again.");
            window.location.href = "main_menu.html";
            return;
        }
    }
    catch(error){
        console.error("New game creation error: ", error);
        alert("An error occured when initializing a new game. Please try again.");
        window.location.href = "main_menu.html";
        return;
    }

    //
    //Gets the game_session_id
    //
    let getGameSessionIdQuery = `SELECT game_session_id FROM game_sessions WHERE user_id = ${newGameData.user_id} ORDER BY previous_save_datetime DESC LIMIT 1`;
    let gameSessionId = 0;
    try{
        let result = await DBQuery.getQueryResult(getGameSessionIdQuery);

        //checks if query was successful
        if(!result.success){ //if unsuccessful, return to main menu
            console.error(`Failed Query: ${createNewGameQuery}`);
            alert("An error occured when initializing a new game. Please try again.");
            window.location.href = "main_menu.html";
            return;
        }

        gameSessionId = result.data[0].game_session_id; //set the gameSessionId
    }
    catch(error){
        console.error("New game creation error: ", error);
        alert("An error occured when initializing a new game. Please try again.");
        window.location.href = "main_menu.html";
        return;
    }

    //
    //Add the player Ally
    //

    //return the game data object
    newGameData.game_session_id = gameSessionId; //set game_session_id in the newGameData object
    return newGameData;
}

//function to generate a random reputation (for a new game save)
function generateRandomReputation(){
    let randomReputation = Math.floor(40+(Math.random()*20)); //random number between 40 and 60
    return randomReputation;
}
