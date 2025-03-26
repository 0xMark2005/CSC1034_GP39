//-------
//Setting up the terminal
//-------

//Loading the audio file once.
const typingAudio = new Audio("css/assets/sounds/computer-keyboard.mp3");
typingAudio.volume = 1.0;  // ADDED: Increase volume to maximum for testing
typingAudio.loop = true; //repeating until done

// ADDED: Track if audio is unlocked via user interaction.
let audioUnlocked = false;

// ADDED: Unlock audio playback on first user interaction.
document.addEventListener("click", unlockAudioOnce, { once: true });
document.addEventListener("keydown", unlockAudioOnce, { once: true });
function unlockAudioOnce() {
  // Try playing and immediately pausing to unlock audio.
  typingAudio.play().then(() => {
    typingAudio.pause();
    audioUnlocked = true;
    console.log("Audio unlocked");
  }).catch((e) => {
    console.error("Audio unlock failed", e);
  });
}

export class Terminal{
    static #outputTerminal;
    static #userInput;

    static initialize(givenoutputTerminal, givenUserInput){
        this.#outputTerminal = givenoutputTerminal //get the output terminal
        this.#userInput = givenUserInput;

        if (!this.#outputTerminal || !this.#userInput) {
            console.error("Error: Terminal elements not found");
            return;
        }
    }

    // Add setter/getter for input value
    static setInputValue(value) {
        if (this.#userInput) {
            this.#userInput.value = value;
        }
    }

    static getInputValue() {
        return this.#userInput ? this.#userInput.value.trim() : '';
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
            typingAudio.pause();
            typingAudio.currentTime = 0;
            return;
        }
        this.#isProcessing = true;
        
        // Get the next message from the queue
        const { message, color } = this.#messageQueue.shift();
        
        // Create a new element for the message
        const messageElement = document.createElement("div");
        messageElement.style.color = color;
        this.#outputTerminal.appendChild(messageElement);
        
        // ADDED: Adjusted speed for audible typing effect (50ms per character)
        const speed = 5;
        let i = 0;
        
        // ADDED: Only play audio if settings allow and audio has been unlocked.
        if (window.appSettings && window.appSettings.keyboardSounds && window.appSettings.soundEnabled && audioUnlocked) {
            typingAudio.currentTime = 0;
            typingAudio.play().then(() => {
              console.log("typingAudio is playing");
            }).catch((err) => {
              console.error("Error playing typingAudio:", err);
            });
        } else {
            console.log("Not playing typingAudio (settings disabled or audio not unlocked)");
        }

        function typeWriter() {
            if (i < message.length) {
                messageElement.innerHTML += message.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // ADDED: Log when typing finishes
                console.log("Finished typing message; pausing sound.");
                typingAudio.pause(); 
                typingAudio.currentTime = 0;

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
