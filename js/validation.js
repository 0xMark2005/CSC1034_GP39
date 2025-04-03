

// Ensure NO SPECIAL CHARACTERS or anything to do with SQL injection
// Password Validation
function validatePasswordLength(password) {
    if (password.length < 8) {
        return true;
    }
    return false;
}

window.validatePasswordLength = validatePasswordLength;

// Check if password contains at least one uppercase letter
function validatePasswordUppercase(password) {
    if (!/[A-Z]/.test(password)) {
        return true;
    }
    return false;
}

window.validatePasswordUppercase = validatePasswordUppercase;

// Check if password contains at least one lowercase letter
function validatePasswordLowercase(password) {
    if (!/[a-z]/.test(password)) {
        return true;
    }
    return false;
}

window.validatePasswordLowercase = validatePasswordLowercase;

// Check if password contains at least one digit
function validatePasswordDigit(password) {
    if (!/\d/.test(password)) {
        return true;
    }
    return false;
}

window.validatePasswordDigit = validatePasswordDigit;

// Check if password contains at least one special character
function validatePasswordSpecialChar(password){
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:'\",.<>?/`~]/.test(password)) {
        return true;
    }
    else{
        return false;
    }
}
   
window.validatePasswordSpecialChar = validatePasswordSpecialChar;

//Ensure passwords entered into signup match
function validatePasswordRepeat(password1,password2)
{
    //Check if passwords are the same
    if(password1 == password2 && password1, password2 != "")
    {
        return false;
    }
    else
    {
        return true;
    }
}

window.validatePasswordRepeat = validatePasswordRepeat;

// Username Validation (Only letters and numbers allowed)
function validateUsernameEmpty(username) {
    if (username.length === 0) {
        return true;
    }
    return false;
}

window.validateUsernameEmpty = validateUsernameEmpty;

// Check if the username length is within a specific range (example: 3-15 characters)
function validateUsernameLength(username) {
    if (username.length < 3 || username.length > 15) {
        return true;
    }
    return false;
}

window.validateUsernameLength = validateUsernameLength;

// Only allow letters and numbers (no special characters allowed)
function validateUsernameFormat(username) {
    const regex = /^[A-Za-z0-9]+$/;
    if (!regex.test(username)) {
        return true;
    }
    return false;
}

window.validateUsernameFormat = validateUsernameFormat;
