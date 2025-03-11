//Imports
import { Terminal } from "../terminal.js";
import { GameTracker } from "./game_tracker.js";

document.addEventListener("DOMContentLoaded", function(){

    //Initialize terminal
    let outputTerminal = document.getElementById("output-terminal");
    let userInput = document.getElementById("input-terminal");
    Terminal.initialize(outputTerminal, userInput);

    //Load save file methods below

    //Game setup
    loadAreaFromJSON(GameTracker.nextAreaFilepath)


    //-----
    //Adding event listeners
    //-----
    userInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            handleUserInput();
        }
    });

    //-----
    //Game Loop
    //-----
    let exitGame = false
    while(!exitGame){
        //run game code
    }
    
});


async function loadAreaFromJSON(filepath){
    try{
        let response = await fetch(filepath);
        let data = await response.json();
        GameTracker.currentArea = data;
    }
    catch{
        console.error("Error loading area from JSON: ", error);
    }
}

function loadDialogue(){
    let currentAreaDialogue; //store the current area dialogue tree data

    //check through the area array for the current dialogue
    for(let i=0; i<GameTracker.currentArea.length; i++){

        //if found set currentAreaDialogue
        if(GameTracker.currentArea[i].dialogue = GameTracker.currentDialogue){
            currentAreaDialogue = GameTracker.currentArea[i];
            return;
        }

        //if not found after searching through all dialogues, output error
        if(i === GameTracker.currentArea.length - 1){
            console.error(`Dialogue: '${GameTracker.currentDialogue}' could not be found.`)
        }
    }

    //Terminal.outputMessage()
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
        switch (currentState) {
            
        }
    }, 1000);
}

