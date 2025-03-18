export class GameTracker {
    static areaName;
    static areaFilepath;
    static currentArea;
    static currentDialogue;
    static gameLogs = [];

    static setFilepath() {
        this.areaFilepath = `/js/game_js/game_story/${this.areaName}.json`;
    }
}