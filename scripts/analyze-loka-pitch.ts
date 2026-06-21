/**
 * Detect the per-syllable melody of the Loka loop and print the NOTES array
 * used by the karaoke widget (app/loka/lokah-recorder.js).
 *
 *   npm run analyze:loka:pitch                       # uses public/lokah/loop.mp3
 *   npm run analyze:loka:pitch -- path/to/track.mp3  # analyze a specific file
 *
 * It decodes the MP3 in-process (mpg123-decoder, WASM — no ffmpeg), runs YIN
 * pitch tracking at each syllable onset (TIMINGS, mirrored from the widget),
 * folds octave errors toward the centre, and averages the four repeated
 * "Lokah Samastah Sukhino Bhavantu" phrases into one clean melody. Paste the
 * printed NOTES array into lokah-recorder.js.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { MPEGDecoder } from "mpg123-decoder";

// Syllable onsets (s) and labels — keep in sync with lokah-recorder.js.
const TIMINGS = [1.908,3.237,4.741,6.024,7.405,8.769,11.086,11.469,12.125,12.775,14.168,15.434,16.763,18.104,19.393,21.685,22.045,22.725,23.375,24.652,26.074,27.427,28.686,29.969,32.239,32.645,33.365,34.015,35.321,36.674,37.998,39.234,40.569,42.949,43.286,43.942,46.014,49.991,50.844,51.297,52.62,56.475,60.544,61.496,61.85,63.22,66.982,72.2];
const SYLL = ["Lo","kah","Sama","stah","Sukhi","no","Bha","van","tu","Lo","kah","Sama","stah","Sukhi","no","Bha","van","tu","Lo","kah","Sama","stah","Sukhi","no","Bha","van","tu","Lo","kah","Sama","stah","Sukhi","no","Bha","van","tu","om","Shan","ti","Shan","ti","om","Shan","ti","Shan","ti","Shan","ti"];

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const midiToName = (m: number) => `${NOTE_NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
const freqToMidi = (f: number) => Math.round(69 + 12 * Math.log2(f / 440));

const CANDIDATES = ["public/lokah/loop.mp3", "public/music/healing-love/13-loka.mp3"];

function pickInput(): string {
  const arg = process.argv.slice(2).find((a) => !a.startsWith("-"));
  if (arg) return arg;
  for (const c of CANDIDATES) if (existsSync(resolve(c))) return c;
  console.error("No input file found. Pass one: npm run analyze:loka:pitch -- path/to/track.mp3");
  process.exit(1);
}

async function decodeMono(path: string) {
  const bytes = new Uint8Array(readFileSync(resolve(path)));
  const dec = new MPEGDecoder();
  await dec.ready;
  const { channelData, samplesDecoded, sampleRate } = dec.decode(bytes);
  dec.free();
  if (!samplesDecoded) throw new Error("Decoded 0 samples — is this a valid MP3?");
  const chans = channelData.length;
  const mono = new Float32Array(samplesDecoded);
  for (let i = 0; i < samplesDecoded; i++) {
    let s = 0;
    for (let c = 0; c < chans; c++) s += channelData[c][i];
    mono[i] = s / chans;
  }
  return { pcm: mono, sampleRate };
}

// YIN pitch detection — robust against octave errors on the dominant pitch.
function yin(buf: Float32Array, sr: number, fmin: number, fmax: number, threshold = 0.15) {
  const tauMax = Math.floor(sr / fmin);
  const tauMin = Math.floor(sr / fmax);
  const W = buf.length - tauMax;
  if (W <= 0) return null;
  const d = new Float32Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0;
    for (let i = 0; i < W; i++) {
      const diff = buf[i] - buf[i + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }
  const dp = new Float32Array(tauMax + 1);
  dp[0] = 1;
  let running = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    running += d[tau];
    dp[tau] = (d[tau] * tau) / (running || 1);
  }
  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (dp[t] < threshold) {
      while (t + 1 <= tauMax && dp[t + 1] < dp[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) {
    let best = Infinity, bt = -1;
    for (let t = tauMin; t <= tauMax; t++) if (dp[t] < best) { best = dp[t]; bt = t; }
    if (bt < 0 || best > 0.55) return null;
    tau = bt;
  }
  let bt = tau;
  if (tau > tauMin && tau < tauMax) {
    const s0 = dp[tau - 1], s1 = dp[tau], s2 = dp[tau + 1];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (denom !== 0) bt = tau + (s2 - s0) / denom;
  }
  return { freq: sr / bt, conf: 1 - dp[tau] };
}

(async () => {
  const input = pickInput();
  const { pcm, sampleRate } = await decodeMono(input);
  console.log(`Analyzing ${input} — ${(pcm.length / sampleRate).toFixed(1)}s @ ${sampleRate}Hz`);

  const win = Math.floor(0.35 * sampleRate);
  const skip = Math.floor(0.07 * sampleRate); // skip the consonant attack

  const raw = TIMINGS.map((t) => {
    const start = Math.floor(t * sampleRate) + skip;
    return yin(pcm.subarray(start, start + win), sampleRate, 130, 520);
  });

  const midis = raw.map((p) => (p ? freqToMidi(p.freq) : null));
  const voiced = midis.filter((m): m is number => m != null).slice().sort((a, b) => a - b);
  const median = voiced[Math.floor(voiced.length / 2)] ?? 60;

  // Fold octave errors toward the central octave (the chant stays within ~1).
  const folded = midis.map((m) => {
    if (m == null) return null;
    let x = m;
    while (x - median > 6) x -= 12;
    while (median - x > 6) x += 12;
    return x;
  });

  // Hold the previous note through unvoiced gaps.
  const filled: number[] = [];
  let last = median;
  for (const m of folded) {
    if (m != null) last = m;
    filled.push(last);
  }

  // Average the four repeats of the 9-syllable phrase into one clean melody.
  const PHRASE = 9, REPEATS = 4;
  const med = (xs: number[]) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  const phrase: number[] = [];
  for (let j = 0; j < PHRASE; j++) {
    const cands: number[] = [];
    for (let r = 0; r < REPEATS; r++) {
      const idx = r * PHRASE + j;
      if (folded[idx] != null) cands.push(folded[idx]!);
    }
    phrase[j] = cands.length ? med(cands) : median;
  }
  const out: number[] = [];
  for (let i = 0; i < REPEATS * PHRASE; i++) out[i] = phrase[i % PHRASE];
  for (let i = REPEATS * PHRASE; i < TIMINGS.length; i++) out[i] = filled[i];

  for (let i = 0; i < TIMINGS.length; i++) {
    const p = raw[i];
    console.log(
      `${TIMINGS[i].toFixed(2)}s  ${SYLL[i].padEnd(6)} ${midiToName(out[i]).padEnd(4)}  ${p ? `${Math.round(p.freq)}Hz conf ${p.conf.toFixed(2)}` : "(held)"}`,
    );
  }
  console.log("\nconst NOTES = [" + out.map((m) => `"${midiToName(m)}"`).join(",") + "];");
  console.log(`\nKey centre ~${midiToName(median)} · ${voiced.length}/${midis.length} syllables voiced`);
})();
