  /**
         * All the game data is stored in the below objects, this allows for the user to be able to interact with the game
         * and make decisions based on the information given to them. Generally user is presented with a choice and then a verb
         * to select from.
         * 
         * Because the game follows a strict story line introductoryData will not have any randomisation, however prisonData will
         * have randomisation as the user progresses through the game.
         */
 export const introductoryData = [
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
export const prisonData = [
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
export const slumsData = [
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

export const sewerEscapeData = [
    {
        gameID: 3,
        location: "The Sewers",
        completed: false,
        importanceLevel: 0.6,
        intro: "You've escaped the prison and find yourself in the dark, damp sewers beneath the capital. The stench is overwhelming, and the tunnels twist and turn in every direction.",
        action: "As you navigate the murky tunnels, you hear a low growl echoing from the darkness ahead.",
        options: [
            {
                choice: "1. Proceed cautiously",
                outcome: "You proceed carefully, weapon drawn, ready for whatever lurks in the shadows.",
                continuation: [
                    {
                        action: "A mutated rat, larger than any you've ever seen, emerges from the darkness, its eyes glowing menacingly.",
                        verbs: {
                            "fight": {
                                description: "You engage the mutated rat in battle. It's a tough fight, but you manage to defeat it.",
                                reputationImpact: 2,
                                gameOver: false
                            },
                            "sneak": {
                                description: "You attempt to sneak past the rat, but it spots you and attacks. You are forced to fight.",
                                reputationImpact: 1,
                                gameOver: false
                            }
                        }
                    }
                ]
            },
            {
                choice: "2. Try to find another route",
                outcome: "You decide to avoid the growling and search for an alternate path through the sewers.",
                continuation: [
                    {
                        action: "You spend hours navigating the labyrinthine tunnels, but eventually find a path that bypasses the source of the growl.",
                        verbs: {
                            "continue": {
                                description: "You continue your escape, relieved to have avoided the creature in the darkness.",
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
export const rescueGeneralData = [
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
export const castleTakeoverData = [
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
export var castleEnemies = [
    {
        name: "Dark Knight",
        health: 100,
        maxHealth: 100,
        strength: 3.0,
        defense: 1.5,
        description: "A fearsome knight clad in dark armor."
    },
    {
        name: "Harvey",
        health: 100,
        maxHealth: 100,
        strength: 3.0,
        defense: 1.5,
        description: "A fearsome knight clad in dark armor." 
    },
    {
        name: "Mutated Rat",
        health: 40,
        maxHealth: 40,
        strength: 2.0,
        defense: 0.5,
        description: "A giant, mutated rat lurking in the sewers."
    }
];

/**
 * An object for the User's Character
 * This allows all of the stats to be stored in one place and can be accessed easily
 */
// Define Ally Objects
export var allies = [
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