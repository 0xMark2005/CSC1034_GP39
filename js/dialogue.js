//-------
//Functions for outputting to terminal
//-------

//output the user's choice to the terminal
function outputUserChoiceToTerminal(outputTerminal, message){
    const userMessage = document.createElement("li");
    userMessage.textContent = message;

    //message styling
    userMessage.style.color = "#FFFFFF";

    outputTerminal.appendChild(userMessage);
    scrollToBottom();
}

//output a non-user message to the terminal
function outputMessageToTerminal(outputTerminal, message){
    const systemMessage = document.createElement("li");
    systemMessage.textContent = message;

    //message styling
    systemMessage.style.color = color;
    systemMessage.style.fontSize = '12px';

    outputTerminal.appendChild(systemMessage);
    scrollToBottom();
}

//function to scroll to the bottom of the terminal after output
function scrollToBottom(outputTerminal) {
    setTimeout(() => {
        terminal.scrollTop = terminal.scrollHeight;
    }, 10); // Small delay to ensure content is rendered before scrolling
}