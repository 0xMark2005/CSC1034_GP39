//Imports
import { Terminal } from "../terminal.js";
import { GameTracker } from "./game_tracker.js";
import * as SaveLoadGame from "./save_load_game.js";
import * as Inventory from "./inventory.js";

import { prisonEscapeGame } from "./minigames/prisonEscape_minigame.js";
import { villageEscapeGame } from "./minigames/villageEscape_minigame.js";
import { generalRescueGame } from "./minigames/generalRescue_minigame.js";
import { handleArmyBattle } from "./battle.js";
import { addAlly } from "./character.js";

/**
 * Handles starting and completing minigames
 * Routes to appropriate minigame based on current area
 * @param {Object} option - The selected game option containing minigame details
 */
function handleMinigame(option) {
    allowInput = false;
    
    const minigameHandler = (e) => {
        allowInput = true;
        if (e.detail.success) {
            Terminal.outputMessage("Minigame completed successfully!", "#00FF00");
            if (option.next) {
                GameTracker.currentDialogue = option.next;
                loadDialogue();
            }
        } else {
            Terminal.outputMessage("Minigame failed!", errorColor);
            if (e.detail.nextArea) {
                // Handle failure by transitioning to specified area
                GameTracker.areaName = e.detail.nextArea;
                GameTracker.setFilepath();
                loadAreaFromJSON().then(() => {
                    GameTracker.currentDialogue = storyProgression[e.detail.nextArea].startDialogue;
                    loadDialogue();
                });
            } else {
                allowInput = false;
            }
        }
    };
    
    document.addEventListener('minigameComplete', minigameHandler, { once: true });
    
    // Route to appropriate minigame based on current area
    switch(GameTracker.areaName) {
        case "burning_village":
            villageEscapeGame();
            break;
        case "prison":
            prisonEscapeGame();
            break;
        case "knight_rescue":     // Changed from rescue_general to match story progression
            generalRescueGame();  // This will now handle the knight rescue
            break;
        default:
            Terminal.outputMessage("Error: No minigame found for this area", errorColor);
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

    //TEST INVENTORY
    await Inventory.loadInventoryItemVisuals();

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
        nextArea: "prison"
    },
    prison: {
        startDialogue: "prison_intro",
        nextArea: "tavern"
    },
    tavern: {
        startDialogue: "tavern_intro",
        nextArea: "knight_rescue"
    },
    knight_rescue: {
        startDialogue: "knight_rescue_intro",
        nextArea: "castle_takeover"
    },
    castle_takeover: {
        startDialogue: "castle_takeover_intro",
        nextArea: "game_complete"
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
    }

    // Handle area transitions
    if (option.next) {
        handleAreaTransition(option.next);
    }
}

function handleAreaTransition(nextDialogue) {
    const currentArea = GameTracker.areaName;
    const progressionEntry = storyProgression[currentArea];
    
    if (progressionEntry && nextDialogue.includes(progressionEntry.nextArea)) {
        // Transition to new area
        GameTracker.areaName = progressionEntry.nextArea;
        GameTracker.setFilepath();
        loadAreaFromJSON().then(() => {
            GameTracker.currentDialogue = storyProgression[progressionEntry.nextArea].startDialogue;
            loadDialogue();
        });
    } else {
        // Stay in current area
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
    }
    catch(error) {
        console.error("Error loading area from JSON: ", error);
        console.log("Attempted to load from path:", GameTracker.areaFilepath);
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
        loadDialogue();
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

function updateReputation(option){
    if (option.reputation) {
        Terminal.outputMessage(`Reputation change: ${option.reputation}`, optionResultColor);
        GameTracker.changeReputation(option.reputation);
        document.getElementById("reputation-number").innerHTML = GameTracker.reputation;
    }
}
