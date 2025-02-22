document.getElementById("login").onclick = function () {
    // Show the login form when the "Login" button is clicked
    document.getElementById("loginForm").style.display = "block";
    document.querySelector(".button-container").style.display = "none"; // Hide the main buttons
};

// Validate login credentials
document.getElementById("submitLogin").onclick = function () {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Check if the username and password match default admin:admin
    if (username === "admin" && password === "admin") {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("menu").style.display = "block";
    } else {
        alert("Invalid credentials. Please try again.");
    }
};
