import { missionList, missionReached, pocketOf, quitSafe, sheetHits, sheetLine, viceGap, currentMission } from "./ops.js";

export const APP_VERSION = "3";

export const BANDS = [
  { name: "Running on Empty", min: 0 },
  { name: "Partners in Crime", min: 25 },
  { name: "Crazy in Love", min: 50 },
  { name: "Hot Together", min: 75 },
];

export const RATINGS = [
  { id: "speed", name: "Speed" },
  { id: "accel", name: "Acceleration" },
  { id: "asphalt", name: "Asphalt" },
  { id: "offroad", name: "Off-road" },
  { id: "strength", name: "Strength" },
];

export const SHOPS = [
  { id: "speed", name: "Speed shop", rating: "speed" },
  { id: "accel", name: "Acceleration shop", rating: "accel" },
  { id: "asphalt", name: "Asphalt shop", rating: "asphalt" },
  { id: "offroad", name: "Off-road shop", rating: "offroad" },
  { id: "strength", name: "Strength shop", rating: "strength" },
  { id: "spray", name: "Pay 'n' Spray", rating: "" },
  { id: "moses", name: "Moses", rating: "" },
];

export const CALLEES = [
  { id: "brian", name: "Brian", chapter: 1, mission: "gone-fishing", note: "Buys goods early." },
  { id: "donnie", name: "Donnie", chapter: 1, mission: "lab-fees", note: "Fence after Lab Fees." },
  { id: "moses", name: "Moses", chapter: 2, mission: "moses", note: "Slim jim. Untracked cars pay checking." },
  { id: "raul", name: "Raul", chapter: 3, mission: "first-impressions", note: "Jammer for dye packs." },
  { id: "dunk", name: "Dunk", chapter: 3, mission: "", note: "Reported after Slam Dunk. Flip him on when you have met him.", reported: true },
];

export const LOST = {
  1: ["Meditation at Jason's house", "An easy trip back to the Keys", "Pocket cash you leave on yourself"],
  2: ["The Port Gellhorn motel as the place you live", "Any Vice City fund that has not landed"],
  3: ["Banks you walk into before the jammer"],
  4: ["Optional work you have not checked"],
  5: ["Anything you left for a second run"],
};

export function bandOf(value) {
  const n = Number(value) || 0;
  let name = BANDS[0].name;
  for (const band of BANDS) if (n >= band.min) name = band.name;
  return name;
}

export function bothReady(state) {
  return (Number(state.settings?.relationship) || 0) >= 50;
}

export function blockName(minutes) {
  if (minutes == null) return "Unset";
  const hour = Math.floor(minutes / 60) % 24;
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
}

export function openNow(minutes, weather) {
  const block = blockName(minutes);
  const lines = [];
  if (block === "Morning") lines.push("Coffee, the motel, and the gym are the morning stops.");
  if (block === "Afternoon") lines.push("Shops and Real Estate are a daytime stop.");
  if (block === "Evening") lines.push("The house and a date. Leave the loud jobs.");
  if (block === "Night") lines.push("The block is quiet. Fuel and the drive home matter.");
  if (block === "Unset") lines.push("Set the in-game clock and this list gets a time of day.");
  if (/storm|rain|squall|wet/i.test(String(weather || ""))) lines.push("The sky is wet. Leave the boat and the bike.");
  return { block, lines };
}

export function cashBills(state) {
  const life = state.life;
  const rent = life.motel.paid ? 0 : Number(life.motel.rent) || 0;
  const coffee = life.coffeeDone ? 0 : Number(life.coffee) || 0;
  return rent + coffee;
}

export function piles(state) {
  const pocket = pocketOf(state);
  const reserved = cashBills(state);
  return {
    pocket,
    goods: Number(state.bank.goods) || 0,
    tomorrow: Number(state.bank.tomorrow) || 0,
    checking: Number(state.bank.checking) || 0,
    savings: Number(state.bank.family) || 0,
    reserved,
    spendable: Math.max(0, pocket - reserved) + (Number(state.bank.checking) || 0),
  };
}

export function gymStatus(state, now = Date.now()) {
  const lead = state.settings?.lead || "lucia";
  const gym = state.life.gym;
  const today = Number(gym.today[lead]) || 0;
  const left = Math.max(0, Number(gym.dayCap) - today);
  const last = Number(gym.last[lead]) || 0;
  const ageDays = last ? (now - last) / 86400000 : 99;
  const open = !last || ageDays <= Number(gym.windowDays);
  const rest = gym.protein && gym.proteinHalves ? Number(gym.restHours) / 2 : Number(gym.restHours);
  const body = state.bodies?.[lead] || { strength: 1, cardio: 1, focus: 1 };
  const behind = open && left > 0 && (body.strength < 4 || body.cardio < 4 || body.focus < 4);
  let line = `${today}% of ${gym.dayCap}% today. ${left}% left. Rest is about ${rest} hours.`;
  if (!open) line = "The four-day window is shut.";
  else if (left <= 0) line = "The day cap is used. More gym does nothing until tomorrow.";
  return { today, left, open, rest, behind, line, lead };
}

export function applyWorkout(state, who, bring, now = Date.now()) {
  const gym = state.life.gym;
  const leads = bring ? ["jason", "lucia"] : [who];
  let gained = 0;
  for (const lead of leads) {
    const room = Math.max(0, Number(gym.dayCap) - (Number(gym.today[lead]) || 0));
    const gain = Math.min(Number(gym.sessionPct) || 0, room);
    gym.today[lead] = (Number(gym.today[lead]) || 0) + gain;
    gym.last[lead] = now;
    gained += gain;
  }
  return gained;
}

