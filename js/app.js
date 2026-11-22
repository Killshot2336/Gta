import {
  defaultState,
  hydrate,
  loadState,
  practiceState,
  regionName,
  REGIONS,
  saveState,
  uid,
} from "./store.js";
import {
  advise,
  analyzeEvents,
  armBlockers,
  conservativeSlot,
  cutMath,
  FACTS,
  feedback,
  formatDuration,
  formatGameTime,
  fuelMath,
  gameMinutesNow,
  grossForTake,
  learnLine,
  LOOKS,
  medianClear,
  money,
  motorMath,
  nextWindow,
  periodOf,
  recordClear,
  runScore,
  scratch,
  spendable,
} from "./logic.js";
import {
  CHAPTER_NAMES,
  bodyNudge,
  carVerdict,
  currentMission,
  doorOpen,
  focusLine,
  inSearch,
  missionList,
  quitSafe,
  registeredCount,
  repairWorth,
  routeDollar,
  sheetBlock,
  sheetLine,
  SHEET_ROWS,
  switchLanding,
  viceGap,
  chapterTraps,
} from "./ops.js";
import { APP_VERSION, applyWorkout, moveCash, shopArrest } from "./life.js";
import {
  lockScreen,
  moneyExtra,
  renderClosetPage,
  renderGaragePage,
  renderHousePage,
  renderStoryPage,
  renderToday,
  renderUsPage,
  renderWorkPage,
} from "./screens.js";

const APPS = [
  { id: "today", name: "Today", page: 0, dock: true, wash: "#3a2e1c", mark: "Dy" },
  { id: "story", name: "Story", page: 0, dock: true, wash: "#241c14", mark: "1" },
  { id: "garage", name: "Garage", page: 0, dock: true, wash: "#241810", mark: "G" },
  { id: "us", name: "Us", page: 0, dock: true, wash: "#2a221c", mark: "Us" },
  { id: "house", name: "House", page: 0, wash: "#2c2418", mark: "Hm" },
  { id: "closet", name: "Closet", page: 0, wash: "#3a1820", mark: "Cl" },
  { id: "buckme", name: "BuckMe", page: 0, wash: "#2a2414", mark: "$" },
  { id: "work", name: "Work", page: 0, wash: "#242018", mark: "Wk" },
  { id: "map", name: "Map", page: 1, wash: "#142833", mark: "M" },
  { id: "heat", name: "Heat", page: 1, wash: "#3a1614", mark: "★" },
  { id: "sheet", name: "Sheet", page: 1, wash: "#3a1820", mark: "ID" },
  { id: "fitness", name: "Fitness", page: 1, wash: "#18241c", mark: "F" },
  { id: "waink", name: "WAiNK", page: 1, wash: "#1c2430", mark: "Sc" },
  { id: "helper", name: "Helper", page: 1, wash: "#3a2e1c", mark: "AI" },
  { id: "heists", name: "Heists", page: 1, wash: "#2a241c", mark: "H" },
  { id: "street", name: "Street", page: 1, wash: "#242018", mark: "S" },
  { id: "stakeout", name: "Stakeout", page: 2, wash: "#14302c", mark: "St" },
  { id: "tapes", name: "Tapes", page: 2, wash: "#241c18", mark: "T" },
  { id: "calc", name: "Calculator", page: 2, wash: "#1a241c", mark: "=" },
  { id: "contacts", name: "Contacts", page: 2, wash: "#241c22", mark: "@" },
  { id: "news", name: "News", page: 2, wash: "#201818", mark: "N" },
  { id: "settings", name: "Settings", page: 2, wash: "#1c1c1c", mark: "*" },
];

let state = loadState();
let screenScroll = 0;

const phone = document.getElementById("phone");
const screen = document.getElementById("screen");

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function commit(mutator, { scroll = "keep" } = {}) {
  mutator(state);
  saveState(state);
  render(scroll);
}

function render(scroll = "keep") {
  if (scroll === "keep") screenScroll = screen.scrollTop;
  else screenScroll = 0;
  phone.classList.toggle("couch", state.settings.couch);
  document.getElementById("status").innerHTML = statusHtml();
  screen.innerHTML = `${toastHtml()}${bodyHtml()}`;
  document.getElementById("dock").innerHTML = dockHtml();
  screen.scrollTop = screenScroll;
}

function toastHtml() {
  if (!state.toast) return "";
  return `<p class="kicker">${esc(state.toast)}</p>`;
}

function statusHtml() {
  const stars = state.heat.stars ? "★".repeat(state.heat.stars) : "clear";
  const lead = state.settings.lead === "jason" ? "Jason" : "Lucia";
  return `<span data-tick="game">${esc(formatGameTime(gameMinutesNow(state)))}</span><span>${esc(lead)} <span class="stars">${esc(stars)}</span></span>`;
}

function dockHtml() {
  if (state.settings.couch && (state.live || state.heat.stars > 0) && state.nav.name !== "lock") {
    return `
      <button type="button" data-act="open" data-id="heat"><span class="mark">★</span>Heat</button>
      <button type="button" data-act="phase"><span class="mark">+</span>Phase</button>
      <button type="button" data-act="mistake"><span class="mark">!</span>Mistake</button>
      <button type="button" data-act="open" data-id="stakeout"><span class="mark">E</span>Window</button>`;
  }
  return APPS.filter((app) => app.dock)
    .map((app) => `<button type="button" data-act="open" data-id="${app.id}" class="${state.nav.name === app.id ? "on" : ""}"><span class="mark">${esc(app.mark)}</span>${esc(app.name)}</button>`)
    .join("");
}

function go(nav) {
  state.stack = [...state.stack, nav].slice(-24);
  state.nav = nav;
  state.toast = "";
  saveState(state);
  render(0);
}

function back() {
  state.stack.pop();
  state.nav = state.stack[state.stack.length - 1] || { name: "home" };
  if (!state.stack.length) state.stack = [state.nav];
  state.toast = "";
  saveState(state);
  render(0);
}

function openApp(name, extra = {}) {
  if (name === "heists" || name === "street") go({ name: "scores", kind: name === "street" ? "street" : "heist" });
  else if (name === "motor" || name === "garage") go({ name: "garage" });
  else if (name === "leads" || name === "us") go({ name: "us" });
  else go({ name, ...extra });
}

function bodyHtml() {
  const screens = {
    lock: renderLock,
    home: renderHome,
    today: () => renderToday(state),
    garage: () => renderGaragePage(state),
    us: () => renderUsPage(state),
    house: () => renderHousePage(state),
    closet: () => renderClosetPage(state),
    work: () => renderWorkPage(state),
    heat: renderHeat,
    sheet: renderSheet,
    story: () => renderStoryPage(state),
    scores: renderScores,
    score: renderScore,
    clock: renderClock,
    out: renderOut,
    tape: renderTape,
    stakeout: renderStakeout,
    site: renderSite,
    helper: renderHelper,
    map: renderMap,
    leads: renderLeads,
    tapes: renderTapes,
    motor: renderMotor,
    buckme: renderBank,
    waink: renderWaink,
    calc: renderCalc,
    contacts: renderContacts,
    news: renderNews,
    fitness: renderFitness,
    settings: renderSettings,
    bust: renderBust,
  };
  return (screens[state.nav.name] || renderHome)();
}

function bar(title) {
  return `<header class="bar"><button type="button" class="back" data-act="back">Back</button><h1>${esc(title)}</h1></header>`;
}

function adviceCard(prompt, ctx = {}) {
  const advice = advise(state, prompt, ctx);
  return `<section class="advice">
    <span class="tag">Helper</span>
    <p>${esc(advice.text)}</p>
    <p class="basis">${esc(advice.basis)}</p>
    <div class="actions">
      <button type="button" data-act="feedback" data-id="${esc(advice.ruleId)}" data-good="1">Did it</button>
      <button type="button" data-act="feedback" data-id="${esc(advice.ruleId)}" data-good="0">Wrong</button>
    </div>
  </section>`;
}

function renderLock() {
  return lockScreen(state);
}

function renderHome() {
  const page = state.homePage || 0;
  const apps = APPS.filter((app) => app.page === page);
  return `<section class="home">
    <p class="kicker">Phone</p>
    <h1>${["Life", "City", "Tools"][page] || "Phone"}</h1>
    <div class="grid">
      ${apps.map((app) => `<button type="button" class="app" data-act="open" data-id="${app.id}"><span class="blob" style="--wash:${app.wash}">${esc(app.mark)}</span>${esc(app.name)}</button>`).join("")}
    </div>
    <div class="pager">
      ${[0, 1, 2].map((index) => `<button type="button" class="dot ${page === index ? "on" : ""}" data-act="page" data-id="${index}" aria-label="Page ${index + 1}"></button>`).join("")}
    </div>
  </section>`;
}

function renderHeat() {
  const icons = [
    ["camera", "Camera"],
    ["accomplice", "Partner"],
    ["clothes", "Clothes"],
    ["face", "Face"],
    ["weapon", "Weapon"],
    ["vehicle", "Vehicle"],
  ];
  const clear = medianClear(state, state.heat.stars);
  return `${bar("Heat")}
    <div class="stack">
      <div class="row" style="align-items:center">
        <button type="button" class="ghost" data-act="stars" data-id="-1">−</button>
        <div class="heatnum">${state.heat.stars ? "★".repeat(state.heat.stars) : "Clear"}</div>
        <button type="button" class="ghost" data-act="stars" data-id="1">+</button>
      </div>
      <div class="icons">
        ${Object.entries(LOOKS).map(([id, text]) => `<button type="button" class="choice ${state.heat.look === id ? "on" : ""}" data-act="look" data-id="${id}">${esc(id)}<br><span class="sub">${esc(text)}</span></button>`).join("")}
      </div>
      <div class="row">
        <button type="button" class="${state.heat.witnessed ? "danger" : "ghost"}" data-act="flag" data-id="witnessed">${state.heat.witnessed ? "Witnessed" : "No witness"}</button>
        <button type="button" class="${state.heat.alarm ? "danger" : "ghost"}" data-act="flag" data-id="alarm">${state.heat.alarm ? "Alarm" : "No alarm"}</button>
      </div>
      <div class="icons">
        ${icons.map(([id, label]) => `<button type="button" class="${state.heat.icons[id] ? "on" : ""}" data-act="icon" data-id="${id}">${esc(label)}</button>`).join("")}
      </div>
      ${clear ? `<p class="sub">Your ${state.heat.stars}★ chases clear in about ${esc(formatDuration(clear.median))} over ${clear.n} tapes.</p>` : ""}
      ${state.heat.icons.weapon ? `<button type="button" class="primary" data-act="drop-gun">${state.suspect.weaponOwned ? "Drop it. Owned guns return to the trunk." : "Stash it. This gun was never stored."}</button>` : ""}
      ${state.story.scannerRegion ? `<p class="formula">Scanner pinned to ${esc(regionName(state.story.scannerRegion))}.</p>` : ""}
      ${adviceCard("heat")}
      <button type="button" class="danger" data-act="open-bust">Busted</button>
      ${renderBustPreview()}
    </div>`;
}

