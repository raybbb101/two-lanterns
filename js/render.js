import { TAU, clamp, lerp, easeOut, shade, rgba, hash, angDiff } from './util.js';
import { RARITY, WEAPONS, SKILLS } from './data.js';
import { roundRect } from './map.js';

const ell = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU); };
const shadow = (c, rx, ry, a = 0.38) => { c.fillStyle = `rgba(0,0,0,${a})`; ell(c, 0, 0, rx, ry); c.fill(); };
const lerpAng = (a, b, t) => a + angDiff(a, b) * t;

// ---------- 光のスプライト ----------
const spriteCache = new Map();
export function glowSprite(color) {
  let s = spriteCache.get(color);
  if (s) return s;
  s = document.createElement('canvas');
  s.width = s.height = 128;
  const c = s.getContext('2d');
  const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, rgba(color, 1));
  g.addColorStop(0.25, rgba(color, 0.55));
  g.addColorStop(0.6, rgba(color, 0.16));
  g.addColorStop(1, rgba(color, 0));
  c.fillStyle = g;
  c.fillRect(0, 0, 128, 128);
  spriteCache.set(color, s);
  return s;
}
export function glow(c, x, y, r, color, a = 1) {
  c.globalAlpha = a;
  c.drawImage(glowSprite(color), x - r, y - r, r * 2, r * 2);
  c.globalAlpha = 1;
}

// ---------- 武器 ----------
const BLADE = [['#eef1f5', '#8e97a5'], ['#eef7ea', '#86a77f'], ['#eaf2ff', '#6f92cc'], ['#f6ebff', '#9c72cc'], ['#fff4dc', '#cf8f2e']];
export const weaponLen = { sword: 36, dagger: 23, axe: 40, spear: 60, bow: 12, staff: 44 };

export function drawWeapon(c, it, o = {}) {
  const r = it.rarity || 0;
  const [hi, lo] = o.rust ? ['#b9a48a', '#6d5a48'] : BLADE[r];
  const metal = (y0, y1) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, hi); g.addColorStop(0.5, shade(lo, 0.2)); g.addColorStop(1, shade(lo, -0.25)); return g; };
  const gold = r >= 3 ? '#e8c060' : '#9a9aa4';
  const wood = (y0, y1) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#8a5a34'); g.addColorStop(1, '#4a2c18'); return g; };
  c.lineJoin = 'round';
  switch (it.base) {
    case 'sword':
    case 'dagger': {
      const L = it.base === 'sword' ? 1 : 0.62;
      c.fillStyle = '#3a2418'; roundRect(c, -8 * L - 2, -2, 10 * L + 2, 4, 1.5); c.fill();
      c.strokeStyle = '#6a4630'; c.lineWidth = 0.8;
      for (let i = -8 * L; i < 1; i += 2.4) { c.beginPath(); c.moveTo(i, -2); c.lineTo(i + 1.4, 2); c.stroke(); }
      c.fillStyle = gold; ell(c, -8 * L - 2.5, 0, 2.6, 2.6); c.fill();
      c.fillStyle = shade(gold, -0.3); roundRect(c, 1.5, -6.5 * L - 1, 3.6, 13 * L + 2, 1.5); c.fill();
      c.fillStyle = gold; roundRect(c, 1.5, -6.5 * L - 1, 2.4, 13 * L + 2, 1.2); c.fill();
      c.fillStyle = metal(-3, 3);
      c.beginPath();
      if (it.base === 'sword') { c.moveTo(5, -2.8); c.lineTo(31, -2.3); c.lineTo(37, 0); c.lineTo(31, 2.3); c.lineTo(5, 2.8); }
      else { c.moveTo(5, -2.6); c.quadraticCurveTo(15, -3.6, 23, -0.5); c.lineTo(23.5, 0.5); c.quadraticCurveTo(15, 1.2, 5, 2.6); }
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.9; c.stroke();
      c.strokeStyle = rgba('#ffffff', 0.7); c.lineWidth = 0.7;
      c.beginPath(); c.moveTo(6, -2.3); c.lineTo(it.base === 'sword' ? 31 : 20, -1.9); c.stroke();
      if (it.base === 'sword') { c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(7, 0.3); c.lineTo(26, 0.3); c.stroke(); }
      if (r >= 2) { c.fillStyle = RARITY[r].color; ell(c, 3, 0, 1.5, 1.5); c.fill(); }
      break;
    }
    case 'axe': {
      c.fillStyle = wood(-2, 2); roundRect(c, -10, -1.8, 46, 3.6, 1.5); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 0.6;
      for (let i = -8; i < 30; i += 6) { c.beginPath(); c.moveTo(i, -1); c.lineTo(i + 4, -0.5); c.stroke(); }
      c.fillStyle = '#3a2418'; roundRect(c, -10, -2.2, 8, 4.4, 1.5); c.fill();
      c.fillStyle = metal(-17, 17);
      c.beginPath(); c.moveTo(27, -3); c.quadraticCurveTo(31, -13, 41, -17); c.quadraticCurveTo(36, 0, 41, 17); c.quadraticCurveTo(31, 13, 27, 3); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1; c.stroke();
      c.strokeStyle = rgba('#ffffff', 0.75); c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(40, -15); c.quadraticCurveTo(35.5, 0, 40, 15); c.stroke();
      c.fillStyle = shade(lo, -0.2);
      c.beginPath(); c.moveTo(27, -2.5); c.lineTo(20, -6); c.lineTo(22, 0); c.lineTo(20, 6); c.lineTo(27, 2.5); c.fill();
      c.fillStyle = gold; roundRect(c, 25, -3, 4, 6, 1); c.fill();
      if (r >= 2) { c.fillStyle = RARITY[r].color; ell(c, 32, 0, 1.8, 2.4); c.fill(); }
      break;
    }
    case 'spear': {
      c.fillStyle = wood(-1.5, 1.5); roundRect(c, -16, -1.5, 63, 3, 1.4); c.fill();
      c.fillStyle = gold; roundRect(c, 44, -2.4, 4, 4.8, 1); c.fill(); roundRect(c, -16, -2, 3, 4, 1); c.fill();
      c.fillStyle = metal(-4, 4);
      c.beginPath(); c.moveTo(47, -3.6); c.quadraticCurveTo(56, -4.5, 64, 0); c.quadraticCurveTo(56, 4.5, 47, 3.6); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.8; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(48, -2.8); c.quadraticCurveTo(56, -3.2, 62, -0.4); c.stroke();
      const tc = r >= 2 ? RARITY[r].color : '#a83232';
      c.strokeStyle = tc; c.lineWidth = 1.3;
      const sw = o.t ? Math.sin(o.t * 6) * 2 : 0;
      for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(45, 1.5); c.quadraticCurveTo(43 + k, 6, 42 + k * 2 + sw, 10); c.stroke(); }
      break;
    }
    case 'bow': {
      const pull = o.pull || 0;
      c.strokeStyle = '#2a1a10'; c.lineWidth = 4.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-5, -22); c.quadraticCurveTo(9, -12, 2, 0); c.quadraticCurveTo(9, 12, -5, 22); c.stroke();
      c.strokeStyle = r >= 3 ? '#c99a48' : '#8a5a30'; c.lineWidth = 2.8;
      c.beginPath(); c.moveTo(-5, -22); c.quadraticCurveTo(9, -12, 2, 0); c.quadraticCurveTo(9, 12, -5, 22); c.stroke();
      c.strokeStyle = 'rgba(255,230,190,.35)'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(-4, -21); c.quadraticCurveTo(9, -12, 3, -2); c.stroke();
      c.strokeStyle = '#ddd6c8'; c.lineWidth = 0.7;
      c.beginPath(); c.moveTo(-5, -22); c.lineTo(-pull, 0); c.lineTo(-5, 22); c.stroke();
      c.fillStyle = '#3a2418'; roundRect(c, 0, -3.5, 4.5, 7, 1.5); c.fill();
      if (r >= 2) { c.fillStyle = RARITY[r].color; ell(c, 6.5, -11, 1.5, 1.5); c.fill(); ell(c, 6.5, 11, 1.5, 1.5); c.fill(); }
      if (pull > 1) { c.strokeStyle = '#a07850'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-pull, 0); c.lineTo(14, 0); c.stroke(); c.fillStyle = '#c9ccd4'; c.beginPath(); c.moveTo(14, -2); c.lineTo(18, 0); c.lineTo(14, 2); c.fill(); }
      break;
    }
    case 'staff': {
      c.strokeStyle = '#2a1a10'; c.lineWidth = 4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(10, 1.5, 30, -1); c.stroke();
      c.strokeStyle = '#6e4a2c'; c.lineWidth = 2.6;
      c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(10, 1.5, 30, -1); c.stroke();
      // 頭の絡んだ枝
      c.strokeStyle = '#6e4a2c'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(29, -1); c.quadraticCurveTo(34, -9, 40, -4); c.moveTo(29, -1); c.quadraticCurveTo(34, 7, 40, 3); c.stroke();
      c.fillStyle = gold; roundRect(c, 26, -2.6, 3.5, 5.2, 1); c.fill();
      const gc = RARITY[Math.max(1, r)].color;
      const g = c.createLinearGradient(34, -5, 44, 5);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, gc); g.addColorStop(1, shade(gc, -0.5));
      c.fillStyle = g;
      c.beginPath(); c.moveTo(35, 0); c.lineTo(39.5, -5.5); c.lineTo(44, 0); c.lineTo(39.5, 5.5); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.moveTo(37, -0.5); c.lineTo(39.5, -3.5); c.lineTo(40, -1); c.fill();
      break;
    }
  }
  if (it.affixes && it.affixes.includes('frost')) {
    c.fillStyle = 'rgba(160,220,255,.25)';
    ell(c, (weaponLen[it.base] || 30) * 0.6, 0, (weaponLen[it.base] || 30) * 0.35, 3); c.fill();
  }
}

