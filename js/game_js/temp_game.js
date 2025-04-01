//Imports
import { Terminal } from "../terminal.js";
import { GameTracker } from "./game_tracker.js";
import * as SaveLoadGame from "./save_load_game.js";
import * as Inventory from "./inventory.js";

import { prisonEscapeGame } from "./minigames/prisonEscape_minigame.js";
import { villageEscapeGame } from "./minigames/villageEscape_minigame.js";
import { generalRescueGame } from "./minigames/generalRescue_minigame.js";
import { finalBattleGame } from "./minigames/finalBattle_minigame.js";

import { addAlly } from "./character.js";
import { Battle } from './battle.js';
import { ScoreSystem } from './score_system.js';
import { DBQuery } from "../dbQuery.js";

/**
 * Handles starting and completing minigames
 * Routes to appropriate minigame based on current area or type
 * @param {Object} option - The selected game option containing minigame details
 */
function handleMinigame(option) {
    allowInput = false;

    const minigameHandler = async (e) => {
        document.removeEventListener('minigameComplete', minigameHandler);
        
        if (e.detail.success) {
            await scoreSystem.handleMinigameCompletion(e);
            Terminal.outputMessage(e.detail.message, "#00FF00");
            
            if (option.next) {
                GameTracker.currentDialogue = option.next;
                loadDialogue();
            } else {
                console.error('No next dialogue specified for successful minigame completion');
                GameTracker.currentDialogue = storyProgression[GameTracker.areaName].startDialogue;
                loadDialogue();
            }
        } else {
            Terminal.outputMessage(e.detail.message, errorColor);
            GameTracker.currentDialogue = storyProgression[GameTracker.areaName].startDialogue;
            loadDialogue();
        }
        
        allowInput = true;
    };

    document.addEventListener('minigameComplete', minigameHandler);

    // Start the appropriate minigame based on the current area
    switch(GameTracker.areaName) {
        case 'burning_village':
            villageEscapeGame();
            break;
        case 'prison':
            prisonEscapeGame();
            break;
        case 'knight_rescue':
            generalRescueGame();
            break;
        case 'final_battle':
            finalBattleGame();
            break;
        default:
            console.error('No minigame found for area:', GameTracker.areaName);
            allowInput = true;
    }
}

// Constants
const dialogueColor = "#00FF00";
const optionsColor = "#00FF00";
const errorColor = "#FF0000";
const optionResultColor = "#0000FF";

// Game state variables
let allowInput = false;
const options = [];
let optionType = "number";
let currentSelectionIndex = -1;
const scoreSystem = new ScoreSystem();

document.addEventListener("DOMContentLoaded", async function() {
    // Initialize terminal
    let outputTerminal = document.getElementById("output-terminal");
    let userInput = document.getElementById("user-input");
    Terminal.initialize(outputTerminal, userInput);

    // Set initial game state to burning village (start of game)
    //GameTracker.areaName = "burning_village";
    await SaveLoadGame.loadGame();
    GameTracker.setFilepath();
    
    // Load initial area and dialogue
    await loadAreaFromJSON();
    //GameTracker.currentDialogue = storyProgression.burning_village.startDialogue;
    loadDialogue();

    // Add input handler
    userInput.addEventListener("keydown", function(event) {
        if (!allowInput) return;
        
        switch(event.key) {
            case "ArrowUp":
                event.preventDefault();
                handleArrowNavigation('up');
                break;
            case "ArrowDown":
                event.preventDefault();
                handleArrowNavigation('down');
                break;
            case "Enter":
                if (Terminal.getInputValue()) {
                    handleUserInput();
                }
                break;
        }
    });
});

