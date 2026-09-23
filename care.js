(() => {
  const sheets = [...document.querySelectorAll('.care-sheet')];
  const careButtons = [...document.querySelectorAll('[data-care]')];
  const toyKinds = [
    'play-yarn','play-ball','play-bubble','play-feather','play-butterfly','play-chase',
    'home-tv','home-shower','home-bed'
  ];
  const commandKinds = ['cmd-highfive','cmd-peace','cmd-wave','cmd-hide-left','cmd-hide-right','cmd-dig','cmd-dance'];
  let activeCare = '';
  let commandTimer = 0;

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

  careButtons.forEach(button => button.addEventListener('click', () => openCare(button.dataset.care)));

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

  function setToy(kind, symbol = '', duration = 3200) {
    els.toy.classList.remove('show', ...toyKinds);
    els.toy.classList.add('emoji-toy', kind);
    els.toy.textContent = symbol;
    void els.toy.offsetWidth;
    replayFx(els.toy, 'show', duration);
  }

  /* FOOD: intentionally kept as the approved current behaviour. */
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

  /* PLAY: each choice occupies a different part of the playground and lasts longer. */
  const playInfo = {
    yarn: {
      symbol: '●', toyClass: 'play-yarn', duration: 3600,
      reaction: () => react('play-react', 1350),
      particle: ['·', 4, 'play-note'],
      message: name => `${name} scurries after the yarn rolling along the ground!`
    },
    ball: {
      symbol: '●', toyClass: 'play-ball', duration: 3600,
      reaction: () => react('double-react', 850),
      particle: ['•', 4, 'ball-pop'],
      message: name => `${name} follows the ball as it bounces across the floor!`
    },
    bubble: {
      symbol: '○', toyClass: 'play-bubble', duration: 4000,
      reaction: () => react('tap-react', 580),
      particle: ['○', 7, 'bubble-pop'],
      message: name => `${name} watches the bubbles float up and away.`
    },
    feather: {
      symbol: '~', toyClass: 'play-feather', duration: 3900,
      reaction: () => react('pet-react', 950, 'pet-face'),
      particle: ['~', 5, 'feather-swish'],
      message: name => `${name} sways under the feather drifting overhead.`
    },
    butterfly: {
      symbol: '✦', toyClass: 'play-butterfly', duration: 4300,
      reaction: () => react('double-react', 980),
      particle: ['·', 6, 'butterfly-spark'],
      message: name => `${name} looks up while the butterfly circles above its head!`
    },
    chase: {
      symbol: '•', toyClass: 'play-chase', duration: 3800,
      reaction: () => react('play-react', 1500),
      particle: ['•', 6, 'light-dot'],
      message: name => `${name} darts after the little light around the playground!`
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
    state.happiness += 12;
    state.energy -= 7;
    state.fullness -= 3;
    setToy(info.toyClass, info.symbol, info.duration);
    info.reaction();
    window.setTimeout(() => particles(info.particle[0], info.particle[1], info.particle[2]), 420);
    commit(info.message(state.name));
  }

  document.querySelectorAll('[data-play]').forEach(button => {
    button.addEventListener('click', () => playChoice(button.dataset.play, button));
  });

  /* INTERACT: these are commands/tricks. Direct petting, tapping, holding, dragging and tossing remain free gestures on the slime. */
  function commandReact(kind, duration, message, particle, count = 4, particleClass = '') {
    window.clearTimeout(commandTimer);
    stopThrow();
    clearReactionClasses();
    els.slime.classList.remove(...commandKinds);
    void els.slime.offsetWidth;
    els.slime.classList.add(kind);
    if (particle) window.setTimeout(() => particles(particle, count, particleClass), 280);
    commit(message);
    commandTimer = window.setTimeout(() => {
      els.slime.classList.remove(...commandKinds);
      els.slime.classList.add('idle');
    }, duration);
  }

  document.querySelectorAll('[data-interact]').forEach(button => {
    button.addEventListener('click', () => {
      selectOption(button);
      const kind = button.dataset.interact;
      state.happiness += 3;

      if (kind === 'highfive') {
        commandReact('cmd-highfive', 1800, `${state.name} jumps toward you for a high five!`, '★', 5, 'command-spark');
      } else if (kind === 'peace') {
        commandReact('cmd-peace', 2100, `${state.name} strikes a little peace pose.`, 'V', 3, 'command-peace');
      } else if (kind === 'wave') {
        commandReact('cmd-wave', 2300, `${state.name} waves hello.`, '~', 4, 'command-wave');
      } else if (kind === 'hide') {
        const side = Math.random() < .5 ? 'cmd-hide-left' : 'cmd-hide-right';
        commandReact(side, 3000, `${state.name} hides at the side and peeks back at you.`, '·', 3, 'command-hide');
      } else if (kind === 'dig') {
        commandReact('cmd-dig', 3000, `${state.name} digs downward and peeks out from the ground.`, '•', 5, 'command-dust');
      } else if (kind === 'dance') {
        commandReact('cmd-dance', 3300, `${state.name} does a happy little dance!`, '♪', 5, 'play-note');
      }
    });
  });

  function repeatParticles(symbol, count, cssClass, repeats, gap) {
    let n = 0;
    const tick = () => {
      particles(symbol, count, cssClass);
      n += 1;
      if (n < repeats) window.setTimeout(tick, gap);
    };
    tick();
  }

  /* HOME: longer resting scenes. TV sits beside the slime, shower is overhead, bed is underneath the slime. */
  function homeAction(kind, button) {
    selectOption(button);

    if (kind === 'tv') {
      state.energy += 8;
      state.happiness += 5;
      state.fullness -= 1;
      setToy('home-tv', '', 5200);
      react('pet-react', 1200, 'pet-face');
      repeatParticles('·', 2, 'tv-note', 4, 900);
      commit(`${state.name} settles down beside the TV for a proper rest.`);
    } else if (kind === 'shower') {
      state.energy += 5;
      state.happiness += 5;
      setToy('home-shower', '', 4800);
      react('pet-react', 1050, 'pet-face');
      repeatParticles('|', 5, 'shower-drop', 5, 650);
      commit(`${state.name} stands under the shower and gets properly rinsed.`);
    } else if (kind === 'bed') {
      if (state.energy >= 97) {
        react('tap-react', 420);
        commit(`${state.name} is too awake for bed.`);
        return;
      }
      state.energy += 22;
      state.fullness -= 3;
      setToy('home-bed', '', 6200);
      els.sleepFx.classList.add('long-rest');
      replayFx(els.sleepFx, 'show', 6000);
      react('rest-react', 5000);
      window.setTimeout(() => els.sleepFx.classList.remove('long-rest'), 6100);
      commit(`${state.name} settles on top of the bed... zzz.`);
    }
  }

  document.querySelectorAll('[data-home]').forEach(button => {
    button.addEventListener('click', () => homeAction(button.dataset.home, button));
  });
})();