// ---------- 主人公 ----------
export function heroView(aim) {
  const sa = Math.sin(aim);
  return sa > 0.42 ? 0 : sa < -0.55 ? 2 : 1;
}

export function drawHero(c, h, t) {
  const P = h.pal;
  const a = h.aim, ca = Math.cos(a), sa = Math.sin(a);
  const view = heroView(a);
  const fx = ca >= 0 ? 1 : -1;
  c.save();
  c.translate(h.x, h.y);
  shadow(c, 13, 5);
  if (h.down) { drawDowned(c, h, t); c.restore(); return; }
  const mv = h.moveAmt || 0, ph = h.walkPh || 0;
  const bob = mv * Math.abs(Math.sin(ph)) * 2.4 + (1 - mv) * Math.sin(t * 2.2) * 0.6;
  c.translate(0, -bob);
  if (h.dodgeT > 0) {
    const p = 1 - h.dodgeT / h.dodgeDur;
    c.translate(0, -15);
    c.rotate(easeOut(p) * TAU * (h.dodgeDir >= 0 ? 1 : -1));
    c.scale(0.92, 0.85);
    c.translate(0, 15);
  }
  if (h.skillAnim && h.skillAnim.id === 'whirl' && h.skillAnim.t < 0.35) {
    // 旋風斬中は体ごと回る演出：向きを強制回転
    h._spinAim = a + (h.skillAnim.t / 0.35) * TAU * 1.5;
  } else h._spinAim = null;

  const sway = clamp(-(h.vx || 0) * 0.02, -5, 5);
  const weaponBehind = (h._spinAim != null ? Math.sin(h._spinAim) : sa) < -0.15;
  const parts = [];
  if (weaponBehind) parts.push('weapon');
  if (view === 2) parts.push('legs', 'lantern', 'torso', 'cape', 'head');
  else if (view === 1) parts.push('cape', 'lantern', 'legs', 'torso', 'head');
  else parts.push('cape', 'legs', 'torso', 'lantern', 'head');
  if (!weaponBehind) parts.push('weapon');

  for (const p of parts) {
    if (p === 'legs') drawLegs(c, P, view, fx, ph, mv);
    else if (p === 'torso') drawTorso(c, P, view, fx);
    else if (p === 'cape') drawCape(c, P, view, fx, sway, t, mv);
    else if (p === 'head') drawHead(c, h, P, view, fx, t, sway);
    else if (p === 'lantern') drawLanternArm(c, h, P, fx, t);
    else if (p === 'weapon') drawWeaponArm(c, h, P, fx, t, bob);
  }
  c.restore();
}

function drawLegs(c, P, view, fx, ph, mv) {
  c.lineCap = 'round';
  const order = view === 1 ? [0, 1] : [0, 1];
  for (const i of order) {
    const s = i ? 1 : -1;
    const sw = Math.sin(ph + i * Math.PI) * mv;
    const lift = Math.max(0, -Math.cos(ph + i * Math.PI)) * 2.6 * mv;
    let hx, fxp, fy = 0;
    if (view === 1) { hx = s * 1.6; fxp = fx * sw * 6.5 + s * 1.2; }
    else { hx = s * 3.6; fxp = s * 4; fy = sw * 1.6; }
    const dark = view === 1 && i === 0;
    c.strokeStyle = dark ? shade(P.pants, -0.3) : P.pants;
    c.lineWidth = 5.4;
    c.beginPath(); c.moveTo(hx, -14); c.lineTo(fxp, -4 - lift + fy); c.stroke();
    c.fillStyle = dark ? shade(P.boots, -0.3) : P.boots;
    const bx = fxp + (view === 1 ? fx * 1.4 : 0), by = -2.6 - lift + fy;
    ell(c, bx, by, view === 1 ? 4.4 : 3.4, 3); c.fill();
    c.fillStyle = shade(P.boots, -0.2);
    c.fillRect(bx - (view === 1 ? 4 : 3.2), by - 4, view === 1 ? 8 : 6.4, 2.2);
    c.fillStyle = 'rgba(255,255,255,.18)';
    ell(c, bx - 1, by - 1.2, 1.5, 0.8); c.fill();
  }
}

function drawTorso(c, P, view, fx) {
  const w = view === 1 ? 6.8 : 9.4;
  const g = c.createLinearGradient(-w, 0, w, 0);
  const light = view === 1 ? fx : -1;
  g.addColorStop(0, shade(P.tunic, light < 0 ? 0.15 : -0.3));
  g.addColorStop(1, shade(P.tunic, light < 0 ? -0.3 : 0.12));
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-w, -29);
  c.quadraticCurveTo(0, -31.5, w, -29);
  c.lineTo(w * 0.86, -17);
  c.lineTo(w * 1.12, -9.5);
  c.quadraticCurveTo(0, -7.5, -w * 1.12, -9.5);
  c.lineTo(-w * 0.86, -17);
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.9; c.stroke();
  // すそのトリム
  c.strokeStyle = P.trim; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(-w * 1.08, -10.2); c.quadraticCurveTo(0, -8.2, w * 1.08, -10.2); c.stroke();
  // すそのひだ
  c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 0.8;
  for (const k of [-0.5, 0, 0.5]) { c.beginPath(); c.moveTo(k * w, -15); c.lineTo(k * w * 1.15, -9); c.stroke(); }
  if (view !== 2) {
    // 襟
    c.fillStyle = shade(P.tunic, -0.4);
    const cx = view === 1 ? fx * 2.5 : 0;
    c.beginPath(); c.moveTo(cx - 3, -29.5); c.lineTo(cx + 3, -29.5); c.lineTo(cx, -24.5); c.fill();
    c.strokeStyle = P.trim; c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(cx - 3.4, -29.5); c.lineTo(cx, -24); c.lineTo(cx + 3.4, -29.5); c.stroke();
    // 革のたすき
    if (view === 0) {
      c.strokeStyle = '#4a3020'; c.lineWidth = 2.4;
      c.beginPath(); c.moveTo(-w * 0.9, -28); c.lineTo(w * 0.8, -17.5); c.stroke();
      c.fillStyle = P.trim; ell(c, -w * 0.25, -24, 1.3, 1.3); c.fill();
    }
  }
  // ベルト
  c.fillStyle = '#35251b'; c.fillRect(-w * 0.9, -17.8, w * 1.8, 3.2);
  c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(-w * 0.9, -17.8, w * 1.8, 0.8);
  if (view !== 2) { c.fillStyle = P.trim; roundRect(c, (view === 1 ? fx * 2.5 : 0) - 1.9, -18.2, 3.8, 4, 0.8); c.fill(); c.fillStyle = '#35251b'; c.fillRect((view === 1 ? fx * 2.5 : 0) - 0.8, -17.2, 1.6, 2); }
  else { c.fillStyle = '#5a3d28'; roundRect(c, 2, -19, 5, 6, 1.2); c.fill(); }
  // 肩当て
  const pauld = (x) => {
    const pg = c.createLinearGradient(0, -32, 0, -24);
    pg.addColorStop(0, '#ffffff'); pg.addColorStop(0.3, P.metal); pg.addColorStop(1, shade(P.metal, -0.5));
    c.fillStyle = pg;
    c.beginPath(); c.ellipse(x, -27.5, 4.6, 3.8, 0, Math.PI, 0); c.lineTo(x + 4.6, -26); c.quadraticCurveTo(x, -24, x - 4.6, -26); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 0.7; c.stroke();
    c.fillStyle = P.trim; ell(c, x, -28.5, 0.9, 0.9); c.fill();
  };
  if (view === 1) pauld(fx * 1.5); else { pauld(-w + 1); pauld(w - 1); }
}

function drawCape(c, P, view, fx, sway, t, mv) {
  const fl = Math.sin(t * 7) * 1.4 * (0.3 + mv);
  const g = c.createLinearGradient(0, -30, 0, -2);
  g.addColorStop(0, shade(P.cloak, 0.1));
  g.addColorStop(1, shade(P.cloak, -0.45));
  c.fillStyle = g;
  c.beginPath();
  if (view === 0) {
    c.moveTo(-8, -29);
    c.quadraticCurveTo(-13 + sway * 0.3, -16, -12 + sway, -4 + fl);
    c.lineTo(12 + sway, -4 - fl);
    c.quadraticCurveTo(13 + sway * 0.3, -16, 8, -29);
  } else if (view === 1) {
    const back = -fx;
    const tail = 9 + mv * 7;
    c.moveTo(back * 1, -29);
    c.quadraticCurveTo(back * (tail * 0.7), -18, back * tail + sway, -5 + fl);
    c.quadraticCurveTo(back * (tail * 0.5), -3 - fl, back * -2, -6);
    c.lineTo(back * -1, -28);
  } else {
    c.moveTo(-9, -29.5);
    c.quadraticCurveTo(0, -31.5, 9, -29.5);
    c.quadraticCurveTo(11.5 + sway * 0.4, -16, 11 + sway, -3 + fl);
    c.quadraticCurveTo(5 + sway, -1 - fl, 0 + sway, -3 + fl * 0.5);
    c.quadraticCurveTo(-5 + sway, -1 + fl, -11 + sway, -3 - fl);
    c.quadraticCurveTo(-11.5 + sway * 0.4, -16, -9, -29.5);
  }
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.9; c.stroke();
  if (view === 2) {
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1;
    for (const k of [-5, 0, 5]) { c.beginPath(); c.moveTo(k * 0.6, -27); c.quadraticCurveTo(k + sway * 0.5, -14, k * 1.1 + sway, -4); c.stroke(); }
    // 紋章（灯）
    c.fillStyle = rgba(P.trim, 0.85);
    c.beginPath(); c.moveTo(0, -24); c.quadraticCurveTo(4, -19, 0, -15.5); c.quadraticCurveTo(-4, -19, 0, -24); c.fill();
    c.strokeStyle = P.trim; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-9.5, -29); c.quadraticCurveTo(0, -31, 9.5, -29); c.stroke();
  }
}

