// Imports
import SettingsManager from "../settingsManager.js";
import { GameTracker } from "./game_tracker.js";
import { Terminal } from "../terminal.js";
import { AllyManager } from "./ally_manager.js";

//Output color
const systemColor = "#00FF00";
const optionsColor = "#00FF00";
const errorColor = "#FF0000";
const optionResultColor = "#0000FF";

//Constants
export const maxInventorySpace = 4;

//Variables
let cancelMethod;
let completeMethod;
let currentInventoryClickHandlers = [];
let userInput;
let chosenAlly = null;
let chosenItem = null;

//
//Function to load inventory items to the html
//
export async function loadInventoryItemVisuals(){
  // Retrieve settings using SettingsManager
  const settings = await SettingsManager.getSettings();
  // Use soundEnabled instead of keyboardSounds
  const shouldPlaySound = settings.soundEnabled; 

  //clear current inventory
  for(let i = maxInventorySpace; i > 0; i--){
    //Grab html inventory slot
    let inventorySpaceId = `inventory-space-${i}`;
    let inventorySpace = document.getElementById(inventorySpaceId);

    //clear inner HTML
    inventorySpace.innerHTML = "";
    
    //remove other classes
    inventorySpace.classList.remove(...inventorySpace.classList);
    inventorySpace.classList.add("inventory-item-container");

    //remove current click handler
    if(currentInventoryClickHandlers[i-1]){
      inventorySpace.removeEventListener('click', currentInventoryClickHandlers[i-1]);
      currentInventoryClickHandlers.pop();
    }
  }

  //set new inventory
  for(let i = 0; i < GameTracker.inventory.length; i++){
    //Grab html inventory slot
    let inventorySpaceId = `inventory-space-${i+1}`;
    let inventorySpace = document.getElementById(inventorySpaceId);

    let currentItem = GameTracker.inventory[i]; //the current item being added to inventory

    //create the image element
    const img = document.createElement('img');
    img.src = currentItem.image;
    img.alt = currentItem.name;
    img.title = currentItem.title || currentItem.name;
    inventorySpace.appendChild(img);

    //
    // Open modal when clicked instead of inline expansion
    //
    const inventorySpaceHandler = (event) => {
      //play sound when clicked
      if (shouldPlaySound) {
        new Audio('css/assets/sounds/button-click.mp3').play();
      }
      openInventoryModal(currentItem);
    };
    
    inventorySpace.addEventListener('click', inventorySpaceHandler);
    currentInventoryClickHandlers.push(inventorySpaceHandler);
  }
}

// New function to open the modal overlay for an inventory item
function openInventoryModal(item) {
  // Create overlay div
  const overlay = document.createElement('div');
  overlay.classList.add('inventory-modal-overlay');

  // Create modal content div with expanding animation
  const modal = document.createElement('div');
  modal.classList.add('inventory-modal-content');

  // Close button (×)
  const closeButton = document.createElement('button');
  closeButton.classList.add('inventory-modal-close');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  modal.appendChild(closeButton);

  // Optional: Display the item image
  const itemImage = document.createElement('img');
  itemImage.src = item.image;
  itemImage.alt = item.name;
  itemImage.style.width = "60px";
  itemImage.style.height = "60px";
  modal.appendChild(itemImage);

  // Item name
  const nameElement = document.createElement('strong');
  nameElement.textContent = item.name;
  modal.appendChild(nameElement);

  // Item description
  const descriptionElement = document.createElement('p');
  descriptionElement.textContent = item.description || 'No description available';
  modal.appendChild(descriptionElement);

  // Action button for equipment or consumable items
  if (item.equipment || item.consumable) {
    const actionBtn = document.createElement('button');
    actionBtn.textContent = item.equipment ? "EQUIP" : "USE";
    actionBtn.classList.add('item-action-button');
    actionBtn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent modal background click
      // Play sound if enabled
      const settings = await SettingsManager.getSettings();
      if (settings.soundEnabled) {
        new Audio('css/assets/sounds/button-click.mp3').play();
      }
      // Show waterfall animation effect
      createItemUseAnimation(item.image);
      
      if (item.equipment) {
        // Open ally selection for equipping
        chosenItem = item;
        let allies = AllyManager.getAllAliveAllies();
        
        Terminal.outputMessage(`Choose an ally to equip ${item.name}:`, systemColor);
        for(let i = 0; i < allies.length; i++){
          Terminal.outputMessage(`${i+1}. ${allies[i].name}`, optionsColor);
        }
        
        // For demo purposes, close modal after 1 second
        setTimeout(() => {
          if(document.body.contains(overlay)){
            document.body.removeChild(overlay);
          }
        }, 1000);
        
      } else if (item.consumable) {
        // Handle consumable item usage
        Terminal.outputMessage(`Using ${item.name}...`, optionResultColor);
        setTimeout(() => {
          if(document.body.contains(overlay)){
            document.body.removeChild(overlay);
          }
        }, 1000);
      }
    });
    modal.appendChild(actionBtn);
  }

  // Append modal to overlay and overlay to body
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Collapse modal if overlay (grey background) is clicked
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
}

