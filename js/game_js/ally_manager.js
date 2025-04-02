import {GameTracker} from "./game_tracker.js";
import { Terminal } from "../terminal.js";
import * as Inventory from "./inventory.js";

export class AllyManager{

    //Variables
    static optionResultColor = "#0000FF";


    // Helper function to classify stat values
    static classifyStatValue(value) {
        if (value < 16) return 'low';
        if (value < 40) return 'medium-low';
        if (value < 60) return 'medium-high';
        return 'high'; // Anything above 10 gets 'high' class
    }
    //allies
    static async loadAllyVisuals() {
        const alliesData = GameTracker.allies; // Retrieve allies from GameTracker.allies
    
        if (!alliesData || alliesData.length === 0) {
            console.error('No allies data found');
            return;
        }
    
        console.log('Allies Data:', alliesData);
    
        // Loop through and check the number of character divs
        const characterDivs = document.querySelectorAll('.character');
        
        console.log(`Found ${characterDivs.length} character divs, expecting ${alliesData.length}`);
        
        // If the number of character divs is less than the number of allies, generate new divs
        if (characterDivs.length < alliesData.length) {
            console.warn(`Not enough .character divs in HTML. Expected ${alliesData.length}, found ${characterDivs.length}.`);
            AllyManager.generateCharacterDivs(alliesData.length - characterDivs.length);  // Call generateCharacterDivs statically
        }
    
        const updatedCharacterDivs = document.querySelectorAll('.character');
        console.log('Updated Character Divs:', updatedCharacterDivs);
    
        // Hide all characters initially
        updatedCharacterDivs.forEach(characterDiv => {
            characterDiv.classList.add('hidden');
        });
    
        for (let i = 0; i < alliesData.length; i++) {
            let ally = alliesData[i];
            console.log(ally);
            const characterDiv = updatedCharacterDivs[i];
    
            if (!characterDiv) {
                console.error(`Character div not found for ally ${ally.name}`);
                continue;
            }
    
            // Show the div for this ally if it is unlocked
            characterDiv.classList.remove('hidden');
    
            const leftDiv = characterDiv.querySelector('.cleft');
            const rightDiv = characterDiv.querySelector('.cright');

            //if the ally has an item equipped
            let itemSrc = "";
            let itemAlt = "";
            if(ally.equipmentId){
                let item = GameTracker.allyEquipment.find(item => item.id === ally.equipmentId); //gets the item for that ally

                //if the item was not found in array
                if(!item){
                    console.error(`Error: item id ${ally.equipmentId} for ally ${ally.name} was not found in allyequipment array`);
                }

                itemSrc = item.image;
                itemAlt = `${item.name} \n ${item.description}`;
            }

            if (leftDiv && rightDiv) {
                const characterImg = leftDiv.querySelector('img');
                const itemImg = leftDiv.querySelector('.tool img');

                //adds character and equipment images
                characterImg.src = `${ally.imgFolder}/character.png`;
                characterImg.alt = `${ally.name}`;
                itemImg.src = itemSrc;
                itemImg.alt = itemAlt;

                itemSrc === "" ? itemImg.style.display = "none" : itemImg.style.display = "block"; //hides image if character doesnt have an item

                rightDiv.querySelector('h1').textContent = ally.name;
                rightDiv.querySelector('.hp-bar-fill').style.width = `${(ally.hp / ally.maxHp) * 100}%`;  
                rightDiv.querySelector('.stat-row:nth-child(1) .stat-value').textContent = ally.attack || '0'; 
                rightDiv.querySelector('.stat-row:nth-child(2) .stat-value').textContent = ally.defence || '0';
                rightDiv.querySelector('.stat-row:nth-child(3) .stat-value').textContent = ally.intelligence || '0';
                //rightDiv.querySelector('.stat-row:nth-child(4) .stat-value').textContent = ally.maxHp || '0'; 


                rightDiv.querySelector('.stat-row:nth-child(1) .stat-value').classList.add(AllyManager.classifyStatValue(ally.attack));
                rightDiv.querySelector('.stat-row:nth-child(2) .stat-value').classList.add(AllyManager.classifyStatValue(ally.defence));
                rightDiv.querySelector('.stat-row:nth-child(3) .stat-value').classList.add(AllyManager.classifyStatValue(ally.intelligence));

            } else {
                console.error('Error: Missing .cleft or .cright divs for ally', ally.name);
            }
        }
    }
    
    
    // Function to generate character divs dynamically
    static async generateCharacterDivs(missingDivs) {
        const leftPanel = document.getElementById('left-panel');
        
        console.log(`Generating ${missingDivs} character divs...`);
        
        for (let i = 0; i < missingDivs; i++) {
            const characterDiv = document.createElement('div');
            characterDiv.classList.add('character');
            
            characterDiv.innerHTML = `
                <div class="cleft">
                    <img src="" alt="" />
                    <div class="tool"> <img src="" alt="" /> </div>
                </div>
                <div class="cright">
                    <h1></h1>
                    <div class="hp-container">
                        <span class="hp-label">HP:</span>
                        <div class="hp-bar">
                            <div class="hp-bar-fill" style="width: 100%;"></div>
                        </div>
                    </div>
                    <div class="character-stats">
                        <div class="stat-row">
                            <div class="stat-label">Attack</div>
                            <div class="stat-value">0</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">Defence</div>
                            <div class="stat-value">0</div>
                        </div>
                        <div class="stat-row">
                            <div class="stat-label">Intelligence</div>
                            <div class="stat-value">0</div>
                        </div>
                    </div>
                </div>
            `;
            
            leftPanel.appendChild(characterDiv);
        }
    
        console.log('Character divs generated.');
    }
    
    







