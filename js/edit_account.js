import { DBQuery } from './dbQuery.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!localStorage.getItem('loggedIn') || !localStorage.getItem('userID')) {
        window.location.href = 'index.html';
        return;
    }

    // Add button click sound
    addButtonSoundEffects();

    // Setup event listeners
    document.getElementById('update-username').addEventListener('click', handleUsernameUpdate);
    document.getElementById('update-password').addEventListener('click', handlePasswordUpdate);
    document.getElementById('delete-account').addEventListener('click', handleAccountDeletion);
    document.getElementById('back-to-menu').addEventListener('click', () => {
        window.location.href = 'main_menu.html';
    });
});

async function handleUsernameUpdate() {
    const newUsername = document.getElementById('new-username').value.trim();
    const errorElement = document.getElementById('username-error');

    try {
        if (!newUsername) {
            errorElement.textContent = 'Please enter a new username';
            return;
        }

        const userID = localStorage.getItem('userID');
        const query = `UPDATE users SET username = '${newUsername}' WHERE user_id = ${userID}`;
        const result = await DBQuery.getQueryResult(query);

        if (result.success) {
            errorElement.textContent = 'Username updated successfully!';
            errorElement.style.color = 'green';
        } else {
            errorElement.textContent = 'Failed to update username';
        }
    } catch (error) {
        errorElement.textContent = 'An error occurred';
        console.error('Username update error:', error);
    }
}

async function handlePasswordUpdate() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const errorElement = document.getElementById('password-error');

    try {
        if (!currentPassword || !newPassword) {
            errorElement.textContent = 'Please fill in all password fields';
            return;
        }

        const userID = localStorage.getItem('userID');
        const passwordData = await hashPassword(newPassword);
        
        const query = `UPDATE users SET 
            password_hash = '${passwordData.hash}', 
            password_salt = '${passwordData.salt}' 
            WHERE user_id = ${userID}`;
        
        const result = await DBQuery.getQueryResult(query);

        if (result.success) {
            errorElement.textContent = 'Password updated successfully!';
            errorElement.style.color = 'green';
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
        } else {
            errorElement.textContent = 'Failed to update password';
        }
    } catch (error) {
        errorElement.textContent = 'An error occurred';
        console.error('Password update error:', error);
    }
}

async function handleAccountDeletion() {
    const password = document.getElementById('delete-confirm-password').value;
    const errorElement = document.getElementById('delete-error');

    if (confirm('Are you sure you want to delete your account? This cannot be undone!')) {
        try {
            const userID = localStorage.getItem('userID');
            const query = `DELETE FROM users WHERE user_id = ${userID}`;
            const result = await DBQuery.getQueryResult(query);

            if (result.success) {
                localStorage.clear();
                window.location.href = 'index.html';
            } else {
                errorElement.textContent = 'Failed to delete account';
            }
        } catch (error) {
            errorElement.textContent = 'An error occurred';
            console.error('Account deletion error:', error);
        }
    }
}

function addButtonSoundEffects() {
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const clickSound = new Audio('css/assets/sounds/button-click.mp3');
            clickSound.play();
        });
    });
}