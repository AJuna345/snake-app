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

var WIDTH = 26, HEIGHT = 26; // Width and height of the game board
var EMPTY = 0, SNAKE = 1, FOOD = 2;
var LEFT  = 0, RIGHT = 1, UP = 2, DOWN  = 3;
var KEY_LEFT = 37, KEY_RIGHT = 39, KEY_UP = 38, KEY_DOWN  = 40;
var canvas, ctx, keystate, frames, score, gameOver; 
var speed = 7; 
var foodScore = 1; // Will dynamically update based on speed
var changingDirection = false; // Added to prevent double-turn suicide bug

// Default Theme Colors
var snakeColor = "#28a745";
var canvasBg = "#ffffff";
var textColor = "#333333";
var borderColor = "#333333"; 

// Get the CSS theme colors to make the game match the selected theme
function updateThemeColors() {
    const computedStyle = getComputedStyle(document.body);
    snakeColor = computedStyle.getPropertyValue('--snake-color').trim() || "#28a745";
    canvasBg = computedStyle.getPropertyValue('--canvas-bg').trim() || "#ffffff";
    textColor = computedStyle.getPropertyValue('--text-color').trim() || "#333333";
    borderColor = computedStyle.getPropertyValue('--border-color').trim() || "#333333";
}

// Create the gameboard grid
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
    var randpos = empty[Math.floor(Math.random()*empty.length)];
    grid.set(FOOD, randpos.x, randpos.y);
}

function main() {
    // Clear board container to prevent duplicate canvases on restart
    const board = document.getElementById("game-board");
    board.innerHTML = ""; 
    
    canvas = document.createElement("canvas");
    canvas.width = WIDTH*20; canvas.height = HEIGHT*20;
    
    // --- Responsive Canvas Fix ---
    canvas.style.maxWidth = "100%";
    canvas.style.height = "auto";
    
    ctx = canvas.getContext("2d");
    board.appendChild(canvas);
    
    keystate = {};
    document.addEventListener("keydown", function(evt) { keystate[evt.keyCode] = true; });
    document.addEventListener("keyup", function(evt) { delete keystate[evt.keyCode]; });
    
    initGame();
    loop();
}

// Helper function to update the High Score on the left HUD
function updateHighScoreHUD() {
    const highScores = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
    const topScore = highScores.length > 0 ? highScores[0].score : 0;
    const hudHighScore = document.getElementById("hudHighScoreDisplay");
    if (hudHighScore) hudHighScore.innerText = topScore;
}

function initGame() {
    score = 0; 
    gameOver = false;
    frames = 0;           
    speed = getSpeed();   
    changingDirection = false; // Reset lock on game start

    // --- RESTORED MULTIPLIER LOGIC ---
    if (speed >= 10) foodScore = 1;      // Slow
    else if (speed >= 7) foodScore = 2;  // Normal
    else if (speed >= 5) foodScore = 3;  // Fast
    else foodScore = 5;                  // Insane

    grid.init(EMPTY, WIDTH, HEIGHT);
    var sp = {x:Math.floor(WIDTH/2), y:HEIGHT-1};
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);
    setFood();
    
    // Ensure HUD score resets when starting a new game
    const hudScore = document.getElementById("hudScoreDisplay");
    if (hudScore) hudScore.innerText = score;
    
    // Fetch and display latest high score dynamically
    updateHighScoreHUD();
}

function loop() {
    updateThemeColors(); 
    update();
    draw();
    if (!gameOver) { window.requestAnimationFrame(loop, canvas); }
}

function update() {
    frames++;
    
    // Prevent multiple inputs from overriding the direction in a single movement frame
    if (!changingDirection) {
        if (keystate[KEY_LEFT] && snake.direction !== RIGHT) { snake.direction = LEFT; changingDirection = true; }
        else if (keystate[KEY_UP] && snake.direction !== DOWN) { snake.direction = UP; changingDirection = true; }
        else if (keystate[KEY_RIGHT] && snake.direction !== LEFT) { snake.direction = RIGHT; changingDirection = true; }
        else if (keystate[KEY_DOWN] && snake.direction !== UP) { snake.direction = DOWN; changingDirection = true; }
    }

    if (frames % speed === 0) {
        var nx = snake.last.x; var ny = snake.last.y;
        switch (snake.direction) {
            case LEFT:  nx--; break;
            case UP:    ny--; break;
            case RIGHT: nx++; break;
            case DOWN:  ny++; break;
        }

        if (0 > nx || nx > grid.width-1 || 0 > ny || ny > grid.height-1 || grid.get(nx, ny) === SNAKE) {
            gameOver = true;
            saveHighScore(getPlayerName(), score);
            document.getElementById("gameOverScreen").classList.remove("d-none");
            document.getElementById("finalScore").innerText = score;
            return;
        }

        if (grid.get(nx, ny) === FOOD) {
            score += foodScore;
            const hudScore = document.getElementById("hudScoreDisplay");
            if (hudScore) hudScore.innerText = score; 
            setFood();
        } else {
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
        }
        grid.set(SNAKE, nx, ny);
        snake.insert(nx, ny);
        
        // Unlock direction changes immediately AFTER the snake physically moves
        changingDirection = false;
    }
}

