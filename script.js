const STORAGE_KEY = "petslime-state-v1";

const SLIME_COLORS = [
  ["#a9f2c3", "#55ca88", "#42b879"],
  ["#b8ddff", "#6eb4ef", "#4d91d2"],
  ["#ffd0e3", "#f08fb6", "#d96c9a"],
  ["#e2ccff", "#aa83e3", "#8b65c7"],
  ["#ffe7a8", "#efc45f", "#d6a63d"]
];

const BACKGROUNDS = [
  ["#e9f8ef", "#d8efe9", "#e7e6fb"],
  ["#eef7ff", "#dcecfb", "#ebe7ff"],
  ["#fff4ec", "#f7e7d9", "#f6e6f0"],
  ["#eef6ec", "#dfedd7", "#e8f3e2"],
  ["#f4f0ff", "#e8e1f8", "#e3edf9"]
];

const defaults = () => ({
  name: "Mochi",
  happiness: 80,
  fullness: 70,
  energy: 85,
  slimeColor: 0,
  background: 0,
  lastUpdated: Date.now()
});

const els = {
  name: document.getElementById("pet-name"),
  message: document.getElementById("message"),
  stage: document.getElementById("stage"),
  slime: document.getElementById("slime"),
  shadow: document.getElementById("slime-shadow"),
  fx: document.getElementById("fx-layer"),
  food: document.getElementById("food"),
  toy: document.getElementById("toy"),
  sleepFx: document.getElementById("sleep-fx"),
  happiness: document.getElementById("happiness"),
  fullness: document.getElementById("fullness"),
  energy: document.getElementById("energy"),
  happinessValue: document.getElementById("happiness-value"),
  fullnessValue: document.getElementById("fullness-value"),
  energyValue: document.getElementById("energy-value"),
  rename: document.getElementById("rename"),
  slimeColor: document.getElementById("slime-color"),
  background: document.getElementById("background"),
  howto: document.getElementById("howto"),
  howtoPanel: document.getElementById("howto-panel"),
  reset: document.getElementById("reset")
};

const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
const clampRange = (value, min, max) => Math.max(min, Math.min(max, value));

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved ? { ...defaults(), ...saved } : defaults();
  } catch {
    return defaults();
  }
}

let state = loadState();
let pos = { x: 0, y: 0 };
let animationTimer = 0;
let throwFrame = 0;
let tapTimer = 0;
let lastTapAt = 0;

function applyOfflineDecay() {
  const now = Date.now();
  const elapsedHours = Math.max(0, (now - Number(state.lastUpdated || now)) / 3_600_000);
  const cappedHours = Math.min(elapsedHours, 72);
  state.fullness = clamp(state.fullness - cappedHours * 2.2);
  state.happiness = clamp(state.happiness - cappedHours * 0.9);
  state.energy = clamp(state.energy - cappedHours * 0.35);
  state.lastUpdated = now;
}

