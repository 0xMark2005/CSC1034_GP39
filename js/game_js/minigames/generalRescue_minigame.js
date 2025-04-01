import { Terminal } from "../../terminal.js";

export function generalRescueGame() {
    let successfulAttempts = 0;
    let currentAttempt = 0;
    const requiredSuccesses = 3;
    const totalAttempts = 5;
    let gameActive = true;
    let codeElement = null;
    let inputEnabled = false;

    const codes = [
        "3 1 4 2",
        "2 4 1 3",
        "4 2 3 1",
        "1 3 2 4",
        "3 4 1 2"
    ];

    Terminal.outputMessage("KNIGHT RESCUE: Watch the guard enter codes!", "#FF8181");
    Terminal.outputMessage("You need 3 correct codes out of 5 to unlock the cell.", "#ADD8E6");
    Terminal.outputMessage("Each code appears for 5 seconds. Enter what you saw.", "#ADD8E6");

    function startCode() {
        if (currentAttempt >= totalAttempts || !gameActive) {
            cleanup(successfulAttempts >= requiredSuccesses);
            return;
        }

        inputEnabled = false;
        const currentCode = codes[currentAttempt];
        currentAttempt++;

        // Create and show code element
        Terminal.outputMessage(`\nCode ${currentAttempt}/5:`, "#FFFFFF");
        codeElement = document.createElement('div');
        codeElement.textContent = currentCode;
        codeElement.style.color = "#FFFF00";
        document.getElementById("output-terminal").appendChild(codeElement);

        // Hide code after 5 seconds and ask for input
        setTimeout(() => {
            // Remove code element completely
            codeElement.remove();
            Terminal.outputMessage("\nEnter the code you saw:", "#00FF00");
            inputEnabled = true;
            
            const codeHandler = function(event) {
                if (!inputEnabled || event.key !== "Enter") return;
                
                const input = Terminal.getUserInput().trim();
                document.getElementById("user-input").removeEventListener("keypress", codeHandler);
                
                if (input === currentCode) {
                    successfulAttempts++;
                    Terminal.outputMessage(`Correct! (${successfulAttempts}/${requiredSuccesses} needed)`, "#00FF00");
                } else {
                    Terminal.outputMessage(`Wrong! The code was: ${currentCode}`, "#FF0000");
                }
                
                startCode();
            };

            document.getElementById("user-input").addEventListener("keypress", codeHandler);
        }, 5000);
    }

    function cleanup(success) {
        gameActive = false;
        inputEnabled = false;
        if (codeElement) {
            codeElement.remove();
        }
        
        // Calculate score based on performance
        let score = 0;
        if (success) {
            // Base completion bonus
            score += 400;
            
            // Perfect memory bonus
            if (successfulAttempts === totalAttempts) {
                score += 300;
            }
            
            // Additional points per correct code
            score += successfulAttempts * 100;
        }
        
        Terminal.outputMessage(
            success ? `\nCell unlocked! The knight is free! Score: ${score}` : "\nFailed to unlock the cell. Guards are alerted!", 
            success ? "#00FF00" : "#FF0000"
        );

        document.dispatchEvent(new CustomEvent('minigameComplete', {
            detail: { 
                success: success,
                score: score,
                message: success ? "Knight rescued successfully!" : "Failed to rescue the knight",
                perfectMemory: successfulAttempts === totalAttempts
            }
        }));
    }

    // Start the game
    startCode();
}