function drawHead(c, h, P, view, fx, t, sway) {
  const hy = -38.5;
  const blink = (t + (h.id || 0) * 1.7) % 4.2 < 0.12;
  // 首
  c.fillStyle = shade(P.skin, -0.25);
  c.fillRect(-2.4, -31.5, 4.8, 3);
  const pony = P.style === 'pony';
  const tailSw = Math.sin(t * 3.1) * 1.5 + sway * 0.8;
  const drawPony = () => {
    c.fillStyle = P.hair;
    const bx = view === 1 ? -fx * 8 : 0, by = hy - 4;
    c.beginPath();
    c.moveTo(bx - 3, by);
    c.quadraticCurveTo(bx - 6 + tailSw, by + 10, bx - 1 + tailSw * 1.6, by + 20);
    c.quadraticCurveTo(bx + 3 + tailSw, by + 10, bx + 3, by);
    c.fill();
    c.strokeStyle = rgba(P.hairHi, 0.4); c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(bx, by + 2); c.quadraticCurveTo(bx - 2 + tailSw, by + 10, bx + tailSw * 1.4, by + 17); c.stroke();
    c.fillStyle = P.trim; ell(c, bx, by + 1, 2.4, 1.6); c.fill();
  };
  if (pony && view !== 2) drawPony();

  // 髪のベース
  const hg = c.createLinearGradient(0, hy - 12, 0, hy + 8);
  hg.addColorStop(0, shade(P.hair, 0.15)); hg.addColorStop(1, shade(P.hair, -0.35));
  c.fillStyle = hg;
  ell(c, 0, hy - 1.2, 11.2, 10.6); c.fill();

  if (view === 0) {
    const fg = c.createRadialGradient(-2, hy, 1, 0, hy + 2, 10);
    fg.addColorStop(0, shade(P.skin, 0.1)); fg.addColorStop(1, shade(P.skin, -0.15));
    c.fillStyle = fg;
    ell(c, 0, hy + 1.8, 8.4, 7.9); c.fill();
    // 頬
    c.fillStyle = 'rgba(230,110,100,.22)';
    ell(c, -5, hy + 4.6, 2, 1.1); c.fill(); ell(c, 5, hy + 4.6, 2, 1.1); c.fill();
    // 目
    const ox = Math.cos(h.aim) * 1.1;
    for (const s of [-1, 1]) {
      const ex = s * 3.5 + ox, ey = hy + 2.2;
      c.fillStyle = '#ffffff'; ell(c, ex, ey, 1.9, blink ? 0.3 : 2.4); c.fill();
      c.fillStyle = P.eye; ell(c, ex + ox * 0.3, ey + 0.2, 1.5, blink ? 0.3 : 2.1); c.fill();
      if (!blink) { c.fillStyle = '#fff'; c.fillRect(ex - 0.2, ey - 1.3, 0.9, 0.9); }
      c.strokeStyle = shade(P.hair, -0.3); c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(ex - 1.8, ey - 3.6); c.lineTo(ex + 1.6, ey - 3.9 + s * 0.2); c.stroke();
    }
    c.strokeStyle = 'rgba(120,60,50,.5)'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(-1, hy + 6.2); c.quadraticCurveTo(0, hy + 6.8, 1, hy + 6.2); c.stroke();
    // 前髪
    c.fillStyle = P.hair;
    c.beginPath();
    c.moveTo(-10.8, hy + 2);
    c.quadraticCurveTo(-10.5, hy - 9.5, 0, hy - 11);
    c.quadraticCurveTo(10.5, hy - 9.5, 10.8, hy + 2);
    if (pony) {
      c.lineTo(9.4, hy + 7); c.lineTo(7.6, hy - 1.5); c.quadraticCurveTo(2, hy - 3, -2, hy - 1.2); c.lineTo(-5, hy - 3.8); c.lineTo(-7.6, hy - 0.5); c.lineTo(-9.6, hy + 7);
    } else {
      c.lineTo(8.6, hy - 1.5); c.lineTo(7, hy + 1.2); c.lineTo(4.6, hy - 3.2); c.lineTo(2, hy + 0.6); c.lineTo(-0.8, hy - 3.6); c.lineTo(-3.6, hy + 0.4); c.lineTo(-6.2, hy - 2.8); c.lineTo(-8.4, hy + 1.8);
    }
    c.closePath(); c.fill();
  } else if (view === 1) {
    const fg = c.createLinearGradient(fx * 8, 0, -fx * 2, 0);
    fg.addColorStop(0, shade(P.skin, 0.08)); fg.addColorStop(1, shade(P.skin, -0.2));
    c.fillStyle = fg;
    ell(c, fx * 3.2, hy + 2, 7.2, 7.6); c.fill();
    const ex = fx * 5.4, ey = hy + 2.2;
    c.fillStyle = '#fff'; ell(c, ex, ey, 1.4, blink ? 0.3 : 2.3); c.fill();
    c.fillStyle = P.eye; ell(c, ex + fx * 0.4, ey + 0.2, 1.1, blink ? 0.3 : 2); c.fill();
    if (!blink) { c.fillStyle = '#fff'; c.fillRect(ex + fx * 0.3 - 0.4, ey - 1.2, 0.8, 0.8); }
    c.fillStyle = 'rgba(230,110,100,.22)'; ell(c, fx * 4.2, hy + 5, 1.8, 1); c.fill();
    // 横から見た髪（後頭部側を覆う）
    c.fillStyle = P.hair;
    c.beginPath();
    c.moveTo(fx * 9.5, hy - 2);
    c.quadraticCurveTo(fx * 9, hy - 10.5, 0, hy - 11.4);
    c.quadraticCurveTo(-fx * 11.5, hy - 10, -fx * 11, hy + 3);
    c.lineTo(-fx * 9, hy + (pony ? 6 : 7.5));
    c.lineTo(-fx * 4, hy + 3);
    c.lineTo(fx * 0.5, hy + 1);
    c.lineTo(fx * 2, hy - 2.4);
    c.lineTo(fx * 4.4, hy + 0.2);
    c.lineTo(fx * 6.2, hy - 2.8);
    c.lineTo(fx * 8.2, hy + 0.6);
    c.closePath(); c.fill();
    // 耳
    c.fillStyle = shade(P.skin, -0.1); ell(c, -fx * 0.6, hy + 3, 1.6, 2.2); c.fill();
  } else {
    c.fillStyle = shade(P.hair, -0.1);
    c.beginPath(); c.ellipse(0, hy - 1, 11.2, 10.6, 0, 0, TAU); c.fill();
    c.strokeStyle = rgba(P.hairHi, 0.25); c.lineWidth = 0.9;
    for (const k of [-5, -1.5, 2, 5.5]) { c.beginPath(); c.moveTo(k * 0.4, hy - 10); c.quadraticCurveTo(k, hy - 2, k * 1.1, hy + 8); c.stroke(); }
    c.fillStyle = P.hair;
    c.beginPath(); c.moveTo(-10.6, hy + 2); c.lineTo(-9, hy + 9); c.lineTo(-6, hy + 6.5); c.lineTo(-3, hy + 9.5); c.lineTo(0, hy + 7); c.lineTo(3, hy + 9.5); c.lineTo(6, hy + 6.5); c.lineTo(9, hy + 9); c.lineTo(10.6, hy + 2); c.fill();
    if (pony) drawPony();
  }
  // ハイライト
  c.strokeStyle = rgba(P.hairHi, 0.55); c.lineWidth = 1.5; c.lineCap = 'round';
  c.beginPath(); c.arc(view === 1 ? -fx * 1 : -1.5, hy - 2, 7.4, Math.PI * 1.15, Math.PI * 1.55); c.stroke();
}

