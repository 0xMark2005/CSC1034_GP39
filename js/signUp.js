document.addEventListener("DOMContentLoaded", function () {
    // Show the sign-up form when the "sign up" button is clicked
    document.getElementById("signUp").onclick = function () {
        // Hide the button-container and sign-up button
        document.querySelector(".button-container").style.display = "none";
        
        // Show the sign-up form
        document.getElementById("signUpForm").style.display = "block"; // Ensure the correct ID here
    };
});
