/* Go Fish artwork: dawn lake scene, fishing deck, and the folks on the dock. (c) 2026 Ironite */
'use strict';
const ART = (() => {
const D = IR.draw, RH = IR.RH;

/* ---------------- the lake at dawn ---------------- */
function scene(c, W, H, res) {
  c.width = W * res; c.height = H * res; const x = c.getContext('2d'); x.scale(res, res);
  const R = IR.rng(1907);
  const horizon = 250;
  // sky
  x.fillStyle = D.lin(x, 0, 0, 0, horizon, ['#9fb8d0', '#d9c7c4', '#f6cfa4', '#fbe0b0']); x.fillRect(0, 0, W, horizon + 2);
  // sun + glow
  x.fillStyle = D.rad(x, 1180, horizon - 18, 10, 420, ['rgba(255,236,190,.95)', 'rgba(255,214,150,.35)', 'rgba(255,200,140,0)']); x.fillRect(0, 0, W, horizon + 40);
  D.ell(x, 1180, horizon - 14, 46, 46, 'rgba(255,244,214,.97)');
  // soft clouds
  for (let i = 0; i < 9; i++) { const cx = R() * W, cy = 40 + R() * 120, w = 140 + R() * 220; x.fillStyle = `rgba(255,${222 + R() * 20 | 0},${200 + R() * 30 | 0},${.18 + R() * .2})`; D.ell(x, cx, cy, w, 10 + R() * 12); x.fill(); D.ell(x, cx + w * .3, cy - 8, w * .5, 9 + R() * 8); x.fill(); }
  // distant hills (misty layers)
  const ridge = (y0, amp, col, seed) => { const r = IR.rng(seed); x.beginPath(); x.moveTo(0, horizon + 4); let y = y0; for (let px = 0; px <= W; px += 20) { y += (r() - .5) * amp; y = Math.max(y0 - 50, Math.min(y0 + 20, y)); x.lineTo(px, y); } x.lineTo(W, horizon + 4); x.closePath(); x.fillStyle = col; x.fill(); };
  ridge(185, 18, '#b9b3c2', 3); ridge(205, 14, '#98a0ad', 5);
  // tree line (pines)
  x.fillStyle = '#4f5f5c';
  for (let px = -10; px < W + 10; px += 7 + R() * 9) { const h = 22 + R() * 34, by = horizon + 2; x.beginPath(); x.moveTo(px, by - h); x.lineTo(px + h * .22, by); x.lineTo(px - h * .22, by); x.closePath(); x.fill(); }
  x.fillStyle = '#3e4d4a'; for (let px = -10; px < W + 10; px += 11 + R() * 14) { const h = 14 + R() * 20, by = horizon + 4; x.beginPath(); x.moveTo(px, by - h); x.lineTo(px + h * .25, by); x.lineTo(px - h * .25, by); x.closePath(); x.fill(); }
  // water
  x.fillStyle = D.lin(x, 0, horizon, 0, H, ['#e9c9a6', '#a9b6bf', '#6f8c98', '#46677a', '#33536a']); x.fillRect(0, horizon, W, H - horizon);
  // reflections: sun path + treeline
  x.fillStyle = D.rad(x, 1180, horizon + 6, 4, 260, ['rgba(255,236,190,.65)', 'rgba(255,220,170,0)']); x.fillRect(900, horizon, 560, 360);
  for (let i = 0; i < 70; i++) { const y = horizon + 6 + Math.pow(R(), 1.6) * 320, w = 20 + R() * 90 * (1 + (y - horizon) / 200); x.fillStyle = `rgba(255,240,205,${.25 + R() * .35})`; x.fillRect(1180 - w / 2 + (R() - .5) * 80 * (y - horizon) / 120, y, w, 1.4 + R() * 1.5); }
  x.fillStyle = 'rgba(62,77,74,.35)'; x.fillRect(0, horizon + 2, W, 16);
  // ripple lines
  for (let i = 0; i < 260; i++) { const y = horizon + 20 + Math.pow(R(), .9) * (H - horizon - 20), w = 8 + R() * 50 * (y / H) * 2; x.strokeStyle = R() < .5 ? `rgba(255,240,220,${.06 + R() * .1})` : `rgba(20,40,55,${.08 + R() * .12})`; x.lineWidth = 1 + y / H; x.beginPath(); const sx = R() * W; x.moveTo(sx, y); x.quadraticCurveTo(sx + w / 2, y - 1.5, sx + w, y); x.stroke(); }
  // mist band
  x.fillStyle = D.lin(x, 0, horizon - 20, 0, horizon + 60, ['rgba(255,245,235,0)', 'rgba(255,245,235,.35)', 'rgba(255,245,235,0)']); x.fillRect(0, horizon - 20, W, 80);
  // lily pads
  const pad = (px, py, s, flower) => { x.save(); x.translate(px, py); x.scale(1, .42); D.ell(x, 0, 0, s, s, '#4c7a45'); x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, s, -.25, .25); x.closePath(); x.fillStyle = '#5f7f8c'; x.fill(); D.ell(x, -s * .2, -s * .2, s * .6, s * .5, 'rgba(160,200,120,.25)'); x.restore();
    if (flower) { for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; D.ell(x, px + Math.cos(a) * s * .25, py - s * .2 + Math.sin(a) * s * .1, s * .2, s * .09, '#f9e9f0', a); } D.ell(x, px, py - s * .2, s * .1, s * .06, '#f3cf5a'); } };
  [[420, 300, 16], [455, 312, 11, 1], [1040, 520, 26], [1085, 548, 18, 1], [300, 560, 30], [1290, 330, 14], [700, 290, 10]].forEach(p => pad(...p));
  // reeds & cattails at both edges
  const reeds = (x0, x1, base, n, seed) => { const r = IR.rng(seed); for (let i = 0; i < n; i++) { const px = x0 + r() * (x1 - x0), h = 80 + r() * 170, lean = (r() - .5) * 40, by = base + r() * 40;
    x.strokeStyle = `hsl(${85 + r() * 25},${30 + r() * 20}%,${22 + r() * 14}%)`; x.lineWidth = 2 + r() * 3; x.beginPath(); x.moveTo(px, by); x.quadraticCurveTo(px + lean * .3, by - h * .6, px + lean, by - h); x.stroke();
    if (r() < .35) { D.ell(x, px + lean * .92, by - h * .88, 4.5, 15, '#5b3a22', lean * .004); D.line(x, px + lean, by - h, px + lean * 1.04, by - h - 14, '#6f6a4e', 1.5); } } };
  reeds(-20, 230, 640, 70, 11); reeds(1380, 1620, 640, 70, 12); reeds(1500, 1620, 360, 25, 13); reeds(-20, 90, 360, 25, 14);
  // the dock (foreground planks, perspective)
  const dockTop = 600;
  x.beginPath(); x.moveTo(300, dockTop); x.lineTo(1300, dockTop); x.lineTo(1500, H); x.lineTo(100, H); x.closePath();
  x.fillStyle = D.lin(x, 0, dockTop, 0, H, ['#9a7550', '#7a5636', '#5d3f26']); x.fill();
  x.save(); x.clip();
  const nP = 16; for (let i = 0; i <= nP; i++) { const t = i / nP; D.line(x, 300 + t * 1000, dockTop, 100 + t * 1400, H, 'rgba(35,20,8,.65)', 2.2); }
  for (let i = 0; i < 260; i++) { const t = R(), y = dockTop + R() * (H - dockTop); const xl = 300 - (y - dockTop) / (H - dockTop) * 200, xr = 1300 + (y - dockTop) / (H - dockTop) * 200; const px = xl + t * (xr - xl); x.strokeStyle = R() < .6 ? 'rgba(40,22,10,.25)' : 'rgba(255,220,170,.08)'; x.lineWidth = .8 + R(); x.beginPath(); x.moveTo(px, y); x.lineTo(px + (px - 800) * .03, y + 20 + R() * 50); x.stroke(); }
  // nail heads
  for (let i = 0; i <= nP; i++) for (const yy of [dockTop + 30, dockTop + 140]) { const t = (i + .5) / nP, s = (yy - dockTop) / (H - dockTop); const px = (300 - s * 200) + t * (1000 + s * 400); D.ell(x, px, yy, 1.8 + s * 1.5, 1.2 + s, '#2b2520'); }
  x.fillStyle = D.lin(x, 0, dockTop, 0, dockTop + 40, ['rgba(255,230,190,.25)', 'rgba(255,230,190,0)']); x.fillRect(0, dockTop, W, 40);
  x.restore();
  // dock posts
  [[300, dockTop], [1300, dockTop]].forEach(([px, py]) => { x.fillStyle = D.lin(x, px - 14, 0, px + 14, 0, ['#4a3220', '#7a5636', '#4a3220']); x.fillRect(px - 13, py - 46, 26, 60); D.ell(x, px, py - 46, 13, 5, '#8a6644'); });
  // a coil of rope and a tackle box on the dock
  const rope = (cx, cy) => { for (let i = 0; i < 5; i++) { D.ell(x, cx, cy, 40 - i * 6, 14 - i * 2, null); x.strokeStyle = i % 2 ? '#c9a46a' : '#a98552'; x.lineWidth = 5; x.stroke(); } };
  rope(1225, 805);
  // vignette
  x.fillStyle = D.rad(x, W / 2, H * .45, Math.min(W, H) * .45, Math.hypot(W, H) * .62, ['rgba(0,0,0,0)', 'rgba(10,15,25,.45)']); x.fillRect(0, 0, W, H);
}

