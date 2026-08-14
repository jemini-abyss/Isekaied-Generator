"use strict";

/**
 * Ｉｓｅｋａｉｅｄ Ｇｅｎｅｒａｔｏｒ ―― To be is TOBE.
 * Cyber Fantasy Action Game
 * © 2026 Beggar Gentleman "To be is TOBE. w"
 */

// ==========================================================================
// 1. DOM要素 & 定数定義
// ==========================================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  score: document.getElementById("scoreValue"),
  highScore: document.getElementById("highScoreText"),
  combo: document.getElementById("comboValue"),
  feverFill: document.getElementById("feverFill"),
  lifeHearts: document.getElementById("lifeHearts"),
  sent: document.getElementById("sentValue"),
  dream: document.getElementById("dreamValue"),
  tickerContent: document.getElementById("tickerContent"),
  
  startScreen: document.getElementById("startScreen"),
  pauseScreen: document.getElementById("pauseScreen"),
  gameOverScreen: document.getElementById("gameOverScreen"),
  feverBanner: document.getElementById("feverBanner"),
  
  finalSentCount: document.getElementById("finalSentCount"),
  finalScore: document.getElementById("finalScore"),
  finalDream: document.getElementById("finalDream"),
  mvpCharacter: document.getElementById("mvpCharacter"),
  gameOverReview: document.getElementById("gameOverReview"),
  
  reincarnateCard: document.getElementById("reincarnateCard"),
  rcAvatar: document.getElementById("rcAvatar"),
  rcTitle: document.getElementById("rcTitle"),
  rcSkill: document.getElementById("rcSkill"),
  rcPoints: document.getElementById("rcPoints"),
  
  announcementToast: document.getElementById("announcementToast"),
  soundButton: document.getElementById("soundButton"),
  soundIcon: document.getElementById("soundIcon"),
  soundLabel: document.getElementById("soundLabel"),
  
  dexModal: document.getElementById("dexModal"),
  dexList: document.getElementById("dexList"),
  dexButton: document.getElementById("dexButton"),
  closeDexButton: document.getElementById("closeDexButton"),
  openDexFromGameOver: document.getElementById("openDexFromGameOver")
};

const WORLD = { width: 960, height: 640, groundY: 540 };
const keys = { left: false, right: false };

// ==========================================================================
// 2. スプライト画像 (イラスト) ロード
// ==========================================================================

const spriteSheet = new Image();
spriteSheet.src = "sprites.png";
let spritesLoaded = false;
spriteSheet.onload = () => {
  spritesLoaded = true;
};

// 1024x1024のシート内での各キャラの切り抜き座標 [sx, sy, sw, sh]
const SPRITE_MAP = {
  office:    { sx: 45,  sy: 28,  sw: 195, sh: 320, drawW: 68, drawH: 96 },
  student:   { sx: 310, sy: 28,  sw: 185, sh: 320, drawW: 66, drawH: 96 },
  black:     { sx: 530, sy: 32,  sw: 185, sh: 318, drawW: 68, drawH: 96 },
  dreamer:   { sx: 745, sy: 38,  sw: 235, sh: 315, drawW: 76, drawH: 96 },
  hero:      { sx: 335, sy: 350, sw: 325, sh: 360, drawW: 92, drawH: 98 },
  mechanic:  { sx: 690, sy: 365, sw: 260, sh: 345, drawW: 84, drawH: 98 },
  cat:       { sx: 75,  sy: 745, sw: 240, sh: 225, drawW: 72, drawH: 68 },
  bucket:    { sx: 415, sy: 755, sw: 195, sh: 220, drawW: 62, drawH: 68 },
  mod:       { sx: 705, sy: 715, sw: 245, sh: 260, drawW: 76, drawH: 78 }
};

// ==========================================================================
// 3. 異世界転生ジェネレーター データ辞書
// ==========================================================================

const REINCARNATION_PREFIX = [
  "神聖なる", "漆黒の", "社畜上がりの", "古の", "限界",
  "伝説の", "転生した", "客先常駐の", "超絶無敵の", "全角の"
];

const REINCARNATION_RACES = [
  "スライム", "エルフ", "魔導プリンター", "ゴブリン", "ドラゴン",
  "魔王", "しゃべる聖剣", "村人A", "ミミック", "自律型ルーター",
  "暗号通貨ウォレット", "大賢者", "ネトゲ廃人", "自動販売機"
];

const REINCARNATION_JOBS = [
  "勇者", "魔導士", "経理担当", "社内ヘルプデスク", "ダンジョン総務",
  "魔法インフラエンジニア", "ポーション営業", "魔王秘書", "古のネット仙人",
  "聖騎士", "乞食紳士", "システムアーキテクト"
];

const UNIQUE_SKILLS = [
  "EXCEL魔導極大消滅呪文", "無限再起動 (Infinite Reboot)", "会議強制キャンセル",
  "Wi-Fi探知 EX", "全角英文字変換の極意", "残業代等価交換", "プリンター除霊の儀",
  "神速トラブルシューティング", "MetaMaskバケツ召喚", "リモートデスクトップ憑依",
  "To be is TOBE. (飛翔覚醒)", "Reddit Mod検閲回避"
];

const GAME_REVIEWS = [
  "「魔王軍より『最近の勇者、妙にITスキルが高くて困る』と抗議が届きました」",
  "「異世界転生ギルドの受け入れキャパが限界突破しました」",
  "「トラック君の走行距離が地球3周分に到達しました」",
  "「MetaMaskのバケツは空っぽですが、異世界には夢が満ちています」",
  "「日本の残業時間がほんの少しだけ減少しました」"
];

