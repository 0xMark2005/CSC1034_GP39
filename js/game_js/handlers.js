import { Terminal } from "../terminal.js";
import { outputIntroduction, findIncompleteGame } from "./game_flow.js";
import { increaseReputation, decreaseReputation } from "./character.js";
import { gameBattle } from "./battle.js";
import { slumsData, rescueGeneralData, castleTakeoverData, sewerEscapeData, castleEnemies } from "./data.js";
import { gameState, currentState, setCurrentState } from "./gameState.js";

const systemMessageColor = `#FF81811`;
const gameMessageColor = `#00FF00`;

/**
 * Allow the user to input the values for either the introduction or the verb selection, it does not matter which
 * it will always go through this function
 * @param {*} input - Users choice passed in from the function
 */
export function inputIntroduction(input) {
    const optionIndex = parseInt(input) - 1;

    if (optionIndex === 0 || optionIndex === 1) {
        let selectedOption = gameState.currentScenario.options[optionIndex];
        gameState.chosenOption = optionIndex;

        Terminal.outputMessage(selectedOption.outcome, gameMessageColor);

        // Mark the current scenario as completed
        gameState.currentScenario.completed = true;

        // If user selects option 2 at "The Capital Gates", move to slums
        if (gameState.currentScenario.gameID === 2 && optionIndex === 1) {
            gameState.currentObject = slumsData; // Assuming slumsData is defined
            findIncompleteGame(); // Start the next part in slums
            return;
        }

        // Display the continuation action
        if (selectedOption.continuation && selectedOption.continuation.length > 0) {
            Terminal.outputMessage(selectedOption.continuation[0].action, gameMessageColor);

            // Display available verbs to the user
            if (selectedOption.continuation[0].verbs) {
                const availableVerbs = Object.keys(selectedOption.continuation[0].verbs);
                Terminal.outputMessage(`Available actions: ${availableVerbs.join(', ')}`, gameMessageColor);
            }
        }
    } else {
        Terminal.outputMessage("Invalid choice! Please select option 1 or 2.", systemMessageColor);
    }
}

/**
 * Processes the verb selected by the player and updates the game state.
 * @param {string} verb - The action chosen by the player.
 */
export function handleVerbSelection(verb) {
    const selectedOption = gameState.currentScenario.options[gameState.chosenOption];
    const verbObject = selectedOption.continuation?.[0]?.verbs?.[verb];

    if (verbObject) {
        Terminal.outputMessage(verbObject.description, gameMessageColor);

        // Adjust reputation
        if (verbObject.reputationImpact > 0) {
            increaseReputation(verbObject.reputationImpact);
        } else {
            decreaseReputation(verbObject.reputationImpact);
        }

        // Check if we're in the slums scenario
        if (gameState.currentObject === slumsData && 
            gameState.currentScenario.gameID === 4) {
            if (verb === "accept") {
                // Move to rescue general scenario
                gameState.currentScenario.completed = true;
                gameState.currentObject = rescueGeneralData;
                findIncompleteGame();
                return;
            } else if (verb === "decline") {
                // Skip rescue and move straight to castle takeover
                gameState.currentScenario.completed = true;
                gameState.currentObject = castleTakeoverData;
                findIncompleteGame();
                return;
            }
        }
        else if (gameState.currentObject === sewerEscapeData) {
            if (gameState.currentScenario.gameID === 3) {
                if (verb === "fight") {
                    Terminal.outputMessage("You engage the mutated rat in a fierce battle!", gameMessageColor);
                    gameBattle(0, castleEnemies[2]); // Initiator is 0 (user), enemy is mutated rat
                    return;
                } else if (verb === "sneak" || verb === "continue") {
                    console.log("Transitioning from sewerEscapeData to slumsData");
                    gameState.currentObject = slumsData;
                }
            }
        }

        // Trigger battles at specific points in castleTakeoverData
        if (gameState.currentObject === castleTakeoverData) {
            switch (gameState.currentScenario.gameID) {
                case 6: // After infiltrating the castle
                    if (verb === "infiltrate" || verb === "charge") {
                        Terminal.outputMessage("A group of royal guards blocks your path!", gameMessageColor);
                        gameBattle(0, castleEnemies[0]);
                        return;
                    }
                    break;
                case 7: // During courtyard battle
                    if (verb === "defend" || verb === "strike" || verb === "attack") {
                        Terminal.outputMessage("The Elite Knight Commander appears!", gameMessageColor);
                        gameBattle(0, castleEnemies[1]);
                        return;
                    }
                    break;
                case 9: // Final throne room battle
                    if (verb === "fight") {
                        Terminal.outputMessage("The Usurper King draws his sword!", gameMessageColor);
                        gameBattle(0, castleEnemies[2]);
                        return;
                    }
                    break;
            }
        }


        checkFollowUp(selectedOption, verb);
        setCurrentState('introduction');
    } else {
        Terminal.outputMessage(`Invalid action! Available actions: ${Object.keys(selectedOption.continuation?.[0]?.verbs || {}).join(', ')}`, systemMessageColor);
    }
}

/**
 * Checks if a follow-up scenario is available based on the player's chosen action.
 * @param {Object} selectedOption - The selected option.
 * @param {string} verbSelected - The action taken by the player.
 */
function checkFollowUp(selectedOption, verbSelected) {
    if (selectedOption.continuation && selectedOption.continuation[0] && selectedOption.continuation[0].verbs) {
        const verbs = selectedOption.continuation[0].verbs;

        for (let verb in verbs) {
            if (verb === verbSelected) {
                console.log(`Verb '${verbSelected}' found and ready to use.`);
                findIncompleteGame(); // Move to the next scenario
                return;
            }
        }

        console.log(`Verb '${verbSelected}' not found, restart game big error.`);
    } else {
        console.log("Error: No verbs available for this action.");
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
        setCurrentState('gameBattle');
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
        setCurrentState('gameBattle');
    }
}
/**
 * Handle the users input for introduciton as you can read from the objects (only 1 or 2 are plausible answers for the first stage)
 * @param {*} choice: The choice the user has made in the introduction stage 
 */
export function handleIntroduction(choice) {
    if (choice === "1" || choice === "2") {
        // Move the user to the verb selection as they successfully selected a valid choice
        setCurrentState('verbSelection');
        // Now allow the system to determine what happens next after the user enters a value
        inputIntroduction(choice);
    } else {
        Terminal.outputMessage("Invalid choice! Please choose '1' or '2'.", systemMessageColor);
    }
}