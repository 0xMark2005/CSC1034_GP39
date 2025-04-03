//Imports
import * as UTIL from "../util.js";
import { DBQuery } from "../dbQuery.js";

//Variables
let gameSessionId;

document.addEventListener("DOMContentLoaded", async function() {
    //check the user is logged in
    await UTIL.checkUserLogin();
    
    gameSessionId = localStorage.getItem("gameSessionId"); //get game session id

    //if user doesnt have a game session open
    if(!gameSessionId){
        alert("Please only visit this screen when a valid game is open");
        window.location.href="main_menu.html";
        return;
    }

    //if game was not over / completed & set appropriate header
    await checkCompleteOrOver();

    //add stats
    await setPlayerAllies();
    await setPlayerStats();
    await setPlayerMinigames();
    await setGlobalStats();
    await setGlobalMinigames();

});


async function checkCompleteOrOver(){
    let query=`SELECT game_completed, game_over FROM game_sessions WHERE game_session_id=${gameSessionId}`;
    let gameCompleted = false;
    let gameOver = false;
    try{
        let result = await DBQuery.getQueryResult(query);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find game session");
            alert("Game session could not be found.");
            window.location.href="main_menu.html";
            return;
        }

        gameCompleted = result.data[0].game_completed;
        gameOver = result.data[0].game_over;
    }
    catch(error){
        console.error("An error occurred when getting the game result.");
        alert("Game session could not be found.");
        window.location.href="main_menu.html";
        return;
    }

    //if game was not over
    if(gameOver ===false && !gameCompleted === false){
        alert("Please complete the game before visiting this screen.");
        window.location.href="temp_game.html";
        return;
    }

    //if game over set title
    if(gameOver === true){
        let title = document.getElementById("header-text");
        title.innerHTML = "Game Over!";
        title.style.color = "darkred";
    }
}

//
//Player stat methods
//
async function setPlayerAllies(){
    let query=`SELECT ally_name FROM game_session_allies_full_details WHERE game_session_id=${gameSessionId}`;
    let allyNames = [];
    try{
        let result = await DBQuery.getQueryResult(query);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find allies");
            return;
        }

        for(let i=0; i<result.data.length; i++){
            let currentAlly = result.data[i];
            let allyName = currentAlly.ally_name;
            allyName = allyName.toLowerCase().replace(" ", "-").trim();
            allyNames.push(allyName);
        }
    }
    catch(error){
        console.error("An error occurred when getting the game allies.");
        return;
    }

    //get any missing allies
    let allAllyNames = ["peasant", "medic", "bar-man", "knight"];
    let missingAllies = allAllyNames.filter(allyName => !allyNames.includes(allyName));

    //remove missing allies from display
    for(let i=0; i<missingAllies.length; i++){
        let allyElementId = missingAllies[i] + "-container";
        let allyElement = document.getElementById(allyElementId);
        
        if(allyElement){
            allyElement.classList.add("hide");
        }
    }
}


async function setPlayerStats(){
    //set the elements
    let scoreValueElement = document.getElementById("score-value");
    let reputationValueElement = document.getElementById("reputation-value");
    let itemsCollectedValueElement = document.getElementById("items-collected-value");
    let areasVisitedValueElement = document.getElementById("areas-visited-value");

    //score & reputation
    let scoreRepQuery=`SELECT score, reputation FROM game_sessions WHERE game_session_id=${gameSessionId}`;
    try{
        let result = await DBQuery.getQueryResult(scoreRepQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find score & reputation");
            return;
        }

        //set values
        scoreValueElement.innerHTML = `${result.data[0].score}`;
        console.log("Rep:",result.data[0].reputation);
        reputationValueElement.innerHTML = `${result.data[0].reputation}`;
    }
    catch(error){
        console.error("An error occurred when getting the score & reputation.");
    }

    //items found
    let itemsFoundQuery=`SELECT quantity FROM game_session_logs_full_details WHERE game_session_id=${gameSessionId} AND log_name='found_item'`;
    try{
        let result = await DBQuery.getQueryResult(itemsFoundQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find items collected");
            return;
        }

        //if value found
        if(result.data && result.data.length > 0){
            //set value
            itemsCollectedValueElement.innerHTML = `${result.data[0].quantity}`;
        }
        
    }
    catch(error){
        console.error("An error occurred when getting the items collected.");
    }

    //areas visited
    let areasVisitedQuery = `SELECT COUNT(*) AS areasVisited FROM game_session_logs_full_details WHERE game_session_id=${gameSessionId} AND route_log=1`;
    try{
        let result = await DBQuery.getQueryResult(areasVisitedQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find areas visited");
            return;
        }

        //set values
        areasVisitedValueElement.innerHTML = `${result.data[0].areasVisited}`;
    }
    catch(error){
        console.error("An error occurred when getting the areas visited.");
    }
}


