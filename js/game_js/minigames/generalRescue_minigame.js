import { Terminal } from "../../terminal.js";
import { ScoreSystem } from "../score_system.js";
import { GameTracker } from "../game_tracker.js";
import { AllyManager, recruitAlly } from "../ally_manager.js";
import * as MainGame from "../temp_game.js";

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

        // Add health changes for peasant based on performance
        if (GameTracker.allies && GameTracker.allies.length > 0) {
            const peasant = GameTracker.allies[0];
            let healthChange = 0;
            let healthMessage = "";
            
            // Determine health change based on performance
            if (successfulAttempts >= totalAttempts) {
                healthChange = 30;
                healthMessage = "Your perfect memory impresses the guard so much, he shares his secret healing herbs!";
            } else if (successfulAttempts >= requiredSuccesses) {
                healthChange = 15;
                healthMessage = "The adrenaline rush from successfully breaking out gives you a second wind!";
            } else {
                healthChange = -25;
                healthMessage = "The stress of failing the codes gives you a splitting headache...";
            }

            // Apply health change with bounds checking
            const oldHp = peasant.hp;
            peasant.hp = Math.max(1, Math.min(peasant.maxHp, peasant.hp + healthChange));
            await AllyManager.loadAllyVisuals();
            if (AllyManager.checkGameOver()) return;

            // Show health feedback
            Terminal.outputMessage(`\n${healthMessage}`, healthChange > 0 ? "#00FF00" : "#FF8181");
            Terminal.outputMessage(`Health Change: (${healthChange > 0 ? '+' : ''}${healthChange} HP)`, "#FFA500");
            Terminal.outputMessage(`Your HP: ${oldHp} → ${peasant.hp}/${peasant.maxHp}`, "#FFA500");
        }

        // Calculate stats based on performance
        let statChanges = {
            strength: 0,
            defense: 0,
            intelligence: 0
        };

        //Add log
        MainGame.addLog("played_minigame");

        // Adjust stats based on performance
        if (successfulAttempts >= totalAttempts) {
            //Add log
            MainGame.addLog("minigame_won");

            // Perfect performance - highest stat boost
            statChanges.strength = 8;
            statChanges.defense = 7;
            statChanges.intelligence = 6;
        } else if (successfulAttempts >= requiredSuccesses) {
            //Add log
            MainGame.addLog("minigame_won");

            // Passed - moderate stat boost
            statChanges.strength = 6;
            statChanges.defense = 5;
            statChanges.intelligence = 5;
        } else {
            //Add log
            MainGame.addLog("minigame_failed");

            // Failed - stat reduction
            statChanges.strength = -4;
            statChanges.defense = -3;
            statChanges.intelligence = -2;
        }

        // Calculate base score
        const baseAttemptScore = 200;  
        const perCodeScore = 200;      
        const perfectBonus = 300;      

        let baseScore = Number(baseAttemptScore);
        baseScore += Number(successfulAttempts * perCodeScore);

        // Apply stats to existing allies
        if (GameTracker.allies && GameTracker.allies.length > 0) {
            GameTracker.allies.forEach(ally => {
                ally.attack = Math.max(0, ally.attack + statChanges.strength);
                ally.defence = Math.max(0, ally.defence + statChanges.defense);
                ally.intelligence = Math.max(0, ally.intelligence + statChanges.intelligence);
            });
        }

        // Always recruit knight, but condition affects their starting state
        if (await recruitAlly('Knight')) {
            Terminal.outputMessage("\nThe knight joins your cause!", "#00FF00");
            
            // Update knight's HP based on performance
            const knight = GameTracker.allies.find(a => a.name === 'Knight');
            if (knight) {
                if (successfulAttempts >= requiredSuccesses) {
                    knight.hp = successfulAttempts === totalAttempts ? knight.maxHp : Math.floor(knight.maxHp * 0.75);
                    Terminal.outputMessage("\nThe knight is in good condition!", "#00FF00");
                } else {
                    knight.hp = Math.floor(knight.maxHp * 0.25); // Heavily wounded
                    Terminal.outputMessage("\nThe knight is badly wounded!", "#FF0000");
                }
                Terminal.outputMessage(`Knight's HP: ${knight.hp}/${knight.maxHp}`, "#FF8181");
            }
            
            await AllyManager.loadAllyVisuals();

            // Show stat changes
            Terminal.outputMessage("\nStat Changes for all allies:", "#00FF00");
            Terminal.outputMessage(`Strength ${statChanges.strength >= 0 ? '+' : ''}${statChanges.strength}`, statChanges.strength >= 0 ? "#00FF00" : "#FF0000");
            Terminal.outputMessage(`Defense ${statChanges.defense >= 0 ? '+' : ''}${statChanges.defense}`, statChanges.defense >= 0 ? "#00FF00" : "#FF0000");
            Terminal.outputMessage(`Intelligence ${statChanges.intelligence >= 0 ? '+' : ''}${statChanges.intelligence}`, statChanges.intelligence >= 0 ? "#00FF00" : "#FF0000");
        } else {
            Terminal.outputMessage("\nError recruiting knight!", "#FF0000");
        }

        // Update reputation based on performance
        if (successfulAttempts === totalAttempts) {
            ScoreSystem.updateReputation(20);
            baseScore += Number(perfectBonus);
        } else if (successfulAttempts >= requiredSuccesses) {
            ScoreSystem.updateReputation(10);
        } else {
            ScoreSystem.updateReputation(-10);
        }

        // Get and validate reputation multiplier
        const reputationMultiplier = Number(ScoreSystem.reputationMultiplier || 1.0);

        // Calculate final score with validation
        const finalScore = Math.floor(Number(baseScore) * Number(reputationMultiplier));

        // Update game tracker with final score
        GameTracker.updateScore(finalScore);

        // Show score breakdown with proper formatting
        Terminal.outputMessage("\nScore Breakdown:", "#FFA500");
        Terminal.outputMessage(`Base Score: ${baseScore} (${baseAttemptScore} base + ${successfulAttempts} × ${perCodeScore} per code)`, "#FFA500");
        Terminal.outputMessage(`Reputation Multiplier: ${reputationMultiplier.toFixed(1)}x`, "#FFA500");
        Terminal.outputMessage(`Final Score: +${finalScore}`, "#00FF00");

        // Dispatch event with validated score values
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: true,
                score: finalScore,        // Pass finalScore as score
                baseScore: baseScore,    // Keep baseScore for reference
                multiplier: reputationMultiplier,
                finalScore: finalScore,
                totalScore: GameTracker.score,
                minigameId: 'generalRescue',
                timeBonus: 0,            // No time bonus for this minigame
                perfect: successfulAttempts === totalAttempts,
                statChanges: statChanges,
                message: successfulAttempts >= requiredSuccesses ? 
                    "Successfully rescued the knight!" : 
                    "Barely managed to rescue the knight...",
                next: 'find_medic_intro'
            }
        }));
    }

    // Start the game
    startCode();
}