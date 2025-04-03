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

export class Terminal {
    static #outputTerminal;
    static #userInput;
    static #messageQueue = [];
    static #isProcessing = false;
    static textDelay = 10; // Default speed

    static initialize(outputTerminal, userInput) {
        this.#outputTerminal = outputTerminal;
        this.#userInput = userInput;
        
        // Load text speed from localStorage or settings
        const savedSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        if (savedSettings.textSpeed) {
            // Apply text speed immediately
            switch (savedSettings.textSpeed) {
                case 'slow':
                    this.textDelay = 25;
                    break;
                case 'normal':
                    this.textDelay = 10;
                    break;
                case 'fast':
                    this.textDelay = 1;
                    break;
                default:
                    this.textDelay = 10;
            }
        }
        
        console.log('Terminal initialized with text delay:', this.textDelay);
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
    static async outputMessage(message, color = "#FFFFFF") {
        if (!this.#outputTerminal) return;

        // For fast speed, skip animation completely
        if (this.textDelay <= 1) {
            const span = document.createElement("span");
            span.style.color = color;
            span.textContent = message;
            this.#outputTerminal.appendChild(span);
            this.#outputTerminal.appendChild(document.createElement("br"));
            this.#scrollToBottom();
            return;
        }

        // Add to message queue for normal typing effect
        this.#messageQueue.push({ message, color });
        
        // Start processing if not already doing so
        if (!this.#isProcessing) {
            this.#processNextMessage();
        }
    }

    static #processNextMessage() {
        if (!this.#messageQueue || this.#messageQueue.length === 0) {
            this.#isProcessing = false;
            if (typingAudio) {
                typingAudio.pause();
                typingAudio.currentTime = 0;
            }
            return;
        }

        this.#isProcessing = true;
        
        const { message, color } = this.#messageQueue.shift() || { message: '', color: '#FFFFFF' };
        
        if (!message) {
            console.warn('Attempted to process undefined/null message');
            this.#processNextMessage();
            return;
        }

        // Create message element
        const messageElement = document.createElement("div");
        messageElement.style.color = color || '#FFFFFF';
        this.#outputTerminal.appendChild(messageElement);
        
        // Start typing sound if audio is unlocked
        if (audioUnlocked) {
            typingAudio.play();
        }

        let i = 0;
        const typeWriter = () => {
            if (i < message.length) {
                messageElement.innerHTML += message.charAt(i);
                i++;
                this.#scrollToBottom();
                setTimeout(typeWriter, this.textDelay); // Use textDelay directly, no special calculations
            } else {
                if (typingAudio) {
                    typingAudio.pause();
                    typingAudio.currentTime = 0;
                }
                messageElement.appendChild(document.createElement('br'));
                this.#processNextMessage();
                this.#scrollToBottom();
            }
        };
        
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

    static getUserInputObject(){
        return this.#userInput;
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
