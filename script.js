// ─── Supabase ────────────────────────────────────────────────────────────────
const SUPABASE_URL      = "https://hxqvuuvzxbdvccqwiwpf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_24ByLN2dz1BSVTjx3qL8Lw_vJwe47dO";
const supabaseClient    = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Constants ───────────────────────────────────────────────────────────────
const USERNAME_STORAGE_KEY  = "player_username";
const SKIN_STORAGE_KEY      = "player_skin";
const SETTINGS_STORAGE_KEY  = "player_settings";
const LOCAL_ACH_KEY         = "local_achievements";

const LOW_FPS_CHECK_INTERVAL = 2000;
const FPS_DISPLAY_INTERVAL   = 250;
const USERNAME_CHECK_DELAY   = 350;

const GAME_WIDTH  = 400;
const GAME_HEIGHT = 700;

const gravity      = 0.42;
const jumpStrength = -8;

const basePipeSpeed    = 2.7;
const basePipeInterval = 1650;
const basePipeGap      = 220;

const pipeWidth      = 84;
const groundHeight   = 0;
const postWidth      = 16;
const signWidth      = 78;
const signHeight     = 78;
const plainPostWidth = signWidth;

const beerWidth     = 44;
const beerHeight    = 47;
const beerPadding   = 22;
const beerBobAmount = 3;
const beerBobSpeed  = 0.08;

const waterWidth       = 24;
const waterHeight      = 34;
const waterEdgePadding = 8;
const waterBobAmount   = 2.5;
const waterBobSpeed    = 0.065;

const scoreFlashDuration = 180;
const offscreenRemovalX  = -20;
const playerBaseWidth    = 85;
const playerAspectRatio  = Math.round(85 * (550.3 / 807.2)) / 85;

const ROUND_SIGN_KEYS    = new Set(["tempo30","noentry","noparking","stop","nouturn","noovertaking"]);
const ENDGAME_THRESHOLD  = 404;
const NORMAL_BEER_POINTS = 3;
const TEST_BEER_POINTS   = 10;

// ─── Achievement & Skin definitions ──────────────────────────────────────────
// Types:
//   score        – irgendwer erreicht X Highscore global
//   score_count  – mindestens N verschiedene Spieler erreichen X Highscore global
//   daily_sum    – Tagessumme aller Runs >= threshold
//   exact        – exakt X Punkte beim Game Over (sichtbar)
//   exact_easter – exakt X Punkte, aber als Easter Egg angezeigt
//   username     – Spielername === value (Easter Egg)
//   half_prev    – Score = halber Vorrun (>= minScore)
//   same_score   – Nx hintereinander gleicher Score (> minScore)
//   rapid_rounds – N Runden mit < 120s Pause dazwischen
//   time_window  – Spielen zwischen hour_from und hour_to
//   time_exact   – Spielen exakt um HH:MM ±1 Minute (Easter Egg)
//   zero_die     – N mal mit 0 Pkt sterben
//   speedrun     – innerhalb X Sekunden nach Spielstart sterben
//   schnapszahl  – Score ist Schnapszahl (11,22,...,99) und > 0
//   sequence     – exakte Score-Sequenz über mehrere Runs (steps:[])

const SKINS = [
  // ── Standard ──────────────────────────────────────────────────────────────
  {
    id: "default", name: "Original", src: "images/players/player.svg",
    achievement: null
  },

  // ── Score (aufsteigend) ────────────────────────────────────────────────────
  {
    id: "score_100", name: "Blaublitz", src: "images/players/player_blue.svg",
    achievement: {
      id: "score_100", type: "score", threshold: 100,
      revealLabel: "100 Pünkt erreiche"
    }
  },
  {
    id: "score_200", name: "Goldbueb", src: "images/players/player_gold.svg",
    achievement: {
      id: "score_200", type: "score", threshold: 200,
      revealLabel: "200 Pünkt erreiche"
    }
  },
  {
    id: "score_300", name: "Platinboss", src: "images/players/player_platinum.svg",
    achievement: {
      id: "score_300", type: "score", threshold: 300,
      revealLabel: "300 Pünkt erreiche"
    }
  },
  {
    id: "score_400", name: "Smaragdgleiter", src: "images/players/player_smaragd.svg",
    achievement: {
      id: "score_400", type: "score", threshold: 400,
      revealLabel: "400 Pünkt erreiche"
    }
  },

  // ── Tagessumme (aufsteigend) ───────────────────────────────────────────────
  {
    id: "daily_10000", name: "Fürabeglanz", src: "images/players/player_daily-1.svg",
    achievement: {
      id: "daily_10000", type: "daily_sum", threshold: 10000,
      revealLabel: "Tagessumme 10'000 Pünkt"
    }
  },
  {
    id: "daily_20000", name: "Heissläufer", src: "images/players/player_daily-2.svg",
    achievement: {
      id: "daily_20000", type: "daily_sum", threshold: 20000,
      revealLabel: "Tagessumme 20'000 Pünkt"
    }
  },
  {
    id: "daily_30000", name: "Zackmeister", src: "images/players/player_daily-3.svg",
    achievement: {
      id: "daily_30000", type: "daily_sum", threshold: 30000,
      revealLabel: "Tagessumme 30'000 Pünkt"
    }
  },
  {
    id: "daily_40000", name: "Abrissheld", src: "images/players/player_daily-4.svg",
    achievement: {
      id: "daily_40000", type: "daily_sum", threshold: 40000,
      revealLabel: "Tagessumme 40'000 Pünkt"
    }
  },
  {
    id: "daily_50000", name: "Eskalator", src: "images/players/player_daily-5.svg",
    achievement: {
      id: "daily_50000", type: "daily_sum", threshold: 50000,
      revealLabel: "Tagessumme 50'000 Pünkt"
    }
  },
  {
    id: "daily_60000", name: "Überdimension", src: "images/players/player_daily-6.svg",
    achievement: {
      id: "daily_60000", type: "daily_sum", threshold: 60000,
      revealLabel: "Tagessumme 60'000 Pünkt"
    }
  },

  // ── Exakt-Score ────────────────────────────────────────────────────────────
  {
    id: "exact_3", name: "Stolperer", src: "images/players/player_number3.svg",
    achievement: {
      id: "exact_3", type: "exact", threshold: 3,
      revealLabel: "Exakt 3 Pünkt erreiche"
    }
  },
  {
    id: "exact_69", name: "Grinsegrind", src: "images/players/player_number69.svg",
    achievement: {
      id: "exact_69", type: "exact_easter", threshold: 69,
      revealLabel: "Exakt 69 Pünkt erreiche"
    }
  },
  {
    id: "exact_94", name: "Gründigsmitglied", src: "images/players/player_number94.svg",
    achievement: {
      id: "exact_94", type: "exact_easter", threshold: 94,
      revealLabel: "Exakt 94 Pünkt erreiche"
    }
  },
  {
    id: "exact_100", name: "Punktprofi", src: "images/players/player_number100.svg",
    achievement: {
      id: "exact_100", type: "exact", threshold: 100,
      revealLabel: "Exakt 100 Pünkt erreiche"
    }
  },

  // ── Uhrzeit ───────────────────────────────────────────────────────────────
  {
    id: "early_bird", name: "Früehvogel", src: "images/players/player_earlybird.svg",
    achievement: {
      id: "early_bird", type: "time_window", hourFrom: 6, hourTo: 8,
      revealLabel: "Zwüsche 6 und 8 Uhr gspielt"
    }
  },
  {
    id: "noon_player", name: "Zmittagskiller", src: "images/players/player_noon.svg",
    achievement: {
      id: "noon_player", type: "time_exact", hour: 12, minute: 0, toleranceMin: 1,
      revealLabel: "Gnau am 12 Uhr gspielt"
    }
  },
  {
    id: "night_owl", name: "Nachtüüle", src: "images/players/player_night.svg",
    achievement: {
      id: "night_owl", type: "time_window", hourFrom: 0, hourTo: 3,
      revealLabel: "Zwüsche Mitternacht und 3 Uhr gspielt"
    }
  },
  {
    id: "night_watch", name: "Nachtwach", src: "images/players/player_nightwatch.svg",
    achievement: {
      id: "night_watch", type: "time_window", hourFrom: 3, hourTo: 5,
      revealLabel: "Zwüsche 3 und 5 Uhr gspielt"
    }
  },

  // ── Benutzername ──────────────────────────────────────────────────────────
  {
    id: "username_manuela", name: "Posuine-Göttin Manusa", src: "images/players/player_manuela.svg",
    achievement: {
      id: "username_manuela", type: "username", value: "manuela",
      revealLabel: "Mer isch eifach d'Manuela"
    }
  },

  // ── Spezial / Verhalte ────────────────────────────────────────────────────
  {
    id: "no_water", name: "Wasserschüüch", src: "images/players/player_nowater.svg",
    achievement: {
      id: "no_water", type: "no_water", minScore: 150,
      revealLabel: "Keis Wasser isammle (>150 Pünkt)"
    }
  },
  {
    id: "half_prev", name: "Halbling", src: "images/players/player_half.svg",
    achievement: {
      id: "half_prev", type: "half_prev", minScore: 20,
      revealLabel: "Exakt dHälfti vum vorherige Score erreiche"
    }
  },
  {
    id: "same_score_2", name: "Doppelgänger", src: "images/players/player_same.svg",
    achievement: {
      id: "same_score_2", type: "same_score", count: 2, minScore: 50,
      revealLabel: "2x hinderenand de gliich Score ha (>50 Pünkt)"
    }
  },
  {
    id: "schnapszahl", name: "Pegelhalter", src: "images/players/player_schnapszahl.svg",
    achievement: {
      id: "schnapszahl", type: "schnapszahl",
      revealLabel: "Mitere Schnapszahl gstorbe"
    }
  },
  {
    id: "die_top", name: "Det obe gids au nüt", src: "images/players/player_dietop.svg",
    achievement: {
      id: "die_top", type: "die_direction", direction: "top",
      revealLabel: "Obe useflüüge"
    }
  },
  {
    id: "die_bottom", name: "Det unde gids nüt", src: "images/players/player_diebottom.svg",
    achievement: {
      id: "die_bottom", type: "die_direction", direction: "bottom",
      revealLabel: "Unde useflüüge"
    }
  },
  {
    id: "speedrun_5s", name: "Früehabträtter", src: "images/players/player_speedrun.svg",
    achievement: {
      id: "speedrun_5s", type: "speedrun", exactSeconds: 5,
      revealLabel: "Exakt 5 Sekunde nachem Start gstorbe"
    }
  },
  {
    id: "rapid_40", name: "Super-Stern", src: "images/players/player_rapid.svg",
    achievement: {
      id: "rapid_40", type: "rapid_rounds", count: 40, maxPauseSec: 120,
      revealLabel: "40 Runde mit weniger als 2 Min Pause"
    }
  },
  {
    id: "zero_die_10", name: "Nullnummer", src: "images/players/player_die10.svg",
    achievement: {
      id: "zero_die_10", type: "zero_die", threshold: 10,
      revealLabel: "10 mal mit 0 Pünkt gstorbe"
    }
  },
  {
    id: "sequence_3_6_9_12_15", name: "Stufemeister", src: "images/players/player_sequence.svg",
    achievement: {
      id: "sequence_3_6_9_12_15", type: "sequence", steps: [3, 6, 9, 12, 15],
      revealLabel: "Nacheanand exakt 3, 6, 9, 12, 15 Pünkt erreiche"
    }
  },
  {
    id: "endgame", name: "ERROR 404 – Not Found", src: "images/players/player_endgame.svg",
    achievement: {
      id: "endgame", type: "score", threshold: 404,
      revealLabel: "sEndgame erreiche"
    }
  },
  {
    id: "endgame_second", name: "ERROR 429 – Too Many Requests", src: "images/players/player_endgame2.svg",
    achievement: {
      id: "endgame_second", type: "score_count", threshold: 404, minCount: 2,
      revealLabel: "Is Endgame folge"
    }
  },
];