function renderScores() {
  const kind = state.nav.kind || "heist";
  const title = kind === "heist" ? "Heists" : "Street";
  const rows = state.scores.filter((score) => score.kind === kind);
  return `${bar(title)}
    <div class="stack">
      <button type="button" class="primary" data-act="new-score" data-id="${kind}">New ${kind === "heist" ? "heist" : "score"}</button>
      <div class="list">
        ${rows.length ? rows.map((score) => `<button type="button" class="item" data-act="open-score" data-id="${score.id}"><span>${esc(score.name)}</span><span class="tag">${esc(score.status)}</span></button>`).join("") : `<p class="sub">Nothing filed. A rumor can be a name.</p>`}
      </div>
    </div>`;
}

function scoreById(id) {
  return state.scores.find((score) => score.id === id);
}

function renderScore() {
  const score = scoreById(state.nav.scoreId);
  if (!score) return `${bar("Score")}<p>That file is gone.</p>`;
  const blockers = [...armBlockers(state, score), ...sheetBlock(state)];
  const route = routeOf(score);
  return `${bar(score.kind === "heist" ? "Heist" : "Street")}
    <div class="stack">
      <label class="field">Name<input data-bind="score" data-id="${score.id}" data-field="name" value="${esc(score.name)}"></label>
      <label class="field">Approach<input data-bind="score" data-id="${score.id}" data-field="approach" value="${esc(score.approach)}"></label>
      <div class="split">
        <label class="field">Exit<input data-bind="score" data-id="${score.id}" data-field="exit" value="${esc(score.exit)}"></label>
        <label class="field">Backup<input data-bind="score" data-id="${score.id}" data-field="backup" value="${esc(score.backup)}"></label>
      </div>
      <label class="field">Abort if<input data-bind="score" data-id="${score.id}" data-field="abort" value="${esc(score.abort)}"></label>
      <label class="field">Loadout<input data-bind="score" data-id="${score.id}" data-field="loadout" value="${esc(score.loadout)}"></label>
      <label class="field">Next pins, comma separated<input data-bind="score" data-id="${score.id}" data-field="routeText" value="${esc(score.routeText || "")}"></label>
      <div class="split">
        <label class="field">Scouted
          <select data-bind="score" data-id="${score.id}" data-field="watchedAt">
            ${["any", "day", "night"].map((item) => `<option ${score.watchedAt === item ? "selected" : ""}>${item}</option>`).join("")}
          </select>
        </label>
        <label class="field">Tool
          <select data-bind="score" data-id="${score.id}" data-field="needsTool">
            ${["", "hotwire", "slim-jim", "tracker-kill"].map((item) => `<option value="${item}" ${score.needsTool === item ? "selected" : ""}>${item || "none"}</option>`).join("")}
          </select>
        </label>
      </div>
      <label class="field">Keep the active car
        <input type="checkbox" data-bind="score" data-id="${score.id}" data-field="keepCar" ${score.keepCar ? "checked" : ""}>
      </label>
      ${score.kind === "heist" ? `<label class="field">Needs both leads<input type="checkbox" data-bind="score" data-id="${score.id}" data-field="wantsPartner" ${score.wantsPartner ? "checked" : ""}></label>` : ""}
      <div class="split">
        <label class="field">Gross<input type="number" data-bind="score" data-id="${score.id}" data-field="gross" value="${Number(score.gross) || 0}"></label>
        <label class="field">Fence %<input type="number" data-bind="score" data-id="${score.id}" data-field="fenceRate" value="${Number(score.fenceRate) || 0}"></label>
        <label class="field">Your %<input type="number" data-bind="score" data-id="${score.id}" data-field="yourPct" value="${Number(score.yourPct) || 0}"></label>
      </div>
      <p class="formula">${esc(cutLine(score))}</p>
      ${score.windowsNote ? `<p class="sub">${esc(score.windowsNote)}</p>` : ""}
      ${score.cueShift ? `<p class="sub">Cues fire ${Math.round(score.cueShift)}s earlier than the scout.</p>` : ""}
      ${route.length ? `<p class="sub">Route: ${esc(route.join(" → "))}</p>` : ""}
      ${blockers.length ? `<div class="card"><p class="bad">${blockers.map(esc).join("<br>")}</p><button type="button" class="danger" data-act="arm" data-id="${score.id}" data-force="1">Arm anyway</button></div>` : `<button type="button" class="primary" data-act="arm" data-id="${score.id}">Arm</button>`}
      <div class="row">
        <button type="button" data-act="start-run" data-id="${score.id}" data-rehearsal="0">Start</button>
        <button type="button" data-act="start-run" data-id="${score.id}" data-rehearsal="1">Rehearse</button>
      </div>
      ${adviceCard("can I arm", { scoreId: score.id })}
    </div>`;
}

function cutLine(score) {
  const result = cutMath({
    gross: score.gross,
    fenceMode: "rate",
    fenceRate: score.fenceRate,
    fenceFlat: 0,
    shares: [
      { name: "You", pct: score.yourPct },
      { name: "Rest", pct: Math.max(0, 100 - Number(score.yourPct || 0)) },
    ],
  });
  return `Your take ${money(result.your)} · fence ${money(result.fence)} · left ${money(result.left)}`;
}

function routeOf(score) {
  return String(score?.routeText || "").split(",").map((part) => part.trim()).filter(Boolean);
}

function renderClock() {
  const live = state.live;
  if (!live) return `${bar("Clock")}<p class="sub">No run is open.</p>`;
  const score = scoreById(live.scoreId);
  const phases = score?.phases || ["Go"];
  const phase = phases[live.phaseIndex] || "Done";
  const route = routeOf(score);
  const pin = route[live.routeAt] || "";
  const elapsed = (Date.now() - live.startedAt) / 1000;
  return `${bar(live.rehearsal ? "Rehearsal" : "Run")}
    <div class="stack">
      <div class="clock" data-tick="live" data-start="${live.startedAt}">${esc(formatDuration(elapsed))}</div>
      <p class="kicker">${esc(phase)} · ${esc(score?.name || "Score")}</p>
      ${pin ? `<button type="button" class="primary giant" data-act="next-pin">${esc(pin)}</button>` : `<p class="sub">Add next pins on the file if you want the couch prompt.</p>`}
      ${score?.cueShift ? `<p class="sub">Cues are ${Math.round(score.cueShift)}s early.</p>` : ""}
      <div class="row">
        <button type="button" class="primary" data-act="phase">Next phase</button>
        <button type="button" data-act="mistake">Mistake</button>
        <button type="button" data-act="loot">Loot</button>
      </div>
      <p class="sub">${live.mistakes} mistakes · ${live.loot} loot · peak ${live.peakStars}★</p>
      <label class="field">Actual take<input id="actualTake" type="number" value="${Number(score?.gross) || 0}"></label>
      <button type="button" class="danger" data-act="finish">Finish</button>
    </div>`;
}

function renderOut() {
  const pending = state.pendingOut;
  if (!pending) return `${bar("Out")}<p>Nothing to close.</p>`;
  return `${bar("You're out")}
    <div class="stack">
      <p class="sub">One minute. Tap what you actually did.</p>
      ${pending.rows.map((row) => `<button type="button" class="item" data-act="out-row" data-id="${row.id}">${row.done ? "✓" : "○"} ${esc(row.label)}</button>`).join("")}
      <button type="button" class="primary" data-act="out-done">Debrief</button>
    </div>`;
}

function renderTape() {
  const tape = state.tapes.find((item) => item.id === state.nav.tapeId);
  if (!tape) return `${bar("Tape")}<p>That tape is gone.</p>`;
  const scored = runScore({
    take: tape.take,
    seconds: tape.seconds,
    stars: tape.stars,
    mistakes: tape.mistakes,
    starWeight: state.calc.starWeight,
    missWeight: state.calc.missWeight,
  });
  return `${bar(tape.rehearsal ? "Rehearsal tape" : "Tape")}
    <div class="stack">
      <p class="kicker">${tape.clean ? "CLEAN" : tape.stars >= 6 ? "BUSTED HEAT" : "DIRTY"}</p>
      <h2 class="clock">${esc(formatDuration(tape.seconds))}</h2>
      <p>${esc(tape.name)}</p>
      <p class="formula">${esc(money(tape.take))} · ${esc(money(scored.perMin))}/min · score ${esc(money(scored.score))}</p>
      <p class="basis">score = per minute ÷ (1 + stars × ${state.calc.starWeight} + mistakes × ${state.calc.missWeight})</p>
      <p class="sub">Peak ${tape.stars}★ · ${tape.mistakes} mistakes · ${tape.loot} loot</p>
      ${tape.late > 1 ? `<button type="button" class="primary" data-act="shift" data-id="${tape.id}">Shift the beat ${Math.round(tape.late)}s earlier</button>` : ""}
      ${tape.late < -1 ? `<p class="good">Early by ${esc(formatDuration(Math.abs(tape.late)))} against your best.</p>` : ""}
    </div>`;
}

function renderTapes() {
  return `${bar("Tapes")}
    <div class="list">
      ${state.tapes.length ? [...state.tapes].reverse().map((tape) => `<button type="button" class="item" data-act="open-tape" data-id="${tape.id}"><span>${esc(tape.name)}</span><span class="tag">${tape.rehearsal ? "rehearsal" : formatDuration(tape.seconds)}</span></button>`).join("") : `<p class="sub">Finish a run and the tape lands here.</p>`}
    </div>`;
}

function renderStakeout() {
  return `${bar("Stakeout")}
    <div class="stack">
      <button type="button" class="primary" data-act="new-site">New site</button>
      <div class="list">
        ${state.sites.length ? state.sites.map((site) => `<button type="button" class="item" data-act="open-site" data-id="${site.id}"><span>${esc(site.name)}</span><span class="tag">${esc(regionName(site.region))}</span></button>`).join("") : `<p class="sub">Watch a place. Name the guard. Stamp them every time they pass.</p>`}
      </div>
    </div>`;
}

