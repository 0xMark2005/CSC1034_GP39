import {DBQuery} from "./dbQuery.js";

// Add events after page has loaded
document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("loggedIn") === "true") {
        window.location.href = "main_menu.html";
        return;
    }


    // Button click events to open corresponding pages
    document.getElementById("login-button").onclick = function () {
        showLoginScreen();
    }

    document.getElementById("create-account-button").onclick = function () {
        showCreateAccountScreen();
    }

    document.getElementById("account-login-button").onclick = function () {
        handleLogin();
    }

    document.getElementsByClassName("go-back-button").onclick = function() {
        showMenuScreen();
    }

    document.getElementById("register-account-button").onclick = function() {
        handleRegister();
    }

    document.getElementById("cbx-register").onclick = function() {
        togglePasswordVisibility('register-password');
    }

});

document.getElementById('register-username').addEventListener("input", function ()
    {
        let usernameField = document.getElementById('register-username').value.trim();
        let passwordField = document.getElementById('register-password').value.trim();
        let passwordConfirm = document.getElementById('confirm-password').value.trim();
        updateRequirements(usernameField,passwordField,passwordConfirm);
    });
    document.getElementById('register-password').addEventListener("input", function ()
    {
        let usernameField = document.getElementById('register-username').value.trim();
        let passwordField = document.getElementById('register-password').value.trim();
        let passwordConfirm = document.getElementById('confirm-password').value.trim();
        updateRequirements(usernameField,passwordField,passwordConfirm);
    });
    document.getElementById('confirm-password').addEventListener("input", function ()
    {
        let usernameField = document.getElementById('register-username').value.trim();
        let passwordField = document.getElementById('register-password').value.trim();
        let passwordConfirm = document.getElementById('confirm-password').value.trim();
        updateRequirements(usernameField,passwordField,passwordConfirm);
    });

function showLoginScreen() {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('menu-screen').style.display = 'none';
    document.getElementById('create-account-screen').classList.remove('active');
    document.getElementById('create-account-screen').style.display = 'none';

    // Show login screen
    document.getElementById('login-screen').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('login-screen').classList.add('active');
    }, 10);
}


function showCreateAccountScreen() {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('menu-screen').style.display = 'none';

    document.getElementById('create-account-screen').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('create-account-screen').classList.add('active');
    }, 10);
}


function showMenuScreen() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('login-screen').style.display = 'none';
    
    document.getElementById('create-account-screen').classList.remove('active');
    document.getElementById('create-account-screen').style.display = 'none';

    document.getElementById('menu-screen').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('menu-screen').classList.add('active');
    }, 10);
}


// Hash password using SHA-256 and a salt
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a random salt
    const saltHex = Array.from(salt).map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    const data = encoder.encode(password + saltHex);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Return both the hash and the salt separately
    return {
        hash: hashArray,
        salt: saltHex
    };
}

