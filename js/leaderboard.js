import { DBQuery } from "./dbQuery.js";


async function fetchLeaderboard() {
    const query = `
        SELECT u.username, MAX(gs.score) AS high_score
        FROM users u
        JOIN game_sessions gs ON u.user_id = gs.user_id
        GROUP BY u.user_id
        ORDER BY high_score DESC;
    `;

    let result = await DBQuery.getQueryResult(query);

    return result.data.map((row, index) => ({
        username: row.username,
        score: row.high_score,
        rank: index + 1
    }));
}
    
    async function renderLeaderboard(filter = "") {
        const leaderboardList = document.getElementById("leaderboard-list");
        leaderboardList.innerHTML = "";
        
        const players = await fetchLeaderboard();
        const filteredPlayers = players.filter(player =>
            player.username.toLowerCase().includes(filter.toLowerCase())
        );
        
        filteredPlayers.forEach(player => {
            const listItem = document.createElement("li");
            
            let rankClass = "beyond4";
            if (player.rank === 1) rankClass = "gold";
            else if (player.rank === 2) rankClass = "silver";
            else if (player.rank === 3) rankClass = "bronze";
            
            listItem.classList.add(rankClass);
            listItem.innerHTML = `
                <span class="rank">${player.rank}</span>
                <span class="name">${player.username}</span>
                <span class="score">${player.score}</span>
            `;
            leaderboardList.appendChild(listItem);
        });
    }
    
    await renderLeaderboard();
    
    let debounceTimer;
    document.getElementById("search-bar").addEventListener("input", function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => renderLeaderboard(this.value), 300);
    });