/* animated shimmer on the water */
function shimmer(c, W, H, res) {
  c.width = W * res; c.height = H * res; const x = c.getContext('2d');
  const R = Math.random, lines = Array.from({ length: 70 }, () => ({ x: R() * W, y: 270 + Math.pow(R(), 1.1) * 320, w: 10 + R() * 40, p: R() * 6.28, s: .6 + R() * 1.2 }));
  const rings = [];
  let last = 0;
  function frame(t) {
    if (t - last > 50) { last = t;
      x.setTransform(res, 0, 0, res, 0, 0); x.clearRect(0, 0, W, H);
      for (const l of lines) { const a = (Math.sin(t / 900 * l.s + l.p) + 1) / 2; x.strokeStyle = `rgba(255,244,225,${a * .22})`; x.lineWidth = 1.2; const dx = Math.sin(t / 2400 + l.p) * 8; x.beginPath(); x.moveTo(l.x + dx, l.y); x.quadraticCurveTo(l.x + dx + l.w / 2, l.y - 1.2, l.x + dx + l.w, l.y); x.stroke(); }
      for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i], age = (t - r.t) / 1000; if (age > 2.4) { rings.splice(i, 1); continue; } for (let k = 0; k < 3; k++) { const rr = (age - k * .25) * r.s; if (rr <= 0) continue; D.ell(x, r.x, r.y, rr, rr * .35, null); x.strokeStyle = `rgba(255,250,240,${Math.max(0, .5 - age / 2.4 * .5) * (1 - k * .25)})`; x.lineWidth = 1.6; x.stroke(); } }
      if (Math.random() < .015) rings.push({ x: 360 + Math.random() * 880, y: 280 + Math.random() * 280, t, s: 22 + Math.random() * 20 });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return { ring(px, py, s = 60) { rings.push({ x: px, y: py, t: performance.now(), s }); } };
}

