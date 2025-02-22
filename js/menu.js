// Stack overflow code...
document.addEventListener("DOMContentLoaded", function () {
    const userInput = document.getElementById("userInput");

    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            const choice = userInput.value.trim();

            switch (choice) {
                // user selects 1 / Begin game so the menu is hidden and the header appears INSIDE terminal (this can be changed to outside if neccessary)
                case "1":
                    document.getElementById("gameBegins").style.display = "block"
                    document.getElementById("menu").style.display = "none";
                    document.getElementById("title").style.display = "none";
                    
                    // Method which is exposed in js/game.js
                    window.typeWriter();
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