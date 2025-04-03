import { Terminal } from "../../terminal.js";
import { ScoreSystem } from "../score_system.js";
import { GameTracker } from "../game_tracker.js";
import { AllyManager, recruitAlly } from "../ally_manager.js";  // Add recruitAlly import
import * as MainGame from "../temp_game.js";

export function medicTestGame() {
    let gameActive = true;
    let currentRound = 0;
    let timeoutId = null;
    let successfulAttempts = 0;
    let totalAttempts = 5;
    let requiredSuccesses = 3;
    let inputEnabled = true;  // Add this flag

    const questions = [
        { question: "A patient needs 4 healing potions per day for 3 days. How many potions needed?", answer: "12" },
        { question: "If bleeding causes 5 damage per minute, how much damage in 4 minutes?", answer: "20" },
        { question: "You have 30 bandages and use 6 per patient. How many patients can you treat?", answer: "5" },
        { question: "Healing spell heals 8 HP. How many casts to heal 40 HP?", answer: "5" },
        { question: "Antidote takes 3 minutes to work. How many minutes for 7 patients?", answer: "21" }
    ];

    Terminal.outputMessage("MEDIC'S TEST: Prove your medical knowledge!", "#FF8181");
    Terminal.outputMessage("Answer quick calculations that medics face daily.", "#FF8181");
    Terminal.outputMessage("You need 3 correct answers to gain the medic's trust.", "#ADD8E6");

    function startRound() {
        if (currentRound >= totalAttempts || !gameActive) {
            cleanup(successfulAttempts >= requiredSuccesses);
            return;
        }

        const currentQuestion = questions[currentRound];
        Terminal.outputMessage(`\nQuestion ${currentRound + 1}/5:`, "#FFFFFF");
        Terminal.outputMessage(currentQuestion.question, "#FFFF00");

        // Set timeout for answer
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            Terminal.outputMessage(`Time's up! The answer was: ${currentQuestion.answer}`, "#FF0000");
            currentRound++;
            setTimeout(() => startRound(), 1000);
        }, 15000); // 15 seconds to answer

        setupInputHandler(currentQuestion.answer);
    }

    function setupInputHandler(correctAnswer) {
        const userInput = document.getElementById("user-input");
        
        const inputHandler = function(event) {
            if (!inputEnabled || event.key !== "Enter") return;  // Check inputEnabled
            
            const input = Terminal.getUserInput().trim();
            inputEnabled = false;  // Disable input while processing
            
            if (input === correctAnswer) {
                clearTimeout(timeoutId);
                successfulAttempts++;
                Terminal.outputMessage(`Correct! (${successfulAttempts}/${requiredSuccesses} needed)`, "#00FF00");
                currentRound++;
                setTimeout(() => {
                    inputEnabled = true;  // Re-enable input for next question
                    startRound();
                }, 1000);
            } else {
                Terminal.outputMessage("Wrong! Try again!", "#FF0000");
                inputEnabled = true;  // Re-enable input for retry
            }
        };

        userInput.removeEventListener("keypress", userInput.currentHandler);
        userInput.addEventListener("keypress", inputHandler);
        userInput.currentHandler = inputHandler;
        inputEnabled = true;  // Enable input for new round
    }

    async function cleanup(success) {
        // Disable input first thing in cleanup
        inputEnabled = false;
        const userInput = document.getElementById("user-input");
        if (userInput && userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
            userInput.currentHandler = null;
        }

        // Calculate stat changes based on performance
        const statChanges = {
            strength: Math.floor(successfulAttempts * 1.5),
            defense: Math.floor(successfulAttempts * 1.2),
            intelligence: Math.floor(successfulAttempts * 2)
        };

        // Apply stats to all existing allies first
        if (GameTracker.allies && GameTracker.allies.length > 0) {
            GameTracker.allies.forEach(ally => {
                ally.attack += statChanges.strength;
                ally.defence += statChanges.defense;
                ally.intelligence += statChanges.intelligence;
            });
        }
        
        let baseScore = 500; // Base score
        let reputationMultiplier = 1; // Placeholder for reputation multiplier
        let finalScore = baseScore + (successfulAttempts * 100) * reputationMultiplier;

        GameTracker.updateScore(finalScore);

        //Add log
        MainGame.addLog("played_minigame");

        if (success) {
            //Add log
            MainGame.addLog("minigame_won");

            // Recruit medic using proper database recruitment
            if (await recruitAlly('Medic')) {  // Changed to use recruitAlly function
                Terminal.outputMessage("\nThe medic joins your cause!", "#00FF00");
                await AllyManager.loadAllyVisuals();

                // Heal all allies to full health after recruitment
                if (GameTracker.allies && GameTracker.allies.length > 0) {
                    GameTracker.allies.forEach(ally => {
                        ally.hp = ally.maxHp;
                    });
                    Terminal.outputMessage("\nThe medic heals everyone back to full health!", "#00FF00");
                }
            } else {
                Terminal.outputMessage("\nError recruiting medic!", "#FF0000");
            }
        }
        else{
            //Add log
            MainGame.addLog("minigame_failed");
        }

        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                baseScore: baseScore,
                multiplier: reputationMultiplier,
                finalScore: finalScore,
                totalScore: GameTracker.score,
                minigameId: 'medicTest',
                message: success ? "The medic joins your cause!" : "The medic remains unconvinced...",
                next: success ? 'resistance_hq_intro' : 'clinic_scene'
            }
        }));
    }

    // Start the game
    startRound();
}