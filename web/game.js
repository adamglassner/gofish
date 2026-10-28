/* Go Fish - game logic. (c) 2026 Ironite */
'use strict';
(async () => {
const VERSION = '1.0.0';
const $ = IR.$;
const save = new IR.Save('gofish.save', {
  settings: { music: true, sfx: true, vol: 60, pace: 'steady', skill: 'sharp' },
  stats: { played: 0, won: 0, sets: 0, best: 0, streak: 0, bestStreak: 0 },
});
await save.load();
const S = save.data.settings, ST = save.data.stats;

/* ---------- stage, art, audio ---------- */
const stage = $('#stage'), table = $('#table');
const W = 1600, H = 844;
let res = 2;
const art = new IR.CardArt(ART.theme, 100, 140, 2);
const cards = new IR.Cards($('#cards'), art);
const fx = new IR.Particles($('#fx'));
let water;
IR.Stage.init(stage, s => {
  const r = IR.clamp(Math.ceil(s * (devicePixelRatio || 1) * 2) / 2, 1.5, 3.5);
  if (!water || r > res + .4) { res = r; ART.scene($('#scene'), W, H, res); }
  fx.resize(W, H, Math.min(2, s * (devicePixelRatio || 1)));
});
art.setRes(Math.max(2, res * 1.05));
water = ART.shimmer($('#water'), W, H, Math.min(2, res));
const audio = new IR.Audio(S);
audio.setTunes(MUSIC.tunes(), MUSIC.instruments);
const sfx = MUSIC.sfx(audio);
IR.wireAudioControls(audio, save);
IR.on('tune', n => { const e = $('#nowPlaying'); e.textContent = '♫ ' + n; e.classList.add('show'); setTimeout(() => e.classList.remove('show'), 5000); });
$('#ver').textContent = 'v' + VERSION + ' · © 2026 Ironite';

/* ---------- players & seats ---------- */
const AV = { you: ART.youAvatar(168) };
ART.FOLKS.slice(1).forEach(f => AV[f.id] = ART.avatar(f, 168));
const P = ART.FOLKS.map((f, i) => ({ i, id: f.id, name: f.name, full: f.full, tag: f.tag || 'Out on the dock at dawn', hand: [], sets: [], known: new Set() }));
const SEAT = [
  { x: 24, y: 648, hand: null, sets: { x: 1296, y: 640, cols: 7 }, bub: [800, 612] },
  { x: 24, y: 236, hand: { x: 34, y: 396, step: 15 }, sets: { x: 30, y: 496, cols: 7 }, bub: [150, 236] },
  { x: 540, y: 12, hand: { x: 812, y: 22, step: 15 }, sets: { x: 812, y: 104, cols: 13 }, bub: [666, 176], down: true },
  { x: 1324, y: 236, hand: { x: 1334, y: 396, step: 15 }, sets: { x: 1330, y: 496, cols: 7 }, bub: [1450, 236] },
];
const POND = { x: 800, y: 360, rx: 215, ry: 92 };
P.forEach((p, i) => {
  const s = SEAT[i], el = IR.el('div', 'seat tackle' + (i === 0 ? ' you' : ''), $('#seats'));
  el.style.left = s.x + 'px'; el.style.top = s.y + 'px';
  el.innerHTML = `<div class="turnTag">${i === 0 ? 'Your turn' : p.name + '\u2019s turn'}</div><div class="lid"><span>${i === 0 ? 'Your Tackle' : p.full}</span></div><div class="who"><img class="av" src="${AV[p.id]}"><div><div class="nm">${i === 0 ? 'You' : p.name}</div><div class="tag">${i === 0 ? 'Sets laid down on the dock' : p.tag}</div><div class="nums"><span><b data-h>0</b> <i data-hl>cards</i></span><span><b data-s>0</b> <i data-sl>sets</i></span></div></div></div>`;
  p.el = el; p.hEl = el.querySelector('[data-h]'); p.sEl = el.querySelector('[data-s]'); p.hL = el.querySelector('[data-hl]'); p.sL = el.querySelector('[data-sl]');
  if (i > 0) el.addEventListener('click', () => { if (el.classList.contains('target')) pickTarget(i); });
});

/* ---------- state ---------- */
let pond = [], cel = {}, turn = 0, busy = false, gameOn = false, gen = 0;
let selRank = 0, waiting = null;
const pace = () => ({ relaxed: 1.4, steady: 1, quick: .6 })[S.pace] || 1;
const wait = ms => new Promise((r, j) => { const g = gen; setTimeout(() => g === gen ? r() : j('stale'), ms * pace() / (IR.speed || 1)); });

function log(html) { const L = $('#logLines'); IR.el('div', '', L, html); while (L.children.length > 8) L.firstChild.remove(); }
const nm = p => p.i === 0 ? '<b>You</b>' : `<b>${p.name}</b>`;
const plural = (r, n) => n === 1 ? IR.RANK_NAMES[r - 1].replace('Six', 'Six') : IR.RANK_PLURAL[r - 1];
const aOrN = (r, n) => n === 1 ? (r === 1 || r === 8 ? 'an ' : 'a ') + IR.RANK_NAMES[r - 1] : (['', 'two ', 'three '][n - 1] || n + ' ') + IR.RANK_PLURAL[r - 1];

function updateHUD() {
  P.forEach(p => { p.hEl.textContent = p.hand.length; p.sEl.textContent = p.sets.length; p.hL.textContent = p.hand.length === 1 ? 'card' : 'cards'; p.sL.textContent = p.sets.length === 1 ? 'set' : 'sets'; p.el.classList.toggle('turn', gameOn && turn === p.i); p.el.classList.toggle('empty', gameOn && !p.hand.length); });
  $('#pondCount').textContent = pond.length;
  $('#sPlayed').textContent = ST.played; $('#sWon').textContent = ST.won; $('#sSets').textContent = ST.sets;
}

/* ---------- layout ---------- */
const sortHand = h => h.sort((a, b) => IR.rank(a) - IR.rank(b) || IR.suit(a) - IR.suit(b));
function layoutHand(i, dur = 450) {
  const p = P[i];
  if (i === 0) {
    sortHand(p.hand);
    const n = p.hand.length, step = Math.min(66, 860 / Math.max(1, n - 1)), w = (n - 1) * step + 100, x0 = 800 - w / 2;
    p.hand.forEach((id, k) => { const c = cel[id], lift = IR.rank(id) === selRank ? -28 : 0; cards.move(c, x0 + k * step, 662 + lift, { up: true, r: 0, s: 1, dur, z: 200 + k }); c.classList.toggle('hot', gameOn && turn === 0 && !busy); c.classList.toggle('sel', IR.rank(id) === selRank); });
  } else {
    const s = SEAT[i].hand, n = p.hand.length, step = Math.min(s.step, (i === 2 ? 300 : 200) / Math.max(1, n - 1));
    p.hand.forEach((id, k) => { const c = cel[id]; c.classList.remove('hot', 'sel'); cards.move(c, s.x + k * step - 22, s.y - 31, { up: false, r: 0, s: .55, dur, z: 100 + k }); });
  }
}
function layoutSets(i, dur = 500) {
  const p = P[i], s = SEAT[i].sets;
  p.sets.forEach((r, k) => {
    const col = k % s.cols, row = Math.floor(k / s.cols), bx = s.x + col * 34 - 31, by = s.y + row * 62 - 43;
    [0, 13, 26, 39].map(o => (r - 1) + o).forEach((id, j) => { const c = cel[id]; c.classList.remove('hot', 'sel'); cards.move(c, bx + j * 2, by - j * 2, { up: true, r: 0, s: .38, dur, z: 20 + k * 4 + j }); });
  });
}
function pondSpot(k) { const r = IR.rng(k * 7919 + 17), a = r() * Math.PI * 2, d = Math.sqrt(r()); return { x: POND.x + Math.cos(a) * POND.rx * d - 50, y: POND.y + Math.sin(a) * POND.ry * d - 70, r: (r() - .5) * 70 }; }
function layoutPond(dur = 450) { pond.forEach((id, k) => { const s = pondSpot(k); cards.move(cel[id], s.x, s.y, { up: false, r: s.r, s: .72, dur, z: 30 + k }); }); }

/* ---------- dealing ---------- */
async function newGame() {
  gen++; gameOn = false; busy = true; selRank = 0; resolveWait(null);
  ['result', 'title'].forEach(IR.panel.hide);
  $('#prompt').classList.add('hidden'); $('#logLines').innerHTML = '';
  cards.clear(); cel = {};
  P.forEach(p => { p.hand = []; p.sets = []; p.known = new Set(); });
  const deck = IR.shuffle([...Array(52).keys()]);
  pond = deck;
  deck.forEach((id, k) => { const s = pondSpot(k); cel[id] = cards.make(id, { x: s.x, y: s.y - 500, r: s.r, s: .72, up: false }); });
  updateHUD();
  ST.played++; save.write();
  audio.sShuffle();
  const g = gen;
  try {
    await wait(120); layoutPond(700); await wait(900);
    log('Fresh deck, fresh morning. Dealing five each.');
    for (let round = 0; round < 5; round++) for (let i = 0; i < 4; i++) { const id = pond.pop(); P[i].hand.push(id); audio.sDeal(); layoutHand(i, 380); updateHUD(); await wait(70); }
    await wait(500);
    gameOn = true; turn = 0; busy = false;
    // a lucky deal can hold a set already
    for (const p of P) await checkSets(p);
    play(g);
  } catch (e) { if (e !== 'stale') throw e; }
}

/* ---------- core moves ---------- */
async function transfer(from, to, rank) {
  const got = from.hand.filter(id => IR.rank(id) === rank);
  from.hand = from.hand.filter(id => IR.rank(id) !== rank);
  sfx.reel();
  // show the cards in mid-air so everyone sees what moved
  const mx = (SEAT[from.i].bub[0] + SEAT[to.i].bub[0]) / 2, my = 360;
  got.forEach((id, k) => cards.move(cel[id], mx - 50 - (got.length - 1) * 30 + k * 60, my - 70, { up: true, r: 0, s: 1.05, dur: 520, z: 400 + k }));
  layoutHand(from.i); updateHUD();
  await wait(950);
  to.hand.push(...got); layoutHand(to.i, 520); updateHUD();
  from.known.delete(rank); to.known.add(rank);
  await wait(520);
  return got.length;
}
async function drawPond(p) {
  const id = pond.pop(); if (id == null) return null;
  const s = pondSpot(pond.length);
  water.ring(s.x + 50, s.y + 70, 70);
  sfx.plop();
  p.hand.push(id);
  if (p.i === 0) { layoutHand(0, 520); } else layoutHand(p.i, 520);
  updateHUD(); await wait(600);
  return id;
}
async function checkSets(p) {
  const counts = {}; p.hand.forEach(id => counts[IR.rank(id)] = (counts[IR.rank(id)] || 0) + 1);
  for (const r of Object.keys(counts).map(Number)) {
    if (counts[r] < 4) continue;
    p.hand = p.hand.filter(id => IR.rank(id) !== r); p.sets.push(r); p.known.delete(r);
    P.forEach(q => q.known.delete(r));
    // lift the four into view, then lay them on the dock
    [0, 13, 26, 39].map(o => r - 1 + o).forEach((id, j) => cards.move(cel[id], 650 + j * 75, 290, { up: true, r: (j - 1.5) * 4, s: 1, dur: 480, z: 500 + j }));
    layoutHand(p.i); updateHUD();
    sfx.set(); banner(`A set of ${IR.RANK_PLURAL[r - 1]}!`, p.i === 0 ? 'Laid down on your side of the dock' : `${p.full} lays them down`);
    fx.burst(800, 330, 70, ['#ffd76a', '#ffffff', '#9fd8f5', '#f4a261'], { speed: 600, shape: 'circle', size: 7 });
    log(`${nm(p)} laid down a <span class="set">set of ${IR.RANK_PLURAL[r - 1]}</span>.`);
    await wait(1300);
    layoutSets(p.i); updateHUD();
    if (p.i === 0) { ST.sets++; save.write(); }
    await wait(500);
  }
}
function banner(t, sub) { const b = $('#banner'); b.innerHTML = t + (sub ? `<small>${sub}</small>` : ''); b.classList.add('show'); clearTimeout(banner.t); banner.t = setTimeout(() => b.classList.remove('show'), 1700 * pace()); }
function say(i, text, ms = 2200) { const s = SEAT[i].bub; return IR.bubble(table, text, s[0], s[1], SEAT[i].down ? 'down' : '', ms * pace()); }

/* ---------- turn loop ---------- */
const sets13 = () => P.reduce((n, p) => n + p.sets.length, 0) === 13;
async function play(g) {
  try {
    while (gameOn && g === gen) {
      updateHUD();
      const p = P[turn];
      if (sets13()) return endGame('Every set is on the dock');
      if (!p.hand.length) {
        if (!pond.length) { if (P.every(q => !q.hand.length)) return endGame('The pond ran dry'); turn = (turn + 1) % 4; continue; }
        log(`${nm(p)} ${p.i === 0 ? 'are' : 'is'} out of cards and ${p.i === 0 ? 'draw' : 'draws'} from the pond.`);
        await drawPond(p); await checkSets(p);
        if (!pond.length) return endGame('The pond ran dry');
        if (!p.hand.length) { turn = (turn + 1) % 4; continue; }
      }
      const targets = P.filter(q => q !== p && q.hand.length);
      if (!targets.length) { // nobody to ask: fish instead
        if (!pond.length) return endGame('The pond ran dry');
        await drawPond(p); await checkSets(p); if (!pond.length) return endGame('The pond ran dry');
        turn = (turn + 1) % 4; continue;
      }
      let ask;
      if (p.i === 0) ask = await humanAsk(); else { await wait(900); ask = aiAsk(p); }
      if (!ask || g !== gen) return;
      const again = await resolveAsk(p, P[ask.t], ask.r);
      if (!gameOn || g !== gen) return;
      if (!again.cont) return;
      if (!again.go) turn = (turn + 1) % 4;
      await wait(350);
    }
  } catch (e) { if (e !== 'stale') throw e; }
}
async function resolveAsk(p, q, r) {
  const lines = p.i === 0 ? [`${q.name}, got any ${IR.RANK_PLURAL[r - 1]}?`] : [`${q.i === 0 ? 'You' : q.name}, got any ${IR.RANK_PLURAL[r - 1]}?`, `Any ${IR.RANK_PLURAL[r - 1]}, ${q.i === 0 ? 'friend' : q.name}?`, `${q.i === 0 ? 'Hey you' : q.name}... ${IR.RANK_PLURAL[r - 1]}?`];
  say(p.i, lines[Math.floor(Math.random() * lines.length)]);
  p.known.add(r);
  log(`${nm(p)} asked ${q.i === 0 ? '<b>you</b>' : nm(q)} for ${IR.RANK_PLURAL[r - 1]}.`);
  await wait(1300);
  const has = q.hand.some(id => IR.rank(id) === r);
  if (has) {
    const give = { you: ['Here you go.', 'Take ’em.'], walt: ['Well, I’ll be. Here.', 'Sharp eyes. Here.'], rosie: ['Hook, line and sinker. Here.', 'Aw, nuts. Take ’em.'], finn: ['Aww, no fair!', 'How’d you know?!'] }[q.id];
    say(q.i, give[Math.floor(Math.random() * give.length)]);
    await wait(500);
    const n = await transfer(q, p, r);
    log(`<span class="good">${q.i === 0 ? '<b>You</b> handed over' : nm(q) + ' handed over'} ${aOrN(r, n)}.</span> ${nm(p)} ${p.i === 0 ? 'go' : 'goes'} again.`);
    await checkSets(p);
    if (!pond.length && !p.hand.length && P.every(x => !x.hand.length)) { endGame('The pond ran dry'); return { cont: false }; }
    if (sets13()) { endGame('Every set is on the dock'); return { cont: false }; }
    return { cont: true, go: true };
  }
  const nope = { you: ['Go fish!'], walt: ['Go fish, kiddo.', 'Nope. Go fish.'], rosie: ['Nope! Go fish!', 'Go fish, sailor.'], finn: ['GO FISH!', 'Ha! Go fish!'] }[q.id];
  say(q.i, nope[Math.floor(Math.random() * nope.length)]);
  await wait(700);
  if (!pond.length) { endGame('The pond ran dry'); return { cont: false }; }
  sfx.splash();
  const id = await drawPond(p);
  const wish = IR.rank(id) === r;
  if (p.i === 0) log(`<span class="fish">Go fish!</span> You drew the ${IR.cardName(id)}.`);
  else log(`<span class="fish">Go fish!</span> ${nm(p)} drew from the pond.`);
  if (wish) {
    cards.move(cel[id], 750, 280, { up: true, s: 1.1, dur: 420, z: 600 }); await wait(700);
    banner('Fished your wish!', p.i === 0 ? `You drew ${aOrN(r, 1)}. Go again!` : `${p.full} drew ${aOrN(r, 1)}`);
    sfx.reel(); log(`<span class="good">${nm(p)} fished ${p.i === 0 ? 'your' : 'their'} wish</span> and ${p.i === 0 ? 'go' : 'goes'} again.`);
    p.known.add(r);
    await wait(900); layoutHand(p.i);
  }
  await checkSets(p);
  if (!pond.length) { endGame('The pond ran dry'); return { cont: false }; }
  if (sets13()) { endGame('Every set is on the dock'); return { cont: false }; }
  return { cont: true, go: wish };
}

/* ---------- the player ---------- */
function resolveWait(v) { if (waiting) { const w = waiting; waiting = null; w(v); } }
function humanAsk() {
  selRank = 0;
  return new Promise(res => { waiting = res; layoutHand(0, 250); refreshPrompt(); });
}
function refreshPrompt() {
  const pr = $('#prompt'), msg = $('#promptMsg'), asks = $('#asks');
  P.forEach(p => p.el.classList.remove('target'));
  if (!gameOn || turn !== 0 || !waiting) { pr.classList.add('hidden'); P[0].hand.forEach(id => cel[id].classList.remove('hot')); return; }
  pr.classList.remove('hidden');
  P[0].hand.forEach(id => cel[id].classList.add('hot'));
  asks.innerHTML = '';
  if (!selRank) { msg.innerHTML = '<b>Your turn.</b> Click a card to choose what to ask for.'; return; }
  msg.innerHTML = `Ask for <b>${IR.RANK_PLURAL[selRank - 1]}</b>. Who do you ask?`;
  P.slice(1).forEach(q => { if (!q.hand.length) return; q.el.classList.add('target'); const b = IR.el('button', '', asks, q.name); b.onclick = () => pickTarget(q.i); });
}
function pickTarget(i) { if (!selRank || !waiting) return; const r = selRank; selRank = 0; P.forEach(p => p.el.classList.remove('target')); $('#prompt').classList.add('hidden'); layoutHand(0, 250); resolveWait({ t: i, r }); }
$('#cards').addEventListener('click', e => {
  const c = e.target.closest('.card'); if (!c || !waiting || turn !== 0) return;
  if (!P[0].hand.includes(c._id)) return;
  const r = IR.rank(c._id); selRank = selRank === r ? 0 : r; audio.sFlip(); layoutHand(0, 200); refreshPrompt();
});

/* ---------- the computer folks ---------- */
function aiAsk(p) {
  const counts = {}; p.hand.forEach(id => counts[IR.rank(id)] = (counts[IR.rank(id)] || 0) + 1);
  const ranks = Object.keys(counts).map(Number);
  const opp = P.filter(q => q !== p && q.hand.length);
  const memory = S.skill === 'sharp' ? .9 : .45;
  let best = null;
  for (const r of ranks) for (const q of opp) {
    let sc = counts[r] * 1.2 + Math.random() * 1.5 + q.hand.length * .05;
    if (q.known.has(r) && Math.random() < memory) sc += 6;
    if (!best || sc > best.sc) best = { sc, t: q.i, r };
  }
  return best;
}

/* ---------- end of game ---------- */
function endGame(why) {
  if (!gameOn) return; gameOn = false; busy = true; resolveWait(null); updateHUD(); refreshPrompt();
  const max = Math.max(...P.map(p => p.sets.length)), winners = P.filter(p => p.sets.length === max);
  const youWin = winners.includes(P[0]);
  if (youWin) { ST.won++; ST.streak++; ST.bestStreak = Math.max(ST.bestStreak, ST.streak); } else ST.streak = 0;
  ST.best = Math.max(ST.best, P[0].sets.length); save.write(true); updateHUD();
  $('#rKick').textContent = why;
  const names = winners.map(w => w.i === 0 ? 'You' : w.name);
  $('#rTitle').textContent = youWin ? (winners.length > 1 ? 'A Tie on the Dock!' : 'Biggest Catch!') : winners.length > 1 ? `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]} Tie` : `${winners[0].full} Wins`;
  $('#rStand').innerHTML = [...P].sort((a, b) => b.sets.length - a.sets.length).map(p => `<div class="r${p.sets.length === max ? ' top' : ''}"><img src="${AV[p.id]}"><span>${p.i === 0 ? 'You' : p.full}</span><b>${p.sets.length}</b>&nbsp;set${p.sets.length === 1 ? '' : 's'}</div>`).join('');
  $('#rRecord').textContent = `Games ${ST.played} · Won ${ST.won} · Best streak ${ST.bestStreak} · Most sets in a game ${ST.best}`;
  log(`<span class="set">${why}.</span> ${youWin ? (winners.length > 1 ? 'You tied for the most sets!' : 'You win!') : names.join(' & ') + (winners.length > 1 ? ' tie.' : ' wins.')}`);
  if (youWin) { sfx.win(); setTimeout(() => fx.burst(800, 300, 160, ['#ffd76a', '#fff', '#9fd8f5', '#f4a261', '#b8f0a8'], { speed: 800, size: 9 }), 300); } else sfx.lose();
  setTimeout(() => IR.panel.show('result'), 1400);
}

/* ---------- menus ---------- */
function chips(id, key) { const box = $(id); const sync = () => box.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === S[key])); box.querySelectorAll('button').forEach(b => b.onclick = () => { S[key] = b.dataset.v; save.write(); sync(); }); sync(); }
chips('#optPace', 'pace'); chips('#optSkill', 'skill');
$('#folks').innerHTML = ART.FOLKS.slice(1).map(f => `<div class="f"><img src="${AV[f.id]}"><b>${f.full}</b><i>${f.tag}</i></div>`).join('');
const rec = () => $('#record').textContent = ST.played ? `Games ${ST.played} · Won ${ST.won} · Sets laid down ${ST.sets}` : 'Grab a seat on the dock.';
rec();
$('#bStart').onclick = () => { audio.unlock(); newGame(); };
$('#bAgain').onclick = () => newGame();
$('#bToTitle').onclick = () => { IR.panel.hide('result'); rec(); IR.panel.show('title'); };
$('#bNew').onclick = () => { audio.unlock(); newGame(); };
$('#bRules').onclick = $('#bHow').onclick = () => IR.panel.show('rules');
$('#bCredits').onclick = $('#bCredits2').onclick = async () => { $('#changelog').innerHTML = IR.mdChangelog(await IR.loadChangelog()); IR.panel.show('credits'); };
addEventListener('keydown', e => { if (e.key === 'F2') { e.preventDefault(); newGame(); } });
IR.panel.wire();
updateHUD();

/* idle table behind the title: a pond of cards */
const idle = IR.shuffle([...Array(52).keys()]);
idle.forEach((id, k) => { const s = pondSpot(k); cel[id] = cards.make(id, { x: s.x, y: s.y, r: s.r, s: .72, up: false }); });
pond = idle; updateHUD();
window.__gofish = { P, get pond() { return pond; }, get turn() { return turn; }, get gameOn() { return gameOn; }, newGame, S };
})();
