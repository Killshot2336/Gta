import { regionName, REGIONS } from "./store.js";
import { formatGameTime, gameMinutesNow, money } from "./logic.js";
import {
  CHAPTER_NAMES,
  carVerdict,
  chapterTraps,
  currentMission,
  doorOpen,
  focusLine,
  bodyNudge,
  inSearch,
  missionList,
  quitSafe,
  registeredCount,
  repairWorth,
  sheetLine,
  switchLanding,
  viceGap,
} from "./ops.js";
import {
  APP_VERSION,
  RATINGS,
  SHOPS,
  activeFence,
  bandOf,
  bankBlocked,
  bothReady,
  bustNag,
  calleeBook,
  cashBills,
  chapterShown,
  compareCars,
  expiresToday,
  gymStatus,
  oneMove,
  openNow,
  piles,
  sessionDelta,
  shopArrest,
  shopFor,
  storyRows,
  tankRange,
  tooFar,
  weekNet,
  whatYouLose,
} from "./life.js";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function bar(title) {
  return `<header class="bar"><button type="button" class="back" data-act="back">Back</button><h1>${esc(title)}</h1></header>`;
}

function leadName(state) {
  return state.settings.lead === "jason" ? "Jason" : "Lucia";
}

export function lockScreen(state) {
  const minutes = gameMinutesNow(state);
  const safe = quitSafe(state);
  const move = oneMove(state);
  const mission = currentMission(state);
  const note = state.life.notes[mission?.id] || {};
  const expires = expiresToday(state);
  return `<section class="lock">
    <p class="kicker">Today</p>
    <h1>${esc(leadName(state))}</h1>
    <p>${esc(regionName(state.here))} · ${esc(minutes == null ? "Set the clock" : formatGameTime(minutes))}</p>
    <p class="sub">${state.life.woke ? `Woke at ${esc(state.life.woke)}` : "Stamp where you woke."}</p>
    <p class="${safe.ok ? "good" : "bad"}"><span class="lamp ${safe.ok ? "on" : ""}"></span>${safe.ok ? "Quit-safe" : "Do not quit"}</p>
    <article class="card">
      <p class="kicker">One move</p>
      <p>${esc(move.text)}</p>
      <p class="basis">${esc(move.source)}</p>
      <button type="button" data-act="mute-move" data-id="${esc(move.text)}">Did it</button>
    </article>
    ${expires.length ? `<p class="formula">${esc(expires[0])}</p>` : ""}
    <p class="sub">${esc(mission?.name || "No mission")}${note.fail ? ` · fail if ${esc(note.fail)}` : ""}</p>
    ${(mission?.buttons || []).slice(0, 1).map((button) => `<p class="formula">${esc(button)}</p>`).join("")}
    <div class="row">
      <button type="button" data-act="open" data-id="today">Today</button>
      <button type="button" data-act="open" data-id="story">Story</button>
      <button type="button" data-act="open" data-id="garage">Garage</button>
    </div>
    <button type="button" class="primary" data-act="unlock">Open</button>
  </section>`;
}

