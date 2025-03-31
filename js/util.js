import {DBQuery} from "./dbQuery.js";

export async function checkUserLogin(){
    let loggedIn = localStorage.getItem("loggedIn");
    let sessionToken = localStorage.getItem("sessionToken");
    let userID = localStorage.getItem("userID");

    if (loggedIn !== "true" || !sessionToken || !userID) {
        alert("Please log in to play the game.");
        window.location.href = "index.html";
        return false;
    }

    // Verify the session token in the database
    let query = `SELECT * FROM user_sessions WHERE user_id='${userID}' AND session_token='${sessionToken}' AND expires_at > NOW() LIMIT 1`;

    try {
        let result = await DBQuery.getQueryResult(query);
        if (!(result.data && result.data.length > 0)) {
            localStorage.clear();
            console.log("User Session Expired");
            alert("User session has expired. Please log in again.");
            window.location.href = "index.html";
            return false;
        }
    } catch (error) {
        console.error("Session verification error:", error);
        window.location.href = "index.html";
        return false;
    }

    return true;
}