function renderSite() {
  const site = state.sites.find((item) => item.id === state.nav.siteId);
  if (!site) return `${bar("Site")}<p>That site is gone.</p>`;
  const cycles = analyzeEvents(site.events || []);
  const slot = conservativeSlot(cycles);
  return `${bar(site.name)}
    <div class="stack">
      <label class="field">Name<input data-bind="site" data-id="${site.id}" data-field="name" value="${esc(site.name)}"></label>
      <p class="sub">${esc(regionName(site.region))} · ${esc(periodOf(gameMinutesNow(state)))}</p>
      <p class="formula" data-tick="window" data-site="${site.id}">${esc(windowLine(site))}</p>
      ${slot ? `<p class="basis">${esc(slot.basis)}</p>` : ""}
      <label class="field">Who or what<input id="stampLabel" value="east door"></label>
      <label class="field">Seconds they block it<input id="stampBlocked" type="number" value="8"></label>
      <div class="icons">
        ${["guard", "camera", "arrival", "door", "abort", "note"].map((kind) => `<button type="button" data-act="stamp" data-id="${kind}">${kind}</button>`).join("")}
      </div>
      <div class="row">
        <button type="button" data-act="mood" data-id="empty">Hour was empty</button>
        <button type="button" data-act="mood" data-id="busy">Hour was busy</button>
      </div>
      <div class="list">
        ${cycles.map((cycle) => `<div class="card"><strong>${esc(cycle.label)}</strong><p class="sub">${cycle.status} · ${cycle.n} stamps${cycle.cycle ? ` · every ${cycle.cycle}s · open ${cycle.open}s` : ""}</p></div>`).join("")}
      </div>
      <label class="field">Send the window to
        <select id="windowTarget">
          <option value="">Choose a score</option>
          ${state.scores.map((score) => `<option value="${score.id}">${esc(score.name)}</option>`).join("")}
        </select>
      </label>
      <button type="button" data-act="send-window" data-id="${site.id}">Freeze it onto that score</button>
      ${adviceCard("window", { siteId: site.id })}
    </div>`;
}

function windowLine(site) {
  const cycles = analyzeEvents(site.events || []);
  const slot = conservativeSlot(cycles);
  if (!slot) return "No trusted window yet.";
  const cycle = cycles.find((item) => item.label === slot.label);
  const nowT = site.visitStart ? (Date.now() - site.visitStart) / 1000 : cycle.lastT;
  const upcoming = nextWindow(cycle, nowT);
  if (!upcoming) return `${slot.label} opens for ${slot.open}s.`;
  if (upcoming.state === "open") return `${slot.label} is open for ${formatDuration(upcoming.open)}.`;
  if (upcoming.state === "blocked") return `${slot.label} is blocked for ${formatDuration(upcoming.wait)}.`;
  return `${slot.label} clear in ${formatDuration(upcoming.wait)} for ${slot.open}s.`;
}

function renderHelper() {
  const tab = state.helperTab || "talk";
  return `${bar("Helper")}
    <div class="tabs">
      ${["talk", "learned", "book"].map((id) => `<button type="button" class="${tab === id ? "on" : ""}" data-act="helper-tab" data-id="${id}">${id}</button>`).join("")}
    </div>
    ${tab === "talk" ? helperTalk() : tab === "learned" ? helperLearned() : helperBook()}`;
}

function helperTalk() {
  const chips = ["What now", "Why", "Can I arm", "My take", "Window", "Where", "What have you learned"];
  const messages = state.helper.length
    ? state.helper
    : [{ role: "helper", text: "I learn from your thumbs and your tapes. I only speak from the Leonida book and what you stamp. Ask what to do.", basis: "On this phone. No signal required.", ruleId: "intro" }];
  return `<div class="stack">
    <div class="stack" id="thread">
      ${messages.map((msg) => {
    const teachable = msg.role === "helper" && msg.ruleId && !["practice", "intro", "learn-status", "none"].includes(msg.ruleId);
    return `<div class="msg ${msg.role === "you" ? "you" : ""}"><div class="bubble">${esc(msg.text)}${msg.basis ? `<p class="basis">${esc(msg.basis)}</p>` : ""}${teachable ? `<div class="actions"><button type="button" data-act="feedback" data-id="${esc(msg.ruleId)}" data-good="1">Did it</button><button type="button" data-act="feedback" data-id="${esc(msg.ruleId)}" data-good="0">Wrong</button></div>` : ""}</div></div>`;
  }).join("")}
    </div>
    <div class="chips">
      ${chips.map((chip) => `<button type="button" data-act="ask" data-id="${esc(chip)}">${esc(chip)}</button>`).join("")}
    </div>
    <label class="field">Ask<input id="ask" placeholder="What now"></label>
    <button type="button" class="primary" data-act="ask-input">Send</button>
  </div>`;
}

function helperLearned() {
  const lines = learnLine(state);
  const rules = Object.entries(state.learning.rules);
  return `<div class="stack">
    ${lines.length ? lines.map((line) => `<p>${esc(line)}</p>`).join("") : `<p class="sub">Nothing learned yet. Tell me Did it or Wrong on a suggestion.</p>`}
    ${rules.map(([id, row]) => `<div class="card"><strong>${esc(id)}</strong><p class="sub">kept ${row.up} · missed ${row.down}${row.muted ? " · muted" : ""}</p>${row.muted ? `<button type="button" data-act="unmute" data-id="${esc(id)}">Say it again</button>` : ""}</div>`).join("")}
  </div>`;
}

function helperBook() {
  return `<div class="list">${FACTS.map((fact) => `<article class="card"><span class="tag">${esc(fact.status)}</span><p>${esc(fact.text)}</p><p class="basis">${esc(fact.source)}</p></article>`).join("")}</div>`;
}

function renderMap() {
  const herePins = state.pins.filter((pin) => pin.region === state.here);
  return `${bar("Map")}
    <div class="mapwrap">
      ${mapSvg()}
      <p class="kicker">${esc(regionName(state.here))}</p>
      <p class="sub">${esc(REGIONS.find((region) => region.id === state.here)?.blurb || "")}</p>
      ${adviceCard("where")}
      ${state.here === "goose-key" ? `<button type="button" class="${state.settings.gooseConfirmed ? "primary" : "ghost"}" data-act="goose">${state.settings.gooseConfirmed ? "Goose Key confirmed" : "I have seen the jets"}</button>` : ""}
      <div class="list">
        ${herePins.map((pin) => `<div class="card"><strong>${esc(pin.name)}</strong><p class="sub">${esc(pin.kind)}${pin.note ? ` · ${esc(pin.note)}` : ""}</p></div>`).join("") || `<p class="sub">No pins here yet.</p>`}
      </div>
      <label class="field">Pin name<input id="pinName" placeholder="Watson garage"></label>
      <label class="field">Kind
        <select id="pinKind">
          ${["stash", "gas", "atm", "shop", "fence", "meet", "wake", "hot"].map((kind) => `<option>${kind}</option>`).join("")}
        </select>
      </label>
      <label class="field">Note<input id="pinNote" placeholder="4 min if the block is cool"></label>
      <button type="button" data-act="add-pin">Drop pin on ${esc(regionName(state.here))}</button>
    </div>`;
}

function mapSvg() {
  const shapes = [
    ["mount-kalaga", "M118,28 L196,24 L214,96 L108,102 Z"],
    ["ambrosia", "M108,102 L214,96 L206,178 L112,184 Z"],
    ["port-gellhorn", "M46,132 L112,150 L112,184 L100,228 L40,206 Z"],
    ["grassrivers", "M112,184 L206,178 L192,262 L104,268 L100,228 Z"],
    ["vice-city", "M206,110 L268,124 L276,214 L206,206 L206,178 Z"],
    ["keys", "M150,286 L196,280 L188,308 L142,312 Z"],
  ];
  const hot = new Set(state.pins.filter((pin) => pin.kind === "hot" && pin.until > Date.now()).map((pin) => pin.region));
  const paths = shapes.map(([id, d]) => {
    const on = state.here === id;
    return `<path data-act="here" data-id="${id}" d="${d}" fill="${on ? "#e7b15a" : "#d9c7ae"}" stroke="${hot.has(id) ? "#ff4d3a" : "#10242c"}" stroke-width="${hot.has(id) ? 4 : 2}"></path>`;
  }).join("");
  const gooseOn = state.here === "goose-key";
  return `<svg class="leonida" viewBox="0 0 320 360" role="img" aria-label="Leonida">
    <rect width="320" height="360" fill="#10242c"></rect>
    ${paths}
    <circle data-act="here" data-id="goose-key" cx="118" cy="318" r="14" fill="${gooseOn ? "#e7b15a" : "#9fd4ff"}" stroke="#10242c"></circle>
    <text x="156" y="70" text-anchor="middle">Kalaga</text>
    <text x="160" y="148" text-anchor="middle">Ambrosia</text>
    <text x="78" y="186" text-anchor="middle">Gellhorn</text>
    <text x="150" y="230" text-anchor="middle">Grassrivers</text>
    <text x="236" y="168" text-anchor="middle">Vice</text>
    <text x="168" y="302" text-anchor="middle">Keys</text>
    <text class="water" x="118" y="348" text-anchor="middle">Goose</text>
  </svg>`;
}

function renderSheet() {
  const row = (key, label, group) => `<button type="button" class="${state.suspect[group][key] ? "primary" : "ghost"}" data-act="sheet-bit" data-id="${group}:${key}">${state.suspect[group][key] ? "On" : "Off"} ${esc(label)}</button>`;
  return `${bar("Suspect sheet")}
    <div class="stack">
      <p>${esc(sheetLine(state))}</p>
      ${inSearch(state) ? `<p class="bad">You walked back into ${esc(regionName(state.suspect.searchRegion))} and you still match.</p>` : ""}
      <p class="kicker">What they wrote down</p>
      <div class="chips">${SHEET_ROWS.map((item) => row(item.id, item.label, "seen")).join("")}</div>
      <p class="kicker">What you look like now</p>
      <div class="chips">${SHEET_ROWS.map((item) => row(item.id, item.label, "now")).join("")}</div>
      <button type="button" class="primary" data-act="saw-me">They saw me like this</button>
      <button type="button" data-act="sheet-clear">Description broken</button>
      <button type="button" class="${state.suspect.weaponOwned ? "primary" : "ghost"}" data-act="weapon-owned">${state.suspect.weaponOwned ? "This gun is owned" : "This gun was stolen"}</button>
      <p class="kicker">Trunk</p>
      <button type="button" class="${state.kit.spareOutfit ? "primary" : "ghost"}" data-act="kit" data-id="spareOutfit">${state.kit.spareOutfit ? "Spare outfit in the trunk" : "No spare outfit"}</button>
      <button type="button" class="${state.kit.uniqueOnBack ? "primary" : "ghost"}" data-act="kit" data-id="uniqueOnBack">${state.kit.uniqueOnBack ? "Unique gun is on your back" : "Unique guns are in the trunk"}</button>
      <button type="button" class="${state.kit.goodsOnYou ? "primary" : "ghost"}" data-act="kit" data-id="goodsOnYou">${state.kit.goodsOnYou ? "Goods are on you" : "Goods are sold"}</button>
      <p class="sub">${state.suspect.searchRegion ? `Search area: ${esc(regionName(state.suspect.searchRegion))}` : "When the stars drop, this region becomes the search area until every row breaks."}</p>
    </div>`;
}

