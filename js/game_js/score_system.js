import { Terminal } from '../terminal.js';  // Adjust path based on your file structure
import { GameTracker } from './game_tracker.js';

export class ScoreSystem {
    static reputation = 0;
    static reputationMultiplier = 1.0;

    constructor() {
        this.baseScore = 0;
        this.displayedScore = 0;
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
        // Initialize score display
        const scoreNumber = document.getElementById('score-number');
        if (scoreNumber) {
            scoreNumber.textContent = '0';
        }

        // Initialize reputation display
        const reputationElement = document.getElementById('reputation-number');
        if (reputationElement) {
            reputationElement.textContent = `${ScoreSystem.reputation}/100 (${ScoreSystem.reputationMultiplier.toFixed(1)}x)`;
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

        // Apply reputation multiplier to score
        const baseScore = score + timeBonus;
        const multipliedScore = Math.round(baseScore * ScoreSystem.reputationMultiplier);
        
        // Show score calculation in terminal
        ScoreSystem.outputToTerminal(
            `Score: ${baseScore} × ${ScoreSystem.reputationMultiplier.toFixed(1)} = ${multipliedScore}`,
            "#FFA500"
        );

        // Log for debugging
        console.log('Minigame Score Update:', {
            minigameId,
            baseScore,
            multiplier: ScoreSystem.reputationMultiplier,
            finalScore: multipliedScore
        });

        if (multipliedScore > minigame.bestScore) {
            minigame.bestScore = multipliedScore;
        }

        this.baseScore += multipliedScore;
        await this.animateScoreChange(multipliedScore);
        
        return multipliedScore;
    }

    async handleMinigameCompletion(event) {
        const { success, score, minigameId, timeBonus, perfect } = event.detail;

        if (success) {
            const totalScore = await this.updateMinigameScore(
                minigameId,
                score,
                perfect,
                timeBonus
            );

            // Increment GameTracker's total score
            GameTracker.updateScore(totalScore);
        }
    }

    calculateFinalScore() {
        const finalScore = Math.floor(
            (this.baseScore + this.metrics.timeBonus + this.metrics.decisionPoints) 
            * ScoreSystem.reputationMultiplier
        );

        return {
            finalScore,
            breakdown: {
                baseScore: this.baseScore,
                timeBonus: this.metrics.timeBonus,
                decisionPoints: this.metrics.decisionPoints,
                reputationMultiplier: ScoreSystem.reputationMultiplier,
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

    static updateReputation(change) {
        try {
            // Update reputation value with validation
            const oldReputation = Number(ScoreSystem.reputation || 0);
            const newReputation = Math.max(0, Math.min(100, oldReputation + Number(change)));
            
            // Update static values
            ScoreSystem.reputation = newReputation;
            ScoreSystem.reputationMultiplier = Math.max(0.5, Math.min(2.0, newReputation / 50));

            // Update display
            const reputationElement = document.getElementById('reputation-number');
            if (reputationElement) {
                reputationElement.textContent = 
                    `${ScoreSystem.reputation}/100 (${ScoreSystem.reputationMultiplier.toFixed(1)}x)`;
                
                // Update color based on value
                const color = newReputation >= 75 ? "#00FF00" : 
                            newReputation >= 50 ? "#FFA500" : 
                            newReputation >= 25 ? "#FF7F50" : "#FF0000";
                reputationElement.style.color = color;
            }

            // Show change in terminal
            if (change !== 0) {
                const color = change > 0 ? "#00FF00" : "#FF0000";
                const symbol = change > 0 ? "+" : "";
                ScoreSystem.outputToTerminal(
                    `Reputation ${symbol}${change} (${newReputation}/100)`,
                    color
                );
            }

            console.log('Reputation Updated:', {
                from: oldReputation,
                change: change,
                to: newReputation,
                multiplier: ScoreSystem.reputationMultiplier,
                display: reputationElement?.textContent
            });

        } catch (error) {
            console.error('Reputation update failed:', error);
        }
    }

    // Add error handling for Terminal usage
    static outputToTerminal(message, color = "#FFA500") {
        try {
            if (typeof Terminal !== 'undefined' && Terminal.outputMessage) {
                Terminal.outputMessage(message, color);
            } else {
                console.warn('Terminal not available:', message);
            }
        } catch (error) {
            console.error('Terminal output failed:', error);
        }
    }
}