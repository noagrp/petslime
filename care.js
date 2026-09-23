(() => {
  const sheets = [...document.querySelectorAll('.care-sheet')];
  const careButtons = [...document.querySelectorAll('[data-care]')];
  const toyKinds = [
    'play-yarn','play-ball','play-bubble','play-feather','play-butterfly','play-chase',
    'home-tv','home-shower','home-bed'
  ];
  let activeCare = '';

  function closeCare() {
    sheets.forEach(sheet => sheet.classList.remove('open'));
    careButtons.forEach(button => button.classList.remove('active'));
    activeCare = '';
  }

  function openCare(name) {
    if (activeCare === name) {
      closeCare();
      return;
    }
    closeCare();
    const sheet = document.getElementById(`care-${name}`);
    const trigger = document.querySelector(`[data-care="${name}"]`);
    if (!sheet) return;
    sheet.classList.add('open');
    trigger?.classList.add('active');
    activeCare = name;
    setSettingsOpen(false);
  }

  careButtons.forEach(button => {
    button.addEventListener('click', () => openCare(button.dataset.care));
  });

  if (els.settingsToggle) {
    els.settingsToggle.addEventListener('click', () => {
      if (els.settingsToggle.getAttribute('aria-expanded') === 'true') closeCare();
    });
  }

  function selectOption(button) {
    const sheet = button.closest('.care-sheet');
    sheet?.querySelectorAll('.care-option').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
  }

  function setToy(kind, symbol, duration = 1500) {
    els.toy.classList.remove('show', ...toyKinds);
    els.toy.classList.add('emoji-toy', kind);
    els.toy.textContent = symbol;
    void els.toy.offsetWidth;
    replayFx(els.toy, 'show', duration);
  }

  const foodInfo = {
    '🍓': ['strawberry', '•', 'food-crumb'],
    '🍏': ['green apple', '●', 'apple-bit'],
    '🍪': ['cookie', '▪', 'cookie-bit'],
    '🍇': ['grapes', '●', 'grape-bit'],
    '🍉': ['watermelon', '◆', 'melon-bit'],
    '🥕': ['carrot', '▲', 'carrot-bit']
  };

  function eat(symbol, button) {
    const info = foodInfo[symbol] || ['snack', '•', 'food-crumb'];
    if (state.fullness >= 96) {
      react('tap-react', 420);
      commit(`${state.name} is already completely full.`);
      return;
    }
    selectOption(button);
    els.food.textContent = symbol;
    state.fullness += 18;
    state.happiness += 3;
    replayFx(els.food, 'show', 1100);
    react('feed-react', 1100);
    window.setTimeout(() => particles(info[1], 7, info[2]), 620);
    commit(`Yum! ${state.name} munches the ${info[0]}.`);
  }

  document.querySelectorAll('[data-food]').forEach(button => {
    button.addEventListener('click', () => eat(button.dataset.food, button));
  });

  const playInfo = {
    yarn: {
      symbol: '🧶', toyClass: 'play-yarn', duration: 1350,
      reaction: () => react('play-react', 1250),
      particle: ['♪', 4, 'play-note'],
      message: name => `${name} scurries after the rolling yarn!`
    },
    ball: {
      symbol: '⚽', toyClass: 'play-ball', duration: 1450,
      reaction: () => react('double-react', 760),
      particle: ['●', 4, 'ball-pop'],
      message: name => `${name} hops after the bouncing ball!`
    },
    bubble: {
      symbol: '🫧', toyClass: 'play-bubble', duration: 1650,
      reaction: () => react('tap-react', 520),
      particle: ['○', 6, 'bubble-pop'],
      message: name => `${name} watches the bubbles float higher and higher.`
    },
    feather: {
      symbol: '🪶', toyClass: 'play-feather', duration: 1700,
      reaction: () => react('pet-react', 900, 'pet-face'),
      particle: ['〰', 4, 'feather-swish'],
      message: name => `${name} sways under the drifting feather.`
    },
    butterfly: {
      symbol: '🦋', toyClass: 'play-butterfly', duration: 1900,
      reaction: () => react('double-react', 920),
      particle: ['✦', 5, 'butterfly-spark'],
      message: name => `${name} looks up and follows the butterfly overhead!`
    },
    chase: {
      symbol: '🔵', toyClass: 'play-chase', duration: 1650,
      reaction: () => react('play-react', 1450),
      particle: ['•', 5, 'light-dot'],
      message: name => `${name} darts after the little light!`
    }
  };

  function playChoice(kind, button) {
    if (state.energy < 10) {
      replayFx(els.sleepFx, 'show', 1200);
      react('rest-react', 850);
      commit(`${state.name} is too sleepy to play right now.`);
      return;
    }
    selectOption(button);
    const info = playInfo[kind] || playInfo.yarn;
    state.happiness += 16;
    state.energy -= 10;
    state.fullness -= 4;
    setToy(info.toyClass, info.symbol, info.duration);
    info.reaction();
    window.setTimeout(() => particles(info.particle[0], info.particle[1], info.particle[2]), 360);
    commit(info.message(state.name));
  }

  document.querySelectorAll('[data-play]').forEach(button => {
    button.addEventListener('click', () => playChoice(button.dataset.play, button));
  });

  document.querySelectorAll('[data-interact]').forEach(button => {
    button.addEventListener('click', () => {
      selectOption(button);
      const kind = button.dataset.interact;
      if (kind === 'pet') {
        state.happiness += 6;
        react('pet-react', 720, 'pet-face');
        particles('♥', 5);
        commit(`${state.name} leans into the gentle pets.`);
      } else if (kind === 'rub') {
        state.happiness += 7;
        react('pet-react', 820, 'pet-face');
        particles('♡', 6);
        commit(`${state.name} melts into the rub.`);
      } else if (kind === 'squish') {
        state.happiness += 2;
        react('hold-react', 760);
        particles('•', 5, 'squish-dot');
        commit(`${state.name} squishes like jelly.`);
      } else if (kind === 'tap') {
        singleTap();
      } else if (kind === 'double') {
        doubleTap();
      } else if (kind === 'pickup') {
        state.happiness += 2;
        react('double-react', 650);
        particles('↟', 4, 'ripple');
        commit(`Pick ${state.name} up and toss gently in the playground.`);
      }
    });
  });

  function homeAction(kind, button) {
    selectOption(button);
    if (kind === 'tv') {
      state.energy += 6;
      state.happiness += 5;
      state.fullness -= 1;
      setToy('home-tv', '📺', 2100);
      react('pet-react', 1000, 'pet-face');
      window.setTimeout(() => particles('♪', 4, 'tv-note'), 520);
      commit(`${state.name} settles down and watches TV for a while.`);
    } else if (kind === 'shower') {
      state.energy += 4;
      state.happiness += 4;
      setToy('home-shower', '🚿', 1800);
      react('hold-react', 900);
      window.setTimeout(() => particles('•', 8, 'shower-drop'), 260);
      commit(`${state.name} gets a refreshing little shower.`);
    } else if (kind === 'bed') {
      if (state.energy >= 97) {
        react('tap-react', 420);
        commit(`${state.name} is too awake for bed.`);
        return;
      }
      state.energy += 22;
      state.fullness -= 3;
      setToy('home-bed', '🛏️', 1700);
      replayFx(els.sleepFx, 'show', 1550);
      react('rest-react', 1450);
      window.setTimeout(() => particles('·', 4, 'bed-dot'), 520);
      commit(`${state.name} curls up in bed... zzz.`);
    }
  }

  document.querySelectorAll('[data-home]').forEach(button => {
    button.addEventListener('click', () => homeAction(button.dataset.home, button));
  });
})();
