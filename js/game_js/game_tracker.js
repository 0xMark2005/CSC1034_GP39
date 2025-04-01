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

    // === New Stats ===
    static goldCollected = 0;
    static alliesRecruited = 0;

    // === Statistics Tracking ===
    static battlesFought = 0;
    static bossHpLogs = [];
    static battleRounds = [];

    // === METHODS ===

    static setFilepath() {
        this.areaFilepath = `/js/game_js/game_story/${this.areaName}.json`;
    }

    static changeReputation(change) {
        this.reputation += change;
        if (this.reputation < 0) this.reputation = 0;
        if (this.reputation > 100) this.reputation = 100;
    }

    static logGold(amount) {
        this.goldCollected += amount;
    }

    static logRecruitedAlly() {
        this.alliesRecruited += 1;
    }

    static logBattleOutcome(bossHpLeft, roundsTaken) {
        this.bossHpLogs.push(bossHpLeft);
        this.battleRounds.push(roundsTaken);
        this.battlesFought++;
    }

    static get bossHpAverage() {
        if (this.bossHpLogs.length === 0) return "-";
        const sum = this.bossHpLogs.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.bossHpLogs.length);
    }

    static get roundsInBattleAvg() {
        if (this.battleRounds.length === 0) return "-";
        const sum = this.battleRounds.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.battleRounds.length);
    }
}