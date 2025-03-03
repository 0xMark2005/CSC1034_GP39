document.addEventListener('DOMContentLoaded', function() {
    // Menu for the terminal in the game.js screen 

    const gameUserInput = document.getElementById("gameUserInput");
    const gameDiv = document.getElementById("gameBegins");
    gameDiv.style.display = "block";

    if (!gameUserInput || !gameDiv) {
        console.error("Error: gameUserInput or gameDiv not found!");
        return; // Exit if elements don't exist
    }

    //get the user input box
    const userInput = document.getElementById("userInput");

    // Get or create the terminal output container
    const outputTerminal = document.getElementById("output-terminal"); 
    const terminalOutputContainer = outputTerminal.querySelector(".terminal-output-text");

    if (!terminalOutputContainer) { // If there is no output container
        terminalOutputContainer = document.createElement("ul");
        terminalOutputContainer.classList.add("terminal-output-text");
    }

    outputTerminal.appendChild(terminalOutputContainer); // Adds the output container to the output terminal


    let currentState = 'introduction'; // Track the current game state

    // Detect when the user presses Enter
    gameUserInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            const choice = gameUserInput.value.trim();

            // Create the list for the terminal
            const newLine = document.createElement("li");
            newLine.textContent = `> ${choice}`;
            terminalOutputContainer.appendChild(newLine);


            gameUserInput.value = ""; // Clear input field

            // Process the input after 1 second
            setTimeout(() => {
                // Show inventory if the user types 'Show Inventory'
                if (choice == "Show Inventory") {
                    outputUser(); // Assuming outputUser function is defined elsewhere
                    scrollToBottom(); // Assuming scrollToBottom function is defined elsewhere
                    return;
                }

                // Determine what state the user is in and handle input accordingly
                switch (currentState) {
                    case 'introduction':
                        handleIntroduction(choice);
                        break;
                    case 'verbSelection':
                        handleVerbSelection(choice);
                        break;
                        // Add more states as needed
                    default:
                        addSystemMessage("Invalid state. Try again!");
                        break;
                }
            }, 1000);
        }
    });

    // Function to handle user choice during the introduction stage
    function handleIntroduction(choice) {
        if (choice === "1" || choice === "2") {
            // User chose an option (1 or 2)
            currentState = 'verbSelection'; // Move to verb selection stage
            inputIntroduction(choice); // Handle option choice
        } else {
            addSystemMessage("Invalid choice! Please choose '1' or '2'.");
        }
    }

    // Function to handle the verb selection after the introduction stage
    function handleVerbSelection(choice) {
        inputIntroductionVerb(choice); // Assuming inputIntroductionVerb is properly defined elsewhere
    }


    // Function to add system messages and game messages. 
    // (System message will be the user input)
    function addSystemMessage(message, color = "#FFFFFF") {
        const systemMessage = document.createElement("li");
        systemMessage.textContent = message;
        systemMessage.style.color = color;
        terminalOutputContainer.appendChild(systemMessage);
        scrollToBottom();
    }
    // GameMessage is the game output
    function addGameMessage(message, color = "#00FF00") {
        const systemMessage = document.createElement("li");
        systemMessage.textContent = message;
        systemMessage.style.color = color;
        systemMessage.style.fontSize = '12px';
        terminalOutputContainer.appendChild(systemMessage);
        scrollToBottom();
    }

    // Code to ensure terminal stays at bottom and scrolls

    function scrollToBottom() {
        let terminal = document.getElementById("gameOutputContainer");
        setTimeout(() => {
            terminal.scrollTop = terminal.scrollHeight;
        }, 10); // Small delay to ensure content is rendered before scrolling
    }



    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // End of Menu for game.js

    // declare varabiables
    var i = 0; // Starting at 0, increases through the string txt as each letter is outputted
    var txt = 'A long time ago...'; // String to be wrote out through the typewriter
    var speed = 150; // Speed or how long it will take to output the string

    // Declare Function name which will be called in menu.js when the user enters 1 to start the game
    function typeWriter() {
        // Find h1 id 
        var titleElement = document.getElementById("gameBeginsTitle");
        // Start outputting the string to h1m passing and maintaining one letter at a time
        if (i < txt.length) {
            titleElement.innerHTML += txt.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }

    // Expose typeWriter globally, to be called in menu.js
    window.typeWriter = typeWriter;

    // **************************************************************************
    // Start of Game code & logic
    // NO USE of chat gpt for game, to prevent it from becoming too complex
    // Outline of game used
    // https://docs.google.com/document/d/10vEChyI5rYxC-jqJ5iqyOHsHxPu-rPtpbLo5ev2xXbg/edit?pli=1&tab=t.0
    // **************************************************************************

    // ACT 1: Gathering the revolutionaries
    // Village is burning so main character required to find allies.
    // I am not sure whether we want to store the potential allies locally or through database.
    // For now it will be locally. In Arrays

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // The user's characters array, with multiple discussions done this can be changed at anytime
    // This should be saved to the database as well I think
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    var userCharacter = new Array();
    userCharacter = [{
        name: "User character",
        hunger: 0.4, // Should this be random each time the game starts
        reputation: 0.6, // Should this be random each time the game starts
        inventory: [{
                item1: "Null",
                durability: "1.0",
                strength: 0.75
            },
            {
                item2: "Null",
                durability: "1.0",
                strength: 0.75
            },
            {
                item3: "Null",
                durability: "1.0",
                strength: 0.75
            },
            {
                item4: "Null",
                durability: "1.0",
                strength: 0.75
            },
            {
                item5: "Null",
                durability: "1.0",
                strength: 0.75
            },
        ],
        gainedAllies: [ // Allies gained by the user through the game 
            {
                userAllyIndex: 1,
                friendshipLevel: 0.5
            }
        ]
    }]

    // Function to output user details to the terminal
    function outputUser() {
        // Create an instance of a usercharacter (THIS WILL BE DONE ON CREATION OF GAME)
        let userIndex = 0; // Pick a random ally
        let user = userCharacter[userIndex];
        let name = user.name; // Access the user name
        let hunger = user.hunger;
        let reputation = user.reputation;

        // Create a new line element for each output
        let newLine = document.createElement('p');

        // Output name
        nameText = `> Name: ${name}`;
        addGameMessage(nameText);

        // Output hunger
        hungerText = `> Hunger: ${hunger}`;
        addGameMessage(hungerText);

        // Output Reputation
        reputationText = `> Reputation: ${reputation}`;
        addGameMessage(reputationText);


        // Will not output inventory as conflicts with Josephs designs

        // Output the gained allies

        addGameMessage(`> Gained Allies`);
        user.gainedAllies.forEach(ally => {
            // Display each ally's name and friendship level
            let allyName = allies[ally.userAllyIndex].name;

            addGameMessage(`> Ally Name: ${allyName} | Friendship Level: ${ally.friendshipLevel.toFixed(2)}`);
        });
    }


    // First create possible list of allies && Have key words the ally may say?
    // E.G Kings bastard may describe someone as 'peasant', 'fool', etc
    // FORMAT: "ALLY NAME", [DESCRIPTIONS OF MAIN CHARACTER], "LOCATION", "Description of task to save ally"

    var allies = new Array();
    allies = [{
            name: "Kings Bastard",
            descriptions: ["Peasant", "Fool", "Weakling"],
            location: "A War Prison",
            task: "Infiltrate and break him out."
        },
        {
            name: "The Exiled General",
            descriptions: ["Noble", "Warrior", "Brave"],
            location: "The Slums",
            task: "Prove yourself in a high-stakes deception game."
        },
        {
            name: "The Underground Rebel Leader",
            descriptions: ["Intelligent", "Charming", "Sketchy"],
            location: "A Hidden Rebel Camp",
            task: "Survive a test of loyalty and commitment."
        }
    ];

    // Get the paragraph in index.html which will be changed to facilitate the meeting of an ally
    var gameOutputParagraph = document.getElementById("gameOutputParagraph");

    // Function to get a random phrase/description for a specific ally
    function getRandomPhrase(allyIndex) {
        let ally = allies[allyIndex]; // Access the ally object directly
        let phrases = ally.descriptions; // Get the descriptions array for the ally
        let randomPhraseIndex = Math.floor(Math.random() * phrases.length); // Pick a random phrase
        return phrases[randomPhraseIndex]; // Return the phrase
    }

    // This function will randomly select an ally and a phrase, then update the HTML paragraph found above
    function meetAlly() {
        let allyIndex = Math.floor(Math.random() * allies.length); // Pick a random ally
        let ally = allies[allyIndex]; // Access the ally object
        let allyName = ally.name; // Get the ally's name
        let randomPhrase = getRandomPhrase(allyIndex); // Get a random phrase for this ally

        // Set the paragraph text to show the ally's name and phrase
        gameOutputParagraph.innerHTML = `You encounter ${allyName}. They call you: ${randomPhrase}.`;
    }

    // Call the function to output a random ally and phrase (This is techinically called as soon as the user loads the website because of how we
    // loaded in the <Scripts>

    // meetAlly();


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // Introductions which will be used when the user first spawns in.
    // This will be the very start of the game (techinically speaking)
    // The array for now will appear like in chronological order (the bigger it is the more declines the user can do)
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    const gameData = {
        location: "Hobo Camp",
        intro: "After another long nap you wake up to a rumbling belly.",
        action: "A mysterious well-dressed man offers you some food in return for your participation in a deception game.",
        options: [{
                choice: "1. Accept the offer",
                outcome: "You take the food. The man seems trustworthy.",
                continuation: [{
                    action: "The man asks you to lie convincingly about your past.",
                    verbs: {
                        "lie": "You spin a convincing story about being lost royalty. The man nods approvingly.",
                        "truth": "You admit you have nothing to offer. The man frowns and walks away.",
                        "joke": "You tell a ridiculous lie for fun. The man laughs but loses interest in you."
                    }
                }]
            },
            {
                choice: "2. Refuse the offer",
                outcome: "You refuse. The man shrugs and walks away.",
                continuation: [{
                    action: "You stay hungry and start searching for another opportunity.",
                    verbs: {
                        "search": "You look around and find a half-eaten loaf of bread.",
                        "beg": "You ask for help, but people ignore you.",
                        "steal": "You attempt to steal from a vendor, but get caught."
                    }
                }]
            }
        ]
    };

    // User must be displayed the introduction to the game
    function outputIntroduction() {
        addGameMessage(`Location: ${gameData.location}`);
        addGameMessage(gameData.intro);
        addGameMessage(gameData.action);
        gameData.options.forEach(option => addGameMessage(option.choice));
    }

    // Function to handle input for the introduction stage (1 or 2)
    function inputIntroduction(input) {
        input = parseInt(input) - 1; // Convert the input to an index
        let valid = false;

        // loop to get the user's choice
        while (!valid) {
            // Check if input is valid
            if (input >= 0 && input < gameData.options.length) {
                addGameMessage(`${gameData.options[input].choice} selected`);

                // Store the user's choice in gameState
                gameState.chosenOption = input;

                // Output the next action after selecting an option
                let selectedOption = gameData.options[input];
                addGameMessage(selectedOption.outcome);

                // Move to the next stage (verb selection)
                gameState.currentStage = 1;

                // Show the verbs based on the selected option
                selectedOption.continuation.forEach(step => {
                    addGameMessage(step.action);
                    addGameMessage("What will you do next? Choose a verb: lie, truth, joke, etc.");
                });

                valid = true; // Exit loop
            } else {
                addSystemMessage("Invalid choice! Please select '1' or '2'.");
            }
        }
    }

    // Function to handle verb selection
    function inputIntroductionVerb(input) {
        let valid = false;

        // Get the selected option using gameState.chosenOption
        let selectedOption = gameData.options[gameState.chosenOption];

        // Loop through the continuation to check for valid verb
        while (!valid) {
            selectedOption.continuation.forEach(step => {
                if (step.verbs[input]) {
                    addGameMessage(step.verbs[input]); // Output the result of the verb
                    valid = true; // Verb is valid, exit loop
                }
            });

            if (!valid) {
                addSystemMessage("Invalid verb! Please choose a valid verb.");
                input = prompt("Enter a valid verb (lie, truth, joke, etc.):");
            }
        }
    }

    // To track game state (which option the user chose)
    let gameState = {
        currentStage: 0, // Track the user's current stage (0 = introduction, 1 = verb selection)
        chosenOption: null // Track which option the user chose (1 or 2)
    };

    // Example usage (if the user selects '1' for the offer):
    outputIntroduction();




    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // Handling the logic once the user selects a choice.
    // From here should it be random? 
    // Should it trigger events? 
    // In my opinion each of the three 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    // Functions to simulate a GENERAL Allies response To different outcomes, These will be used when user interacts with characters.
    // We could add sounds, personalised responses etc
    // Failure function (Could be extended in literally a thousand ways)

    function failure() {
        gameOutputParagraph.innerHTML = "You failed to recruit the Ally. The Ally is not impressed with your efforts"
    }
    // Successful function
    function successful() {
        gameOutputParagraph.innerHTML = "You successfully recruited the Ally. The Ally is very happy with you !"
    }
    // Abandon function (user quits the recruitment)
    function abandon() {
        gameOutputParagraph.innerHTML = "You decided to leave the Ally."
    }

});