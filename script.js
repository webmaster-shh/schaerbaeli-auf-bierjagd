// Supabase
const SUPABASE_URL = "https://hxqvuuvzxbdvccqwiwpf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_24ByLN2dz1BSVTjx3qL8Lw_vJwe47dO";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");
const offlineScreen = document.getElementById("offlineScreen");

const usernameInput = document.getElementById("username");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const changeUserBtn = document.getElementById("changeUserBtn");
const showLeaderboardBtn = document.getElementById("showLeaderboardBtn");
const miniInfo = document.getElementById("miniInfo");
const usernameWarning = document.getElementById("usernameWarning");

const playerLabel = document.getElementById("playerLabel");
const scoreLabel = document.getElementById("scoreLabel");
const finalScore = document.getElementById("finalScore");
const saveStatus = document.getElementById("saveStatus");
const leaderboardList = document.getElementById("leaderboardList");
const rankText = document.getElementById("rankText");
const endTitle = document.getElementById("endTitle");
const legendBox = document.getElementById("legendBox");
const performanceWarning = document.getElementById("performanceWarning");

const resultView = document.getElementById("resultView");
const leaderboardView = document.getElementById("leaderboardView");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startOverlay = document.getElementById("startOverlay");

// Game size
const GAME_WIDTH = 400;
const GAME_HEIGHT = 700;

// Images
function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

const playerImage = loadImage("images/player.svg");
const beerImage = loadImage("images/beer.svg");
const waterImage = loadImage("images/water.svg");

const pipeSigns = [
  { key: "deadend", image: loadImage("images/signs/sign_deadend.svg") },
  { key: "detour", image: loadImage("images/signs/sign_detour.svg") },
  { key: "noentry", image: loadImage("images/signs/sign_noentry.svg") },
  { key: "noparking", image: loadImage("images/signs/sign_noparking.svg") },
  { key: "tempo30", image: loadImage("images/signs/sign_tempo30.svg") },
  { key: "stop", image: loadImage("images/signs/sign_stop.svg") },
  { key: "parking", image: loadImage("images/signs/sign_parking.svg") },
  { key: "beer", image: loadImage("images/signs/sign_beer.svg") }
];

// Config
const gravity = 0.42;
const jumpStrength = -8;
const pickupPoints = 3;

const basePipeSpeed = 2.7;
const basePipeInterval = 1450;
const basePipeGap = 220;

const pipeWidth = 84;
const groundHeight = 0;
const postWidth = 16;
const signWidth = 78;
const signHeight = 78;
const plainPostWidth = signWidth;

const beerWidth = 44;
const beerHeight = 44;
const beerPadding = 22;
const beerBobAmount = 3;
const beerBobSpeed = 0.08;

const waterWidth = 24;
const waterHeight = 34;
const waterEdgePadding = 8;
const waterBobAmount = 2.5;
const waterBobSpeed = 0.065;

const scoreFlashDuration = 180;

// State
let username = localStorage.getItem("flappy_username") || "";
usernameInput.value = username;

let waitingForFirstInput = false;
let gameRunning = false;
let animationId = null;
let score = 0;
let bird = null;
let pipes = [];
let beers = [];
let waters = [];
let lastPipeTime = 0;
let lastFrameTime = 0;
let gameStartTime = 0;
let pipesUntilNextWater = 0;

let usernameCheckTimer = null;
let lastCheckedUsername = "";
let lastUsernameExists = false;

let difficultyLevel = 0;
let cachedPipeSpeed = basePipeSpeed;
let cachedPipeInterval = basePipeInterval;
let cachedPipeGap = basePipeGap;

let scoreFlashUntil = 0;
let scoreFlashColor = "green";

let showHitboxes = false;
let showFps = false;
let fps = 0;
let fpsFrameCount = 0;
let fpsLastTime = 0;

let dbAvailable = true;
let webmasterNotified = false;

let performanceWarningVisible = false;
let lowFpsCheckStart = 0;
let lowFpsFrameCount = 0;

