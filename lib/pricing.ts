// Event pricing logic shared by public pages.
// All stored amounts are cents; the returned min/max are also cents.

type PricedEvent = {
  pricingType: "FREE" | "FIXED" | "SLIDING";
  priceMin: number | null;
  priceMax: number | null;
  earlyBirdPriceMin: number | null;
  earlyBirdPriceMax: number | null;
  earlyBirdDeadline: Date | null;
};

export type EventPricing = {
  type: "FREE" | "FIXED" | "SLIDING";
  /** Active price (cents), for FIXED, min is the price; for SLIDING, min–max. */
  min: number | null;
  max: number | null;
  earlyBirdActive: boolean;
  earlyBirdDeadline: Date | null;
  /** Regular (non-early-bird) prices, for showing a strikethrough/comparison. */
  regularMin: number | null;
  regularMax: number | null;
  /** Human label, e.g. "$120 early bird", "$250–$450 sliding scale", "Free". */
  label: string;
};

const dollars = (cents: number) => `$${Math.round(cents / 100)}`;

export function eventPricing(event: PricedEvent, now: Date = new Date()): EventPricing {
  const { pricingType } = event;

  if (pricingType === "FREE") {
    return {
      type: "FREE", min: null, max: null,
      earlyBirdActive: false, earlyBirdDeadline: null,
      regularMin: null, regularMax: null,
      label: "Free",
    };
  }

  const earlyBirdActive = Boolean(
    event.earlyBirdDeadline &&
    now < event.earlyBirdDeadline &&
    event.earlyBirdPriceMin != null
  );

  const min = earlyBirdActive ? event.earlyBirdPriceMin : event.priceMin;
  const max =
    pricingType === "SLIDING"
      ? (earlyBirdActive ? (event.earlyBirdPriceMax ?? event.priceMax) : event.priceMax)
      : null;

  let label: string;
  if (pricingType === "FIXED") {
    label = min != null ? dollars(min) : "Free";
    if (earlyBirdActive) label += " early bird";
  } else {
    label =
      min != null && max != null
        ? `${dollars(min)}–${dollars(max)} sliding scale`
        : min != null
        ? `From ${dollars(min)}`
        : "Sliding scale";
    if (earlyBirdActive) label += " (early bird)";
  }

  return {
    type: pricingType,
    min: min ?? null,
    max,
    earlyBirdActive,
    earlyBirdDeadline: event.earlyBirdDeadline,
    regularMin: event.priceMin,
    regularMax: event.priceMax,
    label,
  };
}
