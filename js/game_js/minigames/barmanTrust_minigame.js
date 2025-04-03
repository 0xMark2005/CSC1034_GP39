import { Terminal } from "../../terminal.js";
import { ScoreSystem } from "../score_system.js";
import { GameTracker } from "../game_tracker.js";
import { AllyManager, recruitAlly } from "../ally_manager.js";  // Import both AllyManager and recruitAlly
import * as MainGame from "../temp_game.js";

export function barmanTrustGame() {
    // Game state
    let gameActive = true;
    let currentRound = 0;
    let timeoutId = null;
    let successfulAttempts = 0;
    let inputEnabled = true;  // Add input enabled state
    const requiredSuccesses = 3;
    const roundTime = 15000; // 15 seconds per word

    // Word pairs with hints
    const puzzles = [
        { scrambled: "YOLALYT", original: "LOYALTY", hint: "What a good barman values most" },
        { scrambled: "TSRUT", original: "TRUST", hint: "Essential for any partnership" },
        { scrambled: "REBLE", original: "REBEL", hint: "Someone who fights the system" },
        { scrambled: "GECAHN", original: "CHANGE", hint: "What the resistance seeks" },
        { scrambled: "THRTU", original: "TRUTH", hint: "What you seek to reveal" }
    ];

    // Start game
    Terminal.outputMessage("BARMAN'S TRUST TEST: Prove your intelligence!", "#FF8181");
    Terminal.outputMessage("Unscramble each word within 15 seconds.", "#FF8181");
    Terminal.outputMessage("You need 3 correct answers to gain his trust.", "#ADD8E6");

    function startRound() {
        if (currentRound >= puzzles.length) {
            cleanup(successfulAttempts >= requiredSuccesses);
            return;
        }

        const puzzle = puzzles[currentRound];
        Terminal.outputMessage(`\nRound ${currentRound + 1}/5`, "#FFFFFF");
        Terminal.outputMessage(`Unscramble: ${puzzle.scrambled}`, "#FFFF00");
        Terminal.outputMessage(`Hint: ${puzzle.hint}`, "#ADD8E6");

        // Clear any existing timeout
        if (timeoutId) clearTimeout(timeoutId);

        // Set timeout for round
        timeoutId = setTimeout(() => {
            inputEnabled = false;  // Disable input when time's up
            Terminal.outputMessage(`Time's up! The word was: ${puzzle.original}`, "#FF0000");
            currentRound++;
            setTimeout(() => {
                inputEnabled = true;  // Re-enable input for next round
                startRound();
            }, 1000);
        }, roundTime);

        setupInputHandler(puzzle.original);
    }

    function setupInputHandler(correctWord) {
        const userInput = document.getElementById("user-input");
        
        const inputHandler = function(event) {
            if (event.key === "Enter" && gameActive && inputEnabled) {  // Check inputEnabled
                const input = Terminal.getUserInput().trim().toUpperCase();
                inputEnabled = false;  // Disable input while processing
                
                if (input === correctWord) {
                    clearTimeout(timeoutId);
                    successfulAttempts++;
                    Terminal.outputMessage(`Correct! (${successfulAttempts}/${requiredSuccesses} needed)`, "#00FF00");
                    currentRound++;
                    setTimeout(() => {
                        inputEnabled = true;  // Re-enable input
                        startRound();
                    }, 1000);
                } else {
                    Terminal.outputMessage("Wrong! Try again!", "#FF0000");
                    inputEnabled = true;  // Re-enable input for retry
                }
            }
        };

        userInput.removeEventListener("keypress", userInput.currentHandler);
        userInput.addEventListener("keypress", inputHandler);
        userInput.currentHandler = inputHandler;
        inputEnabled = true;  // Ensure input is enabled at start of round
    }

    async function cleanup(success) {
        // Disable input and clear handlers first
        inputEnabled = false;
        gameActive = false;
        if (timeoutId) clearTimeout(timeoutId);
        
        const userInput = document.getElementById("user-input");
        if (userInput && userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
            userInput.currentHandler = null;
        }

        //Add log
        MainGame.addLog("played_minigame");

        // Calculate base score and reputation changes
        let baseScore = 0;
        if (success) {
            //Add log
            MainGame.addLog("minigame_won");
            
            baseScore = Number(500);
            baseScore += Number(successfulAttempts * 100);
            ScoreSystem.updateReputation(successfulAttempts >= puzzles.length ? 15 : 8);
        } else {
            //Add log
            MainGame.addLog("minigame_failed");

            baseScore = Number(200); // Minimum score for attempting
            ScoreSystem.updateReputation(-3);
        }

        // Apply reputation multiplier and update score
        const reputationMultiplier = ScoreSystem.reputationMultiplier || 1.0;
        const finalScore = Math.round(baseScore * reputationMultiplier);

        // Show score breakdown in terminal
        Terminal.outputMessage("\nScore Breakdown:", "#FFA500");
        Terminal.outputMessage(`Base Score: ${baseScore}`, "#FFA500");
        Terminal.outputMessage(`Reputation Multiplier: ${reputationMultiplier.toFixed(1)}x`, "#FFA500");
        Terminal.outputMessage(`Final Score: +${finalScore}`, "#00FF00");

        // Update game tracker with final score
        GameTracker.updateScore(finalScore);

        // Handle health changes
        if (GameTracker.allies && GameTracker.allies.length > 0) {
            const peasant = GameTracker.allies[0];
            let healthChange = 0;
            let healthMessage = "";

            if (success) {
                if (successfulAttempts === puzzles.length) {
                    healthChange = 25;
                    healthMessage = "The barman's special 'medicinal' ale works wonders! Your spelling bee victory earns you the good stuff!";
                } else {
                    healthChange = 15;
                    healthMessage = "The barman's cheap ale is... surprisingly refreshing!";
                }
            } else {
                healthChange = -10;
                healthMessage = "The barman serves you the cheapest ale... it tastes terrible.";
            }

            // Apply health changes and show messages
            const oldHp = peasant.hp;
            peasant.hp = Math.max(1, Math.min(peasant.maxHp, peasant.hp + healthChange));
            
            Terminal.outputMessage(`\n${healthMessage}`, healthChange > 0 ? "#00FF00" : "#FF8181");
            Terminal.outputMessage(`${healthChange > 0 ? "Bottoms up!" : "Ouch!"} (${healthChange > 0 ? '+' : ''}${healthChange} HP)`, "#FFA500");
            Terminal.outputMessage(`HP: ${oldHp} → ${peasant.hp}/${peasant.maxHp}`, "#FFA500");
            
            await AllyManager.loadAllyVisuals();
        }

        // Recruit barman with different stats based on performance
        let allyStats = {
            attack: success ? 15 : 10,
            defense: success ? 12 : 8,
            intelligence: success ? 10 : 5
        };

        if (await recruitAlly('Bar Man', success, allyStats)) {
            await AllyManager.loadAllyVisuals();
            Terminal.outputMessage("\nThe barman " + (success ? 
                "enthusiastically joins your cause!" : 
                "reluctantly agrees to help, but remains skeptical."), 
                success ? "#00FF00" : "#FFA500");
        }

        // Always progress, but with different messages
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: true, // Always true to allow progression
                baseScore: baseScore,
                multiplier: reputationMultiplier,
                finalScore: finalScore,
                totalScore: GameTracker.score,
                minigameId: 'barmanTrust',
                message: success ? 
                    "The barman joins your cause with confidence!" : 
                    "The barman joins hesitantly...",
                next: 'barman_joins' // Always progress to next scene
            }
        }));
    }

    // Start the game
    startRound();
}