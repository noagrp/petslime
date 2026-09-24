(() => {
  const SFX_KEY = 'petslime-sfx-v1';
  const SFX_VOL_KEY = 'petslime-sfx-volume-v1';
  let enabled = localStorage.getItem(SFX_KEY) !== 'off';
  let sfxVolume = Math.max(0, Math.min(100, Number(localStorage.getItem(SFX_VOL_KEY) ?? 65) || 65));
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
        master.gain.value = 0.18 * (sfxVolume / 65);
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

  function setSfxVolume(value) {
    sfxVolume = Math.max(0, Math.min(100, Number(value) || 0));
    localStorage.setItem(SFX_VOL_KEY, String(sfxVolume));
    if (master) master.gain.value = 0.18 * (sfxVolume / 65);
  }

  window.petSfx = sfx;
  window.petSfxSetVolume = setSfxVolume;

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

    const wrap = document.createElement('div');
    wrap.className = 'audio-range';
    const label = document.createElement('label');
    const title = document.createElement('span');
    const value = document.createElement('span');
    title.textContent = 'SFX volume';
    value.textContent = `${sfxVolume}%`;
    label.append(title, value);
    const range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';
    range.step = '1';
    range.value = String(sfxVolume);
    range.setAttribute('aria-label', 'Sound effects volume');
    range.addEventListener('input', () => {
      setSfxVolume(range.value);
      value.textContent = `${sfxVolume}%`;
    });
    wrap.append(label, range);
    menu.insertBefore(wrap, howto || null);

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

(() => {
  const HOUR = 3600000;
  const FUTURE_STAMP = 315360000000;
  const FREE_COIN_CHANCE = .22;
  const FREE_COIN_COOLDOWN = 12000;
  const INTERACT_COIN_COOLDOWN = 2500;

  const FOOD = {
    '🍓': {name:'Strawberry', fullness:5, happiness:5, energy:0, cost:3},
    '🍏': {name:'Green apple', fullness:7, happiness:2, energy:2, cost:5},
    '🍪': {name:'Cookie', fullness:4, happiness:7, energy:1, cost:5},
    '🍇': {name:'Grapes', fullness:6, happiness:3, energy:3, cost:6},
    '🍉': {name:'Watermelon', fullness:10, happiness:3, energy:1, cost:8},
    '🥕': {name:'Carrot', fullness:7, happiness:1, energy:4, cost:6}
  };

  const PLAY = {
    jump:{happiness:8, energy:-7, fullness:-3},
    dance:{happiness:10, energy:-10, fullness:-5},
    sprint:{happiness:8, energy:-10, fullness:-4},
    skip:{happiness:9, energy:-7, fullness:-4},
    dodge:{happiness:7, energy:-7, fullness:-3},
    roll:{happiness:7, energy:-7, fullness:-2}
  };

  const INTERACT_COINS = {highfive:1,peace:1,wave:1,hide:2,dig:3,bubble:1};
  const HOME = {
    tv:{happiness:5,energy:7,fullness:-2},
    phone:{happiness:5,energy:-6,fullness:-2},
    read:{happiness:4,energy:4,fullness:-2},
    music:{happiness:8,energy:2,fullness:-2},
    shower:{happiness:5,energy:4,fullness:-2},
    bed:{happiness:0,energy:15,fullness:-5}
  };

  if (!Number.isFinite(Number(state.coins))) state.coins = 15;
  state.coins = Math.max(0, Math.floor(Number(state.coins) || 0));
  if (!Number.isFinite(Number(state.lastDecayAt))) state.lastDecayAt = Date.now();
  if (!state.decayDebt || typeof state.decayDebt !== 'object') state.decayDebt = {fullness:0,happiness:0,energy:0};
  if (!Number.isFinite(Number(state.lastFreeCoinAt))) state.lastFreeCoinAt = 0;
  if (!Number.isFinite(Number(state.lastInteractCoinAt))) state.lastInteractCoinAt = 0;

  const baseSaveState = saveState;
  saveState = function(){
    baseSaveState();
    state.lastUpdated = Date.now() + FUTURE_STAMP;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const style = document.createElement('style');
  style.textContent = `
    .coin-wallet{display:flex;align-items:center;justify-content:flex-end;gap:5px;margin:0 1px 7px;color:#4f5b4f;font-size:.86rem;font-weight:800;line-height:1}
    .coin-wallet strong{min-width:22px;text-align:left;font-size:.92rem}
    .care-option[data-food]{position:relative;overflow:visible}
    .care-option[data-food]::after{content:attr(data-cost);position:absolute;right:-5px;bottom:-5px;min-width:14px;height:14px;padding:0 2px;box-sizing:border-box;display:grid;place-items:center;border-radius:999px;background:rgba(255,248,210,.96);border:1px solid rgba(171,139,52,.2);box-shadow:0 2px 6px rgba(90,73,30,.13);color:#80691d;font:800 9px/1 Arial,sans-serif}
  `;
  document.head.appendChild(style);

  function ensureWallet(){
    let wallet = document.getElementById('coin-wallet');
    if (!wallet) {
      const panel = document.querySelector('.bottom-panel');
      const stats = panel?.querySelector('.stats');
      if (!panel || !stats) return null;
      wallet = document.createElement('div');
      wallet.id = 'coin-wallet';
      wallet.className = 'coin-wallet';
      wallet.setAttribute('aria-label','Coin wallet');
      wallet.innerHTML = '<span aria-hidden="true">🪙</span><strong id="coins-value">0</strong>';
      panel.insertBefore(wallet, stats);
    }
    return wallet;
  }

  function updateWallet(){
    ensureWallet();
    const value = document.getElementById('coins-value');
    if (value) value.textContent = String(Math.max(0, Math.floor(Number(state.coins) || 0)));
  }

  const baseRender = render;
  render = function(message){
    baseRender(message);
    updateWallet();
  };

  function persist(){
    state.coins = Math.max(0, Math.floor(Number(state.coins) || 0));
    saveState();
    updateWallet();
  }

  function applyDecay(show=false){
    const now = Date.now();
    const last = Number(state.lastDecayAt || now);
    const hours = Math.min(72, Math.max(0, (now-last)/HOUR));
    state.lastDecayAt = now;
    const rates = {fullness:3,happiness:1,energy:.75};
    let changed = false;
    Object.keys(rates).forEach(key=>{
      const debt = Math.max(0, Number(state.decayDebt[key]) || 0) + hours*rates[key];
      const whole = Math.floor(debt);
      state.decayDebt[key] = debt-whole;
      if (whole>0) {
        state[key] = Math.max(0, Number(state[key]) - whole);
        changed = true;
      }
    });
    if (changed && show) render();
    persist();
  }

  function snapshot(){
    return {happiness:Number(state.happiness),fullness:Number(state.fullness),energy:Number(state.energy),coins:Number(state.coins)};
  }

  function setFrom(before,delta){
    state.happiness = before.happiness + (delta.happiness || 0);
    state.fullness = before.fullness + (delta.fullness || 0);
    state.energy = before.energy + (delta.energy || 0);
  }

  function appendCoins(message,amount){
    return amount>0 ? `${message} · +${amount} 🪙` : message;
  }

  document.querySelectorAll('[data-food]').forEach(button=>{
    const item = FOOD[button.dataset.food];
    if (!item) return;
    button.dataset.cost = String(item.cost);
    button.title = `${item.name} · ${item.cost} coins`;
    button.setAttribute('aria-label',`${item.name}, ${item.cost} coins`);
  });

  document.addEventListener('click',event=>{
    const button = event.target.closest('[data-food],[data-play],[data-interact],[data-home]');
    if (!button) return;
    applyDecay(false);
    const before = snapshot();
    button._economyBefore = before;
    button._economyBlocked = false;

    if (button.matches('[data-food]')) {
      const item = FOOD[button.dataset.food];
      if (!item) return;
      if (before.fullness >= 96) {
        button._economyBlocked = true;
        event.preventDefault(); event.stopImmediatePropagation();
        react('tap-react',420); commit(`${state.name} is already completely full.`);
        return;
      }
      if (before.coins < item.cost) {
        button._economyBlocked = true;
        event.preventDefault(); event.stopImmediatePropagation();
        react('tap-react',420); commit(`Not enough coins for ${item.name}. Need ${item.cost} 🪙.`);
        return;
      }
    }

    if (button.matches('[data-play]')) {
      const item = PLAY[button.dataset.play];
      const needed = Math.abs(item?.energy || 0);
      if (item && before.energy < needed) {
        button._economyBlocked = true;
        event.preventDefault(); event.stopImmediatePropagation();
        react('rest-react',850); commit(`${state.name} is too sleepy for that right now.`);
        return;
      }
    }

    if (button.dataset.home === 'phone' && before.energy < 6) {
      button._economyBlocked = true;
      event.preventDefault(); event.stopImmediatePropagation();
      react('rest-react',850); commit(`${state.name} is too sleepy to use the phone.`);
    }
  },true);

  document.addEventListener('click',event=>{
    const button = event.target.closest('[data-food],[data-play],[data-interact],[data-home]');
    if (!button || button._economyBlocked || !button._economyBefore) return;
    const before = button._economyBefore;
    const currentMessage = els.message.textContent;

    if (button.matches('[data-food]')) {
      const item = FOOD[button.dataset.food];
      setFrom(before,item);
      state.coins = before.coins-item.cost;
      commit(`${state.name} bought ${item.name} · −${item.cost} 🪙`);
      return;
    }

    if (button.matches('[data-play]')) {
      const item = PLAY[button.dataset.play];
      if (!item) return;
      setFrom(before,item);
      state.coins = before.coins;
      commit(currentMessage);
      return;
    }

    if (button.matches('[data-interact]')) {
      const kind = button.dataset.interact;
      const reward = INTERACT_COINS[kind] || 0;
      state.happiness = before.happiness + 3;
      state.fullness = before.fullness;
      state.energy = before.energy;
      let earned = 0;
      const now = Date.now();
      if (reward>0 && now-Number(state.lastInteractCoinAt||0)>=INTERACT_COIN_COOLDOWN) {
        earned = reward;
        state.coins = before.coins + reward;
        state.lastInteractCoinAt = now;
      } else state.coins = before.coins;
      commit(appendCoins(currentMessage,earned));
      return;
    }

    if (button.matches('[data-home]')) {
      const kind = button.dataset.home;
      const item = HOME[kind];
      if (!item) return;
      if (kind==='bed' && before.energy>=97) return;
      setFrom(before,item);
      state.coins = before.coins;
      let earned = 0;
      if (kind==='phone' && Math.random()<.35) {
        earned = 2;
        state.coins += earned;
      }
      commit(appendCoins(currentMessage,earned));
    }
  });

  const slime = document.getElementById('slime');
  slime?.addEventListener('pointerup',()=>{
    const now = Date.now();
    if (now-Number(state.lastFreeCoinAt||0)<FREE_COIN_COOLDOWN) return;
    if (Math.random()>=FREE_COIN_CHANCE) return;
    state.coins += 1;
    state.lastFreeCoinAt = now;
    persist();
  });

  applyDecay(false);
  updateWallet();
  setInterval(()=>applyDecay(true),60000);
})();