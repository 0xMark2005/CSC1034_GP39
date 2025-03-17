import { Terminal } from "../terminal.js";
import { gameState, getCurrentState, setCurrentState } from "./gameState.js";
import { userCharacter } from "./character.js";
import { castleEnemies } from "./data.js";

// Add color constants at the top of the file
const systemMessageColor = `#FF81811`;
const gameMessageColor = `#00FF00`;

/**
 * Begin the battle game with the given initiator and enemy.
 */
export function gameBattle(initiator, enemy) {
    console.log("Beginning battle game");
    if (initiator == 0) { // If the user is the initiator
        console.log("User is the initiator");
        Terminal.outputMessage(`You have initiated a battle against ${castleEnemies[0].name}`, systemMessageColor); // Output the battle initiation
        Terminal.outputMessage("Select an ally to use in the battle:", systemMessageColor); // Ask for an ally
        for (let i = 0; i < userCharacter.gainedAllies.length; i++) { // List available allies
            Terminal.outputMessage(`${i}. ${userCharacter.gainedAllies[i].allyName}`, systemMessageColor);
        }
        console.log("Users ally has been selected");
        setCurrentState('gameBattle'); // Change state to 'gameBattle' for ally selection
    }
}

/**
 * Handles the battle selection of an ally.
 * @param {number} choice - The index of the selected ally.
 */
export function handleBattle(choice) {
    if (choice >= 0 && choice < userCharacter.gainedAllies.length) { // Check if the ally selection is valid
        const selectedAlly = userCharacter.gainedAllies[choice]; // Get the selected ally
        if (usedAllies.includes(selectedAlly)) { // Check if the ally has already been used
            Terminal.outputMessage(`${selectedAlly.allyName} has already been used this round. Select another ally.`, systemMessageColor);
            return;
        }
        usedAllies.push(selectedAlly); // Add the selected ally to used allies
        Terminal.outputMessage(`You have selected ${selectedAlly.allyName}`, gameMessageColor);
        console.log(`You have selected ${selectedAlly.allyName}`);

        Terminal.outputMessage("What would you like to do with this ally?", systemMessageColor); // Ask for the ally's action
        Terminal.outputMessage("1. Attack", systemMessageColor);
        Terminal.outputMessage("2. Defend", systemMessageColor);
        Terminal.outputMessage("3. Heal an ally", systemMessageColor);

        currentState = 'allyAction'; // Change state to 'allyAction'
        gameState.selectedAlly = selectedAlly; // Store the selected ally in the game state
    } else {
        Terminal.outputMessage("Invalid choice! Please select a valid ally number.", systemMessageColor); // Invalid choice handling
    }
}

/** 
 * Handle the selection of an ally's movement or action during the battle. 
 * This allows the user to choose between attacking, defending, or healing for the selected ally.
 */
export function handleAllyMovementSelection(choice) {
    const selectedAlly = gameState.selectedAlly;
    if (!selectedAlly) {
        Terminal.outputMessage("No ally selected! Please select an ally first.", systemMessageColor);
        currentState = 'gameBattle';
        return;
    }

    switch (choice) {
        case '1':
            Terminal.outputMessage(`${selectedAlly.allyName} is attacking!`, gameMessageColor);
            console.log(`${selectedAlly.allyName} is attacking!`);
            // Simulate the attack
            simulateAttack(selectedAlly);
            break;
        case '2':
            Terminal.outputMessage(`${selectedAlly.allyName} is defending!`, gameMessageColor);
            console.log(`${selectedAlly.allyName} is defending!`);
            // Simulate the defense
            simulateDefense(selectedAlly);
            break;
        case '3':
            Terminal.outputMessage(`${selectedAlly.allyName} is healing an ally!`, gameMessageColor);
            console.log(`${selectedAlly.allyName} is healing an ally!`);
            // Simulate the healing
            simulateHealing(selectedAlly);
            break;
        default:
            Terminal.outputMessage("Invalid choice! Please select option 1, 2, or 3.", systemMessageColor);
            break;
    }

    /** 
     * Check if all allies have already made their move in the round. 
     * If so, it's the enemy's turn. 
     * If not, prompt the player to choose another ally.
     */
    if (usedAllies.length === userCharacter.gainedAllies.length) {
        simulateEnemyTurn();
        usedAllies = [];
    } else {
        Terminal.outputMessage("Select the next ally to use in the battle:", systemMessageColor);
        for (let i = 0; i < userCharacter.gainedAllies.length; i++) {
            if (!usedAllies.includes(userCharacter.gainedAllies[i])) {
                Terminal.outputMessage(`${i}. ${userCharacter.gainedAllies[i].allyName}`, systemMessageColor);
            }
        }
        currentState = 'gameBattle';
    }
}