// Story progression map
const storyProgression = {
    burning_village: {
        startDialogue: "burning_village_intro",
        nextArea: "capital_gates"
    },
    capital_gates: {
        startDialogue: "capital_gates_intro",
        nextArea: "merchant_district"
    },
    merchant_district: {
        startDialogue: "merchant_district_intro",
        nextArea: "prison"
    },
    prison: {
        startDialogue: "prison_intro",
        nextArea: "slums"
    },
    slums: {
        startDialogue: "slums_tavern_intro",
        nextArea: "knight_rescue"
    },
    knight_rescue: {
        startDialogue: "knight_rescue_intro",
        nextArea: "resistance_hq"
    },
    resistance_hq: {
        startDialogue: "resistance_hq_intro",
        nextArea: "final_battle"
    },
    final_battle: {
        startDialogue: "final_battle_intro",
        nextArea: null
    }
};

// Update processChoice function to handle area transitions
function processChoice(option) {
    Terminal.outputMessage(option.message, dialogueColor);
    
    // Handle minigames
    if (option.startMinigame) {
        handleMinigame(option);
        return;
    }

    // Handle battles
    if (option.startBattle) {
        handleBattle(option);
        return;
    }

    // Handle game over
    if (option.gameOver) {
        Terminal.outputMessage("Game Over", errorColor);
        allowInput = false;
        return;
    }

    // Update reputation
    if (option.reputation) {
        updateReputation(option);
        // Update multiplier after reputation changes
        if (GameTracker.reputation !== undefined) {
            scoreSystem.updateReputationMultiplier(GameTracker.reputation);
        }
    }

    //Add any logs
    if(option.log){
        addLog(option.log);
    }

    // Track decision outcomes
    if (option.isOptimal || option.preservesResources || option.unlocksSecret) {
        scoreSystem.processDecision(option);
    }

    // Track achievements
    if (option.achievement) {
        scoreSystem.addAchievement(option.achievement.id, option.achievement.points);
    }

    if(option.item){
        awardItem(option);
    }
    else if(option.next) { // Handle area transitions 
        handleAreaTransition(option.next);
    }
}

async function handleAreaTransition(nextDialogue) {
    const currentArea = GameTracker.areaName;
    const progressionEntry = storyProgression[currentArea];
    
    // Check for prison_intro special case
    if (nextDialogue === 'prison_intro') {
        GameTracker.areaName = 'prison';
        GameTracker.setFilepath();
        
        try {
            await loadAreaFromJSON();
            GameTracker.currentDialogue = 'prison_intro';
            loadDialogue();
            return;
        } catch (error) {
            console.error("Prison transition failed:", error);
            Terminal.outputMessage("Failed to load prison area.", errorColor);
        }
    }
    
    // Regular area transition logic
    if (progressionEntry && progressionEntry.nextArea && 
        (nextDialogue.includes(progressionEntry.nextArea) || 
         nextDialogue === progressionEntry.nextArea + '_intro')) {
        
        const nextArea = progressionEntry.nextArea;
        GameTracker.areaName = nextArea;
        GameTracker.setFilepath();
        
        try {
            await loadAreaFromJSON();
            GameTracker.currentDialogue = storyProgression[nextArea].startDialogue;
            loadDialogue();
        } catch (error) {
            console.error("Area transition failed:", error);
            Terminal.outputMessage("Failed to load next area.", errorColor);
        }
    } else {
        GameTracker.currentDialogue = nextDialogue;
        loadDialogue();
    }
}

