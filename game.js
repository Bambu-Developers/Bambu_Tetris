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
const startOverlay = document.getElementById('start-overlay');
const startRecordsEl = document.getElementById('start-records');
const playBtn = document.getElementById('play-btn');
const recordsListEl = document.getElementById('records-list');
const overlayRecordsEl = document.getElementById('overlay-records');
const bestComboEl = document.getElementById('best-combo');
const maxLinesEl = document.getElementById('max-lines');
const clearRecordsBtn = document.getElementById('clear-records-btn');
const saveRow = document.getElementById('save-row');
const nameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score-btn');
const saveNote = document.getElementById('save-note');

let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId;
// Records: `combo` cuenta locks consecutivos que limpiaron linea; `comboMax` es
// el mejor de la partida. `started` evita dibujar antes de la primera partida.
let combo = 0, comboMax = 0, started = false;

/* ---- Records locales (localStorage) ---- */

const RECORDS_KEY = 'tetris-records';
const MAX_RECORDS = 5;

function emptyRecords() {
  return { scores: [], bestCombo: 0, maxLines: 0 };
}

// Toda lectura es defensiva: si el JSON esta corrupto o tiene otra forma,
// degradamos a un estado vacio en vez de romper el juego.
function loadRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return emptyRecords();
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return emptyRecords();
    const list = Array.isArray(data.scores) ? data.scores : [];
    const scores = list
      .filter(e => e && typeof e === 'object')
      .map(e => ({
        name: typeof e.name === 'string' && e.name.trim() ? e.name.trim().slice(0, 12) : 'Anónimo',
        score: Number(e.score) || 0,
        lines: Number(e.lines) || 0,
        level: Number(e.level) || 1,
        date: typeof e.date === 'string' ? e.date : '',
      }))
      .sort(byScore)
      .slice(0, MAX_RECORDS);
    return {
      scores,
      bestCombo: Math.max(0, Number(data.bestCombo) || 0),
      maxLines: Math.max(0, Number(data.maxLines) || 0),
    };
  } catch (e) {
    return emptyRecords();
  }
}

function saveRecords(data) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

// Combo y lineas maximas pertenecen a la partida, no al top 5: se persisten
// tanto al terminar como al reiniciar, para no perderlos al pulsar «Jugar de nuevo».
function persistStats() {
  const data = loadRecords();
  if (comboMax > data.bestCombo) data.bestCombo = comboMax;
  if ((lines || 0) > data.maxLines) data.maxLines = lines;
  saveRecords(data);
  return data;
}

function byScore(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
}

function qualifiesForTop(scores, value) {
  if (value <= 0) return false;
  return scores.length < MAX_RECORDS || value > scores[MAX_RECORDS - 1].score;
}