/* ---------------- the deck ---------------- */
const ACC = ['#2c5470', '#a3392c', '#c47a22', '#3d6b3f'];
function lakeBg(sky1, sky2) {
  return x => {
    x.fillStyle = D.lin(x, 0, 0, 0, .95, [sky1, sky2]); x.fillRect(0, 0, 1, RH);
    D.ell(x, .78, .42, .1, .1, 'rgba(255,240,200,.85)');
    D.poly(x, [[0, .78], [.2, .6], [.38, .72], [.6, .55], [.82, .7], [1, .6], [1, .95], [0, .95]], '#8fa3a6');
    x.fillStyle = '#4c6b5d'; for (let i = 0; i < 12; i++) { const px = i / 11; D.poly(x, [[px, .8], [px + .04, .95], [px - .04, .95]]); x.fill(); }
    x.fillStyle = D.lin(x, 0, .95, 0, RH, ['#9fb7bf', '#4f7286']); x.fillRect(0, .95, 1, RH);
    for (let i = 0; i < 8; i++) D.line(x, .1 + (i * .37) % .8, 1.0 + i * .07, .18 + (i * .37) % .8, 1.0 + i * .07, 'rgba(255,255,255,.35)', .008);
  };
}
function rod(x, x0, y0, x1, y1) { D.line(x, x0, y0, x1, y1, '#5a3a1c', .022); D.line(x, x0 + (x1 - x0) * .55, y0 + (y1 - y0) * .55, x1, y1, '#2a2a2a', .012); D.ell(x, x0 + (x1 - x0) * .14, y0 + (y1 - y0) * .14, .035, .035, '#9aa3a8'); x.beginPath(); x.moveTo(x1, y1); x.quadraticCurveTo(x1 + .05, y1 + .3, x1 + .02, .85); x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = .004; x.stroke(); }
function fishShape(x, cx, cy, L, col, belly, flip) {
  x.save(); x.translate(cx, cy); if (flip) x.scale(-1, 1);
  x.beginPath(); x.moveTo(-L * .5, 0); x.quadraticCurveTo(-L * .1, -L * .26, L * .3, -L * .08); x.quadraticCurveTo(L * .42, 0, L * .3, L * .08); x.quadraticCurveTo(-L * .1, L * .26, -L * .5, 0); x.closePath();
  x.fillStyle = D.lin(x, 0, -L * .2, 0, L * .2, [col, belly]); x.fill();
  D.poly(x, [[-L * .45, 0], [-L * .72, -L * .18], [-L * .64, 0], [-L * .72, L * .18]], col);
  D.poly(x, [[-L * .05, -L * .17], [L * .1, -L * .26], [L * .16, -L * .12]], col);
  D.ell(x, L * .2, -L * .03, L * .03, L * .03, '#fff'); D.ell(x, L * .205, -L * .03, L * .017, L * .017, '#111');
  x.beginPath(); x.moveTo(L * .1, -L * .11); x.quadraticCurveTo(L * .05, 0, L * .1, L * .1); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = L * .015; x.stroke();
  for (let i = 0; i < 6; i++) D.ell(x, -L * .25 + i * L * .07, -L * .02 + (i % 2) * L * .04, L * .015, L * .015, 'rgba(0,0,0,.18)');
  x.restore();
}

