(() => {
  const sheets = [...document.querySelectorAll('.care-sheet')];

  function closeCare() {
    sheets.forEach(sheet => sheet.classList.remove('open'));
  }

  function openCare(name) {
    closeCare();
    const sheet = document.getElementById(`care-${name}`);
    if (!sheet) return;
    sheet.classList.add('open');
    setSettingsOpen(false);
  }

  document.querySelectorAll('[data-care]').forEach(button => {
    button.addEventListener('click', () => openCare(button.dataset.care));
  });

  document.querySelectorAll('.care-back').forEach(button => {
    button.addEventListener('click', closeCare);
  });

  if (els.settingsToggle) {
    els.settingsToggle.addEventListener('click', () => {
      if (els.settingsToggle.getAttribute('aria-expanded') === 'true') closeCare();
    });
  }

  function eat(symbol, label) {
    if (state.fullness >= 96) {
      react('tap-react', 420);
      commit(`${state.name} is already completely full.`);
      return;
    }
    els.food.textContent = symbol;
    state.fullness += 18;
    state.happiness += 3;
    replayFx(els.food, 'show', 1100);
    react('feed-react', 1100);
    window.setTimeout(() => particles('•', 7, 'food-crumb'), 650);
    commit(`Yum! ${state.name} munches the ${label}.`);
    window.setTimeout(closeCare, 720);
  }

  const foodNames = {
    '🍓': 'strawberry', '🍎': 'apple', '🍪': 'cookie',
    '🍇': 'grapes', '🍉': 'watermelon', '🥕': 'carrot'
  };

  document.querySelectorAll('[data-food]').forEach(button => {
    button.addEventListener('click', () => eat(button.dataset.food, foodNames[button.dataset.food] || 'snack'));
  });

  const playInfo = {
    yarn: ['🧶', '♪', name => `${name} chases the yarn!`],
    ball: ['⚽', '●', name => `${name} bounces after the ball!`],
    bubble: ['🫧', '○', name => `${name} tries to catch the bubbles!`],
    feather: ['🪶', '〰', name => `${name} follows the feather!`],
    butterfly: ['🦋', '✦', name => `${name} hops after the butterfly!`],
    chase: ['🔵', '•', name => `${name} chases the little light!`]
  };

  function playChoice(kind) {
    if (state.energy < 10) {
      replayFx(els.sleepFx, 'show', 1200);
      react('rest-react', 850);
      commit(`${state.name} is too sleepy to play right now.`);
      return;
    }
    const info = playInfo[kind] || playInfo.yarn;
    state.happiness += 16;
    state.energy -= 10;
    state.fullness -= 4;
    els.toy.textContent = info[0];
    els.toy.classList.add('emoji-toy');
    replayFx(els.toy, 'show', 1300);
    react('play-react', 1250);
    window.setTimeout(() => particles(info[1], 5, 'play-note'), 420);
    commit(info[2](state.name));
    window.setTimeout(closeCare, 760);
  }

  document.querySelectorAll('[data-play]').forEach(button => {
    button.addEventListener('click', () => playChoice(button.dataset.play));
  });

  document.querySelectorAll('[data-interact]').forEach(button => {
    button.addEventListener('click', () => {
      const kind = button.dataset.interact;
      if (kind === 'pet' || kind === 'rub') petReaction(kind === 'rub' ? 7 : 6);
      else if (kind === 'squish') holdReaction();
      else if (kind === 'tap') singleTap();
      else if (kind === 'double') doubleTap();
      else if (kind === 'pickup') {
        state.happiness += 2;
        react('double-react', 650);
        particles('○', 4, 'ripple');
        commit(`Pick ${state.name} up directly and toss gently!`);
      }
      window.setTimeout(closeCare, 620);
    });
  });

  function homeAction(kind) {
    if (kind === 'bed') {
      commit(actions.rest());
    } else if (kind === 'house') {
      state.energy += 10;
      state.happiness += 3;
      state.fullness -= 1;
      replayFx(els.sleepFx, 'show', 1200);
      react('rest-react', 1150);
      commit(`${state.name} curls up safely inside the little house.`);
    } else {
      state.energy += 7;
      state.happiness += 4;
      react('rest-react', 950);
      commit(`${state.name} relaxes on the comfy cushion.`);
    }
    window.setTimeout(closeCare, 760);
  }

  document.querySelectorAll('[data-home]').forEach(button => {
    button.addEventListener('click', () => homeAction(button.dataset.home));
  });
})();