function saveState() {
  state.lastUpdated = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyAppearance() {
  const slime = SLIME_COLORS[state.slimeColor % SLIME_COLORS.length];
  els.slime.style.setProperty("--slime-light", slime[0]);
  els.slime.style.setProperty("--slime-main", slime[1]);
  els.slime.style.setProperty("--slime-dark", slime[2]);

  const bg = BACKGROUNDS[state.background % BACKGROUNDS.length];
  document.body.style.setProperty("--page-a", bg[0]);
  document.body.style.setProperty("--page-b", bg[1]);
  document.body.style.setProperty("--page-c", bg[2]);
}

function defaultMessage() {
  if (state.fullness < 25) return `${state.name} is getting hungry.`;
  if (state.energy < 25) return `${state.name} could use a nap.`;
  if (state.happiness < 25) return `${state.name} wants some attention.`;
  if (state.happiness > 88 && state.fullness > 70 && state.energy > 60) return `${state.name} is having the best day!`;
  return `${state.name} looks content.`;
}

function updateMoodClass() {
  els.slime.classList.remove("sleepy", "hungry", "sad");
  if (state.energy < 25) els.slime.classList.add("sleepy");
  else if (state.fullness < 25) els.slime.classList.add("hungry");
  else if (state.happiness < 25) els.slime.classList.add("sad");
}

function render(message = defaultMessage()) {
  state.happiness = clamp(state.happiness);
  state.fullness = clamp(state.fullness);
  state.energy = clamp(state.energy);
  els.name.textContent = state.name;
  els.message.textContent = message;
  els.stage.setAttribute("aria-label", `${state.name}'s play area`);

  for (const key of ["happiness", "fullness", "energy"]) {
    els[key].value = state[key];
    els[key].textContent = `${state[key]}%`;
    els[`${key}Value`].textContent = state[key];
  }

  applyAppearance();
  updateMoodClass();
}

function setPosition(x = pos.x, y = pos.y, rotation = 0) {
  pos.x = x;
  pos.y = y;
  els.slime.style.setProperty("--x", `${x}px`);
  els.slime.style.setProperty("--y", `${y}px`);
  els.slime.style.setProperty("--rot", `${rotation}deg`);
  const lift = Math.max(0, -y);
  els.shadow.style.setProperty("--shadow-x", `${x}px`);
  els.shadow.style.setProperty("--shadow-scale", String(clampRange(1 - lift / 340, .55, 1)));
  els.shadow.style.setProperty("--shadow-opacity", String(clampRange(.9 - lift / 210, .18, .9)));
}

function bounds() {
  const stage = els.stage.getBoundingClientRect();
  const slime = els.slime.getBoundingClientRect();
  return {
    minX: -(stage.width / 2 - slime.width / 2 - 8),
    maxX: stage.width / 2 - slime.width / 2 - 8,
    minY: -(stage.height - slime.height - 50),
    maxY: 0
  };
}

function stopThrow() {
  if (throwFrame) cancelAnimationFrame(throwFrame);
  throwFrame = 0;
}

function clearReactionClasses() {
  els.slime.classList.remove(
    "idle", "tap-react", "double-react", "hold-react", "pet-react",
    "feed-react", "play-react", "rest-react", "pet-face", "dragging"
  );
}

function react(className, duration = 650, extraClass = "") {
  stopThrow();
  window.clearTimeout(animationTimer);
  clearReactionClasses();
  void els.slime.offsetWidth;
  if (extraClass) els.slime.classList.add(extraClass);
  els.slime.classList.add(className);
  animationTimer = window.setTimeout(() => {
    els.slime.classList.remove(className);
    if (extraClass) els.slime.classList.remove(extraClass);
    els.slime.classList.add("idle");
  }, duration);
}

function replayFx(element, className = "show", duration = 1400) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
  window.setTimeout(() => element.classList.remove(className), duration);
}

function particles(symbol, count = 4) {
  const stageRect = els.stage.getBoundingClientRect();
  const slimeRect = els.slime.getBoundingClientRect();
  const cx = slimeRect.left - stageRect.left + slimeRect.width / 2;
  const cy = slimeRect.top - stageRect.top + slimeRect.height * .3;
  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.textContent = symbol;
    particle.style.left = `${cx + (Math.random() - .5) * 65}px`;
    particle.style.top = `${cy + (Math.random() - .5) * 25}px`;
    particle.style.setProperty("--drift", `${(Math.random() - .5) * 45}px`);
    particle.style.setProperty("--spin", `${(Math.random() - .5) * 45}deg`);
    particle.style.fontSize = `${.8 + Math.random() * .55}rem`;
    els.fx.appendChild(particle);
    window.setTimeout(() => particle.remove(), 900);
  }
}

function commit(message) {
  render(message);
  saveState();
}

function singleTap() {
  state.happiness += 2;
  react("tap-react", 420);
  particles("·", 4);
  commit(`${state.name} gives a tiny bloop.`);
}

function doubleTap() {
  state.happiness += 4;
  react("double-react", 660);
  particles("✨", 5);
  commit(`${state.name} jumps with excitement!`);
}

function queueTap() {
  const now = Date.now();
  if (now - lastTapAt < 285) {
    window.clearTimeout(tapTimer);
    tapTimer = 0;
    lastTapAt = 0;
    doubleTap();
    return;
  }
  lastTapAt = now;
  tapTimer = window.setTimeout(() => {
    lastTapAt = 0;
    singleTap();
  }, 290);
}

function holdReaction() {
  state.happiness += 2;
  react("hold-react", 650);
  commit(`${state.name} squishes like jelly.`);
}

function petReaction(amount = 6) {
  state.happiness += amount;
  react("pet-react", 720, "pet-face");
  particles("♥", 5);
  commit(`${state.name} melts into the pets.`);
}

