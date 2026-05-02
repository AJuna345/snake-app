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
var speed = 7; // Default speed (Normal)
var foodScore = 1; // Increase scores with higher difficulty levels/speeds

// Default Theme Colors
var snakeColor = "#28a745";
var canvasBg = "#ffffff";
var textColor = "#333333";
var borderColor = "#333333"; // Added to use for food color

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
    ctx = canvas.getContext("2d");
    board.appendChild(canvas);
    
    keystate = {};
    document.addEventListener("keydown", function(evt) { keystate[evt.keyCode] = true; });
    document.addEventListener("keyup", function(evt) { delete keystate[evt.keyCode]; });
    
    initGame();
    loop();
}

function initGame() {
    score = 0; 
    gameOver = false;
    frames = 0;           // FIX 1: Initialize frames so math works!
    speed = getSpeed();   // FIX 2: Pull the player's saved speed

    grid.init(EMPTY, WIDTH, HEIGHT);
    var sp = {x:Math.floor(WIDTH/2), y:HEIGHT-1};
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);
    setFood();
    
    // Ensure HUD score resets when starting a new game
    document.getElementById("hudScoreDisplay").innerText = score;
}

function loop() {
    updateThemeColors(); // Ensure colors update if theme changes mid-game
    update();
    draw();
    if (!gameOver) { window.requestAnimationFrame(loop, canvas); }
}

function update() {
    frames++;
    if (keystate[KEY_LEFT] && snake.direction !== RIGHT) snake.direction = LEFT;
    if (keystate[KEY_UP] && snake.direction !== DOWN) snake.direction = UP;
    if (keystate[KEY_RIGHT] && snake.direction !== LEFT) snake.direction = RIGHT;
    if (keystate[KEY_DOWN] && snake.direction !== UP) snake.direction = DOWN;

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
            // Trigger Bootstrap d-none toggle to show Game Over screen
            document.getElementById("gameOverScreen").classList.remove("d-none");
            document.getElementById("finalScore").innerText = score;
            return;
        }

        if (grid.get(nx, ny) === FOOD) {
            score += foodScore;
            document.getElementById("hudScoreDisplay").innerText = score; // Update left-hand HUD
            setFood();
        } else {
            var tail = snake.remove();
            grid.set(EMPTY, tail.x, tail.y);
        }
        grid.set(SNAKE, nx, ny);
        snake.insert(nx, ny);
    }
}

function draw() {
    var tw = canvas.width/grid.width;
    var th = canvas.height/grid.height;

    // Helper to determine contrast color for eyes/stems based on background
    var contrastColor = canvasBg === "#ffffff" || canvasBg === "#ecf0f1" ? "#000000" : "#ffffff";

    for (var x=0; x < grid.width; x++) {
        for (var y=0; y < grid.height; y++) {
            var val = grid.get(x, y);
            
            // Draw Background Tiles
            ctx.shadowBlur = 0; // Reset shadow for background
            ctx.fillStyle = canvasBg;
            ctx.fillRect(x*tw, y*th, tw, th);

            if (val === SNAKE) {
                if (x === snake.last.x && y === snake.last.y) {
                    // Draw Neon Tech Snake Head
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = snakeColor;
                    ctx.fillStyle = snakeColor;
                    ctx.fillRect(x*tw + 2, y*th + 2, tw - 4, th - 4);
                    
                    // Draw Glowing Eyes based on direction
                    ctx.shadowBlur = 5;
                    ctx.fillStyle = contrastColor;
                    if (snake.direction === UP || snake.direction === DOWN) {
                        ctx.fillRect(x*tw + 4, y*th + th/2 - 2, 4, 4); // Left eye
                        ctx.fillRect(x*tw + tw - 8, y*th + th/2 - 2, 4, 4); // Right eye
                    } else {
                        ctx.fillRect(x*tw + tw/2 - 2, y*th + 4, 4, 4); // Top eye
                        ctx.fillRect(x*tw + tw/2 - 2, y*th + th - 8, 4, 4); // Bottom eye
                    }
                } else {
                    // Draw Neon Tech Body Segment
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = snakeColor;
                    ctx.fillStyle = snakeColor;
                    ctx.fillRect(x*tw + 2, y*th + 2, tw - 4, th - 4);
                    
                    // Internal Digital Grid Lines (cutout using background color)
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = canvasBg;
                    ctx.fillRect(x*tw + tw/2 - 1, y*th + 2, 2, th - 4); // Vertical line
                    ctx.fillRect(x*tw + 2, y*th + th/2 - 1, tw - 4, 2); // Horizontal line
                }
            } else if (val === FOOD) {
                // Draw Neon Apple (Food) using the border color
                ctx.shadowBlur = 15;
                ctx.shadowColor = borderColor;
                ctx.fillStyle = borderColor;
                
                // Apple body (circle)
                ctx.beginPath();
                ctx.arc(x*tw + tw/2, y*th + th/2 + 2, tw/2 - 4, 0, 2 * Math.PI);
                ctx.fill();
                
                // Apple Stem
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

    console.log("Hint: If you hate Mondays, try Garfield as your name.");

    if (startBtn) {
        startBtn.addEventListener("click", function() {
            // Hide the Start Screen using Bootstrap's d-none class
            document.getElementById("startScreen").classList.add("d-none");
            
            // Swap the buttons in the HUD
            startBtn.classList.add("d-none");
            restartBtn.classList.remove("hidden");
            restartBtn.classList.remove("d-none");
            
            // Start the game loop
            main(); 
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener("click", function() {
            // Hide the Game Over Screen
            document.getElementById("gameOverScreen").classList.add("d-none"); 
            
            // Re-initialize the game variables
            initGame(); 
        });
    }

    // Mobile keyboard touch controls
    if (upBtn) {
        upBtn.addEventListener("click", function() {
            if (snake.direction !== DOWN) snake.direction = UP;
        });
    }
    if (downBtn) {
        downBtn.addEventListener("click", function() {
            if (snake.direction !== UP) snake.direction = DOWN;
        });
    }
    if (leftBtn) {
        leftBtn.addEventListener("click", function() {
            if (snake.direction !== RIGHT) snake.direction = LEFT;
        });
    }
    if (rightBtn) {
        rightBtn.addEventListener("click", function() {
            if (snake.direction !== LEFT) snake.direction = RIGHT;
        });
    }
});
