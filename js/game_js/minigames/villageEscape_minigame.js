import { Terminal } from "../../terminal.js";
import { displayAnimation } from "../animation_handler.js";

export function villageEscapeGame() {
    Terminal.outputMessage("VILLAGE ESCAPE: Knights have come to raid your village!", "#FF8181");
    Terminal.outputMessage("Make quick decisions to survive. Type the [highlighted] option when prompted.", "#FF8181");
    Terminal.outputMessage("You have 10 seconds to decide. Single letter responses are accepted.", "#ADD8E6");
    
    let currentRound = 0;
    let gameActive = true;
    let timeoutId = null;
    
    const scenarios = [
        {
            prompt: "You wake from a nap to find your house engulfed in flames! [J]ump out the window!",
            validAnswers: ["jump", "j"],
            success: {
                jump: "You leap through the window as flames consume your home!"
            },
            animations: {
                jump: 'BurningVillage/JumpingOutOfFire.gif'
            }
        },
        {
            prompt: "A baby is crying in a nearby house! [S]ave the baby or [F]lee!",
            validAnswers: ["save", "flee", "s", "f"],
            success: {
                save: "You rush into the burning building and rescue the crying baby!",
                flee: "You turn away, the cries haunting your conscience..."
            },
            animations: {
                save: 'BurningVillage/SavedBaby.gif',  // Changed to single animation
                flee: null  // Remove missing animation
            }
        },
        {
            prompt: "A guard sees the baby and drops his sword in shock! [R]un past or [T]ell him it's not yours!",
            validAnswers: ["run", "tell", "r", "t"],
            success: {
                run: "You dash past the distracted guard, baby held close!",
                tell: "The guard, moved by guilt, helps you escape with the child!"
            },
            animations: {
                run: 'BurningVillage/RunningWithBabyToKnight.gif',
                tell: 'BurningVillage/RunningTHroughTown.gif'
            }
        },
        {
            prompt: "The village edge approaches! Into the [T]rees or along the village [R]oad!",
            validAnswers: ["trees", "road", "t", "r"],
            success: {
                trees: "The dense forest provides perfect cover for your escape!",
                road: "The road leads you swiftly to safety!"
            },
            animations: {
                trees: 'BurningVillage/RunningThroughForest.gif',
                road: 'BurningVillage/RunningTHroughTown.gif'
            }
        }
    ];

    function startScenario() {
        if (currentRound >= scenarios.length) {
            cleanup(true);
            return;
        }

        const scenario = scenarios[currentRound];
        Terminal.outputMessage(`\n${scenario.prompt}`, "#00FF00");
        
        timeoutId = setTimeout(() => {
            Terminal.outputMessage("Your indecision proves fatal!", "#FF0000");
            cleanup(false);
        }, 10000); // 10 seconds per decision

        setupInputHandler();
    }

    function setupInputHandler() {
        const userInput = document.getElementById("user-input");
        if (userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
        }
        
        const scenarioHandler = function(event) {
            if (event.key === "Enter") {
                const input = Terminal.getUserInput().trim().toLowerCase();
                if (gameActive) processInput(input);
            }
        };

        userInput.addEventListener("keypress", scenarioHandler);
        userInput.currentHandler = scenarioHandler;
    }
    
    async function processInput(input) {
        const scenario = scenarios[currentRound];
        
        if (scenario.validAnswers.includes(input)) {
            clearTimeout(timeoutId);
            
            // Special handling for first scenario - forced jump
            if (currentRound === 0) {
                const animation = scenario.animations.jump;
                await displayAnimation(animation);
                Terminal.outputMessage(scenario.success.jump, "#00FF00");
                currentRound++;
                startScenario();
                return;
            }

            // Updated animation key logic to handle final scenario
            const animationKey = 
                input.startsWith('s') ? 'save' :
                input.startsWith('r') ? (currentRound === 3 ? 'road' : 'run') :  // Fixed road condition
                input.startsWith('t') ? (currentRound === 3 ? 'trees' : 'tell') : // Fixed trees condition
                'flee';
                
            const animation = scenario.animations[animationKey];
            
            if (animation) {
                if (Array.isArray(animation)) {
                    for (const anim of animation) {
                        await displayAnimation(anim);
                    }
                } else {
                    await displayAnimation(animation);
                }
            }

            // Updated success message logic to match animation conditions
            const successMessage = 
                input.startsWith('s') ? scenario.success.save :
                input.startsWith('r') ? (currentRound === 3 ? scenario.success.road : scenario.success.run) :
                input.startsWith('t') ? (currentRound === 3 ? scenario.success.trees : scenario.success.tell) :
                scenario.success.flee;
            
            Terminal.outputMessage(successMessage, "#00FF00");
            currentRound++;
            startScenario();
        } else {
            if (currentRound === 0) {
                Terminal.outputMessage("You must jump! Press 'J' or type 'jump' to escape!", "#FF0000");
            } else {
                Terminal.outputMessage("Invalid choice! Try again quickly!", "#FF0000");
            }
        }
    }

    function cleanup(success) {
        gameActive = false;
        const userInput = document.getElementById("user-input");
        if (userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
        }

        Terminal.outputMessage(
            success ? "\nYou've successfully escaped the village!" : "Your journey ends here...", 
            success ? "#00FF00" : "#FF0000"
        );

        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                message: success ? "Village escape successful!" : "Failed to escape the village"
            }
        }));
    }

    startScenario();
}