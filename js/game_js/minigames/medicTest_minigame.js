import { Terminal } from "../../terminal.js";
import { GameTracker } from "../game_tracker.js";
import { AllyManager } from "../ally_manager.js";

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

    function recruitAlly(name) {
        if (!GameTracker.allies) {
            GameTracker.allies = [];
        }

        GameTracker.allies.push({
            id: GameTracker.allies.length + 1,
            name: name,
            imgFolder: 'css/assets/images/characters/medic',
            maxHp: 80,
            hp: 80,
            attack: 15,
            defence: 25,
            intelligence: 45,
            healing: 30, // Special healing ability
            alive: true,
            equipmentId: null
        });

        return true;
    }

    function cleanup(success) {
        gameActive = false;
        if (timeoutId) clearTimeout(timeoutId);

        // Remove input handler
        const userInput = document.getElementById("user-input");
        if (userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
        }

        if (success) {
            // Recruit medic using ally manager
            if (recruitAlly('Medic')) {
                Terminal.outputMessage("\nThe medic joins your cause!", "#00FF00");
                
                // Heal the knight if present
                const knight = GameTracker.allies.find(ally => ally.name === 'Knight');
                if (knight) {
                    knight.hp = knight.maxHp;
                    Terminal.outputMessage("\nThe medic heals the knight back to full health!", "#00FF00");
                }
                
                AllyManager.loadAllyVisuals();
            } else {
                Terminal.outputMessage("\nError recruiting medic!", "#FF0000");
            }
        }

        let score = success ? 500 : 100;
        score += (successfulAttempts * 100);

        Terminal.outputMessage(`\nFinal Score: ${score}`, "#FFA500");

        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                score: score,
                minigameId: 'medicTest',
                message: success ? "The medic agrees to join your cause!" : "The medic remains unconvinced...",
                next: success ? 'resistance_hq_intro' : 'clinic_scene'
            }
        }));
    }

    // Start the game
    startRound();
}