function drawLanternArm(c, h, P, fx, t) {
  const sx = -fx * 7.2, sy = -26.5;
  const hx = sx - fx * 2.2, hy = sy + 9.5;
  c.lineCap = 'round';
  c.strokeStyle = shade(P.tunic, -0.25); c.lineWidth = 4.2;
  c.beginPath(); c.moveTo(sx, sy); c.lineTo(hx, hy); c.stroke();
  const la = h.lanAng || 0;
  const lx = hx + Math.sin(la) * 7, ly = hy + Math.cos(la) * 7;
  c.strokeStyle = '#2a2420'; c.lineWidth = 0.9;
  c.beginPath(); c.moveTo(hx, hy); c.lineTo(lx, ly - 1); c.stroke();
  c.save();
  c.translate(lx, ly);
  c.rotate(-la * 0.5);
  c.fillStyle = '#2f2721';
  roundRect(c, -3.6, -1.6, 7.2, 2.4, 1); c.fill();
  const lg = c.createLinearGradient(0, 0, 0, 8);
  const fl = 0.85 + Math.sin(t * 13 + (h.id || 0)) * 0.1;
  lg.addColorStop(0, `rgba(255,236,170,${fl})`); lg.addColorStop(1, 'rgba(240,140,40,.95)');
  c.fillStyle = lg;
  roundRect(c, -3, 0.6, 6, 7.2, 1.5); c.fill();
  c.strokeStyle = '#2f2721'; c.lineWidth = 0.9;
  c.beginPath(); c.moveTo(-3, 0.6); c.lineTo(-3, 7.8); c.moveTo(0, 0.6); c.lineTo(0, 7.8); c.moveTo(3, 0.6); c.lineTo(3, 7.8); c.stroke();
  c.fillStyle = '#2f2721'; roundRect(c, -3.8, 7.6, 7.6, 2.2, 1); c.fill();
  c.restore();
  c.fillStyle = '#5a3b28'; ell(c, hx, hy, 2.4, 2.4); c.fill();
  h._lan = { x: h.x + lx, y: h.y + ly + 4 };
}

function drawWeaponArm(c, h, P, fx, t, bob) {
  const it = h.weapon;
  const W = it ? WEAPONS[it.base] : WEAPONS.sword;
  const a = h._spinAim != null ? h._spinAim : h.aim;
  const sx = fx * 7.4, sy = -26.5;
  const p = h.atkDur ? clamp(h.atkT / h.atkDur, 0, 1) : 1;
  const rest = fx > 0 ? -0.95 : Math.PI + 0.95;
  let ang, hx, hy, pull = 0;
  h._trail = null;
  if (h._spinAim != null) {
    ang = a; hx = sx + Math.cos(a) * 10; hy = sy + 4 + Math.sin(a) * 8;
  } else if (W.kind === 'melee') {
    if (p < 1) {
      const dir = h.atkSeq % 2 ? 1 : -1;
      const arcW = W.arc;
      const sp = easeOut(Math.min(1, p * 1.9));
      const a0 = a - dir * arcW / 2;
      ang = a0 + dir * arcW * sp;
      const back = p > 0.55 ? (p - 0.55) / 0.45 : 0;
      if (back > 0) ang = lerpAng(ang, rest, easeOut(back));
      const reach = 10 - back * 4;
      hx = sx + Math.cos(ang) * reach; hy = sy + 4 + Math.sin(ang) * reach * 0.8;
      if (p < 0.5) h._trail = { a0, a1: ang, dir, alpha: 1 - p / 0.5, r: W.range, ox: sx, oy: sy + 4 - bob };
    } else {
      ang = rest + Math.sin(t * 2) * 0.05;
      hx = sx + fx * 2.5; hy = sy + 8;
    }
  } else if (W.kind === 'thrust') {
    const ext = p < 1 ? Math.sin(Math.PI * Math.min(1, p * 1.25)) * 18 : 0;
    ang = p < 1 ? a : lerpAng(rest, a, 0.45);
    const base = p < 1 ? a : ang;
    hx = sx + Math.cos(base) * (4 + ext); hy = sy + 5 + Math.sin(base) * (4 + ext) * 0.85;
    if (p < 0.45) h._trail = { thrust: true, a, alpha: 1 - p / 0.45, r: W.range, ox: sx, oy: sy + 5 - bob };
  } else if (W.kind === 'bow') {
    ang = a;
    hx = sx + Math.cos(a) * 11; hy = sy + 3 + Math.sin(a) * 9;
    pull = p < 1 ? (p < 0.15 ? 0 : Math.max(0, 1 - (p - 0.15) * 3) * 0) : 7 + Math.sin(t * 2) * 0.5;
    if (p < 1 && p > 0.35) pull = (p - 0.35) / 0.65 * 7;
  } else {
    const cast = p < 1 ? Math.sin(Math.PI * Math.min(1, p * 1.4)) : 0;
    ang = lerpAng(fx > 0 ? -1.2 : Math.PI + 1.2, a, 0.35 + cast * 0.65);
    hx = sx + Math.cos(a) * (6 + cast * 8); hy = sy + 5 + Math.sin(a) * (5 + cast * 6);
  }
  c.lineCap = 'round';
  c.strokeStyle = shade(P.tunic, -0.1); c.lineWidth = 4.2;
  c.beginPath(); c.moveTo(sx, sy); c.lineTo(hx, hy); c.stroke();
  if (it) {
    c.save(); c.translate(hx, hy); c.rotate(ang);
    drawWeapon(c, it, { pull, t });
    c.restore();
  }
  c.fillStyle = '#5a3b28'; ell(c, hx, hy, 2.5, 2.5); c.fill();
  c.fillStyle = 'rgba(255,255,255,.2)'; ell(c, hx - 0.6, hy - 0.8, 1, 0.8); c.fill();
  const L = weaponLen[it ? it.base : 'sword'];
  h._tip = { x: h.x + hx + Math.cos(ang) * L, y: h.y - bob + hy + Math.sin(ang) * L, ang };
}

function drawDowned(c, h, t) {
  const P = h.pal;
  c.save();
  c.globalAlpha = 0.85;
  c.fillStyle = shade(P.cloak, -0.3);
  ell(c, 0, -4, 15, 6); c.fill();
  c.fillStyle = P.tunic; ell(c, 2, -5, 9, 4.5); c.fill();
  c.fillStyle = P.hair; ell(c, -12, -6, 6.5, 5.5); c.fill();
  c.fillStyle = P.skin; ell(c, -12.5, -5, 4, 3.5); c.fill();
  c.restore();
  // 小さな魂の灯
  const fy = -26 + Math.sin(t * 3) * 3;
  c.fillStyle = rgba(P.name, 0.5 + Math.sin(t * 5) * 0.2);
  c.beginPath(); c.moveTo(0, fy - 8); c.quadraticCurveTo(5, fy, 0, fy + 4); c.quadraticCurveTo(-5, fy, 0, fy - 8); c.fill();
}

export function drawSlash(c, h) {
  const tr = h._trail;
  if (!tr) return;
  const it = h.weapon;
  const col = it && it.rarity >= 2 ? RARITY[it.rarity].color : '#ffffff';
  const fireA = it && it.affixes && it.affixes.includes('burn');
  const iceA = it && it.affixes && it.affixes.includes('frost');
  const tint = fireA ? '#ff9a3a' : iceA ? '#9ad8ff' : col;
  c.save();
  c.translate(h.x + tr.ox, h.y + tr.oy);
  if (tr.thrust) {
    c.rotate(tr.a);
    const g = c.createLinearGradient(10, 0, tr.r, 0);
    g.addColorStop(0, rgba('#ffffff', 0));
    g.addColorStop(1, rgba(tint, 0.85 * tr.alpha));
    c.fillStyle = g;
    c.beginPath(); c.moveTo(10, -3); c.lineTo(tr.r, -1); c.lineTo(tr.r + 8, 0); c.lineTo(tr.r, 1); c.lineTo(10, 3); c.fill();
  } else {
    const steps = 14;
    const r0 = 16, r1 = tr.r * 0.98;
    for (let i = 0; i < steps; i++) {
      const k0 = i / steps, k1 = (i + 1) / steps;
      const a0 = lerp(tr.a0, tr.a1, k0), a1 = lerp(tr.a0, tr.a1, k1);
      const al = tr.alpha * k1 * 0.75;
      c.fillStyle = rgba(i > steps - 3 ? '#ffffff' : tint, al);
      c.beginPath();
      const rr = lerp(r0 + 10, r0, k1);
      c.arc(0, 0, r1, a0, a1, tr.dir < 0);
      c.arc(0, 0, rr, a1, a0, tr.dir > 0);
      c.closePath();
      c.fill();
    }
  }
  c.restore();
}

// ---------- 敵 ----------
const SLIME_COL = [['#7fd86a', '#d9ffc4', '#2f7a2a'], ['#b07ae8', '#f0dcff', '#56308a'], ['#ff8a3a', '#ffe0a0', '#9a2a10'], ['#7ac8f0', '#e0f6ff', '#2a6a9a']];

export function drawEnemy(c, e, t) {
  c.save();
  c.translate(e.x, e.y);
  if (e.elite) { c.fillStyle = 'rgba(255,190,80,.18)'; ell(c, 0, 0, e.r * 1.6, e.r * 0.65); c.fill(); }
  switch (e.type) {
    case 'slime': case 'slimeL': drawSlime(c, e, t); break;
    case 'bat': drawBat(c, e, t); break;
    case 'skel': drawSkel(c, e, t); break;
    case 'mage': drawMage(c, e, t); break;
    case 'golem': drawGolem(c, e, t); break;
  }
  c.restore();
}

const stProg = (e) => clamp(e.st / (e.stDur || 1), 0, 1);