const COURTS = {
  13: (x, s) => IR.portrait(x, { // the Old Angler
    bg: lakeBg('#f3dcc0', '#e7b98c'), coat: ['#6b5a3e', '#3e3222'], hair: '#d9d3c8', beard: '#e4dfd6', beardLen: .06, mustache: '#cfc9be', brows: '#bdb6aa', skin: '#e2b08a',
    hat: { type: 'bucket', color: '#7d7a52', light: '#9c9868', band: ACC[s], lure: '#d8452f' },
    body: x => { x.fillStyle = '#8a7a4c'; x.fillRect(.22, 1.2, .56, .5); for (let i = 0; i < 3; i++) { D.rr(x, .27 + i * .17, 1.28, .12, .1, .01); x.fillStyle = '#6d5f39'; x.fill(); } D.line(x, .5, 1.1, .5, RH, '#5d5034', .01); },
    front: x => { rod(x, .82, 1.62, .1, .55); D.ell(x, .78, 1.4, .06, .05, '#e2b08a'); },
  }),
  12: (x, s) => IR.portrait(x, { // the Lady Angler
    bg: lakeBg('#f5e4d0', '#efc6a2'), coat: [ACC[s], '#1d2a36'], hair: '#8a4a26', longHair: true, lips: '#c2453e', lashes: true, blush: true, skin: '#f0c7a5', earring: '#e8c66a',
    hat: { type: 'sunhat', color: '#e9d39c', band: ACC[s], flower: '#f5f0f5' },
    collar: x => { D.poly(x, [[.38, 1.07], [.5, 1.2], [.62, 1.07], [.58, 1.05], [.5, 1.13], [.42, 1.05]], '#f4efe4'); },
    front: x => { fishShape(x, .62, 1.38, .5, '#6c8d4c', '#e8dca6', false); D.ell(x, .37, 1.4, .055, .045, '#f0c7a5'); D.ell(x, .88, 1.4, .05, .045, '#f0c7a5'); },
  }),
  11: (x, s) => IR.portrait(x, { // the Dock Kid
    bg: lakeBg('#e8eef0', '#bcd0d6'), coat: ['#c9b27d', '#8f774b'], hair: '#c8862f', blush: true, skin: '#f0c19c',
    hat: { type: 'cap', color: ACC[s], brim: '#1f1f1f', patch: '#f4efe4' },
    body: x => { x.fillStyle = '#e9dcbc'; x.fillRect(.36, 1.1, .28, .55); D.line(x, .42, 1.1, .42, RH, '#4b5e72', .05); D.line(x, .58, 1.1, .58, RH, '#4b5e72', .05); },
    front: x => { D.line(x, .78, 1.62, .9, .95, '#8a6236', .022); D.ell(x, .86, .86, .12, .1, null); x.strokeStyle = '#8a6236'; x.lineWidth = .02; x.stroke(); x.save(); D.ell(x, .86, .86, .12, .1, null); x.clip(); for (let i = -6; i <= 6; i++) { D.line(x, .74 + i * .03, .76, .86 + i * .03, .96, 'rgba(240,240,230,.7)', .004); D.line(x, .74 + i * .03, .96, .86 + i * .03, .76, 'rgba(240,240,230,.7)', .004); } x.restore(); D.ell(x, .78, 1.45, .05, .045, '#f0c19c'); },
  }),
};