// New function to create the waterfall animation effect when using items
function createItemUseAnimation(imageSrc) {
  // Create multiple copies for waterfall effect
  for (let i = 1; i <= 5; i++) {
    const animDiv = document.createElement('div');
    animDiv.classList.add('item-use-animation', `item-path-${i}`);
    
    const imgClone = document.createElement('img');
    imgClone.src = imageSrc;
    imgClone.alt = "Used item";
    
    animDiv.appendChild(imgClone);
    document.body.appendChild(animDiv);
    
    // Remove the element after animation completes
    setTimeout(() => {
      animDiv.remove();
    }, 1500);
  }
}

// The rest of your inventory management functions remain the same...
export async function addItem(item){
  //if inventory is full
  if(GameTracker.inventory.length >= maxInventorySpace){
    Terminal.outputMessage(`Cannot add ${item.name} to inventory as inventory is full.`, errorColor);
    return false;
  }

  //add item to inventory
  GameTracker.inventory.push(item);
  Terminal.outputMessage(`${item.name} was added to the inventory.`, optionResultColor);
  await loadInventoryItemVisuals();
  return true;
}

export async function removeItem(item){
  //check if the item is in the inventory
  for(let i = 0; i < GameTracker.inventory.length; i++){
    //if found in the inventory
    if(GameTracker.inventory[i] === item){
      //get index of item, remove it, and change index of proceeding items by -1
      let index = GameTracker.inventory.indexOf(item);
      GameTracker.inventory.splice(index, 1);

      //load visuals again and log
      await loadInventoryItemVisuals();
      console.log(`Item: ${item.name} was removed from the inventory`);
      Terminal.outputMessage(`${item.name} was removed from the inventory.`, optionResultColor);
      return true;
    }
  }

  //if item could not be found in inventory
  console.log(`${item.name} could not be found in inventory.`)
  return false;
}

// Rest of your existing code continues...

//
// Methods to set / clear the chosenAlly and chosenItem variables
//
function clearChoices(){
  chosenAlly = null;
  chosenItem = null;
}

export function setChosenAlly(ally){
  chosenAlly = ally;
}

export function setChosenItem(item){
  chosenItem = item;
}

//
// Confirmation method
//

//function to take input for user confirmation
function letUserConfirm(message){
  //output message
  Terminal.outputMessage(message, systemColor);
  Terminal.outputMessage(`(Yes / No)`, optionsColor);

  //set input so user can choose an item to equip
  const confirmInput = function(event){
    if (!Terminal.getInputValue()) { return; } //return if no input is given
    if(event.key === "Enter"){
      const input = Terminal.getUserInput().toLowerCase();

      //if confirmed
      if(input === "y" || input === "yes" || input === "confirm"){
        document.dispatchEvent(new CustomEvent("confirmationMade", {detail: {confirm: true}}));
        return;
      }
      else if(input === "n" || input === "no" || input === "cancel"){ //if cancelled
        document.dispatchEvent(new CustomEvent("confirmationMade", {detail: {confirm: false}}));
        return;
      }

      //if choice was invalid
      Terminal.outputMessage("Invalid choice!", errorColor);
    }
  }
  setInputHandler(confirmInput);
}


//
// Replace item (outside of Inventory Manager)
//
export async function chooseItemToReplaceOutsideManager(confirmMessage, item){
  userInput = Terminal.getUserInputObject(); //set user input
  cancelMethod = () => cancelItemReplacement(); //set the method when user cancels
  completeMethod = async () => await replaceItemBeforeReturn(item);

  //method to go when confirmation is made
  const confirmation = function(event){
    //if confirmed
    if(event.detail.confirm){
      removeItemFromInventory();
      return;
    }
    
    //if cancelled
    cancelMethod();
  }

  document.addEventListener("confirmationMade", confirmation, {once: true});
  letUserConfirm(confirmMessage);
}

async function replaceItemBeforeReturn(item){
  await addItem(item);
  returnToMainInput(false);
  document.dispatchEvent(new CustomEvent("itemAddChoiceComplete"));
}

