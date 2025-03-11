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
            console.error("Error: Input terminal could not be found, thus terminal functions will not work, please ensure an input terminal exists on this page.");
        }
    }
    else{
        console.error("Error: Output terminal could not be found, thus terminal functions will not work, please ensure an output terminal exists on this page.");
    }   
}


//-------
//Functions for outputting to terminal
//-------

//output a non-user message to the terminal
const messageQueue = [];
let isProcessing = false;

export function outputMessage(message, color) {
    // Add the message to the queue
    messageQueue.push({ message, color });
    
    // If we're not already processing a message, start processing
    if (!isProcessing) {
        processNextMessage();
    }
}

function processNextMessage() {
    // If the queue is empty, mark as not processing and return
    if (messageQueue.length === 0) {
        isProcessing = false;
        return;
    }
    isProcessing = true;
    
    // Get the next message from the queue
    const { message, color } = messageQueue.shift();
    const terminal = document.getElementById("output-terminal");
    
    // Create a new element for the message
    const messageElement = document.createElement("div");
    messageElement.style.color = color;
    terminal.appendChild(messageElement);
    
    // Set up the typewriter effect
    let i = 0;
    const speed = 10;
    
    function typeWriter() {
        if (i < message.length) {
            messageElement.innerHTML += message.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        } else {
            // When this message is done, process the next one
            processNextMessage();
            // Scroll to the bottom after each message
            scrollToBottom();
        }
    }
    
    // Start the typewriter effect for this message
    typeWriter();
}

//function to scroll to the bottom of the terminal after output
function scrollToBottom() {
    setTimeout(() => {
        outputTerminal.scrollTop = outputTerminal.scrollHeight;
    }, 10); // Small delay to ensure content is rendered before scrolling
}

//output the user's choice to the terminal


//
// Function for reading terminal input
//

export function getUserInput() {
    const inputValue = userInput.value.trim();

    const br = document.createElement('br');

    document.getElementById("output-terminal").appendChild(br);
    outputMessage(`> ${inputValue}`, "#FFFFFF");
    document.getElementById("output-terminal").appendChild(br);

    // Clear input field
    userInput.value = "";

    return inputValue;
}