async function loadAreaFromJSON(){
    try {
        const response = await fetch(GameTracker.areaFilepath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        GameTracker.currentArea = data;

        let newAreaName = GameTracker.areaName.replace("_", " ");
        document.getElementById("area-name").innerHTML = newAreaName;
        
        // Verify dialogue exists
        const dialogueExists = data.some(d => d.dialogue === storyProgression[GameTracker.areaName].startDialogue);
        if (!dialogueExists) {
            throw new Error(`Starting dialogue '${storyProgression[GameTracker.areaName].startDialogue}' not found in area data`);
        }
    }
    catch(error) {
        console.error("Error loading area from JSON: ", error);
        console.log("Attempted to load from path:", GameTracker.areaFilepath);
        Terminal.outputMessage("Error loading area data. Please check console.", errorColor);
    }
}

function loadDialogue() {
    let currentAreaDialogue;
    allowInput = false;

    try {
        for(let i=0; i < GameTracker.currentArea.length; i++) {
            if(GameTracker.currentArea[i].dialogue === GameTracker.currentDialogue) {
                currentAreaDialogue = GameTracker.currentArea[i];
                break;
            }
        }
    } catch(error) {
        console.error("Error: ", error);
    }

    if(!currentAreaDialogue) {
        console.error(`Dialogue: '${GameTracker.currentDialogue}' could not be found.`);
        return;
    }

    Terminal.outputMessage(currentAreaDialogue.message, dialogueColor);

    //
    // ADDING AND OUTPUTTING OPTIONS
    //

    //loop through options and display
    //clear last set of options
    let optionsLength = options.length;
    if(options.length > 0){
        for(let i=0; i < optionsLength; i++){
            options.pop();
        }
    }

    // Set option type from current dialogue
    optionType = currentAreaDialogue.optionType;
    let unfilteredOptions = currentAreaDialogue.options; //array to store all options, before removing ones that require logs
    
    //set all available options based on logs
    for(let i=0; i < unfilteredOptions.length; i++){
        let currentOption = unfilteredOptions[i]; //the current option from unfiltered list

        if("unlockLog" in currentOption){ //if this option has an unlock log
            for(let j=0; j<GameTracker.gameLogs.length; j++){

                let currentLog = GameTracker.gameLogs[j]; //the current log to be checked

                if(currentOption.unlockLog === currentLog){ //if the unlock log has been logged
                    options.push(currentOption); //adds the current option to the list
                    break;
                }
            }
        }
        else if("lockLog" in currentOption){ //if this option has a lock log
            options.push(currentOption); //adds the current option to the list (assumes lock log not met)

            for(let j=0; j<GameTracker.gameLogs.length; j++){

                let currentLog = GameTracker.gameLogs[j]; //the current log to be checked

                if(currentOption.lockLog === currentLog){ //if the lock log has been logged
                    options.pop(currentOption); //removes the current option from the list
                    break;
                }
            }
        }
        else{ //if no log condition
            options.push(currentOption); //adds the current option to the list
        }
    }

    //all options have now been added to options array
    //display all available options
    if(optionType === "number"){
        Terminal.outputMessage(`Enter a number: `, dialogueColor);
        for(let i=0; i < options.length; i++){
            let currentOption = options[i];
            Terminal.outputMessage(`${currentOption.choice}`, optionsColor);
        }
    }
    else{
        let outputString = `Enter a verb: `;
        for(let i=0; i < options.length; i++){
            let currentOption = options[i];
            outputString += `${currentOption.choice}`;

            if(i !== options.length - 1){
                outputString += `, `;
            }
        }
        Terminal.outputMessage(outputString, optionsColor);
    }

    currentSelectionIndex = -1;
    Terminal.setInputValue('');

    allowInput = true; //allow input once options are displayed

}

/**
 * Processes user input based on the current option type (number or verb)
 * 
 * Handles special commands like inventory display and routes the input
 * to the appropriate handler function based on the current option type.
 * Includes a delay to improve user experience.
 */
function handleUserInput() {
    const choice = Terminal.getUserInput().toLowerCase();
    
    setTimeout(() => {
        // Special commands
        if (choice === "show inventory") {
            // TODO: Implement inventory display
            return;
        }
        else if(choice === "save"){
            if(SaveLoadGame.saveGame()){
                Terminal.outputMessage("Game Saved!", optionResultColor);
            }
            else{
                Terminal.outputMessage("Game failed to save.", errorColor);
            }
            return;
        }
        else if(choice === "manage inventory"){
            allowOtherInput();
            Inventory.openInventoryManager();
            return;
        }
        
        // Handle different input types
        if (optionType === "number") {
            handleNumericChoice(choice);
        } else if (optionType === "verb") {
            handleVerbChoice(choice.toLowerCase());
        }
    }, 1000);
}

//method disables input from this file and waits for a 'disableOtehrInput' event to trigger before input is returned to this file
function allowOtherInput(){
    allowInput = false; //disable input for this file

    //event that will enable input for this again
    const enableInputAgain = (event) => {
        allowInput = true;
        console.log("Input changed back to main game.");
        if(event.detail.displayDialogue){
            loadDialogue();
        }
    }

    document.addEventListener("disableOtherInput", enableInputAgain, {once: true});
}

/**
 * Processes numeric inputs from the user
 * 
 * Converts the user's numeric input to a zero-based index,
 * validates it against available options, and processes the
 * selected choice or displays an error message.
 */
function handleNumericChoice(choice) {
    // Convert choice to number and subtract 1 for zero-based indexing
    const choiceIndex = parseInt(choice) - 1;
    
    // Validate numeric input
    if (isNaN(choiceIndex) || choiceIndex < 0 || choiceIndex >= options.length) {
        Terminal.outputMessage("Invalid choice! Please enter a valid number.", errorColor);
        return;
    }
    
    // Process valid choice
    processChoice(options[choiceIndex]);
}

/**
 * Processes verb-based inputs from the user
 * 
 * Searches available options for a matching verb choice,
 * processes the selected choice if found or displays an
 * error message if no match exists.
 */
function handleVerbChoice(choice) {
    // Find matching verb option
    const selectedOption = options.find(option => 
        option.choice.toLowerCase() === choice
    );
    
    if (!selectedOption) {
        Terminal.outputMessage("Invalid verb! Please enter one of the available options.", errorColor);
        return;
    }
    
    // Process valid choice
    processChoice(selectedOption);
}

// Add new function to handle arrow navigation
function handleArrowNavigation(direction) {
    if (options.length === 0) return;

    if (direction === 'up') {
        // go forward through options
        currentSelectionIndex = (currentSelectionIndex + 1) % options.length;
    } else if (direction === 'down') {
        // Clear selection
        currentSelectionIndex = -1;
        Terminal.setInputValue('');
        return;
    }

    // Update input field based on option type
    if (optionType === "number") {
        Terminal.setInputValue((currentSelectionIndex + 1).toString());
    } else {
        Terminal.setInputValue(options[currentSelectionIndex].choice);
    }
}


//-----
// Methods for updating game tracker based on selected option
//-----

//updates the player's reputation by the given amount in the option if the option includes it
function updateReputation(option){
    if (option.reputation) {
        Terminal.outputMessage(`Reputation change: ${option.reputation}`, optionResultColor);
        GameTracker.changeReputation(option.reputation);
        document.getElementById("reputation-number").innerHTML = GameTracker.reputation;
    }
}

//if the option includes an item to award, gives it to the player
async function awardItem(option){
    //if option doesnt award any item
    if(!option.item){
        return;
    }

    //get the item from the database
    let newItem = {}; //holds data of new item
    let getItemQuery = `SELECT * FROM items WHERE item_name = '${option.item.trim()}'`;
    try{
        let result = await DBQuery.getQueryResult(getItemQuery);

        //if no matching items were found
        if(!result.success || result.data.length == 0){
            console.error(`Item ${option.item} could not be found in DB.`);
            return;
        }

        //formats the new item correctly
        newItem.id = Number(result.data[0].item_id);
        newItem.name = result.data[0].item_name;
        newItem.description = result.data[0].item_description;
        newItem.image = result.data[0].item_image;
        newItem.consumable = result.data[0].is_consumable === "1";
        newItem.equipment = result.data[0].is_equipment === "1";
        newItem.keyItem = result.data[0].is_key_item === "1";
        newItem.effect = result.data[0].item_effect !== "" ? JSON.parse(result.data[0].item_effect) : {};
    }
    catch(error){
        console.error("Error getting item from DB: ", error);
        return;
    }

    //log that an item was found
    addLog("found_item");

    //try to add to inventory
    if(await Inventory.addItem(newItem)){
        return;
    }

    //if addItem didnt work (inventory was full)
    allowOtherInput();
    let confirmMessage = `Would you like to remove an item from your inventory to collect ${newItem.name}`;
    await Inventory.chooseItemToReplaceOutsideManager(confirmMessage, newItem);

    const afterDecision = function(){
        if(option.next){
            handleAreaTransition(option.next);
        }
        else{
            Terminal.outputMessage("Next area could not be found.", errorColor);
        }
    }
    document.addEventListener("itemAddChoiceComplete", afterDecision, {once: true});
}


//method to add any given log by the log's name (DONT PASS OPTION, PASS option.log)
async function addLog(logName){
    //get the log from the database
    let newLog = {}; //holds data of new log
    let getLogQuery = `SELECT * FROM game_logs WHERE log_name = '${logName.trim()}'`;
    try{
        let result = await DBQuery.getQueryResult(getLogQuery);

        //if no matching logs were found
        if(!result.success || result.data.length == 0){
            console.error(`Log ${logName} could not be found in DB.`);
            return;
        }

        //formats the new log correctly
        newLog.id = Number(result.data[0].log_id);
        newLog.name = result.data[0].log_name;
        newLog.routeLog = result.data[0].route_log === "1";
        newLog.quantity = 1;
    }
    catch(error){
        console.error("Error getting log from DB: ", error);
        return;
    }

    //if the player already has 1 of these logs, increase quantity
    for(let i=0; i<GameTracker.gameLogs.length; i++){
        let currentLog = GameTracker.gameLogs[i];
        if(currentLog.id === newLog.id){
            currentLog.quantity += 1;
            console.log(`Another ${newLog.name} log was added. Player now has ${currentLogs.quantity}.`);
            return;
        }
    }

    //if player does not have one of the logs, add the new log to the logs array
    GameTracker.gameLogs.push(newLog);

    console.log(GameTracker.gameLogs);
}

// Add function to display final score
function displayFinalScore() {
    const scoreResult = scoreSystem.calculateFinalScore();
    
    Terminal.outputMessage("=== Final Score ===", "#FFA500");
    Terminal.outputMessage(`Total Score: ${scoreResult.finalScore}`, "#00FF00");
    Terminal.outputMessage("\nScore Breakdown:", "#FFA500");
    Terminal.outputMessage(`Base Score: ${scoreResult.breakdown.baseScore}`, "#FFFFFF");
    Terminal.outputMessage(`Time Bonus: ${scoreResult.breakdown.timeBonus}`, "#FFFFFF");
    Terminal.outputMessage(`Reputation Multiplier: ${scoreResult.breakdown.reputationMultiplier.toFixed(2)}x`, "#FFFFFF");
    Terminal.outputMessage(`Strategic Decisions: ${scoreResult.breakdown.decisionPoints}`, "#FFFFFF");
    
    // Add minigame performance summary
    Terminal.outputMessage("\nMinigame Performance:", "#FFA500");
    Object.entries(scoreResult.breakdown.minigameScores).forEach(([game, stats]) => {
        if (stats.attempts > 0) {
            Terminal.outputMessage(
                `${game}: Best Score ${stats.bestScore} | Perfect Runs ${stats.perfectRuns}/${stats.attempts}`,
                "#FFFFFF"
            );
        }
    });
    
    if (scoreResult.breakdown.achievements.length > 0) {
        Terminal.outputMessage("\nAchievements Unlocked:", "#FFA500");
        scoreResult.breakdown.achievements.forEach(achievement => {
            Terminal.outputMessage(`- ${achievement}`, "#FFFFFF");
        });
    }
}

// Update handleVillageEscape function to use async/await and Promise
async function handleVillageEscape(choice, timeLeft) {
    const points = await scoreSystem.handleStoryChoice(choice, timeLeft);
    
    return new Promise((resolve) => {
        // Show score popup with context
        let message;
        switch(choice) {
            case 'S':
                message = `+${points} (Heroic Choice)`;
                break;
            case 'R':
                message = `+${points} (Quick Thinking)`;
                break;
            case 'T':
                message = `+${points} (Strategic Decision)`;
                break;
            default:
                message = `+${points}`;
        }

        const popup = document.getElementById('score-popup');
        popup.textContent = message;
        popup.classList.add('animate');
        
        // Use Promise to ensure animation completes
        setTimeout(() => {
            popup.classList.remove('animate');
            resolve();
        }, 1000);
    });
}
