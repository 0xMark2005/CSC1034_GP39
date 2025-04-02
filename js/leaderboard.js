import { DBQuery } from "./dbQuery.js";

document.addEventListener("DOMContentLoaded", async function () {
    let currentLeaderboard = "score";
    
    // Initialize the arrows once
    const leaderboardTitle = document.getElementById("leaderboard-title");
    const leaderboardScore = document.getElementById("score");
    const leftArrow = document.getElementById("left-arrow");
    const rightArrow = document.getElementById("right-arrow");

    // Add back button functionality
    const backButton = document.getElementById("back-button");
    backButton.addEventListener("click", () => {
        window.location.href = "main_menu.html";
    });

    // Event listeners for arrows
    leftArrow.addEventListener("click", () => switchLeaderboard(-1));
    rightArrow.addEventListener("click", () => switchLeaderboard(1));

    // Fetch leaderboard data based on the type of leaderboard (score, reputation, wins)
    async function fetchLeaderboard(type) {
        let query = "";
        
        if (type === "score") {
            query = `SELECT u.username, MAX(gs.score) AS value
                     FROM users u
                     JOIN game_sessions gs ON u.user_id = gs.user_id
                     GROUP BY u.user_id
                     ORDER BY value DESC;`;
        } else if (type === "reputation") {
            query = `SELECT u.username, MAX(gs.reputation) AS value
                     FROM users u
                     JOIN game_sessions gs ON u.user_id = gs.user_id
                     GROUP BY u.user_id
                     ORDER BY value DESC;`;
        } else if (type === "wins") {
            query = `SELECT u.username, COUNT(gs.game_completed) AS value
                     FROM users u
                     JOIN game_sessions gs ON u.user_id = gs.user_id
                     WHERE gs.game_completed = 1
                     GROUP BY u.user_id
                     ORDER BY value DESC;`;
        }
        
        let result = await DBQuery.getQueryResult(query);
        
        if (!result || !result.success || !result.data) {
            console.error("Database query failed or returned an invalid response.");
            return [];
        }

        return result.data.map((row, index) => ({
            username: row.username,
            value: row.value,
            rank: index + 1
        }));
    }
    
    // Render the leaderboard dynamically with title and player data
    async function renderLeaderboard(filter = "") {
        const leaderboardList = document.getElementById("leaderboard-list");
        leaderboardList.innerHTML = ""; // Clear any existing leaderboard items
        
        let titleText = "Top Players";
        let headerText = "Score"
        if (currentLeaderboard === "reputation")
            {
                headerText = "Rep";
                titleText = "Top Reputation";
            }
        else if (currentLeaderboard === "wins")
        {
            headerText = "Wins";
            titleText = "Most Wins";
        }
        
        leaderboardTitle.textContent = titleText;
        leaderboardScore.textContent = headerText;
        
        const players = await fetchLeaderboard(currentLeaderboard);
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
                <span class="score">${player.value}</span>
            `;
            leaderboardList.appendChild(listItem);
        });
    }

    // Switch between leaderboards (score, reputation, wins)
    function switchLeaderboard(direction) {
        const searchbar = document.getElementById("search-bar");
        searchbar.value = "";
        const leaderboards = ["score", "reputation", "wins"];
        let currentIndex = leaderboards.indexOf(currentLeaderboard);
        currentLeaderboard = leaderboards[(currentIndex + direction + leaderboards.length) % leaderboards.length];
        renderLeaderboard();
    }

    // Initial render of the leaderboard
    await renderLeaderboard();
    
    // Debounced search function for filtering players
    let debounceTimer;
    document.getElementById("search-bar").addEventListener("input", function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => renderLeaderboard(this.value), 300);
    });
});






