//Imports
import {DBQuery} from "../dbQuery.js";
import {GameTracker} from "./game_tracker.js";
import * as Util from "../util.js";

//
// Load a game save
//
export async function loadGame(){
    //ensure a user is logged in
    let userLoggedIn = await Util.checkUserLogin()
    if(!userLoggedIn){
        return;
    }

    //ensure the user came from the main menu
    if(localStorage.getItem("loadGame") === null){
        console.error("loadGame was null");
        window.alert("Please use the main menu to create a new game or load an existing game.");
        window.location.href = "main_menu.html";
        return;
    }

    //if a game was loaded (true) or a new game created (false)
    let loadGame = JSON.parse(localStorage.getItem("loadGame"));

    //variables for the game to begin
    let gameSessionData; //variable to hold game data
    let gameSessionAllies = []; //variable for game allies
    let gameSessionAllyItems = []; //variable to hold items of allies
    let gameSessionLogs = []; //variable for game logs
    let gameSessionInventory = []; //variable for game inventory

    //sets the game data depending on if an existing save is loaded or a new game is created
    if(loadGame){ //if loading an existing game

        console.log("loading game");

        //get the game data
        let gameSessionId = localStorage.getItem("gameSessionId");
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

    //Get the game session id
    let gameSessionId = localStorage.getItem("gameSessionId");

    //
    //Load the player's allies
    //
    let allyQuery = `SELECT ally_id AS id, ally_name AS name, ally_img_folder AS imgFolder, ally_max_hp AS maxHp, ally_hp AS hp, ally_attack AS attack, 
    ally_defence AS defence, ally_intelligence AS intelligence, ally_equipment_id AS equipmentId, ally_alive AS alive
    FROM game_session_allies_full_details WHERE game_session_id = ${gameSessionId}`;
    try{
        let result = await DBQuery.getQueryResult(allyQuery);

        for(let i=0; i<result.data.length; i++){
            //convert values to correct type
            let currentAlly = result.data[i]
            currentAlly.id = Number(currentAlly.id);
            currentAlly.maxHp = Number(currentAlly.maxHp);
            currentAlly.hp = Number(currentAlly.hp);
            currentAlly.attack = Number(currentAlly.attack);
            currentAlly.defence = Number(currentAlly.defence);
            currentAlly.intelligence = Number(currentAlly.intelligence);
            currentAlly.equipmentId = currentAlly.equipmentId !== null ? Number(currentAlly.equipmentId) : null;
            currentAlly.alive = currentAlly.alive === "1";

            gameSessionAllies.push(currentAlly);
        }
        console.log("Allies: ", gameSessionAllies);
    }
    catch(error){
        console.error("Error loading allies: ", error);
        alert("Game save could not be loaded, please try again.");
        window.location.href = "main_menu.html";
        return;
    }

    //
    // Load the items of the current player's allies
    //
    let allyItemQuery = `SELECT item_id AS id, item_name AS name, item_description AS description, item_image AS image, is_consumable AS consumable, is_equipment AS equipment,
    is_key_item AS keyItem, item_effect AS effect
    FROM game_session_allies_item_full_details WHERE game_session_id = ${gameSessionId}`;
    try{
        let result = await DBQuery.getQueryResult(allyItemQuery);

        for(let i=0; i<result.data.length; i++){
            //convert values to correct type
            let currentAllyItem = result.data[i]
            currentAllyItem.id = Number(currentAllyItem.id);
            currentAllyItem.consumable = currentAllyItem.consumable === "1";
            currentAllyItem.equipment = currentAllyItem.equipment === "1";
            currentAllyItem.keyItem = currentAllyItem.keyItem === "1";
            currentAllyItem.effect = currentAllyItem.effect !== "" ? JSON.parse(currentAllyItem.effect) : {};

            gameSessionAllyItems.push(currentAllyItem);
        }
        console.log("Ally items: ", gameSessionAllyItems);
    }
    catch(error){
        console.error("Error loading ally items: ", error);
        alert("Game save could not be loaded, please try again.");
        window.location.href = "main_menu.html";
        return;
    }


    //
    // Load the player's inventory
    //
    let inventoryQuery = `SELECT item_id AS id, item_name AS name, item_description AS description, item_image AS image, is_consumable AS consumable, is_equipment AS equipment,
    is_key_item AS keyItem, item_effect AS effect, quantity AS qty
    FROM game_session_inventory_full_details WHERE game_session_id = ${gameSessionId}`;
    try{
        let result = await DBQuery.getQueryResult(inventoryQuery);

        for(let i=0; i<result.data.length; i++){
            //convert values to correct type
            let currentItem = result.data[i]
            currentItem.id = Number(currentItem.id);
            currentItem.consumable = currentItem.consumable === "1";
            currentItem.equipment = currentItem.equipment === "1";
            currentItem.keyItem = currentItem.keyItem === "1";
            currentItem.effect = currentItem.effect !== "" ? JSON.parse(currentItem.effect) : {};

            //get the quantity of items
            let quantity = Number(currentItem.qty);
            delete currentItem.qty; //remove qty from item

            //add number of item
            for(let j=0; j<quantity; j++){
                gameSessionInventory.push(currentItem);
            }
        }
        console.log("Inventory: ", gameSessionInventory);
    }
    catch(error){
        console.error("Error loading inventory: ", error);
        alert("Game save could not be loaded, please try again.");
        window.location.href = "main_menu.html";
        return;
    }


    //
    // Load logs
    //


    //set the GameTracker variables accordingly
    GameTracker.areaName = gameSessionData.current_location;
    GameTracker.setFilepath();
    GameTracker.currentDialogue = gameSessionData.current_dialogue;
    GameTracker.reputation = gameSessionData.reputation;
    GameTracker.score = gameSessionData.score;
    GameTracker.allies = gameSessionAllies;
    GameTracker.allyEquipment = gameSessionAllyItems;
    GameTracker.inventory = gameSessionInventory;

    console.log("Game loaded.");
}



//
// Set up a new game save
//
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
        localStorage.setItem("gameSessionId", gameSessionId);
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
    let addPlayerAllyQuery = `INSERT INTO game_session_allies (game_session_id, ally_id) VALUES (${gameSessionId}, 1)`;
    try{
        let result = await DBQuery.getQueryResult(addPlayerAllyQuery);

        //checks if query was successful
        if(!result.success){ //if unsuccessful, return to main menu
            console.error(`Failed Query: ${addPlayerAllyQuery}`);
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

    console.log("New game successfully created.");

    //return the game data object
    newGameData.game_session_id = gameSessionId; //set game_session_id in the newGameData object
    return newGameData;
}

//function to generate a random reputation (for a new game save)
function generateRandomReputation(){
    let randomReputation = Math.floor(40+(Math.random()*20)); //random number between 40 and 60
    return randomReputation;
}



//
//Saving
//
export async function saveGame(){
    let gameSessionId = localStorage.getItem("gameSessionId");
    
    //
    // Save the game_session
    //
    let gameSessionQuery = `UPDATE game_sessions SET
     current_location = '${GameTracker.areaName}', current_dialogue = '${GameTracker.currentDialogue}', reputation = ${GameTracker.reputation},
     game_over = ${GameTracker.gameOver}, game_completed = ${GameTracker.gameCompleted}, previous_save_datetime = NOW(), score = ${GameTracker.score}
     WHERE game_session_id = ${gameSessionId}`;
    try{
        let result = await DBQuery.getQueryResult(gameSessionQuery);

        //checks if query was successful
        if(!result.success){ //if unsuccessful, return to main menu
            console.error(`Failed Query: ${gameSessionQuery}`);
            alert("An error occured when saving game. Please try again.");
            return false;
        }
    }
    catch(error){
        console.error("Game save error: ", error);
        alert("An error occured when saving game. Please try again.");
        return false;
    }

    //
    //Save the player allies
    //

    //Get allies currently in database
    let getDBAlliesQuery = `SELECT ally_id AS id FROM game_session_allies_full_details WHERE game_session_id = ${gameSessionId}`;
    let dbAllies = [];
    try{
        let result = await DBQuery.getQueryResult(getDBAlliesQuery);

        for(let i=0; i<result.data.length; i++){
            dbAllies.push(result.data[i]);
        }
    }
    catch(error){
        console.error("Game save error: ", error);
        alert("An error occured when saving game. Please try again.");
        return false;
    }

    //Check for any new allies and add if needed
    const dbAllyIds = dbAllies.map(dbAlly => Number(dbAlly.id));
    const newAllies = GameTracker.allies.filter(ally => !dbAllyIds.includes(ally.id));
    console.log("New allies to save: ", newAllies); 

    //add the new allies to the database
    for(let i=0; i<newAllies.length; i++){
        let addAllyQuery = `INSERT INTO game_session_allies (game_session_id, ally_id) VALUES (${gameSessionId}, ${newAllies[i].id})`
        try{
            let result = await DBQuery.getQueryResult(addAllyQuery);
        }
        catch(error){
            console.error("Game save error: ", error);
            alert("An error occured when saving game. Please try again.");
            return false;
        }
    }

    //update ally details
    try{
        await Promise.all(
            GameTracker.allies.map(ally => DBQuery.getQueryResult(`UPDATE game_session_allies SET ally_hp = ${ally.hp}, ally_attack = ${ally.attack}, ally_defence = ${ally.defence},
                ally_intelligence = ${ally.intelligence}, ally_equipment_id = ${ally.equipmentId}, ally_alive = ${ally.alive}
                WHERE game_session_id = ${gameSessionId} AND ally_id = ${ally.id}`))
        );
    }
    catch(error){
        console.error("Game save error: ", error);
        alert("An error occured when saving game. Please try again.");
        return false;
    }


    //
    // Save Inventory
    //

    //Delete currently saved inventory
    let deleteDBInventory = `DELETE FROM game_session_inventory WHERE game_session_id = ${gameSessionId}`;
    try{
        let result = await DBQuery.getQueryResult(deleteDBInventory);
    }
    catch(error){
        console.error("Game save error: ", error);
        alert("An error occured when saving game. Please try again.");
        return false;
    }

    //Add new inventory
    //first add quantity element
    for(let i=0; i<GameTracker.inventory.length; i++){
        let currentItem = GameTracker.inventory[i];
        let sameItems = GameTracker.inventory.filter(item => item.id === currentItem.id);
        let qty = sameItems.length;
        currentItem.quantity = qty;
    }

    //now remove same elements
    let uniqueItems = []; //holds the unique items;
    for(let i=0; i<GameTracker.inventory.length; i++){
        let currentItem = GameTracker.inventory[i];
        let currentUniqueItemIds = uniqueItems.map(item => item.id); //gets ids of items in uniqueItems

        //if currentUniqueItems does not have one of these items
        if(!currentUniqueItemIds.includes(currentItem.id)){
            uniqueItems.push(currentItem);
        }
    }

    //now add new items to DB
    console.log(uniqueItems);
    try{
        await Promise.all(
            uniqueItems.map(item => DBQuery.getQueryResult(`INSERT INTO game_session_inventory (game_session_id, item_id, quantity)
                VALUES (${gameSessionId}, ${item.id}, ${item.quantity})`))
        );
    }
    catch(error){
        console.error("Game save error: ", error);
        alert("An error occured when saving game. Please try again.");
        return false;
    }


    //
    // Save game logs
    //


    //All saving complete
    console.log("Game successfully saved.");
    return true;
}