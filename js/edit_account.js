import { DBQuery } from './dbQuery.js';

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if not logged in
    if (!localStorage.getItem('loggedIn') || !localStorage.getItem('userID')) {
        window.location.href = 'index.html';
        return;
    }

    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.panel').forEach(panel => panel.classList.add('hidden'));
          const target = btn.dataset.target;
          document.getElementById(target).classList.remove('hidden');
          setTimeout(() => {
            document.querySelector(`#${target} input`)?.focus();
          }, 100);
        });
      });

    // Add sound effects
    addButtonSoundEffects();

    // Bind actions
    document.getElementById('update-username')?.addEventListener('click', handleUsernameUpdate);
    document.getElementById('update-password')?.addEventListener('click', handlePasswordUpdate);
    document.getElementById('delete-account')?.addEventListener('click', handleAccountDeletion);
    document.getElementById('back-to-menu')?.addEventListener('click', () => {
        window.location.href = 'main_menu.html';
    });
});

async function handleUsernameUpdate() {
    const newUsername = document.getElementById('new-username').value.trim();
    const errorEl = document.getElementById('username-error');

    if (!newUsername) {
        showError(errorEl, 'Please enter a new username');
        return;
    }

    try {
        const userID = localStorage.getItem('userID');
        const query = `UPDATE users SET username = '${newUsername}' WHERE user_id = ${userID}`;
        const result = await DBQuery.getQueryResult(query);

        if (result.success) {
            showSuccess(errorEl, 'Username updated successfully!');
        } else {
            showError(errorEl, 'Failed to update username');
        }
    } catch (err) {
        showError(errorEl, 'Error occurred while updating username');
        console.error(err);
    }

    document.getElementById('update-username').addEventListener('click', () => {
        const usernameForm = document.getElementById('username-form');
        usernameForm.classList.toggle('show');
    
        // Delay focus until transition starts
        if (usernameForm.classList.contains('show')) {
            setTimeout(() => {
                document.getElementById('new-username')?.focus();
            }, 300);
        }
    });
}

async function handlePasswordUpdate() {
    const current = document.getElementById('current-password').value.trim();
    const newPass = document.getElementById('new-password').value.trim();
    const errorEl = document.getElementById('password-error');

    if (!current || !newPass) {
        showError(errorEl, 'Please fill in both password fields');
        return;
    }

    try {
        const userID = localStorage.getItem('userID');
        const { hash, salt } = await hashPassword(newPass);
        const query = `
            UPDATE users SET password_hash = '${hash}', password_salt = '${salt}'
            WHERE user_id = ${userID}
        `;

        const result = await DBQuery.getQueryResult(query);

        if (result.success) {
            showSuccess(errorEl, 'Password updated successfully!');
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
        } else {
            showError(errorEl, 'Failed to update password');
        }
    } catch (err) {
        showError(errorEl, 'Error occurred while updating password');
        console.error(err);
    }
}

async function handleAccountDeletion() {
    const confirmPass = document.getElementById('delete-confirm-password').value;
    const errorEl = document.getElementById('delete-error');

    if (!confirmPass) {
        showError(errorEl, 'Please enter your password to confirm');
        return;
    }

    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;

    try {
        const userID = localStorage.getItem('userID');
        const query = `DELETE FROM users WHERE user_id = ${userID}`;
        const result = await DBQuery.getQueryResult(query);

        if (result.success) {
            localStorage.clear();
            window.location.href = 'index.html';
        } else {
            showError(errorEl, 'Failed to delete account');
        }
    } catch (err) {
        showError(errorEl, 'Error occurred during account deletion');
        console.error(err);
    }
}

function addButtonSoundEffects() {
    const clickSound = new Audio('css/assets/sounds/button-click.mp3');
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => clickSound.play());
    });
}

function showError(element, message) {
    element.textContent = message;
    element.style.color = 'red';
}

function showSuccess(element, message) {
    element.textContent = message;
    element.style.color = 'limegreen';
}

// Example hash function stub (replace with your real hashing logic)
async function hashPassword(password) {
    // Simulating hashing here for demo purposes
    return {
        hash: btoa(password), // Replace with real hash in production
        salt: "demo_salt"
    };

}