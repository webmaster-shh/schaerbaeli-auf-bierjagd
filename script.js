// Supabase
const SUPABASE_URL = "https://hxqvuuvzxbdvccqwiwpf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_24ByLN2dz1BSVTjx3qL8Lw_vJwe47dO";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage / misc constants
const USERNAME_STORAGE_KEY = "player_username";
const LOW_FPS_CHECK_INTERVAL = 2000;
const FPS_DISPLAY_INTERVAL = 250;
const USERNAME_CHECK_DELAY = 350;

// Game size
const GAME_WIDTH = 400;
const GAME_HEIGHT = 700;

// Physics / gameplay
const gravity = 0.42;
const jumpStrength = -8;
const pickupPoints = 3;

const basePipeSpeed = 2.7;
const basePipeInterval = 1450;
const basePipeGap = 220;

// Sizes
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
const offscreenRemovalX = -20;
const playerBaseWidth = 100;
const playerAspectRatio = 2 / 3;

// Round signs
const ROUND_SIGN_KEYS = new Set(["tempo30", "noentry", "noparking", "stop"]);

// DOM helpers
function getById(id) {
  return document.getElementById(id);
}

// DOM
const startScreen = getById("startScreen");
const helpScreen = getById("helpScreen");
const privacyScreen = getById("privacyScreen");
const impressumScreen = getById("impressumScreen");
const gameScreen = getById("gameScreen");
const endScreen = getById("endScreen");
const offlineScreen = getById("offlineScreen");

const screens = [
  startScreen,
  helpScreen,
  privacyScreen,
  impressumScreen,
  gameScreen,
  endScreen,
  offlineScreen
];

const usernameInput = getById("username");
const startBtn = getById("startBtn");
const restartBtn = getById("restartBtn");
const changeUserBtn = getById("changeUserBtn");
const showLeaderboardBtn = getById("showLeaderboardBtn");
const miniInfo = getById("miniInfo");
const usernameWarning = getById("usernameWarning");

const helpBtn = getById("helpBtn");
const backToStartBtn = getById("backToStartBtn");
const privacyBtn = getById("privacyBtn");
const impressumBtn = getById("impressumBtn");
const privacyFromHelpBtn = getById("privacyFromHelpBtn");
const impressumFromHelpBtn = getById("impressumFromHelpBtn");
const backFromPrivacyBtn = getById("backFromPrivacyBtn");
const backFromImpressumBtn = getById("backFromImpressumBtn");

const playerLabel = getById("playerLabel");
const scoreLabel = getById("scoreLabel");
const finalScore = getById("finalScore");
const saveStatus = getById("saveStatus");
const leaderboardList = getById("leaderboardList");
const leaderboardTitle = getById("leaderboardTitle");
const toggleLeaderboardBtn = getById("toggleLeaderboardBtn");
const rankText = getById("rankText");
const platinumBox = getById("platinumBox");
const goldBox = getById("goldBox");
const performanceWarning = getById("performanceWarning");
const placementText = getById("placementText");
const highscoreStatusText = getById("highscoreStatusText");

const resultView = getById("resultView");
const leaderboardView = getById("leaderboardView");

const canvas = getById("gameCanvas");
const ctx = canvas.getContext("2d");
const startOverlay = getById("startOverlay");

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

const pipeSignImageMap = Object.fromEntries(
  pipeSigns.map(sign => [sign.key, sign.image])
);

// State
let username = localStorage.getItem(USERNAME_STORAGE_KEY) || "";
usernameInput.value = username;

let waitingForFirstInput = false;
let gameRunning = false;
let animationId = null;
let score = 0;
let player = null;
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
let usernameCheckRequestId = 0;

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

let lowFpsCheckStart = 0;
let lowFpsFrameCount = 0;

let leaderboardShowAll = false;

// Helpers
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function imageReady(image) {
  return !!image && image.complete && image.naturalWidth > 0;
}

