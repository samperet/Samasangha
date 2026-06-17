/**
 * Analyze the Loka backing track to find where the vocals begin and how the
 * chant line is timed, then write app/(public)/loka/loka-timing.json so the
 * studio can jump straight to the chanting and align the singalong subtitles
 * to the real audio.
 *
 *   npm run analyze:loka                       # uses public/music/healing-love/13-loka.mp3
 *   npm run analyze:loka -- path/to/track.mp3  # analyze a specific file
 *   npm run analyze:loka -- file.mp3 --write   # force-write the timing map
 *
 * The map is written automatically when the filename looks like the Loka track
 * (contains "loka"); pass --write to force it for any file, or run without it
 * to just print a report (handy for sanity-checking the pipeline).
 *
 * No ffmpeg required — MP3 is decoded in-process via mpg123-decoder (WASM).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { MPEGDecoder } from "mpg123-decoder";

const HOP_SEC = 0.02; // 20 ms analysis frames
const WORD_COUNT = 4; // "Lokah samastah sukhino bhavantu"
const RUNUP_SEC = 5; // "Skip to the chanting" begins this far before the first word
const MIN_LINE_SEC = 2.5; // plausible bounds for one chant line
const MAX_LINE_SEC = 7.0;

const CANDIDATE_INPUTS = [
  "public/music/healing-love/13-loka.mp3",
  "public/assets/loka-samasta.mp3",
  "public/assets/Elementsinging.mp3", // last resort: validates the pipeline only
];

const OUT_PATH = "app/(public)/loka/loka-timing.json";

function pickInput(): string {
  const arg = process.argv.slice(2).find((a) => !a.startsWith("-"));
  if (arg) return arg;
  for (const c of CANDIDATE_INPUTS) if (existsSync(resolve(c))) return c;
  console.error("No input file found. Pass one: npm run analyze:loka -- path/to/track.mp3");
  process.exit(1);
}

async function decodeMono(path: string): Promise<{ pcm: Float32Array; sampleRate: number }> {
  const bytes = new Uint8Array(readFileSync(resolve(path)));
  const decoder = new MPEGDecoder();
  await decoder.ready;
  const { channelData, samplesDecoded, sampleRate } = decoder.decode(bytes);
  decoder.free();
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

// RMS energy per HOP_SEC frame.
function energyEnvelope(pcm: Float32Array, sampleRate: number): number[] {
  const frame = Math.max(1, Math.round(HOP_SEC * sampleRate));
  const n = Math.floor(pcm.length / frame);
  const env = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    const start = i * frame;
    for (let j = 0; j < frame; j++) {
      const v = pcm[start + j];
      sum += v * v;
    }
    env[i] = Math.sqrt(sum / frame);
  }
  return env;
}

function smooth(env: number[], win: number): number[] {
  const out = new Array<number>(env.length).fill(0);
  let acc = 0;
  for (let i = 0; i < env.length; i++) {
    acc += env[i];
    if (i >= win) acc -= env[i - win];
    out[i] = acc / Math.min(i + 1, win);
  }
  return out;
}

function percentile(sorted: number[], p: number): number {
  const i = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))));
  return sorted[i];
}

// First sustained rise above the noise floor = the first sung word.
function firstOnset(env: number[]): number {
  const sorted = [...env].sort((a, b) => a - b);
  const floor = percentile(sorted, 0.1);
  const loud = percentile(sorted, 0.95);
  const thresh = floor + 0.18 * (loud - floor);
  const sustain = Math.round(0.35 / HOP_SEC);
  for (let i = 0; i < env.length - sustain; i++) {
    let ok = true;
    for (let j = 0; j < sustain; j++) if (env[i + j] < thresh) { ok = false; break; }
    if (ok) return i * HOP_SEC;
  }
  return 0;
}

// Half-wave-rectified energy difference — peaks at note/word onsets.
function onsetStrength(env: number[]): number[] {
  const flux = new Array<number>(env.length).fill(0);
  for (let i = 1; i < env.length; i++) flux[i] = Math.max(0, env[i] - env[i - 1]);
  return flux;
}

// Dominant repetition period (seconds) within [min,max] via autocorrelation.
function dominantPeriod(sig: number[], minSec: number, maxSec: number): number {
  const mean = sig.reduce((a, b) => a + b, 0) / sig.length;
  const x = sig.map((v) => v - mean);
  const minLag = Math.floor(minSec / HOP_SEC);
  const maxLag = Math.floor(maxSec / HOP_SEC);
  let bestLag = minLag;
  let bestVal = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < x.length; i++) s += x[i] * x[i + lag];
    s /= x.length - lag;
    if (s > bestVal) { bestVal = s; bestLag = lag; }
  }
  return bestLag * HOP_SEC;
}

// Build per-line start times by snapping a firstWord + n*lineSec grid to the
// nearest strong onset, so the subtitles track tempo drift across the track.
function lineStarts(flux: number[], firstWordSec: number, lineSec: number, durationSec: number): number[] {
  const half = Math.round((lineSec * 0.5) / HOP_SEC);
  const minGap = lineSec * 0.6; // lines can't legitimately collapse together
  const starts: number[] = [];
  let prev = -Infinity;
  for (let n = 0; firstWordSec + n * lineSec < durationSec; n++) {
    const predicted = firstWordSec + n * lineSec;
    const center = Math.round(predicted / HOP_SEC);
    let bestI = -1;
    let bestV = 0;
    for (let i = Math.max(0, center - half); i <= Math.min(flux.length - 1, center + half); i++) {
      if (i * HOP_SEC < prev + minGap) continue; // stay at least a line apart
      if (flux[i] > bestV) { bestV = flux[i]; bestI = i; }
    }
    // Snap to the strongest onset in the window; fall back to the grid when the
    // window holds no clear onset, so starts stay roughly line-spaced.
    let t = bestI >= 0 ? bestI * HOP_SEC : predicted;
    if (t < prev + minGap) t = prev + lineSec;
    starts.push(+t.toFixed(3));
    prev = t;
  }
  return starts;
}

function sparkline(env: number[], fromSec: number, toSec: number, cols = 60): string {
  const blocks = "▁▂▃▄▅▆▇█";
  const a = Math.floor(fromSec / HOP_SEC);
  const b = Math.min(env.length, Math.floor(toSec / HOP_SEC));
  const per = Math.max(1, Math.floor((b - a) / cols));
  let max = 1e-9;
  const buckets: number[] = [];
  for (let i = a; i < b; i += per) {
    let m = 0;
    for (let j = i; j < Math.min(b, i + per); j++) m = Math.max(m, env[j]);
    buckets.push(m);
    if (m > max) max = m;
  }
  return buckets.map((v) => blocks[Math.min(7, Math.floor((v / max) * 7))]).join("");
}

async function main() {
  const input = pickInput();
  console.log(`\nAnalyzing: ${input}`);
  const { pcm, sampleRate } = await decodeMono(input);
  const durationSec = pcm.length / sampleRate;
  console.log(`Decoded ${durationSec.toFixed(1)}s @ ${sampleRate} Hz\n`);

  const env = smooth(energyEnvelope(pcm, sampleRate), 5);
  const flux = onsetStrength(env);

  const firstWordSec = +firstOnset(env).toFixed(2);
  const lineSec = +dominantPeriod(flux, MIN_LINE_SEC, MAX_LINE_SEC).toFixed(2);
  const starts = lineStarts(flux, firstWordSec, lineSec, durationSec);

  console.log(`Energy 0–40s:  ${sparkline(env, 0, 40)}`);
  console.log(`               ${"".padEnd(0)}^ first word ≈ ${firstWordSec}s (skip-to-chant at ${Math.max(0, +(firstWordSec - RUNUP_SEC).toFixed(2))}s)`);
  console.log(`Chant line length ≈ ${lineSec}s  → ${(lineSec / WORD_COUNT).toFixed(2)}s per word`);
  console.log(`Detected ${starts.length} line starts (first 6): ${starts.slice(0, 6).join(", ")}\n`);

  const measured = true;
  const out = {
    measured,
    source: input,
    analyzedAt: new Date().toISOString(),
    wordCount: WORD_COUNT,
    firstWordSec,
    lineSec,
    lineStarts: starts,
  };

  const force = process.argv.includes("--write");
  const looksLikeLoka = /loka/i.test(input);
  if (force || looksLikeLoka) {
    writeFileSync(resolve(OUT_PATH), JSON.stringify(out, null, 2) + "\n");
    console.log(`✓ Wrote ${OUT_PATH}`);
  } else {
    console.log(`(dry run — pass --write to save ${OUT_PATH}, or analyze the real loka track)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
