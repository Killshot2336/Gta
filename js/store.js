const KEY = "leonida-dossier-v1";

export const REGIONS = [
  { id: "mount-kalaga", name: "Mount Kalaga", blurb: "North border. Hunting roads and long gaps between towns." },
  { id: "ambrosia", name: "Ambrosia", blurb: "Sugar plant and the bikers. Day shift is busy. Night is not." },
  { id: "port-gellhorn", name: "Port Gellhorn", blurb: "Motels, trucks, and a coast that emptied out." },
  { id: "grassrivers", name: "Grassrivers", blurb: "Glades. Fuel matters. Exits are few." },
  { id: "vice-city", name: "Vice City", blurb: "Cameras, witnesses, and short blocks." },
  { id: "keys", name: "Leonida Keys", blurb: "Boats, bridges, and Goose Key to the west." },
  { id: "goose-key", name: "Goose Key", blurb: "Airport airspace. Confirm it once you have seen the jets." },
];

export function regionName(id) {
  return REGIONS.find((r) => r.id === id)?.name || "Leonida";
}

export function defaultState() {
  return {
    version: 1,
    settings: {
      couch: false,
      buzz: true,
      sound: false,
      endingMatters: true,
      standing: "hardened",
      relationship: 35,
      lead: "lucia",
      otherWhere: "",
      home: "vice-city",
      gooseConfirmed: false,
      starLook: "",
    },
    split: { jason: "", lucia: "", meet: "" },
    game: { minutes: null, measureStart: null, ratio: null, anchorReal: null, anchorGame: null },
    bank: { cash: 0, checking: 0, family: 0, pocket: 0, goods: 0, tomorrow: 0, checkingCap: 15000, savingsGoal: 5000, viceGoal: 15000, pocketKeep: 800 },
    suspect: {
      open: false,
      weaponOwned: true,
      searchRegion: "",
      seen: { hat: false, clothes: false, weapon: false, vehicle: false, partner: false, camera: false },
      now: { hat: false, clothes: false, weapon: false, vehicle: false, partner: false, camera: false },
    },
    where: { jason: "", lucia: "" },
    story: { chapter: 1, missionId: "gone-fishing", inMission: false, checks: {}, waived: {}, scannerRegion: "" },
    bodies: {
      jason: { strength: 1, cardio: 1, focus: 1, windowOpen: true, meter: "full" },
      lucia: { strength: 1, cardio: 1, focus: 1, windowOpen: true, meter: "full" },
    },
    kit: { spareOutfit: false, uniqueOnBack: false, goodsOnYou: false },
    garageSlots: 1,
    irredeemableLocked: false,
    tools: ["hotwire"],
    looks: [],
    vehicles: [],
    activeVehicleId: null,
    pins: [],
    sites: [],
    scores: [],
    live: null,
    tapes: [],
    busts: [],
    contacts: [],
    headlines: [],
    errands: [
      { id: "flowers", name: "Flowers", done: false },
      { id: "groceries", name: "Groceries", done: false },
      { id: "paint", name: "Paint the place", done: false },
      { id: "gym", name: "Gym", done: false },
    ],
    fitness: { strength: 1, cardio: 1, focus: 1 },
    weather: "",
    quotes: [],
    garages: [],
    here: "vice-city",
    heat: {
      stars: 0,
      look: "",
      witnessed: true,
      alarm: false,
      icons: { camera: false, accomplice: false, clothes: false, face: false, weapon: false, vehicle: false },
    },
    learning: { rules: {}, clears: {} },
    helper: [],
    session: { note: "", spend: 0, startedAt: Date.now() },
    homePage: 0,
    calcTab: "scratch",
    helperTab: "talk",
    toast: "",
    calc: {
      expr: "",
      gross: 100000,
      fenceRate: 10,
      fenceFlat: 0,
      fenceMode: "rate",
      shares: [
        { name: "You", pct: 60 },
        { name: "Partner", pct: 40 },
      ],
      starWeight: 0.35,
      missWeight: 0.15,
      fuelDistance: 0,
      fuelFraction: 0,
      trip: 0,
    },
    pendingOut: null,
    nav: { name: "lock" },
    stack: [{ name: "lock" }],
  };
}

function fill(base, extra) {
  if (extra === undefined) return base;
  if (Array.isArray(base)) return Array.isArray(extra) ? extra : base;
  if (base && typeof base === "object") {
    if (!extra || typeof extra !== "object" || Array.isArray(extra)) return base;
    const out = { ...base };
    for (const key of new Set([...Object.keys(base), ...Object.keys(extra)])) {
      out[key] = fill(base[key], extra[key]);
    }
    return out;
  }
  return extra;
}

export function hydrate(saved) {
  return fill(defaultState(), saved);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return hydrate(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function practiceState() {
  const state = defaultState();
  state.nav = { name: "helper" };
  state.stack = [{ name: "home" }, { name: "helper" }];
  state.heat = {
    stars: 3,
    look: "hollow",
    witnessed: true,
    alarm: false,
    icons: { camera: false, accomplice: false, clothes: true, face: true, weapon: false, vehicle: true },
  };
  state.here = "vice-city";
  const car = {
    id: uid(),
    name: "Getaway",
    kind: "car",
    tracker: "live",
    fuel: 0.22,
    register: 4200,
    repair: 485,
    fence: 9000,
    trackerCost: 500,
    alarm: true,
    lock: "keyless",
  };
  state.vehicles = [car];
  state.activeVehicleId = car.id;
  state.looks = [{ id: uid(), name: "Clean", note: "Hat, glasses, different jacket", pin: "Watson garage" }];
  state.pins = [
    { id: uid(), name: "Watson garage", kind: "stash", region: "vice-city", note: "4 min if the block is cool" },
    { id: uid(), name: "ATM on the strip", kind: "atm", region: "vice-city", note: "" },
  ];
  state.tools = ["hotwire"];
  state.split = { jason: "", lucia: "back alley", meet: "the garage" };
  state.game.minutes = 23 * 60;
  state.helper = [
    {
      id: uid(),
      role: "helper",
      text: "Practice chase is loaded. Three stars, hollow, clothes and the car are lit. Ask what to do, then tell me if the answer worked.",
      basis: "Practice data. Wipe it in Settings.",
      ruleId: "practice",
    },
  ];
  return state;
}
