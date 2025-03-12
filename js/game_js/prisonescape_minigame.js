import { Terminal } from "./terminal.js";

export function prisonEscapeGame() {
    Terminal.outputMessage("Prison Escape minigame: Wait for the signal, then type 'escape' as fast as you can. If you type too early, you're caught.", "#FF8181");
    window.currentState = "prisonEscape";

    let signalGiven = false;
    let startTime = null;

    //Getting user input 
    const prisonEscapeInputHandler = function(event) {
        if (event.key === "Enter") {
            event.stopImmediatePropagation();
            event.preventDefault();
            const input = Terminal.getUserInput().trim().toLowerCase();
            
            if (!signalGiven) {
                Terminal.outputMessage("Too soon - The guard wakes up. Game over!", "#FF8181");
                cleanup();
                window.currentState = "introduction";
                return;
            }
            
            if (input === "escape") {
                const reactionTime = Date.now() - startTime;
                Terminal.outputMessage("You escaped! Reaction time: " + reactionTime + " ms", "#00FF00");
            } else {
                Terminal.outputMessage("Wrong command - you failed to escape :(", "#FF8181");
            }
            cleanup();
            window.currentState = "introduction";
        }
    };

    const userInput = document.getElementById("user-input");
    userInput.addEventListener("keypress", prisonEscapeInputHandler, true);

    //remove custom handler
    function cleanup() {
        userInput.removeEventListener("keypress", prisonEscapeInputHandler, true);
    }


    // 2 to 5 second delay before signal is shown
    const delay = Math.floor(Math.random() * 3000) + 2000;
    setTimeout(() => {
        Terminal.outputMessage("ESCAPE NOW!", "#00FF00");
        signalGiven = true;
        startTime = Date.now();
    }, delay);

    window.prisonEscapeGame = prisonEscapeGame;

}