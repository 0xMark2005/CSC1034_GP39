export class GameTracker {
    static currentArea = [];
    static areaName;
    static areaFilepath;
    static currentDialogue;
    static gameLogs = [];

    static reputation = 0;
    static score = 0;
    static scoreUpdateInProgress = false;
    static inventory = [];
    static allies = [];
    static allyEquipment = [];
    static completedMinigames = new Set();

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

        // Update reputation display with multiplier
        const reputationElement = document.getElementById('reputation-number');
        if (reputationElement) {
            const multiplier = 1 + Math.floor(this.reputation / 50);
            reputationElement.textContent = `${this.reputation} (${multiplier}x)`;
        }
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

    static updateScore(points) {
        try {
            // Ensure we're working with clean numbers
            const currentScore = Number(this.score || 0);
            const pointsToAdd = Number(points || 0);

            // Increment the score
            this.score = currentScore + pointsToAdd;

            // Update the display
            const scoreElement = document.getElementById('score-number');
            if (scoreElement) {
                scoreElement.textContent = this.score.toString();
            }
            // Log final state for verification
            console.log('Score Update Complete:', {
                previousScore: currentScore,
                addedPoints: pointsToAdd,
                newTotal: this.score
            });
        } catch (error) {
            console.error('Score Update Failed:', error);
        }
    }

    static getScore() {
        return this.score;
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