// 落下キャラクター種別
const SPAWN_TYPES = [
  { id: "office", emoji: "🧑‍💼", name: "会社員", points: 100, speed: 1.0, weight: 28, drawW: 68, drawH: 96 },
  { id: "student", emoji: "🧑‍🎓", name: "学生", points: 120, speed: 1.05, weight: 22, drawW: 66, drawH: 96 },
  { id: "black", emoji: "🧑‍💻", name: "社畜エンジニア", points: 200, speed: 0.95, weight: 16, glow: "#00f6ff", drawW: 68, drawH: 96 },
  { id: "dreamer", emoji: "🙋", name: "異世界転生志望者", points: 300, speed: 1.2, weight: 12, glow: "#ff2d87", drawW: 76, drawH: 96 },
  { id: "hero", emoji: "🦸", name: "伝説の勇者候補", points: 500, speed: 1.35, weight: 8, glow: "#ffd23f", minLevel: 2, drawW: 92, drawH: 98 },
  { id: "mechanic", emoji: "🧑‍🔧", name: "トラック整備士", points: 150, speed: 0.9, weight: 7, isMechanic: true, glow: "#38ef7d", drawW: 84, drawH: 98 },
  { id: "bucket", emoji: "🪣", name: "お布施バケツ (MetaMask)", points: 250, speed: 1.1, weight: 6, isBucket: true, glow: "#ffd23f", drawW: 62, drawH: 68 },
  { id: "mod", emoji: "🔨", name: "Reddit Modの焚書ハンマー", points: -300, speed: 1.3, weight: 6, isMod: true, glow: "#ff3366", minLevel: 2, drawW: 76, drawH: 78 },
  { id: "cat", emoji: "🐈", name: "路地裏の猫ちゃん", points: -500, speed: 1.15, weight: 8, isCat: true, glow: "#ffa07a", drawW: 72, drawH: 68 }
];

// ==========================================================================
// 4. ゲーム状態 (State)
// ==========================================================================

let state = "title";
let score = 0;
let highScore = parseInt(localStorage.getItem("isekaied_high_score") || "0", 10);
let combo = 0;
let maxCombo = 0;
let life = 3;
let sentCount = 0;
let dreamEth = 0;
let elapsed = 0;
let spawnTimer = 0.5;
let lastTime = performance.now();
let shake = 0;
let speedBoostTimer = 0;
let isFever = false;
let feverTimer = 0;
let soundEnabled = true; // デフォルトでサウンドON！
let audioCtx = null;
let toastTimeout = null;
let announceTimeout = null;
let capturedDex = JSON.parse(localStorage.getItem("isekaied_dex_log") || "[]");
let mvpEntry = null;

// プレイヤー（トラック君）
const truck = {
  x: (WORLD.width - 150) / 2,
  y: 456,
  width: 150,
  height: 80,
  baseSpeed: 480,
  wheelAngle: 0,
  trail: []
};

// エンティティ
let fallingObjects = [];
let particles = [];
let magicCircles = [];
let floatingTexts = [];
let beams = [];
let stars = initStars();
let cityBuildings = initCity();

function initStars() {
  return Array.from({ length: 65 }, () => ({
    x: Math.random() * WORLD.width,
    y: Math.random() * 380,
    size: 1 + Math.random() * 2.5,
    twinkleSpeed: 1 + Math.random() * 3,
    color: Math.random() > 0.4 ? "#fff" : (Math.random() > 0.5 ? "#00f6ff" : "#ffd23f")
  }));
}

function initCity() {
  const list = [];
  let x = 0;
  while (x < WORLD.width + 100) {
    const w = 40 + Math.random() * 50;
    const h = 80 + Math.random() * 140;
    const color = Math.random() > 0.5 ? "#160b33" : "#200f47";
    list.push({ x, w, h, color });
    x += w + 6;
  }
  return list;
}

// ==========================================================================
// 5. 本格オーディオエンジン (Web Audio API 合成音源 & BGM)
// ==========================================================================

function ensureAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playSynthTone(freq, duration, type = "sine", gainVal = 0.08, delay = 0, pitchEnd = null) {
  if (!soundEnabled) return;
  ensureAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const start = audioCtx.currentTime + delay;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (pitchEnd !== null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, pitchEnd), start + duration);
  }

  gain.gain.setValueAtTime(gainVal, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(start);
  osc.stop(start + duration);
}

// レトロチップチューンBGMシーケンサー (メロディ + ベース + アルペジオ + ドラム)
let bgmStep = 0;
let bgmTimer = 0;

// キャッチーで疾走感のある異世界転生メロディ
const BGM_MELODY = [
  // bar 1: C - E - G - B
  523.25, 659.25, 783.99, 987.77,
  // bar 2: A - G - E - D
  880.00, 783.99, 659.25, 587.33,
  // bar 3: F - A - C - E
  698.46, 880.00, 1046.50, 1318.51,
  // bar 4: G - B - D - G
  783.99, 987.77, 1174.66, 1567.98
];

const BGM_BASS = [
  130.81, 130.81, 164.81, 196.00,
  220.00, 220.00, 196.00, 164.81,
  174.61, 174.61, 220.00, 261.63,
  196.00, 196.00, 246.94, 293.66
];