function draw() {
    var tw = canvas.width/grid.width;
    var th = canvas.height/grid.height;

    var contrastColor = canvasBg === "#ffffff" || canvasBg === "#ecf0f1" ? "#000000" : "#ffffff";

    for (var x=0; x < grid.width; x++) {
        for (var y=0; y < grid.height; y++) {
            var val = grid.get(x, y);
            
            ctx.shadowBlur = 0; 
            ctx.fillStyle = canvasBg;
            ctx.fillRect(x*tw, y*th, tw, th);

            if (val === SNAKE) {
                if (x === snake.last.x && y === snake.last.y) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = snakeColor;
                    ctx.fillStyle = snakeColor;
                    ctx.fillRect(x*tw + 2, y*th + 2, tw - 4, th - 4);
                    
                    ctx.shadowBlur = 5;
                    ctx.fillStyle = contrastColor;
                    if (snake.direction === UP || snake.direction === DOWN) {
                        ctx.fillRect(x*tw + 4, y*th + th/2 - 2, 4, 4); 
                        ctx.fillRect(x*tw + tw - 8, y*th + th/2 - 2, 4, 4); 
                    } else {
                        ctx.fillRect(x*tw + tw/2 - 2, y*th + 4, 4, 4); 
                        ctx.fillRect(x*tw + tw/2 - 2, y*th + th - 8, 4, 4); 
                    }
                } else {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = snakeColor;
                    ctx.fillStyle = snakeColor;
                    ctx.fillRect(x*tw + 2, y*th + 2, tw - 4, th - 4);
                    
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = canvasBg;
                    ctx.fillRect(x*tw + tw/2 - 1, y*th + 2, 2, th - 4); 
                    ctx.fillRect(x*tw + 2, y*th + th/2 - 1, tw - 4, 2); 
                }
            } else if (val === FOOD) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = borderColor;
                ctx.fillStyle = borderColor;
                
                ctx.beginPath();
                ctx.arc(x*tw + tw/2, y*th + th/2 + 2, tw/2 - 4, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.shadowBlur = 0;
                ctx.fillStyle = contrastColor;
                ctx.fillRect(x*tw + tw/2 - 1, y*th + 2, 2, 4);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");
    const upBtn = document.getElementById("upBtn");
    const downBtn = document.getElementById("downBtn");
    const leftBtn = document.getElementById("leftBtn");
    const rightBtn = document.getElementById("rightBtn");

    const settingsModal = document.getElementById('settingsModal');
    const nameInput = document.getElementById('playerNameInput');
    const themeSelect = document.getElementById('themeSelect');
    const speedSelect = document.getElementById('speedSelect');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    // New hook for the HUD Player Name
    const hudPlayerName = document.getElementById('hudPlayerName');

    let initialTheme = getTheme();
    let settingsSaved = false;

    // Initialize UI values
    const currentPlayerName = getPlayerName() || "Guest";
    if (nameInput) nameInput.value = currentPlayerName;
    if (hudPlayerName) hudPlayerName.innerText = currentPlayerName;
    if (themeSelect) themeSelect.value = initialTheme;
    if (speedSelect) speedSelect.value = getSpeed();

    if (startBtn) {
        startBtn.addEventListener("click", function() {
            document.getElementById("startScreen").classList.add("d-none");
            startBtn.classList.add("d-none");
            restartBtn.classList.remove("d-none");
            main(); 
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener("click", function() {
            document.getElementById("gameOverScreen").classList.add("d-none"); 
            initGame(); 
            loop(); 
        });
    }

    // Mobile controls with direction lock logic applied
    if (upBtn) upBtn.addEventListener("click", () => { if (snake.direction !== DOWN && !changingDirection) { snake.direction = UP; changingDirection = true; }});
    if (downBtn) downBtn.addEventListener("click", () => { if (snake.direction !== UP && !changingDirection) { snake.direction = DOWN; changingDirection = true; }});
    if (leftBtn) leftBtn.addEventListener("click", () => { if (snake.direction !== RIGHT && !changingDirection) { snake.direction = LEFT; changingDirection = true; }});
    if (rightBtn) rightBtn.addEventListener("click", () => { if (snake.direction !== LEFT && !changingDirection) { snake.direction = RIGHT; changingDirection = true; }});

    if (settingsModal) {
        settingsModal.addEventListener('show.bs.modal', function () {
            initialTheme = getTheme();
            settingsSaved = false;
        });

        settingsModal.addEventListener('hide.bs.modal', function () {
            if (!settingsSaved) {
                document.body.className = `theme-${initialTheme}`;
                themeSelect.value = initialTheme;
                updateThemeColors();
                if (canvas && ctx) draw();
            }
        });
    }

    if (themeSelect) {
        themeSelect.addEventListener('change', function(e) {
            const previewTheme = e.target.value;
            document.body.className = `theme-${previewTheme}`;
            updateThemeColors();
            if (canvas && ctx) draw();
        });
    }

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            settingsSaved = true; 
            
            if (nameInput) {
                const newName = nameInput.value || "Guest";
                savePlayerName(newName);
                // Update the HUD instantly
                if (hudPlayerName) hudPlayerName.innerText = newName; 
            }
            
            if (themeSelect) {
                const newTheme = themeSelect.value;
                saveTheme(newTheme);
                initialTheme = newTheme; 
                document.body.className = `theme-${newTheme}`;
            }
            
            if (speedSelect) {
                const newSpeed = parseInt(speedSelect.value, 10);
                saveSpeed(newSpeed);
                speed = newSpeed;
                
                if (speed >= 10) foodScore = 1;
                else if (speed >= 7) foodScore = 2;
                else if (speed >= 5) foodScore = 3;
                else foodScore = 5;
            }

            updateThemeColors();
            if (canvas && ctx) draw();
            
            const modalInstance = window.bootstrap.Modal.getInstance(settingsModal);
            if (modalInstance) {
                modalInstance.hide();
            }
        });
    }
});