export function renderToday(state) {
  const minutes = gameMinutesNow(state);
  const sky = openNow(minutes, state.weather);
  const book = piles(state);
  const move = oneMove(state);
  const mission = currentMission(state);
  const people = calleeBook(state);
  const gym = gymStatus(state);
  return `${bar("Today")}
    <div class="stack">
      <p class="kicker">${esc(sky.block)}</p>
      <h2>${esc(leadName(state))} · ${esc(regionName(state.here))}</h2>
      ${sky.lines.map((line) => `<p>${esc(line)}</p>`).join("")}
      <article class="card">
        <p class="kicker">One move</p>
        <p>${esc(move.text)}</p>
        <p class="basis">${esc(move.source)}</p>
        <button type="button" data-act="mute-move" data-id="${esc(move.text)}">Did it</button>
      </article>
      <p class="kicker">Expires</p>
      ${expiresToday(state).map((line) => `<p class="formula">${esc(line)}</p>`).join("") || `<p class="sub">Nothing expires today.</p>`}
      <label class="field">Where you woke<input data-bind="life" data-field="woke" value="${esc(state.life.woke)}" placeholder="Hospital, motel, the house"></label>
      <label class="field">Sky<input data-bind="plain" data-field="weather" value="${esc(state.weather)}" placeholder="Clear, rain"></label>
      <button type="button" class="${state.life.motel.paid ? "primary" : "ghost"}" data-act="motel-paid">${state.life.motel.paid ? "Motel is paid" : `Motel still wants ${money(state.life.motel.rent)} cash`}</button>
      <label class="field">Motel rent<input type="number" data-bind="life" data-field="motel.rent" value="${state.life.motel.rent}"></label>
      <button type="button" class="${state.life.coffeeDone ? "primary" : "ghost"}" data-act="coffee-done">${state.life.coffeeDone ? "Coffee Break is done. Switching is open." : `The $${state.life.coffee} coffee is still waiting.`}</button>
      <p>Cash bills held back: ${esc(money(cashBills(state)))}. You can spend ${esc(money(book.spendable))}.</p>
      <p class="sub">Pocket ${esc(money(book.pocket))} · goods ${esc(money(book.goods))} · tomorrow ${esc(money(book.tomorrow))} · checking ${esc(money(book.checking))} · savings ${esc(money(book.savings))}</p>
      <p class="${sessionDelta(state) < 0 ? "bad" : "sub"}">Since you sat down, pocket moved ${esc(money(sessionDelta(state)))}.</p>
      <button type="button" data-act="stamp-pocket">I just sat down</button>
      <p>This week: landed ${esc(money(state.life.week.landed))} minus rent, food, and ammo leaves ${esc(money(weekNet(state)))}.</p>
      <button type="button" class="${state.life.gym.protein ? "primary" : "ghost"}" data-act="protein">${state.life.gym.protein ? "Protein is on" : "No protein since the last meal"}</button>
      <p>${esc(gym.line)}</p>
      <p class="kicker">Who picks up</p>
      ${people.map((person) => `<p>${person.open ? "●" : "○"} ${esc(person.name)} · ${esc(person.note)}</p>`).join("")}
      ${state.story.scannerRegion ? `<p class="formula">Scanner pinned to ${esc(regionName(state.story.scannerRegion))}.</p>
        <button type="button" class="${state.life.scannerStill ? "primary" : "ghost"}" data-act="scanner-still">${state.life.scannerStill ? "Still in that district" : "The scanner moved"}</button>` : `<p class="sub">Pin a scanner district on Story after Unwanted Attention.</p>`}
      <button type="button" class="${state.story.inMission ? "primary" : "ghost"}" data-act="in-mission">${state.story.inMission ? "Still on the clock" : "Between missions"}</button>
      <p class="sub">${esc(mission?.name || "")} · ${esc(sheetLine(state))}</p>
      ${inSearch(state) ? `<p class="bad">You walked back into the search area and you still match.</p>` : ""}
      ${bustNag(state) ? `<p class="bad">Three busts have taken the cash. Use the ATM before the next one.</p>` : ""}
    </div>`;
}