const theme = {
  paper: ['#fbf8ef', '#e7eadf'], vignette: 'rgba(60,90,100,.14)', border: '#4a5d63', radius: .075,
  index: { font: "Lora, Georgia, serif", red: '#ad2f22', black: '#17262c' },
  pip: { red: ['#d5463a', '#8c1d14'], black: ['#2f4652', '#0f1a20'] },
  frame: ['#2f4652', '#e6d3a0', '#9f8150', '#efe0b5'],
  court: (x, s, r) => COURTS[r](x, s),
  ace(x, s, cw, ch) {
    const cx = cw / 2, cy = ch / 2;
    D.ell(x, cx, cy, cw * .36, cw * .36, D.rad(x, cx, cy, 0, cw * .36, ['rgba(120,170,190,.35)', 'rgba(120,170,190,0)']));
    for (let k = 0; k < 3; k++) { D.ell(x, cx, cy, cw * (.28 + k * .045), cw * (.28 + k * .045), null); x.strokeStyle = `rgba(60,110,130,${.35 - k * .1})`; x.lineWidth = cw * .006; x.stroke(); }
    const fc = [['#4e6d84', '#d8e2e6'], ['#a64a3a', '#f2d7c2'], ['#c88a2c', '#f6e6b8'], ['#4f7a43', '#e5e6b0']][s];
    fishShape(x, cx - cw * .02, cy + cw * .2, cw * .5, fc[0], fc[1], s % 2 === 1);
    IR.drawSuit(x, s, cx, cy - cw * .1, cw * .3, false, theme.pip);
    x.fillStyle = '#2f4652'; x.font = `italic 600 ${cw * .07}px Lora, Georgia, serif`; x.textAlign = 'center';
    x.fillText(['Lake Trout', 'Red Snapper', 'Golden Perch', 'Bass'][s], cx, ch * .86);
  },
  pipDecor(x, s, px, py, sz) { D.ell(x, px, py + sz * .55, sz * .42, sz * .08, 'rgba(70,120,140,.12)'); },
  backBorder: '#0e2230',
  back(x, cw, ch) {
    x.fillStyle = D.lin(x, 0, 0, cw, ch, ['#1d4560', '#0f2a3d']); x.fillRect(0, 0, cw, ch);
    for (let i = 0; i < 14; i++) { const y = ch * (i + .5) / 14; x.beginPath(); for (let px = 0; px <= cw; px += 2) { const yy = y + Math.sin(px / cw * Math.PI * 4 + i) * cw * .015; px ? x.lineTo(px, yy) : x.moveTo(px, yy); } x.strokeStyle = 'rgba(160,210,230,.12)'; x.lineWidth = cw * .01; x.stroke(); }
    const m = cw * .07;
    // rope border
    x.setLineDash([cw * .03, cw * .02]); x.strokeStyle = '#d8bf86'; x.lineWidth = cw * .022; x.strokeRect(m, m, cw - 2 * m, ch - 2 * m); x.setLineDash([]);
    x.strokeStyle = 'rgba(216,191,134,.5)'; x.lineWidth = cw * .006; x.strokeRect(m + cw * .03, m + cw * .03, cw - 2 * m - cw * .06, ch - 2 * m - cw * .06);
    // centre medallion: leaping fish over a sunrise lake
    const cx = cw / 2, cy = ch / 2, ox = cw * .3, oy = cw * .36;
    x.save(); D.ell(x, cx, cy, ox, oy, null); x.clip();
    x.fillStyle = D.lin(x, 0, cy - oy, 0, cy + oy, ['#f7c98d', '#f2a46a', '#5f8ea0', '#2c5a72']); x.fillRect(cx - ox, cy - oy, 2 * ox, 2 * oy);
    D.ell(x, cx + ox * .3, cy - oy * .05, ox * .3, ox * .3, 'rgba(255,240,200,.95)');
    D.poly(x, [[cx - ox, cy + oy * .1], [cx - ox * .4, cy - oy * .25], [cx, cy], [cx + ox * .5, cy - oy * .2], [cx + ox, cy + oy * .05], [cx + ox, cy + oy * .2], [cx - ox, cy + oy * .2]], '#38545a');
    x.fillStyle = D.lin(x, 0, cy + oy * .2, 0, cy + oy, ['#7aa3b0', '#244a60']); x.fillRect(cx - ox, cy + oy * .2, 2 * ox, oy);
    x.save(); x.translate(cx - ox * .05, cy + oy * .12); x.rotate(-.5); fishShape(x, 0, 0, ox * 1.05, '#c46a3a', '#f8e2bf', false); x.restore();
    for (let k = 0; k < 3; k++) { D.ell(x, cx + ox * .25, cy + oy * .45, ox * (.15 + k * .12), oy * (.04 + k * .03), null); x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = cw * .006; x.stroke(); }
    x.restore();
    D.ell(x, cx, cy, ox, oy, null); x.strokeStyle = '#d8bf86'; x.lineWidth = cw * .016; x.stroke();
    x.fillStyle = '#e9d6a6'; x.textAlign = 'center'; x.font = `italic 700 ${cw * .1}px Lora, Georgia, serif`; x.fillText('Go Fish', cx, cy - oy - cw * .05);
    x.font = `600 ${cw * .055}px Poppins, sans-serif`; x.fillText('LOON LAKE', cx, cy + oy + cw * .1);
    // corner lures
    [[m + cw * .05, m + cw * .05], [cw - m - cw * .05, m + cw * .05], [m + cw * .05, ch - m - cw * .05], [cw - m - cw * .05, ch - m - cw * .05]].forEach(([a, b]) => { D.ell(x, a, b, cw * .025, cw * .025, '#e9d6a6'); D.ell(x, a, b, cw * .012, cw * .012, '#c4402f'); });
  },
};

