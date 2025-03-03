document.addEventListener('DOMContentLoaded', function() {
    // Menu for the terminal in the game.js screen 

    const gameUserInput = document.getElementById("gameUserInput");
    const gameDiv = document.getElementById("gameBegins");
    gameDiv.style.display = "block";

    if (!gameUserInput || !gameDiv) {
        console.error("Error: gameUserInput or gameDiv not found!");
        return; 
    }

    // Get or create the terminal output container
    const outputTerminal = document.getElementById("output-terminal"); 
    let terminalOutputContainer = outputTerminal.querySelector(".terminal-output-text");

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

            gameUserInput.value = ""; 

            setTimeout(() => {
                if (choice == "Show Inventory") {
                    outputUser(); 
                    scrollToBottom(); 
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
            currentState = 'verbSelection'; 
            inputIntroduction(choice); 
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
        let terminal = document.getElementById("output-terminal");
        setTimeout(() => {
            terminal.scrollTop = terminal.scrollHeight;
        }, 10); // Small delay to ensure content is rendered before scrolling
    }

    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // Type writer effect for the game
    //  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    // declare varabiables (We need an index, the text and the speed)
    var i = 0; 
    var txt = 'A long time ago...'; 
    var speed = 150; 

    function typeWriter() {
        var titleElement = document.getElementById("gameBeginsTitle");
        if (i < txt.length) {
            titleElement.innerHTML += txt.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    typeWriter();

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
        gainedAllies: [ 
            {
                userAllyIndex: 1,
                friendshipLevel: 0.5
            }
        ]
    }]

    // Function to output user details to the terminal
    function outputUser() {
        // Create an instance of a usercharacter (THIS WILL BE DONE ON CREATION OF GAME)
        let userIndex = 0; 
        let user = userCharacter[userIndex];
        let name = user.name;
        let hunger = user.hunger;
        let reputation = user.reputation;

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

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // Introductions which will be used when the user first spawns in.
    // This a dictionary we could have loads of different dictionaries for each of the introductions. In my head this 
    // allows the user to increase reputation for now, we will need different ones for different instances
    // 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    const gameDataArray = [
        {
            location: "War Prison",
            importanceLevel: 0.1,
            intro: "After days of travel, you arrive at the heavily guarded war prison, the place where the Exiled General is kept.",
            action: "A grizzled, battle-hardened figure in chains watches you approach. He gives you a nod, recognizing your intent.",
            options: [{
                    choice: "1. Attempt to infiltrate the prison and break the General out",
                    outcome: "You sneak past the guards and find the Exiled General in a solitary cell. He looks at you with a calculating gaze.",
                    continuation: [{
                        action: "He demands a promise of loyalty before he helps you escape.",
                        verbs: {
                            "swear": {
                                description: "You swear your loyalty to him, and he nods, agreeing to join your cause.",
                                reputationImpact: 5
                            },
                            "negotiate": {
                                description: "You offer him something in return, like an army or resources, and he considers your offer carefully.",
                                reputationImpact: 3
                            },
                            "reject": {
                                description: "You refuse to swear loyalty, and the General eyes you warily before he declines your offer.",
                                reputationImpact: -3
                            }
                        }
                    }]
                },
                {
                    choice: "2. Bribe a guard to free the General",
                    outcome: "You bribe the guard, but it's a risky move. They let the General go, but the escape is noticed.",
                    continuation: [{
                        action: "Now that the General is free, you both must flee the area quickly.",
                        verbs: {
                            "escape": {
                                description: "You make a run for it, dodging guards and escaping into the night.",
                                reputationImpact: 2
                            },
                            "fight": {
                                description: "You engage in a bloody battle with the guards to ensure your escape.",
                                reputationImpact: -1
                            },
                            "negotiate": {
                                description: "You try to convince the guards you were mistaken, but it fails, leading to combat.",
                                reputationImpact: -2
                            }
                        }
                    }]
                }
            ]
        },
        {
            location: "The Slums",
            importanceLevel: 0.1,
            intro: "You wander through the slums, the stench of filth and poverty thick in the air. In the darkest corner of the alley, a figure watches you carefully.",
            action: "The King's Disowned Bastard, a rogue with a sharp tongue and a sharper mind, offers you a chance at a high-stakes deception game.",
            options: [{
                    choice: "1. Accept the challenge to play the deception game",
                    outcome: "You sit across from the rogue, who eyes you with amusement as the game begins.",
                    continuation: [{
                        action: "The game is rigged with subtle psychological tricks. The rogue presents you with an impossible choice.",
                        verbs: {
                            "lie": {
                                description: "You deceive the rogue with a clever, twisted story, and they laugh, impressed by your wit.",
                                reputationImpact: 4
                            },
                            "bluff": {
                                description: "You bluff your way through, but the rogue sees through it and calls you out, offering only a grudging respect.",
                                reputationImpact: -1
                            },
                            "reveal": {
                                description: "You tell the truth, surprising the rogue, who respects your honesty but does not trust you fully.",
                                reputationImpact: 2
                            }
                        }
                    }]
                },
                {
                    choice: "2. Refuse to play the game and leave",
                    outcome: "You walk away, leaving the rogue to ponder your refusal. They eye you with curiosity but do not follow.",
                    continuation: [{
                        action: "You feel the weight of the rogue's gaze as you walk away, but you can't shake the feeling you may have missed an opportunity.",
                        verbs: {
                            "return": {
                                description: "You return to confront the rogue and ask if they still want to play the game.",
                                reputationImpact: 1
                            },
                            "ignore": {
                                description: "You choose to ignore them and head towards your next goal, the rogue's challenge still lingering in your mind.",
                                reputationImpact: -2
                            }
                        }
                    }]
                }
            ]
        },
        {
            location: "Hidden Rebel Camp",
            intro: "You travel through dense forests, finally stumbling upon the hidden rebel camp. The camp is alive with activity, but there's an air of distrust among the rebels.",
            action: "The Underground Rebel Leader, a fiery and passionate figure, eyes you cautiously. They'll test your loyalty and commitment before accepting you as an ally.",
            options: [{
                    choice: "1. Agree to the test of loyalty",
                    outcome: "The leader hands you a dangerous task to prove your dedication: sabotage a royal convoy.",
                    continuation: [{
                        action: "You successfully complete the sabotage, but it costs you dearly. The leader is pleased, but wary of the toll it took on you.",
                        verbs: {
                            "convince": {
                                description: "You convince the leader that you can handle even more dangerous missions.",
                                reputationImpact: 3
                            },
                            "regret": {
                                description: "You regret the task, and the leader senses your doubt, questioning your resolve.",
                                reputationImpact: -2
                            },
                            "celebrate": {
                                description: "You celebrate your success, hoping to win the leader's trust, but it feels hollow.",
                                reputationImpact: 1
                            }
                        }
                    }]
                },
                {
                    choice: "2. Refuse the test and leave",
                    outcome: "You decide not to risk your life for a cause you barely know, turning your back on the rebels.",
                    continuation: [{
                        action: "The leader lets you go, but there's a glint of disappointment in their eyes. You may have made an enemy.",
                        verbs: {
                            "stay": {
                                description: "You stay, despite your reservations, hoping to change your mind.",
                                reputationImpact: 2
                            },
                            "escape": {
                                description: "You slip away into the night, disappearing from the camp to seek your own path.",
                                reputationImpact: -3
                            }
                        }
                    }]
                }
            ]
        }
    ];
    
    // To track game state (which option the user chose)
    let gameState = {
        currentStage: 0, 
        chosenOption: null,
        currentScenario: null
    };

    // Pick a random game data dictionary
    function randomGameData() {
        const randomIndex = Math.floor(Math.random() * gameDataArray.length);
        return gameDataArray[randomIndex];
    }

    // User must be displayed the introduction to the game
    function outputIntroduction() {
        const selectedGameData = randomGameData();
        gameState.currentScenario = selectedGameData; // Store the selected scenario
        
        addGameMessage(`Location: ${selectedGameData.location}`);
        addGameMessage(selectedGameData.intro);
        addGameMessage(selectedGameData.action);
        selectedGameData.options.forEach(option => addGameMessage(option.choice));
    }
    
    // Call the introduction
    outputIntroduction();

    function inputIntroduction(input) {
        const optionIndex = parseInt(input) - 1; 
    
        if (optionIndex === 0 || optionIndex === 1) {
            let selectedOption = gameState.currentScenario.options[optionIndex];
            gameState.chosenOption = optionIndex;
            
            addGameMessage(selectedOption.outcome);
            
            // Display the continuation action
            if (selectedOption.continuation && selectedOption.continuation.length > 0) {
                addGameMessage(selectedOption.continuation[0].action);
                
                // Display available verbs to the user
                if (selectedOption.continuation[0].verbs) {
                    const availableVerbs = Object.keys(selectedOption.continuation[0].verbs);
                    addGameMessage(`Available actions: ${availableVerbs.join(', ')}`);
                }
            }
        } else {
            addSystemMessage("Invalid choice! Please select option 1 or 2.");
        }
    }

    function handleVerbSelection(verb) {
        if (!gameState.currentScenario) {
            addSystemMessage("Error: No game scenario selected. Please start again.");
            return;
        }
        
        const selectedOption = gameState.currentScenario.options[gameState.chosenOption];
        
        // Check if the verb exists in the current continuation
        if (selectedOption.continuation && 
            selectedOption.continuation[0] && 
            selectedOption.continuation[0].verbs && 
            selectedOption.continuation[0].verbs[verb]) {
            
            // Display the verb outcome
            addGameMessage(selectedOption.continuation[0].verbs[verb].description);
            // Now we need to pass in the users verb and find whether what they done increases repuation
            if(selectedOption.continuation[0].verbs[verb].reputationImpact > 0){increaseReputation(selectedOption.continuation[0].verbs[verb].reputationImpact)}
            else{decreaseReputation(selectedOption.continuation[0].verbs[verb].reputationImpact)}

            currentState = 'introduction'; 
            
        } else {
            addSystemMessage(`Invalid action! Available actions: ${Object.keys(selectedOption.continuation[0].verbs).join(', ')}`);
        }
    }

    // We can now display from the above code show inventory, a random event selected from numbers and a verb displayed.
    // Now we will want to delve a bit deeper into the story line, In my head the user will be given one option from them three for now
    // The user will then be rewarded if they pass or fail through reputation

    function increaseReputation(taskRep) {
        let rep = userCharacter[0].reputation;
        let increaseAmount = 0.01 * taskRep; 
    
        if (rep >= 0.9 && rep < 0.975) {
            rep = Math.min(1.0, rep + increaseAmount / 2); 
        } else if (rep < 0.9) {
            rep = Math.min(1.0, rep + increaseAmount); 
        }
        userCharacter[0].reputation = rep;

        addGameMessage(`Your reputation has increased by ${taskRep} it is now ${userCharacter[0].reputation}`)
    }

    // Allow the decrease of importance if neccessary
    function decreaseReputation(taskRep) {
        let rep = userCharacter[0].reputation;
        let decreaseAmount = 0.01 * taskRep;
    
        if (rep > 0.025 && rep <= 0.1) {
            rep = Math.max(0.0, rep - decreaseAmount / 2); 
        } else if (rep > 0.1) {
            rep = Math.max(0.0, rep - decreaseAmount);  
        }
        userCharacter[0].reputation = rep;
        addGameMessage(`Your reputation has decreased by ${taskRep} it is now ${userCharacter[0].reputation}`)
    }

    // So now that the user can follow through with one part of the game and repuatation in my head we should have two small encounters before meeting an ally


});