function drawSlime(c, e, t) {
  const S = (e.type === 'slimeL' ? 1.45 : 1) * (e.elite ? 1.18 : 1);
  const [base, light, dark] = SLIME_COL[(e.var || 0) % 4];
  let z = 0, sx = 1, sy = 1, tx = 0;
  const ph = (t * 1.6 + (e.seed || 0)) % 1;
  if (e.state === 'wind') { const k = stProg(e); sx = 1 + 0.28 * k; sy = 1 - 0.25 * k; tx = Math.sin(t * 60) * k * 1.2; }
  else if (e.state === 'atk') { const k = stProg(e); z = Math.sin(k * Math.PI) * 18; sx = 0.84; sy = 1.22; }
  else if (e.moving) { const s = Math.sin(ph * TAU); z = Math.max(0, s) * 7; sx = 1 + (s < 0 ? -s * 0.12 : -s * 0.08); sy = 1 - (s < 0 ? -s * 0.12 : -s * 0.08) + (s > 0 ? s * 0.08 : 0); }
  else { const s = Math.sin(t * 3 + (e.seed || 0) * 10); sx = 1 + s * 0.04; sy = 1 - s * 0.04; }
  if (e.slow > 0) { sx = 1; sy = 1; z = 0; }
  c.save(); c.scale(S, S);
  shadow(c, 14 * (1 - z / 50), 5 * (1 - z / 50));
  c.translate(tx, -z);
  c.scale(sx, sy);
  const g = c.createRadialGradient(-5, -14, 1, 0, -8, 18);
  g.addColorStop(0, light); g.addColorStop(0.35, base); g.addColorStop(1, dark);
  c.globalAlpha = 0.93;
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-15, -1);
  c.bezierCurveTo(-16, -10, -9, -21, 0, -21);
  c.bezierCurveTo(9, -21, 16, -10, 15, -1);
  c.quadraticCurveTo(0, 2.5, -15, -1);
  c.fill();
  c.globalAlpha = 1;
  c.fillStyle = rgba(dark, 0.45);
  ell(c, 2, -6, 6.5, 4); c.fill();
  c.fillStyle = rgba(light, 0.55);
  for (let i = 0; i < 3; i++) { const by = -3 - ((t * 6 + i * 5 + (e.seed || 0) * 9) % 14); ell(c, -6 + i * 5, by, 1.2, 1.2); c.fill(); }
  c.strokeStyle = rgba(dark, 0.6); c.lineWidth = 1;
  c.beginPath(); c.moveTo(-15, -1); c.bezierCurveTo(-16, -10, -9, -21, 0, -21); c.bezierCurveTo(9, -21, 16, -10, 15, -1); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.8)';
  ell(c, -6.5, -14, 4, 2.2, -0.6); c.fill();
  ell(c, -2, -17.5, 1, 0.8); c.fill();
  const ox = Math.cos(e.aim || 0) * 2.6, oy = Math.sin(e.aim || 0) * 1.2;
  for (const s of [-1, 1]) {
    c.fillStyle = '#1a1420'; ell(c, s * 4 + ox, -9 + oy, 1.9, 2.9); c.fill();
    c.fillStyle = '#fff'; ell(c, s * 4 + ox - 0.5, -10 + oy, 0.7, 0.7); c.fill();
  }
  if (e.state === 'wind' || e.state === 'atk') {
    c.strokeStyle = '#1a1420'; c.lineWidth = 1.2;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6.5 + ox, -13.5 + oy); c.lineTo(s * 1.8 + ox, -12 + oy); c.stroke(); }
  }
  if (e.slow > 0) { c.fillStyle = 'rgba(170,225,255,.35)'; c.beginPath(); c.moveTo(-15, -1); c.bezierCurveTo(-16, -10, -9, -21, 0, -21); c.bezierCurveTo(9, -21, 16, -10, 15, -1); c.fill(); }
  c.restore();
}

function drawBat(c, e, t) {
  const S = e.elite ? 1.25 : 1;
  let z = 26 + Math.sin(t * 4 + (e.seed || 0) * 6) * 4;
  if (e.state === 'atk') z = 12;
  c.save(); c.scale(S, S);
  shadow(c, 8, 3, 0.25);
  c.translate(0, -z);
  const flap = Math.sin(t * (e.state === 'atk' ? 30 : 20) + (e.seed || 0) * 20);
  for (const s of [-1, 1]) {
    const wg = c.createLinearGradient(0, -10, s * 22, 6);
    wg.addColorStop(0, '#3b2645'); wg.addColorStop(1, '#170f1d');
    c.fillStyle = wg;
    c.beginPath();
    c.moveTo(s * 4, -3);
    c.quadraticCurveTo(s * 10, -12 - flap * 7, s * 22, -5 - flap * 9);
    c.quadraticCurveTo(s * 19, 0 - flap * 4, s * 20, 3 - flap * 3);
    c.quadraticCurveTo(s * 16, 1, s * 14, 6 - flap * 1.5);
    c.quadraticCurveTo(s * 10, 3, s * 8, 6);
    c.quadraticCurveTo(s * 6, 3, s * 4, 4);
    c.closePath(); c.fill();
    c.strokeStyle = '#5a4364'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(s * 4, -2); c.lineTo(s * 12, -9 - flap * 6); c.lineTo(s * 22, -5 - flap * 9); c.moveTo(s * 12, -9 - flap * 6); c.lineTo(s * 20, 3 - flap * 3); c.moveTo(s * 12, -9 - flap * 6); c.lineTo(s * 14, 6 - flap * 1.5); c.stroke();
  }
  const bg = c.createRadialGradient(-2, -3, 1, 0, 0, 9);
  bg.addColorStop(0, '#6a4a74'); bg.addColorStop(1, '#22172a');
  c.fillStyle = bg;
  ell(c, 0, 0, 6.5, 7.5); c.fill();
  c.fillStyle = '#2a1d31';
  c.beginPath(); c.moveTo(-5, -4); c.lineTo(-6, -12); c.lineTo(-1.5, -6); c.moveTo(5, -4); c.lineTo(6, -12); c.lineTo(1.5, -6); c.fill();
  c.fillStyle = '#8a6a8a'; ell(c, 0, 3, 3.5, 3.5); c.fill();
  c.fillStyle = '#ff5a4a'; ell(c, -2.4, -1.5, 1.3, 1.1); c.fill(); ell(c, 2.4, -1.5, 1.3, 1.1); c.fill();
  c.fillStyle = '#fff';
  c.beginPath(); c.moveTo(-1.6, 1.8); c.lineTo(-0.9, 4); c.lineTo(-0.3, 1.8); c.moveTo(1.6, 1.8); c.lineTo(0.9, 4); c.lineTo(0.3, 1.8); c.fill();
  c.restore();
  e._eyes = [[e.x - 2.4 * S, e.y - z * S - 1.5 * S, '#ff4a3a']];
}

