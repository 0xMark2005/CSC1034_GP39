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
                    // Although can still be added and manipulate this
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
                "The villagers desperately pleaded for a reduction to the tax as it would mean they wouldn't be able to afford various things needed for their survival such as firewood and bread,"+
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
        const prisonData = [
          {
            gameID: 1,
            location: "Capital Prison",
            completed: false,
            importanceLevel: 0.8,
            intro: "Capital Prison is a nightmare, a crumbling fortress of despair. The air reeks of sweat, blood, and fear. Guards rule with brutal authority, "+
            "their cruelty unchecked. Prisoners are pushed to the brink—starved, tortured, and left to rot in overcrowded cells. The walls echo with the sound of violence as inmates, driven to madness, "+
            "plot their revenge. Tensions have reached a boiling point. A rebellion is in the making, and the entire prison is on the verge of erupting.",
            action: "You stand in the midst of chaos as the prison erupts into violence. Prisoners are rallying together, and the guards are struggling to maintain control.",
            options: [
              {
                choice: "1. Join the riot",
                outcome: "You decide to join the prisoners in their rebellion against the guards. The risk is high, but you gain allies in the process.",
                continuation: [
                  {
                    action: "The guards begin to retaliate fiercely, and the situation grows more dangerous by the minute.",
                    verbs: {
                      "fight": {
                        description: "You fight valiantly but are eventually overpowered. The rebellion fails, and you are placed in solitary confinement.",
                        reputationImpact: -15,
                        // So user gains an ally, We should call an function in the corresponding methods when this scenario occurs

                      }
                    }
                  }
                ]
              },
              {
                choice: "2. Stay neutral",
                outcome: "You decide to avoid taking sides, staying out of the conflict in hopes of staying unnoticed. However, you risk losing a chance to escape if the riot succeeds.",
                continuation: [
                  {
                    action: "As the fighting escalates, you begin to question whether staying neutral was the right choice.",
                    verbs: {
                      "wait": {
                        description: "You wait in your cell as the situation unfolds, hoping for the right moment to escape.",
                        reputationImpact: 0
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            gameID: 2,
            location: "The Prison",
            completed: false,
            importanceLevel: 0.3,
            intro: "You find yourself locked in a grimy prison cell, sentenced to life for the crime of survival. Guards patrol the halls, tormenting prisoners for amusement.",
            action: "One night, a guard falls asleep near your cell, his keys dangling from his belt just out of reach.",
            options: [
              {
                choice: "1. Reach for the keys",
                outcome: "As you grab for them, the keys fall, waking the guard. You are caught and sentenced to execution.",
                continuation: [
                  {
                    action: "There is no escape this time.",
                    verbs: {
                      "game over": {
                        description: "Your journey ends here.",
                        reputationImpact: -10
                      }
                    }
                  }
                ]
              },
              {
                choice: "2. Use an electromagnet to grab the keys",
                outcome: "Using an insulated wire and a loose nail, you create an electromagnet and carefully retrieve the keys without alerting the guard.",
                continuation: [
                  {
                    action: "You unlock the cell and slip into the shadows, heading toward the sewers.",
                    verbs: {
                      "escape": {
                        description: "You successfully navigate the underground tunnels and emerge into the slums.",
                        reputationImpact: 5
                      }
                    }
                  }
                ]
              }
            ]
          }
        ];
        
        /**
         * The user selects the correct verb to progress to the slums either has gotten out of prison or got into capital
         * , so slums has their own object.
         * 
         * I think this should be an opportunity to recruit an ally, so this could lead to the user saving the general
         */
        const slumsData = [
            {
                gameID: 4,
                location: "The Slums",
                completed: false,
                importanceLevel: 0.8,
                intro: "The slums are a maze of crumbling buildings, where the air is thick with smoke and the cries of the downtrodden. Yet, there's an undercurrent of rebellion here—people are struggling, "+
                "but they're not defeated. Everyone has a story, and in the heart of the chaos, you're about to uncover one of your own.",
                action: "A tall, thin woman with a scar running across her face steps out of the shadows. Her eyes are sharp, calculating. She doesn't look like someone you should cross.",
                options: [
                    {
                        choice: "1. Ask her who she is and what she wants",
                        outcome: "She smirks, clearly amused by your directness. 'I'm someone who can make your life interesting, if you're brave enough. There's a job that needs doing. It's risky, but the reward is worth it. Interested?'",
                        continuation: [
                            {
                                action: "Do you want to take the job?",
                                verbs: {
                                    "accept": {
                                        description: "You accept the job, feeling a strange thrill run through you.",
                                        reputationImpact: 3,
                                        gameOver: false
                                    },
                                    "decline": {
                                        description: "You decline, sensing that the job might be more trouble than it's worth.",
                                        reputationImpact: -1,
                                        gameOver: false
                                    }
                                }
                            }
                        ]
                    },
                    {
                        choice: "2. Ignore her and keep moving",
                        outcome: "You decide it's best not to get involved and continue your journey deeper into the slums.",
                        continuation: [
                            {
                                action: "You stumble upon an old, crumbling building with a strange light glowing from the cracks in the walls.",
                                verbs: {
                                    "investigate": {
                                        description: "You cautiously approach the building and investigate the source of the light.",
                                        reputationImpact: 2,
                                        gameOver: false
                                    },
                                    "avoid": {
                                        description: "You decide not to risk it and avoid the mysterious building.",
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
         * So user has come out of slums, there is no chance of the user dying in the slums. The user could be offered a new opportunity to recruit an ally
         * 
         */
        const rescueGeneralData = [
            {
                gameID: 5,
                location: "The Weak-Security Prison",
                completed: false,
                importanceLevel: 0.9,
                intro: "You've followed the woman's instructions and find yourself standing before a decrepit prison on the edge of the slums. The walls are high, but the guards are few, and the atmosphere reeks of neglect. Inside, an exiled general, once a symbol of power, is held captive. He has been abandoned by the kingdom, but his knowledge and skills could prove invaluable to your cause. Your task: free him, and in return, gain a powerful ally.",
                action: "The woman hands you a small map and a set of keys. 'This should get you inside. The general is being held in the back cell, but be careful. The guards may be few, but they're not completely incompetent. Make sure you're ready.'",
                options: [
                    {
                        choice: "1. Stealthily enter the prison",
                        outcome: "You decide to take the stealthy approach. The map leads you through an unnoticed side gate, and you sneak through the dark, musty hallways, avoiding the few guards patrolling the area.",
                        continuation: [
                            {
                                action: "You reach the back cell where the general is held. He's sitting on a cot, his face etched with years of hardship. He looks up at you as you approach.",
                                verbs: {
                                    "talk": {
                                        description: "You introduce yourself and explain that you've come to free him. The general's eyes flicker with both surprise and hope.",
                                        reputationImpact: 3,
                                        gameOver: false
                                    },
                                    "fight": {
                                        description: "You decide to break open the cell with force, alerting the guards. A fierce battle ensues, but you manage to overpower them.",
                                        reputationImpact: 2,
                                        gameOver: false
                                    }
                                }
                            }
                        ]
                    },
                    {
                        choice: "2. Try to bribe the guards",
                        outcome: "You spot a few guards lounging near the front entrance of the prison. Using some of your remaining funds, you approach them and attempt to bribe your way in.",
                        continuation: [
                            {
                                action: "The guards eye you suspiciously, but the offer of gold is too tempting. They let you pass, but warn you not to make any noise.",
                                verbs: {
                                    "sneak": {
                                        description: "You move quietly, avoiding detection and eventually reach the general's cell. He stands up, ready for the escape.",
                                        reputationImpact: 1,
                                        gameOver: false
                                    },
                                    "rush": {
                                        description: "You decide to rush the cell, but the guards are not far behind. A fight breaks out, and the general helps you defeat them.",
                                        reputationImpact: 2,
                                        gameOver: false
                                    }
                                }
                            }
                        ]
                    },
                    {
                        choice: "3. Attempt a direct assault on the prison",
                        outcome: "You decide to take a more direct route. Drawing your weapon, you charge into the prison's entrance, hoping to catch the guards off guard and force your way in.",
                        continuation: [
                            {
                                action: "The clash with the guards is brutal. Though you manage to defeat them, the noise has drawn more attention, and you now have to deal with a more substantial force.",
                                verbs: {
                                    "fight": {
                                        description: "You battle through the guards, managing to reach the general’s cell. He’s impressed by your strength and agrees to join your cause.",
                                        reputationImpact: 4,
                                        allyImpact: 2,
                                        gameOver: false
                                    },
                                    "flee": {
                                        description: "You realize you’re outnumbered and decide to retreat before reinforcements arrive, abandoning the mission.",
                                        reputationImpact: -2,
                                        allyImpact: 0, 
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
         * User has either come out with an ally or not this object doesn't specifically relate to either outcome
         * User has had the opportunity to recruit three different allies techincally, [14/03/ We could make smaller objects to make the game longer]
         * 
         * One big object now to facilitate a few battles in the castle takeover including a massive briefing
        */
        const castleTakeoverData = [
        {
            gameID: 6,
            location: "Castle Briefing Room",
            completed: false,
            importanceLevel: 1.0,
            intro: "After gathering your allies and planning for weeks, you've finally arrived at the castle's gates. The rebellion is at its peak, and your forces are ready for action. However, the next few hours will decide everything. You enter the castle's briefing room, a grand hall lit by torches and filled with your closest supporters. The general, who now fights by your side, stands before a large map, ready to outline the plan for the takeover.",
            action: "A tall, grizzled man with battle scars greets you. 'This is it,' he says, pointing at the map. 'We strike at dawn, but we need to divide our forces. Every decision you make now will determine the outcome of this battle.'",
            options: [
                {
                    choice: "1. Listen to the general's plan and divide the forces accordingly",
                    outcome: "The general's plan seems solid. You assign the right people to the right tasks. You feel a surge of confidence as the plan takes shape. Everyone knows their role, and you're prepared for the impending chaos.",
                    continuation: [
                        {
                            action: "With the strategy set, you now face the first wave of challenges: infiltrating the castle walls and capturing the first gate.",
                            verbs: {
                                "infiltrate": {
                                    description: "You lead a small group through a secret passage into the castle. The guards are unaware, and you take the first gate with minimal resistance.",
                                    reputationImpact: 4,
                                    gameOver: false
                                },
                                "charge": {
                                    description: "You lead your forces in a direct assault against the castle walls. The guards put up a strong fight, but your determination pushes through.",
                                    reputationImpact: 2,
                                    gameOver: false
                                }
                            }
                        }
                    ]
                },
                {
                    choice: "2. Challenge the general's plan and suggest an alternate strategy",
                    outcome: "You question the general's approach, believing there's a better way to take the castle. After some heated discussion, the general reluctantly agrees to let you try your plan. The tension in the room is palpable.",
                    continuation: [
                        {
                            action: "The plan is now in your hands. You need to infiltrate the castle, but how will you approach it?",
                            verbs: {
                                "sneak": {
                                    description: "You attempt a quiet infiltration, trying to avoid any direct combat. The guards are surprised, but the success of your mission depends on your stealth.",
                                    reputationImpact: 3,
                                    gameOver: false
                                },
                                "bribe": {
                                    description: "You bribe a few castle guards to let you pass. It works, but it costs you some of your remaining funds. The castle walls are now within reach.",
                                    reputationImpact: 1,
                                    gameOver: false
                                }
                            }
                        }
                    ]
                },
                {
                    choice: "3. Ignore the briefing and take matters into your own hands",
                    outcome: "You decide to act independently, abandoning the plan set by the general and your allies. You'll forge your own path, trusting your instincts over the tactical advice.",
                    continuation: [
                        {
                            action: "Without waiting for the others, you lead your group into battle headfirst. There's no turning back now, and the risks are high.",
                            verbs: {
                                "fight": {
                                    description: "You charge into the fray, hoping to break the enemy lines before they can organize. It's chaotic, but you manage to make progress.",
                                    reputationImpact: -1,
                                    gameOver: false
                                },
                                "retreat": {
                                    description: "Realizing the situation is escalating beyond your control, you lead a retreat back into the shadows to regroup and rethink your strategy.",
                                    reputationImpact: -2,
                                    gameOver: false
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            gameID: 7,
            location: "Castle Courtyard - Outer Gates",
            completed: false,
            importanceLevel: 1.0,
            intro: "The outer gates are now in your control, but the battle is far from over. The courtyard is a maze of statues, pillars, and large stone structures, offering plenty of cover for both your forces and the enemy. You’ve taken the first step, but the enemy’s reinforcements are closing in fast.",
            action: "As you and your allies gather in the courtyard, the enemy commander appears on the balcony above, taunting you. 'You think you’ve won? This castle is mine, and you’ll never take it.' His words only fuel your resolve.",
            options: [
                {
                    choice: "1. Hold your position and prepare for the enemy's counterattack",
                    outcome: "You choose to hold the position, fortifying your defensive line and preparing for the inevitable clash. Your allies take up positions behind cover, while you wait for the enemy to strike.",
                    continuation: [
                        {
                            action: "The enemy begins their advance, sending wave after wave of soldiers toward your defensive position. It’s a brutal battle as you fight to maintain your ground.",
                            verbs: {
                                "defend": {
                                    description: "You and your allies fend off the initial wave of enemies, but the fight is far from over. The enemy has more forces than you anticipated.",
                                    reputationImpact: 3,
                                    gameOver: false
                                },
                                "counterattack": {
                                    description: "You lead a counterattack, charging straight at the enemy forces. It’s a risky move, but it may throw them off balance.",
                                    reputationImpact: 2,
                                    gameOver: false
                                }
                            }
                        }
                    ]
                },
                {
                    choice: "2. Attempt to ambush the enemy before they can organize",
                    outcome: "You act quickly, leading a small group to ambush the enemy before they can fully organize their forces. Your quick thinking may just give you the upper hand.",
                    continuation: [
                        {
                            action: "You lead your forces to the side of the courtyard, setting up an ambush. As the enemy forces march forward, you spring the trap, taking them by surprise.",
                            verbs: {
                                "strike": {
                                    description: "Your ambush catches the enemy off guard. The first wave falls quickly, but the enemy commander is not far behind.",
                                    reputationImpact: 4,
                                    gameOver: false
                                },
                                "retreat": {
                                    description: "The ambush is successful, but the enemy is regrouping quickly. You decide to retreat and plan for the next phase of the attack.",
                                    reputationImpact: 2,
                                    gameOver: false
                                }
                            }
                        }
                    ]
                },
                {
                    choice: "3. Attempt to negotiate with the enemy commander, offering a truce",
                    outcome: "You send a messenger to the enemy commander, offering a truce in exchange for safe passage. The battlefield is silent as you await a response.",
                    continuation: [
                        {
                            action: "The enemy commander agrees to meet, but he has no intention of keeping his word. He’s playing for time to prepare a counteroffensive.",
                            verbs: {
                                "attack": {
                                    description: "As soon as you meet the enemy commander, he signals his soldiers to attack. The truce was a ruse, and now you’re forced into a deadly confrontation.",
                                    reputationImpact: -2,
                                    gameOver: false
                                },
                                "negotiate": {
                                    description: "You attempt to hold the line and negotiate, hoping that your reputation will intimidate the enemy into backing down. But it’s a dangerous game to play.",
                                    reputationImpact: 1,
                                    gameOver: false
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            gameID: 8,
            location: "Castle Courtyard - Inner Gates",
            completed: false,
            importanceLevel: 1.0,
            intro: "After surviving wave after wave of enemy forces, you’ve pushed deeper into the castle courtyard, now nearing the inner gates. But the castle’s defenders are well-prepared, and their morale is high. The final line of defense stands between you and the throne room. The inner gates are fortified, and there’s no turning back now.",
            action: "Your forces are exhausted, but you have no choice but to press on. The enemy commander’s voice echoes from behind the gates, mocking your every move. 'You think you’ve made it this far, but the castle still stands strong. Are you sure you want to face me?'",
            options: [
                {
                    choice: "1. Lead a full assault on the inner gates, no more hesitation",
                    outcome: "You make the call to go all-in, launching a full assault on the inner gates. The enemy holds a strong position, but your forces are determined to push through. It’s now or never.",
                    continuation: [
                        {
                            action: "As your forces charge, enemy archers rain down arrows from the walls above. A massive battle erupts at the gates, your soldiers battling desperately to break through.",
                            verbs: {
                                "charge": {
                                    description: "You charge forward with your forces, braving the archers’ fire. The heat of battle is overwhelming, but your warriors push forward.",
                                    reputationImpact: 5,
                                    gameOver: false
                                },
                                "regroup": {
                                    description: "You fall back to regroup with your forces. The enemy is stronger than you thought, but a strategic retreat might give you the upper hand.",
                                    reputationImpact: 3,
                                    gameOver: false
                                }
                            }
                        }
                    ]
                },
                {
                    choice: "2. Try to find a weakness in the inner gates and exploit it",
                    outcome: "You instruct your forces to look for an opening in the gates. It’s a more subtle approach, but it could give you the chance to avoid a direct confrontation and surprise the enemy.",
                    continuation: [
                        {
                            action: "You and a small team sneak around the castle to locate any weakness. After some scouting, you find a small, unguarded entrance that leads to a hidden courtyard behind the gates.",
                            verbs: {
                                "enter": {
                                    description: "You slip through the entrance, bypassing the gates entirely. The surprise factor gives you an advantage, but it also means splitting your forces.",
                                    reputationImpact: 4,
                                    gameOver: false
                                },
                                "alert": {
                                    description: "You decide to send a signal to your forces to launch a coordinated strike, but the enemy has been watching for such a move. They prepare to counter you.",
                                    reputationImpact: 2,
                                    gameOver: false
                                }
                            }
                        }
                    ]
                },
                {
                    choice: "3. Attempt to break the enemy's morale with psychological warfare",
                    outcome: "You decide that brute force won’t be enough. You send a small team to infiltrate the castle and spread rumors and false flags, aiming to make the enemy commanders doubt their own forces.",
                    continuation: [
                        {
                            action: "You hear whispers in the courtyard: the enemy is starting to panic. Some of their forces have begun to question the orders, while others hesitate, unsure of their commander’s strength.",
                            verbs: {
                                "press": {
                                    description: "Seeing their hesitation, you push forward aggressively, taking advantage of the enemy's faltering morale. The enemy is now divided and vulnerable.",
                                    reputationImpact: 3,
                                    gameOver: false
                                },
                                "play": {
                                    description: "You continue to play mind games, trying to disrupt their entire command structure. But this takes time, and it’s possible the enemy will regroup before your forces can fully capitalize on the chaos.",
                                    reputationImpact: 2,
                                    gameOver: false
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            gameID: 9,
            location: "Castle Throne Room",
            completed: false,
            importanceLevel: 1.0,
            intro: "The final battle is upon you. The inner gates have been breached, and you now stand at the threshold of the throne room. The enemy commander, still holding strong, waits for you in the chamber beyond. You’ve made it this far, but can you finish what you started?",
            action: "The throne room doors open, and the enemy commander stands alone, ready for the fight of his life. The battle that decides the fate of the rebellion is about to begin. There’s no turning back.",
            options: [
                {
                    choice: "1. Charge forward and face the commander in direct combat",
                    outcome: "You and your allies charge forward, weapons drawn, ready to end this once and for all. The battle is fierce, but victory feels within your grasp.",
                    continuation: [
                        {
                            action: "The commander proves a tough foe, but with your allies' help, you manage to corner him. The throne room becomes a battleground as the final fight begins.",
                            verbs: {
                                "fight": {
                                    description: "You engage in a fierce battle with the enemy commander. It’s brutal, but you manage to land the final blow.",
                                    reputationImpact: 5,
                                    gameOver: false
                                },
                                "surrender": {
                                    description: "The commander begs for mercy, offering to surrender if you spare him. Will you show mercy, or finish the fight?",
                                    reputationImpact: 2,
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
        // Define Ally Objects
        var allies = [
          {
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
        ];

        // Define User Character
        var userCharacter = {
          name: "Will be loaded from db",
          hunger: 0.4,
          reputation: 0.6,
          gainedAllies: []  // Array that will hold allies
        };


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

        function addAlly(ally) {
          userCharacter.gainedAllies.push(ally);
          Terminal.outputMessage(`You have gained an ally: ${ally.allyName}`, gameMessageColor);
        }

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
              gameBattle(0, enemies[0]);
              currentState = 'gameBattle';
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
            currentState = 'introduction';  // Ensure state stays as introduction when showing options
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
        
                // Check if we're in the slums and the user accepted the quest
                if (gameState.currentObject === slumsData && 
                    gameState.currentScenario.gameID === 4 && 
                    gameState.chosenOption === 0 && 
                    verb === "accept") {
                    // Move to rescue general scenario
                    gameState.currentObject = rescueGeneralData;
                    findIncompleteGame();
                    return;
                }
        
                // Check if rescue general is completed
                if (gameState.currentObject === rescueGeneralData && 
                    gameState.currentScenario.completed) {
                    // Add the general as an ally
                    addAlly(allies[1]); // Add General Grievous
                    // Move to castle takeover
                    gameState.currentObject = castleTakeoverData;
                    findIncompleteGame();
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
        function decreaseReputation(taskRep) {
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
              } else if (gameState.currentObject === prisonData) {
                  // Cycle through prisonData in order
                  gameState.currentScenario = availableGames[0];
              } else {
                  // For other data, continue to select randomly
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
                for (let i = 0; i < userCharacter.gainedAllies.length; i++) { // List available allies
                    Terminal.outputMessage(`${i}. ${userCharacter.gainedAllies[i].allyName}`, systemMessageColor);
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
            if (choice >= 0 && choice < userCharacter.gainedAllies.length) { // Check if the ally selection is valid
                const selectedAlly = userCharacter.gainedAllies[choice]; // Get the selected ally
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
            for (let i = 0; i < userCharacter.gainedAllies.length; i++) {
                Terminal.outputMessage(`${i}. ${userCharacter.gainedAllies[i].allyName}`, systemMessageColor);
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
            } else if (userCharacter.gainedAllies.every(ally => ally.health <= 0)) {
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

            userCharacter.gainedAllies.forEach(ally => {
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
            const randomAlly = userCharacter.gainedAllies[Math.floor(Math.random() * userCharacter.gainedAllies.length)];
            randomAlly.health = Math.min(randomAlly.maxHealth, randomAlly.health + 20);
        }




        
        // Initialize the game state
gameState.currentObject = introductoryData;

// populate allies 
addAlly(allies[0]);
// Note: General (allies[1]) will be added when rescued

// start the game
outputIntroduction();
currentState = 'introduction'; 
         
    }
()); 
