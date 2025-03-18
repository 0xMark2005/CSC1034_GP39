//Imports
import { Terminal } from "../terminal.js";
import { GameTracker } from "./game_tracker.js";

//constants & variables
const dialogueColor = "#00FF00";
const optionsColor = "#00FF00";

let allowInput = false; //boolean stores whether user can input or not
const options = []; //array to store the options the user currently can choose from
let optionType = "number"; //boolean to store if input is numeric or a verb
let currentSelectionIndex = -1;

document.addEventListener("DOMContentLoaded", async function(){

    //Initialize terminal
    let outputTerminal = document.getElementById("output-terminal");
    let userInput = document.getElementById("user-input");
    Terminal.initialize(outputTerminal, userInput);

    //Load save file methods below (seperate js file)

    //Game setup
    GameTracker.areaName = "burning_village";
    GameTracker.setFilepath();
    await loadAreaFromJSON();

    GameTracker.currentDialogue = "burning_village_intro";  // Was "start"
    loadDialogue();


    //-----
    //Adding event listeners
    //-----
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


    //-----
    //Game Loop
    //-----
    // let exitGame = false
    // while(!exitGame){
    //     //run game code
    // }
    
});


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
    let outputString = ``;
    if(optionType === "number"){
        outputString = `Enter a number: \n`;
        for(let i=0; i < options.length; i++){
            let currentOption = options[i];
            outputString += `${i+1}. ${currentOption.choice}`;

            if(i !== options.length - 1){
                outputString += `\n`;
            }
        }
    }
    else{
        outputString = `Enter a verb: `;
        for(let i=0; i < options.length; i++){
            let currentOption = options[i];
            outputString += `${currentOption.choice}`;

            if(i !== options.length - 1){
                outputString += `, `;
            }
        }
    }

    Terminal.outputMessage(outputString, optionsColor);

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
    const choice = Terminal.getUserInput();
    
    setTimeout(() => {
        // Special commands
        if (choice === "Show Inventory") {
            // TODO: Implement inventory display
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
        Terminal.outputMessage("Invalid choice! Please enter a valid number.", "#FF0000");
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
        Terminal.outputMessage("Invalid verb! Please enter one of the available options.", "#FF0000");
        return;
    }
    
    // Process valid choice
    processChoice(selectedOption);
}

/**
 * Processes a selected game option and handles its consequences
 * 
 * Displays result messages, processes reputation changes, checks for
 * game over conditions, and manages area transitions. Handles complex
 * area change logic including loading new areas from JSON files.
 */
function processChoice(option) {
    // Output the result message
    Terminal.outputMessage(option.message, dialogueColor);
    
    // Handle reputation changes if present
    if (option.reputation) {
        console.log(`Reputation change: ${option.reputation}`);
    }
    
    // Check for game over
    if (option.gameOver) {
        Terminal.outputMessage("Game Over", "#FF0000");
        allowInput = false;
        return;
    }
    
    // Move to next dialogue if specified
    if (option.next) {
        let nextDialogue = option.next;
        let currentArea = GameTracker.areaName;
        
        // Check if we're moving to a new area
        const areaTransitions = {
            capital_gates: "capital_gates_intro",
            prison: "capital_prison_intro",  // Only accessible from capital gates
            sewer_escape: "sewer_escape_intro",
            slums: "slums_intro",
            rescue_general: "rescue_general_intro",
            castle_takeover: "castle_takeover_intro"
        };
        
        // Check if we need to change areas
        let areaChanged = false;
        let newArea = null;
        
        // First, determine if we're changing areas
        for (const [area, startDialogue] of Object.entries(areaTransitions)) {
            // Only allow prison transition from capital_gates area
            if (area === "prison" && currentArea !== "capital_gates") {
                continue;
            }
            
            if (nextDialogue.includes(area.replace('_escape', ''))) {
                newArea = area;
                if (currentArea !== newArea) {
                    areaChanged = true;
                    GameTracker.areaName = newArea;
                    GameTracker.currentDialogue = startDialogue;
                }
                break;
            }
        }
        
        // If not changing areas, just update the dialogue
        if (!areaChanged) {
            GameTracker.currentDialogue = nextDialogue;
            loadDialogue();
            return;
        }
        
        // If changing areas, load the new area
        GameTracker.setFilepath();
        loadAreaFromJSON().then(() => {
            loadDialogue();
        }).catch((error) => {
            console.error("Error during area transition:", error);
            Terminal.outputMessage("Error loading the next area.", "#FF0000");
        });
    }
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