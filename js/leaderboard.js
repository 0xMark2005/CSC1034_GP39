import { DBQuery } from "./dbQuery.js";


async function fetchLeaderboard() {
    const query = `SELECT username, high_score FROM leaderboard;`;

    let result = [];
    try{
        let dbResult = await DBQuery.getQueryResult(query);
        result = dbResult.data;
    }
    catch(error){
        console.log("An error occurred when getting results: ", error);
        return;
    }

    let leaderboard = result.map((row, index) => ({
        username: row.username,
        score: row.high_score,
        rank: index + 1
    }))
    return leaderboard;
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
