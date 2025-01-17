const authPage = document.getElementById("auth-page");
const gamePage = document.getElementById("game-page");
const gamePage2 = document.getElementById("game2-page");
const loginButton = document.getElementById("login-button");
const page1Button = document.getElementById("page1-button");
const page2Button = document.getElementById("page2-button");
const usernameInput = document.getElementById("username");
const playerNameDisplay = document.getElementById("player-name");
const authError = document.getElementById("auth-error");

const endPage = document.getElementById("end-page");
const finalPlayerNameDisplay = document.getElementById("final-player-name");
const finalTimeDisplay = document.getElementById("final-time");
const statsList = document.getElementById("stats-list");

let timerDisplay = document.getElementById("timer-display");
let gameTime = 20;  
let timerInterval;  
let delay = 3;

let horizontalButtonMoving = true;
let verticalButtonMoving = true;   

let horizontalButtonClicked = false;
let verticalButtonClicked = false;

let startTime;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const stepsLeftDisplay = document.getElementById("steps-left");

let stepsLeft = 2; 
let targetPieces = 4;
let cuts = []; 
let pieceCount = 1; 

let currentPage;

const horizontalButton = document.createElement("button");
const verticalButton = document.createElement("button");

horizontalButton.textContent = "^";
verticalButton.textContent = "<";

document.getElementById("game-page").appendChild(horizontalButton);
document.getElementById("game-page").appendChild(verticalButton);

let horizontalPos = 0;
let verticalPos = 0;

let lineX = 0;
let lineY = 0;

let horizontalDirection = 1;
let verticalDirection = 1;


page1Button.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  
  if (username) {
    playerNameDisplay.textContent = username;
    authPage.style.display = "none";
    gamePage.style.display = "block";
    initGame();
  } else {
    authError.textContent = "Пожалуйста, введите ваше имя!";
  }
});

page2Button.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  
  if (username) {
    playerNameDisplay.textContent = username;
    authPage.style.display = "none";
    window.location.href = 'game2-page.html';
    window.location.href = `game2-page.html?user=${encodeURIComponent(username)}`;
  } else {
    authError.textContent = "Пожалуйста, введите ваше имя!";
  }
});
function ShowOnlyStats(){
  authPage.style.display = "none";
  gamePage.style.display = "none";
  endPage.style.display = "block";
}

function showEndPage() {
  horizontalButtonMoving = false;
  verticalButtonMoving = false;

  horizontalButton.remove();
  verticalButton.remove();

  clearInterval(timerInterval);

  endTime = new Date();
  let gameDuration = Math.round((endTime - startTime) / 1000) - delay; 
  finalPlayerNameDisplay.textContent = playerNameDisplay.textContent;
  finalTimeDisplay.textContent = gameDuration;

  gamePage.style.display = "none";
  endPage.style.display = "block";

  updateStats(gameDuration);
}

function updateStats(gameDuration) {
  const playerName = finalPlayerNameDisplay.textContent;

  let stats = JSON.parse(localStorage.getItem("stats")) || [];

  stats.push({ player: playerName, time: gameDuration, result: calculateResult()});

  localStorage.setItem("stats", JSON.stringify(stats));

  displayStats();
}
function displayStats() {
  const statsList = document.getElementById("stats-list");

  statsList.innerHTML = "";

  let stats = JSON.parse(localStorage.getItem("stats")) || [];

  stats.forEach(stat => {
    const statItem = document.createElement("li");
    statItem.textContent = `${stat.player}: ${stat.time} секунд, Результат: '${stat.result}'`;
    statsList.appendChild(statItem);
  });
}

window.onload = function() {
  displayStats();
};


function initGame() {
  startTime = new Date(); 
  drawInitialFigure();
  stepsLeftDisplay.textContent = stepsLeft;
  moveHorizontalButton();
  moveVerticalButton();

  startTimer();
}
function drawInitialFigure() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(250, 100);
  ctx.lineTo(150, 400);
  ctx.lineTo(350, 400);
  ctx.closePath();
  ctx.stroke();

  cuts.forEach(cut => {
    ctx.beginPath();
    ctx.moveTo(cut.startX, cut.startY);
    ctx.lineTo(cut.endX, cut.endY);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "black";
  });
}


