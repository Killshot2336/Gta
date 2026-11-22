export const FACTS = [
  { id: "solo", status: "confirmed", source: "PlayStation Store", text: "Grand Theft Auto VI is single-player at launch, and it plays offline." },
  { id: "leads", status: "confirmed", source: "Rockstar", text: "Jason Duval and Lucia Caminos share the story. You can switch between them." },
  { id: "switch", status: "reported", source: "Kotaku, launch week", text: "Free switching opens in Chapter 2. Hold right on the d-pad. The other lead is living their day, so a switch can drop you somewhere else." },
  { id: "stars", status: "reported", source: "Extended Look", text: "The wanted level runs to six stars." },
  { id: "report", status: "confirmed", source: "Rob Nelson, Rockstar North, to IGN", text: "Police respond when someone sees the crime, someone calls it in, an alarm trips, or a vehicle tracker reports it." },
  { id: "minimap", status: "reported", source: "GameSpot, from preview footage", text: "Police are not drawn on the minimap while they are hunting you." },
  { id: "six", status: "reported", source: "GameSpot, from preview footage", text: "At six stars the hunt runs across the whole map." },
  { id: "icons", status: "reported", source: "Launch coverage of the Heat icons", text: "Heat icons that have been identified: camera footage, accomplice, clothes, face, weapon, and vehicle. Each one can be cleared on its own." },
  { id: "vehicle-clear", status: "reported", source: "Extended Look", text: "Vehicle heat has been seen dropping when the lead steps out of the wanted car." },
  { id: "split", status: "reported", source: "Launch coverage", text: "Splitting Jason and Lucia can clear the accomplice icon. If either of them is caught, you are busted." },
  { id: "stars-look", status: "conflict", source: "GameSpot and GamesRadar do not use the same color names", text: "Star appearance changes with what the police know. Name the look you see. The phone will use your word." },
  { id: "hollow", status: "reported", source: "Extended Look", text: "With no description, Lucia was shown riding past officers." },
  { id: "profile", status: "confirmed", source: "In-game help, filmed by launch players", text: "Criminal standing runs Professional, Hardened, Violent, Psycho, Irredeemable. Both leads start at Hardened." },
  { id: "irredeemable", status: "reported", source: "Big Dan Gaming", text: "Irredeemable, once reached, stays." },
  { id: "focus", status: "reported", source: "Neon Slice", text: "On a Professional profile, non-lethal takedowns refill Focus. On a Psycho profile, headshots do." },
  { id: "relation", status: "confirmed", source: "Seen in launch footage", text: "Time together fills the relationship meter, including ordinary time at home. It changes scenes and how deep a partner can go." },
  { id: "waink", status: "confirmed", source: "Rob Nelson to IGN, and Edge", text: "WAiNK scans a car for lock, alarm, tracker, value, and the cost to register it." },
  { id: "tracker-shop", status: "reported", source: "A launch player, filmed", text: "A tracked vehicle taken to a mod shop ended in an arrest. Clear the tracker before the shop." },
  { id: "keys", status: "confirmed", source: "Launch footage", text: "Older cars are hotwired. Newer cars need a tool. That is progression." },
  { id: "fuel", status: "confirmed", source: "Launch footage", text: "Cars burn fuel. A light comes on, and you fill the tank at a pump." },
  { id: "buckme", status: "reported", source: "Polygon, launch guide", text: "BuckMe checking is what you spend. Family savings is tied to the story and does not withdraw." },
  { id: "scooter", status: "reported", source: "Polygon, launch guide", text: "Scooter Bros delivery gets more expensive with distance and damage. No public formula." },
  { id: "day", status: "reported", source: "Edge, and Skill Up", text: "The day is longer than GTA V. Traffic peaks, and work sites empty out at night." },
  { id: "goose", status: "reported", source: "Jeff Favignano", text: "Flying toward the Goose Key airport brings jets. Confirm it on your map before the phone treats it as law." },
  { id: "casino", status: "confirmed", source: "Stephen Donkin, Rockstar, to Kotaku", text: "The casinos stay shut. Gambling is not in this story." },
  { id: "weapon", status: "reported", source: "Edge", text: "A weapon in your hands spooks a block faster than one slung or dropped. Dropping it can keep a wanted level from starting." },
];