function drawSkel(c, e, t) {
  const S = e.elite ? 1.15 : 1;
  const a = e.aim || 0, fx = Math.cos(a) >= 0 ? 1 : -1;
  const ph = e.walk || 0, mv = e.moving ? 1 : 0;
  const B = '#e6dec8', Bd = '#a8a08a', K = '#3a342c';
  c.save(); c.scale(S, S);
  shadow(c, 12, 4.5);
  const bob = mv * Math.abs(Math.sin(ph)) * 1.8;
  c.translate(0, -bob);
  c.lineCap = 'round';
  // 脚
  for (const i of [0, 1]) {
    const s = i ? 1 : -1, sw = Math.sin(ph + i * Math.PI) * mv;
    const kx = s * 3 + fx * sw * 3, fxp = s * 3 + fx * sw * 6;
    c.strokeStyle = Bd; c.lineWidth = 2.6;
    c.beginPath(); c.moveTo(s * 3, -15); c.lineTo(kx, -8); c.lineTo(fxp, -1.5); c.stroke();
    c.strokeStyle = B; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(s * 3, -15); c.lineTo(kx, -8); c.lineTo(fxp, -1.5); c.stroke();
    c.fillStyle = B; ell(c, kx, -8, 1.6, 1.6); c.fill();
    ell(c, fxp + fx * 1.5, -1.2, 3, 1.4); c.fill();
  }
  // 腰布
  c.fillStyle = '#5a2a28';
  c.beginPath(); c.moveTo(-6, -17); c.lineTo(6, -17); c.lineTo(5, -10); c.lineTo(3, -12); c.lineTo(1, -9); c.lineTo(-1.5, -12); c.lineTo(-4, -9.5); c.lineTo(-6, -12); c.fill();
  c.fillStyle = Bd; roundRect(c, -5, -18, 10, 3, 1.5); c.fill();
  // 背骨と肋骨
  c.strokeStyle = Bd; c.lineWidth = 2.2;
  c.beginPath(); c.moveTo(0, -17); c.lineTo(0, -29); c.stroke();
  c.strokeStyle = B; c.lineWidth = 1.5;
  for (let i = 0; i < 4; i++) {
    const y = -27 + i * 2.6, w = 7 - i * 0.9;
    c.beginPath(); c.moveTo(0, y); c.quadraticCurveTo(-w, y - 0.5, -w * 0.8, y + 2.2); c.moveTo(0, y); c.quadraticCurveTo(w, y - 0.5, w * 0.8, y + 2.2); c.stroke();
  }
  c.fillStyle = B; roundRect(c, -7.5, -30.5, 15, 2.6, 1.2); c.fill();
  // 武器の構え
  const p = stProg(e);
  let wa;
  if (e.state === 'wind') wa = a - fx * (1.2 + p * 0.9);
  else if (e.state === 'atk') wa = a - fx * 2.1 + fx * easeOut(Math.min(1, p * 2.2)) * 3.2;
  else wa = fx > 0 ? -0.9 : Math.PI + 0.9;
  const sx = fx * 6, sy = -28.5;
  const hx = sx + Math.cos(wa) * 9, hy = sy + 4 + Math.sin(wa) * 7;
  // 反対の腕
  c.strokeStyle = B; c.lineWidth = 1.7;
  c.beginPath(); c.moveTo(-sx, sy); c.lineTo(-sx - fx * 1.5, sy + 7); c.lineTo(-sx - fx * 0.5, sy + 13); c.stroke();
  const drawArm = () => {
    c.strokeStyle = B; c.lineWidth = 1.8;
    c.beginPath(); c.moveTo(sx, sy); c.lineTo((sx + hx) / 2 + fx, (sy + hy) / 2 + 2); c.lineTo(hx, hy); c.stroke();
    c.save(); c.translate(hx, hy); c.rotate(wa); drawWeapon(c, { base: 'sword', rarity: 0 }, { rust: true }); c.restore();
    c.fillStyle = B; ell(c, hx, hy, 1.8, 1.8); c.fill();
  };
  if (Math.sin(wa) < -0.2) { /* 頭の後ろ */ }
  const behind = Math.sin(wa) < -0.3;
  if (behind) drawArm();
  // 頭蓋骨
  const hy0 = -36;
  const sg = c.createRadialGradient(-2, hy0 - 3, 1, 0, hy0, 9);
  sg.addColorStop(0, '#fffaf0'); sg.addColorStop(1, Bd);
  c.fillStyle = sg;
  ell(c, fx * 0.5, hy0, 7.6, 7.2); c.fill();
  roundRect(c, fx * 1 - 4.5, hy0 + 3.5, 9, 5, 2); c.fill();
  c.strokeStyle = K; c.lineWidth = 0.6;
  for (let i = -3; i <= 3; i += 1.5) { c.beginPath(); c.moveTo(fx + i, hy0 + 5.2); c.lineTo(fx + i, hy0 + 8); c.stroke(); }
  c.fillStyle = K;
  const ex = Math.cos(a) * 1.6;
  ell(c, -3 + ex, hy0 + 0.5, 2.3, 2.6); c.fill(); ell(c, 3 + ex, hy0 + 0.5, 2.3, 2.6); c.fill();
  c.beginPath(); c.moveTo(ex, hy0 + 2.5); c.lineTo(ex - 1, hy0 + 4.5); c.lineTo(ex + 1, hy0 + 4.5); c.fill();
  c.strokeStyle = 'rgba(60,50,40,.6)'; c.beginPath(); c.moveTo(2, hy0 - 7); c.lineTo(3.5, hy0 - 3.5); c.lineTo(2.5, hy0 - 2); c.stroke();
  if (e.elite) {
    const hg = c.createLinearGradient(0, hy0 - 9, 0, hy0 - 1);
    hg.addColorStop(0, '#9a8a7a'); hg.addColorStop(1, '#4a3a30');
    c.fillStyle = hg;
    c.beginPath(); c.ellipse(fx * 0.5, hy0 - 2, 8.6, 8, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#c9a24e'; c.fillRect(-1, hy0 - 12, 2, 4);
  }
  if (!behind) drawArm();
  c.restore();
  const ec = e.elite ? '#ffb040' : '#6ad0ff';
  e._eyes = [[e.x + (-3 + ex) * S, e.y + (hy0 + 0.5 - bob) * S, ec], [e.x + (3 + ex) * S, e.y + (hy0 + 0.5 - bob) * S, ec]];
}

function drawMage(c, e, t) {
  const S = e.elite ? 1.15 : 1;
  const a = e.aim || 0, fx = Math.cos(a) >= 0 ? 1 : -1;
  const z = 5 + Math.sin(t * 2 + (e.seed || 0) * 5) * 2.2;
  c.save(); c.scale(S, S);
  shadow(c, 11, 4, 0.3);
  c.translate(0, -z);
  const sw = Math.sin(t * 2.4 + (e.seed || 0)) * 1.5;
  const rg = c.createLinearGradient(-12, 0, 12, 0);
  rg.addColorStop(0, '#4a2e66'); rg.addColorStop(0.5, '#33204a'); rg.addColorStop(1, '#170e22');
  c.fillStyle = rg;
  c.beginPath();
  c.moveTo(-6.5, -29);
  c.quadraticCurveTo(-10, -15, -12 + sw, 1);
  for (let i = 0; i <= 6; i++) { const x = -12 + i * 4 + sw * (1 - i / 6); c.lineTo(x, 1 + (i % 2 ? -2.5 : 0.5)); }
  c.quadraticCurveTo(10, -15, 6.5, -29);
  c.closePath(); c.fill();
  c.strokeStyle = '#c9a24e'; c.lineWidth = 1.1;
  c.beginPath(); c.moveTo(-11.5 + sw, -1); c.lineTo(12, -1); c.stroke();
  c.beginPath(); c.moveTo(0, -27); c.lineTo(sw * 0.5, -1); c.stroke();
  c.fillStyle = '#7a2a3a'; c.fillRect(-6, -18, 12, 2.4);
  // フード
  const hy = -35;
  c.fillStyle = '#2b1a3e';
  c.beginPath(); c.moveTo(-9, hy + 7); c.quadraticCurveTo(-10, hy - 6, -fx * 3, hy - 11); c.quadraticCurveTo(-fx * 8, hy - 15, -fx * 11, hy - 13); c.quadraticCurveTo(9, hy - 10, 9, hy + 7); c.closePath(); c.fill();
  c.fillStyle = '#05030a';
  ell(c, fx * 1.6, hy + 1.5, 5.6, 6.2); c.fill();
  // 腕とオーブ
  const p = stProg(e);
  const charge = e.state === 'wind' ? p : 0;
  const hx = Math.cos(a) * 11, hyy = -19 + Math.sin(a) * 6;
  c.strokeStyle = '#33204a'; c.lineWidth = 4.5; c.lineCap = 'round';
  c.beginPath(); c.moveTo(fx * 5, -26); c.lineTo(hx, hyy); c.stroke();
  c.fillStyle = '#d8c0e8'; ell(c, hx, hyy, 2, 2); c.fill();
  c.restore();
  const ox = e.x + hx * S, oy = e.y + (hyy - z) * S - 5;
  e._orb = { x: ox, y: oy, r: 4 + charge * 7 + Math.sin(t * 8) * 0.6 };
  e._eyes = [[e.x + (fx * 1.6 - 2) * S, e.y + (hy + 1 - z) * S, '#d070ff'], [e.x + (fx * 1.6 + 2) * S, e.y + (hy + 1 - z) * S, '#d070ff']];
}

function rock(c, cx, cy, rx, ry, seed, col) {
  const n = 9, pts = [];
  for (let i = 0; i < n; i++) {
    const an = (i / n) * TAU, j = 0.82 + hash(seed, i, 3) * 0.3;
    pts.push([cx + Math.cos(an) * rx * j, cy + Math.sin(an) * ry * j]);
  }
  const g = c.createLinearGradient(cx - rx, cy - ry, cx + rx * 0.6, cy + ry);
  g.addColorStop(0, shade(col, 0.22)); g.addColorStop(0.55, col); g.addColorStop(1, shade(col, -0.5));
  c.fillStyle = g;
  c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.2; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(pts[5][0], pts[5][1]); c.lineTo(pts[6][0], pts[6][1]); c.lineTo(pts[7][0], pts[7][1]); c.stroke();
}

function drawGolem(c, e, t) {
  const col = ['#7a7468', '#5f6e58', '#6e4e44', '#6a7a8c'][(e.var || 0) % 4];
  const p = stProg(e);
  const ph = e.walk || 0, mv = e.moving ? 1 : 0;
  const bob = Math.abs(Math.sin(ph)) * 3 * mv;
  let armY = 0, lean = 0, armX = 0;
  if (e.state === 'wind' && e.atk === 'slam') { armY = -26 * easeOut(p); lean = -3 * p; }
  else if (e.state === 'atk' && e.atk === 'slam') { armY = lerp(-26, 14, easeOut(Math.min(1, p * 3))); lean = 3; }
  else if (e.state === 'wind' && e.atk === 'throw') { armY = -18 * p; armX = -8 * p; }
  const sd = e.id * 7;
  shadow(c, 42, 14, 0.42);
  c.save();
  c.translate(0, -bob);
  // 脚
  for (const s of [-1, 1]) {
    const sw = Math.sin(ph + (s > 0 ? Math.PI : 0)) * mv * 3;
    rock(c, s * 15, -12 + Math.min(0, sw), 10, 11, sd + s, shade(col, -0.15));
  }
  // 後ろの腕
  const arm = (s) => {
    const ax = s * (37 + armX * (s < 0 ? 0 : 1)), ay = -52 + armY;
    rock(c, ax, ay, 12, 11, sd + 10 + s, col);
    rock(c, ax + s * 3, ay + 20 + armY * 0.15, 13, 12, sd + 20 + s, shade(col, -0.1));
  };
  arm(-1);
  c.translate(lean, 0);
  rock(c, 0, -48, 30, 27, sd + 1, col);
  // 苔
  c.fillStyle = 'rgba(110,150,70,.55)';
  ell(c, -8, -70, 12, 4); c.fill(); ell(c, 12, -66, 7, 3); c.fill();
  // ルーン
  const rc = e.enraged ? '#ff4a2a' : '#ffb04a';
  c.strokeStyle = rgba(rc, 0.9); c.lineWidth = 2;
  c.beginPath(); c.moveTo(-12, -58); c.lineTo(-4, -50); c.lineTo(-9, -40); c.moveTo(6, -60); c.lineTo(10, -48); c.lineTo(4, -36); c.lineTo(9, -30); c.stroke();
  rock(c, 0, -80, 14, 12, sd + 2, shade(col, 0.05));
  c.fillStyle = '#120c08'; ell(c, Math.cos(e.aim || 0) * 3, -80, 5, 3.5); c.fill();
  arm(1);
  c.restore();
  e._eyes = [[e.x + Math.cos(e.aim || 0) * 3 + lean, e.y - 80 - bob, rc, 9]];
  e._runes = { x: e.x + lean, y: e.y - bob, col: rc };
}

export function drawEnemyGlow(c, e, t) {
  if (e._eyes) for (const [x, y, col, r] of e._eyes) { glow(c, x, y, r || 5, col, 0.9); }
  if (e._orb) {
    glow(c, e._orb.x, e._orb.y, e._orb.r * 3.5, '#b050ff', 0.8);
    glow(c, e._orb.x, e._orb.y, e._orb.r * 1.2, '#ffffff', 0.7);
  }
  if (e._runes) glow(c, e._runes.x, e._runes.y - 48, 40, e._runes.col, 0.25 + Math.sin(t * 3) * 0.08);
  if (e.burn > 0) glow(c, e.x, e.y - 12, 18, '#ff6a20', 0.4);
}

// 攻撃の予兆（床に描く）
export function drawTelegraph(c, e, t) {
  if (e.state !== 'wind') return;
  const p = stProg(e);
  c.save();
  c.translate(e.x, e.y);
  if (e.type === 'skel') {
    const R = 70, arc = 1.7;
    c.fillStyle = `rgba(255,60,40,${0.12 + p * 0.12})`;
    c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, e.aim - arc / 2, e.aim + arc / 2); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,80,50,.3)';
    c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R * p, e.aim - arc / 2, e.aim + arc / 2); c.closePath(); c.fill();
  } else if (e.type === 'slime' || e.type === 'slimeL' || e.type === 'bat') {
    const L = e.type === 'bat' ? 140 : 110;
    c.rotate(e.aim);
    const w = e.type === 'slimeL' ? 16 : 10;
    c.fillStyle = `rgba(255,70,50,${0.1 + p * 0.15})`;
    roundRect(c, 0, -w, L, w * 2, w); c.fill();
  } else if (e.type === 'golem') {
    if (e.atk === 'slam') {
      c.strokeStyle = 'rgba(255,60,40,.6)'; c.lineWidth = 2;
      ell(c, 0, 0, 140, 140 * 0.62); c.stroke();
      c.fillStyle = `rgba(255,60,40,${0.1 + p * 0.18})`;
      ell(c, 0, 0, 140 * p, 140 * 0.62 * p); c.fill();
    }
  }
  c.restore();
}

