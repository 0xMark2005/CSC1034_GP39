//Imports
import { Terminal } from "../terminal.js";
import { GameTracker } from "./game_tracker.js";

//constants & variables
const dialogueColor = "#00FF00";
const optionsColor = "#00FF00";

let allowInput = false; //boolean stores whether user can input or not
const options = []; //array to store the options the user currently can choose from
let optionType = "number"; //boolean to store if input is numeric or a verb

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

    GameTracker.currentDialogue="start"
    loadDialogue();


    //-----
    //Adding event listeners
    //-----
    userInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter" && allowInput) {
            handleUserInput();
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
    try{
        let response = await fetch(GameTracker.areaFilepath);   
        let data = await response.json();
        GameTracker.currentArea = data; 

        let newAreaName = GameTracker.areaName.replace("_", " ");
        document.getElementById("area-name").innerHTML = newAreaName;
    }
    catch(error){
        console.error("Error loading area from JSON: ", error);
    }
}

function loadDialogue(){
    let currentAreaDialogue; //store the current area dialogue tree data

    allowInput = false; //dont allow input while outputting dialogue

    try{
        //check through the area array for the current dialogue
        for(let i=0; i<GameTracker.currentArea.length; i++){

            //if found set currentAreaDialogue
            if(GameTracker.currentArea[i].dialogue = GameTracker.currentDialogue){
                currentAreaDialogue = GameTracker.currentArea[i];
                break;
            }
        }
    }
    catch(error){
        console.error("Error: ", error);
    }

    //if not found after searching through all dialogues, output error
    if(!currentAreaDialogue){
        console.error(`Dialogue: '${GameTracker.currentDialogue}' could not be found.`)
        return;
    }

    //output the message in the dialogue
    Terminal.outputMessage(currentAreaDialogue.message, dialogueColor);

    //loop through options and display
    try{
        //clear last set of options
        let optionsLength = options.length;
        if(options.length > 0){
            for(let i=0; i < optionsLength; i++){
                options.pop();
            }
        }

        optionType = options.optionType; //set option type
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
            outputString += `${i+1}. `;
        }
        else{
            outputString = `Enter a verb: `
            for(let i=0; i < options.length; i++){
                let currentOption = options[i];
                outputString += `${currentOption.choice}`;

                if(i !== options.length - 1){
                    outputString += `, `;
                }
            }
        }

        Terminal.outputMessage(outputString, optionsColor);
    }
    catch(error){
        console.error("Error: ", error);
    }

    allowInput = true; //allow input once options are displayed

}



function handleUserInput(){
    const choice = Terminal.getUserInput();
    setTimeout(() => {
        //list all unique options
        if (choice == "Show Inventory") {
            //Functionality to show inventory
            return;
        }

        //if numeric input
        //if verb input

    }, 1000);
}

