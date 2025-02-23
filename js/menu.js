// Stack overflow code...
document.addEventListener("DOMContentLoaded", function () {
    const userInput = document.getElementById("userInput");

    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const choice = userInput.value.trim();

            // Call the validation function from validation.js
            let validatedChoice = validateNumericInput(choice);

            if (validatedChoice === false) {
                userInput.value = ""; 
                return; 
            }

            switch (validatedChoice) {
                case 1:
                    document.getElementById("gameBegins").style.display = "block";
                    document.getElementById("menu").style.display = "none";
                    document.getElementById("title").style.display = "none";

                    // Method which is exposed in js/game.js
                    window.typeWriter();
                    break;
                case 2:
                    alert("Loading Game...");
                    break;
                case 3:
                    alert("Opening Settings...");
                    break;
                case 4:
                    alert("Logging Out...");
                    break;
                default:
                    alert("Invalid choice! Please enter 1, 2, 3, or 4.");
            }

            userInput.value = ""; // Clear input after processing
        }
    });
});