function renderStory() {
  const chapter = state.story.chapter || 1;
  const mission = currentMission(state);
  const traps = chapterTraps(state);
  const open = doorOpen(state);
  return `${bar(CHAPTER_NAMES[chapter] || "Story")}
    <div class="stack">
      <div class="row">
        ${[1, 2, 3, 4, 5].map((number) => `<button type="button" class="${chapter === number ? "primary" : "ghost"}" data-act="chapter" data-id="${number}">${number}</button>`).join("")}
      </div>
      <p class="sub">${esc(CHAPTER_NAMES[chapter] || "")}</p>
      ${missionList(chapter).map((item) => `<button type="button" class="item" data-act="mission" data-id="${item.id}">${state.story.missionId === item.id ? "●" : "○"} ${esc(item.name)}</button>`).join("")}
      ${mission ? `<article class="card"><strong>${esc(mission.name)}</strong><p>${esc(mission.line)}</p>${(mission.buttons || []).map((button) => `<p class="formula">${esc(button)}</p>`).join("")}</article>` : ""}
      <button type="button" class="${state.story.inMission ? "primary" : "ghost"}" data-act="in-mission">${state.story.inMission ? "Inside the mission" : "Between missions"}</button>
      <p class="kicker">Before the next chapter</p>
      ${traps.map((trap) => `<div class="row">
        <button type="button" class="${trap.done || state.story.waived[trap.id] ? "primary" : "ghost"}" data-act="trap" data-id="${trap.id}">${trap.done ? "Done" : state.story.waived[trap.id] ? "Waived" : "Still"} ${esc(trap.label)}</button>
        ${trap.done ? "" : `<button type="button" class="ghost" data-act="waive" data-id="${trap.id}">Waive</button>`}
      </div>`).join("")}
      <button type="button" class="primary" data-act="next-chapter" ${open && chapter < 5 ? "" : "disabled"}>${open ? "Open the next chapter" : "The door stays shut"}</button>
      <label class="field">Scanner district
        <select data-bind="story" data-field="scannerRegion">
          <option value="">None</option>
          ${REGIONS.map((region) => `<option value="${region.id}" ${state.story.scannerRegion === region.id ? "selected" : ""}>${esc(region.name)}</option>`).join("")}
        </select>
      </label>
    </div>`;
}

function renderBustPreview() {
  const car = state.vehicles.find((item) => item.id === state.activeVehicleId);
  const lines = [
    `Pocket ${money(state.bank.pocket || state.bank.cash)} dies if you are wasted or busted.`,
    `Checking ${money(state.bank.checking)} and savings ${money(state.bank.family)} stay.`,
    state.bank.goods ? `Goods ${money(state.bank.goods)} are not spendable until a fence buys them.` : "No goods on the book.",
    car?.registered ? `${car.name} is registered. It can be delivered.` : car ? `${car.name} is not registered.` : "No active car.",
  ];
  return `<article class="card">${lines.map((line) => `<p>${esc(line)}</p>`).join("")}</article>`;
}

function renderLeads() {
  const levels = ["professional", "hardened", "violent", "psycho", "irredeemable"];
  const bond = state.settings.relationship < 25 ? "Distant" : state.settings.relationship < 50 ? "Warming" : state.settings.relationship < 75 ? "Close" : "Locked in";
  return `${bar("Leads")}
    <div class="stack">
      <div class="row">
        <button type="button" class="${state.settings.lead === "jason" ? "primary" : "ghost"}" data-act="lead" data-id="jason">Jason</button>
        <button type="button" class="${state.settings.lead === "lucia" ? "primary" : "ghost"}" data-act="lead" data-id="lucia">Lucia</button>
      </div>
      <p class="formula">${esc(switchLanding(state, state.settings.lead === "jason" ? "lucia" : "jason"))}</p>
      <label class="field">Jason was last at<input data-bind="where" data-id="jason" value="${esc(state.where.jason)}"></label>
      <label class="field">Lucia was last at<input data-bind="where" data-id="lucia" value="${esc(state.where.lucia)}"></label>
      <label class="field">Standing
        <select data-bind="setting" data-field="standing">
          ${levels.map((level) => `<option ${state.settings.standing === level ? "selected" : ""}>${level}</option>`).join("")}
        </select>
      </label>
      <p class="sub">Both start at Hardened. Irredeemable stays once you confirm it.</p>
      ${state.irredeemableLocked ? `<p class="bad">Irredeemable is locked.</p>` : `<button type="button" class="danger" data-act="lock-ruin">Confirm Irredeemable. It does not come off.</button>`}
      <label class="field">Relationship ${state.settings.relationship} · ${bond}
        <input type="range" min="0" max="100" data-bind="setting" data-field="relationship" data-type="number" value="${state.settings.relationship}">
      </label>
      <p class="kicker">Split card</p>
      <label class="field">Jason's exit<input data-bind="split" data-field="jason" value="${esc(state.split.jason)}"></label>
      <label class="field">Lucia's exit<input data-bind="split" data-field="lucia" value="${esc(state.split.lucia)}"></label>
      <label class="field">Meet<input data-bind="split" data-field="meet" value="${esc(state.split.meet)}"></label>
      <div class="list">${state.errands.map((errand) => `<button type="button" class="item" data-act="errand" data-id="${errand.id}">${errand.done ? "✓" : "○"} ${esc(errand.name)}</button>`).join("")}</div>
    </div>`;
}

function renderMotor() {
  return `${bar("Motor")}
    <div class="stack">
      <p class="sub">Garage slots ${registeredCount(state)} / ${state.garageSlots}</p>
      <label class="field">Slots you own<input type="number" min="0" data-bind="slots" value="${state.garageSlots}"></label>
      ${state.vehicles.map((car) => {
        const math = motorMath(car);
        const verdict = carVerdict(car, registeredCount(state), state.garageSlots);
        const worth = repairWorth(car);
        return `<article class="card">
          <strong>${esc(car.name)}</strong>
          <p class="bigresult">${esc(verdict.word)}</p>
          <p class="basis">${esc(verdict.why)}</p>
          <p class="sub">${esc(car.kind)} · tracker ${esc(car.tracker)} · fuel ${Math.round((car.fuel || 0) * 100)}%</p>
          <p class="formula">Keep costs ${esc(money(math.keep))}. Fencing pays ${esc(money(math.walk))}.</p>
          ${worth == null ? "" : `<p>${worth ? "Repair is worth it." : "Skip the repair."}</p>`}
          <label class="field">Condition bonus<input type="number" data-bind="car" data-id="${car.id}" data-field="conditionBonus" value="${car.conditionBonus || 0}"></label>
          <button type="button" class="${car.registered ? "primary" : "ghost"}" data-act="register-car" data-id="${car.id}">${car.registered ? "Registered" : "Not registered"}</button>
          <button type="button" class="${state.activeVehicleId === car.id ? "primary" : "ghost"}" data-act="active-car" data-id="${car.id}">${state.activeVehicleId === car.id ? "Active" : "Make active"}</button>
        </article>`;
      }).join("") || `<p class="sub">Scan a car in WAiNK and it lands here.</p>`}
      <p class="kicker">Tools you own</p>
      <div class="chips">
        ${["hotwire", "slim-jim", "tracker-kill"].map((tool) => `<button type="button" class="${state.tools.includes(tool) ? "primary" : "ghost"}" data-act="tool" data-id="${tool}">${tool}</button>`).join("")}
      </div>
      <p class="kicker">Looks</p>
      ${state.looks.map((look) => `<p>${esc(look.name)} · ${esc(look.note || "")}</p>`).join("")}
      <label class="field">Look name<input id="lookName" placeholder="Clean"></label>
      <label class="field">What changes<input id="lookNote" placeholder="Hat, glasses, other jacket"></label>
      <button type="button" data-act="add-look">Save look</button>
    </div>`;
}

function renderBank() {
  const safe = quitSafe(state);
  return `${bar("BuckMe")}
    <div class="stack">
      <p class="${safe.ok ? "good" : "bad"}">${safe.ok ? "Quit-safe" : safe.reasons[0]}</p>
      <p class="bigresult">${esc(money(viceGap(state)))} short of Vice City</p>
      <p class="basis">Vice City counts checking and savings. Pocket and tomorrow money stay out until they land.</p>
      ${moneyExtra(state)}
      <label class="field">Amount<input id="pileAmount" type="number" value="0"></label>
      <div class="chips">
        <button type="button" data-act="route" data-id="pocket">Pocket</button>
        <button type="button" data-act="route" data-id="goods">Goods</button>
        <button type="button" data-act="route" data-id="checking">Checking</button>
        <button type="button" data-act="route" data-id="savings">Savings</button>
        <button type="button" data-act="route" data-id="tomorrow">Tomorrow</button>
      </div>
      <label class="field">Pocket<input type="number" data-bind="bank" data-field="pocket" value="${state.bank.pocket}"></label>
      <label class="field">Goods<input type="number" data-bind="bank" data-field="goods" value="${state.bank.goods}"></label>
      <label class="field">Tomorrow<input type="number" data-bind="bank" data-field="tomorrow" value="${state.bank.tomorrow}"></label>
      <label class="field">Checking<input type="number" data-bind="bank" data-field="checking" value="${state.bank.checking}"></label>
      <label class="field">Family savings<input type="number" data-bind="bank" data-field="family" value="${state.bank.family}"></label>
      <label class="field">Checking cap<input type="number" data-bind="bank" data-field="checkingCap" value="${state.bank.checkingCap}"></label>
      <label class="field">Savings goal<input type="number" data-bind="bank" data-field="savingsGoal" value="${state.bank.savingsGoal}"></label>
      <label class="field">Vice City fund<input type="number" data-bind="bank" data-field="viceGoal" value="${state.bank.viceGoal}"></label>
      <label class="field">Pocket you keep for cash bills<input type="number" data-bind="bank" data-field="pocketKeep" value="${state.bank.pocketKeep}"></label>
      <button type="button" data-act="land-tomorrow">Tomorrow money landed</button>
      ${renderBustPreview()}
    </div>`;
}

function renderWaink() {
  return `${bar("WAiNK")}
    <div class="stack">
      <p class="sub">Type what the scan just showed. The phone cannot see the car.</p>
      <label class="field">Name<input id="carName" placeholder="Green Sultan"></label>
      <label class="field">Kind
        <select id="carKind"><option>car</option><option>bike</option><option>boat</option><option>plane</option></select>
      </label>
      <label class="field">Lock
        <select id="carLock"><option value="older">older, hotwire</option><option value="keyless">keyless</option></select>
      </label>
      <label class="field">Tracker
        <select id="carTracker"><option value="clear">clear</option><option value="live">live</option></select>
      </label>
      <label class="field">Register cost<input id="carRegister" type="number" value="0"></label>
      <label class="field">Repair<input id="carRepair" type="number" value="0"></label>
      <label class="field">Fence payout<input id="carFence" type="number" value="0"></label>
      <label class="field">Condition bonus<input id="carBonus" type="number" value="0"></label>
      <label class="field">Tracker cost<input id="carTrackerCost" type="number" value="0"></label>
      <label class="field">Fuel %<input id="carFuel" type="number" value="80"></label>
      <button type="button" class="primary" data-act="save-car">Save scan</button>
    </div>`;
}