function updateBgm(dt) {
  if (!soundEnabled || state !== "playing") return;
  bgmTimer += dt;
  const interval = isFever ? 0.11 : 0.16; // テンポ
  if (bgmTimer >= interval) {
    bgmTimer -= interval;

    const step = bgmStep % BGM_MELODY.length;
    const melNote = BGM_MELODY[step];
    const bassNote = BGM_BASS[step];

    // メロディ (Square / Triangle)
    const melGain = isFever ? 0.045 : 0.035;
    playSynthTone(melNote * (isFever ? 1.5 : 1), interval * 0.9, isFever ? "sawtooth" : "square", melGain);

    // ベース (Triangle)
    playSynthTone(bassNote, interval * 0.85, "triangle", 0.05);

    // ビート・スネア (ノイズ風)
    if (bgmStep % 2 === 1) {
      playSynthTone(280, 0.05, "sawtooth", 0.02, 0, 40);
    } else {
      playSynthTone(120, 0.04, "square", 0.03, 0, 30); // バスドラム
    }

    bgmStep++;
  }
}

function playSE(type) {
  if (!soundEnabled) return;
  ensureAudio();

  switch (type) {
    case "start":
      playSynthTone(392, 0.1, "square", 0.08, 0);
      playSynthTone(523, 0.1, "square", 0.08, 0.08);
      playSynthTone(659, 0.1, "square", 0.08, 0.16);
      playSynthTone(784, 0.35, "square", 0.1, 0.24);
      break;
    case "catch":
      // 異世界転生キラキラファンファーレ
      playSynthTone(523, 0.08, "sine", 0.09, 0);
      playSynthTone(659, 0.08, "sine", 0.09, 0.05);
      playSynthTone(784, 0.1, "sine", 0.1, 0.1);
      playSynthTone(1046, 0.2, "triangle", 0.08, 0.15);
      playSynthTone(1318, 0.35, "sine", 0.06, 0.2);
      break;
    case "fever":
      // 覚醒ファンファーレ
      playSynthTone(440, 0.08, "sawtooth", 0.09, 0);
      playSynthTone(554, 0.08, "sawtooth", 0.09, 0.06);
      playSynthTone(659, 0.08, "sawtooth", 0.09, 0.12);
      playSynthTone(880, 0.4, "sawtooth", 0.12, 0.18);
      break;
    case "turbo":
      // エンジン加速音
      playSynthTone(180, 0.4, "sawtooth", 0.08, 0, 520);
      break;
    case "bucket":
      // コインチャリン音
      playSynthTone(987, 0.1, "sine", 0.1, 0);
      playSynthTone(1318, 0.25, "sine", 0.1, 0.07);
      break;
    case "mod_hit":
      // 焚書激突音
      playSynthTone(220, 0.25, "sawtooth", 0.1, 0, 50);
      break;
    case "miss":
      // 残業継続（ミス）音
      playSynthTone(330, 0.15, "sawtooth", 0.07, 0);
      playSynthTone(220, 0.3, "sawtooth", 0.08, 0.1, 80);
      break;
    case "cat_ok":
      // 猫ちゃん安全着地「ニャーオ」
      playSynthTone(659, 0.15, "sine", 0.07, 0, 784);
      playSynthTone(784, 0.25, "sine", 0.06, 0.1, 587);
      break;
    case "cat_bad":
      // 猫を轢いてしまった悲鳴
      playSynthTone(500, 0.2, "sawtooth", 0.08, 0, 300);
      break;
    case "gameover":
      // ゲームオーバー哀愁メロディ
      playSynthTone(523, 0.2, "sawtooth", 0.08, 0);
      playSynthTone(493, 0.2, "sawtooth", 0.08, 0.2);
      playSynthTone(440, 0.2, "sawtooth", 0.08, 0.4);
      playSynthTone(349, 0.5, "sawtooth", 0.09, 0.6, 200);
      break;
  }
}

// ==========================================================================
// 6. ゲームロジック
// ==========================================================================

function currentLevel() {
  return 1 + Math.floor(elapsed / 20);
}

function speedScale() {
  const base = 1 + Math.min(2.0, elapsed / 50);
  return isFever ? base * 1.3 : base;
}

function comboMultiplier() {
  if (combo >= 20) return 5;
  if (combo >= 15) return 4;
  if (combo >= 10) return 3;
  if (combo >= 5) return 2;
  return 1;
}

function resetGame() {
  score = 0;
  combo = 0;
  maxCombo = 0;
  life = 3;
  sentCount = 0;
  dreamEth = 0;
  elapsed = 0;
  spawnTimer = 0.5;
  speedBoostTimer = 0;
  isFever = false;
  feverTimer = 0;
  shake = 0;
  
  truck.x = (WORLD.width - truck.width) / 2;
  truck.trail = [];
  fallingObjects = [];
  particles = [];
  magicCircles = [];
  floatingTexts = [];
  beams = [];
  
  updateHUD();
  ui.highScore.textContent = `HI: ${String(highScore).padStart(6, "0")}`;
}

function startGame() {
  ensureAudio();
  resetGame();
  state = "playing";
  hideAllOverlays();
  lastTime = performance.now();
  playSE("start");
  updateTicker("🚚 トラック君発進！ 全世界を異世界へ送り出す旅が始まった！");
}

function togglePause() {
  if (state === "playing") {
    state = "paused";
    ui.pauseScreen.classList.add("is-visible");
  } else if (state === "paused") {
    state = "playing";
    ui.pauseScreen.classList.remove("is-visible");
    lastTime = performance.now();
  }
}

