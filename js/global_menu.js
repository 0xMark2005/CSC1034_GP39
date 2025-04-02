document.addEventListener('DOMContentLoaded', () => {
    const usernameLabel = document.getElementById('username-label');
    const userButton = document.getElementById('user-button');
    const dropdown = document.getElementById('user-dropdown');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const topbarLeft = document.querySelector('.topbar-left');

    const username = localStorage.getItem('username') || 'Player';
    usernameLabel.textContent = username;
    userButton.textContent = `${username} ▾`;

    userButton.addEventListener('click', () => {
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!userButton.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    hamburgerBtn.addEventListener('click', () => {
      topbarLeft.classList.toggle('active');
    });


const logoutLink = document.querySelector('#user-dropdown a[href="logout.html"]');
logoutLink.addEventListener('click', (e) => {
  e.preventDefault();
  handleLogout();
});

function handleLogout() {
  try {
    sessionStorage.clear();
    localStorage.clear();
    const clickSound = new Audio('css/assets/sounds/button-click.mp3');
    clickSound.play();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    window.location.href = 'index.html';
  }
}


  });


  