function throwSlime(vx, vy) {
  stopThrow();
  clearReactionClasses();
  let x = pos.x;
  let y = pos.y;
  let velocityX = clampRange(vx * 17, -14, 14);
  let velocityY = clampRange(vy * 17, -16, 10);
  let last = performance.now();
  let bounces = 0;

  const frame = now => {
    const dt = Math.min(32, now - last) / 16.667;
    last = now;
    const b = bounds();
    velocityY += .78 * dt;
    x += velocityX * dt;
    y += velocityY * dt;

    if (x < b.minX || x > b.maxX) {
      x = clampRange(x, b.minX, b.maxX);
      velocityX *= -.55;
      bounces += 1;
    }
    if (y < b.minY) {
      y = b.minY;
      velocityY *= -.35;
    }
    if (y >= 0) {
      y = 0;
      if (Math.abs(velocityY) > 2.2 && bounces < 4) {
        velocityY *= -.38;
        velocityX *= .76;
        bounces += 1;
      } else {
        velocityY = 0;
        velocityX *= .72;
      }
    }

    setPosition(x, y, clampRange(velocityX * 1.15, -12, 12));
    if ((Math.abs(velocityX) > .35 || y < 0 || Math.abs(velocityY) > .4) && bounces < 7) {
      throwFrame = requestAnimationFrame(frame);
    } else {
      setPosition(x, 0, 0);
      els.slime.classList.add("idle");
      react("tap-react", 420);
      particles("·", 3);
    }
  };
  throwFrame = requestAnimationFrame(frame);
}

const actions = {
  feed() {
    if (state.fullness >= 96) {
      react("tap-react", 420);
      return `${state.name} is already completely full.`;
    }
    state.fullness += 18;
    state.happiness += 3;
    replayFx(els.food, "show", 1100);
    react("feed-react", 1100);
    window.setTimeout(() => particles("♥", 3), 650);
    return `Yum! ${state.name} scoots over for the strawberry.`;
  },
  play() {
    if (state.energy < 10) {
      react("rest-react", 850);
      replayFx(els.sleepFx, "show", 1200);
      return `${state.name} is too sleepy to play right now.`;
    }
    state.happiness += 16;
    state.energy -= 10;
    state.fullness -= 4;
    replayFx(els.toy, "show", 1300);
    react("play-react", 1250);
    window.setTimeout(() => particles("✨", 4), 620);
    return `${state.name} chases the yarn!`;
  },
  rest() {
    if (state.energy >= 97) {
      react("double-react", 650);
      return `${state.name} is much too awake for a nap.`;
    }
    state.energy += 22;
    state.fullness -= 3;
    replayFx(els.sleepFx, "show", 1550);
    react("rest-react", 1450);
    return `${state.name} settles down... zzz.`;
  },
  pet() {
    state.happiness += 8;
    react("pet-react", 720, "pet-face");
    particles("♥", 6);
    return `${state.name} wiggles happily under your hand.`;
  }
};

document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (actions[action]) commit(actions[action]());
  });
});

let gesture = null;

els.slime.addEventListener("pointerdown", event => {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  stopThrow();
  window.clearTimeout(animationTimer);
  clearReactionClasses();
  els.slime.setPointerCapture?.(event.pointerId);
  gesture = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    baseX: pos.x,
    baseY: pos.y,
    lastX: event.clientX,
    lastY: event.clientY,
    lastTime: performance.now(),
    vx: 0,
    vy: 0,
    startedAt: performance.now(),
    dragging: false,
    petting: false,
    holdTriggered: false,
    reversals: 0,
    lastDirection: 0,
    holdTimer: 0
  };
  gesture.holdTimer = window.setTimeout(() => {
    if (!gesture || gesture.dragging || gesture.petting) return;
    gesture.holdTriggered = true;
    els.slime.classList.add("hold-react");
    els.message.textContent = `${state.name} is being gently squished...`;
  }, 500);
});

