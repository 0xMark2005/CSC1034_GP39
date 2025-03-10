document.addEventListener("DOMContentLoaded", function () {

    //Thsi is just test values
    const players = [
        { name: "Alice", score: 1200 },
        { name: "Bob", score: 1150 },
        { name: "Charlie", score: 1100 },
        { name: "David", score: 120 },
        { name: "Eve", score: 1000 },
        { name: "Grace", score: 900 },
        { name: "Hank", score: 850 },
        { name: "Ivy", score: 800 },
        { name: "Jack", score: 750 }
    ];
    
    function renderLeaderboard() {

        //get leaderboard list from html
        const leaderboardList = document.getElementById("leaderboard-list");
        leaderboardList.innerHTML = "";

        //sort by players score desencding
        players.sort((a, b) => b.score - a.score);

        players.forEach((player, index) => {
            const listItem = document.createElement("li");

            // Create spans for rank, name, and score
            listItem.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="name">${player.name}</span>
                <span class="score">${player.score}</span>
            `;

            leaderboardList.appendChild(listItem);
        });
    }

    renderLeaderboard();
})
