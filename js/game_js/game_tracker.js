export class GameTracker{
    static areaName;
    static areaFilepath = "./js/game_js/game_story/burning_village.json";
    static currentArea = [];
    static currentDialogue = "";

    static gameLogs = ["has key", "has swam"];

    static setFilepath(){
        this.areaFilepath = `./js/game_js/game_story/${this.areaName}.json`;
    }
}