async function cancelItemReplacement(){
  returnToMainInput(false);
  document.dispatchEvent(new CustomEvent("itemAddChoiceComplete"));
}


//
// Function to return to main game input
//
function returnToMainInput(displayDialogueAgain){
  clearChoices();
  removeInputHandler();
  document.dispatchEvent(new CustomEvent("disableOtherInput", {detail: {displayDialogue: displayDialogueAgain}}));
}



//
// Inventory manager
//

// Function to remove any current input handler
function removeInputHandler(){
  if(userInput.currentHandler){
    userInput.removeEventListener("keypress", userInput.currentHandler);
  }
}

// Function used when setting input handler
function setInputHandler(handler){
  removeInputHandler();
  userInput.addEventListener("keypress", handler);
  userInput.currentHandler = handler;
}

// Function to open the inventory management menu
export function openInventoryManager(){
  userInput = Terminal.getUserInputObject(); //set the user input

  //set method to run when another method is cancelled / completed
  cancelMethod = openInventoryManager;
  completeMethod = openInventoryManager;

  //clear current item and ally
  clearChoices();

  console.log(GameTracker.inventory);
  //Output management options
  Terminal.outputMessage("--- Inventory Manager ---", systemColor);
  let managementOptions = ["Equip item", "Unequip item", "Use item", "Remove item", "Exit"];
  for(let i = 0; i < managementOptions.length; i++){
    Terminal.outputMessage(`${i+1}. ${managementOptions[i]}`, optionsColor);
  }

  //add inventory management input method
  const inventoryManagementInput = function(event){
    if(event.key === "Enter"){
      if (!Terminal.getInputValue()) { return; } //if input is empty
      try{
        const input = parseInt(Terminal.getUserInput());

        switch(input){
          case 1: equipItem(); break;
          case 2: unequipItem(); break;
          case 3: useItem(); break;
          case 4: removeItemFromInventory(); break;
          case 5: exitInventoryManager(); break;
          default: Terminal.outputMessage("Please choose a valid option", errorColor); break;
        }
      }
      catch(error){
        console.log(error);
        Terminal.outputMessage("Please choose a valid option", errorColor);
      }
    }
  }
  setInputHandler(inventoryManagementInput);
}

//
// Input methods for choosing items / allies 
//

/**
 * Method lets user choose an item from an array and sets chosenItem equal to this
 * If user cancels, chosenItem will be set to null
 * @param {*} items array of items user can choose from
 * @param {*} emptyArrayMessage message if the given array is empty
 * @param {*} message message before outputting all options
 * Dispatches for 'itemChosenOrCancelled' event
 */
function letUserChooseItem(items, emptyArrayMessage, message){
  //if empty array
  if(items.length === 0){
    Terminal.outputMessage(emptyArrayMessage, optionResultColor);
    document.dispatchEvent(new CustomEvent("itemChosenOrCancelled"));
    chosenItem = null;
    return;
  }

  //output all items in array
  Terminal.outputMessage(message, systemColor);
  for(let i = 0; i < items.length; i++){
    Terminal.outputMessage(`${i+1}. ${items[i].name}`, optionsColor);
  }
  Terminal.outputMessage(`${items.length + 1}. Cancel`, optionsColor);

  //set input so user can choose an item to equip
  const chooseItemInput = function(event){
    if (!Terminal.getInputValue()) { return; } //return if no input is given
    if(event.key === "Enter"){
      const input = Terminal.getUserInput().toLowerCase();

      //if a valid item is selected, move to letting a user select an ally to equip it to
      for(let i = 0; i < items.length; i++){
        if(input == i+1){
          chosenItem = items[i];
          document.dispatchEvent(new CustomEvent("itemChosenOrCancelled"));
          return;
        }
      }

      //if user chose to cancel
      if(input == items.length + 1){
        Terminal.outputMessage("Cancelling...", optionResultColor);
        chosenItem = null;
        document.dispatchEvent(new CustomEvent("itemChosenOrCancelled"));
        return;
      }

      //if choice was invalid
      Terminal.outputMessage("Invalid choice!", errorColor);
    }
  }
  setInputHandler(chooseItemInput);
}

/**
 * Method lets user choose an ally from an array and sets chosenAlly equal to this
 * If user cancels, chosenAlly will be set to null
 * @param {*} allies array of allies user can choose from
 * @param {*} emptyArrayMessage message if the given array is empty
 * @param {*} message message before outputting all options
 * Dispatches for 'allyChosenOrCancelled' event
 */
