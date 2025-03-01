document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-button").onclick = openPage("../html/login.html");
    document.getElementById("signup-button").onclick = openPage("../html/signup.html");
});

function openPage(htmlFileLocation){
    window.location.href = htmlFileLocation;
}