export function calleeBook(state) {
  return CALLEES.map((person) => ({
    ...person,
    open: person.id === "dunk" ? Boolean(state.life.dunk) : person.mission ? missionReached(state, person.chapter, person.mission) : false,
  }));
}

export function activeFence(state) {
  const book = calleeBook(state);
  const dunk = book.find((person) => person.id === "dunk");
  if (dunk?.open) return dunk;
  const donnie = book.find((person) => person.id === "donnie");
  if (donnie?.open) return donnie;
  const brian = book.find((person) => person.id === "brian");
  if (brian?.open) return brian;
  return null;
}

export function storyRows(state, chapter) {
  const built = missionList(chapter).map((mission) => ({ ...mission, custom: false, done: Boolean(state.story.done?.[mission.id]) }));
  const extra = (state.life.missions || []).filter((mission) => mission.chapter === chapter).map((mission) => ({ ...mission, custom: true }));
  return [...built, ...extra];
}

export function chapterShown(state, chapter) {
  if (chapter <= (state.story?.chapter || 1)) return true;
  return Boolean(state.life.shown?.[chapter]);
}

export function tooFar(state) {
  const chapter = state.story?.chapter || 1;
  if (chapter < 3) return "";
  if (state.here === "keys" || state.here === "goose-key") return "You are back in the Keys. This is the long trip.";
  return "Keys work is behind you. Going back is the long trip.";
}

export function expiresToday(state, now = Date.now()) {
  const items = [];
  if (!state.life.motel.paid) items.push(`Motel rent is ${Number(state.life.motel.rent) || 0} in cash.`);
  if ((Number(state.bank.tomorrow) || 0) > 0) items.push("A payment arrives tomorrow. It is not spendable yet.");
  const gym = gymStatus(state, now);
  if (gym.behind) items.push(gym.line);
  if ((state.story?.chapter || 1) === 1 && !state.story.checks?.meditate && !state.life.house.meditate) items.push("Meditation at the house is gone after this chapter.");
  if ((state.story?.chapter || 1) === 1 && !state.story.checks?.keys && !(state.life.keys || []).some((job) => job.done || job.waive)) items.push("Keys jobs get painful to come back for.");
  return items;
}

export function oneMove(state, now = Date.now()) {
  const muted = new Set(state.life.mutedMoves || []);
  const candidates = [];
  if (state.story?.inMission) {
    const mission = currentMission(state);
    candidates.push({ text: mission?.line || "You are still inside the mission.", source: mission?.name || "Story" });
  }
  const safe = quitSafe(state);
  if (!safe.ok) candidates.push({ text: safe.reasons[0], source: "Quit-safe" });
  if (!state.life.motel.paid && pocketOf(state) < (Number(state.life.motel.rent) || 0)) {
    candidates.push({ text: "The motel is cash and the pocket is short.", source: "Motel" });
  }
  if (sheetHits(state).length) candidates.push({ text: sheetLine(state), source: "Sheet" });
  if ((state.story?.chapter || 1) === 2 && viceGap(state) > 0) {
    candidates.push({ text: `Vice City is still short ${viceGap(state)}. Tomorrow money does not count yet.`, source: "Move-in" });
  }
  const gym = gymStatus(state, now);
  if (gym.behind) candidates.push({ text: gym.line, source: "Gym" });
  for (const item of expiresToday(state, now)) candidates.push({ text: item, source: "Today" });
  const mission = currentMission(state);
  if (mission) candidates.push({ text: mission.line, source: mission.name });
  return candidates.find((item) => !muted.has(item.text)) || { text: "Nothing is expiring. Live the day.", source: "Today" };
}

export function shopFor(rating) {
  return SHOPS.find((shop) => shop.rating === rating) || null;
}

export function shopArrest(car) {
  return car?.tracker === "live";
}

export function compareCars(a, b) {
  if (!a || !b) return [];
  return RATINGS.map((rating) => ({
    id: rating.id,
    name: rating.name,
    a: Number(a[rating.id]) || 0,
    b: Number(b[rating.id]) || 0,
  }));
}

export function tankRange(distance, fraction) {
  const used = Number(fraction) || 0;
  const drove = Number(distance) || 0;
  if (used <= 0 || drove <= 0) return null;
  return drove / used;
}

export function moveCash(state, dest) {
  const pocket = pocketOf(state);
  state.bank.pocket = 0;
  state.bank.cash = 0;
  if (dest === "floor") {
    state.life.floorboard += pocket;
    return `Floorboards hold ${state.life.floorboard}.`;
  }
  state.bank.family += pocket;
  return `Savings hold ${state.bank.family}.`;
}

export function weekNet(state) {
  const week = state.life.week;
  const spent = (Number(week.rent) || 0) + (Number(week.food) || 0) + (Number(week.ammo) || 0);
  return (Number(week.landed) || 0) - spent;
}

export function whatYouLose(chapter) {
  return LOST[chapter] || LOST[5];
}

export function sessionDelta(state) {
  return pocketOf(state) - (Number(state.life.sessionPocket) || 0);
}

export function bankBlocked(state) {
  const marked = Number(state.life.marked) || 0;
  if (!marked) return "";
  const jammer = Boolean(state.story.checks?.jammer) || missionReached(state, 3, "first-impressions");
  if (jammer) return "";
  return "Marked bills are on you. A bank stays shut until Raul's jammer exists.";
}

export function bustNag(state) {
  return (Number(state.life.bustCount) || 0) >= 3;
}
