// Import saved Player settings and Leaderboard functions from storage.js using an ES module
import {
    getPlayerName,
    savePlayerName,
    getTheme,
    saveTheme,
    getSpeed,
    saveSpeed,
    saveHighScore
} from './storage.js';

var WIDTH = 26, HEIGHT = 26; 
var EMPTY = 0, SNAKE = 1, FOOD = 2, WALL = 3, SCORE2X = 4, NEWWALLS = 5, SLOWMO = 6;
var LEFT  = 0, RIGHT = 1, UP = 2, DOWN  = 3;
var KEY_LEFT = 37, KEY_RIGHT = 39, KEY_UP = 38, KEY_DOWN  = 40;
var canvas, ctx, keystate, frames, score, gameOver; 
var baseSpeed = 7; 
var speed = 7; 
var foodScore = 1; 
var changingDirection = false; 

// Powerup tracking variables
var activePowerup = null;
var powerupTimer = 0;

// Default Theme Colors
var snakeColor = "#28a745";
var canvasBg = "#ffffff";
var textColor = "#333333";
var borderColor = "#333333"; 

function updateThemeColors() {
    const computedStyle = getComputedStyle(document.body);
    snakeColor = computedStyle.getPropertyValue('--snake-color').trim() || "#28a745";
    canvasBg = computedStyle.getPropertyValue('--canvas-bg').trim() || "#ffffff";
    textColor = computedStyle.getPropertyValue('--text-color').trim() || "#333333";
    borderColor = computedStyle.getPropertyValue('--border-color').trim() || "#333333";
}

var grid = {
    width: null, height: null, _grid: null,
    init: function(d, c, r) {
        this.width = c; this.height = r; this._grid = [];
        for (var x=0; x < c; x++) {
            this._grid.push([]);
            for (var y=0; y < r; y++) { this._grid[x].push(d); }
        }
    },
    set: function(val, x, y) { this._grid[x][y] = val; },
    get: function(x, y) { return this._grid[x][y]; }
};

var snake = {
    direction: null, last: null, _queue: null,
    init: function(d, x, y) {
        this.direction = d; this._queue = [];
        this.insert(x, y);
    },
    insert: function(x, y) {
        this._queue.unshift({x:x, y:y});
        this.last = this._queue[0];
    },
    remove: function() { return this._queue.pop(); }
};

function setFood() {
    var empty = [];
    for (var x=0; x < grid.width; x++) {
        for (var y=0; y < grid.height; y++) {
            if (grid.get(x, y) === EMPTY) { empty.push({x:x, y:y}); }
        }
    }
    if (empty.length > 0) {
        var randpos = empty[Math.floor(Math.random()*empty.length)];
        grid.set(FOOD, randpos.x, randpos.y);
    }
}

function spawnPowerup() {
    var empty = [];
    for (var x=0; x < grid.width; x++) {
        for (var y=0; y < grid.height; y++) {
            if (grid.get(x, y) === EMPTY) { empty.push({x:x, y:y}); }
        }
    }
    if (empty.length > 0) {
        var randpos = empty[Math.floor(Math.random()*empty.length)];
        var pType = Math.floor(Math.random() * 3) + 4; 
        grid.set(pType, randpos.x, randpos.y);
    }
}

function updatePowerupHUD(text) {
    const container = document.getElementById('powerupContainer');
    const display = document.getElementById('hudPowerupDisplay');
    if (container && display) {
        if (text) {
            display.innerText = text;
            container.classList.remove('invisible');
        } else {
            display.innerText = "";
            container.classList.add('invisible');
        }
    }
}

