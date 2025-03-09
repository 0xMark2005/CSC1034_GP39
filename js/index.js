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
