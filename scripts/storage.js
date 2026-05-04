// Load and save player settings like theme and game speed
// Save the high score and get them for the leaderboard

export function savePlayerName(name) {
    sessionStorage.setItem('snakePlayerName', name);
}

export function getPlayerName() {
    return sessionStorage.getItem('snakePlayerName') || '';
}

export function saveTheme(theme) {
    localStorage.setItem('snakeTheme', theme);
}

export function getTheme() {
    return localStorage.getItem('snakeTheme') || 'classic';
}

export function saveSpeed(speed) {
    localStorage.setItem('snakeSpeed', speed);
}

export function getSpeed() {
    return localStorage.getItem('snakeSpeed') || '7';
}


// --- LEADERBOARD LOGIC ---

export function saveHighScore(score) {
    if (score <= 0) return; // Don't save scores of zero

    const playerName = getPlayerName() || 'Guest';
    let highScores = getHighScores();

    // Add the new score
    highScores.push({ name: playerName, score: score });
    
    // Sort the array from highest score to lowest
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep only the Top 10 scores
    highScores = highScores.slice(0, 10);

    // Save back to local storage as a JSON string
    localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
}

export function getHighScores() {
    // Parse the JSON string back into an array, or return an empty array if null
    return JSON.parse(localStorage.getItem('snakeHighScores')) || [];
}

export function clearHighScores() {
    localStorage.removeItem('snakeHighScores');
}
