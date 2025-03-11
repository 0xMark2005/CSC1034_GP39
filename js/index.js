// Add events after page has loaded
document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("loggedIn") === "true") {
        window.location.href = "main_menu.html";
        return;
    }
    // Button click events to open corresponding pages
    document.getElementById("login-button").onclick = function () {
        window.location.href = "login.html";
    }

    document.getElementById("signup-button").onclick = function () {
        window.location.href = "signup.html";
    }
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


async function handleLogin() {
    let username = document.getElementById('login-username').value.trim();
    let password = document.getElementById('login-password').value.trim();

    if (username === '' || password === '') {
        document.getElementById('login-error').textContent = "Please fill in all fields.";
        document.getElementById('login-error').style.display = "block";
        return;
    }

    // Check reCAPTCHA validation
    let recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        document.getElementById('login-error').textContent = "Please complete the reCAPTCHA.";
        document.getElementById('login-error').style.display = "block";
        return;
    }
    
    let hashedPassword = await hashPassword(password);
    let query = `SELECT * FROM users WHERE username='${username}' AND passwordHash='${hashedPassword}' LIMIT 1`;

    let params = new URLSearchParams();
    params.append('hostname', 'localhost');
    params.append('username', 'jdonnelly73');
    params.append('password', 'CHZHy02qM20fcLVt');
    params.append('database', 'CSC1034_CW_39');
    params.append('query', query);

    try {
        let response = await fetch('includes/db_connect.php', {
            method: 'POST',
            body: params
        });
        let result = await response.json();

        if (result.error) {
            document.getElementById('login-error').textContent = "Login failed: " + result.error;
            document.getElementById('login-error').style.display = "block";
        } else if (result.data && result.data.length > 0) {
            let userID = result.data[0].userID;
            // Generate a session token
            let sessionToken = btoa(userID + ":" + Date.now() + ":" + Math.random());
            // Expiration time set to 1 hour from now
            let expiresAt = new Date(Date.now() + 60 * 60 * 1000)
                .toISOString().slice(0, 19).replace('T', ' ');

            // db new row
            let sessionQuery = `INSERT INTO user_sessions (userID, session_token, expires_at) VALUES ('${userID}', '${sessionToken}', '${expiresAt}')`;
            let sessionParams = new URLSearchParams();
            sessionParams.append('hostname', 'localhost');
            sessionParams.append('username', 'jdonnelly73');
            sessionParams.append('password', 'CHZHy02qM20fcLVt');
            sessionParams.append('database', 'CSC1034_CW_39');
            sessionParams.append('query', sessionQuery);

            let sessionResponse = await fetch('includes/db_connect.php', {
                method: 'POST',
                body: sessionParams
            });
            let sessionResult = await sessionResponse.json();
            if (sessionResult.error) {
                document.getElementById('login-error').textContent = "Session error: " + sessionResult.error;
                document.getElementById('login-error').style.display = "block";
                return;
            }

            //session token and userID locally saved
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("userID", userID);
            localStorage.setItem("sessionToken", sessionToken);

            window.location.href = "main_menu.html";
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

function togglePasswordVisibility(inputId) {
    let passwordInput = document.getElementById(inputId);
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
}

async function handleRegister() {
    let usernameField = document.getElementById('register-username');
    let passwordField = document.getElementById('register-password');

    if (!usernameField || !passwordField) {
        console.error("Error: Registration input fields not found.");
        return;
    }

    let username = usernameField.value.trim();
    let password = passwordField.value.trim();

    if (username === '' || password === '') {
        document.getElementById('register-error').textContent = "Please fill in all fields.";
        document.getElementById('register-error').style.display = "block";
        return;
    }

    // Hash the password before inserting it into the database
    let hashedPassword = await hashPassword(password);
    let query = `INSERT INTO users (username, passwordHash) VALUES ('${username}', '${hashedPassword}')`;

    let params = new URLSearchParams();
    params.append('hostname', 'localhost');
    params.append('username', 'jdonnelly73');
    params.append('password', 'CHZHy02qM20fcLVt');
    params.append('database', 'CSC1034_CW_39');
    params.append('query', query);

    try {
        let response = await fetch('includes/db_connect.php', {
            method: 'POST',
            body: params
        });

        let result = await response.json();
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

// Hash password using SHA-256 and a salt
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Generate a random salt
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Return both the hash and the salt for storage
    return hashArray + ":" + Array.from(salt).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Toggle password visibility for both fields
function togglePasswordVisibility(id1, id2) {
    const passwordField = document.getElementById(id1);
    const checkPasswordField = document.getElementById(id2);
    
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;
    checkPasswordField.type = type;
}