function endGame() {
  state = "gameover";
  keys.left = false;
  keys.right = false;
  isFever = false;
  ui.feverBanner.classList.remove("is-active");

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("isekaied_high_score", String(highScore));
  }

  ui.finalSentCount.textContent = `${sentCount} 人`;
  ui.finalScore.textContent = String(score).padStart(6, "0");
  ui.finalDream.textContent = `${dreamEth} ETH (夢無限)`;
  ui.mvpCharacter.textContent = mvpEntry ? `${mvpEntry.title} (${mvpEntry.skill})` : "なし";
  ui.gameOverReview.textContent = GAME_REVIEWS[Math.floor(Math.random() * GAME_REVIEWS.length)];
  
  ui.gameOverScreen.classList.add("is-visible");
  playSE("gameover");
}

function hideAllOverlays() {
  ui.startScreen.classList.remove("is-visible");
  ui.pauseScreen.classList.remove("is-visible");
  ui.gameOverScreen.classList.remove("is-visible");
}

function spawnItem() {
  const level = currentLevel();
  const pool = SPAWN_TYPES.filter(t => !t.minLevel || level >= t.minLevel);
  const totalWeight = pool.reduce((s, t) => s + t.weight, 0);
  let roll = Math.random() * totalWeight;

  let chosen = pool[0];
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) {
      chosen = item;
      break;
    }
  }

  const margin = 60;
  fallingObjects.push({
    type: chosen,
    x: margin + Math.random() * (WORLD.width - margin * 2),
    y: -80,
    radius: chosen.isCat ? 24 : (chosen.isBucket ? 22 : 30),
    speed: (90 + Math.random() * 35) * chosen.speed,
    wobble: Math.random() * Math.PI * 2,
    rotation: (Math.random() - 0.5) * 0.2,
    rotSpeed: (Math.random() - 0.5) * 1.5
  });
}

function scheduleNextSpawn() {
  const base = Math.max(0.35, 1.1 - elapsed * 0.01);
  spawnTimer = base * (0.7 + Math.random() * 0.5);
  
  if (currentLevel() >= 2 && Math.random() < 0.25) {
    setTimeout(() => {
      if (state === "playing") spawnItem();
    }, 180);
  }
}

function checkCollision(item) {
  const truckLeft = truck.x;
  const truckRight = truck.x + truck.width;
  const truckTop = truck.y;
  const truckBottom = truck.y + truck.height;

  return (
    item.x + item.radius > truckLeft &&
    item.x - item.radius < truckRight &&
    item.y + item.radius > truckTop &&
    item.y - item.radius < truckBottom
  );
}

function catchItem(item) {
  // 猫ちゃん
  if (item.type.isCat) {
    score = Math.max(0, score - 500);
    combo = 0;
    shake = 10;
    showAnnouncement("❌ 猫は異世界素材ではありません！ −500点");
    playSE("cat_bad");
    createShockwave(item.x, item.y, "#ff3366");
    updateHUD();
    return;
  }

  // Reddit Modの焚書ハンマー
  if (item.type.isMod) {
    score = Math.max(0, score - 300);
    combo = 0;
    shake = 12;
    showAnnouncement("🔥 [REMOVED] モデレーターに焚書された！ −300点");
    playSE("mod_hit");
    createShockwave(item.x, item.y, "#ff3366");
    updateHUD();
    return;
  }

  // MetaMaskお布施バケツ
  if (item.type.isBucket) {
    dreamEth += 1;
    const gained = 500 * comboMultiplier();
    score += gained;
    createBurst(item.x, item.y, "#ffd23f", 28);
    createFloatingText(item.x, item.y - 20, `お布施受領! +${gained} (夢+1)`, "#ffd23f");
    showAnnouncement("🪣 MetaMaskに夢が注がれました！ (中身: 0 ETH / 夢100%)");
    playSE("bucket");
    updateHUD();
    return;
  }

  // 通常の人間（異世界転生）
  combo++;
  if (combo > maxCombo) maxCombo = combo;
  sentCount++;

  const gained = item.type.points * comboMultiplier() * (isFever ? 2 : 1);
  score += gained;

  // 整備士ボーナス
  if (item.type.isMechanic) {
    speedBoostTimer = 7;
    showAnnouncement("⚡ ＴＵＲＢＯ ＴＲＵＣＫ！ トラック整備完了 (7秒加速)");
    playSE("turbo");
  }

  // 異世界エフェクト
  createIsekaiBeam(item.x, item.y);
  createMagicCircle(item.x, WORLD.groundY - 10);
  createBurst(item.x, item.y, item.type.glow || "#00f6ff", 35);
  createFloatingText(item.x, item.y - 30, `+${gained}`, isFever ? "#ff2d87" : "#ffd23f");

  // フィーバー
  if (combo >= 10 && !isFever) {
    activateFever();
  }

  generateReincarnation(item.type);
  playSE("catch");
  updateHUD();
}

function missItem(item) {
  if (item.type.isCat) {
    score += 150;
    createBurst(item.x, WORLD.groundY - 10, "#38ef7d", 12);
    createFloatingText(item.x, WORLD.groundY - 30, "CAT SAFE! +150", "#38ef7d");
    showAnnouncement("🐾 猫ちゃんが無事着地しました (徳 +100)");
    playSE("cat_ok");
    updateHUD();
    return;
  }

  if (item.type.isMod || item.type.isBucket) {
    createBurst(item.x, WORLD.groundY - 10, "#6c5c93", 10);
    return;
  }

  life--;
  combo = 0;
  if (isFever) endFever();
  shake = 8;
  createBurst(item.x, WORLD.groundY - 10, "#ff3366", 18);
  createFloatingText(item.x, WORLD.groundY - 30, "残業継続 (現世残留)", "#ff3366");
  playSE("miss");
  updateHUD();

  if (life <= 0) {
    endGame();
  }
}

