//Imports
import { Terminal } from "../terminal.js";
import { GameTracker } from "./game_tracking.js";

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

