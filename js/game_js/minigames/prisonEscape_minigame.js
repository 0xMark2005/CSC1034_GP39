import { Terminal } from "../../terminal.js";
import { displayAnimation } from "../animation_handler.js";
import { ScoreSystem } from "../score_system.js";
import { GameTracker } from "../game_tracker.js";
import { AllyManager } from "../ally_manager.js";  
import * as MainGame from "../temp_game.js";

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
                await displayAnimation('PrisonEscape/wakingUp.gif');
                Terminal.outputMessage("The guard woke up! You've been caught!", "#FF0000");
            } catch (error) {
                console.error('Error playing waking animation:', error);
            }
            cleanup(false);
        }, 5000);
    }

    async function cleanup(success, reactionTime = 0) {
        if (timeoutId) clearTimeout(timeoutId);
        cleanupInputHandlers();

        //Add log
        MainGame.addLog("played_minigame");
        
        let score = 0;
        let healthChange = 0;
        let healthMessage = "";
        let detailedMessage = "";

        if (success) {
            //Add log
            MainGame.addLog("minigame_won");

            score = Number(300);
            if (reactionTime > 0) {
                score += Number(Math.max(0, Math.floor((5000 - reactionTime) / 25)));
            }
            
            // More detailed health change messages
            if (reactionTime < 1000) {
                healthChange = 20;
                healthMessage = "Perfect escape! Your adrenaline rush energizes you!";
                detailedMessage = "Quick thinking and steady hands kept you at peak condition.";
                ScoreSystem.updateReputation(10);
            } else if (reactionTime < 2000) {
                healthChange = 10;
                healthMessage = "Good escape! The smooth getaway preserves your strength.";
                detailedMessage = "Your careful timing helped avoid unnecessary strain.";
                ScoreSystem.updateReputation(5);
            } else {
                healthChange = -10;
                healthMessage = "Close call! The tense escape saps your energy.";
                detailedMessage = "The prolonged stress takes its toll on your body.";
                ScoreSystem.updateReputation(2);
            }
        } else {
            //Add log
            MainGame.addLog("minigame_failed");

            healthChange = -25;
            healthMessage = "Captured! The guards rough you up during capture!";
            detailedMessage = "Being caught and restrained causes significant injuries.";
            ScoreSystem.updateReputation(-5);
        }

        // Apply health changes to peasant without minimum bound
        if (GameTracker.allies && GameTracker.allies.length > 0) {
            const peasant = GameTracker.allies[0];
            const oldHp = peasant.hp;
            
            // Remove Math.max(1, ...) to allow HP to reach 0
            peasant.hp = Math.min(peasant.maxHp, peasant.hp + healthChange);
            
            // Show detailed health feedback
            Terminal.outputMessage(`\n${healthMessage} (${healthChange > 0 ? '+' : ''}${healthChange} HP)`, 
                healthChange > 0 ? "#00FF00" : "#FF8181");
            Terminal.outputMessage(detailedMessage, "#ADD8E6");
            Terminal.outputMessage(`HP: ${oldHp} → ${peasant.hp}/${peasant.maxHp}`, "#FFA500");
            
            // Update health bar before checking game over
            await AllyManager.loadAllyVisuals();
            
            // Check for game over - will redirect to main menu if HP <= 0
            if (AllyManager.checkGameOver()) return;
        }

        GameTracker.updateScore(score);
        Terminal.outputMessage(`\nFinal Score: +${score}`, "#FFA500");

        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                score: score,
                minigameId: 'prisonEscape',
                timeBonus: Math.max(0, Math.floor((5000 - reactionTime) / 25)),
                perfect: reactionTime < 1000,
                statChanges: {
                    strength: 0,
                    defense: 0,
                    intelligence: 0
                },
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