function activateFever() {
  isFever = true;
  feverTimer = 8;
  ui.feverBanner.classList.add("is-active");
  showAnnouncement("✨ Ｔｏ　ｂｅ　ｉｓ　ＴＯＢＥ． ＦＥＶＥＲ 突入！！");
  playSE("fever");
}

function endFever() {
  isFever = false;
  feverTimer = 0;
  ui.feverBanner.classList.remove("is-active");
}

function generateReincarnation(type) {
  const prefix = REINCARNATION_PREFIX[Math.floor(Math.random() * REINCARNATION_PREFIX.length)];
  const race = REINCARNATION_RACES[Math.floor(Math.random() * REINCARNATION_RACES.length)];
  const job = REINCARNATION_JOBS[Math.floor(Math.random() * REINCARNATION_JOBS.length)];
  const skill = UNIQUE_SKILLS[Math.floor(Math.random() * UNIQUE_SKILLS.length)];
  const lvl = Math.floor(1 + Math.random() * 99);

  const fullTitle = `${prefix}${race}の${job}`;
  const skillText = `${skill} Lv.${lvl}`;

  const entry = {
    id: type.id,
    emoji: type.emoji,
    title: fullTitle,
    skill: skillText,
    timestamp: Date.now()
  };

  mvpEntry = entry;
  capturedDex.unshift(entry);
  if (capturedDex.length > 50) capturedDex.pop();
  localStorage.setItem("isekaied_dex_log", JSON.stringify(capturedDex));

  ui.rcAvatar.textContent = type.emoji;
  ui.rcTitle.textContent = fullTitle;
  ui.rcSkill.textContent = skillText;
  ui.rcPoints.textContent = `+${type.points * comboMultiplier()}`;

  ui.reincarnateCard.classList.remove("is-show");
  void ui.reincarnateCard.offsetWidth;
  ui.reincarnateCard.classList.add("is-show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    ui.reincarnateCard.classList.remove("is-show");
  }, 1800);

  updateTicker(`✦ 速報: [${type.name}] が 【${fullTitle}】(スキル: ${skillText}) に転生完了！`);
}

function showAnnouncement(msg) {
  ui.announcementToast.textContent = msg;
  ui.announcementToast.classList.remove("is-show");
  void ui.announcementToast.offsetWidth;
  ui.announcementToast.classList.add("is-show");

  clearTimeout(announceTimeout);
  announceTimeout = setTimeout(() => {
    ui.announcementToast.classList.remove("is-show");
  }, 1500);
}

function updateTicker(msg) {
  ui.tickerContent.textContent = msg;
}

// ==========================================================================
// 7. VFX & パーティクル
// ==========================================================================

function createBurst(x, y, color, count = 20) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 220;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4 + Math.random() * 0.5,
      maxLife: 0.9,
      size: 2 + Math.random() * 5,
      color,
      shape: i % 3 === 0 ? "star" : "circle"
    });
  }
}

function createShockwave(x, y, color) {
  particles.push({
    x, y,
    vx: 0, vy: 0,
    life: 0.4,
    maxLife: 0.4,
    size: 15,
    maxSize: 80,
    color,
    shape: "ring"
  });
}

function createIsekaiBeam(x, y) {
  beams.push({
    x,
    topY: 0,
    bottomY: y,
    width: 35 + Math.random() * 25,
    life: 0.35,
    maxLife: 0.35,
    color: isFever ? "#ff2d87" : "#00f6ff"
  });
}

function createMagicCircle(x, y) {
  magicCircles.push({
    x, y,
    radius: 48,
    rotation: 0,
    rotSpeed: 3.5,
    life: 0.6,
    maxLife: 0.6,
    color: isFever ? "#ffd23f" : "#00f6ff"
  });
}

function createFloatingText(x, y, text, color) {
  floatingTexts.push({
    x, y,
    text,
    color,
    life: 0.85,
    maxLife: 0.85
  });
}

// ==========================================================================
// 8. アップデート (毎フレーム)
// ==========================================================================

function update(dt) {
  if (state !== "playing") return;

  elapsed += dt;
  spawnTimer -= dt;
  speedBoostTimer = Math.max(0, speedBoostTimer - dt);
  shake = Math.max(0, shake - dt * 20);

  if (isFever) {
    feverTimer -= dt;
    if (feverTimer <= 0) endFever();
  }

  if (spawnTimer <= 0) {
    spawnItem();
    scheduleNextSpawn();
  }

  let dir = 0;
  if (keys.left) dir -= 1;
  if (keys.right) dir += 1;

  const currentSpeed = truck.baseSpeed * (speedBoostTimer > 0 ? 1.5 : 1) * (isFever ? 1.3 : 1);
  truck.x = Math.max(10, Math.min(WORLD.width - truck.width - 10, truck.x + dir * currentSpeed * dt));

  if (dir !== 0) {
    truck.wheelAngle += dir * 18 * dt;
    if (Math.random() < 0.45) {
      particles.push({
        x: dir > 0 ? truck.x + 20 : truck.x + truck.width - 20,
        y: truck.y + truck.height - 4,
        vx: -dir * (30 + Math.random() * 40),
        vy: -10 - Math.random() * 20,
        life: 0.3,
        maxLife: 0.3,
        size: 3 + Math.random() * 4,
        color: "rgba(255, 255, 255, 0.4)",
        shape: "circle"
      });
    }
  }

  if (speedBoostTimer > 0 || isFever) {
    truck.trail.push({ x: truck.x, y: truck.y, alpha: 0.5 });
    if (truck.trail.length > 5) truck.trail.shift();
  } else {
    truck.trail = [];
  }

  const speed = speedScale();
  for (let i = fallingObjects.length - 1; i >= 0; i--) {
    const item = fallingObjects[i];
    item.y += item.speed * speed * dt;
    item.wobble += dt * 3.5;
    item.rotation += item.rotSpeed * dt;

    if (checkCollision(item)) {
      catchItem(item);
      fallingObjects.splice(i, 1);
    } else if (item.y + item.radius >= WORLD.groundY) {
      missItem(item);
      fallingObjects.splice(i, 1);
    }
  }

  for (let i = beams.length - 1; i >= 0; i--) {
    beams[i].life -= dt;
    if (beams[i].life <= 0) beams.splice(i, 1);
  }

  for (let i = magicCircles.length - 1; i >= 0; i--) {
    magicCircles[i].life -= dt;
    magicCircles[i].rotation += magicCircles[i].rotSpeed * dt;
    if (magicCircles[i].life <= 0) magicCircles.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.shape !== "ring") p.vy += 120 * dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    floatingTexts[i].life -= dt;
    floatingTexts[i].y -= 45 * dt;
    if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
  }

  updateBgm(dt);
}

