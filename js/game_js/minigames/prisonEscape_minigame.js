import { Terminal } from "../../terminal.js";
import { displayAnimation } from "../animation_handler.js";

export function prisonEscapeGame() {
    Terminal.outputMessage("PRISON ESCAPE: A guard is watching your cell!", "#FF8181");
    Terminal.outputMessage("Wait for the guard to fall into deep sleep...", "#FF8181");
    Terminal.outputMessage("When you see the green message, type 'escape' quickly!", "#ADD8E6");

    let gameActive = true;
    let escapeWindow = false;
    let timeoutId = null;
    let guardContainer = null;

    async function startGame() {
        try {
            // Play sleeping guard animation first
            await displayAnimation('PrisonEscape/SleepinGuard.gif');

            // Create and show static guard image
            guardContainer = document.createElement('div');
            guardContainer.className = 'guard-container';
            guardContainer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1000;
            `;
            
            const guardImage = new Image();
            guardImage.onload = () => {
                guardContainer.appendChild(guardImage);
                document.body.appendChild(guardContainer);
                startEscapeWindow();
                setupInputHandler();
            };
            
            guardImage.onerror = () => {
                console.error('Failed to load guard image');
                startEscapeWindow();
                setupInputHandler();
            };
            
            guardImage.src = 'css/assets/images/Animations/PrisonEscape/AsleepGuard.png';
            guardImage.style.maxWidth = '400px';

        } catch (error) {
            console.error('Error in startGame:', error);
            cleanup(false);
        }
    }

    function startEscapeWindow() {
        escapeWindow = true;
        // Add clear message when escape window opens
        Terminal.outputMessage("\n>> The guard is in deep sleep - NOW is your chance to escape! <<", "#00FF00");
        Terminal.outputMessage("Type 'escape' quickly!", "#FFFF00");
        
        timeoutId = setTimeout(async () => {
            escapeWindow = false;
            if (guardContainer) {
                guardContainer.remove();
                guardContainer = null;
            }
            try {
                await displayAnimation('PrisonEscape/wakingUp.gif');
                Terminal.outputMessage("The guard woke up! You've been caught!", "#FF0000");
            } catch (error) {
                console.error('Error playing waking animation:', error);
            }
            cleanup(false);
        }, 5000);
    }

    function setupInputHandler() {
        const inputHandler = async function(event) {
            if (event.key === "Enter") {
                const input = Terminal.getUserInput().trim().toLowerCase();
                if (input === "escape" && escapeWindow && gameActive) {
                    clearTimeout(timeoutId);
                    if (guardContainer) guardContainer.remove();
                    Terminal.outputMessage("You successfully sneak past the sleeping guard!", "#00FF00");
                    cleanup(true);
                }
            }
        };

        document.getElementById("user-input").addEventListener("keypress", inputHandler);
    }

    function cleanup(success) {
        gameActive = false;
        if (timeoutId) clearTimeout(timeoutId);
        if (guardContainer) guardContainer.remove();
        
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                message: success ? "Successfully escaped the prison!" : "Failed to escape - guards caught you",
                nextArea: success ? null : "prison"
            }
        }));
    }

    startGame();
}