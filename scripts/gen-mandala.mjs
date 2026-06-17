/**
 * Generate the Loka mandala with Google's "nano banana" (Gemini 2.5 Flash Image)
 * and write it to public/assets/loka-mandala.png.
 *
 * Usage:
 *   GEMINI_API_KEY=xxxx npm run gen:mandala
 *   (get a key at https://aistudio.google.com/apikey)
 */
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import { writeFile } from "fs/promises";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY. Get one at https://aistudio.google.com/apikey, then re-run.");
  process.exit(1);
}

const prompt =
  "A serene, perfectly symmetrical sacred mandala for a meditation and prayer website. " +
  "Fine, delicate line art with lotus petals and concentric geometric rings radiating from a " +
  "central point. Warm antique gold and soft cream tones with a touch of deep indigo. " +
  "Calm, devotional, balanced, centered composition on a plain white background. " +
  "No text, no letters, no words.";

const ai = new GoogleGenAI({ apiKey });

console.log("Asking nano banana for a mandala…");
const res = await ai.models.generateContent({
  model: "gemini-2.5-flash-image",
  contents: prompt,
});

const parts = res?.candidates?.[0]?.content?.parts ?? [];
const img = parts.find((p) => p.inlineData?.data);
if (!img) {
  console.error("No image came back. Full response:", JSON.stringify(res, null, 2).slice(0, 1500));
  process.exit(1);
}

const raw = Buffer.from(img.inlineData.data, "base64");
// Normalise to a 512x512 PNG so it drops in cleanly.
await sharp(raw).resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile("public/assets/loka-mandala.png");
console.log("Wrote public/assets/loka-mandala.png");
