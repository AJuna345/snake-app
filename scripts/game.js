// Import saved Player settings and Leaderboard functions from storage.js
import {
    getPlayerName,
    savePlayerName,
    getTheme,
    saveTheme,
    getSpeed,
    saveSpeed,
    saveHighScore
} from './storage.js';

const board = document.getElementById('game-board');
const scoreDisplay = document.getElementById('hudScoreDisplay');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const themeSelect = document.getElementById('themeSelect');
const speedSelect = document.getElementById('speedSelect');
const playerNameInput = document.getElementById('playerNameInput');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const hudPlayerName = document.getElementById('hudPlayerName');
const powerupDisplay = document.getElementById('hudPowerupDisplay');
const powerupContainer = document.getElementById('powerupContainer');

const GRID_SIZE = 21;
let snake = [{ x: 11, y: 11 }];
let food = { x: 5, y: 5 };
let powerUp = null;
let dangerWalls = [];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let gameInterval = null;
let baseSpeed = 150;
let currentSpeed = 150;
let isGameOver = false;
let isGameRunning = false;
let powerUpTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    // Uses your imported storage module functions
    const savedTheme = getTheme() || 'classic';
    const savedSpeed = getSpeed() || '7';
    const savedName = getPlayerName() || 'Guest';

    document.body.className = `theme-${savedTheme} text-theme bg-canvas`;
    
    if (themeSelect) themeSelect.value = savedTheme;
    if (speedSelect) speedSelect.value = savedSpeed;
    if (playerNameInput) playerNameInput.value = savedName;
    if (hudPlayerName) hudPlayerName.textContent = savedName;

    setGameSpeed(savedSpeed);
    fetchGameSettings();

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    saveSettingsBtn.addEventListener('click', saveSettings);
    window.addEventListener('keydown', handleInput);
    
    draw();
});

async function fetchGameSettings() {
    try {
        const response = await fetch('./settings.json'); 
        if (response.ok) {
            const data = await response.json();
            console.log("External settings loaded successfully:", data);
        }
    } catch (error) {
        console.info("No external settings.json found. Using default game variables.");
    }
}

export function startGame() {
    snake = [{ x: 11, y: 11 }];
    direction = { x: 0, y: -1 }; 
    nextDirection = { x: 0, y: -1 };
    score = 0;
    isGameOver = false;
    isGameRunning = true;
    currentSpeed = baseSpeed;
    
    clearPowerUps();
    generateDangerWalls();
    placeFood();
    placePowerUp();
    updateScore();

    startScreen.classList.add('d-none');
    gameOverScreen.classList.add('d-none');
    startBtn.classList.add('d-none');
    restartBtn.classList.remove('d-none');

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, currentSpeed);
}

function gameLoop() {
    update();
    if (isGameOver) {
        handleGameOver();
        return;
    }
    draw();
}

function update() {
    direction = nextDirection;
    
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 1 || head.x > GRID_SIZE || head.y < 1 || head.y > GRID_SIZE) {
        isGameOver = true; return;
    }
    
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        isGameOver = true; return;
    }
    
    if (dangerWalls.some(wall => wall.x === head.x && wall.y === head.y)) {
        isGameOver = true; return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        placeFood();
        if (Math.random() > 0.7) placePowerUp();
    } 
    else if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        activatePowerUp(powerUp.type);
        powerUp = null;
        snake.pop();
    } 
    else {
        snake.pop();
    }
}

function draw() {
    board.innerHTML = ''; 
    board.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;

    dangerWalls.forEach(wall => {
        const wallEl = document.createElement('div');
        wallEl.style.gridRowStart = wall.y;
        wallEl.style.gridColumnStart = wall.x;
        wallEl.classList.add('danger-wall', 'rounded-1');
        board.appendChild(wallEl);
    });

    snake.forEach((segment, index) => {
        const snakeEl = document.createElement('div');
        snakeEl.style.gridRowStart = segment.y;
        snakeEl.style.gridColumnStart = segment.x;
        snakeEl.classList.add(index === 0 ? 'snake-head' : 'snake-body');
        board.appendChild(snakeEl);
    });

    const foodEl = document.createElement('div');
    foodEl.style.gridRowStart = food.y;
    foodEl.style.gridColumnStart = food.x;
    foodEl.classList.add('food');
    board.appendChild(foodEl);

    if (powerUp) {
        const pUpEl = document.createElement('div');
        pUpEl.style.gridRowStart = powerUp.y;
        pUpEl.style.gridColumnStart = powerUp.x;
        pUpEl.classList.add(powerUp.type === 'super' ? 'powerup-super' : 'powerup-sneaky');
        board.appendChild(pUpEl);
    }
}