// Helpers
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function imageReady(image) {
  return image.complete && image.naturalWidth > 0;
}

function sanitizeUsername(name) {
  return name.trim().replace(/\s+/g, " ").slice(0, 20);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showScreen(screen) {
  startScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  endScreen.classList.remove("active");
  offlineScreen.classList.remove("active");
  screen.classList.add("active");
}

function showResultView() {
  resultView.classList.remove("hidden");
  leaderboardView.classList.add("hidden");
}

function showLeaderboardView() {
  resultView.classList.add("hidden");
  leaderboardView.classList.remove("hidden");
}

function updateScoreUI() {
  scoreLabel.textContent = `Bier: ${score}`;
}

function updateStartOverlay() {
  startOverlay.classList.toggle("hidden", !waitingForFirstInput);
}

function setPerformanceWarning(visible) {
  if (!performanceWarning) return;
  performanceWarning.classList.toggle("hidden", !visible);
  performanceWarningVisible = visible;
}

function resetPerformanceMonitor() {
  performanceWarningVisible = false;
  lowFpsCheckStart = 0;
  lowFpsFrameCount = 0;
  setPerformanceWarning(false);
}

function monitorPerformance(now) {
  if (!gameRunning) return;
  if (!performanceWarning) return;

  if (!lowFpsCheckStart) {
    lowFpsCheckStart = now;
    lowFpsFrameCount = 0;
  }

  lowFpsFrameCount++;

  const elapsed = now - lowFpsCheckStart;
  if (elapsed < 2000) return;

  const avgFps = Math.round((lowFpsFrameCount * 1000) / elapsed);
  setPerformanceWarning(avgFps <= 35);

  lowFpsCheckStart = now;
  lowFpsFrameCount = 0;
}

function resizeCanvas() {
  const isMobile = window.innerWidth <= 768;
  const mobileDprLimit = 1.25;
  const desktopDprLimit = 2;

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    isMobile ? mobileDprLimit : desktopDprLimit
  );

  canvas.width = Math.round(GAME_WIDTH * dpr);
  canvas.height = Math.round(GAME_HEIGHT * dpr);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;

  if (bird) render(performance.now());
}

function getRandomWaterSpawnCount(level) {
  const min = Math.max(2, 4 - Math.floor(level / 4));
  const max = Math.max(min, 8 - Math.floor(level / 3));
  return randInt(min, max);
}

function getPipeSignRect(pipe) {
  return {
    x: pipe.x + (pipeWidth - pipe.collisionWidth) / 2,
    width: pipe.collisionWidth
  };
}

function getPipeSignByKey(key) {
  const sign = pipeSigns.find(item => item.key === key);
  return sign ? sign.image : null;
}

async function notifyWebmaster() {
  if (webmasterNotified) return;
  webmasterNotified = true;
  console.error("Spiel nicht erreichbar: Datenbankverbindung fehlgeschlagen.");
}

async function checkDatabaseConnection() {
  const { error } = await supabaseClient.from("scores").select("username").limit(1);
  dbAvailable = !error;

  if (!dbAvailable) {
    await notifyWebmaster();
    showScreen(offlineScreen);
  }

  return dbAvailable;
}

function updateDifficultyCache(currentTime) {
  const elapsedSeconds = (currentTime - gameStartTime) / 1000;
  const levelFromTime = Math.floor(elapsedSeconds / 16);
  const levelFromScore = Math.floor(score / 28);
  const newLevel = Math.max(levelFromTime, levelFromScore);

  if (newLevel === difficultyLevel) return;

  difficultyLevel = newLevel;
  cachedPipeSpeed = Math.min(4.9, basePipeSpeed + difficultyLevel * 0.1);
  cachedPipeInterval = Math.max(980, basePipeInterval - difficultyLevel * 38);
  cachedPipeGap = Math.max(185, basePipeGap - difficultyLevel * 1.6);
}

