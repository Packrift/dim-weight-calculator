import assert from "node:assert/strict";
import test from "node:test";

import {
  COMMON_DIM_DIVISORS,
  calculateBillableWeight,
  calculateDimensionalWeight,
  compareDimensionalDivisors,
  cubicVolume,
  normalizeDimensions,
  parseCartonSize
} from "../src/index.js";

test("normalizes numeric dimension strings", () => {
  assert.deepEqual(
    normalizeDimensions({ length: "16", width: "12", height: "8" }),
    { length: 16, width: 12, height: 8 }
  );
});

test("calculates cubic volume", () => {
  assert.equal(cubicVolume({ length: 16, width: 12, height: 8 }), 1536);
});

test("calculates rounded parcel dimensional weight", () => {
  assert.equal(
    calculateDimensionalWeight({ length: 16, width: 12, height: 8, divisor: 139 }),
    12
  );
});

test("can return raw dimensional weight without rounding", () => {
  assert.equal(
    calculateDimensionalWeight({
      length: 16,
      width: 12,
      height: 8,
      divisor: 139,
      round: "none"
    }),
    1536 / 139
  );
});

test("rounds to a requested decimal precision", () => {
  assert.equal(
    calculateDimensionalWeight({
      length: 16,
      width: 12,
      height: 8,
      divisor: 139,
      round: "round",
      precision: 1
    }),
    11.1
  );
});

test("calculates billable weight and identifies dimensional charges", () => {
  assert.deepEqual(
    calculateBillableWeight({
      actualWeight: 9.4,
      dimensions: { length: 16, width: 12, height: 8 },
      divisor: 139
    }),
    {
      actualWeight: 10,
      dimensionalWeight: 12,
      billableWeight: 12,
      chargedBy: "dimensional"
    }
  );
});

test("calculates billable weight and identifies actual-weight charges", () => {
  assert.deepEqual(
    calculateBillableWeight({
      actualWeight: 13.1,
      dimensions: { length: 16, width: 12, height: 8 },
      divisor: 139
    }),
    {
      actualWeight: 14,
      dimensionalWeight: 12,
      billableWeight: 14,
      chargedBy: "actual"
    }
  );
});

test("compares dimensional weights across divisor choices", () => {
  const comparison = compareDimensionalDivisors(
    { length: 16, width: 12, height: 8 },
    { parcel139: 139, parcel166: 166 }
  );

  assert.deepEqual(
    comparison.map((item) => [item.name, item.dimensionalWeight]),
    [
      ["parcel139", 12],
      ["parcel166", 10]
    ]
  );
});

test("accepts divisor arrays with names", () => {
  const comparison = compareDimensionalDivisors(
    { length: 40, width: 30, height: 20 },
    [{ name: "metric5000", divisor: COMMON_DIM_DIVISORS.metric5000 }]
  );

  assert.deepEqual(comparison, [
    {
      name: "metric5000",
      divisor: 5000,
      dimensionalWeight: 5
    }
  ]);
});

test("parses common carton-size strings", () => {
  assert.deepEqual(parseCartonSize("16 x 12 x 8"), {
    length: 16,
    width: 12,
    height: 8
  });

  assert.deepEqual(parseCartonSize("16\"x12\"x8\""), {
    length: 16,
    width: 12,
    height: 8
  });
});

test("throws on invalid dimensions", () => {
  assert.throws(
    () => calculateDimensionalWeight({ length: 16, width: 0, height: 8 }),
    /width must be a positive number/
  );
});

test("throws on invalid rounding modes", () => {
  assert.throws(
    () =>
      calculateDimensionalWeight({
        length: 16,
        width: 12,
        height: 8,
        round: "up"
      }),
    /round must be one of/
  );
});