function main() {
    const board = document.getElementById("game-board");
    board.innerHTML = ""; 
    
    canvas = document.createElement("canvas");
    canvas.width = WIDTH*20; canvas.height = HEIGHT*20;
    
    // Applying scaling here (touch-action moved to CSS for stability)
    canvas.style.maxWidth = "100%";
    canvas.style.height = "auto";
    
    ctx = canvas.getContext("2d");
    board.appendChild(canvas);
    
    keystate = {};
    document.addEventListener("keydown", function(evt) { keystate[evt.keyCode] = true; });
    document.addEventListener("keyup", function(evt) { delete keystate[evt.keyCode]; });
    
    // --- UPDATED BULLETPROOF MOBILE & DESKTOP INPUT HANDLER ---
    function handleInput(e) {
        if (gameOver || snake.last === null) return;
        if (changingDirection) return;

        // Safely prevent default scrolling if the event allows it
        if (e.type === 'touchstart' && e.cancelable) {
            e.preventDefault(); 
        }

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        // Safe extraction of coordinates across all device types
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            clientX = e.changedTouches[0].clientX;
            clientY = e.changedTouches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (clientX - rect.left) * scaleX;
        const clickY = (clientY - rect.top) * scaleY;

        const tw = canvas.width / grid.width;
        const th = canvas.height / grid.height;
        const headX = (snake.last.x * tw) + (tw / 2);
        const headY = (snake.last.y * th) + (th / 2);

        const dx = clickX - headX;
        const dy = clickY - headY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0 && snake.direction !== LEFT) { snake.direction = RIGHT; changingDirection = true; }
            else if (dx < 0 && snake.direction !== RIGHT) { snake.direction = LEFT; changingDirection = true; }
        } else {
            if (dy > 0 && snake.direction !== UP) { snake.direction = DOWN; changingDirection = true; }
            else if (dy < 0 && snake.direction !== DOWN) { snake.direction = UP; changingDirection = true; }
        }
    }

    // Attach to both touch devices and standard mouse clicks
    canvas.addEventListener("touchstart", handleInput, { passive: false });
    canvas.addEventListener("mousedown", handleInput);
    
    initGame();
    loop();
}

function updateHighScoreHUD() {
    const highScores = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
    const topScore = highScores.length > 0 ? highScores[0].score : 0;
    const hudHighScore = document.getElementById("hudHighScoreDisplay");
    if (hudHighScore) hudHighScore.innerText = topScore;
}

function generateRandomWalls(numWalls) {
    var spawnX = Math.floor(WIDTH / 2);
    var spawnY = HEIGHT - 1;

    for (var i = 0; i < numWalls; i++) {
        var length = Math.floor(Math.random() * 4) + 2; 
        var isHorizontal = Math.random() < 0.5; 
        
        var startX = Math.floor(Math.random() * WIDTH);
        var startY = Math.floor(Math.random() * HEIGHT);

        if (isHorizontal && startX + length > WIDTH) startX = WIDTH - length;
        if (!isHorizontal && startY + length > HEIGHT) startY = HEIGHT - length;

        for (var j = 0; j < length; j++) {
            var wx = isHorizontal ? startX + j : startX;
            var wy = isHorizontal ? startY : startY + j;
            
            if (grid.get(wx, wy) === EMPTY) {
                if (Math.abs(wx - spawnX) < 4 && Math.abs(wy - spawnY) < 4) {
                    continue; 
                }
                grid.set(WALL, wx, wy);
            }
        }
    }
}

function initGame() {
    score = 0; 
    gameOver = false;
    frames = 0;           
    baseSpeed = getSpeed();   
    speed = baseSpeed;
    changingDirection = false; 
    
    activePowerup = null;
    powerupTimer = 0;
    
    updatePowerupHUD(null); 

    if (baseSpeed >= 10) foodScore = 1;      
    else if (baseSpeed >= 7) foodScore = 2;  
    else if (baseSpeed >= 5) foodScore = 3;  
    else foodScore = 5;                  

    grid.init(EMPTY, WIDTH, HEIGHT);
    var sp = {x:Math.floor(WIDTH/2), y:HEIGHT-1};
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);
    
    generateRandomWalls(6); 
    setFood(); 
    
    const hudScore = document.getElementById("hudScoreDisplay");
    if (hudScore) hudScore.innerText = score;
    updateHighScoreHUD();
}

function loop() {
    updateThemeColors(); 
    update
