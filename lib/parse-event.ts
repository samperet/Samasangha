import type { PricingType } from "@prisma/client";

/** A problem with the submitted event, safe to show the admin. */
export class EventDataError extends Error {}

// Parse a date field, rejecting values the database would choke on. An empty
// optional field is null; anything unparseable is reported rather than passed
// to Prisma as an Invalid Date (which fails the whole request).
function parseDate(value: unknown, label: string, required = false): Date | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) {
    if (required) throw new EventDataError(`${label} is required.`);
    return null;
  }
  const d = new Date(raw);
  if (isNaN(d.getTime())) throw new EventDataError(`${label} isn't a valid date.`);
  return d;
}

// Shared parser for the admin event create/update endpoints.
// Price amounts arrive from the form already converted to cents.
// Throws EventDataError when the submission can't be saved as given.
export function parseEventData(data: Record<string, unknown>) {
  const pricingType: PricingType = ["FREE", "FIXED", "SLIDING"].includes(
    data.pricingType as string
  )
    ? (data.pricingType as PricingType)
    : "FREE";

  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title) throw new EventDataError("Please give the event a title.");

  const startDate = parseDate(data.startDate, "Start date", true)!;
  const endDate = parseDate(data.endDate, "End date");
  if (endDate && endDate < startDate) {
    throw new EventDataError("The end date is before the start date.");
  }

  return {
    title,
    description: typeof data.description === "string" ? data.description : "",
    location: (data.location as string) || null,
    isOnline: Boolean(data.isOnline),
    isRetreat: Boolean(data.isRetreat),
    registerUrl: (data.registerUrl as string) || null,
    flyerUrl: (data.flyerUrl as string) || null,
    featuredImageUrl: (data.featuredImageUrl as string) || null,
    featured: Boolean(data.featured),
    published: Boolean(data.published),
    registrationEnabled: Boolean(data.registrationEnabled),
    capacity: data.capacity ? Number(data.capacity) : null,
    pricingType,
    priceMin: pricingType !== "FREE" && data.priceMin ? Number(data.priceMin) : null,
    priceMax: pricingType === "SLIDING" && data.priceMax ? Number(data.priceMax) : null,
    earlyBirdPriceMin:
      pricingType !== "FREE" && data.earlyBirdPriceMin ? Number(data.earlyBirdPriceMin) : null,
    earlyBirdPriceMax:
      pricingType === "SLIDING" && data.earlyBirdPriceMax ? Number(data.earlyBirdPriceMax) : null,
    earlyBirdDeadline:
      pricingType !== "FREE" ? parseDate(data.earlyBirdDeadline, "Early bird deadline") : null,
    kidsDiscountPercent:
      pricingType !== "FREE" && data.kidsDiscountPercent
        ? Number(data.kidsDiscountPercent)
        : null,
    startDate,
    endDate,
    registrationDeadline: parseDate(data.registrationDeadline, "Registration deadline"),
  };
}