/** 
 * Simulate the attack action of an ally. 
 * The attack power is calculated by multiplying the ally's strength by the strength of their assigned item.
 */
export function simulateAttack(ally) {
    let baseAttackPower = ally.strength * ally.assignedItem.strength;
    console.log(`Base attack power: ${ally.strength} * ${ally.assignedItem.strength} = ${baseAttackPower}`);

    let enemy = castleEnemies[0];
    let damage = Math.max(baseAttackPower * 5, baseAttackPower - enemy.defense);

    console.log(`Effective damage after considering enemy's defense (${enemy.defense}): ${damage}`);

    Terminal.outputMessage(`${ally.allyName} attacks ${enemy.name} with ${damage.toFixed(1)} damage!`, gameMessageColor);

    enemy.health -= damage;
    console.log(`Enemy's remaining health: ${enemy.health.toFixed(2)}`);

    if (enemy.health <= 0) {
        Terminal.outputMessage(`${enemy.name} is defeated!`, gameMessageColor);
        checkBattleOutcome();
    } else {
        Terminal.outputMessage(`${enemy.name} has ${enemy.health.toFixed(2)} health remaining.`, gameMessageColor);
    }
}

/** 
 * Start a new round by resetting the allies' turns and prompting the player to select an ally again.
 */
export function startNewRound() {
    usedAllies = [];
    Terminal.outputMessage("--- New Round ---", gameMessageColor);
    Terminal.outputMessage("Select an ally to use in the battle:", systemMessageColor);
    for (let i = 0; i < userCharacter.gainedAllies.length; i++) {
        Terminal.outputMessage(`${i}. ${userCharacter.gainedAllies[i].allyName}`, systemMessageColor);
    }
    currentState = 'gameBattle';
}

/** 
 * Check the outcome of the battle by evaluating if either the enemy or all allies have been defeated.
 */
export function checkBattleOutcome() {
    let enemy = castleEnemies[0];

    if (enemy.health <= 0) {
        Terminal.outputMessage("You have defeated the enemy!", gameMessageColor);
        currentState = 'introduction';
        return true;
    } else if (userCharacter.gainedAllies.every(ally => ally.health <= 0)) {
        Terminal.outputMessage("All your allies have been defeated!", systemMessageColor);
        currentState = 'introduction';
        return true;
    }

    return false;
}

/** 
 * Simulate the defense action of an ally, increasing their defense and marking them as defending.
 */
export function simulateDefense(ally) {
    Terminal.outputMessage(`${ally.allyName} is defending!`, gameMessageColor);
    console.log(`${ally.allyName} is defending`);

    ally.isDefending = true;
    ally.defense += 10;

    Terminal.outputMessage(`${ally.allyName} raises their guard and is protected from the next enemy attack!`, gameMessageColor);
}

/** 
 * Simulate the enemy's turn, randomly deciding which ally to attack and applying damage reduction if they are defending.
 */
export function simulateEnemyTurn() {
    Terminal.outputMessage("The enemy is attacking!", systemMessageColor);

    let enemy = castleEnemies[0];

    userCharacter.gainedAllies.forEach(ally => {
        let damageReduction = ally.isDefending ? 0.5 : 1.0;

        if (Math.random() < 0.75) {
            let enemyAttackPower = enemy.strength || 2;
            let enemyDamage = Math.max(enemyAttackPower * 0.1, enemyAttackPower - ally.defense);
            enemyDamage *= damageReduction;

            let dodgeChance = 0.2;
            if (Math.random() < dodgeChance) {
                Terminal.outputMessage(`${ally.allyName} dodged the enemy's attack!`, systemMessageColor);
            } else {
                ally.health -= enemyDamage;
                Terminal.outputMessage(`${ally.allyName} was attacked by the enemy for ${enemyDamage.toFixed(1)} damage! Health remaining: ${Math.max(0, ally.health).toFixed(1)}`, systemMessageColor);

                if (ally.isDefending) {
                    ally.isDefending = false;
                    ally.defense -= 10;
                }
            }
        } else {
            Terminal.outputMessage(`${ally.allyName} dodged the enemy's attack!`, systemMessageColor);
        }
    });

    if (checkBattleOutcome()) {
        return;
    }

    startNewRound();
}

/** 
 * Simulate the healing action of an ally, randomly selecting another ally to heal.
 */
export function simulateHealing(ally) {
    Terminal.outputMessage(`${ally.allyName} heals an ally!`, gameMessageColor);
    const randomAlly = userCharacter.gainedAllies[Math.floor(Math.random() * userCharacter.gainedAllies.length)];
    randomAlly.health = Math.min(randomAlly.maxHealth, randomAlly.health + 20);
}