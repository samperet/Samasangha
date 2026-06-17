// Backing track for the collective Loka Samasta recording. Drop the audio at
// public/assets/loka-samasta.mp3, or set NEXT_PUBLIC_LOKA_BACKING_URL.
export const BACKING_URL =
  process.env.NEXT_PUBLIC_LOKA_BACKING_URL || "/assets/loka-samasta.mp3";

// The shared intention: gather 108 voices (a full mala of beads).
export const GOAL_VOICES = 108;

// Seconds to count the singer in before recording begins.
export const COUNTDOWN_SEC = 5;

// Audio timing.
// These two numbers align everything to the real recording. Set them from the
// actual Loka track (see notes): the moment the first word is sung, and how
// long one full "Lokah samastah sukhino bhavantu" line takes.
export const LOKA_FIRST_WORD_SEC = 20; // TODO: confirm against the real audio
export const LOKA_LINE_SEC = 4.5; // TODO: confirm, length of one chant line

// "Skip to the chanting" starts the backing track 5 seconds before the first
// sung word, giving a gentle run-up.
export const VOCALS_START_SEC = Math.max(0, LOKA_FIRST_WORD_SEC - 5);

// The chant, shown large as singalong subtitles.
export const CHANT_LINE = "Lokah samastah sukhino bhavantu";
export const CHANT_WORDS = ["Lokah", "samastah", "sukhino", "bhavantu"];
export const CHANT_TRANSLATION = "May all beings everywhere be happy and free";

// Which chant word is being sung at a given position (seconds) in the backing
// track, or -1 before the chanting starts. Cycles through the line on tempo.
export function activeChantWord(posSec: number): number {
  if (posSec < LOKA_FIRST_WORD_SEC) return -1;
  const perWord = LOKA_LINE_SEC / CHANT_WORDS.length;
  return Math.floor((posSec - LOKA_FIRST_WORD_SEC) / perWord) % CHANT_WORDS.length;
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
