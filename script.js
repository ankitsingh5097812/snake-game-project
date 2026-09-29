const board = document.querySelector(".board");
const startButton = document.querySelector(".btn-start");
const restartButton = document.querySelector(".btn-restart");

const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const blockSizeDesktop = 40;
const blockSizeMobile = 24;

const isMobile = window.innerWidth <= 768;
const blockSize = isMobile
    ? blockSizeMobile
    : blockSizeDesktop;

const cols = Math.floor(board.clientWidth / blockSize);
const rows = Math.floor(board.clientHeight / blockSize);

let intervalId = null;
let timerIntervalId = null;

let highScore = Number(localStorage.getItem("highScore")) || 0;
let score = 0;
let time = "00:00";

let direction = "right";
let nextDirection = "right";

let snake = [
    { x: 1, y: 3 },
    { x: 1, y: 2 },
    { x: 1, y: 1 }
];

let food = {
    x: 0,
    y: 0
};

const blocks = [];

highScoreElement.innerText = highScore;


// ==================== Create Game Board ====================

const fragment = document.createDocumentFragment();

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement("div");

        block.className = "block";

        fragment.append(block);

        blocks[`${row}-${col}`] = block;
    }
}

board.append(fragment);


// ==================== Snake Functions ====================

// Show snake on the board
function renderSnake() {
    snake.forEach((segment) => {
        blocks[`${segment.x}-${segment.y}`]
            .classList.add("fill");
    });
}

// Remove snake from the board
function clearSnake() {
    snake.forEach((segment) => {
        blocks[`${segment.x}-${segment.y}`]
            .classList.remove("fill");
    });
}


// ==================== Food Functions ====================

// Generate food at an empty position
function generateFood() {
    let newFood;

    do {
        newFood = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols)
        };
    } while (
        snake.some(
            (segment) =>
                segment.x === newFood.x &&
                segment.y === newFood.y
        )
    );

    food = newFood;

    blocks[`${food.x}-${food.y}`]
        .classList.add("food");
}


// ==================== Direction Functions ====================

// Get the next position of snake head
function getNextHead() {
    const head = snake[0];

    if (direction === "left") {
        return {
            x: head.x,
            y: head.y - 1
        };
    }

    if (direction === "right") {
        return {
            x: head.x,
            y: head.y + 1
        };
    }

    if (direction === "up") {
        return {
            x: head.x - 1,
            y: head.y
        };
    }

    return {
        x: head.x + 1,
        y: head.y
    };
}

// Prevent snake from moving directly in opposite direction
function isOppositeDirection(newDirection) {
    return (
        (newDirection === "left" && direction === "right") ||
        (newDirection === "right" && direction === "left") ||
        (newDirection === "up" && direction === "down") ||
        (newDirection === "down" && direction === "up")
    );
}


// ==================== Score Functions ====================

// Update score and high score
function updateScore() {
    score += 10;

    scoreElement.innerText = score;

    if (score > highScore) {
        highScore = score;

        localStorage.setItem(
            "highScore",
            highScore
        );

        highScoreElement.innerText = highScore;
    }
}


// ==================== Game Over ====================

function showGameOver() {
    clearInterval(intervalId);
    clearInterval(timerIntervalId);

    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
}


// ==================== Main Game Logic ====================

function render() {
    direction = nextDirection;

    const head = getNextHead();

    // Wall collision
    if (
        head.x < 0 ||
        head.x >= rows ||
        head.y < 0 ||
        head.y >= cols
    ) {
        showGameOver();
        return;
    }

    // Check if snake ate food
    const ateFood =
        head.x === food.x &&
        head.y === food.y;

    // Ignore the current tail during normal movement
    const bodyToCheck = ateFood
        ? snake
        : snake.slice(0, -1);

    // Snake body collision
    const hitBody = bodyToCheck.some(
        (segment) =>
            segment.x === head.x &&
            segment.y === head.y
    );

    if (hitBody) {
        showGameOver();
        return;
    }

    // Save old tail before changing snake
    const oldTail = {
        ...snake[snake.length - 1]
    };

    // Remove old snake from board
    clearSnake();

    // Move snake forward
    snake.unshift(head);
    snake.pop();

    if (ateFood) {
        // Remove old food
        blocks[`${food.x}-${food.y}`]
            .classList.remove("food");

        // Add old tail back to snake
        // This increases the snake length from the tail side
        snake.push(oldTail);

        // Update score
        updateScore();

        // Generate new food
        generateFood();
    }

    // Show updated snake
    renderSnake();
}


// ==================== Timer ====================

function startTimer() {
    clearInterval(timerIntervalId);

    timerIntervalId = setInterval(() => {
        let [minutes, seconds] = time
            .split(":")
            .map(Number);

        seconds++;

        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }

        time =
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;

        timeElement.innerText = time;
    }, 1000);
}


// ==================== Start Game ====================

function startGame() {
    modal.style.display = "none";

    clearInterval(intervalId);

    intervalId = setInterval(render, 330);

    startTimer();
}

startButton.addEventListener("click", startGame);


// ==================== Restart Game ====================

function restartGame() {
    clearInterval(intervalId);
    clearInterval(timerIntervalId);

    // Remove old snake
    clearSnake();

    // Remove old food
    blocks[`${food.x}-${food.y}`]
        .classList.remove("food");

    // Reset score
    score = 0;
    scoreElement.innerText = score;

    // Reset timer
    time = "00:00";
    timeElement.innerText = time;

    // Keep high score
    highScoreElement.innerText = highScore;

    // Reset snake
    snake = [
        { x: 1, y: 3 },
        { x: 1, y: 2 },
        { x: 1, y: 1 }
    ];

    // Reset direction
    direction = "right";
    nextDirection = "right";

    // Show new snake and food
    renderSnake();
    generateFood();

    // Hide modal
    modal.style.display = "none";

    // Start game again
    intervalId = setInterval(render, 330);

    startTimer();
}

restartButton.addEventListener("click", restartGame);


// ==================== Keyboard Controls ====================

window.addEventListener("keydown", (event) => {
    let newDirection = null;

    if (event.key === "ArrowLeft") {
        newDirection = "left";
    }

    if (event.key === "ArrowRight") {
        newDirection = "right";
    }

    if (event.key === "ArrowUp") {
        newDirection = "up";
    }

    if (event.key === "ArrowDown") {
        newDirection = "down";
    }

    // Change direction if it is not opposite
    if (
        newDirection &&
        !isOppositeDirection(newDirection)
    ) {
        nextDirection = newDirection;
    }

    // Enter key for start and restart
    if (event.key === "Enter") {
        if (startGameModal.style.display !== "none") {
            startButton.click();
        } else if (
            gameOverModal.style.display !== "none"
        ) {
            restartButton.click();
        }
    }
});


// ==================== Mobile Controls ====================

document.querySelectorAll(".arrow-btn").forEach((button) => {
    button.addEventListener("click", () => {
        const newDirection =
            button.getAttribute("data-dir");

        // Prevent opposite direction
        if (isOppositeDirection(newDirection)) {
            return;
        }

        nextDirection = newDirection;
    });
});


// ==================== Window Resize ====================

window.addEventListener("resize", () => {
    const newIsMobile = window.innerWidth <= 768;

    if (newIsMobile !== isMobile) {
        location.reload();
    }
});


// ==================== Initial Game Setup ====================

renderSnake();
generateFood();