export class ScoreSystem {
    constructor() {
        this.baseScore = 0;
        this.displayedScore = 0;
        this.reputationMultiplier = 1.0;
        this.metrics = {
            timeBonus: 0,
            decisionPoints: 0,
            minigameScores: {
                villageEscape: { bestScore: 0, attempts: 0, perfectRuns: 0 },
                prisonEscape: { bestScore: 0, attempts: 0, perfectRuns: 0 },
                generalRescue: { bestScore: 0, attempts: 0, perfectRuns: 0 },
                finalBattle: { bestScore: 0, attempts: 0, perfectRuns: 0 }
            },
            achievements: [],
            specialAchievements: new Set()
        };
        
        this.startTime = Date.now();
        this.OPTIMAL_TIME = 600000; // 10 minutes
        this.initializeDisplay();
    }

    initializeDisplay() {
        const scoreNumber = document.getElementById('score-number');
        if (scoreNumber) {
            scoreNumber.textContent = '0';
        }
    }

    async animateScoreChange(amount) {
        return new Promise((resolve) => {
            const popup = document.getElementById('score-popup');
            const scoreNumber = document.getElementById('score-number');
            
            if (!popup || !scoreNumber) {
                console.error('Score display elements not found');
                resolve();
                return;
            }

            // Update popup
            popup.textContent = `+${amount}`;
            popup.classList.remove('hidden');
            popup.classList.add('animate');

            // Animate score number
            const startScore = this.displayedScore;
            const endScore = startScore + amount;
            const duration = 1000; // 1 second animation
            const steps = 20;
            const stepDuration = duration / steps;
            const scoreIncrement = amount / steps;

            let currentStep = 0;
            
            const animate = () => {
                currentStep++;
                this.displayedScore = Math.round(startScore + (scoreIncrement * currentStep));
                scoreNumber.textContent = this.displayedScore;
                
                if (currentStep < steps) {
                    setTimeout(animate, stepDuration);
                } else {
                    // Ensure final value is exact
                    this.displayedScore = endScore;
                    scoreNumber.textContent = this.displayedScore;
                    
                    // Clean up animation
                    popup.classList.remove('animate');
                    setTimeout(() => {
                        popup.classList.add('hidden');
                        resolve();
                    }, 500);
                }
            };

            animate();
        });
    }

    async handleStoryChoice(choice, timeLeft) {
        let points = 50; // Base points

        // Time bonus
        if (timeLeft > 0) {
            points += Math.round(timeLeft * 10);
        }

        // Moral choice bonuses
        const moralChoices = {
            'S': 200, // Saving baby
            'R': 100, // Quick thinking
            'T': 150  // Strategic choice
        };

        if (moralChoices[choice]) {
            points += moralChoices[choice];
        }

        this.baseScore += points;
        await this.animateScoreChange(points);
        return points;
    }

    async updateMinigameScore(minigameId, score, perfect, timeBonus = 0) {
        const minigame = this.metrics.minigameScores[minigameId];
        if (!minigame) return;

        minigame.attempts++;
        if (perfect) minigame.perfectRuns++;

        const totalScore = score + timeBonus;
        if (totalScore > minigame.bestScore) {
            minigame.bestScore = totalScore;
        }

        this.baseScore += totalScore;
        await this.animateScoreChange(totalScore);
        
        return totalScore;
    }

    async handleMinigameCompletion(event) {
        const { success, score, minigameId, timeBonus, perfect } = event.detail;
        
        if (success) {
            await this.updateMinigameScore(
                minigameId,
                score,
                perfect,
                timeBonus
            );
        }
    }

    calculateFinalScore() {
        const finalScore = Math.floor(
            (this.baseScore + this.metrics.timeBonus + this.metrics.decisionPoints) 
            * this.reputationMultiplier
        );

        return {
            finalScore,
            breakdown: {
                baseScore: this.baseScore,
                timeBonus: this.metrics.timeBonus,
                decisionPoints: this.metrics.decisionPoints,
                reputationMultiplier: this.reputationMultiplier,
                minigameScores: this.metrics.minigameScores,
                achievements: this.metrics.achievements
            }
        };
    }

    calculateTimeBonus() {
        const elapsedTime = Date.now() - this.startTime;
        const timeRatio = this.OPTIMAL_TIME / elapsedTime;
        return Math.round(this.baseScore * Math.min(2, Math.max(0, timeRatio)));
    }

    handlePrisonEvent(eventType) {
        let points = 0;
        
        switch(eventType) {
            case 'arrest':
                points = -100; // Penalty for getting arrested
                break;
            case 'prison_observation':
                points = 50;  // Bonus for being observant
                break;
            case 'gang_alliance':
                points = 100; // Strategic alliance bonus
                break;
            case 'solo_escape':
                points = 200; // Independent thinking bonus
                break;
        }
        
        this.baseScore += points;
        this.animateScoreChange(points);
        return points;
    }

    updateReputationMultiplier(reputation) {
        // Convert reputation (0-100) to multiplier (0.5x - 2.0x)
        this.reputationMultiplier = Math.max(0.5, Math.min(2.0, reputation / 50));
        return this.reputationMultiplier;
    }
}