function renderCalc() {
  const tabs = ["scratch", "cut", "window", "clock", "heat", "motor", "bank", "fuel"];
  return `${bar("Calculator")}
    <div class="tabs">
      ${tabs.map((tab) => `<button type="button" class="${state.calcTab === tab ? "on" : ""}" data-act="calc-tab" data-id="${tab}">${tab}</button>`).join("")}
    </div>
    <div class="stack" data-calcpane>${calcPane()}</div>`;
}

function calcPane() {
  const tab = state.calcTab;
  if (tab === "scratch") {
    const result = scratch(state.calc.expr);
    return `<label class="field">Expression<input data-bind="calc" data-field="expr" value="${esc(state.calc.expr)}" placeholder="(2+3)*4"></label>
      <p class="bigresult">${result.error ? esc(result.error) : esc(String(Math.round(result.value * 100) / 100))}</p>
      <p class="basis">+ − × ÷ and %. 200*10% is 20.</p>`;
  }
  if (tab === "cut") {
    const result = cutMath(state.calc);
    const gross = grossForTake(result.your, state.calc.fenceRate, result.yourPct);
    return `<label class="field">Gross<input type="number" data-bind="calc" data-field="gross" value="${state.calc.gross}"></label>
      <label class="field">Fence %<input type="number" data-bind="calc" data-field="fenceRate" value="${state.calc.fenceRate}"></label>
      ${state.calc.shares.map((share, index) => `<div class="split"><label class="field">Name<input data-bind="share" data-index="${index}" data-field="name" value="${esc(share.name)}"></label><label class="field">%<input type="number" data-bind="share" data-index="${index}" data-field="pct" value="${share.pct}"></label></div>`).join("")}
      <button type="button" data-act="add-share">Add share</button>
      <p class="bigresult">${esc(money(result.your))}</p>
      <p class="formula">fence ${esc(money(result.fence))} · left ${esc(money(result.left))} · unassigned ${result.unassigned}%</p>
      <p class="basis">${gross ? `To clear this take, gross has to be about ${esc(money(gross))} at this fence and your share.` : ""}</p>`;
  }
  if (tab === "window") {
    const site = state.sites[state.sites.length - 1];
    if (!site) return `<p class="sub">Stamp a stakeout and the window math shows up here.</p>`;
    const cycles = analyzeEvents(site.events || []);
    const slot = conservativeSlot(cycles);
    return `<p>${esc(site.name)}</p>${cycles.map((cycle) => `<p class="formula">${esc(cycle.label)} · ${cycle.status} · open ${cycle.open}s · every ${cycle.cycle}s</p>`).join("")}
      <p class="basis">${slot ? esc(slot.basis) : "Need three tight sightings."}</p>`;
  }
  if (tab === "clock") {
    const tape = state.tapes[state.tapes.length - 1];
    if (!tape) return `<p class="sub">Finish a run to score it.</p>`;
    const scored = runScore({ take: tape.take, seconds: tape.seconds, stars: tape.stars, mistakes: tape.mistakes, starWeight: state.calc.starWeight, missWeight: state.calc.missWeight });
    return `<p class="bigresult">${esc(money(scored.score))}</p>
      <p class="formula">${esc(money(scored.perMin))} per minute ÷ ${scored.penalty.toFixed(2)}</p>
      <label class="field">Star weight<input type="number" step="0.05" data-bind="calc" data-field="starWeight" value="${state.calc.starWeight}"></label>
      <label class="field">Mistake weight<input type="number" step="0.05" data-bind="calc" data-field="missWeight" value="${state.calc.missWeight}"></label>`;
  }
  if (tab === "heat") {
    const rows = [1, 2, 3, 4, 5, 6].map((stars) => {
      const row = medianClear(state, stars);
      return `<p>${stars}★ ${row ? `${formatDuration(row.median)} over ${row.n}` : "need 3 tapes"}</p>`;
    }).join("");
    return rows;
  }
  if (tab === "motor") {
    const car = state.vehicles.find((item) => item.id === state.activeVehicleId);
    if (!car) return `<p class="sub">No active car.</p>`;
    const math = motorMath(car);
    const verdict = carVerdict(car, registeredCount(state), state.garageSlots);
    return `<p>${esc(car.name)}</p><p class="bigresult">${esc(verdict.word)}</p><p class="basis">${esc(verdict.why)}</p><p class="formula">Keep costs ${esc(money(math.keep))}.</p><p class="formula">Fencing pays ${esc(money(math.walk))}.</p>`;
  }
  if (tab === "bank") {
    return `<p class="bigresult">${esc(money(spendable(state)))}</p><p class="basis">cash + checking. Family savings ${esc(money(state.bank.family))} is locked.</p>`;
  }
  const fuel = fuelMath({ distance: state.calc.fuelDistance, fraction: state.calc.fuelFraction, trip: state.calc.trip });
  return `<label class="field">Distance you drove<input type="number" data-bind="calc" data-field="fuelDistance" value="${state.calc.fuelDistance}"></label>
    <label class="field">Tank fraction used<input type="number" step="0.05" data-bind="calc" data-field="fuelFraction" value="${state.calc.fuelFraction}"></label>
    <label class="field">Trip distance<input type="number" data-bind="calc" data-field="trip" value="${state.calc.trip}"></label>
    <p class="formula">${fuel.range ? `A full tank is about ${fuel.range.toFixed(1)} of those distance units. This trip wants ${(fuel.need * 100).toFixed(0)}% of a tank.` : "Enter a distance and the fraction it burned."}</p>`;
}

function renderContacts() {
  return `${bar("Contacts")}
    <div class="stack">
      <label class="field">Name<input id="contactName"></label>
      <label class="field">Note<input id="contactNote" placeholder="Picks up. Wants a driver."></label>
      <button type="button" data-act="add-contact">Save</button>
      <div class="list">${state.contacts.map((contact) => `<article class="card"><strong>${esc(contact.name)}</strong><p class="sub">${esc(contact.note)}</p></article>`).join("")}</div>
    </div>`;
}

function renderNews() {
  return `${bar("News")}
    <div class="stack">
      <label class="field">Headline<input id="headline" placeholder="Robbery on the strip"></label>
      <button type="button" data-act="add-headline">Log it and heat this block for 20 min</button>
      <div class="list">${[...state.headlines].reverse().map((item) => `<article class="card"><p>${esc(item.text)}</p><p class="sub">${esc(regionName(item.region))}</p></article>`).join("")}</div>
    </div>`;
}

function renderFitness() {
  const lead = state.settings.lead || "lucia";
  const body = state.bodies[lead];
  const name = lead === "jason" ? "Jason" : "Lucia";
  const nudge = bodyNudge(state);
  return `${bar("Fitness")}
    <div class="stack">
      <p>${esc(name)}</p>
      <p>${esc(focusLine(state))}</p>
      ${nudge ? `<p class="formula">${esc(nudge)}</p>` : ""}
      ${["strength", "cardio", "focus"].map((key) => `<label class="field">${key} ${body[key]}/4<input type="range" min="1" max="4" step="1" data-bind="body" data-id="${lead}" data-field="${key}" data-type="number" value="${body[key]}"></label>`).join("")}
      <button type="button" class="${body.windowOpen ? "primary" : "ghost"}" data-act="window" data-id="${lead}">${body.windowOpen ? "Workout window is open" : "Window is shut"}</button>
      <label class="field">Meter
        <select data-bind="body" data-id="${lead}" data-field="meter">
          <option value="full" ${body.meter === "full" ? "selected" : ""}>Full</option>
          <option value="low" ${body.meter === "low" ? "selected" : ""}>Low</option>
        </select>
      </label>
      <p class="sub">Focus out of 4 is the stat. The meter is what slow motion spends. A gym visit with the other lead trains both.</p>
    </div>`;
}

function renderSettings() {
  const minutes = gameMinutesNow(state);
  const timeValue = minutes == null ? "" : `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(Math.floor(minutes % 60)).padStart(2, "0")}`;
  return `${bar("Settings")}
    <div class="stack">
      <p class="sub">Leonida ${esc(APP_VERSION)}. Hard-refresh if the dock still shows Heat and Heists.</p>
      ${toggle("couch", "Couch mode")}
      ${toggle("buzz", "Buzz")}
      ${toggle("sound", "Click")}
      ${toggle("endingMatters", "The ending matters")}
      <label class="field">Home region
        <select data-bind="setting" data-field="home">
          ${REGIONS.map((region) => `<option value="${region.id}" ${state.settings.home === region.id ? "selected" : ""}>${esc(region.name)}</option>`).join("")}
        </select>
      </label>
      <label class="field">In-game time<input id="gameTime" type="time" value="${timeValue}"></label>
      <button type="button" data-act="set-time">Set that time</button>
      <button type="button" data-act="measure" data-id="${state.game.measureStart ? "end" : "start"}">${state.game.measureStart ? "That was one full in-game day" : "Start measuring a full day"}</button>
      <p class="sub">${state.game.ratio ? "The clock is running at the day you measured." : "The clock stays where you set it until you measure a full day."}</p>
      <button type="button" data-act="practice">Load a practice chase</button>
      <button type="button" data-act="export">Export dossier</button>
      <label class="field">Import<input id="importFile" type="file" accept="application/json"></label>
      <button type="button" class="danger" data-act="reset">Wipe this phone</button>
    </div>`;
}

function toggle(key, label) {
  return `<button type="button" class="item" data-act="toggle" data-id="${key}">${state.settings[key] ? "✓" : "○"} ${esc(label)}</button>`;
}

function renderBust() {
  return `${bar("Busted")}
    <div class="stack">
      <label class="field">Where you woke<input id="bustWhere" placeholder="Hospital"></label>
      <label class="field">Cash was gone<input id="bustCash" type="checkbox"></label>
      <label class="field">Gun was gone<input id="bustGun" type="checkbox"></label>
      <label class="field">Car was kept<input id="bustCar" type="checkbox" checked></label>
      <button type="button" class="danger" data-act="save-bust">File it</button>
    </div>`;
}

function setPath(obj, path, value) {
  const parts = String(path || "").split(".");
  let cursor = obj;
  for (let index = 0; index < parts.length - 1; index += 1) cursor = cursor[parts[index]];
  cursor[parts[parts.length - 1]] = value;
}

