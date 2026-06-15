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

export type ParticipantQuoteInput = { isChild: boolean };

export type BookingQuote = {
  type: "FREE" | "FIXED" | "SLIDING";
  /** Total cents. For SLIDING these bound the allowed amount; for FIXED min === max. */
  minCents: number;
  maxCents: number;
  /** Suggested total (cents): the fixed total, or the midpoint for sliding. */
  suggestedCents: number;
};

/**
 * Total price for a booking, summing each participant and applying the kids
 * (18 & under) discount. Early-bird-aware via eventPricing. The server uses
 * this to validate the amount a client submits.
 */
export function bookingQuote(
  event: PricedEvent,
  participants: ParticipantQuoteInput[],
  now: Date = new Date()
): BookingQuote {
  const pricing = eventPricing(event, now);
  if (pricing.type === "FREE" || participants.length === 0) {
    return { type: "FREE", minCents: 0, maxCents: 0, suggestedCents: 0 };
  }

  const factor = 1 - (event.kidsDiscountPercent ?? 0) / 100;
  const perAdultMin = pricing.min ?? 0;
  const perAdultMax = pricing.type === "SLIDING" ? (pricing.max ?? perAdultMin) : perAdultMin;

  let minCents = 0;
  let maxCents = 0;
  for (const p of participants) {
    minCents += p.isChild ? Math.round(perAdultMin * factor) : perAdultMin;
    maxCents += p.isChild ? Math.round(perAdultMax * factor) : perAdultMax;
  }

  if (pricing.type === "FIXED") {
    return { type: "FIXED", minCents, maxCents: minCents, suggestedCents: minCents };
  }
  return {
    type: "SLIDING",
    minCents,
    maxCents,
    suggestedCents: Math.round((minCents + maxCents) / 2),
  };
}

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