function initGame() {
  const now = performance.now();
  const birdBaseWidth = 100;
  const birdAspectRatio = 2 / 3;

  bird = {
    x: 100,
    y: 260,
    width: birdBaseWidth,
    height: birdBaseWidth * birdAspectRatio,
    velocity: 0,
    rotation: 0
  };

  pipes = [];
  beers = [];
  waters = [];
  score = 0;

  difficultyLevel = 0;
  cachedPipeSpeed = basePipeSpeed;
  cachedPipeInterval = basePipeInterval;
  cachedPipeGap = basePipeGap;

  lastPipeTime = now;
  lastFrameTime = now;
  gameStartTime = now;
  pipesUntilNextWater = getRandomWaterSpawnCount(0);

  scoreFlashUntil = 0;
  scoreFlashColor = "green";

  resetPerformanceMonitor();
  updateScoreUI();
  endTitle.textContent = "Game Over";
  finalScore.textContent = "Du hesch 0 Bier gsammlet.";
  rankText.textContent = "";
  saveStatus.textContent = "";
  legendBox.classList.add("hidden");

  showResultView();
}

function createBeerForPipe(pipe) {
  const minY = pipe.topHeight + beerPadding;
  const maxY = pipe.bottomY - beerHeight - beerPadding;
  if (maxY <= minY) return;

  beers.push({
    x: pipe.x + pipeWidth / 2 - beerWidth / 2,
    y: randInt(minY, maxY),
    width: beerWidth,
    height: beerHeight,
    bob: Math.random() * Math.PI * 2
  });
}

function createWaterForPipe(pipe) {
  const placeAtTopEdge = Math.random() < 0.5;
  const baseY = placeAtTopEdge
    ? pipe.topHeight + waterEdgePadding
    : pipe.bottomY - waterHeight - waterEdgePadding;

  waters.push({
    x: pipe.x + (pipeWidth - waterWidth) / 2,
    baseY,
    width: waterWidth,
    height: waterHeight,
    bob: Math.random() * Math.PI * 2
  });
}

function createPipe() {
  const safeTopMargin = 70;
  const safeBottomMargin = 70;
  const minTop = safeTopMargin;
  const maxTop = GAME_HEIGHT - cachedPipeGap - safeBottomMargin;
  const topHeight = randInt(minTop, maxTop);

  const isPlainPost = Math.random() < 0.5;
  const randomSign = isPlainPost
    ? null
    : pipeSigns[Math.floor(Math.random() * pipeSigns.length)];

  const pipe = {
    x: GAME_WIDTH + 24,
    topHeight,
    bottomY: topHeight + cachedPipeGap,
    bottomHeight: GAME_HEIGHT - topHeight - cachedPipeGap - groundHeight,
    signKey: randomSign ? randomSign.key : null,
    isPlainPost,
    collisionWidth: isPlainPost ? plainPostWidth : signWidth
  };

  pipes.push(pipe);
  pipesUntilNextWater--;

  if (pipesUntilNextWater <= 0) {
    createWaterForPipe(pipe);
    pipesUntilNextWater = getRandomWaterSpawnCount(difficultyLevel);
  } else if (Math.random() < Math.max(0.42, 0.82 - difficultyLevel * 0.03)) {
    createBeerForPipe(pipe);
  }
}