function sanitizeUsername(name) {
  return name.trim().replace(/\s+/g, " ").slice(0, 20);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function isRoundSign(pipe) {
  return !pipe.isPlainPost && ROUND_SIGN_KEYS.has(pipe.signKey);
}

function circleIntersectsRect(circleX, circleY, radius, rect) {
  const closestX = clamp(circleX, rect.left, rect.right);
  const closestY = clamp(circleY, rect.top, rect.bottom);

  const dx = circleX - closestX;
  const dy = circleY - closestY;

  return dx * dx + dy * dy < radius * radius;
}

function showScreen(activeScreen) {
  for (const screen of screens) {
    screen.classList.toggle("active", screen === activeScreen);
  }
}

function showResultView() {
  resultView.classList.remove("hidden");
  leaderboardView.classList.add("hidden");
}

function showLeaderboardView() {
  resultView.classList.add("hidden");
  leaderboardView.classList.remove("hidden");
}

function goToStartScreen() {
  showScreen(startScreen);
  showResultView();
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
}

function resetPerformanceMonitor() {
  lowFpsCheckStart = 0;
  lowFpsFrameCount = 0;
  setPerformanceWarning(false);
}

function monitorPerformance(now) {
  if (!gameRunning || !performanceWarning) return;

  if (!lowFpsCheckStart) {
    lowFpsCheckStart = now;
    lowFpsFrameCount = 0;
  }

  lowFpsFrameCount++;

  const elapsed = now - lowFpsCheckStart;
  if (elapsed < LOW_FPS_CHECK_INTERVAL) return;

  const avgFps = Math.round((lowFpsFrameCount * 1000) / elapsed);
  setPerformanceWarning(avgFps <= 35);

  lowFpsCheckStart = now;
  lowFpsFrameCount = 0;
}

function resetFpsCounter() {
  fps = 0;
  fpsFrameCount = 0;
  fpsLastTime = 0;
}

function clearUsernameWarning() {
  usernameWarning.textContent = "";
  usernameWarning.classList.remove("is-warning", "is-info");
}

function setUsernameWarningState(text, type) {
  usernameWarning.textContent = text;
  usernameWarning.classList.toggle("is-warning", type === "warning");
  usernameWarning.classList.toggle("is-info", type === "info");
}

function resetEndScreenState() {
  finalScore.textContent = "Du hesch 0 Bier gsammlet.";
  rankText.textContent = "";
  saveStatus.textContent = "";
  placementText.textContent = "";
  highscoreStatusText.textContent = "";
  highscoreStatusText.classList.remove("is-success", "is-muted");
  goldBox.classList.add("hidden");
  platinumBox.classList.add("hidden");
  showResultView();
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

  if (player) {
    render(performance.now());
  }
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

function getRoundSignCollision(pipe, isTop) {
  return {
    x: pipe.x + pipeWidth / 2,
    y: isTop
      ? pipe.topHeight - signHeight / 2
      : pipe.bottomY + signHeight / 2,
    radius: pipeWidth / 2
  };
}

function getPipeSignByKey(key) {
  return pipeSignImageMap[key] || null;
}

function stopGameLoop() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function notifyWebmaster() {
  if (webmasterNotified) return;
  webmasterNotified = true;
  console.error("Spiel nicht erreichbar: Datenbankverbindung fehlgeschlagen.");
}

async function checkDatabaseConnection() {
  const { error } = await supabaseClient
    .from("scores")
    .select("username")
    .limit(1);

  dbAvailable = !error;

  if (!dbAvailable) {
    notifyWebmaster();
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

function createInitialPlayer() {
  return {
    x: 100,
    y: 260,
    width: playerBaseWidth,
    height: playerBaseWidth * playerAspectRatio,
    velocity: 0,
    rotation: 0
  };
}

function initGame() {
  const now = performance.now();

  player = createInitialPlayer();
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
  resetEndScreenState();
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
    return;
  }

  if (Math.random() < Math.max(0.42, 0.82 - difficultyLevel * 0.03)) {
    createBeerForPipe(pipe);
  }
}

// Draw
function clearFrame() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function drawPlayer() {
  ctx.save();
  ctx.translate(Math.round(player.x), Math.round(player.y));
  ctx.rotate(player.rotation);

  if (imageReady(playerImage)) {
    ctx.drawImage(
      playerImage,
      -player.width / 2,
      -player.height / 2,
      player.width,
      player.height
    );
  } else {
    ctx.fillStyle = "#58aa4f";
    ctx.beginPath();
    ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPosterColumn(x, y, width, height) {
  if (height <= 0) return;

  const roundedX = Math.round(x);
  const roundedY = Math.round(y);
  const roundedWidth = Math.round(width);
  const roundedHeight = Math.round(height);

  ctx.save();

  const bodyGradient = ctx.createLinearGradient(
    roundedX,
    0,
    roundedX + roundedWidth,
    0
  );
  bodyGradient.addColorStop(0, "#c8ccd2");
  bodyGradient.addColorStop(0.18, "#f5f6f8");
  bodyGradient.addColorStop(0.5, "#ffffff");
  bodyGradient.addColorStop(0.82, "#d7dbe0");
  bodyGradient.addColorStop(1, "#b5bbc3");
  ctx.fillStyle = bodyGradient;
  ctx.fillRect(roundedX, roundedY, roundedWidth, roundedHeight);

  const ringHeight = 12;
  const ringGradient = ctx.createLinearGradient(
    roundedX,
    0,
    roundedX + roundedWidth,
    0
  );
  ringGradient.addColorStop(0, "#7a8088");
  ringGradient.addColorStop(0.5, "#c6ccd3");
  ringGradient.addColorStop(1, "#6f757d");
  ctx.fillStyle = ringGradient;
  ctx.fillRect(roundedX, roundedY, roundedWidth, ringHeight);
  ctx.fillRect(
    roundedX,
    roundedY + roundedHeight - ringHeight,
    roundedWidth,
    ringHeight
  );

  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillRect(
    roundedX + roundedWidth * 0.14,
    roundedY + ringHeight,
    Math.max(2, roundedWidth * 0.08),
    roundedHeight - ringHeight * 2
  );

  ctx.fillStyle = "rgba(0,0,0,0.06)";
  ctx.fillRect(
    roundedX + roundedWidth * 0.82,
    roundedY + ringHeight,
    Math.max(2, roundedWidth * 0.05),
    roundedHeight - ringHeight * 2
  );

  const posterPaddingX = 8;
  const posterTop = roundedY + 22;
  const posterBottom = roundedY + roundedHeight - 22;
  const posterAreaHeight = posterBottom - posterTop;

  if (posterAreaHeight > 40) {
    const columns = 2;
    const gap = 6;
    const posterWidth = (roundedWidth - posterPaddingX * 2 - gap) / columns;
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
        const px = roundedX + posterPaddingX + col * (posterWidth + gap);
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
    ctx.translate(
      Math.round(imageX + signWidth / 2),
      Math.round(imageY + signHeight / 2)
    );
    ctx.rotate(Math.PI);
    ctx.drawImage(signImage, -signWidth / 2, -signHeight / 2, signWidth, signHeight);
    ctx.restore();
    return;
  }

  ctx.drawImage(
    signImage,
    Math.round(imageX),
    Math.round(imageY),
    signWidth,
    signHeight
  );
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
  ctx.fillRect(
    Math.round(postX),
    Math.round(y),
    Math.round(postWidth),
    Math.round(height)
  );

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
  for (const pipe of pipes) {
    drawPipe(pipe);
  }
}

function drawFloatingItems(items, image, bobAmount, yKey) {
  if (!imageReady(image)) return;

  for (const item of items) {
    const floatY = item[yKey] + Math.sin(item.bob) * bobAmount;
    ctx.drawImage(image, item.x, floatY, item.width, item.height);
  }
}

function drawBeers() {
  drawFloatingItems(beers, beerImage, beerBobAmount, "y");
}

function drawWaters() {
  drawFloatingItems(waters, waterImage, waterBobAmount, "baseY");
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

function getPlayerBox() {
  return {
    left: player.x - player.width / 2 + 18,
    right: player.x + player.width / 2 - 18,
    top: player.y - player.height / 2 + 10,
    bottom: player.y + player.height / 2 - 10
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

function checkItemCollection(items, points, flashColor, now, playerBox, isWater = false) {
  const bobAmount = isWater ? waterBobAmount : 0;
  const yKey = isWater ? "baseY" : "y";

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    const itemY = item[yKey] + Math.sin(item.bob) * bobAmount;

    const itemBox = {
      x: item.x,
      y: itemY,
      width: item.width,
      height: item.height
    };

    if (isOverlapping(playerBox, itemBox)) {
      score = Math.max(0, score + points);
      updateScoreUI();
      scoreFlashUntil = now + scoreFlashDuration;
      scoreFlashColor = flashColor;
      items.splice(i, 1);
    }
  }
}

function checkCollision(playerBox) {
  if (playerBox.top <= 0 || playerBox.bottom >= GAME_HEIGHT - groundHeight) {
    return true;
  }

  for (const pipe of pipes) {
    const signRect = getPipeSignRect(pipe);

    const overlapsX =
      playerBox.right > signRect.x &&
      playerBox.left < signRect.x + signRect.width;

    if (!overlapsX) {
      continue;
    }

    if (pipe.isPlainPost || !isRoundSign(pipe)) {
      const hitsTop = playerBox.top < pipe.topHeight;
      const hitsBottom = playerBox.bottom > pipe.bottomY;

      if (hitsTop || hitsBottom) {
        return true;
      }

      continue;
    }

    const topSign = getRoundSignCollision(pipe, true);
    const bottomSign = getRoundSignCollision(pipe, false);

    const hitsTopRectPart = playerBox.top < topSign.y;
    const hitsBottomRectPart = playerBox.bottom > bottomSign.y;

    const hitsTopRoundPart =
      playerBox.bottom > topSign.y &&
      circleIntersectsRect(topSign.x, topSign.y, topSign.radius, playerBox);

    const hitsBottomRoundPart =
      playerBox.top < bottomSign.y &&
      circleIntersectsRect(bottomSign.x, bottomSign.y, bottomSign.radius, playerBox);

    if (hitsTopRectPart || hitsBottomRectPart || hitsTopRoundPart || hitsBottomRoundPart) {
      return true;
    }
  }

  return false;
}

function drawHitboxes() {
  if (!showHitboxes) return;

  const playerBox = getPlayerBox();

  ctx.save();
  ctx.lineWidth = 2;

  ctx.strokeStyle = "rgba(255, 0, 0, 0.95)";
  ctx.strokeRect(
    playerBox.left,
    playerBox.top,
    playerBox.right - playerBox.left,
    playerBox.bottom - playerBox.top
  );

  ctx.strokeStyle = "rgba(0, 120, 255, 0.95)";

  for (const pipe of pipes) {
    const signRect = getPipeSignRect(pipe);

    if (pipe.isPlainPost || !isRoundSign(pipe)) {
      ctx.strokeRect(signRect.x, 0, signRect.width, pipe.topHeight);
      ctx.strokeRect(
        signRect.x,
        pipe.bottomY,
        signRect.width,
        GAME_HEIGHT - pipe.bottomY - groundHeight
      );
      continue;
    }

    const topSign = getRoundSignCollision(pipe, true);
    const bottomSign = getRoundSignCollision(pipe, false);

    ctx.strokeRect(signRect.x, 0, signRect.width, topSign.y);
    ctx.strokeRect(
      signRect.x,
      bottomSign.y,
      signRect.width,
      GAME_HEIGHT - bottomSign.y - groundHeight
    );

    ctx.beginPath();
    ctx.arc(topSign.x, topSign.y, topSign.radius, 0, Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(bottomSign.x, bottomSign.y, topSign.radius, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFps(now) {
  if (!showFps) return;

  if (!fpsLastTime) {
    fpsLastTime = now;
  }

  fpsFrameCount++;

  const diff = now - fpsLastTime;
  if (diff >= FPS_DISPLAY_INTERVAL) {
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
  drawPlayer();
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

  player.velocity = jumpStrength;
  player.rotation = -0.45;
}

function handleGameInput() {
  flap();
}

async function checkIfUsernameExists(name) {
  if (!dbAvailable) return false;

  const cleanName = sanitizeUsername(name);
  const requestId = ++usernameCheckRequestId;

  if (!cleanName) {
    clearUsernameWarning();
    lastCheckedUsername = "";
    lastUsernameExists = false;
    return false;
  }

  const { data, error } = await supabaseClient
    .from("scores")
    .select("username")
    .eq("username", cleanName)
    .maybeSingle();

  if (requestId !== usernameCheckRequestId) {
    return lastUsernameExists;
  }

  if (error) {
    console.error(error);
    clearUsernameWarning();
    lastCheckedUsername = cleanName;
    lastUsernameExists = false;
    return false;
  }

  const exists = !!data;
  lastCheckedUsername = cleanName;
  lastUsernameExists = exists;

  if (exists) {
    setUsernameWarningState(
      "Dä Name gids scho. Du chasch diräkt wiiterspiele und bineme bessere Resultat wird din Highscore aktualisiert.",
      "warning"
    );
  } else {
    setUsernameWarningState(
      "Name isch no frei. Mit dem Name wird en neue Benutzer erstellt.",
      "info"
    );
  }

  return exists;
}

async function startGame() {
  if (!dbAvailable) return;

  clearTimeout(usernameCheckTimer);
  username = sanitizeUsername(usernameInput.value);

  if (!username) {
    alert("Bitte gib en Benutzername ih.");
    return;
  }

  if (lastCheckedUsername !== username) {
    await checkIfUsernameExists(username);
  }

  localStorage.setItem(USERNAME_STORAGE_KEY, username);
  playerLabel.textContent = `Spieler: ${username}`;

  stopGameLoop();
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

  player.velocity = jumpStrength;
  player.rotation = -0.45;

  animationId = requestAnimationFrame(updateGame);
}

function getRankText(points) {
  if (points >= 300) return "";
  if (points >= 280) return "Absolut wahnsinnig. Du hesch s'Biersammle uf es Niveau bracht, wo jede Logistikplan verblasse lad.";
  if (points >= 260) return "Komplett eskaliert. Das isch nümme nur guet, das isch praktisch historischi Bierdominanz.";
  if (points >= 240) return "Unfassbar starch. Du flügsch dur dä Parcour, als wär er extra für dich baut worde.";
  if (points >= 220) return "Brutal präzise. So viel Kontrolle het me susch nume bi Lüüt mit innerem Bierkompass.";
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

async function getExistingHighscore(currentUsername) {
  const { data, error } = await supabaseClient
    .from("scores")
    .select("username, highscore")
    .eq("username", currentUsername)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

async function upsertHighscore(currentUsername, newScore, existingEntry) {
  const timestamp = new Date().toISOString();

  if (!existingEntry) {
    const { error } = await supabaseClient
      .from("scores")
      .insert({
        username: currentUsername,
        highscore: newScore,
        updated_at: timestamp
      });

    if (error) throw error;
    return;
  }

  const { error } = await supabaseClient
    .from("scores")
    .update({
      highscore: newScore,
      updated_at: timestamp
    })
    .eq("username", currentUsername);

  if (error) throw error;
}

async function getLeaderboardData() {
  const { data, error } = await supabaseClient
    .from("scores")
    .select("username, highscore, updated_at")
    .order("highscore", { ascending: false })
    .order("updated_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

function getRankForScore(entries, runUsername, runScore, excludeOwnEntry = false) {
  const currentScore = Number(runScore);

  const relevantEntries = excludeOwnEntry
    ? entries.filter(entry => entry.username !== runUsername)
    : entries;

  const entriesAhead = relevantEntries.filter(entry => {
    return Number(entry.highscore) >= currentScore;
  }).length;

  return entriesAhead + 1;
}

async function endGame() {
  if (!dbAvailable) return;

  gameRunning = false;
  waitingForFirstInput = false;
  updateStartOverlay();
  resetPerformanceMonitor();
  stopGameLoop();

  finalScore.textContent = `Du hesch ${score} Bier gsammlet.`;
  rankText.textContent = getRankText(score);

  goldBox.classList.add("hidden");
  platinumBox.classList.add("hidden");
  placementText.textContent = "";
  highscoreStatusText.textContent = "";
  highscoreStatusText.classList.remove("is-success", "is-muted");

  if (score >= 300) {
    platinumBox.classList.remove("hidden");
  } else if (score >= 200) {
    goldBox.classList.remove("hidden");
  }

  showScreen(endScreen);
  showResultView();

  try {
    const existingEntry = await getExistingHighscore(username);
    const isNewHighscore = !existingEntry || score > existingEntry.highscore;

    if (isNewHighscore) {
      await upsertHighscore(username, score, existingEntry);
    }

    const leaderboardData = await getLeaderboardData();

    const placement = isNewHighscore
      ? getRankForScore(leaderboardData, username, score, true)
      : getRankForScore(leaderboardData, username, score, false);

    placementText.textContent = `${placement}. Platz`;

    if (isNewHighscore) {
      highscoreStatusText.textContent = "Neuer Highscore";
      highscoreStatusText.classList.add("is-success");
    } else {
      highscoreStatusText.textContent = "Kein Highscore";
      highscoreStatusText.classList.add("is-muted");
    }
  } catch (error) {
    console.error(error);
    placementText.textContent = "Dini Platzierig chan grad nid berächnet wärde.";
    highscoreStatusText.textContent = "Highscore-Status aktuell nid verfüegbar.";
    highscoreStatusText.classList.add("is-muted");
  }
}

function renderLeaderboardEntries(entries) {
  if (!entries || entries.length === 0) {
    leaderboardList.innerHTML = "<li>No kei Bierjäger i de Liste.</li>";
    saveStatus.textContent = "No kei Iträg.";
    return;
  }

  const visibleEntries = leaderboardShowAll ? entries : entries.slice(0, 10);

  leaderboardList.innerHTML = visibleEntries
    .map(
      entry =>
        `<li><strong>${escapeHtml(entry.username)}</strong> – ${entry.highscore} Bier</li>`
    )
    .join("");

  leaderboardTitle.textContent = leaderboardShowAll
    ? "Kompletti Bierjäger-Liste"
    : "Top 10 Bierjäger";

  toggleLeaderboardBtn.textContent = leaderboardShowAll
    ? "Nur Top 10"
    : "Komplette Liste";

  toggleLeaderboardBtn.classList.toggle("hidden", entries.length <= 10);
  saveStatus.textContent = "";
}

async function loadLeaderboard() {
  if (!dbAvailable) return;

  leaderboardList.innerHTML = leaderboardShowAll
    ? "<li>Lade kompletti Liste...</li>"
    : "<li>Lade Top 10...</li>";

  saveStatus.textContent = "Lade Highscore...";

  try {
    const data = await getLeaderboardData();
    renderLeaderboardEntries(data);
  } catch (error) {
    console.error(error);
    leaderboardList.innerHTML = "<li>Leaderboard konnte nicht geladen werden.</li>";
    saveStatus.textContent = "Fehler bim Lade.";
  }
}

function updateMovingItems(items, movement, bobSpeed) {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    item.x -= movement;
    item.bob += bobSpeed;

    if (item.x + item.width <= offscreenRemovalX) {
      items.splice(i, 1);
    }
  }
}

function updatePipes(movement) {
  for (let i = pipes.length - 1; i >= 0; i--) {
    const pipe = pipes[i];
    pipe.x -= movement;

    if (pipe.x + pipeWidth <= offscreenRemovalX) {
      pipes.splice(i, 1);
    }
  }
}

function updateGame(currentTime) {
  if (!gameRunning || !dbAvailable) return;

  if (!lastFrameTime) {
    lastFrameTime = currentTime;
  }

  const delta = Math.min(1.5, (currentTime - lastFrameTime) / 16.6667);
  lastFrameTime = currentTime;

  updateDifficultyCache(currentTime);

  player.velocity += gravity * delta;
  player.y += player.velocity * delta;
  player.rotation = clamp(player.velocity * 0.05, -0.45, Math.PI / 4);

  if (currentTime - lastPipeTime > cachedPipeInterval) {
    createPipe();
    lastPipeTime = currentTime;
  }

  const movement = cachedPipeSpeed * delta;

  updatePipes(movement);
  updateMovingItems(beers, movement, beerBobSpeed * delta);
  updateMovingItems(waters, movement, waterBobSpeed * delta);

  const playerBox = getPlayerBox();

  checkItemCollection(beers, pickupPoints, "green", currentTime, playerBox, false);
  checkItemCollection(waters, -1, "red", currentTime, playerBox, true);

  if (checkCollision(playerBox)) {
    endGame();
    return;
  }

  monitorPerformance(currentTime);
  render(currentTime);
  animationId = requestAnimationFrame(updateGame);
}

async function openLeaderboardScreen() {
  if (!dbAvailable) return;
  leaderboardShowAll = false;
  showScreen(endScreen);
  showLeaderboardView();
  await loadLeaderboard();
}

async function toggleLeaderboardMode() {
  leaderboardShowAll = !leaderboardShowAll;
  await loadLeaderboard();
}

function bindClick(element, handler) {
  element.addEventListener("click", handler);
}

// Events
window.addEventListener("resize", resizeCanvas);

bindClick(startBtn, startGame);
bindClick(restartBtn, startGame);

bindClick(helpBtn, () => showScreen(helpScreen));
bindClick(backToStartBtn, goToStartScreen);

bindClick(privacyBtn, () => showScreen(privacyScreen));
bindClick(impressumBtn, () => showScreen(impressumScreen));
bindClick(privacyFromHelpBtn, () => showScreen(privacyScreen));
bindClick(impressumFromHelpBtn, () => showScreen(impressumScreen));
bindClick(backFromPrivacyBtn, goToStartScreen);
bindClick(backFromImpressumBtn, goToStartScreen);

usernameInput.addEventListener("input", () => {
  if (!dbAvailable) return;

  const cleanName = sanitizeUsername(usernameInput.value);

  if (!cleanName) {
    clearUsernameWarning();
    lastCheckedUsername = "";
    lastUsernameExists = false;
    clearTimeout(usernameCheckTimer);
    return;
  }

  clearTimeout(usernameCheckTimer);
  usernameCheckTimer = setTimeout(() => {
    checkIfUsernameExists(cleanName);
  }, USERNAME_CHECK_DELAY);
});

usernameInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    startGame();
  }
});

showLeaderboardBtn.addEventListener("click", openLeaderboardScreen);
miniInfo.addEventListener("click", openLeaderboardScreen);
toggleLeaderboardBtn.addEventListener("click", toggleLeaderboardMode);

changeUserBtn.addEventListener("click", () => {
  if (!dbAvailable) return;
  goToStartScreen();
  usernameInput.value = username;
  clearUsernameWarning();
  resetPerformanceMonitor();
});

window.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  if (key === "h") {
    showHitboxes = !showHitboxes;
  }

  if (key === "f") {
    showFps = !showFps;
    if (showFps) {
      resetFpsCounter();
    }
  }

  if (event.code === "Space") {
    event.preventDefault();
    if (gameScreen.classList.contains("active")) {
      handleGameInput();
    }
  }

  if (
    event.key === "Escape" &&
    (helpScreen.classList.contains("active") ||
      privacyScreen.classList.contains("active") ||
      impressumScreen.classList.contains("active"))
  ) {
    goToStartScreen();
  }
});

canvas.addEventListener("mousedown", handleGameInput);

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