function updateHUD() {
  ui.score.textContent = String(score).padStart(6, "0");
  ui.combo.textContent = `× ${combo}`;
  ui.sent.innerHTML = `${sentCount}<small>人</small>`;
  ui.dream.innerHTML = `${dreamEth}<small>ETH</small>`;

  const pct = isFever ? (feverTimer / 8) * 100 : Math.min(100, (combo / 10) * 100);
  ui.feverFill.style.width = `${pct}%`;

  const hearts = ui.lifeHearts.querySelectorAll(".heart");
  hearts.forEach((h, idx) => {
    if (idx < life) {
      h.classList.add("is-active");
    } else {
      h.classList.remove("is-active");
    }
  });
}

// ==========================================================================
// 9. レンダリング (Canvas描画 & スプライトイラスト)
// ==========================================================================

function drawBackground(time) {
  const level = currentLevel();

  const sky = ctx.createLinearGradient(0, 0, 0, WORLD.groundY);
  if (isFever) {
    sky.addColorStop(0, "#3d084e");
    sky.addColorStop(0.5, "#7b0066");
    sky.addColorStop(1, "#ff3366");
  } else {
    sky.addColorStop(0, "#080314");
    sky.addColorStop(0.5, level >= 3 ? "#1e0b3d" : "#13082a");
    sky.addColorStop(1, level >= 3 ? "#441a78" : "#2f1155");
  }
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  stars.forEach((star, idx) => {
    const alpha = 0.3 + Math.sin(time * 0.003 * star.twinkleSpeed + idx) * 0.35;
    ctx.fillStyle = star.color;
    ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1;

  // 巨大異世界ポータル
  ctx.save();
  ctx.translate(WORLD.width * 0.78, 120);
  ctx.rotate(time * 0.0005);
  const portalGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 90);
  portalGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
  portalGrad.addColorStop(0.3, isFever ? "rgba(255, 45, 135, 0.7)" : "rgba(0, 246, 255, 0.7)");
  portalGrad.addColorStop(0.7, "rgba(157, 78, 221, 0.35)");
  portalGrad.addColorStop(1, "transparent");
  ctx.fillStyle = portalGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 遠景ビル群
  cityBuildings.forEach((b, idx) => {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, WORLD.groundY - b.h, b.w, b.h);

    ctx.fillStyle = (idx % 2 === 0) ? "#ffd23f" : "#00f6ff";
    ctx.globalAlpha = 0.4;
    for (let wy = WORLD.groundY - b.h + 10; wy < WORLD.groundY - 10; wy += 16) {
      if ((idx + wy) % 5 === 0) continue;
      ctx.fillRect(b.x + 6, wy, 4, 6);
      ctx.fillRect(b.x + b.w - 10, wy, 4, 6);
    }
    ctx.globalAlpha = 1;
  });

  // 地面 & アスファルト
  ctx.fillStyle = "#0c051a";
  ctx.fillRect(0, WORLD.groundY, WORLD.width, WORLD.height - WORLD.groundY);

  const roadGlow = ctx.createLinearGradient(0, WORLD.groundY, 0, WORLD.groundY + 8);
  roadGlow.addColorStop(0, isFever ? "#ff2d87" : "#00f6ff");
  roadGlow.addColorStop(1, "transparent");
  ctx.fillStyle = roadGlow;
  ctx.fillRect(0, WORLD.groundY, WORLD.width, 6);

  ctx.fillStyle = "rgba(255, 210, 63, 0.4)";
  for (let x = 10; x < WORLD.width; x += 60) {
    ctx.fillRect(x, WORLD.groundY + 45, 30, 4);
  }
}

