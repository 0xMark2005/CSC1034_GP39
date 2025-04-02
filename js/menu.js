// Imports
import { DBQuery } from "./dbQuery.js";
import SettingsManager from "./settingsManager.js";
import * as Util from "./util.js";

let gameSaves = [];

document.addEventListener("DOMContentLoaded", async function () {
  await Util.checkUserLogin();
  localStorage.removeItem("loadGame");
  localStorage.removeItem("gameSessionId");

  document.getElementById("new-game").addEventListener("click", () => {
    localStorage.setItem("loadGame", false);
    window.location.href = "temp_game.html";
  });

  document.getElementById("load-game").addEventListener("click", async () => {
    await loadGameSaves();
  });

  document.getElementById("settings-menu").addEventListener("click", () => {
    window.location.href = "settings.html";
  });

  document.getElementById("player-stats").addEventListener("click", () => {
    window.location.href = "profile.html";
  });

  document.getElementById("leaderboard-menu").addEventListener("click", () => {
    window.location.href = "Leaderboard.html";
  });

  document.getElementById("popup-close").addEventListener("click", closePopup);
});

async function loadGameSaves() {
  const query = `SELECT * FROM game_sessions 
                 WHERE user_id = ${localStorage.getItem("userID")} 
                 ORDER BY previous_save_datetime DESC 
                 LIMIT 5`;
  try {
    const result = await DBQuery.getQueryResult(query);
    gameSaves = result.data;
  } catch (error) {
    alert("Error getting game saves.");
    return;
  }
  displayGameSavesPopup();
}

function displayGameSavesPopup() {
  const popupContainer = document.getElementById("popup-container");
  const popupContent = document.getElementById("popup-content");
  popupContent.innerHTML = "";

  if (!gameSaves || gameSaves.length === 0) {
    popupContent.innerHTML = `<p>No save files for this account.</p>
                              <button id="popup-return">Return</button>`;
    document.getElementById("popup-return").addEventListener("click", closePopup);
  } else {
    let html = `<h2>Choose a Game Save File</h2><ul>`;
    gameSaves.forEach((save, index) => {
      const gameLocation = formatGameLocation(save.current_location);
      html += `<li>
                <span class="save-option" data-index="${index}" style="cursor:pointer;">
                  ${index + 1}. ${gameLocation} - Updated: ${save.previous_save_datetime}
                </span>
                <button class="delete-save" data-index="${index}">Delete</button>
              </li>`;
    });
    html += `</ul>
             <button id="popup-return">Return to Main Menu</button>`;
    popupContent.innerHTML = html;

    document.querySelectorAll(".save-option").forEach(item => {
      item.addEventListener("click", function () {
        loadSelectedGame(this.getAttribute("data-index"));
      });
    });
    document.querySelectorAll(".delete-save").forEach(btn => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        deleteGameSave(this.getAttribute("data-index"));
      });
    });
    document.getElementById("popup-return").addEventListener("click", closePopup);
  }
  popupContainer.style.display = "flex";
}

function formatGameLocation(locationStr) {
  return locationStr
    .split("_")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function loadSelectedGame(index) {
  const idx = parseInt(index);
  if (isNaN(idx) || idx < 0 || idx >= gameSaves.length) {
    alert("Invalid selection.");
    return;
  }
  localStorage.setItem("gameSessionId", gameSaves[idx].game_session_id);
  localStorage.setItem("loadGame", true);
  closePopup();
  window.location.href = "temp_game.html";
}

async function deleteGameSave(index) {
  try {
    const idx = parseInt(index);
    if (isNaN(idx) || idx < 0 || idx >= gameSaves.length) {
      alert("Invalid selection for deletion.");
      return;
    }
    const query = `DELETE FROM game_sessions WHERE game_session_id = ${gameSaves[idx].game_session_id}`;
    await DBQuery.executeQuery(query);
    alert("Save file deleted successfully.");
    await loadGameSaves();
  } catch (error) {
    alert("Error deleting save file.");
  }
}

function closePopup() {
  document.getElementById("popup-container").style.display = "none";
}
