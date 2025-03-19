import { Terminal } from "../../terminal.js";

export function generalRescueGame() {
    Terminal.outputMessage("GUARD PATROL DECODER: Unscramble the patrol patterns to avoid detection!", "#FF8181");
    Terminal.outputMessage("Decode each pattern within 15 seconds. You need 3 successful decodes to reach the general.", "#FF8181");

    const patternPairs = [
        { scrambled: "THGNI TCWHA", original: "night watch" },
        { scrambled: "DRAGU TORLA", original: "guard patrol" },
        { scrambled: "LLCE CKECH", original: "cell check" },
        { scrambled: "SFHIT GANCHE", original: "shift change" },
        { scrambled: "RORUND OWLF", original: "round flow" }
    ];

    let currentRound = 0;
    const maxRounds = 3;
    let gameActive = true;

    function startPattern() {
        if (currentRound >= maxRounds || !gameActive) {
            cleanup(currentRound >= maxRounds);
            return;
        }

        // Pick random pattern
        const patternIndex = Math.floor(Math.random() * patternPairs.length);
        const currentPattern = patternPairs[patternIndex];

        Terminal.outputMessage(`\nDecode the patrol pattern: ${currentPattern.scrambled}`, "#00FF00");
        
        let timeoutId = setTimeout(() => {
            Terminal.outputMessage("Time's up! The guards spotted you!", "#FF0000");
            gameActive = false;
            cleanup(false);
        }, 15000); // 15 seconds per pattern

        const patternHandler = function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const input = Terminal.getUserInput().trim().toLowerCase();
                
                if (input === currentPattern.original) {
                    clearTimeout(timeoutId);
                    Terminal.outputMessage("Pattern decoded! You've avoided detection!", "#00FF00");
                    currentRound++;
                    startPattern();
                } else {
                    clearTimeout(timeoutId);
                    Terminal.outputMessage(`Wrong pattern! Correct pattern was: ${currentPattern.original}`, "#FF0000");
                    gameActive = false;
                    cleanup(false);
                }
            }
        };

        const userInput = document.getElementById("user-input");
        userInput.addEventListener("keypress", patternHandler);
        userInput.currentHandler = patternHandler;
    }

    function cleanup(success) {
        const userInput = document.getElementById("user-input");
        if (userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
        }

        if (success) {
            Terminal.outputMessage("You've successfully decoded all patrol patterns and reached the general!", "#00FF00");
        } else {
            Terminal.outputMessage("Guards have spotted you! You're forced to retreat to the slums.", "#FF0000");
        }

        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                message: success ? "Successfully infiltrated the prison!" : "Failed to decode patrol patterns",
                nextArea: success ? null : "slums" // Add area to return to on failure
            }
        }));
    }

    startPattern();
}