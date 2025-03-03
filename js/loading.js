let countdown = 5;
const countdownElement = document.getElementById("countdown");
const loadingScreen = document.getElementById("loading-screen");
const startMessage = document.querySelector(".start-message");
const countdownMessage = document.querySelector(".countdown");
const startSound = document.getElementById("start-sound");
const transbox = document.querySelector(".transbox");
const box = document.querySelector(".box");

box.style.display="none";
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        countdown--;
        transbox.style.display = "none";
        box.style.display = "block";
        updateCountdown();
    }
});

function updateCountdown(){
    if(countdown >0){
       
        countdown--;
        countdownElement.textContent = countdown;
        setTimeout(updateCountdown, 1000);

    }else{
        startSound.play();
        setTimeout(() => {
            loadingScreen.style.opacity = "0"; // Fade out loading screen
            setTimeout(() => {
                loadingScreen.style.display = "none"; // Hide loading screen
                window.location.href = "index.html"; // Redirect to main game 
            }, 1000); // Delay for smooth transition
        }), 500
    }
}