/* ---------------- the folks on the dock ---------------- */
const FOLKS = [
  { id: 'you', name: 'You', full: 'You' },
  { id: 'walt', name: 'Walt', full: 'Grandpa Walt', tag: 'Fished this lake for sixty years',
    look: { coat: ['#5f6e4a', '#3a442c'], hair: '#e3ded4', beard: '#ece8e0', mustache: '#ddd8ce', brows: '#cfc9be', skin: '#e5b48e', glasses: '#4a3a2a', hat: { type: 'bucket', color: '#6f7f5a', light: '#8e9c74', band: '#3d4a2e', lure: '#e0a330' } } },
  { id: 'rosie', name: 'Rosie', full: 'Captain Rosie', tag: 'Runs the bait shop by the boat ramp',
    look: { coat: ['#2f6f8f', '#1c4256'], hair: '#b5512a', longHair: true, lips: '#c2453e', lashes: true, blush: true, skin: '#f0c4a0', earring: '#e8c66a', hat: { type: 'sunhat', color: '#ead6a2', band: '#c24a36', flower: '#fff' } } },
  { id: 'finn', name: 'Finn', full: 'Little Finn', tag: 'Caught a bass this big. Honest.',
    look: { coat: ['#d96f3c', '#a24a22'], hair: '#7a4a24', blush: true, skin: '#f2c5a2', hat: { type: 'cap', color: '#2a5d8a', brim: '#1c3e5e', patch: '#f3e9d2' } } },
];
function avatar(f, size) {
  const [c, x] = D.canvas(size, size); const s = size;
  x.save(); x.beginPath(); x.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); x.clip();
  x.translate(s * -.12, s * -.48); x.scale(s * 1.24, s * 1.24);
  IR.portrait(x, Object.assign({ bg: lakeBg('#f6e3c8', '#e9bd92') }, f.look || {}));
  x.restore();
  return c.toDataURL('image/png');
}
function youAvatar(size) {
  return avatar({ look: { coat: ['#8a3a2e', '#552018'], hair: '#5a3b22', skin: '#e9b892', hat: { type: 'bucket', color: '#c9b27d', light: '#ddc896', band: '#6b4a22', lure: '#2f7fd1' } } }, size);
}

return { scene, shimmer, theme, FOLKS, avatar, youAvatar, fishShape, lakeBg };
})();
