// Add events after page has loaded
document.addEventListener("DOMContentLoaded", function () {

    // Button click events to open corresponding pages
    document.getElementById("login-button").onclick = function () {
        window.location.href = "login.html";
    }

    document.getElementById("signup-button").onclick = function () {
        window.location.href = "signup.html";
    }
});
