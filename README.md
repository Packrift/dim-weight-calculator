# @packrift/dim-weight-calculator

Small dependency-free JavaScript utilities for dimensional weight and billable shipping weight calculations.

Use this package when a checkout extension, warehouse script, rate-shopping tool, or AI agent needs to calculate dimensional weight without pulling in a carrier SDK.

Packrift also hosts no-code versions of these workflows:

- Dimensional weight calculator: https://packrift.com/pages/dimensional-weight-calculator
- Free dimensional weight calculator widget: https://packrift.com/pages/free-dimensional-weight-calculator-widget

## Install

```bash
npm install @packrift/dim-weight-calculator
```

## Usage

```js
import {
  calculateBillableWeight,
  calculateDimensionalWeight,
  compareDimensionalDivisors,
  parseCartonSize
} from "@packrift/dim-weight-calculator";

const dimensions = parseCartonSize("16 x 12 x 8");

const dimensionalWeight = calculateDimensionalWeight({
  ...dimensions,
  divisor: 139
});

const billable = calculateBillableWeight({
  actualWeight: 9.4,
  dimensions,
  divisor: 139
});

const comparison = compareDimensionalDivisors(dimensions, {
  parcel139: 139,
  parcel166: 166
});

console.log({ dimensionalWeight, billable, comparison });
```

## API

### `calculateDimensionalWeight(options)`

Calculates dimensional weight from package dimensions.

```js
calculateDimensionalWeight({
  length: 16,
  width: 12,
  height: 8,
  divisor: 139,
  round: "ceil"
});
```

Options:

- `length`, `width`, `height`: positive numbers.
- `divisor`: positive number. Defaults to `139`, a common parcel divisor.
- `round`: one of `"ceil"`, `"floor"`, `"round"`, or `"none"`. Defaults to `"ceil"`.
- `precision`: decimal places used with `"round"`. Defaults to `2`.

### `calculateBillableWeight(options)`

Returns rounded actual weight, dimensional weight, billable weight, and whether actual or dimensional weight wins.

```js
calculateBillableWeight({
  actualWeight: 9.4,
  dimensions: { length: 16, width: 12, height: 8 },
  divisor: 139
});
```

### `compareDimensionalDivisors(dimensions, divisors)`

Calculates dimensional weight across multiple divisors and returns results from heaviest to lightest.

```js
compareDimensionalDivisors(
  { length: 16, width: 12, height: 8 },
  { parcel139: 139, parcel166: 166 }
);
```

### `parseCartonSize(size)`

Parses common carton strings such as `"16x12x8"` or `"16 x 12 x 8"` into `{ length, width, height }`.

### `cubicVolume(dimensions)`

Returns `length * width * height` after validating the dimensions.

### `normalizeDimensions(dimensions)`

Returns a clean numeric `{ length, width, height }` object and throws for invalid values.

## Common Divisors

The package exports `COMMON_DIM_DIVISORS` for convenience:

```js
{
  parcel139: 139,
  parcel166: 166,
  metric5000: 5000,
  metric6000: 6000
}
```

Always confirm the divisor, rounding rules, and units required by your carrier, contract, or marketplace.

## GitHub Pages

`docs/index.html` contains a static calculator/demo page suitable for GitHub Pages.

## License

MIT