// Hash password with a provided salt
async function hashPasswordWithSalt(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function handleRegister() {
    let usernameField = document.getElementById('register-username');
    let passwordField = document.getElementById('register-password');
    let confirmPasswordField = document.getElementById("confirm-password");

    let username = usernameField.value.trim();
    let password = passwordField.value.trim();
    let password2 = confirmPasswordField.value.trim();

    let registerErrors = updateRequirements(username,password,password2);

    if(registerErrors.length > 0)
    {
        document.getElementById("register-error").textContent = "Registration failed: " + registerErrors;
        document.getElementById('register-error').style.display = "block";
        return;
    }

    if(password)

    if (username === '' || password === '') {
        document.getElementById('register-error').textContent = "Please fill in all fields.";
        document.getElementById('register-error').style.display = "block";
        return;
    }

    try {
        // Hash the password and get the salt
        let passwordData = await hashPassword(password);
        
        // Insert user with hash and salt in separate columns
        let query = `INSERT INTO users (username, password_hash, password_salt) VALUES ('${username}', '${passwordData.hash}', '${passwordData.salt}')`;
        let result = await DBQuery.getQueryResult(query);
        console.log("Register Response:", result);

        if (result.error) {
            document.getElementById('register-error').textContent = "Registration failed: " + result.error;
            document.getElementById('register-error').style.display = "block";
        } else if (result.success) {
            alert("Registration successful! You can now log in.");
            showLoginScreen();
        } else {
            document.getElementById('register-error').textContent = "Unexpected error. Please try again.";
            document.getElementById('register-error').style.display = "block";
        }
    } catch (error) {
        console.error('Registration Error:', error);
        document.getElementById('register-error').textContent = "Server error. Please try again.";
        document.getElementById('register-error').style.display = "block";
    }
}

async function handleLogin() {
    let username = document.getElementById('login-username').value.trim();
    let password = document.getElementById('login-password').value.trim();

    if (username === '' || password === '') {
        document.getElementById('login-error').textContent = "Please fill in all fields.";
        document.getElementById('login-error').style.display = "block";
        return;
    }

    // First query to get the user and their salt
    let userQuery = `SELECT * FROM users WHERE username='${username}' LIMIT 1`;

    try {
        let result = await DBQuery.getQueryResult(userQuery);

        if (result.error) {
            document.getElementById('login-error').textContent = "Login failed: " + result.error;
            document.getElementById('login-error').style.display = "block";
        } else if (result.data && result.data.length > 0) {
            let user = result.data[0];
            let storedHash = user.password_hash;
            let storedSalt = user.password_salt;
            let userID = user.user_id;

            // Hash the entered password with the stored salt
            let hashedPassword = await hashPasswordWithSalt(password, storedSalt);

            // Compare the hashed password with the stored hash
            if (hashedPassword === storedHash) {
                // Generate a session token
                let sessionToken = btoa(userID + ":" + Date.now() + ":" + Math.random());
                // Expiration time set to 1 hour from now
                let expiresAt = "NOW() + INTERVAL 1 HOUR";

                // Create a new session
                let sessionQuery = `INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ('${userID}', '${sessionToken}', ${expiresAt})`;
                let sessionResult = await DBQuery.getQueryResult(sessionQuery);

                if (sessionResult.error) {
                    document.getElementById('login-error').textContent = "Session error: " + sessionResult.error;
                    document.getElementById('login-error').style.display = "block";
                    return;
                }

                // Save session info to localStorage
                localStorage.setItem("loggedIn", "true");
                localStorage.setItem("userID", userID);
                localStorage.setItem("username", username);
                localStorage.setItem("sessionToken", sessionToken);

                window.location.href = "main_menu.html";
            } else {
                document.getElementById('login-error').textContent = "Invalid username or password.";
                document.getElementById('login-error').style.display = "block";
            }
        } else {
            document.getElementById('login-error').textContent = "Invalid username or password.";
            document.getElementById('login-error').style.display = "block";
        }
    } catch (error) {
        console.error('Login Error:', error);
        document.getElementById('login-error').textContent = "Server error. Please try again.";
        document.getElementById('login-error').style.display = "block";
    }
}

// Toggle password visibility for both fields
function togglePasswordVisibility(id1, id2) {
    const passwordField = document.getElementById(id1);
    const checkPasswordField = document.getElementById(id2);
    
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;
    checkPasswordField.type = type;
}

//button sound effect
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function() {
            const clickSound = new Audio('css/assets/sounds/button-click.mp3');
            clickSound.play();
        });
    });
});

function updateRequirements(username, password, password2) {
    let errors = [];

    // Username validation
    if (!validateUsernameEmpty(username)) {
        document.getElementById("0").classList.add("fulfilled");
    } else {
        document.getElementById("0").classList.remove("fulfilled");
        errors.push("Username cannot be empty.");
    }

    if (!validateUsernameLength(username)) {
        document.getElementById("1").classList.add("fulfilled");
    } else {
        document.getElementById("1").classList.remove("fulfilled");
        errors.push("Username must be between 3 and 15 characters.");
    }

    if (!validateUsernameFormat(username)) {
        document.getElementById("2").classList.add("fulfilled");
    } else {
        document.getElementById("2").classList.remove("fulfilled");
        errors.push("Username must only contain letters and numbers.");
    }

    // Password validation
    if (!validatePasswordUppercase(password)) {
        document.getElementById("3").classList.add("fulfilled");
    } else {
        document.getElementById("3").classList.remove("fulfilled");
        errors.push("Password must include at least one uppercase letter.");
    }

    if (!validatePasswordLowercase(password)) {
        document.getElementById("4").classList.add("fulfilled");
    } else {
        document.getElementById("4").classList.remove("fulfilled");
        errors.push("Password must include at least one lowercase letter.");
    }

    if (!validatePasswordDigit(password)) {
        document.getElementById("5").classList.add("fulfilled");
    } else {
        document.getElementById("5").classList.remove("fulfilled");
        errors.push("Password must include at least one digit.");
    }

    if (!validatePasswordSpecialChar(password)) {
        document.getElementById("6").classList.add("fulfilled");
    } else {
        document.getElementById("6").classList.remove("fulfilled");
        errors.push("Password must include at least one special character.");
    }

    if(!validatePasswordRepeat(password,password2)){
        document.getElementById("7").classList.add("fulfilled");
    }
    else{
        document.getElementById("7").classList.remove("fulfilled");
        errors.push("Passwords must match.");
    }

    return errors; // This can be used to display errors elsewhere if needed
}

window.showMenuScreen = showMenuScreen;
