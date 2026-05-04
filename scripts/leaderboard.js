// Import the necessary storage functions from storage.js
import { getHighScores, clearHighScores } from './storage.js';

// Wait until the page is loaded before updating the Leaderboard
document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const leaderboardModal = document.getElementById('leaderboardModal');
    const clearLeaderboardBtn = document.getElementById('clearLeaderboardBtn');

    function loadLeaderboard() {
        if (!leaderboardBody) return;

        // Get leaderboard scores from storage.js
        const scores = getHighScores();

        // Clear the table
        leaderboardBody.innerHTML = '';

        // Show a message if there are no scores yet
        if (scores.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 3;
            td.className = 'text-muted py-3 text-center';
            td.textContent = 'No high scores yet';
            
            tr.appendChild(td);
            leaderboardBody.appendChild(tr);
            return;
        }

        // Add the Top 10 scores into the table using safe DOM manipulation
        scores.slice(0, 10).forEach((entry, index) => {
            const row = document.createElement('tr');

            // Create Rank Cell
            const rankTd = document.createElement('td');
            rankTd.className = 'fw-bold';
            // Apply special styling for the Top 3 ranks
            if (index === 0) rankTd.classList.add('text-warning', 'fs-5'); 
            else if (index === 1) rankTd.classList.add('text-secondary', 'fs-5'); 
            else if (index === 2) rankTd.classList.add('text-danger', 'fs-5');
            rankTd.textContent = index + 1;

            // Create Player Name Cell
            const nameTd = document.createElement('td');
            nameTd.textContent = entry.name;

            // Create Score Cell
            const scoreTd = document.createElement('td');
            scoreTd.textContent = entry.score;

            // Append all cells to the row, then row to the table body
            row.appendChild(rankTd);
            row.appendChild(nameTd);
            row.appendChild(scoreTd);
            leaderboardBody.appendChild(row);
        });
    }

    // Clear the leaderboard
    function clearLeaderboard() {
        if (confirm('Are you sure you want to clear all high scores? This cannot be undone.')) {
            clearHighScores(); // Calls the imported function from storage.js
            loadLeaderboard();
        }
    }

    // Load the scores when the page first loads
    loadLeaderboard();

    // Reload the leaderboard when the modal is opened
    if (leaderboardModal) {
        leaderboardModal.addEventListener('show.bs.modal', loadLeaderboard);
    }

    // Clear scores when button is clicked
    if (clearLeaderboardBtn) {
        clearLeaderboardBtn.addEventListener('click', clearLeaderboard);
    }

    // Reload the leaderboard automatically when a game ends
    document.addEventListener('snakeGameOver', loadLeaderboard);
});
