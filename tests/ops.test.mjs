import assert from "node:assert/strict";
import { defaultState } from "../js/store.js";
import {
  carVerdict,
  doorOpen,
  focusLine,
  pocketOf,
  quitSafe,
  routeDollar,
  sheetBlock,
  sheetHits,
  sheetLine,
  switchLanding,
  viceGap,
} from "../js/ops.js";

const state = defaultState();
state.suspect.open = true;
state.suspect.seen = { hat: true, clothes: true, weapon: true, vehicle: false, partner: false, camera: false };
state.suspect.now = { hat: true, clothes: false, weapon: true, vehicle: false, partner: false, camera: false };
state.suspect.weaponOwned = true;
assert.equal(sheetHits(state).length, 2);
assert.match(sheetLine(state), /bandana/);
assert.equal(sheetBlock(state).length, 1);

state.suspect.now.hat = false;
state.suspect.now.weapon = false;
assert.equal(sheetHits(state).length, 0);
assert.match(sheetLine(state), /broken/);

state.bank.pocket = 5000;
state.bank.pocketKeep = 800;
state.story.inMission = true;
state.kit.uniqueOnBack = true;
const safe = quitSafe(state);
assert.equal(safe.ok, false);
assert.ok(safe.reasons.some((line) => /floorboards|ATM|Pocket/.test(line)));
assert.ok(safe.reasons.some((line) => /trunk/.test(line)));
assert.ok(safe.reasons.some((line) => /mission/.test(line)));

const routed = defaultState();
const note = routeDollar(routed, "checking", 20000);
assert.equal(routed.bank.checking, 15000);
assert.ok(routed.bank.family > 0);
assert.match(note, /Checking/);
assert.equal(viceGap(routed), 0);

const poor = defaultState();
assert.equal(viceGap(poor), 15000);
assert.equal(pocketOf(poor), 0);

const dump = carVerdict({ name: "A", tracker: "live", fence: 9000, repair: 0, register: 1000 }, 0, 2);
assert.equal(dump.word, "dump");
const sell = carVerdict({ tracker: "clear", fence: 9000, repair: 200, register: 1000 }, 0, 2);
assert.equal(sell.word, "sell");
const keep = carVerdict({ tracker: "clear", fence: 500, repair: 0, register: 4000 }, 0, 2);
assert.equal(keep.word, "register");
const full = carVerdict({ tracker: "clear", fence: 500, repair: 0, register: 4000 }, 2, 2);
assert.equal(full.word, "dump");

const landing = defaultState();
landing.where.jason = "the motel";
landing.heat.stars = 2;
assert.match(switchLanding(landing, "jason"), /motel/);
assert.match(switchLanding(landing, "jason"), /Mid-chase/);

const pro = defaultState();
pro.settings.standing = "professional";
assert.match(focusLine(pro), /non-lethal/);
pro.settings.standing = "irredeemable";
assert.match(focusLine(pro), /headshots/);

const early = defaultState();
assert.equal(doorOpen(early), false);
early.bank.pocket = 100;
early.story.checks = { meditate: true, keys: true };
early.story.waived = {};
assert.equal(doorOpen(early), true);

console.log("ops ok");
