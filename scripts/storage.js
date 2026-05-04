// Load and save player settings like theme and game speed
// Save the high score and get them for the leaderboard

export function getPlayerName() {
  return localStorage.getItem('snakePlayerName') || '';
}

export function savePlayerName(name) {
  localStorage.setItem('snakePlayerName', name);
}

export function getTheme() {
  return localStorage.getItem('snakeTheme') || 'classic';
}

export function saveTheme(theme) {
  localStorage.setItem('snakeTheme', theme);
}

export function getSpeed() {
  const savedSpeed = localStorage.getItem('snakeSpeed');
  return savedSpeed ? parseInt(savedSpeed, 10) : 7;
}

export function saveSpeed(speed) {
  localStorage.setItem('snakeSpeed', String(speed));
}

// Get the saved Leaderboard scores. Return an empty list if there are no saved scores
export function getLeaderboard() {
  return JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
}

// Save the player's new score and sort the leaderboard. Only keep the Top 10 player scores
export function saveHighScore(name, latestScore) {
  let highScores = getLeaderboard();
  highScores.push({ name: name || 'Anonymous', score: latestScore });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 10);
  localStorage.setItem('snakeLeaderboard', JSON.stringify(highScores));
}
