export const DEFAULT_DIM_DIVISOR = 139;

export const COMMON_DIM_DIVISORS = Object.freeze({
  parcel139: 139,
  parcel166: 166,
  metric5000: 5000,
  metric6000: 6000
});

const ROUNDING_MODES = new Set(["ceil", "floor", "round", "none"]);

function toPositiveNumber(value, label) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    throw new TypeError(`${label} must be a positive number`);
  }

  return number;
}

function normalizePrecision(precision) {
  const number = Number(precision);

  if (!Number.isInteger(number) || number < 0 || number > 10) {
    throw new RangeError("precision must be an integer from 0 to 10");
  }

  return number;
}

function applyRounding(value, mode, precision = 2) {
  if (!ROUNDING_MODES.has(mode)) {
    throw new TypeError(`round must be one of: ${Array.from(ROUNDING_MODES).join(", ")}`);
  }

  if (mode === "none") {
    return value;
  }

  if (mode === "ceil") {
    return Math.ceil(value);
  }

  if (mode === "floor") {
    return Math.floor(value);
  }

  const places = normalizePrecision(precision);
  const multiplier = 10 ** places;

  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

export function normalizeDimensions(dimensions = {}) {
  return {
    length: toPositiveNumber(dimensions.length, "length"),
    width: toPositiveNumber(dimensions.width, "width"),
    height: toPositiveNumber(dimensions.height, "height")
  };
}

export function cubicVolume(dimensions) {
  const dims = normalizeDimensions(dimensions);
  return dims.length * dims.width * dims.height;
}

export function calculateDimensionalWeight(options = {}) {
  const {
    divisor = DEFAULT_DIM_DIVISOR,
    round = "ceil",
    precision = 2,
    ...dimensions
  } = options;

  const dimDivisor = toPositiveNumber(divisor, "divisor");
  const rawWeight = cubicVolume(dimensions) / dimDivisor;

  return applyRounding(rawWeight, round, precision);
}

export function calculateBillableWeight(options = {}) {
  const {
    actualWeight,
    dimensions,
    divisor = DEFAULT_DIM_DIVISOR,
    round = "ceil",
    precision = 2
  } = options;

  const roundedActualWeight = applyRounding(
    toPositiveNumber(actualWeight, "actualWeight"),
    round,
    precision
  );

  const dimensionalWeight = calculateDimensionalWeight({
    ...normalizeDimensions(dimensions),
    divisor,
    round,
    precision
  });

  const billableWeight = Math.max(roundedActualWeight, dimensionalWeight);
  let chargedBy = "equal";

  if (dimensionalWeight > roundedActualWeight) {
    chargedBy = "dimensional";
  } else if (roundedActualWeight > dimensionalWeight) {
    chargedBy = "actual";
  }

  return {
    actualWeight: roundedActualWeight,
    dimensionalWeight,
    billableWeight,
    chargedBy
  };
}

export function compareDimensionalDivisors(
  dimensions,
  divisors = COMMON_DIM_DIVISORS,
  options = {}
) {
  const entries = Array.isArray(divisors)
    ? divisors.map((item) => [item.name ?? String(item.divisor), item.divisor])
    : Object.entries(divisors);

  return entries
    .map(([name, divisor]) => {
      const normalizedDivisor = toPositiveNumber(divisor, `divisor "${name}"`);

      return {
        name,
        divisor: normalizedDivisor,
        dimensionalWeight: calculateDimensionalWeight({
          ...normalizeDimensions(dimensions),
          divisor: normalizedDivisor,
          round: options.round ?? "ceil",
          precision: options.precision ?? 2
        })
      };
    })
    .sort((a, b) => b.dimensionalWeight - a.dimensionalWeight);
}

export function parseCartonSize(size) {
  if (typeof size !== "string") {
    throw new TypeError("size must be a string like 16x12x8");
  }

  const parts = size
    .trim()
    .toLowerCase()
    .replace(/["']/g, "")
    .split(/[x\u00d7]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length !== 3) {
    throw new TypeError("size must contain three dimensions, like 16x12x8");
  }

  return normalizeDimensions({
    length: parts[0],
    width: parts[1],
    height: parts[2]
  });
}