// Draw
function clearFrame() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);

  if (imageReady(playerImage)) {
    ctx.drawImage(
      playerImage,
      -bird.width / 2,
      -bird.height / 2,
      bird.width,
      bird.height
    );
  } else {
    ctx.fillStyle = "#58aa4f";
    ctx.beginPath();
    ctx.arc(0, 0, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPosterColumn(x, y, width, height) {
  if (height <= 0) return;

  x = Math.round(x);
  y = Math.round(y);
  width = Math.round(width);
  height = Math.round(height);

  ctx.save();

  const bodyGradient = ctx.createLinearGradient(x, 0, x + width, 0);
  bodyGradient.addColorStop(0, "#c8ccd2");
  bodyGradient.addColorStop(0.18, "#f5f6f8");
  bodyGradient.addColorStop(0.5, "#ffffff");
  bodyGradient.addColorStop(0.82, "#d7dbe0");
  bodyGradient.addColorStop(1, "#b5bbc3");
  ctx.fillStyle = bodyGradient;
  ctx.fillRect(x, y, width, height);

  const ringHeight = 12;
  const ringGradient = ctx.createLinearGradient(x, 0, x + width, 0);
  ringGradient.addColorStop(0, "#7a8088");
  ringGradient.addColorStop(0.5, "#c6ccd3");
  ringGradient.addColorStop(1, "#6f757d");
  ctx.fillStyle = ringGradient;
  ctx.fillRect(x, y, width, ringHeight);
  ctx.fillRect(x, y + height - ringHeight, width, ringHeight);

  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillRect(x + width * 0.14, y + ringHeight, Math.max(2, width * 0.08), height - ringHeight * 2);

  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(x + width * 0.82, y + ringHeight, Math.max(2, width * 0.05), height - ringHeight * 2);

  const posterPaddingX = 8;
  const posterTop = y + 22;
  const posterBottom = y + height - 22;
  const posterAreaHeight = posterBottom - posterTop;

  if (posterAreaHeight > 40) {
    const columns = 2;
    const gap = 6;
    const posterWidth = (width - posterPaddingX * 2 - gap) / columns;
    const palette = [
      ["#ff4d6d", "#ffb703"],
      ["#06d6a0", "#118ab2"],
      ["#8338ec", "#ff006e"],
      ["#3a86ff", "#90e0ef"],
      ["#fb8500", "#ffd166"],
      ["#43aa8b", "#577590"]
    ];

    let currentY = posterTop;
    let posterIndex = 0;

    while (currentY < posterBottom - 28) {
      const posterHeight = Math.min(
        posterBottom - currentY,
        48 + ((posterIndex * 17) % 54)
      );

      for (let col = 0; col < columns; col++) {
        const px = x + posterPaddingX + col * (posterWidth + gap);
        const py = currentY + (col % 2) * 4;

        if (py + posterHeight > posterBottom) continue;

        const colors = palette[(posterIndex + col) % palette.length];
        const posterGradient = ctx.createLinearGradient(px, py, px, py + posterHeight);
        posterGradient.addColorStop(0, colors[0]);
        posterGradient.addColorStop(1, colors[1]);

        ctx.fillStyle = posterGradient;
        ctx.fillRect(px, py, posterWidth, posterHeight);

        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px + 0.5, py + 0.5, posterWidth - 1, posterHeight - 1);

        ctx.fillStyle = "rgba(255,255,255,0.82)";
        ctx.fillRect(px + 5, py + 6, posterWidth * 0.55, 6);

        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillRect(px + 5, py + 16, posterWidth * 0.38, 4);
        ctx.fillRect(px + 5, py + 24, posterWidth * 0.48, 4);

        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.24)";
        ctx.arc(
          px + posterWidth * 0.72,
          py + posterHeight * 0.68,
          Math.min(12, posterWidth * 0.22),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      currentY += posterHeight + 8;
      posterIndex++;
    }
  }

  ctx.restore();
}

function drawPipeSign(pipe, y, height, isTop) {
  if (pipe.isPlainPost || !pipe.signKey) return;

  const signImage = getPipeSignByKey(pipe.signKey);
  if (!imageReady(signImage)) return;

  const imageX = pipe.x + (pipeWidth - signWidth) / 2;
  const imageY = isTop ? y + height - signHeight : y;

  if (isTop) {
    ctx.save();
    ctx.translate(Math.round(imageX + signWidth / 2), Math.round(imageY + signHeight / 2));
    ctx.rotate(Math.PI);
    ctx.drawImage(signImage, -signWidth / 2, -signHeight / 2, signWidth, signHeight);
    ctx.restore();
    return;
  }

  ctx.drawImage(signImage, Math.round(imageX), Math.round(imageY), signWidth, signHeight);
}

function drawPipePart(pipe, y, height, isTop) {
  if (height <= 0) return;

  if (pipe.isPlainPost) {
    const plainX = pipe.x + (pipeWidth - plainPostWidth) / 2;
    drawPosterColumn(plainX, y, plainPostWidth, height);
    return;
  }

  const postX = pipe.x + (pipeWidth - postWidth) / 2;

  ctx.save();

  const postGradient = ctx.createLinearGradient(postX, 0, postX + postWidth, 0);
  postGradient.addColorStop(0, "#8c96a1");
  postGradient.addColorStop(0.5, "#dfe5eb");
  postGradient.addColorStop(1, "#89939e");

  ctx.fillStyle = postGradient;
  ctx.fillRect(Math.round(postX), Math.round(y), Math.round(postWidth), Math.round(height));

  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillRect(Math.round(postX + 2), Math.round(y), 2, Math.round(height));

  drawPipeSign(pipe, y, height, isTop);

  ctx.restore();
}

function drawPipe(pipe) {
  drawPipePart(pipe, 0, pipe.topHeight, true);
  drawPipePart(pipe, pipe.bottomY, pipe.bottomHeight, false);
}

function drawPipes() {
  for (let i = 0; i < pipes.length; i++) drawPipe(pipes[i]);
}

function drawBeers() {
  if (!imageReady(beerImage)) return;

  for (let i = 0; i < beers.length; i++) {
    const beer = beers[i];
    const floatY = beer.y + Math.sin(beer.bob) * beerBobAmount;
    ctx.drawImage(beerImage, beer.x, floatY, beer.width, beer.height);
  }
}

function drawWaters() {
  if (!imageReady(waterImage)) return;

  for (let i = 0; i < waters.length; i++) {
    const water = waters[i];
    const floatY = water.baseY + Math.sin(water.bob) * waterBobAmount;
    ctx.drawImage(waterImage, water.x, floatY, water.width, water.height);
  }
}

function drawScoreOnCanvas(now) {
  const isFlashing = now < scoreFlashUntil;

  let strokeStyle = "rgba(33, 74, 42, 0.22)";
  let fillStyle = "rgba(255,255,255,0.95)";

  if (isFlashing && scoreFlashColor === "green") {
    strokeStyle = "rgba(30, 120, 40, 0.35)";
    fillStyle = "#7dff8a";
  } else if (isFlashing && scoreFlashColor === "red") {
    strokeStyle = "rgba(150, 30, 30, 0.35)";
    fillStyle = "#ff8a8a";
  }

  ctx.save();
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";
  ctx.lineWidth = 5;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;
  ctx.strokeText(String(score), GAME_WIDTH / 2, 64);
  ctx.fillText(String(score), GAME_WIDTH / 2, 64);
  ctx.restore();
}

function getBirdBox() {
  return {
    left: bird.x - bird.width / 2 + 18,
    right: bird.x + bird.width / 2 - 18,
    top: bird.y - bird.height / 2 + 10,
    bottom: bird.y + bird.height / 2 - 10
  };
}

function isOverlapping(a, b) {
  return (
    a.left < b.x + b.width &&
    a.right > b.x &&
    a.top < b.y + b.height &&
    a.bottom > b.y
  );
}

function checkItemCollection(items, points, flashColor, now, birdBox, isWater = false) {
  const bobAmount = isWater ? waterBobAmount : 0;

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    const itemY = (isWater ? item.baseY : item.y) + Math.sin(item.bob) * bobAmount;

    const itemBox = {
      x: item.x,
      y: itemY,
      width: item.width,
      height: item.height
    };

    if (isOverlapping(birdBox, itemBox)) {
      score = Math.max(0, score + points);
      updateScoreUI();
      scoreFlashUntil = now + scoreFlashDuration;
      scoreFlashColor = flashColor;
      items.splice(i, 1);
    }
  }
}

function checkCollision(birdBox) {
  if (birdBox.top <= 0 || birdBox.bottom >= GAME_HEIGHT - groundHeight) return true;

  for (let i = 0; i < pipes.length; i++) {
    const pipe = pipes[i];
    const signRect = getPipeSignRect(pipe);

    const overlapsX =
      birdBox.right > signRect.x &&
      birdBox.left < signRect.x + signRect.width;

    const hitsTop = birdBox.top < pipe.topHeight;
    const hitsBottom = birdBox.bottom > pipe.bottomY;

    if (overlapsX && (hitsTop || hitsBottom)) return true;
  }

  return false;
}

function drawHitboxes() {
  if (!showHitboxes) return;

  const birdBox = getBirdBox();

  ctx.save();

  ctx.strokeStyle = "rgba(255, 0, 0, 0.95)";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    birdBox.left,
    birdBox.top,
    birdBox.right - birdBox.left,
    birdBox.bottom - birdBox.top
  );

  ctx.strokeStyle = "rgba(0, 120, 255, 0.95)";

  for (let i = 0; i < pipes.length; i++) {
    const pipe = pipes[i];
    const signRect = getPipeSignRect(pipe);

    ctx.strokeRect(signRect.x, 0, signRect.width, pipe.topHeight);
    ctx.strokeRect(signRect.x, pipe.bottomY, signRect.width, GAME_HEIGHT - pipe.bottomY - groundHeight);
  }

  ctx.restore();
}

