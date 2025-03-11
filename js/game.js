import { Terminal } from "./terminal.js";

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
        let currentState = 'introduction';
        let usedAllies = [];
        let prisonDataCompleted = false;

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
                    // Cycle through all states and identify which one the user is currently in: This part cancels out the need for mohammeds progress file
                    switch (currentState) {
                        case 'introduction':
                            handleIntroduction(choice);
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
                            Terminal.outputMessage("Invalid state. Try again!", systemMessageColor);
                            break;
                    }
                }, 1000);
            }
        });



        /**
         * Handle the users input for introduciton as you can read from the objects (only 1 or 2 are plausible answers for the first stage)
         * @param {*} choice: The choice the user has made in the introduction stage 
         */
        function handleIntroduction(choice) {
            if (choice === "1" || choice === "2") {
                // Move the user to the verb selection as they successfully selected a valid choice
                currentState = 'verbSelection';
                // Now allow the system to determine what happens next after the user enters a value
                inputIntroduction(choice);
            } else {
                Terminal.outputMessage("Invalid choice! Please choose '1' or '2'.", systemMessageColor);
            }
        }

        function scrollToBottom() {
            let terminal = document.getElementById("output-terminal");
            setTimeout(() => {
                terminal.scrollTop = terminal.scrollHeight;
            }, 10);
        }
        let gameState = {
            chosenOption: null,
            currentScenario: null, // The scenario the game is in
            currentObject: null // The current object the game is in
        };

        /**
         * All the game data is stored in the below objects, this allows for the user to be able to interact with the game
         * and make decisions based on the information given to them. Generally user is presented with a choice and then a verb
         * to select from.
         * 
         * Because the game follows a strict story line introductoryData will not have any randomisation, however prisonData will
         * have randomisation as the user progresses through the game.
         */
        const introductoryData = [
            {
                // As Shea outlines in the outline this provdes the user with the first scenario, in my head if the village is being 
                // attacked the user will only have one option which is to run to the forest.
                gameID: 1,
                location: "The Burning Village",
                completed: false,
                importanceLevel: 0.4,
                intro: "A group of renkown knights come to inform your village that the king had requested a larger tax of 60% of their profits after a very successful harvest. "+
                "The villagers desperately pleaded for a reduction to the tax as it would mean they wouldn’t be able to afford various things needed for their survival such as firewood and bread,"+
                " but the knights are stubborn which led to them attacking the village as punishment for disrespecting the king. The knights laugh while destroying the village.",
                action: "With nothing but a sword, a small healing potion, and some rations, you flee into the darkness, heading toward the capital in search of refuge.",
                options: [{
                        choice: "1. Run towards the forest",
                        outcome: "The only path forward is through the dense and dangerous woods, with mysteries awaiting.",
                        continuation: [{
                            action: "Exhausted and alone, you must find shelter before the knights or a pack of wolves find you.",
                            verbs: {
                                "cave": {
                                    description: "You spot a small cave and take refuge inside, hoping to rest before continuing your journey.",
                                    reputationImpact: 0,
                                    gameOver: false
                                },
                                "campfire": {
                                    description: "You set up a campfire, but the glow attracts a pack of wolves. You are overwhelmed and do not survive.",
                                    reputationImpact: -5,
                                    gameOver: true
                                }
                            }
                        }]
                    }
                ]
            },
            {
                // User has now made it past the forest and now is required to wait in line, since both of the outcomes are so
                // different we are required to make a new object for the continuation...
                // If user selects option 2 then the user should go straight to slums skipping prison
                gameID: 2,
                location: "The Capital Gates",
                completed: false,
                importanceLevel: 0.2,
                intro: "After days of grueling travel, surviving on scraps and stolen rations, you finally stand before the towering gates of the capital. The golden crests of the king gleam under the sun, but the scent of sweat and desperation fills the air. A long line of weary travelers and peasants stretches before you, their hollow eyes filled with hope and fear. \n\nNearby, a group of nobles draped in silk and gold stride past the crowd, their servants carrying chests of goods. The guards barely glance at them before ushering them inside, while the common folk wait under the scorching sun.",
                action: "As you approach the front of the line, a guard in battered steel armor steps forward, scrutinizing you with a hard glare.",
                options: [
                    {
                        choice: "1. Tell the guard your village was attacked",
                        outcome: "The guard's grip tightens on his spear. 'No survivors allowed. King's orders.' Before you can react, soldiers seize you.",
                        continuation: [
                            {
                                action: "You are dragged through the gates, but instead of safety, you find yourself shackled and thrown into the depths of the capital prison.",
                                verbs: {
                                    "accept": {
                                        description: "You resign yourself to captivity, knowing survival depends on patience and cunning.",
                                        reputationImpact: -3
                                    },
                                    "resist": {
                                        description: "You lash out, fighting against the guards, but the blunt end of a spear cracks against your ribs. Pain sears through your body as you are beaten into submission.",
                                        reputationImpact: -5
                                    }
                                }
                            }
                        ]
                    },
                    {
                        choice: "2. Say you're here to visit a friend in the slums",
                        outcome: "The guard narrows his eyes but sighs, uninterested in your story. 'Move along. No trouble.' He steps aside, letting you through.",
                        continuation: [
                            {
                                action: "You slip into the crowded and grimy streets of the slums. Beggars cling to passersby, merchants peddle stolen goods, and the stench of unwashed bodies lingers in the humid air.",
                                verbs: {
                                    "explore": {
                                        description: "You weave through the labyrinth of alleys, listening for whispers of rebellion or opportunity.",
                                        reputationImpact: 1
                                    },
                                    "hide": {
                                        description: "You lower your hood and stick to the shadows, ensuring no unwanted eyes track your movement.",
                                        reputationImpact: 0
                                    }
                                }
                            }
                        ]
                    }
                ]               
            },
        ];
        

        /**
         * Second Object this facilitates the user going to prison however the user can escape from the prison
         * This is the first time the user is given a choice to escape or not, if they do not escape they will be given a game over
         * If user escapes prison then progress to slums
         */
        const prisonData = [{ 
            gameID: 3,
            location: "The Prison",
            completed: false,
            importanceLevel: 0.3,
            intro: "You find yourself locked in a grimy prison cell, sentenced to life for the crime of survival. Guards patrol the halls, tormenting prisoners for amusement.",
            action: "One night, a guard falls asleep near your cell, his keys dangling from his belt just out of reach.",
            options: [{
                    choice: "1. Reach for the keys",
                    outcome: "As you grab for them, the keys fall, waking the guard. You are caught and sentenced to execution.",
                    continuation: [{
                        action: "There is no escape this time.",
                        verbs: {
                            "game over": {
                                description: "Your journey ends here.",
                                reputationImpact: -10
                            }
                        }
                    }]
                },
                {
                    choice: "2. Use an electromagnet to grab the keys",
                    outcome: "Using an insulated wire and a loose nail, you create an electromagnet and carefully retrieve the keys without alerting the guard.",
                    continuation: [{
                        action: "You unlock the cell and slip into the shadows, heading toward the sewers.",
                        verbs: {
                            "escape": {
                                description: "You successfully navigate the underground tunnels and emerge into the slums.",
                                reputationImpact: 5
                            }
                        }
                    }]
                }
            ]
        }
        ];
        /**
         * The user selects the correct verb to progress to the slums, so slums has their own object
         */
        const slumsData = [
            {
                gameID: 4,
                location: "The Slums",
                completed: false,
                importanceLevel: 0.5,
                intro: "You find yourself in the heart of the slums, where narrow alleys twist and turn, and the air smells of damp stone and food scraps. The people here seem worn down by life, but there's a spark of defiance in their eyes.",
                action: "A rough-looking man approaches you. He eyes you up and down before speaking.",
                options: [
                    {
                        choice: "1. Ask the man what he wants",
                        outcome: "He tells you there's a game going on tonight, a game of wits and deception. If you win, you'll gain access to people who can help you with your quest. If you lose, you'll owe them a favor.",
                        continuation: [
                            {
                                action: "Do you want to participate in the game?",
                                verbs: {
                                    "agree": {
                                        description: "You agree to participate in the game.",
                                        reputationImpact: 2,
                                        gameOver: false
                                    },
                                    "decline": {
                                        description: "You decline the offer and continue your journey.",
                                        reputationImpact: -1,
                                        gameOver: false
                                    },
                                    "question": {
                                        description: "You question the man further about the game.",
                                        reputationImpact: 0,
                                        gameOver: false
                                    }
                                }
                            }
                        ]
                    },
                    {
                        choice: "2. Ignore him and keep walking",
                        outcome: "You continue walking through the slums, keeping an eye out for any opportunities or threats.",
                        continuation: [
                            {
                                action: "You notice a group of people gathered around a fire, sharing stories and food.",
                                verbs: {
                                    "join": {
                                        description: "You join the group and listen to their stories.",
                                        reputationImpact: 1,
                                        gameOver: false
                                    },
                                    "avoid": {
                                        description: "You avoid the group and continue on your way.",
                                        reputationImpact: 0,
                                        gameOver: false
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ];

        /**
         * An object for the User's Character
         * This allows all of the stats to be stored in one place and can be accessed easily
         */
        var userCharacter = [{
            name: "Will be loaded from db",
            hunger: 0.4,
            reputation: 0.6,
            gainedAllies: [{
                    allyName: "Kings Disowned Bastard",
                    friendshipLevel: 0.5,
                    strength: 3.0,
                    defense: 1.0,
                    health: 50,
                    maxHealth: 50,
                    assignedItem: {
                        name: "Potion",
                        durability: 1.0,
                        strength: 1.0
                    },
                    isDefending: false
                },
                {
                    allyName: "General Grievous",
                    friendshipLevel: 0.5,
                    strength: 4.0,
                    defense: 1.2,
                    health: 45,
                    maxHealth: 45,
                    assignedItem: {
                        name: "Sword",
                        durability: 1.0,
                        strength: 2.5
                    },
                    isDefending: false
                },
                {
                    allyName: "Obe Wan Kenboi",
                    friendshipLevel: 0.5,
                    strength: 3.5,
                    defense: 1.5,
                    health: 55,
                    maxHealth: 55,
                    assignedItem: {
                        name: "Shield",
                        durability: 1.0,
                        strength: 1.5
                    },
                    isDefending: false
                }
            ]
        }];

        /**
         * Any enemies the user will face in the game
         * This will be expanded upon as the game progresses
         */
        var enemies = [{
            name: "Dark Knight",
            health: 100,
            maxHealth: 100,
            strength: 3.0,
            defense: 1.5,
            description: "A fearsome knight clad in dark armor."
        }];

        /**
         * Output all of the user characters stats to the terminal
         */
        function outputUser() {
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

        /**
         * Allows the game to find the next available scenario for the user to play through
         * @returns A random game data object from the current object
         */
        function randomGameData() {
            if (gameState.currentObject === prisonData) {
                // Ensure all prisonData scenarios are completed before marking it as done
                const remainingGames = prisonData.filter(game => !game.completed);
                if (remainingGames.length === 0) {
                    prisonDataCompleted = true;
                    gameBattle(0, enemies[0]);
                    currentState = 'gameBattle';
                    return null;
                }
            }
        
            const incompleteGames = gameState.currentObject.filter(game => !game.completed);
            if (incompleteGames.length === 0) {
                // If introductoryData is done, move to prisonData
                if (gameState.currentObject === introductoryData) {
                    gameState.currentObject = prisonData;
                    return randomGameData(); // Re-run the function with the new object
                }
                gameBattle(0, enemies[0]);
                currentState = 'gameBattle';
                return null; // No more incomplete games left
            }
        
            // Always start with the first incomplete game in introductoryData
            if (gameState.currentObject === introductoryData) {
                return incompleteGames[0];
            }
        
            // For prisonData, continue to select randomly
            const randomIndex = Math.floor(Math.random() * incompleteGames.length);
            return incompleteGames[randomIndex];
        }

        /**
         * Output the description of the current scenario to the terminal
         */
        function outputIntroduction() {
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
        }

        /**
         * Allow the user to input the values for either the introduction or the verb selection, it does not matter which
         * it will always go through this function
         * @param {*} input - Users choice passed in from the function
         */
        function inputIntroduction(input) {
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
        function handleVerbSelection(verb) {
            const selectedOption = gameState.currentScenario.options[gameState.chosenOption];
        
            // Ensure the verb exists in the current option's continuation
            const verbObject = selectedOption.continuation?.[0]?.verbs?.[verb];
        
            if (verbObject) {
                // Display the selected verb's description
                Terminal.outputMessage(verbObject.description, gameMessageColor);
        
                // Adjust reputation based on the impact of the chosen action
                if (verbObject.reputationImpact > 0) {
                    increaseReputation(verbObject.reputationImpact);
                } else {
                    decreaseReputation(verbObject.reputationImpact);
                }
        
                // Check if the game is over
                if (verbObject.gameOver) {
                    Terminal.outputMessage("Game Over. Thank you for playing!", systemMessageColor);
                    currentState = 'gameOver';
                    return;
                }
        
                const gameID = gameState.currentScenario.gameID;
        
                // Mark the scenario as completed and move to the next step
                markGameAsCompleted(gameID);
        
                // If user escapes from prison, call word scramble game
                if (gameState.currentScenario.gameID === 3 && verb === "escape") {
                    wordScrambleGame(); // Call word scramble - @Joseph change to your function name (will only occur if user is in the prison then enters escape)
                    return;
                }
        
                checkFollowUp(selectedOption, verb);
                currentState = 'introduction';
            } else {
                Terminal.outputMessage(`Invalid action! Available actions: ${Object.keys(selectedOption.continuation?.[0]?.verbs || {}).join(', ')}`, systemMessageColor);
            }
        }

        /**
         * Increases the player's reputation based on their action.
         * @param {number} taskRep - The amount of reputation to increase.
         */
        function increaseReputation(taskRep) {
            let rep = userCharacter[0].reputation;
            let increaseAmount = 0.01 * taskRep;

            if (rep >= 0.9 && rep < 0.975) {
                rep = Math.min(1.0, rep + increaseAmount / 2);
            } else if (rep < 0.9) {
                rep = Math.min(1.0, rep + increaseAmount);
            }

            userCharacter[0].reputation = rep;
            let percentage = userCharacter[0].reputation * 100;
            Terminal.outputMessage(`Your reputation has increased by ${taskRep}. It is now ${percentage}%`, gameMessageColor);
        }

        /**
         * Decreases the player's reputation when they make a poor choice.
         * @param {number} taskRep - The amount of reputation to decrease.
         */
        function decreaseReputation(taskRep) {
            let rep = userCharacter[0].reputation;
            let decreaseAmount = 0.01 * taskRep;

            if (rep > 0.025 && rep <= 0.1) {
                rep = Math.max(0.0, rep - decreaseAmount / 2);
            } else if (rep > 0.1) {
                rep = Math.max(0.0, rep - decreaseAmount);
            }

            userCharacter[0].reputation = rep;
            let percentage = userCharacter[0].reputation * 100;
            Terminal.outputMessage(`Your reputation has decreased by ${taskRep}. It is now ${percentage}%`, gameMessageColor);
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
         * Finds the next incomplete game scenario. If all are completed, moves to the next phase.
         */
        function findIncompleteGame() {
            const availableGames = gameState.currentObject.filter(game => !game.completed);
        
            if (availableGames.length > 0) {
                // Move to the next available game based on the order or random selection
                if (gameState.currentObject === introductoryData) {
                    // Select the next incomplete game in order for introductoryData
                    gameState.currentScenario = availableGames[0];
                } else {
                    // For prisonData, continue to select randomly
                    const nextGameIndex = Math.floor(Math.random() * availableGames.length);
                    gameState.currentScenario = availableGames[nextGameIndex];
                }
                outputIntroduction();
            } else {
                if (gameState.currentObject === introductoryData) {
                    gameState.currentObject = prisonData;
                    findIncompleteGame(); // Call the function again to start the next part
                } else if (gameState.currentObject === prisonData) {
                    if (!prisonDataCompleted) {
                        prisonDataCompleted = true;
                        gameBattle(0, enemies[0]);
                    }
                }
            }
        }

        /**
         * Marks a game scenario as completed in the game state.
         * @param {number} gameID - The ID of the game scenario to mark as completed.
         */
        function markGameAsCompleted(gameID) {
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

        /**
         * Starts the word scramble game and handles the interaction with the player.
         */
        function wordScrambleGame() {
            const wordScrambleElement = document.getElementById("wordScramble"); // Get the word scramble element
            if (wordScrambleElement) {
                wordScrambleElement.style.display = "block"; // Display the word scramble game
            } else {
                console.error("wordScramble element not found"); // Log error if element is not found
                return;
            }

            let words = [{
                    word: "addition",
                    hint: "The process of adding numbers"
                },
                {
                    word: "meeting",
                    hint: "Event in which people come together"
                }
            ];

            const wordText = document.querySelector(".word"), // Word display
                hintText = document.querySelector(".hint span"), // Hint display
                timeText = document.querySelector(".time b"), // Time display
                inputField = document.querySelector("input"), // Input field for user to guess
                refreshBtn = document.querySelector(".refresh-word"), // Button to refresh the game
                checkBtn = document.querySelector(".check-word"); // Button to check the word

            let correctWord, timer;

            const initTimer = maxTime => { // Initialize timer for the word scramble
                clearInterval(timer); // Clear any previous timer
                timer = setInterval(() => {
                    if (maxTime > 0) {
                        maxTime--;
                        return timeText.innerText = maxTime; // Update the remaining time
                    }
                    alert(`Time off! ${correctWord.toUpperCase()} was the correct word`); // Alert user if time is up
                    initGame(); // Restart the game
                }, 1000);
            };

            const initGame = () => { // Initialize a new word scramble game
                initTimer(30); // Set timer to 30 seconds
                let randomObj = words[Math.floor(Math.random() * words.length)]; // Pick a random word
                let wordArray = randomObj.word.split(""); // Split the word into an array of characters
                for (let i = wordArray.length - 1; i > 0; i--) { // Shuffle the word
                    let j = Math.floor(Math.random() * (i + 1));
                    [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
                }
                wordText.innerText = wordArray.join(""); // Display the shuffled word
                hintText.innerText = randomObj.hint; // Display the hint
                correctWord = randomObj.word.toLowerCase(); // Set the correct word in lowercase
                inputField.value = ""; // Clear the input field
                inputField.setAttribute("maxlength", correctWord.length); // Set max length for input
            };

            initGame();

            const checkWord = () => { // Check the user's guess
                let userWord = inputField.value.toLowerCase(); // Get the user input
                if (!userWord) return console.log("Please enter the word to check!"); // Check if input is empty
                if (userWord !== correctWord) return console.log(`Oops! ${userWord} is not a correct word`); // Check if the word is correct
                console.log(`Congrats! ${correctWord.toUpperCase()} is the correct word`); // If correct, log the message
                initGame(); // Restart the game
            };

            refreshBtn.addEventListener("click", initGame); // Refresh button to restart the game
            checkBtn.addEventListener("click", checkWord); // Check button to validate the word
        }

        /**
         * Starts the battle game with the given initiator and enemy.
         */
        function gameBattle(initiator, enemy) {
            console.log("Beginning battle game");
            if (initiator == 0) { // If the user is the initiator
                console.log("User is the initiator");
                Terminal.outputMessage(`You have initiated a battle against ${enemies[0].name}`, systemMessageColor); // Output the battle initiation
                Terminal.outputMessage("Select an ally to use in the battle:", systemMessageColor); // Ask for an ally
                for (let i = 0; i < userCharacter[0].gainedAllies.length; i++) { // List available allies
                    Terminal.outputMessage(`${i}. ${userCharacter[0].gainedAllies[i].allyName}`, systemMessageColor);
                }
                console.log("Users ally has been selected");
                currentState = 'gameBattle'; // Change state to 'gameBattle' for ally selection
            }
        }

        /**
         * Handles the battle selection of an ally.
         * @param {number} choice - The index of the selected ally.
         */
        function handleBattle(choice) {
            if (choice >= 0 && choice < userCharacter[0].gainedAllies.length) { // Check if the ally selection is valid
                const selectedAlly = userCharacter[0].gainedAllies[choice]; // Get the selected ally
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
        function handleAllyMovementSelection(choice) {
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
            if (usedAllies.length === userCharacter[0].gainedAllies.length) {
                simulateEnemyTurn();
                usedAllies = [];
            } else {
                Terminal.outputMessage("Select the next ally to use in the battle:", systemMessageColor);
                for (let i = 0; i < userCharacter[0].gainedAllies.length; i++) {
                    if (!usedAllies.includes(userCharacter[0].gainedAllies[i])) {
                        Terminal.outputMessage(`${i}. ${userCharacter[0].gainedAllies[i].allyName}`, systemMessageColor);
                    }
                }
                currentState = 'gameBattle';
            }
        }

        /** 
         * Simulate the attack action of an ally. 
         * The attack power is calculated by multiplying the ally's strength by the strength of their assigned item.
         */
        function simulateAttack(ally) {
            let baseAttackPower = ally.strength * ally.assignedItem.strength;
            console.log(`Base attack power: ${ally.strength} * ${ally.assignedItem.strength} = ${baseAttackPower}`);

            let enemy = enemies[0];
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
        function startNewRound() {
            usedAllies = [];
            Terminal.outputMessage("--- New Round ---", gameMessageColor);
            Terminal.outputMessage("Select an ally to use in the battle:", systemMessageColor);
            for (let i = 0; i < userCharacter[0].gainedAllies.length; i++) {
                Terminal.outputMessage(`${i}. ${userCharacter[0].gainedAllies[i].allyName}`, systemMessageColor);
            }
            currentState = 'gameBattle';
        }

        /** 
         * Check the outcome of the battle by evaluating if either the enemy or all allies have been defeated.
         */
        function checkBattleOutcome() {
            let enemy = enemies[0];

            if (enemy.health <= 0) {
                Terminal.outputMessage("You have defeated the enemy!", gameMessageColor);
                currentState = 'introduction';
                return true;
            } else if (userCharacter[0].gainedAllies.every(ally => ally.health <= 0)) {
                Terminal.outputMessage("All your allies have been defeated!", systemMessageColor);
                currentState = 'introduction';
                return true;
            }

            return false;
        }

        /** 
         * Simulate the defense action of an ally, increasing their defense and marking them as defending.
         */
        function simulateDefense(ally) {
            Terminal.outputMessage(`${ally.allyName} is defending!`, gameMessageColor);
            console.log(`${ally.allyName} is defending`);

            ally.isDefending = true;
            ally.defense += 10;

            Terminal.outputMessage(`${ally.allyName} raises their guard and is protected from the next enemy attack!`, gameMessageColor);
        }

        /** 
         * Simulate the enemy's turn, randomly deciding which ally to attack and applying damage reduction if they are defending.
         */
        function simulateEnemyTurn() {
            Terminal.outputMessage("The enemy is attacking!", systemMessageColor);

            let enemy = enemies[0];

            userCharacter[0].gainedAllies.forEach(ally => {
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
        function simulateHealing(ally) {
            Terminal.outputMessage(`${ally.allyName} heals an ally!`, gameMessageColor);
            const randomAlly = userCharacter[0].gainedAllies[Math.floor(Math.random() * userCharacter[0].gainedAllies.length)];
            randomAlly.health = Math.min(randomAlly.maxHealth, randomAlly.health + 20);
        }

        gameState.currentObject = introductoryData;
        outputIntroduction();
    }
()); 