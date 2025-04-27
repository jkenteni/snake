const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');
const eatSound = document.getElementById('eat-sound');
const gameoverSound = document.getElementById('gameover-sound');
const powerupSound = document.getElementById('powerup-sound');

const upBtn = document.getElementById('up');
const downBtn = document.getElementById('down');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const timerEl = document.getElementById('timer');

const box = 20;
canvas.width = 20 * box;
canvas.height = 20 * box;

let timerInterval;
let secondsElapsed = 0;
let snake = [{ x: 10 * box, y: 10 * box }];
let direction = 'RIGHT';
let food = randomFood();
let powerup = null;
let score = 0;
let speed = 150;
let game;
let startX, startY;
let highscore = localStorage.getItem('highscore') || 0;
highscoreEl.innerText = highscore;

const controls = document.getElementById('controls');
if (window.innerWidth <= 600) {
  controls.classList.remove('hidden');
}

document.addEventListener('keydown', updateDirection);
canvas.addEventListener('touchstart', startTouch, false);
canvas.addEventListener('touchmove', moveTouch, false);

if (upBtn) upBtn.addEventListener('click', () => { if (direction !== 'DOWN') direction = 'UP'; });
if (downBtn) downBtn.addEventListener('click', () => { if (direction !== 'UP') direction = 'DOWN'; });
if (leftBtn) leftBtn.addEventListener('click', () => { if (direction !== 'RIGHT') direction = 'LEFT'; });
if (rightBtn) rightBtn.addEventListener('click', () => { if (direction !== 'LEFT') direction = 'RIGHT'; });

if (restartBtn) restartBtn.addEventListener('click', restartGame);

function randomFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box
  };
}

function updateDirection(event) {
  const key = event.keyCode;
  if (key === 37 && direction !== 'RIGHT') direction = 'LEFT';
  else if (key === 38 && direction !== 'DOWN') direction = 'UP';
  else if (key === 39 && direction !== 'LEFT') direction = 'RIGHT';
  else if (key === 40 && direction !== 'UP') direction = 'DOWN';
}

function startTouch(e) {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
}

function moveTouch(e) {
  if (!startX || !startY) return;
  let diffX = startX - e.touches[0].clientX;
  let diffY = startY - e.touches[0].clientY;
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 0 && direction !== 'RIGHT') direction = 'LEFT';
    else if (diffX < 0 && direction !== 'LEFT') direction = 'RIGHT';
  } else {
    if (diffY > 0 && direction !== 'DOWN') direction = 'UP';
    else if (diffY < 0 && direction !== 'UP') direction = 'DOWN';
  }
  startX = null;
  startY = null;
}

function moveSnake() {
  const head = { x: snake[0].x, y: snake[0].y };
  if (direction === 'LEFT') head.x -= box;
  if (direction === 'RIGHT') head.x += box;
  if (direction === 'UP') head.y -= box;
  if (direction === 'DOWN') head.y += box;
  return head;
}

function checkCollision(head) {
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    return true;
  }
  for (let i = 0; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  return false;
}

function drawFood() {
  ctx.font = "20px Arial";
  ctx.fillText('🍎', food.x + 2, food.y + 18);
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#FFFFFF' : '#00FF00';
    ctx.fillRect(segment.x, segment.y, box, box);
    ctx.strokeStyle = '#111';
    ctx.strokeRect(segment.x, segment.y, box, box);
  });
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const newHead = moveSnake();
  if (checkCollision(newHead)) {
    clearInterval(game);
    gameoverSound.play();
    setTimeout(() => {
      finalScoreEl.innerText = `Você fez ${score} pontos!`;
      gameOverEl.classList.remove('hidden');
      setTimeout(() => {
        gameOverEl.classList.add('show');
      }, 10);
    }, 500);
    if (score > highscore) {
      localStorage.setItem('highscore', score);
      highscoreEl.innerText = score;
    }
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score++;
    scoreEl.innerText = score;
    food = randomFood();
    eatSound.play();
    if (speed > 60) {
      speed -= 5;
      clearInterval(game);
      game = setInterval(updateGame, speed);
    }
  } else {
    snake.pop();
  }

  drawSnake();
  drawFood();
}

function restartGame() {
  snake = [{ x: 10 * box, y: 10 * box }];
  direction = 'RIGHT';
  food = randomFood();
  score = 0;
  speed = 150;
  scoreEl.innerText = score;
  clearInterval(game);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  gameOverEl.classList.remove('show');
  gameOverEl.classList.add('hidden');
  game = setInterval(updateGame, speed);
  clearInterval(timerInterval);
  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    secondsElapsed++;
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  timerEl.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Start the game
game = setInterval(updateGame, speed);
startTimer();
