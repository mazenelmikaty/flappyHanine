// Get the canvas element and its 2D rendering context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const groundHeight = 40;
let groundLevel;


function resizeCanvas() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = window.innerWidth * 0.5;
        canvas.height = window.innerHeight * 0.75;
    }

    groundLevel = canvas.height - groundHeight; // Reset ground level after resize
}


window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call


// Load image assets
const playerImg = new Image();
playerImg.src = "images/gf.png";  // Image of the girl (player)

const candelTop = new Image();
candelTop.src = "images/candel-top.png";  // Top candel obstacle

const candelBottom = new Image();
candelBottom.src = "images/candel-bottom.png";  // Bottom candel obstacle

const badImg = new Image();
badImg.src = "images/bad.png";  // Shown on losing the game

const winImg = new Image();
winImg.src = "images/win.png";  // Shown on winning the game

const cakeTopImg = new Image(); // Ground
cakeTopImg.src = "images/cake-top.png";


// Define player properties
let player = {
    x: 50,
    y: canvas.height / 2,
    width: 55,
    gravity: 0.2,
    velocity: 0,
    jumpPower: -5
};
player.height = player.width * 1.5;

// Define candel properties
let candels = [];  // Array to store candels
const candelWidth = 50;
const candelGap = 200;  // Gap between top and bottom candels
const candelSpeed = 2;
let score = 0;
let fails = 0;
let isGameOver = false;
let gameStarted = false;

// Function to create a new candel pair with random top height
function generatecandel() {
    let topHeight = Math.floor(Math.random() * (canvas.height / 2));
    let bottomY = topHeight + candelGap;
    candels.push({ x: canvas.width, topHeight, bottomY });
}

// Event listener to handle space key press (jump and game start)
document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        if (!gameStarted) {
            gameStarted = true;  // Start the game
            document.getElementById("canvas-wrapper").classList.remove("hidden"); // Show canvas
            hideDiv("start-message"); // Hide start message

        }
        player.velocity = player.jumpPower;  // Make the player jump
    }
});

// Event listener to handle touch start (jump and game start on mobile)
document.addEventListener("touchstart", function () {
    if (!gameStarted) {
        gameStarted = true;  // Start the game
        document.getElementById("canvas-wrapper").classList.remove("hidden"); // Show canvas
        hideDiv("start-message"); // Hide start message
    }
    player.velocity = player.jumpPower;  // Make the player jump
});


// Show game over screen with failure image (for losing only)
function showGameOver() {
    isGameOver = true;
    showDiv("game-over-screen"); // Show game over screen
    document.getElementById("game-over-img").src = badImg.src; // Set losing image
    document.getElementById("canvas-wrapper").classList.add("hidden"); // Hide the canvas
}

// Show winning screen (display Hanine's message)
function showWinScreen() {
    isGameOver = true;
    document.getElementById("canvas-wrapper").classList.add("hidden"); // Hide the canvas

    // Show Hanine's special message
    document.getElementById("hanine-message").classList.remove("hidden");
}

// Reset game variables to restart the game
function restartGame() {
    player.y = canvas.height / 2;
    player.velocity = 0;
    candels = [];
    score = 0;
    fails = 0;
    isGameOver = false;
    gameStarted = false;

    // Hide all screens and show the canvas
    hideDiv("game-over-screen");
    document.getElementById("hanine-message").classList.add("hidden");
    showDiv("start-message");
}

// Include a hashed version of the password (SHA-256 hash of "171110")
const hashedPassword = "582c8e79a2ace9d96e13a5061dcba1177545745f33b2d4c6102b6819943789d0";

// Function to hash the user input using SHA-256
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

// Event listener for the letter box (Hanine's message)
document.getElementById("letter-box").addEventListener("click", async () => {
    const password = prompt("Haha! You thought you could just open the letter? Only Hanine can read the letter:");

    // Hash the user input and compare it with the stored hash
    const hashedInput = await hashPassword(password);
    if (hashedInput === hashedPassword) {
        document.getElementById("congrats-message").classList.add("hidden"); // Hide the congrats message
        document.getElementById("congrats-parag").classList.add("hidden"); // Hide the congrats paragraph
        document.getElementById("letter-box").classList.add("hidden"); // Hide the letter box
        fetch("letter-content.txt")
            .then(response => response.text())
            .then(content => {
                const letterContentDiv = document.getElementById("letter-content");
                letterContentDiv.innerHTML = content;
                letterContentDiv.classList.remove("hidden");
            });
    } else {
        alert("Incorrect password. Please try again.");
    }
});

// Game update loop: handles physics, candel movement, collision, and win/loss logic
function update() {
    if (!gameStarted || isGameOver) return;

    // Apply gravity to player
    player.velocity += player.gravity;
    player.y += player.velocity;

    // Prevent player from falling below the ground
    if (player.y + player.height > groundLevel) {
        player.y = groundLevel - player.height;
        player.velocity = 0;
    }

    // Optional: prevent the player from going above the canvas
    if (player.y < 0) {
        player.y = 0;
        player.velocity = 0;
    }

    // Move candels and check for collisions
    for (let i = 0; i < candels.length; i++) {
        candels[i].x -= candelSpeed;

        // Collision detection
        if (
            player.x < candels[i].x + candelWidth &&
            player.x + player.width > candels[i].x &&
            (player.y < candels[i].topHeight || player.y + player.height > candels[i].bottomY)
        ) {
            fails++;
            if (fails >= 20) {
                showGameOver(); // Trigger game over after 20 fails
                return;
            }
        }

        // Remove off-screen candels and increase score
        if (candels[i].x + candelWidth < 0) {
            candels.splice(i, 1);
            score++;
        }
    }

    // Check if player has won
    if (score >= 10) {
        showWinScreen(); // Trigger win screen
        return;
    }

    draw(); // Draw updated game state
}


// Render all game elements
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas

    // Draw all candels
    for (let candel of candels) {
        ctx.drawImage(candelTop, candel.x, 0, candelWidth, candel.topHeight);
        ctx.drawImage(candelBottom, candel.x, candel.bottomY, candelWidth, canvas.height - candel.bottomY);
    }

    // Draw the player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    

    // Display score and fail count
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}/10`, 10, 30);
    ctx.fillText(`Fails: ${fails}/20`, 10, 60);

    // Show start message if game hasn't started yet
    if (!gameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Press SPACE to Start", canvas.width / 2, canvas.height / 2);
    }

    // Draw ground line
    drawGround();

}
function drawGround() {
    if (cakeTopImg.complete) {
        const scaledHeight = groundHeight;
        const aspectRatio = cakeTopImg.width / cakeTopImg.height;
        const scaledWidth = scaledHeight * aspectRatio;

        for (let x = 0; x < canvas.width; x += scaledWidth) {
            ctx.drawImage(cakeTopImg, x, canvas.height - scaledHeight, scaledWidth, scaledHeight);
        }
    }
}



// Main game loop runs every 20 milliseconds
function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}
gameLoop();

// Generate new candel every 2.75 seconds (after game has started)
setInterval(() => {
    if (gameStarted) generatecandel();
}, 2750);

// Helper funtion to show and hide divs
function showDiv(divId) {
    document.getElementById(divId).classList.remove("hidden");
    document.getElementById(divId).classList.add("flex");
}
function hideDiv(divId) {
    document.getElementById(divId).classList.add("hidden");
    document.getElementById(divId).classList.remove("flex");
}