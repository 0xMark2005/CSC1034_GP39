import { Terminal } from "../../terminal.js";
import { displayAnimation } from "../animation_handler.js";
import { GameTracker } from "../game_tracker.js";
import { AllyManager } from "../ally_manager.js";
import { ScoreSystem } from "../score_system.js";

export function villageEscapeGame() {
    Terminal.outputMessage("VILLAGE ESCAPE: Knights have come to raid your village!", "#FF8181");
    Terminal.outputMessage("Make quick decisions to survive. Type the [highlighted] option when prompted.", "#FF8181");
    Terminal.outputMessage("You have 10 seconds to decide. Single letter responses are accepted.", "#ADD8E6");
    
    let currentRound = 0;
    let gameActive = true;
    let timeoutId = null;
    
    const scenarios = [
        {
            prompt: "You wake from a nap to find your house engulfed in flames! [J]ump out the window!",
            validAnswers: ["jump", "j"],
            success: {
                jump: "You leap through the window as flames consume your home!"
            },
            animations: {
                jump: 'BurningVillage/JumpingOutOfFire.gif'
            },
            stats: {
                jump: {
                    strength: 5,    // Quick reflexes improve strength
                    defense: 2,     // Learning to take falls
                    intelligence: 1 // Quick thinking
                }
            }
        },
        {
            prompt: "A baby is crying in a nearby house! [S]ave the baby or [F]lee!",
            validAnswers: ["save", "flee", "s", "f"],
            success: {
                save: "You rush into the burning building and rescue the crying baby!",
                flee: "You turn away, the cries haunting your conscience..."
            },
            animations: {
                save: 'BurningVillage/SavedBaby.gif',
                flee: null
            },
            stats: {
                save: {
                    strength: 8,     // Heroic action boosts strength
                    defense: 5,      // Enduring flames improves defense
                    intelligence: 3  // Problem-solving under pressure
                },
                flee: {
                    strength: -3,    // Cowardice weakens resolve
                    defense: -2,     // Less experience in danger
                    intelligence: -1 // Missed learning opportunity
                }
            }
        },
        {
            prompt: "A guard sees the baby and drops his sword in shock! [R]un past or [T]ell him it's not yours!",
            validAnswers: ["run", "tell", "r", "t"],
            success: {
                run: "You dash past the distracted guard, baby held close!",
                tell: "The guard, moved by guilt, helps you escape with the child!"
            },
            animations: {
                run: 'BurningVillage/RunningWithBabyToKnight.gif',
                tell: 'BurningVillage/RunningTHroughTown.gif'
            },
            stats: {
                run: {
                    strength: 6,     // Physical exertion builds strength
                    defense: 3,      // Quick movement improves defense
                    intelligence: -1 // Missed diplomatic opportunity
                },
                tell: {
                    strength: 2,     // Less physical but still stressful
                    defense: 4,      // Diplomatic solution improves defense
                    intelligence: 7  // Clever thinking boosts intelligence
                }
            }
        },
        {
            prompt: "The village edge approaches! Into the [T]rees or along the village [R]oad!",
            validAnswers: ["trees", "road", "t", "r"],
            success: {
                trees: "The dense forest provides perfect cover for your escape!",
                road: "The road leads you swiftly to safety!"
            },
            animations: {
                trees: 'BurningVillage/RunningThroughForest.gif',
                road: 'BurningVillage/RunningTHroughTown.gif'
            },
            stats: {
                trees: {
                    strength: 4,     // Navigating difficult terrain
                    defense: 6,      // Better at avoiding detection
                    intelligence: 5  // Smart tactical choice
                },
                road: {
                    strength: 7,     // Endurance from running
                    defense: -2,     // More exposed to danger
                    intelligence: -1 // Less tactical awareness
                }
            }
        }
    ];

    function startScenario() {
        if (currentRound >= scenarios.length) {
            cleanup(true);
            return;
        }

        const scenario = scenarios[currentRound];
        Terminal.outputMessage(`\n${scenario.prompt}`, "#00FF00");
        
        timeoutId = setTimeout(() => {
            // Apply consistent -10 HP damage for timeouts
            if (GameTracker.allies && GameTracker.allies.length > 0) {
                const peasant = GameTracker.allies[0];
                const oldHp = peasant.hp;
                
                // Apply -10 HP damage
                const healthChange = -10;
                peasant.hp = Math.min(peasant.maxHp, peasant.hp + healthChange);
                
                Terminal.outputMessage("Your indecision costs you!", "#FF0000");
                Terminal.outputMessage(`Health damage from hesitation: ${healthChange} HP`, "#FF8181");
                Terminal.outputMessage(`HP: ${oldHp} → ${peasant.hp}/${peasant.maxHp}`, "#FFA500");
                
                AllyManager.loadAllyVisuals();
                if (AllyManager.checkGameOver()) return;
            }
            cleanup(false);
        }, 10000);

        setupInputHandler();
    }

    function setupInputHandler() {
        const userInput = document.getElementById("user-input");
        if (userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
        }
        
        const scenarioHandler = function(event) {
            if (event.key === "Enter") {
                const input = Terminal.getUserInput().trim().toLowerCase();
                if (gameActive) processInput(input);
            }
        };

        userInput.addEventListener("keypress", scenarioHandler);
        userInput.currentHandler = scenarioHandler;
    }
    
    async function processInput(input) {
        const scenario = scenarios[currentRound];
        
        if (scenario.validAnswers.includes(input)) {
            clearTimeout(timeoutId);
            
            // Apply health changes based on choices
            if (GameTracker.allies && GameTracker.allies.length > 0) {
                const peasant = GameTracker.allies[0];
                let healthChange = 0;
                let healthMessage = "";
                
                switch(currentRound) {
                    case 0: // Jump scenario
                        healthChange = -10;
                        healthMessage = "The impact of jumping from the window bruises your legs.";
                        break;
                        
                    case 1: // Baby scenario
                        if (input.startsWith('s')) {
                            healthChange = -20;
                            healthMessage = "The intense heat and smoke from the burning building sear your lungs and burn your skin.";
                        } else {
                            healthChange = -5;
                            healthMessage = "The guilt of leaving the baby weighs heavily, causing stress damage.";
                        }
                        break;
                        
                    case 2: // Guard scenario
                        if (input.startsWith('t')) {
                            healthChange = 15;
                            healthMessage = "The sympathetic guard shares his healing potion, mending your wounds.";
                        } else {
                            healthChange = -15;
                            healthMessage = "The strain of running with injuries worsens your condition.";
                        }
                        break;
                        
                    case 3: // Final escape
                        if (input.startsWith('t')) {
                            healthChange = -10;
                            healthMessage = "Sharp branches and thorns in the dense forest cut and scratch you.";
                        } else {
                            healthChange = 10;
                            healthMessage = "The clear road allows you to catch your breath and recover some strength.";
                        }
                        break;
                }

                // Apply health change
                peasant.hp = Math.max(1, Math.min(peasant.maxHp, peasant.hp + healthChange));
                await AllyManager.loadAllyVisuals();
                if (AllyManager.checkGameOver()) return;

                // Show health change message
                Terminal.outputMessage(`\n${healthMessage}`, healthChange > 0 ? "#00FF00" : "#FF8181");
                Terminal.outputMessage(`Health Change: (${healthChange > 0 ? '+' : ''}${healthChange} HP)`, "#FFA500");
                Terminal.outputMessage(`Current HP: ${peasant.hp}/${peasant.maxHp}`, "#FFA500");
                
                // Update health bar
                AllyManager.loadAllyVisuals();
            }

            // Initialize GameTracker.choices if it doesn't exist
            if (!GameTracker.choices) {
                GameTracker.choices = [];
            }
            
            // Modified stat changes logic to handle all scenarios
            const actionKey = input.startsWith('s') ? 'save' :
                            input.startsWith('r') ? (currentRound === 3 ? 'road' : 'run') :
                            input.startsWith('t') ? (currentRound === 3 ? 'trees' : 'tell') :
                            input.startsWith('j') ? 'jump' : 'flee';
            
            const statChanges = scenario.stats ? scenario.stats[actionKey] : null;
            
            if (statChanges) {
                Terminal.outputMessage("\nStat Changes:", "#00FF00");
                if (statChanges.strength) {
                    Terminal.outputMessage(`Strength ${statChanges.strength > 0 ? '+' : ''}${statChanges.strength}`, 
                        statChanges.strength > 0 ? "#00FF00" : "#FF0000");
                }
                if (statChanges.defense) {
                    Terminal.outputMessage(`Defense ${statChanges.defense > 0 ? '+' : ''}${statChanges.defense}`, 
                        statChanges.defense > 0 ? "#00FF00" : "#FF0000");
                }
                if (statChanges.intelligence) {
                    Terminal.outputMessage(`Intelligence ${statChanges.intelligence > 0 ? '+' : ''}${statChanges.intelligence}`, 
                        statChanges.intelligence > 0 ? "#00FF00" : "#FF0000");
                }
            }

            // Handle reputation changes based on choices
            if (currentRound === 1) { // Baby scenario
                if (input.startsWith('s')) {
                    ScoreSystem.updateReputation(15); // Heroic choice
                    Terminal.outputMessage("Your heroic action increases your reputation!", "#00FF00");
                } else {
                    ScoreSystem.updateReputation(-10); // Cowardly choice
                    Terminal.outputMessage("Your cowardice damages your reputation.", "#FF0000");
                }
            } else if (currentRound === 2) { // Guard scenario
                if (input.startsWith('t')) {
                    ScoreSystem.updateReputation(10); // Diplomatic choice
                    Terminal.outputMessage("Your honesty improves your reputation!", "#00FF00");
                } else {
                    ScoreSystem.updateReputation(5); // Less optimal but still brave
                    Terminal.outputMessage("A daring escape affects your reputation.", "#FFA500");
                }
            }

            // Store the stat changes for final tally
            GameTracker.choices.push({input, stats: statChanges});

            let isGoodChoice = false;
            
            if (currentRound === 0) {
                isGoodChoice = true;
            } else if (currentRound === 1) {
                isGoodChoice = input.startsWith('s');
            } else if (currentRound === 2) {
                isGoodChoice = input.startsWith('t');
            } else if (currentRound === 3) {
                isGoodChoice = input.startsWith('t');
            }

            if (!isGoodChoice) {
                Terminal.outputMessage("Your choice weakens you...", "#FF8181");
            }

            const animationKey = 
                input.startsWith('s') ? 'save' :
                input.startsWith('r') ? (currentRound === 3 ? 'road' : 'run') :
                input.startsWith('t') ? (currentRound === 3 ? 'trees' : 'tell') :
                'flee';
                
            const animation = scenario.animations[animationKey];
            
            if (animation) {
                if (Array.isArray(animation)) {
                    for (const anim of animation) {
                        await displayAnimation(anim);
                    }
                } else {
                    await displayAnimation(animation);
                }
            }

            const successMessage = 
                input.startsWith('s') ? scenario.success.save :
                input.startsWith('r') ? (currentRound === 3 ? scenario.success.road : scenario.success.run) :
                input.startsWith('t') ? (currentRound === 3 ? scenario.success.trees : scenario.success.tell) :
                scenario.success.flee;
            
            Terminal.outputMessage(successMessage, isGoodChoice ? "#00FF00" : "#FF8181");
            currentRound++;
            startScenario();
        } else {
            if (currentRound === 0) {
                Terminal.outputMessage("You must jump! Press 'J' or type 'jump' to escape!", "#FF0000");
            } else {
                Terminal.outputMessage("Invalid choice! Try again quickly!", "#FF0000");
            }
        }
    }

    function classifyStatValue(value) {
        if (value >= 80) return 'stat-excellent';
        if (value >= 60) return 'stat-good';
        if (value >= 40) return 'stat-average';
        if (value >= 20) return 'stat-poor';
        return 'stat-critical';
    }

    function cleanup(success) {
        gameActive = false;
        const userInput = document.getElementById("user-input");
        if (userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
        }

        const choices = GameTracker.choices || [];
        let totalStats = {
            strength: 0,
            defense: 0,
            intelligence: 0
        };

        choices.forEach(choice => {
            if (choice.stats) {
                totalStats.strength += choice.stats.strength || 0;
                totalStats.defense += choice.stats.defense || 0;
                totalStats.intelligence += choice.stats.intelligence || 0;
            }
        });

        // Update GameTracker ally stats
        if (!GameTracker.allies) {
            GameTracker.allies = [{
                id: 1,
                hp: 100,
                attack: totalStats.strength,
                defence: totalStats.defense,
                intelligence: totalStats.intelligence,
                alive: true
            }];
        } else {
            // Update existing ally stats
            GameTracker.allies[0].attack += totalStats.strength;
            GameTracker.allies[0].defence += totalStats.defense;
            GameTracker.allies[0].intelligence += totalStats.intelligence;
        }

        // Update ally visuals using AllyManager
        AllyManager.loadAllyVisuals();

        // Update stats in left panel
        document.querySelectorAll('.stat-value').forEach(statValue => {
            const value = parseInt(statValue.textContent);
            statValue.classList.add(classifyStatValue(value));
        });

        // Calculate reputation change based on total stats and success
        if (success) {
            const totalStatValue = totalStats.strength + totalStats.defense + totalStats.intelligence;
            let reputationChange = 0;

            if (totalStatValue >= 50) {
                reputationChange = 20; // Excellent escape
            } else if (totalStatValue >= 30) {
                reputationChange = 10; // Good escape
            } else {
                reputationChange = 5;  // Basic escape
            }

            // Extra bonus for saving the baby (check if 'save' was chosen in round 1)
            const savedBaby = choices.some(choice => choice.input === 'save' || choice.input === 's');
            if (savedBaby) {
                reputationChange += 10;
            }

            ScoreSystem.updateReputation(reputationChange);
            Terminal.outputMessage(`\nReputation ${reputationChange > 0 ? '+' : ''}${reputationChange}`, "#00FF00");
        } else {
            ScoreSystem.updateReputation(-15); // Failed escape
            Terminal.outputMessage("\nReputation -15", "#FF0000");
        }

        let score = Number(success ? 500 : 100);
        score += Number((totalStats.strength + totalStats.defense + totalStats.intelligence) * 10);

        GameTracker.updateScore(score);
        Terminal.outputMessage(`\nFinal Score: +${score}`, "#FFA500");

        // Dispatch minigame completion event
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: true,
                score: score,
                minigameId: 'villageEscape',
                statChanges: totalStats,
                message: success ? "You've successfully escaped the village!" : "Barely escaped the village...",
                next: 'burning_village_escape' // Add this to ensure proper story progression
            }
        }));

        // Let the main game handle area transition
        GameTracker.currentDialogue = 'burning_village_escape';
    }

    function calculateMoralBonus(choices) {
        let bonus = 0;
        if (choices.includes('s')) bonus += 200;
        if (choices.includes('r') && choices.includes('t')) bonus += 150;
        return bonus;
    }

    startScenario();
}