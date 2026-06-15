// Event pricing logic shared by public pages.
// All stored amounts are cents; the returned min/max are also cents.

type PricedEvent = {
  pricingType: "FREE" | "FIXED" | "SLIDING";
  priceMin: number | null;
  priceMax: number | null;
  earlyBirdPriceMin: number | null;
  earlyBirdPriceMax: number | null;
  earlyBirdDeadline: Date | null;
  kidsDiscountPercent?: number | null;
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
  /** Kids (18 & under) discount percent, if set. */
  kidsDiscountPercent: number | null;
  /** Kids price label, e.g. "Kids 18 & under: $60 (50% off)", or null. */
  kidsLabel: string | null;
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
      kidsDiscountPercent: null, kidsLabel: null,
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

  // Kids (18 & under) discount applied to the currently-active price.
  const kidsPct = event.kidsDiscountPercent ?? null;
  let kidsLabel: string | null = null;
  if (kidsPct && kidsPct > 0 && min != null) {
    const factor = 1 - kidsPct / 100;
    const kMin = Math.round(min * factor);
    if (pricingType === "FIXED") {
      kidsLabel = `Kids 18 & under: ${dollars(kMin)} (${kidsPct}% off)`;
    } else {
      const kMax = max != null ? Math.round(max * factor) : null;
      kidsLabel =
        kMax != null
          ? `Kids 18 & under: ${dollars(kMin)}–${dollars(kMax)} (${kidsPct}% off)`
          : `Kids 18 & under: from ${dollars(kMin)} (${kidsPct}% off)`;
    }
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
    kidsDiscountPercent: kidsPct,
    kidsLabel,
  };
}