function handleInput(e) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && isGameRunning) {
        e.preventDefault(); 
    }

    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 }; break;
        case 'ArrowDown': case 's': case 'S':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 }; break;
        case 'ArrowLeft': case 'a': case 'A':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': case 'D':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 }; break;
    }
}

function placeFood() {
    food = getRandomEmptyPosition();
}

function placePowerUp() {
    if (powerUp) return; 
    powerUp = getRandomEmptyPosition();
    powerUp.type = Math.random() > 0.5 ? 'super' : 'sneaky';
}

function activatePowerUp(type) {
    powerupContainer.classList.remove('invisible');
    
    if (type === 'super') {
        score += 50; 
        powerupDisplay.textContent = "SUPER SNAKE (+50)";
        powerupDisplay.style.color = "#ffd700";
    } else if (type === 'sneaky') {
        currentSpeed = baseSpeed + 100; 
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, currentSpeed);
        powerupDisplay.textContent = "SNEAKY (SLOW MO)";
        powerupDisplay.style.color = "#00bcd4";
    }
    updateScore();

    clearTimeout(powerUpTimer);
    powerUpTimer = setTimeout(clearPowerUps, 5000);
}

function clearPowerUps() {
    powerupContainer.classList.add('invisible');
    powerupDisplay.textContent = "\u00A0"; 
    currentSpeed = baseSpeed;
    if (isGameRunning) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, currentSpeed);
    }
}

function generateDangerWalls() {
    dangerWalls = [];
    const numWalls = Math.floor(Math.random() * 4) + 2; 
    for (let i = 0; i < numWalls; i++) {
        dangerWalls.push(getRandomEmptyPosition());
    }
}

function getRandomEmptyPosition() {
    let pos;
    while (true) {
        pos = {
            x: Math.floor(Math.random() * GRID_SIZE) + 1,
            y: Math.floor(Math.random() * GRID_SIZE) + 1
        };
        
        const onSnake = snake.some(seg => seg.x === pos.x && seg.y === pos.y);
        const onWall = dangerWalls.some(w => w.x === pos.x && w.y === pos.y);
        const onFood = (food && food.x === pos.x && food.y === pos.y);
        const inCenter = (pos.x >= 9 && pos.x <= 13 && pos.y >= 9 && pos.y <= 13);
        
        if (!onSnake && !onWall && !onFood && !inCenter) break;
    }
    return pos;
}

function updateScore() {
    scoreDisplay.textContent = score;
}

function handleGameOver() {
    clearInterval(gameInterval);
    isGameRunning = false;
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('d-none');
    
    // Uses your imported saveHighScore function
    saveHighScore(score);

    // Still dispatches the event in case leaderboard.js relies on it
    const gameOverEvent = new CustomEvent('snakeGameOver', { 
        detail: { score: score, player: hudPlayerName.textContent } 
    });
    document.dispatchEvent(gameOverEvent);
}

function saveSettings() {
    const theme = themeSelect.value;
    const speed = speedSelect.value;
    const playerName = playerNameInput.value.trim() || 'Guest';

    // Uses your imported storage module functions
    saveTheme(theme);
    saveSpeed(speed);
    savePlayerName(playerName);

    document.body.className = `theme-${theme} text-theme bg-canvas`;
    hudPlayerName.textContent = playerName;
    setGameSpeed(speed);

    const modalEl = document.getElementById('settingsModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if(modal) modal.hide();
}

function setGameSpeed(speedValue) {
    const speedMap = { '10': 200, '7': 150, '5': 100, '3': 60 };
    baseSpeed = speedMap[speedValue] || 150;
    currentSpeed = baseSpeed;
}