function applyBind(target) {
  const kind = target.dataset.bind;
  if (!kind) return;
  const field = target.dataset.field;
  let value = target.type === "checkbox" ? target.checked : target.value;
  if (target.dataset.type === "number" || target.type === "number") value = Number(value);
  if (kind === "life") setPath(state.life, field, value);
  else if (kind === "plain") state[field] = value;
  else if (kind === "note") {
    const note = state.life.notes[target.dataset.id] || { fail: "", pack: "", replay: "", partner: "" };
    note[field] = value;
    state.life.notes[target.dataset.id] = note;
  }
  else if (kind === "setting") {
    if (field === "standing" && value === "irredeemable" && !state.irredeemableLocked) {
      state.toast = "Irredeemable stays. Confirm it on this screen.";
      saveState(state);
      render();
      return;
    }
    state.settings[field] = value;
  }
  else if (kind === "bank") {
    state.bank[field] = Number(value) || 0;
    if (field === "cash") state.bank.pocket = state.bank.cash;
    if (field === "pocket") state.bank.cash = state.bank.pocket;
    if (field === "goods") state.kit.goodsOnYou = state.bank.goods > 0;
  }
  else if (kind === "where") state.where[target.dataset.id] = value;
  else if (kind === "slots") state.garageSlots = Math.max(0, Number(value) || 0);
  else if (kind === "story") state.story[field] = value;
  else if (kind === "body") {
    const body = state.bodies[target.dataset.id];
    if (body) body[field] = field === "meter" ? value : Number(value);
  }
  else if (kind === "car") {
    const car = state.vehicles.find((item) => item.id === target.dataset.id);
    if (car) car[field] = target.type === "number" ? Number(value) : value;
  }
  else if (kind === "calc") state.calc[field] = target.type === "number" ? Number(value) : value;
  else if (kind === "split") state.split[field] = value;
  else if (kind === "fitness") state.fitness[field] = Number(value);
  else if (kind === "share") {
    const share = state.calc.shares[Number(target.dataset.index)];
    if (share) share[field] = field === "pct" ? Number(value) : value;
  } else if (kind === "site") {
    const site = state.sites.find((item) => item.id === target.dataset.id);
    if (site) site[field] = value;
  } else if (kind === "score") {
    const score = scoreById(target.dataset.id);
    if (!score) return;
    score[field] = target.type === "checkbox" ? target.checked : target.type === "number" ? Number(value) : value;
  }
}

function ask(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return;
  const answer = advise(state, trimmed, { scoreId: state.nav.scoreId, siteId: state.nav.siteId });
  commit((draft) => {
    draft.helper.push({ id: uid(), role: "you", text: trimmed });
    draft.helper.push({ id: uid(), role: "helper", text: answer.text, basis: answer.basis, ruleId: answer.ruleId });
    draft.helper = draft.helper.slice(-40);
    draft.helperTab = "talk";
  });
  screen.scrollTop = screen.scrollHeight;
}

function blankScore(kind) {
  return {
    id: uid(),
    kind,
    name: kind === "heist" ? "New heist" : "New score",
    status: "rumor",
    approach: "",
    exit: "",
    backup: "",
    abort: "",
    loadout: "",
    watchedAt: "any",
    needsTool: "",
    keepCar: false,
    wantsPartner: kind === "heist",
    routeText: "",
    cueShift: 0,
    phases: kind === "heist" ? ["Approach", "Breach", "Loot", "Escape"] : ["In", "Out"],
    gross: 0,
    fenceRate: 10,
    yourPct: 100,
    bestSeconds: null,
    windowsNote: "",
  };
}

function finishRun() {
  const live = state.live;
  if (!live) return;
  const score = scoreById(live.scoreId);
  const seconds = (Date.now() - live.startedAt) / 1000;
  const take = Number(document.getElementById("actualTake")?.value || 0);
  const late = score?.bestSeconds ? seconds - score.bestSeconds : 0;
  const tape = {
    id: uid(),
    scoreId: live.scoreId,
    name: score?.name || "Run",
    kind: score?.kind || "street",
    rehearsal: !!live.rehearsal,
    seconds,
    mistakes: live.mistakes,
    loot: live.loot,
    stars: live.peakStars,
    take,
    late,
    clean: live.peakStars < 3 && live.mistakes === 0,
    at: Date.now(),
  };
  commit((draft) => {
    draft.tapes.push(tape);
    if (!live.rehearsal) {
      recordClear(draft, live.peakStars, seconds);
      if (score) {
        const file = draft.scores.find((item) => item.id === score.id);
        if (file && (file.bestSeconds == null || seconds < file.bestSeconds)) file.bestSeconds = seconds;
        if (file) file.status = "cooling";
      }
      draft.pendingOut = {
        tapeId: tape.id,
        rows: [
          { id: "car", label: "Fence or ditch the car", done: false },
          { id: "look", label: "Change out of the job look", done: false },
          { id: "block", label: "Leave the block", done: false },
          { id: "bank", label: "Deposit spendable cash", done: false },
        ],
      };
    }
    draft.live = null;
    draft.heat.stars = 0;
  });
  if (state.pendingOut) go({ name: "out" });
  else go({ name: "tape", tapeId: tape.id });
}