function drawTruck() {
  ctx.save();

  truck.trail.forEach((t, i) => {
    ctx.globalAlpha = (i + 1) * 0.1;
    ctx.fillStyle = isFever ? "#ff2d87" : "#00f6ff";
    ctx.fillRect(t.x, t.y, truck.width, truck.height);
  });
  ctx.globalAlpha = 1;

  ctx.translate(Math.round(truck.x), truck.y);

  // ヘッドライト光線
  const lightGrad = ctx.createRadialGradient(truck.width + 10, 45, 5, truck.width + 140, 45, 180);
  lightGrad.addColorStop(0, "rgba(255, 240, 150, 0.6)");
  lightGrad.addColorStop(0.5, "rgba(255, 240, 150, 0.2)");
  lightGrad.addColorStop(1, "transparent");
  ctx.fillStyle = lightGrad;
  ctx.beginPath();
  ctx.moveTo(truck.width - 5, 25);
  ctx.lineTo(truck.width + 200, 0);
  ctx.lineTo(truck.width + 200, 95);
  ctx.lineTo(truck.width - 5, 65);
  ctx.closePath();
  ctx.fill();

  // 荷台
  ctx.fillStyle = "#1e103a";
  ctx.fillRect(4, 8, 92, 54);
  ctx.strokeStyle = isFever ? "#ff2d87" : "#9d4edd";
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 8, 92, 54);

  ctx.fillStyle = isFever ? "#ffd23f" : "#00f6ff";
  ctx.font = "900 12px 'Chivo Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("Ｉｓｅｋａｉｅｄ", 50, 32);
  ctx.font = "700 9px 'Chivo Mono', monospace";
  ctx.fillStyle = "#fff";
  ctx.fillText("EXPRESS 2026", 50, 48);

  // 運転席キャビン
  ctx.fillStyle = "#ffb703";
  ctx.beginPath();
  ctx.roundRect(96, 16, 50, 46, [4, 14, 0, 0]);
  ctx.fill();

  // フロントガラス
  ctx.fillStyle = "#00f6ff";
  ctx.beginPath();
  ctx.roundRect(108, 20, 32, 22, [2, 10, 0, 0]);
  ctx.fill();

  // 運転手のシルエット
  ctx.fillStyle = "#12082b";
  ctx.beginPath();
  ctx.arc(122, 32, 6, 0, Math.PI * 2);
  ctx.fill();

  // ヘッドライト & テールランプ
  ctx.fillStyle = "#fff";
  ctx.fillRect(142, 42, 7, 10);
  ctx.fillStyle = "#ff2d87";
  ctx.fillRect(0, 42, 5, 10);

  // バンパー
  ctx.fillStyle = "#4a4e69";
  ctx.fillRect(92, 58, 56, 8);

  // タイヤ
  drawWheel(28, 62);
  drawWheel(122, 62);

  ctx.restore();
}

function drawWheel(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(truck.wheelAngle);

  ctx.fillStyle = "#110b22";
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4a4e69";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "#00f6ff";
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-12, 0); ctx.lineTo(12, 0);
  ctx.moveTo(0, -12); ctx.lineTo(0, 12);
  ctx.stroke();

  ctx.restore();
}

function drawFallingObjects() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  fallingObjects.forEach(item => {
    ctx.save();
    ctx.translate(item.x, item.y + Math.sin(item.wobble) * 4);
    ctx.rotate(item.rotation);

    // オーラグロー
    if (item.type.glow) {
      ctx.shadowColor = item.type.glow;
      ctx.shadowBlur = 18;
    }

    // パラシュート (人間系のみ)
    if (!item.type.isCat && !item.type.isBucket && !item.type.isMod) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.arc(0, -36, 24, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-20, -36); ctx.lineTo(0, -14);
      ctx.moveTo(20, -36); ctx.lineTo(0, -14);
      ctx.stroke();
    }

    // イラストスプライト描画 (読み込み完了していればスプライト、未完なら絵文字フォールバック)
    const sp = SPRITE_MAP[item.type.id];
    if (spritesLoaded && sp) {
      ctx.drawImage(
        spriteSheet,
        sp.sx, sp.sy, sp.sw, sp.sh,
        -sp.drawW / 2, -sp.drawH / 2, sp.drawW, sp.drawH
      );
    } else {
      ctx.font = `${item.radius * 1.8}px "Segoe UI Emoji", sans-serif`;
      ctx.fillText(item.type.emoji, 0, 0);
    }

    ctx.restore();
  });
}

function drawBeams() {
  beams.forEach(b => {
    const alpha = b.life / b.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    const beamGrad = ctx.createLinearGradient(b.x - b.width / 2, 0, b.x + b.width / 2, 0);
    beamGrad.addColorStop(0, "transparent");
    beamGrad.addColorStop(0.5, "#fff");
    beamGrad.addColorStop(1, "transparent");
    ctx.fillStyle = beamGrad;
    ctx.fillRect(b.x - b.width / 2, b.topY, b.width, b.bottomY - b.topY);

    ctx.fillStyle = b.color;
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillRect(b.x - b.width, b.topY, b.width * 2, b.bottomY - b.topY);
    ctx.restore();
  });
}