function letUserChooseAlly(allies, emptyArrayMessage, message){
  //if empty array
  if(allies.length === 0){
    Terminal.outputMessage(emptyArrayMessage, optionResultColor);
    document.dispatchEvent(new CustomEvent("allyChosenOrCancelled"));
    chosenAlly = null;
    return;
  }

  //output all allies in array
  Terminal.outputMessage(message, systemColor);
  for(let i = 0; i < allies.length; i++){
    Terminal.outputMessage(`${i+1}. ${allies[i].name}`, optionsColor);
  }
  Terminal.outputMessage(`${allies.length + 1}. Cancel`, optionsColor);

  //set input so user can choose an ally to equip
  const chooseAllyInput = function(event){
    if (!Terminal.getInputValue()) { return; } //return if no input is given
    if(event.key === "Enter"){
      const input = Terminal.getUserInput().toLowerCase();

      //if a valid item is selected, move to letting a user select an ally to equip it to
      for(let i = 0; i < allies.length; i++){
        if(input == i+1){
          chosenAlly = allies[i];
          document.dispatchEvent(new CustomEvent("allyChosenOrCancelled"));
          return;
        }
      }

      //if user chose to cancel
      if(input == allies.length + 1){
        Terminal.outputMessage("Cancelling...", optionResultColor);
        chosenAlly = null;
        document.dispatchEvent(new CustomEvent("allyChosenOrCancelled"));
        return;
      }

      //if choice was invalid
      Terminal.outputMessage("Invalid choice!", errorColor);
    }
  }
  setInputHandler(chooseAllyInput);
}

//
// From main management options
//

//
// Exit
//
function exitInventoryManager(){
  //remove inventory management input
  returnToMainInput(true);
  Terminal.outputMessage("Closing inventory manager...", optionResultColor);
}

//
// Equip Item
//
function equipItem(){
  //let user choose an item from the list of items that can be equipped
  let equippableItems = GameTracker.inventory.filter(item => item.equipment);
  let itemArrayEmptyMessage = "You have no items that can be equipped.";
  let itemMessage = "Choose an item to equip: ";

  //method to go when an item is chosen
  const itemChosen = function(){
    //if no item was chosen
    if(chosenItem === null){
      openInventoryManager();
      return;
    }

    //if item was chosen move to choose an ally
    let allies = AllyManager.getAllAliveAllies();//get all alive allies
    let allyArrayEmptyMessage = "No alive allies were found";
    let allyMessage = `Choose an ally to equip ${chosenItem.name}`;

    //method to go when an ally is chosen
    const allyChosen = function(){
      //if no ally was chosen
      if(chosenAlly === null){
        openInventoryManager();
        return;
      }
      //if ally was chosen, move to equipping the item
      equipItemOnAlly();
    }

    document.addEventListener("allyChosenOrCancelled", allyChosen, {once: true});
    letUserChooseAlly(allies, allyArrayEmptyMessage, allyMessage);
  }

  document.addEventListener("itemChosenOrCancelled", itemChosen, {once: true});
  letUserChooseItem(equippableItems, itemArrayEmptyMessage, itemMessage);
}

//Equip item to chosen ally
async function equipItemOnAlly(){
  //if chosenItem or chosenAlly are not found
  if(!chosenItem || !chosenAlly){
    Terminal.outputMessage("Chosen item and ally could not be found, pelase try again.", errorColor);
    openInventoryManager();
    return;
  }

  //equip to ally
  if(await AllyManager.equipItem(chosenAlly, chosenItem)){
    Terminal.outputMessage(`${chosenAlly.name} equipped ${chosenItem.name}`, optionResultColor);
    showWaterfallEffect(chosenItem);
    openInventoryManager();
    return;
  }

  //if the item could not be equipped
  console.error(`Error when equipping item: ${chosenItem} to ally: ${chosenAlly}`);
  Terminal.outputMessage("An error occurred when attempting to equip the item, please try again. (You may need to re-launch your save file)", errorColor);
  openInventoryManager();
}

//
// Unequip item
//
function unequipItem(){
  //let user choose an item from the list of items that can be equipped
  let allies = GameTracker.allies.filter(ally => ally.equipmentId);
  let allyArrayEmptyMessage = "None of your allies have any items to unequip.";
  let allyMessage = "Choose the ally you would like to unequip an item from";

  //method to go when an ally is chosen
  const allyChosen = function(){
    //if no ally was chosen
    if(chosenAlly === null){
      openInventoryManager();
      return;
    }
    //if ally was chosen, move to unequipping the item
    unequipItemFromAlly();
  }

  document.addEventListener("allyChosenOrCancelled", allyChosen, {once: true});
  letUserChooseAlly(allies, allyArrayEmptyMessage, allyMessage);
}

