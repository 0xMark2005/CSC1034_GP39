//-------
//Setting up the terminal
//-------
let userInput;
let outputTerminal;
let terminalOutputContainer;

export function initialize(){
    outputTerminal = document.getElementById("output-terminal"); //get the output terminal
    if(outputTerminal){
        //set up the input terminal location
        userInput = document.getElementById("user-input");

        if(userInput){
            //set up the list the terminal outputs will be held in
            terminalOutputContainer = document.getElementById("terminal-output-container");
            if (!terminalOutputContainer) { // If there is no output container
                terminalOutputContainer = document.createElement("ul");
                terminalOutputContainer.id = "terminal-output-container";
            }

            //add the output list to the output terminal
            outputTerminal.appendChild(terminalOutputContainer);
        }
        else{
            alert("Input terminal could not be found, thus terminal functions will not work, please ensure an input terminal exists on this page.");
        }
    }
    else{
        alert("Output terminal could not be found, thus terminal functions will not work, please ensure an output terminal exists on this page.");
    }   
}


//-------
//Functions for outputting to terminal
//-------

//output a non-user message to the terminal
export function outputMessage(message, color){
    const systemMessage = document.createElement("li");
    systemMessage.textContent = message;

    //message styling
    systemMessage.style.color = color;
    //systemMessage.style.fontSize = '12px';

    terminalOutputContainer.appendChild(systemMessage);
    scrollToBottom();
}

//function to scroll to the bottom of the terminal after output
function scrollToBottom() {
    setTimeout(() => {
        outputTerminal.scrollTop = outputTerminal.scrollHeight;
    }, 10); // Small delay to ensure content is rendered before scrolling
}

//output the user's choice to the terminal
function outputUserChoice(message){
    const userMessage = document.createElement("li");
    userMessage.textContent = `> ${message}`;

    //message styling
    userMessage.style.color = "#FFFFFF";

    //output message
    terminalOutputContainer.appendChild(userMessage);
    scrollToBottom();
}



//
// Function for reading terminal input
//

export function getUserInput(){
    const inputValue = userInput.value.trim();
    outputUserChoice(inputValue);

    userInput.value = "";

    return inputValue;
}