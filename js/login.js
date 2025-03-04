document.getElementById("submitLogin").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission

    var username = document.getElementById("loginUsername").value;
    var password = document.getElementById("loginPassword").value;

    // Validate username and password
    if (!validateUsernameInput(username) || !validatePasswordInput(password)) {
        return; 
    }

    // Now, both username and password are valid. Check credentials
    if (username === "Admin" && password === "Admin!1234") {
        window.location.href = "main_menu.html";
    } else {
        alert("Invalid credentials. Please try again.");
    }
});



//-----
//Functions
//-----

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
    username = username.trim();

    // Only allow letters and numbers (no special characters allowed)
    const regex = /^[A-Za-z0-9]+$/;

    if (!regex.test(username)) {
        alert("Invalid username! Only letters and numbers are allowed.");
        return false; 
    }

    return true;
}

//
function changePasswordToClear() {
    var x = document.getElementById("loginPassword");
    if (x.type === "password") {
      x.type = "text";
    } else {
      x.type = "password";
    }
  }