function drawFps(now) {
  if (!showFps) return;

  if (!fpsLastTime) fpsLastTime = now;
  fpsFrameCount++;

  const diff = now - fpsLastTime;
  if (diff >= 250) {
    fps = Math.round((fpsFrameCount * 1000) / diff);
    fpsFrameCount = 0;
    fpsLastTime = now;
  }

  ctx.save();
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "right";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(80, 0, 0, 0.45)";
  ctx.fillStyle = "#ff2b2b";
  ctx.strokeText(`${fps} FPS`, GAME_WIDTH - 10, GAME_HEIGHT - 12);
  ctx.fillText(`${fps} FPS`, GAME_WIDTH - 10, GAME_HEIGHT - 12);
  ctx.restore();
}

function render(now) {
  clearFrame();
  drawPipes();
  drawBeers();
  drawWaters();
  drawBird();
  drawHitboxes();
  drawFps(now);
  drawScoreOnCanvas(now);
}

function flap() {
  if (waitingForFirstInput) {
    beginGameplay();
    return;
  }

  if (!gameRunning || !dbAvailable) return;

  bird.velocity = jumpStrength;
  bird.rotation = -0.45;
}

function handleGameInput() {
  flap();
}

async function checkIfUsernameExists(name) {
  if (!dbAvailable) return false;

  const cleanName = sanitizeUsername(name);

  if (!cleanName) {
    usernameWarning.textContent = "";
    lastCheckedUsername = "";
    lastUsernameExists = false;
    return false;
  }

  const { data, error } = await supabaseClient
    .from("scores")
    .select("username")
    .eq("username", cleanName)
    .maybeSingle();

  if (error) {
    console.error(error);
    usernameWarning.textContent = "";
    lastCheckedUsername = cleanName;
    lastUsernameExists = false;
    return false;
  }

  const exists = !!data;
  lastCheckedUsername = cleanName;
  lastUsernameExists = exists;

  if (exists) {
    usernameWarning.textContent = "Existiert scho. Wenn du dä Name bruchsch, spielsch mitenem bestehende Benutzer und de Highscore wird binenem bessere Resultat überschriebe.";
    usernameWarning.classList.remove("is-info");
    usernameWarning.classList.add("is-warning");
  } else {
    usernameWarning.textContent = "Name isch no frei. Mit dem Name wird en neue Benutzer erstellt.";
    usernameWarning.classList.remove("is-warning");
    usernameWarning.classList.add("is-info");
  }

  return exists;
}