phone.addEventListener("click", (event) => {
  const target = event.target.closest("[data-act]");
  if (!target) return;
  const act = target.dataset.act;
  const id = target.dataset.id;
  if (act === "unlock") {
    state.stack = [{ name: "home" }];
    state.nav = { name: "home" };
    saveState(state);
    render(0);
  } else if (act === "back") back();
  else if (act === "open") openApp(id);
  else if (act === "page") commit((draft) => { draft.homePage = Number(id); });
  else if (act === "stars") {
    commit((draft) => {
      const next = Math.max(0, Math.min(6, draft.heat.stars + Number(id)));
      if (draft.heat.stars > 0 && next === 0 && draft.suspect.open && !draft.suspect.searchRegion) draft.suspect.searchRegion = draft.here;
      draft.heat.stars = next;
      if (draft.live) draft.live.peakStars = Math.max(draft.live.peakStars, draft.heat.stars);
    });
    if (state.heat.stars >= 6 && state.settings.buzz && navigator.vibrate) navigator.vibrate([30, 40, 30]);
    if (inSearch(state) && state.settings.buzz && navigator.vibrate) navigator.vibrate(80);
  } else if (act === "look") commit((draft) => { draft.heat.look = id; });
  else if (act === "flag") commit((draft) => { draft.heat[id] = !draft.heat[id]; });
  else if (act === "icon") commit((draft) => { draft.heat.icons[id] = !draft.heat.icons[id]; });
  else if (act === "open-bust") go({ name: "bust" });
  else if (act === "new-score") {
    const score = blankScore(id);
    commit((draft) => { draft.scores.push(score); });
    go({ name: "score", scoreId: score.id });
  } else if (act === "open-score") go({ name: "score", scoreId: id });
  else if (act === "arm") {
    const score = scoreById(id);
    const blockers = [...armBlockers(state, score), ...sheetBlock(state)];
    if (blockers.length && target.dataset.force !== "1") {
      commit((draft) => { draft.toast = "Arm is shut. Read the reasons or override."; });
      return;
    }
    commit((draft) => {
      draft.scores.forEach((item) => { if (item.status === "armed") item.status = "ready"; });
      const file = draft.scores.find((item) => item.id === id);
      if (file) file.status = "armed";
      draft.toast = "Armed.";
    });
  } else if (act === "start-run") {
    const score = scoreById(id);
    if (!score) return;
    if (score.status !== "armed" && target.dataset.rehearsal !== "1") {
      commit((draft) => { draft.toast = "Arm it first, or rehearse."; });
      return;
    }
    commit((draft) => {
      draft.live = {
        scoreId: id,
        rehearsal: target.dataset.rehearsal === "1",
        startedAt: Date.now(),
        phaseIndex: 0,
        mistakes: 0,
        loot: 0,
        peakStars: draft.heat.stars,
        routeAt: 0,
      };
    });
    go({ name: "clock" });
  } else if (act === "phase") {
    if (!state.live) {
      if (state.scores.some((score) => score.status === "armed")) {
        const armed = state.scores.find((score) => score.status === "armed");
        commit((draft) => {
          draft.live = { scoreId: armed.id, rehearsal: false, startedAt: Date.now(), phaseIndex: 0, mistakes: 0, loot: 0, peakStars: draft.heat.stars, routeAt: 0 };
        });
        go({ name: "clock" });
      }
      return;
    }
    const score = scoreById(state.live.scoreId);
    commit((draft) => {
      const last = (score?.phases.length || 1) - 1;
      if (draft.live.phaseIndex < last) draft.live.phaseIndex += 1;
    });
  } else if (act === "mistake") commit((draft) => { if (draft.live) draft.live.mistakes += 1; });
  else if (act === "loot") commit((draft) => { if (draft.live) draft.live.loot += 1; });
  else if (act === "next-pin") commit((draft) => { if (draft.live) draft.live.routeAt += 1; });
  else if (act === "finish") finishRun();
  else if (act === "out-row") commit((draft) => {
    const row = draft.pendingOut?.rows.find((item) => item.id === id);
    if (row) row.done = !row.done;
  });
  else if (act === "out-done") {
    const tapeId = state.pendingOut?.tapeId;
    commit((draft) => { draft.pendingOut = null; });
    go({ name: "tape", tapeId });
  } else if (act === "open-tape") go({ name: "tape", tapeId: id });
  else if (act === "shift") commit((draft) => {
    const tape = draft.tapes.find((item) => item.id === id);
    const score = draft.scores.find((item) => item.id === tape?.scoreId);
    if (tape && score && tape.late > 0) {
      score.cueShift = (score.cueShift || 0) + tape.late;
      tape.late = 0;
      draft.toast = "The next run fires that cue earlier.";
    }
  });
  else if (act === "new-site") {
    const site = { id: uid(), name: "New site", region: state.here, events: [], hours: {}, visitStart: null };
    commit((draft) => { draft.sites.push(site); });
    go({ name: "site", siteId: site.id });
  } else if (act === "open-site") go({ name: "site", siteId: id });
  else if (act === "stamp") {
    const site = state.sites.find((item) => item.id === state.nav.siteId);
    if (!site) return;
    const label = document.getElementById("stampLabel")?.value || "mark";
    const blocked = Number(document.getElementById("stampBlocked")?.value || 8);
    commit((draft) => {
      const file = draft.sites.find((item) => item.id === site.id);
      if (!file.visitStart) file.visitStart = Date.now();
      file.events.push({ t: (Date.now() - file.visitStart) / 1000, kind: id, label, blocked });
      if (label && file.name === "New site") file.name = label;
    });
  } else if (act === "mood") {
    const minutes = gameMinutesNow(state);
    const hour = minutes == null ? null : Math.floor(minutes / 60) % 24;
    if (hour == null) {
      commit((draft) => { draft.toast = "Set the in-game time first."; });
      return;
    }
    commit((draft) => {
      const file = draft.sites.find((item) => item.id === state.nav.siteId);
      if (file) {
        file.hours = file.hours || {};
        file.hours[hour] = id;
      }
    });
  } else if (act === "send-window") {
    const site = state.sites.find((item) => item.id === id);
    const scoreId = document.getElementById("windowTarget")?.value;
    const score = scoreById(scoreId);
    if (!site || !score) {
      commit((draft) => { draft.toast = "Choose a score."; });
      return;
    }
    const slot = conservativeSlot(analyzeEvents(site.events || []));
    if (!slot) {
      commit((draft) => { draft.toast = "No trusted window to freeze."; });
      return;
    }
    const period = periodOf(gameMinutesNow(state));
    commit((draft) => {
      const file = draft.scores.find((item) => item.id === scoreId);
      file.windowsNote = `${slot.label} opens ${slot.open}s every ${slot.cycle}s. ${slot.basis}`;
      if (period !== "unset") file.watchedAt = period;
      draft.toast = "Frozen onto the score.";
    });
  } else if (act === "feedback") {
    const line = feedback(state, id, target.dataset.good === "1");
    commit((draft) => {
      draft.learning = state.learning;
      draft.helper.push({ id: uid(), role: "helper", text: line, basis: "Learning", ruleId: "learn-status" });
      draft.helper = draft.helper.slice(-40);
    });
  } else if (act === "ask") ask(id);
  else if (act === "ask-input") ask(document.getElementById("ask")?.value);
  else if (act === "helper-tab") commit((draft) => { draft.helperTab = id; });
  else if (act === "unmute") commit((draft) => {
    if (draft.learning.rules[id]) {
      draft.learning.rules[id].muted = false;
      draft.learning.rules[id].down = 0;
    }
  });
  else if (act === "here") {
    commit((draft) => { draft.here = id; });
    if (inSearch(state) && state.settings.buzz && navigator.vibrate) navigator.vibrate([40, 30, 40]);
    if (inSearch(state)) commit((draft) => { draft.toast = "You are back in the search area and you still match."; });
  } else if (act === "sheet-bit") {
    const [group, key] = String(id).split(":");
    commit((draft) => { draft.suspect[group][key] = !draft.suspect[group][key]; });
  } else if (act === "saw-me") commit((draft) => {
    draft.suspect.seen = { ...draft.suspect.now };
    draft.suspect.open = true;
    draft.toast = sheetLine(draft);
  });
  else if (act === "sheet-clear") commit((draft) => {
    if (sheetBlock(draft).length) {
      draft.toast = "A row still matches. Break that one first.";
      return;
    }
    draft.suspect.open = false;
    draft.suspect.searchRegion = "";
    draft.toast = "Description broken.";
  });
  else if (act === "weapon-owned") commit((draft) => { draft.suspect.weaponOwned = !draft.suspect.weaponOwned; });
  else if (act === "kit") commit((draft) => { draft.kit[id] = !draft.kit[id]; });
  else if (act === "drop-gun") commit((draft) => {
    draft.heat.icons.weapon = false;
    draft.suspect.now.weapon = false;
    draft.toast = draft.suspect.weaponOwned ? "Dropped. It comes back to the trunk." : "Stash it. This one was never stored.";
  });
  else if (act === "chapter") commit((draft) => { draft.life.view = Number(id); });
  else if (act === "iam-here") commit((draft) => {
    draft.story.chapter = Number(id) || draft.life.view || draft.story.chapter;
    draft.life.view = draft.story.chapter;
    draft.life.shown[draft.story.chapter] = true;
  });
  else if (act === "mission") commit((draft) => { draft.story.missionId = id; });
  else if (act === "in-mission") commit((draft) => { draft.story.inMission = !draft.story.inMission; });
  else if (act === "trap") commit((draft) => { draft.story.checks[id] = !draft.story.checks[id]; });
  else if (act === "waive") commit((draft) => { draft.story.waived[id] = !draft.story.waived[id]; });
  else if (act === "next-chapter") commit((draft) => {
    if (!doorOpen(draft) || draft.story.chapter >= 5) return;
    draft.story.chapter += 1;
    draft.life.view = draft.story.chapter;
    draft.story.missionId = missionList(draft.story.chapter)[0]?.id || "";
    draft.story.checks = {};
    draft.story.waived = {};
    draft.life.shown[draft.story.chapter] = true;
    draft.toast = CHAPTER_NAMES[draft.story.chapter];
  });
  else if (act === "route") {
    const amount = Number(document.getElementById("pileAmount")?.value || 0);
    commit((draft) => { draft.toast = routeDollar(draft, id, amount); });
  } else if (act === "land-tomorrow") commit((draft) => {
    const due = draft.bank.tomorrow;
    draft.bank.tomorrow = 0;
    draft.toast = due ? routeDollar(draft, "checking", due) : "Nothing is due.";
  });
  else if (act === "lock-ruin") commit((draft) => {
    draft.irredeemableLocked = true;
    draft.settings.standing = "irredeemable";
    draft.toast = "Irredeemable is locked.";
  });
  else if (act === "window") commit((draft) => { draft.bodies[id].windowOpen = !draft.bodies[id].windowOpen; });
  else if (act === "register-car") commit((draft) => {
    const car = draft.vehicles.find((item) => item.id === id);
    if (car) car.registered = !car.registered;
  });
  else if (act === "motel-paid") commit((draft) => { draft.life.motel.paid = !draft.life.motel.paid; });
  else if (act === "coffee-done") commit((draft) => { draft.life.coffeeDone = !draft.life.coffeeDone; });
  else if (act === "protein") commit((draft) => { draft.life.gym.protein = !draft.life.gym.protein; draft.life.gym.mealAt = Date.now(); });
  else if (act === "stamp-pocket") commit((draft) => { draft.life.sessionPocket = draft.bank.pocket || draft.bank.cash || 0; draft.toast = "Pocket stamped."; });
  else if (act === "move-cash") commit((draft) => { draft.toast = moveCash(draft, id); });
  else if (act === "mute-move") commit((draft) => { draft.life.mutedMoves.push(id); draft.toast = "Next move."; });
  else if (act === "house-bit") commit((draft) => {
    draft.life.house[id] = !draft.life.house[id];
    const errand = draft.errands.find((item) => item.id === id);
    if (errand) errand.done = draft.life.house[id];
    if (id === "meditate") draft.story.checks.meditate = draft.life.house.meditate;
  });
  else if (act === "add-key") {
    const name = document.getElementById("keyName")?.value?.trim();
    if (!name) return;
    commit((draft) => { draft.life.keys.push({ id: uid(), name, done: false, waive: false }); });
  } else if (act === "key-done" || act === "key-waive") commit((draft) => {
    const job = draft.life.keys.find((item) => item.id === id);
    if (!job) return;
    if (act === "key-done") job.done = !job.done;
    else job.waive = !job.waive;
    draft.story.checks.keys = draft.life.keys.some((item) => item.done || item.waive);
  });
  else if (act === "place-have") commit((draft) => { draft.life.places[id].have = !draft.life.places[id].have; });
  else if (act === "real-estate") commit((draft) => { draft.life.realEstate = !draft.life.realEstate; });
  else if (act === "add-mission") {
    const name = document.getElementById("missionName")?.value?.trim();
    if (!name) return;
    commit((draft) => {
      draft.life.missions.push({ id: uid(), chapter: draft.story.chapter, name, line: document.getElementById("missionLine")?.value || "", done: false });
    });
  } else if (act === "custom-mission") commit((draft) => { draft.story.missionId = id; });
  else if (act === "built-done") commit((draft) => {
    draft.story.done[id] = !draft.story.done[id];
    const custom = draft.life.missions.find((item) => item.id === id);
    if (custom) custom.done = draft.story.done[id];
  });
  else if (act === "shade") commit((draft) => { draft.life.shown[id] = true; });
  else if (act === "add-stranger") {
    const name = document.getElementById("strangerName")?.value?.trim();
    if (!name) return;
    commit((draft) => { draft.life.strangers.push({ id: uid(), name, note: document.getElementById("strangerNote")?.value || "" }); });
  } else if (act === "add-fork") {
    const name = document.getElementById("forkName")?.value?.trim();
    if (!name) return;
    commit((draft) => {
      draft.life.forks.push({ id: uid(), name, picked: document.getElementById("forkPicked")?.value || "", paid: Number(document.getElementById("forkPaid")?.value || 0) });
    });
  } else if (act === "add-unique") {
    const name = document.getElementById("uniqueName")?.value?.trim();
    if (!name) return;
    commit((draft) => { draft.life.uniques.push({ id: uid(), name, trunk: true }); });
  } else if (act === "unique-trunk") commit((draft) => {
    const item = draft.life.uniques.find((row) => row.id === id);
    if (item) item.trunk = !item.trunk;
  });
  else if (act === "add-hustle") {
    const name = document.getElementById("hustleName")?.value?.trim();
    if (!name) return;
    commit((draft) => { draft.life.hustles.push({ id: uid(), name, pay: Number(document.getElementById("hustlePay")?.value || 0), done: false }); });
  } else if (act === "hustle-done") commit((draft) => {
    const job = draft.life.hustles.find((item) => item.id === id);
    if (job) job.done = !job.done;
  });
  else if (act === "add-price") {
    const name = document.getElementById("priceName")?.value?.trim();
    if (!name) return;
    commit((draft) => { draft.life.prices.push({ id: uid(), name, cost: Number(document.getElementById("priceCost")?.value || 0) }); });
  } else if (act === "add-date") {
    const place = document.getElementById("datePlace")?.value?.trim();
    if (!place) return;
    commit((draft) => {
      draft.life.dates.push({ id: uid(), place, bought: document.getElementById("dateBought")?.value || "", moved: id === "1" });
      if (id === "1") draft.settings.relationship = Math.min(100, Number(draft.settings.relationship) + 5);
    });
  } else if (act === "add-closet") {
    const name = document.getElementById("outfitName")?.value?.trim();
    if (!name) return;
    commit((draft) => { draft.life.closet.push({ id: uid(), name }); draft.life.wearing = name; });
  } else if (act === "wear") commit((draft) => {
    const outfit = draft.life.closet.find((item) => item.id === id);
    if (outfit) {
      draft.life.wearing = outfit.name;
      draft.suspect.now.clothes = false;
    }
  });
  else if (act === "add-garage") {
    const name = document.getElementById("garageName")?.value?.trim();
    if (!name) return;
    commit((draft) => {
      draft.life.garages.push({ id: uid(), name, slots: Number(document.getElementById("garageSlots")?.value || 1), region: draft.here });
      draft.garages = draft.life.garages;
      draft.garageSlots = draft.life.garages.reduce((sum, garage) => sum + (Number(garage.slots) || 0), 0);
    });
  } else if (act === "daily-driver") commit((draft) => { draft.life.dailyDriverId = id; });
  else if (act === "stolen-car") commit((draft) => {
    draft.life.stolenIds = draft.life.stolenIds.includes(id) ? draft.life.stolenIds.filter((item) => item !== id) : [...draft.life.stolenIds, id];
  });
  else if (act === "sold-car") commit((draft) => {
    const index = draft.vehicles.findIndex((item) => item.id === id);
    if (index < 0) return;
    const car = draft.vehicles[index];
    const verdict = carVerdict(car, registeredCount(draft), draft.garageSlots);
    draft.life.sold.push({ name: car.name, word: verdict.word, paid: Number(car.fence) || 0 });
    draft.vehicles.splice(index, 1);
    if (draft.activeVehicleId === id) draft.activeVehicleId = draft.vehicles[0]?.id || null;
    if (draft.life.dailyDriverId === id) draft.life.dailyDriverId = "";
  });
  else if (act === "add-mod") {
    const name = document.getElementById(`mod-${id}`)?.value?.trim();
    if (!name) return;
    commit((draft) => {
      const car = draft.vehicles.find((item) => item.id === id);
      if (!car) return;
      car.mods = [...(car.mods || []), name];
    });
  } else if (act === "shop-go") {
    const car = state.vehicles.find((item) => item.id === id);
    if (shopArrest(car)) {
      commit((draft) => { draft.toast = "Tracker is live. A mod shop will cuff you."; });
      return;
    }
    commit((draft) => { draft.toast = `Clear to visit the ${target.dataset.shop} shop.`; });
  } else if (act === "deliver") {
    const car = state.vehicles.find((item) => item.id === id);
    if (!car) return;
    if (!car.registered) {
      commit((draft) => { draft.toast = "Scooter Bros delivers registered cars only."; });
      return;
    }
    const garage = state.life.garages[0];
    commit((draft) => { draft.toast = `Have Scooter Bros send ${car.name}${garage ? ` to ${garage.name}` : ""}.`; });
  } else if (act === "workout") commit((draft) => {
    const gained = applyWorkout(draft, draft.settings.lead, false);
    draft.toast = gained ? `Logged ${gained}%.` : "The day cap is used.";
  });
  else if (act === "workout-both") commit((draft) => {
    const gained = applyWorkout(draft, draft.settings.lead, true);
    draft.toast = gained ? "Both of you got the session." : "The day cap is used.";
  });
  else if (act === "new-day") commit((draft) => { draft.life.gym.today = { jason: 0, lucia: 0 }; });
  else if (act === "dunk") commit((draft) => { draft.life.dunk = !draft.life.dunk; });
  else if (act === "scanner-still") commit((draft) => { draft.life.scannerStill = !draft.life.scannerStill; });
  else if (act === "fence-paid") {
    const amount = Number(document.getElementById("pileAmount")?.value || 0);
    commit((draft) => { draft.toast = routeDollar(draft, "checking", amount); });
  }
  else if (act === "goose") commit((draft) => { draft.settings.gooseConfirmed = !draft.settings.gooseConfirmed; });
  else if (act === "add-pin") {
    const name = document.getElementById("pinName")?.value?.trim();
    if (!name) return;
    const kind = document.getElementById("pinKind")?.value || "stash";
    const note = document.getElementById("pinNote")?.value || "";
    commit((draft) => {
      draft.pins.push({
        id: uid(),
        name,
        kind,
        region: draft.here,
        note,
        until: kind === "hot" ? Date.now() + 20 * 60 * 1000 : 0,
      });
    });
  } else if (act === "lead") {
    if (id === state.settings.lead) return;
    commit((draft) => {
      const leaving = draft.settings.lead;
      if (!draft.where[leaving]) draft.where[leaving] = regionName(draft.here);
      draft.toast = switchLanding(draft, id);
      draft.settings.lead = id;
    });
  }
  else if (act === "errand") commit((draft) => {
    const errand = draft.errands.find((item) => item.id === id);
    if (errand) errand.done = !errand.done;
  });
  else if (act === "tool") commit((draft) => {
    draft.tools = draft.tools.includes(id) ? draft.tools.filter((tool) => tool !== id) : [...draft.tools, id];
  });
  else if (act === "active-car") commit((draft) => { draft.activeVehicleId = id; });
  else if (act === "add-look") {
    const name = document.getElementById("lookName")?.value?.trim();
    if (!name) return;
    commit((draft) => {
      draft.looks.push({ id: uid(), name, note: document.getElementById("lookNote")?.value || "" });
    });
  } else if (act === "save-car") {
    const car = {
      id: uid(),
      name: document.getElementById("carName")?.value?.trim() || "Car",
      kind: document.getElementById("carKind")?.value || "car",
      lock: document.getElementById("carLock")?.value || "older",
      tracker: document.getElementById("carTracker")?.value || "clear",
      register: Number(document.getElementById("carRegister")?.value || 0),
      repair: Number(document.getElementById("carRepair")?.value || 0),
      fence: Number(document.getElementById("carFence")?.value || 0),
      conditionBonus: Number(document.getElementById("carBonus")?.value || 0),
      registered: false,
      trackerCost: Number(document.getElementById("carTrackerCost")?.value || 0),
      fuel: Math.max(0, Math.min(1, Number(document.getElementById("carFuel")?.value || 0) / 100)),
    };
    commit((draft) => {
      draft.vehicles.push(car);
      draft.activeVehicleId = car.id;
      if (car.lock === "keyless" && !draft.tools.includes("slim-jim")) draft.toast = "Keyless. Arming will want a slim jim.";
    });
    go({ name: "motor" });
  } else if (act === "calc-tab") commit((draft) => { draft.calcTab = id; });
  else if (act === "add-share") commit((draft) => { draft.calc.shares.push({ name: "Crew", pct: 0 }); });
  else if (act === "add-contact") {
    const name = document.getElementById("contactName")?.value?.trim();
    if (!name) return;
    commit((draft) => { draft.contacts.push({ id: uid(), name, note: document.getElementById("contactNote")?.value || "" }); });
  } else if (act === "add-headline") {
    const text = document.getElementById("headline")?.value?.trim();
    if (!text) return;
    commit((draft) => {
      draft.headlines.push({ id: uid(), text, region: draft.here, at: Date.now() });
      draft.pins.push({ id: uid(), name: text, kind: "hot", region: draft.here, note: "20 min", until: Date.now() + 20 * 60 * 1000 });
    });
  } else if (act === "toggle") commit((draft) => { draft.settings[id] = !draft.settings[id]; });
  else if (act === "set-time") {
    const value = document.getElementById("gameTime")?.value;
    if (!value) return;
    const [hour, minute] = value.split(":").map(Number);
    commit((draft) => {
      draft.game.minutes = hour * 60 + minute;
      draft.game.anchorReal = Date.now();
      draft.game.anchorGame = draft.game.minutes;
    });
  } else if (act === "measure") {
    if (id === "start") commit((draft) => { draft.game.measureStart = Date.now(); draft.toast = "Watch one full in-game day, then come back."; });
    else {
      const elapsed = Date.now() - state.game.measureStart;
      if (elapsed < 60 * 1000) {
        commit((draft) => { draft.toast = "That was under a minute. Let a real in-game day pass."; });
        return;
      }
      commit((draft) => {
        draft.game.ratio = elapsed / (24 * 60);
        draft.game.measureStart = null;
        draft.game.anchorReal = Date.now();
        draft.game.anchorGame = gameMinutesNow(draft) ?? 12 * 60;
        draft.toast = "Clock is running on your day.";
      });
    }
  } else if (act === "practice") {
    state = practiceState();
    saveState(state);
    render(0);
  } else if (act === "export") {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "leonida-dossier.json";
    link.click();
  } else if (act === "reset") {
    if (!window.confirm("Wipe the dossier on this phone?")) return;
    state = defaultState();
    state.nav = { name: "settings" };
    state.stack = [{ name: "home" }, { name: "settings" }];
    saveState(state);
    render(0);
  } else if (act === "save-bust") {
    commit((draft) => {
      draft.busts.push({
        id: uid(),
        where: document.getElementById("bustWhere")?.value || "",
        lostCash: !!document.getElementById("bustCash")?.checked,
        lostGun: !!document.getElementById("bustGun")?.checked,
        keptCar: !!document.getElementById("bustCar")?.checked,
        at: Date.now(),
      });
      draft.heat.stars = 0;
      const wake = document.getElementById("bustWhere")?.value?.trim();
      if (wake) {
        draft.pins.push({ id: uid(), name: wake, kind: "wake", region: draft.here, note: "woke up here", until: 0 });
        draft.life.woke = wake;
      }
      if (document.getElementById("bustCash")?.checked) draft.life.bustCount += 1;
    });
    go({ name: "heat" });
  }
});