async function setPlayerMinigames(){
    //set the elements
    let minigamesPlayedElement = document.getElementById("minigames-played-value");
    let minigamesWonElement = document.getElementById("minigames-won-value");
    let minigamesFailedElement = document.getElementById("minigames-failed-value");

    //set the minigames played
    let minigamesPlayedQuery = `SELECT quantity AS minigamesPlayed FROM game_session_logs_full_details WHERE game_session_id=${gameSessionId} AND log_name="played_minigame"`;
    try{
        let result = await DBQuery.getQueryResult(minigamesPlayedQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find minigames played");
            return;
        }

        //if value found
        if(result.data && result.data.length > 0){
            //set value
            minigamesPlayedElement.innerHTML = `${result.data[0].minigamesPlayed}`;
        }

    }
    catch(error){
        console.error("An error occurred when getting the minigames played.");
    }

    //set the minigames played
    let minigamesWonQuery = `SELECT quantity AS minigamesWon FROM game_session_logs_full_details WHERE game_session_id=${gameSessionId} AND log_name="minigame_won"`;
    try{
        let result = await DBQuery.getQueryResult(minigamesWonQuery);

        if(!result.success){
            console.log("Error, could not find minigames won");
            return;
        }

        //if value found
        if(result.data && result.data.length > 0){
            //set value
            minigamesWonElement.innerHTML = `${result.data[0].minigamesWon}`;
        }
    }
    catch(error){
        console.error("An error occurred when getting the minigames won.");
    }

    //set the minigames played
    let minigamesFailedQuery = `SELECT quantity AS minigamesFailed FROM game_session_logs_full_details WHERE game_session_id=${gameSessionId} AND log_name="minigame_failed"`;
    try{
        let result = await DBQuery.getQueryResult(minigamesFailedQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find minigames failed");
            return;
        }

        //if value found
        if(result.data && result.data.length > 0){
            //set value
            minigamesFailedElement.innerHTML = `${result.data[0].minigamesFailed}`;
        }
    }
    catch(error){
        console.error("An error occurred when getting the minigames failed.");
    }
}




//
// Set global stat methods
//

async function setGlobalStats(){
    //set the elements
    let globalAvgScoreElement = document.getElementById("score-global-avg");
    let globalAvgReputationElement = document.getElementById("reputation-global-avg");
    let globalAvgItemsCollectedElement = document.getElementById("items-collected-global-avg");
    let globalAvgAreasVisitedElement = document.getElementById("areas-visited-global-avg");

    //set the average score and reputation
    let avgScoreRepQuery = `SELECT AVG(score) AS averageScore, AVG(reputation) AS averageReputation FROM game_sessions WHERE game_over=1 OR game_completed=1`;
    try{
        let result = await DBQuery.getQueryResult(avgScoreRepQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find average score and reputation");
            return;
        }

        //if score value not null
        if(result.data[0].averageScore){
            //set value
            globalAvgScoreElement.innerHTML = `${Math.round(result.data[0].averageScore)}`;
        }

        //if reputation value not null
        if(result.data[0].averageReputation){
            //set value
            globalAvgReputationElement.innerHTML = `${Math.round(result.data[0].averageReputation)}`;
            console.log("Rep:",result.data[0].averageReputation);
        }

    }
    catch(error){
        console.error("An error occurred when getting the global avg score & reputation.");
    }

    //set the average items collected
    let avgItemsCollectedQuery = `SELECT AVG(l.quantity) AS averageItemsCollected FROM game_session_logs_full_details AS l INNER JOIN game_sessions AS gs ON l.game_session_id = gs.game_session_id WHERE log_name="found_item" AND (game_over=1 OR game_completed=1);`;
    try{
        let result = await DBQuery.getQueryResult(avgItemsCollectedQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find global average items collected");
            return;
        }

        //if score value not null
        if(result.data[0].averageItemsCollected){
            //set value
            globalAvgItemsCollectedElement.innerHTML = `${Math.round(result.data[0].averageItemsCollected)}`;
        }

    }
    catch(error){
        console.error("An error occurred when getting the global avg items.");
    }

    //set the average areas visited
    let avgAreasVisitedQuery = `SELECT AVG(noAreasVisited) AS averageAreasVisited FROM ( SELECT l.game_session_id, COUNT(log_id) AS noAreasVisited FROM game_session_logs_full_details AS l INNER JOIN game_sessions AS gs ON l.game_session_id = gs.game_session_id WHERE route_log = 1 AND (game_over=1 OR game_completed=1) GROUP BY l.game_session_id ) AS areas_visited_per_session;`;
    try{
        let result = await DBQuery.getQueryResult(avgAreasVisitedQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find global average areas visited");
            return;
        }

        //if score value not null
        if(result.data[0].averageAreasVisited){
            //set value
            globalAvgAreasVisitedElement.innerHTML = `${Math.round(result.data[0].averageAreasVisited)}`;
        }

    }
    catch(error){
        console.error("An error occurred when getting the global avg areas visited.");
    }
}