// ---------- オブジェクト ----------
export function drawChest(c, ch, t) {
  c.save();
  c.translate(ch.x, ch.y);
  shadow(c, 19, 6);
  const gold = ch.gold;
  const wood1 = gold ? '#8a5a2a' : '#7a4a26', wood2 = gold ? '#4a2a10' : '#40220f';
  const band = gold ? '#e2b44a' : '#4a4a52', bandHi = gold ? '#fff0b0' : '#8a8a96';
  const op = ch.openT || 0;
  // 本体
  const g = c.createLinearGradient(0, -16, 0, 0);
  g.addColorStop(0, wood1); g.addColorStop(1, wood2);
  c.fillStyle = g;
  roundRect(c, -17, -16, 34, 16, 2); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.8;
  c.beginPath(); c.moveTo(-17, -8); c.lineTo(17, -8); c.stroke();
  if (op > 0) {
    // 中身の光
    c.fillStyle = '#1a0e06'; roundRect(c, -15, -22, 30, 7, 2); c.fill();
    c.fillStyle = rgba('#ffd27a', 0.8 * op); roundRect(c, -13, -21, 26, 5, 2); c.fill();
  }
  for (const x of [-11, 11]) { c.fillStyle = band; c.fillRect(x - 2, -16, 4, 16); c.fillStyle = bandHi; c.fillRect(x - 2, -16, 1, 16); }
  // ふた
  c.save();
  c.translate(0, -16);
  const lidA = easeOut(op) * 1.9;
  c.scale(1, Math.cos(lidA));
  c.translate(0, op > 0 ? -2 * op : 0);
  const lg = c.createLinearGradient(0, -12, 0, 0);
  lg.addColorStop(0, shade(wood1, 0.2)); lg.addColorStop(1, wood2);
  c.fillStyle = lg;
  c.beginPath(); c.moveTo(-18, 0); c.lineTo(-18, -6); c.quadraticCurveTo(-18, -13, -10, -13); c.lineTo(10, -13); c.quadraticCurveTo(18, -13, 18, -6); c.lineTo(18, 0); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 0.9; c.stroke();
  for (const x of [-11, 11]) { c.fillStyle = band; c.fillRect(x - 2, -13, 4, 13); c.fillStyle = bandHi; c.fillRect(x - 2, -13, 1, 13); }
  c.restore();
  if (op < 0.3) {
    c.fillStyle = gold ? '#fff0b0' : '#d6b25a';
    roundRect(c, -3.5, -19, 7, 8, 1.5); c.fill();
    c.fillStyle = '#2a1a0a'; ell(c, 0, -16, 1.2, 1.2); c.fill(); c.fillRect(-0.5, -16, 1, 3);
  }
  c.restore();
}

export function drawChestGlow(c, ch, t) {
  const op = ch.openT || 0;
  if (!ch.open) { glow(c, ch.x, ch.y - 12, 26, ch.gold ? '#ffcf5a' : '#ffb84a', 0.18 + Math.sin(t * 3 + ch.id) * 0.06); return; }
  if (op < 1) glow(c, ch.x, ch.y - 30, 70 * op, '#ffd27a', 0.9 * (1 - op * 0.6));
  else glow(c, ch.x, ch.y - 18, 22, '#ffd27a', 0.12);
}

export function drawLoot(c, L, t) {
  const it = L.item;
  const bob = Math.sin(t * 3 + L.seed) * 2.5 + 7 + (L.z || 0);
  c.save();
  c.translate(L.x, L.y);
  shadow(c, 9, 3, 0.3);
  c.translate(0, -bob);
  if (it.cat === 'weapon') {
    const len = weaponLen[it.base] || 30;
    c.rotate(-0.7);
    c.scale(0.8, 0.8);
    c.translate(it.base === 'bow' ? -3 : -len * 0.45, 0);
    drawWeapon(c, it, { t });
  } else if (it.cat === 'skill') {
    drawScroll(c, it.skill, 1);
  } else if (it.cat === 'heal') {
    const g = c.createRadialGradient(-2, -2, 0, 0, 0, 7);
    g.addColorStop(0, '#ffe0e0'); g.addColorStop(0.4, '#ff4a5a'); g.addColorStop(1, '#8a1020');
    c.fillStyle = g; ell(c, 0, 0, 6, 6); c.fill();
  }
  c.restore();
}
export function drawLootGlow(c, L, t) {
  const it = L.item;
  const col = it.cat === 'heal' ? '#ff4a5a' : RARITY[it.rarity || 0].color;
  if (it.cat !== 'heal') {
    const h = 50 + (it.rarity || 0) * 18;
    const g = c.createLinearGradient(0, L.y - h, 0, L.y);
    g.addColorStop(0, rgba(col, 0));
    g.addColorStop(1, rgba(col, 0.3 + (it.rarity || 0) * 0.06));
    c.fillStyle = g;
    c.fillRect(L.x - 3, L.y - h, 6, h);
  }
  glow(c, L.x, L.y - 8, 22 + (it.rarity || 0) * 3, col, 0.5);
}

function drawScroll(c, skill, s) {
  c.save(); c.scale(s, s);
  const col = SKILLS[skill].color;
  c.fillStyle = '#e8d8b0';
  roundRect(c, -8, -6, 16, 12, 2); c.fill();
  c.fillStyle = '#c9b48a';
  roundRect(c, -10, -7, 4, 14, 2); c.fill(); roundRect(c, 6, -7, 4, 14, 2); c.fill();
  c.fillStyle = '#8a6a3a'; c.fillRect(-9, -7, 2, 14); c.fillRect(7, -7, 2, 14);
  c.fillStyle = col; ell(c, 0, 0, 3.2, 3.2); c.fill();
  c.fillStyle = '#7a1a1a'; c.fillRect(-1.2, 4, 2.4, 4);
  c.restore();
}

export function drawPortal(c, x, y, t, active) {
  c.save();
  c.translate(x, y);
  c.scale(1, 0.55);
  c.fillStyle = 'rgba(0,0,0,.4)'; ell(c, 0, 0, 52, 52); c.fill();
  c.strokeStyle = active ? 'rgba(140,230,255,.9)' : 'rgba(150,150,170,.35)';
  c.lineWidth = 3; ell(c, 0, 0, 48, 48); c.stroke();
  c.lineWidth = 1.5; ell(c, 0, 0, 38, 38); c.stroke();
  c.rotate(t * (active ? 0.6 : 0.1));
  for (let i = 0; i < 8; i++) {
    c.rotate(TAU / 8);
    c.beginPath(); c.moveTo(40, -3); c.lineTo(46, 0); c.lineTo(40, 3); c.moveTo(30, 0); c.lineTo(36, 0); c.stroke();
  }
  c.rotate(-t * (active ? 1.4 : 0.2));
  c.beginPath();
  for (let i = 0; i < 6; i++) { const an = (i / 6) * TAU; c[i ? 'lineTo' : 'moveTo'](Math.cos(an) * 26, Math.sin(an) * 26); }
  c.closePath(); c.stroke();
  c.beginPath();
  for (let i = 0; i < 3; i++) { const an = (i / 3) * TAU; c[i ? 'lineTo' : 'moveTo'](Math.cos(an) * 26, Math.sin(an) * 26); }
  c.closePath(); c.stroke();
  c.restore();
}
export function drawPortalGlow(c, x, y, t, active) {
  if (!active) return;
  glow(c, x, y, 70, '#5ad0ff', 0.55 + Math.sin(t * 3) * 0.1);
  const g = c.createLinearGradient(0, y - 140, 0, y);
  g.addColorStop(0, 'rgba(90,208,255,0)');
  g.addColorStop(1, 'rgba(90,208,255,.28)');
  c.fillStyle = g;
  c.fillRect(x - 40, y - 140, 80, 140);
}

