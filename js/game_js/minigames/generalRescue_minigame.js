import { Terminal } from "../../terminal.js";
import { GameTracker } from "../game_tracker.js";
import { AllyManager, recruitAlly } from "../ally_manager.js";

export function generalRescueGame() {
    let successfulAttempts = 0;
    let currentAttempt = 0;
    const requiredSuccesses = 3;
    const totalAttempts = 5;
    let gameActive = true;
    let codeElement = null;
    let inputEnabled = false;
    let timeoutIds = []; // Keep track of all timeouts

    const codes = [
        "3 1 4 2",
        "2 4 1 3",
        "4 2 3 1",
        "1 3 2 4",
        "3 4 1 2"
    ];

    Terminal.outputMessage("KNIGHT RESCUE: Watch the guard enter codes!", "#FF8181");
    Terminal.outputMessage("You need 3 correct codes out of 5 to unlock the cell.", "#ADD8E6");
    Terminal.outputMessage("Each code appears for 5 seconds. Enter what you saw.", "#ADD8E6");

    function startCode() {
        // Check if game should end or if it's not active anymore
        if (currentAttempt >= totalAttempts || !gameActive) {
            cleanup(successfulAttempts >= requiredSuccesses);
            return;
        }

        inputEnabled = false;
        const currentCode = codes[currentAttempt];
        currentAttempt++;

        // Create and show code element
        Terminal.outputMessage(`\nCode ${currentAttempt}/5:`, "#FFFFFF");
        
        const showCodeDelay = setTimeout(() => {
            // Disable input field while code is showing
            document.getElementById("user-input").disabled = true;
            
            codeElement = document.createElement('div');
            codeElement.textContent = currentCode;
            codeElement.style.color = "#FFFF00";
            
            const outputTerminal = document.getElementById("output-terminal");
            outputTerminal.appendChild(codeElement);
            
            // Auto scroll to bottom
            outputTerminal.scrollTop = outputTerminal.scrollHeight;

            const codeTimeout = setTimeout(() => {
                if (codeElement && codeElement.parentNode) {
                    codeElement.remove();
                }
                Terminal.outputMessage("\nEnter the code you saw:", "#00FF00");
                inputEnabled = true;
                document.getElementById("user-input").disabled = false;

                const codeHandler = function(event) {
                    if (!inputEnabled || event.key !== "Enter") return;
                    
                    inputEnabled = false;  // Disable input immediately
                    const input = Terminal.getUserInput().trim();
                    document.getElementById("user-input").removeEventListener("keypress", codeHandler);
                    
                    if (input === currentCode) {
                        successfulAttempts++;
                        Terminal.outputMessage(`Correct! (${successfulAttempts}/${requiredSuccesses} needed)`, "#00FF00");
                        
                        // If we have enough successes and there are still attempts left, show remaining codes
                        if (successfulAttempts >= requiredSuccesses && currentAttempt < totalAttempts) {
                            Terminal.outputMessage("\nYou've unlocked the cell! Remaining codes will still affect your score.", "#ADD8E6");
                        }
                    } else {
                        Terminal.outputMessage(`Wrong! The code was: ${currentCode}`, "#FF0000");
                    }
                    
                    // Clear any existing timeout
                    if (window.inputTimeout) {
                        clearTimeout(window.inputTimeout);
                    }
                    
                    // Add delay before next code
                    const nextCodeDelay = setTimeout(() => {
                        if (gameActive) startCode();
                    }, 2000);
                    timeoutIds.push(nextCodeDelay);
                };

                document.getElementById("user-input").addEventListener("keypress", codeHandler);
                document.getElementById("user-input").currentHandler = codeHandler;

                // Add timeout for input
                window.inputTimeout = setTimeout(() => {
                    if (inputEnabled) {
                        inputEnabled = false;
                        document.getElementById("user-input").removeEventListener("keypress", codeHandler);
                        Terminal.outputMessage(`Time's up! The code was: ${currentCode}`, "#FF0000");
                        
                        // Add delay before next code
                        const nextCodeDelay = setTimeout(() => {
                            if (gameActive) startCode();
                        }, 2000);
                        timeoutIds.push(nextCodeDelay);
                    }
                }, 10000);
                
                timeoutIds.push(window.inputTimeout);
            }, 5000);
            
            timeoutIds.push(codeTimeout);
        }, 1000);
        
        timeoutIds.push(showCodeDelay);
    }

    async function cleanup(success) {
        // Clear timeouts and disable game
        timeoutIds.forEach(id => clearTimeout(id));
        timeoutIds = [];
        gameActive = false;

        let score = 0;
        
        // Calculate score with verification
        if (success) {
            score = Number(400); // Base score
            console.log(`Base score: ${score}`);

            let attemptsBonus = Number(successfulAttempts * 100);
            console.log(`Attempts bonus (${successfulAttempts} × 100): +${attemptsBonus}`);
            score += attemptsBonus;

            if (successfulAttempts === totalAttempts) {
                let perfectBonus = Number(300);
                console.log(`Perfect bonus: +${perfectBonus}`);
                score += perfectBonus;
            }
        } else {
            score = Number(successfulAttempts * 50);
            console.log(`Consolation score (${successfulAttempts} × 50): ${score}`);
        }

        // Verify final score calculation
        console.log('Score Verification:', {
            calculatedScore: score,
            isNumber: typeof score === 'number',
            value: Number(score)
        });

        // Update global score with verification
        const oldScore = GameTracker.score;
        GameTracker.updateScore(score);
        console.log('Score Update Verification:', {
            oldScore: oldScore,
            addedScore: score,
            newTotal: GameTracker.score,
            expectedTotal: Number(oldScore) + Number(score)
        });

        // Show score in game
        Terminal.outputMessage(`\nFinal Score: +${score}`, "#FFA500");

        // Dispatch completion event with correct success state
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: successfulAttempts >= requiredSuccesses, 
                score: score,
                totalScore: GameTracker.score,
                minigameId: 'generalRescue',
                message: successfulAttempts >= requiredSuccesses ? 
                    "Successfully rescued the knight!" : 
                    "The rescue attempt failed...",
                next: 'find_medic_intro'
            }
        }));
    }

    // Start the game
    startCode();
}