// State object to hold all game state
let state = {
    gameState: {
        chosenOption: null,
        currentScenario: null,
        currentObject: null,
        selectedAlly: null
    },
    currentState: 'introduction',
    usedAllies: [],
    prisonDataCompleted: false
};

// Getter functions
export function getGameState() {
    return state.gameState;
}

export function getCurrentState() {
    return state.currentState;
}

export function getUsedAllies() {
    return state.usedAllies;
}

export function getPrisonDataCompleted() {
    return state.prisonDataCompleted;
}

// Setter functions
export function setCurrentState(newState) {
    state.currentState = newState;
}

export function setGameState(key, value) {
    state.gameState[key] = value;
}

export function setPrisonDataCompleted(value) {
    state.prisonDataCompleted = value;
}

// Export the state object as read-only
export const gameState = state.gameState;
export const currentState = state.currentState;
export const usedAllies = state.usedAllies;
export const prisonDataCompleted = state.prisonDataCompleted;