// Get the canvas element and its 2D rendering context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call


// Load image assets
const playerImg = new Image();
playerImg.src = "images/gf.png";  // Image of the girl (player)

const pipeTop = new Image();
pipeTop.src = "images/pipe-top.png";  // Top pipe obstacle

const pipeBottom = new Image();
pipeBottom.src = "images/pipe-bottom.png";  // Bottom pipe obstacle

const badImg = new Image();
badImg.src = "images/bad.png";  // Shown on losing the game

const winImg = new Image();
winImg.src = "images/win.png";  // Shown on winning the game

// Define player properties
let player = {
    x: 50,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    gravity: 0.5,
    velocity: 0,
    jumpPower: -8
};

// Define pipe properties
let pipes = [];  // Array to store pipes
const pipeWidth = 150;
const pipeGap = 200;
const pipeSpeed = 2;

// Define game state variables
let score = 0;
let fails = 0;
let isGameOver = false;
let gameStarted = false;

// Function to create a new pipe pair with random top height
function generatePipe() {
    let topHeight = Math.floor(Math.random() * (canvas.height / 2));
    let bottomY = topHeight + pipeGap;
    pipes.push({ x: canvas.width, topHeight, bottomY });
}

// Event listener to handle space key press (jump and game start)
document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        if (!gameStarted) {
            gameStarted = true;  // Start the game
            document.getElementById("canvas-wrapper").classList.remove("hidden"); // Show canvas
            document.getElementById("start-message").classList.add("hidden"); // Hide start message
        }
        player.velocity = player.jumpPower;  // Make the player jump
    }
});

// Game update loop: handles physics, pipe movement, collision, and win/loss logic
function update() {
    if (!gameStarted || isGameOver) return;

    // Apply gravity to player
    player.velocity += player.gravity;
    player.y += player.velocity;

    // Move pipes and check for collisions
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
                showGameOver();  // Trigger game over after 20 fails
                return;
            }
        }

        // Remove off-screen pipes and increase score
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            score++;
        }
    }

    // Check if player has won
    if (score >= 10) {
        showWinScreen();  // Trigger win screen
        return;
    }

    draw();  // Draw updated game state
}

// Render all game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas

    // Draw all pipes
    for (let pipe of pipes) {
        ctx.drawImage(pipeTop, pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.drawImage(pipeBottom, pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);
    }

    // Draw the player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Display score and fail count
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Fails: ${fails}/20`, 10, 60);

    // Show start message if game hasn't started yet
    if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Press SPACE to Start", canvas.width / 2, canvas.height / 2);
    }
}

// Show game over screen with failure image
function showGameOver() {
    isGameOver = true;
    document.getElementById("game-over-screen").classList.remove("hidden");
    document.getElementById("game-over-img").src = badImg.src;
    document.getElementById("canvas-wrapper").classList.add("hidden");
}

// Show winning screen with success image
function showWinScreen() {
    isGameOver = true;
    document.getElementById("game-over-screen").classList.remove("hidden");
    document.getElementById("canvas-wrapper").classList.add("hidden");
    document.getElementById("game-over-img").src = winImg.src;
}

// Reset game variables to restart the game
function restartGame() {
    player.y = canvas.height / 2;
    player.velocity = 0;
    pipes = [];
    score = 0;
    fails = 0;
    isGameOver = false;
    gameStarted = false;
    document.getElementById("game-over-screen").classList.add("hidden");
    document.getElementById("start-message").classList.remove("hidden");
}

function showWinScreen() {
    isGameOver = true;
    document.getElementById("game-over-screen").classList.remove("hidden");
    document.getElementById("canvas-wrapper").classList.add("hidden");
    document.getElementById("game-over-img").src = winImg.src;

    // After a short delay, show the special message
    setTimeout(() => {
        document.getElementById("game-over-screen").classList.add("hidden");
        document.getElementById("hanine-message").classList.remove("hidden");
    }, 2000); // Delay of 2 seconds
}

document.getElementById("letter-box").addEventListener("click", () => {
    document.getElementById("letter-content").classList.remove("hidden");

    // Add your message here
    document.getElementById("letter-text").innerText = `
        Dear Hanine,

        Congratulations on winning the game 🏆!
        I just wanted to tell you how amazing you are.
        This little game was just an excuse to make you smile.

        Yours always,
        Mouzi 💖
    `;
});


// Generate new pipe every 2.75 seconds (after game has started)
setInterval(() => {
    if (gameStarted) generatePipe();
}, 2750);

// Main game loop runs every 20 milliseconds
setInterval(update, 20);
