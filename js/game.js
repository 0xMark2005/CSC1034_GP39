import * as Terminal from "./terminal.js";

const systemMessageColor = `#FF81811`;
const gameMessageColor = `#00FF00`;

document.addEventListener('DOMContentLoaded', function() {

    //Initialize the terminal
    Terminal.initialize();
    const gameUserInput = document.getElementById("user-input"); //needed for the keypress event

    let currentState = 'introduction'; // Track the current game state
    let usedAllies = []; // To track during the game add allies to the array to ensure user only selects one ally if that makes sense.
    // Detect when the user presses Enter
    gameUserInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            //get the user's input
            const choice = Terminal.getUserInput();

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

    

    // Function to handle user choice during the introduction stage
    function handleIntroduction(choice) {
        if (choice === "1" || choice === "2") {
            // User chose an option (1 or 2)
            currentState = 'verbSelection'; 
            inputIntroduction(choice); 
        } else {
            Terminal.outputMessage("Invalid choice! Please choose '1' or '2'.", systemMessageColor);
        }
    }

    // Function to handle the verb selection after the introduction stage
    function handleVerbSelection(choice) {
        inputIntroductionVerb(choice); // Assuming inputIntroductionVerb is properly defined elsewhere
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

    // **************************************************************************
    // Start of Game code & logic
    // NO USE of chat gpt for game, to prevent it from becoming too complex
    // Outline of game used
    // https://docs.google.com/document/d/10vEChyI5rYxC-jqJ5iqyOHsHxPu-rPtpbLo5ev2xXbg/edit?pli=1&tab=t.0
    // **************************************************************************

    // To track game state (pretty much used for the menu of game)
    let gameState = {
        currentStage: 0, 
        chosenOption: null,
        currentScenario: null,
        currentObject: null
    };

    // ACT 1: Gathering the revolutionaries
    // Village is burning so main character required to find allies.
    // I am not sure whether we want to store the potential allies locally or through database.
    // For now it will be locally. In Arrays

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Introductions which will be used when the user first spawns in.
    // I changed these to be more generic so these could potentially tie into saving an ally?
    // Since they are so generic I think we could allow the user to complete all three of these? 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    const introPartOne = [
        {
            gameID: 1,
            location: "Quiet Village",
            completed: false,
            importanceLevel: 0.05,
            intro: "You arrive at a small, peaceful village. People go about their daily routines, and the air smells of fresh bread.",
            action: "A young boy approaches you, looking lost and anxious.",
            options: [
                {
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
                                description: "You suggest he ask someone else for help. He hesitates, but thanks you and walks away.",
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
            gameID: 2,
            location: "Forest Path",
            completed: false,
            importanceLevel: 0.05,
            intro: "You walk along a quiet, winding forest path. The sounds of nature are calming, and the sunlight filters through the trees.",
            action: "You spot an elderly woman sitting by the side of the path, knitting something by hand.",
            options: [
                {
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
        },
        {
            gameID: 3,
            location: "Town Square",
            completed: false,
            importanceLevel: 0.05,
            intro: "You stroll through the bustling town square, the market stalls full of vibrant goods and people haggling.",
            action: "A street performer plays a lute, and a small crowd gathers to watch.",
            options: [
                {
                    choice: "1. Watch the performance",
                    outcome: "You pause to enjoy the music. It’s light and cheerful, and you find yourself tapping your feet.",
                    continuation: [{
                        action: "The performer notices your interest and nods in your direction.",
                        verbs: {
                            "clap": {
                                description: "You clap along with the crowd, encouraging the performer. They give you a grateful smile.",
                            reputationImpact: 1
                            },
                            "leave": {
                                description: "You decide to move on, uninterested in the performance. The performer continues without noticing.",
                                reputationImpact: 0
                            },
                            "ignore": {
                                description: "You ignore the performance and continue your walk, the music fading behind you.",
                                reputationImpact: -1
                            }
                        }
                    }]
                },
                {
                    choice: "2. Walk past the performer without stopping",
                    outcome: "You pass the performer, who doesn't seem to mind or acknowledge your lack of attention.",
                    continuation: [{
                        action: "The town square is filled with activity, and you quickly lose track of the performer’s song.",
                        verbs: {
                            "lookBack": {
                                description: "You glance back over your shoulder, wondering if you missed something special, but the performer is still playing.",
                                reputationImpact: 0
                            },
                            "continue": {
                                description: "You keep walking, knowing there's no time to waste on idle distractions.",
                                reputationImpact: 0
                            }
                        }
                    }]
                }
            ]
        }
    ];

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Smaller sub stories which will allow the user to meet the kings disowned bastard
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    const introPartTwo = [
        {
            gameID: 1,
            location: "The Slums",
            completed: false,
            importanceLevel: 0.1,
            intro: "You find yourself in the heart of the slums, where narrow alleys twist and turn, and the air smells of damp stone and food scraps. The people here seem worn down by life, but there's a spark of defiance in their eyes.",
            action: "A rough-looking man approaches you. He eyes you up and down before speaking.",
            options: [
                {
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
            options: [
                {
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

    const introPartThree = [
      {
          gameID: 1,
          location: "War Prison",
          completed: false,
          importanceLevel: 0.1,
          intro: "You find a War Prison. Characters here can be sketchy, however you find a man who you recognise. He was once a great army general for the King.",
          action: "The man intrigues you, but you think for what reason was he exiled, what do you do? Should you talk to him or shy away from the oportunity",
          options: [
              {
                  choice: "1. Introduce yourself to the man.",
                  outcome: "He is pleased to meet you, but you notice he is skeptical of why you approached him.",
                  continuation: [{
                      action: "He tells you his story of how he was exiled. He tells you he wants to escape. Due to his hatred for the King should you help him in hopes of gaining his trust?",
                      verbs: {
                          "help": {
                              description: "You decide to help the general escape. He could be valuable to your cause",
                              reputationImpact: 1
                          },
                          "ignore": {
                              description: "You tell him you're not interested, but the general looks disapointed, muttering something about a wasted opportunity.",
                              reputationImpact: 0
                          }
                      }
                  }]
              },
              {
                  choice: "2. Ignore him and keep walking",
                  outcome: "You decide to leave the general and keep walking. You notice a group of men and women that intrigue you.",
                  continuation: [{
                      action: "You approach the group and they tell you about their plan to escape and ask you whether you know anyone on the inside who would be interested. Should you accept their help and go back for the general, help them escape and ask about their story, or ignore them as well.",
                      verbs: {
                          "accept": {
                              description: "You successfully escape with the exiled general, you've found the easiest path to help the general.",
                              reputationImpact: 2
                          },
                          "help": {
                              description: "You help the group escape by distracting the guard. You meet up with them once the escape is done and listen to their story.",
                              reputationImpact: 2
                          },
                          "ignore": {
                              description: "You ignore them to and have left with nothing. Perhaps this was the best option or perhaps it was a missed opportunity like the general said.",
                              reputationImpact: 0
                          }
                      }
                  }]
              }
          ]
      }
      
  ];

  const firstMain = [
  {
    gameID :1,
    location : "King's Castle",
    completed : false,
    importanceLevel : 0.4,
    intro: "You walk near the Kings castle, you notice a guard standing by the gates. You think of an idea to try and deceive the guard to join you",
    action: "The guard a traditionally loyal character, could be a valuable asset to your plan. Test your cunning and whit in your attempt to win the guards loyalty. He could become a valuable asset",
          options: [{
                  choice: "1. Tell the guard about your plan with the revolutionaries.",
                  outcome: "The guard wants to test your commitment to the cause and tell him where the Hidden Rebel Base is.",
                  continuation: [{
                      action: "You have to decide what to do, can you trust the guard or would you backaway? Could you lie to him and tell him where an old Rebel Base used to be?.",
                      verbs: {
                          "trust": {
                              description: "You recruit the guard and he decided to swear an oath of loyalty to your cause.",
                              reputationImpact: 4
                          },
                          "backaway": {
                              description: "You fail to recruit the guard, perhaps you could have trusted him. This could affect your plan greatly.",
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
                  outcome: "The guard agrees, but for what reason?.",
                  continuation: [{
                      action: "The guard cannot be trusted as of yet so you have to decide what to do, shall you meet him at the location and trust that he comes alone or will you bring backup and sting the meetup incase he does the same.",
                      verbs: {
                          "trust": {
                              description: "You trust him and meet him at the location. He does not come alone and you must decide whether to flee or to stay.",
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
        }
];

    

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Allow the user to travel to the castle
    // This a dictionary we could have loads of different dictionaries for each of the introductions. In my head this 
    // allows the user to increase reputation for now, we will need different ones for different instances
    // 
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    




    


    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    // The user's characters array, with multiple discussions done this can be changed at anytime
    // This should be saved to the database as well I think
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    var userCharacter = [{
        name: "Will be loaded from db",
        hunger: 0.4,
        reputation: 0.6,
        inventory: [
            {
                name: "Sword",
                durability: 1.0,
                strength: 2.5 // Significantly increased strength
            },
            {
                name: "Shield",
                durability: 1.0,
                strength: 1.5 // Increased strength as it's defensive but still useful
            },
            {
                name: "Potion",
                durability: 1.0,
                strength: 1.0 // Potions now have some attack value
            }
        ],
        gainedAllies: [
            {
                allyName: "Kings Disowned Bastard",
                friendshipLevel: 0.5,
                strength: 3.0, // Increased strength
                defense: 1.0,
                health: 50,
                maxHealth: 50,
                assignedItem: { name: "Potion", durability: 1.0, strength: 1.0 },
                isDefending: false
            },
            {
                allyName: "General Grievous",
                friendshipLevel: 0.5,
                strength: 4.0, // Increased strength
                defense: 1.2,
                health: 45,
                maxHealth: 45,
                assignedItem: { name: "Sword", durability: 1.0, strength: 2.5 },
                isDefending: false
            },
            {
                allyName: "Obe Wan Kenboi",
                friendshipLevel: 0.5,
                strength: 3.5, // Increased strength
                defense: 1.5,
                health: 55,
                maxHealth: 55,
                assignedItem: { name: "Shield", durability: 1.0, strength: 1.5 },
                isDefending: false
            }
        ]
    }];
    
    // Make sure enemies have reasonable stats too
    var enemies = [
        {
            name: "Dark Knight",
            health: 100,
            maxHealth: 100,
            strength: 3.0,
            defense: 1.5, // Reduced defense to allow damage to get through
            description: "A fearsome knight clad in dark armor."
        }
    ];

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
        Terminal.outputMessage(nameText, gameMessageColor);

        // Output hunger
        hungerText = `> Hunger: ${hunger}`;
        Terminal.outputMessage(hungerText, gameMessageColor);

        // Output Reputation
        reputationText = `> Reputation: ${reputation}`;
        Terminal.outputMessage(reputationText, gameMessageColor);


        // Will not output inventory as conflicts with Josephs designs

        // Output the gained allies

        Terminal.outputMessage(`> Gained Allies`, gameMessageColor);
        user.gainedAllies.forEach(ally => {
            // Display each ally's name and friendship level
            let allyName = allies[ally.userAllyIndex].name;

            Terminal.outputMessage(`> Ally Name: ${allyName} | Friendship Level: ${ally.friendshipLevel.toFixed(2)}`, gameMessageColor);
        });
    }


    // Pick a random game
    let firstMainCompleted = false; // Flag to track if a scenario from introPartTwo has been used
    

    function randomGameData() {
        if (gameState.currentObject === firstMain && firstMainCompleted) {
            return null; 
        }

        const incompleteGames = gameState.currentObject.filter(game => !game.completed);
        if (incompleteGames.length === 0) {
            return null; // No incomplete games left
        }
        const randomIndex = Math.floor(Math.random() * incompleteGames.length);
        return incompleteGames[randomIndex];
    }

    

    // User must be displayed the introduction to the game
    function outputIntroduction() {
        const selectedGameData = randomGameData();
        if (!selectedGameData) {
            Terminal.outputMessage("No more scenarios available.", systemMessageColor);
            if (gameState.currentObject === firstMain) {
                firstMainCompleted = true;
                wordScrambleGame();
            }
            return;
        }
        gameState.currentScenario = selectedGameData; // Store the selected scenario
        
        Terminal.outputMessage(`Location: ${selectedGameData.location}`, gameMessageColor);
        Terminal.outputMessage(selectedGameData.intro, gameMessageColor);
        Terminal.outputMessage(selectedGameData.action, gameMessageColor);
        selectedGameData.options.forEach(option => Terminal.outputMessage(option.choice, gameMessageColor));

        // Mark introPartTwo as completed if a scenario from it is used
        if (gameState.currentObject === firstMain) {
            firstMainCompleted = true;
        }
    }
    
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

    function handleVerbSelection(verb) {
        const selectedOption = gameState.currentScenario.options[gameState.chosenOption];
    
        // Ensure the verb exists in the current option's continuation
        const verbObject = selectedOption.continuation?.[0]?.verbs?.[verb];
    
        if (verbObject) {
            // Display the verb's description
            Terminal.outputMessage(verbObject.description, gameMessageColor);
            if (verbObject.reputationImpact > 0) {
                increaseReputation(verbObject.reputationImpact);
            } else {
                decreaseReputation(verbObject.reputationImpact);
            }

            const gameID = gameState.currentScenario.gameID;

            // Mark the game as completed
            markGameAsCompleted(gameID);
            checkFollowUp(selectedOption, verb);
            checkFollowUp2(selectedOption, verb);
            checkFollowUp3(selectedOption, verb);
            currentState = 'introduction'; 

        } else {
            Terminal.outputMessage(`Invalid action! Available actions: ${Object.keys(selectedOption.continuation?.[0]?.verbs || {}).join(', ')}`, systemMessageColor);
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
        let percentage = userCharacter[0].reputation * 100;
        Terminal.outputMessage(`Your reputation has increased by ${taskRep} it is now ${percentage}%`, gameMessageColor)
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
        let percentage = userCharacter[0].reputation * 100;
        Terminal.outputMessage(`Your reputation has decreased by ${taskRep} it is now ${percentage}%`, gameMessageColor)
    }

    // So now that the user can follow through with one part of the game and repuatation in my head we should have two other small encounters before meeting an ally
    // make another game data array with different encounters which relate to previous ones

    let introPartTwoCompleted = false;

    function checkFollowUp(selectedOption, verbSelected) {
        if (selectedOption.continuation && selectedOption.continuation[0] && selectedOption.continuation[0].verbs) {
            const verbs = selectedOption.continuation[0].verbs;
            
            let verbFound = false;  
            for (let verb in verbs) {
                if (verb === verbSelected) {
                    console.log(`Verb '${verbSelected}' found and ready to use.`);
                    verbFound = true;

                    const followUp = verbs[verb].followUp;
                    console.log(`Follow-up value for verb '${verbSelected}': ${followUp}`);

                    // Now we want to make the user move over to the next object with more tasks
                    findIncompleteGame();
                    break;  
                }
            }
            
            if (!verbFound) {
                console.log(`Verb '${verbSelected}' not found, restart game big error.`);
            }
        } else {
            console.log("Error: No verbs available for this action.");
        }
    }

    // We want the user to be able to complete the tasks in any order but should complete all three of the IntroPartOne
    function findIncompleteGame() {
        const availableGames = gameState.currentObject.filter(game => !game.completed);

        if (availableGames.length > 0) {
            // Move to the next available game based on the order or random selection
            const nextGameIndex = Math.floor(Math.random() * availableGames.length);
            console.log(`Moving to the next game: Game ${availableGames[nextGameIndex].gameID}`);
            gameState.currentScenario = availableGames[nextGameIndex];
            outputIntroduction();
        } else {
            console.log("No incomplete games left, so now we need to move the user to across to a new object");
            if (gameState.currentObject === introPartOne) {
                gameState.currentObject = introPartTwo;
                findIncompleteGame(); // Call the function again to start the next part
            } else if (gameState.currentObject === introPartTwo) {
                if (!introPartTwoCompleted) {
                    introPartTwoCompleted = true;
                    
                }
            }
        }
    }

    function checkFollowUp2(selectedOption, verbSelected) {
      if (selectedOption.continuation && selectedOption.continuation[0] && selectedOption.continuation[0].verbs) {
          const verbs = selectedOption.continuation[0].verbs;
          
          let verbFound = false;  
          for (let verb in verbs) {
              if (verb === verbSelected) {
                  console.log(`Verb '${verbSelected}' found and ready to use.`);
                  verbFound = true;

                  const followUp = verbs[verb].followUp;
                  console.log(`Follow-up value for verb '${verbSelected}': ${followUp}`);

                  // Now we want to make the user move over to the next object with more tasks
                  findIncompleteGame2();
                  break;  
              }
          }
          
          if (!verbFound) {
              console.log(`Verb '${verbSelected}' not found, restart game big error.`);
          }
      } else {
          console.log("Error: No verbs available for this action.");
      }
  }

  let introPartThreeoCompleted = false;
  // We want the user to be able to complete the tasks in any order but should complete all three of the IntroPartOne
  function findIncompleteGame2() {
      const availableGames = gameState.currentObject.filter(game => !game.completed);

      if (availableGames.length > 0) {
          // Move to the next available game based on the order or random selection
          const nextGameIndex = Math.floor(Math.random() * availableGames.length);
          console.log(`Moving to the next game: Game ${availableGames[nextGameIndex].gameID}`);
          gameState.currentScenario = availableGames[nextGameIndex];
          outputIntroduction();
      } else {
          console.log("No incomplete games left, so now we need to move the user to across to a new object");
          if (gameState.currentObject === introPartTwo) {
              gameState.currentObject = introPartThree;
              findIncompleteGame2(); // Call the function again to start the next part
          } else if (gameState.currentObject === introPartThree) {
              if (!introPartThreeoCompleted) {
                  introPartThreeoCompleted = true;
                  wordScrambleGame();
              }
          }
      }
  }

  function checkFollowUp3(selectedOption, verbSelected) {
    if (selectedOption.continuation && selectedOption.continuation[0] && selectedOption.continuation[0].verbs) {
        const verbs = selectedOption.continuation[0].verbs;
        
        let verbFound = false;  
        for (let verb in verbs) {
            if (verb === verbSelected) {
                console.log(`Verb '${verbSelected}' found and ready to use.`);
                verbFound = true;

                const followUp = verbs[verb].followUp;
                console.log(`Follow-up value for verb '${verbSelected}': ${followUp}`);

                // Now we want to make the user move over to the next object with more tasks
                findIncompleteGame3();
                break;  
            }
        }
        
        if (!verbFound) {
            console.log(`Verb '${verbSelected}' not found, restart game big error.`);
        }
    } else {
        console.log("Error: No verbs available for this action.");
    }
}

// We want the user to be able to complete the tasks in any order but should complete all three of the IntroPartOne
function findIncompleteGame3() {
    const availableGames = gameState.currentObject.filter(game => !game.completed);

    if (availableGames.length > 0) {
        // Move to the next available game based on the order or random selection
        const nextGameIndex = Math.floor(Math.random() * availableGames.length);
        console.log(`Moving to the next game: Game ${availableGames[nextGameIndex].gameID}`);
        gameState.currentScenario = availableGames[nextGameIndex];
        outputIntroduction();
    } else {
        console.log("No incomplete games left, so now we need to move the user to across to a new object");
        if (gameState.currentObject === introPartThree) {
            gameState.currentObject = firstMain;
            findIncompleteGame3(); // Call the function again to start the next part
        } else if (gameState.currentObject === firstMain) {
            if (!firstMainCompleted) {
                firstMainCompleted = true;
                
            }
        }
    }
}

    function markGameAsCompleted(gameID) {
        console.log("Attempting to mark a game as completed");
        for (let i = 0; i < gameState.currentObject.length; i++) {
            if (gameState.currentObject[i].gameID === gameID) {
                gameState.currentObject[i].completed = true;
                console.log(`Game with gameID ${gameID} marked as completed.`);
                return;
            }
        }
        console.log(`Game with gameID ${gameID} not found.`);
    }

    function wordScrambleGame() {
        const wordScrambleElement = document.getElementById("wordScramble");
        if (wordScrambleElement) {
            wordScrambleElement.style.display = "block";
        } else {
            console.error("wordScramble element not found");
            return;
        }


        let words = [
            {
                word: "addition",
                hint: "The process of adding numbers"
            },
            {
                word: "meeting",
                hint: "Event in which people come together"
            }
        ];

        const wordText = document.querySelector(".word"),
            hintText = document.querySelector(".hint span"),
            timeText = document.querySelector(".time b"),
            inputField = document.querySelector("input"),
            refreshBtn = document.querySelector(".refresh-word"),
            checkBtn = document.querySelector(".check-word");

        let correctWord, timer;

        const initTimer = maxTime => {
            clearInterval(timer);
            timer = setInterval(() => {
                if (maxTime > 0) {
                    maxTime--;
                    return timeText.innerText = maxTime;
                }
                alert(`Time off! ${correctWord.toUpperCase()} was the correct word`);
                initGame();
            }, 1000);
        };

        const initGame = () => {
            initTimer(30);
            let randomObj = words[Math.floor(Math.random() * words.length)];
            let wordArray = randomObj.word.split("");
            for (let i = wordArray.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
            }
            wordText.innerText = wordArray.join("");
            hintText.innerText = randomObj.hint;
            correctWord = randomObj.word.toLowerCase();
            inputField.value = "";
            inputField.setAttribute("maxlength", correctWord.length);
        };

        initGame();

        const checkWord = () => {
            let userWord = inputField.value.toLowerCase();
            if (!userWord) return console.log("Please enter the word to check!");
            if (userWord !== correctWord) return console.log(`Oops! ${userWord} is not a correct word`);
            console.log(`Congrats! ${correctWord.toUpperCase()} is the correct word`);
            initGame();
        };

        refreshBtn.addEventListener("click", initGame);
        checkBtn.addEventListener("click", checkWord);
    }
    
    // Call the introduction / game starts
    gameState.currentObject = firstMain;
    outputIntroduction();

    // The beginning of the battle game
    function gameBattle(initiator, enemy) {
      console.log("Beginning battle game");
      if (initiator == 0) {
          // User is the initiator
          console.log("User is the initiator");
          Terminal.outputMessage(`You have initiated a battle against ${enemies[0].name}`, systemMessageColor);
          // Output all of the available allies the user can select from
          Terminal.outputMessage("Select an ally to use in the battle:", systemMessageColor);
          // Output the user's allies
          for (let i = 0; i < userCharacter[0].gainedAllies.length; i++) {
              Terminal.outputMessage(`${i}. ${userCharacter[0].gainedAllies[i].allyName}`, systemMessageColor);
          }
          console.log("Users ally has been selected");
          // Change the menu system to facilitate the user selecting an ally
          currentState = 'gameBattle';
      }
  }
      gameBattle(0, enemies[0]);
  
      function handleBattle(choice) {
          // Check if the user has selected a valid ally
          if (choice >= 0 && choice < userCharacter[0].gainedAllies.length) {
              // User has selected a valid ally
              const selectedAlly = userCharacter[0].gainedAllies[choice];
              if (usedAllies.includes(selectedAlly)) {
                  Terminal.outputMessage(`${selectedAlly.allyName} has already been used this round. Select another ally.`, systemMessageColor);
                  return;
              }
              usedAllies.push(selectedAlly);
              Terminal.outputMessage(`You have selected ${selectedAlly.allyName}`, gameMessageColor);
              console.log(`You have selected ${selectedAlly.allyName}`);
  
              // Ask the user what they would like to do with their ally
              Terminal.outputMessage("What would you like to do with this ally?", systemMessageColor);
              Terminal.outputMessage("1. Attack", systemMessageColor);
              Terminal.outputMessage("2. Defend", systemMessageColor);
              Terminal.outputMessage("3. Heal an ally", systemMessageColor);
  
              currentState = 'allyAction';
              gameState.selectedAlly = selectedAlly; // Store the selected ally in the game state
          } else {
              Terminal.outputMessage("Invalid choice! Please select a valid ally number.", systemMessageColor);
          }
      }
  
      // Allow the user to be able to select each of the allies and pass in what they would like to do with each ally 
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
  
          // Check if all allies have had their turn
          if (usedAllies.length === userCharacter[0].gainedAllies.length) {
              // All allies have had their turn, now it's the enemy's turn
              simulateEnemyTurn();
              // Reset used allies for the next round
              usedAllies = [];
          } else {
              // Prompt the user to select the next ally
              Terminal.outputMessage("Select the next ally to use in the battle:", systemMessageColor);
              for (let i = 0; i < userCharacter[0].gainedAllies.length; i++) {
                  if (!usedAllies.includes(userCharacter[0].gainedAllies[i])) {
                      Terminal.outputMessage(`${i}. ${userCharacter[0].gainedAllies[i].allyName}`, systemMessageColor);
                  }
              }
              currentState = 'gameBattle';
          }
      }
      function simulateAttack(ally) {
          // Fix the attack logic here
          let baseAttackPower = ally.strength * ally.assignedItem.strength;
          
          console.log(`Base attack power: ${ally.strength} * ${ally.assignedItem.strength} = ${baseAttackPower}`);
      
          let enemy = enemies[0]; 
          
          // Calculate damage by subtracting enemy defense from attack power
          // Ensure a minimum damage of at least 10% of base attack power idk any other logic for this
  
          let damage = Math.max(baseAttackPower * 5, baseAttackPower - enemy.defense);
          
          console.log(`Effective damage after considering enemy's defense (${enemy.defense}): ${damage}`);
      
          // Output the result of the attack
          Terminal.outputMessage(`${ally.allyName} attacks ${enemy.name} with ${damage.toFixed(1)} damage!`, gameMessageColor);
      
          // Reduce enemy's health by the calculated damage
          enemy.health -= damage;
          console.log(`Enemy's remaining health: ${enemy.health.toFixed(2)}`);
      
          // Check if the enemy is defeated
          if (enemy.health <= 0) {
              Terminal.outputMessage(`${enemy.name} is defeated!`, gameMessageColor);
              checkBattleOutcome();
          } else {
              Terminal.outputMessage(`${enemy.name} has ${enemy.health.toFixed(2)} health remaining.`, gameMessageColor);
          }
      }
      
      
      function startNewRound() {
          // Reset used allies for the next round
          usedAllies = [];
          
          // Prompt the user to select the next ally
          Terminal.outputMessage("--- New Round ---", gameMessageColor);
          Terminal.outputMessage("Select an ally to use in the battle:", systemMessageColor);
          for (let i = 0; i < userCharacter[0].gainedAllies.length; i++) {
              Terminal.outputMessage(`${i}. ${userCharacter[0].gainedAllies[i].allyName}`, systemMessageColor);
          }
          currentState = 'gameBattle';
      }
      
      function checkBattleOutcome() {
          // Check if the battle is over
          let enemy = enemies[0];
          
          if (enemy.health <= 0) {
              Terminal.outputMessage("You have defeated the enemy!", gameMessageColor);
              currentState = 'introduction'; // Reset to introduction state after battle
              return true; // Battle is over
          } else if (userCharacter[0].gainedAllies.every(ally => ally.health <= 0)) {
              Terminal.outputMessage("All your allies have been defeated!", systemMessageColor);
              currentState = 'introduction'; // Reset to introduction state after battle
              return true; // Battle is over
          }
          
          return false; // Battle continues
      }
  
      function simulateDefense(ally) {
          Terminal.outputMessage(`${ally.allyName} is defending!`, gameMessageColor);
          console.log(`${ally.allyName} is defending`);
      
          // Set a defending flag on the ally
          ally.isDefending = true;
      
          // Increase defense while in defensive stance
          ally.defense += 10;  // You can tweak this value for the defensive boost
      
          Terminal.outputMessage(`${ally.allyName} raises their guard and is protected from the next enemy attack!`, gameMessageColor);
      }
  
      
      
      function simulateEnemyTurn() {
          // Implement the enemy's turn logic here
          Terminal.outputMessage("The enemy is attacking!", systemMessageColor);
      
          let enemy = enemies[0];
      
          // Loop through each ally and randomly decide if the enemy attacks them
          userCharacter[0].gainedAllies.forEach(ally => {
              // If the ally is defending, reduce the damage by a factor (e.g., 50% less damage)
              let damageReduction = ally.isDefending ? 0.5 : 1.0;
      
              // Randomly determine if the ally will be attacked
              if (Math.random() < 0.75) { // 75% chance to attack each ally
                  // Calculate enemy damage with a minimum damage floor
                  let enemyAttackPower = enemy.strength || 2; // Default to 2 if strength is not defined
                  let enemyDamage = Math.max(enemyAttackPower * 0.1, enemyAttackPower - ally.defense);
      
                  // Apply damage reduction if the ally is defending
                  enemyDamage *= damageReduction;
  
                  // Introduce a dodge chance for the ally
                  let dodgeChance = 0.2; // 20% chance to dodge
                  if (Math.random() < dodgeChance) {
                      Terminal.outputMessage(`${ally.allyName} dodged the enemy's attack!`, systemMessageColor);
                  } else {
                      ally.health -= enemyDamage; // Apply damage
      
                      // Output the result of the enemy's attack
                      Terminal.outputMessage(`${ally.allyName} was attacked by the enemy for ${enemyDamage.toFixed(1)} damage! Health remaining: ${Math.max(0, ally.health).toFixed(1)}`, systemMessageColor);
      
                      // Reset the ally's defense after being attacked (optional based on your game design)
                      if (ally.isDefending) {
                          ally.isDefending = false;
                          ally.defense -= 10;  // Revert defense boost after the attack
                      }
                  }
              } else {
                  Terminal.outputMessage(`${ally.allyName} dodged the enemy's attack!`, systemMessageColor);
              }
          });
      
          // Check if battle is over
          if (checkBattleOutcome()) {
              // Battle is over, no need to continue
              return;
          }
      
          // Start the next round by allowing the player to select allies again
          startNewRound();
      }
      
  
      function simulateHealing(ally) {
          // Implement the healing logic here
          Terminal.outputMessage(`${ally.allyName} heals an ally!`, gameMessageColor);
          // Example: Heal a random ally
          const randomAlly = userCharacter[0].gainedAllies[Math.floor(Math.random() * userCharacter[0].gainedAllies.length)];
          randomAlly.health = Math.min(randomAlly.maxHealth, randomAlly.health + 20);
      }


});