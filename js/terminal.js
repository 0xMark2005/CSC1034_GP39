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
        if (!this.#messageQueue || this.#messageQueue.length === 0) {
            this.#isProcessing = false;
            if (typingAudio) {
                typingAudio.pause();
                typingAudio.currentTime = 0;
            }
            return;
        }

        this.#isProcessing = true;
        
        // Get the next message from the queue
        const { message, color } = this.#messageQueue.shift() || { message: '', color: '#FFFFFF' };
        
        // Guard against undefined or null messages
        if (!message) {
            console.warn('Attempted to process undefined/null message');
            this.#processNextMessage();
            return;
        }

        // Create a new element for the message
        const messageElement = document.createElement("div");
        messageElement.style.color = color || '#FFFFFF';
        this.#outputTerminal.appendChild(messageElement);
        
        const speed = 5; // Typing speed in milliseconds
        let i = 0;
        
        const typeWriter = () => {
            if (i < message.length) {
                messageElement.innerHTML += message.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else {
                // When done typing, process next message and scroll
                this.#processNextMessage();
                this.#scrollToBottom();
            }
        };
        
        // Start the typewriter effect
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

    static displayGif(gifPath) {
        const overlay = document.getElementById('gif-overlay');
        const container = document.getElementById('gif-container');
        
        // Clear any existing GIFs
        container.innerHTML = '';
        
        // Create and display new GIF
        const gifElement = document.createElement('img');
        gifElement.src = gifPath;
        gifElement.alt = 'Game Animation';
        
        // Show overlay and GIF
        overlay.style.display = 'flex';
        container.appendChild(gifElement);

        // Remove GIF after animation
        setTimeout(() => {
            overlay.style.display = 'none';
            container.innerHTML = '';
        }, 3000); // Adjust timing based on your GIF duration
    }
}
