export const SHEET_ROWS = [
  { id: "hat", label: "Hat and bandana", fix: "Take the hat and bandana off." },
  { id: "clothes", label: "Clothes", fix: "Change the outfit." },
  { id: "weapon", label: "Weapon", fix: "Drop it. Owned guns come back to the trunk.", fixStolen: "Stash it. This one was never stored." },
  { id: "vehicle", label: "Vehicle", fix: "Ditch this car or respray it. They still know it." },
  { id: "partner", label: "Partner", fix: "Split. If either of you is caught, it is still a bust." },
  { id: "camera", label: "Camera", fix: "The footage is in the back room." },
];

export const MISSIONS = {
  1: [
    { id: "prologue", name: "Prologue", line: "Lucia and the counselor. Nothing to bank yet." },
    { id: "gone-fishing", name: "Gone Fishing", line: "You come out of this loose in Key Lento.", buttons: ["Scan a car by holding the d-pad and aiming. Leave the phone closed."] },
    { id: "gear-up", name: "Gear Up", line: "Buy the longarm. A suppressor from the Key Lento Ammu-Nation is the early buy.", buttons: ["Put a unique gun in the trunk before you quit."] },
    { id: "just-a-scratch", name: "Just A Scratch", line: "The Ganado gets repaired. Note the shop bill on the car card." },
    { id: "lab-fees", name: "Lab Fees", line: "After this, Donnie can buy goods. Brian is the fence before that." },
    { id: "unwanted-attention", name: "Unwanted Attention", line: "The cop scanner starts mattering. Pin the district the radio names." },
    { id: "buck-me", name: "Buck Me", line: "The bank opens. Pocket cash can leave your hands.", buttons: ["ATM. Family savings is the pile a bust cannot take."] },
    { id: "island-dreams", name: "Island Dreams", line: "The dive. Do the Keys jobs you care about before this chapter moves you." },
    { id: "coming-home", name: "Coming Home", line: "Lucia is back. Hearts start mattering." },
  ],
  2: [
    { id: "whats-in-the-bag", name: "What's in the Bag?", line: "Port Gellhorn. The motel rent is cash. Keep a little in your pocket." },
    { id: "moses", name: "Moses", line: "The slim jim. Untracked cars sold to Moses pay straight into checking." },
    { id: "daily-driver", name: "Daily Driver", line: "Vice City Real Estate installs after this. A garage is a slot Scooter Bros can deliver." },
    { id: "breakfast-run", name: "Breakfast Run", line: "Clerks pay when you threaten them. Leave when the sirens start.", buttons: ["Threaten: Square on PlayStation, X on Xbox."] },
    { id: "coffee-break", name: "Coffee Break", line: "Buy Lucia the $2 coffee. Free switching unlocks after it.", buttons: ["Hold right on the d-pad.", "Then R1 on PlayStation, or RB on Xbox."] },
    { id: "afternoon-delight", name: "Afternoon Delight", line: "The big check. It has been landing in BuckMe the next day. Mark it Tomorrow." },
    { id: "checking-out", name: "Checking Out", line: "Vice City wants $15,000 before you leave Port Gellhorn. Tomorrow money does not count yet." },
  ],
  3: [
    { id: "welcome-vice", name: "Welcome to Vice City", line: "You are in the city. Banks still wait on Raul's jammer." },
    { id: "dealers-choice", name: "Dealer's Choice", line: "A product choice. The cut has been the more profitable one in reported runs." },
    { id: "first-impressions", name: "First Impressions", line: "Raul. The jammer for dye packs comes through him." },
    { id: "cartel-heist", name: "The Cartel Heist", line: "The bank. Do not arm it while a suspect row still matches." },
  ],
  4: [
    { id: "ocean-beach", name: "Ocean Beach", line: "A new shop. Check quit-safe before you stop for the night." },
    { id: "company-cars", name: "Company Cars", line: "New wheels. Register them only if a garage slot is open." },
  ],
  5: [
    { id: "top", name: "Top of the World, Ma", line: "The last chapter. Optional jobs are behind you. The suspect sheet still applies." },
  ],
};

export const CHAPTER_NAMES = {
  1: "Just Like Paradise",
  2: "Paradise Lost",
  3: "Tits Ass Drug Money",
  4: "Vice City, Baby",
  5: "Top of the World, Ma",
};

export function pocketOf(state) {
  const pocket = Number(state.bank?.pocket);
  if (pocket) return pocket;
  return Number(state.bank?.cash) || 0;
}

