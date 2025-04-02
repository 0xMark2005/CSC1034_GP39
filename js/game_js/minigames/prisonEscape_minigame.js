import { Terminal } from "../../terminal.js";
import { displayAnimation } from "../animation_handler.js";
import { GameTracker } from "../game_tracker.js";
import { AllyManager } from "../ally_manager.js";

export function prisonEscapeGame() {
    // Initialize state
    let gameActive = true;
    let escapeWindow = false;
    let timeoutId = null;
    let inputHandler = null;
    let startTime = null;

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
                    const reactionTime = Date.now() - startTime;
                    Terminal.outputMessage("You successfully sneak past the sleeping guard!", "#00FF00");
                    cleanup(true, reactionTime);
                }
            }
        };

        document.getElementById("user-input").addEventListener("keypress", inputHandler);
    }

    function startEscapeWindow() {
        escapeWindow = true;
        Terminal.outputMessage("\n>> The guard is in deep sleep - NOW is your chance to escape! <<", "#00FF00");
        Terminal.outputMessage("Type 'escape' quickly!", "#FFFF00");
        
        startTime = Date.now();
        
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

    function cleanup(success, reactionTime = 0) {
        if (timeoutId) clearTimeout(timeoutId);
        cleanupInputHandlers();
        
        // Calculate score based on performance
        let score = 0;
        let timeBonus = 0;
        let statChanges = {
            strength: 0,
            defense: 0,
            intelligence: 0
        };

        if (success) {
            // Base escape bonus
            score += 300;
            
            // Quick reaction bonus and stat calculations
            if (reactionTime > 0) {
                timeBonus = Math.floor((5000 - reactionTime) / 25);
                score += Math.max(0, timeBonus);
                
                // Calculate stat bonuses based on reaction time
                if (reactionTime < 1000) {  // Perfect escape
                    statChanges.strength = 8;
                    statChanges.defense = 6;
                    statChanges.intelligence = 7;
                } else if (reactionTime < 2000) {  // Very quick escape
                    statChanges.strength = 6;
                    statChanges.defense = 5;
                    statChanges.intelligence = 5;
                } else if (reactionTime < 3000) {  // Good escape
                    statChanges.strength = 4;
                    statChanges.defense = 3;
                    statChanges.intelligence = 3;
                } else {  // Slow but successful escape
                    statChanges.strength = 2;
                    statChanges.defense = 2;
                    statChanges.intelligence = 2;
                }
            }
            
            // Display stat changes
            Terminal.outputMessage("\nStat Changes:", "#00FF00");
            Terminal.outputMessage(`Strength +${statChanges.strength}`, "#00FF00");
            Terminal.outputMessage(`Defense +${statChanges.defense}`, "#00FF00");
            Terminal.outputMessage(`Intelligence +${statChanges.intelligence}`, "#00FF00");
            
            // Update GameTracker ally stats
            if (!GameTracker.allies) {
                GameTracker.allies = [{
                    id: 1,
                    hp: 100,
                    attack: statChanges.strength,
                    defence: statChanges.defense,
                    intelligence: statChanges.intelligence,
                    alive: true
                }];
            } else {
                GameTracker.allies[0].attack += statChanges.strength;
                GameTracker.allies[0].defence += statChanges.defense;
                GameTracker.allies[0].intelligence += statChanges.intelligence;
            }

            // Update ally visuals
            AllyManager.loadAllyVisuals();

            // Display final score
            Terminal.outputMessage(`\nFinal Score: ${score}`, "#FFA500");
        }
        
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                score: score,
                minigameId: 'prisonEscape',
                timeBonus: timeBonus,
                perfect: reactionTime < 1000,
                statChanges: statChanges,
                message: success ? "Successfully escaped the prison!" : "Failed to escape - guards caught you",
                next: 'prison_escape_complete' // Add this to ensure story progression
            }
        }));

        // Force progression
        GameTracker.currentDialogue = 'prison_escape_complete';
    }

    // Start the game
    startGame();
}