# Carrier divisor reference

Dimensional weight turns package volume into a billable weight. The formula is simple:

```text
length x width x height / dimensional divisor
```

The hard part is choosing the divisor and rounding behavior that match the carrier, marketplace, or negotiated account. This package keeps that choice explicit so checkout tools and fulfillment scripts do not hide shipping assumptions in hard-coded math.

Related Packrift resources:

- [Dimensional weight calculator](https://packrift.com/pages/dimensional-weight-calculator)
- [Free dimensional weight calculator widget](https://packrift.com/pages/free-dimensional-weight-calculator-widget)

## Common divisor comparison

```js
import {
  COMMON_DIM_DIVISORS,
  compareDimensionalDivisors,
  parseCartonSize
} from "@packrift/dim-weight-calculator";

const carton = parseCartonSize("16 x 12 x 8");

const comparison = compareDimensionalDivisors(carton, {
  parcel139: COMMON_DIM_DIVISORS.parcel139,
  parcel166: COMMON_DIM_DIVISORS.parcel166
});

console.table(comparison);
```

For a `16 x 12 x 8` carton, a lower divisor produces a higher dimensional weight. That matters when comparing rate quotes, checking fulfillment invoices, or explaining why a lightweight but bulky SKU is expensive to ship.

## Billable-weight check

```js
import { calculateBillableWeight } from "@packrift/dim-weight-calculator";

const result = calculateBillableWeight({
  actualWeight: 9.4,
  dimensions: { length: 16, width: 12, height: 8 },
  divisor: 139
});

console.log(result);
// {
//   actualWeight: 10,
//   dimensionalWeight: 12,
//   billableWeight: 12,
//   chargedBy: "dimensional"
// }
```

## Implementation notes

- Keep units consistent. The `parcel139` and `parcel166` defaults assume inches and pounds. The metric examples use centimeter-based divisors.
- Use `round: "ceil"` when you need parcel-style whole-pound rounding.
- Use `round: "none"` when you want raw math for audit reports or UI displays.
- Always verify final rules against the carrier contract. Packrift's public calculator is useful as a shared non-code check for operations and support teams.