els.slime.addEventListener("pointermove", event => {
  if (!gesture || event.pointerId !== gesture.id) return;
  event.preventDefault();
  const now = performance.now();
  const elapsed = now - gesture.startedAt;
  const dx = event.clientX - gesture.startX;
  const dy = event.clientY - gesture.startY;
  const distance = Math.hypot(dx, dy);
  const dt = Math.max(1, now - gesture.lastTime);
  gesture.vx = (event.clientX - gesture.lastX) / dt;
  gesture.vy = (event.clientY - gesture.lastY) / dt;

  if (gesture.holdTriggered && distance > 5) {
    gesture.petting = true;
    gesture.holdTriggered = false;
    els.slime.classList.remove("hold-react");
  }

  if (!gesture.dragging && !gesture.petting) {
    if (elapsed >= 180 && elapsed < 500 && Math.abs(dx) >= 6 && Math.abs(dx) < 48 && Math.abs(dy) < 28) {
      gesture.petting = true;
      window.clearTimeout(gesture.holdTimer);
      els.slime.classList.add("pet-face");
      els.message.textContent = `${state.name} likes that...`;
    } else if (distance > 9 && elapsed < 500) {
      gesture.dragging = true;
      window.clearTimeout(gesture.holdTimer);
      els.slime.classList.add("dragging");
      els.message.textContent = `You picked ${state.name} up!`;
    }
  }

  if (gesture.petting) {
    const stepX = event.clientX - gesture.lastX;
    const direction = Math.sign(stepX);
    if (direction && gesture.lastDirection && direction !== gesture.lastDirection && Math.abs(stepX) > 1.5) {
      gesture.reversals += 1;
      if (gesture.reversals === 2 || gesture.reversals === 5) particles("♥", 2);
    }
    if (direction) gesture.lastDirection = direction;
  }

  if (gesture.dragging) {
    const b = bounds();
    setPosition(
      clampRange(gesture.baseX + dx, b.minX, b.maxX),
      clampRange(gesture.baseY + dy, b.minY, b.maxY),
      clampRange(gesture.vx * 28, -12, 12)
    );
  }

  gesture.lastX = event.clientX;
  gesture.lastY = event.clientY;
  gesture.lastTime = now;
});

function finishGesture(event) {
  if (!gesture || event.pointerId !== gesture.id) return;
  event.preventDefault();
  window.clearTimeout(gesture.holdTimer);
  const current = gesture;
  gesture = null;

  if (current.dragging) {
    els.slime.classList.remove("dragging");
    state.happiness += 2;
    render(Math.abs(current.vx) + Math.abs(current.vy) > .35 ? `${state.name} goes flying!` : `${state.name} lands with a wobble.`);
    saveState();
    throwSlime(current.vx, current.vy);
    return;
  }
  if (current.petting) {
    els.slime.classList.remove("pet-face", "hold-react");
    petReaction(current.reversals >= 2 ? 7 : 4);
    return;
  }
  if (current.holdTriggered) {
    els.slime.classList.remove("hold-react");
    holdReaction();
    return;
  }
  queueTap();
}

els.slime.addEventListener("pointerup", finishGesture);
els.slime.addEventListener("pointercancel", event => {
  if (!gesture || event.pointerId !== gesture.id) return;
  window.clearTimeout(gesture.holdTimer);
  gesture = null;
  clearReactionClasses();
  els.slime.classList.add("idle");
});

els.slime.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    queueTap();
  }
});

els.rename.addEventListener("click", () => {
  const next = window.prompt("Give your slime a name:", state.name);
  if (next === null) return;
  const clean = next.trim().replace(/\s+/g, " ").slice(0, 20);
  if (!clean) return;
  state.name = clean;
  saveState();
  render(`${state.name} likes the new name!`);
  react("double-react", 660);
  particles("✨", 4);
});

els.slimeColor.addEventListener("click", () => {
  state.slimeColor = (Number(state.slimeColor) + 1) % SLIME_COLORS.length;
  applyAppearance();
  saveState();
  react("happyWiggle", 0);
  render(`${state.name} has a fresh new color.`);
});

els.background.addEventListener("click", () => {
  state.background = (Number(state.background) + 1) % BACKGROUNDS.length;
  applyAppearance();
  saveState();
  render("A new little atmosphere.");
});

els.howto.addEventListener("click", () => {
  const opening = els.howtoPanel.hidden;
  els.howtoPanel.hidden = !opening;
  els.howto.setAttribute("aria-expanded", String(opening));
});

els.reset.addEventListener("click", () => {
  if (!window.confirm("Reset this slime back to Mochi and default settings?")) return;
  state = defaults();
  pos = { x: 0, y: 0 };
  setPosition(0, 0, 0);
  saveState();
  render("A fresh little slime has arrived.");
  react("double-react", 660);
  particles("✨", 5);
});

window.addEventListener("resize", () => {
  const b = bounds();
  setPosition(clampRange(pos.x, b.minX, b.maxX), clampRange(pos.y, b.minY, 0), 0);
});

applyOfflineDecay();
setPosition(0, 0, 0);
els.slime.classList.add("idle");
render();
saveState();
