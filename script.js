const board = document.querySelector('.board');
const startButton = document.querySelector('.btn-start');
const modal = document.querySelector(".modal");
const startGameModal = document.querySelector('.start-game');
const gameOverModal = document.querySelector('.game-over');
const restartButton = document.querySelector('.btn-restart');

const highScoreElement = document.querySelector('#high-score');
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");

const blockSizeDesktop = 40;
const blockSizeMobile = 24;

let IntervalId = null;
let timerIntervalId = null;

let highScore = localStorage.getItem("highScore") || 0;
let score = 0;
let time = `00:00`;

highScoreElement.innerText = highScore;

let isMobile = window.innerWidth <= 768;
let blockSize = isMobile ? blockSizeMobile : blockSizeDesktop;

const cols = Math.floor(board.clientWidth / blockSize);
const rows = Math.floor(board.clientHeight / blockSize);

const blocks = [];


let food = {x: Math.floor(Math.random()*rows), y: Math.floor(Math.random()*cols)};
let snake = [
    {
        x: 1, y: 3
    },
];

let direction = "right";


const fragment = document.createDocumentFragment();

for(let row=0;row<rows;row++){
    for(let col=0;col<cols;col++){
        const block = document.createElement('div');
        block.className = "block";
        fragment.append(block);
        blocks[`${row}-${col}`] = block;
    }
}
board.append(fragment);



// render snake on screen
function render(){
    let head = null;
    let tail = null;

    blocks[`${food.x}-${food.y}`].classList.add('food');

    if(direction === "left"){
        head = {x: snake[0].x, y: snake[0].y - 1}
    } else if(direction === "right"){
        head = {x: snake[0].x, y: snake[0].y + 1}
    } else if(direction === "up"){
        head = {x: snake[0].x -1 , y: snake[0].y}
    } else if(direction === "down"){
        head = {x: snake[0].x +1 , y: snake[0].y}
    }


    // wall collision logic
    if(head.x<0 || head.x>=rows || head.y<0 || head.y>=cols){
        clearInterval(IntervalId);
        clearInterval(timerIntervalId);
        modal.style.display = "flex";
        startGameModal.style.display = "none";
        gameOverModal.style.display = "flex";
        return;
    }

    // snake-head collision with body logic
    if(snake.some(segment => segment.x === head.x && segment.y === head.y)){
        clearInterval(IntervalId);
        clearInterval(timerIntervalId);
        location.reload();
        return;
    }

    // food consumed logic
    if(head.x == food.x && head.y == food.y){
        blocks[`${food.x}-${food.y}`].classList.remove('food');
        do{
            food = {
                x: Math.floor(Math.random()*rows),
                y: Math.floor(Math.random()*cols)
            };
        }while(
            snake.some(segment =>
                segment.x === food.x &&
                segment.y === food.y
            )
        );

        blocks[`${food.x}-${food.y}`].classList.add('food'); 
        snake.unshift(head);

        score+=10;
        scoreElement.innerText = score;

        if(score>highScore){
            highScore = score;
            localStorage.setItem("highScore", highScore.toString());
        }

    }


    snake.forEach((segment) => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    })

    snake.unshift(head);
    snake.pop();

    snake.forEach((segment) => {
        blocks[`${segment.x}-${segment.y}`].classList.add("fill");
    })
}


// start timer
function startTimer(){
    clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => {
        let [min,sec] = time.split(":").map(Number);
        if(sec == 59){
            min+=1;
            sec = 0;
        }else{
            sec+=1;
        }

        time = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
        timeElement.innerText = time;

    }, 1000);
}

// start Button
startButton.addEventListener('click',() => {
    modal.style.display = "none";

    IntervalId = setInterval(() => { render() },330)
    startTimer();
})

// restart Button
restartButton.addEventListener('click',restartGame);
function restartGame() {

    blocks[`${food.x}-${food.y}`].classList.remove("food");
    snake.forEach((segment) => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    })

    score = 0;
    scoreElement.innerText = score;
    time = `00:00`;

    timeElement.innerText = time;
    highScoreElement.innerText = highScore;

    modal.style.display = "none";
    snake = [{x: 1, y: 3}];
    direction = "right";
    food = {x: Math.floor(Math.random()*rows), y: Math.floor(Math.random()*cols)};

    IntervalId = setInterval(() => { render() },330);
    startTimer();
}


window.addEventListener("keydown", (event) => {
    if(event.key === "ArrowLeft"){
        direction = "left";
    } else if(event.key === "ArrowRight"){
        direction = "right";
    } else if(event.key === "ArrowUp"){
        direction = "up";
    } else if(event.key === "ArrowDown"){
        direction = "down";
    }

    if (event.key === "Enter") {

        // Start modal dikh raha hai
        if (startGameModal.style.display !== "none") {
            startButton.click();
        }

        // Game Over modal dikh raha hai
        else if (gameOverModal.style.display !== "none") {
            restartButton.click();
        }
    }


})

// ==================== MOBILE TOUCH CONTROLS ====================
document.querySelectorAll('.arrow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const newDir = btn.getAttribute('data-dir');
        
        // Prevent reversing directly into itself
        if (
            (newDir === "left" && direction === "right") ||
            (newDir === "right" && direction === "left") ||
            (newDir === "up" && direction === "down") ||
            (newDir === "down" && direction === "up")
        ) {
            return;
        }
        
        direction = newDir;
    });
});

// Handle window resize (for orientation change)
window.addEventListener('resize', () => {
    const newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile) {
        // Simple page reload for layout change (keeps code clean)
        location.reload();
    }
});