import { Terminal } from "../terminal.js";
import { gameBattle } from "./battle.js";
import { introductoryData, prisonData, slumsData, sewerEscapeData, rescueGeneralData, castleTakeoverData, allies, castleEnemies } from "./data.js";
import { gameState, currentState, setCurrentState, prisonDataCompleted } from "./gameState.js";

const systemMessageColor = `#FF81811`;
const gameMessageColor = `#00FF00`;

/**
 * Allows the game to find the next available scenario for the user to play through
 * @returns A random game data object from the current object
 */
export function randomGameData() {
    if (gameState.currentObject === prisonData) {
        // Ensure all prisonData scenarios are completed before marking it as done
        const remainingGames = prisonData.filter(game => !game.completed);
        if (remainingGames.length === 0) {
            prisonDataCompleted = true;
            gameBattle(0, castleEnemies[0]);
            setCurrentState('gameBattle');
            return null;
        }

        // Cycle through prisonData in order
        const nextGame = prisonData.find(game => !game.completed);
        return nextGame;
    }

    const incompleteGames = gameState.currentObject.filter(game => !game.completed);
    if (incompleteGames.length === 0) {
        // If introductoryData is done, move to prisonData
        if (gameState.currentObject === introductoryData) {
            gameState.currentObject = prisonData;
            return randomGameData(); // Re-run the function with the new object
        }
        gameBattle(0, castleEnemies[0]);
        setCurrentState('gameBattle');
        return null; // No more incomplete games left
    }

    // Always start with the first incomplete game in introductoryData
    if (gameState.currentObject === introductoryData) {
        return incompleteGames[0];
    }

    // For other data, continue to select randomly
    const randomIndex = Math.floor(Math.random() * incompleteGames.length);
    return incompleteGames[randomIndex];
}

/**
 * Output the description of the current scenario to the terminal
 */
export function outputIntroduction() {
    const selectedGameData = randomGameData();
    if (!selectedGameData) {
        Terminal.outputMessage("No more scenarios available.", systemMessageColor);
        return;
    }
    // Update the global game state with the current scenario
    gameState.currentScenario = selectedGameData;

    // Begin outputting the scenario to the terminal
    Terminal.outputMessage(`Location: ${selectedGameData.location}`, gameMessageColor);
    Terminal.outputMessage(selectedGameData.intro, gameMessageColor);
    Terminal.outputMessage(selectedGameData.action, gameMessageColor);
    selectedGameData.options.forEach(option => Terminal.outputMessage(option.choice, gameMessageColor));
    setCurrentState('introduction');  // Ensure state stays as introduction when showing options
}

/**
 * Finds the next incomplete game scenario. If all are completed, moves to the next phase.
 */
export function findIncompleteGame() {
    const availableGames = gameState.currentObject.filter(game => !game.completed);

    if (availableGames.length > 0) {
        gameState.currentScenario = availableGames[0];
        outputIntroduction();
    } else {
        // All scenarios in current object completed, handle transitions
        switch (gameState.currentObject) {
            case introductoryData:
                console.log("All scenarios completed in introductoryData, transitioning to prisonData");
                gameState.currentObject = prisonData;
                break;
            case prisonData:
                console.log("All scenarios completed in prisonData, transitioning to sewerEscapeData");
                gameState.currentObject = sewerEscapeData;
                break;
            case sewerEscapeData:
                console.log("All scenarios completed in sewerEscapeData, transitioning to slumsData");
                gameState.currentObject = slumsData;
                break;
            case slumsData:
                // Decision point handled in handleVerbSelection
                break;
            case rescueGeneralData:
                console.log("All scenarios completed in rescueGeneralData, transitioning to castleTakeoverData");
                gameState.currentObject = castleTakeoverData;
                break;
            case castleTakeoverData:
                // Game completion logic
                Terminal.outputMessage("Congratulations! You've completed the game!", gameMessageColor);
                return;
        }
        findIncompleteGame(); // Start next section
    }
}

/**
 * Marks a game scenario as completed in the game state.
 * @param {number} gameID - The ID of the game scenario to mark as completed.
 */
export function markGameAsCompleted(gameID) {
    console.log("Attempting to mark a game as completed");
    for (let i = 0; i < gameState.currentObject.length; i++) {
        if (gameState.currentObject[i].gameID === gameID) { // Find the game by its ID
            gameState.currentObject[i].completed = true; // Mark the game as completed
            console.log(`Game with gameID ${gameID} marked as completed.`); // Log completion
            return;
        }
    }
    console.log(`Game with gameID ${gameID} not found.`); // If game not found, log the message
}