function drawMagicCircles() {
  magicCircles.forEach(mc => {
    const alpha = mc.life / mc.maxLife;
    ctx.save();
    ctx.translate(mc.x, mc.y);
    ctx.scale(1, 0.35);
    ctx.rotate(mc.rotation);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = mc.color;
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    ctx.arc(0, 0, mc.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const x = Math.cos(a) * mc.radius * 0.8;
      const y = Math.sin(a) * mc.radius * 0.8;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  });
}

function drawParticles() {
  particles.forEach(p => {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;

    if (p.shape === "ring") {
      const radius = p.size + (1 - alpha) * (p.maxSize - p.size);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3 * alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.shape === "star") {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size, p.y - 1, p.size * 2, 2);
      ctx.fillRect(p.x - 1, p.y - p.size, 2, p.size * 2);
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawFloatingTexts() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 17px 'Chivo Mono', 'Zen Kaku Gothic New', monospace";

  floatingTexts.forEach(ft => {
    const alpha = ft.life / ft.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#090314";
    ctx.fillText(ft.text, ft.x + 2, ft.y + 2);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });
}

function draw(time) {
  ctx.save();
  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  }

  drawBackground(time);
  drawMagicCircles();
  drawBeams();
  drawFallingObjects();
  drawTruck();
  drawParticles();
  drawFloatingTexts();

  ctx.restore();
}

function gameLoop(time) {
  const dt = Math.min(0.033, (time - lastTime) / 1000 || 0);
  lastTime = time;

  update(dt);
  draw(time);

  requestAnimationFrame(gameLoop);
}

// ==========================================================================
// 10. イベントリスナー & 操作バインディング
// ==========================================================================

function handleKey(key, pressed) {
  if (key === "ArrowLeft" || key.toLowerCase() === "a") keys.left = pressed;
  if (key === "ArrowRight" || key.toLowerCase() === "d") keys.right = pressed;
}

window.addEventListener("keydown", e => {
  ensureAudio();
  if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
  if (e.repeat && [" ", "p", "P", "Escape"].includes(e.key)) return;

  handleKey(e.key, true);

  if (e.key === " ") {
    if (state === "title" || state === "gameover") startGame();
    else if (state === "paused") togglePause();
  }
  if ((e.key.toLowerCase() === "p" || e.key === "Escape") && (state === "playing" || state === "paused")) {
    togglePause();
  }
});

window.addEventListener("keyup", e => handleKey(e.key, false));
window.addEventListener("blur", () => {
  keys.left = false;
  keys.right = false;
  if (state === "playing") togglePause();
});

// モバイルタッチボタンバインド
function bindTouch(btn, dir) {
  const start = e => {
    e.preventDefault();
    ensureAudio();
    keys[dir] = true;
    btn.classList.add("is-pressed");
    if (btn.setPointerCapture && e.pointerId !== undefined) btn.setPointerCapture(e.pointerId);
  };
  const end = e => {
    e.preventDefault();
    keys[dir] = false;
    btn.classList.remove("is-pressed");
  };
  btn.addEventListener("pointerdown", start);
  btn.addEventListener("pointerup", end);
  btn.addEventListener("pointercancel", end);
  btn.addEventListener("lostpointercapture", end);
}

bindTouch(document.getElementById("leftButton"), "left");
bindTouch(document.getElementById("rightButton"), "right");

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("retryButton").addEventListener("click", startGame);
document.getElementById("resumeButton").addEventListener("click", togglePause);

// サウンドトグル
ui.soundButton.addEventListener("click", () => {
  ensureAudio();
  soundEnabled = !soundEnabled;
  ui.soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
  ui.soundLabel.textContent = soundEnabled ? "ＳＯＵＮＤ　ＯＮ" : "ＳＯＵＮＤ　ＯＦＦ";
  ui.soundButton.setAttribute("aria-pressed", String(soundEnabled));
  if (soundEnabled) {
    playSynthTone(660, 0.15, "sine", 0.08);
  }
});

// 画面全体をクリックしたときにもオーディオコンテキストをアンロック
window.addEventListener("click", () => {
  ensureAudio();
}, { once: true });

// 転生図鑑（DEX）モーダル表示
function renderDex() {
  ui.dexList.innerHTML = "";
  if (capturedDex.length === 0) {
    ui.dexList.innerHTML = `
      <div class="dex-item-card is-empty">
        <span class="dex-avatar">❓</span>
        <div class="dex-info">
          <strong>まだ転生者がいません</strong>
          <small>トラック君で転生させよう！</small>
        </div>
      </div>
    `;
    return;
  }

  capturedDex.forEach(entry => {
    const card = document.createElement("div");
    card.className = "dex-item-card";
    card.innerHTML = `
      <span class="dex-avatar">${entry.emoji}</span>
      <div class="dex-info">
        <strong>${entry.title}</strong>
        <small>${entry.skill}</small>
      </div>
    `;
    ui.dexList.appendChild(card);
  });
}

function openDex() {
  renderDex();
  ui.dexModal.classList.add("is-visible");
}

function closeDex() {
  ui.dexModal.classList.remove("is-visible");
}

ui.dexButton.addEventListener("click", openDex);
ui.closeDexButton.addEventListener("click", closeDex);
ui.openDexFromGameOver.addEventListener("click", openDex);
ui.dexModal.addEventListener("click", e => {
  if (e.target === ui.dexModal) closeDex();
});

// 結果共有 (𝕏 / Twitter Intent 投稿)
document.getElementById("shareButton").addEventListener("click", () => {
  const shareText = `【Ｉｓｅｋａｉｅｄ Ｇｅｎｅｒａｔｏｒ】\n` +
    `トラック君で ${sentCount} 人を異世界転生させました！\n` +
    `スコア: ${score} pts / お布施バケツ: ${dreamEth} ETH (夢無限)\n` +
    (mvpEntry ? `本日のMVP: ${mvpEntry.title} (${mvpEntry.skill})\n` : "") +
    `To be is TOBE. w\n\n` +
    `#IsekaiedGenerator #To_be_is_TOBE #TruckKun #Gemini`;

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  
  // 𝕏のポスト作成画面を新規タブで開く
  window.open(tweetUrl, "_blank", "noopener,noreferrer");

  // クリップボードにもコピー
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).catch(() => {});
  }
  showAnnouncement("𝕏 (Twitter) の投稿画面を開きました！");
});

// ==========================================================================
// 11. 初期化実行
// ==========================================================================

ui.soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
ui.soundLabel.textContent = soundEnabled ? "ＳＯＵＮＤ　ＯＮ" : "ＳＯＵＮＤ　ＯＦＦ";
ui.soundButton.setAttribute("aria-pressed", String(soundEnabled));
ui.highScore.textContent = `HI: ${String(highScore).padStart(6, "0")}`;
updateHUD();
requestAnimationFrame(gameLoop);