// Indice del record mas reciente: es la fila que se resalta como la tuya.
function latestIndex(scores) {
  let idx = -1, newest = '';
  for (let i = 0; i < scores.length; i++) {
    if (scores[i].date && scores[i].date > newest) {
      newest = scores[i].date;
      idx = i;
    }
  }
  return idx;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

function recordsMarkup(scores, highlight) {
  if (!scores.length) return '<p class="records-empty">Sin records todavía</p>';
  const rows = scores.map((e, i) => {
    const title = `Nivel ${e.level} · ${e.lines} líneas`;
    return `<li class="records-row${i === highlight ? ' is-current' : ''}" title="${escapeHtml(title)}">` +
      `<span class="records-pos">${i + 1}</span>` +
      `<span class="records-name">${escapeHtml(e.name)}</span>` +
      `<span class="records-date">${escapeHtml(formatDate(e.date))}</span>` +
      `<span class="records-score">${e.score.toLocaleString('es-MX')}</span>` +
      '</li>';
  }).join('');
  return `<ol class="records-list">${rows}</ol>`;
}

// El panel y la pantalla de inicio resaltan el record mas reciente; el overlay de
// game over solo resalta la fila si acaba de guardarse en esta partida.
function renderRecords(data, overlayHighlight) {
  const markup = recordsMarkup(data.scores, latestIndex(data.scores));
  recordsListEl.innerHTML = markup;
  startRecordsEl.innerHTML = markup;
  overlayRecordsEl.innerHTML = data.scores.length
    ? recordsMarkup(data.scores, overlayHighlight === undefined ? -1 : overlayHighlight)
    : '';
  bestComboEl.textContent = data.bestCombo.toLocaleString('es-MX');
  maxLinesEl.textContent = data.maxLines.toLocaleString('es-MX');
}

function saveCurrentScore() {
  const data = loadRecords();
  const name = (nameInput.value || '').trim().slice(0, 12) || 'Anónimo';
  const entry = { name, score, lines, level, date: new Date().toISOString() };
  data.scores.push(entry);
  data.scores.sort(byScore);
  data.scores = data.scores.slice(0, MAX_RECORDS);
  if (!saveRecords(data)) {
    saveNote.textContent = 'No se pudo guardar: almacenamiento no disponible.';
    return;
  }
  renderRecords(data, data.scores.indexOf(entry));
  saveRow.classList.add('hidden');
}

function clearRecords() {
  if (!window.confirm('¿Borrar todos los records? Esta acción no se puede deshacer.')) return;
  const data = emptyRecords();
  saveRecords(data);
  renderRecords(data);
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
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    updateHUD();
  }
  return cleared;
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
  const cleared = clearLines();
  if (cleared > 0) {
    combo++;
    if (combo > comboMax) comboMax = combo;
  } else {
    combo = 0;
  }
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

// Tablero sin pieza activa: sirve para la pantalla de inicio y para repintar
// tras cambiar de tema cuando ya no hay partida en curso.
function drawBoardOnly() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  if (!board) return;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);
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
  started = false;
  cancelAnimationFrame(animId);
  overlayTitle.textContent = 'Game over';
  overlayTitle.classList.add('is-game-over');
  overlayScore.innerHTML = `Puntuación final: <strong>${score.toLocaleString('es-MX')}</strong>`;

  // Combo y lineas maximas se guardan siempre; la puntuacion solo si entra al top.
  const data = persistStats();
  renderRecords(data);

  if (qualifiesForTop(data.scores, score)) {
    nameInput.value = '';
    saveNote.textContent = '¡Entraste al top 5! Escribe tu nombre';
    saveRow.classList.remove('hidden');
  } else {
    saveRow.classList.add('hidden');
  }

  overlay.classList.remove('hidden');
  if (!saveRow.classList.contains('hidden')) nameInput.focus();
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    lastTime = performance.now();
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    overlayTitle.textContent = 'Pausa';
    overlayTitle.classList.remove('is-game-over');
    overlayScore.textContent = '';
    overlay.classList.remove('hidden');
  }
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
  // Si veniamos de una partida en curso (pausa + «Jugar de nuevo»), sus records
  // de combo y lineas se guardan antes de reiniciar los contadores.
  renderRecords(persistStats());
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  combo = 0;
  comboMax = 0;
  paused = false;
  gameOver = false;
  started = true;
  dropInterval = 1000;
  dropAccum = 0;
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  // El bloque de records vive dentro de #overlay: se limpia al empezar para que
  // el overlay no arrastre contenido de la partida anterior.
  saveRow.classList.add('hidden');
  overlayRecordsEl.innerHTML = '';
  overlay.classList.add('hidden');
  startOverlay.classList.add('hidden');
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

// Pantalla de inicio: el juego ya no arranca solo al cargar la pagina.
function showStart() {
  started = false;
  gameOver = false;
  paused = false;
  board = createBoard();
  drawBoardOnly();
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  renderRecords(loadRecords());
  overlay.classList.add('hidden');
  startOverlay.classList.remove('hidden');
}

document.addEventListener('keydown', e => {
  if (!started) return;
  if (e.code === 'KeyP') { togglePause(); return; }
  if (paused || gameOver) return;
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
playBtn.addEventListener('click', init);
saveScoreBtn.addEventListener('click', saveCurrentScore);
clearRecordsBtn.addEventListener('click', clearRecords);

// El input vive sobre el tablero: sus teclas no deben llegar al juego.
nameInput.addEventListener('keydown', e => {
  e.stopPropagation();
  if (e.key === 'Enter') {
    e.preventDefault();
    saveCurrentScore();
  }
});

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
  if (started && !gameOver) {
    draw();
    drawNext();
  } else {
    drawBoardOnly();
  }
});

showStart();
