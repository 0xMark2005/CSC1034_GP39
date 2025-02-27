document.addEventListener('DOMContentLoaded', function () {
  const gameDiv = document.getElementById("gameBegins");
  gameDiv.style.display = "block"; 
  // declare varabiables
  var i = 0; // Starting at 0, increases through the string txt as each letter is outputted
  var txt = 'A long time ago...'; // String to be wrote out through the typewriter
  var speed = 150; // Speed or how long it will take to output the string

  // Declare Function name which will be called in menu.js when the user enters 1 to start the game
  function typeWriter() {
      // Find h1 id 
      var titleElement = document.getElementById("gameBeginsTitle");
      // Start outputting the string to h1m passing and maintaining one letter at a time
      if (i < txt.length) {
          titleElement.innerHTML += txt.charAt(i);
          i++;
          setTimeout(typeWriter, speed);
      }
  }

  // Expose typeWriter globally, to be called in menu.js
  window.typeWriter = typeWriter;

  // **************************************************************************
  // Start of Game code & logic
  // NO USE of chat gpt for game, to prevent it from becoming too complex
  // Outline of game used
  // https://docs.google.com/document/d/10vEChyI5rYxC-jqJ5iqyOHsHxPu-rPtpbLo5ev2xXbg/edit?pli=1&tab=t.0
  // **************************************************************************

  // ACT 1: Gathering the revolutionaries
  // Village is burning so main character required to find allies.
  // I am not sure whether we want to store the potential allies locally or through database.
  // For now it will be locally. In Arrays

  // First create possible list of allies && Have key words the ally may say?
  // E.G Kings bastard may describe someone as 'peasant', 'fool', etc
  // FORMAT: "ALLY NAME", [DESCRIPTIONS OF MAIN CHARACTER], "LOCATION", "Description of task to save ally"

  var allies = new Array();
  allies = [
    {
      name: "Kings Bastard",
      descriptions: ["Peasant", "Fool", "Weakling"],
      location: "A War Prison",
      task: "Infiltrate and break him out."
    },
    {
      name: "The Exiled General",
      descriptions: ["Noble", "Warrior", "Brave"],
      location: "The Slums",
      task: "Prove yourself in a high-stakes deception game."
    },
    {
      name: "The Underground Rebel Leader",
      descriptions: ["Intelligent", "Charming", "Sketchy"],
      location: "A Hidden Rebel Camp",
      task: "Survive a test of loyalty and commitment."
    }
  ];

  // Get the paragraph in index.html which will be changed to facilitate the meeting of an ally
  var gameOutputParagraph = document.getElementById("gameOutputParagraph");

  // Function to get a random phrase/description for a specific ally
  function getRandomPhrase(allyIndex) {
    let ally = allies[allyIndex]; // Access the ally object directly
    let phrases = ally.descriptions; // Get the descriptions array for the ally
    let randomPhraseIndex = Math.floor(Math.random() * phrases.length); // Pick a random phrase
    return phrases[randomPhraseIndex]; // Return the phrase
  }

  // This function will randomly select an ally and a phrase, then update the HTML paragraph found above
  function meetAlly() {
    let allyIndex = Math.floor(Math.random() * allies.length); // Pick a random ally
    let ally = allies[allyIndex]; // Access the ally object
    let allyName = ally.name; // Get the ally's name
    let randomPhrase = getRandomPhrase(allyIndex); // Get a random phrase for this ally

    // Set the paragraph text to show the ally's name and phrase
    gameOutputParagraph.innerHTML = `You encounter ${allyName}. They call you: ${randomPhrase}.`;
  }

  // Call the function to output a random ally and phrase (This is techinically called as soon as the user loads the website because of how we
  // loaded in the <Scripts>)
  meetAlly();

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  // Introductions which will be used when the user first spawns in.
  // This will be the very start of the game (techinically speaking)
  // The array for now will appear like in chronological order (the bigger it is the more declines the user can do)
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  
  var introductions = new Array();
  introductions = [
    {
      location: "Hobo Camp",
      intro: "After another long nap you wake up to a rumbling belly",
      action: "A mysterious man offers you some food in return for a favour",
      options: [
      { choice: "1. Accept the offer", outcome: "You take the food. The man seems trustworthy." , 
          followUps: [ "The Man takes you to ..."

      ]},
      { choice: "2. Refuse the offer", outcome: "You refuse. The man shrugs and walks away." },
      { choice: "3. Ask the man more questions", outcome: "The man gives you a sly grin, 'Curiosity is dangerous.'" }
    ]
    },]

  
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  // Handling the logic once the user selects a choice.
  // From here should it be random? 
  // Should it trigger events? 
  // In my opinion each of the three 
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


  // Functions to simulate a GENERAL Allies response To different outcomes, These will be used when user interacts with characters.
  // We could add sounds, personalised responses etc
  // Failure function (Could be extended in literally a thousand ways)
  function failure(){
    gameOutputParagraph.innerHTML = "You failed to recruit the Ally. The Ally is not impressed with your efforts"
  }
  // Successful function
  function successful(){
    gameOutputParagraph.innerHTML = "You successfully recruited the Ally. The Ally is very happy with you !"
  }
  // Abandon function (user quits the recruitment)
  function abandon(){
    gameOutputParagraph.innerHTML = "You decided to leave the Ally."
  }



});