// ─── DOM ─────────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const startScreen      = $("startScreen");
const helpScreen       = $("helpScreen");
const settingsScreen   = $("settingsScreen");
const privacyScreen    = $("privacyScreen");
const impressumScreen  = $("impressumScreen");
const gameScreen       = $("gameScreen");
const endScreen        = $("endScreen");
const offlineScreen    = $("offlineScreen");

const screens = [
  startScreen, helpScreen, settingsScreen,
  privacyScreen, impressumScreen,
  gameScreen, endScreen, offlineScreen
];

const usernameInput         = $("username");
const startBtn              = $("startBtn");
const restartBtn            = $("restartBtn");
const changeUserBtn         = $("changeUserBtn");
const showLeaderboardBtn    = $("showLeaderboardBtn");
const miniInfo              = $("miniInfo");
const usernameWarning       = $("usernameWarning");

const helpBtn               = $("helpBtn");
const settingsBtn           = $("settingsBtn");
const backToStartBtn        = $("backToStartBtn");
const backFromSettingsBtn   = $("backFromSettingsBtn");
const privacyBtn            = $("privacyBtn");
const impressumBtn          = $("impressumBtn");
const privacyFromHelpBtn    = $("privacyFromHelpBtn");
const impressumFromHelpBtn  = $("impressumFromHelpBtn");
const backFromPrivacyBtn    = $("backFromPrivacyBtn");
const backFromImpressumBtn  = $("backFromImpressumBtn");

const hitboxToggle    = $("hitboxToggle");
const fpsToggle       = $("fpsToggle");
const soundToggle     = $("soundToggle");
const drinkModeToggle  = $("drinkModeToggle");
const skinGrid        = $("skinGrid");

const playerLabel          = $("playerLabel");
const scoreLabel           = $("scoreLabel");
const finalScore           = $("finalScore");
const saveStatus           = $("saveStatus");
const leaderboardList      = $("leaderboardList");
const leaderboardTitle     = $("leaderboardTitle");
const toggleLeaderboardBtn = $("toggleLeaderboardBtn");
const rankText             = $("rankText");
const platinumBox          = $("platinumBox");
const goldBox              = $("goldBox");
const smaragdBox           = $("smaragdBox");
const performanceWarning   = $("performanceWarning");
const placementText        = $("placementText");
const highscoreStatusText  = $("highscoreStatusText");
const newAchievementBox    = $("newAchievementBox");
const newAchievementName   = $("newAchievementName");
const tabAllTime           = $("tabAllTime");
const tabToday             = $("tabToday");

const resultView        = $("resultView");
const leaderboardView   = $("leaderboardView");
const warnIcon          = $("warnIcon");
const canvas            = $("gameCanvas");
const ctx               = canvas.getContext("2d");
const startOverlay      = $("startOverlay");
const endgameOverlay    = $("endgameOverlay");
const glitchLayer       = $("glitchLayer");
const canvasStage       = canvas.parentElement;

// Drink-mode text targets (gecacht, damit applyDrinkTexts kein querySelector braucht)
const startScreenTitle   = document.querySelector("#startScreen h1");
const startScreenIntro   = document.querySelector("#startScreen .intro");
const platinumSubtitleEl = $("platinumSubtitle");
const smaragdSubtitleEl  = $("smaragdSubtitle");
const goldSubtitleEl     = $("goldSubtitle");

// Game Over overlay
const gameOverOverlay = document.createElement("div");
gameOverOverlay.id = "gameOverOverlay";
canvasStage.appendChild(gameOverOverlay);

// ─── Settings ─────────────────────────────────────────────────────────────────
let settings = { showHitboxes: false, showFps: false, drinkMode: "bier", soundEnabled: false };
try { const s = localStorage.getItem(SETTINGS_STORAGE_KEY); if (s) settings = { ...settings, ...JSON.parse(s) }; } catch(_) {}
function saveSettings() { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings)); }

// ─── Sounds (AudioContext für minimale Latenz) ────────────────────────────────
let audioCtx = null;
const soundBuffers = {};
const soundVolumes = { jump: 0.05, collect: 1.0, lose: 0.7, die: 1.0, highscore: 1.0, achievement: 1.0 };
const soundSources = {};

// Context sofort beim Laden erstellen (ohne User-Interaktion erlaubt auf manchen Browsern)
// Falls nicht, wird er beim ersten tryPlayIntro / Canvas-Touch erstellt
function ensureAudioContext() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(_) {}
}

// Schnelle Sounds zuerst laden (jump, collect, lose, die)
const FAST_SOUNDS = ["jump", "collect", "lose", "die"];
const SLOW_SOUNDS = ["highscore", "achievement"];

async function loadSoundBuffer(name) {
  if (!audioCtx || soundBuffers[name]) return;
  try {
    const res = await fetch(`sounds/${name}.mp3`);
    const buf = await res.arrayBuffer();
    soundBuffers[name] = await audioCtx.decodeAudioData(buf);
  } catch(_) {}
}

async function initAudioContext() {
  ensureAudioContext();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") await audioCtx.resume();
  // Schnelle Sounds parallel laden
  await Promise.all(FAST_SOUNDS.map(loadSoundBuffer));
  // Langsame Sounds im Hintergrund
  SLOW_SOUNDS.forEach(loadSoundBuffer);
}

function playSound(name) {
  if (!settings.soundEnabled || !audioCtx || !soundBuffers[name]) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  if (soundSources[name]) { try { soundSources[name].stop(); } catch(_) {} }
  const src  = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  src.buffer = soundBuffers[name];
  gain.gain.value = soundVolumes[name] ?? 1.0;
  src.connect(gain);
  gain.connect(audioCtx.destination);
  src.start(0);
  soundSources[name] = src;
}

function stopSound(name) {
  if (!soundSources[name]) return;
  try { soundSources[name].stop(); } catch(_) {}
  soundSources[name] = null;
}

// ─── Test mode ────────────────────────────────────────────────────────────────
let testMode = false;

// Konsolenbefehl: window.enableTestMode() / window.disableTestMode()
window.enableTestMode = () => {
  testMode = true;
  console.info("%c[TESTMODUS AN]", "color: orange; font-weight: bold");
};
window.disableTestMode = () => {
  testMode = false;
  console.info("%c[TESTMODUS AUS]", "color: green; font-weight: bold");
};

// Dynamische Bier-Punkte je nach Testmodus
function getBeerPoints() { return testMode ? TEST_BEER_POINTS : NORMAL_BEER_POINTS; }
let localAch = {
  zeroDieCount:    0,   // zero_die
  sameScoreStreak: 0,   // same_score consecutive
  lastScore:       -1,  // for half_prev and same_score
  lastRunEndTime:  0,   // rapid_rounds
  rapidRoundCount: 0,   // rapid_rounds
  prevRunScore:    -1,  // half_prev
  scoreSequence:   [],  // sequence – last N scores
};
try { const l = localStorage.getItem(LOCAL_ACH_KEY); if (l) localAch = { ...localAch, ...JSON.parse(l) }; } catch(_) {}
function saveLocalAch() { localStorage.setItem(LOCAL_ACH_KEY, JSON.stringify(localAch)); }

// ─── Skin state ───────────────────────────────────────────────────────────────
let activeSkinId  = localStorage.getItem(SKIN_STORAGE_KEY) || "default";
let unlockedSkins = {};  // { achievementId: { skinId, unlockedBy } }

// ─── Images ───────────────────────────────────────────────────────────────────
function loadImage(src) { const i = new Image(); i.src = src; return i; }

const skinImages = {};
for (const skin of SKINS) skinImages[skin.id] = loadImage(skin.src);
function getActiveSkinImage() { return skinImages[activeSkinId] || skinImages["default"]; }

const waterImage = loadImage("images/water.svg");

