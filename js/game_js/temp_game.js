//Imports
import { Terminal } from "../terminal.js";
import { GameTracker } from "./game_tracker.js";

//constants & variables
const dialogueColor = "#00FF00";

let allowInput = false;

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
        console.log(GameTracker.areaName);
    }
    catch(error){
        console.error("Error loading area from JSON: ", error);
    }
}

function loadDialogue(){
    let currentAreaDialogue; //store the current area dialogue tree data

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
    


}



function handleUserInput(){
    const choice = Terminal.getUserInput();
    setTimeout(() => {
        //list all unique options
        if (choice == "Show Inventory") {
            //Functionality to show inventory
            return;
        }

        // Cycle through all states and identify which one the user is currently in: This part cancels out the need for mohammeds progress file
        // switch (currentState) {
            
        // }
    }, 1000);
}