function calculateResult(){
  
  const centerX = 250;
  const centerY = 300;

  let result = 0;
  if (lineX >= 150 && lineX <= 350) {
    const distanceX = Math.abs(lineX - centerX);
    result += Math.max(100 - distanceX, 0); 
  }

  if (lineY >= 100 && lineY <= 400) {
    const distanceY = Math.abs(lineY - centerY);
    result += Math.max(100 - distanceY, 0);
  }

  return result;
}

function moveHorizontalButton() {
  horizontalButton.style.position = "absolute";
  const canvasRect = canvas.getBoundingClientRect();

  horizontalButton.style.top = `${canvasRect.top + canvas.height + 10}px`;
  horizontalButton.style.left = `${canvasRect.left + horizontalPos}px`;

  document.body.appendChild(horizontalButton);

  if (!horizontalButtonClicked) {
    setInterval(() => {
      if (horizontalButtonMoving){
        horizontalPos += 5 * horizontalDirection;
        horizontalButton.style.left = `${canvasRect.left + horizontalPos}px`;
  
        if (horizontalPos >= canvas.width - horizontalButton.offsetWidth || horizontalPos <= 0) {
          horizontalDirection *= -1;
        }
      }
    }, 50);
  }
}

function moveVerticalButton() {
  verticalButton.style.position = "absolute";
  const canvasRect = canvas.getBoundingClientRect();

  verticalButton.style.left = `${canvasRect.left + canvas.width + 10}px`;
  verticalButton.style.top = `${canvasRect.top + verticalPos}px`;

  document.body.appendChild(verticalButton);

  if (!verticalButtonClicked) {
    setInterval(() => {
      if (verticalButtonMoving){
        verticalPos += 5 * verticalDirection;
        verticalButton.style.top = `${canvasRect.top + verticalPos}px`;
  
        if (verticalPos >= canvas.height - verticalButton.offsetHeight || verticalPos <= 0) {
          verticalDirection *= -1;
        }
      }
    }, 50);
  }
}

horizontalButton.addEventListener("click", () => {
  if (!horizontalButtonClicked) {
    horizontalButtonClicked = true;  

    const buttonWidth = horizontalButton.offsetWidth; 
    const canvasRect = canvas.getBoundingClientRect();  
    const y = (horizontalPos / canvas.width) * canvas.height + buttonWidth/2; 
    addCut(y, 0, y, canvas.height);
    lineX = y;

    horizontalButtonMoving = false;
  }
});

verticalButton.addEventListener("click", () => {
  if (!verticalButtonClicked) {
    verticalButtonClicked = true;  

    const buttonHeight = verticalButton.offsetHeight;
    const canvasRect = canvas.getBoundingClientRect(); 
    const x = (verticalPos / canvas.height) * canvas.width + buttonHeight/2;  
    addCut(0, x, canvas.width, x);

    lineY = x;
    verticalButtonMoving = false;
  }
});

function addCut(x1, y1, x2, y2) {
  cuts.push({ startX: x1, startY: y1, endX: x2, endY: y2 });
  stepsLeft--;
  stepsLeftDisplay.textContent = stepsLeft;

  drawInitialFigure();
  checkWinCondition();
}


function checkWinCondition() {
  if (stepsLeft === 0) {
    setTimeout(showEndPage, delay * 1000);
  }
}


function startTimer() {
  gameTime = 20; 
  timerDisplay.textContent = `Время: ${gameTime} сек`;

  timerInterval = setInterval(() => {
    gameTime--;
    timerDisplay.textContent = `Время: ${gameTime} сек`;

    if (gameTime <= 0) {
      clearInterval(timerInterval);
      showEndPage();
    }
  }, 1000);
}

window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  history.replaceState(null, '', window.location.pathname);
  
  if (urlParams.has('showStats')) {
      ShowOnlyStats();
    const userName = urlParams.get('user') || "Неизвестный игрок";
    const userScore = urlParams.get('score') || 0;


  let stats = JSON.parse(localStorage.getItem("stats")) || [];

  stats.push({ player: userName, time: "Режим без ", result: Math.floor(userScore)});

  localStorage.setItem("stats", JSON.stringify(stats));

  displayStats();
  }

  
};