export const LOOKS = {
  solid: "They can see you.",
  flashing: "You broke line of sight.",
  hollow: "Reported. They have no description.",
  red: "They still have information on you.",
};

const RULES = [
  {
    id: "name-stars",
    base: 100,
    status: "conflict",
    tags: ["now", "heat", "why"],
    source: "Star colors are not settled in public coverage.",
    when: (s) => s.heat.stars > 0 && !s.heat.look,
    say: () => "Name the stars before you change clothes or ditch the car. Solid, flashing, hollow, or red. The clear depends on which one you see.",
  },
  {
    id: "six",
    base: 96,
    status: "reported",
    tags: ["now", "heat", "map"],
    source: "Six stars has been described as a map-wide hunt.",
    when: (s) => s.heat.stars >= 6,
    say: () => "Six stars hunts across Leonida. Break line of sight. The outfit change waits until the stars fall.",
  },
  {
    id: "goose",
    base: 94,
    status: "reported",
    tags: ["now", "map"],
    source: "Jets have been shown covering Goose Key airport. You confirmed the zone.",
    when: (s) => s.settings.gooseConfirmed && s.here === "goose-key" && activeVehicle(s)?.kind === "plane",
    say: () => "You are in the Goose Key air you confirmed, in a plane. Turn off the airport.",
  },
  {
    id: "goose-ask",
    base: 20,
    status: "reported",
    tags: ["map", "why"],
    source: "One launch video shows jets at Goose Key. It stays a question until you confirm it.",
    when: (s) => !s.settings.gooseConfirmed && s.here === "goose-key",
    say: () => "Goose Key is marked as restricted air in launch footage. Confirm it on the map if you have seen the jets. Until then I will not plan around it.",
  },
  {
    id: "hot-block",
    base: 90,
    status: "you",
    tags: ["now", "map", "heat"],
    source: "A tape of yours put this block on a cooldown.",
    when: (s) => hotPin(s),
    say: (s) => {
      const stash = coolStash(s);
      const hot = hotPin(s);
      return stash
        ? `${hot.name} is still hot. ${stash.name} is the cool stash${stash.note ? `, ${stash.note}` : ""}.`
        : `${hot.name} is still hot. You have no cool stash pinned in another region.`;
    },
  },
  {
    id: "tracker-shop",
    base: 88,
    status: "reported",
    tags: ["now", "map", "arm"],
    source: "A tracked vehicle at a mod shop has ended in cuffs.",
    when: (s) => activeVehicle(s)?.tracker === "live" && pinsIn(s, "shop").some((pin) => pin.region === s.here),
    say: (s) => `Don't take ${activeVehicle(s).name} into ${pinsIn(s, "shop").find((pin) => pin.region === s.here).name}. The tracker is live.`,
  },
  {
    id: "tool-gate",
    base: 86,
    status: "confirmed",
    tags: ["arm", "now"],
    source: "WAiNK and the tool list. Newer cars need a tool you own.",
    when: (s, ctx) => {
      const score = scoreOf(s, ctx.scoreId) || armedScore(s);
      if (!score?.needsTool) return false;
      return !s.tools.includes(score.needsTool);
    },
    say: (s, ctx) => {
      const score = scoreOf(s, ctx.scoreId) || armedScore(s);
      return `${score.name} needs ${toolLabel(score.needsTool)}. It is not on your tool list, so the arm stays shut.`;
    },
  },
  {
    id: "hold",
    base: 84,
    status: "confirmed",
    tags: ["now", "heat"],
    source: "Rob Nelson: nothing starts until the crime is reported.",
    when: (s) => s.heat.stars === 0 && !s.heat.witnessed && !s.heat.alarm && activeVehicle(s)?.tracker !== "live",
    say: () => "Hold. Put the weapon away. Nobody has reported this.",
  },
  {
    id: "hollow",
    base: 80,
    status: "reported",
    tags: ["now", "heat"],
    source: "Hollow stars have been shown with no description. A wardrobe change in the road does nothing if they can still see you.",
    when: (s) => s.heat.look === "hollow" && s.heat.stars > 0 && s.heat.stars < 6 && (s.heat.icons.face || s.heat.icons.clothes),
    say: (s) => {
      const look = s.looks[0]?.name;
      return look
        ? `They have no description. Get out of sight and switch to ${look}. You can pass them if you stop matching.`
        : "They have no description. Get out of sight and change the look. You can pass them if you stop matching.";
    },
  },
  {
    id: "solid",
    base: 78,
    status: "reported",
    tags: ["now", "heat"],
    source: "Solid stars have been read as line of sight.",
    when: (s) => s.heat.look === "solid" && s.heat.stars > 0 && s.heat.stars < 6,
    say: () => "They can see you. Break line of sight before you touch the outfit or the car.",
  },
  {
    id: "vehicle-only",
    base: 76,
    status: "reported",
    tags: ["now", "heat"],
    source: "Vehicle heat has been seen clearing when you step out.",
    when: (s) => s.heat.icons.vehicle && s.heat.stars > 0 && s.heat.stars < 6 && iconCount(s) === 1,
    say: (s) => `Step out of ${activeVehicle(s)?.name || "the car"} and leave it. That icon is the only one lit.`,
  },
  {
    id: "split-blocked",
    base: 74,
    status: "reported",
    tags: ["now", "heat"],
    source: "The accomplice icon clears on a split. A catch on either lead busts you.",
    when: (s) => s.heat.icons.accomplice && s.heat.stars > 0 && (!s.split.jason || !s.split.lucia),
    say: () => "Accomplice is lit. Give Jason an exit and Lucia an exit before you split. If one of you is caught, the run is over.",
  },
  {
    id: "split-go",
    base: 73,
    status: "reported",
    tags: ["now", "heat"],
    source: "The accomplice icon clears on a split. A catch on either lead busts you.",
    when: (s) => s.heat.icons.accomplice && s.heat.stars > 0 && s.split.jason && s.split.lucia,
    say: (s) => `Split. Jason takes ${s.split.jason}. Lucia takes ${s.split.lucia}. Meet at ${s.split.meet || "the pin you still need to name"}.`,
  },
  {
    id: "camera",
    base: 64,
    status: "reported",
    tags: ["now", "heat"],
    source: "Camera heat is the footage. Clearing a dead icon wastes the window.",
    when: (s) => s.heat.icons.camera && s.heat.stars > 0 && iconCount(s) === 1,
    say: () => "Footage is the leftover. Handle the camera or stay off that block.",
  },
  {
    id: "weapon",
    base: 60,
    status: "reported",
    tags: ["now", "heat", "arm"],
    source: "A gun in your hands spooks people faster than a slung weapon.",
    when: (s) => s.heat.icons.weapon && s.heat.stars === 0,
    say: () => "Sling it or drop it before a call starts. A weapon in your hands is a witness.",
  },
  {
    id: "professional",
    base: 48,
    status: "reported",
    tags: ["now", "heat", "arm"],
    source: "Professional standing has been tied to non-lethal Focus refills.",
    when: (s) => s.settings.standing === "professional" && (s.heat.stars > 0 || s.live),
    say: () => "Hands or legs if you want this standing. Focus refills off non-lethal hits on a Professional profile.",
  },
  {
    id: "irredeemable",
    base: 46,
    status: "reported",
    tags: ["now", "heat"],
    source: "Psycho and above have been tied to headshot Focus refills. Irredeemable stays.",
    when: (s) => (s.settings.standing === "psycho" || s.settings.standing === "irredeemable") && s.heat.stars > 0,
    say: (s) =>
      s.settings.standing === "irredeemable"
        ? "Irredeemable stays. Focus refills off headshots on that path. I will not tell you to play this one clean."
        : "Psycho refills Focus off headshots. Play the standing you are actually building.",
  },
  {
    id: "deposit",
    base: 44,
    status: "you",
    tags: ["now", "arm", "map"],
    source: "Your bust log. Cash was gone often enough to matter.",
    when: (s) => s.busts.filter((b) => b.lostCash).length >= 3 && spendable(s) > 0 && s.heat.stars === 0,
    say: (s) => `Deposit before you roll. Your busts have been taking the cash. Spendable is ${money(spendable(s))}. Family savings stays locked.`,
  },
  {
    id: "gas",
    base: 40,
    status: "confirmed",
    tags: ["now", "map", "arm"],
    source: "The car burns fuel. This tank is yours, logged.",
    when: (s) => {
      const car = activeVehicle(s);
      return car && typeof car.fuel === "number" && car.fuel <= 0.25 && car.kind === "car";
    },
    say: (s) => {
      const gas = pinsIn(s, "gas")[0];
      return gas ? `${activeVehicle(s).name} is low. Gas pin: ${gas.name}.` : `${activeVehicle(s).name} is low. Pin a gas stop.`;
    },
  },
  {
    id: "quiet-hour",
    base: 36,
    status: "you",
    tags: ["arm", "now", "map"],
    source: "Your stakeout stamps for this hour.",
    when: (s) => quietSite(s)?.mood === "empty",
    say: (s) => `${quietSite(s).name} has been empty at this hour. The tools check still has to pass.`,
  },
  {
    id: "busy-hour",
    base: 58,
    status: "you",
    tags: ["arm", "now", "map"],
    source: "Your stakeout stamps for this hour.",
    when: (s) => quietSite(s)?.mood === "busy",
    say: (s) => `${quietSite(s).name} has only been busy at this hour. Confirm before you arm it.`,
  },
  {
    id: "errands",
    base: 18,
    status: "confirmed",
    tags: ["now", "map"],
    source: "Time together fills the relationship meter, including home time.",
    when: (s) =>
      s.settings.endingMatters &&
      !s.live &&
      !armedScore(s) &&
      s.heat.stars === 0 &&
      s.here === s.settings.home &&
      s.errands.some((e) => !e.done),
    say: (s) => {
      const next = s.errands.find((e) => !e.done);
      return `Nothing is armed. ${next.name} is the next home errand, and that time counts toward the ending you said you want.`;
    },
  },
];

