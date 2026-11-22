import assert from "node:assert/strict";
import { defaultState } from "../js/store.js";
import {
  activeFence,
  applyWorkout,
  bandOf,
  bankBlocked,
  bothReady,
  cashBills,
  chapterShown,
  compareCars,
  expiresToday,
  gymStatus,
  moveCash,
  oneMove,
  openNow,
  piles,
  shopArrest,
  tankRange,
  tooFar,
  weekNet,
  whatYouLose,
} from "../js/life.js";

const state = defaultState();
assert.equal(bandOf(10), "Running on Empty");
assert.equal(bandOf(25), "Partners in Crime");
assert.equal(bandOf(80), "Hot Together");
assert.equal(bothReady(state), false);
state.settings.relationship = 60;
assert.equal(bothReady(state), true);

assert.equal(cashBills(state), 802);
state.life.motel.paid = true;
state.life.coffeeDone = true;
assert.equal(cashBills(state), 0);

state.bank.pocket = 1000;
state.bank.goods = 50;
state.bank.tomorrow = 10000;
state.life.motel.paid = false;
state.life.motel.rent = 800;
state.life.coffeeDone = true;
const money = piles(state);
assert.equal(money.reserved, 800);
assert.equal(money.spendable, 200);
assert.equal(money.goods, 50);
assert.ok(!String(money.spendable).includes("10000"));

const now = Date.UTC(2026, 10, 22);
state.life.gym.last.lucia = now - 2 * 86400000;
state.life.gym.today.lucia = 11;
state.life.gym.protein = true;
const gym = gymStatus(state, now);
assert.equal(gym.open, true);
assert.equal(gym.rest, 4);
assert.equal(gym.left, 22);
state.life.gym.last.lucia = now - 5 * 86400000;
assert.equal(gymStatus(state, now).open, false);
state.life.gym.last.lucia = now;
applyWorkout(state, "lucia", true, now);
assert.equal(state.life.gym.today.jason, 11);
assert.ok(state.life.gym.today.lucia <= 33);

assert.equal(activeFence(state).id, "brian");
state.story.missionId = "lab-fees";
assert.equal(activeFence(state).id, "donnie");

assert.equal(openNow(8 * 60, "").block, "Morning");
assert.match(openNow(8 * 60, "rain").lines.at(-1), /boat/);

state.story.chapter = 3;
state.here = "keys";
assert.match(tooFar(state), /Keys/);
assert.equal(chapterShown(state, 4), false);
state.life.shown[4] = true;
assert.equal(chapterShown(state, 4), true);

assert.equal(shopArrest({ tracker: "live" }), true);
const rows = compareCars({ speed: 4, accel: 1 }, { speed: 2, accel: 3 });
assert.equal(rows[0].a, 4);
assert.equal(rows[1].b, 3);
assert.equal(tankRange(20, 0.5), 40);

state.bank.pocket = 40;
state.bank.cash = 40;
assert.match(moveCash(state, "floor"), /Floorboards/);
assert.equal(state.life.floorboard, 40);
assert.equal(state.bank.pocket, 0);

state.life.week = { rent: 800, food: 20, ammo: 100, landed: 1000 };
assert.equal(weekNet(state), 80);
assert.ok(whatYouLose(1).some((line) => /Meditation/.test(line)));

const fresh = defaultState();
fresh.story.inMission = true;
assert.match(oneMove(fresh).source, /Gone Fishing|Story/);
fresh.story.inMission = false;
fresh.life.mutedMoves = [oneMove(fresh).text];
assert.notEqual(oneMove(fresh).text, fresh.life.mutedMoves[0]);

fresh.life.marked = 200;
assert.match(bankBlocked(fresh), /jammer/);
assert.ok(expiresToday(fresh).length > 0);

console.log("life ok");