async function setGlobalMinigames(){
    //set the elements
    let globalAvgMinigamesPlayedElement = document.getElementById("minigames-played-global-avg");
    let globalAvgMinigamesWonElement = document.getElementById("minigames-won-global-avg");
    let globalAvgMinigamesFailedElement = document.getElementById("minigames-failed-global-avg");

    //set the average minigames played
    let avgMinigamesPlayedQuery = `SELECT AVG(l.quantity) AS averageMinigamesPlayed FROM game_session_logs_full_details AS l INNER JOIN game_sessions AS gs ON l.game_session_id = gs.game_session_id WHERE log_name="played_minigame" AND (game_over=1 OR game_completed=1);`;
    try{
        let result = await DBQuery.getQueryResult(avgMinigamesPlayedQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find global average minigames played");
            return;
        }

        //if score value not null
        if(result.data[0].averageMinigamesPlayed){
            //set value
            globalAvgMinigamesPlayedElement.innerHTML = `${Math.round(result.data[0].averageMinigamesPlayed)}`;
        }

    }
    catch(error){
        console.error("An error occurred when getting the global average minigames played.");
    }

    //set the average minigames won
    let avgMinigamesWonQuery = `SELECT AVG(l.quantity) AS averageMinigamesWon FROM game_session_logs_full_details AS l INNER JOIN game_sessions AS gs ON l.game_session_id = gs.game_session_id WHERE log_name="minigame_won" AND (game_over=1 OR game_completed=1);`;
    try{
        let result = await DBQuery.getQueryResult(avgMinigamesWonQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find global average minigames won");
            return;
        }

        //if score value not null
        if(result.data[0].averageMinigamesWon){
            //set value
            globalAvgMinigamesWonElement.innerHTML = `${Math.round(result.data[0].averageMinigamesWon)}`;
        }

    }
    catch(error){
        console.error("An error occurred when getting the global average minigames won.");
    }

    //set the average minigames played
    let avgMinigamesFailedQuery = `SELECT AVG(l.quantity) AS averageMinigamesFailed FROM game_session_logs_full_details AS l INNER JOIN game_sessions AS gs ON l.game_session_id = gs.game_session_id WHERE log_name="minigame_failed" AND (game_over=1 OR game_completed=1);`;
    try{
        let result = await DBQuery.getQueryResult(avgMinigamesFailedQuery);

        if(!result.success || result.data.length < 1){
            console.log("Error, could not find global average minigames played");
            return;
        }

        //if score value not null
        if(result.data[0].averageMinigamesFailed){
            //set value
            globalAvgMinigamesFailedElement.innerHTML = `${Math.round(result.data[0].averageMinigamesFailed)}`;
        }

    }
    catch(error){
        console.error("An error occurred when getting the global average minigames played.");
    }
}