// Deterministic geometric mandala -> public/assets/loka-mandala.png
// (Fallback/placeholder; nano-banana can overwrite it via scripts/gen-mandala.mjs)
import sharp from "sharp";

const C = 256;
const GOLD = "#c4922b";
const GOLD_D = "#9a6f1c";

const petal = (r, w) =>
  `M ${C} ${C} C ${C + r * 0.25} ${C - w} ${C + r * 0.75} ${C - w} ${C + r} ${C} ` +
  `C ${C + r * 0.75} ${C + w} ${C + r * 0.25} ${C + w} ${C} ${C} Z`;

function ring(r, k, w, stroke, fill, sw = 1.4) {
  let s = "";
  for (let i = 0; i < k; i++) {
    const a = (i * 360) / k;
    s += `<path d="${petal(r, w)}" transform="rotate(${a} ${C} ${C})" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  }
  return s;
}

const guide = (r, op) => `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${GOLD}" stroke-opacity="${op}" stroke-width="1"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${guide(232, 0.25)}${guide(172, 0.2)}${guide(116, 0.2)}
  ${ring(232, 24, 20, GOLD, "rgba(196,146,43,0.05)", 1.2)}
  ${ring(172, 18, 26, GOLD_D, "rgba(196,146,43,0.09)")}
  ${ring(116, 12, 26, GOLD, "rgba(196,146,43,0.13)")}
  ${ring(70, 8, 22, GOLD_D, "rgba(196,146,43,0.2)")}
  <circle cx="${C}" cy="${C}" r="26" fill="${GOLD}"/>
  <circle cx="${C}" cy="${C}" r="15" fill="#f5efe1"/>
  <circle cx="${C}" cy="${C}" r="5.5" fill="${GOLD_D}"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/assets/loka-mandala.png");
console.log("Wrote public/assets/loka-mandala.png");
