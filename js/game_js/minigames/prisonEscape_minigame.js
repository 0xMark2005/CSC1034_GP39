import { Terminal } from "../../terminal.js";
import { displayAnimation } from "../animation_handler.js";

export function prisonEscapeGame() {
    // Initialize state
    let gameActive = true;
    let escapeWindow = false;
    let timeoutId = null;
    let inputHandler = null;

    // Clear any existing input handlers
    function cleanupInputHandlers() {
        if (inputHandler) {
            document.getElementById("user-input").removeEventListener("keypress", inputHandler);
            inputHandler = null;
        }
    }

    async function startGame() {
        try {
            // Initial messages
            Terminal.outputMessage("PRISON ESCAPE: A guard is watching your cell!", "#FF8181");
            Terminal.outputMessage("Wait for the guard to fall into deep sleep...", "#FF8181");
            Terminal.outputMessage("When you see the green message, type 'escape' quickly!", "#ADD8E6");

            // Play sleeping guard animation
            await displayAnimation('PrisonEscape/SleepinGuard.gif');
            startEscapeWindow();
            setupInputHandler();
        } catch (error) {
            console.error('Error in startGame:', error);
            cleanup(false);
        }
    }

    function setupInputHandler() {
        // Remove any existing handlers first
        cleanupInputHandlers();

        // Create new input handler
        inputHandler = async function(event) {
            if (!gameActive || !escapeWindow) return;
            
            if (event.key === "Enter") {
                const input = Terminal.getUserInput().trim().toLowerCase();
                if (input === "escape") {
                    gameActive = false;
                    clearTimeout(timeoutId);
                    Terminal.outputMessage("You successfully sneak past the sleeping guard!", "#00FF00");
                    cleanup(true);
                }
            }
        };

        document.getElementById("user-input").addEventListener("keypress", inputHandler);
    }

    function startEscapeWindow() {
        escapeWindow = true;
        Terminal.outputMessage("\n>> The guard is in deep sleep - NOW is your chance to escape! <<", "#00FF00");
        Terminal.outputMessage("Type 'escape' quickly!", "#FFFF00");
        
        timeoutId = setTimeout(async () => {
            if (!gameActive) return;
            
            escapeWindow = false;
            gameActive = false;
            try {
                await displayAnimation('PrisonEscape/WakingUp.gif');
                Terminal.outputMessage("The guard woke up! You've been caught!", "#FF0000");
            } catch (error) {
                console.error('Error playing waking animation:', error);
            }
            cleanup(false);
        }, 5000);
    }

    function cleanup(success) {
        // Clear timeouts and handlers
        if (timeoutId) clearTimeout(timeoutId);
        cleanupInputHandlers();
        
        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                message: success ? "Successfully escaped the prison!" : "Failed to escape - guards caught you",
                nextArea: success ? "tavern" : "prison"
            }
        }));
    }

    // Start the game
    startGame();
}