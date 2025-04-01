import {GameTracker} from "./game_tracker.js";
import { Terminal } from "../terminal.js";
import * as Inventory from "./inventory.js";

export class AllyManager{

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
        if(!this.#changeStatsForItemEffect(ally, item)){
            //if ally already had max hp (and thus cant use the item)
            Terminal.outputMessage(`Item: ${item.name} will not be used as ally ${ally.name} already has full hp.`);
            return false;
        }

        //remove item from inventory
        if(!(await Inventory.removeItem(item))){
            console.error("Faield to remove item from inventory when using.")
            return false;
        }

        await Inventory.loadInventoryItemVisuals();
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

        return true;
    }


    // Function to change the stats of an ally when given an item
    static #changeStatsForItemEffect(ally, item, givingItem){
        //change stats if item effect includes hp
        if(item.effect.hp){
            //if ally already at half health return false
            if(ally.hp == ally.maxHp){
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