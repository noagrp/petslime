(() => {
  const sheets = [...document.querySelectorAll('.care-sheet')];
  const careButtons = [...document.querySelectorAll('[data-care]')];
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

  const foodInfo = {
    '🍓': ['strawberry', '•', 'food-crumb'],
    '🍎': ['apple', '●', 'apple-bit'],
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
    yarn: ['🧶', '♪', 'play-note', name => `${name} chases the yarn!`],
    ball: ['⚽', '●', 'ball-pop', name => `${name} bounces after the ball!`],
    bubble: ['🫧', '○', 'bubble-pop', name => `${name} tries to catch the bubbles!`],
    feather: ['🪶', '〰', 'feather-swish', name => `${name} follows the feather!`],
    butterfly: ['🦋', '✦', 'butterfly-spark', name => `${name} hops after the butterfly!`],
    chase: ['🔵', '•', 'light-dot', name => `${name} chases the little light!`]
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
    els.toy.textContent = info[0];
    els.toy.classList.add('emoji-toy');
    replayFx(els.toy, 'show', 1300);
    react('play-react', 1250);
    window.setTimeout(() => particles(info[1], 5, info[2]), 360);
    commit(info[3](state.name));
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
    if (kind === 'bed') {
      if (state.energy >= 97) {
        react('tap-react', 420);
        commit(`${state.name} is too awake for bed.`);
        return;
      }
      state.energy += 22;
      state.fullness -= 3;
      replayFx(els.sleepFx, 'show', 1550);
      react('rest-react', 1450);
      commit(`${state.name} curls up in bed... zzz.`);
    } else if (kind === 'house') {
      state.energy += 10;
      state.happiness += 3;
      state.fullness -= 1;
      react('rest-react', 1150);
      particles('⌂', 4, 'house-dot');
      commit(`${state.name} hides safely inside the little house.`);
    } else {
      state.energy += 7;
      state.happiness += 4;
      react('pet-react', 900, 'pet-face');
      particles('~', 5, 'cushion-dot');
      commit(`${state.name} relaxes on the comfy cushion.`);
    }
  }

  document.querySelectorAll('[data-home]').forEach(button => {
    button.addEventListener('click', () => homeAction(button.dataset.home, button));
  });
})();
