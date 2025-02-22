// Stack overflow code...
document.addEventListener("DOMContentLoaded", function () {
    const userInput = document.getElementById("userInput");

    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const choice = userInput.value.trim();

            switch (choice) {
                case "1":
                    alert("Game Begins!");
                    break;
                case "2":
                    alert("Loading Game...");
                    break;
                case "3":
                    alert("Opening Settings...");
                    break;
                case "4":
                    alert("Logging Out...");
                    break;
                default:
                    alert("Invalid choice! Please enter 1, 2, 3, or 4.");
            }

            userInput.value = ""; // Clear input after entry
        }
    });
});