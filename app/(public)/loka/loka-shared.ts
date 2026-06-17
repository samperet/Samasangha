// Backing track for the collective Loka Samasta recording. Drop the audio at
// public/assets/loka-samasta.mp3, or set NEXT_PUBLIC_LOKA_BACKING_URL.
export const BACKING_URL =
  process.env.NEXT_PUBLIC_LOKA_BACKING_URL || "/assets/loka-samasta.mp3";

// The shared intention: gather 108 voices (a full mala of beads).
export const GOAL_VOICES = 108;

// Seconds to count the singer in before recording begins.
export const COUNTDOWN_SEC = 5;

// Audio timing.
// These numbers align everything to the real recording: the moment the first
// word is sung, how long one "Lokah samastah sukhino bhavantu" line takes, and
// (when measured) the start time of every line. They come from analyzing the
// backing track — run `npm run analyze:loka` to regenerate loka-timing.json.
import timing from "./loka-timing.json";

export const LOKA_FIRST_WORD_SEC = timing.firstWordSec;
export const LOKA_LINE_SEC = timing.lineSec;

// Measured start time of each chant line, if the track has been analyzed.
// Empty until then, in which case we fall back to the fixed-tempo grid above.
export const LOKA_LINE_STARTS: number[] = timing.lineStarts ?? [];

// "Skip to the chanting" starts the backing track 5 seconds before the first
// sung word, giving a gentle run-up.
const RUNUP_SEC = 5;
export const VOCALS_START_SEC = Math.max(
  0,
  (LOKA_LINE_STARTS[0] ?? LOKA_FIRST_WORD_SEC) - RUNUP_SEC
);

// The chant, shown large as singalong subtitles.
export const CHANT_LINE = "Lokah samastah sukhino bhavantu";
export const CHANT_WORDS = ["Lokah", "samastah", "sukhino", "bhavantu"];
export const CHANT_TRANSLATION = "May all beings everywhere be happy and free";

// The chant line currently being sung at `posSec` as [start, end] seconds, or
// null before the chanting begins. Uses the measured line starts when present
// (tracking any tempo drift), otherwise an even grid from the first word.
function currentLine(posSec: number): [number, number] | null {
  const starts = LOKA_LINE_STARTS;
  if (starts.length >= 2) {
    if (posSec < starts[0]) return null;
    for (let i = 0; i < starts.length; i++) {
      const end = i + 1 < starts.length ? starts[i + 1] : starts[i] + LOKA_LINE_SEC;
      if (posSec < end) return [starts[i], end];
    }
    const last = starts[starts.length - 1];
    return [last, last + LOKA_LINE_SEC];
  }
  if (posSec < LOKA_FIRST_WORD_SEC) return null;
  const n = Math.floor((posSec - LOKA_FIRST_WORD_SEC) / LOKA_LINE_SEC);
  const start = LOKA_FIRST_WORD_SEC + n * LOKA_LINE_SEC;
  return [start, start + LOKA_LINE_SEC];
}

// Which chant word is being sung at a given position (seconds) in the backing
// track, or -1 before the chanting starts.
export function activeChantWord(posSec: number): number {
  const line = currentLine(posSec);
  if (!line) return -1;
  const [start, end] = line;
  const frac = (posSec - start) / Math.max(0.001, end - start);
  return Math.min(CHANT_WORDS.length - 1, Math.max(0, Math.floor(frac * CHANT_WORDS.length)));
}

export type Recording = {
  id: string;
  name: string;
  voiceType: "LOWER" | "HIGHER";
  audioUrl: string;
  mimeType: string | null;
  durationMs: number | null;
  offsetMs: number;
  startMs: number;
};

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Fetch + decode an audio URL into an AudioBuffer.
export async function fetchAudioBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load audio (${res.status})`);
  const data = await res.arrayBuffer();
  return await ctx.decodeAudioData(data);
}

// Best supported MediaRecorder mime type for this browser.
export function pickRecorderMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported?.(t)) || "";
}

export function extForMime(mime: string): string {
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("mp4")) return "m4a";
  return "audio";
}

// Encode an AudioBuffer to a 16-bit PCM WAV Blob (for the downloadable mix).
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numCh = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const frames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numCh * bytesPerSample;
  const dataSize = frames * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < numCh; c++) {
      let sample = channels[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}
