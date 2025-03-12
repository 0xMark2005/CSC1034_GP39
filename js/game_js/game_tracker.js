export class GameTracker{
    static areaName;
    static areaFilepath = "./js/game_js/game_story/burning_village.json";
    static currentArea = [];
    static currentDialogue = "";

    static setFilepath(){
        this.areaFilepath = `./js/game_js/game_story/${this.areaName}.json`;
    }
}