// ─── Drink modes ──────────────────────────────────────────────────────────────
// Alle Images werden beim Parse geladen (Preload), auch inaktive Modi.
// So ist das Bild sofort bereit wenn der User das Theme wechselt.
const DRINK_MODES = {
  bier: {
    id:                 "bier",
    cssClass:           "",
    image:              loadImage("images/beer.svg"),
    label:              "Bier",
    labelPlural:        "Bier",
    gameTitle:          "Schärbäli uf Bierjagd",
    intro:              "S'Schärbäli muess gnueg Vorrat für de Schmudo organisiere. Schnapp dier so viel 3er-Bierpäckli wie möglich, wiich de Hindernis us und pass uf: Wasserfläsche gäbed dier Minuspünkt.",
    miniInfo:           "🏆 Top 10 Bierjäger",
    hudScore:           "Bier",
    finalScoreText:     "Bier gsammlet.",
    finalScoreZero:     "Du hesch 0 Bier gsammlet.",
    lbEmpty:            "<li>No kei Bierjäger i de Liste.</li>",
    lbEntry:            "Bier",
    lbTitleAll:         "Top 10 Bierjäger",
    lbTitleAllFull:     "Kompletti Liste",
    lbTitleToday:       "Top 10 hüt",
    lbTitleTodayFull:   "Alli Bierjäger hüt",
    platinumSubtitle:   "Das isch nümme nume legendär. Das isch d'Endstufe vo Bierlogistik, Flugpräzision und völliger Eskalationskompetänz.",
    smaragdSubtitle:    "Du hesch ned nur Bier gsammlet, du hesch es Versorgigsimperium ufbaut. Wenn irgendwo im Land Bier fählt, wird din Name gflüstered.",
    goldSubtitle:       "Das isch kei normali Sammelrundi gsi. Das isch es Meisterwerk vo Durstvorsorg, Eskalationsplanig und absoluter Grössi.",
    rankTexts: {
      380: "Abartig starch. Du funktioniersch wie es Hochleistigs-Bierdepot uf zwei Bei. Aber irgendöppis fühlt sich hie falsch ah...",
      300: "Das isch nümme nume legendär. Das isch d'Endstufe vo Bierlogistik, Flugpräzision und völliger Eskalationskompetänz.",
      280: "Absolut wahnsinnig. Du hesch s'Biersammle uf es Niveau bracht, wo jede Logistikplan verblasse lad.",
      260: "Komplett eskaliert. Das isch nümme nur guet, das isch praktisch historischi Bierdominanz.",
      220: "Brutal präzise. So viel Kontrolle het me susch nume bi Lüüt mit innerem Bierkompass.",
      200: "Das isch kei normali Sammelrundi gsi. Das isch es Meisterwerk vo Durstvorsorg, Eskalationsplanig und absoluter Grössi.",
      180: "Vollmaschine. Du bisch wahrschinlich sälber scho es halbs Bierlogistik-Team.",
      160: "Königsklass. Wenn öpper Vorrat organisiere cha, denn du.",
      140: "Brutal. Du sammlisch wie eine, wo de Lageplan vom Bierlager uswendig cha.",
      100: "Suuber. De Schmudo cha cho, es isch gnueg Material am Start. Aber gad da numeh?",
      20:  "Das isch scho fast peinlich. Mit dem Vorrat chunsch ned mal dur d'erscht Stund.",
      0:   "Du hesch praktisch nüt organisiert. So wird de Schmudo e Trochestund.",
    },
  },
  espresso: {
    id:                 "espresso",
    cssClass:           "espresso-mode",
    image:              loadImage("images/espresso_martini.svg"),
    label:              "Espresso Martini",
    labelPlural:        "Espresso Martinis",
    gameTitle:          "Schärbäli uf Espresso Martini Jagd",
    intro:              "S'Schärbäli muess gnueg Vorrat für de Schmudo organisiere. Schnapp dier so viel Espresso Martinis wie möglich, wiich de Hindernis us und pass uf: Wasserfläsche gäbed dier Minuspünkt.",
    miniInfo:           "🏆 Top 10 Espresso Martini Jäger",
    hudScore:           "Espresso Martini",
    finalScoreText:     "Espresso Martinis gsammlet.",
    finalScoreZero:     "Du hesch 0 Espresso Martinis gsammlet.",
    lbEmpty:            "<li>No kei Espresso Martini Jäger i de Liste.</li>",
    lbEntry:            "Espresso Martinis",
    lbTitleAll:         "Top 10 Espresso Martini Jäger",
    lbTitleAllFull:     "Kompletti Liste",
    lbTitleToday:       "Top 10 hüt",
    lbTitleTodayFull:   "Alli Espresso Martini Jäger hüt",
    platinumSubtitle:   "Das isch nümme nume legendär. Das isch d'Endstufe vo Espresso-Logistik, Flugpräzision und völliger Eskalationskompetänz.",
    smaragdSubtitle:    "Du hesch ned nur Espresso Martinis gsammlet, du hesch es Versorgigsimperium ufbaut. Wenn irgendwo im Land de Koffein fählt, wird din Name gflüstered.",
    goldSubtitle:       "Das isch kei normali Sammelrundi gsi. Das isch es Meisterwerk vo Kaffeevorsorg, Eskalationsplanig und absoluter Grössi.",
    rankTexts: {
      380: "Abartig starch. Du funktioniersch wie es Hochleistigs-Espresso-Depot uf zwei Bei. Aber irgendöppis fühlt sich hie falsch ah...",
      300: "Das isch nümme nume legendär. Das isch d'Endstufe vo Espresso-Logistik, Flugpräzision und völliger Eskalationskompetänz.",
      280: "Absolut wahnsinnig. Du hesch s'Espresso-Sammle uf es Niveau bracht, wo jede Logistikplan verblasse lad.",
      260: "Komplett eskaliert. Das isch nümme nur guet, das isch praktisch historischi Espresso-Dominanz.",
      220: "Brutal präzise. So viel Kontrolle het me susch nume bi Lüüt mit innerem Espresso-Kompass.",
      200: "Das isch kei normali Sammelrundi gsi. Das isch es Meisterwerk vo Kaffeevorsorg, Eskalationsplanig und absoluter Grössi.",
      180: "Vollmaschine. Du bisch wahrschinlich sälber scho es halbs Espresso-Logistik-Team.",
      160: "Königsklass. Wenn öpper Espresso organisiere cha, denn du.",
      140: "Brutal. Du sammlisch wie eine, wo de Lageplan vom Espresso-Lager uswendig cha.",
      100: "Suuber. De Schmudo cha cho, es isch gnueg Espresso am Start. Aber gad da numeh?",
      20:  "Das isch scho fast peinlich. Mit dem Espresso chunsch ned mal dur d'erscht Stund.",
      0:   "Du hesch praktisch nüt organisiert. So wird de Schmudo komplett nüechter.",
    },
  },
};

// Alle bekannten Drink-Theme CSS-Klassen – einmalig gecacht für setDrinkMode
const _allDrinkCssClasses = Object.values(DRINK_MODES).map(m => m.cssClass).filter(Boolean);

// Aktiver Drink-Theme – nach settings-Load gesetzt, nach DRINK_MODES definiert
let DRINK = DRINK_MODES[settings.drinkMode] || DRINK_MODES.bier;

function setDrinkMode(id) {
  DRINK = DRINK_MODES[id] || DRINK_MODES.bier;
  document.body.classList.remove(..._allDrinkCssClasses);
  if (DRINK.cssClass) document.body.classList.add(DRINK.cssClass);
}

const pipeSigns = [
  { key: "deadend",      image: loadImage("images/signs/sign_deadend.svg") },
  { key: "detour",       image: loadImage("images/signs/sign_detour.svg") },
  { key: "noentry",      image: loadImage("images/signs/sign_noentry.svg") },
  { key: "noparking",    image: loadImage("images/signs/sign_noparking.svg") },
  { key: "tempo30",      image: loadImage("images/signs/sign_tempo30.svg") },
  { key: "stop",         image: loadImage("images/signs/sign_stop.svg") },
  { key: "parking",      image: loadImage("images/signs/sign_parking.svg") },
  { key: "beer",         image: loadImage("images/signs/sign_beer.svg") },
  { key: "shh",          image: loadImage("images/signs/sign_shh.svg") },
  { key: "question",     image: loadImage("images/signs/sign_question.svg") },
  { key: "nouturn",      image: loadImage("images/signs/sign_nouturn.svg") },
  { key: "noovertaking", image: loadImage("images/signs/sign_noovertaking.svg") },
  { key: "nowater",      image: loadImage("images/signs/sign_nowater.svg") },
  { key: "404",          image: loadImage("images/signs/sign_404.svg") }
];
const pipeSignImageMap = Object.fromEntries(pipeSigns.map(({ key, image }) => [key, image]));

// ─── Game state ───────────────────────────────────────────────────────────────
let username = localStorage.getItem(USERNAME_STORAGE_KEY) || "";
usernameInput.value = username;

let waitingForFirstInput = false;
let gameRunning          = false;
let animationId          = null;
let score                = 0;
let player               = null;
let pipes                = [];
let beers                = [];
let waters               = [];
let lastPipeTime         = 0;
let lastFrameTime        = 0;
let gameStartTime        = 0;
let gameStartTimestamp   = 0;
let pipesUntilNextWater  = 0;
let waterCollected       = 0;
let deathDirection       = null;
let endgameActive        = false;  // true ab Score >= ENDGAME_THRESHOLD

let usernameCheckTimer     = null;
let lastCheckedUsername    = "";
let lastUsernameExists     = false;
let usernameCheckRequestId = 0;

let difficultyLevel    = 0;
let cachedPipeSpeed    = basePipeSpeed;
let cachedPipeInterval = basePipeInterval;
let cachedPipeGap      = basePipeGap;

let scoreFlashUntil = 0;
let scoreFlashColor = "green";

let fps           = 0;
let fpsFrameCount = 0;
let fpsLastTime   = 0;

let dbAvailable       = true;
let webmasterNotified = false;

let lowFpsCheckStart = 0;
let lowFpsFrameCount = 0;

let leaderboardShowAll   = false;
let leaderboardShowToday = false;

// ─── Pure helpers ─────────────────────────────────────────────────────────────
const clamp      = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
const randInt    = (mn, mx)    => { if (mx < mn) return mn; return Math.floor(Math.random() * (mx - mn + 1)) + mn; };
const imageReady = img         => !!img && img.complete && img.naturalWidth > 0;
const sanitizeUsername = n     => n.trim().replace(/\s+/g, " ").slice(0, 20);
const _escDiv = document.createElement("div");
const escapeHtml = t => { _escDiv.textContent = t; return _escDiv.innerHTML; };
const isRoundSign    = pipe => !pipe.isPlainPost && ROUND_SIGN_KEYS.has(pipe.signKey);
const isSchnapszahl  = n    => n > 0 && n <= 99 && n % 11 === 0;

