import { Terminal } from "../terminal.js";
import { handleIntroduction, handleVerbSelection, handleAllyMovementSelection } from "./handlers.js";
import { outputUser, addAlly, increaseReputation, decreaseReputation, userCharacter } from "./character.js";
import { randomGameData, outputIntroduction, findIncompleteGame, markGameAsCompleted } from "./game_flow.js";
import { gameBattle, simulateAttack, simulateDefense, simulateHealing, simulateEnemyTurn, startNewRound, checkBattleOutcome, handleBattle } from "./battle.js";
import { introductoryData, prisonData, slumsData, sewerEscapeData, rescueGeneralData, castleTakeoverData, allies, castleEnemies } from "./data.js";
import { getGameState, getCurrentState, setCurrentState, setGameState } from "./gameState.js";

const systemMessageColor = `#FF81811`;
const gameMessageColor = `#00FF00`;

document.addEventListener('DOMContentLoaded', function() {
    //Initialize the terminal
    let outputTerminal = document.getElementById("output-terminal"); 
    let userInput = document.getElementById("user-input");
    Terminal.initialize(outputTerminal, userInput);

    /**
     * Variables to allow for the game to start and run
     * 
     *  currentState: Allows for the game to recognise that the game is in the introductory mode when inputting from user input
     *  usedAllies: Allows us to track which allies the user has used when in the round based battle
     *  prisonDataCompleted: Allows us to detect when intopartTwo is done, this is neccessary because we need to know when the user
     *                         has completed ONE of the entities within prisonData
     */
    let usedAllies = [];
    let prisonDataCompleted = false;

    // Initialize the game state
    setGameState('currentObject', introductoryData);

    // populate allies 
    addAlly(allies[0]);
    // Note: General (allies[1]) will be added when rescued

    // start the game
    outputIntroduction();
    setCurrentState('introduction');

    /**
     * When the user clicks enter in the terminal and their input is passed into the below switch statement
     * This finds which part of the game the user is on and 
     */
    userInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            const choice = Terminal.getUserInput();

            setTimeout(() => {
                if (choice == "Show Inventory") {
                    outputUser();
                    scrollToBottom();
                    return;
                }

                // Get the current state using the getter
                switch (getCurrentState()) {
                    case 'introduction':
                        handleIntroduction(choice);  // Using the imported function
                        break;
                    case 'verbSelection':
                        handleVerbSelection(choice);
                        break;
                    case 'gameBattle':
                        handleBattle(choice);
                        break;
                    case 'allyAction':
                        handleAllyMovementSelection(choice);
                        break;
                    default:
                        Terminal.outputMessage("Invalid game state!", systemMessageColor);
                }
            }, 1000);
        }
    });

    function scrollToBottom() {
        let terminal = document.getElementById("output-terminal");
        setTimeout(() => {
            terminal.scrollTop = terminal.scrollHeight;
        }, 10);
    }
});