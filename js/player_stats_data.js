// js/player_stats_data.js
import { DBQuery } from './dbQuery.js';

// Animation helper
function animateValue(id, end, duration = 1000) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const increment = end / (duration / 16);

    const step = () => {
        start += increment;
        if (start >= end) {
            el.textContent = Math.floor(end);
        } else {
            el.textContent = Math.floor(start);
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

document.addEventListener("DOMContentLoaded", async () => {
    const userID = localStorage.getItem("userID");
    if (!userID) return;

    const queries = {
        totalScore: `SELECT SUM(score) AS totalScore FROM game_sessions WHERE user_id = ${userID}`,
        highestScore: `SELECT MAX(score) AS highestScore FROM game_sessions WHERE user_id = ${userID}`,
        totalReputation: `SELECT SUM(reputation) AS totalReputation FROM game_sessions WHERE user_id = ${userID}`,
        highestReputation: `SELECT MAX(reputation) AS highestReputation FROM game_sessions WHERE user_id = ${userID}`,
        minigamesPlayed: `SELECT COUNT(*) AS played FROM game_session_logs JOIN game_logs ON game_logs.log_id = game_session_logs.log_id INNER JOIN game_sessions ON game_session_logs.game_session_id = game_sessions.game_session_id WHERE user_id = ${userID} AND log_name = 'played_minigame'`,
        minigamesWon: `SELECT COUNT(*) AS won FROM game_session_logs JOIN game_logs ON game_logs.log_id = game_session_logs.log_id INNER JOIN game_sessions ON game_session_logs.game_session_id = game_sessions.game_session_id WHERE user_id = ${userID} AND log_name = 'minigame_won'`,
        minigamesLost: `SELECT COUNT(*) AS lost FROM game_session_logs JOIN game_logs ON game_logs.log_id = game_session_logs.log_id INNER JOIN game_sessions ON game_session_logs.game_session_id = game_sessions.game_session_id WHERE user_id = ${userID} AND log_name = 'minigame_failed'`,
        totalItems: `SELECT SUM(quantity) AS mostItems FROM game_session_logs JOIN game_logs ON game_logs.log_id = game_session_logs.log_id INNER JOIN game_sessions ON game_session_logs.game_session_id = game_sessions.game_session_id WHERE user_id = ${userID} AND log_name = 'found_item';`,
        mostItems: `SELECT MAX(quantity) AS mostItems FROM game_session_logs JOIN game_logs ON game_logs.log_id = game_session_logs.log_id INNER JOIN game_sessions ON game_session_logs.game_session_id = game_sessions.game_session_id WHERE user_id = ${userID} AND log_name = 'found_item';`
    };

    for (const [key, query] of Object.entries(queries)) {
        try {
            const result = await DBQuery.getQueryResult(query);
            if (result?.data?.length) {
                const value = parseInt(Object.values(result.data[0])[0]) || 0;
                animateValue(`stat-${key}`, value);
            }
        } catch (err) {
            console.error(`Error loading stat ${key}:`, err);
        }
    }
});