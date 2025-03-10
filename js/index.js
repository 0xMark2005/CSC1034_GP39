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

function showLoginScreen() {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('menu-screen').style.display = 'none';

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

    // Hash the password before querying
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
            alert("Login successful!");
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
        let response = await fetch('https://jdonnelly73.webhosting1.eeecs.qub.ac.uk/includes/db_connect.php', {
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


// Hash password using SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Toggle password visibility for both fields
function togglePasswordVisibility(id1, id2) {
    const passwordField = document.getElementById(id1);
    const checkPasswordField = document.getElementById(id2);
    
    const type = passwordField.type === "password" ? "text" : "password";
    passwordField.type = type;
    checkPasswordField.type = type;
}