async function startGame() {
  if (!dbAvailable) return;

  username = sanitizeUsername(usernameInput.value);

  if (!username) {
    alert("Bitte gib en Benutzername ih.");
    return;
  }

  if (lastCheckedUsername !== username) {
    await checkIfUsernameExists(username);
  }

  localStorage.setItem("flappy_username", username);
  playerLabel.textContent = `Spieler: ${username}`;

  cancelAnimationFrame(animationId);

  initGame();
  showScreen(gameScreen);

  gameRunning = false;
  waitingForFirstInput = true;
  updateStartOverlay();

  const now = performance.now();
  lastFrameTime = now;
  render(now);
}

function beginGameplay() {
  if (!waitingForFirstInput || !dbAvailable) return;

  waitingForFirstInput = false;
  gameRunning = true;
  updateStartOverlay();
  resetPerformanceMonitor();

  const now = performance.now();
  lastFrameTime = now;
  lastPipeTime = now;
  gameStartTime = now;

  bird.velocity = jumpStrength;
  bird.rotation = -0.45;

  animationId = requestAnimationFrame(updateGame);
}

function getRankText(points) {
  if (points >= 200) return "";
  if (points >= 180) return "Vollmaschine. Du bisch wahrschinlich sälber scho es halbs Bierlogistik-Team.";
  if (points >= 160) return "Königsklass. Wenn öpper Vorrat organisiere cha, denn du.";
  if (points >= 140) return "Brutal. Du sammlisch wie eine, wo de Lageplan vom Bierlager uswendig cha.";
  if (points >= 120) return "Richtig starch. Du bisch offiziell im Sammelmodus eskaliert.";
  if (points >= 100) return "Suuber. De Schmudo cha cho, es isch gnueg Material am Start. Aber gad da numeh?";
  if (points >= 80) return "Das isch e schöni Leistig. Du hesch verstande, um was es gaht.";
  if (points >= 60) return "Immerhin, mer gsehd e Wille. De Schmudo isch no ned grettet, aber es git Hoffnig.";
  if (points >= 40) return "Knapp nid komplett blamiert. Aber gross isch dini Sammelaktion jetzt au ned gsi.";
  if (points >= 20) return "Das isch scho fast peinlich. Mit dem Vorrat chunsch ned mal dur d’erscht Stund.";
  return "Du hesch praktisch nüt organisiert. So wird de Schmudo e Trochestund.";
}