export function renderStoryPage(state) {
  const chapter = state.life.view || state.story.chapter || 1;
  const shown = chapterShown(state, chapter);
  const rows = storyRows(state, chapter);
  const mission = rows.find((item) => item.id === state.story.missionId) || currentMission(state);
  const note = (mission && state.life.notes[mission.id]) || { fail: "", pack: "", replay: "", partner: "" };
  const traps = chapterTraps(state);
  const open = doorOpen(state);
  const far = tooFar(state);
  return `${bar(CHAPTER_NAMES[chapter] || "Story")}
    <div class="stack">
      <div class="row">
        ${[1, 2, 3, 4, 5].map((number) => `<button type="button" class="${chapter === number ? "primary" : "ghost"}" data-act="chapter" data-id="${number}">${number}</button>`).join("")}
      </div>
      <p class="sub">${esc(CHAPTER_NAMES[chapter] || "")}</p>
      ${shown ? "" : `<article class="card shade"><p>This chapter is still ahead.</p><button type="button" data-act="shade" data-id="${chapter}">Show it anyway</button><button type="button" data-act="iam-here" data-id="${chapter}">I am in this chapter</button></article>`}
      ${shown ? rows.map((item) => `<button type="button" class="item" data-act="${item.custom ? "custom-mission" : "mission"}" data-id="${esc(item.id)}">${item.done || state.story.missionId === item.id ? "●" : "○"} ${esc(item.name)}</button>`).join("") : ""}
      ${shown && mission ? `<article class="card">
        <strong>${esc(mission.name)}</strong>
        <p>${esc(mission.line || "")}</p>
        ${(mission.buttons || []).map((button) => `<p class="formula">${esc(button)}</p>`).join("")}
        <button type="button" data-act="built-done" data-id="${esc(mission.id)}">${state.story.done?.[mission.id] ? "Finished" : "Mark finished"}</button>
        <label class="field">The way it wastes you<input data-bind="note" data-id="${esc(mission.id)}" data-field="fail" value="${esc(note.fail || "")}"></label>
        <label class="field">Pack<input data-bind="note" data-id="${esc(mission.id)}" data-field="pack" value="${esc(note.pack || "")}" placeholder="On your back / leave in the trunk"></label>
        <label class="field">Second run<input data-bind="note" data-id="${esc(mission.id)}" data-field="replay" value="${esc(note.replay || "")}"></label>
        <label class="field">The other lead
          <select data-bind="note" data-id="${esc(mission.id)}" data-field="partner">
            <option value="" ${note.partner ? "" : "selected"}>Unsure</option>
            <option value="in" ${note.partner === "in" ? "selected" : ""}>In this mission</option>
            <option value="out" ${note.partner === "out" ? "selected" : ""}>Living their day</option>
          </select>
        </label>
        ${note.partner === "out" ? `<p>They are living their day. You will spawn wherever you left them.</p>` : ""}
        ${note.partner === "in" && !bothReady(state) ? `<p class="bad">This one wants both of you, and the relationship is still ${esc(bandOf(state.settings.relationship))}.</p>` : ""}
      </article>` : ""}
      <label class="field">Add a mission you just found<input id="missionName" placeholder="Name"></label>
      <label class="field">One line<input id="missionLine" placeholder="What it asks"></label>
      <button type="button" data-act="add-mission">Add it to this chapter</button>
      <button type="button" class="${state.story.inMission ? "primary" : "ghost"}" data-act="in-mission">${state.story.inMission ? "Inside the mission" : "Between missions"}</button>
      ${far ? `<p class="bad">${esc(far)}</p>` : ""}
      <p class="kicker">You lose these if you walk through</p>
      ${whatYouLose(chapter).map((line) => `<p>${esc(line)}</p>`).join("")}
      <p class="kicker">Before the next chapter</p>
      ${traps.map((trap) => `<div class="row">
        <button type="button" class="${trap.done || state.story.waived[trap.id] ? "primary" : "ghost"}" data-act="trap" data-id="${trap.id}">${trap.done ? "Done" : state.story.waived[trap.id] ? "Waived" : "Still"} ${esc(trap.label)}</button>
        ${trap.done ? "" : `<button type="button" class="ghost" data-act="waive" data-id="${trap.id}">Waive</button>`}
      </div>`).join("")}
      <button type="button" class="primary" data-act="next-chapter" ${open && chapter < 5 ? "" : "disabled"}>${open ? "Open the next chapter" : "The door stays shut"}</button>
      <p class="kicker">Strangers</p>
      ${state.life.strangers.map((person) => `<p>${esc(person.name)} · ${esc(person.note)}</p>`).join("") || `<p class="sub">Optional people stay off the story spine.</p>`}
      <label class="field">Name<input id="strangerName"></label>
      <label class="field">Note<input id="strangerNote"></label>
      <button type="button" data-act="add-stranger">Save stranger</button>
      <p class="kicker">Forks</p>
      ${state.life.forks.map((fork) => `<p>${esc(fork.name)} · ${esc(fork.picked)} · ${esc(money(fork.paid))}</p>`).join("")}
      <label class="field">Choice<input id="forkName" placeholder="Dealer's Choice"></label>
      <label class="field">What you picked<input id="forkPicked"></label>
      <label class="field">What it paid<input id="forkPaid" type="number" value="0"></label>
      <button type="button" data-act="add-fork">Save the fork</button>
      <p class="kicker">One-time</p>
      ${state.life.uniques.map((item) => `<button type="button" class="${item.trunk ? "primary" : "ghost"}" data-act="unique-trunk" data-id="${esc(item.id)}">${item.trunk ? "In the trunk" : "On you"} ${esc(item.name)}</button>`).join("")}
      <label class="field">Unique gun, outfit, or car<input id="uniqueName"></label>
      <button type="button" data-act="add-unique">Add it</button>
      <label class="field">Scanner district
        <select data-bind="story" data-field="scannerRegion">
          <option value="">None</option>
          ${REGIONS.map((region) => `<option value="${region.id}" ${state.story.scannerRegion === region.id ? "selected" : ""}>${esc(region.name)}</option>`).join("")}
        </select>
      </label>
      <p class="sub">Phone ${esc(APP_VERSION)}. Later chapters stay shaded until you are in them.</p>
    </div>`;
}