export function drawTorch(c, tc, t) {
  c.save();
  c.translate(tc.x, tc.y);
  c.fillStyle = '#1f1a17';
  c.fillRect(-1.5, 2, 3, 9);
  c.beginPath(); c.moveTo(-5, -1); c.lineTo(5, -1); c.lineTo(3, 4); c.lineTo(-3, 4); c.fill();
  c.fillStyle = '#4a3a30'; c.fillRect(-5, -2, 10, 1.5);
  c.restore();
}
export function drawTorchGlow(c, tc, t) {
  const f = Math.sin(t * 9 + tc.x) * 0.5 + Math.sin(t * 23 + tc.y) * 0.3;
  const x = tc.x, y = tc.y - 4;
  glow(c, x, y - 4, 26 + f * 3, '#ff8a2a', 0.55);
  c.save();
  c.translate(x, y);
  c.globalCompositeOperation = 'lighter';
  const flame = (h, w, col) => {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(-w, 0); c.quadraticCurveTo(-w * 0.8, -h * 0.6, f * 1.5, -h); c.quadraticCurveTo(w * 0.8, -h * 0.6, w, 0); c.quadraticCurveTo(0, w * 0.6, -w, 0); c.fill();
  };
  flame(15 + f * 3, 5, 'rgba(255,90,20,.75)');
  flame(10 + f * 2, 3.4, 'rgba(255,190,60,.85)');
  flame(5 + f, 1.8, 'rgba(255,250,220,.95)');
  c.restore();
}

export function drawProj(c, p, t) {
  if (p.kind === 'arrow') {
    c.save(); c.translate(p.x, p.y);
    c.fillStyle = 'rgba(0,0,0,.25)'; ell(c, 0, 0, 7, 2); c.fill();
    c.translate(0, -16); c.rotate(Math.atan2(p.vy, p.vx));
    c.strokeStyle = '#a07850'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-12, 0); c.lineTo(8, 0); c.stroke();
    c.fillStyle = '#d8dce4'; c.beginPath(); c.moveTo(8, -2.4); c.lineTo(13, 0); c.lineTo(8, 2.4); c.fill();
    c.fillStyle = '#e8e0d0'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-15, -3); c.lineTo(-9, 0); c.lineTo(-15, 3); c.fill();
    c.restore();
  } else if (p.kind === 'rock') {
    const z = p.z || 0;
    c.save(); c.translate(p.x, p.y);
    c.fillStyle = 'rgba(0,0,0,.35)'; ell(c, 0, 0, 10, 4); c.fill();
    c.translate(0, -z - 10); c.rotate(t * 8);
    rock(c, 0, 0, 9, 8, p.id || 3, '#7a7468');
    c.restore();
  } else {
    c.fillStyle = 'rgba(0,0,0,.2)'; ell(c, p.x, p.y, 6, 2.4); c.fill();
  }
}
export function drawProjGlow(c, p, t) {
  const y = p.y - 16;
  if (p.kind === 'bolt') {
    const col = p.col || '#7fc8ff';
    const ang = Math.atan2(p.vy, p.vx);
    for (let i = 1; i <= 5; i++) glow(c, p.x - Math.cos(ang) * i * 6, y - Math.sin(ang) * i * 6, 12 - i * 1.5, col, 0.35);
    glow(c, p.x, y, 20, col, 0.9);
    glow(c, p.x, y, 6, '#ffffff', 1);
  } else if (p.kind === 'fireball') {
    glow(c, p.x, y, 34, '#ff6a1a', 0.9);
    glow(c, p.x, y, 14, '#ffd27a', 1);
    glow(c, p.x, y, 6, '#ffffff', 1);
  } else if (p.kind === 'eorb') {
    glow(c, p.x, y, 22, '#b050ff', 0.9);
    glow(c, p.x, y, 7, '#ffd0ff', 1);
  } else if (p.kind === 'arrow' && p.col) {
    glow(c, p.x, y, 14, p.col, 0.5);
  }
}

// ---------- アイコン ----------
export function drawSkillIcon(c, id, S) {
  const col = SKILLS[id].color;
  c.save();
  c.translate(S / 2, S / 2);
  const s = S / 48;
  c.scale(s, s);
  const bg = c.createRadialGradient(0, -6, 2, 0, 0, 26);
  bg.addColorStop(0, shade(col, -0.35)); bg.addColorStop(1, '#0d0b12');
  c.fillStyle = bg;
  ell(c, 0, 0, 23, 23); c.fill();
  c.strokeStyle = rgba(col, 0.6); c.lineWidth = 1.5; c.stroke();
  c.fillStyle = col; c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
  switch (id) {
    case 'fireball': {
      const g = c.createRadialGradient(-2, 3, 1, 0, 2, 12);
      g.addColorStop(0, '#fff6d0'); g.addColorStop(0.4, '#ffb040'); g.addColorStop(1, '#d0400a');
      c.fillStyle = g;
      c.beginPath(); c.moveTo(-9, 6); c.quadraticCurveTo(-11, -6, 2, -15); c.quadraticCurveTo(-1, -6, 6, -6); c.quadraticCurveTo(10, 0, 9, 6); c.quadraticCurveTo(0, 15, -9, 6); c.fill();
      break;
    }
    case 'whirl':
      c.lineWidth = 3;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0, 0, 13 - i * 4, i * 2, i * 2 + 4); c.stroke(); }
      c.fillStyle = '#fff'; c.beginPath(); c.moveTo(11, -6); c.lineTo(15, -1); c.lineTo(9, -1); c.fill();
      break;
    case 'dash':
      c.lineWidth = 2.5;
      for (const y of [-7, 0, 7]) { c.beginPath(); c.moveTo(-14 + Math.abs(y), y); c.lineTo(2, y); c.stroke(); }
      c.beginPath(); c.moveTo(4, -10); c.lineTo(14, 0); c.lineTo(4, 10); c.stroke();
      break;
    case 'heal': {
      const g = c.createRadialGradient(0, 0, 1, 0, 0, 14);
      g.addColorStop(0, '#fff8e0'); g.addColorStop(1, rgba(col, 0));
      c.fillStyle = g; ell(c, 0, 0, 14, 14); c.fill();
      c.fillStyle = col; roundRect(c, -3, -11, 6, 22, 2); c.fill(); roundRect(c, -11, -3, 22, 6, 2); c.fill();
      break;
    }
    case 'nova':
      c.lineWidth = 2.2;
      for (let i = 0; i < 6; i++) { c.save(); c.rotate((i / 6) * TAU); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -14); c.moveTo(0, -9); c.lineTo(-4, -12); c.moveTo(0, -9); c.lineTo(4, -12); c.stroke(); c.restore(); }
      break;
    case 'chain':
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(-3, -15); c.lineTo(-9, 1); c.lineTo(-1, 1); c.lineTo(-6, 15); c.lineTo(9, -4); c.lineTo(1, -4); c.lineTo(6, -15); c.closePath(); c.fill();
      break;
    case 'ward':
      c.beginPath(); c.moveTo(0, -14); c.quadraticCurveTo(10, -10, 12, -9); c.quadraticCurveTo(12, 8, 0, 15); c.quadraticCurveTo(-12, 8, -12, -9); c.quadraticCurveTo(-10, -10, 0, -14); c.fill();
      c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.moveTo(0, -11); c.quadraticCurveTo(-9, -8, -9, -7); c.quadraticCurveTo(-9, 6, 0, 12); c.fill();
      break;
  }
  c.restore();
}

const iconCache = new Map();
export function itemIcon(it, S = 56) {
  const key = it.cat + (it.base || it.skill) + it.rarity + (it.affixes || []).join() + S;
  if (iconCache.has(key)) return iconCache.get(key);
  const cv = document.createElement('canvas');
  cv.width = cv.height = S * 2;
  const c = cv.getContext('2d');
  c.scale(2, 2);
  if (it.cat === 'weapon') {
    const len = weaponLen[it.base];
    c.translate(S / 2, S / 2);
    c.rotate(it.base === 'bow' ? 0 : -Math.PI / 4);
    const sc = it.base === 'bow' ? S / 54 : (S * 1.15) / (len + 18);
    c.scale(sc, sc);
    c.translate(it.base === 'bow' ? -2 : -len / 2 + 2, 0);
    drawWeapon(c, it, {});
  } else if (it.cat === 'skill') {
    c.translate(S / 2, S / 2);
    drawScroll(c, it.skill, S / 26);
  }
  const url = cv.toDataURL();
  iconCache.set(key, url);
  return url;
}
const sIconCache = new Map();
export function skillIconURL(id, S = 48) {
  const k = id + S;
  if (sIconCache.has(k)) return sIconCache.get(k);
  const cv = document.createElement('canvas');
  cv.width = cv.height = S * 2;
  const c = cv.getContext('2d');
  c.scale(2, 2);
  drawSkillIcon(c, id, S);
  const url = cv.toDataURL();
  sIconCache.set(k, url);
  return url;
}