function circleIntersectsRect(cx, cy, r, rect) {
  const dx = cx - clamp(cx, rect.left, rect.right);
  const dy = cy - clamp(cy, rect.top, rect.bottom);
  return dx * dx + dy * dy < r * r;
}

function getNowInSwissTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Zurich" }));
}

function todayStartISO() {
  const d = getNowInSwissTime();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// ─── UI helpers ───────────────────────────────────────────────────────────────
function showScreen(s) {
  for (const sc of screens) sc.classList.toggle("active", sc === s);
  s.scrollTop = 0;
}

function showResultView()       { resultView.classList.remove("hidden"); leaderboardView.classList.add("hidden"); }
function showLeaderboardViewEl(){ resultView.classList.add("hidden");    leaderboardView.classList.remove("hidden"); }
function goToStartScreen()      { showScreen(startScreen); showResultView(); }
function updateScoreUI()        { scoreLabel.textContent = `${DRINK.hudScore}: ${score}`; }
function updateStartOverlay()   { startOverlay.classList.toggle("hidden", !waitingForFirstInput); }

// Updates all UI texts that depend on the active drink mode
function applyDrinkTexts() {
  startScreenTitle.textContent  = DRINK.gameTitle;
  startScreenIntro.textContent  = DRINK.intro;
  miniInfo.textContent          = DRINK.miniInfo;
  document.title                = DRINK.gameTitle;
  platinumSubtitleEl.textContent = DRINK.platinumSubtitle;
  smaragdSubtitleEl.textContent  = DRINK.smaragdSubtitle;
  goldSubtitleEl.textContent     = DRINK.goldSubtitle;
  updateScoreUI();
}

function setPerformanceWarning(v) { if (performanceWarning) performanceWarning.classList.toggle("hidden", !v); }
function resetPerformanceMonitor() { lowFpsCheckStart = 0; lowFpsFrameCount = 0; setPerformanceWarning(false); }
function showWarnIcon() { warnIcon.classList.remove("hidden"); }
function hideWarnIcon() { warnIcon.classList.add("hidden"); }
function monitorPerformance(now) {
  if (!gameRunning || !performanceWarning) return;
  if (!lowFpsCheckStart) { lowFpsCheckStart = now; lowFpsFrameCount = 0; }
  lowFpsFrameCount++;
  const elapsed = now - lowFpsCheckStart;
  if (elapsed < LOW_FPS_CHECK_INTERVAL) return;
  setPerformanceWarning(Math.round((lowFpsFrameCount * 1000) / elapsed) <= 35);
  lowFpsCheckStart = now; lowFpsFrameCount = 0;
}


function clearUsernameWarning() {
  usernameWarning.textContent = "";
  usernameWarning.classList.remove("is-warning", "is-info");
}

function setUsernameWarningState(text, type) {
  usernameWarning.textContent = text;
  usernameWarning.classList.toggle("is-warning", type === "warning");
  usernameWarning.classList.toggle("is-info",    type === "info");
}

function resetEndScreenState() {
  finalScore.textContent          = DRINK.finalScoreZero;
  rankText.textContent            = "";
  saveStatus.textContent          = "";
  placementText.textContent       = "";
  highscoreStatusText.textContent = "";
  highscoreStatusText.classList.remove("is-success", "is-muted");
  goldBox.classList.add("hidden");
  platinumBox.classList.add("hidden");
  smaragdBox.classList.add("hidden");
  newAchievementBox.classList.add("hidden");
  showResultView();
}

// ─── Achievement popup ────────────────────────────────────────────────────────
function showAchievementPopup(skin, unlockedByName) {
  newAchievementName.textContent = skin.name;
  const unlocker = document.getElementById("newAchievementUnlocker");
  if (unlocker) unlocker.textContent = `Freigschaltet vo: ${unlockedByName}`;
  newAchievementBox.classList.remove("hidden");
}

// ─── Settings UI ──────────────────────────────────────────────────────────────
function applySettingsToUI() {
  hitboxToggle.setAttribute("aria-checked", settings.showHitboxes ? "true" : "false");
  fpsToggle.setAttribute("aria-checked",    settings.showFps      ? "true" : "false");
  if (soundToggle) soundToggle.setAttribute("aria-checked", settings.soundEnabled ? "true" : "false");
  drinkModeToggle.setAttribute("aria-checked", settings.drinkMode === "espresso" ? "true" : "false");
  setDrinkMode(settings.drinkMode);
}

function toggleSetting(key, btn) {
  settings[key] = !settings[key];
  btn.setAttribute("aria-checked", settings[key] ? "true" : "false");
  saveSettings();
}

hitboxToggle.addEventListener("click", () => toggleSetting("showHitboxes", hitboxToggle));
fpsToggle.addEventListener("click",    () => toggleSetting("showFps",      fpsToggle));
if (soundToggle) soundToggle.addEventListener("click", () => toggleSetting("soundEnabled", soundToggle));
drinkModeToggle.addEventListener("click", () => {
  settings.drinkMode = settings.drinkMode === "espresso" ? "bier" : "espresso";
  drinkModeToggle.setAttribute("aria-checked", settings.drinkMode === "espresso" ? "true" : "false");
  setDrinkMode(settings.drinkMode);
  saveSettings();
  applyDrinkTexts();
});

// ─── Skin UI ──────────────────────────────────────────────────────────────────
function isSkinUnlocked(skin) {
  if (!skin.achievement) return true;
  return !!unlockedSkins[skin.achievement.id];
}

function buildSkinGrid() {
  skinGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (const skin of SKINS) {
    const unlocked = isSkinUnlocked(skin);
    const selected = skin.id === activeSkinId;
    const ach      = skin.achievement;

    const card = document.createElement("div");
    card.className = "skin-card" + (!unlocked ? " locked" : "") + (selected ? " selected" : "");

    const img = document.createElement("img");
    img.className = "skin-preview";
    img.src       = unlocked ? skin.src : "images/players/player.svg";
    img.alt       = unlocked ? skin.name : "???";
    if (!unlocked) img.style.filter = "blur(4px) grayscale(1)";
    img.onerror = () => { img.style.opacity = "0.3"; };

    const nameEl = document.createElement("div");
    nameEl.className   = "skin-name";
    nameEl.textContent = unlocked ? skin.name : "???";

    card.appendChild(img);
    card.appendChild(nameEl);

    if (ach) {
      const sub = document.createElement("div");
      sub.className = "skin-unlocker";
      if (!unlocked) {
        sub.textContent = "???";
        const lock = document.createElement("span");
        lock.className = "skin-lock-icon"; lock.textContent = "🔒";
        card.appendChild(lock);
      } else {
        const entry = unlockedSkins[ach.id];
        const reveal = ach.revealLabel || "";
        sub.innerHTML = entry?.unlockedBy
          ? `${reveal} <br> ✅ ${entry.unlockedBy}`
          : `✅ ${reveal}`;
      }
      card.appendChild(sub);
    }

    if (unlocked) card.addEventListener("click", () => selectSkin(skin.id));
    fragment.appendChild(card);
  }
  skinGrid.appendChild(fragment);
}

function selectSkin(id) {
  if (!SKINS.find(s => s.id === id && isSkinUnlocked(s))) return;
  activeSkinId = id;
  localStorage.setItem(SKIN_STORAGE_KEY, id);
  buildSkinGrid();
}

// ─── Load unlocked skins from DB ─────────────────────────────────────────────
async function loadUnlockedSkins() {
  if (!dbAvailable) return;
  try {
    const { data, error } = await supabaseClient
      .from("achievements")
      .select("achievement_id, unlocked_by");
    if (error) return;

    unlockedSkins = {};
    for (const row of (data || [])) {
      const skin = SKINS.find(s => s.achievement?.id === row.achievement_id);
      if (skin) {
        unlockedSkins[row.achievement_id] = {
          skinId:     skin.id,
          unlockedBy: row.unlocked_by
        };
      }
    }
    const activeSkin = SKINS.find(s => s.id === activeSkinId);
    if (activeSkin && !isSkinUnlocked(activeSkin)) activeSkinId = "default";
  } catch(_) {}
}

// ─── Check & unlock achievements ─────────────────────────────────────────────
async function tryInsertAchievement(achievementId, unlockedBy) {
  try {
    const { error } = await supabaseClient
      .from("achievements")
      .insert({ achievement_id: achievementId, unlocked_by: unlockedBy, unlocked_at: new Date().toISOString() });
    if (!error) {
      unlockedSkins[achievementId] = { skinId: null, unlockedBy };
      return true;
    }
    if (error.code === "23505") await loadUnlockedSkins();
  } catch(_) {}
  return false;
}

async function checkAndUnlockAchievements(currentScore, gameEndTimestamp) {
  if (!dbAvailable) return [];

  const now     = new Date(new Date(gameEndTimestamp).toLocaleString("en-US", { timeZone: "Europe/Zurich" }));
  const hour    = now.getHours();
  const minute  = now.getMinutes();
  const elapsed = (gameEndTimestamp - gameStartTimestamp) / 1000;

  // ── Update local counters ──────────────────────────────────────────────────

  if (currentScore === 0) localAch.zeroDieCount++;

  // Rapid rounds
  const timeSinceLastRun = (gameEndTimestamp - localAch.lastRunEndTime) / 1000;
  if (localAch.lastRunEndTime > 0 && timeSinceLastRun < 120) {
    localAch.rapidRoundCount++;
  } else {
    localAch.rapidRoundCount = 1;
  }
  localAch.lastRunEndTime = gameEndTimestamp;

  // Same score streak (>50)
  if (currentScore > 50 && currentScore === localAch.lastScore) {
    localAch.sameScoreStreak++;
  } else {
    localAch.sameScoreStreak = currentScore > 50 ? 1 : 0;
  }

  // Sequence – keep last 10 scores, enough for any defined sequence
  localAch.scoreSequence = [...(localAch.scoreSequence || []), currentScore].slice(-10);

  const prevRunScore    = localAch.prevRunScore;
  localAch.lastScore    = currentScore;
  localAch.prevRunScore = currentScore;
  saveLocalAch();

  // ── Daily sum (one DB query, shared across all daily_sum checks) ───────────
  let dailySumCache = null;
  async function getDailySum() {
    if (dailySumCache !== null) return dailySumCache;
    try {
      const { data } = await supabaseClient
        .from("daily_scores")
        .select("score")
        .gte("played_at", todayStartISO());
      dailySumCache = data ? data.reduce((acc, r) => acc + (r.score || 0), 0) : 0;
    } catch(_) { dailySumCache = 0; }
    return dailySumCache;
  }

  const newlyUnlocked = [];

  for (const skin of SKINS) {
    const ach = skin.achievement;
    if (!ach) continue;
    if (unlockedSkins[ach.id]) continue;

    let qualifies = false;

    switch (ach.type) {
      case "score":
        qualifies = currentScore >= ach.threshold;
        break;

      case "score_count":
        // Prüft ob mindestens N verschiedene Spieler den threshold erreicht haben
        // inkl. dem aktuellen Spieler falls er gerade qualifiziert
        try {
          const { data } = await supabaseClient
            .from("scores")
            .select("username")
            .gte("highscore", ach.threshold);
          const count = (data || []).length;
          // +1 falls aktueller Spieler gerade zum ersten Mal qualifiziert
          const selfQualifies = currentScore >= ach.threshold;
          const alreadyCounted = (data || []).some(r => r.username === username);
          qualifies = (count + (selfQualifies && !alreadyCounted ? 1 : 0)) >= ach.minCount;
        } catch(_) {}
        break;

      case "daily_sum":
        qualifies = (await getDailySum()) >= ach.threshold;
        break;

      case "exact":
      case "exact_easter":
        qualifies = currentScore === ach.threshold;
        break;

      case "username":
        qualifies = sanitizeUsername(username).toLowerCase() === ach.value.toLowerCase();
        break;

      case "half_prev":
        qualifies = prevRunScore > 0 &&
                    currentScore >= ach.minScore &&
                    currentScore * 2 === prevRunScore;
        break;

      case "same_score":
        qualifies = localAch.sameScoreStreak >= ach.count;
        break;

      case "rapid_rounds":
        qualifies = localAch.rapidRoundCount >= ach.count;
        break;

      case "time_window":
        qualifies = hour >= ach.hourFrom && hour < ach.hourTo;
        break;

      case "time_exact":
        qualifies = hour === ach.hour && Math.abs(minute - ach.minute) <= ach.toleranceMin;
        break;

      case "zero_die":
        qualifies = localAch.zeroDieCount >= ach.threshold;
        break;

      case "speedrun":
        qualifies = elapsed >= ach.exactSeconds - 0.5 && elapsed <= ach.exactSeconds + 0.5;
        break;

      case "schnapszahl":
        qualifies = isSchnapszahl(currentScore);
        break;

      case "no_water":
        qualifies = waterCollected === 0 && currentScore >= ach.minScore;
        break;

      case "die_direction":
        qualifies = deathDirection === ach.direction;
        break;

      case "sequence": {
        const seq = localAch.scoreSequence;
        const steps = ach.steps;
        qualifies = steps.length > 0 &&
          steps.every((step, i) => {
            const idx = seq.length - steps.length + i;
            return idx >= 0 && seq[idx] === step;
          });
        break;
      }
    }

    if (!qualifies) continue;

    const inserted = await tryInsertAchievement(ach.id, username);
    if (inserted) {
      unlockedSkins[ach.id] = { skinId: skin.id, unlockedBy: username };
      newlyUnlocked.push(skin);
    }
  }

  return newlyUnlocked;
}

// ─── Endgame mode ─────────────────────────────────────────────────────────────
function activateEndgame() {
  if (endgameActive) return;
  endgameActive = true;
  endgameOverlay.classList.add("active");
  glitchLayer.classList.add("active");        // Filter auf separatem Layer – sicher für Canvas
  canvasStage.classList.add("endgame-glitch"); // Nur Wobble auf canvasStage
  pipesUntilNextWater = 0;
}

function deactivateEndgame() {
  endgameActive = false;
  endgameOverlay.classList.remove("active");
  glitchLayer.classList.remove("active");
  canvasStage.classList.remove("endgame-glitch");
}

// ─── Canvas resize ────────────────────────────────────────────────────────────
function resizeCanvas() {
  // Nicht während dem Spiel resizen - das resettet den ctx-State mitten in render()
  if (gameRunning) return;
  const isMobile = window.innerWidth <= 768;
  const dpr      = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2);
  canvas.width   = Math.round(GAME_WIDTH  * dpr);
  canvas.height  = Math.round(GAME_HEIGHT * dpr);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = true;
  if (player) render(performance.now());
}