export function sheetHits(state) {
  if (!state.suspect?.open) return [];
  return SHEET_ROWS.filter((row) => state.suspect.seen[row.id] && state.suspect.now[row.id]);
}

export function sheetLine(state) {
  const hits = sheetHits(state);
  if (!state.suspect?.open) return "No description on file.";
  if (!hits.length) return "The description is broken.";
  const row = hits[0];
  if (row.id === "weapon") return state.suspect.weaponOwned ? row.fix : row.fixStolen;
  if (row.id === "clothes" && !state.kit?.spareOutfit) return "Clothes still match, and this car has no spare outfit.";
  return row.fix;
}

export function sheetBlock(state) {
  const hits = sheetHits(state);
  if (!hits.length) return [];
  return [`Suspect sheet still matches: ${hits.map((row) => row.label).join(", ")}. Break it before you arm another score.`];
}

export function inSearch(state) {
  return Boolean(state.suspect?.open && state.suspect.searchRegion && state.suspect.searchRegion === state.here && sheetHits(state).length);
}

export function carVerdict(car, slotsUsed, slotsOwned) {
  if (!car) return { word: "dump", why: "No active car." };
  if (car.tracker === "live") return { word: "dump", why: "Tracker is live. A mod shop will cuff you." };
  const net = (Number(car.fence) || 0) - (Number(car.repair) || 0);
  const register = Number(car.register) || 0;
  const openSlot = slotsUsed < slotsOwned;
  if (register > 0 && register >= net) {
    if (openSlot) return { word: "register", why: "A slot is open and the sale does not beat the cost to keep it." };
    return { word: "dump", why: "No garage slot, and registering costs more than the sale." };
  }
  if (net > 0) return { word: "sell", why: "The fence pays more than it costs to repair, and the tracker is dead." };
  return { word: "dump", why: "Nothing useful comes back from this car." };
}

export function repairWorth(car) {
  const bonus = Number(car?.conditionBonus) || 0;
  const repair = Number(car?.repair) || 0;
  if (!repair) return null;
  return bonus > repair;
}

export function quitSafe(state) {
  const reasons = [];
  const keep = Number(state.bank?.pocketKeep ?? 800);
  const pocket = pocketOf(state);
  const bankOpen = missionReached(state, 1, "buck-me");
  if (pocket > keep) reasons.push(bankOpen ? "Pocket is fat. Use an ATM." : "Pocket is fat. Use the floorboards in Jason's bedroom.");
  if ((Number(state.bank?.goods) || 0) > 0 || state.kit?.goodsOnYou) reasons.push("Unsold goods are still on you.");
  if (state.kit?.uniqueOnBack) reasons.push("A unique gun is on your back. Put it in the trunk.");
  if (state.story?.inMission) reasons.push("You are still inside a mission.");
  const car = (state.vehicles || []).find((item) => item.id === state.activeVehicleId);
  if (car?.tracker === "live") reasons.push(`${car.name} still has a live tracker.`);
  if (car && car.registered === false && (Number(car.register) || 0) > 0 && (state.garageSlots || 0) > registeredCount(state)) {
    reasons.push(`${car.name} can be registered and is not.`);
  }
  return { ok: reasons.length === 0, reasons };
}

export function registeredCount(state) {
  return (state.vehicles || []).filter((car) => car.registered).length;
}

export function routeDollar(state, pile, amount) {
  const value = Math.max(0, Number(amount) || 0);
  const bank = state.bank;
  const cap = Number(bank.checkingCap) || 15000;
  const goal = Number(bank.savingsGoal) || 5000;
  if (pile === "pocket") {
    bank.pocket += value;
    bank.cash = bank.pocket;
    return `Pocket is ${bank.pocket}. A bust can take it.`;
  }
  if (pile === "goods") {
    bank.goods += value;
    state.kit.goodsOnYou = bank.goods > 0;
    return `Goods are ${bank.goods}. Sell them before you quit.`;
  }
  if (pile === "tomorrow") {
    bank.tomorrow += value;
    return `${bank.tomorrow} is due tomorrow. It does not count toward Vice City yet.`;
  }
  if (pile === "checking") {
    const room = Math.max(0, cap - bank.checking);
    const into = Math.min(value, room);
    bank.checking += into;
    const overflow = value - into;
    let extra = "";
    if (overflow && bank.family < goal) {
      const save = Math.min(overflow, goal - bank.family);
      bank.family += save;
      const left = overflow - save;
      extra = left ? ` ${left} is still loose. Spend it. Savings will not take more past the goal from this drop.` : ` ${save} moved into savings.`;
    } else if (overflow) {
      extra = ` Checking is at the cap. ${overflow} should be spent, not carried.`;
    }
    return `Checking is ${bank.checking}.${extra}`;
  }
  if (pile === "savings") {
    const room = Math.max(0, goal - bank.family);
    const into = room ? Math.min(value, room) : value;
    bank.family += into;
    return `Savings is ${bank.family}. It survives a bust.`;
  }
  return "Pick a pile.";
}

