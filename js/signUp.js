document.addEventListener("DOMContentLoaded", function () {
    // Show the sign form when the "sign up" button is clicked
    document.getElementById("signUp").onclick = function () {
        document.getElementById("signUpForm").style.display = "block";
        document.querySelector(".button-container").style.display = "none"; 
    };
});