    // function returns the array of allies that are alive
    static getAllAliveAllies(){
        let aliveAllies = GameTracker.allies.filter(ally => ally.alive);
        return aliveAllies;
    }


    //function to use an item on an ally
    static async useItem (ally, item){
        //if item is not consumable
        if(!item.consumable){
            console.log(`Item: ${item} is not a consumable and thus cannot be used by this method (AllyManager.useItem).`);
            return false;
        }

        //use the item on the ally
        if(!this.#changeStatsForItemEffect(ally, item, true)){
            //if ally already had max hp (and thus cant use the item)
            Terminal.outputMessage(`Item: ${item.name} will not be used as ally ${ally.name} already has full hp.`, this.optionResultColor);
            return false;
        }

        //remove item from inventory
        if(!(await Inventory.removeItem(item))){
            console.error("Faield to remove item from inventory when using.")
            return false;
        }

        await Inventory.loadInventoryItemVisuals();
        await this.loadAllyVisuals();
        return true;
    }


    // function to equip a given item on a given ally
    static async equipItem(ally, item){

        //if item is not equipment
        if(!item.equipment){
            console.log(`Item: ${item} is not a piece of equipment and this cannot be equipped.`);
            return false;
        }

        let itemRemovedFromInventory = false; //stores whether or not the equipment has already been removed from the inventory

        //if ally already has an item equipped, remove it
        if(ally.equipmentId){
            //remove item from inventory first to not cause issues later
            if(!await Inventory.removeItem(item)){
                console.error("Faield to remove item from inventory when replacing.")
                return false;
            }
            itemRemovedFromInventory = true;

            //unequip current item
            if(!await this.unequipItem(ally)){
                console.error("Failed to unequip item from ally");
                return false;
            }
        }


        //
        // Add equipment to ally
        //

        //remove item from inventory (if not already)
        if(!itemRemovedFromInventory){
            if(!(await Inventory.removeItem(item))){
                console.error("Faield to remove item from inventory when equipping.")
                return false;
            }
        }

        //change stats
        this.#changeStatsForItemEffect(ally, item, true)

        //add to ally & allyEquipment
        ally.equipmentId = item.id;
        console.log(item.id);
        GameTracker.allyEquipment.push(item);

        await this.loadAllyVisuals();
        return true;
    }


    // function to unequip an item from a given ally
    static async unequipItem(ally){
        //check for any equipped items
        if(!ally.equipmentId){
            console.log("Ally does not have any item equipped.");
            return false;
        }

        //get the item that is to be removed
        let equipment;
        let equipmentIndex = 0;
        for(let i=0; i<GameTracker.allyEquipment.length; i++){
            if(GameTracker.allyEquipment[i].id == ally.equipmentId){
                equipment = GameTracker.allyEquipment[i];
                equipmentIndex = i;
                break;
            }
        }

        //if the equipment couldnt be found
        if(!equipment){
            console.error("Error: Equipment to be removed could not be found in allyEquipment array.");
            return false;
        }


        //
        // Remove equipment from ally
        //

        //add item to inventory
        if(!(await Inventory.addItem(equipment))){
            console.error("Faield to add item to inventory when equipping.");
            return false;
        }

        //remove stats
        this.#changeStatsForItemEffect(ally, equipment, false);

        //remove item from ally & allyEquipment
        ally.equipmentId = null;
        GameTracker.allyEquipment.splice(equipmentIndex, 1);

        await this.loadAllyVisuals();
        return true;
    }


    // Function to change the stats of an ally when given an item
    static #changeStatsForItemEffect(ally, item, givingItem){
        //change stats if item effect includes hp
        if(item.effect.hp){
            console.log("Max HP:", ally.maxHp);
            console.log("HP:", ally.hp);
            //if ally already at half health return false
            if(ally.hp >= ally.maxHp){
                console.log("Here");
                return false;
            }

            //if giving add effect, if not, must be taking so remove effect
            givingItem ? ally.hp += item.effect.hp : ally.hp -= item.effect.hp;

            //ensure hp is within boundaries
            if(ally.hp > ally.maxHp){
                ally.hp = ally.maxHp;
            }
            else if(ally.hp <= 0){
                ally.hp = 0;
                ally.alive = false;
            }
        }

        //change stats if item effect includes attack
        if(item.effect.attack){
            //if giving add effect, if not, must be taking so remove effect
            givingItem ? ally.attack += item.effect.attack : ally.attack -= item.effect.attack;

            //ensure hp is within boundaries
            if(ally.attack < 0){
                ally.attack = 0;
            }
        }

        //change stats if item effect includes defence
        if(item.effect.defence){
            //if giving add effect, if not, must be taking so remove effect
            givingItem ? ally.defence += item.effect.defence : ally.defence -= item.effect.defence;

            //ensure hp is within boundaries
            if(ally.defence < 0){
                ally.defence = 0;
            }
        }

        //change stats if item effect includes intelligence
        if(item.effect.intelligence){
            //if giving add effect, if not, must be taking so remove effect
            givingItem ? ally.intelligence += item.effect.intelligence : ally.intelligence -= item.effect.intelligence;

            //ensure hp is within boundaries
            if(ally.intelligence < 0){
                ally.intelligence = 0;
            }
        }

        return true;
    }

}