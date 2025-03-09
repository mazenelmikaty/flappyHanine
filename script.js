const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 640;

// Load images
const playerImg = new Image();
playerImg.src = "images/gf.png";  // Her picture as the player

const pipeTop = new Image();
pipeTop.src = "images/pipe-top.png";

const pipeBottom = new Image();
pipeBottom.src = "images/pipe-bottom.png";

const badImg = new Image();
badImg.src = "images/bad.png";  // Bad picture on fail

const winImg = new Image();
winImg.src = "images/win.png";  // Your picture together for winning

// Player properties
let player = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    gravity: 0.5,
    velocity: 0,
    jumpPower: -8
};

// Pipe properties
let pipes = [];
const pipeWidth = 150;
const pipeGap = 200;
const pipeSpeed = 2;

// Game variables
let score = 0;
let fails = 0;
let isGameOver = false;
let gameStarted = false; 

// Add pipes at intervals
function generatePipe() {
    let topHeight = Math.floor(Math.random() * (canvas.height / 2));
    let bottomY = topHeight + pipeGap;
    pipes.push({ x: canvas.width, topHeight, bottomY });
}

// Player jump
document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        if (!gameStarted) {
            gameStarted = true;  // Start the game on first keypress
            document.getElementById("gameCanvas").classList.remove("hidden"); // Show the canvas
            document.getElementById("start-message").classList.add("hidden"); // Remove start message
        }
        player.velocity = player.jumpPower;
    }
});


// Game loop
function update() {
    if (!gameStarted || isGameOver) return;  // Stop updating if game hasn't started

    player.velocity += player.gravity;
    player.y += player.velocity;

    // Pipe movement
    for (let i = 0; i < pipes.length; i++) {
        pipes[i].x -= pipeSpeed;

        // Collision detection
        if (
            player.x < pipes[i].x + pipeWidth &&
            player.x + player.width > pipes[i].x &&
            (player.y < pipes[i].topHeight || player.y + player.height > pipes[i].bottomY)
        ) {
            fails++;
            if (fails >= 20) {
                showGameOver();
                return;
            }
        }

        // Remove pipes that have moved off screen
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            score++;
        }
    }

    // Check for win condition
    if (score >= 10) {
        showWinScreen();
        return;
    }

    draw();
}

// Draw game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pipes
    for (let pipe of pipes) {
        ctx.drawImage(pipeTop, pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.drawImage(pipeBottom, pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
    }

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Fails: ${fails}/20`, 10, 60);

    // Show "Press Space to Start" if the game hasn't started
    if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Press SPACE to Start", canvas.width / 2, canvas.height / 2);
    }
}

// Show game over screen
function showGameOver() {
    isGameOver = true;
    document.getElementById("game-over-screen").classList.remove("hidden");
    document.getElementById("game-over-img").src = badImg.src;
}

// Show win screen
function showWinScreen() {
    isGameOver = true;
    document.getElementById("game-over-screen").classList.remove("hidden");
    document.getElementById("game-over-img").src = winImg.src;
}

// Restart game
function restartGame() {
    player.y = canvas.height / 2;
    player.velocity = 0;
    pipes = [];
    score = 0;
    fails = 0;
    isGameOver = false;
    gameStarted = false;
    document.getElementById("game-over-screen").classList.add("hidden");
}

// Generate pipes every 2 seconds (only after the game starts)
setInterval(() => {
    if (gameStarted) generatePipe();
}, 2750);

// Start game loop
setInterval(update, 20);
