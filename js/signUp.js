document.addEventListener("DOMContentLoaded", function () {

    
    document.getElementById("submitSignUp").addEventListener("click", function(event)
{
    var username = document.getElementById("signUpUsername").value;
    var password = document.getElementById("signUpPassword").value;
    var password2 = document.getElementById("confirmPassword").value;

    if(!validateUsernameInput(username) || !validatePasswordInput(password) || validatePasswordRepeat(password, password2))
    {
        return;
    }
    else{
        console.log("Valid user");
    }
})
});
