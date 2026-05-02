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
var EMPTY = 0, SNAKE = 1, FOOD = 2;
var LEFT  = 0, RIGHT = 1, UP = 2, DOWN  = 3;
var KEY_LEFT = 37, KEY_RIGHT = 39, KEY_UP = 38, KEY_DOWN  = 40;
var canvas, ctx, keystate, frames, score, gameOver; 
var speed = 7; 
var foodScore = 1; 
var gameStarted = false;
var animationStarted = false;

// PNG Asset Loading
var headImg = new Image();
headImg.src = "images/snake-head.png";
var bodyImg = new Image();
bodyImg.src = "images/snake-body.png";
var foodImg = new Image();
foodImg.src = "images/food.png";

// Default Theme Colors
var snakeColor = "#28a745";
var canvasBg = "#ffffff";
var textColor = "#333333";

function updateThemeColors() {
    const computedStyle = getComputedStyle(document.body);
    snakeColor = computedStyle.getPropertyValue('--snake-color').trim() || "#28a745";
    canvasBg = computedStyle.getPropertyValue('--canvas-bg').trim() || "#ffffff";
    textColor = computedStyle.getPropertyValue('--text-color').trim() || "#333333";
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
    var randpos = empty[Math.floor(Math.random()*empty.length)];
    grid.set(FOOD, randpos.x, randpos.y);
}

function main() {
    canvas = document.createElement("canvas");
    canvas.width = WIDTH*20; canvas.height = HEIGHT*20;
    ctx = canvas.getContext("2d");
    document.getElementById("game-board").appendChild(canvas);
    keystate = {};
    document.addEventListener("keydown", function(evt) { keystate[evt.keyCode] = true; });
    document.addEventListener("keyup", function(evt) { delete keystate[evt.keyCode]; });
    initGame();
    loop();
}

function initGame() {
    score = 0; gameOver = false;
    grid.init(EMPTY, WIDTH, HEIGHT);
    var sp = {x:Math.floor(WIDTH/2), y:HEIGHT-1};
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);
    setFood();
}

function loop() {
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
            document.getElementById("gameOverScreen").classList.remove("hidden");
            document.getElementById("finalScore").innerText = score;
            return;
        }

        if (grid.get(nx, ny) === FOOD) {
            score += foodScore;
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

    for (var x=0; x < grid.width; x++) {
        for (var y=0; y < grid.height; y++) {
            var val = grid.get(x, y);
            
            // Draw Background Tiles
            ctx.fillStyle = canvasBg;
            ctx.fillRect(x*tw, y*th, tw, th);

            if (val === SNAKE) {
                if (x === snake.last.x && y === snake.last.y) {
                    // Draw Head with Rotation logic
                    ctx.save();
                    ctx.translate(x*tw + tw/2, y*th + th/2);
                    
                    if (snake.direction === UP) ctx.rotate(0);
                    else if (snake.direction === DOWN) ctx.rotate(Math.PI);
                    else if (snake.direction === LEFT) ctx.rotate(-Math.PI/2);
                    else if (snake.direction === RIGHT) ctx.rotate(Math.PI/2);
                    
                    ctx.drawImage(headImg, -tw/2, -th/2, tw, th);
                    ctx.restore();
                } else {
                    // Draw Body segments
                    ctx.drawImage(bodyImg, x*tw, y*th, tw, th);
                }
            } else if (val === FOOD) {
                // Draw Food/Fruit
                ctx.drawImage(foodImg, x*tw, y*th, tw, th);
            }
        }
    }
    
    ctx.fillStyle = textColor;
    ctx.font = "14px DotGothic16";
    ctx.fillText("SCORE: " + score, 10, canvas.height - 10);
}
