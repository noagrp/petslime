(() => {
  const SFX_KEY = 'petslime-sfx-v1';
  let enabled = localStorage.getItem(SFX_KEY) !== 'off';
  let ctx = null;
  let master = null;
  let lastSlimeTap = 0;
  let dragStart = null;
  let scheduled = [];

  function ensureAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!ctx) {
        ctx = new AudioCtx();
        master = ctx.createGain();
        master.gain.value = 0.18;
        master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    } catch {
      return null;
    }
  }

  function tone(freq = 440, duration = .12, opts = {}) {
    if (!enabled) return;
    try {
      const ac = ensureAudio();
      if (!ac || !master) return;
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = opts.type || 'sine';
      osc.frequency.setValueAtTime(freq, now);
      if (opts.endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, opts.endFreq), now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(opts.volume || .32, now + Math.min(.025, duration * .25));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + duration + .03);
    } catch {}
  }

  function noise(duration = .12, opts = {}) {
    if (!enabled) return;
    try {
      const ac = ensureAudio();
      if (!ac || !master) return;
      const frames = Math.max(1, Math.floor(ac.sampleRate * duration));
      const buffer = ac.createBuffer(1, frames, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
      const src = ac.createBufferSource();
      const filter = ac.createBiquadFilter();
      const gain = ac.createGain();
      filter.type = opts.filter || 'lowpass';
      filter.frequency.value = opts.frequency || 900;
      if (opts.q) filter.Q.value = opts.q;
      gain.gain.setValueAtTime(opts.volume || .16, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
      src.buffer = buffer;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      src.start();
    } catch {}
  }

  function laterSound(fn, ms) {
    const id = setTimeout(fn, ms);
    scheduled.push(id);
    return id;
  }

  function clearScheduled() {
    scheduled.forEach(clearTimeout);
    scheduled = [];
  }

  function sequence(notes, gap = 70) {
    notes.forEach((n, i) => laterSound(() => tone(n.freq, n.duration || .1, n), i * gap));
  }

  function sfx(name, variant = 0) {
    if (!enabled) return;
    switch (name) {
      case 'bloop': tone(320, .09, { endFreq: 470, volume: .27 }); break;
      case 'excited': sequence([{freq:420,duration:.08},{freq:620,duration:.1},{freq:820,duration:.12}], 65); break;
      case 'squish': tone(180, .18, { endFreq: 110, type: 'triangle', volume: .26 }); break;
      case 'pet': sequence([{freq:260,duration:.1},{freq:310,duration:.12}], 85); break;
      case 'eat':
        noise(.09, { frequency: 1200, volume: .13 });
        laterSound(() => noise(.07, { frequency: 850, volume: .11 }), 85);
        break;
      case 'boing': {
        const base = 205 + variant * 18;
        tone(base, .16, { endFreq: base + 285, type: 'sine', volume: .28 });
        break;
      }
      case 'skip-step': {
        const base = 330 + variant * 22;
        tone(base, .085, { endFreq: base + 110, type: 'triangle', volume: .19 });
        laterSound(() => tone(base + 95, .055, { endFreq: base + 45, type: 'sine', volume: .11 }), 55);
        break;
      }
      case 'whoosh':
        noise(.16, { filter: 'bandpass', frequency: 980 + variant * 110, q: 1.1, volume: .13 });
        break;
      case 'roll-slow':
        tone(145, .42, { endFreq: 235, type: 'triangle', volume: .18 });
        noise(.28, { filter: 'lowpass', frequency: 420, volume: .07 });
        break;
      case 'roll-fast':
        tone(235, .2, { endFreq: 470, type: 'triangle', volume: .17 });
        noise(.16, { filter: 'bandpass', frequency: 900, volume: .08 });
        break;
      case 'dance-beat':
        tone(145, .08, { endFreq: 105, type: 'triangle', volume: .2 });
        laterSound(() => noise(.05, { filter: 'bandpass', frequency: 1450, q: .9, volume: .08 }), 75);
        laterSound(() => tone(520 + variant * 35, .07, { endFreq: 610 + variant * 30, type: 'sine', volume: .1 }), 120);
        break;
      case 'impact':
        tone(115, .08, { endFreq: 80, type: 'triangle', volume: .32 });
        noise(.05, { frequency: 700, volume: .1 });
        break;
      case 'sparkle': sequence([{freq:760,duration:.07},{freq:980,duration:.09}], 65); break;
      case 'hide':
        tone(360, .08, { endFreq: 260, volume: .2 });
        laterSound(() => tone(520, .07, { endFreq: 650, volume: .18 }), 420);
        break;
      case 'dig':
        noise(.17, { filter: 'bandpass', frequency: 520 + variant * 45, q: .65, volume: .14 });
        tone(115 + variant * 8, .08, { endFreq: 80, type: 'triangle', volume: .12 });
        laterSound(() => noise(.11, { filter: 'highpass', frequency: 1250, volume: .07 }), 120);
        break;
      case 'bubble':
        tone(520, .13, { endFreq: 760, volume: .16 });
        laterSound(() => tone(880, .06, { endFreq: 620, volume: .12 }), 520);
        break;
      case 'phone': tone(720, .045, { type: 'square', volume: .1 }); break;
      case 'tv':
        tone(118, .16, { endFreq: 92, type: 'triangle', volume: .18 });
        laterSound(() => tone(238, .07, { endFreq: 210, type: 'square', volume: .08 }), 280);
        laterSound(() => tone(184, .08, { endFreq: 230, type: 'square', volume: .07 }), 650);
        laterSound(() => tone(268, .06, { endFreq: 220, type: 'square', volume: .07 }), 980);
        break;
      case 'paper':
        noise(.13, { filter: 'highpass', frequency: 1500, volume: .11 });
        laterSound(() => noise(.08, { filter: 'bandpass', frequency: 2200, q: .7, volume: .07 }), 95);
        break;
      case 'pour':
        noise(.46, { filter: 'bandpass', frequency: 1250, q: .55, volume: .1 });
        laterSound(() => noise(.34, { filter: 'highpass', frequency: 2100, volume: .06 }), 110);
        break;
      case 'chime': sequence([{freq:523,duration:.11},{freq:659,duration:.11},{freq:784,duration:.15}], 95); break;
      case 'sleep': sequence([{freq:260,duration:.16,endFreq:220},{freq:210,duration:.2,endFreq:170}], 150); break;
      case 'land': tone(100, .09, { endFreq: 65, type: 'triangle', volume: .27 }); break;
    }
  }

  window.petSfx = sfx;

  function addToggle() {
    const menu = document.getElementById('settings-menu');
    if (!menu || document.getElementById('sound-effects')) return;
    const button = document.createElement('button');
    button.id = 'sound-effects';
    button.type = 'button';
    const update = () => { button.textContent = `Sound effects: ${enabled ? 'On' : 'Off'}`; };
    update();
    const howto = document.getElementById('howto');
    menu.insertBefore(button, howto || null);
    button.addEventListener('click', () => {
      enabled = !enabled;
      localStorage.setItem(SFX_KEY, enabled ? 'on' : 'off');
      update();
      clearScheduled();
      if (enabled) sfx('chime');
    });
  }

  function playMovement(kind) {
    clearScheduled();
    if (kind === 'jump') {
      [[1080,0],[1880,1],[2730,2],[3710,1]].forEach(([t,v]) => laterSound(() => sfx('boing', v), t));
    } else if (kind === 'sprint') {
      [[520,0],[1120,1],[1780,2],[2440,1]].forEach(([t,v]) => laterSound(() => sfx('whoosh', v), t));
    } else if (kind === 'skip') {
      [[960,0],[2080,1],[3280,0]].forEach(([t,v]) => laterSound(() => sfx('skip-step', v), t));
    } else if (kind === 'dodge') {
      [[480,0],[1070,1],[1680,2],[2290,1],[2890,0]].forEach(([t,v]) => laterSound(() => sfx('whoosh', v), t));
    } else if (kind === 'roll') {
      sfx('roll-slow');
      laterSound(() => sfx('roll-slow'), 950);
      laterSound(() => sfx('roll-slow'), 1900);
      laterSound(() => sfx('roll-fast'), 2650);
      laterSound(() => sfx('roll-fast'), 3150);
      laterSound(() => sfx('roll-fast'), 3550);
    } else if (kind === 'dance') {
      sfx('dance-beat', 0);
      laterSound(() => sfx('dance-beat', 1), 720);
      laterSound(() => sfx('dance-beat', 2), 1450);
      laterSound(() => sfx('dance-beat', 1), 2200);
      laterSound(() => sfx('dance-beat', 0), 2870);
    }
  }

  function bindActionSounds() {
    document.querySelectorAll('[data-food]').forEach(button => {
      button.addEventListener('click', () => { clearScheduled(); sfx('eat'); });
    });

    document.querySelectorAll('[data-play]').forEach(button => {
      button.addEventListener('click', () => playMovement(button.dataset.play));
    });

    document.querySelectorAll('[data-interact]').forEach(button => {
      button.addEventListener('click', () => {
        clearScheduled();
        const kind = button.dataset.interact;
        if (kind === 'highfive') laterSound(() => sfx('impact'), 620);
        else if (kind === 'peace') sfx('sparkle');
        else if (kind === 'wave') sfx('bloop');
        else if (kind === 'hide') sfx('hide');
        else if (kind === 'dig') {
          laterSound(() => sfx('dig', 0), 420);
          laterSound(() => sfx('dig', 1), 1000);
          laterSound(() => sfx('dig', 2), 2050);
        }
        else if (kind === 'bubble') sfx('bubble');
      });
    });

    document.querySelectorAll('[data-home]').forEach(button => {
      button.addEventListener('click', () => {
        clearScheduled();
        const kind = button.dataset.home;
        if (kind === 'tv') {
          sfx('tv');
          laterSound(() => sfx('tv'), 2050);
        } else if (kind === 'phone') {
          sfx('phone');
          laterSound(() => sfx('phone'), 850);
          laterSound(() => sfx('phone'), 2050);
          laterSound(() => sfx('phone'), 3350);
        } else if (kind === 'read') {
          sfx('paper');
          laterSound(() => sfx('paper'), 2850);
        } else if (kind === 'music') {
          sfx('chime');
        } else if (kind === 'shower') {
          sfx('pour');
          laterSound(() => sfx('pour'), 700);
          laterSound(() => sfx('pour'), 1450);
          laterSound(() => sfx('pour'), 2200);
          laterSound(() => sfx('pour'), 2950);
          laterSound(() => sfx('pour'), 3650);
        } else if (kind === 'bed') {
          sfx('sleep');
        }
      });
    });
  }

  const slime = document.getElementById('slime');
  if (slime) {
    slime.addEventListener('pointerdown', event => {
      clearScheduled();
      dragStart = { x: event.clientX, y: event.clientY, time: performance.now() };
    });
    slime.addEventListener('pointerup', event => {
      if (!dragStart) return;
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      const distance = Math.hypot(dx, dy);
      const elapsed = performance.now() - dragStart.time;
      dragStart = null;
      if (distance > 38) {
        sfx('whoosh');
        laterSound(() => sfx('land'), 420);
        return;
      }
      if (elapsed > 480) {
        sfx('squish');
        return;
      }
      const now = Date.now();
      if (now - lastSlimeTap < 300) {
        sfx('excited');
        lastSlimeTap = 0;
      } else {
        sfx('bloop');
        lastSlimeTap = now;
      }
    });
  }

  addToggle();
  bindActionSounds();
})();