export function renderGaragePage(state) {
  const slots = state.garages.length ? state.garages.reduce((sum, garage) => sum + (Number(garage.slots) || 0), 0) : state.garageSlots;
  const driver = state.vehicles.find((car) => car.id === state.life.dailyDriverId);
  const left = state.vehicles.find((car) => car.id === state.life.compareA);
  const right = state.vehicles.find((car) => car.id === state.life.compareB);
  const compared = compareCars(left, right);
  const range = tankRange(state.calc.fuelDistance, state.calc.fuelFraction);
  return `${bar("Garage")}
    <div class="stack">
      <p>Slots in use ${registeredCount(state)} / ${slots}</p>
      ${driver ? `<p>Daily driver: ${esc(driver.name)}${driver.registered ? "" : ". It is not registered, so Scooter Bros will not bring it."}</p>` : `<p class="sub">Pick a daily driver.</p>`}
      <p class="kicker">Places</p>
      ${state.life.garages.map((garage) => `<p>${esc(garage.name)} · ${esc(regionName(garage.region))} · ${garage.slots} slots</p>`).join("") || `<p class="sub">Add the garage you actually own.</p>`}
      <label class="field">Garage name<input id="garageName" placeholder="Watson"></label>
      <label class="field">Slots<input id="garageSlots" type="number" value="1"></label>
      <button type="button" data-act="add-garage">Add garage</button>
      <label class="field">Real Estate is installed
        <button type="button" class="${state.life.realEstate ? "primary" : "ghost"}" data-act="real-estate">${state.life.realEstate ? "Installed" : "Not yet. It waits on Daily Driver."}</button>
      </label>
      ${state.vehicles.map((car) => {
        const verdict = carVerdict(car, registeredCount(state), slots);
        const worth = repairWorth(car);
        const arrest = shopArrest(car);
        return `<article class="card">
          <strong>${esc(car.name)}</strong>
          <p class="bigresult">${esc(verdict.word)}</p>
          <p class="basis">${esc(verdict.why)}</p>
          <p class="sub">${esc(car.kind)} · ${esc(car.lock || "older")} · tracker ${esc(car.tracker)} · fuel ${Math.round((car.fuel || 0) * 100)}%</p>
          ${arrest ? `<p class="bad">Tracker is live. A mod shop will cuff you.</p>` : ""}
          ${worth == null ? "" : `<p>${worth ? "The condition bonus beats the repair bill." : "Skip the repair."}</p>`}
          ${RATINGS.map((rating) => `<label class="field">${esc(rating.name)}<input type="number" min="0" max="5" data-bind="car" data-id="${car.id}" data-field="${rating.id}" value="${car[rating.id] || 0}"></label>`).join("")}
          <p class="sub">${RATINGS.map((rating) => `${esc(shopFor(rating.id).name)} moves ${esc(rating.name)}`).join(". ")}.</p>
          <label class="field">Color<input data-bind="car" data-id="${car.id}" data-field="color" value="${esc(car.color || "")}" placeholder="Last respray"></label>
          <p>${(car.mods || []).map((mod) => esc(mod)).join(", ") || "No mods logged."}</p>
          <label class="field">Mod you already bought<input id="mod-${car.id}"></label>
          <button type="button" data-act="add-mod" data-id="${car.id}">Add mod</button>
          ${SHOPS.filter((shop) => shop.rating).map((shop) => `<button type="button" data-act="shop-go" data-id="${car.id}" data-shop="${shop.id}">${esc(shop.name)}</button>`).join(" ")}
          <button type="button" class="${car.registered ? "primary" : "ghost"}" data-act="register-car" data-id="${car.id}">${car.registered ? "Registered" : "Not registered"}</button>
          <button type="button" class="${state.life.dailyDriverId === car.id ? "primary" : "ghost"}" data-act="daily-driver" data-id="${car.id}">Daily driver</button>
          <button type="button" class="${state.life.stolenIds.includes(car.id) ? "danger" : "ghost"}" data-act="stolen-car" data-id="${car.id}">${state.life.stolenIds.includes(car.id) ? "Stolen tonight" : "Mine"}</button>
          <button type="button" data-act="sold-car" data-id="${car.id}">Sold or dumped</button>
          <button type="button" data-act="deliver" data-id="${car.id}">Send this car</button>
        </article>`;
      }).join("") || `<p class="sub">Scan a car in WAiNK and it lands here.</p>`}
      <p class="kicker">Compare</p>
      <label class="field">First<select data-bind="life" data-field="compareA">${carOptions(state, state.life.compareA)}</select></label>
      <label class="field">Second<select data-bind="life" data-field="compareB">${carOptions(state, state.life.compareB)}</select></label>
      ${compared.map((row) => `<p>${esc(row.name)} ${row.a} / ${row.b}</p>`).join("")}
      <p class="kicker">Sold</p>
      ${state.life.sold.map((row) => `<p>${esc(row.name)} · ${esc(row.word)} · ${esc(money(row.paid))}</p>`).join("") || `<p class="sub">Nothing sold yet.</p>`}
      <p>${range ? `A full tank is about ${range.toFixed(1)} of the distance units you measured.` : "Measure a drive in the calculator and the range shows up here."}</p>
      ${range && state.here === "grassrivers" ? `<p class="formula">Grassrivers is thin on fuel. Check the tank before you commit.</p>` : ""}
      <p class="kicker">Tools</p>
      <div class="chips">
        ${["hotwire", "slim-jim", "tracker-kill"].map((tool) => `<button type="button" class="${state.tools.includes(tool) ? "primary" : "ghost"}" data-act="tool" data-id="${tool}">${tool}</button>`).join("")}
      </div>
    </div>`;
}

