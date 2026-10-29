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

function isLight() {
  return document.documentElement.classList.contains('light-mode');
}

// ---- Skins ----
// Cada skin aporta su propia rampa para modo oscuro y modo claro, y su propia
// funcion de dibujo de bloque. `drawBlock()` delega en la skin activa.
const SKINS = {
  retro: {
    label: 'Retro',
    dark: COLORS_DARK,
    light: COLORS_LIGHT,
    // Estilo actual: roundRect radio 6/4, relleno plano y borde sutil.
    drawBlock(context, px, py, s, color, size) {
      const r = size >= 24 ? 6 : 4; // radius.sm
      context.beginPath();
      if (context.roundRect) {
        context.roundRect(px, py, s, s, r);
      } else {
        context.rect(px, py, s, s);
      }
      context.fillStyle = color;
      context.fill();

      // Los bordes dan la estructura, no las sombras.
      context.lineWidth = 1;
      context.strokeStyle = isLight() ? 'rgba(11,17,12,0.18)' : 'rgba(255,255,255,0.18)';
      context.stroke();
    },
  },

  neon: {
    label: 'Neón',
    dark: [
      null,
      '#39FF14', // I - verde neon puro
      '#00FFC6', // O - turquesa electrico
      '#7CFF00', // T - lima fosforescente
      '#00FF6A', // S - menta electrica
      '#00E5FF', // Z - cian
      '#B6FF00', // J - acido
      '#5CFF8F', // L - verde fluorescente
      '#C7FFE4', // N - blanco verdoso
    ],
    light: [
      null,
      '#00A80F', // I
      '#00806A', // O
      '#4F9E00', // T
      '#00883A', // S
      '#0084A0', // Z
      '#6E8F00', // J
      '#2E9E55', // L
      '#5E7A68', // N
    ],
    // Resplandor fuerte por bloque; save/restore para no contaminar el render.
    drawBlock(context, px, py, s, color, size) {
      const r = size >= 24 ? 4 : 3;
      context.save();
      context.shadowColor = color;
      context.shadowBlur = Math.max(6, Math.round(size * 0.5));
      context.beginPath();
      if (context.roundRect) {
        context.roundRect(px, py, s, s, r);
      } else {
        context.rect(px, py, s, s);
      }
      context.fillStyle = color;
      context.fill();
      context.shadowBlur = 0;
      context.lineWidth = 1.5;
      context.strokeStyle = isLight() ? 'rgba(11,17,12,0.38)' : 'rgba(255,255,255,0.72)';
      context.stroke();
      context.restore();
    },
  },

  pastel: {
    label: 'Pastel',
    dark: [
      null,
      '#A8E6A3', // I - verde pastel
      '#A3E3DA', // O - agua
      '#D4F0A8', // T - lima suave
      '#BCE8C9', // S - salvia clara
      '#8FC9C4', // Z - jade suave
      '#9FD9A8', // J - verde polvo
      '#E4F0C2', // L - limon palido
      '#CBD4CB', // N - perla
    ],
    light: [
      null,
      '#6FB873', // I
      '#63B5AA', // O
      '#9DC56A', // T
      '#86BE95', // S
      '#4F938D', // Z
      '#6AAE77', // J
      '#AFC47F', // L
      '#97A397', // N
    ],
    // Esquinas muy redondeadas y brillo interior suave.
    drawBlock(context, px, py, s, color, size) {
      const r = Math.min(s / 2, size >= 24 ? 12 : 7); // radius.lg
      context.save();
      context.beginPath();
      if (context.roundRect) {
        context.roundRect(px, py, s, s, r);
      } else {
        context.rect(px, py, s, s);
      }
      context.fillStyle = color;
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = isLight() ? 'rgba(11,17,12,0.12)' : 'rgba(255,255,255,0.30)';
      context.stroke();

      // Brillo superior: un arco claro pegado al borde de arriba. Sin sombra
      // heredada, para que el resplandor de la pieza activa no lo difumine.
      context.shadowBlur = 0;
      const inset = Math.max(2, Math.round(size * 0.14));
      context.beginPath();
      if (context.roundRect) {
        context.roundRect(px + inset, py + inset, s - inset * 2, (s - inset * 2) / 2, r / 2);
      } else {
        context.rect(px + inset, py + inset, s - inset * 2, (s - inset * 2) / 2);
      }
      context.fillStyle = 'rgba(255,255,255,0.28)';
      context.fill();
      context.restore();
    },
  },

  pixel: {
    label: 'Pixel art',
    dark: [
      null,
      '#2ECC40', // I - verde 8 bits
      '#1FB38F', // O - teal 8 bits
      '#5FD67A', // T - verde claro
      '#149C3F', // S - verde medio
      '#0E7A6B', // Z - teal profundo
      '#0B6B2C', // J - verde bosque
      '#8CC63F', // L - lima
      '#4A5A4C', // N - tuerca
    ],
    light: [
      null,
      '#1FA62F', // I
      '#13866B', // O
      '#3FAE57', // T
      '#0E7C30', // S
      '#0A5F53', // Z
      '#07541F', // J
      '#6F9E2C', // L
      '#3C4A3E', // N
    ],
    // Bloque cuadrado con bisel y dither de 2-3 px.
    drawBlock(context, px, py, s, color, size) {
      const u = Math.max(2, Math.round(size / 10)); // unidad de pixel
      context.save();
      context.fillStyle = color;
      context.fillRect(px, py, s, s);

      // Bisel y dither sin sombra heredada: el resplandor de la pieza activa
      // solo debe rodear el bloque, no emborronar su textura.
      context.shadowBlur = 0;
      context.fillStyle = 'rgba(255,255,255,0.38)';
      context.fillRect(px, py, s, u);
      context.fillRect(px, py, u, s);
      context.fillStyle = 'rgba(0,0,0,0.32)';
      context.fillRect(px, py + s - u, s, u);
      context.fillRect(px + s - u, py, u, s);

      // Dither diagonal en el interior.
      context.fillStyle = 'rgba(255,255,255,0.20)';
      for (let i = u * 2; i < s - u * 2; i += u * 2) {
        context.fillRect(px + i, py + i, u, u);
      }
      context.fillStyle = 'rgba(0,0,0,0.18)';
      for (let i = u * 2; i < s - u * 2; i += u * 2) {
        context.fillRect(px + s - u - i, py + i, u, u);
      }
      context.restore();
    },
  },
};

