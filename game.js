'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

// Paleta de piezas — rampa verde → teal del sistema de diseño Bambú.
// Dos juegos: el neón solo vive sobre negro; en modo claro se usan los verdes
// oscurecidos que cumplen contraste sobre superficies blancas.
const COLORS_DARK = [
  null,
  '#00FF00', // I - verde neón (acento de marca)
  '#00C896', // O - teal
  '#8CFFB8', // T - menta
  '#52D93E', // S - verde corporativo
  '#0E7A6B', // Z - teal profundo
  '#169C45', // J - verde bosque
  '#A8E890', // L - lima
  '#5E6B60', // N - tuerca (gris verdoso)
];

const COLORS_LIGHT = [
  null,
  '#00B81A', // I
  '#00977A', // O
  '#4FC474', // T
  '#2E9E22', // S
  '#0A6257', // Z
  '#0B6B2C', // J
  '#78B85C', // L
  '#98A39A', // N
];

let palette = COLORS_DARK;

function isLight() {
  return document.documentElement.classList.contains('light-mode');
}

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
  [[8,8,8],[8,0,8],[8,8,8]],                  // N (tuerca)
];

const LINE_SCORES = [0, 100, 300, 500, 800];

const MIN_LEVEL = 1;
const MAX_LEVEL = 15;
const START_LEVEL_KEY = 'tetris-start-level';
// Tras cerrar el menú se ignoran los inputs del juego unos ms: así la misma
// tecla que reanuda no mueve la pieza por accidente.
const RESUME_GUARD_MS = 150;

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');
const pauseOverlay = document.getElementById('pause-overlay');
const pauseMainView = document.getElementById('pause-main');
const pauseControlsView = document.getElementById('pause-controls');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const pauseControlsBtn = document.getElementById('pause-controls-btn');
const pauseBackBtn = document.getElementById('pause-back-btn');
const startLevelSelect = document.getElementById('start-level');

let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId;
// menuOpen bloquea los inputs del juego mientras el menú de pausa está abierto.
let menuOpen = false;
let resumeGuardUntil = 0;
// startLevel es la preferencia guardada (se aplica a la próxima partida);
// baseLevel es la foto que tomó init() y la que manda en la partida en curso.
let startLevel = loadStartLevel();
let baseLevel = startLevel;

function levelSpeed(lvl) {
  return Math.max(100, 1000 - (lvl - 1) * 90);
}

function clampLevel(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return MIN_LEVEL;
  return Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, n));
}

function loadStartLevel() {
  try {
    const stored = localStorage.getItem(START_LEVEL_KEY);
    if (stored !== null) return clampLevel(stored);
  } catch (e) {}
  return MIN_LEVEL;
}

function saveStartLevel(value) {
  try {
    localStorage.setItem(START_LEVEL_KEY, String(value));
  } catch (e) {}
}

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.floor(Math.random() * 8) + 1;
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared) {
    lines += cleared;
    score += (LINE_SCORES[cleared] || 0) * level;
    level = baseLevel + Math.floor(lines / 10);
    dropInterval = levelSpeed(level);
    updateHUD();
  }
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  merge();
  clearLines();
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece();
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString('es-MX');
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  const pad = 1;
  const px = x * size + pad;
  const py = y * size + pad;
  const s = size - pad * 2;
  const r = size >= 24 ? 6 : 4; // radius.sm

  context.globalAlpha = alpha ?? 1;
  context.beginPath();
  if (context.roundRect) {
    context.roundRect(px, py, s, s, r);
  } else {
    context.rect(px, py, s, s);
  }
  context.fillStyle = palette[colorIndex];
  context.fill();

  // Los bordes dan la estructura, no las sombras.
  context.lineWidth = 1;
  context.strokeStyle = isLight() ? 'rgba(11,17,12,0.18)' : 'rgba(255,255,255,0.18)';
  context.stroke();
  context.globalAlpha = 1;
}

function drawGrid() {
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid-line').trim();
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.22);

  // current piece — el elemento activo lleva resplandor verde
  ctx.save();
  ctx.shadowColor = isLight() ? 'rgba(0,120,20,0.35)' : 'rgba(0,255,0,0.45)';
  ctx.shadowBlur = isLight() ? 8 : 16;
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
  ctx.restore();
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  overlayTitle.textContent = 'Game over';
  overlayTitle.classList.add('is-game-over');
  overlayScore.innerHTML = `Puntuación final: <strong>${score.toLocaleString('es-MX')}</strong>`;
  overlay.classList.remove('hidden');
}

