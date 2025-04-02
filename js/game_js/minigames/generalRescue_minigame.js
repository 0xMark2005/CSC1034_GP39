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
            codeElement = document.createElement('div');
            codeElement.textContent = currentCode;
            codeElement.style.color = "#FFFF00";
            document.getElementById("output-terminal").appendChild(codeElement);

            const codeTimeout = setTimeout(() => {
                if (codeElement && codeElement.parentNode) {
                    codeElement.remove();
                }
                Terminal.outputMessage("\nEnter the code you saw:", "#00FF00");
                inputEnabled = true;
                
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
        if (!gameActive) return;
        gameActive = false;
        
        // Clear all timeouts
        timeoutIds.forEach(id => clearTimeout(id));
        timeoutIds = [];
        
        // Remove any active event listeners
        const userInput = document.getElementById("user-input");
        if (userInput && userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
        }

        // Calculate score and stats
        let score = 0;
        let statChanges = {
            strength: 0,
            defense: 0,
            intelligence: 0
        };

        if (success) {
            // Base success score
            score += 400;
            if (successfulAttempts === totalAttempts) {
                score += 300; // Perfect score bonus
            }
            score += successfulAttempts * 100;

            // Calculate stat changes based on performance
            if (successfulAttempts >= totalAttempts) {
                statChanges.strength = 8;
                statChanges.defense = 7;
                statChanges.intelligence = 6;
            } else if (successfulAttempts >= 4) {
                statChanges.strength = 6;
                statChanges.defense = 5;
                statChanges.intelligence = 5;
            } else {
                statChanges.strength = 4;
                statChanges.defense = 3;
                statChanges.intelligence = 3;
            }

            // Apply stats to all existing allies
            if (GameTracker.allies) {
                GameTracker.allies.forEach(ally => {
                    ally.attack += statChanges.strength;
                    ally.defence += statChanges.defense;
                    ally.intelligence += statChanges.intelligence;
                });
            }

            if (await recruitAlly('Knight')) {  // Name matches DB exactly
                Terminal.outputMessage("\nStat Changes for all allies:", "#00FF00");
                Terminal.outputMessage(`Strength +${statChanges.strength}`, "#00FF00");
                Terminal.outputMessage(`Defense +${statChanges.defense}`, "#00FF00");
                Terminal.outputMessage(`Intelligence +${statChanges.intelligence}`, "#00FF00");
                
                const knight = GameTracker.allies.find(ally => ally.name === 'Knight');
                if (knight) {
                    knight.hp = Math.floor(knight.maxHp * 0.3);
                }
            }
        } else {
            // Failed attempt scoring
            score += successfulAttempts * 50;

            // Reduced stats for failed attempt
            statChanges.strength = 2;
            statChanges.defense = 1;
            statChanges.intelligence = 1;

            // Apply reduced stats to all allies
            if (GameTracker.allies) {
                GameTracker.allies.forEach(ally => {
                    ally.attack += statChanges.strength;
                    ally.defence += statChanges.defense;
                    ally.intelligence += statChanges.intelligence;
                });
            }

            if (await recruitAlly('Knight')) {
                Terminal.outputMessage("\nDespite the failed attempt, you manage to free the knight!", "#FF8181");
                Terminal.outputMessage("\nBut the botched rescue leaves everyone severely wounded...", "#FF8181");
                
                const knight = GameTracker.allies.find(ally => ally.name === 'Knight');
                if (knight) {
                    knight.hp = Math.floor(knight.maxHp * 0.2); // 20% health
                    knight.attack -= 5;
                    knight.defence -= 5;
                    knight.intelligence -= 5;
                }
            }
        }

        // Update visuals
        AllyManager.loadAllyVisuals();

        // Display results
        Terminal.outputMessage(
            success ? `\nCell unlocked! The knight is free! Score: ${score}` 
                   : `\nFailed to unlock the cell! Score: ${score}`, 
            success ? "#00FF00" : "#FF0000"
        );

        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: true, // Always true to continue story
                score: score,
                minigameId: 'generalRescue',
                statChanges: statChanges,
                message: success ? "You've successfully rescued the knight, but they're injured!" : "The rescue attempt failed...",
                next: 'find_medic_intro'
            }
        }));
    }

    // Start the game
    startCode();
}