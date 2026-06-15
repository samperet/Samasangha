import type { PricingType } from "@prisma/client";

// Shared parser for the admin event create/update endpoints.
// Price amounts arrive from the form already converted to cents.
export function parseEventData(data: Record<string, unknown>) {
  const pricingType: PricingType = ["FREE", "FIXED", "SLIDING"].includes(
    data.pricingType as string
  )
    ? (data.pricingType as PricingType)
    : "FREE";

  return {
    title: data.title as string,
    description: data.description as string,
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
      pricingType !== "FREE" && data.earlyBirdDeadline
        ? new Date(data.earlyBirdDeadline as string)
        : null,
    kidsDiscountPercent:
      pricingType !== "FREE" && data.kidsDiscountPercent
        ? Number(data.kidsDiscountPercent)
        : null,
    startDate: new Date(data.startDate as string),
    endDate: data.endDate ? new Date(data.endDate as string) : null,
    registrationDeadline: data.registrationDeadline
      ? new Date(data.registrationDeadline as string)
      : null,
  };
}