function showPauseView(view, moveFocus) {
  const controls = view === 'controls';
  pauseMainView.classList.toggle('hidden', controls);
  pauseControlsView.classList.toggle('hidden', !controls);
  if (moveFocus !== false) (controls ? pauseBackBtn : resumeBtn).focus();
}

// Tab no debe escaparse a los controles que quedan tapados por el overlay.
function trapFocus(e) {
  const focusables = Array.prototype.filter.call(
    pauseOverlay.querySelectorAll('button, select'),
    el => el.offsetParent !== null
  );
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;
  if (!pauseOverlay.contains(active)) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

// Al volver al tablero ningún botón del menú debe quedar enfocado: un Enter
// posterior lo reactivaría.
function blurMenuFocus() {
  if (pauseOverlay.contains(document.activeElement)) document.activeElement.blur();
}

function openPauseMenu() {
  paused = true;
  menuOpen = true;
  cancelAnimationFrame(animId);
  startLevelSelect.value = String(startLevel);
  pauseOverlay.classList.remove('hidden');
  showPauseView('main');
}

function closePauseMenu() {
  menuOpen = false;
  paused = false;
  blurMenuFocus();
  pauseOverlay.classList.add('hidden');
  showPauseView('main', false);
  resumeGuardUntil = performance.now() + RESUME_GUARD_MS;
  if (gameOver) return;
  lastTime = performance.now();
  dropAccum = 0;
  animId = requestAnimationFrame(loop);
}

function togglePause() {
  if (gameOver) return;
  if (menuOpen) closePauseMenu();
  else openPauseMenu();
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  dropAccum += dt;
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }
  if (gameOver) return;
  draw();
  animId = requestAnimationFrame(loop);
}

function init() {
  board = createBoard();
  score = 0;
  lines = 0;
  baseLevel = startLevel;
  level = baseLevel;
  paused = false;
  gameOver = false;
  menuOpen = false;
  dropInterval = levelSpeed(level);
  dropAccum = 0;
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  overlay.classList.add('hidden');
  blurMenuFocus();
  pauseOverlay.classList.add('hidden');
  showPauseView('main', false);
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

const GAME_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'KeyX', 'Space'];

document.addEventListener('keydown', e => {
  if (e.code === 'KeyP' || e.code === 'Escape') {
    e.preventDefault();
    togglePause();
    return;
  }
  if (menuOpen) {
    if (e.code === 'Tab') { trapFocus(e); return; }
    if (GAME_KEYS.indexOf(e.code) === -1) return;
    // El menú manda: nada de mover la pieza por detrás. Se dejan pasar las
    // teclas que el propio menú necesita — flechas en el selector de nivel,
    // Espacio para activar el botón enfocado.
    const ownsKey = e.target === startLevelSelect ||
      (e.code === 'Space' && pauseOverlay.contains(e.target));
    if (!ownsKey) e.preventDefault();
    return;
  }
  if (paused || gameOver) return;
  if (performance.now() < resumeGuardUntil) {
    if (GAME_KEYS.indexOf(e.code) !== -1) e.preventDefault();
    return;
  }
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

restartBtn.addEventListener('click', init);

for (let lvl = MIN_LEVEL; lvl <= MAX_LEVEL; lvl++) {
  const option = document.createElement('option');
  option.value = String(lvl);
  option.textContent = String(lvl);
  startLevelSelect.appendChild(option);
}
startLevelSelect.value = String(startLevel);

startLevelSelect.addEventListener('change', () => {
  startLevel = clampLevel(startLevelSelect.value);
  startLevelSelect.value = String(startLevel);
  saveStartLevel(startLevel);
});

resumeBtn.addEventListener('click', closePauseMenu);
pauseRestartBtn.addEventListener('click', () => {
  resumeGuardUntil = performance.now() + RESUME_GUARD_MS;
  init();
});
pauseControlsBtn.addEventListener('click', () => showPauseView('controls'));
pauseBackBtn.addEventListener('click', () => showPauseView('main'));

const themeToggle = document.getElementById('theme-toggle');

function applyTheme(light) {
  document.documentElement.classList.toggle('light-mode', light);
  themeToggle.textContent = light ? 'Modo oscuro' : 'Modo claro';
  palette = light ? COLORS_LIGHT : COLORS_DARK;
}

const savedTheme = localStorage.getItem('tetris-theme');
applyTheme(savedTheme === 'light');

themeToggle.addEventListener('click', () => {
  const light = !isLight();
  applyTheme(light);
  localStorage.setItem('tetris-theme', light ? 'light' : 'dark');
  if (!gameOver) {
    draw();
    drawNext();
  }
});

init();
