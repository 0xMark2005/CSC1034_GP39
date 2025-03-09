// Ensure user validation is between 1 and four (for menu)
function validateNumericInput(input) {
    console.log("Validating input:", input); 
    // Regex expression which ensures only a number between 1 and 4
    if (!/^[1-4]$/.test(input)) {
        alert("Invalid input. Please enter a number between 1 and 4.");
        return false;
    }

    // Adding ten here ensures remains as base 10 input for user input.
    return parseInt(input, 10); 
}
window.validateNumericInput = validateNumericInput;

// Ensure NO SPECIAL CHARACTERS or anything to do with SQL injection
// Password Validation
function validatePasswordInput(password) {
    // Trim spaces
    password = password.trim();
    
    // Updated regex allowing more special characters
    // Make sure special characters are correctly escaped and included in the pattern
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=<>?/[\]{}|~`.,;:'"]).{8,}$/;

    // Test password against the regex
    if (!regex.test(password)) {
        alert("Invalid password! Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        return false; // Invalid password
    }

    return password; // Valid password
}

window.validatePasswordInput = validatePasswordInput;

//Ensure passwords entered into signup match
function validatePasswordRepeat(password1,password2)
{
    //Check if passwords are the same
    if(password1 == pasword2)
    {
        return true;
    }
    else
    {
        alert("Passwords entered must be the same");
        return false;
    }
}

window.validatePasswordRepeat = validatePasswordRepeat;

// Username Validation (Only letters and numbers allowed)
function validateUsernameInput(username) {
    // Trim spaces
    username = username.trim();
    
    // Only allow letters and numbers (no special characters allowed)
    const regex = /^[A-Za-z0-9]+$/;

    // Test username against the regex
    if (!regex.test(username)) {
        alert("Invalid username! Only letters and numbers are allowed.");
        return false; // Invalid username
    }

    return username; // Valid username
}

window.validateUsernameInput = validateUsernameInput;
