// Wait until the page is loaded before updating the Leaderboard
document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const leaderboardModal = document.getElementById('leaderboardModal');
    const clearLeaderboardBtn = document.getElementById('clearLeaderboardBtn');

    function loadLeaderboard() {
        if (!leaderboardBody) return;

        // Get leaderboard scores from LocalStorage
        let scores = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
        
        // Sort scores from highest to lowest
        scores.sort((a, b) => b.score - a.score);

        // Clear the table
        leaderboardBody.innerHTML = '';

        // Show a message if there are no scores yet
        if (scores.length === 0) {
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-muted py-3">No high scores yet</td>
                </tr>`;
            return;
        }

        // Add the Top 10 scores into the table
        scores.slice(0, 10).forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="fw-bold">${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    // Clear the leaderboard
    function clearLeaderboard() {
        localStorage.removeItem('snakeLeaderboard');
        loadLeaderboard();
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
});
