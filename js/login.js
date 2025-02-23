// Show the login form when the "Login" button is clicked
document.getElementById("login").onclick = function () {
    document.getElementById("loginForm").style.display = "block";
    document.querySelector(".button-container").style.display = "none"; 
};

// Validate login credentials
document.getElementById("submitLogin").onclick = function () {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Validate username input first BEFORE user reaches backend so that SQL injection is practically impossible.
    
    if (!validateUsernameInput(username)) {
        return; 
    }

    // Validate password input as well 
    if (!validatePasswordInput(password)) {
        return; 
    }

    // Now, both username and password are valid. Check if they match the default admin credentials
    if (username === "admin" && password === "admin!1234") {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("menu").style.display = "block";
    } else {
        // Invalid credentials, show the alert
        alert("Invalid credentials. Please try again.");
    }
};

// Password validation function
function validatePasswordInput(password) {
    // Trim spaces
    password = password.trim();

    // Updated regex allowing more special characters
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=<>?/[\]{}|~`.,;:'"]).{8,}$/;

    if (!regex.test(password)) {
        alert("Invalid password! Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        return false; // Invalid password
    }

    return true; // Valid password
}

// Username validation function
function validateUsernameInput(username) {
    // Trim spaces
    username = username.trim();

    // Only allow letters and numbers (no special characters allowed)
    const regex = /^[A-Za-z0-9]+$/;

    if (!regex.test(username)) {
        alert("Invalid username! Only letters and numbers are allowed.");
        return false; 
    }

    return true;
}
