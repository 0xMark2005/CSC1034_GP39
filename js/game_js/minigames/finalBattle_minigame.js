import { Terminal } from "../../terminal.js";
import { ScoreSystem } from "../score_system.js";
import { GameTracker } from "../game_tracker.js";
import { AllyManager } from "../ally_manager.js";

export function finalBattleGame() {
    let gameActive = true;
    let inputEnabled = true;
    let currentTurn = 0;
    let guardDefeated = false;
    let roundNumber = 1;
    
    // Use GameTracker allies instead of hardcoded ones
    const allies = GameTracker.allies.map(ally => ({
        name: ally.name,
        health: ally.hp,
        maxHealth: ally.maxHp,
        defense: false,
        intelligence: ally.intelligence,
        attack: ally.attack,
        baseDefence: ally.defence
    }));
    
    // Increased enemy health and stats
    const enemies = [
        { 
            name: 'Corrupt King', 
            health: 500, 
            maxHealth: 500, 
            accuracy: 85,
            damage: { min: 30, max: 50 }
        },
        { 
            name: 'Elite Royal Guards', 
            health: 300, 
            maxHealth: 300, 
            accuracy: 75,
            damage: { min: 20, max: 35 }
        }
    ];

    // Tracking arrays for round results
    let dodgedAllies = [];
    let hitAllies = [];

    function displayBattleStatus() {
        Terminal.outputMessage(`\n=== Battle Status - Round ${roundNumber} ===`, "#FFA500");
        Terminal.outputMessage("\nEnemy Forces:", "#FF0000");
        enemies.forEach(enemy => {
            if (enemy.health > 0) {
                Terminal.outputMessage(`${enemy.name}: ${enemy.health}/${enemy.maxHealth} HP`, "#FF0000");
            }
        });
        
        Terminal.outputMessage("\nYour Forces:", "#00FF00");
        const livingAllies = allies.filter(ally => ally.health > 0);
        Terminal.outputMessage(`Allies Remaining: ${livingAllies.length}/${allies.length}`, "#FFA500");
        allies.forEach(ally => {
            const status = ally.health <= 0 ? " (DEFEATED)" : (ally.defense ? " (Defending)" : "");
            const color = ally.health <= 0 ? "#FF0000" : "#00FF00";
            Terminal.outputMessage(`${ally.name}: ${ally.health}/${ally.maxHealth} HP${status}`, color);
        });

        if (currentTurn >= 0 && currentTurn < allies.length) {
            Terminal.outputMessage(`\nCurrent Turn: ${allies[currentTurn].name}`, "#FFA500");
        }
    }

    function showCurrentTurn() {
        const currentAlly = allies[currentTurn];
        displayBattleStatus();
        Terminal.outputMessage(`\n${currentAlly.name}'s turn:`, "#FFA500");
        Terminal.outputMessage("1. Attack", "#00FF00");
        Terminal.outputMessage("2. Defend", "#00FF00");
        Terminal.outputMessage("3. Heal Ally", "#00FF00");
        Terminal.setInputValue('');
    }

    function handleAction(choice) {
        if (!inputEnabled || !gameActive) return;
        
        const currentAlly = allies[currentTurn];
        if (currentAlly.health <= 0) {
            Terminal.outputMessage(`${currentAlly.name} has been defeated and cannot act!`, "#FF0000");
            nextTurn();
            return;
        }

        switch(choice) {
            case '1': // Attack
                showTargetSelection('attack');
                break;
            case '2': // Defend
                currentAlly.defense = true;
                Terminal.outputMessage(`${currentAlly.name} takes a defensive stance!`, "#00FF00");
                nextTurn();
                break;
            case '3': // Heal
                showTargetSelection('heal');
                break;
            default:
                Terminal.outputMessage("Invalid choice! Enter 1, 2, or 3", "#FF0000");
                return;
        }
    }

    function showTargetSelection(action) {
        inputEnabled = false; // Disable input during target selection
        if (action === 'attack') {
            Terminal.outputMessage("\nSelect target to attack:", "#FFA500");
            if (!guardDefeated) {
                Terminal.outputMessage("1. Elite Royal Guards " + 
                    `(${enemies[1].health}/${enemies[1].maxHealth} HP)`, "#FF0000");
            } else {
                Terminal.outputMessage("1. Corrupt King " + 
                    `(${enemies[0].health}/${enemies[0].maxHealth} HP)`, "#FF0000");
            }
        } else if (action === 'heal') {
            Terminal.outputMessage("\nSelect ally to heal:", "#FFA500");
            allies.forEach((ally, index) => {
                if (ally.health < ally.maxHealth) {
                    Terminal.outputMessage(`${index + 1}. ${ally.name} ` +
                        `(${ally.health}/${ally.maxHealth} HP)`, "#00FF00");
                }
            });
        }
        
        waitForTargetSelection(action);
    }

    function waitForTargetSelection(action) {
        const targetHandler = (event) => {
            if (event.key === "Enter") {
                const input = Terminal.getUserInput().trim();
                
                if (input) {
                    const targetIndex = parseInt(input) - 1;
                    document.removeEventListener('keydown', targetHandler);
                    inputEnabled = true;
                    
                    if (action === 'attack') {
                        handleAttack(targetIndex);
                    } else if (action === 'heal') {
                        handleHeal(targetIndex);
                    }
                }
            }
        };
        
        document.addEventListener('keydown', targetHandler);
    }

    // Add function to update ally stats in GameTracker
    async function updateAllyStats() {
        allies.forEach((ally, index) => {
            // Update corresponding GameTracker ally
            if (GameTracker.allies[index]) {
                GameTracker.allies[index].hp = ally.health;
                GameTracker.allies[index].attack = ally.attack;
                GameTracker.allies[index].defence = ally.baseDefence;
                GameTracker.allies[index].intelligence = ally.intelligence;
            }
        });
        // Update ally visuals
        await AllyManager.loadAllyVisuals();
    }

    // Modify handleAttack to update visuals
    function handleAttack(targetIndex) {
        const currentAlly = allies[currentTurn];
        const baseAttack = currentAlly.attack;
        
        if (!guardDefeated) {
            const guards = enemies[1];
            const damage = Math.floor(Math.random() * 20) + baseAttack;
            guards.health = Math.max(0, guards.health - damage);
            Terminal.outputMessage(`${currentAlly.name} attacks ${guards.name} for ${damage} damage!`, "#00FF00");
            
            if (guards.health <= 0) {
                Terminal.outputMessage("The Elite Royal Guards have been defeated! The king is vulnerable!", "#FFA500");
                guardDefeated = true;
            }
        } else {
            const king = enemies[0];
            const damage = Math.floor(Math.random() * 25) + baseAttack;
            king.health = Math.max(0, king.health - damage);
            Terminal.outputMessage(`${currentAlly.name} attacks ${king.name} for ${damage} damage!`, "#00FF00");
        }
        
        updateAllyStats().then(() => nextTurn());
    }

    // Modify handleHeal to update visuals
    function handleHeal(targetIndex) {
        const currentAlly = allies[currentTurn];
        const target = allies[targetIndex];
        
        if (!target || target.health >= target.maxHealth) {
            Terminal.outputMessage("Invalid target!", "#FF0000");
            showCurrentTurn();
            return;
        }

        const healing = Math.floor(Math.random() * 20) + 30;
        target.health = Math.min(target.maxHealth, target.health + healing);
        Terminal.outputMessage(`${currentAlly.name} heals ${target.name} for ${healing} HP!`, "#00FF00");
        
        updateAllyStats().then(() => nextTurn());
    }

    // Add nextTurn function
    function nextTurn() {
        // Reset defense for previous ally if round is ending
        if (currentTurn === allies.length - 1) {
            allies.forEach(ally => ally.defense = false);
        }

        // Find next living ally
        do {
            currentTurn = (currentTurn + 1) % allies.length;
        } while (currentTurn < allies.length && allies[currentTurn].health <= 0);

        // If we've completed a round, process enemy turn
        if (currentTurn === 0) {
            roundNumber++;
            if (!isGameOver()) {
                processEnemyTurn();
            } else {
                endBattle();
            }
        } else {
            // Otherwise, show the next ally's turn
            if (!isGameOver()) {
                showCurrentTurn();
            } else {
                endBattle();
            }
        }
    }

    // Modify processEnemyTurn to update visuals
    function processEnemyTurn() {
        inputEnabled = false;
        
        // Reset tracking arrays
        dodgedAllies = [];
        hitAllies = [];

        Terminal.outputMessage(`\n=== Enemy Turn - Round ${roundNumber} ===`, "#FF0000");
        
        enemies.forEach(enemy => {
            if (enemy.health > 0) {
                const target = allies[Math.floor(Math.random() * allies.length)];
                const dodgeChance = target.intelligence - enemy.accuracy;
                const dodged = Math.random() * 100 < dodgeChance;
                
                if (dodged) {
                    Terminal.outputMessage(`${target.name} dodges ${enemy.name}'s attack!`, "#00FF00");
                    dodgedAllies.push(target.name);
                } else {
                    const damage = Math.floor(Math.random() * (enemy.damage.max - enemy.damage.min + 1)) + enemy.damage.min;
                    const finalDamage = target.defense ? Math.floor(damage / 2) : damage;
                    target.health = Math.max(0, target.health - finalDamage);
                    Terminal.outputMessage(`${enemy.name} attacks ${target.name} for ${finalDamage} damage!`, "#FF0000");
                    hitAllies.push({name: target.name, damage: finalDamage});
                }
            }
        });

        // Output round summary
        Terminal.outputMessage(`\n=== Round ${roundNumber} Summary ===`, "#FFA500");
        
        // Dodged attacks
        if (dodgedAllies.length > 0) {
            Terminal.outputMessage("Dodged Attacks:", "#00FF00");
            dodgedAllies.forEach(ally => {
                Terminal.outputMessage(`- ${ally} successfully dodged an attack!`, "#00FF00");
            });
        } else {
            Terminal.outputMessage("No allies dodged attacks this round.", "#FFFF00");
        }

        // Hit allies
        if (hitAllies.length > 0) {
            Terminal.outputMessage("Allies Hit:", "#FF0000");
            hitAllies.forEach(ally => {
                Terminal.outputMessage(`- ${ally.name} took ${ally.damage} damage!`, "#FF0000");
            });
        } else {
            Terminal.outputMessage("No allies were hit this round.", "#FFFF00");
        }

        allies.forEach(ally => ally.defense = false);

        // Update ally stats and visuals before showing next turn
        updateAllyStats().then(() => {
            if (isGameOver()) {
                endBattle();
            } else {
                inputEnabled = true;
                showCurrentTurn();
            }
        });
    }

    function isGameOver() {
        const allAlliesDead = allies.every(ally => ally.health <= 0);
        const allEnemiesDead = enemies.every(enemy => enemy.health <= 0);
        
        if (allAlliesDead) {
            Terminal.outputMessage("\nAll allies have been defeated!", "#FF0000");
            return true;
        }
        
        if (allEnemiesDead) {
            Terminal.outputMessage("\nAll enemies have been defeated!", "#00FF00");
            return true;
        }
        
        return false;
    }

    function endBattle() {
        gameActive = false;
        const victory = enemies.every(enemy => enemy.health <= 0);
        
        // Calculate detailed score
        let scoreBreakdown = {
            base: 0,
            survivalBonus: 0,
            speedBonus: 0,
            perfectBonus: 0,
            total: 0
        };

        if (victory) {
            // Base victory score
            scoreBreakdown.base = 1000;
            
            // Surviving allies bonus (200 per survivor)
            const survivingAllies = allies.filter(ally => ally.health > 0).length;
            scoreBreakdown.survivalBonus = survivingAllies * 200;
            
            // Speed bonus based on rounds taken
            if (roundNumber <= 5) {
                scoreBreakdown.speedBonus = 500;
                ScoreSystem.updateReputation(15); // Quick victory reputation
            } else if (roundNumber <= 8) {
                scoreBreakdown.speedBonus = 300;
                ScoreSystem.updateReputation(10); // Normal victory reputation
            } else if (roundNumber <= 10) {
                scoreBreakdown.speedBonus = 100;
                ScoreSystem.updateReputation(5); // Slow victory reputation
            }
            
            // Perfect victory bonus (all allies survived)
            if (survivingAllies === allies.length) {
                scoreBreakdown.perfectBonus = 500;
                ScoreSystem.updateReputation(10); // Perfect victory extra reputation
            }
            
            // Calculate total
            scoreBreakdown.total = Object.values(scoreBreakdown).reduce((a, b) => a + b, 0);
            
            // Display score breakdown
            Terminal.outputMessage("\n=== Victory Score Breakdown ===", "#FFA500");
            Terminal.outputMessage(`Base Victory Reward: +${scoreBreakdown.base}`, "#00FF00");
            Terminal.outputMessage(`Surviving Allies Bonus: +${scoreBreakdown.survivalBonus}`, "#00FF00");
            Terminal.outputMessage(`Speed Bonus: +${scoreBreakdown.speedBonus}`, "#00FF00");
            if (scoreBreakdown.perfectBonus > 0) {
                Terminal.outputMessage(`Perfect Victory Bonus: +${scoreBreakdown.perfectBonus}`, "#00FF00");
            }
            Terminal.outputMessage(`\nTotal Score: ${scoreBreakdown.total}`, "#FFA500");
            
            // Update GameTracker score
            GameTracker.updateScore(scoreBreakdown.total);
        } else {
            // Defeat penalties
            ScoreSystem.updateReputation(-15);
            Terminal.outputMessage("\n=== Defeat ===", "#FF0000");
            Terminal.outputMessage("No score awarded", "#FF0000");
        }
        
        // Dispatch completion event with detailed stats
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: victory,
                scoreBreakdown: scoreBreakdown,
                totalScore: scoreBreakdown.total,
                message: victory ? 
                    "Victory! The corrupt king has been defeated!" : 
                    "Defeat... The revolution has failed.",
                rounds: roundNumber,
                survivingAllies: allies.filter(ally => ally.health > 0).length,
                perfectVictory: scoreBreakdown.perfectBonus > 0
            }
        }));
    }

    // Start battle
    Terminal.outputMessage("FINAL BATTLE: Face the corrupt king and his elite guards!", "#FF8181");
    Terminal.outputMessage("Defeat the Elite Royal Guards before attacking the king!", "#FF8181");
    Terminal.outputMessage("Use your allies' intelligence to dodge enemy attacks!", "#ADD8E6");
    showCurrentTurn();
    
    // Add input handler
    document.addEventListener('keydown', (event) => {
        if (event.key === "Enter" && inputEnabled && gameActive) {
            const input = Terminal.getUserInput().trim();
            if (input) {
                handleAction(input);
                Terminal.setInputValue('');
            }
        }
    });
}