// ─── Difficulty ───────────────────────────────────────────────────────────────
function getRandomWaterSpawnCount(level) {
  const min = Math.max(2, 6 - Math.floor(level / 2));
  const max = Math.max(4, 8 - Math.floor(level / 2));
  return randInt(min, max);
}

function updateDifficultyCache(t) {
  // Schwierigkeit steigt bis Score ~350, danach eingefroren
  const newLevel = Math.floor(Math.min(score, 350) / 28);
  if (newLevel === difficultyLevel) return;
  difficultyLevel    = newLevel;
  cachedPipeSpeed    = Math.min(4, basePipeSpeed    + difficultyLevel * 0.1083);
  cachedPipeInterval = Math.max(1000, basePipeInterval - difficultyLevel * 62.5);
  cachedPipeGap      = Math.max(175, basePipeGap      - difficultyLevel * 3.75);
}

// ─── Pipe / item helpers ──────────────────────────────────────────────────────
function getPipeSignRect(pipe) {
  return { x: pipe.x + (pipeWidth - pipe.collisionWidth) / 2, width: pipe.collisionWidth };
}

function getRoundSignCollision(pipe, isTop) {
  return {
    x: pipe.x + pipeWidth / 2,
    y: isTop ? pipe.topHeight - signHeight / 2 : pipe.bottomY + signHeight / 2,
    radius: pipeWidth / 2
  };
}

function getPipeSignByKey(key) { return pipeSignImageMap[key] || null; }

function stopGameLoop() {
  if (animationId !== null) { cancelAnimationFrame(animationId); animationId = null; }
}

// ─── Database ─────────────────────────────────────────────────────────────────
function notifyWebmaster() {
  if (webmasterNotified) return;
  webmasterNotified = true;
  console.error("Datenbankverbindung fehlgeschlagen.");
}

async function checkDatabaseConnection() {
  const { error } = await supabaseClient.from("scores").select("username").limit(1);
  dbAvailable = !error;
  if (!dbAvailable) { notifyWebmaster(); showScreen(offlineScreen); }
  return dbAvailable;
}

async function checkIfUsernameExists(name) {
  if (!dbAvailable) return false;
  const cleanName = sanitizeUsername(name);
  const requestId = ++usernameCheckRequestId;
  if (!cleanName) { clearUsernameWarning(); lastCheckedUsername = ""; lastUsernameExists = false; return false; }
  const { data, error } = await supabaseClient.from("scores").select("username").eq("username", cleanName).maybeSingle();
  if (requestId !== usernameCheckRequestId) return lastUsernameExists;
  if (error) { console.error(error); clearUsernameWarning(); lastCheckedUsername = cleanName; lastUsernameExists = false; return false; }
  const exists = !!data;
  lastCheckedUsername = cleanName; lastUsernameExists = exists;
  if (exists) setUsernameWarningState("Dä Name gids scho. Du chasch diräkt wiiterspiele und bineme bessere Resultat wird din Highscore aktualisiert.", "warning");
  else        setUsernameWarningState("Name isch no frei. Mit dem Name wird en neue Benutzer erstellt.", "info");
  return exists;
}

async function getExistingHighscore(u) {
  const { data, error } = await supabaseClient.from("scores").select("username,highscore").eq("username", u).maybeSingle();
  if (error) throw error;
  return data || null;
}

async function upsertHighscore(u, s, existing) {
  const ts = new Date().toISOString();
  if (!existing) {
    const { error } = await supabaseClient.from("scores").insert({ username: u, highscore: s, updated_at: ts });
    if (error) throw error;
  } else {
    const { error } = await supabaseClient.from("scores").update({ highscore: s, updated_at: ts }).eq("username", u);
    if (error) throw error;
  }
}

async function saveDailyScore(u, s) {
  try {
    await supabaseClient.from("daily_scores").insert({ username: u, score: s, played_at: getNowInSwissTime().toISOString() });
  } catch(_) {}
}

