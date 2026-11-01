import { Game } from './game.js';
import { Net } from './net.js';
import { initAudio } from './audio.js';
import { drawHero, glow } from './render.js';
import { PALETTES, makeWeapon } from './data.js';
import { rand, TAU } from './util.js';

const $ = (id) => document.getElementById(id);
let game = null;
let titleRun = true;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 無視 */ } },
};

$('nameInput').value = store.get('ftn-name') || '';
const playerName = () => {
  const n = $('nameInput').value.trim().slice(0, 10) || '旅人';
  store.set('ftn-name', n);
  return n;
};
const status = (msg, err) => { const s = $('titleStatus'); s.textContent = msg; s.classList.toggle('err', !!err); };
const busy = (on) => document.querySelectorAll('#title button').forEach((b) => (b.disabled = on));

function start(mode, net, code) {
  titleRun = false;
  game = new Game($('game'), { mode, net, code, name: playerName(), onExit: exitToTitle });
  window.__game = game;
}

function exitToTitle() {
  if (game) { game.destroy(); game = null; }
  $('title').classList.remove('hidden');
  busy(false);
  status('');
  titleRun = true;
  requestAnimationFrame(titleLoop);
}

$('btnSolo').onclick = () => { initAudio(); start('solo'); };
$('btnHost').onclick = () => {
  initAudio();
  busy(true);
  status('ルームを作成しています…');
  const net = new Net();
  net.host((code) => start('host', net, code), (err) => { status(err, true); busy(false); net.destroy(); });
};
const join = () => {
  const code = $('codeInput').value.trim().toUpperCase();
  if (code.length < 4) { status('ルームコードを入力してください', true); return; }
  initAudio();
  busy(true);
  status('ルームに接続しています…');
  const net = new Net();
  net.join(code, () => start('guest', net, code), (err) => { status(err, true); busy(false); net.destroy(); });
};
$('btnJoin').onclick = join;
$('codeInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') join(); });
$('codeInput').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });

// URL に ?room=XXXXX があれば入力しておく
const qp = new URLSearchParams(location.search).get('room');
if (qp) $('codeInput').value = qp.toUpperCase();

// ---------- タイトルの一枚絵 ----------
const tc = $('titleArt');
const tcx = tc.getContext('2d');
const heroes = [
  { id: 0, pal: PALETTES[0], weapon: makeWeapon('sword', 2, 1), aim: 0.35, x: 0, y: 0, atkT: 9, atkDur: 0.3, moveAmt: 0, lanAng: 0 },
  { id: 1, pal: PALETTES[1], weapon: makeWeapon('bow', 3, 1), aim: Math.PI - 0.35, x: 0, y: 0, atkT: 9, atkDur: 0.3, moveAmt: 0, lanAng: 0 },
];
const embers = Array.from({ length: 50 }, () => ({ x: rand(), y: rand(), s: rand(0.5, 1.6), v: rand(0.02, 0.06), p: rand(TAU) }));
let tt = 0, tl = performance.now();
function titleLoop(now) {
  if (!titleRun) return;
  const dt = Math.min(0.05, (now - tl) / 1000); tl = now; tt += dt;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const W = tc.clientWidth * dpr, H = tc.clientHeight * dpr;
  if (tc.width !== W || tc.height !== H) { tc.width = W; tc.height = H; }
  const c = tcx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, W, H);
  const s = Math.min(W / 260, H / 150);
  const cx = W / 2, cy = H * 0.8;
  c.globalCompositeOperation = 'lighter';
  glow(c, cx - 38 * s, cy - 22 * s, 120 * s, '#ff9a40', 0.32 + Math.sin(tt * 3) * 0.02);
  glow(c, cx + 38 * s, cy - 22 * s, 120 * s, '#ffc070', 0.28 + Math.sin(tt * 2.6 + 1) * 0.02);
  c.globalCompositeOperation = 'source-over';
  heroes.forEach((h, i) => {
    h.lanAng = Math.sin(tt * 1.4 + i) * 0.12;
    c.setTransform(s, 0, 0, s, cx + (i ? 38 : -38) * s, cy);
    drawHero(c, h, tt + i * 1.3);
  });
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'lighter';
  heroes.forEach((h) => { if (h._lan) { const x = cx + (h._lan.x) * s + (h.id ? 38 : -38) * s, y = cy + h._lan.y * s; glow(c, x, y, 18 * s, '#ffc060', 0.9); } });
  for (const e of embers) {
    e.y -= e.v * dt; e.p += dt;
    if (e.y < -0.05) { e.y = 1.05; e.x = rand(); }
    glow(c, (e.x + Math.sin(e.p) * 0.01) * W, e.y * H, 3 * e.s * dpr, '#ffb060', 0.5 + Math.sin(e.p * 3) * 0.3);
  }
  c.globalCompositeOperation = 'source-over';
  requestAnimationFrame(titleLoop);
}
requestAnimationFrame(titleLoop);
