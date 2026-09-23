const STORAGE_KEY = "petslime-state-v1";

const defaults = () => ({
  name: "Mochi",
  happiness: 80,
  fullness: 70,
  energy: 85,
  lastUpdated: Date.now()
});

const els = {
  name: document.getElementById("pet-name"),
  message: document.getElementById("message"),
  slime: document.getElementById("slime"),
  happiness: document.getElementById("happiness"),
  fullness: document.getElementById("fullness"),
  energy: document.getElementById("energy"),
  happinessValue: document.getElementById("happiness-value"),
  fullnessValue: document.getElementById("fullness-value"),
  energyValue: document.getElementById("energy-value"),
  reset: document.getElementById("reset")
};

const clamp = value => Math.max(0, Math.min(100, Math.round(value)));

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return saved ? { ...defaults(), ...saved } : defaults();
  } catch {
    return defaults();
  }
}

let state = loadState();

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

  for (const key of ["happiness", "fullness", "energy"]) {
    els[key].value = state[key];
    els[key].textContent = `${state[key]}%`;
    els[`${key}Value`].textContent = state[key];
  }

  updateMoodClass();
}

function boop() {
  els.slime.classList.remove("boop");
  void els.slime.offsetWidth;
  els.slime.classList.add("boop");
  window.setTimeout(() => els.slime.classList.remove("boop"), 420);
}

const actions = {
  feed() {
    if (state.fullness >= 96) return `${state.name} is already completely full.`;
    state.fullness += 18;
    state.happiness += 3;
    return "Yum! That hit the spot.";
  },
  play() {
    if (state.energy < 10) return `${state.name} is too sleepy to play right now.`;
    state.happiness += 16;
    state.energy -= 10;
    state.fullness -= 4;
    return "Wheee! Again!";
  },
  rest() {
    if (state.energy >= 97) return `${state.name} is wide awake already.`;
    state.energy += 22;
    state.fullness -= 3;
    return "A tiny slime nap... zzz.";
  },
  pet() {
    state.happiness += 8;
    return `${state.name} wiggles happily.`;
  }
};

document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (!actions[action]) return;
    const message = actions[action]();
    boop();
    render(message);
    saveState();
  });
});

els.slime.addEventListener("click", () => {
  state.happiness += 4;
  boop();
  render(`${state.name} says: bloop!`);
  saveState();
});

els.reset.addEventListener("click", () => {
  state = defaults();
  saveState();
  render("A fresh little slime has arrived.");
  boop();
});

applyOfflineDecay();
render();
saveState();