async function getLeaderboardData(todayOnly = false) {
  if (todayOnly) {
    const { data, error } = await supabaseClient
      .from("daily_scores")
      .select("username, score, played_at")
      .gte("played_at", todayStartISO())
      .order("score", { ascending: false });
    if (error) throw error;
    const best = {};
    for (const row of (data || [])) {
      if (!best[row.username] || row.score > best[row.username].score) best[row.username] = row;
    }
    return Object.values(best).sort((a, b) => b.score - a.score);
  }
  const { data, error } = await supabaseClient
    .from("scores")
    .select("username, highscore, updated_at")
    .order("highscore",  { ascending: false })
    .order("updated_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

function getRankForScore(entries, u, s, excludeSelf = false) {
  const relevant = excludeSelf ? entries.filter(e => e.username !== u) : entries;
  return relevant.filter(e => Number(e.highscore ?? e.score) >= Number(s)).length + 1;
}

// ─── Game init ────────────────────────────────────────────────────────────────
function createInitialPlayer() {
  return { x: 100, y: 260, width: playerBaseWidth, height: playerBaseWidth * playerAspectRatio, velocity: 0, rotation: 0 };
}

function initGame() {
  const now = performance.now();
  player = createInitialPlayer();
  pipes = []; beers = []; waters = [];
  score = 0;
  difficultyLevel    = 0;
  cachedPipeSpeed    = basePipeSpeed;
  cachedPipeInterval = basePipeInterval;
  cachedPipeGap      = basePipeGap;
  lastPipeTime = lastFrameTime = gameStartTime = now;
  pipesUntilNextWater = getRandomWaterSpawnCount(0);
  waterCollected = 0;
  deathDirection = null;
  endgameActive  = false;
  endGameRunning = false;
  deactivateEndgame();
  hideWarnIcon();
  scoreFlashUntil = 0; scoreFlashColor = "green";
  gameOverOverlay.classList.remove("animate");
  resetPerformanceMonitor();
  updateScoreUI();
  resetEndScreenState();
}

// ─── Object creation ──────────────────────────────────────────────────────────
function createBeerForPipe(pipe) {
  const minY = pipe.topHeight + beerPadding;
  const maxY = pipe.bottomY - beerHeight - beerPadding;
  // Sicherheit: Nur spawnen wenn genug Platz
  if (maxY <= minY) return;
  beers.push({ x: pipe.x + pipeWidth / 2 - beerWidth / 2, y: randInt(minY, maxY), width: beerWidth, height: beerHeight, bob: Math.random() * Math.PI * 2 });
}

function createWaterForPipe(pipe) {
  const placeAtTop = Math.random() < 0.5;
  const baseY = placeAtTop ? pipe.topHeight + waterEdgePadding : pipe.bottomY - waterHeight - waterEdgePadding;
  // Sicherheit: Nur spawnen wenn baseY im gültigen Bereich liegt
  if (baseY < 0 || baseY + waterHeight > GAME_HEIGHT) return;
  waters.push({ x: pipe.x + (pipeWidth - waterWidth) / 2, baseY, width: waterWidth, height: waterHeight, bob: Math.random() * Math.PI * 2 });
}

function createPipe() {
  // Gap minimum = waterHeight + 2*waterEdgePadding damit Wasser platziert werden kann
  const minGap = Math.max(cachedPipeGap, waterHeight + 2 * waterEdgePadding + 10);
  const topHeight = randInt(70, GAME_HEIGHT - minGap - 70);
  const isPlainPost = Math.random() < 0.5;
  const randomSign  = isPlainPost ? null : pipeSigns[Math.floor(Math.random() * pipeSigns.length)];
  const pipe = {
    x: GAME_WIDTH + 24, topHeight,
    bottomY:        topHeight + minGap,
    bottomHeight:   GAME_HEIGHT - topHeight - minGap - groundHeight,
    signKey:        randomSign ? randomSign.key : null,
    isPlainPost,
    collisionWidth: isPlainPost ? plainPostWidth : signWidth
  };
  pipes.push(pipe);

  if (endgameActive) {
    // Endgame: Wasser und Bier STRENG abwechseln
    // pipesUntilNextWater ist entweder 0 (=Wasser kommt) oder 1 (=Bier kommt)
    if (pipesUntilNextWater === 0) {
      createWaterForPipe(pipe);
      pipesUntilNextWater = 1;  // Nächste Pipe = Bier
    } else {
      createBeerForPipe(pipe);
      pipesUntilNextWater = 0;  // Nächste Pipe = Wasser
    }
    return;
  }

  // Normal: jede Pipe bekommt Bier, ausser es ist eine Wasser-Pipe
  pipesUntilNextWater--;
  if (pipesUntilNextWater <= 0) {
    createWaterForPipe(pipe);
    pipesUntilNextWater = getRandomWaterSpawnCount(difficultyLevel);
    return;
  }
  createBeerForPipe(pipe);
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
function clearFrame() { ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT); }

function drawPlayer() {
  const img = getActiveSkinImage();
  ctx.save();
  ctx.translate(Math.round(player.x), Math.round(player.y));
  ctx.rotate(player.rotation);
  if (imageReady(img)) {
    ctx.drawImage(img, -player.width / 2, -player.height / 2, player.width, player.height);
  } else {
    ctx.fillStyle = "#58aa4f"; ctx.beginPath();
    ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawPosterColumn(x, y, width, height) {
  if (height <= 0) return;
  const rx = Math.round(x), ry = Math.round(y), rw = Math.round(width), rh = Math.round(height);
  ctx.save();
  const bg = ctx.createLinearGradient(rx, 0, rx + rw, 0);
  bg.addColorStop(0,    "#c8ccd2");
  bg.addColorStop(0.18, "#f5f6f8");
  bg.addColorStop(0.5,  "#fff");
  bg.addColorStop(0.82, "#d7dbe0");
  bg.addColorStop(1,    "#b5bbc3");
  ctx.fillStyle = bg; ctx.fillRect(rx, ry, rw, rh);
  const ringH = 12;
  const rg = ctx.createLinearGradient(rx, 0, rx + rw, 0);
  rg.addColorStop(0,   "#7a8088");
  rg.addColorStop(0.5, "#c6ccd3");
  rg.addColorStop(1,   "#6f757d");
  ctx.fillStyle = rg;
  ctx.fillRect(rx, ry, rw, ringH);
  ctx.fillRect(rx, ry + rh - ringH, rw, ringH);
  ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.fillRect(rx + rw * 0.14, ry + ringH, Math.max(2, rw * 0.08), rh - ringH * 2);
  ctx.fillStyle = "rgba(0,0,0,0.06)";       ctx.fillRect(rx + rw * 0.82, ry + ringH, Math.max(2, rw * 0.05), rh - ringH * 2);
  const pt = ry + 22, pb = ry + rh - 22;
  if (pb - pt > 40) {
    const cols = 2, gap = 6, padX = 8, pw = (rw - padX * 2 - gap) / cols;
    const pal = [["#ff4d6d","#ffb703"],["#06d6a0","#118ab2"],["#8338ec","#ff006e"],["#3a86ff","#90e0ef"],["#fb8500","#ffd166"],["#43aa8b","#577590"]];
    let cy = pt, pi = 0;
    while (cy < pb - 28) {
      const ph = Math.min(pb - cy, 48 + ((pi * 17) % 54));
      for (let c = 0; c < cols; c++) {
        const px = rx + padX + c * (pw + gap), py = cy + (c % 2) * 4;
        if (py + ph > pb) continue;
        const cl = pal[(pi + c) % pal.length];
        const pg = ctx.createLinearGradient(px, py, px, py + ph);
        pg.addColorStop(0, cl[0]); pg.addColorStop(1, cl[1]);
        ctx.fillStyle = pg; ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 1.5; ctx.strokeRect(px + .5, py + .5, pw - 1, ph - 1);
        ctx.fillStyle = "rgba(255,255,255,0.82)"; ctx.fillRect(px + 5, py + 6, pw * 0.55, 6);
        ctx.fillStyle = "rgba(255,255,255,0.6)";  ctx.fillRect(px + 5, py + 16, pw * 0.38, 4); ctx.fillRect(px + 5, py + 24, pw * 0.48, 4);
        ctx.beginPath(); ctx.fillStyle = "rgba(255,255,255,0.24)";
        ctx.arc(px + pw * 0.72, py + ph * 0.68, Math.min(12, pw * 0.22), 0, Math.PI * 2); ctx.fill();
      }
      cy += ph + 8; pi++;
    }
  }
  ctx.restore();
}

function drawPipeSign(pipe, y, height, isTop) {
  if (pipe.isPlainPost || !pipe.signKey) return;
  const si = getPipeSignByKey(pipe.signKey); if (!imageReady(si)) return;
  const ix = pipe.x + (pipeWidth - signWidth) / 2;
  const iy = isTop ? y + height - signHeight : y;
  if (isTop) {
    ctx.save();
    ctx.translate(Math.round(ix + signWidth / 2), Math.round(iy + signHeight / 2));
    ctx.rotate(Math.PI);
    ctx.drawImage(si, -signWidth / 2, -signHeight / 2, signWidth, signHeight);
    ctx.restore();
    return;
  }
  ctx.drawImage(si, Math.round(ix), Math.round(iy), signWidth, signHeight);
}

function drawPipePart(pipe, y, height, isTop) {
  if (height <= 0) return;
  if (pipe.isPlainPost) { drawPosterColumn(pipe.x + (pipeWidth - plainPostWidth) / 2, y, plainPostWidth, height); return; }
  const px = pipe.x + (pipeWidth - postWidth) / 2;
  ctx.save();
  const pg = ctx.createLinearGradient(px, 0, px + postWidth, 0);
  pg.addColorStop(0,   "#8c96a1");
  pg.addColorStop(0.5, "#dfe5eb");
  pg.addColorStop(1,   "#89939e");
  ctx.fillStyle = pg; ctx.fillRect(Math.round(px), Math.round(y), Math.round(postWidth), Math.round(height));
  ctx.fillStyle = "rgba(255,255,255,0.28)"; ctx.fillRect(Math.round(px + 2), Math.round(y), 2, Math.round(height));
  drawPipeSign(pipe, y, height, isTop);
  ctx.restore();
}

function drawPipe(p) { drawPipePart(p, 0, p.topHeight, true); drawPipePart(p, p.bottomY, p.bottomHeight, false); }
function drawPipes() { for (const p of pipes) drawPipe(p); }

function drawFloatingItems(items, image, bobAmount, yKey) {
  if (!imageReady(image)) return;
  for (const item of items) ctx.drawImage(image, item.x, item[yKey] + Math.sin(item.bob) * bobAmount, item.width, item.height);
}

function drawBeers()  { drawFloatingItems(beers,  DRINK.image, beerBobAmount, "y"); }
function drawWaters() { drawFloatingItems(waters, waterImage, waterBobAmount, "baseY"); }

function drawScoreOnCanvas(now) {
  const fl = now < scoreFlashUntil;
  let stroke = "rgba(33,74,42,0.22)", fill = "rgba(255,255,255,0.95)";
  if (fl && scoreFlashColor === "green") { stroke = "rgba(30,120,40,0.35)";  fill = "#7dff8a"; }
  if (fl && scoreFlashColor === "red")   { stroke = "rgba(150,30,30,0.35)";  fill = "#ff8a8a"; }
  ctx.save();
  ctx.font = "bold 40px Arial"; ctx.textAlign = "center"; ctx.lineWidth = 5;
  ctx.strokeStyle = stroke; ctx.fillStyle = fill;
  ctx.strokeText(String(score), GAME_WIDTH / 2, 64);
  ctx.fillText(String(score),   GAME_WIDTH / 2, 64);
  ctx.restore();
}

// ─── Collision ────────────────────────────────────────────────────────────────
function getPlayerBox() {
  return {
    left:   player.x - player.width  / 2 + 18,
    right:  player.x + player.width  / 2 - 18,
    top:    player.y - player.height / 2 + 10,
    bottom: player.y + player.height / 2 - 10
  };
}

function isOverlapping(a, b) {
  return a.left < b.x + b.width && a.right > b.x && a.top < b.y + b.height && a.bottom > b.y;
}

function checkItemCollection(items, points, flashColor, now, playerBox, isWater = false) {
  const bob  = isWater ? waterBobAmount : 0;
  const yKey = isWater ? "baseY" : "y";
  for (let i = items.length - 1; i >= 0; i--) {
    const it  = items[i];
    const box = { x: it.x, y: it[yKey] + Math.sin(it.bob) * bob, width: it.width, height: it.height };
    if (isOverlapping(playerBox, box)) {
      score = Math.max(0, score + points); updateScoreUI();
      if (score >= 380) showWarnIcon();
      scoreFlashUntil = now + scoreFlashDuration; scoreFlashColor = flashColor;
      if (isWater) { waterCollected++; playSound("lose"); }
      else { playSound("collect"); }
      items.splice(i, 1);
    }
  }
}

function checkCollision(pb) {
  if (pb.top    <= 0)                          { deathDirection = "top";    return true; }
  if (pb.bottom >= GAME_HEIGHT - groundHeight) { deathDirection = "bottom"; return true; }
  if (testMode) return false;
  for (const pipe of pipes) {
    const sr = getPipeSignRect(pipe);
    if (pb.right <= sr.x || pb.left >= sr.x + sr.width) continue;
    if (pipe.isPlainPost || !isRoundSign(pipe)) {
      if (pb.top < pipe.topHeight || pb.bottom > pipe.bottomY) { deathDirection = "pipe"; return true; }
      continue;
    }
    const ts = getRoundSignCollision(pipe, true);
    const bs = getRoundSignCollision(pipe, false);
    if (pb.top  < ts.y || pb.bottom > bs.y ||
       (pb.bottom > ts.y && circleIntersectsRect(ts.x, ts.y, ts.radius, pb)) ||
       (pb.top   < bs.y && circleIntersectsRect(bs.x, bs.y, ts.radius, pb))) {
      deathDirection = "pipe"; return true;
    }
  }
  return false;
}

// ─── Debug ────────────────────────────────────────────────────────────────────
function drawHitboxes() {
  if (!settings.showHitboxes) return;
  const pb = getPlayerBox();
  ctx.save(); ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,0,0,0.95)";
  ctx.strokeRect(pb.left, pb.top, pb.right - pb.left, pb.bottom - pb.top);
  ctx.strokeStyle = "rgba(0,120,255,0.95)";
  for (const pipe of pipes) {
    const sr = getPipeSignRect(pipe);
    if (pipe.isPlainPost || !isRoundSign(pipe)) {
      ctx.strokeRect(sr.x, 0, sr.width, pipe.topHeight);
      ctx.strokeRect(sr.x, pipe.bottomY, sr.width, GAME_HEIGHT - pipe.bottomY - groundHeight);
      continue;
    }
    const ts = getRoundSignCollision(pipe, true);
    const bs = getRoundSignCollision(pipe, false);
    ctx.strokeRect(sr.x, 0,    sr.width, ts.y);
    ctx.strokeRect(sr.x, bs.y, sr.width, GAME_HEIGHT - bs.y - groundHeight);
    ctx.beginPath(); ctx.arc(ts.x, ts.y, ts.radius, 0,        Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(bs.x, bs.y, ts.radius, Math.PI, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function drawFps(now) {
  if (!settings.showFps) return;
  if (!fpsLastTime) fpsLastTime = now;
  fpsFrameCount++;
  const diff = now - fpsLastTime;
  if (diff >= FPS_DISPLAY_INTERVAL) { fps = Math.round((fpsFrameCount * 1000) / diff); fpsFrameCount = 0; fpsLastTime = now; }
  ctx.save();
  ctx.font = "bold 18px Arial"; ctx.textAlign = "right"; ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(80,0,0,0.45)"; ctx.fillStyle = "#ff2b2b";
  ctx.strokeText(`${fps} FPS`, GAME_WIDTH - 10, GAME_HEIGHT - 12);
  ctx.fillText(`${fps} FPS`,   GAME_WIDTH - 10, GAME_HEIGHT - 12);
  ctx.restore();
}

function render(now) {
  try {
    clearFrame(); drawPipes(); drawBeers(); drawWaters(); drawPlayer(); drawHitboxes(); drawFps(now); drawScoreOnCanvas(now);
  } catch(e) {
    console.error("render Fehler:", e);
    // ctx-Stack zurücksetzen
    try { ctx.setTransform(1, 0, 0, 1, 0, 0); } catch(_) {}
  }
}

// ─── Game over animation ──────────────────────────────────────────────────────
function playGameOverAnimation() {
  gameOverOverlay.classList.remove("animate");
  void gameOverOverlay.offsetWidth;
  gameOverOverlay.classList.add("animate");
  canvasStage.classList.remove("shake");
  void canvasStage.offsetWidth;
  canvasStage.classList.add("shake");
  canvasStage.addEventListener("animationend", () => canvasStage.classList.remove("shake"), { once: true });
}

// ─── Input ────────────────────────────────────────────────────────────────────
function flap() {
  if (waitingForFirstInput) { beginGameplay(); return; }
  if (!gameRunning || !dbAvailable) return;
  playSound("jump");
  player.velocity = jumpStrength; player.rotation = -0.45;
}

// ─── Game flow ────────────────────────────────────────────────────────────────
async function startGame() {
  if (!dbAvailable) return;
  clearTimeout(usernameCheckTimer);
  username = sanitizeUsername(usernameInput.value);
  if (!username) { alert("Bitte gib en Benutzername ih."); return; }
  if (lastCheckedUsername !== username) await checkIfUsernameExists(username);
  localStorage.setItem(USERNAME_STORAGE_KEY, username);
  playerLabel.textContent = `Spieler: ${username}`;
  stopGameLoop(); initGame(); showScreen(gameScreen);
  gameRunning = false; waitingForFirstInput = true; updateStartOverlay();
  const now = performance.now(); lastFrameTime = now;
  resizeCanvas();
  render(now);
}

function beginGameplay() {
  if (!waitingForFirstInput || !dbAvailable) return;
  waitingForFirstInput = false; gameRunning = true;
  updateStartOverlay(); resetPerformanceMonitor();
  const now = performance.now();
  lastFrameTime = lastPipeTime = gameStartTime = now;
  gameStartTimestamp = Date.now();
  player.velocity = jumpStrength; player.rotation = -0.45;
  animationId = requestAnimationFrame(updateGame);
}

function getRankText(points) {
  const rt = DRINK.rankTexts;
  if (points >= 404) return "ERROR 404 – Unbekannts Terrain beträtte. Endgame aktiviert!";
  if (points >= 400) return "Irgendöppis fühlt sich hie falsch ah...";
  if (points >= 380) return rt[380];
  if (points >= 360) return "Total eskaliert. Das isch kei Leistig meh, das isch en Machtdemonstration.";
  if (points >= 340) return "Unmenschlich guet. Du sammlisch schneller als anderi überhaupt dänke chönd.";
  if (points >= 320) return "Völlig chrank. Dä Vorrat längt locker bis zur nöchste Fasnacht!";
  if (points >= 300) return rt[300];
  if (points >= 280) return rt[280];
  if (points >= 260) return rt[260];
  if (points >= 240) return "Unfassbar starch. Du flügsch dur dä Parcour, als wär er extra für dich baut worde.";
  if (points >= 220) return rt[220];
  if (points >= 200) return rt[200];
  if (points >= 180) return rt[180];
  if (points >= 160) return rt[160];
  if (points >= 140) return rt[140];
  if (points >= 120) return "Richtig starch. Du bisch offiziell im Sammelmodus eskaliert.";
  if (points >= 100) return rt[100];
  if (points >= 80)  return "Das isch e schöni Leistig. Du hesch verstande, um was es gaht.";
  if (points >= 60)  return "Immerhin, mer gsehd e Wille. De Schmudo isch no ned grettet, aber es git Hoffnig.";
  if (points >= 40)  return "Knapp nid komplett blamiert. Aber gross isch dini Sammelaktion jetzt au ned gsi.";
  if (points >= 20)  return rt[20];
  return rt[0];
}

// ── Meilenstein UI ────────────────────────────────────────────────────────────
function applyMilestoneUI(score, prevHighscore) {
  // Erster Meilenstein = vorheriger Highscore lag unter dieser Schwelle
  const firstMilestone400 = prevHighscore < 400 && score >= 400;
  const firstMilestone300 = prevHighscore < 300 && score >= 300 && score < 400;
  const firstMilestone200 = prevHighscore < 200 && score >= 200 && score < 300;

  // Smaragd: immer zeigen bei >=400, immer mit Text
  smaragdBox.classList.toggle("hidden", score < 400);
  // Platin: nur beim ersten Mal Meilenstein 300
  platinumBox.classList.toggle("hidden", !firstMilestone300);
  // Gold: nur beim ersten Mal Meilenstein 200
  goldBox.classList.toggle("hidden", !firstMilestone200);

  // Text unterdrücken beim ersten Gold/Platin-Meilenstein
  const suppressText = firstMilestone200 || firstMilestone300;
  rankText.textContent = suppressText ? "" : getRankText(score);
}

let endGameRunning = false;
async function endGame() {
  if (!dbAvailable) return;
  if (endGameRunning) return;  // Guard: verhindert mehrfachen Aufruf
  endGameRunning = true;
  gameRunning = false; waitingForFirstInput = false;
  updateStartOverlay(); resetPerformanceMonitor(); stopGameLoop();
  deactivateEndgame();
  playSound("die");

  const gameEndTimestamp = Date.now();
  playGameOverAnimation();
  await new Promise(r => setTimeout(r, 420));

  finalScore.textContent = `Du hesch ${score} ${DRINK.finalScoreText}`;
  // Box und Text werden erst nach DB-Fetch gesetzt (brauchen vorherigen Highscore)

  showScreen(endScreen); showResultView();

  try {
    if (testMode) {
      const existing      = await getExistingHighscore(username);
      const prevHighscore = existing ? existing.highscore : -1;
      applyMilestoneUI(score, prevHighscore);
      placementText.textContent       = "Testmodus aktiv";
      highscoreStatusText.textContent = "Testmodus aktiv";
      highscoreStatusText.classList.add("is-muted");
      return;
    }

    await saveDailyScore(username, score);

    const existing       = await getExistingHighscore(username);
    const prevHighscore  = existing ? existing.highscore : -1;
    const isNewHighscore = !existing || score > prevHighscore;
    if (isNewHighscore) await upsertHighscore(username, score, existing);

    applyMilestoneUI(score, prevHighscore);

    const newSkins = await checkAndUnlockAchievements(score, gameEndTimestamp);

    if (newSkins.length > 0) {
      showAchievementPopup(newSkins[0], username);
      if (!isNewHighscore) playSound("achievement");
      if (newSkins.length > 1) {
        const extra = document.createElement("div");
        extra.style.marginTop = "8px";
        extra.style.fontSize  = "13px";
        extra.style.color     = "#734f00";
        extra.textContent     = `+${newSkins.length - 1} weitere Skins freigschaltet!`;
        newAchievementBox.appendChild(extra);
      }
    }

    const leaderboardData = await getLeaderboardData();
    const placement = isNewHighscore
      ? getRankForScore(leaderboardData, username, score, true)
      : getRankForScore(leaderboardData, username, score, false);

    placementText.textContent = `${placement}. Platz`;
    if (isNewHighscore) { highscoreStatusText.textContent = "Neuer Highscore"; highscoreStatusText.classList.add("is-success"); playSound("highscore"); }
    else                { highscoreStatusText.textContent = "Kein Highscore";  highscoreStatusText.classList.add("is-muted"); }
  } catch (err) {
    console.error(err);
    placementText.textContent       = "Dini Platzierig chan grad nid berächnet wärde.";
    highscoreStatusText.textContent = "Fehler bim Speichere.";
    highscoreStatusText.classList.add("is-muted");
  } finally {
    endGameRunning = false;
  }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
function renderLeaderboardEntries(entries) {
  if (!entries || entries.length === 0) {
    leaderboardList.innerHTML = DRINK.lbEmpty;
    saveStatus.textContent    = "No kei Iträg."; return;
  }
  const visible = leaderboardShowAll ? entries : entries.slice(0, 10);
  leaderboardList.innerHTML = visible.map(e => {
    const pts   = e.highscore ?? e.score;
    const isYou = e.username === username;
    return `<li><span class="lb-entry-name${isYou ? " lb-entry-you" : ""}">${escapeHtml(e.username)}${isYou ? " (Du)" : ""}</span> – ${pts} ${DRINK.lbEntry}</li>`;
  }).join("");
  leaderboardTitle.textContent     = leaderboardShowToday
    ? (leaderboardShowAll ? DRINK.lbTitleTodayFull : DRINK.lbTitleToday)
    : (leaderboardShowAll ? DRINK.lbTitleAllFull   : DRINK.lbTitleAll);
  toggleLeaderboardBtn.textContent = leaderboardShowAll ? "Nur Top 10" : "Komplette Liste";
  toggleLeaderboardBtn.classList.toggle("hidden", entries.length <= 10);
  saveStatus.textContent = "";
}

async function loadLeaderboard() {
  if (!dbAvailable) return;
  leaderboardList.innerHTML = "<li>Lade...</li>"; saveStatus.textContent = "Lade Highscore...";
  try { renderLeaderboardEntries(await getLeaderboardData(leaderboardShowToday)); }
  catch(err) { console.error(err); leaderboardList.innerHTML = "<li>Fehler bim Lade.</li>"; saveStatus.textContent = "Fehler."; }
}

// ─── Update loop ──────────────────────────────────────────────────────────────
function updateMovingItems(items, movement, bobSpeed) {
  for (let i = items.length - 1; i >= 0; i--) {
    items[i].x   -= movement;
    items[i].bob += bobSpeed;
    if (items[i].x + items[i].width <= offscreenRemovalX) items.splice(i, 1);
  }
}

function updatePipes(movement) {
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= movement;
    if (pipes[i].x + pipeWidth <= offscreenRemovalX) pipes.splice(i, 1);
  }
}

function updateGame(currentTime) {
  if (!gameRunning || !dbAvailable) return;
  try {
    if (!lastFrameTime) lastFrameTime = currentTime;
    const delta = Math.min(1.5, (currentTime - lastFrameTime) / 16.6667);
    lastFrameTime = currentTime;
    updateDifficultyCache(currentTime);
    player.velocity += gravity * delta;
    player.y        += player.velocity * delta;
    player.rotation  = clamp(player.velocity * 0.05, -0.45, Math.PI / 4);
    if (currentTime - lastPipeTime > cachedPipeInterval) { createPipe(); lastPipeTime = currentTime; }
    const mv = cachedPipeSpeed * delta;
    updatePipes(mv);
    updateMovingItems(beers,  mv, beerBobSpeed  * delta);
    updateMovingItems(waters, mv, waterBobSpeed * delta);
    const pb = getPlayerBox();
    checkItemCollection(beers,   getBeerPoints(), "green", currentTime, pb, false);
    checkItemCollection(waters, -1,            "red",   currentTime, pb, true);
    if (checkCollision(pb)) { endGame(); return; }
    // Endgame ab Score >= ENDGAME_THRESHOLD aktivieren
    if (!endgameActive && score >= ENDGAME_THRESHOLD) activateEndgame();
    monitorPerformance(currentTime);
    render(currentTime);
    animationId = requestAnimationFrame(updateGame);
  } catch (err) {
    console.error("updateGame Fehler:", err);
    // Spiel sicher beenden statt abstürzen
    gameRunning = false;
    stopGameLoop();
  }
}

// ─── Leaderboard screen ───────────────────────────────────────────────────────
async function openLeaderboardScreen() {
  if (!dbAvailable) return;
  hideWarnIcon();
  leaderboardShowAll = false; leaderboardShowToday = false;
  tabAllTime.classList.add("active"); tabToday.classList.remove("active");
  showScreen(endScreen); showLeaderboardViewEl();
  await loadLeaderboard();
}

tabAllTime.addEventListener("click", async () => {
  if (!leaderboardShowToday) return;
  leaderboardShowToday = false; leaderboardShowAll = false;
  tabAllTime.classList.add("active"); tabToday.classList.remove("active");
  await loadLeaderboard();
});

tabToday.addEventListener("click", async () => {
  if (leaderboardShowToday) return;
  leaderboardShowToday = true; leaderboardShowAll = false;
  tabToday.classList.add("active"); tabAllTime.classList.remove("active");
  await loadLeaderboard();
});

// ─── Events ───────────────────────────────────────────────────────────────────
window.addEventListener("resize", resizeCanvas);
startBtn.addEventListener("click",   startGame);
restartBtn.addEventListener("click", startGame);

// AudioContext beim ersten Klick auf Startscreen initialisieren (Sounds vorwärmen)
startScreen.addEventListener("click",      () => initAudioContext(), { once: true });
startScreen.addEventListener("touchstart", () => initAudioContext(), { once: true, passive: true });

helpBtn.addEventListener("click",     () => showScreen(helpScreen));
settingsBtn.addEventListener("click", async () => {
  await loadUnlockedSkins(); applySettingsToUI(); buildSkinGrid(); showScreen(settingsScreen);
});

backToStartBtn.addEventListener("click",      goToStartScreen);
backFromSettingsBtn.addEventListener("click",  goToStartScreen);
backFromPrivacyBtn.addEventListener("click",   goToStartScreen);
backFromImpressumBtn.addEventListener("click", goToStartScreen);

privacyBtn.addEventListener("click",           () => showScreen(privacyScreen));
impressumBtn.addEventListener("click",         () => showScreen(impressumScreen));
privacyFromHelpBtn.addEventListener("click",   () => showScreen(privacyScreen));
impressumFromHelpBtn.addEventListener("click", () => showScreen(impressumScreen));

usernameInput.addEventListener("input", () => {
  if (!dbAvailable) return;
  const c = sanitizeUsername(usernameInput.value);
  if (!c) { clearUsernameWarning(); lastCheckedUsername = ""; lastUsernameExists = false; clearTimeout(usernameCheckTimer); return; }
  clearTimeout(usernameCheckTimer);
  usernameCheckTimer = setTimeout(() => checkIfUsernameExists(c), USERNAME_CHECK_DELAY);
});

usernameInput.addEventListener("keydown", e => { if (e.key === "Enter") startGame(); });

showLeaderboardBtn.addEventListener("click",   openLeaderboardScreen);
miniInfo.addEventListener("click",             openLeaderboardScreen);
toggleLeaderboardBtn.addEventListener("click", async () => { leaderboardShowAll = !leaderboardShowAll; await loadLeaderboard(); });

changeUserBtn.addEventListener("click", () => {
  if (!dbAvailable) return;
  goToStartScreen(); usernameInput.value = username; clearUsernameWarning(); resetPerformanceMonitor();
});

window.addEventListener("keydown", e => {
  if (e.code === "Space") { e.preventDefault(); if (gameScreen.classList.contains("active")) flap(); }
  if (e.key  === "Escape" && (helpScreen.classList.contains("active") || settingsScreen.classList.contains("active") || privacyScreen.classList.contains("active") || impressumScreen.classList.contains("active"))) goToStartScreen();
});

canvas.addEventListener("mousedown",  () => { initAudioContext(); flap(); });
canvas.addEventListener("touchstart", e => { e.preventDefault(); initAudioContext(); flap(); }, { passive: false });

// ─── Canvas Context Lost ──────────────────────────────────────────────────────
canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); gameRunning = false; stopGameLoop(); }, false);
canvas.addEventListener("contextlost", e => { e.preventDefault(); gameRunning = false; stopGameLoop(); }, false);


async function initApp() {
  applySettingsToUI(); applyDrinkTexts(); resizeCanvas(); resetPerformanceMonitor();
  const ok = await checkDatabaseConnection();
  if (ok) await loadUnlockedSkins();
}

initApp();