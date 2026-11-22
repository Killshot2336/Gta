import assert from "node:assert/strict";
import { defaultState } from "../js/store.js";
import {
  advise,
  analyzeEvents,
  armBlockers,
  conservativeSlot,
  cutMath,
  feedback,
  fuelMath,
  grossForTake,
  medianClear,
  money,
  motorMath,
  nextWindow,
  recordClear,
  runScore,
  scratch,
  spendable,
} from "../js/logic.js";

const cut = cutMath({
  gross: 100000,
  fenceMode: "rate",
  fenceRate: 10,
  fenceFlat: 0,
  shares: [
    { name: "You", pct: 40 },
    { name: "Driver", pct: 20 },
  ],
});
assert.equal(cut.fence, 10000);
assert.equal(cut.left, 90000);
assert.equal(cut.your, 36000);
assert.equal(cut.unassigned, 40);
assert.ok(Math.abs(grossForTake(36000, 10, 40) - 100000) < 0.01);
assert.equal(money(-1200), "-$1,200");

const scored = runScore({ take: 60000, seconds: 120, stars: 2, mistakes: 1, starWeight: 0.5, missWeight: 0.5 });
assert.equal(scored.perMin, 30000);
assert.ok(Math.abs(scored.score - 12000) < 0.01);

assert.deepEqual(motorMath({ register: 1000, repair: 200, trackerCost: 300, fence: 5000 }), { keep: 1500, walk: 4800 });
assert.equal(fuelMath({ distance: 10, fraction: 0.5, trip: 10 }).need, 0.5);

assert.equal(scratch("(2+3)*4").value, 20);
assert.equal(scratch("200*10%").value, 20);
assert.ok(scratch("2+").error);

const irregular = analyzeEvents([
  { label: "east", t: 0, blocked: 8 },
  { label: "east", t: 10, blocked: 8 },
  { label: "east", t: 80, blocked: 8 },
]);
assert.equal(irregular[0].status, "irregular");
assert.equal(conservativeSlot(irregular), null);

const tight = analyzeEvents([
  { label: "east", t: 0, blocked: 8 },
  { label: "east", t: 60, blocked: 8 },
  { label: "east", t: 124, blocked: 8 },
]);
assert.equal(tight[0].status, "cycled");
assert.ok(tight[0].open > 0);
const slot = conservativeSlot(tight);
assert.equal(slot.label, "east");
const window = nextWindow({ ...tight[0], lastT: 124 }, 124);
assert.equal(window.state, "blocked");

const state = defaultState();
state.heat.witnessed = false;
state.heat.alarm = false;
state.heat.stars = 0;
let advice = advise(state, "what now");
assert.equal(advice.ruleId, "hold");

state.heat.stars = 3;
state.heat.look = "";
advice = advise(state, "heat");
assert.equal(advice.ruleId, "name-stars");

state.heat.look = "hollow";
state.heat.icons.clothes = true;
state.heat.icons.face = true;
state.heat.icons.vehicle = true;
advice = advise(state, "what now");
assert.equal(advice.ruleId, "hollow");

state.heat.icons = { camera: false, accomplice: false, clothes: false, face: false, weapon: false, vehicle: true };
advice = advise(state, "what now");
assert.equal(advice.ruleId, "vehicle-only");
assert.match(advice.text, /Step out/);

state.here = "goose-key";
state.vehicles = [{ id: "p", name: "Cub", kind: "plane", tracker: "clear", fuel: 1 }];
state.activeVehicleId = "p";
advice = advise(state, "where");
assert.equal(advice.ruleId, "goose-ask");
state.settings.gooseConfirmed = true;
advice = advise(state, "where");
assert.equal(advice.ruleId, "goose");

const bank = defaultState();
bank.bank = { cash: 50, checking: 25, family: 99999 };
assert.equal(spendable(bank), 75);
bank.busts = [
  { lostCash: true },
  { lostCash: true },
  { lostCash: true },
];
advice = advise(bank, "what now");
assert.equal(advice.ruleId, "deposit");
assert.match(advice.text, /\$75/);
assert.doesNotMatch(advice.text, /99,999/);

const learn = defaultState();
learn.heat.stars = 2;
learn.heat.look = "solid";
assert.equal(advise(learn, "what now").ruleId, "solid");
assert.match(feedback(learn, "solid", false), /miss/);
assert.match(feedback(learn, "solid", false), /Muted/);
assert.notEqual(advise(learn, "what now").ruleId, "solid");

recordClear(learn, 2, 40);
recordClear(learn, 2, 50);
assert.equal(medianClear(learn, 2), null);
recordClear(learn, 2, 60);
assert.equal(medianClear(learn, 2).median, 50);

const score = {
  id: "s",
  name: "Van",
  needsTool: "slim-jim",
  keepCar: true,
  vehicleId: "c",
  watchedAt: "night",
  kind: "street",
  wantsPartner: false,
};
const gated = defaultState();
gated.tools = ["hotwire"];
gated.vehicles = [{ id: "c", tracker: "live", kind: "car", fuel: 1 }];
gated.game.minutes = 10 * 60;
assert.ok(armBlockers(gated, score).some((line) => /slim jim/.test(line)));
assert.ok(armBlockers(gated, score).some((line) => /tracker/.test(line)));
assert.ok(armBlockers(gated, score).some((line) => /night/.test(line)));

console.log("logic ok");
