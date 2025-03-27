import { Terminal } from "../../terminal.js";
import { displayAnimation } from "../animation_handler.js";

export function generalRescueGame() {
    Terminal.outputMessage("PRISON GUARD PATTERNS: Memorize and repeat the guard patrol sequences!", "#FF8181");
    Terminal.outputMessage("Watch the pattern of numbers and repeat them in order.", "#FF8181");
    Terminal.outputMessage("You need 3 successful patterns to reach the imprisoned knight.", "#FF8181");
    Terminal.outputMessage("Take your time - you have 20 seconds per pattern.", "#ADD8E6");

    const patterns = [
        "4 2 3 1",
        "1 3 3 2 4",
        "2 4 1 4 3",
        "3 1 4 2 1",
        "4 4 2 1 3"
    ];

    let currentRound = 0;
    const maxRounds = 3;
    let gameActive = true;
    let patternElement = null;

    async function startPattern() {
        if (currentRound >= maxRounds || !gameActive) {
            cleanup(currentRound >= maxRounds);
            return;
        }

        const currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        // Play sleeping guard animation
        await displayAnimation('PrisonEscape/SleepinGuard.gif');
        
        Terminal.outputMessage("\nMemorize this guard patrol pattern:", "#00FF00");
        // Store reference to pattern element
        patternElement = document.createElement('div');
        patternElement.textContent = currentPattern;
        patternElement.style.color = "#FFFF00";
        document.getElementById("output-terminal").appendChild(patternElement);
        
        setTimeout(() => {
            // Remove pattern element completely
            patternElement.remove();
            // Play waking guard animation
            displayAnimation('PrisonEscape/wakingUp.gif');
            
            Terminal.outputMessage("\n==========================================", "#00FF00");
            Terminal.outputMessage("PATTERN HIDDEN - ENTER YOUR ANSWER BELOW", "#00FF00");
            Terminal.outputMessage("==========================================", "#00FF00");
            Terminal.outputMessage("Now enter the pattern you saw:", "#00FF00");
            
            let timeoutId = setTimeout(() => {
                Terminal.outputMessage("Time's up! The guards spotted you!", "#FF0000");
                gameActive = false;
                cleanup(false);
            }, 20000);

            const patternHandler = function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    const input = Terminal.getUserInput().trim().toLowerCase();
                    
                    if (input === currentPattern.toLowerCase()) {
                        clearTimeout(timeoutId);
                        Terminal.outputMessage("Pattern correct! Guards moving to next position!", "#00FF00");
                        currentRound++;
                        startPattern();
                    } else {
                        clearTimeout(timeoutId);
                        Terminal.outputMessage(`Wrong pattern! Guards alerted! The pattern was: ${currentPattern}`, "#FF0000");
                        gameActive = false;
                        cleanup(false);
                    }
                }
            };

            const userInput = document.getElementById("user-input");
            userInput.addEventListener("keypress", patternHandler);
            userInput.currentHandler = patternHandler;
        }, 5000); // Increased to 5 seconds for better visibility
    }

    function cleanup(success) {
        const userInput = document.getElementById("user-input");
        if (userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
        }

        if (success) {
            Terminal.outputMessage("You've successfully memorized the guard patterns and reached the knight!", "#00FF00");
        } else {
            Terminal.outputMessage("The guards caught you! You must retreat!", "#FF0000");
        }

        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                message: success ? "Successfully reached the imprisoned knight!" : "Failed to memorize guard patterns",
                nextArea: success ? null : "slums"
            }
        }));
    }

    startPattern();
}