//Unequip item from chosen ally
async function unequipItemFromAlly(){
  //if chosenItem or chosenAlly are not found
  if(!chosenAlly){
    Terminal.outputMessage("Chosen ally could not be found, pelase try again.", errorColor);
    openInventoryManager();
    return;
  }

  //unequip from ally
  if(await AllyManager.unequipItem(chosenAlly)){
    Terminal.outputMessage(`${chosenAlly.name} unequipped their item.`, optionResultColor);
    openInventoryManager();
    return;
  }

  //if item could not be unequipped
  console.error(`Error when unequipping from ally: ${chosenAlly}`);
  Terminal.outputMessage("An error occurred when attempting to equip the item, please try again. (You may need to re-launch your save file)", errorColor);
  openInventoryManager();
}

//
// Use Item
//
function useItem(){
  //let user choose an item from the list of items that can be used
  let useableItems = GameTracker.inventory.filter(item => item.consumable);
  let itemArrayEmptyMessage = "You have no items that can be used.";
  let itemMessage = "Choose an item to use: ";

  //method to go when an item is chosen
  const itemChosen = function(){
    //if no item was chosen
    if(chosenItem === null){
      openInventoryManager();
      return;
    }
    //if item was chosen move to choose an ally
    let allies = AllyManager.getAllAliveAllies();//get all alive allies
    let allyArrayEmptyMessage = "No alive allies were found.";
    let allyMessage = `Choose an ally to use ${chosenItem.name}:`;

    //method to go when an ally is chosen
    const allyChosen = function(){
      //if no ally was chosen
      if(chosenAlly === null){
        openInventoryManager();
        return;
      }
      //if ally was chosen, move to using the item
      useItemOnAlly();
    }

    document.addEventListener("allyChosenOrCancelled", allyChosen, {once: true});
    letUserChooseAlly(allies, allyArrayEmptyMessage, allyMessage);
  }

  document.addEventListener("itemChosenOrCancelled", itemChosen, {once: true});
  letUserChooseItem(useableItems, itemArrayEmptyMessage, itemMessage);
}

//Use the chosen item on the chosen ally
async function useItemOnAlly(){
  //if chosenItem or chosenAlly are not found
  if(!chosenItem || !chosenAlly){
    Terminal.outputMessage("Chosen item and ally could not be found, pelase try again.", errorColor);
    openInventoryManager();
    return;
  }

  //use on ally
  if(await AllyManager.useItem(chosenAlly, chosenItem)){
    Terminal.outputMessage(`${chosenAlly.name} used ${chosenItem.name}.`, optionResultColor);
    openInventoryManager();
    return;
  }

  //if the item could not be used
  console.log(`Could not use item: ${chosenItem} on ally: ${chosenAlly}.`);
  Terminal.outputMessage("This item cannot be used on this ally!", errorColor);
  openInventoryManager();
}

//
// Remove item
//
function removeItemFromInventory(){
  //let user choose an item from the list of items that can be removed
  let removableItems = GameTracker.inventory.filter(item => !item.keyItem);
  let itemArrayEmptyMessage = "You have no items that can be removed.";
  let itemMessage = "Choose an item to remove: ";

  //method to go when an item is chosen
  const itemChosen = function(){
    //if no item was chosen
    if(chosenItem === null){
      cancelMethod();
      return;
    }

    //method to go when confirmation is made
    const confirmation = function(event){
      //if confirmed
      if(event.detail.confirm){
        removeChosenItem();
        return;
      }
      
      //if cancelled
      Terminal.outputMessage(`Cancelled.`, optionResultColor);
      cancelMethod();
    }

    document.addEventListener("confirmationMade", confirmation, {once: true});
    letUserConfirm(`Are you sure you want to remove ${chosenItem.name} from your inventory?`);

  }

  document.addEventListener("itemChosenOrCancelled", itemChosen, {once: true});
  letUserChooseItem(removableItems, itemArrayEmptyMessage, itemMessage);
}

//Remove the chosen item from the inventory
async function removeChosenItem(){
  //if chosenItem or chosenAlly are not found
  if(!chosenItem){
    Terminal.outputMessage("Chosen item could not be found, pelase try again.", errorColor);
    cancelMethod();
    return;
  }

  //remove from inventory
  if(await removeItem(chosenItem)){
    completeMethod();
    return;
  }

  //if the item could not be removed
  console.error(`Error when removing item: ${chosenItem}.`);
  Terminal.outputMessage("Item could not be removed from inventory.", errorColor);
  cancelMethod();
}
