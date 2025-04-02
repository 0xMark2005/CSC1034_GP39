import { Terminal } from "../../terminal.js";
import { GameTracker } from "../game_tracker.js";
import { AllyManager, recruitAlly } from "../ally_manager.js";

export function medicTestGame() {
    let gameActive = true;
    let currentRound = 0;
    let timeoutId = null;
    let successfulAttempts = 0;
    let totalAttempts = 5;
    let requiredSuccesses = 3;

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
            if (event.key === "Enter" && gameActive) {
                const input = Terminal.getUserInput().trim();
                
                if (input === correctAnswer) {
                    clearTimeout(timeoutId);
                    successfulAttempts++;
                    Terminal.outputMessage(`Correct! (${successfulAttempts}/${requiredSuccesses} needed)`, "#00FF00");
                    currentRound++;
                    setTimeout(() => startRound(), 1000);
                } else {
                    Terminal.outputMessage("Wrong! Try again!", "#FF0000");
                }
            }
        };

        userInput.removeEventListener("keypress", userInput.currentHandler);
        userInput.addEventListener("keypress", inputHandler);
        userInput.currentHandler = inputHandler;
    }

    async function cleanup(success) {
        let score = 0;
        if (success) {
            score = Number(500); // Base score
            score += Number(successfulAttempts * 100); // Points per correct answer
            if (successfulAttempts >= requiredSuccesses) {
                score += Number(300); // Bonus
            }
        }

        GameTracker.updateScore(score);
        Terminal.outputMessage(`\nFinal Score: +${score}`, "#FFA500");

        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                score: score,
                totalScore: GameTracker.score,
                minigameId: 'medicTest',
                message: success ? "The medic agrees to join your cause!" : "The medic remains unconvinced...",
                next: success ? 'resistance_hq_intro' : 'clinic_scene'
            }
        }));
    }

    // Start the game
    startRound();
}