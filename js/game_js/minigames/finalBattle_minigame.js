import { Terminal } from "../../terminal.js";

export function finalBattleGame() {
    let gameActive = true;
    let inputEnabled = true;
    let currentTurn = 0;
    let guardDefeated = false;
    let roundNumber = 1;
    
    const allies = [
        { name: 'Player', health: 100, maxHealth: 100, defense: false, intelligence: 75 },
        { name: 'Rescued Knight', health: 100, maxHealth: 100, defense: false, intelligence: 85 },
        { name: 'Resistance Fighter', health: 100, maxHealth: 100, defense: false, intelligence: 70 },
        { name: 'Rebel Mage', health: 80, maxHealth: 80, defense: false, intelligence: 95 }
    ];
    
    const enemies = [
        { name: 'Corrupt King', health: 150, maxHealth: 150, accuracy: 80 },
        { name: 'Elite Royal Guards', health: 100, maxHealth: 100, accuracy: 70 }
    ];

    // Tracking arrays for round results
    let dodgedAllies = [];
    let hitAllies = [];

    function displayBattleStatus() {
        Terminal.outputMessage(`\n=== Battle Status - Round ${roundNumber} ===`, "#FFA500");
        Terminal.outputMessage("\nEnemy Forces:", "#FF0000");
        enemies.forEach(enemy => {
            Terminal.outputMessage(`${enemy.name}: ${enemy.health}/${enemy.maxHealth} HP`, "#FF0000");
        });
        
        Terminal.outputMessage("\nYour Forces:", "#00FF00");
        allies.forEach(ally => {
            Terminal.outputMessage(`${ally.name}: ${ally.health}/${ally.maxHealth} HP${ally.defense ? " (Defending)" : ""}`, "#00FF00");
        });
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

    function handleAttack(targetIndex) {
        const currentAlly = allies[currentTurn];
        
        if (!guardDefeated) {
            const guards = enemies[1];
            const damage = Math.floor(Math.random() * 30) + 20;
            guards.health = Math.max(0, guards.health - damage);
            Terminal.outputMessage(`${currentAlly.name} attacks ${guards.name} for ${damage} damage!`, "#00FF00");
            
            if (guards.health <= 0) {
                Terminal.outputMessage("The Elite Royal Guards have been defeated! The king is vulnerable!", "#FFA500");
                guardDefeated = true;
            }
        } else {
            const king = enemies[0];
            const damage = Math.floor(Math.random() * 30) + 20;
            king.health = Math.max(0, king.health - damage);
            Terminal.outputMessage(`${currentAlly.name} attacks ${king.name} for ${damage} damage!`, "#00FF00");
        }
        
        nextTurn();
    }

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
        nextTurn();
    }

    function nextTurn() {
        currentTurn = (currentTurn + 1) % allies.length;
        if (currentTurn === 0) {
            // Round complete, process enemy turn
            roundNumber++; // Increment round number
            processEnemyTurn();
        } else {
            showCurrentTurn();
        }
    }

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
                    const damage = Math.floor(Math.random() * 20) + 10;
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

        if (isGameOver()) {
            endBattle();
        } else {
            inputEnabled = true;
            showCurrentTurn();
        }
    }

    function isGameOver() {
        return allies.every(ally => ally.health <= 0) || enemies.every(enemy => enemy.health <= 0);
    }

    function endBattle() {
        gameActive = false;
        const victory = enemies.every(enemy => enemy.health <= 0);
        
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: victory,
                message: victory ? "Victory! The corrupt king has been defeated!" : "Defeat... The revolution has failed."
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