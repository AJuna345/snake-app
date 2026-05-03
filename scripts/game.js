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

// Active Powerup tracking variables (The effect on the player)
var activePowerup = null;
var powerupTimer = 0;

// Board Powerup tracking variables (The item sitting on the grid)
var boardPowerupPos = null;
var boardPowerupTimer = 0;

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
    // Prevent spawning a new one if there is already an active mystery box on the board
    if (boardPowerupPos !== null) return;

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

        // Track the grid location and start the 10-second (600 frames) expiration timer
        boardPowerupPos = { x: randpos.x, y: randpos.y };
        boardPowerupTimer = 600;
    }
}

function updatePowerupText(text) {
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
    
    canvas.style.maxWidth = "100%";
    canvas.style.height = "auto";
    canvas.style.touchAction = "none"; 
    
    ctx = canvas.getContext("2d");
    board.appendChild(canvas);
    
    keystate = {};
    document.addEventListener("keydown", function(evt) { keystate[evt.keyCode] = true; });
    document.addEventListener("keyup", function(evt) { delete keystate[evt.keyCode]; });
    
    // --- BULLETPROOF MOBILE & DESKTOP INPUT HANDLER ---
    function handlePlayerInput(e) {
        if (gameOver || snake.last === null) return;
        if (changingDirection) return;

        // Safely prevent default scrolling if the event allows it
        if (e.type === 'touchstart' && e.cancelable) {
            e.preventDefault(); 
        }

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

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

    canvas.addEventListener("touchstart", handlePlayerInput, { passive: false });
    canvas.addEventListener("mousedown", handlePlayerInput);
    
    initGame();
    gameLoop();
}

function updateHighScore() {
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
    
    // Clear board item tracking
    boardPowerupPos = null;
    boardPowerupTimer = 0;
    
    updatePowerupText(null); 

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
    updateHighScore();
}

function gameLoop() {
    updateThemeColors(); 
    update();
    draw();
    if (!gameOver) { window.requestAnimationFrame(gameLoop, canvas); }
}

function update() {
    frames++;
    
    // Process active powerup effect on the player
    if (powerupTimer > 0) {
        powerupTimer--;
        if (powerupTimer === 0) {
            activePowerup = null;
            speed = baseSpeed; 
            updatePowerupText(null); 
        }
    }

    // Process expiration of mystery boxes sitting on the game board
    if (boardPowerupTimer > 0) {
        boardPowerupTimer--;
        if (boardPowerupTimer === 0 && boardPowerupPos !== null) {
            // Verify the tile is still a power-up (it hasn't been eaten or overwritten)
            let currentTile = grid.get(boardPowerupPos.x, boardPowerupPos.y);
            if (currentTile >= SCORE2X && currentTile <= SLOWMO) {
                grid.set(EMPTY, boardPowerupPos.x, boardPowerupPos.y);
            }
            boardPowerupPos = null;
        }
    }
    
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

        if (0 > nx || nx > grid.width-1 || 0 > ny || ny > grid.height-1 || grid.get(nx, ny) === SNAKE || grid.get(nx, ny) === WALL) {
            gameOver = true;
            saveHighScore(getPlayerName(), score);
            document.getElementById("gameOverScreen").classList.remove("d-none");
            document.getElementById("finalScore").innerText = score;
            return;
        }

        let targetVal = grid.get(nx, ny);

        if (targetVal === FOOD) {
            score += (activePowerup === SCORE2X) ? (foodScore * 2) : foodScore;
            const hudScore = document.getElementById("hudScoreDisplay");
            if (hudScore) hudScore.innerText = score; 
            
            setFood();
            
            if (Math.random() < 0.90) spawnPowerup();

        } else if (targetVal >= SCORE2X && targetVal <= SLOWMO) {
            // Picked up a Mystery Powerup! Clear the board tracking variables.
            boardPowerupPos = null;
            boardPowerupTimer = 0;

            if (targetVal === SCORE2X) {
                activePowerup = SCORE2X;
                powerupTimer = 600; 
                updatePowerupText("Double Score!");
            } else if (targetVal === NEWWALLS) {
                generateRandomWalls(2); 
                activePowerup = NEWWALLS;
                powerupTimer = 600; 
                updatePowerupText("New Walls!?!");
            } else if (targetVal === SLOWMO) {
                activePowerup = SLOWMO;
                powerupTimer = 600; 
                speed = baseSpeed + 4; 
                updatePowerupText("Slow Mo");
            }
            
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
            
        } else {
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
        }
        
        grid.set(SNAKE, nx, ny);
        snake.insert(nx, ny);
        
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
                
            } else if (val === WALL) {
                ctx.shadowBlur = 0; 
                
                // Draw filled box with half transparency
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = borderColor; 
                ctx.fillRect(x*tw, y*th, tw, th); 
                
                // Draw outline with full opacity
                ctx.globalAlpha = 1.0;
                ctx.strokeStyle = borderColor; 
                ctx.lineWidth = 2;
                ctx.strokeRect(x*tw + 2, y*th + 2, tw - 4, th - 4);
                
            } else if (val >= SCORE2X && val <= SLOWMO) {
                ctx.shadowBlur = 15;
                ctx.shadowColor = "#f1c40f"; 
                ctx.fillStyle = "#f39c12";
                
                ctx.beginPath();
                ctx.moveTo(x*tw + tw/2, y*th + 2);
                ctx.lineTo(x*tw + tw - 2, y*th + th/2);
                ctx.lineTo(x*tw + tw/2, y*th + th - 2);
                ctx.lineTo(x*tw + 2, y*th + th/2);
                ctx.fill();
                
                ctx.shadowBlur = 0;
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(x*tw + tw/2 - 2, y*th + th/2 - 2, 4, 4);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");

    const settingsModal = document.getElementById('settingsModal');
    const nameInput = document.getElementById('playerNameInput');
    const themeSelect = document.getElementById('themeSelect');
    const speedSelect = document.getElementById('speedSelect');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const hudPlayerName = document.getElementById('hudPlayerName');

    const upBtn = document.getElementById("upBtn");
    const downBtn = document.getElementById("downBtn");
    const leftBtn = document.getElementById("leftBtn");
    const rightBtn = document.getElementById("rightBtn");

    let initialTheme = getTheme();
    let settingsSaved = false;

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
            gameLoop(); 
        });
    }

    // Attach mobile D-Pad controls as an alternative/fallback if they exist in the HTML layout
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
                baseSpeed = newSpeed;
                speed = newSpeed;
                
                if (baseSpeed >= 10) foodScore = 1;
                else if (baseSpeed >= 7) foodScore = 2;
                else if (baseSpeed >= 5) foodScore = 3;
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
