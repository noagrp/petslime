(() => {
  const SFX_KEY = 'petslime-sfx-v1';
  let enabled = localStorage.getItem(SFX_KEY) !== 'off';
  let ctx = null;
  let master = null;
  let lastSlimeTap = 0;
  let dragStart = null;

  function ensureAudio() {
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
  }

  function tone(freq = 440, duration = .12, opts = {}) {
    if (!enabled) return;
    const ac = ensureAudio();
    if (!ac) return;
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
  }

  function noise(duration = .12, opts = {}) {
    if (!enabled) return;
    const ac = ensureAudio();
    if (!ac) return;
    const frames = Math.max(1, Math.floor(ac.sampleRate * duration));
    const buffer = ac.createBuffer(1, frames, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = ac.createBufferSource();
    const filter = ac.createBiquadFilter();
    const gain = ac.createGain();
    filter.type = opts.filter || 'lowpass';
    filter.frequency.value = opts.frequency || 900;
    gain.gain.setValueAtTime(opts.volume || .16, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
    src.buffer = buffer;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start();
  }

  function sequence(notes, gap = 70) {
    notes.forEach((n, i) => setTimeout(() => tone(n.freq, n.duration || .1, n), i * gap));
  }

  function sfx(name) {
    if (!enabled) return;
    switch (name) {
      case 'bloop':
        tone(320, .09, { endFreq: 470, volume: .27 });
        break;
      case 'excited':
        sequence([{freq:420,duration:.08},{freq:620,duration:.1},{freq:820,duration:.12}], 65);
        break;
      case 'squish':
        tone(180, .18, { endFreq: 110, type: 'triangle', volume: .26 });
        break;
      case 'pet':
        sequence([{freq:260,duration:.1},{freq:310,duration:.12}], 85);
        break;
      case 'eat':
        noise(.09, { frequency: 1200, volume: .13 });
        setTimeout(() => noise(.07, { frequency: 850, volume: .11 }), 85);
        break;
      case 'boing':
        tone(220, .18, { endFreq: 520, type: 'sine', volume: .3 });
        break;
      case 'whoosh':
        noise(.18, { filter: 'bandpass', frequency: 1150, volume: .14 });
        break;
      case 'roll':
        tone(150, .38, { endFreq: 260, type: 'triangle', volume: .2 });
        setTimeout(() => tone(230, .18, { endFreq: 420, type: 'triangle', volume: .18 }), 390);
        break;
      case 'impact':
        tone(115, .08, { endFreq: 80, type: 'triangle', volume: .32 });
        noise(.05, { frequency: 700, volume: .1 });
        break;
      case 'sparkle':
        sequence([{freq:760,duration:.07},{freq:980,duration:.09}], 65);
        break;
      case 'hide':
        tone(360, .08, { endFreq: 260, volume: .2 });
        setTimeout(() => tone(520, .07, { endFreq: 650, volume: .18 }), 420);
        break;
      case 'dig':
        noise(.2, { frequency: 520, volume: .13 });
        setTimeout(() => noise(.16, { frequency: 430, volume: .1 }), 230);
        break;
      case 'bubble':
        tone(520, .13, { endFreq: 760, volume: .16 });
        setTimeout(() => tone(880, .06, { endFreq: 620, volume: .12 }), 520);
        break;
      case 'phone':
        tone(720, .045, { type: 'square', volume: .1 });
        break;
      case 'chime':
        sequence([{freq:523,duration:.11},{freq:659,duration:.11},{freq:784,duration:.15}], 95);
        break;
      case 'sleep':
        sequence([{freq:260,duration:.16,endFreq:220},{freq:210,duration:.2,endFreq:170}], 150);
        break;
      case 'land':
        tone(100, .09, { endFreq: 65, type: 'triangle', volume: .27 });
        break;
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
      if (enabled) sfx('chime');
    });
  }

  document.addEventListener('click', event => {
    const food = event.target.closest('[data-food]');
    if (food) { sfx('eat'); return; }

    const play = event.target.closest('[data-play]');
    if (play) {
      const kind = play.dataset.play;
      if (kind === 'jump' || kind === 'skip') sfx('boing');
      else if (kind === 'sprint' || kind === 'dodge') sfx('whoosh');
      else if (kind === 'roll') sfx('roll');
      else if (kind === 'dance') sfx('chime');
      return;
    }

    const interact = event.target.closest('[data-interact]');
    if (interact) {
      const kind = interact.dataset.interact;
      if (kind === 'highfive') setTimeout(() => sfx('impact'), 620);
      else if (kind === 'peace') sfx('sparkle');
      else if (kind === 'wave') sfx('bloop');
      else if (kind === 'hide') sfx('hide');
      else if (kind === 'dig') sfx('dig');
      else if (kind === 'bubble') sfx('bubble');
      return;
    }

    const home = event.target.closest('[data-home]');
    if (home) {
      const kind = home.dataset.home;
      if (kind === 'phone') { sfx('phone'); setTimeout(() => sfx('phone'), 850); }
      else if (kind === 'music') sfx('chime');
      else if (kind === 'bed') sfx('sleep');
      return;
    }
  }, true);

  const slime = document.getElementById('slime');
  if (slime) {
    slime.addEventListener('pointerdown', event => {
      dragStart = { x: event.clientX, y: event.clientY, time: performance.now() };
    }, true);
    slime.addEventListener('pointerup', event => {
      if (!dragStart) return;
      const dx = event.clientX - dragStart.x;
      const dy = event.clientY - dragStart.y;
      const distance = Math.hypot(dx, dy);
      const elapsed = performance.now() - dragStart.time;
      dragStart = null;
      if (distance > 38) { sfx('whoosh'); setTimeout(() => sfx('land'), 420); return; }
      if (elapsed > 480) { sfx('squish'); return; }
      const now = Date.now();
      if (now - lastSlimeTap < 300) { sfx('excited'); lastSlimeTap = 0; }
      else { sfx('bloop'); lastSlimeTap = now; }
    }, true);
  }

  addToggle();
})();