function carOptions(state, selected) {
  return `<option value="">None</option>${state.vehicles.map((car) => `<option value="${car.id}" ${car.id === selected ? "selected" : ""}>${esc(car.name)}</option>`).join("")}`;
}

export function renderUsPage(state) {
  const lead = state.settings.lead || "lucia";
  const other = lead === "jason" ? "lucia" : "jason";
  const gym = gymStatus(state);
  const nudge = bodyNudge(state);
  return `${bar("Us")}
    <div class="stack">
      <p class="bigresult">${esc(bandOf(state.settings.relationship))}</p>
      <p class="basis">${bothReady(state) ? "Jobs that need both of you can open." : "Jobs that need both of you stay shut."}</p>
      <div class="row">
        <button type="button" class="${lead === "jason" ? "primary" : "ghost"}" data-act="lead" data-id="jason">Jason</button>
        <button type="button" class="${lead === "lucia" ? "primary" : "ghost"}" data-act="lead" data-id="lucia">Lucia</button>
      </div>
      <p class="formula">${esc(switchLanding(state, other))}</p>
      <label class="field">Jason was last at<input data-bind="where" data-id="jason" value="${esc(state.where.jason)}"></label>
      <label class="field">Lucia was last at<input data-bind="where" data-id="lucia" value="${esc(state.where.lucia)}"></label>
      <p>${esc(focusLine(state))}</p>
      ${nudge ? `<p class="formula">${esc(nudge)}</p>` : ""}
      <p>${esc(gym.line)}</p>
      <p class="sub">One session is ${state.life.gym.sessionPct}%. The day caps at ${state.life.gym.dayCap}%. Protein cuts the rest in half. The window is ${state.life.gym.windowDays} days. These are the reported numbers. Change them.</p>
      <label class="field">Session %<input type="number" data-bind="life" data-field="gym.sessionPct" value="${state.life.gym.sessionPct}"></label>
      <label class="field">Day cap %<input type="number" data-bind="life" data-field="gym.dayCap" value="${state.life.gym.dayCap}"></label>
      <label class="field">Rest hours<input type="number" data-bind="life" data-field="gym.restHours" value="${state.life.gym.restHours}"></label>
      <label class="field">Window days<input type="number" data-bind="life" data-field="gym.windowDays" value="${state.life.gym.windowDays}"></label>
      <button type="button" data-act="workout">Log a session for ${esc(leadName(state))}</button>
      <button type="button" data-act="workout-both">They came with me</button>
      <button type="button" data-act="new-day">New day</button>
      ${["strength", "cardio", "focus"].map((key) => `<label class="field">${leadName(state)} ${key} ${state.bodies[lead][key]}/4<input type="range" min="1" max="4" step="1" data-bind="body" data-id="${lead}" data-field="${key}" data-type="number" value="${state.bodies[lead][key]}"></label>`).join("")}
      <label class="field">Meter
        <select data-bind="body" data-id="${lead}" data-field="meter">
          <option value="full" ${state.bodies[lead].meter === "full" ? "selected" : ""}>Full</option>
          <option value="low" ${state.bodies[lead].meter === "low" ? "selected" : ""}>Low</option>
        </select>
      </label>
      <label class="field">Relationship ${state.settings.relationship}
        <input type="range" min="0" max="100" data-bind="setting" data-field="relationship" data-type="number" value="${state.settings.relationship}">
      </label>
      <p class="kicker">Dates</p>
      ${state.life.dates.map((date) => `<p>${esc(date.place)} · ${esc(date.bought)}${date.moved ? " · it moved" : ""}</p>`).join("")}
      <label class="field">Where<input id="datePlace"></label>
      <label class="field">What you bought<input id="dateBought"></label>
      <button type="button" data-act="add-date" data-id="1">It moved the relationship</button>
      <button type="button" data-act="add-date" data-id="0">It did not</button>
      <label class="field">Standing
        <select data-bind="setting" data-field="standing">
          ${["professional", "hardened", "violent", "psycho", "irredeemable"].map((level) => `<option ${state.settings.standing === level ? "selected" : ""}>${level}</option>`).join("")}
        </select>
      </label>
      ${state.irredeemableLocked ? `<p class="bad">Irredeemable is locked.</p>` : `<button type="button" class="danger" data-act="lock-ruin">Confirm Irredeemable. It does not come off.</button>`}
      <p class="kicker">Split</p>
      <label class="field">Jason's exit<input data-bind="split" data-field="jason" value="${esc(state.split.jason)}"></label>
      <label class="field">Lucia's exit<input data-bind="split" data-field="lucia" value="${esc(state.split.lucia)}"></label>
      <label class="field">Meet<input data-bind="split" data-field="meet" value="${esc(state.split.meet)}"></label>
      <p class="kicker">Errands</p>
      ${state.errands.map((errand) => `<button type="button" class="item" data-act="errand" data-id="${errand.id}">${errand.done ? "✓" : "○"} ${esc(errand.name)}</button>`).join("")}
      <p class="sub">The other lead's stats stay on their own body. Switch, then set them.</p>
    </div>`;
}

