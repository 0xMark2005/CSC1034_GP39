import { Terminal } from "../terminal.js";

const gameMessageColor = `#00FF00`;

// Define User Character
export var userCharacter = {
    name: "Will be loaded from db",
    hunger: 0.4,
    reputation: 0.6,
    gainedAllies: []  // Array that will hold allies
};

/**
 * Output all of the user characters stats to the terminal
 */
export function outputUser() {
    let userIndex = 0;
    let user = userCharacter[userIndex];
    let name = user.name;
    let hunger = user.hunger;
    let reputation = user.reputation;

    // Output name
    nameText = `> Name: ${name}`;
    Terminal.outputMessage(nameText, gameMessageColor);

    // Output hunger
    hungerText = `> Hunger: ${hunger}`;
    Terminal.outputMessage(hungerText, gameMessageColor);

    // Output Reputation
    reputationText = `> Reputation: ${reputation}`;
    Terminal.outputMessage(reputationText, gameMessageColor);

    Terminal.outputMessage(`> Gained Allies`, gameMessageColor);
    user.gainedAllies.forEach(ally => {
        // Display each ally's name and friendship level
        let allyName = allies[ally.userAllyIndex].name;

        Terminal.outputMessage(`> Ally Name: ${allyName} | Friendship Level: ${ally.friendshipLevel.toFixed(2)}`, gameMessageColor);
    });
}

export function addAlly(ally) {
    userCharacter.gainedAllies.push(ally);
    Terminal.outputMessage(`You have gained an ally: ${ally.allyName}`, "FFD700");
}

/**
 * Increases the player's reputation based on their action.
 * @param {number} taskRep - The amount of reputation to increase.
 */
export function increaseReputation(taskRep) {
    let rep = userCharacter.reputation;
    let increaseAmount = 0.01 * taskRep;

    if (rep >= 0.9 && rep < 0.975) {
        rep = Math.min(1.0, rep + increaseAmount / 2);
    } else if (rep < 0.9) {
        rep = Math.min(1.0, rep + increaseAmount);
    }

    userCharacter.reputation = rep;
    let percentage = userCharacter.reputation * 100;
    Terminal.outputMessage(`Your reputation has increased by ${taskRep}. It is now ${percentage}%`, gameMessageColor);
}

/**
 * Decreases the player's reputation when they make a poor choice.
 * @param {number} taskRep - The amount of reputation to decrease.
 */
export function decreaseReputation(taskRep) {
    let rep = userCharacter.reputation;
    let decreaseAmount = 0.01 * taskRep;

    if (rep > 0.025 && rep <= 0.1) {
        rep = Math.max(0.0, rep - decreaseAmount / 2);
    } else if (rep > 0.1) {
        rep = Math.max(0.0, rep - decreaseAmount);
    }

    userCharacter.reputation = rep;
    let percentage = userCharacter.reputation * 100;
    Terminal.outputMessage(`Your reputation has decreased by ${taskRep}. It is now ${percentage}%`, gameMessageColor);
}