phone.addEventListener("input", (event) => {
  if (!event.target.dataset.bind) return;
  applyBind(event.target);
  saveState(state);
  const pane = event.target.closest("[data-calcpane]");
  if (pane && state.nav.name === "calc") {
    const field = event.target.dataset.field;
    const index = event.target.dataset.index;
    const start = event.target.selectionStart;
    pane.innerHTML = calcPane();
    const next = index != null
      ? pane.querySelector(`[data-index="${index}"][data-field="${field}"]`)
      : pane.querySelector(`[data-field="${field}"]`);
    if (next) {
      next.focus();
      if (start != null && next.setSelectionRange) next.setSelectionRange(start, start);
    }
  }
});

phone.addEventListener("change", (event) => {
  if (event.target.id === "importFile" && event.target.files?.[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = hydrate(JSON.parse(String(reader.result)));
        saveState(state);
        render(0);
      } catch {
        state.toast = "That file is not a dossier.";
        render();
      }
    };
    reader.readAsText(event.target.files[0]);
    return;
  }
  if (!event.target.dataset.bind) return;
  applyBind(event.target);
  saveState(state);
  if (event.target.dataset.bind !== "calc" && event.target.dataset.bind !== "share") render();
});

phone.addEventListener("keydown", (event) => {
  if (event.target.matches("input, textarea, select")) {
    if (event.key === "Enter" && event.target.id === "ask") {
      event.preventDefault();
      ask(event.target.value);
    }
    return;
  }
  if (event.key === "h") phone.querySelector('[data-act="stars"][data-id="1"]')?.click();
  if (event.key === "H") phone.querySelector('[data-act="stars"][data-id="-1"]')?.click();
  if (event.code === "Space") {
    event.preventDefault();
    phone.querySelector('[data-act="phase"]')?.click();
  }
  if (event.key === "b") phone.querySelector('[data-act="mistake"]')?.click();
  if (event.key === "l") phone.querySelector('[data-act="loot"]')?.click();
  if (event.key === "f") phone.querySelector('[data-act="finish"]')?.click();
});

setInterval(() => {
  document.querySelectorAll("[data-tick]").forEach((node) => {
    if (node.dataset.tick === "game") node.textContent = formatGameTime(gameMinutesNow(state));
    if (node.dataset.tick === "live") node.textContent = formatDuration((Date.now() - Number(node.dataset.start)) / 1000);
    if (node.dataset.tick === "window") {
      const site = state.sites.find((item) => item.id === node.dataset.site);
      if (site) node.textContent = windowLine(site);
    }
  });
}, 250);

render(0);
