export class GameTracker {
    static currentArea = [];
    static areaName;
    static areaFilepath;
    static currentDialogue;
    static gameLogs = [];

    static reputation = 0;
    static score = 0;
    static inventory = [];
    static allies = [];
    static allyEquipment = [];

    static gameOver = false;
    static gameCompleted = false;

    //sets the area filepath to match the new area
    static setFilepath() {
        this.areaFilepath = `/js/game_js/game_story/${this.areaName}.json`;
    }

    //updates the reputation according to boundaries
    static changeReputation(change){
        this.reputation += change;
        if(this.reputation < 0){
            this.reputation = 0;
        }
        else if(this.reputation > 100){
            this.reputation = 100;
        }
    }
}