const DEFAULT_SKIN = 'retro';

function loadSkin() {
  try {
    const saved = localStorage.getItem('tetris-skin');
    if (saved && SKINS[saved]) return saved;
  } catch (e) {}
  return DEFAULT_SKIN;
}

let currentSkin = loadSkin();
let palette = SKINS[currentSkin].dark;

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
const skinSelect = document.getElementById('skin-select');

let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId;

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
  const prevAlpha = context.globalAlpha;

  context.globalAlpha = alpha ?? 1;
  SKINS[currentSkin].drawBlock(context, px, py, s, palette[colorIndex], size);
  context.globalAlpha = prevAlpha;
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
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  paused = false;
  gameOver = false;
  dropInterval = 1000;
  dropAccum = 0;
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  overlay.classList.add('hidden');
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
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

const themeToggle = document.getElementById('theme-toggle');

// La rampa activa depende de la skin elegida y del tema (oscuro/claro).
function syncPalette() {
  palette = isLight() ? SKINS[currentSkin].light : SKINS[currentSkin].dark;
}

function applyTheme(light) {
  document.documentElement.classList.toggle('light-mode', light);
  themeToggle.textContent = light ? 'Modo oscuro' : 'Modo claro';
  syncPalette();
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

// ---- Selector de skin ----
// Las opciones salen de SKINS: una sola fuente de verdad para claves y nombres.
for (const name of Object.keys(SKINS)) {
  const option = document.createElement('option');
  option.value = name;
  option.textContent = SKINS[name].label;
  skinSelect.appendChild(option);
}
skinSelect.value = currentSkin;

skinSelect.addEventListener('change', () => {
  const name = skinSelect.value;
  if (!SKINS[name]) return;
  currentSkin = name;
  syncPalette();
  try {
    localStorage.setItem('tetris-skin', name);
  } catch (e) {}
  // Se repinta siempre: tras un game over el tablero sigue visible bajo el overlay.
  draw();
  drawNext();
});

init();