export function money(n) {
  const value = Math.round(Number(n) || 0);
  const sign = value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US")}`;
}

export function spendable(state) {
  return Number(state.bank.cash || 0) + Number(state.bank.checking || 0);
}

export function activeVehicle(state) {
  return state.vehicles.find((v) => v.id === state.activeVehicleId) || null;
}

export function iconCount(state) {
  return Object.values(state.heat.icons).filter(Boolean).length;
}

export function gameMinutesNow(state, now = Date.now()) {
  if (state.game.minutes == null) return null;
  if (!state.game.ratio || state.game.anchorReal == null || state.game.anchorGame == null) return state.game.minutes;
  const passed = (now - state.game.anchorReal) / state.game.ratio;
  return (state.game.anchorGame + passed) % (24 * 60);
}

export function periodOf(minutes) {
  if (minutes == null) return "unset";
  const hour = Math.floor(minutes / 60) % 24;
  return hour >= 6 && hour < 18 ? "day" : "night";
}

export function formatGameTime(minutes) {
  if (minutes == null) return "Set time";
  const m = ((Math.floor(minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  const h24 = Math.floor(m / 60);
  const min = m % 60;
  const h12 = h24 % 12 || 12;
  const suffix = h24 >= 12 ? "PM" : "AM";
  return `${h12}:${String(min).padStart(2, "0")} ${suffix}`;
}

export function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function median(nums) {
  if (!nums.length) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mad(nums, med = median(nums)) {
  if (!nums.length) return 0;
  return median(nums.map((n) => Math.abs(n - med)));
}

export function cutMath({ gross, fenceMode, fenceRate, fenceFlat, shares }) {
  const g = Number(gross) || 0;
  const fence = fenceMode === "flat" ? Number(fenceFlat) || 0 : g * ((Number(fenceRate) || 0) / 100);
  const left = g - fence;
  const rows = (shares || []).map((row) => ({
    name: row.name || "Share",
    pct: Number(row.pct) || 0,
    take: left * ((Number(row.pct) || 0) / 100),
  }));
  const used = rows.reduce((sum, row) => sum + row.pct, 0);
  const yours = rows.find((row) => /^you$/i.test(row.name.trim())) || rows[0];
  return { fence, left, rows, unassigned: 100 - used, your: yours?.take || 0, yourPct: yours?.pct || 0 };
}

export function grossForTake(yourTake, fenceRate, yourPct) {
  const keep = (1 - (Number(fenceRate) || 0) / 100) * ((Number(yourPct) || 0) / 100);
  if (keep <= 0) return null;
  return (Number(yourTake) || 0) / keep;
}

export function runScore({ take, seconds, stars, mistakes, starWeight = 0.35, missWeight = 0.15 }) {
  const perMin = seconds > 0 ? (Number(take) || 0) / (seconds / 60) : 0;
  const penalty = 1 + (Number(stars) || 0) * starWeight + (Number(mistakes) || 0) * missWeight;
  return { perMin, penalty, score: penalty > 0 ? perMin / penalty : 0 };
}

export function motorMath(vehicle) {
  const keep = Number(vehicle.register || 0) + Number(vehicle.repair || 0) + Number(vehicle.trackerCost || 0);
  const walk = Number(vehicle.fence || 0) - Number(vehicle.repair || 0);
  return { keep, walk };
}

export function fuelMath({ distance, fraction, trip }) {
  const d = Number(distance) || 0;
  const f = Number(fraction) || 0;
  const range = f > 0 ? d / f : 0;
  const need = range > 0 ? (Number(trip) || 0) / range : 0;
  return { range, need };
}

export function scratch(expr) {
  const tokens = tokenize(expr);
  if (!tokens) return { error: "Can't read that." };
  try {
    const rpn = toRpn(tokens);
    const value = evalRpn(rpn);
    if (!Number.isFinite(value)) return { error: "Can't read that." };
    return { value };
  } catch {
    return { error: "Can't read that." };
  }
}

function tokenize(expr) {
  const src = String(expr || "").replace(/\s+/g, "");
  if (!src) return [];
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/[0-9.]/.test(ch)) {
      let j = i + 1;
      while (j < src.length && /[0-9.]/.test(src[j])) j += 1;
      const num = Number(src.slice(i, j));
      if (Number.isNaN(num)) return null;
      tokens.push({ t: "n", v: num });
      i = j;
      continue;
    }
    if ("+-*/()%".includes(ch)) {
      tokens.push({ t: ch });
      i += 1;
      continue;
    }
    return null;
  }
  return tokens;
}

function toRpn(tokens) {
  const out = [];
  const ops = [];
  const prec = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 3 };
  tokens.forEach((token, index) => {
    if (token.t === "n") {
      out.push(token);
      return;
    }
    if (token.t === "%") {
      out.push(token);
      return;
    }
    if ("+-*/".includes(token.t)) {
      const prev = tokens[index - 1];
      const unary = !prev || prev.t === "(" || "+-*/".includes(prev.t);
      if (unary && (token.t === "+" || token.t === "-")) {
        out.push({ t: "n", v: 0 });
      }
      while (ops.length && ops[ops.length - 1] !== "(" && prec[ops[ops.length - 1]] >= prec[token.t]) {
        out.push({ t: ops.pop() });
      }
      ops.push(token.t);
      return;
    }
    if (token.t === "(") {
      ops.push("(");
      return;
    }
    if (token.t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") out.push({ t: ops.pop() });
      if (ops.pop() !== "(") throw new Error("paren");
    }
  });
  while (ops.length) {
    const op = ops.pop();
    if (op === "(") throw new Error("paren");
    out.push({ t: op });
  }
  return out;
}

function evalRpn(rpn) {
  const stack = [];
  for (const token of rpn) {
    if (token.t === "n") {
      stack.push(token.v);
      continue;
    }
    if (token.t === "%") {
      const a = stack.pop();
      stack.push(a / 100);
      continue;
    }
    const b = stack.pop();
    const a = stack.pop();
    if (token.t === "+") stack.push(a + b);
    else if (token.t === "-") stack.push(a - b);
    else if (token.t === "*") stack.push(a * b);
    else if (token.t === "/") stack.push(a / b);
  }
  if (stack.length !== 1) throw new Error("stack");
  return stack[0];
}

export function analyzeEvents(events) {
  const groups = new Map();
  events.forEach((event) => {
    const label = (event.label || "").trim();
    if (!label) return;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(event);
  });
  const cycles = [];
  for (const [label, list] of groups) {
    const times = list.map((event) => event.t).sort((a, b) => a - b);
    const blocked = Math.round(median(list.map((event) => Number(event.blocked) || 8)));
    if (times.length < 2) {
      cycles.push({ label, status: "short", n: times.length, blocked, open: 0, cycle: 0, spread: 0 });
      continue;
    }
    const gaps = [];
    for (let i = 1; i < times.length; i += 1) gaps.push(times[i] - times[i - 1]);
    const cycle = median(gaps);
    const spread = mad(gaps, cycle);
    const irregular = times.length < 3 || cycle <= 0 || spread / cycle > 0.25;
    cycles.push({
      label,
      status: irregular ? "irregular" : "cycled",
      n: times.length,
      cycle: Math.round(cycle),
      blocked,
      open: Math.max(0, Math.round(cycle - blocked)),
      spread: Math.round(spread),
      lastT: times[times.length - 1],
    });
  }
  return cycles;
}

export function nextWindow(cycle, nowT) {
  if (!cycle || cycle.status !== "cycled") return null;
  const elapsed = nowT - cycle.lastT;
  const mod = ((elapsed % cycle.cycle) + cycle.cycle) % cycle.cycle;
  if (mod < cycle.blocked) return { state: "blocked", wait: cycle.blocked - mod, open: cycle.open };
  const into = mod - cycle.blocked;
  if (into < cycle.open) return { state: "open", wait: 0, open: cycle.open - into };
  return { state: "wait", wait: cycle.cycle - mod, open: cycle.open };
}

export function conservativeSlot(cycles) {
  const ready = cycles.filter((cycle) => cycle.status === "cycled" && cycle.n >= 3 && cycle.open > 0);
  if (!ready.length) return null;
  const shortest = [...ready].sort((a, b) => a.open - b.open)[0];
  return {
    open: shortest.open,
    cycle: shortest.cycle,
    label: shortest.label,
    limited: ready.length > 1,
    basis:
      ready.length > 1
        ? `Limited by ${shortest.label}. Phase the blockers against each other before you trust a tighter overlap.`
        : `${shortest.n} sightings, cycle about ${shortest.cycle}s.`,
  };
}

function rowOf(state, id) {
  return state.learning.rules[id] || { up: 0, down: 0, muted: false };
}

function scoreOf(state, id) {
  return state.scores.find((score) => score.id === id) || null;
}

export function armedScore(state) {
  return state.scores.find((score) => score.status === "armed") || null;
}

function hotPin(state) {
  const now = Date.now();
  return state.pins.find((pin) => pin.kind === "hot" && pin.until > now && pin.region === state.here) || null;
}

function pinsIn(state, kind) {
  return state.pins.filter((pin) => pin.kind === kind);
}

function coolStash(state) {
  const now = Date.now();
  const hotRegions = new Set(state.pins.filter((pin) => pin.kind === "hot" && pin.until > now).map((pin) => pin.region));
  return state.pins.find((pin) => pin.kind === "stash" && !hotRegions.has(pin.region)) || null;
}

function quietSite(state) {
  const minutes = gameMinutesNow(state);
  if (minutes == null) return null;
  const hour = Math.floor(minutes / 60) % 24;
  const site = state.sites.find((item) => item.region === state.here && item.hours && item.hours[hour]);
  if (!site) return null;
  return { name: site.name, mood: site.hours[hour] };
}

function toolLabel(id) {
  return { hotwire: "a hotwire", "slim-jim": "a slim jim", "tracker-kill": "a tracker kill" }[id] || id;
}

function intentOf(text) {
  const q = text.toLowerCase();
  if (!q || /what now|what do i do|help|now/.test(q)) return "now";
  if (/why|source|how do you know/.test(q)) return "why";
  if (/arm|ready|roll|can i go/.test(q)) return "arm";
  if (/cut|take|fence|share|my money|payout/.test(q)) return "cut";
  if (/window|cycle|door|when is|scout/.test(q)) return "window";
  if (/where|map|go|stash|block/.test(q)) return "map";
  if (/heat|star|cop|wanted|police/.test(q)) return "heat";
  if (/learn|muted|median/.test(q)) return "learn";
  return "now";
}

function maybeMath(state, text) {
  const q = text.toLowerCase();
  if (!/cut|take|fence|share|\$|gross/.test(q)) return null;
  const nums = q.match(/\d[\d,]*/g)?.map((n) => Number(n.replace(/,/g, ""))) || [];
  const gross = nums[0] || state.calc.gross;
  const fenceRate = nums.length > 1 ? nums[1] : state.calc.fenceRate;
  const yourPct = nums.length > 2 ? nums[2] : cutMath(state.calc).yourPct || 60;
  const result = cutMath({
    gross,
    fenceMode: "rate",
    fenceRate,
    fenceFlat: 0,
    shares: [
      { name: "You", pct: yourPct },
      { name: "Rest", pct: Math.max(0, 100 - yourPct) },
    ],
  });
  return {
    ruleId: "calc-cut",
    status: "math",
    text: `Your take is ${money(result.your)}. Fence keeps ${money(result.fence)}. ${money(result.left)} is left, and your ${yourPct}% of that is the take.`,
    basis: "Cut tab. Fence comes off the gross. Your percent applies to what remains. Unassigned percent is not given to you.",
  };
}

export function advise(state, text = "", ctx = {}) {
  const intent = intentOf(text || "");
  if (intent === "learn") {
    const kept = Object.values(state.learning.rules).filter((row) => row.up > 0).length;
    const muted = Object.values(state.learning.rules).filter((row) => row.muted).length;
    return {
      ruleId: "learn-status",
      status: "you",
      text: `I am keeping ${kept} answers and I have muted ${muted}. Clear times show up after three chases at the same star count.`,
      basis: "Your thumbs and your tapes. Nothing from outside the phone.",
    };
  }
  if (intent === "window") {
    const site = state.sites.find((item) => item.id === ctx.siteId) || state.sites[state.sites.length - 1];
    if (!site) {
      return {
        ruleId: "window-empty",
        status: "you",
        text: "No site yet. Open Stakeout, name a guard, and stamp them three times.",
        basis: "Window tab.",
      };
    }
    const cycles = analyzeEvents(site.events || []);
    const slot = conservativeSlot(cycles);
    if (!slot) {
      return {
        ruleId: "window-short",
        status: "you",
        text: `${site.name} has no trusted cycle. Three tight sightings of the same name, or it stays irregular.`,
        basis: "A wide spread never becomes a countdown.",
      };
    }
    return {
      ruleId: "window-slot",
      status: "you",
      text: `${slot.label} opens for about ${slot.open}s every ${slot.cycle}s.`,
      basis: slot.basis,
    };
  }
  const math = maybeMath(state, text || "");
  if ((intent === "cut" || math) && math) return math;
  const matched = RULES.filter((rule) => rule.when(state, ctx));
  const tagged = matched.filter((rule) => rule.tags.includes(intent));
  const pool = tagged.length ? tagged : matched;
  const ranked = pool
    .map((rule) => {
      const learned = rowOf(state, rule.id);
      if (learned.muted) return null;
      return { rule, score: rule.base + learned.up * 8 - learned.down * 6 };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
  if (!ranked.length) {
    return {
      ruleId: "none",
      status: "none",
      text: "Nothing in the book matches this moment. Stamp the icons you see, or ask about the cut, the window, or where to go.",
      basis: "I do not fill silence with a guess.",
    };
  }
  const best = ranked[0].rule;
  const learned = rowOf(state, best.id);
  const personal = learned.up ? ` You have kept this ${learned.up} time${learned.up === 1 ? "" : "s"}.` : "";
  return {
    ruleId: best.id,
    status: best.status,
    text: best.say(state, ctx),
    basis: `${best.source}${personal}`,
  };
}

export function feedback(state, ruleId, good) {
  if (!ruleId || ruleId === "none" || ruleId === "practice") {
    return "That one is not a rule I can learn.";
  }
  const row = { ...rowOf(state, ruleId) };
  if (good) row.up += 1;
  else {
    row.down += 1;
    if (row.down >= 2) row.muted = true;
  }
  state.learning.rules[ruleId] = row;
  if (row.muted) return "Muted. I will stop leading with that.";
  if (good) return row.up === 1 ? "Kept. I will say that louder next time." : `Kept ${row.up} times.`;
  return "Noted. One more miss and I mute it.";
}

export function medianClear(state, stars) {
  const list = state.learning.clears[String(stars)] || [];
  if (list.length < 3) return null;
  return { median: median(list), n: list.length };
}

export function armBlockers(state, score) {
  const reasons = [];
  if (!score) return ["No score."];
  if (score.needsTool && !state.tools.includes(score.needsTool)) {
    reasons.push(`Missing ${toolLabel(score.needsTool)}.`);
  }
  const car = state.vehicles.find((v) => v.id === score.vehicleId);
  if (car?.tracker === "live" && score.keepCar) reasons.push("The keep-car still has a live tracker.");
  const period = periodOf(gameMinutesNow(state));
  if (score.watchedAt && score.watchedAt !== "any" && period !== "unset" && score.watchedAt !== period) {
    reasons.push(`Scouted at ${score.watchedAt}. It is ${period} now.`);
  }
  if (score.kind === "heist" && score.wantsPartner && state.settings.relationship < 50 && state.settings.endingMatters) {
    reasons.push("The relationship meter is low for a job that needs both of you.");
  }
  return reasons;
}

export function recordClear(state, stars, seconds) {
  if (!stars || !seconds) return;
  const key = String(stars);
  const list = state.learning.clears[key] ? [...state.learning.clears[key]] : [];
  list.push(Math.round(seconds));
  state.learning.clears[key] = list.slice(-12);
}

export function learnLine(state) {
  const parts = [];
  for (const stars of [1, 2, 3, 4, 5, 6]) {
    const row = medianClear(state, stars);
    if (row) parts.push(`${stars}★ clears in about ${formatDuration(row.median)} over ${row.n} chases`);
  }
  const muted = Object.entries(state.learning.rules)
    .filter(([, row]) => row.muted)
    .map(([id]) => id);
  if (muted.length) parts.push(`Muted: ${muted.join(", ")}`);
  return parts;
}