export function renderHousePage(state) {
  const house = state.life.house;
  return `${bar("House")}
    <div class="stack">
      <p>Floorboards hold ${esc(money(state.life.floorboard))}.</p>
      <button type="button" data-act="move-cash" data-id="floor">I moved the pocket under the bed</button>
      <button type="button" data-act="move-cash" data-id="savings">I moved the pocket into savings</button>
      <p class="kicker">Jason's place</p>
      ${[["meditate", "Meditation"], ["paint", "Paint"], ["groceries", "Groceries"], ["flowers", "Flowers"]].map(([id, label]) => `<button type="button" class="${house[id] ? "primary" : "ghost"}" data-act="house-bit" data-id="${id}">${house[id] ? "Done" : "Open"} ${label}</button>`).join("")}
      <p class="sub">These stay on the house while a score is armed.</p>
      <p class="kicker">Keys jobs</p>
      ${state.life.keys.map((job) => `<div class="row">
        <button type="button" class="${job.done ? "primary" : "ghost"}" data-act="key-done" data-id="${esc(job.id)}">${job.done ? "Done" : "Open"} ${esc(job.name)}</button>
        <button type="button" class="ghost" data-act="key-waive" data-id="${esc(job.id)}">${job.waive ? "Waived" : "Waive"}</button>
      </div>`).join("")}
      <label class="field">Job<input id="keyName" placeholder="Keys side job"></label>
      <button type="button" data-act="add-key">Add Keys job</button>
      <p class="kicker">Where you live</p>
      ${[["motel", "Motel"], ["house", "Jason's house"], ["apartment", "Vice City apartment"]].map(([id, label]) => `<div class="row">
        <button type="button" class="${state.life.places[id].have ? "primary" : "ghost"}" data-act="place-have" data-id="${id}">${state.life.places[id].have ? "Have it" : "Not yet"} ${label}</button>
        <label class="field">Cost<input type="number" data-bind="life" data-field="places.${id}.cost" value="${state.life.places[id].cost}"></label>
      </div>`).join("")}
      <p class="sub">${state.life.realEstate ? "Real Estate is installed." : "Vice City Real Estate installs after Daily Driver."} Move-in is ${esc(money(viceGap(state)))} short. Tomorrow money stays out.</p>
      ${missionList(1).find((item) => item.id === "island-dreams") ? `<p class="formula">Do the Keys jobs you care about before the chapter moves you.</p>` : ""}
    </div>`;
}