async function saveHighscore(currentUsername, newScore) {
  if (!dbAvailable) return;

  const { data: existing, error: fetchError } = await supabaseClient
    .from("scores")
    .select("username, highscore")
    .eq("username", currentUsername)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!existing) {
    const { error: insertError } = await supabaseClient
      .from("scores")
      .insert({
        username: currentUsername,
        highscore: newScore,
        updated_at: new Date().toISOString()
      });

    if (insertError) throw insertError;
    return;
  }

  if (newScore > existing.highscore) {
    const { error: updateError } = await supabaseClient
      .from("scores")
      .update({
        highscore: newScore,
        updated_at: new Date().toISOString()
      })
      .eq("username", currentUsername);

    if (updateError) throw updateError;
  }
}

async function endGame() {
  if (!dbAvailable) return;

  gameRunning = false;
  waitingForFirstInput = false;
  updateStartOverlay();
  resetPerformanceMonitor();
  cancelAnimationFrame(animationId);

  finalScore.textContent = `Du hesch ${score} Bier gsammlet.`;
  rankText.textContent = getRankText(score);

  if (score >= 200) {
    endTitle.textContent = "LEGENDÄR";
    legendBox.classList.remove("hidden");
  }

  showScreen(endScreen);
  showResultView();

  try {
    await saveHighscore(username, score);
  } catch (error) {
    console.error(error);
  }
}

