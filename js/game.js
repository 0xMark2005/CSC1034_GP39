import * as Terminal from "./terminal.js";

const systemMessageColor = `#FF81811`;
const gameMessageColor = `#00FF00`;

document.addEventListener('DOMContentLoaded', function() {

        //Initialize the terminal
        Terminal.initialize();
        const gameUserInput = document.getElementById("user-input");

        /**
         * Variables to allow for the game to start and run
         * 
         *  currentState: Allows for the game to recognise that the game is in the introductory mode when inputting from user input
         *  usedAllies: Allows us to track which allies the user has used when in the round based battle
         *  introPartTwoCompleted: Allows us to detect when intopartTwo is done, this is neccessary because we need to know when the user
         *                         has completed ONE of the entities within introPartTwo
         */
        let currentState = 'introduction';
        let usedAllies = [];
        let introPartTwoCompleted = false;

        /**
         * When the user clicks enter in the terminal and their input is passed into the below switch statement
         * This finds which part of the game the user is on and 
         */
        gameUserInput.addEventListener("keypress", function(event) {
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
         */
        const introPartOne = [{
                // Scotts added object
                gameID: 1,
                location: "King's Castle",
                completed: false,
                importanceLevel: 0.4,
                intro: "You walk near the King's castle, you notice a guard standing by the gates. You think of an idea to try and deceive the guard to join you.",
                action: "The guard, a traditionally loyal character, could be a valuable asset to your plan. Test your cunning and wit in your attempt to win the guard's loyalty.",
                options: [{
                        choice: "1. Tell the guard about your plan with the revolutionaries.",
                        outcome: "The guard wants to test your commitment to the cause and asks where the Hidden Rebel Base is.",
                        continuation: [{
                            action: "You have to decide what to do. Can you trust the guard, or would you back away? Could you lie to him and tell him where an old Rebel Base used to be?",
                            verbs: {
                                "trust": {
                                    description: "You recruit the guard, and he decides to swear an oath of loyalty to your cause.",
                                    reputationImpact: 4
                                },
                                "backaway": {
                                    description: "You fail to recruit the guard. Perhaps you could have trusted him. This could affect your plan greatly.",
                                    reputationImpact: -4
                                },
                                "lie": {
                                    description: "You tell him where an old rebel base is to see if he will tell the King.",
                                    reputationImpact: 0
                                }
                            }
                        }]
                    },
                    {
                        choice: "2. Tell the guard to meet you at a secret location.",
                        outcome: "The guard agrees, but for what reason?",
                        continuation: [{
                            action: "The guard cannot be trusted yet. Should you meet him alone and trust that he comes alone, or will you bring backup and sting the meetup in case he does the same?",
                            verbs: {
                                "trust": {
                                    description: "You trust him and meet him at the location. He does not come alone, and you must decide whether to flee or stay.",
                                    reputationImpact: 0
                                },
                                "sting": {
                                    description: "You bring backup to the location. This was the right choice as you escape and now know not to trust him.",
                                    reputationImpact: 2
                                }
                            }
                        }]
                    }
                ]
            },
            {
                gameID: 2,
                location: "Quiet Village",
                completed: false,
                importanceLevel: 0.05,
                intro: "You arrive at a small, peaceful village. People go about their daily routines, and the air smells of fresh bread.",
                action: "A young boy approaches you, looking lost and anxious.",
                options: [{
                        choice: "1. Ask the boy if he’s lost",
                        outcome: "The boy nods eagerly, telling you that he can’t find his way home.",
                        continuation: [{
                            action: "He points toward a hill and asks you to accompany him.",
                            verbs: {
                                "help": {
                                    description: "You walk with him to the top of the hill where he spots his house in the distance. He thanks you and runs home.",
                                    reputationImpact: 1
                                },
                                "ignore": {
                                    description: "You decide to ignore him and continue your journey. The boy looks disappointed but doesn’t protest.",
                                    reputationImpact: -1
                                },
                                "suggest": {
                                    description: "You suggest he ask someone else for help. He hesitates but thanks you and walks away.",
                                    reputationImpact: 0,
                                }
                            }
                        }]
                    },
                    {
                        choice: "2. Ask the boy if he needs help finding someone",
                        outcome: "The boy shakes his head and seems to calm down, telling you that he was just looking for his pet rabbit.",
                        continuation: [{
                            action: "He points toward a garden in the village and runs off in search of the rabbit.",
                            verbs: {
                                "help": {
                                    description: "You follow the boy and help him search the garden. After a while, he finds the rabbit and thanks you with a smile.",
                                    reputationImpact: 2
                                },
                                "watch": {
                                    description: "You simply watch him search, offering no help. He notices but doesn’t seem upset.",
                                    reputationImpact: -1
                                },
                                "leave": {
                                    description: "You leave the boy to his search and move on. He doesn’t seem to mind much.",
                                    reputationImpact: 0,
                                }
                            }
                        }]
                    }
                ]
            },
            {
                gameID: 3,
                location: "Forest Path",
                completed: false,
                importanceLevel: 0.05,
                intro: "You walk along a quiet, winding forest path. The sounds of nature are calming, and the sunlight filters through the trees.",
                action: "You spot an elderly woman sitting by the side of the path, knitting something by hand.",
                options: [{
                        choice: "1. Stop and talk to the woman",
                        outcome: "She looks up with a smile, nodding at you kindly.",
                        continuation: [{
                            action: "She offers you a piece of her knitting as a good luck charm.",
                            verbs: {
                                "accept": {
                                    description: "You thank her and take the charm, feeling a strange sense of peace as you continue your journey.",
                                    reputationImpact: 1
                                },
                                "refuse": {
                                    description: "You politely decline and wish her well, continuing on your way.",
                                    reputationImpact: 0
                                },
                                "talk": {
                                    description: "You engage in a brief conversation, but soon realize there’s not much to say. She waves you off with a chuckle.",
                                    reputationImpact: 0
                                }
                            }
                        }]
                    },
                    {
                        choice: "2. Keep walking and ignore the woman",
                        outcome: "You walk past her, not sparing her a second glance. She doesn’t seem to mind.",
                        continuation: [{
                            action: "The forest path continues without incident, and the air remains peaceful.",
                            verbs: {
                                "reflect": {
                                    description: "You reflect on your decision to not engage, but quickly move on.",
                                    reputationImpact: 0
                                },
                                "keepMoving": {
                                    description: "You continue walking without giving it much thought.",
                                    reputationImpact: 0
                                }
                            }
                        }]
                    }
                ]
            }
        ];

        /**
         * Second Object - The storyline needs to be clearer
         */
        const introPartTwo = [{
                gameID: 1,
                location: "The Slums",
                completed: false,
                importanceLevel: 0.1,
                intro: "You find yourself in the heart of the slums, where narrow alleys twist and turn, and the air smells of damp stone and food scraps. The people here seem worn down by life, but there's a spark of defiance in their eyes.",
                action: "A rough-looking man approaches you. He eyes you up and down before speaking.",
                options: [{
                        choice: "1. Ask the man what he wants",
                        outcome: "He grins, revealing a few missing teeth.",
                        continuation: [{
                            action: "He tells you there's a game going on tonight, a game of wits and deception. If you win, you'll gain access to people who can help you with your quest. If you lose, you'll owe them a favor.",
                            verbs: {
                                "agree": {
                                    description: "You nod, intrigued by the challenge, and follow the man to a hidden tavern where the game is held.",
                                    reputationImpact: 1
                                },
                                "decline": {
                                    description: "You tell him you're not interested, but the man looks disappointed and walks off, muttering something about wasted potential.",
                                    reputationImpact: 0
                                },
                                "question": {
                                    description: "You ask him about the game, but he only chuckles, saying you'll find out when you get there.",
                                    reputationImpact: 0
                                }
                            }
                        }]
                    },
                    {
                        choice: "2. Ignore him and keep walking",
                        outcome: "You turn your back on the man and continue through the slums. The noise of the city fades as you walk deeper into the grimy streets.",
                        continuation: [{
                            action: "As you pass a small alley, you hear a scuffle behind you. Turning around, you see a group of thugs watching you from the shadows.",
                            verbs: {
                                "approach": {
                                    description: "You walk up to the thugs, unafraid. They seem impressed by your courage but warn you to watch your back in the slums.",
                                    reputationImpact: 1
                                },
                                "ignore": {
                                    description: "You ignore the thugs and keep walking, hoping they’ll leave you alone. They don’t follow.",
                                    reputationImpact: 0
                                },
                                "threaten": {
                                    description: "You threaten the thugs, telling them to stay out of your way. They laugh and disperse, impressed by your boldness.",
                                    reputationImpact: 1
                                }
                            }
                        }]
                    }
                ]
            },
            {
                gameID: 2,
                location: "Hidden Tavern",
                completed: false,
                importanceLevel: 0.2,
                intro: "The hidden tavern is dimly lit, its patrons a mix of rough types and shady figures. A tense air fills the room as whispers pass between the tables. In the center, a large table is set up for the deception game, and a crowd has gathered.",
                action: "The man from earlier nods at you and gestures to the table, signaling you to join the game.",
                options: [{
                        choice: "1. Sit down at the table and join the game",
                        outcome: "You take a seat at the table, your heart racing with anticipation. The dealer, a woman with piercing eyes, shuffles a deck of cards in front of you.",
                        continuation: [{
                            action: "The rules are simple: deceive your opponents and make them believe your lies. But one wrong move, and you'll lose everything.",
                            verbs: {
                                "bluff": {
                                    description: "You confidently make your first move, bluffing your way through the game. The others are wary but unsure, giving you an edge.",
                                    reputationImpact: 2
                                },
                                "fold": {
                                    description: "You decide to fold early, sensing the game might be more dangerous than you first thought. You lose some coins, but keep your pride.",
                                    reputationImpact: -1
                                },
                                "observe": {
                                    description: "You take a more cautious approach, observing the other players carefully. You learn a lot, but don't make any moves yet.",
                                    reputationImpact: 0
                                }
                            }
                        }]
                    },
                    {
                        choice: "2. Decline to play and leave the tavern",
                        outcome: "You decide against the high-stakes game and turn to leave. The man eyes you with a mix of disappointment and respect as you exit the tavern.",
                        continuation: [{
                            action: "The moment you step outside, you're confronted by a cloaked figure who warns you that backing out of the game has consequences in the slums.",
                            verbs: {
                                "threaten": {
                                    description: "You threaten the figure, ready to defend yourself if necessary. The figure smirks and disappears into the shadows.",
                                    reputationImpact: 1
                                },
                                "plead": {
                                    description: "You try to explain yourself, but the figure just laughs, telling you that you’ve made a mistake. You'll regret it later.",
                                    reputationImpact: -1
                                },
                                "ignore": {
                                    description: "You ignore the figure and continue walking. The streets feel even more dangerous now, but you’re not sure why.",
                                    reputationImpact: 0
                                }
                            }
                        }]
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
            // Check if IntroPartTwo has any more scenarios to go through
            if (gameState.currentObject === introPartTwo) {
                // Find any entities within the object which are not completed i.e completed  = false;
                const remainingGames = introPartTwo.filter(game => !game.completed);
                if (remainingGames.length === 0) {
                    introPartTwoCompleted = true;
                    gameBattle(0, enemies[0]);
                    currentState = 'gameBattle';
                    return null;
                }
            }

            // Check if any games are required to be completed in introPartOne
            const incompleteGames = gameState.currentObject.filter(game => !game.completed);
            if (incompleteGames.length === 0) {
                // if true we now move on to introPartTwo
                if (gameState.currentObject === introPartOne) {
                    gameState.currentObject = introPartTwo;
                    // Force to find a new object (introPartTwo)
                    return randomGameData();
                }
            }
            // Bring the user a random object from the scenario to be displayed
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

                const gameID = gameState.currentScenario.gameID;

                // Mark the scenario as completed and move to the next step
                markGameAsCompleted(gameID);
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
            const availableGames = gameState.currentObject.filter(game => !game.completed); // Filter games that are not completed

            if (availableGames.length > 0) { // If there are incomplete games
                const nextGameIndex = Math.floor(Math.random() * availableGames.length); // Randomly select the next incomplete game
                console.log(`Moving to the next game: Game ${availableGames[nextGameIndex].gameID}`); // Log the selected game
                gameState.currentScenario = availableGames[nextGameIndex]; // Set the current scenario to the selected game
                outputIntroduction(); // Output the introduction for the game
            } else {
                console.log("No incomplete games left, moving to the next phase."); // No incomplete games, move to the next phase
                if (gameState.currentObject === introPartOne) {
                    gameState.currentObject = introPartTwo; // Move to the second part of the introduction
                    findIncompleteGame(); // Check for incomplete games again
                } else if (gameState.currentObject === introPartTwo) {
                    if (!introPartTwoCompleted) {
                        introPartTwoCompleted = true; // Mark the second intro part as completed
                        gameBattle(0, enemies[0]); // Start the battle with the first enemy
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

        gameState.currentObject = introPartTwo;
        outputIntroduction();
    }
()); 