export function renderClosetPage(state) {
  return `${bar("Closet")}
    <div class="stack">
      <p>${state.life.wearing ? `Wearing ${esc(state.life.wearing)}.` : "Nothing is marked as on you."}</p>
      <p>${state.kit.spareOutfit ? "A spare outfit is in the trunk." : "This car has no spare outfit."}</p>
      ${state.suspect.open && state.suspect.seen.clothes && state.suspect.now.clothes ? `<p class="bad">Change first. The clothes still match the description.</p>` : ""}
      ${state.life.closet.map((outfit) => `<button type="button" class="${state.life.wearing === outfit.name ? "primary" : "ghost"}" data-act="wear" data-id="${esc(outfit.id)}">${esc(outfit.name)}</button>`).join("")}
      <label class="field">Outfit<input id="outfitName" placeholder="Clean jacket"></label>
      <button type="button" data-act="add-closet">Add outfit</button>
      <button type="button" class="${state.kit.spareOutfit ? "primary" : "ghost"}" data-act="kit" data-id="spareOutfit">${state.kit.spareOutfit ? "Spare is in the trunk" : "Put a spare in the trunk"}</button>
      <label class="field">Face<input data-bind="life" data-field="face" value="${esc(state.life.face)}" placeholder="Glasses, hair, the face they wrote down"></label>
      ${state.suspect.seen.face || state.heat.icons.face ? `<p class="formula">The face line is still on the description. ${esc(state.life.face || "Write the change you can make.")}</p>` : ""}
    </div>`;
}

