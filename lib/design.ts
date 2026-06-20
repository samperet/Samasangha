import { prisma } from "@/lib/prisma";

// Editable colors for the homepage's coloured bands and the site footer.
export type SiteDesign = {
  purpleType: string; // "solid" | "gradient"
  purpleFrom: string;
  purpleTo: string;
  greenType: string;
  greenFrom: string;
  greenTo: string;
  footerType: string;
  footerFrom: string;
  footerTo: string;
};

export const DESIGN_DEFAULTS: SiteDesign = {
  purpleType: "gradient",
  purpleFrom: "#6b4a76",
  purpleTo: "#4d3155",
  greenType: "solid",
  greenFrom: "#fbf7ec",
  greenTo: "#e8efe0",
  footerType: "gradient",
  footerFrom: "#0a7d12",
  footerTo: "#024c06",
};

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export const isHex = (v: unknown): v is string => typeof v === "string" && HEX.test(v);

// Read the singleton design row, falling back to defaults (so the site renders
// fine before the row exists or if the DB is unreachable).
export async function getSiteDesign(): Promise<SiteDesign> {
  try {
    const row = await prisma.siteDesign.findUnique({ where: { id: "default" } });
    if (!row) return DESIGN_DEFAULTS;
    return {
      purpleType: row.purpleType,
      purpleFrom: row.purpleFrom,
      purpleTo: row.purpleTo,
      greenType: row.greenType,
      greenFrom: row.greenFrom,
      greenTo: row.greenTo,
      footerType: row.footerType,
      footerFrom: row.footerFrom,
      footerTo: row.footerTo,
    };
  } catch {
    return DESIGN_DEFAULTS;
  }
}

// CSS `background` value for a section: a solid colour, or the site's signature
// top-centred radial gradient between two stops.
export function sectionBackground(type: string, from: string, to: string): string {
  const f = isHex(from) ? from : "#000000";
  const t = isHex(to) ? to : "#000000";
  return type === "gradient"
    ? `radial-gradient(120% 130% at 50% -10%, ${f} 0%, ${t} 100%)`
    : f;
}

// Keep only valid, expected fields/values before writing to the DB.
export function sanitizeDesign(input: Record<string, unknown>): SiteDesign {
  const type = (v: unknown, fallback: string) => (v === "solid" || v === "gradient" ? v : fallback);
  const color = (v: unknown, fallback: string) => (isHex(v) ? v : fallback);
  return {
    purpleType: type(input.purpleType, DESIGN_DEFAULTS.purpleType),
    purpleFrom: color(input.purpleFrom, DESIGN_DEFAULTS.purpleFrom),
    purpleTo: color(input.purpleTo, DESIGN_DEFAULTS.purpleTo),
    greenType: type(input.greenType, DESIGN_DEFAULTS.greenType),
    greenFrom: color(input.greenFrom, DESIGN_DEFAULTS.greenFrom),
    greenTo: color(input.greenTo, DESIGN_DEFAULTS.greenTo),
    footerType: type(input.footerType, DESIGN_DEFAULTS.footerType),
    footerFrom: color(input.footerFrom, DESIGN_DEFAULTS.footerFrom),
    footerTo: color(input.footerTo, DESIGN_DEFAULTS.footerTo),
  };
}
