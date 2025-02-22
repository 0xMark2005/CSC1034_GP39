// Typewriter effect for the game

var i = 0;
var txt = 'A long time ago...'; 
var speed = 150; 

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("gameBeginsTitle").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

// This Makes the method global
window.typeWriter = typeWriter;