export function renderWorkPage(state) {
  const fence = activeFence(state);
  return `${bar("Work")}
    <div class="stack">
      <p>${fence ? `${esc(fence.name)} is the fence who will buy.` : "No fence is open yet."}</p>
      <button type="button" class="${state.life.dunk ? "primary" : "ghost"}" data-act="dunk">${state.life.dunk ? "You have met Dunk" : "Dunk is still locked"}</button>
      ${bankBlocked(state) ? `<p class="bad">${esc(bankBlocked(state))}</p>` : ""}
      <label class="field">Marked bills<input type="number" data-bind="life" data-field="marked" value="${state.life.marked}"></label>
      <p class="gray">Goods ${esc(money(state.bank.goods))} and tomorrow ${esc(money(state.bank.tomorrow))} cannot be spent.</p>
      <p class="kicker">Small work</p>
      ${state.life.hustles.map((job) => `<button type="button" class="item" data-act="hustle-done" data-id="${esc(job.id)}">${job.done ? "✓" : "○"} ${esc(job.name)} · ${esc(money(job.pay))}</button>`).join("") || `<p class="sub">A clerk, a tow, a delivery. Not a heist.</p>`}
      <label class="field">Job<input id="hustleName" placeholder="Clerk"></label>
      <label class="field">Pay<input id="hustlePay" type="number" value="0"></label>
      <button type="button" data-act="add-hustle">Add it</button>
      <p class="kicker">Price book</p>
      ${state.life.prices.map((price) => `<p>${esc(price.name)} · ${esc(money(price.cost))}</p>`).join("")}
      <label class="field">What<input id="priceName" placeholder="Room, gun, mod"></label>
      <label class="field">Paid<input id="priceCost" type="number" value="0"></label>
      <button type="button" data-act="add-price">Save the price</button>
      <p class="kicker">This week</p>
      <label class="field">Rent<input type="number" data-bind="life" data-field="week.rent" value="${state.life.week.rent}"></label>
      <label class="field">Food<input type="number" data-bind="life" data-field="week.food" value="${state.life.week.food}"></label>
      <label class="field">Ammo<input type="number" data-bind="life" data-field="week.ammo" value="${state.life.week.ammo}"></label>
      <label class="field">Landed<input type="number" data-bind="life" data-field="week.landed" value="${state.life.week.landed}"></label>
      <p>Left this week: ${esc(money(weekNet(state)))}.</p>
    </div>`;
}

export function moneyExtra(state) {
  const book = piles(state);
  const fence = activeFence(state);
  return `<p>Five piles. Pocket ${esc(money(book.pocket))}, goods ${esc(money(book.goods))}, tomorrow ${esc(money(book.tomorrow))}, checking ${esc(money(book.checking))}, savings ${esc(money(book.savings))}.</p>
    <p class="gray">Held for cash bills: ${esc(money(book.reserved))}. Goods and tomorrow stay gray.</p>
    <p>${fence ? `The open fence is ${esc(fence.name)}.` : "No fence is open yet."}</p>
    ${bankBlocked(state) ? `<p class="bad">${esc(bankBlocked(state))}</p>` : ""}
    <label class="field">Marked bills<input type="number" data-bind="life" data-field="marked" value="${state.life.marked}"></label>
    ${bustNag(state) ? `<p class="bad">Three busts have taken the cash. Deposit before you ride again.</p>` : ""}
    <button type="button" data-act="fence-paid">Fence paid me</button>
    <button type="button" data-act="move-cash" data-id="floor">I moved it to the floorboards</button>
    <button type="button" data-act="move-cash" data-id="savings">I moved it to savings</button>`;
}

export { APP_VERSION };