export function viceGap(state) {
  const have = (Number(state.bank?.checking) || 0) + (Number(state.bank?.family) || 0);
  return Math.max(0, (Number(state.bank?.viceGoal) || 15000) - have);
}

export function missionList(chapter) {
  return MISSIONS[chapter] || [];
}

export function currentMission(state) {
  const list = missionList(state.story?.chapter || 1);
  return list.find((mission) => mission.id === state.story?.missionId) || list[0] || null;
}

export function missionReached(state, chapter, id) {
  const here = state.story?.chapter || 1;
  if (here > chapter) return true;
  if (here < chapter) return false;
  const list = missionList(chapter);
  const at = list.findIndex((mission) => mission.id === state.story?.missionId);
  const need = list.findIndex((mission) => mission.id === id);
  if (need < 0) return false;
  return at >= need;
}

export function chapterTraps(state) {
  const chapter = state.story?.chapter || 1;
  const checks = state.story?.checks || {};
  if (chapter === 1) {
    return [
      { id: "cash", label: "Pocket is stashed or banked", done: pocketOf(state) <= (Number(state.bank?.pocketKeep) || 800) },
      { id: "meditate", label: "Meditation at Jason's house, if you want it", done: Boolean(checks.meditate) },
      { id: "keys", label: "Keys jobs you care about", done: Boolean(checks.keys) },
    ];
  }
  if (chapter === 2) {
    return [
      { id: "vice", label: "$15,000 before Vice City", done: viceGap(state) === 0 },
      { id: "switch", label: "Coffee Break done, so you can switch", done: missionReached(state, 2, "coffee-break") },
    ];
  }
  if (chapter === 3) {
    return [{ id: "jammer", label: "Raul's jammer before a bank", done: Boolean(checks.jammer) || missionReached(state, 3, "first-impressions") }];
  }
  return [{ id: "quit", label: "Quit-safe is green", done: quitSafe(state).ok }];
}

export function doorOpen(state) {
  const waived = state.story?.waived || {};
  return chapterTraps(state).every((trap) => trap.done || waived[trap.id]);
}

export function switchLanding(state, lead) {
  const place = state.where?.[lead];
  const name = lead === "jason" ? "Jason" : "Lucia";
  if (state.heat?.stars > 0) return `Mid-chase. ${name} was last at ${place || "a place you have not logged"}. A switch drops you there.`;
  return `${name} was last at ${place || "a place you have not logged"}.`;
}

export function focusLine(state) {
  const lead = state.settings?.lead || "lucia";
  const body = state.bodies?.[lead] || { strength: 1, cardio: 1, focus: 1, windowOpen: true, meter: "full" };
  const standing = state.settings?.standing;
  const name = lead === "jason" ? "Jason" : "Lucia";
  if (body.meter === "low" && body.windowOpen) {
    return `${name}'s meter is low and the workout window is open. Train the stat. A dry meter has nothing to spend.`;
  }
  if (standing === "professional") return "Professional. The meter comes back from non-lethal hits. Spend it on the weak spot.";
  if (standing === "psycho" || standing === "irredeemable") return "This standing refills the meter from headshots. Spend the meter on the shot. Train the stat when the window is open.";
  if (body.windowOpen && body.focus < 4) return `${name} Focus is ${body.focus}/4 and the window is open.`;
  return "The meter is what you spend when time slows. The stat is the level on the Fitness app.";
}

export function bodyNudge(state) {
  const lead = state.settings?.lead === "jason" ? "lucia" : "jason";
  const mine = state.bodies?.[state.settings?.lead || "lucia"];
  const theirs = state.bodies?.[lead];
  if (!mine || !theirs) return "";
  if (theirs.windowOpen && !mine.windowOpen) {
    const name = lead === "jason" ? "Jason" : "Lucia";
    return `${name}'s window is open and yours is not. Take them. One gym visit counts for both if they come with you.`;
  }
  return "";
}