async function loadLeaderboard() {
  if (!dbAvailable) return;

  leaderboardList.innerHTML = "<li>Lade Top 30...</li>";
  saveStatus.textContent = "Lade Highscore...";

  const { data, error } = await supabaseClient
    .from("scores")
    .select("username, highscore, updated_at")
    .order("highscore", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(30);

  if (error) {
    console.error(error);
    leaderboardList.innerHTML = "<li>Leaderboard konnte nicht geladen werden.</li>";
    saveStatus.textContent = "Fehler bim Lade.";
    return;
  }

  if (!data || data.length === 0) {
    leaderboardList.innerHTML = "<li>No kei Bierjäger i de Liste.</li>";
    saveStatus.textContent = "No kei Iträg.";
    return;
  }

  leaderboardList.innerHTML = data
    .map(entry => `<li><strong>${escapeHtml(entry.username)}</strong> – ${entry.highscore} Bier</li>`)
    .join("");

  saveStatus.textContent = "";
}

function updateGame(currentTime) {
  if (!gameRunning || !dbAvailable) return;

  if (!lastFrameTime) lastFrameTime = currentTime;
  const delta = Math.min(1.5, (currentTime - lastFrameTime) / 16.6667);
  lastFrameTime = currentTime;

  updateDifficultyCache(currentTime);

  bird.velocity += gravity * delta;
  bird.y += bird.velocity * delta;
  bird.rotation = clamp(bird.velocity * 0.05, -0.45, Math.PI / 4);

  if (currentTime - lastPipeTime > cachedPipeInterval) {
    createPipe();
    lastPipeTime = currentTime;
  }

  const movement = cachedPipeSpeed * delta;

  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    pipe.x -= movement;

    if (pipe.x + pipeWidth <= -20) pipes.splice(i, 1);
  }

  for (let i = beers.length - 1; i >= 0; i--) {
    const beer = beers[i];
    beer.x -= movement;
    beer.bob += beerBobSpeed * delta;

    if (beer.x + beer.width <= -20) beers.splice(i, 1);
  }

  for (let i = waters.length - 1; i >= 0; i--) {
    const water = waters[i];
    water.x -= movement;
    water.bob += waterBobSpeed * delta;

    if (water.x + water.width <= -20) waters.splice(i, 1);
  }

  const birdBox = getBirdBox();

  checkItemCollection(beers, pickupPoints, "green", currentTime, birdBox, false);
  checkItemCollection(waters, -1, "red", currentTime, birdBox, true);

  if (checkCollision(birdBox)) {
    endGame();
    return;
  }

  monitorPerformance(currentTime);
  render(currentTime);
  animationId = requestAnimationFrame(updateGame);
}

// Events
window.addEventListener("resize", resizeCanvas);

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

usernameInput.addEventListener("input", () => {
  if (!dbAvailable) return;

  const cleanName = sanitizeUsername(usernameInput.value);

  if (!cleanName) {
    usernameWarning.textContent = "";
    lastCheckedUsername = "";
    lastUsernameExists = false;
    clearTimeout(usernameCheckTimer);
    return;
  }

  clearTimeout(usernameCheckTimer);
  usernameCheckTimer = setTimeout(() => {
    checkIfUsernameExists(cleanName);
  }, 350);
});

usernameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") startGame();
});

showLeaderboardBtn.addEventListener("click", async () => {
  if (!dbAvailable) return;
  showLeaderboardView();
  await loadLeaderboard();
});

miniInfo.addEventListener("click", async () => {
  if (!dbAvailable) return;
  showScreen(endScreen);
  showLeaderboardView();
  await loadLeaderboard();
});

changeUserBtn.addEventListener("click", () => {
  if (!dbAvailable) return;
  showScreen(startScreen);
  showResultView();
  usernameInput.value = username;
  usernameWarning.textContent = "";
  resetPerformanceMonitor();
});

window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  if (key === "h") showHitboxes = !showHitboxes;

  if (key === "f") {
    showFps = !showFps;
    if (showFps) {
      fps = 0;
      fpsFrameCount = 0;
      fpsLastTime = 0;
    }
  }

  if (event.code === "Space") {
    event.preventDefault();
    if (gameScreen.classList.contains("active")) handleGameInput();
  }
});

canvas.addEventListener("mousedown", () => {
  handleGameInput();
});

canvas.addEventListener(
  "touchstart",
  event => {
    event.preventDefault();
    handleGameInput();
  },
  { passive: false }
);

async function initApp() {
  resizeCanvas();
  resetPerformanceMonitor();
  await checkDatabaseConnection();
}

initApp();