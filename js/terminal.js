//-------
//Setting up the terminal
//-------

export class Terminal{
    static #outputTerminal;
    static #userInput;

    static initialize(givenoutputTerminal, givenUserInput){
        this.#outputTerminal = givenoutputTerminal //get the output terminal
        if(this.#outputTerminal){
            //set up the input terminal location
            this.#userInput = givenUserInput;

            if(!this.#userInput){
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
    static #messageQueue = [];
    static #isProcessing = false;

    static outputMessage(message, color) {
        // Add the message to the queue
        this.#messageQueue.push({ message, color });
        
        // If we're not already processing a message, start processing
        if (!this.#isProcessing) {
            this.#processNextMessage();
        }
    }

    static #processNextMessage() {
        // If the queue is empty, mark as not processing and return
        if (this.#messageQueue.length === 0) {
            this.#isProcessing = false;
            return;
        }
        this.#isProcessing = true;
        
        // Get the next message from the queue
        const { message, color } = this.#messageQueue.shift();
        
        // Create a new element for the message
        const messageElement = document.createElement("div");
        messageElement.style.color = color;
        this.#outputTerminal.appendChild(messageElement);
        
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
                Terminal.#processNextMessage();
                // Scroll to the bottom after each message
                Terminal.#scrollToBottom();
            }
        }
        
        // Start the typewriter effect for this message
        typeWriter();
    }

    //function to scroll to the bottom of the terminal after output
    static #scrollToBottom() {
        setTimeout(() => {
            this.#outputTerminal.scrollTop = this.#outputTerminal.scrollHeight;
        }, 10); // Small delay to ensure content is rendered before scrolling
    }

    //output the user's choice to the terminal


    //
    // Function for reading terminal input
    //

    static getUserInput() {
        const inputValue = this.#userInput.value.trim();

        const br = document.createElement('br');

        this.#outputTerminal.appendChild(br);
        this.outputMessage(`> ${inputValue}`, "#FFFFFF");
        this.#outputTerminal.appendChild(br);

        // Clear input field
        this.#userInput.value = "";

        return inputValue;
    }
}
