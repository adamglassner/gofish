/* Go Fish music: three original, calm lakeside tunes, played live by the
   game (fingerpicked nylon guitar, wooden flute, soft strings, upright bass,
   and the odd loon across the water). (c) 2026 Ironite */
'use strict';
const MUSIC = (() => {
const parseMel = (s, at) => { const ev = []; let t = at; s.split(/\s+/).filter(x => x && x !== '|').forEach(tok => { const [n, d] = tok.split(':'); if (n !== 'R') ev.push({ n, t, d: +d }); t += +d; }); return { ev, end: t }; };

/* bars: array of chord strings ("C" or "Dm7 G" for two per bar) */
function arrange(tune) {
  const ev = [], B = tune.beats; let t = 0;
  const gtr = (bars, at, vel = 1, dense = true) => {
    bars.forEach((bar, bi) => {
      const chs = bar.split(' '), per = B / chs.length;
      chs.forEach((sym, ci) => {
        const c = IR.chord(sym), t0 = at + bi * B + ci * per;
        const root = IR.pcAbove(c.root, 40), fifth = IR.pcAbove((c.root + 7) % 12, 45);
        const tones = c.pcs.map(pc => IR.pcAbove(pc, 55)).sort((a, b) => a - b);
        const hi = c.pcs.map(pc => IR.pcAbove(pc, 62)).sort((a, b) => a - b);
        if (B === 3) { // waltz picking
          ev.push({ t: t0, i: 'gtr', m: root, v: .9 * vel });
          [[1, tones[0]], [1.5, hi[1] || tones[1]], [2, tones[1]], [2.5, hi[0]]].forEach(([o, m]) => o < per && ev.push({ t: t0 + o, i: 'gtr', m, v: .55 * vel }));
        } else {
          const pat = per >= 4 ? [[0, root, .9], [.5, tones[1], .5], [1, hi[1] || hi[0], .55], [1.5, tones[0], .45], [2, fifth, .8], [2.5, tones[1], .5], [3, hi[2] || hi[1], .55], [3.5, tones[2] || tones[0], .45]]
            : [[0, root, .9], [.5, tones[1], .5], [1, hi[1] || hi[0], .55], [1.5, tones[0], .45]];
          pat.forEach(([o, m, v]) => { if (o < per && (dense || o % 1 === 0)) ev.push({ t: t0 + o, i: 'gtr', m, v: v * vel }); });
        }
        if (tune.pad) ev.push({ t: t0, i: 'pad', ms: c.pcs.map(pc => IR.pcAbove(pc, 52)), d: per, v: .8 });
        if (tune.bass && vel > .7) ev.push({ t: t0, i: 'bass', m: IR.pcAbove(c.root, 33), d: per * .9, v: .55 });
      });
    });
    return at + bars.length * B;
  };
  const lead = (mel, at, inst, oct = 0, v = 1) => { parseMel(mel, at).ev.forEach(e => ev.push({ t: e.t, i: inst, m: IR.n2m(e.n) + oct, d: e.d, v })); };
  // form: intro, A, B, A (second voice), B, tag
  t = gtr(tune.intro, t, .85, false);
  ev.push({ t: 0.5, i: 'loon', m: 0, d: 1 });
  for (const [sec, inst, oct] of tune.form) {
    const S = tune[sec]; lead(S.mel, t, inst, oct, inst === 'flute' ? 1 : .85); t = gtr(S.ch, t, 1);
  }
  t = gtr(tune.tag, t, .8, false);
  ev.push({ t: t - B, i: 'loon', m: 0, d: 1 });
  for (let k = 0; k < t; k += 3 + Math.random() * 5) ev.push({ t: k, i: 'lap', d: 1 });
  ev.sort((a, b) => a.t - b.t);
  return { name: tune.name, bpm: tune.bpm, events: ev, len: t, gap: 3 };
}

const TUNES = [
  { name: 'Morning on Loon Lake', bpm: 72, beats: 4, pad: true, bass: true,
    intro: ['G', 'Cmaj7', 'G', 'D'],
    A: { ch: ['G', 'Cmaj7', 'Em', 'D', 'G', 'Cmaj7', 'Am7', 'D'], mel: 'D5:1.5 B4:.5 G4:2 | E5:1.5 D5:.5 C5:1 B4:1 | B4:1 G4:1 E4:1 G4:1 | A4:3 R:1 | D5:1.5 B4:.5 G5:2 | G5:1 E5:1 D5:1 C5:1 | C5:1 B4:1 A4:1 E5:1 | D5:4' },
    B: { ch: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am7', 'D'], mel: 'G5:1.5 F#5:.5 E5:2 | E5:1 D5:1 C5:1 E5:1 | D5:2 B4:1 G4:1 | A4:2 F#4:2 | B4:1 E5:1 G5:1.5 F#5:.5 | E5:2 C5:2 | A4:1 C5:1 E5:1 D5:1 | D5:3 R:1' },
    form: [['A', 'flute', 0], ['B', 'flute', 0], ['A', 'gtrLead', -12], ['B', 'flute', 0]],
    tag: ['G', 'Cmaj7', 'G'] },
  { name: 'Dockside Drift', bpm: 92, beats: 3, pad: false, bass: true,
    intro: ['D', 'G', 'D', 'A'],
    A: { ch: ['D', 'Bm', 'G', 'A', 'D', 'Bm', 'Em', 'A7'], mel: 'F#5:2 E5:1 | D5:2 B4:1 | B4:1.5 C#5:.5 D5:1 | E5:3 | F#5:2 A5:1 | F#5:2 D5:1 | E5:1 F#5:1 G5:1 | E5:3' },
    B: { ch: ['G', 'D', 'Em', 'A', 'G', 'D', 'A7', 'D'], mel: 'B5:2 A5:1 | F#5:2 D5:1 | E5:1.5 F#5:.5 G5:1 | A5:3 | B5:2 A5:1 | F#5:1 E5:1 D5:1 | C#5:1 D5:1 E5:1 | D5:3' },
    form: [['A', 'flute', 0], ['B', 'flute', 0], ['A', 'gtrLead', -12], ['B', 'flute', 0]],
    tag: ['D', 'G', 'D'] },
  { name: 'Cattail Lullaby', bpm: 64, beats: 4, pad: true, bass: false,
    intro: ['C', 'Am', 'F', 'G'],
    A: { ch: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm7', 'G'], mel: 'E5:2 G5:1 E5:1 | C5:2 A4:2 | A4:1 C5:1 F5:1.5 E5:.5 | D5:4 | E5:2 G5:1 C6:1 | B5:2 A5:2 | F5:1 E5:1 D5:1 C5:1 | D5:3 R:1' },
    B: { ch: ['F', 'C', 'Dm7', 'G', 'Em', 'Am', 'Dm7 G', 'C'], mel: 'A5:2 F5:1 A5:1 | G5:2 E5:2 | F5:1 E5:1 D5:1 F5:1 | G5:4 | E5:1.5 F5:.5 G5:1 E5:1 | C5:2 A4:2 | D5:1 F5:1 E5:1 D5:1 | C5:4' },
    form: [['A', 'flute', 0], ['B', 'flute', 0], ['A', 'gtrLead', -12], ['B', 'flute', -12]],
    tag: ['F', 'C'] },
];

const instruments = {
  gtr(t, e, d, v) { this.pluck(t, e.m, .2 * v, { decay: .9975, bright: .38, dur: 2.2, lp: 2600, body: 220 }); },
  gtrLead(t, e, d, v) { this.pluck(t, e.m, .34 * v, { decay: .998, bright: .5, dur: 2.4, lp: 3400, body: 260 }); },
  flute(t, e, d, v) { this.flute(t, e.m, .85 * v, d * .95); },
  pad(t, e, d, v) { this.pad(t, e.ms, .7 * v, d); },
  bass(t, e, d, v) { this.bass(t, e.m, .6 * v, d); },
  lap(t, e, d, v) { this.noiseHit(t, .05, { type: 'lowpass', freq: 500, attack: .4, decay: .9 }); },
  loon(t) { // a distant loon: two long, sliding wails
    const ac = this.ac; [[0, 740, 880, 1.6], [1.9, 880, 1040, 1.3]].forEach(([dt, f0, f1, len]) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(f0, t + dt); o.frequency.linearRampToValueAtTime(f1, t + dt + .35); o.frequency.setValueAtTime(f1, t + dt + len - .3); o.frequency.linearRampToValueAtTime(f1 * .97, t + dt + len);
      const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 6; lg.gain.value = 9; lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(.022, t + dt + .25); g.gain.setValueAtTime(.022, t + dt + len - .3); g.gain.linearRampToValueAtTime(0, t + dt + len);
      o.connect(g); g.connect(this.wet); [o, lfo].forEach(x => { x.start(t + dt); x.stop(t + dt + len + .1); });
    });
  },
};

function sfx(audio) {
  return {
    splash() { audio.sfx(function (t, o) {
      this.noiseHit(t, .9, { freq: 2400, q: .6, attack: .005, decay: .35, sweep: 500, out: o });
      this.noiseHit(t + .02, .5, { freq: 600, type: 'lowpass', attack: .01, decay: .25, out: o });
      for (let i = 0; i < 9; i++) { const tt = t + .12 + i * .045 + Math.random() * .03, ac = this.ac, os = ac.createOscillator(), g = ac.createGain(), f = 500 + Math.random() * 700;
        os.frequency.setValueAtTime(f, tt); os.frequency.exponentialRampToValueAtTime(f * 2.4, tt + .05); g.gain.setValueAtTime(.06, tt); g.gain.exponentialRampToValueAtTime(.0005, tt + .07); os.connect(g); g.connect(o); os.start(tt); os.stop(tt + .1); }
    }); },
    plop() { audio.sfx(function (t, o) { const ac = this.ac, os = ac.createOscillator(), g = ac.createGain(); os.frequency.setValueAtTime(380, t); os.frequency.exponentialRampToValueAtTime(950, t + .08); g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + .12); os.connect(g); g.connect(o); os.start(t); os.stop(t + .15); }); },
    reel() { audio.sfx(function (t, o) { // reel-in ratchet + whir
      let tt = t; for (let i = 0; i < 22; i++) { const gap = .055 - i * .0018; tt += gap; this.noiseHit(tt, .3, { freq: 3800, q: 6, decay: .012, out: o }); const ac = this.ac, os = ac.createOscillator(), g = ac.createGain(); os.type = 'square'; os.frequency.value = 1900; g.gain.setValueAtTime(.025, tt); g.gain.exponentialRampToValueAtTime(.0005, tt + .012); os.connect(g); g.connect(o); os.start(tt); os.stop(tt + .02); }
      this.noiseHit(t, .12, { freq: 1500, q: 1.5, attack: .3, decay: .5, sweep: 2600, out: o });
    }); },
    set() { audio.sfx(function (t, o) { [76, 79, 83, 88, 91].forEach((m, i) => this.bell(t + i * .08, m, .9, o, 2.2)); this.vibes(t + .45, 84, .5, .8, o); }); },
    nope() { audio.sfx(function (t, o) { this.vibes(t, 64, .6, .2, o); this.vibes(t + .12, 60, .6, .3, o); }); },
    win() { audio.sfx(function (t, o) { [67, 72, 76, 79, 84].forEach((m, i) => { this.bell(t + i * .12, m, 1, o, 2.4); this.pluck(t + i * .12, m - 12, .3, { decay: .998, bright: .5, dur: 2, out: o }); }); }); },
    lose() { audio.sLose(); },
  };
}

return { tunes: () => TUNES.map(arrange), instruments, sfx };
})();
