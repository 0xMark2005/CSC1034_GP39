import { Terminal } from "../../terminal.js";

export function villageEscapeGame() {
    Terminal.outputMessage("VILLAGE ESCAPE: Knights have come to raid your village!", "#FF8181");
    Terminal.outputMessage("Make quick decisions to survive. Type the [highlighted] option when prompted.", "#FF8181");
    Terminal.outputMessage("You have 5 seconds to decide. Single letter responses are accepted.", "#ADD8E6");
    
    let currentRound = 0;
    let gameActive = true;
    let attempts = 2; // Player gets multiple attempts per scenario
    let timerInterval = null;
    let timeoutId = null;
    
    const scenarios = [
        {
            prompt: "Flames engulf your home! [R]un through flames or [W]ait for help!",
            validAnswers: ["run", "wait", "r", "w"],
            timeLimit: 5000,
            hint: "The knights won't wait to help...",
            success: {
                run: "You dash through the flames, singeing your clothes but surviving!",
                wait: "You find a water bucket and douse yourself before escaping!"
            }
        },
        {
            prompt: "A child is crying in a burning house! [S]ave them or [F]lee!",
            validAnswers: ["save", "flee", "s", "f"],
            timeLimit: 5000,
            hint: "Your reputation might suffer, but survival is key...",
            success: {
                save: "You rescue the child and earn the villagers' respect!",
                flee: "You escape, knowing you must live to fight another day."
            }
        },
        {
            prompt: "Knights block the village exit! [F]ight or [H]ide!",
            validAnswers: ["fight", "hide", "f", "h"],
            timeLimit: 5000,
            hint: "Direct confrontation is risky...",
            success: {
                fight: "You distract the knights, allowing others to escape!",
                hide: "You slip past the knights unnoticed!"
            }
        },
        {
            prompt: "You reach the forest edge! [D]ive into undergrowth or [C]limb a tree!",
            validAnswers: ["dive", "climb", "d", "c"],
            timeLimit: 5000,
            hint: "Height gives you perspective...",
            success: {
                dive: "You conceal yourself in the thick undergrowth!",
                climb: "From the tree, you spot a safe path through the forest!"
            }
        }
    ];

    function clearTimers() {
        if (timeoutId) clearTimeout(timeoutId);
        if (timerInterval) clearInterval(timerInterval);
    }

    function startScenario() {
        clearTimers();
        
        if (currentRound >= scenarios.length) {
            gameActive = false;
            Terminal.outputMessage("\nYou've successfully escaped the village!", "#00FF00");
            Terminal.outputMessage("Through quick thinking and bravery, you've survived to fight another day!", "#00FF00");
            cleanup(true);
            return;
        }
        
        if (!gameActive) {
            cleanup(false);
            return;
        }

        const scenario = scenarios[currentRound];
        Terminal.outputMessage(`\n${scenario.prompt}`, "#00FF00");
        
        // Show a timer countdown
        let timeRemaining = scenario.timeLimit / 1000;
        Terminal.outputMessage(`Time remaining: ${timeRemaining} seconds`, "#FFA500");
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            if (timeRemaining > 0) {
                // Update the countdown display
                const timerElement = document.querySelector(".terminal-output div:last-child");
                if (timerElement) {
                    timerElement.textContent = `Time remaining: ${timeRemaining} seconds`;
                }
                
                // Show hint when time is running low
                if (timeRemaining === 2) {
                    Terminal.outputMessage(`Hint: ${scenario.hint}`, "#ADD8E6");
                }
            }
        }, 1000);
        
        timeoutId = setTimeout(() => {
            clearInterval(timerInterval);
            attempts--;
            
            if (attempts > 0) {
                Terminal.outputMessage(`Time's up! ${attempts} attempt remaining. Choose quickly!`, "#FFA500");
                Terminal.outputMessage(`Hint: ${scenario.hint}`, "#ADD8E6");
                Terminal.outputMessage(`${scenario.prompt}`, "#00FF00");
                Terminal.outputMessage(`Time remaining: ${scenario.timeLimit/1000} seconds`, "#FFA500");
                
                // Reset timer for another attempt
                timeoutId = setTimeout(() => {
                    Terminal.outputMessage("Your indecision proves fatal!", "#FF0000");
                    gameActive = false;
                    cleanup(false);
                }, scenario.timeLimit);
            } else {
                Terminal.outputMessage("Your indecision proves fatal!", "#FF0000");
                gameActive = false;
                cleanup(false);
            }
        }, scenario.timeLimit);

        setupInputHandler();
    }

    function setupInputHandler() {
        // Remove any existing handler
        const userInput = document.getElementById("user-input");
        if (userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
        }
        
        const scenarioHandler = function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const input = Terminal.getUserInput().trim().toLowerCase();
                processInput(input);
            }
        };

        userInput.addEventListener("keypress", scenarioHandler);
        userInput.currentHandler = scenarioHandler;
    }
    
    function processInput(input) {
        if (!gameActive) return;
        
        const scenario = scenarios[currentRound];
        
        if (!input || input === "") {
            Terminal.outputMessage("You must make a choice! Type something!", "#FF0000");
            Terminal.outputMessage(`Hint: ${scenario.hint}`, "#ADD8E6");
            return;
        }
        
        if (scenario.validAnswers.includes(input)) {
            clearTimers();
            
            // Determine which success message to show based on the player's choice
            let successMessage;
            if (input === "r" || input === "run") {
                successMessage = scenario.success.run;
            } else if (input === "w" || input === "wait") {
                successMessage = scenario.success.wait;
            } else if (input === "s" || input === "save") {
                successMessage = scenario.success.save;
            } else if (input === "f" || input === "flee" || input === "fight") {
                successMessage = input === "fight" ? scenario.success.fight : scenario.success.flee;
            } else if (input === "h" || input === "hide") {
                successMessage = scenario.success.hide;
            } else if (input === "d" || input === "dive") {
                successMessage = scenario.success.dive;
            } else if (input === "c" || input === "climb") {
                successMessage = scenario.success.climb;
            }
            
            Terminal.outputMessage(successMessage, "#00FF00");
            currentRound++;
            attempts = 2; // Reset attempts for next scenario
            startScenario();
        } else {
            attempts--;
            
            if (attempts > 0) {
                Terminal.outputMessage(`That's not a valid choice! You have ${attempts} more attempt.`, "#FFA500");
                Terminal.outputMessage(`Valid options: ${scenario.validAnswers.slice(0, 2).join(", ")}`, "#ADD8E6");
                Terminal.outputMessage(`Hint: ${scenario.hint}`, "#ADD8E6");
            } else {
                clearTimers();
                Terminal.outputMessage("Wrong move! The knights have caught you!", "#FF0000");
                gameActive = false;
                cleanup(false);
            }
        }
    }

    function cleanup(success) {
        const userInput = document.getElementById("user-input");
        if (userInput.currentHandler) {
            userInput.removeEventListener("keypress", userInput.currentHandler);
        }

        if (success) {
            Terminal.outputMessage("Your journey continues...", "#00FF00");
        } else {
            Terminal.outputMessage("Your journey ends here...", "#FF0000");
            Terminal.outputMessage("But the kingdom's story isn't over yet.", "#FFA500");
            Terminal.outputMessage("Type 'restart' to try again.", "#ADD8E6");
            
            // Setup restart handler
            const restartHandler = function(event) {
                if (event.key === "Enter") {
                    const input = Terminal.getUserInput().trim().toLowerCase();
                    if (input === "restart") {
                        Terminal.outputMessage("Restarting game...", "#00FF00");
                        userInput.removeEventListener("keypress", restartHandler);
                        
                        // Reset game state
                        currentRound = 0;
                        gameActive = true;
                        attempts = 2;
                        
                        // Start fresh
                        setTimeout(() => {
                            villageEscapeGame();
                        }, 1000);
                    }
                }
            };
            
            userInput.addEventListener("keypress", restartHandler);
        }

        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                message: success ? "Village escape successful!" : "Failed to escape the village"
            }
        }));
    }

    // Start the game
    startScenario();
}