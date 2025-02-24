document.addEventListener("DOMContentLoaded", function () {
    // Show the login form when the "Login" button is clicked
    document.getElementById("signUp").onclick = function () {
        document.getElementById("signUp").style.display = "block";
        document.querySelector(".button-container").style.display = "none"; 
    };
});